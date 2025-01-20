import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:3001';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Buyer Methods
  async searchCatalog(searchParams) {
    return await this.api.post('/buyer/search', searchParams);
  }

  async selectItem(itemId) {
    return await this.api.post('/buyer/select', { itemId });
  }

  async placeOrder(orderDetails) {
    return await this.api.post('/buyer/order', orderDetails);
  }

  // Seller Methods
  async getProducts() {
    return await this.api.get('/seller/products');
  }

  async updateProduct(productId, data) {
    return await this.api.put(`/seller/products/${productId}`, data);
  }

  async getOrders() {
    return await this.api.get('/seller/orders');
  }

  async updateOrderStatus(orderId, status, trackingInfo) {
    return await this.api.put(`/seller/orders/${orderId}`, { status, trackingInfo });
  }
}

export const apiService = new ApiService();