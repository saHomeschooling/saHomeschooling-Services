// frontend/src/pages/UserRegister.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const injectHead = () => {
  if (document.getElementById('sah-ur-fonts')) return;
  const fonts = document.createElement('link');
  fonts.id = 'sah-ur-fonts'; fonts.rel = 'stylesheet';
  fonts.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=DM+Sans:wght@400;500;600;700&display=swap';
  document.head.appendChild(fonts);
  const fa = document.createElement('link');
  fa.rel = 'stylesheet';
  fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
  document.head.appendChild(fa);
};

const CSS = `
  :root {
    --acc:#c9621a; --acc-d:#a84e12; --acc-l:#f0dcc8;
    --dark:#3a3a3a; --mid:#555; --muted:#888;
    --card:#ede9e3; --white:#fff;
    --border:rgba(0,0,0,0.10);
    --shadow:0 16px 48px rgba(0,0,0,0.13);
    --r:8px; --r-lg:14px;
  }
  .ur-wrap{font-family:'DM Sans',sans-serif;min-height:100vh;display:flex;flex-direction:column;background:var(--card);-webkit-font-smoothing:antialiased;}
  .ur-wrap *{box-sizing:border-box;margin:0;padding:0;}

  /* Header */
  .ur-hdr{height:64px;background:#5a5a5a;display:flex;align-items:center;padding:0 32px;gap:16px;box-shadow:0 2px 12px rgba(0,0,0,0.22);}
  .ur-hdr-back{display:inline-flex;align-items:center;gap:7px;color:rgba(255,255,255,0.85);font-size:0.85rem;font-weight:600;background:none;border:none;cursor:pointer;font-family:inherit;}
  .ur-hdr-back:hover{color:#fff;}
  .ur-hdr-div{width:1px;height:26px;background:rgba(255,255,255,0.25);}
  .ur-hdr-brand{font-family:'Playfair Display',serif;font-weight:800;font-size:1rem;color:#fff;text-decoration:none;}

  /* Hero */
  .ur-hero{position:relative;overflow:hidden;min-height:180px;display:flex;align-items:center;}
  .ur-hero-bg{position:absolute;inset:0;background-image:url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1400&auto=format&fit=crop&q=80');background-size:cover;background-position:center;}
  .ur-hero-bg::after{content:'';position:absolute;inset:0;background:linear-gradient(100deg,rgba(10,10,10,0.88) 0%,rgba(30,30,30,0.80) 100%);}
  .ur-hero-inner{position:relative;z-index:2;padding:40px 32px;width:100%;max-width:560px;margin:0 auto;text-align:center;}
  .ur-hero-inner h1{font-family:'Playfair Display',serif;font-size:clamp(1.8rem,4vw,2.6rem);font-weight:900;color:#fff;line-height:1.1;margin-bottom:8px;}
  .ur-hero-inner h1 em{font-style:italic;color:var(--acc-l);}
  .ur-hero-inner p{font-size:0.88rem;color:rgba(255,255,255,0.7);margin-top:6px;}

  /* Card */
  .ur-body{flex:1;display:flex;align-items:flex-start;justify-content:center;padding:36px 20px 64px;}
  .ur-card{background:var(--white);border-radius:var(--r-lg);box-shadow:var(--shadow);width:100%;max-width:460px;overflow:hidden;}
  .ur-card-head{background:#5a5a5a;padding:24px 32px 18px;}
  .ur-card-head h2{font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:800;color:#fff;}
  .ur-card-head p{font-size:0.82rem;color:rgba(255,255,255,0.65);margin-top:3px;}
  .ur-card-body{padding:28px 32px 32px;}

  /* Fields */
  .ur-field{display:flex;flex-direction:column;gap:5px;margin-bottom:16px;}
  .ur-field label{font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:var(--mid);display:flex;align-items:center;gap:5px;}
  .ur-field label i{color:var(--acc);font-size:0.65rem;}
  .ur-field input{padding:11px 14px;border:1.5px solid var(--border);border-radius:var(--r);font-family:'DM Sans',sans-serif;font-size:0.92rem;color:var(--dark);outline:none;background:var(--card);transition:border-color 0.15s,box-shadow 0.15s;}
  .ur-field input:focus{border-color:var(--acc);box-shadow:0 0 0 3px rgba(201,98,26,0.14);}
  .ur-field input.err{border-color:#dc2626;background:#fff8f8;}
  .ur-field-err{color:#dc2626;font-size:0.74rem;font-weight:600;padding:4px 9px;background:#fff0f0;border-radius:5px;border-left:3px solid #dc2626;display:flex;align-items:center;gap:5px;}

  /* Password eye */
  .ur-pw{position:relative;}
  .ur-pw input{padding-right:42px;}
  .ur-pw-eye{position:absolute;right:11px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--muted);cursor:pointer;font-size:0.88rem;padding:3px;}
  .ur-pw-eye:hover{color:var(--acc);}

  /* Perks */
  .ur-perks{display:flex;flex-direction:column;gap:8px;background:rgba(201,98,26,0.06);border:1px solid rgba(201,98,26,0.18);border-radius:var(--r);padding:14px 16px;margin-bottom:20px;}
  .ur-perk{display:flex;align-items:center;gap:9px;font-size:0.83rem;color:var(--mid);}
  .ur-perk i{color:var(--acc);font-size:0.75rem;width:14px;text-align:center;}

  /* Submit */
  .ur-submit{width:100%;padding:13px;background:var(--acc);color:#fff;border:none;border-radius:var(--r);font-family:'DM Sans',sans-serif;font-size:0.95rem;font-weight:700;cursor:pointer;transition:background 0.15s;display:flex;align-items:center;justify-content:center;gap:8px;}
  .ur-submit:hover{background:var(--acc-d);}
  .ur-submit:disabled{opacity:0.65;cursor:not-allowed;}

  /* Divider */
  .ur-divider{display:flex;align-items:center;gap:12px;margin:18px 0;}
  .ur-divider span{flex:1;height:1px;background:var(--border);}
  .ur-divider p{font-size:0.78rem;color:var(--muted);white-space:nowrap;}

  /* Switch */
  .ur-switch{text-align:center;font-size:0.85rem;color:var(--muted);}
  .ur-switch a{color:var(--acc);font-weight:700;text-decoration:none;}
  .ur-switch a:hover{text-decoration:underline;}

  /* Spinner */
  .ur-spin{width:16px;height:16px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:ur-s 0.7s linear infinite;}
  @keyframes ur-s{to{transform:rotate(360deg);}}

  /* Submit error */
  .ur-err-banner{background:#fff0f0;border:1.5px solid #f5b3b3;border-radius:var(--r);padding:11px 16px;color:#a00c2c;font-size:0.85rem;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px;}

  @media(max-width:480px){.ur-hdr{padding:0 16px;}.ur-card-body{padding:22px 20px 26px;}.ur-hero-inner{padding:32px 16px;}}
`;

