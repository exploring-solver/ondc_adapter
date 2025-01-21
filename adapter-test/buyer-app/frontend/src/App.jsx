import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3002';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  const searchProducts = async () => {
    const response = await axios.post(`${API_URL}/search`, {
      query: searchQuery,
      location: "12.9716,77.5946" // Example location
    });
    setSearchResults(response.data.catalog["bpp/providers"][0].items);
  };

  const addToCart = async (item) => {
    const response = await axios.post(`${API_URL}/select`, {
      itemId: item.id
    });
    setCart([...cart, response.data.items[0]]);
  };

  const placeOrder = async () => {
    const orderDetails = {
      items: cart.map(item => ({
        id: item.id,
        quantity: 1
      })),
      billing: {
        name: "John Doe",
        address: "123 Main St",
        phone: "9876543210"
      },
      fulfillment: {
        type: "Delivery",
        address: "123 Main St"
      },
      payment: {
        type: "POST-FULFILLMENT",
        method: "UPI"
      }
    };

    const response = await axios.post(`${API_URL}/orders`, orderDetails);
    setOrders([...orders, response.data]);
    setCart([]);
  };

  return (
    <div className="App">
      <h1>ONDC Buyer App</h1>

      <div className="search-section">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products..."
        />
        <button onClick={searchProducts}>Search</button>
      </div>

      <div className="results-section">
        <h2>Search Results</h2>
        {searchResults.map(item => (
          <div key={item.id} className="product-card">
            <h3>{item.descriptor.name}</h3>
            <p>{item.price.value} INR</p>
            <button onClick={() => addToCart(item)}>Add to Cart</button>
          </div>
        ))}
      </div>

      <div className="cart-section">
        <h2>Cart ({cart.length} items)</h2>
        {cart.map(item => (
          <div key={item.id}>
            <span>{item.descriptor.name}</span>
            <span>{item.price.value} INR</span>
          </div>
        ))}
        {cart.length > 0 && (
          <button onClick={placeOrder}>Place Order</button>
        )}
      </div>

      <div className="orders-section">
        <h2>Orders</h2>
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <h3>Order #{order.id}</h3>
            <p>Status: {order.state}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;