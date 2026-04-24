import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTree, FaEnvelope, FaLock, FaSignInAlt, FaMagic } from 'react-icons/fa';
import { login } from '../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFill = () => {
    setEmail('admin@genealogy.com');
    setPassword('password123');
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />
      <div style={styles.card} className="animate-fade-in-up">
        <div style={styles.logoSection}>
          <div style={styles.logoCircle}>
            <FaTree style={styles.logoIcon} />
          </div>
          <h1 style={styles.title}>AI Genealogy Researcher</h1>
          <p style={styles.subtitle}>Discover your family history with AI-powered research</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.inputGroup}>
            <FaEnvelope style={styles.inputIcon} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <FaLock style={styles.inputIcon} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.loginBtn} disabled={loading}>
            {loading ? <div className="spinner" /> : <><FaSignInAlt /> Sign In</>}
          </button>

          <button type="button" onClick={handleAutoFill} style={styles.autoFillBtn}>
            <FaMagic /> Auto Fill
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>Powered by Artificial Intelligence</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f1117 0%, #1a1d2e 50%, #0f1117 100%)',
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
  },
  bgOrb1: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(108, 99, 255, 0.15) 0%, transparent 70%)',
    top: '-100px',
    right: '-100px',
  },
  bgOrb2: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0, 212, 170, 0.1) 0%, transparent 70%)',
    bottom: '-150px',
    left: '-150px',
  },
  card: {
    background: 'rgba(26, 29, 46, 0.9)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid #2a2e45',
    borderRadius: '24px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(108, 99, 255, 0.05)',
    position: 'relative',
    zIndex: 1,
  },
  logoSection: {
    textAlign: 'center',
    marginBottom: '36px',
  },
  logoCircle: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff 0%, #00d4aa 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 8px 30px rgba(108, 99, 255, 0.3)',
  },
  logoIcon: {
    color: 'white',
    fontSize: '1.8rem',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: '#e4e4e7',
    marginBottom: '8px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#71717a',
    fontWeight: '400',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  error: {
    padding: '12px 16px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '10px',
    color: '#ef4444',
    fontSize: '0.85rem',
    textAlign: 'center',
  },
  inputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    color: '#71717a',
    fontSize: '0.9rem',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '14px 16px 14px 44px',
    background: '#0f1117',
    border: '1px solid #2a2e45',
    borderRadius: '12px',
    color: '#e4e4e7',
    fontSize: '0.9rem',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  loginBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '14px',
    background: 'linear-gradient(135deg, #6c63ff 0%, #5a52e0 100%)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontSize: '0.95rem',
    fontWeight: '700',
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 15px rgba(108, 99, 255, 0.3)',
    marginTop: '8px',
  },
  autoFillBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    background: 'transparent',
    border: '1px solid #2a2e45',
    borderRadius: '12px',
    color: '#a1a1aa',
    fontSize: '0.85rem',
    fontWeight: '500',
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  footer: {
    textAlign: 'center',
    marginTop: '32px',
    paddingTop: '20px',
    borderTop: '1px solid #2a2e45',
  },
  footerText: {
    fontSize: '0.75rem',
    color: '#71717a',
    fontWeight: '400',
  },
};

export default LoginPage;
