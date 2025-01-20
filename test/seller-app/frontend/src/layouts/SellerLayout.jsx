import { Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function SellerLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ONDC Seller
          </Typography>
          <Button color="inherit" component={RouterLink} to="/seller">
            Dashboard
          </Button>
          <Button color="inherit" component={RouterLink} to="/seller/products">
            Products
          </Button>
          <Button color="inherit" component={RouterLink} to="/seller/orders">
            Orders
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" className="py-8">
        <Outlet />
      </Container>
    </div>
  );
}