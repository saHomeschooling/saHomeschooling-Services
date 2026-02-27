import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const injectHead = () => {
  if (document.getElementById('sah-login-fonts')) return;
  const fonts = document.createElement('link');
  fonts.id = 'sah-login-fonts';
  fonts.rel = 'stylesheet';
  fonts.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=DM+Sans:wght@400;500;600;700&display=swap';
  document.head.appendChild(fonts);
  const fa = document.createElement('link');
  fa.rel = 'stylesheet';
  fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
  document.head.appendChild(fa);
};

const CSS = `
  :root {
    --accent: #c9621a;
    --accent-dark: #a84e12;
    --accent-light: #f0dcc8;
    --dark: #3a3a3a;
    --mid: #555;
    --muted: #888;
    --card-gray: #d6d0c8;
    --card-white: #ede9e3;
    --border: rgba(0,0,0,0.10);
    --header-h: 68px;
    --shadow-md: 0 4px 20px rgba(0,0,0,0.10);
    --shadow-lg: 0 16px 48px rgba(0,0,0,0.14);
    --radius: 8px;
    --radius-lg: 12px;
  }

  .sah-login-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
  .sah-login-wrap {
    font-family: 'DM Sans', sans-serif;
    background: var(--card-white);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    -webkit-font-smoothing: antialiased;
  }

  /* ── HEADER ── */
  .sah-lhdr {
    position: sticky; top: 0; z-index: 100;
    height: var(--header-h); background: #5a5a5a;
    box-shadow: 0 2px 12px rgba(0,0,0,0.22);
    display: flex; align-items: center;
    flex-shrink: 0;
  }
  .sah-lhdr-inner {
    max-width: 1280px; margin: 0 auto; padding: 0 32px;
    width: 100%; display: flex; align-items: center; justify-content: space-between;
  }
  .sah-lhdr-left { display: flex; align-items: center; gap: 0; }
  .sah-lhdr-back {
    display: inline-flex; align-items: center; gap: 8px;
    background: none; border: none; color: rgba(255,255,255,0.88);
    font-size: 0.88rem; font-weight: 600; font-family: 'DM Sans', sans-serif;
    cursor: pointer; padding: 6px 0; text-decoration: none; white-space: nowrap;
  }
  .sah-lhdr-back:hover { color: #fff; }
  .sah-lhdr-div { width: 1px; height: 28px; background: rgba(255,255,255,0.28); margin: 0 16px; }
  .sah-lhdr-brand { text-decoration: none; }
  .sah-lhdr-brand-name { font-family: 'Playfair Display', serif; font-weight: 800; font-size: 1.02rem; color: #fff; display: block; }
  .sah-lhdr-brand-tag { font-size: 0.66rem; color: rgba(255,255,255,0.68); font-weight: 500; letter-spacing: 0.45px; display: block; }
  .sah-lhdr-right { display: flex; align-items: center; gap: 10px; }
  .sah-lhdr-solid {
    padding: 7px 18px; border-radius: 6px; background: var(--accent); color: #fff;
    font-weight: 700; font-size: 0.86rem; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; text-decoration: none;
    display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;
    transition: background 0.15s;
  }
  .sah-lhdr-solid:hover { background: var(--accent-dark); }

  /* ── MAIN — horizontal two-column layout, fits the viewport ── */
  .sah-login-main {
    flex: 1;
    display: flex;
    align-items: stretch;
    overflow: hidden;
  }

  /* Left panel — decorative hero side — now 48% so content is fully visible */
  .sah-login-left {
    flex: 0 0 48%;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    min-width: 0;
  }
  .sah-login-left-bg {
    position: absolute; inset: 0; z-index: 0;
    background-image: url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&auto=format&fit=crop&q=80');
    background-size: cover; background-position: center 30%;
  }
  .sah-login-left-bg::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(160deg, rgba(10,10,10,0.55) 0%, rgba(30,20,10,0.82) 100%);
  }
  .sah-login-left-content {
    position: relative; z-index: 2;
    padding: 40px 36px;
  }
  .sah-login-left-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.7rem, 2.6vw, 2.6rem);
    font-weight: 900; color: #fff;
    line-height: 1.08; margin-bottom: 16px;
  }
  .sah-login-left-title em { font-style: italic; color: var(--accent-light); }
  .sah-login-left-desc {
    font-size: 0.88rem; color: rgba(255,255,255,0.75);
    line-height: 1.7; max-width: 340px; margin-bottom: 28px;
  }
  .sah-login-left-perks {
    display: flex; flex-direction: column; gap: 10px;
  }
  .sah-login-left-perk {
    display: flex; align-items: center; gap: 11px;
    font-size: 0.84rem; font-weight: 600; color: rgba(255,255,255,0.88);
  }
  .sah-login-left-perk i {
    width: 28px; height: 28px; border-radius: 50%;
    background: rgba(255,255,255,0.12);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem; color: var(--accent-light); flex-shrink: 0;
  }

  /* Right panel — the form */
  .sah-login-right {
    flex: 1;
    min-width: 0;
    background: var(--card-white);
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 32px 48px;
    overflow-y: auto;
  }

  .sah-login-heading {
    font-family: 'Playfair Display', serif; font-size: 1.9rem; font-weight: 800;
    color: var(--dark); margin-bottom: 3px; line-height: 1.15;
  }
  .sah-login-sub {
    color: var(--muted); font-size: 0.88rem; margin-bottom: 18px;
  }

  /* Alert */
  .sah-login-alert {
    display: none; padding: 11px 16px; border-radius: 8px;
    font-weight: 600; font-size: 0.86rem; margin-bottom: 16px;
    border: 1px solid transparent;
  }
  .sah-login-alert.error { background: #fee9e9; color: #a00c2c; border-color: #f5b3b3; }
  .sah-login-alert.success { background: #e6f7ec; color: #0d7d6c; border-color: #a3e0b5; }
  .sah-login-alert.show { display: flex; align-items: center; gap: 8px; }

  /* Card */
  .sah-login-card {
    background: var(--card-gray);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    overflow: hidden;
  }
  .sah-login-card-head {
    background: #5a5a5a; padding: 18px 24px 14px;
  }
  .sah-login-card-head h3 {
    font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 800; color: #fff;
    display: flex; align-items: center; gap: 8px;
  }
  .sah-login-card-head p { font-size: 0.78rem; color: rgba(255,255,255,0.65); margin-top: 2px; }
  .sah-login-card-body { padding: 18px 22px 16px; }

  /* Fields */
  .sah-lfield { margin-bottom: 11px; }
  .sah-lfield label {
    display: flex; align-items: center; gap: 6px;
    font-weight: 600; font-size: 0.75rem; text-transform: uppercase;
    letter-spacing: 0.6px; color: var(--mid); margin-bottom: 5px;
  }
  .sah-lfield label i { color: var(--accent); font-size: 0.72rem; }
  .sah-lfield label span { color: var(--accent); font-size: 1rem; }
  .sah-lfield input {
    width: 100%; padding: 10px 13px;
    border: 1.5px solid rgba(0,0,0,0.12);
    border-radius: var(--radius);
    background: var(--card-white);
    font-family: 'DM Sans', sans-serif; font-size: 0.91rem; color: var(--dark);
    outline: none; transition: border-color 0.15s, box-shadow 0.15s;
  }
  .sah-lfield input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,98,26,0.15); }
  .sah-lfield input.error { border-color: #dc2626; background: #fff8f8; }
  .sah-field-err {
    color: #dc2626; font-size: 0.72rem; font-weight: 500;
    display: flex; align-items: center; gap: 4px; margin-top: 4px;
  }

  /* Password wrapper */
  .sah-pw-wrap { position: relative; }
  .sah-pw-wrap input { padding-right: 42px; }
  .sah-pw-toggle {
    position: absolute; right: 11px; top: 50%; transform: translateY(-50%);
    background: none; border: none; color: var(--muted); cursor: pointer; font-size: 0.88rem; padding: 4px;
  }
  .sah-pw-toggle:hover { color: var(--accent); }

  /* Extras row */
  .sah-login-extras {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 8px; margin: 2px 0 4px;
  }
  .sah-remember { display: flex; align-items: center; gap: 6px; font-size: 0.83rem; font-weight: 500; color: var(--mid); cursor: pointer; }
  .sah-remember input[type="checkbox"] { accent-color: var(--accent); width: auto; }
  .sah-forgot { color: var(--accent); font-size: 0.83rem; font-weight: 600; text-decoration: none; background: none; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; }
  .sah-forgot:hover { text-decoration: underline; }

  /* Submit */
  .sah-login-submit-wrap { text-align: center; margin-top: 14px; }
  .sah-login-btn {
    width: 100%; padding: 12px; border: none; border-radius: 50px;
    background: var(--accent); color: #fff; font-family: 'DM Sans', sans-serif;
    font-size: 1rem; font-weight: 700; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: background 0.15s, transform 0.15s;
    box-shadow: 0 8px 24px -6px rgba(201,98,26,0.45);
  }
  .sah-login-btn:hover { background: var(--accent-dark); transform: translateY(-2px); }
  .sah-login-btn:active { transform: translateY(0); }
  .sah-login-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .sah-secure-note {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    font-size: 0.75rem; color: var(--muted); margin-top: 10px;
  }
  .sah-secure-note i { color: var(--accent); }

  /* Divider */
  .sah-login-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 12px 0; font-size: 0.74rem; color: var(--muted); font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.8px;
  }
  .sah-login-divider::before,
  .sah-login-divider::after { content: ''; flex: 1; height: 1px; background: rgba(0,0,0,0.10); }

  /* Register prompt */
  .sah-login-prompt {
    text-align: center; font-size: 0.87rem; color: var(--mid); margin-top: 10px;
  }
  .sah-login-prompt a {
    color: var(--accent); font-weight: 700; text-decoration: none;
    border-bottom: 2px solid transparent; transition: border-color 0.1s;
  }
  .sah-login-prompt a:hover { border-bottom-color: var(--accent); }

  /* Demo credentials */
  .sah-demo-box {
    background: rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.08);
    border-radius: var(--radius); padding: 10px 14px; margin-top: 10px;
  }
  .sah-demo-box h4 { font-size: 0.72rem; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
  .sah-demo-box p { font-size: 0.74rem; color: var(--mid); line-height: 1.7; }
  .sah-demo-box code {
    background: rgba(0,0,0,0.06); border-radius: 3px; padding: 1px 5px;
    font-size: 0.72rem; font-family: monospace; color: var(--dark);
  }

  /* Loading spinner */
  .sah-spinner {
    width: 15px; height: 15px; border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff; border-radius: 50%;
    animation: sah-spin 0.7s linear infinite;
  }
  @keyframes sah-spin { to { transform: rotate(360deg); } }

  /* ── RESPONSIVE — stack on mobile ── */
  @media (max-width: 768px) {
    .sah-login-main { flex-direction: column; overflow: visible; }
    .sah-login-left { min-height: 260px; flex: none; }
    .sah-login-right { width: 100%; padding: 28px 24px 40px; }
    .sah-lhdr-inner { padding: 0 16px; }
  }
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ msg: '', type: '' });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    injectHead();
    if (!document.getElementById('sah-login-css')) {
      const s = document.createElement('style');
      s.id = 'sah-login-css';
      s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email address is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = 'Enter a valid email address';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ msg: '', type: '' });
    if (!validate()) {
      return;
    }

    setLoading(true);
    const trimmedEmail = email.trim().toLowerCase();

    try {
      // Admin check
      if (trimmedEmail === 'admin@sahomeschooling.co.za' && password === 'admin123') {
        localStorage.setItem('sah_current_user', JSON.stringify({ role: 'admin', email: trimmedEmail }));
        setAlert({ msg: 'Admin login successful! Redirecting...', type: 'success' });
        setTimeout(() => navigate('/admin-dashboard'), 1200);
        return;
      }

      // Check localStorage providers
      const stored = JSON.parse(localStorage.getItem('sah_providers') || '[]');
      const match = stored.find(p => (p.email || '').toLowerCase() === trimmedEmail || (p.contactEmail || '').toLowerCase() === trimmedEmail);

      if (match && password.length >= 6) {
        const userData = { role: 'client', email: trimmedEmail, id: match.id, name: match.name };
        localStorage.setItem('sah_current_user', JSON.stringify(userData));
        if (login) login(userData);
        setAlert({ msg: `Welcome back, ${match.name}! Redirecting to your dashboard...`, type: 'success' });
        setTimeout(() => navigate('/client-dashboard'), 1200);
        return;
      }

      // Seed provider check (khan academy)
      if (trimmedEmail === 'contact@khanacademy.org.za' && password.length >= 6) {
        const userData = { role: 'client', email: trimmedEmail, id: 'khan', name: 'Khan Academy SA' };
        localStorage.setItem('sah_current_user', JSON.stringify(userData));
        if (login) login(userData);
        setAlert({ msg: 'Login successful! Redirecting to your dashboard...', type: 'success' });
        setTimeout(() => navigate('/client-dashboard'), 1200);
        return;
      }

      setAlert({ msg: 'Invalid email or password. Please try again.', type: 'error' });
    } catch (err) {
      setAlert({ msg: 'An error occurred. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sah-login-wrap">

      {/* Header */}
      <header className="sah-lhdr">
        <div className="sah-lhdr-inner">
          <div className="sah-lhdr-left">
            <button className="sah-lhdr-back" onClick={() => navigate('/')}>
              <i className="fas fa-arrow-left" /> Back to Directory
            </button>
            <div className="sah-lhdr-div" />
            <Link to="/" className="sah-lhdr-brand">
              <span className="sah-lhdr-brand-name">SA Homeschooling</span>
              <span className="sah-lhdr-brand-tag">Education Services Directory</span>
            </Link>
          </div>
          <div className="sah-lhdr-right">
            <Link to="/register" className="sah-lhdr-solid">Register</Link>
          </div>
        </div>
      </header>

      {/* Main — horizontal two-column layout */}
      <main className="sah-login-main">

        {/* Left — decorative hero */}
        <div className="sah-login-left">
          <div className="sah-login-left-bg" />
          <div className="sah-login-left-content">
            <h2 className="sah-login-left-title">
              South Africa's<br /><em>Homeschooling</em><br />Directory
            </h2>
            <p className="sah-login-left-desc">
              Connect with verified tutors, therapists, curriculum providers and education specialists nationwide.
            </p>
            <div className="sah-login-left-perks">
              {[
                ['fa-shield-alt', 'All providers manually verified'],
                ['fa-lock', 'Secure & private enquiries'],
                ['fa-star', '4.9 average provider rating'],
                ['fa-map-marker-alt', 'Nationwide coverage across all 9 provinces'],
              ].map(([icon, text]) => (
                <div key={text} className="sah-login-left-perk">
                  <i className={`fas ${icon}`} />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — login form */}
        <div className="sah-login-right">
          <h1 className="sah-login-heading">Welcome Back</h1>
          <p className="sah-login-sub">Sign in to your SA Homeschooling Directory account</p>

          {/* Alert */}
          {alert.msg && (
            <div className={`sah-login-alert show ${alert.type}`}>
              <i className={`fas ${alert.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`} /> {alert.msg}
            </div>
          )}

          <div className="sah-login-card">
            {/* Card header */}
            <div className="sah-login-card-head">
              <h3><i className="fas fa-lock" /> Sign in with your credentials</h3>
              <p>Access your provider dashboard and manage your listings</p>
            </div>

            {/* Card body */}
            <div className="sah-login-card-body">
              <form onSubmit={handleSubmit} noValidate>

                <div className="sah-lfield">
                  <label><i className="fas fa-envelope" /> Email Address <span>*</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                    placeholder="you@example.co.za"
                    className={errors.email ? 'error' : ''}
                    autoFocus
                  />
                  {errors.email && <div className="sah-field-err"><i className="fas fa-circle-exclamation" /> {errors.email}</div>}
                </div>

                <div className="sah-lfield">
                  <label><i className="fas fa-lock" /> Password <span>*</span></label>
                  <div className="sah-pw-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                      placeholder="Your password"
                      className={errors.password ? 'error' : ''}
                    />
                    <button type="button" className="sah-pw-toggle" onClick={() => setShowPassword(s => !s)}>
                      <i className={`far fa-eye${showPassword ? '-slash' : ''}`} />
                    </button>
                  </div>
                  {errors.password && <div className="sah-field-err"><i className="fas fa-circle-exclamation" /> {errors.password}</div>}
                </div>

                <div className="sah-login-extras">
                  <label className="sah-remember">
                    <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                    Remember me
                  </label>
                  <button type="button" className="sah-forgot">Forgot password?</button>
                </div>

                <div className="sah-login-submit-wrap">
                  <button type="submit" className="sah-login-btn" disabled={loading}>
                    {loading ? <span className="sah-spinner" /> : <i className="fas fa-arrow-right-to-bracket" />}
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                  <div className="sah-secure-note">
                    <i className="fas fa-shield-heart" /> Secure · Encrypted · Verified educators
                  </div>
                </div>
              </form>

              <div className="sah-login-divider">or</div>

              <p className="sah-login-prompt">
                New to the community? <Link to="/register">Create a free account</Link> — it's free
              </p>

              {/* Demo credentials */}
              <div className="sah-demo-box">
                <h4><i className="fas fa-flask" /> Demo Credentials</h4>
                <p>
                  <strong>Admin:</strong> <code>admin@sahomeschooling.co.za</code> / <code>admin123</code><br />
                  <strong>Client:</strong> <code>contact@khanacademy.org.za</code> + any password (6+ chars)
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;