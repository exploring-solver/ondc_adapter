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

  async getAll(params = {}) {
    try {
      const response = await this.wc.get('orders', params);
      return response.data.map(order => this.transformToONDCFormat(order));
    } catch (error) {
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }
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

  async createQuote(orderDetails) {
    try {
      // Calculate item-level prices and taxes
      const itemQuotes = await Promise.all(orderDetails.items.map(async (item) => {
        const product = await this.wc.get(`products/${item.id}`);
        const price = parseFloat(product.data.price);
        const tax = await this.calculateTax(price, product.data.tax_class);
        
        return {
          price: {
            currency: "INR",
            value: (price * item.quantity.count).toString()
          },
          tax: {
            currency: "INR",
            value: (tax * item.quantity.count).toString()
          },
          item: {
            id: item.id,
            quantity: item.quantity
          }
        };
      }));

      // Calculate delivery charges if applicable
      const deliveryCharges = await this.calculateDeliveryCharges(orderDetails.fulfillments);

      // Calculate total quote
      const subtotal = itemQuotes.reduce((sum, quote) => 
        sum + parseFloat(quote.price.value), 0);
      const totalTax = itemQuotes.reduce((sum, quote) => 
        sum + parseFloat(quote.tax.value), 0);
      const total = subtotal + totalTax + deliveryCharges;

      return {
        price: {
          currency: "INR",
          value: subtotal.toString()
        },
        breakup: [
          ...itemQuotes.map(quote => ({
            "@ondc/org/item_id": quote.item.id,
            "@ondc/org/item_quantity": quote.item.quantity,
            title: "Item Price",
            price: quote.price
          })),
          {
            "@ondc/org/item_id": "delivery",
            title: "Delivery Charges",
            price: {
              currency: "INR",
              value: deliveryCharges.toString()
            }
          },
          {
            "@ondc/org/item_id": "tax",
            title: "Tax",
            price: {
              currency: "INR",
              value: totalTax.toString()
            }
          }
        ],
        ttl: "P1D"
      };
    } catch (error) {
      throw new Error(`Quote creation failed: ${error.message}`);
    }
  }

  async calculateTax(price, taxClass) {
    // Implement tax calculation logic based on your requirements
    // This is a simplified example
    return price * 0.18; // 18% GST
  }

  async calculateDeliveryCharges(fulfillments) {
    // Implement delivery charge calculation logic based on your requirements
    // This is a simplified example
    return 40; // Fixed delivery charge
  }
}


module.exports = {
  OrderService,
};