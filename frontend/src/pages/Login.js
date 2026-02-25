import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Mock login logic from homePage.html
    const storedProviders = JSON.parse(localStorage.getItem('sah_providers') || '[]');
    const match = storedProviders.find(p => (p.email || '').toLowerCase() === email.toLowerCase());

    if (email === 'admin@sahomeschooling.co.za' && password === 'admin123') {
      localStorage.setItem('sah_current_user', JSON.stringify({ role: 'admin', email }));
      showNotification('Admin login successful! Redirecting...', 'success');
      setTimeout(() => window.location.href = '/dashboards/admin-dashboard.html', 1000);
    } else if (match) {
      localStorage.setItem('sah_current_user', JSON.stringify({ role: 'client', email, id: match.id, name: match.name }));
      showNotification(`Welcome back, ${match.name}!`, 'success');
      setTimeout(() => window.location.href = '/dashboards/client-dashboard.html', 1000);
    } else if (password.length >= 6) {
      localStorage.setItem('sah_current_user', JSON.stringify({ role: 'client', email }));
      showNotification('Login successful!', 'success');
      setTimeout(() => window.location.href = '/dashboards/client-dashboard.html', 1000);
    } else {
      showNotification('Invalid credentials. Try again.', 'error');
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
                />
                <button type="button" className="toggle-pw" onClick={() => setShowPassword(!showPassword)}>
                  <i className={`far fa-eye${showPassword ? '-slash' : ''}`}></i>
                </button>
              </div>
              {errors.password && <span className="hint" style={{ color: '#c0234a' }}>{errors.password}</span>}
            </div>
          </div>

          <div className="form-nav" style={{ marginTop: '32px' }}>
            <button type="submit" className="btn-next" style={{ width: '100%' }}>Log In</button>
          </div>
          <div className="modal-switch" style={{ textAlign: 'center', marginTop: '16px' }}>
            New here? <a href="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create a free account</a>
          </div>
        </form>
      </div>

      <Footer />
    </>
  );
};

export default Login;