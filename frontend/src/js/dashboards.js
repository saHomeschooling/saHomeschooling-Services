/* =============================================================
   dashboards.js – Shared JavaScript for SA Homeschooling
   Client & Admin Dashboards
   ============================================================= */

'use strict';

// ─── Client Dashboard State ────────────────────────────────── //

let editModeActive = false;
let originalValues  = {};
let tags = ['mathematics', 'tutoring', 'grade 8-12'];

// Text fields (contenteditable divs)
const textFields = [
  'fieldBusiness', 'fieldEmail', 'fieldAccountType', 'fieldCategory',
  'fieldBio', 'fieldServiceTitle', 'fieldStartingPrice', 'fieldAvailabilityNotes',
  'fieldContactName', 'fieldPhone', 'fieldContactEmail', 'fieldSocial', 'fieldCity',
  'fieldCertifications', 'fieldDegrees', 'fieldMemberships',
  'fieldReview1', 'fieldReview2', 'fieldReview3'
];

// Select elements
const selectIds = [
  'fieldYears', 'fieldAgeGroup', 'fieldMode',
  'fieldProvince', 'fieldPricingModel', 'fieldServiceAreaType'
];

// ─── Init Client Dashboard ─────────────────────────────────── //

function initClientDashboard() {
  if (!document.getElementById('clientDashboard')) return;

  _storeOriginalValues();
  renderTags();
  updateSocialVisibility();
  updateRadiusVisibility();

  const serviceAreaType = document.getElementById('fieldServiceAreaType');
  const publicToggle    = document.getElementById('publicToggle');

  if (serviceAreaType) serviceAreaType.addEventListener('change', updateRadiusVisibility);
  if (publicToggle)    publicToggle.addEventListener('change', updateSocialVisibility);
}

// Store current field values as originals (used for cancel)
function _storeOriginalValues() {
  textFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) originalValues[id] = el.innerText;
  });

  selectIds.forEach(id => {
    const sel = document.getElementById(id);
    if (sel) originalValues[id] = sel.multiple ? _getMultiSelectValues(sel) : sel.value;
  });

  const languageSelect = document.getElementById('fieldLanguages');
  if (languageSelect) originalValues.languages = _getMultiSelectValues(languageSelect);

  const dayCheckboxes = document.querySelectorAll('#fieldAvailabilityDays input[type=checkbox]');
  originalValues.days = [];
  dayCheckboxes.forEach(cb => originalValues.days.push({ value: cb.value, checked: cb.checked }));

  const publicToggle = document.getElementById('publicToggle');
  if (publicToggle) originalValues.publicToggle = publicToggle.checked;

  const radiusInput = document.getElementById('fieldRadius');
  if (radiusInput) originalValues.radius = radiusInput.value;

  originalValues.tags = [...tags];
}

// ─── Tags ──────────────────────────────────────────────────── //

function renderTags() {
  const container = document.getElementById('tagsContainer');
  if (!container) return;

  container.innerHTML = '';
  tags.forEach((tag, index) => {
    const span = document.createElement('span');
    span.className = 'tag-item';
    span.setAttribute('role', 'listitem');
    span.innerHTML = tag + (editModeActive
      ? ` <i class="fas fa-times" onclick="removeTag(${index})" aria-label="Remove tag ${tag}" tabindex="0" role="button"></i>`
      : '');
    container.appendChild(span);
  });
}

function addNewTag() {
  if (!editModeActive) return;
  const input = document.getElementById('newTagInput');
  if (!input) return;
  const newTag = input.value.trim().toLowerCase();
  if (newTag && !tags.includes(newTag)) {
    tags.push(newTag);
    renderTags();
    input.value = '';
    input.focus();
  }
}

function removeTag(index) {
  if (!editModeActive) return;
  tags.splice(index, 1);
  renderTags();
}

// ─── Multi-select helpers ───────────────────────────────────── //

function _getMultiSelectValues(select) {
  return Array.from(select.options).filter(o => o.selected).map(o => o.value);
}

function _setMultiSelectValues(select, values) {
  if (!select) return;
  Array.from(select.options).forEach(o => {
    o.selected = values.includes(o.value);
  });
}

