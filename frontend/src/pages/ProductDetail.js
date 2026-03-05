import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { getProduct, createReview } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { toast } from 'react-toastify';
import productService from '../services/productService';

const ProductDetail = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { product, isLoading } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [checkingPurchaseStatus, setCheckingPurchaseStatus] = useState(false);
  const [quantityError, setQuantityError] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    dispatch(getProduct(slug));
  }, [dispatch, slug]);

  // Check if user can review this product
  useEffect(() => {
    const checkReviewStatus = async () => {
      if (isAuthenticated && product) {
        setCheckingPurchaseStatus(true);
        try {
          // Check review status instead of just purchase status
          const response = await productService.checkReviewStatus(slug);
          setCanReview(response.can_review);
          setHasReviewed(response.has_reviewed);
        } catch (error) {
          console.error('Error checking review status:', error);
          setCanReview(false);
          setHasReviewed(false);
        } finally {
          setCheckingPurchaseStatus(false);
        }
      } else {
        setCanReview(false);
        setHasReviewed(false);
      }
    };

    checkReviewStatus();
  }, [isAuthenticated, product, slug]);

  // Validate quantity against stock
  const validateQuantity = (newQuantity) => {
    if (!product) return true;
    
    if (newQuantity > product.stock_quantity) {
      setQuantityError(`Selected quantity (${newQuantity}) exceeds available stock (${product.stock_quantity}). Please select a quantity less than or equal to ${product.stock_quantity}.`);
      return false;
    } else {
      setQuantityError('');
      return true;
    }
  };



  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    
    if (validateQuantity(newQuantity)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes.length > 0) {
      toast.error('Please select a size');
      return;
    }
    if (!selectedColor && product.colors.length > 0) {
      toast.error('Please select a color');
      return;
    }

    // Final validation before adding to cart
    if (!validateQuantity(quantity)) {
      toast.error(quantityError);
      return;
    }

    dispatch(addToCart({
      product: product.id,
      quantity,
      size: selectedSize,
      color: selectedColor,
    }));
    toast.success('Product added to cart!');
  };

  const handleReviewSubmit = async (data) => {
    try {
      await dispatch(createReview({ productSlug: slug, reviewData: data })).unwrap();
      reset();
      toast.success('Review submitted successfully! Reviews cannot be edited once submitted.');
      
      // Update local state to reflect that user has reviewed
      setHasReviewed(true);
      setCanReview(false);
      
      // Refresh product data to get updated reviews
      dispatch(getProduct(slug));
    } catch (error) {
      toast.error(error || 'Failed to submit review. Please try again.');
    }
  };

  if (isLoading || !product) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  const images = product.images || [];
  const primaryImage = images.find(img => img.is_primary) || images[0];

  return (
    <div className="container">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
        {/* Product Images */}
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <img 
              src={images[activeImage]?.image || primaryImage?.image || '/placeholder-image.jpg'} 
              alt={product.name}
              style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '8px' }}
              onError={(e) => {
                e.target.src = '/placeholder-image.jpg';
              }}
            />
          </div>
          
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
              {images.map((image, index) => (
                <img 
                  key={image.id}
                  src={image.image} 
                  alt={`${product.name} ${index + 1}`}
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    objectFit: 'cover', 
                    borderRadius: '4px',
                    cursor: 'pointer',
                    border: activeImage === index ? '2px solid #007bff' : '1px solid #ddd'
                  }}
                  onClick={() => setActiveImage(index)}
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1>{product.name}</h1>
          <p style={{ color: '#666', marginBottom: '1rem' }}>{product.brand}</p>
          
          <div style={{ marginBottom: '1rem' }}>
            <div className="product-rating" style={{ fontSize: '1.2rem' }}>
              {(() => {
                const rating = parseFloat(product.rating) || 0;
                const numReviews = product.num_reviews || 0;
                return (
                  <>
                    {'★'.repeat(Math.floor(rating))}
                    {'☆'.repeat(5 - Math.floor(rating))}
                    <span style={{ marginLeft: '8px', fontSize: '1rem', color: '#666' }}>
                      ({numReviews} reviews)
                    </span>
                  </>
                );
              })()}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            {product.is_on_sale ? (
              <div>
                <span style={{ 
                  textDecoration: 'line-through', 
                  color: '#666', 
                  fontSize: '1.2rem',
                  marginRight: '10px'
                }}>
                  ₹{product.price}
                </span>
                <span style={{ 
                  color: '#dc3545', 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold' 
                }}>
                  ₹{product.current_price}
                </span>
                <span style={{ 
                  backgroundColor: '#dc3545', 
                  color: 'white', 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  fontSize: '0.8rem',
                  marginLeft: '10px'
                }}>
                  SALE
                </span>
              </div>
            ) : (
              <span style={{ 
                color: '#333', 
                fontSize: '1.5rem', 
                fontWeight: 'bold' 
              }}>
                ₹{product.current_price}
              </span>
            )}
          </div>

          <p style={{ marginBottom: '2rem', lineHeight: '1.6' }}>{product.description}</p>

          {/* Selection Instructions */}
          {(product.sizes.length > 0 || product.colors.length > 0) && (
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#e3f2fd', 
              borderRadius: '8px', 
              marginBottom: '2rem',
              border: '1px solid #2196f3'
            }}>
              <p style={{ margin: 0, color: '#1565c0', fontSize: '14px' }}>
                <strong>📋 Please select your preferred options before adding to cart:</strong>
              </p>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes.length > 0 && (
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: '600', marginBottom: '0.75rem' }}>
                Size <span style={{ color: '#dc3545' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    style={{
                      padding: '12px 20px',
                      border: selectedSize === size ? '2px solid #007bff' : '1px solid #ddd',
                      borderRadius: '8px',
                      background: selectedSize === size ? '#007bff' : 'white',
                      color: selectedSize === size ? 'white' : '#333',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      minWidth: '60px'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedSize !== size) {
                        e.target.style.borderColor = '#007bff';
                        e.target.style.backgroundColor = '#f8f9fa';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedSize !== size) {
                        e.target.style.borderColor = '#ddd';
                        e.target.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {!selectedSize && (
                <p style={{ color: '#dc3545', fontSize: '14px', marginTop: '0.5rem' }}>
                  Please select a size
                </p>
              )}
            </div>
          )}

          {/* Color Selection */}
          {product.colors.length > 0 && (
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: '600', marginBottom: '0.75rem' }}>
                Color <span style={{ color: '#dc3545' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    style={{
                      padding: '12px 20px',
                      border: selectedColor === color ? '2px solid #007bff' : '1px solid #ddd',
                      borderRadius: '8px',
                      background: selectedColor === color ? '#007bff' : 'white',
                      color: selectedColor === color ? 'white' : '#333',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      minWidth: '60px'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedColor !== color) {
                        e.target.style.borderColor = '#007bff';
                        e.target.style.backgroundColor = '#f8f9fa';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedColor !== color) {
                        e.target.style.borderColor = '#ddd';
                        e.target.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    {color}
                  </button>
                ))}
              </div>
              {!selectedColor && (
                <p style={{ color: '#dc3545', fontSize: '14px', marginTop: '0.5rem' }}>
                  Please select a color
                </p>
              )}
            </div>
          )}

          {/* Quantity */}
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Quantity</label>
            

            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={() => handleQuantityChange(quantity - 1)}
                className="quantity-btn"
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span style={{ 
                minWidth: '40px', 
                textAlign: 'center', 
                fontSize: '16px', 
                fontWeight: '500',
                color: quantityError ? '#dc3545' : '#333'
              }}>
                {quantity}
              </span>
              <button 
                onClick={() => handleQuantityChange(quantity + 1)}
                className="quantity-btn"
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
                disabled={quantity >= product.stock_quantity}
              >
                +
              </button>
            </div>
            {quantityError && (
              <p style={{ color: '#dc3545', fontSize: '14px', marginTop: '0.5rem' }}>
                {quantityError}
              </p>
            )}
            <p style={{ fontSize: '14px', color: '#666', marginTop: '0.5rem' }}>
              Stock: {product.stock_quantity} available
            </p>
          </div>

          <button 
            onClick={handleAddToCart}
            className="btn btn-primary"
            style={{ 
              width: '100%', 
              marginBottom: '1rem',
              padding: '1rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              borderRadius: '8px'
            }}
            disabled={product.stock_quantity === 0 || quantity > product.stock_quantity}
          >
            {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>

          <p style={{ fontSize: '14px', color: '#666' }}>
            Stock: {product.stock_quantity} available
          </p>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="card">
        <h3>Customer Reviews</h3>
        
        {product.reviews && product.reviews.length > 0 ? (
          <div>
            {product.reviews.map((review) => (
              <div key={review.id} style={{ borderBottom: '1px solid #eee', padding: '1rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div>
                  <strong>{review.user_name}</strong>
                    {review.verified_badge && (
                      <span style={{ 
                        marginLeft: '8px', 
                        fontSize: '12px', 
                        color: '#28a745', 
                        backgroundColor: '#d4edda', 
                        padding: '2px 6px', 
                        borderRadius: '4px' 
                      }}>
                        {review.verified_badge}
                      </span>
                    )}
                  </div>
                  <span className="product-rating">
                    {(() => {
                      const rating = parseInt(review.rating) || 0;
                      return (
                        <>
                          {'★'.repeat(rating)}
                          {'☆'.repeat(5 - rating)}
                        </>
                      );
                    })()}
                  </span>
                </div>
                <h4 style={{ marginBottom: '0.5rem' }}>{review.title}</h4>
                <p>{review.comment}</p>
                <small style={{ color: '#666' }}>
                  {new Date(review.created_at).toLocaleDateString()}
                </small>
              </div>
            ))}
          </div>
        ) : (
          <p>No reviews yet. Be the first to review this product!</p>
        )}

        {/* Review Form - Only show if user can review */}
        {isAuthenticated ? (
          hasReviewed ? (
            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
              <h4>Write a Review</h4>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#d4edda', 
                borderRadius: '8px', 
                border: '1px solid #c3e6cb',
                color: '#155724'
              }}>
                <p style={{ marginBottom: '0.5rem', fontSize: '14px' }}>
                  ✅ <strong>Review Submitted</strong>
                </p>
                <p style={{ fontSize: '14px', marginBottom: '0' }}>
                  You have already submitted a review for this product. Reviews cannot be edited or resubmitted.
                </p>
              </div>
            </div>
          ) : canReview ? (
            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
              <h4>Write a Review</h4>
              <p style={{ color: '#666', marginBottom: '1rem', fontSize: '14px' }}>
                ✅ You can review this product because you have purchased and received it.
              </p>
              <p style={{ color: '#dc3545', marginBottom: '1rem', fontSize: '14px' }}>
                ⚠️ <strong>Important:</strong> Reviews can only be submitted once and cannot be edited later.
              </p>
              <form onSubmit={handleSubmit(handleReviewSubmit)}>
                <div className="form-group">
                  <label className="form-label">Rating <span style={{ color: '#dc3545' }}>*</span></label>
                  <select className="form-control" {...register('rating', { required: 'Rating is required' })}>
                    <option value="">Select rating</option>
                    <option value="5">5 stars - Excellent</option>
                    <option value="4">4 stars - Very Good</option>
                    <option value="3">3 stars - Good</option>
                    <option value="2">2 stars - Fair</option>
                    <option value="1">1 star - Poor</option>
                  </select>
                  {errors.rating && <span style={{ color: 'red', fontSize: '14px' }}>{errors.rating.message}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Title <span style={{ color: '#dc3545' }}>*</span></label>
                  <input 
                    type="text" 
                    className="form-control" 
                    {...register('title', { required: 'Title is required' })}
                  />
                  {errors.title && <span style={{ color: 'red', fontSize: '14px' }}>{errors.title.message}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Comment <span style={{ color: '#dc3545' }}>*</span></label>
                  <textarea 
                    className="form-control" 
                    rows="4"
                    {...register('comment', { required: 'Comment is required' })}
                  />
                  {errors.comment && <span style={{ color: 'red', fontSize: '14px' }}>{errors.comment.message}</span>}
                </div>

                <button type="submit" className="btn btn-primary">
                  Submit Review
                </button>
              </form>
            </div>
          ) : (
            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
              <h4>Write a Review</h4>
              {checkingPurchaseStatus ? (
                <p style={{ color: '#666', fontSize: '14px' }}>Checking review eligibility...</p>
              ) : (
                <div style={{ 
                  padding: '1rem', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '8px', 
                  border: '1px solid #dee2e6' 
                }}>
                  <p style={{ color: '#666', marginBottom: '0.5rem', fontSize: '14px' }}>
                    📝 <strong>Review this product</strong>
                  </p>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '0' }}>
                    You can only review products that you have purchased and received. 
                    Once your order is delivered, you'll be able to share your experience here.
                  </p>
                </div>
              )}
            </div>
          )
        ) : (
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
            <h4>Write a Review</h4>
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px', 
              border: '1px solid #dee2e6' 
            }}>
              <p style={{ color: '#666', marginBottom: '0.5rem', fontSize: '14px' }}>
                🔐 <strong>Login to review</strong>
              </p>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '0' }}>
                Please <a href="/login" style={{ color: '#007bff', textDecoration: 'underline' }}>login</a> to write a review. 
                You can only review products that you have purchased and received.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail; 