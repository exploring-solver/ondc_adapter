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
    type: 'buyer_app',
    signingPublicKey: process.env.ONDC_SIGNING_PUBLIC_KEY,
    signingPrivateKey: process.env.ONDC_SIGNING_PRIVATE_KEY,
    encryptionPublicKey: process.env.ONDC_ENCRYPTION_PUBLIC_KEY,
    encryptionPrivateKey: process.env.ONDC_ENCRYPTION_PRIVATE_KEY
  }
};

const adapter = new WooCommerceONDCAdapter(config, {
  type: 'buyer',
  provider: {
    id: "buyer-app-1",
    name: "Test Buyer App"
  }
});

// Search Products
app.post('/search', async (req, res) => {
  try {
    const results = await adapter.searchCatalog({
      query: req.body.query,
      location: req.body.location
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Select Item
app.post('/select', async (req, res) => {
  try {
    const result = await adapter.selectItem(req.body.itemId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Place Order
app.post('/orders', async (req, res) => {
  try {
    const order = await adapter.placeOrder(req.body);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Track Order
app.get('/orders/:orderId/track', async (req, res) => {
  try {
    const tracking = await adapter.ondcProtocol.sendToNetwork('track', {
      order_id: req.params.orderId
    });
    res.json(tracking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Buyer app running on port ${PORT}`);
});