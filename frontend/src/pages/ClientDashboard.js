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
  try {
    return JSON.parse(localStorage.getItem('sah_current_user') || 'null');
  } catch { return null; }
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
    if (idx !== -1) {
      all[idx] = updatedProvider;
    } else {
      all.push(updatedProvider);
    }
    localStorage.setItem('sah_providers', JSON.stringify(all));
  } catch {}
}

// Default empty profile shape for a new provider
const EMPTY_PROFILE = {
  id: '',
  name: '',
  email: '',
  accountType: 'Individual Provider',
  yearsExperience: '',
  languages: [],
  primaryCategory: '',
  tags: [],
  bio: '',
  certifications: '',
  degrees: '',
  memberships: '',
  clearance: '',
  services: [{ title: '', ageGroups: [], deliveryMode: 'Online' }],
  province: '',
  city: '',
  serviceAreaType: 'national',
  radius: '',
  pricingModel: '',
  startingPrice: '',
  availabilityDays: [],
  availabilityNotes: '',
  contactName: '',
  phone: '',
  contactEmail: '',
  social: '',
  publicToggle: true,
  plan: 'free',
  listingPublic: true,
  status: 'pending',
  reviews: { average: 0, count: 0, items: [] },
  profilePhoto: null,
  certsFile: null,
  clearanceFile: null,
};

