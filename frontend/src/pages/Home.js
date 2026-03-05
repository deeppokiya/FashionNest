import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getFeaturedProducts, getSaleProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const dispatch = useDispatch();
  const { featuredProducts, saleProducts, isLoading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(getFeaturedProducts());
    dispatch(getSaleProducts());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Hero Section */}
      <section style={{ 
        background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: 'white',
        padding: '6rem 2rem',
        borderRadius: '15px',
        marginBottom: '3rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h1 style={{ 
            fontSize: '3.5rem', 
            marginBottom: '1.5rem',
            fontWeight: '700',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
            letterSpacing: '1px'
          }}>
            Welcome to FashionNest
          </h1>
          <p style={{ 
            fontSize: '1.3rem', 
            marginBottom: '2.5rem',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
            lineHeight: '1.6'
          }}>
            Discover the latest trends and timeless classics in fashion. 
            Elevate your style with our curated collection of premium clothing and accessories.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link 
              to="/products" 
              className="btn btn-primary" 
              style={{ 
                fontSize: '1.1rem', 
                padding: '15px 30px',
                backgroundColor: '#ff6b6b',
                border: 'none',
                borderRadius: '25px',
                textDecoration: 'none',
                color: 'white',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.3)';
              }}
            >
              Shop Now
            </Link>
            <Link 
              to="/products?sale=true" 
              className="btn btn-outline-light" 
              style={{ 
                fontSize: '1.1rem', 
                padding: '15px 30px',
                border: '2px solid white',
                borderRadius: '25px',
                textDecoration: 'none',
                color: 'white',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                backgroundColor: 'transparent'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = '#333';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'white';
              }}
            >
              View Sales
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '100px',
          height: '100px',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          animation: 'pulse 2s infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          width: '60px',
          height: '60px',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          animation: 'pulse 3s infinite'
        }}></div>
      </section>

      {/* Featured Products */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Featured Products</h2>
        <div className="product-grid">
          {featuredProducts && featuredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link 
            to="/products" 
            className="btn btn-primary"
            style={{ 
              textDecoration: 'none',
              fontSize: '1.1rem',
              padding: '12px 30px',
              fontWeight: '600',
              borderRadius: '25px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0, 123, 255, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(0, 123, 255, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(0, 123, 255, 0.3)';
            }}
          >
            View All Products
          </Link>
        </div>
      </section>

      {/* Sale Products */}
      {saleProducts && saleProducts.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>On Sale</h2>
                  <div className="product-grid">
          {saleProducts && saleProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link 
              to="/products?sale=true" 
              className="btn btn-danger"
              style={{ 
                textDecoration: 'none',
                fontSize: '1.1rem',
                padding: '12px 30px',
                fontWeight: '600',
                borderRadius: '25px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(220, 53, 69, 0.3)';
              }}
            >
              View All Sales
            </Link>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2.5rem', fontWeight: '600' }}>Shop by Category</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem' 
        }}>
          <div className="card" style={{ 
            textAlign: 'center', 
            overflow: 'hidden',
            borderRadius: '15px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
          }}>
            <div style={{
              height: '200px',
              background: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('https://images.unsplash.com/photo-1617137968427-85924c800a22?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <h3 style={{ fontSize: '2rem', fontWeight: '700', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>Men's Fashion</h3>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ marginBottom: '1.5rem', color: '#666', fontSize: '1.1rem' }}>Discover stylish clothing for men</p>
              <Link 
                to="/products?gender=M" 
                className="btn btn-primary" 
                style={{ 
                  backgroundColor: '#4ecdc4',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '12px 25px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(78, 205, 196, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(78, 205, 196, 0.4)';
                  e.target.style.backgroundColor = '#3db8b0';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(78, 205, 196, 0.3)';
                  e.target.style.backgroundColor = '#4ecdc4';
                }}
              >
                Shop Men
              </Link>
            </div>
          </div>
          
          <div className="card" style={{ 
            textAlign: 'center', 
            overflow: 'hidden',
            borderRadius: '15px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
          }}>
            <div style={{
              height: '200px',
              background: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <h3 style={{ fontSize: '2rem', fontWeight: '700', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>Women's Fashion</h3>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ marginBottom: '1.5rem', color: '#666', fontSize: '1.1rem' }}>Explore trendy women's clothing</p>
              <Link 
                to="/products?gender=F" 
                className="btn btn-primary" 
                style={{ 
                  backgroundColor: '#ff6b9d',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '12px 25px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(255, 107, 157, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(255, 107, 157, 0.4)';
                  e.target.style.backgroundColor = '#ff5a8a';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 157, 0.3)';
                  e.target.style.backgroundColor = '#ff6b9d';
                }}
              >
                Shop Women
              </Link>
            </div>
          </div>
          
          <div className="card" style={{ 
            textAlign: 'center', 
            overflow: 'hidden',
            borderRadius: '15px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
          }}>
            <div style={{
              height: '200px',
              background: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('https://images.unsplash.com/photo-1523170335258-f5ed11844a49?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <h3 style={{ fontSize: '2rem', fontWeight: '700', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>Accessories</h3>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ marginBottom: '1.5rem', color: '#666', fontSize: '1.1rem' }}>Complete your look with accessories</p>
              <Link 
                to="/products?category=accessories" 
                className="btn btn-primary" 
                style={{ 
                  backgroundColor: '#667eea',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '12px 25px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                  e.target.style.backgroundColor = '#5a6fd8';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                  e.target.style.backgroundColor = '#667eea';
                }}
              >
                Shop Accessories
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 