import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCart, updateCartItem, removeFromCart, clearCart } from '../redux/slices/cartSlice';
import { toast } from 'react-toastify';

const Cart = () => {
  const dispatch = useDispatch();
  const { cart, isLoading, isError, message } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }
    
    try {
      await dispatch(updateCartItem({ itemId, quantity: newQuantity })).unwrap();
      toast.success('Cart updated successfully');
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update cart. Please try again.');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await dispatch(removeFromCart(itemId)).unwrap();
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item. Please try again.');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await dispatch(clearCart()).unwrap();
        toast.success('Cart cleared successfully');
      } catch (error) {
        console.error('Error clearing cart:', error);
        toast.error('Failed to clear cart. Please try again.');
      }
    }
  };

  const handleRetry = () => {
    dispatch(getCart());
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading">Loading cart...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container">
        <div className="card text-center" style={{ maxWidth: '600px', margin: '2rem auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
          <h3>Error Loading Cart</h3>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            {message || 'There was an error loading your cart. This might be due to a network timeout or server issue.'}
          </p>
          
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '14px', color: '#999' }}>
              Common causes:
            </p>
            <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto', fontSize: '14px', color: '#666' }}>
              <li>Slow internet connection</li>
              <li>Server temporarily unavailable</li>
              <li>Authentication token expired</li>
              <li>Network timeout</li>
            </ul>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={handleRetry} 
              className="btn btn-primary"
              style={{ marginRight: '1rem' }}
            >
              Try Again
            </button>
            <Link to="/products" className="btn btn-secondary">
              Continue Shopping
            </Link>
            <Link to="/login" className="btn btn-outline-secondary">
              Login Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container">
        <div className="card text-center" style={{ maxWidth: '600px', margin: '2rem auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
          <h2>Your Cart is Empty</h2>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link to="/products" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Your Cart</h1>
        <button 
          onClick={handleClearCart} 
          className="btn btn-outline-danger"
          style={{ fontSize: '14px' }}
        >
          Clear Cart
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Cart Items */}
        <div>
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>Cart Items</h3>
            
            {cart.items.map((item) => (
              <div key={item.id} style={{ 
                display: 'flex', 
                gap: '1rem', 
                padding: '1rem', 
                border: '1px solid #e9ecef', 
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  flexShrink: 0,
                  borderRadius: '6px',
                  overflow: 'hidden',
                  backgroundColor: '#fff',
                  border: '1px solid #e9ecef'
                }}>
                  <img 
                    src={item.product.primary_image?.image || item.product.image || '/placeholder-image.jpg'} 
                    alt={item.product.name}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                </div>
                
                <div style={{ flex: 1 }}>
                  <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>{item.product.name}</h4>
                  <p style={{ color: '#666', marginBottom: '0.5rem' }}>
                    Price: ₹{item.product.current_price}
                  </p>
                  {item.size && (
                    <p style={{ color: '#666', marginBottom: '0.5rem' }}>
                      Size: {item.size}
                    </p>
                  )}
                  {item.color && (
                    <p style={{ color: '#666', marginBottom: '0.5rem' }}>
                      Color: {item.color}
                    </p>
                  )}
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="btn btn-sm btn-outline-secondary"
                        style={{ width: '30px', height: '30px', padding: 0 }}
                      >
                        -
                      </button>
                      <span style={{ minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="btn btn-sm btn-outline-secondary"
                        style={{ width: '30px', height: '30px', padding: 0 }}
                      >
                        +
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="btn btn-sm btn-outline-danger"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: '500', fontSize: '1.1rem' }}>
                    ₹{(item.product.current_price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Summary */}
        <div>
          <div className="cart-summary" style={{ position: 'sticky', top: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>Order Summary</h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              {cart.items.map((item) => (
                <div key={item.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  gap: '0.75rem'
                }}>
                  {/* Product Image */}
                  <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    flexShrink: 0,
                    borderRadius: '4px',
                    overflow: 'hidden',
                    backgroundColor: '#fff',
                    border: '1px solid #e9ecef'
                  }}>
                    <img 
                      src={item.product.primary_image?.image || item.product.image || '/placeholder-image.jpg'} 
                      alt={item.product.name}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                  
                  {/* Product Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ 
                      fontWeight: '500', 
                      marginBottom: '0.25rem',
                      fontSize: '13px',
                      lineHeight: '1.3',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.product.name}
                    </p>
                    <small style={{ color: '#666', fontSize: '11px' }}>
                      Qty: {item.quantity}
                      {item.size && ` | Size: ${item.size}`}
                      {item.color && ` | Color: ${item.color}`}
                    </small>
                  </div>
                  
                  {/* Price */}
                  <div style={{ 
                    textAlign: 'right',
                    flexShrink: 0
                  }}>
                    <p style={{ 
                      fontWeight: '600', 
                      margin: 0,
                      fontSize: '13px',
                      color: '#333'
                    }}>
                      ₹{(item.product.current_price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <hr style={{ margin: '1.5rem 0' }} />
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span>Subtotal:</span>
                <span>₹{cart.total_amount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span>Shipping:</span>
                <span>₹0.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span>Tax:</span>
                <span>₹0.00</span>
              </div>
            </div>
            
            <div className="cart-total" style={{ 
              padding: '1rem',
              backgroundColor: '#e9ecef',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '1.5rem'
            }}>
              <strong style={{ fontSize: '1.2rem' }}>Total: ₹{cart.total_amount.toFixed(2)}</strong>
            </div>

            <Link 
              to="/checkout" 
              className="btn btn-primary" 
              style={{ 
                width: '100%', 
                padding: '1.2rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                backgroundColor: '#007bff',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                textDecoration: 'none',
                display: 'block',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                marginBottom: '1rem'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#0056b3';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#007bff';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Proceed to Checkout
            </Link>



            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#d4edda', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#155724' }}>
                <strong>Free Shipping:</strong> Orders over ₹500 qualify for free shipping.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 