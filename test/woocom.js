var WooCommerceAPI = require('woocommerce-api');
 
var WooCommerce = new WooCommerceAPI({
  url: 'http://localhost/woo_ondc_adapter_test',
  consumerKey: 'ck_7183db1c5c505b6b89a87cdad0a8890a1115146f',
  consumerSecret: 'cs_3e9bab63718f641fb5d2e352bc8cdab04a429218',
  wpAPI: true,
  version: 'wc/v1'
});

WooCommerce.getAsync('products').then(function(result) {
  console.log(JSON.parse(result.toJSON().body));
});