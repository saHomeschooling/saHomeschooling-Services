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
import { api } from '../services/api';
import { providerData, featuredSlotsMock, reviewsMock, providersList } from '../utils/constants';
import { escapeHtml } from '../utils/helpers';
import '../assets/css/dashboard.css';   // ← FIXED PATH

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('pending');
  const [stats, setStats] = useState({
    totalProviders: 28,
    pendingApproval: 8,
    featuredSlots: 4,
    pendingReviews: 12
  });
  const [providers, setProviders] = useState(providersList);
  const [featuredSlots, setFeaturedSlots] = useState(featuredSlotsMock);
  const [reviews, setReviews] = useState(reviewsMock);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', body: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if not admin (for demo, we'll allow both)
    // In real app, check user?.role === 'admin'
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, providersRes, slotsRes, reviewsRes] = await Promise.all([
        api.getStats(),
        api.getProviders(),
        api.getFeaturedSlots(),
        api.getReviews()
      ]);
      
      if (statsRes.success) setStats(statsRes.data);
      if (providersRes.success) setProviders(providersRes.data);
      if (slotsRes.success) setFeaturedSlots(slotsRes.data);
      if (reviewsRes.success) setReviews(reviewsRes.data);
    } catch (error) {
      showNotification('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleStatusChange = async (providerId, status) => {
    try {
      if (status === 'approved') {
        await api.approveProvider(providerId);
        showNotification('Provider approved.', 'success');
      } else if (status === 'rejected') {
        await api.rejectProvider(providerId);
        showNotification('Provider rejected.', 'info');
      }
      
      // Update local state
      setProviders(prev => prev.map(p => 
        p.id === providerId ? { ...p, status } : p
      ));
    } catch (error) {
      showNotification('Error updating provider status', 'error');
    }
  };

  const handleOverride = (providerId, active) => {
    showNotification(
      active ? 'Override enabled for this provider.' : 'Override disabled',
      'info'
    );
  };

  const handleBadgeSelect = (providerId, badgeType) => {
    setProviders(prev => prev.map(p => 
      p.id === providerId ? { ...p, badge: badgeType } : p
    ));
    const provider = providers.find(p => p.id === providerId);
    showNotification(`Badge "${badgeType}" assigned to ${provider?.name || providerId}.`, 'success');
  };

  const handlePromote = (provider) => {
    showNotification(`"${provider}" promoted — listing will move up in search results.`, 'success');
  };

  const handleDemote = (provider) => {
    showNotification(`"${provider}" demoted — listing will move down in search results.`, 'info');
  };

  const handleRemoveFeatured = async (slotId, provider) => {
    try {
      await api.removeFeaturedSlot(slotId);
      setFeaturedSlots(prev => prev.map(slot => 
        slot.id === slotId ? { ...slot, provider: null, addedDaysAgo: 0, daysRemaining: 0 } : slot
      ));
      showNotification(`Removed ${provider} from featured slot #${slotId}`, 'info');
    } catch (error) {
      showNotification('Error removing featured slot', 'error');
    }
  };

  const handleAssignFeatured = async (slotId) => {
    try {
      const demoProviders = ['Khan Academy SA', 'Therapy4Learning', 'Creative Arts Studio', 'EduConsult Pro'];
      const randomProvider = demoProviders[Math.floor(Math.random() * demoProviders.length)];
      
      await api.assignFeaturedSlot(slotId, randomProvider);
      setFeaturedSlots(prev => prev.map(slot => 
        slot.id === slotId ? { ...slot, provider: randomProvider, addedDaysAgo: 0, daysRemaining: 7 } : slot
      ));
      showNotification(`Assigned ${randomProvider} to featured slot #${slotId}`, 'success');
    } catch (error) {
      showNotification('Error assigning featured slot', 'error');
    }
  };

  const handleRotateFeatured = async (slotId) => {
    try {
      await api.rotateFeaturedSlot(slotId);
      const rotatingProviders = ['Math Wizards', 'Bio Explorers', 'Chem Lab', 'STEM Masters'];
      const newProvider = rotatingProviders[Math.floor(Math.random() * rotatingProviders.length)];
      
      setFeaturedSlots(prev => prev.map(slot => 
        slot.id === slotId ? { ...slot, provider: newProvider, addedDaysAgo: 0, daysRemaining: 7 } : slot
      ));
      showNotification(`Rotated slot #${slotId} to ${newProvider}`, 'success');
    } catch (error) {
      showNotification('Error rotating featured slot', 'error');
    }
  };

  const handleModerateReview = async (reviewId, action) => {
    try {
      await api.moderateReview(reviewId, action);
      setReviews(prev => prev.map(r => 
        r.id === reviewId ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r
      ));
    } catch (error) {
      showNotification('Error moderating review', 'error');
    }
  };

  const showProfileModal = (providerKey) => {
    const data = providerData[providerKey] || providerData.bright;
    
    const starFill = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
    
    const reviewsHtml = data.reviews.items.map(r => `
      <div style="background:var(--bg); padding:0.75rem 1rem; border-radius:var(--radius-sm); margin-bottom:0.5rem; border:1px solid var(--border);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
          <strong style="font-size:0.875rem;">${escapeHtml(r.reviewer)}</strong>
          <span style="color:#f59e0b; font-size:0.9rem;" aria-label="${r.rating} stars">${starFill(r.rating)}</span>
        </div>
        <p style="font-size:0.82rem; color:var(--ink-2); font-style:italic;">"${escapeHtml(r.text)}"</p>
      </div>
    `).join('');

    const modalBody = `
      <div style="border-top:1px solid var(--border); margin:1.25rem 0 0.75rem; padding-top:0.75rem;">
        <p style="font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--accent);">Account Information</p>
      </div>
      <div class="modal-field"><label>Full name / Business</label><div class="value">${escapeHtml(data.name)}</div></div>
      <div class="modal-field"><label>Email address</label><div class="value">${escapeHtml(data.email)}</div></div>
      <div class="modal-field"><label>Account type</label><div class="value">${escapeHtml(data.accountType)}</div></div>
      <div class="modal-field"><label>Years of experience</label><div class="value">${escapeHtml(data.yearsExperience)}</div></div>
      <div class="modal-field"><label>Languages spoken</label><div class="value">${escapeHtml(data.languages.join(', '))}</div></div>
      <div class="modal-field"><label>Primary category</label><div class="value">${escapeHtml(data.primaryCategory)}</div></div>

      <div style="border-top:1px solid var(--border); margin:1.25rem 0 0.75rem; padding-top:0.75rem;">
        <p style="font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--accent);">Tags & Bio</p>
      </div>
      <div class="modal-field"><label>Tags</label><div class="value">${escapeHtml(data.tags.join(', '))}</div></div>
      <div class="modal-field"><label>Short bio</label><div class="value">${escapeHtml(data.bio)}</div></div>

      <div style="border-top:1px solid var(--border); margin:1.25rem 0 0.75rem; padding-top:0.75rem;">
        <p style="font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--accent);">Qualifications & Experience</p>
      </div>
      <div class="modal-field"><label>Certifications</label><div class="value">${escapeHtml(data.certifications)}</div></div>
      <div class="modal-field"><label>Degrees</label><div class="value">${escapeHtml(data.degrees)}</div></div>
      <div class="modal-field"><label>Professional memberships</label><div class="value">${escapeHtml(data.memberships)}</div></div>
      <div class="modal-field"><label>Background clearance</label><div class="value">${escapeHtml(data.clearance)}</div></div>

      <div style="border-top:1px solid var(--border); margin:1.25rem 0 0.75rem; padding-top:0.75rem;">
        <p style="font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--accent);">Service Details</p>
      </div>
      <div class="modal-field"><label>Service title</label><div class="value">${escapeHtml(data.serviceTitle)}</div></div>
      <div class="modal-field"><label>Age groups served</label><div class="value">${escapeHtml(data.ageGroups.join(', '))}</div></div>
      <div class="modal-field"><label>Mode of delivery</label><div class="value">${escapeHtml(data.deliveryMode)}</div></div>

      <div style="border-top:1px solid var(--border); margin:1.25rem 0 0.75rem; padding-top:0.75rem;">
        <p style="font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--accent);">Location & Reach</p>
      </div>
      <div class="modal-field"><label>Province</label><div class="value">${escapeHtml(data.province)}</div></div>
      <div class="modal-field"><label>City / Town</label><div class="value">${escapeHtml(data.city)}</div></div>
      <div class="modal-field"><label>Service area</label><div class="value">${escapeHtml(data.serviceArea)}${data.radius ? ' (' + data.radius + ' km radius)' : ''}</div></div>

      <div style="border-top:1px solid var(--border); margin:1.25rem 0 0.75rem; padding-top:0.75rem;">
        <p style="font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--accent);">Pricing & Availability</p>
      </div>
      <div class="modal-field"><label>Pricing model</label><div class="value">${escapeHtml(data.pricingModel)}</div></div>
      <div class="modal-field"><label>Starting price</label><div class="value">${escapeHtml(data.startingPrice)}</div></div>
      <div class="modal-field"><label>Days available</label><div class="value">${escapeHtml(data.availabilityDays.join(', '))}</div></div>
      <div class="modal-field"><label>Availability notes</label><div class="value">${escapeHtml(data.availabilityNotes)}</div></div>

      <div style="border-top:1px solid var(--border); margin:1.25rem 0 0.75rem; padding-top:0.75rem;">
        <p style="font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--accent);">Contact & Online Presence</p>
      </div>
      <div class="modal-field"><label>Primary contact</label><div class="value">${escapeHtml(data.contactName)}</div></div>
      <div class="modal-field"><label>Phone number</label><div class="value">${escapeHtml(data.phone)}</div></div>
      <div class="modal-field"><label>Contact email</label><div class="value">${escapeHtml(data.contactEmail)}</div></div>
      <div class="modal-field"><label>Social / website</label><div class="value">${escapeHtml(data.social)}</div></div>
      <div class="modal-field"><label>Public display</label><div class="value">${data.publicDisplay ? 'Enabled' : 'Disabled'}</div></div>
      <div class="modal-field"><label>Listing plan</label><div class="value">${escapeHtml(data.listingPlan)}</div></div>

      <div style="border-top:1px solid var(--border); margin:1.25rem 0 0.75rem; padding-top:0.75rem;">
        <p style="font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--accent);">Reviews & Ratings</p>
      </div>
      <div class="modal-field"><label>Average rating</label><div class="value">${data.reviews.average}/5 (${data.reviews.count} reviews)</div></div>
      ${reviewsHtml}
    `;

    setModalContent({
      title: `${data.name} — Complete Profile`,
      body: modalBody
    });
    setModalOpen(true);
  };

  const pendingProviders = providers.filter(p => p.status === 'pending');
  const allProviders = providers;
  const pendingReviews = reviews.filter(r => r.status === 'pending');

  return (
    <>
      <Header userType="admin" />
      
      <main className="dash-wrapper">
        <div className="page-headline">
          <h1>Admin Control Panel</h1>
          <p>Manage listings, approvals, featured slots, provider badges, and moderate reviews</p>
        </div>

        <div className="card">
          {/* Card header */}
          <div className="card-header">
            <i className="fas fa-shield-halved"></i>
            <h2>Directory Oversight</h2>
            <span className="badge"><i className="fas fa-lock"></i> admin</span>
          </div>

          {/* Statistics summary */}
          <div className="admin-stats" role="region" aria-label="Dashboard statistics">
            <StatsBox value={stats.totalProviders} label="total providers" />
            <StatsBox value={stats.pendingApproval} label="pending approval" />
            <StatsBox value={stats.featuredSlots} label="featured slots" />
            <StatsBox value={stats.pendingReviews} label="reviews pending" />
          </div>

          {/* Admin tabs */}
          <div className="admin-tabs" role="tablist" aria-label="Admin sections">
            <button 
              className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} 
              role="tab" 
              aria-selected={activeTab === 'pending'} 
              onClick={() => handleTabChange('pending')}
            >
              <i className="fas fa-hourglass-half"></i> Pending Approvals
            </button>
            <button 
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} 
              role="tab" 
              aria-selected={activeTab === 'all'} 
              onClick={() => handleTabChange('all')}
            >
              <i className="fas fa-list"></i> All Listings
            </button>
            <button 
              className={`tab-btn ${activeTab === 'featured' ? 'active' : ''}`} 
              role="tab" 
              aria-selected={activeTab === 'featured'} 
              onClick={() => handleTabChange('featured')}
            >
              <i className="fas fa-star"></i> Featured Slots
            </button>
            <button 
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} 
              role="tab" 
              aria-selected={activeTab === 'reviews'} 
              onClick={() => handleTabChange('reviews')}
            >
              <i className="fas fa-star-half-alt"></i> Review Moderation
              <span className="pending-badge" aria-label="12 pending reviews">{pendingReviews.length}</span>
            </button>
          </div>

          {/* Pending Approvals Tab */}
          {activeTab === 'pending' && (
            <div id="pending-tab" className="tab-pane active" role="tabpanel">
              <p className="section-heading">
                <i className="fas fa-hourglass-half"></i>
                Pending Approval ({pendingProviders.length}) — click name to view full details
              </p>

              {pendingProviders.map(provider => (
                <ProviderRow
                  key={provider.id}
                  provider={{
                    ...provider,
                    onClick: () => showProfileModal(provider.id === 'pending1' ? 'khan' : provider.id === 'pending2' ? 'therapy' : 'creative')
                  }}
                  onStatusChange={handleStatusChange}
                  onOverride={handleOverride}
                  onBadgeSelect={handleBadgeSelect}
                />
              ))}
            </div>
          )}

          {/* All Listings Tab */}
          {activeTab === 'all' && (
            <div id="all-tab" className="tab-pane active" role="tabpanel">
              <p className="section-heading">
                <i className="fas fa-list"></i>
                All Providers — Promote/Demote & Manage Badges
              </p>

              {allProviders.filter(p => p.status === 'approved').map(provider => (
                <div className="provider-row" key={provider.id}>
                  <div 
                    className="provider-info" 
                    onClick={() => showProfileModal(provider.id === 'bright' ? 'bright' : 'edu')}
                    role="button" 
                    tabIndex="0"
                  >
                    <span className="avatar-small">{provider.avatar}</span>
                    <div>
                      <div className="provider-name-row">
                        <strong>{provider.name}</strong>
                        <span className="provider-cat">({provider.category})</span>
                        <span className="approved-badge">approved</span>
                        {provider.badge === 'featured' && (
                          <span className="featured-tag"><i className="fas fa-crown"></i> featured</span>
                        )}
                        {provider.badge === 'trusted' && (
                          <span className="featured-tag" style={{ background: '#dbeafe', color: '#1e3a8a' }}>
                            <i className="fas fa-check-circle"></i> trusted
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="provider-actions">
                    <div className="promote-demote-pair">
                      <button 
                        className="promote-btn" 
                        onClick={() => handlePromote(provider.name)}
                        aria-label={`Promote ${provider.name}`}
                      >
                        <i className="fas fa-arrow-up"></i> Promote
                      </button>
                      <button 
                        className="demote-btn" 
                        onClick={() => handleDemote(provider.name)}
                        aria-label={`Demote ${provider.name}`}
                      >
                        <i className="fas fa-arrow-down"></i> Demote
                      </button>
                    </div>
                    <div className="badge-selector" aria-label="Assign badge">
                      <span 
                        className={`badge-option community ${provider.badge === 'community' ? 'selected' : ''}`}
                        onClick={() => handleBadgeSelect(provider.id, 'community')}
                        role="button" 
                        tabIndex="0"
                      >
                        Community
                      </span>
                      <span 
                        className={`badge-option trusted ${provider.badge === 'trusted' ? 'selected' : ''}`}
                        onClick={() => handleBadgeSelect(provider.id, 'trusted')}
                        role="button" 
                        tabIndex="0"
                      >
                        Trusted
                      </span>
                      <span 
                        className={`badge-option featured ${provider.badge === 'featured' ? 'selected' : ''}`}
                        onClick={() => handleBadgeSelect(provider.id, 'featured')}
                        role="button" 
                        tabIndex="0"
                      >
                        Featured
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Featured Slots Tab */}
          {activeTab === 'featured' && (
            <div id="featured-tab" className="tab-pane active" role="tabpanel">
              <p className="section-heading">
                <i className="fas fa-star"></i>
                Global Featured Slots — 4 total, rotate every 7 days
              </p>

              <div className="featured-slots" id="featuredSlotsContainer">
                {featuredSlots.map(slot => (
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

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div id="reviews-tab" className="tab-pane active" role="tabpanel">
              <p className="section-heading">
                <i className="fas fa-star-half-alt"></i>
                Moderate Reviews ({pendingReviews.length} pending)
              </p>

              {pendingReviews.map(review => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onModerate={handleModerateReview}
                />
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

          {/* Card footer */}
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

      {/* Profile Modal */}
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