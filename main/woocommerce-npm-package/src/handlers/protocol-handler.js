const crypto = require('crypto');
const axios = require('axios');
const { createHash } = require('crypto');
const ed25519 = require('@noble/ed25519');

class ONDCProtocolHandler {
  constructor(config) {
    this.config = config;
    this.baseUrl = config.gatewayUrl || 'https://gateway.ondc.org';
    this.subscriberId = config.subscriberId;
    this.uniqueKeyId = config.uniqueKeyId;
    this.signingPrivateKey = Buffer.from(config.signingPrivateKey, 'base64');
  }

  async createSigningString(requestBody, created, expires) {
    // Generate BLAKE-512 digest of request body
    const digest = await this.generateBlakeHash(JSON.stringify(requestBody));
    
    // Create signing string
    return `(created): ${created}\n(expires): ${expires}\ndigest: BLAKE-512=${digest}`;
  }

  async generateBlakeHash(data) {
    const hash = createHash('blake2b512');
    hash.update(Buffer.from(data));
    return hash.digest('base64');
  }

  async createAuthHeader(requestBody) {
    try {
      const created = Math.floor(Date.now() / 1000); // Current timestamp in seconds
      const expires = created + 3600; // 1 hour expiry
      
      // Create signing string
      const signingString = await this.createSigningString(requestBody, created, expires);
      
      // Sign the string using Ed25519
      const signature = await ed25519.sign(
        Buffer.from(signingString),
        this.signingPrivateKey
      );

      // Create authorization header
      return {
        Authorization: `Signature keyId="${this.subscriberId}|${this.uniqueKeyId}|ed25519",` +
          `algorithm="ed25519",` +
          `created="${created}",` +
          `expires="${expires}",` +
          `headers="(created) (expires) digest",` +
          `signature="${signature.toString('base64')}"`
      };
    } catch (error) {
      throw new Error(`Auth header creation failed: ${error.message}`);
    }
  }

  async sendToNetwork(action, payload) {
    try {
      // Create context for the request
      const context = {
        domain: payload.domain || "ONDC:RET10",
        action: action,
        country: "IND",
        city: payload.city || "std:080",
        core_version: "1.2.0",
        bap_id: this.subscriberId,
        bap_uri: this.config.subscriberUrl,
        transaction_id: crypto.randomUUID(),
        message_id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        ttl: "PT30S"
      };

      const requestBody = {
        context,
        message: payload
      };

      // Create authorization header
      const headers = await this.createAuthHeader(requestBody);

      // Send request to ONDC gateway
      const response = await axios.post(
        `${this.baseUrl}/${action}`,
        requestBody,
        { headers }
      );

      // Verify gateway signature if present
      if (response.headers['x-gateway-authorization']) {
        await this.verifyGatewaySignature(response);
      }

      return response.data;

    } catch (error) {
      throw new Error(`ONDC Network Error: ${error.message}`);
    }
  }

  async verifyGatewaySignature(response) {
    // Extract signature components from header
    const gatewayAuth = response.headers['x-gateway-authorization'];
    const matches = gatewayAuth.match(/keyId="([^"]+)"/);
    if (!matches) {
      throw new Error('Invalid gateway signature format');
    }

    const [subscriberId, uniqueKeyId] = matches[1].split('|');

    // In production, you would:
    // 1. Lookup gateway's public key from registry using subscriberId and uniqueKeyId
    // 2. Verify the signature using the public key
    // 3. Verify timestamp and expiry
    // 4. Verify digest matches response body

    // For now, we'll just validate the presence of the signature
    if (!gatewayAuth.includes('signature=')) {
      throw new Error('Missing gateway signature');
    }
  }

  async search(searchParams) {
    const searchPayload = {
      intent: {
        category: {
          id: searchParams.category || "Foodgrains"
        },
        fulfillment: {
          type: "Delivery"
        },
        payment: {
          "@ondc/org/buyer_app_finder_fee_type": "percent",
          "@ondc/org/buyer_app_finder_fee_amount": "3"
        },
        tags: [
          {
            code: "bap_terms",
            list: [
              {
                code: "static_terms",
                value: ""
              },
              {
                code: "static_terms_new",
                value: this.config.staticTermsUrl
              },
              {
                code: "effective_date",
                value: new Date().toISOString()
              }
            ]
          }
        ]
      }
    };

    return this.sendToNetwork('search', searchPayload);
  }
}

