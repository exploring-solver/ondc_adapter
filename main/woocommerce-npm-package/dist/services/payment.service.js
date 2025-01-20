class PaymentService {
  constructor(wc) {
    this.wc = wc;
  }
  async processPayment(orderId, paymentData) {
    try {
      return await this.wc.post(`orders/${orderId}/payment`, paymentData);
    } catch (error) {
      throw new Error(`Payment processing failed: ${error.message}`);
    }
  }
}
module.exports = {
  PaymentService
};