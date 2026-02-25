import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

// Step definitions (mirroring the HTML structure)
const STEPS = [
  { // Step 1: Choose Your Listing Plan
    title: 'Choose Your Listing Plan',
    desc: 'Select a plan and agree to terms',
    fields: [
      { type: 'radio-group', label: 'Select a plan', name: 'listingPlan', options: [
        'Free Listing – basic profile',
        'Professional Listing – R149/month (full contact, direct enquiries)',
        'Featured Partner – R399/month (homepage placement, analytics)'
      ], required: true, col: 'full', default: 'Free Listing – basic profile' },
      { type: 'terms-check', label: 'I agree to the Terms and Community Guidelines', name: 'terms', required: true, col: 'full' }
    ]
  },
  { // Step 2: Account Setup
    title: 'Account Setup',
    desc: 'Create your provider account',
    fields: [
      { type: 'text', label: 'Full Name / Business Name', name: 'fullName', required: true, col: 'full', placeholder: 'e.g. Thando Mkhize or Bright Minds Learning' },
      { type: 'email', label: 'Email Address', name: 'email', required: true, col: 'half', placeholder: 'name@example.com' },
      { type: 'password', label: 'Password', name: 'password', required: true, col: 'half', placeholder: '··········' },
      { type: 'select', label: 'Account Type', name: 'accountType', required: true, options: ['Individual Provider', 'Organisation / Company'], col: 'full' }
    ]
  },
  { // Step 3: Provider Identity & Trust
    title: 'Provider Identity & Trust',
    desc: 'Build trust with qualifications',
    fields: [
      { type: 'file', label: 'Profile Photo / Logo', name: 'profilePhoto', accept: 'image/*', required: false, col: 'half' },
      { type: 'textarea', label: 'Short Bio (150–250 words)', name: 'bio', placeholder: 'Tell families about your teaching philosophy, experience, and approach...', required: true, col: 'full', rows: 3 },
      { type: 'number', label: 'Years of Experience', name: 'experience', required: true, col: 'half', min: 0, max: 60, placeholder: 'e.g. 8' },
      { type: 'file', label: 'Qualifications / Certifications (PDF or image)', name: 'certs', accept: '.pdf,.doc,.docx,.jpg,.png', required: false, col: 'half' },
      { type: 'file', label: 'Police Clearance (optional)', name: 'clearance', accept: '.pdf,.jpg,.png', required: false, col: 'half' },
      { type: 'multicheck', label: 'Languages Spoken', name: 'languages', options: ['English','Afrikaans','isiZulu','isiXhosa','Sepedi','Setswana','Sesotho','Xitsonga','SiSwati','Tshivenda','isiNdebele','Other'], required: false, col: 'full' }
    ]
  },
  { // Step 4: Services Offered
    title: 'Services Offered',
    desc: 'Tell families what you offer',
    fields: [
      { type: 'select', label: 'Primary Category', name: 'primaryCat', required: true, options: ['Tutor','Therapist','Curriculum Provider','Online / Hybrid School','Educational Consultant','Extracurricular / Enrichment'], col: 'half' },
      { type: 'multicheck', label: 'Secondary Categories', name: 'secondaryCats', options: ['Tutor','Therapist','Curriculum','School','Consultant','Enrichment'], required: false, col: 'half' },
      { type: 'text', label: 'Service Title', name: 'serviceTitle', required: true, col: 'full', placeholder: 'e.g. Mathematics Tutor for Grades 10–12' },
      { type: 'textarea', label: 'Service Description', name: 'serviceDesc', required: true, col: 'full', rows: 2, placeholder: 'Describe what you offer, your methods, and what makes you unique...' },
      { type: 'text', label: 'Subjects / Specialisations', name: 'subjects', placeholder: 'e.g. Mathematics, Phonics, OT, ADHD support', required: true, col: 'half' },
      { type: 'multicheck', label: 'Age Groups Served', name: 'ageGroups', options: ['5–7','8–10','11–13','14–18'], required: true, col: 'half' },
      { type: 'radio-group', label: 'Delivery Mode', name: 'deliveryMode', options: ['Online', 'In-person', 'Hybrid (Online & In-person)'], required: true, col: 'full' }
    ]
  },
  { // Step 5: Location & Reach
    title: 'Location & Reach',
    desc: 'Where can you serve families?',
    fields: [
      { type: 'text', label: 'City', name: 'city', required: true, col: 'half', placeholder: 'e.g. Cape Town' },
      { type: 'select', label: 'Province', name: 'province', required: true, options: ['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','Northern Cape','North West','Western Cape'], col: 'half' },
      { type: 'radio-group', label: 'Service Area', name: 'serviceArea', options: ['Local (X km)','National','Online only'], required: true, col: 'full' },
      { type: 'conditional-text', label: 'If local, specify radius (e.g. 30 km)', name: 'localRadius', placeholder: 'e.g. 30 km', required: false, col: 'half', dependsOn: 'serviceArea', dependsValue: 'Local (X km)' }
    ]
  },
  { // Step 6: Pricing & Availability
    title: 'Pricing & Availability',
    desc: 'Set your rates and schedule',
    fields: [
      { type: 'select', label: 'Pricing Model', name: 'pricingModel', options: ['Hourly','Per package','Per term','Custom quote'], required: true, col: 'half' },
      { type: 'text', label: 'Starting Price (optional, e.g. R280/hr)', name: 'startingPrice', required: false, col: 'half', placeholder: 'e.g. R350/session' },
      { type: 'multicheck', label: 'Days available', name: 'daysAvailable', options: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], required: true, col: 'full' },
      { type: 'text', label: 'Time slots', name: 'timeSlots', placeholder: 'e.g. 9:00–14:00, 15:30–17:30 (24h format recommended)', required: true, col: 'full' }
    ]
  },
  { // Step 7: Contact & Online Presence (final)
    title: 'Contact & Online Presence',
    desc: 'How families can reach you (final step)',
    fields: [
      { type: 'tel', label: 'Phone Number', name: 'phone', required: true, col: 'half', placeholder: '+27 71 234 5678' },
      { type: 'tel', label: 'WhatsApp Number', name: 'whatsapp', required: false, col: 'half', placeholder: '+27 71 234 5678' },
      { type: 'email', label: 'Email for inquiries', name: 'inquiryEmail', required: true, col: 'full', placeholder: 'contact@example.com' },
      { type: 'url', label: 'Website', name: 'website', required: false, col: 'half', placeholder: 'https://yourwebsite.co.za' },
      { type: 'url', label: 'Facebook', name: 'facebook', placeholder: 'https://facebook.com/yourpage', required: false, col: 'half' },
      { type: 'url', label: 'Twitter', name: 'twitter', placeholder: 'https://twitter.com/yourhandle', required: false, col: 'half' },
      { type: 'url', label: 'Instagram', name: 'instagram', placeholder: 'https://instagram.com/yourprofile', required: false, col: 'half' },
      { type: 'url', label: 'LinkedIn', name: 'linkedin', placeholder: 'https://linkedin.com/in/yourname', required: false, col: 'half' },
      { type: 'url', label: 'Pinterest', name: 'pinterest', placeholder: 'https://pinterest.com/yourprofile', required: false, col: 'half' },
      { type: 'url', label: 'TikTok', name: 'tiktok', placeholder: 'https://tiktok.com/@yourhandle', required: false, col: 'half' }
    ]
  }
];

