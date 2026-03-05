import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../redux/slices/cartSlice';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const orderId = searchParams.get('order_id');

  const fetchOrderDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/${orderId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data);
      } else {
        setError('Failed to load order details');
      }
    } catch (err) {
      setError('Error loading order details');
      console.error('Error fetching order details:', err);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    // Clear cart after successful payment
    dispatch(clearCart());

    // If we have order details, fetch them
    if (orderId) {
      fetchOrderDetails();
    } else {
      setIsLoading(false);
    }
  }, [orderId, dispatch, fetchOrderDetails]);

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading">Loading payment confirmation...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card text-center" style={{ maxWidth: '600px', margin: '2rem auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ color: '#ffc107', marginBottom: '1rem' }}>Payment Confirmed</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            Your payment was successful, but we couldn't load the order details.
          </p>
          <p style={{ marginBottom: '2rem' }}>
            Don't worry - you'll receive an email confirmation with all the details.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/orders" className="btn btn-primary">
              View Orders
            </Link>
            <Link to="/products" className="btn btn-secondary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card text-center" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
        <h1 style={{ color: '#28a745', marginBottom: '1rem' }}>Payment Successful!</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          Thank you for your purchase. Your order has been confirmed and will be processed soon.
        </p>
        
        {orderDetails && (
          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px', 
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <h3 style={{ marginTop: 0, color: '#495057' }}>Order Details</h3>
            <p><strong>Order Number:</strong> {orderDetails.order_number}</p>
            <p><strong>Order Date:</strong> {new Date(orderDetails.created_at).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> ₹{orderDetails.total_amount}</p>
            <p><strong>Payment Status:</strong> 
              <span style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '12px',
                backgroundColor: '#d4edda',
                color: '#155724',
                marginLeft: '8px',
                fontSize: '14px'
              }}>
                {orderDetails.payment_status}
              </span>
            </p>
            <p><strong>Order Status:</strong> 
              <span style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '12px',
                backgroundColor: '#fff3cd',
                color: '#856404',
                marginLeft: '8px',
                fontSize: '14px'
              }}>
                {orderDetails.status}
              </span>
            </p>
          </div>
        )}
        
        <div style={{ marginBottom: '2rem' }}>
          <h3>What's Next?</h3>
          <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
            <li>✅ Payment confirmed</li>
            <li>📧 Email confirmation sent</li>
            <li>📦 Order will be delivered automatically in 5 minutes</li>
            <li>📧 Delivery confirmation email will be sent</li>
            <li>✍️ You can review products after delivery</li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/orders" className="btn btn-primary">
            View Orders
          </Link>
          <Link to="/products" className="btn btn-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 