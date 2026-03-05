import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { getOrders } from '../redux/slices/orderSlice';

const OrderHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, isLoading, isError, message } = useSelector((state) => state.orders);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(getOrders());
  }, [dispatch, isAuthenticated, navigate]);

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

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container">
        <div className="card text-center">
          <h3>Error Loading Orders</h3>
          <p>{message || 'There was an error loading your orders. Please try again.'}</p>
          <div className="mt-4">
            <button 
              onClick={() => dispatch(getOrders())} 
              className="btn btn-primary mr-2"
            >
              Retry
            </button>
            <Link to="/login" className="btn btn-secondary">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Order History</h1>

      {!Array.isArray(orders) || orders.length === 0 ? (
        <div className="card text-center">
          <h3>No Orders Yet</h3>
          <p>You haven't placed any orders yet.</p>
          <Link to="/products" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div>
          {Array.isArray(orders) && orders.map((order) => (
            <div key={order.id} className="card" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3>Order #{order.order_number}</h3>
                  <p style={{ color: '#666', margin: '0' }}>
                    Placed on {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    backgroundColor: getStatusColor(order.status),
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {order.status.toUpperCase()}
                  </div>
                  <p style={{ margin: '0.5rem 0 0 0', fontWeight: 'bold' }}>
                    ₹{order.total_amount}
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong>Items:</strong>
                <div style={{ marginTop: '0.5rem' }}>
                  {order.items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span>
                        {item.product.name} x {item.quantity}
                        {item.size && ` (Size: ${item.size})`}
                        {item.color && ` (Color: ${item.color})`}
                      </span>
                      <span>₹{item.total}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <strong>Shipping Address:</strong>
                  <p style={{ margin: '0.25rem 0', fontSize: '14px' }}>
                    {order.shipping_address}<br />
                    {order.shipping_city}, {order.shipping_state} {order.shipping_zip_code}<br />
                    {order.shipping_country}
                  </p>
                </div>
                <div>
                  <strong>Payment:</strong>
                  <p style={{ margin: '0.25rem 0', fontSize: '14px' }}>
                    Method: {order.payment_method}<br />
                    Status: {order.payment_status}<br />
                    {order.transaction_id && `Transaction: ${order.transaction_id}`}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>Total: ₹{order.total_amount}</strong>
                </div>
                <Link to={`/orders/${order.id}`} className="btn btn-primary">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory; 