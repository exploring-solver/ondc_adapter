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
//     <div className="min-h-screen bg-gray-100 p-4">
//       <h1 className="text-3xl font-bold text-center mb-8">ONDC Seller Dashboard</h1>

//       <div className="orders-section mb-8">
//         <h2 className="text-2xl font-semibold mb-4">Orders</h2>
//         <table className="w-full table-auto bg-white rounded-lg shadow">
//           <thead>
//             <tr className="bg-gray-200">
//               <th className="p-4 text-left">Order ID</th>
//               <th className="p-4 text-left">Status</th>
//               <th className="p-4 text-left">Total</th>
//               <th className="p-4 text-left">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {orders.map(order => (
//               <tr key={order.id} className="border-b">
//                 <td className="p-4">NA</td>
//                 <td className="p-4">{order.status}</td>
//                 <td className="p-4">{order.total}</td>
//                 <td className="p-4">
//                   <select
//                     className="border p-2 rounded"
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
//         <h2 className="text-2xl font-semibold mb-4">Products</h2>
//         <table className="w-full table-auto bg-white rounded-lg shadow">
//           <thead>
//             <tr className="bg-gray-200">
//               <th className="p-4 text-left">ID</th>
//               <th className="p-4 text-left">Name</th>
//               <th className="p-4 text-left">Description</th>
//               <th className="p-4 text-left">Price</th>
//               <th className="p-4 text-left">Stock</th>
//             </tr>
//           </thead>
//           <tbody>
//             {products.map(product => (
//               <tr key={product.id} className="border-b">
//                 <td className="p-4">{product.id}</td>
//                 <td className="p-4">{product.descriptor.name}</td>
//                 <td className="p-4">
//                   <div dangerouslySetInnerHTML={{ __html: product.descriptor.description }} />
//                 </td>
//                 <td className="p-4">{`${product.price.currency} ${product.price.value}`}</td>
//                 <td className="p-4">{product.quantity.available ?? 'N/A'}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// export default App;


import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import ErrorBoundary from './components/ErrorBoundary';
import BuyerLayout from './layouts/BuyerLayout';
import SellerLayout from './layouts/SellerLayout';
import BuyerHome from './pages/buyer/Home';
import BuyerSearch from './pages/buyer/Search';
import BuyerCart from './pages/buyer/Cart';
import BuyerOrders from './pages/buyer/Orders';
import SellerDashboard from './pages/seller/Dashboard';
import SellerProducts from './pages/seller/Products';
import SellerOrders from './pages/seller/Orders';
import FrontPage from './pages/FrontPage';
import theme from './theme';
import Footer from './components/Footer'
import Register from './pages/Register';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          
          <Route path="/home" element={<FrontPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/buyer" element={<BuyerLayout />}>
            <Route index element={<BuyerHome />} />
            <Route path="search" element={<BuyerSearch />} />
            <Route path="cart" element={<BuyerCart />} />
            <Route path="orders" element={<BuyerOrders />} />
          </Route>

          <Route path="/seller" element={<SellerLayout />}>
            <Route index element={<SellerDashboard />} />
            <Route path="products" element={<SellerProducts />} />
            <Route path="orders" element={<SellerOrders />} />
          </Route>

          <Route path="*" element={<ErrorBoundary />} />
        </Routes>
        <Footer/>
      </Router>
    </ThemeProvider>
  );
}

export default App;

