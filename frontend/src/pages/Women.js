import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts, getCategories } from '../redux/slices/productSlice';
import ProductCard from '../components/ProductCard';

const Women = () => {
  const [filters, setFilters] = useState({
    gender: 'F', // Always filter for women's products
    category: '',
    brand: '',
    search: '',
    ordering: '',
  });

  const dispatch = useDispatch();
  const { products, categories, isLoading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(getProducts(filters));
    dispatch(getCategories());
  }, [dispatch, filters]);

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
      gender: 'F', // Keep gender filter for women
      category: '',
      brand: '',
      search: '',
      ordering: '',
    });
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header women">
        <h1>Women's Fashion</h1>
        <p>Discover the latest trends in women's clothing, accessories, and more.</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Filters</h3>
        
        {/* Search */}
        <form onSubmit={handleSearch} style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              name="search"
              placeholder="Search women's products..."
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
          <h3>No women's products found</h3>
          <p>Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
};

export default Women; 