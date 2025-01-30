const express = require('express');
const cors = require('cors');
const WooCommerceONDCAdapter = require('../../../main/woocommerce-npm-package/src/adapter');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Store configurations for multiple sellers
const sellerConfigs = new Map();

// Registration endpoint for new sellers
app.post('/register', async (req, res) => {
  try {
    const {
      storeUrl,
      storeName,
      consumerKey,
      consumerSecret,
      // Optional custom ONDC configs
      subscriberId,
      subscriberUrl,
      signingKeys,
      encryptionKeys
    } = req.body;

    // Generate unique seller ID if not provided
    const sellerId = subscriberId || `${storeName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    // Create ONDC configuration
    const config = {
      woocommerce: {
        storeUrl,
        consumerKey,
        consumerSecret,
        version: 'wc/v3'
      },
      ondc: {
        subscriberId: sellerId,
        subscriberUrl: subscriberUrl || `${process.env.BASE_URL}/seller/${sellerId}`,
        type: 'seller_app',
        signingPublicKey: signingKeys?.public || process.env.DEFAULT_SIGNING_PUBLIC_KEY,
        signingPrivateKey: signingKeys?.private || process.env.DEFAULT_SIGNING_PRIVATE_KEY,
        encryptionPublicKey: encryptionKeys?.public || process.env.DEFAULT_ENCRYPTION_PUBLIC_KEY,
        encryptionPrivateKey: encryptionKeys?.private || process.env.DEFAULT_ENCRYPTION_PRIVATE_KEY
      }
    };

    // Initialize adapter for this seller
    const adapter = new WooCommerceONDCAdapter(config, {
      type: 'seller',
      provider: {
        id: sellerId,
        name: storeName
      }
    });

    // Register with ONDC network
    await adapter.registry.register();

    // Store configuration
    sellerConfigs.set(sellerId, { config, adapter });

    res.json({
      success: true,
      sellerId,
      message: 'Successfully registered with ONDC network'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ONDC Network callback endpoint
app.post('/seller/:sellerId/callback/:action', async (req, res) => {
  try {
    const { sellerId, action } = req.params;
    const sellerConfig = sellerConfigs.get(sellerId);
    
    if (!sellerConfig) {
      throw new Error('Seller not found');
    }

    // Verify ONDC signature
    const signature = req.headers['x-gateway-authorization'];
    if (signature) {
      await sellerConfig.adapter.ondcProtocol.verifyGatewaySignature({
        headers: req.headers,
        data: req.body
      });
    }

    const response = await sellerConfig.adapter.handleCallback(action, req.body);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Catalog management endpoints
app.get('/seller/:sellerId/catalog', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const sellerConfig = sellerConfigs.get(sellerId);
    
    if (!sellerConfig) {
      throw new Error('Seller not found');
    }

    const catalog = await sellerConfig.adapter.catalog.getFullCatalog({
      storeName: sellerConfig.config.storeName,
      providerId: sellerId
    });
    
    res.json(catalog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Order management endpoints
app.get('/seller/:sellerId/orders', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const sellerConfig = sellerConfigs.get(sellerId);
    
    if (!sellerConfig) {
      throw new Error('Seller not found');
    }

    const orders = await sellerConfig.adapter.orders.getAll(req.query);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/seller/:sellerId/orders/:orderId/status', async (req, res) => {
  try {
    const { sellerId, orderId } = req.params;
    const { status, trackingInfo } = req.body;
    const sellerConfig = sellerConfigs.get(sellerId);
    
    if (!sellerConfig) {
      throw new Error('Seller not found');
    }

    const order = await sellerConfig.adapter.updateOrderStatus(
      orderId,
      status,
      trackingInfo
    );
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logistics endpoints
app.post('/seller/:sellerId/orders/:orderId/shipment', async (req, res) => {
  try {
    const { sellerId, orderId } = req.params;
    const sellerConfig = sellerConfigs.get(sellerId);
    
    if (!sellerConfig) {
      throw new Error('Seller not found');
    }

    const shipment = await sellerConfig.adapter.logistics.updateShipment(
      orderId,
      req.body
    );
    res.json(shipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Seller app running on port ${PORT}`);
});