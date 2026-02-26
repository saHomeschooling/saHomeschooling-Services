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

// ── Read ALL providers from localStorage (registered providers only, no seeds) ──
function getStoredProviders() {
  try {
    return JSON.parse(localStorage.getItem('sah_providers') || '[]');
  } catch {
    return [];
  }
}

function saveStoredProviders(list) {
  try {
    localStorage.setItem('sah_providers', JSON.stringify(list));
  } catch {}
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('pending');
  const [providers, setProviders] = useState([]);
  const [featuredSlots, setFeaturedSlots] = useState(featuredSlotsMock || []);
  const [reviews, setReviews] = useState(reviewsMock || []);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', body: '' });

  // Load providers from localStorage on mount
  useEffect(() => {
    setProviders(getStoredProviders());
  }, []);

  // Derived stats
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

  const handleStatusChange = (providerId, status) => {
    const updated = providers.map(p =>
      p.id === providerId ? { ...p, status } : p
    );
    setProviders(updated);
    saveStoredProviders(updated);

    const provider = providers.find(p => p.id === providerId);
    if (status === 'approved') {
      showNotification(`✅ ${provider?.name || 'Provider'} approved and is now live on the homepage.`, 'success');
    } else {
      showNotification(`${provider?.name || 'Provider'} registration rejected.`, 'info');
    }
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
    const randomProvider = available.length
      ? available[Math.floor(Math.random() * available.length)]
      : 'Khan Academy SA';
    setFeaturedSlots(prev => prev.map(slot =>
      slot.id === slotId ? { ...slot, provider: randomProvider, addedDaysAgo: 0, daysRemaining: 7 } : slot
    ));
    showNotification(`Assigned ${randomProvider} to featured slot #${slotId}`, 'success');
  };

  const handleRotateFeatured = (slotId) => {
    const available = approvedProviders.map(p => p.name).filter(Boolean);
    const newProvider = available.length
      ? available[Math.floor(Math.random() * available.length)]
      : 'STEM Mastery Tutors';
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
    const p = typeof provider === 'string'
      ? providers.find(x => x.id === provider) || {}
      : provider;

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

          {/* ── PENDING APPROVALS ── */}
          {activeTab === 'pending' && (
            <div className="tab-pane active" role="tabpanel">
              <p className="section-heading">
                <i className="fas fa-hourglass-half"></i>
                Pending Approval ({pendingProviders.length}) — click name to view full details
              </p>

              {pendingProviders.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ink-3)' }}>
                  <i className="fas fa-check-circle" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block', color: 'var(--success)' }}></i>
                  No pending registrations at this time.
                </div>
              )}

              {pendingProviders.map(provider => (
                <div className="provider-row" key={provider.id}>
                  <div
                    className="provider-info"
                    onClick={() => showProfileModal(provider)}
                    role="button"
                    tabIndex="0"
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="avatar-small">{(provider.name || '?')[0].toUpperCase()}</span>
                    <div>
                      <div className="provider-name-row">
                        <strong style={{ color: 'var(--accent)' }}>{provider.name}</strong>
                        <span className="provider-cat">({provider.primaryCategory || provider.category})</span>
                        <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '3px', fontWeight: 700 }}>pending</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)', marginTop: '2px' }}>
                        {provider.email} · {provider.city}, {provider.province} · {provider.listingPlan || provider.tier} plan
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ink-4)', marginTop: '2px' }}>
                        Registered: {provider.registered ? new Date(provider.registered).toLocaleDateString('en-ZA') : '—'}
                      </div>
                    </div>
                  </div>
                  <div className="provider-actions">
                    <button
                      className="promote-btn"
                      style={{ background: '#d1fae5', color: '#065f46', border: 'none', padding: '6px 14px', borderRadius: '5px', fontWeight: 700, cursor: 'pointer' }}
                      onClick={() => handleStatusChange(provider.id, 'approved')}
                    >
                      <i className="fas fa-check"></i> Approve
                    </button>
                    <button
                      className="demote-btn"
                      style={{ marginLeft: '6px' }}
                      onClick={() => handleStatusChange(provider.id, 'rejected')}
                    >
                      <i className="fas fa-times"></i> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── ALL LISTINGS ── */}
          {activeTab === 'all' && (
            <div className="tab-pane active" role="tabpanel">
              <p className="section-heading">
                <i className="fas fa-list"></i>
                All Providers ({providers.length}) — Promote/Demote & Manage Badges
              </p>

              {providers.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ink-3)' }}>
                  No providers registered yet.
                </div>
              )}

              {providers.map(provider => (
                <div className="provider-row" key={provider.id}>
                  <div
                    className="provider-info"
                    onClick={() => showProfileModal(provider)}
                    role="button"
                    tabIndex="0"
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="avatar-small">{(provider.name || '?')[0].toUpperCase()}</span>
                    <div>
                      <div className="provider-name-row">
                        <strong>{provider.name}</strong>
                        <span className="provider-cat">({provider.primaryCategory || provider.category})</span>
                        <span className={provider.status === 'approved' ? 'approved-badge' : 'pending-badge'} style={{ fontSize: '0.72rem' }}>
                          {provider.status}
                        </span>
                        {provider.tier === 'featured' && (
                          <span className="featured-tag"><i className="fas fa-crown"></i> featured</span>
                        )}
                        {provider.tier === 'pro' && (
                          <span className="featured-tag" style={{ background: '#dbeafe', color: '#1e3a8a' }}>
                            <i className="fas fa-check-circle"></i> trusted
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)', marginTop: '2px' }}>
                        {provider.city}, {provider.province} · {provider.email}
                      </div>
                    </div>
                  </div>
                  <div className="provider-actions">
                    <div className="promote-demote-pair">
                      <button className="promote-btn" onClick={() => handlePromote(provider.name)}>
                        <i className="fas fa-arrow-up"></i> Promote
                      </button>
                      <button className="demote-btn" onClick={() => handleDemote(provider.name)}>
                        <i className="fas fa-arrow-down"></i> Demote
                      </button>
                    </div>
                    <div className="badge-selector">
                      {['community', 'trusted', 'featured'].map(b => (
                        <span
                          key={b}
                          className={`badge-option ${b} ${(provider.tier === (b === 'community' ? 'free' : b === 'trusted' ? 'pro' : 'featured')) ? 'selected' : ''}`}
                          onClick={() => handleBadgeSelect(provider.id, b)}
                          role="button"
                          tabIndex="0"
                        >
                          {b.charAt(0).toUpperCase() + b.slice(1)}
                        </span>
                      ))}
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

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalContent.title}
      >
        <div dangerouslySetInnerHTML={{ __html: modalContent.body }} />
      </Modal>

      <Footer />
    </>
  );
};

export default AdminDashboard;