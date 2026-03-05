import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getOrder } from '../redux/slices/orderSlice';

const OrderDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { order, isLoading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(getOrder(id));
  }, [dispatch, id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ffc107';
      case 'processing':
        return '#17a2b8';
      case 'shipped':
        return '#007bff';
      case 'delivered':
        return '#28a745';
      case 'cancelled':
        return '#dc3545';
      case 'refunded':
        return '#6c757d';
      default:
        return '#6c757d';
    }
  };

  if (isLoading || !order) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Order #{order.order_number}</h1>
        <Link to="/orders" className="btn btn-secondary">
          Back to Orders
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Order Status */}
        <div className="card">
          <h3>Order Status</h3>
          <div style={{ 
            padding: '8px 16px', 
            borderRadius: '20px', 
            backgroundColor: getStatusColor(order.status),
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'inline-block',
            marginBottom: '1rem'
          }}>
            {order.status.toUpperCase()}
          </div>
          <p><strong>Order Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
          <p><strong>Last Updated:</strong> {new Date(order.updated_at).toLocaleDateString()}</p>
        </div>

        {/* Payment Information */}
        <div className="card">
          <h3>Payment Information</h3>
          <p><strong>Method:</strong> {order.payment_method}</p>
          <p><strong>Status:</strong> {order.payment_status}</p>
          {order.transaction_id && (
            <p><strong>Transaction ID:</strong> {order.transaction_id}</p>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Order Items</h3>
        {order.items.map((item) => (
          <div key={item.id} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '1rem', 
            borderBottom: '1px solid #eee',
            gap: '1rem'
          }}>
            <img 
              src={item.product.primary_image?.image || item.product.images?.[0]?.image || '/placeholder-image.jpg'} 
              alt={item.product.name}
              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
              onError={(e) => {
                e.target.src = '/placeholder-image.jpg';
              }}
            />
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>{item.product.name}</h4>
              <p style={{ margin: '0', color: '#666' }}>
                Quantity: {item.quantity}
                {item.size && ` | Size: ${item.size}`}
                {item.color && ` | Color: ${item.color}`}
              </p>
              <p style={{ margin: '0.5rem 0 0 0', fontWeight: 'bold' }}>
                Price: ₹{item.price} each
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
                              <strong>₹{item.total}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Shipping Information */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Shipping Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h4>Shipping Address</h4>
            <p style={{ margin: '0.5rem 0' }}>
              {order.shipping_address}<br />
              {order.shipping_city}, {order.shipping_state} {order.shipping_zip_code}<br />
              {order.shipping_country}
            </p>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Phone:</strong> {order.shipping_phone}
            </p>
          </div>
          <div>
            <h4>Order Summary</h4>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Shipping:</span>
                <span>₹{order.shipping_cost}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tax:</span>
                <span>₹{order.tax}</span>
              </div>
              <hr style={{ margin: '0.5rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>Total:</span>
                <span>₹{order.total_amount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ textAlign: 'center' }}>
        <Link to="/products" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderDetail; 