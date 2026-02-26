import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const injectHead = () => {
  if (document.getElementById('sah-reg-fonts')) return;
  const fonts = document.createElement('link');
  fonts.id = 'sah-reg-fonts'; fonts.rel = 'stylesheet';
  fonts.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=DM+Sans:wght@400;500;600;700&display=swap';
  document.head.appendChild(fonts);
  const fa = document.createElement('link');
  fa.rel = 'stylesheet';
  fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
  document.head.appendChild(fa);
};

const CSS = `
  :root {
    --accent: #c9621a; --accent-dark: #a84e12; --accent-light: #f0dcc8;
    --dark: #3a3a3a; --mid: #555; --muted: #888;
    --card-gray: #d6d0c8; --card-white: #ede9e3;
    --border: rgba(0,0,0,0.10);
    --header-h: 68px;
    --shadow-md: 0 4px 20px rgba(0,0,0,0.09);
    --shadow-lg: 0 16px 48px rgba(0,0,0,0.14);
    --radius: 8px; --radius-lg: 12px;
  }

  .sah-reg-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
  .sah-reg-wrap {
    font-family: 'DM Sans', sans-serif; background: var(--card-white);
    min-height: 100vh; -webkit-font-smoothing: antialiased; color: var(--dark);
  }

  /* ── HEADER ── */
  .sah-rhdr {
    position: sticky; top: 0; z-index: 200;
    height: var(--header-h); background: #5a5a5a;
    box-shadow: 0 2px 12px rgba(0,0,0,0.22);
  }
  .sah-rhdr-inner {
    max-width: 1280px; margin: 0 auto; padding: 0 32px;
    height: 100%; display: flex; align-items: center; justify-content: space-between;
  }
  .sah-rhdr-left { display: flex; align-items: center; }
  .sah-rhdr-back {
    display: inline-flex; align-items: center; gap: 8px;
    background: none; border: none; color: rgba(255,255,255,0.88);
    font-size: 0.88rem; font-weight: 600; font-family: 'DM Sans', sans-serif;
    cursor: pointer; padding: 6px 0; text-decoration: none; white-space: nowrap;
  }
  .sah-rhdr-back:hover { color: #fff; }
  .sah-rhdr-div { width: 1px; height: 28px; background: rgba(255,255,255,0.28); margin: 0 16px; }
  .sah-rhdr-brand { text-decoration: none; }
  .sah-rhdr-brand-name { font-family: 'Playfair Display', serif; font-weight: 800; font-size: 1.02rem; color: #fff; display: block; }
  .sah-rhdr-brand-tag { font-size: 0.66rem; color: rgba(255,255,255,0.68); font-weight: 500; letter-spacing: 0.45px; display: block; }
  .sah-rhdr-right { display: flex; gap: 10px; align-items: center; }
  .sah-rhdr-ghost {
    padding: 7px 16px; border-radius: 6px;
    border: 1.5px solid rgba(255,255,255,0.60); background: transparent;
    color: #fff; font-weight: 600; font-size: 0.85rem; cursor: pointer;
    font-family: 'DM Sans', sans-serif; text-decoration: none;
    display: inline-flex; align-items: center; gap: 6px;
  }
  .sah-rhdr-ghost:hover { border-color: #fff; background: rgba(255,255,255,0.10); }

  /* ── HERO ── */
  .sah-reg-hero {
    position: relative; overflow: hidden;
    min-height: 220px; display: flex; align-items: center;
  }
  .sah-reg-hero-bg {
    position: absolute; inset: 0; z-index: 0;
    background-image: url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&auto=format&fit=crop&q=80');
    background-size: cover; background-position: center 35%;
  }
  .sah-reg-hero-bg::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(100deg, rgba(10,10,10,0.88) 0%, rgba(30,30,30,0.82) 50%, rgba(10,10,10,0.78) 100%);
  }
  .sah-reg-hero-inner {
    position: relative; z-index: 2; width: 100%;
    max-width: 1280px; margin: 0 auto; padding: 48px 32px;
  }
  .sah-reg-hero-title {
    font-family: 'Playfair Display', serif; font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 900; color: #fff; margin-bottom: 28px; line-height: 1.1;
  }
  .sah-reg-hero-title em { font-style: italic; color: var(--accent-light); }

  /* Step trail */
  .sah-step-trail {
    display: flex; align-items: center; gap: 0; flex-wrap: nowrap; overflow-x: auto;
    -webkit-overflow-scrolling: touch; padding-bottom: 4px;
  }
  .sah-step-trail::-webkit-scrollbar { display: none; }
  .sah-trail-item {
    display: flex; align-items: center; gap: 0; flex-shrink: 0;
  }
  .sah-trail-dot {
    display: flex; align-items: center; gap: 7px;
    padding: 6px 14px; border-radius: 50px;
    font-size: 0.76rem; font-weight: 700; white-space: nowrap;
    border: 1.5px solid rgba(255,255,255,0.25);
    color: rgba(255,255,255,0.45); background: rgba(255,255,255,0.07);
    transition: all 0.2s;
    cursor: default;
  }
  .sah-trail-dot.active {
    background: var(--accent); color: #fff;
    border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,98,26,0.28);
  }
  .sah-trail-dot.done {
    background: rgba(255,255,255,0.18); color: rgba(255,255,255,0.80);
    border-color: rgba(255,255,255,0.35);
  }
  .sah-trail-dot .sah-tn { font-size: 0.68rem; opacity: 0.75; margin-right: 2px; }
  .sah-trail-arrow {
    color: rgba(255,255,255,0.25); font-size: 0.62rem; margin: 0 6px; flex-shrink: 0;
  }

  /* ── FORM PANEL ── */
  .sah-reg-panel {
    max-width: 860px; margin: 0 auto; padding: 0 24px 80px;
  }

  /* Alert */
  .sah-reg-alert {
    display: flex; align-items: center; gap: 10px;
    background: #fee9e9; color: #a00c2c; border: 1px solid #f5b3b3;
    border-radius: var(--radius); padding: 12px 18px;
    font-weight: 600; font-size: 0.88rem; margin: 24px 0 0;
  }

  /* Step card */
  .sah-step-card {
    background: var(--card-gray); border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg); margin-top: 28px; overflow: hidden;
  }
  .sah-step-card-head {
    background: #5a5a5a; padding: 24px 32px 18px;
  }
  .sah-step-card-head h2 {
    font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 800; color: #fff;
  }
  .sah-step-card-head p { font-size: 0.85rem; color: rgba(255,255,255,0.65); margin-top: 3px; }
  .sah-step-card-body { padding: 28px 32px 24px; }

  /* ── PLAN CARDS (step 1) ── */
  .sah-plan-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px;
  }
  .sah-plan-card {
    border: 2px solid rgba(0,0,0,0.10); border-radius: var(--radius-lg);
    background: var(--card-white); cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
    overflow: hidden;
  }
  .sah-plan-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: var(--shadow-md); }
  .sah-plan-card.selected { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,98,26,0.18), var(--shadow-md); }
  .sah-plan-card-head {
    padding: 18px 20px 14px;
    display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
  }
  .sah-plan-card-head.selected-bg { background: #5a5a5a; }
  .sah-plan-card-name { font-weight: 800; font-size: 1rem; color: var(--dark); }
  .sah-plan-card-name.wt { color: #fff; }
  .sah-plan-card-desc { font-size: 0.74rem; color: var(--muted); margin-top: 2px; }
  .sah-plan-card-desc.wt { color: rgba(255,255,255,0.65); }
  .sah-plan-price-block { text-align: right; flex-shrink: 0; }
  .sah-plan-price {
    font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 900;
    color: var(--accent); line-height: 1;
  }
  .sah-plan-price.wt { color: var(--accent-light); }
  .sah-plan-price small { font-size: 0.65rem; color: var(--muted); font-weight: 400; display: block; text-align: right; font-family: 'DM Sans', sans-serif; }
  .sah-plan-price small.wt { color: rgba(255,255,255,0.5); }
  .sah-plan-radio {
    width: 20px; height: 20px; accent-color: var(--accent); flex-shrink: 0; margin-top: 2px; cursor: pointer;
  }
  .sah-plan-body { padding: 0 20px 18px; border-top: 1px solid var(--border); }
  .sah-plan-features { list-style: none; padding: 0; margin: 14px 0; display: flex; flex-direction: column; gap: 7px; }
  .sah-plan-features li { display: flex; align-items: center; gap: 8px; font-size: 0.83rem; color: var(--mid); }
  .sah-plan-features li.no { color: var(--muted); }
  .sah-ico-yes { color: #16a34a; font-size: 0.7rem; }
  .sah-ico-no { color: #ccc; font-size: 0.7rem; }
  .sah-plan-select-btn {
    width: 100%; padding: 10px; border: none; border-radius: var(--radius);
    background: var(--accent); color: #fff; font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: background 0.15s;
    display: flex; align-items: center; justify-content: center; gap: 7px;
  }
  .sah-plan-select-btn:hover { background: var(--accent-dark); }
  .sah-plan-select-btn.selected { background: #3a3a3a; }

  /* Terms row */
  .sah-terms-row {
    background: var(--card-white); border: 1.5px solid var(--border);
    border-radius: var(--radius); padding: 16px 20px;
    display: flex; align-items: center; gap: 12px;
    font-size: 0.88rem; font-weight: 500; color: var(--mid); cursor: pointer;
  }
  .sah-terms-row.checked { border-color: var(--accent); background: rgba(201,98,26,0.05); }
  .sah-terms-row input[type="checkbox"] { width: 18px; height: 18px; accent-color: var(--accent); cursor: pointer; flex-shrink: 0; }
  .sah-terms-row a { color: var(--accent); font-weight: 700; text-decoration: none; }
  .sah-terms-row a:hover { text-decoration: underline; }

  /* ── FORM FIELDS ── */
  .sah-form-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 18px;
  }
  .sah-field { display: flex; flex-direction: column; gap: 5px; }
  .sah-full { grid-column: 1 / -1; }
  .sah-field label {
    display: flex; align-items: center; gap: 6px;
    font-weight: 700; font-size: 0.74rem; text-transform: uppercase;
    letter-spacing: 0.6px; color: var(--mid);
  }
  .sah-field label i { color: var(--accent); font-size: 0.68rem; }
  .sah-req { color: var(--accent); font-size: 1rem; font-style: normal; }
  .sah-field input, .sah-field select, .sah-field textarea {
    width: 100%; padding: 11px 14px;
    border: 1.5px solid rgba(0,0,0,0.11);
    border-radius: var(--radius);
    background: var(--card-white);
    font-family: 'DM Sans', sans-serif; font-size: 0.92rem; color: var(--dark);
    outline: none; transition: border-color 0.15s, box-shadow 0.15s;
    -webkit-appearance: none; appearance: none;
  }
  .sah-field textarea { resize: vertical; min-height: 90px; }
  .sah-field input:focus, .sah-field select:focus, .sah-field textarea:focus {
    border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,98,26,0.14);
  }
  .sah-field input.err, .sah-field select.err, .sah-field textarea.err {
    border-color: #dc2626; background: #fff8f8;
  }
  .sah-field-err {
    color: #dc2626; font-size: 0.74rem; font-weight: 500;
    display: flex; align-items: center; gap: 4px;
  }

  /* Password */
  .sah-pw-wrap { position: relative; }
  .sah-pw-wrap input { padding-right: 44px; }
  .sah-pw-eye {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; color: var(--muted); cursor: pointer; font-size: 0.9rem; padding: 4px;
  }
  .sah-pw-eye:hover { color: var(--accent); }

  /* Checkbox / radio groups */
  .sah-check-group { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 2px; }
  .sah-check-group label {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 8px 14px; border-radius: 6px;
    border: 1.5px solid var(--border); background: var(--card-white);
    font-size: 0.84rem; font-weight: 600; color: var(--mid);
    cursor: pointer; transition: all 0.14s;
    text-transform: none; letter-spacing: 0;
  }
  .sah-check-group label:hover { border-color: var(--accent); color: var(--accent); }
  .sah-check-group input[type="checkbox"],
  .sah-check-group input[type="radio"] {
    width: auto; padding: 0; border: none; background: none;
    box-shadow: none; accent-color: var(--accent);
    transform: scale(1.1);
  }
  .sah-check-group label:has(input:checked) {
    border-color: var(--accent); background: rgba(201,98,26,0.08); color: var(--accent);
  }

  /* File input */
  .sah-field input[type="file"] {
    padding: 8px 12px; font-size: 0.83rem; cursor: pointer; background: var(--card-white);
  }

  /* Select arrow */
  .sah-field select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center;
    padding-right: 32px; cursor: pointer;
  }

  /* Divider */
  .sah-sec-divider { height: 1px; background: rgba(0,0,0,0.08); margin: 24px 0; }

  /* ── NAV BAR ── */
  .sah-form-nav-wrap {
    background: var(--card-gray); border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md); margin-top: 20px;
    padding: 20px 28px; display: flex; align-items: center;
    justify-content: space-between; gap: 16px;
  }
  .sah-nav-prev {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 22px; border-radius: 50px;
    border: 1.5px solid rgba(0,0,0,0.15); background: var(--card-white);
    color: var(--mid); font-weight: 700; font-size: 0.88rem;
    font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s;
  }
  .sah-nav-prev:hover { border-color: var(--accent); color: var(--accent); }
  .sah-nav-counter {
    text-align: center; font-size: 0.8rem; font-weight: 700; color: var(--muted);
    white-space: nowrap;
  }
  .sah-nav-counter strong { color: var(--accent); font-size: 1rem; }
  .sah-nav-progress {
    height: 4px; background: rgba(0,0,0,0.08); border-radius: 2px;
    margin-top: 6px; overflow: hidden;
  }
  .sah-nav-progress-fill { height: 100%; background: var(--accent); border-radius: 2px; transition: width 0.3s; }
  .sah-nav-next {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 28px; border-radius: 50px;
    border: none; background: var(--accent); color: #fff;
    font-weight: 700; font-size: 0.92rem; font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: background 0.15s, transform 0.15s;
    box-shadow: 0 6px 20px -4px rgba(201,98,26,0.45);
  }
  .sah-nav-next:hover { background: var(--accent-dark); transform: translateY(-1px); }
  .sah-nav-submit {
    background: #3a3a3a; box-shadow: 0 6px 20px -4px rgba(0,0,0,0.3);
  }
  .sah-nav-submit:hover { background: #1e1e1e; }

  /* Spinner */
  .sah-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: sah-spin 0.7s linear infinite; }
  @keyframes sah-spin { to { transform: rotate(360deg); } }

  /* ── RESPONSIVE ── */
  @media (max-width: 700px) {
    .sah-plan-grid { grid-template-columns: 1fr; }
    .sah-form-grid { grid-template-columns: 1fr; }
    .sah-full { grid-column: 1; }
    .sah-step-card-body { padding: 20px 18px; }
    .sah-reg-hero-inner { padding: 36px 16px; }
    .sah-rhdr-inner { padding: 0 16px; }
    .sah-form-nav-wrap { flex-wrap: wrap; }
  }
`;