const TOTAL_STEPS = STEPS.length;

const Registration = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showNotification } = useNotification();

  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false); // for step 2 password
  const alertRef = useRef(null);

  // Helper to scroll to alert when shown
  useEffect(() => {
    if (showAlert && alertRef.current) {
      alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showAlert]);

  // Generic change handler for text/select/number etc.
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name !== 'terms') {
      // For multi-check we handle separately; but for single checkbox like terms
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Clear alert on any change
    setShowAlert(false);
  };

  // Handle multi-check (checkbox groups)
  const handleMultiCheck = (e, fieldName) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const current = prev[fieldName] || [];
      if (checked) {
        return { ...prev, [fieldName]: [...current, value] };
      } else {
        return { ...prev, [fieldName]: current.filter(v => v !== value) };
      }
    });
    setShowAlert(false);
  };

  // Handle radio groups (including plan selection)
  const handleRadioChange = (e, fieldName) => {
    setFormData(prev => ({ ...prev, [fieldName]: e.target.value }));
    setShowAlert(false);
  };

  // Handle file inputs
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, [fieldName]: file }));
    setShowAlert(false);
  };

  // Phone formatter for SA numbers (step 7)
  const formatPhoneNumber = (value) => {
    let digits = value.replace(/\D/g, '');
    if (digits.startsWith('0')) {
      digits = '27' + digits.substring(1);
    }
    // Format as +27 XX XXX XXXX
    if (digits.length >= 2) {
      let formatted = '+' + digits.substring(0, 2);
      if (digits.length > 2) {
        formatted += ' ' + digits.substring(2, 4);
      }
      if (digits.length > 4) {
        formatted += ' ' + digits.substring(4, 7);
      }
      if (digits.length > 7) {
        formatted += ' ' + digits.substring(7, 11);
      }
      return formatted;
    } else if (digits.length > 0) {
      return '+' + digits;
    }
    return value;
  };

  const handlePhoneChange = (e, fieldName) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({ ...prev, [fieldName]: formatted }));
    setShowAlert(false);
  };

  // Validate current step, return error message or null
  const validateStep = (step) => {
    const stepDef = STEPS[step - 1];
    for (let field of stepDef.fields) {
      if (!field.required) continue;

      const value = formData[field.name];
      const label = field.label;

      // Special validations
      if (field.name === 'timeSlots' && field.required) {
        if (!value || value.trim() === '') return `${label} is required.`;
        const timePattern = /^(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})(\s*,\s*(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2}))*$/;
        if (!timePattern.test(value.trim())) {
          return 'Time slots must be in format like "9:00–14:00, 15:30–17:30".';
        }
        continue;
      }

      if (field.name === 'phone' && field.required) {
        if (!value || value.trim() === '') return `${label} is required.`;
        const cleaned = value.replace(/\s/g, '');
        const saPattern = /^\+27[1-9]\d{8}$/;
        if (!saPattern.test(cleaned)) {
          return 'Please enter a valid SA phone number starting with +27 (e.g., +27 71 234 5678).';
        }
        continue;
      }

      if (field.type === 'email') {
        if (!value || !/^\S+@\S+\.\S+$/.test(value)) return 'Please enter a valid email address.';
        continue;
      }

      if (field.type === 'password') {
        if (!value || value.length < 8) return 'Password must be at least 8 characters.';
        continue;
      }

      if (field.type === 'multicheck') {
        const arr = formData[field.name] || [];
        if (arr.length === 0) return `${label} is required.`;
        continue;
      }

      if (field.type === 'terms-check') {
        if (!formData[field.name]) return 'You must agree to the terms.';
        continue;
      }

      if (field.type === 'radio-group') {
        if (!value || value.trim() === '') return `${label} is required.`;
        continue;
      }

      // Default: check if value exists and not empty
      if (!value || value.toString().trim() === '') {
        return `${label} is required.`;
      }
    }
    return null;
  };

  const nextStep = () => {
    const error = validateStep(currentStep);
    if (error) {
      setAlertMessage(error);
      setShowAlert(true);
      return;
    }
    setShowAlert(false);
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    setShowAlert(false);
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
  // Final validation
  const error = validateStep(currentStep);
  if (error) {
    setAlertMessage(error);
    setShowAlert(true);
    return;
  }

  try {
    // ✅ Await the register function since it's async
    const result = await register(formData);
    
    if (result && result.success) {
      showNotification('Profile created successfully! Redirecting to your dashboard...', 'success');
      
      // Redirect
      setTimeout(() => {
        window.location.href = '/dashboards/client-dashboard.html';
      }, 1500);
    } else {
      showNotification(result?.error || 'Registration failed. Please try again.', 'error');
    }
  } catch (err) {
    console.error('Registration error:', err);
    showNotification('An error occurred during registration.', 'error');
  }
};

  // Render fields for current step
  const renderField = (field) => {
    const { type, name, label, required, col, options, placeholder, accept, rows, dependsOn, dependsValue } = field;
    const colClass = col === 'full' ? 'full-width' : '';
    const fieldValue = formData[name] || (type === 'multicheck' ? [] : '');

    // Conditional hiding for local radius
    if (type === 'conditional-text') {
      const shouldShow = formData[dependsOn] === dependsValue;
      if (!shouldShow) {
        // Clear value when hidden
        if (formData[name]) {
          setFormData(prev => ({ ...prev, [name]: '' }));
        }
        return null;
      }
    }

    // "Other" language input appears separately inside multicheck group, handled later
    if (type === 'multicheck') {
      return (
        <div className={`field ${colClass}`} key={name}>
          <label><i className="fas fa-check-square"></i> {label} {required && <span style={{color:'var(--accent)'}}>*</span>}</label>
          <div className="checkbox-group">
            {options.map(opt => (
              <label key={opt}>
                <input
                  type="checkbox"
                  name={name}
                  value={opt}
                  checked={fieldValue.includes(opt)}
                  onChange={(e) => handleMultiCheck(e, name)}
                />
                {opt}
              </label>
            ))}
          </div>
          {/* Other language text field */}
          {name === 'languages' && fieldValue.includes('Other') && (
            <div className="other-language-row full-width">
              <input
                type="text"
                placeholder="Specify other language"
                value={formData.otherLanguage || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, otherLanguage: e.target.value }))}
              />
            </div>
          )}
        </div>
      );
    }

    if (type === 'radio-group') {
      return (
        <div className={`field ${colClass}`} key={name}>
          <label><i className="fas fa-dot-circle"></i> {label} {required && <span style={{color:'var(--accent)'}}>*</span>}</label>
          <div className="checkbox-group" style={{gap:'20px'}}>
            {options.map(opt => (
              <label key={opt}>
                <input
                  type="radio"
                  name={name}
                  value={opt}
                  checked={fieldValue === opt}
                  onChange={(e) => handleRadioChange(e, name)}
                  required={required}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      );
    }

    if (type === 'terms-check') {
      return (
        <div className={`field ${colClass}`} key={name}>
          <div className="terms-checkbox">
            <input
              type="checkbox"
              name={name}
              checked={!!fieldValue}
              onChange={(e) => setFormData(prev => ({ ...prev, [name]: e.target.checked }))}
              required={required}
              id="termsBox"
            />
            <label htmlFor="termsBox">
              {label} – <a href="#" className="terms-link" onClick={(e) => { e.preventDefault(); window.open('/terms', '_blank'); }}>Read Terms & Guidelines</a>
            </label>
          </div>
        </div>
      );
    }

    if (type === 'password') {
      return (
        <div className={`field ${colClass}`} key={name}>
          <label><i className="fas fa-lock"></i> {label} {required && <span style={{color:'var(--accent)'}}>*</span>}</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name={name}
              placeholder={placeholder}
              value={fieldValue}
              onChange={handleChange}
              required={required}
            />
            <button
              type="button"
              className="toggle-pw"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={`far fa-eye${showPassword ? '-slash' : ''}`}></i>
            </button>
          </div>
        </div>
      );
    }

    if (type === 'file') {
      return (
        <div className={`field ${colClass}`} key={name}>
          <label><i className="fas fa-upload"></i> {label} {required && <span style={{color:'var(--accent)'}}>*</span>}</label>
          <input
            type="file"
            name={name}
            accept={accept}
            onChange={(e) => handleFileChange(e, name)}
            required={required}
          />
        </div>
      );
    }

    if (type === 'select') {
      return (
        <div className={`field ${colClass}`} key={name}>
          <label><i className="fas fa-chevron-down"></i> {label} {required && <span style={{color:'var(--accent)'}}>*</span>}</label>
          <select name={name} value={fieldValue} onChange={handleChange} required={required}>
            <option value="">-- Select --</option>
            {options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    }

    if (type === 'textarea') {
      return (
        <div className={`field ${colClass}`} key={name}>
          <label><i className="fas fa-align-left"></i> {label} {required && <span style={{color:'var(--accent)'}}>*</span>}</label>
          <textarea
            name={name}
            placeholder={placeholder}
            rows={rows || 3}
            value={fieldValue}
            onChange={handleChange}
            required={required}
          />
        </div>
      );
    }

    // Default input types: text, email, tel, url, number
    return (
      <div className={`field ${colClass}`} key={name}>
        <label><i className="fas fa-edit"></i> {label} {required && <span style={{color:'var(--accent)'}}>*</span>}</label>
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={fieldValue}
          onChange={(e) => {
            if (type === 'tel' && (name === 'phone' || name === 'whatsapp')) {
              handlePhoneChange(e, name);
            } else {
              handleChange(e);
            }
          }}
          required={required}
          min={type === 'number' ? field.min : undefined}
          max={type === 'number' ? field.max : undefined}
        />
      </div>
    );
  };

  const stepDef = STEPS[currentStep - 1];
  const progressPercent = (currentStep / TOTAL_STEPS) * 100;

  return (
    <>
      <Header />
      <section className="onboarding-lead">
        <div className="container">
          <h1>Become a trusted provider</h1>
          <div className="step-indicator">
            <span className="step-number" id="stepCounter">Step {currentStep} / {TOTAL_STEPS}</span>
            <div className="step-progress"><div className="step-progress-fill" style={{ width: `${progressPercent}%` }}></div></div>
          </div>
        </div>
      </section>

      <div className="form-panel">
        {showAlert && (
          <div className="validation-alert" ref={alertRef}>
            <i className="fas fa-exclamation-triangle"></i> <span>{alertMessage}</span>
          </div>
        )}

        <div className="step-title">Step {currentStep}: {stepDef.title}</div>
        <div className="step-desc">{stepDef.desc}</div>

        <div className="form-grid">
          {stepDef.fields.map(field => renderField(field))}
        </div>

        <div className="form-nav">
          {currentStep > 1 ? (
            <button className="btn-prev" onClick={prevStep}><i className="fas fa-arrow-left"></i> Previous</button>
          ) : (
            <div></div>
          )}
          {currentStep < TOTAL_STEPS ? (
            <button className="btn-next" onClick={nextStep}>Next <i className="fas fa-arrow-right"></i></button>
          ) : (
            <button className="btn-submit" onClick={nextStep}><i className="fas fa-check-circle"></i> Create My Profile</button>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Registration;