// ─── Visibility helpers ─────────────────────────────────────── //

function updateRadiusVisibility() {
  const serviceAreaType = document.getElementById('fieldServiceAreaType');
  const radiusContainer = document.getElementById('radiusContainer');
  if (!serviceAreaType || !radiusContainer) return;
  radiusContainer.style.display = serviceAreaType.value === 'local' ? 'inline-flex' : 'none';
}

function updateSocialVisibility() {
  const publicToggle  = document.getElementById('publicToggle');
  const socialPreview = document.getElementById('socialPreview');
  if (!publicToggle || !socialPreview) return;
  socialPreview.style.display = publicToggle.checked ? 'block' : 'none';
}

// ─── Edit Mode Toggle ───────────────────────────────────────── //

function toggleEditMode() {
  if (!editModeActive) {
    _enterEditMode();
  } else {
    cancelEdit();
  }
}

function _enterEditMode() {
  _storeOriginalValues();

  // Enable text fields
  textFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.setAttribute('contenteditable', 'true');
  });

  // Enable selects
  selectIds.forEach(id => {
    const sel = document.getElementById(id);
    if (sel) sel.disabled = false;
  });

  // Enable language select
  const languageSelect = document.getElementById('fieldLanguages');
  if (languageSelect) languageSelect.disabled = false;

  // Enable day checkboxes
  document.querySelectorAll('#fieldAvailabilityDays input[type=checkbox]')
    .forEach(cb => cb.disabled = false);

  // Enable toggles and inputs
  _setDisabled('publicToggle', false);
  _setDisabled('fieldRadius', false);
  _setDisabled('newTagInput', false);
  _setDisabled('addTagBtn', false);

  // Activate edit mode class
  document.getElementById('clientDashboard').classList.add('edit-mode');

  // Update UI
  const badge = document.getElementById('editModeBadge');
  if (badge) badge.innerHTML = '<i class="fas fa-pencil-alt" aria-hidden="true"></i> edit mode active';

  const editControls = document.getElementById('editControls');
  if (editControls) editControls.style.display = 'flex';

  const editHint = document.getElementById('editModeHint');
  if (editHint) editHint.style.display = 'none';

  editModeActive = true;
  updateRadiusVisibility();
  renderTags();
}

function cancelEdit() {
  // Restore text fields
  textFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (originalValues[id] !== undefined) el.innerText = originalValues[id];
      el.setAttribute('contenteditable', 'false');
    }
  });

  // Restore selects
  selectIds.forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    if (Array.isArray(originalValues[id])) {
      _setMultiSelectValues(sel, originalValues[id]);
    } else if (originalValues[id] !== undefined) {
      sel.value = originalValues[id];
    }
    sel.disabled = true;
  });

  // Restore language select
  const languageSelect = document.getElementById('fieldLanguages');
  if (languageSelect && originalValues.languages) {
    _setMultiSelectValues(languageSelect, originalValues.languages);
    languageSelect.disabled = true;
  }

  // Restore day checkboxes
  document.querySelectorAll('#fieldAvailabilityDays input[type=checkbox]').forEach(cb => {
    const orig = (originalValues.days || []).find(d => d.value === cb.value);
    if (orig) cb.checked = orig.checked;
    cb.disabled = true;
  });

  // Restore toggle and radius
  const publicToggle = document.getElementById('publicToggle');
  if (publicToggle && originalValues.publicToggle !== undefined) {
    publicToggle.checked = originalValues.publicToggle;
    publicToggle.disabled = true;
  }

  const radiusInput = document.getElementById('fieldRadius');
  if (radiusInput && originalValues.radius !== undefined) {
    radiusInput.value = originalValues.radius;
    radiusInput.disabled = true;
  }

  // Restore tags
  tags = [...(originalValues.tags || [])];

  // Disable tag inputs
  _setDisabled('newTagInput', true);
  const tagInput = document.getElementById('newTagInput');
  if (tagInput) tagInput.value = '';
  _setDisabled('addTagBtn', true);

  // Remove edit mode
  document.getElementById('clientDashboard').classList.remove('edit-mode');

  const badge = document.getElementById('editModeBadge');
  if (badge) badge.innerHTML = '<i class="far fa-edit" aria-hidden="true"></i> activate edit mode';

  const editControls = document.getElementById('editControls');
  if (editControls) editControls.style.display = 'none';

  const editHint = document.getElementById('editModeHint');
  if (editHint) editHint.style.display = 'inline-flex';

  editModeActive = false;
  renderTags();
  updateSocialVisibility();
  updateRadiusVisibility();
}

