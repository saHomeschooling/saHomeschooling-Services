import React from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/footer.css';  // Correct path: from src/components/common/ → up to src → assets/css/footer.css

const Footer = () => {
  // Optional: Real newsletter handler (can connect to backend later)
  const handleNewsletter = (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('nlEmail');
    const email = emailInput?.value.trim();

    if (email && /\S+@\S+\.\S+/.test(email)) {
      alert('Thank you for subscribing! We\'ll send updates soon. (Demo mode)');
      emailInput.value = ''; // Clear field
    } else {
      alert('Please enter a valid email address');
    }
  };

  return (
    <footer className="sah-footer">
      <div className="container">
        <div className="sah-footer-grid">
          {/* Brand + newsletter */}
          <div className="sah-footer-brand">
            <Link to="/" className="sah-footer-logo">
              SA Homeschooling Directory
            </Link>
            <p>
              Connecting South African homeschooling families with verified tutors,
              therapists, curriculum providers and education specialists nationwide.
            </p>
            <form className="sah-footer-newsletter" onSubmit={handleNewsletter}>
              <input
                type="email"
                id="nlEmail"
                placeholder="Subscribe to newsletter…"
                aria-label="Email address for newsletter"
                required
              />
              <button type="submit">Subscribe</button>
            </form>
          </div>

          {/* For families */}
          <div className="sah-footer-col">
            <h4>For Families</h4>
            <ul>
              <li><Link to="/providers">Find a Tutor</Link></li>
              <li><Link to="/curriculum">Browse Curriculum</Link></li>
              <li><Link to="/therapists">Therapists</Link></li>
              <li><Link to="/online-schools">Online Schools</Link></li>
              <li><Link to="/consultants">Consultants</Link></li>
              <li><Link to="/enrichment">Enrichment</Link></li>
            </ul>
          </div>

          {/* For providers */}
          <div className="sah-footer-col">
            <h4>For Providers</h4>
            <ul>
              <li><Link to="/list-service">List a Service</Link></li>
              <li><Link to="/pricing">Pricing Plans</Link></li>
              <li><Link to="/provider/login">Provider Login</Link></li>
              <li><Link to="/verification">Verification Process</Link></li>
              <li><Link to="/provider/resources">Provider Resources</Link></li>
            </ul>
          </div>

          {/* Magazine + legal */}
          <div className="sah-footer-col">
            <h4>SA Homeschooling</h4>
            <ul>
              <li>
                <a
                  href="https://sahomeschooling.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Magazine
                </a>
              </li>
              <li><Link to="/about">About the Directory</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Trust strip */}
        <div className="sah-footer-trust">
          <div className="sah-footer-trust-item">
            <i className="fas fa-shield-alt"></i> All providers manually verified
          </div>
          <div className="sah-footer-trust-item">
            <i className="fas fa-lock"></i> Secure & private enquiries
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
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/cookies">Cookies</Link>
            <Link to="/sitemap">Sitemap</Link>
          </div>
          <div className="sah-footer-socials">
            <a
              href="https://facebook.com/sahomeschooling"
              target="_blank"
              rel="noopener noreferrer"
              className="sah-footer-soc"
              aria-label="Facebook"
            >
              <i className="fab fa-facebook-f"></i>
            </a>
            <a
              href="https://instagram.com/sahomeschooling"
              target="_blank"
              rel="noopener noreferrer"
              className="sah-footer-soc"
              aria-label="Instagram"
            >
              <i className="fab fa-instagram"></i>
            </a>
            <a
              href="https://pinterest.com/sahomeschooling"
              target="_blank"
              rel="noopener noreferrer"
              className="sah-footer-soc"
              aria-label="Pinterest"
            >
              <i className="fab fa-pinterest-p"></i>
            </a>
            <a
              href="https://youtube.com/@sahomeschooling"
              target="_blank"
              rel="noopener noreferrer"
              className="sah-footer-soc"
              aria-label="YouTube"
            >
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;