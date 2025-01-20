import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { apiService } from '../../services/api.service';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState({ provider: '', trackingId: '' });
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

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await apiService.updateOrderStatus(orderId, status);
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const handleAddTracking = async () => {
    try {
      await apiService.updateOrderStatus(
        selectedOrder.id,
        'shipped',
        trackingInfo
      );
      setDialogOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Failed to add tracking:', error);
    }
  };

  return (
    <div className="p-4">
      <Typography variant="h4" className="mb-4">Orders</Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Total</TableCell>
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
                <TableCell>{order.state}</TableCell>
                <TableCell>₹{order.items.reduce((sum, item) => sum + parseFloat(item.price), 0)}</TableCell>
                <TableCell>
                  <div className="space-x-2">
                    <Button
                      variant="outlined"
                      onClick={() => handleUpdateStatus(order.id, 'processing')}
                    >
                      Process
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setSelectedOrder(order);
                        setDialogOpen(true);
                      }}
                    >
                      Add Tracking
                    </Button>
                  </div>
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
            fullWidth
            label="Shipping Provider"
            value={trackingInfo.provider}
            onChange={(e) => setTrackingInfo({ ...trackingInfo, provider: e.target.value })}
            className="mb-4"
          />
          <TextField
            fullWidth
            label="Tracking Number"
            value={trackingInfo.trackingId}
            onChange={(e) => setTrackingInfo({ ...trackingInfo, trackingId: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddTracking} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}