const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const ONDCProtocolHandler = require('./handlers/protocol-handler');
const RegistryService = require('./services/registry.service');
const { ProductService } = require('./services/product.service');
const { OrderService } = require('./services/order.service');
const { CatalogService } = require('./services/catalog.service');
const { LogisticsService } = require('./services/logistics.service');
const { PaymentService } = require('./services/payment.service');

class WooCommerceONDCAdapter {
  constructor(config, context = {}) {
    this.wooCommerce = new WooCommerceRestApi({
      url: config.woocommerce.storeUrl,
      consumerKey: config.woocommerce.consumerKey,
      consumerSecret: config.woocommerce.consumerSecret,
      version: config.woocommerce.version
    });

    this.context = context;
    this.ondcConfig = config.ondc;
    this.ondcProtocol = new ONDCProtocolHandler(config.ondc);
    this.registry = new RegistryService(config.ondc);
    this.isBuyer = context.type === 'buyer';

    // Initialize services
    this.products = new ProductService(this.wooCommerce);
    this.orders = new OrderService(this.wooCommerce);
    this.catalog = new CatalogService(this.wooCommerce);
    this.logistics = new LogisticsService(this.wooCommerce);
    this.payments = new PaymentService(this.wooCommerce);
  }

  // Common Methods
  async validateSubscriber(subscriberId) {
    return await this.registry.lookup(subscriberId);
  }

  // Buyer App Methods
  async searchCatalog(searchParams) {
    if (!this.isBuyer) throw new Error('This method is only available for buyer apps');

    const payload = {
      intent: {
        item: {
          descriptor: {
            name: searchParams.query
          }
        },
        fulfillment: {
          type: "Delivery",
          end: {
            location: {
              gps: searchParams.location
            }
          }
        }
      }
    };

    return await this.ondcProtocol.sendToNetwork('search', payload);
  }

  async selectItem(itemId) {
    if (!this.isBuyer) throw new Error('This method is only available for buyer apps');

    const product = await this.products.search({ include: [itemId] });
    return {
      provider: this.context.provider,
      items: product
    };
  }

  async placeOrder(orderDetails) {
    if (!this.isBuyer) throw new Error('This method is only available for buyer apps');

    // Initialize order
    const initPayload = {
      order: {
        items: orderDetails.items,
        billing: orderDetails.billing,
        fulfillment: orderDetails.fulfillment
      }
    };

    const initResponse = await this.ondcProtocol.sendToNetwork('init', initPayload);

    // Confirm order
    const confirmPayload = {
      order: {
        ...initResponse.order,
        payment: orderDetails.payment
      }
    };

    return await this.ondcProtocol.sendToNetwork('confirm', confirmPayload);
  }

  // Seller App Methods
  async handleSearch(searchRequest) {
    if (this.isBuyer) throw new Error('This method is only available for seller apps');

    const products = await this.products.search(searchRequest.intent);
    return {
      catalog: {
        "bpp/descriptor": {
          name: this.context.provider.name
        },
        "bpp/providers": [{
          id: this.context.provider.id,
          items: products
        }]
      }
    };
  }

  async handleOrder(orderRequest) {
    if (this.isBuyer) throw new Error('This method is only available for seller apps');

    const order = await this.orders.create(orderRequest.order);

    // Update inventory
    for (const item of order.items) {
      await this.catalog.updateInventory(item.id, 'decrement', item.quantity);
    }

    return {
      order: {
        id: order.id,
        state: order.state,
        items: order.items,
        fulfillment: order.fulfillment
      }
    };
  }

  async updateOrderStatus(orderId, status, trackingInfo = null) {
    await this.orders.update(orderId, status);
    if (trackingInfo) {
      await this.logistics.updateShipment(orderId, trackingInfo);
    }
    return await this.orders.getOrderDetails(orderId);
  }

  // Webhook handler for ONDC callbacks
  async handleCallback(action, payload) {
    switch (action) {
      case 'search':
        return await this.handleSearch(payload);
      case 'select':
        return await this.selectItem(payload.item_id);
      case 'init':
      case 'confirm':
        return await this.handleOrder(payload);
      case 'status':
        return await this.orders.getOrderDetails(payload.order_id);
      case 'track':
        return await this.logistics.getTrackingDetails(payload.order_id);
      case 'cancel':
        return await this.updateOrderStatus(payload.order_id, 'cancelled', payload.reason);
      case 'update':
        return await this.updateOrderStatus(
          payload.order_id,
          payload.status,
          payload.tracking_info
        );
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
}

module.exports = WooCommerceONDCAdapter;