function saveChanges() {
  // Persist new values as originals
  textFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      originalValues[id] = el.innerText;
      el.setAttribute('contenteditable', 'false');
    }
  });

  selectIds.forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    originalValues[id] = sel.multiple ? _getMultiSelectValues(sel) : sel.value;
    sel.disabled = true;
  });

  const languageSelect = document.getElementById('fieldLanguages');
  if (languageSelect) {
    originalValues.languages = _getMultiSelectValues(languageSelect);
    languageSelect.disabled = true;
  }

  const dayCheckboxes = document.querySelectorAll('#fieldAvailabilityDays input[type=checkbox]');
  originalValues.days = [];
  dayCheckboxes.forEach(cb => {
    originalValues.days.push({ value: cb.value, checked: cb.checked });
    cb.disabled = true;
  });

  const publicToggle = document.getElementById('publicToggle');
  if (publicToggle) { originalValues.publicToggle = publicToggle.checked; publicToggle.disabled = true; }

  const radiusInput = document.getElementById('fieldRadius');
  if (radiusInput) { originalValues.radius = radiusInput.value; radiusInput.disabled = true; }

  originalValues.tags = [...tags];
  _setDisabled('newTagInput', true);
  const tagInput = document.getElementById('newTagInput');
  if (tagInput) tagInput.value = '';
  _setDisabled('addTagBtn', true);

  document.getElementById('clientDashboard').classList.remove('edit-mode');

  const badge = document.getElementById('editModeBadge');
  if (badge) badge.innerHTML = '<i class="far fa-edit" aria-hidden="true"></i> activate edit mode';

  const editControls = document.getElementById('editControls');
  if (editControls) editControls.style.display = 'none';

  const editHint = document.getElementById('editModeHint');
  if (editHint) editHint.style.display = 'inline-flex';

  editModeActive = false;

  updateSocialVisibility();
  updateRadiusVisibility();
  renderTags();
  showNotification('Changes saved successfully!', 'success');
}

// Helper: enable/disable an element by ID
function _setDisabled(id, disabled) {
  const el = document.getElementById(id);
  if (el) el.disabled = disabled;
}

// ─── Photo Upload ───────────────────────────────────────────── //

function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validate type
  if (!file.type.startsWith('image/')) {
    showNotification('Please upload an image file (JPG, PNG, etc.)', 'error');
    return;
  }

  // Validate size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    showNotification('Image must be smaller than 5MB.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const img  = document.getElementById('photoImg');
    const icon = document.getElementById('photoIcon');
    if (img) { img.src = e.target.result; img.style.display = 'block'; }
    if (icon) icon.style.display = 'none';
    showNotification('Photo updated successfully!', 'success');
  };
  reader.readAsDataURL(file);

  // Reset input so same file can be re-uploaded
  event.target.value = '';
}

// ─── Admin: Tab switching ───────────────────────────────────── //

function switchTab(tabName, clickedBtn) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });

  const pane = document.getElementById(tabName + '-tab');
  if (pane) pane.classList.add('active');

  // Support being called from inline onclick with event.target fallback
  const btn = clickedBtn || (typeof event !== 'undefined' && event.target) || null;
  if (btn && btn.classList && btn.classList.contains('tab-btn')) {
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
  }
}

// ─── Admin: Status change ───────────────────────────────────── //

