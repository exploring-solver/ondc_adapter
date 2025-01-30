import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Security, 
  Store, 
  CheckCircle,
  ArrowForward 
} from '@mui/icons-material';
import { 
  TextField, 
  Checkbox, 
  Button, 
  Paper,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress
} from '@mui/material';

const Register = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    consumerKey: '',
    consumerSecret: '',
    storeName: '',
    storeUrl: '',
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sellerId, setSellerId] = useState('');

  const steps = ['Store Details', 'WooCommerce Credentials', 'Terms & Conditions'];

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'agreeToTerms' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:3001/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeUrl: formData.storeUrl,
          storeName: formData.storeName,
          consumerKey: formData.consumerKey,
          consumerSecret: formData.consumerSecret,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSellerId(data.sellerId);
      setSuccess(`Successfully registered! Your Seller ID is: ${data.sellerId}`);
      
      // Store sellerId in localStorage for future use
      localStorage.setItem('ondcSellerId', data.sellerId);
      
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <TextField
              fullWidth
              label="Store Name"
              name="storeName"
              value={formData.storeName}
              onChange={handleInputChange}
              variant="outlined"
              required
            />
            <TextField
              fullWidth
              label="Store URL"
              name="storeUrl"
              value={formData.storeUrl}
              onChange={handleInputChange}
              variant="outlined"
              required
              placeholder="https://your-store.com"
            />
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <TextField
              fullWidth
              label="WooCommerce Consumer Key"
              name="consumerKey"
              value={formData.consumerKey}
              onChange={handleInputChange}
              variant="outlined"
              required
            />
            <TextField
              fullWidth
              label="WooCommerce Consumer Secret"
              name="consumerSecret"
              value={formData.consumerSecret}
              onChange={handleInputChange}
              variant="outlined"
              type="password"
              required
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">ONDC Network Terms of Service</h4>
              <p className="text-sm text-gray-600">
                By joining the ONDC Network, you agree to:
                <ul className="list-disc ml-5 mt-2">
                  <li>Follow ONDC's protocol specifications</li>
                  <li>Maintain accurate product information</li>
                  <li>Process orders according to ONDC guidelines</li>
                  <li>Comply with all applicable regulations</li>
                </ul>
              </p>
            </div>
            <div className="flex items-center">
              <Checkbox
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                required
              />
              <span className="text-sm text-gray-700">
                I agree to the ONDC Network Terms of Service
              </span>
            </div>
          </div>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Store className="text-blue-500 text-5xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Join ONDC Network
          </h2>
          <p className="text-gray-600">
            Connect your WooCommerce store to India's largest digital commerce network
          </p>
        </div>

        <Paper className="p-8 shadow-xl rounded-xl">
          <Stepper activeStep={activeStep} className="mb-8">
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" className="mb-4">
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {getStepContent(activeStep)}

            <div className="mt-8 flex justify-between">
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>
              <div className="flex space-x-2">
                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!formData.agreeToTerms || loading}
                    endIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                  >
                    Register
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForward />}
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Paper>

        <div className="mt-8 text-center">
          <div className="flex justify-center space-x-4">
            <div className="text-center">
              <Security className="text-blue-500 text-2xl mb-2" />
              <p className="text-sm text-gray-600">Secure Integration</p>
            </div>
            <div className="text-center">
              <ShoppingCart className="text-blue-500 text-2xl mb-2" />
              <p className="text-sm text-gray-600">Expanded Reach</p>
            </div>
            <div className="text-center">
              <CheckCircle className="text-blue-500 text-2xl mb-2" />
              <p className="text-sm text-gray-600">Easy Setup</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;