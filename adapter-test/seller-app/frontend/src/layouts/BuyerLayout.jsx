import { Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function BuyerLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ONDC Buyer
          </Typography>
          <Button color="inherit" component={RouterLink} to="/buyer">
            Home
          </Button>
          <Button color="inherit" component={RouterLink} to="/buyer/search">
            Search
          </Button>
          <Button color="inherit" component={RouterLink} to="/buyer/cart">
            Cart
          </Button>
          <Button color="inherit" component={RouterLink} to="/buyer/orders">
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