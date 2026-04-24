import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTree, FaSignOutAlt, FaArrowLeft, FaChevronRight } from 'react-icons/fa';

const Navbar = ({ title, showBack = false, breadcrumb }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <div style={styles.left}>
          {showBack && (
            <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
              <FaArrowLeft />
            </button>
          )}
          <div style={styles.brand} onClick={() => navigate('/dashboard')}>
            <FaTree style={styles.brandIcon} />
            <span style={styles.brandText}>AI Genealogy Researcher</span>
          </div>
          {breadcrumb && (
            <div style={styles.breadcrumb}>
              <FaChevronRight style={styles.chevron} />
              <span style={styles.breadcrumbText}>{breadcrumb}</span>
            </div>
          )}
        </div>
        <div style={styles.right}>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    background: 'rgba(26, 29, 46, 0.95)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid #2a2e45',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    padding: '0 24px',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    background: '#232740',
    border: '1px solid #2a2e45',
    borderRadius: '8px',
    color: '#a1a1aa',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '0.9rem',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
  brandIcon: {
    color: '#6c63ff',
    fontSize: '1.3rem',
  },
  brandText: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#e4e4e7',
    letterSpacing: '-0.3px',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  chevron: {
    color: '#71717a',
    fontSize: '0.7rem',
  },
  breadcrumbText: {
    color: '#a1a1aa',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid #2a2e45',
    borderRadius: '8px',
    color: '#a1a1aa',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '500',
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.2s ease',
  },
};

export default Navbar;
