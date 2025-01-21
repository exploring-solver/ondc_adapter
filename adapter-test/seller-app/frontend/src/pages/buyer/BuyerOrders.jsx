import { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { apiService } from '../../services/api.service';

export default function BuyerOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await apiService.getOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <div>
      <Typography variant="h4" className="mb-6">My Orders</Typography>

      <Grid container spacing={3}>
        {orders.map((order) => (
          <Grid item xs={12} key={order.id}>
            <Card>
              <CardContent>
                <div className="flex justify-between mb-4">
                  <Typography variant="h6">Order #{order.id}</Typography>
                  <Chip 
                    label={order.state}
                    color={getStatusColor(order.state)}
                  />
                </div>

                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <Typography>{item.name}</Typography>
                      <div className="text-right">
                        <Typography>Quantity: {item.quantity}</Typography>
                        <Typography>₹{item.price}</Typography>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between">
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6">
                      ₹{order.items.reduce((sum, item) => sum + parseFloat(item.price), 0)}
                    </Typography>
                  </div>
                </div>

                <Button 
                  variant="outlined"
                  className="mt-4"
                  onClick={() => {
                    setSelectedOrder(order);
                    setDialogOpen(true);
                  }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>Order Details #{selectedOrder.id}</DialogTitle>
            <DialogContent>
              <Typography variant="h6" className="mb-4">Shipping Address</Typography>
              <Typography>
                {selectedOrder.fulfillment.shipping.address_1}<br />
                {selectedOrder.fulfillment.shipping.city}, {selectedOrder.fulfillment.shipping.state}<br />
                {selectedOrder.fulfillment.shipping.postcode}
              </Typography>

              {selectedOrder.fulfillment.tracking && (
                <div className="mt-4">
                  <Typography variant="h6" className="mb-2">Tracking Information</Typography>
                  <Typography>
                    Provider: {selectedOrder.fulfillment.tracking.provider}<br />
                    Tracking ID: {selectedOrder.fulfillment.tracking.number}
                  </Typography>
                </div>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}