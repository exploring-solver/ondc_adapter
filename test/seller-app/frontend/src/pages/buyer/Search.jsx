import { useState } from 'react';
import { 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Grid 
} from '@mui/material';
import { apiService } from '../../services/api.service';

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiService.searchCatalog({
        query: searchQuery,
        location: '12.9716,77.5946' // Example coordinates
      });
      setProducts(response.data.catalog['bpp/providers'][0].items);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-4">
          <TextField
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            variant="outlined"
          />
          <Button 
            variant="contained" 
            type="submit"
            disabled={loading}
          >
            Search
          </Button>
        </div>
      </form>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card className="h-full">
              <CardMedia
                component="img"
                height="200"
                image={product.descriptor.images[0]}
                alt={product.descriptor.name}
              />
              <CardContent>
                <Typography variant="h6" component="div">
                  {product.descriptor.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.descriptor.description}
                </Typography>
                <Typography variant="h6" className="mt-2">
                  ₹{product.price.value}
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  className="mt-2"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}