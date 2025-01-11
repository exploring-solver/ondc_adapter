const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api");
const { 
  ProductService,
  OrderService,
  CustomerService,
  CatalogService,
  LogisticsService,
  PaymentService
} = require('./services');

class WooCommerceONDCAdapter {
  constructor(config, context) {
    this.wooCommerce = new WooCommerceRestApi({
      url: config.storeUrl,
      consumerKey: config.consumerKey,
      consumerSecret: config.consumerSecret,
      version: "wc/v3"
    });
    
    this.context = context;
    
    // Initialize services
    this.products = new ProductService(this.wooCommerce);
    this.orders = new OrderService(this.wooCommerce);
    this.customers = new CustomerService(this.wooCommerce);
    this.catalog = new CatalogService(this.wooCommerce);
    this.logistics = new LogisticsService(this.wooCommerce);
    this.payments = new PaymentService(this.wooCommerce);
  }
}