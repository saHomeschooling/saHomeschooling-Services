// frontend/src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Modal from '../components/common/Modal';
import StatsBox from '../components/admin/StatsBox';
import ProviderRow from '../components/admin/ProviderRow';
import FeaturedSlotCard from '../components/admin/FeaturedSlotCard';
import ReviewCard from '../components/admin/ReviewCard';
import { featuredSlotsMock, reviewsMock } from '../utils/constants';
import { escapeHtml } from '../utils/helpers';
import '../assets/css/dashboard.css';

function getStoredProviders() {
  try { return JSON.parse(localStorage.getItem('sah_providers') || '[]'); }
  catch { return []; }
}

function saveStoredProviders(list) {
  try { localStorage.setItem('sah_providers', JSON.stringify(list)); }
  catch {}
}

/* ── Inline CSS for expandable provider rows ── */
const ADMIN_CSS = `
  .adm-expand-row {
    border: 1px solid #e5e0d8; border-radius: 12px; overflow: hidden;
    margin-bottom: 12px; background: #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    transition: box-shadow 0.15s;
  }
  .adm-expand-row:hover { box-shadow: 0 3px 12px rgba(0,0,0,0.10); }
  .adm-expand-row.expanded { border-color: #c9621a; box-shadow: 0 4px 20px rgba(201,98,26,0.12); }

  .adm-row-header {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 18px; cursor: pointer; background: #faf9f7;
    transition: background 0.12s; user-select: none;
  }
  .adm-row-header:hover { background: #f5f0e8; }
  .adm-expand-row.expanded .adm-row-header { background: #fff3e8; border-bottom: 1px solid #f0d4b8; }

  .adm-avatar {
    width: 40px; height: 40px; border-radius: 10px;
    background: linear-gradient(135deg, #c9621a, #e07a35);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 1rem; font-weight: 800;
    flex-shrink: 0; box-shadow: 0 2px 8px rgba(201,98,26,0.3);
  }

  .adm-row-info { flex: 1; min-width: 0; }
  .adm-row-name { font-size: 0.92rem; font-weight: 700; color: #1a1a1a; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .adm-row-meta { font-size: 0.75rem; color: #888; margin-top: 2px; }

  .adm-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px; border-radius: 4px; font-size: 0.68rem; font-weight: 700;
  }
  .adm-badge.pending { background: #fef3c7; color: #92400e; }
  .adm-badge.approved { background: #d1fae5; color: #065f46; }
  .adm-badge.rejected { background: #fee2e2; color: #991b1b; }
  .adm-badge.featured { background: #fffbeb; color: #d97706; }
  .adm-badge.pro { background: #dbeafe; color: #1e3a8a; }

  .adm-expand-icon {
    color: #aaa; font-size: 0.8rem; transition: transform 0.2s; flex-shrink: 0;
  }
  .adm-expand-row.expanded .adm-expand-icon { transform: rotate(180deg); color: #c9621a; }

  .adm-row-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

  .adm-btn-approve {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 7px; cursor: pointer; font-size: 0.8rem;
    font-weight: 700; border: none; font-family: inherit;
    background: #d1fae5; color: #065f46; transition: all 0.15s;
  }
  .adm-btn-approve:hover { background: #a7f3d0; }

  .adm-btn-reject {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 7px; cursor: pointer; font-size: 0.8rem;
    font-weight: 700; border: none; font-family: inherit;
    background: #fee2e2; color: #991b1b; transition: all 0.15s;
  }
  .adm-btn-reject:hover { background: #fecaca; }

  /* ── Expanded detail panel ── */
  .adm-detail-panel {
    padding: 0;
    animation: adm-slide-in 0.2s ease;
  }
  @keyframes adm-slide-in {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .adm-detail-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 0;
    border-bottom: 1px solid #f0ece5;
  }
  .adm-detail-section {
    padding: 18px 20px; border-right: 1px solid #f0ece5;
  }
  .adm-detail-section:last-child { border-right: none; }
  .adm-detail-section-title {
    font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.9px;
    color: #c9621a; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;
  }
  .adm-detail-field { margin-bottom: 10px; }
  .adm-detail-label { font-size: 0.66rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #aaa; margin-bottom: 3px; }
  .adm-detail-val { font-size: 0.83rem; color: #1a1a1a; font-weight: 500; word-break: break-word; }
  .adm-detail-val.empty { color: #bbb; font-style: italic; }

  .adm-detail-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 4px; }
  .adm-detail-tag {
    padding: 2px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 600;
    background: #fef3e8; color: #c9621a; border: 1px solid #f0c89a;
  }

  .adm-detail-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; background: #faf9f7; flex-wrap: wrap; gap: 12px;
  }
  .adm-detail-footer-note { font-size: 0.75rem; color: #888; display: flex; align-items: center; gap: 6px; }

  /* ── All listings row (non-expandable, existing style) ── */
  .adm-listing-row {
    display: flex; align-items: center; gap: 14px;
    padding: 13px 18px; border: 1px solid #e5e0d8; border-radius: 10px;
    background: #fff; margin-bottom: 10px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04); transition: box-shadow 0.15s;
  }
  .adm-listing-row:hover { box-shadow: 0 3px 10px rgba(0,0,0,0.08); }

  .adm-promote-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 11px; border-radius: 6px; cursor: pointer; font-size: 0.77rem;
    font-weight: 700; border: none; font-family: inherit;
    background: #dbeafe; color: #1e40af; transition: all 0.15s;
  }
  .adm-promote-btn:hover { background: #bfdbfe; }
  .adm-demote-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 11px; border-radius: 6px; cursor: pointer; font-size: 0.77rem;
    font-weight: 700; border: none; font-family: inherit;
    background: #f3f4f6; color: #4b5563; transition: all 0.15s;
  }
  .adm-demote-btn:hover { background: #e5e7eb; }

  .adm-badge-opt {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 10px; border-radius: 5px; cursor: pointer; font-size: 0.72rem; font-weight: 700;
    transition: all 0.14s; border: 1.5px solid transparent;
  }
  .adm-badge-opt.community { background: #f9fafb; color: #6b7280; border-color: #e5e7eb; }
  .adm-badge-opt.community.selected { background: #e5e7eb; color: #374151; border-color: #9ca3af; }
  .adm-badge-opt.trusted { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
  .adm-badge-opt.trusted.selected { background: #dbeafe; }
  .adm-badge-opt.featured { background: #fffbeb; color: #d97706; border-color: #fde68a; }
  .adm-badge-opt.featured.selected { background: #fde68a; }
  .adm-badge-opt:hover { transform: translateY(-1px); }

  @media (max-width: 800px) {
    .adm-detail-grid { grid-template-columns: 1fr 1fr; }
    .adm-detail-section { border-right: none; border-bottom: 1px solid #f0ece5; }
  }
  @media (max-width: 560px) {
    .adm-detail-grid { grid-template-columns: 1fr; }
    .adm-row-actions { flex-wrap: wrap; }
  }
`;