function handleStatusChange(select, rowId) {
  const status = select.value;
  const row    = document.getElementById(rowId);
  if (!row) return;

  const badge = row.querySelector('.pending-badge, .approved-badge, .rejected-badge');
  if (!badge) return;

  if (status === 'approved') {
    badge.className   = 'approved-badge';
    badge.textContent = 'approved';
    showNotification('Provider approved.', 'success');
  } else if (status === 'rejected') {
    badge.className   = 'rejected-badge';
    badge.textContent = 'rejected';
    showNotification('Provider rejected.', 'info');
  } else {
    badge.className   = 'pending-badge';
    badge.textContent = 'pending';
  }
}

// ─── Admin: Override toggle ─────────────────────────────────── //

function toggleOverride(rowId) {
  const checkbox = event.target;
  const row      = document.getElementById(rowId);
  if (!row) return;

  if (checkbox.checked) {
    row.style.backgroundColor = '#fffbeb';
    row.style.borderLeft      = '3px solid var(--warning)';
    showNotification('Override enabled for this provider.', 'info');
  } else {
    row.style.backgroundColor = '';
    row.style.borderLeft      = '';
  }
}

// ─── Admin: Badge selection ─────────────────────────────────── //

function selectBadge(providerId, badgeType) {
  const target = event.target;
  const row    = target.closest('.provider-row');
  if (!row) return;

  row.querySelectorAll('.badge-option').forEach(b => b.classList.remove('selected'));
  target.classList.add('selected');

  const providerName = row.querySelector('strong') ? row.querySelector('strong').textContent : providerId;
  showNotification(`Badge "${badgeType}" assigned to ${providerName}.`, 'success');
}

// ─── Admin: Promote/demote ──────────────────────────────────── //

function promoteListing(provider) {
  showNotification(`"${provider}" promoted — listing will move up in search results.`, 'success');
}

function demoteListing(provider) {
  showNotification(`"${provider}" demoted — listing will move down in search results.`, 'info');
}

// ─── Admin: Featured slot management ───────────────────────── //

function removeFeatured(category, provider) {
  showNotification(`Removed "${provider}" from ${category} featured slots.`, 'info');
}

function assignFeatured(category) {
  showNotification(`Open the assignment dialog for a ${category} featured slot.`, 'info');
}

// ─── Admin: Category limits ─────────────────────────────────── //

function updateCategoryLimit(category) {
  showNotification(`Featured slot limit updated for "${category}".`, 'success');
}

// ─── Admin: Review moderation ───────────────────────────────── //

function moderateReview(reviewId, action) {
  const card   = document.getElementById(reviewId);
  if (!card) return;

  const badge  = card.querySelector('.review-status');
  const btns   = card.querySelectorAll('button');

  if (action === 'approve') {
    if (badge) { badge.className = 'review-status approved-badge'; badge.textContent = 'approved'; }
    showNotification('Review approved — it will appear on the provider\'s public page.', 'success');
  } else {
    if (badge) { badge.className = 'review-status rejected-badge'; badge.textContent = 'rejected'; }
    showNotification('Review rejected — it will not be displayed publicly.', 'info');
  }

  // Disable action buttons
  btns.forEach(btn => { btn.disabled = true; btn.style.opacity = '0.45'; });
}

// ─── Profile Modal ──────────────────────────────────────────── //

