import api from './api';

const paymentService = {
  // Create payment intent
  createPaymentIntent: async (orderId, paymentMethodId = null) => {
    const response = await api.post('/payments/create-intent/', {
      order_id: orderId,
      payment_method_id: paymentMethodId,
    });
    return response.data;
  },

  // Confirm payment
  confirmPayment: async (paymentIntentId, orderId) => {
    const response = await api.post('/payments/confirm/', {
      payment_intent_id: paymentIntentId,
      order_id: orderId,
    });
    return response.data;
  },

  // Simple payment confirmation (for PayPal and other methods)
  simpleConfirmPayment: async (orderId, paymentMethod, transactionId = null) => {
    const response = await api.post('/payments/simple-confirm/', {
      order_id: orderId,
      payment_method: paymentMethod,
      transaction_id: transactionId,
    });
    return response.data;
  },

  // Check payment status
  checkPaymentStatus: async (orderId) => {
    const response = await api.get(`/payments/check-status/${orderId}/`);
    return response.data;
  },

  // Get payment details
  getPayment: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}/`);
    return response.data;
  },

  // Get all payments
  getPayments: async () => {
    const response = await api.get('/payments/');
    return response.data;
  },

  // Refund payment
  refundPayment: async (paymentId) => {
    const response = await api.post(`/payments/${paymentId}/refund/`);
    return response.data;
  },
};

export default paymentService; 