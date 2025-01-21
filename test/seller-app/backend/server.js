const express = require('express');
const cors = require('cors');
const WooCommerceONDCAdapter = require('../../../main/woocommerce-npm-package/src/adapter');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const config = {
  woocommerce: {
    storeUrl: process.env.WOOCOMMERCE_STORE_URL,
    consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
    consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
    version: 'wc/v3'
  },
  ondc: {
    subscriberId: process.env.ONDC_SUBSCRIBER_ID,
    subscriberUrl: process.env.ONDC_SUBSCRIBER_URL,
    type: 'seller_app',
    signingPublicKey: process.env.ONDC_SIGNING_PUBLIC_KEY,
    signingPrivateKey: process.env.ONDC_SIGNING_PRIVATE_KEY,
    encryptionPublicKey: process.env.ONDC_ENCRYPTION_PUBLIC_KEY,
    encryptionPrivateKey: process.env.ONDC_ENCRYPTION_PRIVATE_KEY
  }
};

const adapter = new WooCommerceONDCAdapter(config, {
  type: 'seller',
  provider: {
    id: "seller-app-1",
    name: "Test Store"
  }
});

// ONDC Callback endpoint
app.post('/ondc/callback/:action', async (req, res) => {
  try {
    const response = await adapter.handleCallback(req.params.action, req.body);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Product Management
app.get('/products', async (req, res) => {
  try {
    const products = await adapter.searchCatalog(req.query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Order Management
app.get('/orders', async (req, res) => {
  try {
    const orders = await adapter.orders.getAll(req.query);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/orders/:orderId/status', async (req, res) => {
  try {
    const order = await adapter.updateOrderStatus(
      req.params.orderId,
      req.body.status,
      req.body.trackingInfo
    );
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Seller app running on port ${PORT}`);
});