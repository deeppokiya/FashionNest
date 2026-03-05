import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../redux/slices/productSlice';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    gender: searchParams.get('gender') || '',
    brand: searchParams.get('brand') || '',
    search: searchParams.get('search') || '',
    ordering: searchParams.get('ordering') || '',
    sale: searchParams.get('sale') || '',
  });

  const dispatch = useDispatch();
  const { products, categories, isLoading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(getProducts(filters));
    dispatch(getCategories());
  }, [dispatch, filters]);

  useEffect(() => {
    // Update URL when filters change
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.set(key, filters[key]);
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchValue = e.target.search.value;
    handleFilterChange('search', searchValue);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      gender: '',
      brand: '',
      search: '',
      ordering: '',
      sale: '',
    });
  };

  // Check if we're showing sale products
  const isShowingSaleProducts = filters.sale === 'true';

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        {isShowingSaleProducts ? 'Products on Sale' : 'Our Products'}
      </h1>

      {/* Sale Products Notice */}
      {isShowingSaleProducts && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fff3cd', 
          borderRadius: '8px', 
          marginBottom: '2rem',
          border: '1px solid #ffeaa7',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#856404', fontWeight: '500' }}>
            🎉 Showing products with special discounts! Save big on these amazing deals.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Filters</h3>
        
        {/* Search */}
        <form onSubmit={handleSearch} style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              name="search"
              placeholder="Search products..."
              className="form-control"
              defaultValue={filters.search}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </div>
        </form>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {/* Category Filter */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-control"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories && categories.length > 0 && categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select
              className="form-control"
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
            >
              <option value="">All Genders</option>
              <option value="M">Men</option>
              <option value="F">Women</option>
              <option value="U">Unisex</option>
            </select>
          </div>

          {/* Brand Filter */}
          <div className="form-group">
            <label className="form-label">Brand</label>
            <input
              type="text"
              className="form-control"
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              placeholder="Filter by brand"
            />
          </div>

          {/* Sort Order */}
          <div className="form-group">
            <label className="form-label">Sort By</label>
            <select
              className="form-control"
              value={filters.ordering}
              onChange={(e) => handleFilterChange('ordering', e.target.value)}
            >
              <option value="">Default</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-created_at">Newest First</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <button onClick={clearFilters} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Clear Filters
        </button>
      </div>

      {/* Products Grid */}
      {products && products.length > 0 ? (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="card text-center">
          <h3>No products found</h3>
          <p>
            {isShowingSaleProducts 
              ? "No products are currently on sale. Check back later for amazing deals!" 
              : "Try adjusting your filters or search terms."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Products; 