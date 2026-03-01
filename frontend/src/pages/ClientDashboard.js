// frontend/src/pages/ClientDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ProfileSection from '../components/client/ProfileSection';
import ServiceItem from '../components/client/ServiceItem';
import PlanSelector from '../components/client/PlanSelector';
import TagsInput from '../components/client/TagsInput';
import { PLAN_LIMITS, DAYS_OF_WEEK, PRICING_MODELS, PROVINCES } from '../utils/constants';
import { getPlanLimits } from '../utils/helpers';
import '../assets/css/dashboard.css';

// Add custom CSS for spacing
const dashboardSpacingCSS = `
  .profile-field {
    margin-bottom: 24px !important;
  }
  
  .inline-group {
    display: flex;
    gap: 24px !important;
    margin-bottom: 24px !important;
  }
  
  .inline-group > * {
    flex: 1;
  }
  
  .qualification-item {
    margin-bottom: 24px !important;
  }
  
  .service-item {
    margin-bottom: 32px !important;
    padding: 24px !important;
    background: #f9f9f9;
    border-radius: 12px;
  }
  
  .days-multi {
    margin-bottom: 16px !important;
  }
  
  .contact-block {
    margin-bottom: 24px !important;
  }
  
  .contact-details {
    display: flex;
    gap: 12px !important;
    margin-top: 12px !important;
  }
  
  .contact-details input,
  .contact-details span {
    padding: 8px 12px !important;
  }
  
  .social-links-preview {
    margin-top: 12px !important;
  }
  
  .reviews-section {
    margin-top: 32px !important;
    margin-bottom: 24px !important;
  }
  
  .review-item {
    margin-bottom: 16px !important;
    padding: 16px !important;
    background: #f5f5f5;
    border-radius: 8px;
  }
  
  .section-label {
    margin: 32px 0 16px 0 !important;
    padding-bottom: 8px !important;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .profile-field input,
  .profile-field select,
  .profile-field textarea {
    margin-top: 6px !important;
  }
  
  .add-service-btn {
    margin-right: 16px !important;
  }
  
  .service-counter {
    margin-left: 8px !important;
  }
  
  .card-footer {
    margin-top: 32px !important;
    padding-top: 24px !important;
  }
`;

// ── Read/write the logged-in provider's data from localStorage ──
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('sah_current_user') || 'null'); }
  catch { return null; }
}

function getProviderById(id) {
  try {
    const all = JSON.parse(localStorage.getItem('sah_providers') || '[]');
    return all.find(p => p.id === id) || null;
  } catch { return null; }
}

function saveProviderById(updatedProvider) {
  try {
    const all = JSON.parse(localStorage.getItem('sah_providers') || '[]');
    const idx = all.findIndex(p => p.id === updatedProvider.id);
    if (idx !== -1) { all[idx] = updatedProvider; } else { all.push(updatedProvider); }
    localStorage.setItem('sah_providers', JSON.stringify(all));
  } catch {}
}

const EMPTY_PROFILE = {
  id: '', name: '', email: '', accountType: 'Individual Provider',
  yearsExperience: '', languages: [], primaryCategory: '', secondaryCategories: [],
  tags: [], bio: '', degrees: '', certifications: '', memberships: '', clearance: '',
  services: [{ title: '', description: '', ageGroups: [], deliveryMode: 'Online', subjects: '' }],
  serviceTitle: '', serviceDesc: '', subjects: '', ageGroups: [],
  province: '', city: '', serviceAreas: [], serviceAreaType: 'national', radius: '',
  deliveryMode: '', pricingModel: '', startingPrice: '',
  availabilityDays: [], availabilityNotes: '',
  contactName: '', phone: '', whatsapp: '', contactEmail: '',
  social: '', website: '', facebook: '', publicToggle: true,
  plan: 'free', listingPublic: true, status: 'pending',
  image: null, photo: null,
  reviews: { average: 0, count: 0, items: [] },
};