const providerData = {
  khan: {
    name: 'Khan Academy SA',
    email: 'contact@khanacademy.org.za',
    accountType: 'Organization / Company',
    yearsExperience: '10+ Years',
    languages: 'English, Afrikaans, isiXhosa, isiZulu',
    primaryCategory: 'Curriculum Provider',
    tags: ['mathematics', 'science', 'online learning', 'free curriculum', 'video lessons'],
    bio: 'Free world-class education for anyone anywhere. Our curriculum covers mathematics, science, computing, humanities and more across South Africa. Completely free, forever.',
    certifications: 'Khan Academy Certified Content Provider, Google for Education Partner',
    degrees: 'BSc Computer Science (Stanford), MEd (Harvard)',
    memberships: 'SA Curriculum Association, Digital Learning Collective',
    clearance: 'Verified (2025)',
    serviceTitle: 'Math & Science Curriculum (Gr R–12)',
    ageGroups: ['5–7 years', '8–10 years', '11–13 years', '14–18 years'],
    deliveryMode: 'Online',
    province: 'Gauteng',
    city: 'Johannesburg',
    serviceArea: 'National',
    radius: '',
    pricingModel: 'Custom quote',
    startingPrice: 'Free',
    availabilityDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    availabilityNotes: '24/7 Online — self-paced learning available anytime',
    contactName: 'Support Team',
    phone: '+27 11 555 1234',
    contactEmail: 'support@khanacademy.org.za',
    social: '@khanacademySA · www.khanacademy.org.za · FB, Twitter, YouTube',
    listingPlan: 'Free Listing',
    publicDisplay: true,
    reviews: {
      average: 4.9,
      count: 156,
      items: [
        { reviewer: 'Sarah J.', rating: 5, text: 'Excellent resource for our homeschool curriculum.' },
        { reviewer: 'Thabo M.', rating: 5, text: 'My kids love the math challenges.' }
      ]
    }
  },
  therapy: {
    name: 'Therapy4Learning',
    email: 'info@therapy4learning.co.za',
    accountType: 'Individual Provider',
    yearsExperience: '5–10 Years',
    languages: 'English, Afrikaans',
    primaryCategory: 'Therapist',
    tags: ['occupational therapy', 'sensory integration', 'child development'],
    bio: 'Pediatric occupational therapy services for children with learning difficulties.',
    certifications: 'HPCSA, OT Reg',
    degrees: 'MSc Occupational Therapy',
    memberships: 'OTASA',
    clearance: 'Verified (2025)',
    serviceTitle: 'Pediatric OT Assessment & Therapy',
    ageGroups: ['5–7 years', '8–10 years', '11–13 years'],
    deliveryMode: 'In Person',
    province: 'Western Cape',
    city: 'Cape Town',
    serviceArea: 'Local',
    radius: '15',
    pricingModel: 'Hourly / Per package',
    startingPrice: 'R450/hr',
    availabilityDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    availabilityNotes: 'Mon–Fri 9am–5pm',
    contactName: 'Dr Sarah Khumalo',
    phone: '+27 21 555 9876',
    contactEmail: 'drsarah@therapy4learning.co.za',
    social: '@therapy4learning · www.therapy4learning.co.za',
    listingPlan: 'Professional Listing',
    publicDisplay: true,
    reviews: { average: 4.7, count: 18, items: [{ reviewer: 'Thabo M.', rating: 4, text: 'Great occupational therapist, very good with children.' }] }
  },
  creative: {
    name: 'Creative Arts Studio',
    email: 'hello@creativeartsstudio.co.za',
    accountType: 'Organization / Company',
    yearsExperience: '3–5 Years',
    languages: 'English, Afrikaans, isiXhosa',
    primaryCategory: 'Extracurricular Activities',
    tags: ['art', 'music', 'drama', 'creative expression'],
    bio: 'After-school arts program fostering creativity through painting, music, and drama.',
    certifications: 'Arts Education Certification',
    degrees: 'BA Fine Arts, Dip Music',
    memberships: 'SA Arts Education Association',
    clearance: 'Pending',
    serviceTitle: 'After-school Creative Arts Program',
    ageGroups: ['5–7 years', '8–10 years', '11–13 years'],
    deliveryMode: 'In Person',
    province: 'Gauteng',
    city: 'Pretoria',
    serviceArea: 'Local',
    radius: '10',
    pricingModel: 'Per term',
    startingPrice: 'R1,200/term',
    availabilityDays: ['Mon', 'Tue', 'Wed', 'Thu'],
    availabilityNotes: 'Mon–Thu 14:00–17:00',
    contactName: 'Lisa van Wyk',
    phone: '+27 12 345 6789',
    contactEmail: 'lisa@creativeartsstudio.co.za',
    social: '@creativeartspta · www.creativeartsstudio.co.za',
    listingPlan: 'Free Listing',
    publicDisplay: true,
    reviews: { average: 3.5, count: 4, items: [] }
  },
  bright: {
    name: 'Bright Minds Tutoring',
    email: 'hello@brightminds.co.za',
    accountType: 'Organization / Company',
    yearsExperience: '10+ Years',
    languages: 'English, Afrikaans, isiXhosa',
    primaryCategory: 'Tutor (Math & Science)',
    tags: ['mathematics', 'tutoring', 'grade 8–12'],
    bio: 'Specialised Maths & Science tutoring for grades 8–12. Small groups & individual support. Certified educators with 10+ years experience.',
    certifications: 'PGCE, TEFL, Maths Specialist',
    degrees: 'BSc Mathematics, MEd',
    memberships: 'SACE, SAALT, IEB Affiliate',
    clearance: 'Verified (2025)',
    serviceTitle: 'Math & Science Mentor (Gr 8–12)',
    ageGroups: ['14–18 years'],
    deliveryMode: 'Online & In-Person',
    province: 'Gauteng',
    city: 'Johannesburg',
    serviceArea: 'Local, National online',
    radius: '30',
    pricingModel: 'Hourly / Per package',
    startingPrice: 'R280/hr | R1,500/5 sessions',
    availabilityDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    availabilityNotes: 'Mon–Fri 14:00–18:00, Sat 09:00–13:00',
    contactName: 'Maria van der Merwe',
    phone: '+27 82 555 1234',
    contactEmail: 'maria@brightminds.co.za',
    social: '@brightminds_tutoring · www.brightminds.co.za',
    listingPlan: 'Professional Listing (paid)',
    publicDisplay: true,
    reviews: {
      average: 4.8,
      count: 12,
      items: [
        { reviewer: 'Sarah J.', rating: 5, text: 'Bright Minds transformed my daughter\'s confidence in maths.' },
        { reviewer: 'Thabo M.', rating: 4, text: 'Excellent science tutor, very patient and knowledgeable.' }
      ]
    }
  },
  edu: {
    name: 'EduConsult Pro',
    email: 'info@educonsultpro.co.za',
    accountType: 'Individual Provider',
    yearsExperience: '5–10 Years',
    languages: 'English, Afrikaans',
    primaryCategory: 'Educational Consultant',
    tags: ['curriculum advice', 'school placement', 'learning support'],
    bio: 'Independent educational consultancy helping families choose the right curriculum and schools.',
    certifications: 'Educational Consulting Certification',
    degrees: 'MEd, BEd',
    memberships: 'SAERA, IACAC',
    clearance: 'Verified (2024)',
    serviceTitle: 'Homeschool Curriculum Consulting',
    ageGroups: ['All ages'],
    deliveryMode: 'Online, In Person',
    province: 'Western Cape',
    city: 'Cape Town',
    serviceArea: 'National',
    radius: '',
    pricingModel: 'Hourly, Per package',
    startingPrice: 'R500/hr',
    availabilityDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    availabilityNotes: 'Mon–Fri 9am–5pm, Sat by appt',
    contactName: 'Dr James Ndlovu',
    phone: '+27 21 555 4321',
    contactEmail: 'james@educonsultpro.co.za',
    social: '@educonsultpro · www.educonsultpro.co.za',
    listingPlan: 'Professional Listing',
    publicDisplay: true,
    reviews: {
      average: 4.9,
      count: 24,
      items: [{ reviewer: 'Linda van Wyk', rating: 5, text: 'James helped us choose the perfect curriculum for our son.' }]
    }
  }
};