/* ── Expandable Pending Provider Row ── */
const ExpandablePendingRow = ({ provider, onApprove, onReject }) => {
  const [expanded, setExpanded] = useState(false);

  const initial = (provider.name || '?')[0].toUpperCase();
  const regDate = provider.registered ? new Date(provider.registered).toLocaleDateString('en-ZA') : '—';

  const val = (v) => v ? String(v) : null;
  const arrVal = (a) => Array.isArray(a) && a.length > 0 ? a.join(', ') : null;

  return (
    <div className={`adm-expand-row ${expanded ? 'expanded' : ''}`}>
      {/* Header row */}
      <div className="adm-row-header" onClick={() => setExpanded(e => !e)}>
        <div className="adm-avatar">{initial}</div>
        <div className="adm-row-info">
          <div className="adm-row-name">
            {provider.name}
            <span className="adm-badge pending">Pending</span>
            {provider.tier === 'featured' && <span className="adm-badge featured"><i className="fas fa-crown"></i> Featured Plan</span>}
            {provider.tier === 'pro' && <span className="adm-badge pro"><i className="fas fa-check-circle"></i> Pro Plan</span>}
          </div>
          <div className="adm-row-meta">
            {provider.email} &nbsp;·&nbsp; {provider.city || '—'}, {provider.province || '—'} &nbsp;·&nbsp;
            {provider.listingPlan || provider.tier || 'free'} plan &nbsp;·&nbsp; Registered: {regDate}
          </div>
        </div>
        <i className="fas fa-chevron-down adm-expand-icon"></i>
        <div className="adm-row-actions" onClick={e => e.stopPropagation()}>
          <button className="adm-btn-approve" onClick={() => onApprove(provider.id)}>
            <i className="fas fa-check"></i> Approve
          </button>
          <button className="adm-btn-reject" onClick={() => onReject(provider.id)}>
            <i className="fas fa-times"></i> Reject
          </button>
        </div>
      </div>

      {/* Expandable detail panel */}
      {expanded && (
        <div className="adm-detail-panel">
          <div className="adm-detail-grid">
            {/* Column 1: Account & Contact */}
            <div className="adm-detail-section">
              <div className="adm-detail-section-title"><i className="fas fa-user"></i> Account & Contact</div>
              {[
                { label: 'Full Name / Business', val: val(provider.name) },
                { label: 'Account Type', val: val(provider.accountType) },
                { label: 'Email', val: val(provider.email) },
                { label: 'Phone', val: val(provider.phone) },
                { label: 'WhatsApp', val: val(provider.whatsapp) },
                { label: 'Enquiry Email', val: val(provider.contactEmail) },
                { label: 'Website', val: val(provider.website || provider.social) },
                { label: 'Plan', val: val(provider.listingPlan || provider.tier) },
                { label: 'Registered', val: regDate },
              ].map(({ label, val: v }) => (
                <div className="adm-detail-field" key={label}>
                  <div className="adm-detail-label">{label}</div>
                  <div className={`adm-detail-val ${!v ? 'empty' : ''}`}>{v || '—'}</div>
                </div>
              ))}
            </div>

            {/* Column 2: Bio & Services */}
            <div className="adm-detail-section">
              <div className="adm-detail-section-title"><i className="fas fa-briefcase"></i> Bio & Services</div>
              <div className="adm-detail-field">
                <div className="adm-detail-label">Bio</div>
                <div className={`adm-detail-val ${!val(provider.bio) ? 'empty' : ''}`} style={{ lineHeight: 1.6, fontSize: '0.8rem' }}>
                  {val(provider.bio) || '—'}
                </div>
              </div>
              <div className="adm-detail-field">
                <div className="adm-detail-label">Primary Category</div>
                <div className="adm-detail-val">{val(provider.primaryCategory || provider.category) || '—'}</div>
              </div>
              <div className="adm-detail-field">
                <div className="adm-detail-label">Tags / Subjects</div>
                {provider.tags?.length > 0
                  ? <div className="adm-detail-tags">{provider.tags.map((t, i) => <span key={i} className="adm-detail-tag">{t}</span>)}</div>
                  : <div className="adm-detail-val empty">—</div>}
              </div>
              <div className="adm-detail-field">
                <div className="adm-detail-label">Age Groups</div>
                <div className={`adm-detail-val ${!arrVal(provider.ageGroups) ? 'empty' : ''}`}>
                  {arrVal(provider.ageGroups) || '—'}
                </div>
              </div>
              <div className="adm-detail-field">
                <div className="adm-detail-label">Delivery Mode</div>
                <div className={`adm-detail-val ${!val(provider.deliveryMode || provider.delivery) ? 'empty' : ''}`}>
                  {val(provider.deliveryMode || provider.delivery) || '—'}
                </div>
              </div>
              {provider.services?.length > 0 && (
                <div className="adm-detail-field">
                  <div className="adm-detail-label">Services ({provider.services.length})</div>
                  {provider.services.map((svc, i) => (
                    <div key={i} style={{ padding: '6px 10px', background: '#faf9f7', borderRadius: 6, marginTop: 5, fontSize: '0.8rem' }}>
                      {svc.title && <div style={{ fontWeight: 700 }}>{svc.title}</div>}
                      {svc.description && <div style={{ color: '#666', marginTop: 2 }}>{svc.description}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Column 3: Location, Qualifications & Availability */}
            <div className="adm-detail-section">
              <div className="adm-detail-section-title"><i className="fas fa-map-marker-alt"></i> Location & Credentials</div>
              {[
                { label: 'City', val: val(provider.city) },
                { label: 'Province', val: val(provider.province) },
                { label: 'Service Area', val: val(provider.serviceAreaType) },
                { label: 'Radius', val: val(provider.radius) },
              ].map(({ label, val: v }) => (
                <div className="adm-detail-field" key={label}>
                  <div className="adm-detail-label">{label}</div>
                  <div className={`adm-detail-val ${!v ? 'empty' : ''}`}>{v || '—'}</div>
                </div>
              ))}

              <div className="adm-detail-section-title" style={{ marginTop: 14 }}><i className="fas fa-graduation-cap"></i> Qualifications</div>
              {[
                { label: 'Degrees / Diplomas', val: val(provider.degrees) },
                { label: 'Certifications', val: val(provider.certifications) },
                { label: 'Memberships', val: val(provider.memberships) },
                { label: 'Clearance', val: val(provider.clearance) },
              ].map(({ label, val: v }) => (
                <div className="adm-detail-field" key={label}>
                  <div className="adm-detail-label">{label}</div>
                  <div className={`adm-detail-val ${!v ? 'empty' : ''}`}>{v || '—'}</div>
                </div>
              ))}

              <div className="adm-detail-section-title" style={{ marginTop: 14 }}><i className="fas fa-clock"></i> Availability</div>
              <div className="adm-detail-field">
                <div className="adm-detail-label">Days</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 4 }}>
                  {provider.availabilityDays?.length > 0
                    ? provider.availabilityDays.map(d => (
                        <span key={d} style={{ padding: '2px 8px', background: '#c9621a', color: '#fff', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700 }}>{d}</span>
                      ))
                    : <span style={{ color: '#bbb', fontSize: '0.8rem', fontStyle: 'italic' }}>—</span>}
                </div>
              </div>
              <div className="adm-detail-field">
                <div className="adm-detail-label">Notes</div>
                <div className={`adm-detail-val ${!val(provider.availabilityNotes) ? 'empty' : ''}`}>{val(provider.availabilityNotes) || '—'}</div>
              </div>

              <div className="adm-detail-section-title" style={{ marginTop: 14 }}><i className="fas fa-tag"></i> Pricing</div>
              {[
                { label: 'Model', val: val(provider.pricingModel) },
                { label: 'Starting Price', val: val(provider.startingPrice || provider.priceFrom) },
              ].map(({ label, val: v }) => (
                <div className="adm-detail-field" key={label}>
                  <div className="adm-detail-label">{label}</div>
                  <div className={`adm-detail-val ${!v ? 'empty' : ''}`}>{v || '—'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail footer with action bar */}
          <div className="adm-detail-footer">
            <div className="adm-detail-footer-note">
              <i className="fas fa-info-circle" style={{ color: '#c9621a' }}></i>
              Click outside this area to collapse · Admin review on {new Date().toLocaleDateString('en-ZA')}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="adm-btn-approve" style={{ padding: '9px 20px', fontSize: '0.85rem' }}
                onClick={() => onApprove(provider.id)}>
                <i className="fas fa-check-circle"></i> Approve & Go Live
              </button>
              <button className="adm-btn-reject" style={{ padding: '9px 20px', fontSize: '0.85rem' }}
                onClick={() => onReject(provider.id)}>
                <i className="fas fa-times-circle"></i> Reject Registration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('pending');
  const [providers, setProviders] = useState([]);
  const [featuredSlots, setFeaturedSlots] = useState(featuredSlotsMock || []);
  const [reviews, setReviews] = useState(reviewsMock || []);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  // Add modal styles to document
  useEffect(() => {
    if (!document.getElementById('admin-modal-styles')) {
      const style = document.createElement('style');
      style.id = 'admin-modal-styles';
      style.textContent = modalStyles;
      document.head.appendChild(style);
    }

    return () => {
      const style = document.getElementById('admin-modal-styles');
      if (style) style.remove();
    };
  }, []);

  // Inject admin CSS
  useEffect(() => {
    if (!document.getElementById('adm-styles')) {
      const style = document.createElement('style');
      style.id = 'adm-styles';
      style.textContent = ADMIN_CSS;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    setProviders(getStoredProviders());
  }, []);

  const pendingProviders = providers.filter(p => p.status === 'pending');
  const approvedProviders = providers.filter(p => p.status === 'approved');
  const featuredCount = providers.filter(p => p.tier === 'featured' && p.status === 'approved').length;
  const pendingReviews = (reviews || []).filter(r => r.status === 'pending');

  const stats = {
    totalProviders: providers.length,
    pendingApproval: pendingProviders.length,
    featuredSlots: featuredCount,
    pendingReviews: pendingReviews.length,
  };

  const handleApprove = (providerId) => {
    const updated = providers.map(p => p.id === providerId ? { ...p, status: 'approved' } : p);
    setProviders(updated);
    saveStoredProviders(updated);
    const provider = providers.find(p => p.id === providerId);
    showNotification(`✅ ${provider?.name || 'Provider'} approved and is now live on the homepage.`, 'success');
  };

  const handleReject = (providerId) => {
    const updated = providers.map(p => p.id === providerId ? { ...p, status: 'rejected' } : p);
    setProviders(updated);
    saveStoredProviders(updated);
    const provider = providers.find(p => p.id === providerId);
    showNotification(`${provider?.name || 'Provider'} registration rejected.`, 'info');
  };

  const handleStatusChange = (providerId, status) => {
    if (status === 'approved') handleApprove(providerId);
    else handleReject(providerId);
  };

  const handleBadgeSelect = (providerId, badgeType) => {
    const tierMap = { community: 'free', trusted: 'pro', featured: 'featured' };
    const updated = providers.map(p =>
      p.id === providerId ? { ...p, badge: badgeType, tier: tierMap[badgeType] || p.tier } : p
    );
    setProviders(updated);
    saveStoredProviders(updated);
    const provider = providers.find(p => p.id === providerId);
    showNotification(`Badge "${badgeType}" assigned to ${provider?.name || providerId}.`, 'success');
  };

  const handlePromote = (providerName) => {
    showNotification(`"${providerName}" promoted — listing will move up in search results.`, 'success');
  };

  const handleDemote = (providerName) => {
    showNotification(`"${providerName}" demoted — listing will move down in search results.`, 'info');
  };

  const handleRemoveFeatured = (slotId, provider) => {
    setFeaturedSlots(prev => prev.map(slot =>
      slot.id === slotId ? { ...slot, provider: null, addedDaysAgo: 0, daysRemaining: 0 } : slot
    ));
    showNotification(`Removed ${provider} from featured slot #${slotId}`, 'info');
  };

  const handleAssignFeatured = (slotId) => {
    const available = approvedProviders.map(p => p.name).filter(Boolean);
    const randomProvider = available.length ? available[Math.floor(Math.random() * available.length)] : 'Khan Academy SA';
    setFeaturedSlots(prev => prev.map(slot =>
      slot.id === slotId ? { ...slot, provider: randomProvider, addedDaysAgo: 0, daysRemaining: 7 } : slot
    ));
    showNotification(`Assigned ${randomProvider} to featured slot #${slotId}`, 'success');
  };

  const handleRotateFeatured = (slotId) => {
    const available = approvedProviders.map(p => p.name).filter(Boolean);
    const newProvider = available.length ? available[Math.floor(Math.random() * available.length)] : 'STEM Mastery Tutors';
    setFeaturedSlots(prev => prev.map(slot =>
      slot.id === slotId ? { ...slot, provider: newProvider, addedDaysAgo: 0, daysRemaining: 7 } : slot
    ));
    showNotification(`Rotated slot #${slotId} to ${newProvider}`, 'success');
  };

  const handleModerateReview = (reviewId, action) => {
    setReviews(prev => prev.map(r =>
      r.id === reviewId ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r
    ));
  };

  const showProfileModal = (provider) => {
    if (!provider) return;
    const p = typeof provider === 'string' ? providers.find(x => x.id === provider) || {} : provider;
    const modalBody = `
      <div style="border-top:1px solid var(--border); margin:1.25rem 0 0.75rem; padding-top:0.75rem;">
        <p style="font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--accent);">Account Information</p>
      </div>
      <div class="modal-field"><label>Full name / Business</label><div class="value">${escapeHtml(p.name || '—')}</div></div>
      <div class="modal-field"><label>Email address</label><div class="value">${escapeHtml(p.email || '—')}</div></div>
      <div class="modal-field"><label>Primary category</label><div class="value">${escapeHtml(p.primaryCategory || p.category || '—')}</div></div>
      <div class="modal-field"><label>Status</label><div class="value">${escapeHtml(p.status || '—')}</div></div>
      <div class="modal-field"><label>Listing plan</label><div class="value">${escapeHtml(p.listingPlan || p.tier || '—')}</div></div>
      <div style="border-top:1px solid var(--border); margin:1.25rem 0 0.75rem; padding-top:0.75rem;">
        <p style="font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--accent);">Bio & Services</p>
      </div>
      <div class="modal-field"><label>Bio</label><div class="value">${escapeHtml(p.bio || '—')}</div></div>
      <div class="modal-field"><label>Tags / Subjects</label><div class="value">${escapeHtml((p.tags || []).join(', ') || '—')}</div></div>
      <div class="modal-field"><label>Age groups</label><div class="value">${escapeHtml((p.ageGroups || []).join(', ') || '—')}</div></div>
      <div class="modal-field"><label>Delivery mode</label><div class="value">${escapeHtml(p.deliveryMode || p.delivery || '—')}</div></div>
      <div style="border-top:1px solid var(--border); margin:1.25rem 0 0.75rem; padding-top:0.75rem;">
        <p style="font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--accent);">Location & Contact</p>
      </div>
      <div class="modal-field"><label>City / Province</label><div class="value">${escapeHtml(p.city || '')} ${escapeHtml(p.province || '')}</div></div>
      <div class="modal-field"><label>Phone</label><div class="value">${escapeHtml(p.phone || '—')}</div></div>
      <div class="modal-field"><label>Contact email</label><div class="value">${escapeHtml(p.contactEmail || p.email || '—')}</div></div>
      <div class="modal-field"><label>Pricing</label><div class="value">${escapeHtml(p.pricingModel || '—')} — ${escapeHtml(p.startingPrice || p.priceFrom || '—')}</div></div>
      <div class="modal-field"><label>Registered</label><div class="value">${p.registered ? new Date(p.registered).toLocaleDateString('en-ZA') : '—'}</div></div>
    `;
    setModalContent({ title: `${p.name || 'Provider'} — Registration Details`, body: modalBody });
    setModalOpen(true);
  };

  return (
    <>
      <Header userType="admin" />

      <main className="dash-wrapper">
        <div className="page-headline">
          <h1>Admin Control Panel</h1>
          <p>Manage listings, approvals, featured slots, provider badges, and moderate reviews</p>
        </div>

        <div className="card">
          <div className="card-header">
            <i className="fas fa-shield-halved"></i>
            <h2>Directory Oversight</h2>
            <span className="badge"><i className="fas fa-lock"></i> admin</span>
          </div>

          <div className="admin-stats" role="region" aria-label="Dashboard statistics">
            <StatsBox value={stats.totalProviders} label="total providers" />
            <StatsBox value={stats.pendingApproval} label="pending approval" />
            <StatsBox value={stats.featuredSlots} label="featured slots" />
            <StatsBox value={stats.pendingReviews} label="reviews pending" />
          </div>

          <div className="admin-tabs" role="tablist" aria-label="Admin sections">
            <button className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} role="tab" aria-selected={activeTab === 'pending'} onClick={() => setActiveTab('pending')}>
              <i className="fas fa-hourglass-half"></i> Pending Approvals
              {pendingProviders.length > 0 && <span className="pending-badge">{pendingProviders.length}</span>}
            </button>
            <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} role="tab" aria-selected={activeTab === 'all'} onClick={() => setActiveTab('all')}>
              <i className="fas fa-list"></i> All Listings
            </button>
            <button className={`tab-btn ${activeTab === 'featured' ? 'active' : ''}`} role="tab" aria-selected={activeTab === 'featured'} onClick={() => setActiveTab('featured')}>
              <i className="fas fa-star"></i> Featured Slots
            </button>
            <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} role="tab" aria-selected={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')}>
              <i className="fas fa-star-half-alt"></i> Review Moderation
              {pendingReviews.length > 0 && <span className="pending-badge">{pendingReviews.length}</span>}
            </button>
          </div>

          {/* ── PENDING APPROVALS — Expandable ── */}
          {activeTab === 'pending' && (
            <div className="tab-pane active" role="tabpanel">
              <p className="section-heading">
                <i className="fas fa-hourglass-half"></i>
                Pending Approval ({pendingProviders.length}) — click a row to expand full details
              </p>

              {pendingProviders.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ink-3)' }}>
                  <i className="fas fa-check-circle" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block', color: 'var(--success)' }}></i>
                  No pending registrations at this time.
                </div>
              )}

              {pendingProviders.map(provider => (
                <ExpandablePendingRow
                  key={provider.id}
                  provider={provider}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </div>
          )}

          {/* ── ALL LISTINGS ── */}
          {activeTab === 'all' && (
            <div className="tab-pane active" role="tabpanel">
              <p className="section-heading">
                <i className="fas fa-list"></i>
                All Providers ({providers.length}) — Promote/Demote & Manage Badges — click name to view full details
              </p>

              {providers.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ink-3)' }}>
                  No providers registered yet.
                </div>
              )}

              {providers.map(provider => (
                <div className="adm-listing-row" key={provider.id}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0, cursor: 'pointer' }}
                    onClick={() => showProfileModal(provider)}
                    role="button" tabIndex="0"
                  >
                    <div className="adm-avatar" style={{ fontSize: '0.9rem' }}>
                      {(provider.name || '?')[0].toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '0.9rem', color: '#1a1a1a' }}>{provider.name}</strong>
                        <span className={`adm-badge ${provider.status}`}>{provider.status}</span>
                        {provider.tier === 'featured' && <span className="adm-badge featured"><i className="fas fa-crown"></i> featured</span>}
                        {provider.tier === 'pro' && <span className="adm-badge pro"><i className="fas fa-check-circle"></i> trusted</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#888', marginTop: 2 }}>
                        {provider.city}, {provider.province} · {provider.email}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="adm-promote-btn" onClick={() => handlePromote(provider.name)}>
                        <i className="fas fa-arrow-up"></i> Promote
                      </button>
                      <button className="adm-demote-btn" onClick={() => handleDemote(provider.name)}>
                        <i className="fas fa-arrow-down"></i> Demote
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {['community', 'trusted', 'featured'].map(b => {
                        const isSelected = (provider.tier === (b === 'community' ? 'free' : b === 'trusted' ? 'pro' : 'featured'));
                        return (
                          <span
                            key={b}
                            className={`adm-badge-opt ${b} ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleBadgeSelect(provider.id, b)}
                            role="button" tabIndex="0"
                          >
                            {b.charAt(0).toUpperCase() + b.slice(1)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── FEATURED SLOTS ── */}
          {activeTab === 'featured' && (
            <div className="tab-pane active" role="tabpanel">
              <p className="section-heading">
                <i className="fas fa-star"></i>
                Global Featured Slots — rotate every 7 days
              </p>
              <div className="featured-slots">
                {(featuredSlots || []).map(slot => (
                  <FeaturedSlotCard
                    key={slot.id}
                    slot={slot}
                    onRemove={handleRemoveFeatured}
                    onAssign={handleAssignFeatured}
                    onRotate={handleRotateFeatured}
                  />
                ))}
              </div>
              <div className="manual-override-note">
                <i className="fas fa-circle-info"></i>
                <p>
                  <strong>7‑day rotation active:</strong> Featured listings auto‑rotate after 7 days unless no new listings are available.
                  Admin can manually rotate or assign any provider.
                </p>
              </div>
            </div>
          )}

          {/* ── REVIEW MODERATION ── */}
          {activeTab === 'reviews' && (
            <div className="tab-pane active" role="tabpanel">
              <p className="section-heading">
                <i className="fas fa-star-half-alt"></i>
                Moderate Reviews ({pendingReviews.length} pending)
              </p>
              {pendingReviews.map(review => (
                <ReviewCard key={review.id} review={review} onModerate={handleModerateReview} />
              ))}
              <div className="info-block">
                <i className="fas fa-circle-info"></i>
                <p>
                  <strong>Review Moderation:</strong> Only approved reviews appear on client profile pages.
                  Rejected reviews are hidden from all public views.
                </p>
              </div>
            </div>
          )}

          <hr />
          <div className="audit-row">
            <span className="audit-chip"><i className="fas fa-clock-rotate-left"></i> audit log</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.82rem', color: 'var(--ink-3)' }}>
              <i className="fas fa-toggle-on" style={{ color: 'var(--success)' }}></i>
              manual verification override active
            </span>
          </div>
        </div>
      </main>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalContent.title}>
        <div dangerouslySetInnerHTML={{ __html: modalContent.body }} />
      </Modal>

      <Footer />
    </>
  );
};

export default AdminDashboard;