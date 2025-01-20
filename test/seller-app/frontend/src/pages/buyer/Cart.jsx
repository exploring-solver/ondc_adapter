import { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from '@mui/material';
import { Delete, Add, Remove } from '@mui/icons-material';

export default function BuyerCart() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Load cart items from localStorage or state management
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(savedCart);
    calculateTotal(savedCart);
  }, []);

  const calculateTotal = (items) => {
    const sum = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    setTotal(sum);
  };

  const updateQuantity = (itemId, change) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    calculateTotal(updatedCart);
  };

  const removeItem = (itemId) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    calculateTotal(updatedCart);
  };

  return (
    <div>
      <Typography variant="h4" className="mb-6">Shopping Cart</Typography>
      
      {cartItems.length === 0 ? (
        <Typography>Your cart is empty</Typography>
      ) : (
        <>
          <TableContainer component={Paper} className="mb-4">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cartItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="right">₹{item.price}</TableCell>
                    <TableCell align="center">
                      <div className="flex items-center justify-center">
                        <IconButton onClick={() => updateQuantity(item.id, -1)}>
                          <Remove />
                        </IconButton>
                        <span className="mx-2">{item.quantity}</span>
                        <IconButton onClick={() => updateQuantity(item.id, 1)}>
                          <Add />
                        </IconButton>
                      </div>
                    </TableCell>
                    <TableCell align="right">₹{item.price * item.quantity}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => removeItem(item.id)} color="error">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Card className="mb-4">
            <CardContent>
              <Typography variant="h6">Order Summary</Typography>
              <div className="flex justify-between mt-2">
                <Typography>Total:</Typography>
                <Typography variant="h6">₹{total}</Typography>
              </div>
            </CardContent>
          </Card>

          <Button variant="contained" color="primary" size="large">
            Proceed to Checkout
          </Button>
        </>
      )}
    </div>
  );
}