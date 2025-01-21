// import React, { useState } from 'react';
// import axios from 'axios';

// const API_URL = 'http://localhost:3002';

// function App() {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [cart, setCart] = useState([]);
//   const [orders, setOrders] = useState([]);

//   const searchProducts = async () => {
//     const response = await axios.post(`${API_URL}/search`, {
//       query: searchQuery,
//       location: "12.9716,77.5946" // Example location
//     });
//     setSearchResults(response.data.catalog["bpp/providers"][0].items);
//   };

//   const addToCart = async (item) => {
//     const response = await axios.post(`${API_URL}/select`, {
//       itemId: item.id
//     });
//     setCart([...cart, response.data.items[0]]);
//   };

//   const placeOrder = async () => {
//     const orderDetails = {
//       items: cart.map(item => ({
//         id: item.id,
//         quantity: 1
//       })),
//       billing: {
//         name: "John Doe",
//         address: "123 Main St",
//         phone: "9876543210"
//       },
//       fulfillment: {
//         type: "Delivery",
//         address: "123 Main St"
//       },
//       payment: {
//         type: "POST-FULFILLMENT",
//         method: "UPI"
//       }
//     };

//     const response = await axios.post(`${API_URL}/orders`, orderDetails);
//     setOrders([...orders, response.data]);
//     setCart([]);
//   };

//   return (
//     <div className="App">
//       <h1>ONDC Buyer App</h1>

//       <div className="search-section">
//         <input
//           type="text"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           placeholder="Search products..."
//         />
//         <button onClick={searchProducts}>Search</button>
//       </div>

//       <div className="results-section">
//         <h2>Search Results</h2>
//         {searchResults.map(item => (
//           <div key={item.id} className="product-card">
//             <h3>{item.descriptor.name}</h3>
//             <p>{item.price.value} INR</p>
//             <button onClick={() => addToCart(item)}>Add to Cart</button>
//           </div>
//         ))}
//       </div>

//       <div className="cart-section">
//         <h2>Cart ({cart.length} items)</h2>
//         {cart.map(item => (
//           <div key={item.id}>
//             <span>{item.descriptor.name}</span>
//             <span>{item.price.value} INR</span>
//           </div>
//         ))}
//         {cart.length > 0 && (
//           <button onClick={placeOrder}>Place Order</button>
//         )}
//       </div>

//       <div className="orders-section">
//         <h2>Orders</h2>
//         {orders.map(order => (
//           <div key={order.id} className="order-card">
//             <h3>Order #{order.id}</h3>
//             <p>Status: {order.state}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default App;
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001';

function App() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    const response = await axios.get(`${API_URL}/orders`);
    setOrders(response.data);
  };

  const fetchProducts = async () => {
    const response = await axios.get(`${API_URL}/products`);
    setProducts(response.data);
  };

  const updateOrderStatus = async (orderId, status) => {
    await axios.put(`${API_URL}/orders/${orderId}/status`, { status });
    fetchOrders();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-8">ONDC Seller Dashboard</h1>

      <div className="orders-section mb-8">
        <h2 className="text-2xl font-semibold mb-4">Orders</h2>
        <table className="w-full table-auto bg-white rounded-lg shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-4 text-left">Order ID</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Total</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b">
                <td className="p-4">NA</td>
                <td className="p-4">{order.status}</td>
                <td className="p-4">{order.total}</td>
                <td className="p-4">
                  <select
                    className="border p-2 rounded"
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    value={order.status}
                  >
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="products-section">
        <h2 className="text-2xl font-semibold mb-4">Products</h2>
        <table className="w-full table-auto bg-white rounded-lg shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Description</th>
              <th className="p-4 text-left">Price</th>
              <th className="p-4 text-left">Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-b">
                <td className="p-4">{product.id}</td>
                <td className="p-4">{product.descriptor.name}</td>
                <td className="p-4">
                  <div dangerouslySetInnerHTML={{ __html: product.descriptor.description }} />
                </td>
                <td className="p-4">{`${product.price.currency} ${product.price.value}`}</td>
                <td className="p-4">{product.quantity.available ?? 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;