import api from './api';

const orderService = {
  // Get all user orders
  getOrders: async () => {
    const response = await api.get('/orders/');
    return response.data;
  },

  // Get single order
  getOrder: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/`);
    return response.data;
  },

  // Create new order
  createOrder: async (orderData) => {
    const response = await api.post('/orders/create/', orderData);
    return response.data;
  },
};

export default orderService; 