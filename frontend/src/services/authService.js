import api from './api';

const authService = {
  // Register user
  register: async (userData) => {
    const response = await api.post('/register/', userData);
    if (response.data) {
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Login user
  login: async (userData) => {
    const response = await api.post('/login/', userData);
    if (response.data) {
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/profile/');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    console.log('📤 Sending profile update data:', userData);
    const response = await api.put('/update/', userData);
    console.log('📥 Received profile update response:', response.data);
    if (response.data) {
      // Update localStorage with the new user data
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
};

export default authService; 