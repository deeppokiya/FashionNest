import api from './api';

const cartService = {
  // Get user's cart
  getCart: async () => {
    try {
      const response = await api.get('/cart/');
      return response.data;
    } catch (error) {
      console.error('Cart service - getCart error:', error);
      throw error;
    }
  },

  // Add item to cart
  addToCart: async (itemData) => {
    try {
      const response = await api.post('/cart/add/', itemData);
      return response.data;
    } catch (error) {
      console.error('Cart service - addToCart error:', error);
      throw error;
    }
  },

  // Update cart item quantity
  updateCartItem: async (itemId, quantity) => {
    try {
      const response = await api.put(`/cart/update/${itemId}/`, { quantity });
      return response.data;
    } catch (error) {
      console.error('Cart service - updateCartItem error:', error);
      throw error;
    }
  },

  // Remove item from cart
  removeFromCart: async (itemId) => {
    try {
      const response = await api.delete(`/cart/remove/${itemId}/`);
      return response.data;
    } catch (error) {
      console.error('Cart service - removeFromCart error:', error);
      throw error;
    }
  },

  // Clear cart
  clearCart: async () => {
    try {
      const response = await api.post('/cart/clear/');
      return response.data;
    } catch (error) {
      console.error('Cart service - clearCart error:', error);
      throw error;
    }
  },
};

export default cartService; 