/* ── Inline CSS for professional look ── */
const DASH_CSS = `
  .cd-wrap {
    font-family: 'DM Sans', 'Segoe UI', sans-serif;
    background: #f4f1ec;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }
  .cd-hero {
    background: linear-gradient(135deg, #3a3a3a 0%, #5a5a5a 60%, #c9621a 100%);
    padding: 48px 0 36px;
    position: relative;
    overflow: hidden;
  }
  .cd-hero::before {
    content: '';
    position: absolute; inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .cd-hero-inner {
    max-width: 1200px; margin: 0 auto; padding: 0 32px;
    position: relative; z-index: 1;
    display: flex; align-items: flex-start; justify-content: space-between; gap: 24px;
    flex-wrap: wrap;
  }
  .cd-hero-left { flex: 1; min-width: 0; }
  .cd-hero-eyebrow {
    font-size: 0.7rem; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
    color: rgba(255,255,255,0.55); margin-bottom: 8px; display: flex; align-items: center; gap: 8px;
  }
  .cd-hero-eyebrow span { width: 24px; height: 1px; background: rgba(255,255,255,0.35); display: inline-block; }
  .cd-hero-title {
    font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 800; color: #fff;
    margin: 0 0 12px; line-height: 1.15;
    font-family: 'Playfair Display', Georgia, serif;
  }
  .cd-hero-title em { font-style: italic; color: #f0c89a; }
  .cd-hero-meta { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
  .cd-status-pill {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 6px 16px; border-radius: 50px; font-size: 0.78rem; font-weight: 700;
  }
  .cd-status-pill.pending { background: rgba(245,158,11,0.2); color: #fbbf24; border: 1px solid rgba(245,158,11,0.35); }
  .cd-status-pill.approved { background: rgba(16,185,129,0.2); color: #34d399; border: 1px solid rgba(16,185,129,0.35); }
  .cd-status-pill.rejected { background: rgba(239,68,68,0.2); color: #f87171; border: 1px solid rgba(239,68,68,0.35); }
  .cd-hero-right { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .cd-btn-ghost {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 20px; border-radius: 8px;
    border: 1.5px solid rgba(255,255,255,0.4); background: rgba(255,255,255,0.08);
    color: #fff; font-size: 0.85rem; font-weight: 600; cursor: pointer;
    font-family: inherit; transition: all 0.18s; text-decoration: none; white-space: nowrap;
  }
  .cd-btn-ghost:hover { background: rgba(255,255,255,0.18); border-color: rgba(255,255,255,0.7); }
  .cd-btn-solid {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 20px; border-radius: 8px;
    border: none; background: #c9621a;
    color: #fff; font-size: 0.85rem; font-weight: 700; cursor: pointer;
    font-family: inherit; transition: all 0.18s; white-space: nowrap;
    box-shadow: 0 4px 16px rgba(201,98,26,0.4);
  }
  .cd-btn-solid:hover { background: #a84e12; transform: translateY(-1px); }
  .cd-btn-solid.cancel { background: #6b7280; box-shadow: none; }
  .cd-btn-solid.cancel:hover { background: #4b5563; }

  /* Main layout */
  .cd-main { max-width: 1200px; margin: 0 auto; padding: 32px 32px 80px; }
  .cd-grid { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }

  /* Cards */
  .cd-card {
    background: #fff; border-radius: 14px; overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05);
    margin-bottom: 20px; border: 1px solid rgba(0,0,0,0.06);
  }
  .cd-card-header {
    display: flex; align-items: center; gap: 12px;
    padding: 18px 24px; border-bottom: 1px solid #f0ece5;
    background: #faf9f7;
  }
  .cd-card-header-icon {
    width: 36px; height: 36px; border-radius: 9px;
    background: linear-gradient(135deg, #c9621a, #e07a35);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 0.85rem; flex-shrink: 0;
  }
  .cd-card-title { font-size: 0.95rem; font-weight: 700; color: #1a1a1a; margin: 0; }
  .cd-card-subtitle { font-size: 0.75rem; color: #888; margin: 1px 0 0; }
  .cd-card-body { padding: 24px; }
  .cd-card-body.tight { padding: 18px 24px; }

  /* Edit mode toggle */
  .cd-edit-toggle {
    margin-left: auto; display: inline-flex; align-items: center; gap: 7px;
    padding: 6px 14px; border-radius: 6px; cursor: pointer;
    font-size: 0.78rem; font-weight: 700; border: 1.5px solid;
    transition: all 0.15s; font-family: inherit;
  }
  .cd-edit-toggle.inactive { border-color: #d1d5db; background: transparent; color: #6b7280; }
  .cd-edit-toggle.inactive:hover { border-color: #c9621a; color: #c9621a; }
  .cd-edit-toggle.active { border-color: #c9621a; background: #fef3e8; color: #c9621a; }

  /* Form fields */
  .cd-field { margin-bottom: 18px; }
  .cd-field:last-child { margin-bottom: 0; }
  .cd-label {
    display: block; font-size: 0.71rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.8px; color: #888; margin-bottom: 6px;
  }
  .cd-label .req { color: #c9621a; }
  .cd-value {
    font-size: 0.9rem; color: #1a1a1a; padding: 10px 0;
    border-bottom: 1px solid #f0ece5; min-height: 38px;
    display: flex; align-items: center;
  }
  .cd-value.empty { color: #bbb; font-style: italic; }
  .cd-input {
    width: 100%; padding: 10px 14px;
    border: 1.5px solid #e5e0d8; border-radius: 8px;
    background: #faf9f7; font-family: inherit;
    font-size: 0.9rem; color: #1a1a1a; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    -webkit-appearance: none; appearance: none;
  }
  .cd-input:focus { border-color: #c9621a; box-shadow: 0 0 0 3px rgba(201,98,26,0.12); }
  .cd-textarea { resize: vertical; min-height: 90px; }
  .cd-select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; cursor: pointer;
  }

  /* Grid helpers */
  .cd-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .cd-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }

  /* Section label */
  .cd-sec-label {
    font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
    color: #c9621a; display: flex; align-items: center; gap: 8px;
    padding-bottom: 10px; border-bottom: 1px solid #f0ece5; margin: 20px 0 16px;
  }
  .cd-sec-label i { opacity: 0.85; }

  /* Days grid */
  .cd-days { display: flex; flex-wrap: wrap; gap: 8px; }
  .cd-day-chip {
    padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 600;
    cursor: default; transition: all 0.15s;
  }
  .cd-day-chip.on { background: #c9621a; color: #fff; }
  .cd-day-chip.off { background: #f0ece5; color: #bbb; border: 1px solid #e5e0d8; }
  .cd-day-chip.editable { cursor: pointer; }
  .cd-day-chip.editable.off:hover { border-color: #c9621a; color: #c9621a; }

  /* Tags */
  .cd-tags { display: flex; flex-wrap: wrap; gap: 8px; }
  .cd-tag {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 12px; border-radius: 20px;
    background: #fef3e8; color: #c9621a; border: 1px solid #f0c89a;
    font-size: 0.78rem; font-weight: 600;
  }
  .cd-tag button { background: none; border: none; cursor: pointer; color: #c9621a; font-size: 0.7rem; padding: 0; line-height: 1; }

  /* Plan badge */
  .cd-plan-badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 18px; border-radius: 10px; font-size: 0.85rem; font-weight: 700;
    border: 2px solid;
  }
  .cd-plan-badge.free { background: #f9f9f9; color: #666; border-color: #e5e5e5; }
  .cd-plan-badge.pro { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
  .cd-plan-badge.featured { background: #fffbeb; color: #d97706; border-color: #fde68a; }

  /* Review item */
  .cd-review {
    padding: 14px 16px; background: #faf9f7; border-radius: 10px;
    border-left: 3px solid #c9621a; margin-bottom: 10px;
  }
  .cd-review-stars { color: #f59e0b; font-size: 0.85rem; margin-bottom: 4px; }
  .cd-review-text { font-size: 0.87rem; color: #555; font-style: italic; }
  .cd-review-author { font-size: 0.75rem; color: #888; margin-top: 4px; font-weight: 600; }

  /* Contact block */
  .cd-contact-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 0; border-bottom: 1px solid #f0ece5;
  }
  .cd-contact-item:last-child { border-bottom: none; }
  .cd-contact-icon {
    width: 34px; height: 34px; border-radius: 8px; background: #fef3e8;
    display: flex; align-items: center; justify-content: center;
    color: #c9621a; font-size: 0.85rem; flex-shrink: 0;
  }
  .cd-contact-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #aaa; }
  .cd-contact-val { font-size: 0.88rem; color: #1a1a1a; font-weight: 500; }

  /* Service card */
  .cd-service-card {
    background: #faf9f7; border: 1px solid #e5e0d8; border-radius: 10px;
    padding: 16px 18px; margin-bottom: 12px; position: relative;
  }
  .cd-service-card.editing { border-color: #c9621a; background: #fff; }

  /* Sidebar cards */
  .cd-sidebar-card {
    background: #fff; border-radius: 14px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.07); margin-bottom: 16px;
    border: 1px solid rgba(0,0,0,0.06); overflow: hidden;
  }
  .cd-sidebar-header { padding: 14px 18px; background: #5a5a5a; }
  .cd-sidebar-title { font-size: 0.8rem; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 0.7px; }
  .cd-sidebar-body { padding: 16px 18px; }

  /* Stat box */
  .cd-stat { text-align: center; padding: 16px 8px; }
  .cd-stat-val { font-size: 1.8rem; font-weight: 800; color: #c9621a; line-height: 1; }
  .cd-stat-label { font-size: 0.72rem; color: #888; text-transform: uppercase; letter-spacing: 0.6px; margin-top: 4px; }

  /* Toggle switch */
  .cd-toggle-row { display: flex; align-items: center; justify-content: space-between; }
  .cd-switch { position: relative; display: inline-block; width: 42px; height: 24px; }
  .cd-switch input { opacity: 0; width: 0; height: 0; }
  .cd-slider {
    position: absolute; cursor: pointer; inset: 0;
    background: #d1d5db; border-radius: 24px; transition: 0.2s;
  }
  .cd-slider::before {
    content: ''; position: absolute;
    height: 18px; width: 18px; left: 3px; bottom: 3px;
    background: white; border-radius: 50%; transition: 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  .cd-switch input:checked + .cd-slider { background: #c9621a; }
  .cd-switch input:checked + .cd-slider::before { transform: translateX(18px); }

  /* Footer bar */
  .cd-footer-bar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px; background: #faf9f7; border-top: 1px solid #f0ece5;
    gap: 12px; flex-wrap: wrap;
  }
  .cd-last-edit { font-size: 0.75rem; color: #aaa; display: flex; align-items: center; gap: 5px; }

  /* Clearance badge */
  .cd-clearance {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 12px; border-radius: 6px;
    background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;
    font-size: 0.78rem; font-weight: 700;
  }

  /* Info note */
  .cd-info-note {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 12px 16px; background: #fffbeb; border-radius: 8px;
    border: 1px solid #fde68a; font-size: 0.8rem; color: #92400e;
    margin: 0 0 16px;
  }
  .cd-info-note i { color: #f59e0b; margin-top: 1px; flex-shrink: 0; }

  /* File qual upload note */
  .cd-qual-parsed {
    padding: 12px 16px; background: #ecfdf5; border-radius: 8px;
    border: 1px solid #a7f3d0; font-size: 0.8rem; color: #065f46;
    margin-top: 10px; display: flex; align-items: center; gap: 8px;
  }

  @media (max-width: 900px) {
    .cd-grid { grid-template-columns: 1fr; }
    .cd-main { padding: 20px 16px 60px; }
    .cd-hero-inner { flex-direction: column; }
    .cd-row { grid-template-columns: 1fr; }
    .cd-row-3 { grid-template-columns: 1fr 1fr; }
  }
`;

