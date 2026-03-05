import React from 'react';
import { Link } from 'react-router-dom';

const PaymentFailed = () => {
  return (
    <div className="container">
      <div className="card text-center" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
        <h1 style={{ color: '#dc3545', marginBottom: '1rem' }}>Payment Failed</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          We're sorry, but your payment could not be processed. Please try again or contact support if the problem persists.
        </p>
        
        <div style={{ marginBottom: '2rem' }}>
          <p>Possible reasons for payment failure:</p>
          <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
            <li>Insufficient funds</li>
            <li>Invalid card information</li>
            <li>Card expired</li>
            <li>Bank declined the transaction</li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/checkout" className="btn btn-primary">
            Try Again
          </Link>
          <Link to="/cart" className="btn btn-secondary">
            Back to Cart
          </Link>
          <Link to="/products" className="btn btn-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed; 