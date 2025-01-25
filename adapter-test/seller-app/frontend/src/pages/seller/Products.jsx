import { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  IconButton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { apiService } from '../../services/api.service';

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiService.getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock_quantity: product.stock_quantity
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedProduct) {
        await apiService.updateProduct(selectedProduct.id, formData);
      } else {
        await apiService.createProduct(formData);
      }
      setDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <Typography variant="h4" fontWeight={700}>
          Products
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setSelectedProduct(null);
            setFormData({
              name: '',
              description: '',
              price: '',
              stock_quantity: ''
            });
            setDialogOpen(true);
          }}
        >
          Add Product
        </Button>
      </div>

      {/* Products Grid */}
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card
              className="transition-transform transform hover:-translate-y-1 shadow-lg"
              sx={{ borderRadius: 2 }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.description}
                </Typography>
                <Typography
                  variant="h6"
                  color="primary"
                  fontWeight={700}
                  className="mt-4"
                >
                  ₹{product.price}
                </Typography>
                <Typography variant="body2" className="mt-2">
                  Stock: {product.stock_quantity}
                </Typography>
              </CardContent>
              <CardActions className="flex justify-end">
                <IconButton
                  color="primary"
                  onClick={() => handleEdit(product)}
                >
                  <Edit />
                </IconButton>
                <IconButton color="error">
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog for Adding/Editing Products */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <DialogTitle>
            {selectedProduct ? 'Edit Product' : 'Add Product'}
          </DialogTitle>
          <DialogContent className="space-y-4">
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              multiline
              rows={3}
              required
            />
            <TextField
              fullWidth
              label="Price"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
            />
            <TextField
              fullWidth
              label="Stock Quantity"
              type="number"
              value={formData.stock_quantity}
              onChange={(e) =>
                setFormData({ ...formData, stock_quantity: e.target.value })
              }
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
