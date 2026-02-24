import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const Header = ({ userType }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const toggleMobile = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    showNotification('Logged out successfully', 'success');
    navigate('/login');
  };

  return (
    <>
      <header className="top-header">
        <div className="logo-area">
          <div className="trusted-text" style={{ borderLeft: 'none', paddingLeft: 0 }}>
            Trusted Homeschooling Directory
            <span>SA Homeschooling</span>
          </div>
        </div>

        {/* Desktop nav - only Home link */}
        <nav className="nav-links" aria-label="Main navigation">
          <Link to="/">Home</Link>
          {user && (
            <button 
              onClick={handleLogout}
              style={{ 
                background: 'transparent', 
                border: '1px solid rgba(255,255,255,0.3)', 
                color: 'white',
                padding: '0.3rem 1rem',
                borderRadius: '20px',
                cursor: 'pointer',
                marginLeft: '1rem'
              }}
            >
              <i className="fas fa-sign-out-alt" style={{ marginRight: '0.3rem' }}></i>
              Logout
            </button>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button 
          className={`hamburger ${mobileOpen ? 'open' : ''}`} 
          id="hamburgerBtn" 
          onClick={toggleMobile}
          aria-label="Toggle navigation" 
          aria-expanded={mobileOpen}
        >
          <span></span><span></span><span></span>
        </button>
      </header>

      {/* Mobile nav - only Home link */}
      <nav className={`mobile-nav ${mobileOpen ? 'open' : ''}`} id="mobileNav" aria-label="Mobile navigation">
        <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>
        {user && (
          <button 
            onClick={() => {
              handleLogout();
              setMobileOpen(false);
            }}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'rgba(255,255,255,0.8)',
              padding: '0.75rem 1rem',
              textAlign: 'left',
              width: '100%',
              cursor: 'pointer'
            }}
          >
            <i className="fas fa-sign-out-alt" style={{ marginRight: '0.5rem' }}></i>
            Logout
          </button>
        )}
      </nav>
    </>
  );
};

export default Header;