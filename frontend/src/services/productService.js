import api from './api';

const productService = {
  // Get all products with optional filters
  getProducts: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    const response = await api.get(`/products/?${params.toString()}`);
    return response.data.results || response.data;
  },

  // Get single product by slug
  getProduct: async (slug) => {
    const response = await api.get(`/products/${slug}/`);
    return response.data;
  },

  // Get all categories
  getCategories: async () => {
    const response = await api.get('/categories/');
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async () => {
    const response = await api.get('/products/featured/');
    return response.data;
  },

  // Get sale products
  getSaleProducts: async () => {
    const response = await api.get('/products/sale/');
    return response.data;
  },

  // Create review for a product
  createReview: async (productSlug, reviewData) => {
    const response = await api.post(`/products/${productSlug}/reviews/`, reviewData);
    return response.data;
  },

  // Get reviews for a product
  getReviews: async (productSlug) => {
    const response = await api.get(`/products/${productSlug}/reviews/`);
    return response.data;
  },

  // Check if user has purchased and received the product
  checkPurchaseStatus: async (productSlug) => {
    const response = await api.get(`/products/${productSlug}/check-purchase/`);
    return response.data;
  },

  // Check if user can review this product
  checkReviewStatus: async (productSlug) => {
    const response = await api.get(`/products/${productSlug}/check-review/`);
    return response.data;
  },
};

export default productService; 