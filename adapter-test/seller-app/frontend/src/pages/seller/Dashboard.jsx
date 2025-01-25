import { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Box,
} from '@mui/material';
import {
  TrendingUp,
  ShoppingCart,
  Inventory,
  LocalShipping
} from '@mui/icons-material';
import { apiService } from '../../services/api.service';

export default function SellerHomePage() {
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
    <Box sx={{ p: 3, bgcolor: '#f9fafb', minHeight: '100vh' }}>
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          pb: 1,
          borderBottom: `3px solid `,
          fontWeight: 'bold',
          color: 'text.primary'
        }}
      >
        Seller Dashboard
      </Typography>

      {/* Dashboard Stats */}
      <Grid container spacing={3}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              className="shadow-lg"
              sx={{
                borderRadius: 3,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: stat.color,
                      p: 2,
                      borderRadius: '50%',
                      display: 'flex'
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: stat.color
                      }}
                    >
                      {stat.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: '600' }}>
          Quick Actions
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 2,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.03)', boxShadow: '0 6px 18px rgba(0,0,0,0.15)' }
              }}
              className="daisy-card bg-base-200"
            >
              <Typography variant="button">Add New Product</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 2,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.03)', boxShadow: '0 6px 18px rgba(0,0,0,0.15)' }
              }}
              className="daisy-card bg-base-200"
            >
              <Typography variant="button">View Orders</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 2,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.03)', boxShadow: '0 6px 18px rgba(0,0,0,0.15)' }
              }}
              className="daisy-card bg-base-200"
            >
              <Typography variant="button">Analytics</Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Placeholder for Upcoming Features */}
      <Box sx={{ mt: 5, p: 4, bgcolor: '#fff', borderRadius: 2 }} className="shadow-md">
        <Typography variant="body1" sx={{ fontWeight: 500, textAlign: 'center' }}>
          Stay tuned for more updates and features coming soon!
        </Typography>
      </Box>
    </Box>
  );
}