function showProfileModal(providerKey) {
  const modal     = document.getElementById('profileModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  if (!modal || !modalTitle || !modalBody) return;

  const data = providerData[providerKey] || providerData.bright;
  modalTitle.textContent = data.name + ' — Complete Profile';

  function field(label, value) {
    if (!value) return '';
    return `<div class="modal-field">
      <label>${label}</label>
      <div class="value">${_escape(String(value))}</div>
    </div>`;
  }

  function section(title) {
    return `<div style="border-top:1px solid var(--border); margin:1.25rem 0 0.75rem; padding-top:0.75rem;">
      <p style="font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--accent);">${title}</p>
    </div>`;
  }

  const starFill = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

  const reviewsHtml = data.reviews.items.map(r => `
    <div style="background:var(--bg); padding:0.75rem 1rem; border-radius:var(--radius-sm); margin-bottom:0.5rem; border:1px solid var(--border);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
        <strong style="font-size:0.875rem;">${_escape(r.reviewer)}</strong>
        <span style="color:#f59e0b; font-size:0.9rem;" aria-label="${r.rating} stars">${starFill(r.rating)}</span>
      </div>
      <p style="font-size:0.82rem; color:var(--ink-2); font-style:italic;">"${_escape(r.text)}"</p>
    </div>
  `).join('');

  modalBody.innerHTML =
    section('Account Information') +
    field('Full name / Business', data.name) +
    field('Email address', data.email) +
    field('Account type', data.accountType) +
    field('Years of experience', data.yearsExperience) +
    field('Languages spoken', data.languages) +
    field('Primary category', data.primaryCategory) +

    section('Tags & Bio') +
    field('Tags', data.tags.join(', ')) +
    field('Short bio', data.bio) +

    section('Qualifications & Experience') +
    field('Certifications', data.certifications) +
    field('Degrees', data.degrees) +
    field('Professional memberships', data.memberships) +
    field('Background clearance', data.clearance) +

    section('Service Details') +
    field('Service title', data.serviceTitle) +
    field('Age groups served', data.ageGroups.join(', ')) +
    field('Mode of delivery', data.deliveryMode) +

    section('Location & Reach') +
    field('Province', data.province) +
    field('City / Town', data.city) +
    field('Service area', data.serviceArea + (data.radius ? ' (' + data.radius + ' km radius)' : '')) +

    section('Pricing & Availability') +
    field('Pricing model', data.pricingModel) +
    field('Starting price', data.startingPrice) +
    field('Days available', data.availabilityDays.join(', ')) +
    field('Availability notes', data.availabilityNotes) +

    section('Contact & Online Presence') +
    field('Primary contact', data.contactName) +
    field('Phone number', data.phone) +
    field('Contact email', data.contactEmail) +
    field('Social / website', data.social) +
    field('Public display', data.publicDisplay ? 'Enabled' : 'Disabled') +
    field('Listing plan', data.listingPlan) +

    section('Reviews & Ratings') +
    field('Average rating', data.reviews.average + '/5 (' + data.reviews.count + ' reviews)') +
    reviewsHtml;

  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('profileModal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

// Simple HTML escaping to prevent XSS in modal
function _escape(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─── Notification System ────────────────────────────────────── //

function showNotification(message, type) {
  type = type || 'info';

  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    document.body.appendChild(container);
  }

  const colors = {
    success: 'var(--success)',
    error:   'var(--danger)',
    info:    '#3b82f6'
  };

  const icons = {
    success: 'fa-circle-check',
    error:   'fa-circle-exclamation',
    info:    'fa-circle-info'
  };

  const el = document.createElement('div');
  el.style.cssText = [
    'background:' + (colors[type] || colors.info),
    'color:white',
    'padding:0.75rem 1.25rem',
    'border-radius:var(--radius-sm, 10px)',
    'box-shadow:0 4px 16px rgba(0,0,0,0.15)',
    'font-weight:600',
    'font-size:0.875rem',
    'display:flex',
    'align-items:center',
    'gap:0.5rem',
    'animation:slideInRight 0.3s ease both',
    'cursor:pointer',
    'pointer-events:auto',
    'max-width:320px',
    'word-break:break-word',
    'font-family:var(--font-sans, system-ui)'
  ].join(';');

  el.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + '" aria-hidden="true"></i> ' + message;
  el.addEventListener('click', function () { el.remove(); });
  container.appendChild(el);

  setTimeout(function () {
    el.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(function () { el.remove(); }, 300);
  }, 3500);
}

// ─── Animations (injected) ──────────────────────────────────── //

(function injectAnimations() {
  if (document.getElementById('dash-keyframes')) return;
  const style = document.createElement('style');
  style.id = 'dash-keyframes';
  style.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(calc(100% + 1.5rem)); opacity: 0; }
      to   { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to   { transform: translateX(calc(100% + 1.5rem)); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();

// ─── Auth: Login ────────────────────────────────────────────── //

function handleLogin(event) {
  event.preventDefault();

  const email    = (document.getElementById('loginEmail')    || {}).value || '';
  const password = (document.getElementById('loginPassword') || {}).value || '';

  if (!email || !password) {
    showNotification('Please fill in all fields.', 'error');
    return;
  }

  if (email === 'admin@sahomeschooling.co.za' && password === 'admin123') {
    showNotification('Admin login successful! Redirecting…', 'success');
    setTimeout(function () { window.location.href = '../dashboards/admin-dashboard.html'; }, 1500);
  } else if (email === 'contact@khanacademy.org.za' || password.length >= 8) {
    showNotification('Login successful! Redirecting to dashboard…', 'success');
    setTimeout(function () { window.location.href = '../dashboards/client-dashboard.html'; }, 1500);
  } else {
    showNotification('Invalid credentials. Try admin@sahomeschooling.co.za / admin123.', 'error');
  }
}

// ─── Auth: Register ─────────────────────────────────────────── //

function handleRegister(event) {
  event.preventDefault();

  const name        = (document.getElementById('regName')  || {}).value || '';
  const email       = (document.getElementById('regEmail') || {}).value || '';
  const password    = (document.getElementById('regPass')  || {}).value || '';
  const category    = (document.getElementById('regCat')   || {}).value || '';
  const accountType = (document.getElementById('regType')  || {}).value || '';

  if (!name || !email || !password || !category || !accountType) {
    showNotification('Please fill in all required fields.', 'error');
    return;
  }

  try {
    const users = JSON.parse(localStorage.getItem('sah_users') || '[]');
    users.push({
      id: Date.now(), name, email, accountType,
      category, status: 'pending',
      registered: new Date().toISOString(), tier: 'free'
    });
    localStorage.setItem('sah_users', JSON.stringify(users));
  } catch (e) {
    // localStorage may not be available
  }

  showNotification('Registration successful! Your account is pending approval.', 'success');
  setTimeout(function () { window.location.href = 'Login.html'; }, 2000);
}

// ─── Initialisation ─────────────────────────────────────────── //

document.addEventListener('DOMContentLoaded', function () {
  const path = window.location.pathname;

  if (path.includes('client-dashboard')) {
    initClientDashboard();
  } else if (path.includes('admin-dashboard')) {
    // Ensure first tab pane is active (HTML already sets this, just safety)
    const firstPane = document.querySelector('.tab-pane');
    if (firstPane && !document.querySelector('.tab-pane.active')) {
      firstPane.classList.add('active');
    }
  }

  // Close modal on backdrop click
  window.addEventListener('click', function (e) {
    const modal = document.getElementById('profileModal');
    if (modal && e.target === modal) closeModal();
  });

  // Close modal on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const modal = document.getElementById('profileModal');
      if (modal && modal.style.display === 'block') closeModal();
    }
  });
});

// ─── Exports (global) ──────────────────────────────────────── //

window.toggleEditMode   = toggleEditMode;
window.addNewTag        = addNewTag;
window.removeTag        = removeTag;
window.saveChanges      = saveChanges;
window.cancelEdit       = cancelEdit;
window.handlePhotoUpload = handlePhotoUpload;
window.switchTab        = switchTab;
window.handleStatusChange = handleStatusChange;
window.toggleOverride   = toggleOverride;
window.selectBadge      = selectBadge;
window.promoteListing   = promoteListing;
window.demoteListing    = demoteListing;
window.removeFeatured   = removeFeatured;
window.assignFeatured   = assignFeatured;
window.updateCategoryLimit = updateCategoryLimit;
window.moderateReview   = moderateReview;
window.showProfileModal = showProfileModal;
window.closeModal       = closeModal;
window.handleLogin      = handleLogin;
window.handleRegister   = handleRegister;
window.renderTags       = renderTags;
window.updateSocialVisibility = updateSocialVisibility;
window.updateRadiusVisibility = updateRadiusVisibility;
window.showNotification = showNotification;

// Expose state for page-level overrides
Object.defineProperty(window, 'editModeActive', {
  get: function () { return editModeActive; },
  set: function (v) { editModeActive = v; }
});

Object.defineProperty(window, 'tags', {
  get: function () { return tags; },
  set: function (v) { tags = v; }
});