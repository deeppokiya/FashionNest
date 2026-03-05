import React, { useEffect, useState } from 'react';
import productService from '../services/productService';

const TestPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getFeaturedProducts();
        console.log('API Response:', data);
        setProducts(data);
      } catch (err) {
        console.error('API Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Page - API Response</h1>
      <h2>Featured Products ({products.length})</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {products.map((product) => (
          <div key={product.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
            <h3>{product.name}</h3>
                            <p>Price: ₹{product.price}</p>
            <p>Brand: {product.brand}</p>
            <p>Gender: {product.gender}</p>
            <p>Featured: {product.is_featured ? 'Yes' : 'No'}</p>
            {product.primary_image && (
              <img 
                src={product.primary_image.image} 
                alt={product.name}
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x400?text=Product+Image';
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestPage; 