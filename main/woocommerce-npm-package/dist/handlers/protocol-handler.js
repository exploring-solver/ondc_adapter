const crypto = require('crypto');
const axios = require('axios');
class ONDCProtocolHandler {
  constructor(config) {
    this.config = config;
    this.baseUrl = 'https://gateway.ondc.org/api/v1'; // ONDC Gateway URL
  }
  async createAuthHeader() {
    const timestamp = new Date().toISOString();
    const message = `${this.config.subscriberId}|${timestamp}`;
    const signature = crypto.sign('sha256', Buffer.from(message), this.config.signingPrivateKey).toString('base64');
    return {
      Authorization: `Signature keyId=${this.config.subscriberId},algorithm="ed25519",created="${timestamp}",signature="${signature}"`
    };
  }
  async sendToNetwork(action, payload) {
    const headers = await this.createAuthHeader();
    const url = `${this.baseUrl}/${action}`;
    try {
      const response = await axios.post(url, {
        context: {
          domain: "retail",
          country: "IND",
          city: payload.city || "std:080",
          action: action,
          timestamp: new Date().toISOString(),
          transaction_id: crypto.randomUUID(),
          message_id: crypto.randomUUID(),
          core_version: "1.1.0",
          bap_id: this.config.subscriberId,
          bap_uri: this.config.subscriberUrl
        },
        message: payload
      }, {
        headers
      });
      return response.data;
    } catch (error) {
      throw new Error(`ONDC Network Error: ${error.message}`);
    }
  }
}
module.exports = ONDCProtocolHandler;