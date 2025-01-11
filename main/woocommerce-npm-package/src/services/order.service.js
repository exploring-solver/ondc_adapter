class OrderService {
    constructor(wc) {
      this.wc = wc;
    }
  
    async create(orderData) {
      try {
        const wooOrder = this.transformFromONDCFormat(orderData);
        const response = await this.wc.post("orders", wooOrder);
        return this.transformToONDCFormat(response.data);
      } catch (error) {
        throw new Error(`Order creation failed: ${error.message}`);
      }
    }
  
    async update(orderId, status) {
      try {
        return await this.wc.put(`orders/${orderId}`, { status });
      } catch (error) {
        throw new Error(`Order update failed: ${error.message}`);
      }
    }
  
    async getOrderDetails(orderId) {
      try {
        const response = await this.wc.get(`orders/${orderId}`);
        return this.transformToONDCFormat(response.data);
      } catch (error) {
        throw new Error(`Failed to fetch order details: ${error.message}`);
      }
    }
  
    transformToONDCFormat(order) {
      return {
        id: order.id,
        state: order.status,
        items: order.line_items.map(item => ({
          id: item.product_id,
          quantity: item.quantity,
          price: item.total
        })),
        billing: order.billing,
        fulfillment: {
          state: order.status,
          tracking: order.shipping_lines[0]?.tracking_number
        }
      };
    }
  
    transformFromONDCFormat(ondcOrder) {
      return {
        payment_method: ondcOrder.payment.type,
        payment_method_title: ondcOrder.payment.method,
        set_paid: true,
        billing: ondcOrder.billing,
        shipping: ondcOrder.fulfillment.shipping,
        line_items: ondcOrder.items.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      };
    }
  }
  