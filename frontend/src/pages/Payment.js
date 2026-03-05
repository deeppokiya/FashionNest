import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import paymentService from '../services/paymentService';

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [paymentStatus, setPaymentStatus] = useState('processing');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (!orderId) {
      toast.error('No order ID provided');
      navigate('/cart');
      return;
    }

    // Process payment
    const processPayment = async () => {
      try {
        setPaymentStatus('processing');
        
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Confirm payment using simple confirmation API
        const result = await paymentService.simpleConfirmPayment(
          orderId, 
          'paypal', // Default to PayPal for demo
          `paypal_${Date.now()}` // Generate transaction ID
        );
        
        console.log('Payment confirmation result:', result);
        
        if (result.payment_status === 'completed') {
          setPaymentStatus('success');
          toast.success('Payment processed successfully!');
          
          // Wait a bit before redirecting to success page
          setTimeout(() => {
            navigate(`/payment/success?order_id=${orderId}&payment_id=${result.payment_id}`);
          }, 2000);
        } else {
          throw new Error('Payment confirmation failed');
        }
        
      } catch (error) {
        console.error('Payment processing error:', error);
        setPaymentStatus('failed');
        toast.error('Payment failed. Please try again.');
        
        setTimeout(() => {
          navigate(`/payment/failed?order_id=${orderId}`);
        }, 2000);
      } finally {
      }
    };

    processPayment();
  }, [orderId, navigate]);

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'processing':
        return 'Processing Payment...';
      case 'success':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      default:
        return 'Processing Payment...';
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'processing':
        return '⏳';
      case 'success':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'processing':
        return '#007bff';
      case 'success':
        return '#28a745';
      case 'failed':
        return '#dc3545';
      default:
        return '#007bff';
    }
  };

  return (
    <div className="container">
      <div className="card text-center" style={{ padding: '3rem', maxWidth: '600px', margin: '2rem auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            {getStatusIcon()}
          </div>
          <div className="loading" style={{ 
            fontSize: '2rem', 
            marginBottom: '1rem',
            color: getStatusColor()
          }}>
            {getStatusMessage()}
          </div>
          
          {paymentStatus === 'processing' && (
            <div style={{ 
              width: '50px', 
              height: '50px', 
              border: '4px solid #f3f3f3', 
              borderTop: '4px solid #007bff', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          )}
        </div>
        
        <p style={{ fontSize: '1.1rem', color: '#666' }}>
          {paymentStatus === 'processing' && 'Please wait while we process your payment securely.'}
          {paymentStatus === 'success' && 'Your payment has been confirmed successfully!'}
          {paymentStatus === 'failed' && 'We encountered an issue processing your payment.'}
        </p>
        
        <p style={{ fontSize: '0.9rem', color: '#999', marginTop: '1rem' }}>
          Order ID: {orderId}
        </p>
        
        {paymentStatus === 'failed' && (
          <div style={{ marginTop: '2rem' }}>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
              style={{ marginRight: '1rem' }}
            >
              Try Again
            </button>
            <button 
              onClick={() => navigate('/cart')} 
              className="btn btn-secondary"
            >
              Back to Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment; 