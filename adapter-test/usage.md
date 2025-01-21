// Example usage
const buyerAppUsage = `
// Search for products
const searchResult = await fetch('http://localhost:3000/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    product: 'organic rice',
    location: {
      city: 'Mumbai',
      pincode: '400001'
    }
  })
});

// Create an order
const orderResult = await fetch('http://localhost:3000/order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [{
      productId: 123,
      quantity: 2
    }],
    customerName: 'John Doe',
    deliveryAddress: '123 Main St, Mumbai',
    phone: '9876543210',
    email: 'john@example.com',
    paymentMethod: 'cod',
    paymentDetails: 'Cash on Delivery'
  })
});

// Track an order
const trackingResult = await fetch('http://localhost:3000/track/12345');
`;

const sellerAppUsage = `
// Sync catalog
const syncResult = await fetch('http://localhost:3000/catalog/sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    products: [{
      name: 'Organic Rice',
      description: 'Premium quality organic rice',
      price: 100,
      stock: 500,
      maxOrderQuantity: 50
    }]
  })
});

// Update inventory
const inventoryResult = await fetch('http://localhost:3000/inventory/123', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    quantity: 450
  })
});

// Process order
const processResult = await fetch('http://localhost:3000/order/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: 12345,
    logistics: {
      provider: 'FastShip',
      trackingId: 'FS123456'
    }
  })
});
`;