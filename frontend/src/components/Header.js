import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const cartItemCount = cart?.total_items || 0;

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          FashionNest
        </Link>
        
        <nav>
          <ul className="nav-menu">
            <li>
              <Link to="/" className="nav-link">
                Home
              </Link>
            </li>
            <li>
              <Link to="/products" className="nav-link">
                All Products
              </Link>
            </li>
            <li>
              <Link to="/women" className="nav-link">
                Women
              </Link>
            </li>
            <li>
              <Link to="/men" className="nav-link">
                Men
              </Link>
            </li>
            
            {user ? (
              <>
                <li>
                  <Link to="/profile" className="nav-link">
                    Profile
                  </Link>
                </li>
                <li>
                  <Link to="/orders" className="nav-link">
                    Orders
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="nav-link cart-icon">
                    🛒 Cart
                    {cartItemCount > 0 && (
                      <span className="cart-badge">{cartItemCount}</span>
                    )}
                  </Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="btn btn-secondary">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="nav-link">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="btn btn-primary">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header; 