import { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp,
  ShoppingCart,
  Inventory,
  LocalShipping
} from '@mui/icons-material';
import { apiService } from '../../services/api.service';

export default function SellerDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // In a real application, you would fetch these stats from your backend
      const orders = await apiService.getOrders();
      const products = await apiService.getProducts();
      
      setStats({
        totalOrders: orders.data.length,
        pendingOrders: orders.data.filter(o => o.status === 'processing').length,
        totalProducts: products.data.length,
        revenue: orders.data.reduce((sum, order) => sum + parseFloat(order.total), 0)
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: <ShoppingCart fontSize="large" />,
      color: 'primary.main'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: <LocalShipping fontSize="large" />,
      color: 'warning.main'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: <Inventory fontSize="large" />,
      color: 'success.main'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.revenue}`,
      icon: <TrendingUp fontSize="large" />,
      color: 'info.main'
    }
  ];

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <div>
      <Typography variant="h4" className="mb-6">Dashboard</Typography>

      <Grid container spacing={3}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div style={{ color: stat.color }}>{stat.icon}</div>
                  <Typography variant="h4">{stat.value}</Typography>
                </div>
                <Typography color="textSecondary">{stat.title}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add more dashboard widgets here */}
    </div>
  );
}