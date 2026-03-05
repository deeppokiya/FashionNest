import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleAddToCart = () => {
    if (!user) {
      toast.info('Please login to add items to cart');
      navigate('/login');
      return;
    }
    
    // Redirect to product detail page for size and color selection
    navigate(`/products/${product.slug}`);
    toast.info('Please select size and color on the product page');
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <Link to={`/products/${product.slug}`}>
          <img 
            src={product.primary_image?.image || product.image || 'https://via.placeholder.com/300x400?text=Product+Image'} 
            alt={product.name}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x400?text=Product+Image';
            }}
          />
        </Link>
        {product.sale_price && (
          <div className="sale-badge">
            {Math.round(((product.price - product.sale_price) / product.price) * 100)}% OFF
          </div>
        )}
      </div>
      
      <div className="product-info">
        <h3 className="product-title">
          <Link to={`/products/${product.slug}`}>
            {product.name}
          </Link>
        </h3>
        
        <div className="product-price">
          {product.sale_price ? (
            <>
              <span className="original-price">₹{product.price}</span>
              <span className="sale-price">₹{product.sale_price}</span>
            </>
          ) : (
            <span className="price">₹{product.price}</span>
          )}
        </div>
        
        <div className="product-actions">
          <button 
            className="btn btn-primary btn-sm"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 