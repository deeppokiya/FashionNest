import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000, // Increased to 45 seconds for complex operations
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url, response.data);
    return response;
  },
  async (error) => {
    console.error('API Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
      message: error.message,
      code: error.code,
    });
    
    // Handle timeout specifically
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('Request timeout - the server took too long to respond');
      
      // For critical operations, show a more helpful error message
      const isCriticalOperation = error.config?.url?.includes('/orders/') || 
                                 error.config?.url?.includes('/payments/') ||
                                 error.config?.url?.includes('/cart/');
      
      if (isCriticalOperation) {
        return Promise.reject(new Error('The operation is taking longer than expected. Please try again in a moment.'));
      } else {
        return Promise.reject(new Error('Request timeout - please try again'));
      }
    }
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired, invalid, or insufficient permissions
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle network errors
    if (!error.response) {
      return Promise.reject(new Error('Network error - please check your connection and try again'));
    }
    
    return Promise.reject(error);
  }
);

export default api; 