const ClientDashboard = () => {
  const { user, updateUserPlan } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [editModeActive, setEditModeActive] = useState(false);
  const [originalValues, setOriginalValues] = useState({});
  const [profileData, setProfileData] = useState(EMPTY_PROFILE);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Inject CSS
  useEffect(() => {
    if (!document.getElementById('cd-styles')) {
      const style = document.createElement('style');
      style.id = 'cd-styles';
      style.textContent = DASH_CSS;
      document.head.appendChild(style);
    }
    // Also load fonts if not already loaded
    if (!document.getElementById('cd-fonts')) {
      const link = document.createElement('link');
      link.id = 'cd-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=DM+Sans:wght@400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) { navigate('/login'); return; }
    const stored = currentUser.id ? getProviderById(currentUser.id) : null;
    if (stored) {
      setProfileData({ ...EMPTY_PROFILE, ...stored });
      // Set photo preview if exists
      if (stored.profilePhoto) {
        setPhotoPreview(stored.profilePhoto);
      }
    } else {
      setProfileData(prev => ({
        ...prev,
        id: currentUser.id || prev.id,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email,
        plan: currentUser.plan || prev.plan,
        contactEmail: currentUser.email || prev.contactEmail,
      }));
    }
  }, [navigate]);

  const maxServices = getPlanLimits(profileData.plan).maxServices;
  const serviceCount = profileData.services.length;
  const isPaidPlan = profileData.plan === 'pro' || profileData.plan === 'featured';

  const toggleEditMode = () => {
    if (!editModeActive) {
      setOriginalValues({ profileData: { ...profileData } });
      setEditModeActive(true);
    } else {
      cancelEdit();
    }
  };

  const cancelEdit = () => {
    if (originalValues.profileData) setProfileData(originalValues.profileData);
    setEditModeActive(false);
    showNotification('Changes discarded', 'info');
  };

  const saveChanges = () => {
    setLoading(true);
    try {
      const toSave = { ...profileData, social: profileData.website || profileData.social || '' };
      saveProviderById(toSave);
      const currentUser = getCurrentUser();
      if (currentUser) {
        localStorage.setItem('sah_current_user', JSON.stringify({ ...currentUser, name: profileData.name, plan: profileData.plan }));
      }
      setOriginalValues({ profileData: { ...profileData } });
      setEditModeActive(false);
      showNotification('Changes saved successfully!', 'success');
    } catch { showNotification('Error saving changes', 'error'); }
    finally { setLoading(false); }
  };

  const handlePhotoUpload = (photoData) => {
    if (typeof photoData === 'string') {
      setPhotoPreview(photoData);
      setProfileData(prev => ({ ...prev, photo: photoData, image: photoData }));
      showNotification('Photo updated successfully!', 'success');
    } else if (photoData instanceof File || photoData instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target.result;
        setPhotoPreview(base64);
        setProfileData(prev => ({ ...prev, photo: base64, image: base64 }));
        showNotification('Photo updated successfully!', 'success');
      };
      reader.readAsDataURL(photoData);
    }
  };

  const handleAddTag = (newTag) => {
    if (newTag && !profileData.tags.includes(newTag)) {
      setProfileData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
    }
  };

  const handleRemoveTag = (index) => {
    setProfileData(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
  };

  const handleUpdateProfile = (updatedData) => {
    setProfileData(prev => ({ ...prev, ...updatedData }));
  };

  const handleAddService = () => {
    if (serviceCount < maxServices) {
      setProfileData(prev => ({
        ...prev,
        services: [...prev.services, { title: `Service ${serviceCount + 1}`, ageGroups: [], deliveryMode: 'Online' }],
      }));
      showNotification('New service added. Fill in the details.', 'success');
    }
  };

  const handleUpdateService = (index, updatedService) => {
    const newServices = [...profileData.services];
    newServices[index] = updatedService;
    setProfileData(prev => ({ ...prev, services: newServices }));
  };

  const handleRemoveService = (index) => {
    if (profileData.services.length > 1) {
      setProfileData(prev => ({ ...prev, services: prev.services.filter((_, i) => i !== index) }));
      showNotification('Service removed.', 'info');
    }
  };

  const handlePlanChange = (newPlan) => {
    setProfileData(prev => ({ ...prev, plan: newPlan }));
    if (updateUserPlan) updateUserPlan(newPlan);
    showNotification(`Plan updated to ${PLAN_LIMITS?.[newPlan]?.name || newPlan}`, 'success');
  };

  const handleToggleDay = (day) => {
    const newDays = profileData.availabilityDays.includes(day)
      ? profileData.availabilityDays.filter(d => d !== day)
      : [...profileData.availabilityDays, day];
    setProfileData(prev => ({ ...prev, availabilityDays: newDays }));
  };

  // ── Qualification file upload → parse text and auto-fill fields ──
  const handleQualFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const nameWithoutExt = file.name.replace(/\.[^.]+$/, '');
    const segments = nameWithoutExt.replace(/[_\-\.]/g, ' ').replace(/\s+/g, ' ').trim();

    const lc = segments.toLowerCase();
    let parsedDegree = profileData.degrees;
    let parsedCerts = profileData.certifications;

    const degreeKeywords = ['bed', 'bsc', 'ba ', 'honours', 'diploma', 'degree', 'masters', 'phd', 'med ', 'pgce'];
    const certKeywords = ['sace', 'umalusi', 'cert', 'accredited', 'registered', 'clearance'];

    const hasDegree = degreeKeywords.some(k => lc.includes(k));
    const hasCert = certKeywords.some(k => lc.includes(k));

    if (hasDegree && !parsedDegree) parsedDegree = segments;
    if (hasCert && !parsedCerts) parsedCerts = segments;
    if (!hasDegree && !hasCert && !parsedDegree) parsedDegree = segments;

    if (fileName.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target.result;
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const degLine = lines.find(l => degreeKeywords.some(k => l.toLowerCase().includes(k)));
        const certLine = lines.find(l => certKeywords.some(k => l.toLowerCase().includes(k)));
        const memberLine = lines.find(l => l.toLowerCase().includes('member'));

        setProfileData(prev => ({
          ...prev,
          degrees: degLine || prev.degrees || segments,
          certifications: certLine || prev.certifications || '',
          memberships: memberLine || prev.memberships,
          _qualFileName: file.name,
        }));
        showNotification('Qualification file parsed — please review and edit the fields below.', 'success');
      };
      reader.readAsText(file);
    } else {
      setProfileData(prev => ({
        ...prev,
        degrees: parsedDegree,
        certifications: parsedCerts,
        _qualFileName: file.name,
      }));
      showNotification('File attached. Fields pre-filled from filename — please review and edit.', 'info');
    }
  };

  const getPlanName = () => ({
    free: 'Community Member (Free)',
    pro: 'Trusted Provider (R149/month)',
    featured: 'Featured Partner (R399/month)',
  }[profileData.plan] || 'Community Member (Free)');

  const publicViewUrl = profileData.id ? `/profile?id=${profileData.id}&from=dashboard` : '/profile?from=dashboard';

  const statusInfo = {
    approved: { cls: 'approved', icon: 'fa-check-circle', label: 'Approved — Live' },
    rejected: { cls: 'rejected', icon: 'fa-times-circle', label: 'Rejected' },
    pending: { cls: 'pending', icon: 'fa-clock', label: 'Pending Approval' },
  }[profileData.status] || { cls: 'pending', icon: 'fa-clock', label: 'Pending Approval' };

  const days = DAYS_OF_WEEK || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="cd-wrap">
      <Header userType="client" />

      {/* ── HERO ── */}
      <section className="cd-hero">
        <div className="cd-hero-inner">
          <div className="cd-hero-left">
            <div className="cd-hero-eyebrow">
              <span></span> Provider Dashboard
            </div>
            <h1 className="cd-hero-title">
              Welcome back, <em>{profileData.name || 'Provider'}</em>
            </h1>
            <div className="cd-hero-meta">
              <div className={`cd-status-pill ${statusInfo.cls}`}>
                <i className={`fas ${statusInfo.icon}`}></i>
                {statusInfo.label}
              </div>
              {profileData.plan && (
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="fas fa-crown" style={{ color: '#f59e0b' }}></i>
                  {getPlanName()}
                </div>
              )}
            </div>
          </div>
          <div className="cd-hero-right">
            <button className="cd-btn-ghost" onClick={() => navigate('/')}>
              <i className="fas fa-arrow-left"></i> Back to Directory
            </button>
            <button className="cd-btn-ghost" onClick={() => navigate(publicViewUrl)}>
              <i className="fas fa-eye"></i> Public View
            </button>
            {editModeActive ? (
              <>
                <button className="cd-btn-solid" onClick={saveChanges} disabled={loading}>
                  <i className="fas fa-floppy-disk"></i> {loading ? 'Saving…' : 'Save Changes'}
                </button>
                <button className="cd-btn-solid cancel" onClick={cancelEdit} disabled={loading}>
                  Cancel
                </button>
              </>
            ) : (
              <button className="cd-btn-solid" onClick={toggleEditMode}>
                <i className="fas fa-pen"></i> Edit Profile
              </button>
            )}
          </div>
        </div>
      </section>

      <main className="cd-main">
        <div className="cd-grid">
          {/* ─── LEFT COLUMN ─── */}
          <div>

            {/* ── PROFILE INFORMATION ── */}
            <div className="cd-card">
              <div className="cd-card-header">
                <div className="cd-card-header-icon"><i className="fas fa-user"></i></div>
                <div>
                  <div className="cd-card-title">Profile Information</div>
                  <div className="cd-card-subtitle">Your public-facing identity</div>
                </div>
                <button
                  className={`cd-edit-toggle ${editModeActive ? 'active' : 'inactive'}`}
                  onClick={toggleEditMode}
                >
                  <i className={`fas ${editModeActive ? 'fa-pencil-alt' : 'fa-edit'}`}></i>
                  {editModeActive ? 'Editing' : 'Edit'}
                </button>
              </div>
              <div className="cd-card-body">
                <ProfileSection
                  profileData={profileData}
                  isEditing={editModeActive}
                  onUpdate={handleUpdateProfile}
                  onPhotoUpload={handlePhotoUpload}
                />

                {/* Tags */}
                <div className="cd-field" style={{ marginTop: 16 }}>
                  <label className="cd-label">Tags / Subjects</label>
                  {editModeActive ? (
                    <TagsInput
                      tags={profileData.tags}
                      isEditing={editModeActive}
                      onAddTag={handleAddTag}
                      onRemoveTag={handleRemoveTag}
                    />
                  ) : (
                    <div className="cd-tags">
                      {profileData.tags.length > 0
                        ? profileData.tags.map((t, i) => <span key={i} className="cd-tag">{t}</span>)
                        : <span className="cd-value empty">No tags added yet</span>}
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div className="cd-field">
                  <label className="cd-label">Short Bio <span className="req">*</span></label>
                  {editModeActive ? (
                    <textarea
                      className="cd-input cd-textarea"
                      value={profileData.bio}
                      onChange={e => handleUpdateProfile({ bio: e.target.value })}
                      placeholder="Tell families about your experience and approach..."
                    />
                  ) : (
                    <div className={`cd-value ${!profileData.bio ? 'empty' : ''}`} style={{ display: 'block', lineHeight: 1.6, padding: '10px 0' }}>
                      {profileData.bio || 'No bio added yet.'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── QUALIFICATIONS ── */}
            <div className="cd-card">
              <div className="cd-card-header">
                <div className="cd-card-header-icon"><i className="fas fa-graduation-cap"></i></div>
                <div>
                  <div className="cd-card-title">Qualifications & Experience</div>
                  <div className="cd-card-subtitle">Credentials that build family trust</div>
                </div>
              </div>
              <div className="cd-card-body">
                {editModeActive && (
                  <div className="cd-field">
                    <label className="cd-label"><i className="fas fa-upload"></i> Upload Certificate / Qualification File</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                      className="cd-input"
                      style={{ padding: '8px 12px', fontSize: '0.83rem', cursor: 'pointer' }}
                      onChange={handleQualFileUpload}
                    />
                    {profileData._qualFileName && (
                      <div className="cd-qual-parsed">
                        <i className="fas fa-check-circle"></i>
                        File attached: <strong>{profileData._qualFileName}</strong> — fields pre-filled below, please review.
                      </div>
                    )}
                    <div className="cd-info-note" style={{ marginTop: 10, marginBottom: 0 }}>
                      <i className="fas fa-info-circle"></i>
                      Upload a file to auto-fill the fields below, or type them in manually.
                    </div>
                  </div>
                )}

                <div className="cd-row">
                  <div className="cd-field">
                    <label className="cd-label">Degrees / Diplomas</label>
                    {editModeActive ? (
                      <input type="text" className="cd-input" value={profileData.degrees}
                        onChange={e => handleUpdateProfile({ degrees: e.target.value })}
                        placeholder="e.g. BEd Honours, Mathematics Education" />
                    ) : (
                      <div className={`cd-value ${!profileData.degrees ? 'empty' : ''}`}>{profileData.degrees || '—'}</div>
                    )}
                  </div>
                  <div className="cd-field">
                    <label className="cd-label">Certifications</label>
                    {editModeActive ? (
                      <input type="text" className="cd-input" value={profileData.certifications}
                        onChange={e => handleUpdateProfile({ certifications: e.target.value })}
                        placeholder="e.g. SACE Registered, Umalusi Accredited" />
                    ) : (
                      <div className={`cd-value ${!profileData.certifications ? 'empty' : ''}`}>{profileData.certifications || '—'}</div>
                    )}
                  </div>
                </div>
                <div className="cd-row">
                  <div className="cd-field">
                    <label className="cd-label">Professional Memberships</label>
                    {editModeActive ? (
                      <input type="text" className="cd-input" value={profileData.memberships}
                        onChange={e => handleUpdateProfile({ memberships: e.target.value })}
                        placeholder="e.g. SA Curriculum Association" />
                    ) : (
                      <div className={`cd-value ${!profileData.memberships ? 'empty' : ''}`}>{profileData.memberships || '—'}</div>
                    )}
                  </div>
                  <div className="cd-field">
                    <label className="cd-label">Background Clearance</label>
                    {editModeActive ? (
                      <input type="text" className="cd-input" value={profileData.clearance}
                        onChange={e => handleUpdateProfile({ clearance: e.target.value })}
                        placeholder="e.g. Verified 2024 — Cert No. 12345678" />
                    ) : (
                      profileData.clearance
                        ? <span className="cd-clearance"><i className="fas fa-shield-alt"></i>{profileData.clearance}</span>
                        : <div className="cd-value empty">Not provided</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── SERVICES ── */}
            <div className="cd-card">
              <div className="cd-card-header">
                <div className="cd-card-header-icon"><i className="fas fa-briefcase"></i></div>
                <div>
                  <div className="cd-card-title">Service Details</div>
                  <div className="cd-card-subtitle">What you offer to homeschooling families</div>
                </div>
              </div>
              <div className="cd-card-body">
                <div className="cd-info-note">
                  <i className="fas fa-info-circle"></i>
                  {profileData.plan === 'free'
                    ? 'Free plan: You can add only 1 service. Upgrade to add more.'
                    : profileData.plan === 'pro'
                      ? 'Trusted Provider: You can add up to 5 services.'
                      : 'Featured Partner: You can add up to 10 services.'}
                </div>

                {profileData.services.map((service, index) => (
                  <div className={`cd-service-card ${editModeActive ? 'editing' : ''}`} key={index}>
                    <ServiceItem
                      service={service}
                      index={index}
                      isEditing={editModeActive}
                      onUpdate={handleUpdateService}
                      onRemove={handleRemoveService}
                      canRemove={profileData.services.length > 1 && isPaidPlan}
                    />
                  </div>
                ))}

                {/* Show Add Service button for paid plans when in edit mode */}
                {editModeActive && isPaidPlan && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                    <button
                      onClick={handleAddService}
                      disabled={serviceCount >= maxServices}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7,
                        padding: '9px 18px', borderRadius: 8, cursor: serviceCount >= maxServices ? 'not-allowed' : 'pointer',
                        border: '1.5px dashed #c9621a', background: '#fef3e8',
                        color: '#c9621a', fontWeight: 700, fontSize: '0.85rem',
                        fontFamily: 'inherit', opacity: serviceCount >= maxServices ? 0.5 : 1,
                      }}
                    >
                      <i className="fas fa-plus-circle"></i> Add Service
                    </button>
                    <span style={{ fontSize: '0.78rem', color: '#888' }}>
                      {serviceCount}/{maxServices} services used
                    </span>
                  </div>
                )}

                {/* Prompt free users to upgrade to add more services */}
                {editModeActive && !isPaidPlan && (
                  <div style={{ marginTop: 8 }}>
                    <div className="cd-info-note" style={{ marginBottom: 0 }}>
                      <i className="fas fa-lock"></i>
                      <span>
                        Want to add more services?{' '}
                        <span
                          style={{ fontWeight: 700, color: '#c9621a', cursor: 'pointer', textDecoration: 'underline' }}
                          onClick={() => document.getElementById('plan-selector-section')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                          Upgrade your plan ↓
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── LOCATION, PRICING & AVAILABILITY ── */}
            <div className="cd-card">
              <div className="cd-card-header">
                <div className="cd-card-header-icon"><i className="fas fa-map-marker-alt"></i></div>
                <div>
                  <div className="cd-card-title">Location, Pricing & Availability</div>
                  <div className="cd-card-subtitle">Where you serve families and your rates</div>
                </div>
              </div>
              <div className="cd-card-body">
                {/* Location row */}
                <div className="cd-sec-label" style={{ marginTop: 0 }}><i className="fas fa-map-marker-alt"></i> Location & Reach</div>
                <div className="cd-row">
                  <div className="cd-field">
                    <label className="cd-label">Province <span className="req">*</span></label>
                    {editModeActive ? (
                      <select className="cd-input cd-select" value={profileData.province}
                        onChange={e => handleUpdateProfile({ province: e.target.value })}>
                        <option value="">-- Select --</option>
                        {(PROVINCES || []).map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    ) : (
                      <div className={`cd-value ${!profileData.province ? 'empty' : ''}`}>{profileData.province || '—'}</div>
                    )}
                  </div>
                  <div className="cd-field">
                    <label className="cd-label">City / Town</label>
                    {editModeActive ? (
                      <input type="text" className="cd-input" value={profileData.city}
                        onChange={e => handleUpdateProfile({ city: e.target.value })} />
                    ) : (
                      <div className={`cd-value ${!profileData.city ? 'empty' : ''}`}>{profileData.city || '—'}</div>
                    )}
                  </div>
                </div>
                <div className="cd-field">
                  <label className="cd-label">Service Area <span className="req">*</span></label>
                  {editModeActive ? (
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                      <select className="cd-input cd-select" value={profileData.serviceAreaType}
                        style={{ width: 'auto' }}
                        onChange={e => handleUpdateProfile({ serviceAreaType: e.target.value })}>
                        <option value="local">Local (radius)</option>
                        <option value="national">National</option>
                        <option value="online">Online only</option>
                      </select>
                      {profileData.serviceAreaType === 'local' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input type="number" className="cd-input" value={profileData.radius}
                            style={{ width: 90 }} min="1" max="200"
                            onChange={e => handleUpdateProfile({ radius: e.target.value })} />
                          <span style={{ fontSize: '0.85rem', color: '#888' }}>km</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="cd-value">
                      {profileData.serviceAreaType === 'local' ? `Local — ${profileData.radius} km radius`
                        : profileData.serviceAreaType === 'national' ? 'National'
                        : 'Online only'}
                    </div>
                  )}
                </div>

                {/* Pricing + Availability */}
                <div className="cd-sec-label"><i className="fas fa-tag"></i> Pricing & Availability</div>
                <div className="cd-row">
                  <div className="cd-field">
                    <label className="cd-label">Pricing Model <span className="req">*</span></label>
                    {editModeActive ? (
                      <select className="cd-input cd-select" value={profileData.pricingModel}
                        onChange={e => handleUpdateProfile({ pricingModel: e.target.value })}>
                        {(PRICING_MODELS || ['Hourly', 'Per package', 'Per term', 'Custom quote']).map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    ) : (
                      <div className={`cd-value ${!profileData.pricingModel ? 'empty' : ''}`}>{profileData.pricingModel || '—'}</div>
                    )}
                  </div>
                  <div className="cd-field">
                    <label className="cd-label">Starting Price</label>
                    {editModeActive ? (
                      <input type="text" className="cd-input" value={profileData.startingPrice}
                        onChange={e => handleUpdateProfile({ startingPrice: e.target.value })} />
                    ) : (
                      <div className={`cd-value ${!profileData.startingPrice ? 'empty' : ''}`}>{profileData.startingPrice || '—'}</div>
                    )}
                  </div>
                </div>
                <div className="cd-field">
                  <label className="cd-label">Availability — Days</label>
                  <div className="cd-days" style={{ marginTop: 6 }}>
                    {days.map(day => {
                      const active = profileData.availabilityDays.includes(day);
                      return (
                        <button
                          key={day}
                          className={`cd-day-chip ${active ? 'on' : 'off'} ${editModeActive ? 'editable' : ''}`}
                          onClick={() => editModeActive && handleToggleDay(day)}
                          style={{ border: 'none', cursor: editModeActive ? 'pointer' : 'default' }}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: 10 }}>
                    {editModeActive ? (
                      <input type="text" className="cd-input" value={profileData.availabilityNotes}
                        onChange={e => handleUpdateProfile({ availabilityNotes: e.target.value })}
                        placeholder="e.g. Weekday afternoons & Saturdays" />
                    ) : (
                      <div className={`cd-value ${!profileData.availabilityNotes ? 'empty' : ''}`} style={{ fontSize: '0.85rem' }}>
                        {profileData.availabilityNotes || '—'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── CONTACT & SOCIAL ── */}
            <div className="cd-card">
              <div className="cd-card-header">
                <div className="cd-card-header-icon"><i className="fas fa-address-card"></i></div>
                <div>
                  <div className="cd-card-title">Contact & Online Presence</div>
                  <div className="cd-card-subtitle">How families reach you</div>
                </div>
              </div>
              <div className="cd-card-body">
                {editModeActive ? (
                  <div className="cd-row">
                    <div className="cd-field">
                      <label className="cd-label">Contact Name</label>
                      <input type="text" className="cd-input" value={profileData.contactName}
                        onChange={e => handleUpdateProfile({ contactName: e.target.value })} />
                    </div>
                    <div className="cd-field">
                      <label className="cd-label">Phone</label>
                      <input type="text" className="cd-input" value={profileData.phone}
                        onChange={e => handleUpdateProfile({ phone: e.target.value })} />
                    </div>
                    <div className="cd-field">
                      <label className="cd-label">WhatsApp</label>
                      <input type="text" className="cd-input" value={profileData.whatsapp || ''}
                        onChange={e => handleUpdateProfile({ whatsapp: e.target.value })}
                        placeholder="+27 82 000 0000" />
                    </div>
                    <div className="cd-field">
                      <label className="cd-label">Enquiry Email</label>
                      <input type="email" className="cd-input" value={profileData.contactEmail}
                        onChange={e => handleUpdateProfile({ contactEmail: e.target.value })} />
                    </div>
                    <div className="cd-field">
                      <label className="cd-label">Website</label>
                      <input type="url" className="cd-input" value={profileData.website || profileData.social || ''}
                        onChange={e => handleUpdateProfile({ website: e.target.value, social: e.target.value })}
                        placeholder="https://yoursite.co.za" />
                    </div>
                    <div className="cd-field">
                      <label className="cd-label">Facebook Page</label>
                      <input type="url" className="cd-input" value={profileData.facebook || ''}
                        onChange={e => handleUpdateProfile({ facebook: e.target.value })}
                        placeholder="https://facebook.com/yourpage" />
                    </div>
                  </div>
                ) : (
                  <div>
                    {[
                      { icon: 'fa-user', label: 'Contact Name', val: profileData.contactName },
                      { icon: 'fa-phone', label: 'Phone', val: profileData.phone },
                      { icon: 'fa-brands fa-whatsapp', label: 'WhatsApp', val: profileData.whatsapp || profileData.phone },
                      { icon: 'fa-envelope', label: 'Email', val: profileData.contactEmail },
                      { icon: 'fa-globe', label: 'Website', val: profileData.website || profileData.social },
                      { icon: 'fa-brands fa-facebook', label: 'Facebook', val: profileData.facebook },
                    ].map(({ icon, label, val }) => val ? (
                      <div className="cd-contact-item" key={label}>
                        <div className="cd-contact-icon"><i className={`fas ${icon}`}></i></div>
                        <div>
                          <div className="cd-contact-label">{label}</div>
                          <div className="cd-contact-val">{val}</div>
                        </div>
                      </div>
                    ) : null)}
                    {!profileData.contactName && !profileData.phone && !profileData.contactEmail && (
                      <div className="cd-value empty">No contact details added yet — activate Edit mode to add.</div>
                    )}
                  </div>
                )}

                <div className="cd-toggle-row" style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #f0ece5' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1a1a' }}>Display contact publicly</div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>Visible to families on your profile page</div>
                  </div>
                  <label className="cd-switch">
                    <input type="checkbox" checked={profileData.publicToggle}
                      onChange={e => handleUpdateProfile({ publicToggle: e.target.checked })}
                      disabled={!editModeActive} />
                    <span className="cd-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* ── PLAN & REVIEWS — compact row ── */}
            <div className="cd-card">
              <div className="cd-card-header">
                <div className="cd-card-header-icon"><i className="fas fa-crown"></i></div>
                <div>
                  <div className="cd-card-title">Plan & Reviews</div>
                  <div className="cd-card-subtitle">Your listing tier and family feedback</div>
                </div>
              </div>
              <div className="cd-card-body">
                {/* Plan strip */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#faf9f7', borderRadius: 10, marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                  <span className={`cd-plan-badge ${profileData.plan}`}>
                    <i className="fas fa-crown" style={{ color: '#f59e0b' }}></i>
                    {getPlanName()}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '0.78rem', color: '#888', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <i className="fas fa-circle" style={{ color: profileData.status === 'approved' ? '#10b981' : '#f59e0b', fontSize: '0.5rem' }}></i>
                      Listing is {profileData.status}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#c9621a', fontWeight: 700, cursor: 'pointer' }}
                      onClick={() => document.getElementById('plan-selector-section')?.scrollIntoView({ behavior: 'smooth' })}>
                      Upgrade plan ↓
                    </span>
                  </div>
                </div>

                {/* Reviews */}
                <div className="cd-sec-label" style={{ marginTop: 0 }}><i className="fas fa-star"></i> Reviews & Testimonials <span style={{ fontWeight: 400, fontSize: '0.7rem', color: '#aaa', textTransform: 'none', letterSpacing: 0 }}>(paid tiers)</span></div>
                {profileData.reviews.items && profileData.reviews.items.length > 0 ? (
                  <>
                    {profileData.reviews.count > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, padding: '10px 14px', background: '#faf9f7', borderRadius: 10 }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#c9621a', lineHeight: 1 }}>{profileData.reviews.average}</div>
                        <div>
                          <div style={{ color: '#f59e0b' }}>{'★'.repeat(Math.round(profileData.reviews.average))}{'☆'.repeat(5 - Math.round(profileData.reviews.average))}</div>
                          <div style={{ fontSize: '0.75rem', color: '#888' }}>Based on {profileData.reviews.count} reviews</div>
                        </div>
                      </div>
                    )}
                    {profileData.reviews.items.map((review, index) => (
                      <div className="cd-review" key={index}>
                        <div className="cd-review-stars">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                        <div className="cd-review-text">"{review.text}"</div>
                        <div className="cd-review-author">— {review.reviewer}</div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="cd-value empty" style={{ marginBottom: 4 }}>
                    No reviews yet. Reviews appear once families leave feedback on your profile.
                  </div>
                )}
              </div>
              <div className="cd-footer-bar">
                <span className="cd-last-edit"><i className="far fa-clock"></i> last edited today</span>
                {editModeActive && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="cd-btn-solid" onClick={saveChanges} disabled={loading}>
                      <i className="fas fa-floppy-disk"></i> {loading ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button className="cd-btn-solid cancel" onClick={cancelEdit} disabled={loading}>Cancel</button>
                  </div>
                )}
              </div>
            </div>

            {/* ── PLAN SELECTOR (full) ── */}
            <div className="cd-card" id="plan-selector-section">
              <div className="cd-card-header">
                <div className="cd-card-header-icon"><i className="fas fa-arrow-up"></i></div>
                <div>
                  <div className="cd-card-title">Upgrade Your Plan</div>
                  <div className="cd-card-subtitle">More features and visibility with paid tiers</div>
                </div>
              </div>
              <div className="cd-card-body">
                <PlanSelector currentPlan={profileData.plan} onSelectPlan={handlePlanChange} />
              </div>
            </div>

          </div>

          {/* ─── SIDEBAR ─── */}
          <div>
            {/* Profile Completeness */}
            <div className="cd-sidebar-card">
              <div className="cd-sidebar-header">
                <div className="cd-sidebar-title"><i className="fas fa-tasks" style={{ marginRight: 6 }}></i>Profile Completeness</div>
              </div>
              <div className="cd-sidebar-body">
                {[
                  { label: 'Name & Bio', done: !!(profileData.name && profileData.bio) },
                  { label: 'Photo', done: !!(profileData.image || profileData.photo) },
                  { label: 'Services', done: profileData.services.some(s => s.title) },
                  { label: 'Location', done: !!(profileData.city && profileData.province) },
                  { label: 'Contact Details', done: !!(profileData.phone && profileData.contactEmail) },
                  { label: 'Qualifications', done: !!(profileData.degrees || profileData.certifications) },
                  { label: 'Availability', done: profileData.availabilityDays.length > 0 },
                ].map(({ label, done }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f8f6f3' }}>
                    <i className={`fas ${done ? 'fa-check-circle' : 'fa-circle'}`}
                      style={{ color: done ? '#10b981' : '#d1d5db', fontSize: '0.85rem', width: 16 }}></i>
                    <span style={{ fontSize: '0.83rem', color: done ? '#1a1a1a' : '#999', fontWeight: done ? 600 : 400 }}>{label}</span>
                  </div>
                ))}
                {/* Progress bar */}
                {(() => {
                  const items = [
                    !!(profileData.name && profileData.bio),
                    !!(profileData.image || profileData.photo),
                    profileData.services.some(s => s.title),
                    !!(profileData.city && profileData.province),
                    !!(profileData.phone && profileData.contactEmail),
                    !!(profileData.degrees || profileData.certifications),
                    profileData.availabilityDays.length > 0,
                  ];
                  const pct = Math.round((items.filter(Boolean).length / items.length) * 100);
                  return (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: '0.72rem', color: '#888', fontWeight: 700 }}>COMPLETE</span>
                        <span style={{ fontSize: '0.72rem', color: '#c9621a', fontWeight: 800 }}>{pct}%</span>
                      </div>
                      <div style={{ height: 6, background: '#f0ece5', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #c9621a, #e07a35)', borderRadius: 3, transition: 'width 0.5s' }} />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Approval notice */}
            {profileData.status === 'pending' && (
              <div className="cd-sidebar-card">
                <div className="cd-sidebar-header" style={{ background: '#92400e' }}>
                  <div className="cd-sidebar-title"><i className="fas fa-clock" style={{ marginRight: 6 }}></i>Pending Review</div>
                </div>
                <div className="cd-sidebar-body">
                  <p style={{ fontSize: '0.83rem', color: '#555', lineHeight: 1.6 }}>
                    Your profile is awaiting admin verification. Once approved, it will appear live in the directory.
                    This typically takes 1–2 business days.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ClientDashboard;