import { WhatsApp, Phone, Store } from '@mui/icons-material';
import { Button, Typography } from '@mui/material';

const Footer = () => {
  const categories = [
    'Fashion', 'Grocery', 'Electronics', 'F&B',
    'Home & Kitchen', 'Health & Wellness', 'BPC',
    'Agriculture', 'Appliances', 'Auto1', 'Auto2',
  ];

  const services = [
    'About Us', 'Terms & Conditions', 'FAQ',
    'Privacy Policy', 'E-waste Policy',
    'Cancellation & Return Policy',
  ];

  return (
    <footer className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Section */}
          <div>
            <Typography variant="h5" className="mb-4 font-bold">
              Woo-Chill
            </Typography>
            <Typography variant="subtitle1" className="mb-6 text-gray-200">
              Open Network for Digital Commerce
            </Typography>
            <div className="flex items-center space-x-3 mb-3">
              <WhatsApp className="text-green-400" />
              <Typography>+1 202-918-2132</Typography>
            </div>
            <div className="flex items-center space-x-3 mb-6">
              <Phone className="text-yellow-400" />
              <Typography>+1 202-918-2132</Typography>
            </div>
            <Typography variant="h6" className="mb-4 font-semibold">
              Download App
            </Typography>
            <div className="flex space-x-4">
              <Button
                variant="contained"
                className="bg-black hover:bg-gray-800 text-white"
                startIcon={<Store />}
              >
                App Store
              </Button>
              <Button
                variant="contained"
                className="bg-black hover:bg-gray-800 text-white"
                startIcon={<Store />}
              >
                Play Store
              </Button>
            </div>
          </div>

          {/* Categories Section */}
          <div>
            <Typography
              variant="h6"
              className="mb-4 text-center md:text-left font-bold underline"
            >
              Most Popular Categories
            </Typography>
            <ul className="grid grid-cols-2 gap-2 text-center md:text-left text-gray-200">
              {categories.map((category) => (
                <li key={category}>
                  <a
                    href="#"
                    className="hover:text-blue-100 transition-colors"
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Section */}
          <div>
            <Typography
              variant="h6"
              className="mb-4 text-center md:text-left font-bold underline"
            >
              Customer Services
            </Typography>
            <ul className="space-y-2 text-center md:text-left text-gray-200">
              {services.map((service) => (
                <li key={service}>
                  <a
                    href="#"
                    className="hover:text-blue-100 transition-colors"
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-12 pt-6 border-t border-blue-300">
          <Typography className="text-center text-sm text-gray-200">
            © 2024 Woo-Chill. All rights reserved. Powered by WooCommerce & ONDC.
          </Typography>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
