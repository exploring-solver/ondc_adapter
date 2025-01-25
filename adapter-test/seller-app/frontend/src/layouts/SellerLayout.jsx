import { Outlet } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  useTheme
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function SellerLayout() {
  const theme = useTheme();

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: theme.palette.grey[100]
    }}>
      <AppBar
        position="sticky"
        sx={{
          bgcolor: 'primary.main', // Changed to primary blue
          boxShadow: 'none'
        }}
      >
        <Toolbar sx={{ 
          py: 1, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          color: 'common.white' // Set text color to white
        }}>
          <Box sx={{ flexGrow: 1 }}>
            <RouterLink to="/seller" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography
                variant="h6"
                sx={{
                  color: 'common.white', // White text
                  fontWeight: 700,
                  fontSize: '1.5rem'
                }}
              >
                ONDC Seller Portal
              </Typography>
            </RouterLink>
          </Box>

          <Box sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            borderLeft: `1px solid rgba(255,255,255,0.3)`, // Lighter border
            pl: 3,
            ml: 3
          }}>
            <Button
              component={RouterLink}
              to="/seller"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                color: 'common.white',
                '&.active': {
                  borderBottom: `2px solid ${theme.palette.common.white}`,
                  borderRadius: 0
                },
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Dashboard
            </Button>
            <Button
              component={RouterLink}
              to="/seller/products"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                color: 'common.white',
                '&.active': {
                  borderBottom: `2px solid ${theme.palette.common.white}`,
                  borderRadius: 0
                },
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Products
            </Button>
            <Button
              component={RouterLink}
              to="/seller/orders"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                color: 'common.white',
                '&.active': {
                  borderBottom: `2px solid ${theme.palette.common.white}`,
                  borderRadius: 0
                },
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Orders
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="xl"
        sx={{
          pt: 4,
          pb: 6,
          px: { xs: 2, sm: 3, md: 4 }
        }}
      >
        <Outlet />
      </Container>
    </Box>
  );
}