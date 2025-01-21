const { WooCommerceONDCAdapter } = require('woocommerce-ondc-adapter');
const express = require('express');
const app = express();

class BuyerApp {
  constructor() {
    // Initialize the ONDC adapter
    this.adapter = new WooCommerceONDCAdapter({
      storeUrl: 'https://your-store.com',
      consumerKey: 'your-key',
      consumerSecret: 'your-secret'
    }, {
      domain: 'retail',
      country: 'IND',
      city: 'Mumbai',
      action: 'search',
      coreVersion: '1.0.0',
      messageId: 'unique-id'
    });
  }

  // Search products across the network
  async searchProducts(searchQuery) {
    try {
      const searchParams = {
        search: searchQuery.product,
        per_page: 20,
        location: searchQuery.location
      };

      const products = await this.adapter.products.search(searchParams);
      return {
        status: 'success',
        data: products
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  // Create order
  async createOrder(orderData) {
    try {
      // Transform buyer's order data to ONDC format
      const ondcOrder = {
        items: orderData.items.map(item => ({
          id: item.productId,
          quantity: item.quantity
        })),
        billing: {
          name: orderData.customerName,
          address: orderData.deliveryAddress,
          phone: orderData.phone,
          email: orderData.email
        },
        payment: {
          type: orderData.paymentMethod,
          method: orderData.paymentDetails
        }
      };

      const order = await this.adapter.orders.create(ondcOrder);
      return {
        status: 'success',
        orderId: order.id
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  // Track order
  async trackOrder(orderId) {
    try {
      const orderDetails = await this.adapter.orders.getOrderDetails(orderId);
      return {
        status: 'success',
        tracking: orderDetails.fulfillment
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }
}

// Example Express routes for Buyer App
const buyerApp = new BuyerApp();
app.use(express.json());

app.post('/search', async (req, res) => {
  const result = await buyerApp.searchProducts(req.body);
  res.json(result);
});

app.post('/order', async (req, res) => {
  const result = await buyerApp.createOrder(req.body);
  res.json(result);
});

app.get('/track/:orderId', async (req, res) => {
  const result = await buyerApp.trackOrder(req.params.orderId);
  res.json(result);
});