// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const API_URL = 'http://localhost:3001';

// function App() {
//   const [orders, setOrders] = useState([]);
//   const [products, setProducts] = useState([]);

//   useEffect(() => {
//     fetchOrders();
//     fetchProducts();
//   }, []);

//   const fetchOrders = async () => {
//     const response = await axios.get(`${API_URL}/orders`);
//     setOrders(response.data);
//   };

//   const fetchProducts = async () => {
//     const response = await axios.get(`${API_URL}/products`);
//     setProducts(response.data);
//   };

//   const updateOrderStatus = async (orderId, status) => {
//     await axios.put(`${API_URL}/orders/${orderId}/status`, { status });
//     fetchOrders();
//   };

//   return (
//     <div className="App">
//       <h1>ONDC Seller Dashboard</h1>

//       <div className="orders-section">
//         <h2>Orders</h2>
//         <table>
//           <thead>
//             <tr>
//               <th>Order ID</th>
//               <th>Status</th>
//               <th>Total</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {orders.map(order => (
//               <tr key={order.id}>
//                 <td>{order.id}</td>
//                 <td>{order.status}</td>
//                 <td>{order.total}</td>
//                 <td>
//                   <select
//                     onChange={(e) => updateOrderStatus(order.id, e.target.value)}
//                     value={order.status}
//                   >
//                     <option value="processing">Processing</option>
//                     <option value="completed">Completed</option>
//                     <option value="cancelled">Cancelled</option>
//                   </select>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <div className="products-section">
//         <h2>Products</h2>
//         <table>
//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>Name</th>
//               <th>Description</th>
//               <th>Price</th>
//               <th>Stock</th>
//             </tr>
//           </thead>
//           <tbody>
//             {products.map(product => (
//               <tr key={product.id}>
//                 <td>{product.id}</td>
//                 <td>{product.descriptor.name}</td>
//                 <td>
//                   <div dangerouslySetInnerHTML={{ __html: product.descriptor.description }} />
//                 </td>
//                 <td>{`${product.price.currency} ${product.price.value}`}</td>
//                 <td>{product.quantity.available ?? 'N/A'}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// export default App;

import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { router } from './router';
import theme from './theme'; // We'll create this next

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
