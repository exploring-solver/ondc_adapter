import { useState, useEffect } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip
} from '@mui/material';
import { apiService } from '../../services/api.service';

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState({
    provider: '',
    trackingId: ''
  });

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

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await apiService.updateOrderStatus(orderId, status);
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const handleTrackingSubmit = async () => {
    try {
      await apiService.updateOrderStatus(
        selectedOrder.id,
        'shipped',
        trackingInfo
      );
      setDialogOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Failed to update tracking info:', error);
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
      <Typography variant="h4" className="mb-6">Orders</Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Items</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>
                  {order.billing.first_name} {order.billing.last_name}
                </TableCell>
                <TableCell>
                  {order.items.map(item => (
                    <div key={item.id}>
                      {item.name} x {item.quantity}
                    </div>
                  ))}
                </TableCell>
                <TableCell align="right">
                  ₹{order.items.reduce((sum, item) => sum + parseFloat(item.price), 0)}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={order.state}
                    color={getStatusColor(order.state)}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    className="mr-2"
                    onClick={() => handleStatusUpdate(order.id, 'processing')}
                  >
                    Process
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setSelectedOrder(order);
                      setDialogOpen(true);
                    }}
                  >
                    Add Tracking
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Add Tracking Information</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Shipping Provider"
            value={trackingInfo.provider}
            onChange={(e) => setTrackingInfo({ ...trackingInfo, provider: e.target.value })}
            className="mb-4 mt-4"
          >
            <MenuItem value="fedex">FedEx</MenuItem>
            <MenuItem value="dhl">DHL</MenuItem>
            <MenuItem value="ups">UPS</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Tracking Number"
            value={trackingInfo.trackingId}
            onChange={(e) => setTrackingInfo({ ...trackingInfo, trackingId: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleTrackingSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}