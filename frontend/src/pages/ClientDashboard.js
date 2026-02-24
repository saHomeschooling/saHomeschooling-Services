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
import { getMultiSelectValues, setMultiSelectValues, getPlanLimits } from '../utils/helpers';
import { api } from '../services/api';
import '../../assets/css/dashboard.css';

const ClientDashboard = () => {
  const { user, updateUserPlan } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // State
  const [editModeActive, setEditModeActive] = useState(false);
  const [originalValues, setOriginalValues] = useState({});
  const [profileData, setProfileData] = useState({
    id: user?.id || 'khan',
    name: user?.name || 'Khan Academy SA',
    email: user?.email || 'contact@khanacademy.org.za',
    accountType: 'Organization / Company',
    yearsExperience: '10+',
    languages: ['English', 'Afrikaans', 'isiXhosa', 'isiZulu'],
    primaryCategory: 'Curriculum Provider',
    tags: ['mathematics', 'science', 'online learning', 'free curriculum', 'video lessons'],
    bio: 'Free world-class education for anyone anywhere. Our curriculum covers mathematics, science, computing, humanities and more. We provide video lessons, practice exercises, and personalized learning dashboards for homeschoolers across South Africa. Completely free, forever.',
    certifications: 'Khan Academy Certified Content Provider, Google for Education Partner',
    degrees: 'BSc Computer Science (Stanford), MEd (Harvard)',
    memberships: 'SA Curriculum Association, Digital Learning Collective',
    clearance: 'Verified (2025)',
    services: [
      {
        title: 'Math & Science Curriculum (Gr R–12)',
        ageGroups: ['5–7 years', '8–10 years', '11–13 years', '14–18 years'],
        deliveryMode: 'Online'
      }
    ],
    province: 'Gauteng',
    city: 'Johannesburg',
    serviceAreaType: 'national',
    radius: '30',
    pricingModel: 'Custom quote',
    startingPrice: 'Free',
    availabilityDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    availabilityNotes: '24/7 Online — self-paced learning available anytime',
    contactName: 'Support Team',
    phone: '+27 11 555 1234',
    contactEmail: 'support@khanacademy.org.za',
    social: '@khanacademySA · www.khanacademy.org.za · FB, Twitter, YouTube',
    publicToggle: true,
    plan: user?.plan || 'free',
    listingPublic: true,
    reviews: {
      average: 4.9,
      count: 156,
      items: [
        { reviewer: 'Sarah J.', rating: 5, text: 'Excellent resource for our homeschool curriculum.' },
        { reviewer: 'Thabo M.', rating: 5, text: 'My kids love the math challenges.' }
      ]
    }
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Derived values
  const maxServices = getPlanLimits(profileData.plan).maxServices;
  const serviceCount = profileData.services.length;
  const canAddService = editModeActive && serviceCount < maxServices;

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.id) {
        try {
          const result = await api.getProviderById(user.id);
          if (result.success && result.data) {
            setProfileData(prev => ({ ...prev, ...result.data }));
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };
    loadUserData();
  }, [user]);

  // Handlers
  const toggleEditMode = () => {
    if (!editModeActive) {
      // Enter edit mode - store original values
      setOriginalValues({
        profileData: { ...profileData },
        tags: [...profileData.tags]
      });
      setEditModeActive(true);
    } else {
      cancelEdit();
    }
  };

  const cancelEdit = () => {
    if (originalValues.profileData) {
      setProfileData(originalValues.profileData);
      setProfileData(prev => ({ ...prev, tags: [...originalValues.tags] }));
    }
    setEditModeActive(false);
    showNotification('Changes discarded', 'info');
  };

  const saveChanges = async () => {
    try {
      setLoading(true);
      // In a real app, call API to save
      await api.updateProvider(profileData.id, profileData);
      
      setOriginalValues({
        profileData: { ...profileData },
        tags: [...profileData.tags]
      });
      setEditModeActive(false);
      showNotification('Changes saved successfully!', 'success');
    } catch (error) {
      showNotification('Error saving changes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (photoData) => {
    setPhotoPreview(photoData);
    setProfileData(prev => ({ ...prev, photo: photoData }));
    showNotification('Photo updated successfully!', 'success');
  };

  const handleAddTag = (newTag) => {
    if (!profileData.tags.includes(newTag)) {
      setProfileData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
    }
  };

  const handleRemoveTag = (index) => {
    setProfileData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateProfile = (updatedData) => {
    setProfileData(prev => ({ ...prev, ...updatedData }));
  };

  const handleAddService = () => {
    if (serviceCount < maxServices) {
      const newService = {
        title: `Additional Service ${serviceCount + 1}`,
        ageGroups: ['5–7 years', '8–10 years'],
        deliveryMode: 'Online'
      };
      setProfileData(prev => ({
        ...prev,
        services: [...prev.services, newService]
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
      setProfileData(prev => ({
        ...prev,
        services: prev.services.filter((_, i) => i !== index)
      }));
      showNotification('Service removed.', 'info');
    }
  };

  const handlePlanChange = (newPlan) => {
    setProfileData(prev => ({ ...prev, plan: newPlan }));
    updateUserPlan(newPlan);
    showNotification(`Plan updated to ${PLAN_LIMITS[newPlan].name}`, 'success');
  };

  const handleToggleDay = (day) => {
    const newDays = profileData.availabilityDays.includes(day)
      ? profileData.availabilityDays.filter(d => d !== day)
      : [...profileData.availabilityDays, day];
    setProfileData(prev => ({ ...prev, availabilityDays: newDays }));
  };

  const getPlanName = () => {
    const names = {
      free: 'Community Member (Free)',
      pro: 'Trusted Provider (R149/month)',
      featured: 'Featured Partner (R399/month)'
    };
    return names[profileData.plan] || 'Community Member (Free)';
  };

  return (
    <>
      <Header userType="client" />
      
      <main className="dash-wrapper">
        {/* Page headline */}
        <div className="page-headline">
          <h1>My Provider Dashboard</h1>
          <div className="welcome-row">
            <p>Welcome back, <span id="welcomeName">{profileData.name}</span></p>
            <a 
              href={`/profile?email=${encodeURIComponent(profileData.email)}`} 
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
            <span className="pending-badge">Pending Approval</span>
            <span>Your profile is awaiting admin verification</span>
          </span>
        </div>

        {/* Main Dashboard Card */}
        <div className={`card client-dash ${editModeActive ? 'edit-mode' : ''}`} id="clientDashboard">
          {/* Card header */}
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

          {/* Photo upload row */}
          <ProfileSection
            profileData={profileData}
            isEditing={editModeActive}
            onUpdate={handleUpdateProfile}
            onPhotoUpload={handlePhotoUpload}
          />

          {/* Tags */}
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
                style={{ minHeight: '80px' }}
              />
            ) : (
              <div className="profile-value" style={{ minHeight: '80px' }}>{profileData.bio}</div>
            )}
          </div>

          {/* Qualifications */}
          <p className="section-label"><i className="fas fa-graduation-cap"></i> Qualifications &amp; Experience</p>

          <div className="qualification-item">
            <div className="inline-group">
              <div className="profile-field">
                <label>Certifications</label>
                {editModeActive ? (
                  <input
                    type="text"
                    value={profileData.certifications}
                    onChange={(e) => handleUpdateProfile({ certifications: e.target.value })}
                    className="profile-value"
                  />
                ) : (
                  <div className="profile-value">{profileData.certifications}</div>
                )}
              </div>
              <div className="profile-field">
                <label>Degrees</label>
                {editModeActive ? (
                  <input
                    type="text"
                    value={profileData.degrees}
                    onChange={(e) => handleUpdateProfile({ degrees: e.target.value })}
                    className="profile-value"
                  />
                ) : (
                  <div className="profile-value">{profileData.degrees}</div>
                )}
              </div>
            </div>
            <div className="inline-group" style={{ marginBottom: 0 }}>
              <div className="profile-field">
                <label>Professional memberships</label>
                {editModeActive ? (
                  <input
                    type="text"
                    value={profileData.memberships}
                    onChange={(e) => handleUpdateProfile({ memberships: e.target.value })}
                    className="profile-value"
                  />
                ) : (
                  <div className="profile-value">{profileData.memberships}</div>
                )}
              </div>
              <div className="profile-field">
                <label>Background clearance</label>
                <div>
                  <span className="badge-clearance" id="clearanceBadge">
                    <i className="fas fa-circle-check"></i> {profileData.clearance}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <p className="section-label"><i className="fas fa-briefcase"></i> Service Details</p>

          {/* Plan indicator and service limit note */}
          <div className={`service-limit-note ${profileData.plan === 'free' ? 'free-limit' : 'paid-limit'}`} style={{ marginBottom: '1rem' }}>
            <i className="fas fa-info-circle"></i>
            <span id="serviceLimitText">
              {profileData.plan === 'free' 
                ? 'Free plan: You can add only 1 service. Upgrade to add more.'
                : profileData.plan === 'pro'
                  ? 'Trusted Provider: You can add up to 5 services.'
                  : 'Featured Partner: You can add up to 10 services.'}
            </span>
          </div>

          {/* Services */}
          {profileData.services.map((service, index) => (
            <ServiceItem
              key={index}
              service={service}
              index={index}
              isEditing={editModeActive}
              onUpdate={handleUpdateService}
              onRemove={handleRemoveService}
              canRemove={profileData.services.length > 1 && profileData.plan !== 'free'}
            />
          ))}

          {/* Add service button */}
          {editModeActive && profileData.plan !== 'free' && (
            <div id="addServiceWrapper" style={{ margin: '1rem 0' }}>
              <button 
                id="addServiceBtn" 
                className="add-service-btn" 
                onClick={handleAddService}
                disabled={serviceCount >= maxServices}
              >
                <i className="fas fa-plus-circle"></i> Add another service
              </button>
              <span className="service-counter">{serviceCount}/{maxServices} services used</span>
            </div>
          )}

          {/* Location */}
          <p className="section-label"><i className="fas fa-map-marker-alt"></i> Location &amp; Reach</p>

          <div className="inline-group">
            <div className="profile-field">
              <label>Province</label>
              {editModeActive ? (
                <select
                  value={profileData.province}
                  onChange={(e) => handleUpdateProfile({ province: e.target.value })}
                  className="profile-value"
                >
                  {PROVINCES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              ) : (
                <div className="profile-value">{profileData.province}</div>
              )}
            </div>
            <div className="profile-field">
              <label>City / Town</label>
              {editModeActive ? (
                <input
                  type="text"
                  value={profileData.city}
                  onChange={(e) => handleUpdateProfile({ city: e.target.value })}
                  className="profile-value"
                />
              ) : (
                <div className="profile-value">{profileData.city}</div>
              )}
            </div>
          </div>

          <div className="profile-field">
            <label>Service area <span>*</span></label>
            <div className="inline-flex-row">
              {editModeActive ? (
                <select
                  value={profileData.serviceAreaType}
                  onChange={(e) => handleUpdateProfile({ serviceAreaType: e.target.value })}
                  className="profile-value"
                  style={{ width: 'auto' }}
                >
                  <option value="local">Local (specify radius)</option>
                  <option value="national">National</option>
                  <option value="online">Online only</option>
                </select>
              ) : (
                <div className="profile-value" style={{ width: 'auto' }}>
                  {profileData.serviceAreaType === 'local' ? 'Local' : 
                   profileData.serviceAreaType === 'national' ? 'National' : 'Online only'}
                </div>
              )}
              <span id="radiusContainer" style={{ display: profileData.serviceAreaType === 'local' ? 'inline-flex' : 'none', alignItems: 'center', gap: '0.375rem' }}>
                {editModeActive ? (
                  <>
                    <input
                      type="number"
                      value={profileData.radius}
                      onChange={(e) => handleUpdateProfile({ radius: e.target.value })}
                      className="radius-input"
                      min="1"
                      max="200"
                    />
                    <span style={{ fontSize: '0.875rem', color: 'var(--ink-3)' }}>km</span>
                  </>
                ) : (
                  <span style={{ fontSize: '0.875rem', color: 'var(--ink-3)' }}>
                    {profileData.radius} km
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Pricing */}
          <p className="section-label"><i className="fas fa-tag"></i> Pricing &amp; Availability</p>

          <div className="inline-group">
            <div className="profile-field">
              <label>Pricing model <span>*</span></label>
              {editModeActive ? (
                <select
                  value={profileData.pricingModel}
                  onChange={(e) => handleUpdateProfile({ pricingModel: e.target.value })}
                  className="profile-value"
                >
                  {PRICING_MODELS.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              ) : (
                <div className="profile-value">{profileData.pricingModel}</div>
              )}
            </div>
            <div className="profile-field">
              <label>Starting price (optional)</label>
              {editModeActive ? (
                <input
                  type="text"
                  value={profileData.startingPrice}
                  onChange={(e) => handleUpdateProfile({ startingPrice: e.target.value })}
                  className="profile-value"
                />
              ) : (
                <div className="profile-value">{profileData.startingPrice}</div>
              )}
            </div>
          </div>

          <div className="profile-field">
            <label>Availability — Days</label>
            <div id="fieldAvailabilityDays" className="days-multi" role="group" aria-label="Available days">
              {DAYS_OF_WEEK.map(day => (
                <label key={day} className="day-checkbox">
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
              <input
                type="text"
                value={profileData.availabilityNotes}
                onChange={(e) => handleUpdateProfile({ availabilityNotes: e.target.value })}
                className="profile-value"
                style={{ marginTop: '0.5rem' }}
              />
            ) : (
              <div className="profile-value" style={{ marginTop: '0.5rem' }}>{profileData.availabilityNotes}</div>
            )}
          </div>

          {/* Contact & Social */}
          <p className="section-label"><i className="fas fa-address-card"></i> Contact &amp; Online Presence</p>

          <div className="contact-block">
            <div className="contact-inner">
              <strong style={{ fontSize: '0.9rem' }}>Primary contact</strong>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  id="publicToggle"
                  checked={profileData.publicToggle}
                  onChange={(e) => handleUpdateProfile({ publicToggle: e.target.checked })}
                  disabled={!editModeActive}
                />
                <span className="toggle-slider"></span>
                <span>Display publicly <i className="fas fa-globe"></i></span>
              </label>
            </div>
            <div className="contact-details">
              {editModeActive ? (
                <>
                  <input
                    type="text"
                    value={profileData.contactName}
                    onChange={(e) => handleUpdateProfile({ contactName: e.target.value })}
                    placeholder="Contact name"
                    style={{ width: 'auto', marginRight: '0.5rem' }}
                  /> ·
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) => handleUpdateProfile({ phone: e.target.value })}
                    placeholder="Phone"
                    style={{ width: 'auto', margin: '0 0.5rem' }}
                  /> ·
                  <input
                    type="email"
                    value={profileData.contactEmail}
                    onChange={(e) => handleUpdateProfile({ contactEmail: e.target.value })}
                    placeholder="Email"
                    style={{ width: 'auto', marginLeft: '0.5rem' }}
                  />
                </>
              ) : (
                <>
                  <span id="fieldContactName">{profileData.contactName}</span> ·
                  <span id="fieldPhone">{profileData.phone}</span> ·
                  <span id="fieldContactEmail">{profileData.contactEmail}</span>
                </>
              )}
            </div>
            <div id="socialPreview" className="social-links-preview">
              {editModeActive ? (
                <input
                  type="text"
                  value={profileData.social}
                  onChange={(e) => handleUpdateProfile({ social: e.target.value })}
                  className="profile-value"
                  style={{ width: '100%' }}
                />
              ) : (
                <span id="fieldSocial">{profileData.social}</span>
              )}
            </div>
          </div>

          {/* Plan row */}
          <div className="plan-row">
            <span className="plan-badge"><i className="fas fa-crown" style={{ color: '#f59e0b' }}></i> {getPlanName()}</span>
            <span className="public-indicator">
              <i className="fas fa-circle-check"></i> listing is public
            </span>
          </div>

          {/* Plan Selector */}
          <PlanSelector
            currentPlan={profileData.plan}
            onSelectPlan={handlePlanChange}
          />

          {/* Reviews Section */}
          <div className="reviews-section" aria-label="Reviews and testimonials">
            <div className="profile-field">
              <p className="section-label" style={{ border: 'none', margin: '0 0 0.75rem' }}>
                <i className="fas fa-star"></i> Reviews &amp; Testimonials 
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 500, color: 'var(--ink-4)' }}>(Paid tiers)</span>
              </p>
            </div>
            {profileData.reviews.items.map((review, index) => (
              <div className="review-item" key={index}>
                <div className="rating-stars" aria-label={`${review.rating} stars`}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
                <div className="profile-value" style={{ fontStyle: 'italic' }}>
                  "{review.text}" — {review.reviewer}
                </div>
              </div>
            ))}
            <div className="review-item">
              <div className="profile-value" style={{ fontStyle: 'italic', color: 'var(--ink-3)' }}>
                Average rating: {profileData.reviews.average}/5 (based on {profileData.reviews.count} reviews)
              </div>
            </div>
          </div>

          <hr />

          {/* Card footer */}
          <div className="card-footer">
            <span className="last-edited"><i className="far fa-clock"></i> last edited today</span>
            {editModeActive && (
              <div id="editControls" aria-live="polite" style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn-save" id="saveBtn" onClick={saveChanges} disabled={loading}>
                  <i className="fas fa-floppy-disk"></i> Save changes
                </button>
                <button className="btn-edit" id="cancelBtn" onClick={cancelEdit} disabled={loading}>
                  Cancel
                </button>
              </div>
            )}
            {!editModeActive && (
              <span id="editModeHint" style={{ color: 'var(--ink-4)', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
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