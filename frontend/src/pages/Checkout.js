import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getCart, clearCart } from '../redux/slices/cartSlice';
import { createOrder } from '../redux/slices/orderSlice';
import { toast } from 'react-toastify';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.orders);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom validation function for card number (basic Luhn check)
  const validateCardNumber = (value) => {
    if (!value) return 'Card number is required';
    
    // Remove spaces and check if it's 16 digits
    const cleanValue = value.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cleanValue)) {
      return 'Please enter a valid 16-digit card number';
    }
    
    // Basic Luhn algorithm check
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanValue.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanValue[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    if (sum % 10 !== 0) {
      return 'Please enter a valid card number';
    }
    
    return true;
  };

  // Custom validation function for card expiry date
  const validateExpiryDate = (value) => {
    if (!value) return 'Expiry date is required';
    
    // Check format MM/YY
    if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(value)) {
      return 'Please enter expiry date in MM/YY format';
    }
    
    const [month, year] = value.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
    
    const expiryYear = parseInt(year);
    const expiryMonth = parseInt(month);
    
    // Check if year is in the past
    if (expiryYear < currentYear) {
      return 'Card has expired';
    }
    
    // Check if year is current but month is in the past
    if (expiryYear === currentYear && expiryMonth < currentMonth) {
      return 'Card has expired';
    }
    
    // Check if year is too far in the future (optional - you can adjust this)
    if (expiryYear > currentYear + 20) {
      return 'Please enter a valid expiry year';
    }
    
    return true;
  };

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      shipping_address: user?.address || '',
      shipping_city: user?.city || '',
      shipping_state: user?.state || '',
      shipping_zip_code: user?.zip_code || '',
      shipping_country: user?.country || 'India',
      shipping_phone: user?.phone_number || '',
      payment_method: 'stripe',
    }
  });

  useEffect(() => {
    // Ensure user is logged in
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }

    // Load cart if not already loaded
    if (!cart) {
      dispatch(getCart());
    }
  }, [dispatch, user, navigate, cart]);

  useEffect(() => {
    // Redirect to cart if cart is empty
    if (cart && cart.items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
  }, [cart, navigate]);

  const onSubmit = async (data) => {
    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    setIsSubmitting(true);
    try {
      // Remove card details from order data for security
      const { card_number, card_expiry, card_cvv, cardholder_name, ...orderData } = data;
      
      const finalOrderData = {
        ...orderData,
        subtotal: cart.total_amount,
        tax: 0, // You can calculate tax based on location
        shipping_cost: 0, // You can calculate shipping based on location
        total_amount: cart.total_amount,
      };

      console.log('Creating order with data:', finalOrderData);
      const result = await dispatch(createOrder(finalOrderData)).unwrap();
      
      // Clear the cart after successful order creation
      try {
        await dispatch(clearCart()).unwrap();
        toast.success('Order created successfully! Your cart has been cleared.');
      } catch (clearError) {
        console.warn('Failed to clear cart:', clearError);
        toast.success('Order created successfully!');
      }
      
      navigate(`/payment?order_id=${result.id}`);
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error('Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading if cart is not loaded yet
  if (!cart) {
    return (
      <div className="container">
        <div className="loading">Loading checkout...</div>
      </div>
    );
  }

  // Redirect if cart is empty
  if (cart.items.length === 0) {
    return (
      <div className="container">
        <div className="loading">Redirecting to cart...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Checkout Form */}
        <div>
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>Shipping Information</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Full Address</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Enter your complete shipping address"
                  style={{ resize: 'vertical' }}
                  {...register('shipping_address', { 
                    required: 'Address is required',
                    minLength: { value: 10, message: 'Address must be at least 10 characters' }
                  })}
                />
                {errors.shipping_address && (
                  <span style={{ color: '#dc3545', fontSize: '14px', marginTop: '0.25rem' }}>
                    {errors.shipping_address.message}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '500', marginBottom: '0.5rem' }}>City</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter city"
                    {...register('shipping_city', { 
                      required: 'City is required',
                      minLength: { value: 2, message: 'City must be at least 2 characters' }
                    })}
                  />
                  {errors.shipping_city && (
                    <span style={{ color: '#dc3545', fontSize: '14px', marginTop: '0.25rem' }}>
                      {errors.shipping_city.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '500', marginBottom: '0.5rem' }}>State</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter state"
                    {...register('shipping_state', { 
                      required: 'State is required',
                      minLength: { value: 2, message: 'State must be at least 2 characters' }
                    })}
                  />
                  {errors.shipping_state && (
                    <span style={{ color: '#dc3545', fontSize: '14px', marginTop: '0.25rem' }}>
                      {errors.shipping_state.message}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '500', marginBottom: '0.5rem' }}>PIN Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter PIN code"
                    {...register('shipping_zip_code', { 
                      required: 'PIN code is required',
                      pattern: { value: /^\d{6}$/, message: 'Please enter a valid 6-digit PIN code' }
                    })}
                  />
                  {errors.shipping_zip_code && (
                    <span style={{ color: '#dc3545', fontSize: '14px', marginTop: '0.25rem' }}>
                      {errors.shipping_zip_code.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Country</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter country"
                    {...register('shipping_country', { 
                      required: 'Country is required',
                      minLength: { value: 2, message: 'Country must be at least 2 characters' }
                    })}
                  />
                  {errors.shipping_country && (
                    <span style={{ color: '#dc3545', fontSize: '14px', marginTop: '0.25rem' }}>
                      {errors.shipping_country.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Enter phone number"
                  {...register('shipping_phone', { 
                    required: 'Phone number is required',
                    pattern: { value: /^\d{10}$/, message: 'Please enter a valid 10-digit phone number' }
                  })}
                />
                {errors.shipping_phone && (
                  <span style={{ color: '#dc3545', fontSize: '14px', marginTop: '0.25rem' }}>
                    {errors.shipping_phone.message}
                  </span>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Payment Method</label>
                <select 
                  className="form-control" 
                  {...register('payment_method')}
                >
                  <option value="stripe">Credit/Debit Card (Stripe)</option>
                  <option value="paypal">PayPal</option>
                  <option value="cod">Cash on Delivery</option>
                </select>
              </div>

              {/* Card Details Section */}
              {watch('payment_method') === 'stripe' && (
                <div style={{ 
                  padding: '1.5rem', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '8px', 
                  marginBottom: '2rem',
                  border: '1px solid #dee2e6'
                }}>
                  <h4 style={{ marginBottom: '1rem', color: '#333' }}>
                    💳 Card Information
                  </h4>
                  
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ fontWeight: '500', marginBottom: '0.5rem' }}>
                      Card Number
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      {...register('card_number', { 
                        required: watch('payment_method') === 'stripe' ? 'Card number is required' : false,
                        validate: watch('payment_method') === 'stripe' ? validateCardNumber : undefined
                      })}
                      onChange={(e) => {
                        // Auto-format card number with spaces
                        const value = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
                        e.target.value = value;
                      }}
                    />
                    {errors.card_number && (
                      <span style={{ color: '#dc3545', fontSize: '14px', marginTop: '0.25rem' }}>
                        {errors.card_number.message}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: '500', marginBottom: '0.5rem' }}>
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="MM/YY"
                        maxLength="5"
                        {...register('card_expiry', { 
                          required: watch('payment_method') === 'stripe' ? 'Expiry date is required' : false,
                          validate: watch('payment_method') === 'stripe' ? validateExpiryDate : undefined
                        })}
                        onChange={(e) => {
                          // Auto-format expiry date
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.substring(0, 2) + '/' + value.substring(2, 4);
                          }
                          e.target.value = value;
                        }}
                      />
                      {errors.card_expiry && (
                        <span style={{ color: '#dc3545', fontSize: '14px', marginTop: '0.25rem' }}>
                          {errors.card_expiry.message}
                        </span>
                      )}
                      <small style={{ color: '#666', fontSize: '12px', marginTop: '0.25rem', display: 'block' }}>
                        Current date: {new Date().toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' })}
                      </small>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: '500', marginBottom: '0.5rem' }}>
                        CVV
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="123"
                        maxLength="4"
                        {...register('card_cvv', { 
                          required: watch('payment_method') === 'stripe' ? 'CVV is required' : false,
                          pattern: { 
                            value: /^\d{3,4}$/, 
                            message: 'Please enter a valid 3 or 4-digit CVV' 
                          }
                        })}
                      />
                      {errors.card_cvv && (
                        <span style={{ color: '#dc3545', fontSize: '14px', marginTop: '0.25rem' }}>
                          {errors.card_cvv.message}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ fontWeight: '500', marginBottom: '0.5rem' }}>
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="John Doe"
                      {...register('cardholder_name', { 
                        required: watch('payment_method') === 'stripe' ? 'Cardholder name is required' : false,
                        minLength: { value: 2, message: 'Name must be at least 2 characters' }
                      })}
                    />
                    {errors.cardholder_name && (
                      <span style={{ color: '#dc3545', fontSize: '14px', marginTop: '0.25rem' }}>
                        {errors.cardholder_name.message}
                      </span>
                    )}
                  </div>

                  <div style={{ 
                    padding: '0.75rem', 
                    backgroundColor: '#d1ecf1', 
                    borderRadius: '4px', 
                    border: '1px solid #bee5eb',
                    marginTop: '1rem'
                  }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#0c5460' }}>
                      <strong>Security:</strong> Your card information is encrypted and secure. We never store your full card details.
                    </p>
                  </div>
                </div>
              )}

              {/* PayPal Notice */}
              {watch('payment_method') === 'paypal' && (
                <div style={{ 
                  padding: '1rem', 
                  backgroundColor: '#fff3cd', 
                  borderRadius: '8px', 
                  marginBottom: '2rem',
                  border: '1px solid #ffeaa7'
                }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#856404' }}>
                    <strong>PayPal:</strong> You will be redirected to PayPal to complete your payment after placing the order.
                  </p>
                </div>
              )}

              {/* Cash on Delivery Notice */}
              {watch('payment_method') === 'cod' && (
                <div style={{ 
                  padding: '1rem', 
                  backgroundColor: '#d4edda', 
                  borderRadius: '8px', 
                  marginBottom: '2rem',
                  border: '1px solid #c3e6cb'
                }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#155724' }}>
                    <strong>Cash on Delivery:</strong> Pay with cash when your order is delivered. Additional ₹50 COD fee applies.
                  </p>
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ 
                  width: '100%', 
                  padding: '1rem',
                  fontSize: '1.1rem',
                  fontWeight: '500',
                  backgroundColor: '#28a745',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                  display: 'block',
                  margin: '0 auto'
                }}
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary */}
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
                  gap: '1rem'
                }}>
                  {/* Product Image */}
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
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
                  
                  {/* Product Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ 
                      fontWeight: '500', 
                      marginBottom: '0.25rem',
                      fontSize: '14px',
                      lineHeight: '1.3',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.product.name}
                    </p>
                    <small style={{ color: '#666', fontSize: '12px' }}>
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
                      fontSize: '14px',
                      color: '#333'
                    }}>
                      ₹{(item.product.current_price * item.quantity).toFixed(2)}
                    </p>
                    <small style={{ 
                      color: '#666', 
                      fontSize: '11px',
                      textDecoration: 'line-through'
                    }}>
                      ₹{(item.product.price * item.quantity).toFixed(2)}
                    </small>
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
              marginBottom: '1rem'
            }}>
              <strong style={{ fontSize: '1.2rem' }}>Total: ₹{cart.total_amount.toFixed(2)}</strong>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#d4edda', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#155724' }}>
                <strong>Secure Checkout:</strong> Your payment information is encrypted and secure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 