const ClientDashboard = () => {
  const { user, updateUserPlan } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [editModeActive, setEditModeActive] = useState(false);
  const [originalValues, setOriginalValues] = useState({});
  const [profileData, setProfileData] = useState(EMPTY_PROFILE);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Add custom CSS for spacing
  useEffect(() => {
    if (!document.getElementById('dashboard-spacing-css')) {
      const s = document.createElement('style');
      s.id = 'dashboard-spacing-css';
      s.textContent = dashboardSpacingCSS;
      document.head.appendChild(s);
    }
  }, []);

  // Load the logged-in user's provider data on mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const stored = currentUser.id ? getProviderById(currentUser.id) : null;

    if (stored) {
      setProfileData({ ...EMPTY_PROFILE, ...stored });
      // Set photo preview if exists
      if (stored.profilePhoto) {
        setPhotoPreview(stored.profilePhoto);
      }
    } else {
      // New user with no stored provider record yet — prefill from currentUser
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

  const toggleEditMode = () => {
    if (!editModeActive) {
      setOriginalValues({ profileData: { ...profileData } });
      setEditModeActive(true);
    } else {
      cancelEdit();
    }
  };

  const cancelEdit = () => {
    if (originalValues.profileData) {
      setProfileData(originalValues.profileData);
    }
    setEditModeActive(false);
    showNotification('Changes discarded', 'info');
  };

  const saveChanges = () => {
    setLoading(true);
    try {
      saveProviderById(profileData);
      // Also update currentUser name in storage
      const currentUser = getCurrentUser();
      if (currentUser) {
        localStorage.setItem('sah_current_user', JSON.stringify({
          ...currentUser,
          name: profileData.name,
          plan: profileData.plan,
        }));
      }
      setOriginalValues({ profileData: { ...profileData } });
      setEditModeActive(false);
      showNotification('Changes saved successfully!', 'success');
    } catch {
      showNotification('Error saving changes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (photoData) => {
    setPhotoPreview(photoData);
    setProfileData(prev => ({ ...prev, profilePhoto: photoData }));
    showNotification('Photo updated successfully!', 'success');
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

  const getPlanName = () => ({
    free: 'Community Member (Free)',
    pro: 'Trusted Provider (R149/month)',
    featured: 'Featured Partner (R399/month)',
  }[profileData.plan] || 'Community Member (Free)');

  // Public view URL — links to Profile page with this provider's id
  const publicViewUrl = profileData.id ? `/profile?id=${profileData.id}` : '/profile';

  return (
    <>
      <Header userType="client" />

      <main className="dash-wrapper">
        <div className="page-headline">
          <h1>My Provider Dashboard</h1>
          <div className="welcome-row">
            <p>Welcome back, <span id="welcomeName">{profileData.name || 'Provider'}</span></p>
            <a
              href={publicViewUrl}
              className="profile-preview-badge"
              aria-label="Switch to public view"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fas fa-eye"></i> public view
            </a>
          </div>
          <span className="status-notice" role="status">
            <i className="fas fa-clock"></i>
            <strong>Status:</strong>
            {profileData.status === 'approved' ? (
              <span style={{ color: 'var(--success)', fontWeight: 700, marginLeft: '6px' }}>
                <i className="fas fa-check-circle"></i> Approved — Live
              </span>
            ) : profileData.status === 'rejected' ? (
              <span style={{ color: '#c0234a', fontWeight: 700, marginLeft: '6px' }}>
                <i className="fas fa-times-circle"></i> Rejected
              </span>
            ) : (
              <>
                <span className="pending-badge" style={{ marginLeft: '6px' }}>Pending Approval</span>
                <span style={{ marginLeft: '6px' }}>Your profile is awaiting admin verification</span>
              </>
            )}
          </span>
        </div>

        <div className={`card client-dash ${editModeActive ? 'edit-mode' : ''}`} id="clientDashboard">
          <div className="card-header">
            <i className="fas fa-user-circle"></i>
            <h2>Profile Information</h2>
            <span
              className={`badge ${editModeActive ? 'active' : ''}`}
              id="editModeBadge"
              onClick={toggleEditMode}
              role="button"
              tabIndex="0"
              aria-label="Toggle edit mode"
            >
              {editModeActive ? (
                <><i className="fas fa-pencil-alt"></i> edit mode active</>
              ) : (
                <><i className="far fa-edit"></i> activate edit mode</>
              )}
            </span>
          </div>

          <ProfileSection
            profileData={profileData}
            isEditing={editModeActive}
            onUpdate={handleUpdateProfile}
            onPhotoUpload={handlePhotoUpload}
          />

          <TagsInput
            tags={profileData.tags}
            isEditing={editModeActive}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
          />

          {/* Bio */}
          <div className="profile-field">
            <label htmlFor="fieldBio">Short bio <span>*</span></label>
            {editModeActive ? (
              <textarea
                id="fieldBio"
                value={profileData.bio}
                onChange={(e) => handleUpdateProfile({ bio: e.target.value })}
                className="profile-value"
                rows="4"
                style={{ minHeight: '80px', width: '100%', padding: '12px' }}
              />
            ) : (
              <div className="profile-value" style={{ minHeight: '80px', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>{profileData.bio || <em style={{ color: 'var(--ink-4)' }}>No bio added yet.</em>}</div>
            )}
          </div>

          {/* Qualifications */}
          <p className="section-label"><i className="fas fa-graduation-cap"></i> Qualifications &amp; Experience</p>

          <div className="qualification-item">
            <div className="inline-group">
              <div className="profile-field">
                <label>Certifications</label>
                {editModeActive ? (
                  <input type="text" value={profileData.certifications} onChange={(e) => handleUpdateProfile({ certifications: e.target.value })} className="profile-value" style={{ width: '100%', padding: '10px' }} />
                ) : (
                  <div className="profile-value" style={{ padding: '10px', background: '#f5f5f5', borderRadius: '8px' }}>{profileData.certifications || '—'}</div>
                )}
              </div>
              <div className="profile-field">
                <label>Degrees</label>
                {editModeActive ? (
                  <input type="text" value={profileData.degrees} onChange={(e) => handleUpdateProfile({ degrees: e.target.value })} className="profile-value" style={{ width: '100%', padding: '10px' }} />
                ) : (
                  <div className="profile-value" style={{ padding: '10px', background: '#f5f5f5', borderRadius: '8px' }}>{profileData.degrees || '—'}</div>
                )}
              </div>
            </div>
            <div className="inline-group" style={{ marginBottom: 0 }}>
              <div className="profile-field">
                <label>Professional memberships</label>
                {editModeActive ? (
                  <input type="text" value={profileData.memberships} onChange={(e) => handleUpdateProfile({ memberships: e.target.value })} className="profile-value" style={{ width: '100%', padding: '10px' }} />
                ) : (
                  <div className="profile-value" style={{ padding: '10px', background: '#f5f5f5', borderRadius: '8px' }}>{profileData.memberships || '—'}</div>
                )}
              </div>
              <div className="profile-field">
                <label>Background clearance</label>
                <div>
                  <span className="badge-clearance" id="clearanceBadge" style={{ display: 'inline-block', padding: '8px 12px', background: '#f5f5f5', borderRadius: '8px' }}>
                    <i className="fas fa-circle-check"></i> {profileData.clearance || 'Not provided'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <p className="section-label"><i className="fas fa-briefcase"></i> Service Details</p>

          <div className={`service-limit-note ${profileData.plan === 'free' ? 'free-limit' : 'paid-limit'}`} style={{ marginBottom: '1.5rem', padding: '12px', background: '#f0f0f0', borderRadius: '8px' }}>
            <i className="fas fa-info-circle"></i>
            <span>
              {profileData.plan === 'free'
                ? 'Free plan: You can add only 1 service. Upgrade to add more.'
                : profileData.plan === 'pro'
                  ? 'Trusted Provider: You can add up to 5 services.'
                  : 'Featured Partner: You can add up to 10 services.'}
            </span>
          </div>

          {profileData.services.map((service, index) => (
            <div key={index} className="service-item" style={{ marginBottom: '32px', padding: '24px', background: '#f9f9f9', borderRadius: '12px' }}>
              <ServiceItem
                service={service}
                index={index}
                isEditing={editModeActive}
                onUpdate={handleUpdateService}
                onRemove={handleRemoveService}
                canRemove={profileData.services.length > 1 && profileData.plan !== 'free'}
              />
            </div>
          ))}

          {editModeActive && profileData.plan !== 'free' && (
            <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center' }}>
              <button className="add-service-btn" onClick={handleAddService} disabled={serviceCount >= maxServices} style={{ padding: '10px 20px', marginRight: '16px' }}>
                <i className="fas fa-plus-circle"></i> Add another service
              </button>
              <span className="service-counter" style={{ fontSize: '0.9rem', color: '#666' }}>{serviceCount}/{maxServices} services used</span>
            </div>
          )}

          {/* Location */}
          <p className="section-label"><i className="fas fa-map-marker-alt"></i> Location &amp; Reach</p>

          <div className="inline-group">
            <div className="profile-field">
              <label>Province</label>
              {editModeActive ? (
                <select value={profileData.province} onChange={(e) => handleUpdateProfile({ province: e.target.value })} className="profile-value" style={{ width: '100%', padding: '10px' }}>
                  <option value="">-- Select --</option>
                  {(PROVINCES || []).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              ) : (
                <div className="profile-value" style={{ padding: '10px', background: '#f5f5f5', borderRadius: '8px' }}>{profileData.province || '—'}</div>
              )}
            </div>
            <div className="profile-field">
              <label>City / Town</label>
              {editModeActive ? (
                <input type="text" value={profileData.city} onChange={(e) => handleUpdateProfile({ city: e.target.value })} className="profile-value" style={{ width: '100%', padding: '10px' }} />
              ) : (
                <div className="profile-value" style={{ padding: '10px', background: '#f5f5f5', borderRadius: '8px' }}>{profileData.city || '—'}</div>
              )}
            </div>
          </div>

          <div className="profile-field">
            <label>Service area <span>*</span></label>
            <div className="inline-flex-row" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {editModeActive ? (
                <select value={profileData.serviceAreaType} onChange={(e) => handleUpdateProfile({ serviceAreaType: e.target.value })} className="profile-value" style={{ width: 'auto', padding: '10px' }}>
                  <option value="local">Local (specify radius)</option>
                  <option value="national">National</option>
                  <option value="online">Online only</option>
                </select>
              ) : (
                <div className="profile-value" style={{ width: 'auto', padding: '10px', background: '#f5f5f5', borderRadius: '8px' }}>
                  {profileData.serviceAreaType === 'local' ? 'Local' : profileData.serviceAreaType === 'national' ? 'National' : 'Online only'}
                </div>
              )}
              {profileData.serviceAreaType === 'local' && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
                  {editModeActive ? (
                    <>
                      <input type="number" value={profileData.radius} onChange={(e) => handleUpdateProfile({ radius: e.target.value })} className="radius-input" min="1" max="200" style={{ width: '80px', padding: '8px' }} />
                      <span style={{ fontSize: '0.875rem', color: 'var(--ink-3)' }}>km</span>
                    </>
                  ) : (
                    <span style={{ fontSize: '0.875rem', color: 'var(--ink-3)', padding: '8px', background: '#f5f5f5', borderRadius: '8px' }}>{profileData.radius} km</span>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Pricing */}
          <p className="section-label"><i className="fas fa-tag"></i> Pricing &amp; Availability</p>

          <div className="inline-group">
            <div className="profile-field">
              <label>Pricing model <span>*</span></label>
              {editModeActive ? (
                <select value={profileData.pricingModel} onChange={(e) => handleUpdateProfile({ pricingModel: e.target.value })} className="profile-value" style={{ width: '100%', padding: '10px' }}>
                  {(PRICING_MODELS || ['Hourly', 'Per package', 'Per term', 'Custom quote']).map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              ) : (
                <div className="profile-value" style={{ padding: '10px', background: '#f5f5f5', borderRadius: '8px' }}>{profileData.pricingModel || '—'}</div>
              )}
            </div>
            <div className="profile-field">
              <label>Starting price (optional)</label>
              {editModeActive ? (
                <input type="text" value={profileData.startingPrice} onChange={(e) => handleUpdateProfile({ startingPrice: e.target.value })} className="profile-value" style={{ width: '100%', padding: '10px' }} />
              ) : (
                <div className="profile-value" style={{ padding: '10px', background: '#f5f5f5', borderRadius: '8px' }}>{profileData.startingPrice || '—'}</div>
              )}
            </div>
          </div>

          <div className="profile-field">
            <label>Availability — Days</label>
            <div className="days-multi" role="group" aria-label="Available days" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              {(DAYS_OF_WEEK || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']).map(day => (
                <label key={day} className="day-checkbox" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#f5f5f5', borderRadius: '6px' }}>
                  <input
                    type="checkbox"
                    value={day}
                    checked={profileData.availabilityDays.includes(day)}
                    onChange={() => handleToggleDay(day)}
                    disabled={!editModeActive}
                  />
                  {day}
                </label>
              ))}
            </div>
            {editModeActive ? (
              <input type="text" value={profileData.availabilityNotes} onChange={(e) => handleUpdateProfile({ availabilityNotes: e.target.value })} className="profile-value" style={{ width: '100%', padding: '10px', marginTop: '0.5rem' }} placeholder="e.g. 9:00 - 17:00, Weekdays only" />
            ) : (
              <div className="profile-value" style={{ padding: '10px', background: '#f5f5f5', borderRadius: '8px', marginTop: '0.5rem' }}>{profileData.availabilityNotes || '—'}</div>
            )}
          </div>

          {/* Contact & Social */}
          <p className="section-label"><i className="fas fa-address-card"></i> Contact &amp; Online Presence</p>

          <div className="contact-block" style={{ marginBottom: '24px' }}>
            <div className="contact-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <strong style={{ fontSize: '0.9rem' }}>Primary contact</strong>
              <label className="toggle-switch" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={profileData.publicToggle}
                  onChange={(e) => handleUpdateProfile({ publicToggle: e.target.checked })}
                  disabled={!editModeActive}
                />
                <span className="toggle-slider"></span>
                <span>Display publicly <i className="fas fa-globe"></i></span>
              </label>
            </div>
            <div className="contact-details" style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
              {editModeActive ? (
                <>
                  <input type="text" value={profileData.contactName} onChange={(e) => handleUpdateProfile({ contactName: e.target.value })} placeholder="Contact name" style={{ flex: 1, padding: '10px' }} />
                  <input type="text" value={profileData.phone} onChange={(e) => handleUpdateProfile({ phone: e.target.value })} placeholder="Phone" style={{ flex: 1, padding: '10px' }} />
                  <input type="email" value={profileData.contactEmail} onChange={(e) => handleUpdateProfile({ contactEmail: e.target.value })} placeholder="Email" style={{ flex: 1, padding: '10px' }} />
                </>
              ) : (
                <>
                  <span style={{ flex: 1, padding: '10px', background: '#f5f5f5', borderRadius: '8px' }}>{profileData.contactName || '—'}</span>
                  <span style={{ flex: 1, padding: '10px', background: '#f5f5f5', borderRadius: '8px' }}>{profileData.phone || '—'}</span>
                  <span style={{ flex: 1, padding: '10px', background: '#f5f5f5', borderRadius: '8px' }}>{profileData.contactEmail || '—'}</span>
                </>
              )}
            </div>
            <div className="social-links-preview" style={{ marginTop: '12px' }}>
              {editModeActive ? (
                <input type="text" value={profileData.social} onChange={(e) => handleUpdateProfile({ social: e.target.value })} className="profile-value" style={{ width: '100%', padding: '10px' }} placeholder="Website / social link" />
              ) : (
                <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '8px' }}>{profileData.social || '—'}</div>
              )}
            </div>
          </div>

          {/* Plan row */}
          <div className="plan-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0', padding: '16px', background: '#f0f0f0', borderRadius: '8px' }}>
            <span className="plan-badge"><i className="fas fa-crown" style={{ color: '#f59e0b' }}></i> {getPlanName()}</span>
            <span className="public-indicator">
              <i className="fas fa-circle-check"></i> listing is {profileData.status === 'approved' ? 'live' : profileData.status}
            </span>
          </div>

          <PlanSelector currentPlan={profileData.plan} onSelectPlan={handlePlanChange} />

          {/* Reviews */}
          <div className="reviews-section" aria-label="Reviews and testimonials" style={{ marginTop: '32px', marginBottom: '24px' }}>
            <div className="profile-field">
              <p className="section-label" style={{ border: 'none', margin: '0 0 0.75rem' }}>
                <i className="fas fa-star"></i> Reviews &amp; Testimonials
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 500, color: 'var(--ink-4)' }}> (Paid tiers)</span>
              </p>
            </div>
            {profileData.reviews.items && profileData.reviews.items.length > 0 ? (
              profileData.reviews.items.map((review, index) => (
                <div className="review-item" key={index} style={{ marginBottom: '16px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                  <div className="rating-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                  <div className="profile-value" style={{ fontStyle: 'italic', marginTop: '8px' }}>
                    "{review.text}" — {review.reviewer}
                  </div>
                </div>
              ))
            ) : (
              <div className="review-item" style={{ marginBottom: '16px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                <div className="profile-value" style={{ fontStyle: 'italic', color: 'var(--ink-3)' }}>
                  No reviews yet. Reviews appear here once families leave feedback.
                </div>
              </div>
            )}
            {profileData.reviews.count > 0 && (
              <div className="review-item" style={{ marginBottom: '16px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                <div className="profile-value" style={{ fontStyle: 'italic', color: 'var(--ink-3)' }}>
                  Average rating: {profileData.reviews.average}/5 (based on {profileData.reviews.count} reviews)
                </div>
              </div>
            )}
          </div>

          <hr style={{ margin: '24px 0' }} />

          <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '24px' }}>
            <span className="last-edited"><i className="far fa-clock"></i> last edited today</span>
            {editModeActive && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn-save" onClick={saveChanges} disabled={loading} style={{ padding: '10px 24px' }}>
                  <i className="fas fa-floppy-disk"></i> Save changes
                </button>
                <button className="btn-edit" onClick={cancelEdit} disabled={loading} style={{ padding: '10px 24px' }}>Cancel</button>
              </div>
            )}
            {!editModeActive && (
              <span style={{ color: 'var(--ink-4)', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                <i className="far fa-eye"></i> view only
              </span>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ClientDashboard;