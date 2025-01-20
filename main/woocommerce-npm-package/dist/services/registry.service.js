const axios = require('axios');
const crypto = require('crypto');
class RegistryService {
  constructor(config) {
    this.config = config;
    this.baseUrl = 'https://registry.ondc.org';
  }
  async lookup(subscriberId) {
    try {
      const response = await axios.post(`${this.baseUrl}/lookup`, {
        subscriber_id: subscriberId
      });
      return response.data;
    } catch (error) {
      throw new Error(`Registry lookup failed: ${error.message}`);
    }
  }
  async register() {
    try {
      const registrationData = {
        subscriber_id: this.config.subscriberId,
        subscriber_url: this.config.subscriberUrl,
        type: this.config.type,
        // buyer_app or seller_app
        domain: "retail",
        signing_public_key: this.config.signingPublicKey,
        encryption_public_key: this.config.encryptionPublicKey,
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
      };
      const response = await axios.post(`${this.baseUrl}/register`, registrationData);
      return response.data;
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }
  async updateKeys() {
    try {
      const updateData = {
        subscriber_id: this.config.subscriberId,
        signing_public_key: this.config.signingPublicKey,
        encryption_public_key: this.config.encryptionPublicKey,
        valid_from: new Date().toISOString()
      };
      const response = await axios.post(`${this.baseUrl}/update-keys`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(`Key update failed: ${error.message}`);
    }
  }
}
module.exports = RegistryService;