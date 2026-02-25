import React from 'react';
// import '../../../assets/css/footer.css';

const Footer = () => {
  const handleNewsletter = (e) => {
    e.preventDefault();
    const email = document.getElementById('nlEmail')?.value;
    if (email && email.includes('@')) {
      alert('Thank you for subscribing! (Demo)');
    } else {
      alert('Please enter a valid email');
    }
  };

  return (
    <footer className="sah-footer">
      <div className="container">
        <div className="sah-footer-grid">
          {/* Brand + newsletter */}
          <div className="sah-footer-brand">
            <span className="sah-footer-logo">SA Homeschooling Directory</span>
            <p>
              Connecting South African homeschooling families with verified tutors,
              therapists, curriculum providers and education specialists nationwide.
            </p>
            <div className="sah-footer-newsletter">
              <input type="email" id="nlEmail" placeholder="Subscribe to newsletter…" aria-label="Email address" />
              <button type="button" onClick={handleNewsletter}>Subscribe</button>
            </div>
          </div>

          {/* For families */}
          <div className="sah-footer-col">
            <h4>For Families</h4>
            <ul>
              <li><a href="/#providers">Find a Tutor</a></li>
              <li><a href="/#providers">Browse Curriculum</a></li>
              <li><a href="/#providers">Therapists</a></li>
              <li><a href="/#providers">Online Schools</a></li>
              <li><a href="/#providers">Consultants</a></li>
              <li><a href="/#providers">Enrichment</a></li>
            </ul>
          </div>

          {/* For providers */}
          <div className="sah-footer-col">
            <h4>For Providers</h4>
            <ul>
              <li><a href="/#list">List a Service</a></li>
              <li><a href="/#list">Pricing Plans</a></li>
              <li><a href="/login">Provider Login</a></li>
              <li><a href="#">Verification Process</a></li>
              <li><a href="#">Provider Resources</a></li>
            </ul>
          </div>

          {/* Magazine + legal */}
          <div className="sah-footer-col">
            <h4>SA Homeschooling</h4>
            <ul>
              <li><a href="https://sahomeschooling.com" target="_blank" rel="noopener">Magazine</a></li>
              <li><a href="#">About the Directory</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Trust strip */}
        <div className="sah-footer-trust">
          <div className="sah-footer-trust-item">
            <i className="fas fa-shield-alt"></i> All providers manually verified
          </div>
          <div className="sah-footer-trust-item">
            <i className="fas fa-lock"></i> Secure &amp; private enquiries
          </div>
          <div className="sah-footer-trust-item">
            <i className="fas fa-star"></i> 4.9 average provider rating
          </div>
          <div className="sah-footer-trust-item">
            <i className="fas fa-map-marker-alt"></i> All 9 provinces covered
          </div>
        </div>

        {/* Bottom bar */}
        <div className="sah-footer-bottom">
          <p>© 2025 SA Homeschooling Directory. A publication of SA Homeschooling Magazine. All rights reserved.</p>
          <div className="sah-footer-bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
            <a href="#">Sitemap</a>
          </div>
          <div className="sah-footer-socials">
            <a href="#" className="sah-footer-soc" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="sah-footer-soc" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
            <a href="#" className="sah-footer-soc" aria-label="Pinterest"><i className="fab fa-pinterest-p"></i></a>
            <a href="#" className="sah-footer-soc" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;