/* ── STEP DEFINITIONS ── */
const STEPS = [
  { title: 'Select Plan', label: 'Select Plan', desc: 'Choose a listing plan and agree to terms', icon: 'fa-layer-group' },
  { title: 'Account Setup', label: 'Account Setup', desc: 'Create your provider account credentials', icon: 'fa-user-circle' },
  { title: 'Identity & Trust', label: 'Identity & Trust', desc: 'Build trust with your qualifications and bio', icon: 'fa-id-card' },
  { title: 'Services Offered', label: 'Services Offered', desc: 'Tell families what you offer', icon: 'fa-briefcase' },
  { title: 'Location & Reach', label: 'Location & Reach', desc: 'Where can you serve families?', icon: 'fa-map-marker-alt' },
  { title: 'Pricing & Availability', label: 'Pricing', desc: 'Set your rates and schedule', icon: 'fa-calendar-alt' },
  { title: 'Contact Details', label: 'Contact Details', desc: 'How families can reach you — final step', icon: 'fa-phone' },
];
const TOTAL = STEPS.length;

const PLANS = [
  {
    id: 'free', name: 'Community Member', desc: 'Basic profile — always free', price: 'R0',
    param: 'Free Listing – basic profile',
    features: [
      { t: 'Public profile listing', y: true },
      { t: '1 service category', y: true },
      { t: 'Basic contact form', y: true },
      { t: 'Direct contact details visible', y: false },
      { t: 'Featured placement', y: false },
    ],
    cta: 'Get Started Free',
  },
  {
    id: 'pro', name: 'Trusted Provider', desc: 'Full profile + direct contact details', price: 'R149',
    param: 'Professional Listing – R149/month (full contact, direct enquiries)',
    highlight: true,
    features: [
      { t: 'Everything in Community', y: true },
      { t: 'Direct phone & email visible', y: true },
      { t: 'Up to 3 service categories', y: true },
      { t: 'Verified badge on profile', y: true },
      { t: 'Priority in search results', y: true },
    ],
    cta: 'Start Trusted Plan',
  },
  {
    id: 'featured', name: 'Featured Partner', desc: 'Homepage placement + analytics', price: 'R399',
    param: 'Featured Partner – R399/month (homepage placement, analytics)',
    features: [
      { t: 'Everything in Trusted Provider', y: true },
      { t: 'Homepage featured card slot', y: true },
      { t: 'Full analytics dashboard', y: true },
      { t: 'Monthly newsletter feature', y: true },
      { t: 'Dedicated account support', y: true },
    ],
    cta: 'Become a Featured Partner',
  },
];