module.exports = ONDCProtocolHandler;


// const crypto = require('crypto');
// const axios = require('axios');

// class ONDCProtocolHandler {
//   constructor(config) {
//     this.config = config;
//     // In real implementation, this would be the ONDC gateway URL
//     // For testing, we can use a mock URL or local endpoint
//     this.baseUrl = 'http://localhost:3001/mock-gateway'; 
//   }

//   async createAuthHeader() {
//     try {
//       // Simplified auth header for testing
//       // In production, this would create a proper ONDC signature
//       return {
//         Authorization: `Bearer test_token`
//       };

//       /* Real ONDC implementation would look like this:
//       const timestamp = new Date().toISOString();
//       const message = Buffer.from(`${this.config.subscriberId}|${timestamp}`);
//       const sign = crypto.createSign('SHA256');
//       sign.update(message);
//       const signature = sign.sign(this.config.signingPrivateKey, 'base64');
//       return {
//         Authorization: `Signature keyId="${this.config.subscriberId}",algorithm="ed25519",created="${timestamp}",signature="${signature}"`
//       };
//       */
//     } catch (error) {
//       console.error('Auth header creation failed:', error);
//       // Return a dummy header for testing
//       return { Authorization: 'Bearer test_token' };
//     }
//   }

//   async sendToNetwork(action, payload) {
//     try {
//       // For testing, we'll just log the request and return mock data
//       console.log('ONDC Network Request:', {
//         action,
//         payload
//       });

//       // Mock responses for different actions
//       switch(action) {
//         case 'search':
//           return {
//             context: {
//               transaction_id: 'mock_tx_' + Date.now()
//             },
//             message: {
//               catalog: {
//                 "bpp/providers": [{
//                   id: "mock_seller_1",
//                   items: [
//                     {
//                       id: "item_1",
//                       descriptor: {
//                         name: "Test Product",
//                         description: "Test Description"
//                       },
//                       price: {
//                         value: "100.00",
//                         currency: "INR"
//                       }
//                     }
//                   ]
//                 }]
//               }
//             }
//           };

//         case 'init':
//         case 'confirm':
//           return {
//             context: {
//               transaction_id: 'mock_tx_' + Date.now()
//             },
//             message: {
//               order: {
//                 id: 'order_' + Date.now(),
//                 state: 'Created',
//                 items: payload.message.order.items
//               }
//             }
//           };

//         default:
//           return {
//             context: {
//               transaction_id: 'mock_tx_' + Date.now()
//             },
//             message: {
//               ack: {
//                 status: "ACK"
//               }
//             }
//           };
//       }

//       /* Real ONDC implementation would look like this:
//       const headers = await this.createAuthHeader();
//       const url = `${this.baseUrl}/${action}`;
//       const requestBody = {
//         context: {
//           domain: "retail",
//           country: "IND",
//           city: payload.city || "std:080",
//           action: action,
//           timestamp: new Date().toISOString(),
//           transaction_id: crypto.randomUUID(),
//           message_id: crypto.randomUUID(),
//           core_version: "1.1.0",
//           bap_id: this.config.subscriberId,
//           bap_uri: this.config.subscriberUrl,
//         },
//         message: payload
//       };
//       const response = await axios.post(url, requestBody, { headers });
//       return response.data;
//       */

//     } catch (error) {
//       console.error('ONDC Network Error:', error);
//       // Return a generic error response for testing
//       return {
//         error: {
//           message: error.message,
//           code: 'INTERNAL_ERROR'
//         }
//       };
//     }
//   }
// }

// module.exports = ONDCProtocolHandler;

