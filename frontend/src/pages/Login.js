import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showNotification } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await login(email, password);
      
      if (result.success) {
        showNotification(result.message || 'Login successful!', 'success');
        
        // Redirect based on user role
        setTimeout(() => {
          if (result.user?.role === 'admin') {
            navigate('/admin-dashboard');
          } else {
            navigate('/client-dashboard');
          }
        }, 1000);
      } else {
        showNotification(result.error || 'Login failed', 'error');
      }
    } catch (error) {
      showNotification('An error occurred during login', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <section className="onboarding-lead">
        <div className="container">
          <h1>Log In to Your Account</h1>
        </div>
      </section>

      <div className="form-panel" style={{ maxWidth: '600px', padding: '40px' }}>
        <div className="step-title">Provider Login</div>
        <div className="step-desc">Access your dashboard and manage your listings</div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="field full-width">
              <label><i className="fas fa-envelope"></i> Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.co.za"
                disabled={loading}
              />
              {errors.email && <span className="hint" style={{ color: '#c0234a' }}>{errors.email}</span>}
            </div>

            <div className="field full-width">
              <label><i className="fas fa-lock"></i> Password *</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  disabled={loading}
                />
                <button 
                  type="button" 
                  className="toggle-pw" 
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <i className={`far fa-eye${showPassword ? '-slash' : ''}`}></i>
                </button>
              </div>
              {errors.password && <span className="hint" style={{ color: '#c0234a' }}>{errors.password}</span>}
            </div>
          </div>

          <div className="form-nav" style={{ marginTop: '32px' }}>
            <button 
              type="submit" 
              className="btn-next" 
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </div>
          <div className="modal-switch" style={{ textAlign: 'center', marginTop: '16px' }}>
            New here? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create a free account</Link>
          </div>
        </form>

        {/* Demo credentials hint */}
        <div style={{ marginTop: '30px', padding: '15px', background: '#f5f5f5', borderRadius: '8px', fontSize: '0.85rem' }}>
          <p><strong>Demo Credentials:</strong></p>
          <p>Admin: admin@sahomeschooling.co.za / admin123</p>
          <p>Client: contact@khanacademy.org.za / password123</p>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Login;