const Registration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const { showNotification } = useNotification();

  const [step, setStep] = useState(1);
  const [data, setData] = useState({ listingPlan: 'Free Listing – basic profile', terms: false });
  const [alert, setAlert] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const alertRef = useRef(null);
  const topRef = useRef(null);

  useEffect(() => {
    injectHead();
    if (!document.getElementById('sah-reg-css')) {
      const s = document.createElement('style');
      s.id = 'sah-reg-css'; s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const plan = params.get('plan');
    if (plan) setData(p => ({ ...p, listingPlan: decodeURIComponent(plan) }));
  }, [location.search]);

  useEffect(() => {
    if (alert && alertRef.current) alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [alert]);

  useEffect(() => {
    if (topRef.current) topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step]);

  const set = (name, value) => {
    setData(p => ({ ...p, [name]: value }));
    setAlert('');
  };

  const toggleMulti = (name, value, checked) => {
    setData(p => {
      const cur = p[name] || [];
      return { ...p, [name]: checked ? [...cur, value] : cur.filter(v => v !== value) };
    });
    setAlert('');
  };

  /* ── VALIDATION ── */
  const validate = () => {
    if (step === 1) {
      if (!data.listingPlan) return 'Please select a listing plan.';
      if (!data.terms) return 'You must agree to the Terms and Community Guidelines to continue.';
    }
    if (step === 2) {
      if (!data.fullName?.trim()) return 'Full name is required.';
      if (!data.email?.trim() || !/^\S+@\S+\.\S+$/.test(data.email)) return 'A valid email address is required.';
      if (!data.password || data.password.length < 8) return 'Password must be at least 8 characters.';
      if (!data.accountType) return 'Please select an account type.';
    }
    if (step === 3) {
      if (!data.bio?.trim()) return 'A short bio is required.';
      if (!data.experience && data.experience !== 0) return 'Years of experience is required.';
    }
    if (step === 4) {
      if (!data.primaryCat) return 'Please select a primary category.';
      if (!data.serviceTitle?.trim()) return 'Service title is required.';
      if (!data.serviceDesc?.trim()) return 'Service description is required.';
      if (!data.subjects?.trim()) return 'Subjects / Specialisations are required.';
      if (!data.ageGroups?.length) return 'Please select at least one age group.';
      if (!data.deliveryMode) return 'Please select a delivery mode.';
    }
    if (step === 5) {
      if (!data.city?.trim()) return 'City is required.';
      if (!data.province) return 'Province is required.';
      if (!data.serviceArea) return 'Please select a service area.';
    }
    if (step === 6) {
      if (!data.pricingModel) return 'Please select a pricing model.';
      if (!data.daysAvailable?.length) return 'Please select at least one available day.';
      if (!data.timeSlots?.trim()) return 'Please enter your available time slots.';
    }
    if (step === 7) {
      if (!data.phone?.trim()) return 'Phone number is required.';
      if (!data.inquiryEmail?.trim() || !/^\S+@\S+\.\S+$/.test(data.inquiryEmail)) return 'A valid enquiry email is required.';
    }
    return null;
  };

  const next = () => {
    const err = validate();
    if (err) { setAlert(err); return; }
    setAlert('');
    if (step < TOTAL) { setStep(s => s + 1); return; }
    submit();
  };

  const prev = () => { setAlert(''); setStep(s => s - 1); };

  const submit = async () => {
    setSubmitting(true);
    const planMap = {
      'Free Listing – basic profile': 'free',
      'Professional Listing – R149/month (full contact, direct enquiries)': 'pro',
      'Featured Partner – R399/month (homepage placement, analytics)': 'featured',
    };
    const catMap = {
      'Tutor': 'tutor', 'Therapist': 'therapist', 'Curriculum Provider': 'curriculum',
      'Online / Hybrid School': 'school', 'Educational Consultant': 'consultant',
      'Extracurricular / Enrichment': 'extracurricular',
    };
    const tier = planMap[data.listingPlan] || 'free';
    const newProvider = {
      id: 'prov_' + Date.now(), name: data.fullName || '', email: data.email || '',
      category: catMap[data.primaryCat] || 'tutor', primaryCategory: data.primaryCat || '',
      location: data.city ? `${data.city}, ${data.province}` : '',
      city: data.city || '', province: data.province || '',
      delivery: data.deliveryMode || '', deliveryMode: data.deliveryMode || '',
      priceFrom: data.startingPrice || 'Contact', startingPrice: data.startingPrice || 'Contact',
      tier, listingPlan: tier, badge: tier === 'featured' ? 'featured' : tier === 'pro' ? 'verified' : null,
      status: 'pending', registered: new Date().toISOString(), bio: data.bio || '',
      tags: data.subjects ? data.subjects.split(',').map(s => s.trim()) : [],
      ageGroups: data.ageGroups || [],
      availabilityDays: (data.daysAvailable || []).map(d => d.slice(0, 3)),
      availabilityNotes: data.timeSlots || '', phone: data.phone || '',
      contactEmail: data.inquiryEmail || data.email || '', certifications: '',
      social: data.website || '',
      serviceAreaType: data.serviceArea === 'National' ? 'national' : data.serviceArea === 'Online only' ? 'online' : 'local',
      radius: data.localRadius || '', pricingModel: data.pricingModel || '',
      serviceTitle: data.serviceTitle || '', image: null, rating: null,
      reviewCount: 0, reviews: { average: 0, count: 0, items: [] },
    };
    try {
      const existing = JSON.parse(localStorage.getItem('sah_providers') || '[]');
      existing.push(newProvider);
      localStorage.setItem('sah_providers', JSON.stringify(existing));
      localStorage.setItem('sah_current_user', JSON.stringify({
        role: 'client', email: newProvider.email, id: newProvider.id, name: newProvider.name, plan: tier,
      }));
      showNotification?.('✅ Registration successful! Your profile is pending approval.', 'success');
      setTimeout(() => navigate('/client-dashboard'), 1800);
    } catch (e) {
      setAlert('Registration failed. Please try again.'); setSubmitting(false);
    }
  };

  /* ── RENDER PLAN STEP ── */
  const renderPlanStep = () => (
    <>
      <div className="sah-plan-grid">
        {PLANS.map(plan => {
          const selected = data.listingPlan === plan.param;
          return (
            <div
              key={plan.id}
              className={`sah-plan-card${selected ? ' selected' : ''}`}
              onClick={() => set('listingPlan', plan.param)}
            >
              <div className={`sah-plan-card-head${selected ? ' selected-bg' : ''}`}>
                <div>
                  <div className={`sah-plan-card-name${selected ? ' wt' : ''}`}>{plan.name}</div>
                  <div className={`sah-plan-card-desc${selected ? ' wt' : ''}`}>{plan.desc}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <div className="sah-plan-price-block">
                    <div className={`sah-plan-price${selected ? ' wt' : ''}`}>
                      {plan.price} <small className={selected ? 'wt' : ''}>/month</small>
                    </div>
                  </div>
                  <input
                    type="radio" className="sah-plan-radio"
                    name="listingPlan" value={plan.param}
                    checked={selected}
                    onChange={() => set('listingPlan', plan.param)}
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              </div>
              <div className="sah-plan-body">
                <ul className="sah-plan-features">
                  {plan.features.map((f, i) => (
                    <li key={i} className={f.y ? '' : 'no'}>
                      {f.y
                        ? <i className="fas fa-check sah-ico-yes" />
                        : <i className="fas fa-times sah-ico-no" />}
                      {f.t}
                    </li>
                  ))}
                </ul>
                <button
                  className={`sah-plan-select-btn${selected ? ' selected' : ''}`}
                  onClick={e => { e.stopPropagation(); set('listingPlan', plan.param); }}
                >
                  {selected ? <><i className="fas fa-check" /> Selected</> : plan.cta}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Terms */}
      <label className={`sah-terms-row${data.terms ? ' checked' : ''}`}>
        <input
          type="checkbox" checked={!!data.terms}
          onChange={e => set('terms', e.target.checked)}
        />
        <span>
          I agree to the <a href="/terms" target="_blank" rel="noreferrer">Terms and Community Guidelines</a> — by registering you confirm your details are accurate.
        </span>
      </label>
    </>
  );

  /* ── RENDER FIELDS FOR STEPS 2-7 ── */
  const F = ({ name, label, type = 'text', placeholder = '', required = false, half = false, children }) => (
    <div className={`sah-field${half ? '' : ' sah-full'}`}>
      <label>
        <i className={`fas ${type === 'email' ? 'fa-envelope' : type === 'password' ? 'fa-lock' : type === 'tel' ? 'fa-phone' : type === 'url' ? 'fa-globe' : type === 'number' ? 'fa-hashtag' : type === 'file' ? 'fa-upload' : type === 'select' ? 'fa-chevron-down' : type === 'textarea' ? 'fa-align-left' : 'fa-edit'}`} />
        {label} {required && <em className="sah-req">*</em>}
      </label>
      {children}
    </div>
  );

  const Input = ({ name, type = 'text', placeholder = '', required = false, half = false, min, max }) => (
    <F name={name} label="" type={type} required={required} half={half}>
      <input
        type={type} value={data[name] || ''} placeholder={placeholder}
        onChange={e => set(name, e.target.value)}
        min={min} max={max}
      />
    </F>
  );

  const renderStep2 = () => (
    <div className="sah-form-grid">
      <div className="sah-field sah-full">
        <label><i className="fas fa-user" /> Full Name / Business Name <em className="sah-req">*</em></label>
        <input type="text" value={data.fullName || ''} placeholder="e.g. Thando Mkhize or Bright Minds Learning" onChange={e => set('fullName', e.target.value)} />
      </div>
      <div className="sah-field">
        <label><i className="fas fa-envelope" /> Email Address <em className="sah-req">*</em></label>
        <input type="email" value={data.email || ''} placeholder="name@example.com" onChange={e => set('email', e.target.value)} />
      </div>
      <div className="sah-field">
        <label><i className="fas fa-lock" /> Password <em className="sah-req">*</em></label>
        <div className="sah-pw-wrap">
          <input type={showPw ? 'text' : 'password'} value={data.password || ''} placeholder="Min. 8 characters" onChange={e => set('password', e.target.value)} />
          <button type="button" className="sah-pw-eye" onClick={() => setShowPw(s => !s)}><i className={`far fa-eye${showPw ? '-slash' : ''}`} /></button>
        </div>
      </div>
      <div className="sah-field sah-full">
        <label><i className="fas fa-building" /> Account Type <em className="sah-req">*</em></label>
        <select value={data.accountType || ''} onChange={e => set('accountType', e.target.value)}>
          <option value="">-- Select --</option>
          <option>Individual Provider</option>
          <option>Organisation / Company</option>
        </select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="sah-form-grid">
      <div className="sah-field">
        <label><i className="fas fa-upload" /> Profile Photo / Logo</label>
        <input type="file" accept="image/*" onChange={e => set('profilePhoto', e.target.files[0])} />
      </div>
      <div className="sah-field">
        <label><i className="fas fa-hashtag" /> Years of Experience <em className="sah-req">*</em></label>
        <input type="number" value={data.experience ?? ''} placeholder="e.g. 8" min={0} max={60} onChange={e => set('experience', e.target.value)} />
      </div>
      <div className="sah-field sah-full">
        <label><i className="fas fa-align-left" /> Short Bio (150–250 words) <em className="sah-req">*</em></label>
        <textarea value={data.bio || ''} placeholder="Tell families about your teaching philosophy, experience, and approach..." onChange={e => set('bio', e.target.value)} />
      </div>
      <div className="sah-field">
        <label><i className="fas fa-upload" /> Qualifications / Certifications</label>
        <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" onChange={e => set('certs', e.target.files[0])} />
      </div>
      <div className="sah-field">
        <label><i className="fas fa-upload" /> Police Clearance (optional)</label>
        <input type="file" accept=".pdf,.jpg,.png" onChange={e => set('clearance', e.target.files[0])} />
      </div>
      <div className="sah-field sah-full">
        <label><i className="fas fa-check-square" /> Languages Spoken</label>
        <div className="sah-check-group">
          {['English','Afrikaans','isiZulu','isiXhosa','Sepedi','Setswana','Sesotho','Xitsonga','SiSwati','Tshivenda','isiNdebele','Other'].map(lang => (
            <label key={lang}>
              <input type="checkbox" value={lang} checked={(data.languages || []).includes(lang)} onChange={e => toggleMulti('languages', lang, e.target.checked)} />
              {lang}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="sah-form-grid">
      <div className="sah-field">
        <label><i className="fas fa-chevron-down" /> Primary Category <em className="sah-req">*</em></label>
        <select value={data.primaryCat || ''} onChange={e => set('primaryCat', e.target.value)}>
          <option value="">-- Select --</option>
          {['Tutor','Therapist','Curriculum Provider','Online / Hybrid School','Educational Consultant','Extracurricular / Enrichment'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="sah-field">
        <label><i className="fas fa-check-square" /> Secondary Categories</label>
        <div className="sah-check-group">
          {['Tutor','Therapist','Curriculum','School','Consultant','Enrichment'].map(c => (
            <label key={c}>
              <input type="checkbox" value={c} checked={(data.secondaryCats || []).includes(c)} onChange={e => toggleMulti('secondaryCats', c, e.target.checked)} />
              {c}
            </label>
          ))}
        </div>
      </div>
      <div className="sah-field sah-full">
        <label><i className="fas fa-edit" /> Service Title <em className="sah-req">*</em></label>
        <input type="text" value={data.serviceTitle || ''} placeholder="e.g. Mathematics Tutor for Grades 10–12" onChange={e => set('serviceTitle', e.target.value)} />
      </div>
      <div className="sah-field sah-full">
        <label><i className="fas fa-align-left" /> Service Description <em className="sah-req">*</em></label>
        <textarea value={data.serviceDesc || ''} placeholder="Describe what you offer, your methods, and what makes you unique..." onChange={e => set('serviceDesc', e.target.value)} />
      </div>
      <div className="sah-field">
        <label><i className="fas fa-edit" /> Subjects / Specialisations <em className="sah-req">*</em></label>
        <input type="text" value={data.subjects || ''} placeholder="e.g. Mathematics, Phonics, OT, ADHD support" onChange={e => set('subjects', e.target.value)} />
      </div>
      <div className="sah-field">
        <label><i className="fas fa-check-square" /> Age Groups <em className="sah-req">*</em></label>
        <div className="sah-check-group">
          {['5–7','8–10','11–13','14–18'].map(ag => (
            <label key={ag}>
              <input type="checkbox" value={ag} checked={(data.ageGroups || []).includes(ag)} onChange={e => toggleMulti('ageGroups', ag, e.target.checked)} />
              {ag}
            </label>
          ))}
        </div>
      </div>
      <div className="sah-field sah-full">
        <label><i className="fas fa-dot-circle" /> Delivery Mode <em className="sah-req">*</em></label>
        <div className="sah-check-group">
          {['Online','In-person','Hybrid (Online & In-person)'].map(m => (
            <label key={m}>
              <input type="radio" name="deliveryMode" value={m} checked={data.deliveryMode === m} onChange={() => set('deliveryMode', m)} />
              {m}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="sah-form-grid">
      <div className="sah-field">
        <label><i className="fas fa-city" /> City <em className="sah-req">*</em></label>
        <input type="text" value={data.city || ''} placeholder="e.g. Cape Town" onChange={e => set('city', e.target.value)} />
      </div>
      <div className="sah-field">
        <label><i className="fas fa-chevron-down" /> Province <em className="sah-req">*</em></label>
        <select value={data.province || ''} onChange={e => set('province', e.target.value)}>
          <option value="">-- Select --</option>
          {['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','Northern Cape','North West','Western Cape'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="sah-field sah-full">
        <label><i className="fas fa-dot-circle" /> Service Area <em className="sah-req">*</em></label>
        <div className="sah-check-group">
          {['Local (X km)','National','Online only'].map(m => (
            <label key={m}>
              <input type="radio" name="serviceArea" value={m} checked={data.serviceArea === m} onChange={() => set('serviceArea', m)} />
              {m}
            </label>
          ))}
        </div>
      </div>
      {data.serviceArea === 'Local (X km)' && (
        <div className="sah-field">
          <label><i className="fas fa-route" /> Local Radius</label>
          <input type="text" value={data.localRadius || ''} placeholder="e.g. 30 km" onChange={e => set('localRadius', e.target.value)} />
        </div>
      )}
    </div>
  );

  const renderStep6 = () => (
    <div className="sah-form-grid">
      <div className="sah-field">
        <label><i className="fas fa-chevron-down" /> Pricing Model <em className="sah-req">*</em></label>
        <select value={data.pricingModel || ''} onChange={e => set('pricingModel', e.target.value)}>
          <option value="">-- Select --</option>
          {['Hourly','Per package','Per term','Custom quote'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="sah-field">
        <label><i className="fas fa-tag" /> Starting Price (optional)</label>
        <input type="text" value={data.startingPrice || ''} placeholder="e.g. R350/session" onChange={e => set('startingPrice', e.target.value)} />
      </div>
      <div className="sah-field sah-full">
        <label><i className="fas fa-check-square" /> Days Available <em className="sah-req">*</em></label>
        <div className="sah-check-group">
          {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => (
            <label key={d}>
              <input type="checkbox" value={d} checked={(data.daysAvailable || []).includes(d)} onChange={e => toggleMulti('daysAvailable', d, e.target.checked)} />
              {d}
            </label>
          ))}
        </div>
      </div>
      <div className="sah-field sah-full">
        <label><i className="fas fa-clock" /> Time Slots <em className="sah-req">*</em></label>
        <input type="text" value={data.timeSlots || ''} placeholder="e.g. 9:00–14:00, 15:30–17:30" onChange={e => set('timeSlots', e.target.value)} />
      </div>
    </div>
  );

  const renderStep7 = () => (
    <div className="sah-form-grid">
      <div className="sah-field">
        <label><i className="fas fa-phone" /> Phone Number <em className="sah-req">*</em></label>
        <input type="tel" value={data.phone || ''} placeholder="+27 71 234 5678" onChange={e => set('phone', e.target.value)} />
      </div>
      <div className="sah-field">
        <label><i className="fab fa-whatsapp" /> WhatsApp Number</label>
        <input type="tel" value={data.whatsapp || ''} placeholder="+27 71 234 5678" onChange={e => set('whatsapp', e.target.value)} />
      </div>
      <div className="sah-field sah-full">
        <label><i className="fas fa-envelope" /> Email for Enquiries <em className="sah-req">*</em></label>
        <input type="email" value={data.inquiryEmail || ''} placeholder="contact@example.com" onChange={e => set('inquiryEmail', e.target.value)} />
      </div>
      <div className="sah-field">
        <label><i className="fas fa-globe" /> Website</label>
        <input type="url" value={data.website || ''} placeholder="https://yourwebsite.co.za" onChange={e => set('website', e.target.value)} />
      </div>
      <div className="sah-field">
        <label><i className="fab fa-facebook-f" /> Facebook</label>
        <input type="url" value={data.facebook || ''} placeholder="https://facebook.com/yourpage" onChange={e => set('facebook', e.target.value)} />
      </div>
      <div className="sah-field">
        <label><i className="fab fa-instagram" /> Instagram</label>
        <input type="url" value={data.instagram || ''} placeholder="https://instagram.com/yourprofile" onChange={e => set('instagram', e.target.value)} />
      </div>
      <div className="sah-field">
        <label><i className="fab fa-linkedin-in" /> LinkedIn</label>
        <input type="url" value={data.linkedin || ''} placeholder="https://linkedin.com/in/yourname" onChange={e => set('linkedin', e.target.value)} />
      </div>
      <div className="sah-field">
        <label><i className="fab fa-tiktok" /> TikTok</label>
        <input type="url" value={data.tiktok || ''} placeholder="https://tiktok.com/@yourhandle" onChange={e => set('tiktok', e.target.value)} />
      </div>
    </div>
  );

  const RENDERERS = [renderPlanStep, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6, renderStep7];
  const pct = Math.round((step / TOTAL) * 100);

  return (
    <div className="sah-reg-wrap" ref={topRef}>

      {/* ── HEADER ── */}
      <header className="sah-rhdr">
        <div className="sah-rhdr-inner">
          <div className="sah-rhdr-left">
            <button className="sah-rhdr-back" onClick={() => navigate('/')}>
              <i className="fas fa-arrow-left" /> Back to Directory
            </button>
            <div className="sah-rhdr-div" />
            <Link to="/" className="sah-rhdr-brand">
              <span className="sah-rhdr-brand-name">SA Homeschooling</span>
              <span className="sah-rhdr-brand-tag">Education Services Directory</span>
            </Link>
          </div>
          <div className="sah-rhdr-right">
            <Link to="/login" className="sah-rhdr-ghost">Already registered? Log in</Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="sah-reg-hero">
        <div className="sah-reg-hero-bg" />
        <div className="sah-reg-hero-inner">
          <h1 className="sah-reg-hero-title">
            Become a <em>Trusted Provider</em>
          </h1>
          {/* Async step trail */}
          <div className="sah-step-trail">
            {STEPS.map((s, i) => {
              const n = i + 1;
              const isActive = n === step;
              const isDone = n < step;
              return (
                <div key={n} className="sah-trail-item">
                  <div className={`sah-trail-dot${isActive ? ' active' : isDone ? ' done' : ''}`}>
                    {isDone
                      ? <i className="fas fa-check" style={{ fontSize: '0.65rem' }} />
                      : <span className="sah-tn">{n}</span>}
                    {s.label}
                  </div>
                  {i < STEPS.length - 1 && <i className="fas fa-chevron-right sah-trail-arrow" />}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FORM PANEL ── */}
      <div className="sah-reg-panel">
        {alert && (
          <div className="sah-reg-alert" ref={alertRef}>
            <i className="fas fa-exclamation-triangle" /> {alert}
          </div>
        )}

        {/* Step card */}
        <div className="sah-step-card">
          <div className="sah-step-card-head">
            <h2><i className={`fas ${STEPS[step - 1].icon}`} style={{ marginRight: 10, color: 'var(--accent-light)', fontSize: '1.1rem' }} />Step {step}: {STEPS[step - 1].title}</h2>
            <p>{STEPS[step - 1].desc}</p>
          </div>
          <div className="sah-step-card-body">
            {RENDERERS[step - 1]()}
          </div>
        </div>

        {/* Navigation bar with step counter in the middle */}
        <div className="sah-form-nav-wrap">
          {step > 1 ? (
            <button className="sah-nav-prev" onClick={prev}>
              <i className="fas fa-arrow-left" /> Previous
            </button>
          ) : <div />}

          <div className="sah-nav-counter">
            <strong>{step}</strong> of {TOTAL} steps
            <div className="sah-nav-progress">
              <div className="sah-nav-progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <button className={`sah-nav-next${step === TOTAL ? ' sah-nav-submit' : ''}`} onClick={next} disabled={submitting}>
            {submitting ? <span className="sah-spinner" /> : null}
            {step < TOTAL
              ? <><span>Next</span> <i className="fas fa-arrow-right" /></>
              : <><i className="fas fa-check-circle" /> <span>Create My Profile</span></>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Registration;