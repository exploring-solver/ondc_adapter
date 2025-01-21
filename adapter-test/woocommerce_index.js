const WooCommerceAPI = require('woocommerce-api');

// Configure WooCommerce API
const WooCommerce = new WooCommerceAPI({
  url: 'http://localhost/amazon-portfolio', // Replace with your store URL
  consumerKey: 'ck_967f47be17ff7c67ebf63999528c528e51935', // Replace with your Consumer Key
  consumerSecret: 'cs_bbe095be32b05d8b11e67ff1acd69c460fee69de', // Replace with your Consumer Secret
  wpAPI: true, // Enable WP REST API integration
  version: 'wc/v1', // WooCommerce API version
  verifySsl: false // Disable SSL verification for testing (do not use in production)
});
// consumer_key=ck_967f47be17ff7c67ebf63999528c528e5193513a&consumer_secret=cs_bbe095be32b05d8b11e67ff1acd69c460fee69de
// Function to fetch all products
function fetchProducts() {
  WooCommerce.getAsync('products')
    .then((response) => {
      const data = JSON.parse(response.toJSON().body);
      console.log('📦 Product List:', data);
    })
    .catch((error) => {
      console.error('❌ Error fetching products:', error);
    });
}

// Function to create a new product
function createProduct() {
  const newProduct = {
    name: 'Test Product',
    type: 'simple',
    regular_price: '19.99',
    description: 'A simple test product.',
    short_description: 'Test product.',
    categories: [
      {
        id: 9 // Replace with a valid category ID from your store
      }
    ]
  };

  WooCommerce.postAsync('products', newProduct)
    .then((response) => {
      const data = JSON.parse(response.toJSON().body);
      console.log('✅ Product Created:', data);
    })
    .catch((error) => {
      console.error('❌ Error creating product:', error);
    });
}

// Function to delete a product (by ID)
function deleteProduct(productId) {
  WooCommerce.deleteAsync(`products/${productId}?force=true`)
    .then((response) => {
      const data = JSON.parse(response.toJSON().body);
      console.log(`🗑️ Product with ID ${productId} deleted:`, data);
    })
    .catch((error) => {
      console.error(`❌ Error deleting product ID ${productId}:`, error);
    });
}

// ====================
// TESTING API CALLS
// ====================

// Fetch products
fetchProducts();

// Uncomment to create a new product
// createProduct();

// Uncomment to delete a product by ID
// deleteProduct(123); // Replace 123 with the actual product ID
