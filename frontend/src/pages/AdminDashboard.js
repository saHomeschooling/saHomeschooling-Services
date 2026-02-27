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

// Add custom CSS for modal
const modalStyles = `
  .admin-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.2s ease;
  }

  .admin-modal-content {
    background: white;
    border-radius: 16px;
    width: 90%;
    max-width: 800px;
    max-height: 85vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease;
  }

  .admin-modal-header {
    background: #5a5a5a;
    color: white;
    padding: 20px 24px;
    border-radius: 16px 16px 0 0;
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .admin-modal-header h2 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
    font-family: 'Playfair Display', serif;
  }

  .admin-modal-close {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1.2rem;
    transition: background 0.2s;
  }

  .admin-modal-close:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .admin-modal-body {
    padding: 24px;
    max-height: calc(85vh - 80px);
    overflow-y: auto;
  }

  .modal-section {
    margin-bottom: 28px;
    border-bottom: 1px solid #eaeaea;
    padding-bottom: 20px;
  }

  .modal-section:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  .modal-section-title {
    font-size: 1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #c9621a;
    margin: 0 0 16px 0;
    padding-bottom: 8px;
    border-bottom: 2px solid #c9621a;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .modal-section-title i {
    font-size: 1rem;
  }

  .modal-field {
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
  }

  .modal-field-label {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: #666;
    margin-bottom: 4px;
  }

  .modal-field-value {
    font-size: 0.95rem;
    color: #333;
    line-height: 1.5;
    background: #f8f8f8;
    padding: 10px 12px;
    border-radius: 8px;
    word-break: break-word;
  }

  .modal-field-value.bio {
    white-space: pre-wrap;
    font-style: italic;
  }

  .modal-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    margin-right: 8px;
  }

  .badge-pending {
    background: #fef3c7;
    color: #92400e;
  }

  .badge-approved {
    background: #d1fae5;
    color: #065f46;
  }

  .badge-free {
    background: #f0f0f0;
    color: #555;
  }

  .badge-pro {
    background: #dbeafe;
    color: #1e3a8a;
  }

  .badge-featured {
    background: #fef3c7;
    color: #92400e;
  }

  .service-item {
    background: #f0f0f0;
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 12px;
  }

  .service-item:last-child {
    margin-bottom: 0;
  }

  .service-title {
    font-weight: 700;
    color: #333;
    margin-bottom: 8px;
    font-size: 1rem;
  }

  .service-details {
    font-size: 0.85rem;
    color: #666;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .file-upload-indicator {
    color: #16a34a;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
  }

  .social-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }

  .social-item {
    background: #f0f0f0;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 0.85rem;
  }

  .social-item i {
    color: #c9621a;
    width: 20px;
    margin-right: 6px;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @media (max-width: 768px) {
    .admin-modal-content {
      width: 95%;
      max-height: 90vh;
    }
    
    .admin-modal-body {
      padding: 16px;
    }
    
    .social-grid {
      grid-template-columns: 1fr;
    }
  }
`;

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

  const openProviderModal = (provider) => {
    setSelectedProvider(provider);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedProvider(null);
  };

  const renderProviderModal = () => {
    if (!selectedProvider) return null;

    const p = selectedProvider;

    // Format service areas
    const serviceAreas = p.serviceAreas ? p.serviceAreas.join(', ') : 
                         p.serviceAreaType === 'local' ? `Local (${p.radius || p.localRadiusNum || ''} ${p.localRadiusUnit || 'km'})` :
                         p.serviceAreaType === 'national' ? 'National' : 'Online only';

    // Format qualifications
    const qualifications = [
      p.certifications, p.degrees, p.memberships
    ].filter(Boolean).join(' · ') || 'None provided';

    // Format languages
    const languages = p.languages && p.languages.length > 0 ? p.languages.join(', ') : 'None selected';

    // Format services
    const servicesList = p.services && p.services.length > 0 
      ? p.services.map((s, i) => `
          <div class="service-item">
            <div class="service-title">${escapeHtml(s.title || 'Untitled Service')}</div>
            <div class="service-details">
              <span><i class="fas fa-users"></i> Age groups: ${escapeHtml(s.ageGroups ? s.ageGroups.join(', ') : 'None')}</span>
              <span><i class="fas fa-dot-circle"></i> Delivery: ${escapeHtml(s.deliveryMode || 'Not specified')}</span>
            </div>
          </div>
        `).join('')
      : '<div class="modal-field-value">No services added</div>';

    // Format availability days
    const availabilityDays = p.availabilityDays && p.availabilityDays.length > 0 
      ? p.availabilityDays.join(', ') 
      : 'None selected';

    // Format uploaded files
    const uploadedFiles = [];
    if (p.profilePhoto) uploadedFiles.push('<span class="file-upload-indicator"><i class="fas fa-check-circle"></i> Profile photo uploaded</span>');
    if (p.certsFile) uploadedFiles.push('<span class="file-upload-indicator"><i class="fas fa-check-circle"></i> Certifications file uploaded</span>');
    if (p.clearanceFile) uploadedFiles.push('<span class="file-upload-indicator"><i class="fas fa-check-circle"></i> Police clearance file uploaded</span>');
    
    const filesHtml = uploadedFiles.length > 0
      ? uploadedFiles.join('')
      : '<div class="modal-field-value">No files uploaded</div>';

    // Format social media
    const socialMedia = [];
    if (p.website) socialMedia.push(`<div class="social-item"><i class="fas fa-globe"></i> ${escapeHtml(p.website)}</div>`);
    if (p.facebook) socialMedia.push(`<div class="social-item"><i class="fab fa-facebook"></i> ${escapeHtml(p.facebook)}</div>`);
    if (p.instagram) socialMedia.push(`<div class="social-item"><i class="fab fa-instagram"></i> ${escapeHtml(p.instagram)}</div>`);
    if (p.linkedin) socialMedia.push(`<div class="social-item"><i class="fab fa-linkedin"></i> ${escapeHtml(p.linkedin)}</div>`);
    if (p.tiktok) socialMedia.push(`<div class="social-item"><i class="fab fa-tiktok"></i> ${escapeHtml(p.tiktok)}</div>`);
    if (p.youtube) socialMedia.push(`<div class="social-item"><i class="fab fa-youtube"></i> ${escapeHtml(p.youtube)}</div>`);
    if (p.twitter) socialMedia.push(`<div class="social-item"><i class="fab fa-x-twitter"></i> ${escapeHtml(p.twitter)}</div>`);

    const socialHtml = socialMedia.length > 0 
      ? `<div class="social-grid">${socialMedia.join('')}</div>`
      : '<div class="modal-field-value">No social media links provided</div>';

    return (
      <div className="admin-modal-overlay" onClick={closeModal}>
        <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="admin-modal-header">
            <h2>{escapeHtml(p.name || 'Provider')} — Complete Registration Details</h2>
            <button className="admin-modal-close" onClick={closeModal}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="admin-modal-body">

            {/* Account Information Section */}
            <div className="modal-section">
              <h3 className="modal-section-title"><i className="fas fa-user-circle"></i> Account Information</h3>
              
              <div className="modal-field">
                <span className="modal-field-label">Full name / Business</span>
                <div className="modal-field-value">{escapeHtml(p.name || '—')}</div>
              </div>
              
              <div className="modal-field">
                <span className="modal-field-label">Email address</span>
                <div className="modal-field-value">{escapeHtml(p.email || '—')}</div>
              </div>
              
              <div className="modal-field">
                <span className="modal-field-label">Account type</span>
                <div className="modal-field-value">{escapeHtml(p.accountType || '—')}</div>
              </div>
              
              <div className="modal-field">
                <span className="modal-field-label">Primary category</span>
                <div className="modal-field-value">{escapeHtml(p.primaryCategory || p.category || '—')}</div>
              </div>
              
              <div className="modal-field">
                <span className="modal-field-label">Status</span>
                <div className="modal-field-value">
                  <span className={`modal-badge ${p.status === 'approved' ? 'badge-approved' : p.status === 'pending' ? 'badge-pending' : ''}`}>
                    {escapeHtml(p.status || '—')}
                  </span>
                </div>
              </div>
              
              <div className="modal-field">
                <span className="modal-field-label">Plan</span>
                <div className="modal-field-value">
                  <span className={`modal-badge badge-${p.plan || 'free'}`}>
                    <i className={`fas fa-${p.plan === 'featured' ? 'crown' : p.plan === 'pro' ? 'check-circle' : 'user'}`}></i> {escapeHtml(p.plan || 'free')}
                  </span>
                </div>
              </div>
            </div>

            {/* Identity & Trust Section */}
            <div className="modal-section">
              <h3 className="modal-section-title"><i className="fas fa-id-card"></i> Identity & Trust</h3>
              
              <div className="modal-field">
                <span className="modal-field-label">Years of experience</span>
                <div className="modal-field-value">{escapeHtml(p.yearsExperience || p.experience || '—')}</div>
              </div>
              
              <div className="modal-field">
                <span className="modal-field-label">Short bio</span>
                <div className="modal-field-value bio">{escapeHtml(p.bio || '—')}</div>
              </div>
              
              <div className="modal-field">
                <span className="modal-field-label">Qualifications</span>
                <div className="modal-field-value">{escapeHtml(qualifications)}</div>
              </div>
              
              <div className="modal-field">
                <span className="modal-field-label">Police clearance</span>
                <div className="modal-field-value">{escapeHtml(p.clearance || '—')}</div>
              </div>
              
              <div className="modal-field">
                <span className="modal-field-label">Languages spoken</span>
                <div className="modal-field-value">{escapeHtml(languages)}</div>
              </div>
              
              <div className="modal-field">
                <span className="modal-field-label">Uploaded files</span>
                <div dangerouslySetInnerHTML={{ __html: filesHtml }} />
              </div>
            </div>

            {/* Services Offered Section */}
            <div className="modal-section">
              <h3 className="modal-section-title"><i className="fas fa-briefcase"></i> Services Offered</h3>
              
              <div dangerouslySetInnerHTML={{ __html: servicesList }} />
              
              <div className="modal-field" style={{ marginTop: '16px' }}>
                <span className="modal-field-label">Subjects / Specialisations</span>
                <div className="modal-field-value">{escapeHtml(p.tags ? p.tags.join(', ') : p.subjects || '—')}</div>
              </div>
            </div>

            {/* Location & Reach Section */}
            <div className="modal-section">
              <h3 className="modal-section-title"><i className="fas fa-map-marker-alt"></i> Location & Reach</h3>
              
              <div className="modal-field">
                <span className="modal-field-label">City / Province</span>
                <div className="modal-field-value">{escapeHtml(p.city || '')}{p.city && p.province ? ', ' : ''}{escapeHtml(p.province || '')}</div>
              </div>
              
              <div className="modal-field">
                <span className="modal-field-label">Service area</span>
                <div className="modal-field-value">{escapeHtml(serviceAreas)}</div>
              </div>
              
              {p.localRadiusNum && (
                <div className="modal-field">
                  <span className="modal-field-label">Local radius</span>
                  <div className="modal-field-value">{escapeHtml(p.localRadiusNum)} {escapeHtml(p.localRadiusUnit || 'km')}</div>
                </div>
              )}
            </div>

            {/* Pricing & Availability Section */}
            <div className="modal-section">
              <h3 className="modal-section-title"><i className="fas fa-calendar-alt"></i> Pricing & Availability</h3>
              
              <div className="modal-field">
                <span className="modal-field-label">Pricing model</span>
                <div className="modal-field-value">{escapeHtml(p.pricingModel || '—')}</div>
              </div>
              
              <div className="modal-field">
                <span className="modal-field-label">Starting price</span>
                <div className="modal-field-value">{escapeHtml(p.startingPrice ? `R${p.startingPrice}` : p.priceFrom || '—')}</div>
              </div>
              
              <div className="modal-field">
                <span className="modal-field-label">Days available</span>
                <div className="modal-field-value">{escapeHtml(availabilityDays)}</div>
              </div>
              
              <div className="modal-field">
                <span className="modal-field-label">Time slots</span>
                <div className="modal-field-value">{escapeHtml(p.availabilityNotes || p.timeSlots || '—')}</div>
              </div>
            </div>

            {/* Contact Details Section */}
            <div className="modal-section">
              <h3 className="modal-section-title"><i className="fas fa-phone"></i> Contact Details</h3>
              
              <div className="modal-field">
                <span className="modal-field-label">Phone number</span>
                <div className="modal-field-value">{escapeHtml(p.phone || '—')}</div>
              </div>
              
              {p.whatsappLocal && (
                <div className="modal-field">
                  <span className="modal-field-label">WhatsApp number</span>
                  <div className="modal-field-value">{escapeHtml(`+27${p.whatsappLocal}`)}</div>
                </div>
              )}
              
              <div className="modal-field">
                <span className="modal-field-label">Email for enquiries</span>
                <div className="modal-field-value">{escapeHtml(p.contactEmail || p.email || '—')}</div>
              </div>
              
              <div className="modal-field">
                <span className="modal-field-label">Display contact publicly</span>
                <div className="modal-field-value">{p.publicToggle ? 'Yes' : 'No'}</div>
              </div>
              
              <div className="modal-field">
                <span className="modal-field-label">Website & Social Media</span>
                <div dangerouslySetInnerHTML={{ __html: socialHtml }} />
              </div>
            </div>

            {/* Registration Info Section */}
            <div className="modal-section">
              <h3 className="modal-section-title"><i className="fas fa-clock"></i> Registration Info</h3>
              
              <div className="modal-field">
                <span className="modal-field-label">Provider ID</span>
                <div className="modal-field-value" style={{ fontFamily: 'monospace' }}>{escapeHtml(p.id || '—')}</div>
              </div>
              
              <div className="modal-field">
                <span className="modal-field-label">Registered on</span>
                <div className="modal-field-value">
                  {p.registered ? new Date(p.registered).toLocaleDateString('en-ZA', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '—'}
                </div>
              </div>
              
              <div className="modal-field">
                <span className="modal-field-label">Reviews</span>
                <div className="modal-field-value">
                  {p.reviews?.count || 0} reviews (average: {p.reviews?.average || 0}/5)
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
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
                    onClick={() => openProviderModal(provider)}
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
                All Providers ({providers.length}) — Promote/Demote & Manage Badges — click name to view full details
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
                    onClick={() => openProviderModal(provider)}
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

      {modalOpen && renderProviderModal()}

      <Footer />
    </>
  );
};

export default AdminDashboard;