const UserRegister = () => {
  const navigate = useNavigate();
  const { registerUser } = useAuth();
  const { showNotification } = useNotification();

  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [showCf, setShowCf]       = useState(false);
  const [errors, setErrors]       = useState({});
  const [submitErr, setSubmitErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    injectHead();
    if (!document.getElementById('sah-ur-css')) {
      const s = document.createElement('style');
      s.id = 'sah-ur-css'; s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  const validate = () => {
    const e = {};
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email))
      e.email = 'Enter a valid email address.';
    if (!password || password.length < 8)
      e.password = 'Password must be at least 8 characters.';
    if (password !== confirm)
      e.confirm = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setSubmitErr(''); setSubmitting(true);

    try {
      // Try API first, fall back to localStorage
      const result = registerUser
        ? await registerUser({ email: email.trim(), password })
        : { success: false };

      if (!result.success) {
        // localStorage fallback for dev
        const users = JSON.parse(localStorage.getItem('sah_users') || '[]');
        const exists = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
        if (exists) { setSubmitErr('An account with this email already exists.'); setSubmitting(false); return; }

        const newUser = {
          id: 'user_' + Date.now(),
          email: email.trim().toLowerCase(),
          role: 'USER',
          registered: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };
        users.push(newUser);
        localStorage.setItem('sah_users', JSON.stringify(users));

        // Log the registration event
        const logs = JSON.parse(localStorage.getItem('sah_auth_logs') || '[]');
        logs.unshift({ userId: newUser.id, email: newUser.email, role: 'USER', event: 'REGISTER', timestamp: new Date().toISOString() });
        localStorage.setItem('sah_auth_logs', JSON.stringify(logs.slice(0, 500)));

        localStorage.setItem('sah_current_user', JSON.stringify({ role: 'user', email: newUser.email, id: newUser.id }));
        localStorage.setItem('sah_user', JSON.stringify({ id: newUser.id, email: newUser.email, role: 'USER' }));
        localStorage.setItem('sah_token', 'local_' + newUser.id);
      }

      showNotification?.('✅ Account created! Welcome to SA Homeschooling.', 'success');
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setSubmitErr('Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fe = errors;

  return (
    <div className="ur-wrap">
      {/* Header */}
      <header className="ur-hdr">
        <button className="ur-hdr-back" onClick={() => navigate('/')}>
          <i className="fas fa-arrow-left" /> Back to Directory
        </button>
        <div className="ur-hdr-div" />
        <Link to="/" className="ur-hdr-brand">SA Homeschooling</Link>
      </header>

      {/* Hero */}
      <div className="ur-hero">
        <div className="ur-hero-bg" />
        <div className="ur-hero-inner">
          <h1>Join as a <em>Family</em></h1>
          <p>Browse verified tutors, therapists & curriculum providers across South Africa</p>
        </div>
      </div>

      {/* Form */}
      <div className="ur-body">
        <div className="ur-card">
          <div className="ur-card-head">
            <h2><i className="fas fa-user-plus" style={{ marginRight: 9, color: 'var(--acc-l)', fontSize: '1.1rem' }} /> Create Your Account</h2>
            <p>Free access — browse all provider profiles</p>
          </div>
          <div className="ur-card-body">

            {/* Perks */}
            <div className="ur-perks">
              {[
                ['fa-search','Browse & search all verified providers'],
                ['fa-envelope','Send direct enquiries to providers'],
                ['fa-heart','Save your favourite listings'],
                ['fa-bell','Get alerts for new providers near you'],
              ].map(([ic, txt]) => (
                <div key={txt} className="ur-perk"><i className={`fas ${ic}`} /> {txt}</div>
              ))}
            </div>

            {submitErr && (
              <div className="ur-err-banner"><i className="fas fa-exclamation-triangle" /> {submitErr}</div>
            )}

            <div className="ur-field">
              <label><i className="fas fa-envelope" /> Email Address <span style={{ color: 'var(--acc)' }}>*</span></label>
              <input
                type="email" value={email} placeholder="you@example.co.za"
                className={fe.email ? 'err' : ''}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
              />
              {fe.email && <div className="ur-field-err"><i className="fas fa-exclamation-circle" /> {fe.email}</div>}
            </div>

            <div className="ur-field">
              <label><i className="fas fa-lock" /> Password <span style={{ color: 'var(--acc)' }}>*</span></label>
              <div className="ur-pw">
                <input
                  type={showPw ? 'text' : 'password'} value={password} placeholder="Min. 8 characters"
                  className={fe.password ? 'err' : ''}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                />
                <button type="button" className="ur-pw-eye" onClick={() => setShowPw(s => !s)}>
                  <i className={`far fa-eye${showPw ? '-slash' : ''}`} />
                </button>
              </div>
              {fe.password && <div className="ur-field-err"><i className="fas fa-exclamation-circle" /> {fe.password}</div>}
            </div>

            <div className="ur-field">
              <label><i className="fas fa-lock" /> Confirm Password <span style={{ color: 'var(--acc)' }}>*</span></label>
              <div className="ur-pw">
                <input
                  type={showCf ? 'text' : 'password'} value={confirm} placeholder="Repeat your password"
                  className={fe.confirm ? 'err' : ''}
                  onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: '' })); }}
                />
                <button type="button" className="ur-pw-eye" onClick={() => setShowCf(s => !s)}>
                  <i className={`far fa-eye${showCf ? '-slash' : ''}`} />
                </button>
              </div>
              {fe.confirm && <div className="ur-field-err"><i className="fas fa-exclamation-circle" /> {fe.confirm}</div>}
            </div>

            <button className="ur-submit" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <span className="ur-spin" /> : <i className="fas fa-user-plus" />}
              {submitting ? 'Creating Account…' : 'Create Free Account'}
            </button>

            <div className="ur-divider">
              <span /><p>Already have an account?</p><span />
            </div>

            <div className="ur-switch">
              <Link to="/login">Log in to your account</Link>
              &nbsp;&nbsp;·&nbsp;&nbsp;
              Are you a provider? <Link to="/register/provider">Register here</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;