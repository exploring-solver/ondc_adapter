import { createBrowserRouter, Navigate } from 'react-router-dom';
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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/buyer" replace />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/buyer',
    element: <BuyerLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { path: '', element: <BuyerHome /> },
      { path: 'search', element: <BuyerSearch /> },
      { path: 'cart', element: <BuyerCart /> },
      { path: 'orders', element: <BuyerOrders /> },
    ],
  },
  {
    path: '/seller',
    element: <SellerLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { path: '', element: <SellerDashboard /> },
      { path: 'products', element: <SellerProducts /> },
      { path: 'orders', element: <SellerOrders /> },
    ],
  },
  {
    path: '*',
    element: <ErrorBoundary />,
  },
]);