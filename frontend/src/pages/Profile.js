import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { providerData } from '../utils/constants';
import { escapeHtml } from '../utils/helpers';
import '../assets/css/profile.css'; // Fixed import path

const Profile = () => {
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = () => {
      const email = searchParams.get('email');
      const id = searchParams.get('id');
      
      let foundProfile = null;
      
      if (email) {
        // Find by email
        foundProfile = Object.values(providerData).find(p => p.email === email);
      } else if (id) {
        // Find by id
        foundProfile = providerData[id];
      }
      
      if (!foundProfile) {
        // Default to Khan Academy
        foundProfile = providerData.khan;
      }
      
      setProfile(foundProfile);
      setLoading(false);
    };

    loadProfile();
  }, [searchParams]);

  const showToast = (message) => {
    alert(message); // Simple fallback
  };

  const scrollToContact = () => {
    document.getElementById('contactSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const shareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: profile?.name,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ padding: '4rem', textAlign: 'center' }}>
          <div className="loading">Loading profile...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Header />
        <main style={{ padding: '4rem', textAlign: 'center' }}>
          <h2>Profile not found</h2>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
        </main>
        <Footer />
      </>
    );
  }

  const tier = profile.listingPlan || 'free';
  const ratingStars = (rating) => {
    if (!rating) return '';
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
  };

  return (
    <>
      <Header />
      
      <main className="page-wrap" id="profilePage" data-tier={tier}>
        <div className="main-content">
          {/* Profile Head Card */}
          <div className="profile-head-card">
            <div className="profile-head-body">
              <div className="profile-head-inner">
                <div className="avatar-lg" id="profileAvatar">
                  {profile.photo ? (
                    <img src={profile.photo} alt={profile.name} />
                  ) : (
                    <i className="fas fa-user avatar-placeholder"></i>
                  )}
                </div>
                
                <div className="profile-info">
                  <div className="badge-row" id="badgeRow">
                    {tier === 'featured' && (
                      <span className="badge badge-featured"><i className="fas fa-star"></i> Featured Partner</span>
                    )}
                    {(tier === 'pro' || tier === 'featured') && (
                      <span className="badge badge-verified"><i className="fas fa-check"></i> Verified</span>
                    )}
                  </div>
                  
                  <h1 className="profile-name">{profile.name}</h1>
                  <p className="profile-tagline">{profile.tagline || ''}</p>
                  
                  {profile.startingPrice && profile.startingPrice !== 'Contact' && (
                    <div className="price-badge">
                      <i className="fas fa-tag"></i> From {profile.startingPrice}
                    </div>
                  )}
                  
                  <div className="meta-strip">
                    <div className="meta-item">
                      <i className="fas fa-tag"></i>
                      <strong>{profile.primaryCategory || 'Provider'}</strong>
                    </div>
                    <div className="meta-item">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{profile.city ? `${profile.city}, ${profile.province}` : profile.province || 'South Africa'}</span>
                    </div>
                    <div className="meta-item">
                      <i className="fas fa-laptop-house"></i>
                      <span>{profile.deliveryMode || 'Online'}</span>
                    </div>
                  </div>
                  
                  <div className="action-row">
                    <button className="btn btn-primary" onClick={scrollToContact}>
                      <i className="fas fa-envelope"></i> Contact Provider
                    </button>
                    {(tier === 'pro' || tier === 'featured') && (
                      <button className="btn btn-whatsapp" onClick={() => showToast('WhatsApp link opens here')}>
                        <i className="fab fa-whatsapp"></i> WhatsApp
                      </button>
                    )}
                    <button className="btn btn-outline" onClick={() => showToast('Saved to favourites!')}>
                      <i className="far fa-heart"></i> Save
                    </button>
                    <button className="btn btn-outline" onClick={shareProfile}>
                      <i className="fas fa-share-alt"></i> Share
                    </button>
                  </div>
                  
                  {(tier === 'pro' || tier === 'featured') && profile.reviews && (
                    <div className="rating-bar">
                      <div className="rating-big">{profile.reviews.average}</div>
                      <div>
                        <div className="rating-stars">{ratingStars(profile.reviews.average)}</div>
                        <div className="rating-sub">Based on {profile.reviews.count} verified reviews</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="card">
            <div className="card-pad">
              <span className="sec-eyebrow">About the Provider</span>
              <h2 className="card-heading">About Us</h2>
              <div className="content-body">
                <p>{profile.bio || 'This provider has not yet added a description.'}</p>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="card">
            <div className="card-pad">
              <span className="sec-eyebrow">Services</span>
              <h2 className="card-heading">What We Offer</h2>
              <div className="tag-cloud">
                {profile.tags && profile.tags.map((tag, idx) => (
                  <span key={idx} className="tag">{tag}</span>
                ))}
                {profile.services && profile.services.map((service, idx) => (
                  <span key={`service-${idx}`} className="tag">{service.title}</span>
                ))}
              </div>
              
              <div className="section-divider"></div>
              
              <span className="sec-eyebrow" style={{ marginTop: '16px', display: 'block' }}>Grades Covered</span>
              <div className="grade-pills">
                {profile.ageGroups && profile.ageGroups.map((age, idx) => (
                  <div key={idx} className="grade-pill">{age.replace(/[^0-9–-]/g, '')}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Qualifications */}
          <div className="card">
            <div className="card-pad">
              <span className="sec-eyebrow">Credentials</span>
              <h2 className="card-heading">Qualifications</h2>
              <ul className="qual-list">
                {profile.certifications && (
                  <li><i className="fas fa-certificate"></i> {profile.certifications}</li>
                )}
                {profile.degrees && (
                  <li><i className="fas fa-graduation-cap"></i> {profile.degrees}</li>
                )}
                {profile.memberships && (
                  <li><i className="fas fa-check-circle"></i> {profile.memberships}</li>
                )}
                {profile.clearance && (
                  <li><i className="fas fa-shield-alt"></i> {profile.clearance}</li>
                )}
              </ul>
            </div>
          </div>

          {/* Reviews */}
          {(tier === 'pro' || tier === 'featured') && profile.reviews && profile.reviews.items && profile.reviews.items.length > 0 && (
            <div className="card paid-only">
              <div className="card-pad">
                <span className="sec-eyebrow">Testimonials</span>
                <h2 className="card-heading">Parent Reviews</h2>
                {profile.reviews.items.map((review, idx) => (
                  <div key={idx} className="review-card">
                    <div className="review-header">
                      <span className="reviewer-name">{review.reviewer}</span>
                      <span className="review-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    </div>
                    <div className="review-text">"{review.text}"</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="sidebar" id="contactSection">
          {/* Upgrade Card */}
          {tier === 'free' && (
            <div className="card" id="upgradeCard">
              <div className="card-pad" style={{ textAlign: 'center' }}>
                <i className="fas fa-lock" style={{ fontSize: '1.4rem', color: 'var(--muted)', marginBottom: '10px' }}></i>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '14px' }}>
                  Upgrade to <strong>Trusted Provider</strong> to show your phone, WhatsApp and website to families.
                </p>
                <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', width: '100%', justifyContent: 'center' }}>
                  <i className="fas fa-arrow-up"></i> Upgrade Plan
                </Link>
              </div>
            </div>
          )}

          {/* Enquiry Form */}
          <div className="card">
            <div className="card-pad">
              <span className="sec-eyebrow">Get in Touch</span>
              <h3 className="card-heading" style={{ fontSize: '1rem' }}>Send an Enquiry</h3>
              <div className="form-group">
                <div className="form-row">
                  <div className="field">
                    <label>First name</label>
                    <input type="text" placeholder="Sarah" />
                  </div>
                  <div className="field">
                    <label>Last name</label>
                    <input type="text" placeholder="Smith" />
                  </div>
                </div>
                <div className="field">
                  <label>Email</label>
                  <input type="email" placeholder="sarah@email.com" />
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input type="tel" placeholder="082 000 0000" />
                </div>
                <div className="field">
                  <label>Subject</label>
                  <select>
                    <option>General enquiry</option>
                    <option>Pricing &amp; availability</option>
                    <option>Trial lesson</option>
                    <option>Curriculum question</option>
                  </select>
                </div>
                <div className="field">
                  <label>Message</label>
                  <textarea placeholder="Hi, I'd like to know more about..."></textarea>
                </div>
                <button className="btn btn-primary btn-block" onClick={() => alert('Enquiry sent! (Demo)')}>
                  <i className="fas fa-paper-plane"></i> Send Enquiry
                </button>
              </div>
            </div>
          </div>

          {/* Direct Contact (paid tiers) */}
          {(tier === 'pro' || tier === 'featured') && (
            <div className="card paid-only">
              <div className="card-pad">
                <span className="sec-eyebrow">Direct Contact</span>
                <h3 className="card-heading" style={{ fontSize: '1rem' }}>Contact Details</h3>
                <div className="dc-item">
                  <div className="dc-icon"><i className="fas fa-phone"></i></div>
                  <div className="dc-meta">
                    <div className="dc-label">Phone</div>
                    <div className="dc-value">{profile.phone || '-'}</div>
                  </div>
                </div>
                <div className="dc-item dc-whatsapp">
                  <div className="dc-icon wa"><i className="fab fa-whatsapp"></i></div>
                  <div className="dc-meta">
                    <div className="dc-label">WhatsApp</div>
                    <div className="dc-value">{profile.phone || '-'}</div>
                  </div>
                </div>
                <div className="dc-item">
                  <div className="dc-icon"><i className="fas fa-envelope"></i></div>
                  <div className="dc-meta">
                    <div className="dc-label">Email</div>
                    <div className="dc-value">{profile.contactEmail || profile.email || 'Contact for details'}</div>
                  </div>
                </div>
                <div className="dc-item">
                  <div className="dc-icon"><i className="fas fa-globe"></i></div>
                  <div className="dc-meta">
                    <div className="dc-label">Website</div>
                    <div className="dc-value">
                      {profile.social ? (
                        <a href={profile.social} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                          {profile.social}
                        </a>
                      ) : 'Contact for details'}
                    </div>
                  </div>
                </div>
                <div className="dc-socials">
                  <a href="#" className="dc-soc"><i className="fab fa-facebook-f"></i></a>
                  <a href="#" className="dc-soc"><i className="fab fa-instagram"></i></a>
                  <a href="#" className="dc-soc"><i className="fab fa-youtube"></i></a>
                  <a href="#" className="dc-soc"><i className="fab fa-linkedin-in"></i></a>
                </div>
              </div>
            </div>
          )}

          {/* Availability */}
          <div className="card">
            <div className="card-pad">
              <span className="sec-eyebrow">Schedule</span>
              <h3 className="card-heading" style={{ fontSize: '1rem' }}>Availability</h3>
              <div className="avail-grid" id="availGrid">
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} className={`avail-pill ${profile.availabilityDays?.includes(day) ? 'on' : ''}`}>
                    {day}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                {profile.availabilityNotes || 'Contact for availability'}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="card">
            <div className="card-pad">
              <span className="sec-eyebrow">Location</span>
              <h3 className="card-heading" style={{ fontSize: '1rem' }}>Where We Operate</h3>
              <div className="map-ph">
                <i className="fas fa-map-marker-alt"></i>
                <span>{profile.city ? `${profile.city}, ${profile.province}` : profile.province || 'South Africa'}</span>
                <span style={{ fontSize: '0.75rem' }}>
                  {profile.serviceAreaType === 'national' ? 'National' : 
                   profile.serviceAreaType === 'local' ? `Local (${profile.radius} km radius)` : 'Online only'}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '10px' }}>
                <i className="fas fa-laptop" style={{ color: 'var(--accent)', marginRight: '5px' }}></i>
                {profile.deliveryMode === 'Online' ? 'Online sessions available nationwide' : 'In-person sessions available'}
              </p>
            </div>
          </div>
        </aside>
      </main>

      <Footer />
    </>
  );
};

// Add DAYS_OF_WEEK if not imported
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default Profile;