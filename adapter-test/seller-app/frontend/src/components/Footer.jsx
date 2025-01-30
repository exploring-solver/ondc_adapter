import { WhatsApp, Email, GitHub } from '@mui/icons-material';
import { Button, Typography, Box, Grid, useTheme,Container } from '@mui/material';
import { Link } from 'react-router-dom';

const Footer = () => {
  const theme = useTheme();
  const categories = [
    'Fashion', 'Grocery', 'Electronics', 'F&B',
    'Home & Kitchen', 'Health & Wellness', 'BPC',
    'Agriculture', 'Appliances', 'Auto1'
  ];

  const services = [
    'About Us', 'Terms & Conditions', 'FAQ',
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: `1px solid ${theme.palette.divider}`,
        py: 2,
        mt: 'auto'
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Contact Section */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Woo-Chill
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Open Network for Digital Commerce
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Button
                startIcon={<WhatsApp sx={{ color: theme.palette.success.main }} />}
                component="a"
                sx={{
                  textTransform: 'none',
                  color: 'text.primary',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                +91 XXXXXXXXX
              </Button>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Button
                startIcon={<Email sx={{ color: theme.palette.warning.main }} />}
                component="a"
                sx={{
                  textTransform: 'none',
                  color: 'text.primary',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                amansharma12607@gmail.com
              </Button>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Button
                startIcon={<GitHub sx={{ color: theme.palette.warning.main }} />}
                component="a"
                href="https://github.com/exploring-solver/ondc_adapter"
                sx={{
                  textTransform: 'none',
                  color: 'text.primary',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                GitHub
              </Button>
            </Box>
            
          </Grid>

          {/* Categories Section */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Popular Categories
            </Typography>
            <Grid container spacing={1}>
              {categories.map((category) => (
                <Grid item xs={6} key={category}>
                  <Button
                    component={Link}
                    to="#"
                    fullWidth
                    sx={{
                      justifyContent: 'flex-start',
                      color: 'text.secondary',
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    {category}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Services Section */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Customer Services
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {services.map((service) => (
                <Button
                  key={service}
                  component={Link}
                  to="#"
                  sx={{
                    justifyContent: 'flex-start',
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  {service}
                </Button>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Copyright Section */}
        <Box
          sx={{
            mt: 4,
            pt: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © 2024 ONDC Woo-Commerce Portal. All rights reserved. 
            <br />
            Powered by WooCommerce & ONDC Network
            <br />
            Designed by Team Chill.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
