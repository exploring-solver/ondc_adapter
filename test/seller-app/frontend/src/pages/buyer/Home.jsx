import { Typography, Card, CardContent, Grid } from '@mui/material';
import { LocalMall, Search, ShoppingCart, Receipt } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function BuyerHome() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Search fontSize="large" />,
      title: "Search Products",
      description: "Browse through our catalog",
      path: "/buyer/search"
    },
    {
      icon: <ShoppingCart fontSize="large" />,
      title: "Shopping Cart",
      description: "View your cart items",
      path: "/buyer/cart"
    },
    {
      icon: <Receipt fontSize="large" />,
      title: "Orders",
      description: "Track your orders",
      path: "/buyer/orders"
    }
  ];

  return (
    <div>
      <Typography variant="h4" className="mb-6">Welcome to ONDC Marketplace</Typography>
      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(feature.path)}
            >
              <CardContent className="text-center">
                <div className="text-primary mb-4">{feature.icon}</div>
                <Typography variant="h6" className="mb-2">{feature.title}</Typography>
                <Typography color="textSecondary">{feature.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}