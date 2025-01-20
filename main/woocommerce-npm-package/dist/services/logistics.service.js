class LogisticsService {
  constructor(wc) {
    this.wc = wc;
  }
  async updateShipment(orderId, trackingData) {
    try {
      return await this.wc.put(`orders/${orderId}`, {
        shipping_lines: [{
          method_title: trackingData.provider,
          tracking_number: trackingData.trackingId
        }]
      });
    } catch (error) {
      throw new Error(`Shipment update failed: ${error.message}`);
    }
  }
}
module.exports = {
  LogisticsService
};