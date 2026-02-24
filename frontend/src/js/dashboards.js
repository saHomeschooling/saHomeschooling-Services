// dashboards.js - Shared JavaScript for client and admin dashboards

// ========== CLIENT DASHBOARD FUNCTIONS ==========

// State for client dashboard
let editModeActive = false;
let originalValues = {};
let tags = ['mathematics', 'tutoring', 'grade 8-12']; // default tags

// Text fields (contenteditable)
const textFields = [
  'fieldBusiness', 'fieldEmail', 'fieldAccountType', 'fieldCategory',
  'fieldBio', 'fieldServiceTitle', 'fieldStartingPrice', 'fieldAvailabilityNotes',
  'fieldContactName', 'fieldPhone', 'fieldContactEmail', 'fieldSocial', 'fieldCity',
  'fieldCertifications', 'fieldDegrees', 'fieldMemberships', 'fieldReview1', 'fieldReview2', 'fieldReview3'
];

// Select elements (including multi-select language)
const selectIds = ['fieldYears', 'fieldAgeGroup', 'fieldMode', 'fieldProvince', 'fieldPricingModel', 'fieldServiceAreaType'];

// Initialize client dashboard
function initClientDashboard() {
  if (!document.getElementById('clientDashboard')) return;

  const languageSelect = document.getElementById('fieldLanguages');
  const dayCheckboxes = document.querySelectorAll('#fieldAvailabilityDays input[type=checkbox]');
  const publicToggle = document.getElementById('publicToggle');
  const socialPreview = document.getElementById('socialPreview');
  const radiusInput = document.getElementById('fieldRadius');
  const serviceAreaType = document.getElementById('fieldServiceAreaType');
  const tagsContainer = document.getElementById('tagsContainer');
  const newTagInput = document.getElementById('newTagInput');
  const addTagBtn = document.getElementById('addTagBtn');

  // Store original values
  textFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) originalValues[id] = el.innerText;
  });
  selectIds.forEach(id => {
    const sel = document.getElementById(id);
    if (sel) originalValues[id] = sel.value;
  });
  if (languageSelect) originalValues.languages = getSelectedLanguages(languageSelect);

  originalValues.days = [];
  dayCheckboxes.forEach(cb => {
    originalValues.days.push({ value: cb.value, checked: cb.checked });
  });
  if (publicToggle) originalValues.publicToggle = publicToggle.checked;
  if (radiusInput) originalValues.radius = radiusInput.value;
  originalValues.tags = [...tags];

  renderTags();
  updateSocialVisibility();
  updateRadiusVisibility();

  // Event listeners
  if (serviceAreaType) {
    serviceAreaType.addEventListener('change', updateRadiusVisibility);
  }
  if (publicToggle) {
    publicToggle.addEventListener('change', updateSocialVisibility);
  }
}

// Render tags
function renderTags() {
  const tagsContainer = document.getElementById('tagsContainer');
  if (!tagsContainer) return;

  tagsContainer.innerHTML = '';
  tags.forEach((tag, index) => {
    const tagEl = document.createElement('span');
    tagEl.className = 'tag-item';
    tagEl.innerHTML = `${tag} <i class="fas fa-times" onclick="removeTag(${index})" style="cursor:pointer;"></i>`;
    tagsContainer.appendChild(tagEl);
  });
}

// Add new tag
function addNewTag() {
  if (!editModeActive) return;
  const input = document.getElementById('newTagInput');
  const newTag = input.value.trim();
  if (newTag && !tags.includes(newTag)) {
    tags.push(newTag);
    renderTags();
    input.value = '';
  }
}

// Remove tag
function removeTag(index) {
  if (!editModeActive) return;
  tags.splice(index, 1);
  renderTags();
}

// Helper to get selected languages as comma string
function getSelectedLanguages(languageSelect) {
  const selected = [];
  for (let option of languageSelect.options) {
    if (option.selected) selected.push(option.value);
  }
  return selected.join(', ');
}

// Helper to set selected languages from comma string
function setSelectedLanguages(languageSelect, langString) {
  if (!languageSelect) return;
  const langArray = langString.split(',').map(s => s.trim());
  for (let option of languageSelect.options) {
    option.selected = langArray.includes(option.value);
  }
}

// Show/hide radius based on service area type
function updateRadiusVisibility() {
  const serviceAreaType = document.getElementById('fieldServiceAreaType');
  const radiusContainer = document.getElementById('radiusContainer');
  if (!serviceAreaType || !radiusContainer) return;

  if (serviceAreaType.value === 'local') {
    radiusContainer.style.display = 'inline-flex';
  } else {
    radiusContainer.style.display = 'none';
  }
}

// Toggle social preview based on public toggle
function updateSocialVisibility() {
  const publicToggle = document.getElementById('publicToggle');
  const socialPreview = document.getElementById('socialPreview');
  if (!publicToggle || !socialPreview) return;

  if (publicToggle.checked) {
    socialPreview.style.display = 'block';
  } else {
    socialPreview.style.display = 'none';
  }
}

// Toggle edit mode
function toggleEditMode() {
  const badge = document.getElementById('editModeBadge');
  const editControls = document.getElementById('editControls');
  const editHint = document.getElementById('editModeHint');
  const dashboard = document.getElementById('clientDashboard');
  const languageSelect = document.getElementById('fieldLanguages');
  const dayCheckboxes = document.querySelectorAll('#fieldAvailabilityDays input[type=checkbox]');
  const publicToggle = document.getElementById('publicToggle');
  const radiusInput = document.getElementById('fieldRadius');
  const serviceAreaType = document.getElementById('fieldServiceAreaType');
  const newTagInput = document.getElementById('newTagInput');
  const addTagBtn = document.getElementById('addTagBtn');

  if (!editModeActive) {
    // store original values
    textFields.forEach(id => {
      const el = document.getElementById(id);
      if (el) originalValues[id] = el.innerText;
    });
    selectIds.forEach(id => {
      const sel = document.getElementById(id);
      if (sel) originalValues[id] = sel.value;
    });
    if (languageSelect) originalValues.languages = getSelectedLanguages(languageSelect);

    originalValues.days = [];
    dayCheckboxes.forEach(cb => {
      originalValues.days.push({ value: cb.value, checked: cb.checked });
    });
    if (publicToggle) originalValues.publicToggle = publicToggle.checked;
    if (radiusInput) originalValues.radius = radiusInput.value;
    originalValues.tags = [...tags];

    // enable editing
    textFields.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.setAttribute('contenteditable', 'true');
    });
    selectIds.forEach(id => {
      const sel = document.getElementById(id);
      if (sel) sel.disabled = false;
    });
    if (languageSelect) languageSelect.disabled = false;
    dayCheckboxes.forEach(cb => cb.disabled = false);
    if (publicToggle) publicToggle.disabled = false;
    if (radiusInput) radiusInput.disabled = false;
    if (newTagInput) newTagInput.disabled = false;
    if (addTagBtn) addTagBtn.disabled = false;

    dashboard.classList.add('edit-mode');
    badge.innerHTML = '<i class="fas fa-pencil-alt"></i>  edit mode active';
    editControls.style.display = 'flex';
    editHint.style.display = 'none';
    editModeActive = true;
    updateRadiusVisibility();
    renderTags();
  } else {
    cancelEdit();
  }
}

// Cancel edit
function cancelEdit() {
  const dashboard = document.getElementById('clientDashboard');
  const badge = document.getElementById('editModeBadge');
  const editControls = document.getElementById('editControls');
  const editHint = document.getElementById('editModeHint');
  const languageSelect = document.getElementById('fieldLanguages');
  const dayCheckboxes = document.querySelectorAll('#fieldAvailabilityDays input[type=checkbox]');
  const publicToggle = document.getElementById('publicToggle');
  const radiusInput = document.getElementById('fieldRadius');
  const serviceAreaType = document.getElementById('fieldServiceAreaType');
  const newTagInput = document.getElementById('newTagInput');
  const addTagBtn = document.getElementById('addTagBtn');

  // revert text fields
  textFields.forEach(id => {
    const el = document.getElementById(id);
    if (el && originalValues[id] !== undefined) {
      el.innerText = originalValues[id];
    }
    el.setAttribute('contenteditable', 'false');
  });

  selectIds.forEach(id => {
    const sel = document.getElementById(id);
    if (sel && originalValues[id] !== undefined) {
      sel.value = originalValues[id];
    }
    sel.disabled = true;
  });

  // revert language select
  if (languageSelect && originalValues.languages) {
    setSelectedLanguages(languageSelect, originalValues.languages);
  }
  if (languageSelect) languageSelect.disabled = true;

  dayCheckboxes.forEach(cb => {
    const orig = originalValues.days?.find(d => d.value === cb.value);
    if (orig) cb.checked = orig.checked;
    cb.disabled = true;
  });

  if (publicToggle && originalValues.publicToggle !== undefined) {
    publicToggle.checked = originalValues.publicToggle;
    publicToggle.disabled = true;
  }

  if (radiusInput && originalValues.radius !== undefined) {
    radiusInput.value = originalValues.radius;
    radiusInput.disabled = true;
  }

  // revert tags
  tags = originalValues.tags ? [...originalValues.tags] : [];
  renderTags();
  if (newTagInput) {
    newTagInput.disabled = true;
    newTagInput.value = '';
  }
  if (addTagBtn) addTagBtn.disabled = true;

  dashboard.classList.remove('edit-mode');
  badge.innerHTML = '<i class="far fa-edit"></i>  activate edit mode';
  editControls.style.display = 'none';
  editHint.style.display = 'inline';
  editModeActive = false;

  updateSocialVisibility();
  updateRadiusVisibility();
}

// Save changes
function saveChanges() {
  const languageSelect = document.getElementById('fieldLanguages');
  const dayCheckboxes = document.querySelectorAll('#fieldAvailabilityDays input[type=checkbox]');
  const publicToggle = document.getElementById('publicToggle');
  const radiusInput = document.getElementById('fieldRadius');
  const serviceAreaType = document.getElementById('fieldServiceAreaType');
  const newTagInput = document.getElementById('newTagInput');
  const addTagBtn = document.getElementById('addTagBtn');

  // update original values
  textFields.forEach(id => {
    originalValues[id] = document.getElementById(id).innerText;
  });
  selectIds.forEach(id => {
    originalValues[id] = document.getElementById(id).value;
  });
  if (languageSelect) originalValues.languages = getSelectedLanguages(languageSelect);

  originalValues.days = [];
  dayCheckboxes.forEach(cb => {
    originalValues.days.push({ value: cb.value, checked: cb.checked });
  });
  if (publicToggle) originalValues.publicToggle = publicToggle.checked;
  if (radiusInput) originalValues.radius = radiusInput.value;
  originalValues.tags = [...tags];

  // exit edit mode (disable all)
  const dashboard = document.getElementById('clientDashboard');
  const badge = document.getElementById('editModeBadge');
  const editControls = document.getElementById('editControls');
  const editHint = document.getElementById('editModeHint');

  textFields.forEach(id => {
    document.getElementById(id).setAttribute('contenteditable', 'false');
  });
  selectIds.forEach(id => {
    document.getElementById(id).disabled = true;
  });
  if (languageSelect) languageSelect.disabled = true;
  dayCheckboxes.forEach(cb => cb.disabled = true);
  if (publicToggle) publicToggle.disabled = true;
  if (radiusInput) radiusInput.disabled = true;
  if (newTagInput) newTagInput.disabled = true;
  if (addTagBtn) addTagBtn.disabled = true;

  dashboard.classList.remove('edit-mode');
  badge.innerHTML = '<i class="far fa-edit"></i>  activate edit mode';
  editControls.style.display = 'none';
  editHint.style.display = 'inline';
  editModeActive = false;

  updateSocialVisibility();
  updateRadiusVisibility();

  // Show success message
  showNotification('Changes saved successfully!', 'success');
}

// Handle photo upload
function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.getElementById('photoImg');
      const icon = document.getElementById('photoIcon');
      img.src = e.target.result;
      img.style.display = 'block';
      icon.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }
}

// ========== ADMIN DASHBOARD FUNCTIONS ==========

// Tab switching
function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

  // Show selected tab
  document.getElementById(tabName + '-tab').classList.add('active');
  event.target.classList.add('active');
}

// Handle status change (approve/reject)
function handleStatusChange(select, rowId) {
  const status = select.value;
  const row = document.getElementById(rowId);
  const badge = row.querySelector('.pending-badge, .approved-badge, .rejected-badge');

  if (badge) {
    if (status === 'approved') {
      badge.className = 'approved-badge';
      badge.textContent = 'approved';
    } else if (status === 'rejected') {
      badge.className = 'rejected-badge';
      badge.textContent = 'rejected';
    } else {
      badge.className = 'pending-badge';
      badge.textContent = 'pending';
    }
  }
}

// Toggle override checkbox
function toggleOverride(rowId) {
  const checkbox = event.target;
  const row = document.getElementById(rowId);
  if (checkbox.checked) {
    row.style.backgroundColor = '#fff3e0';
    row.style.borderLeft = '4px solid var(--accent)';
  } else {
    row.style.backgroundColor = '';
    row.style.borderLeft = '';
  }
}

// Select badge for provider
function selectBadge(providerId, badgeType) {
  const row = event.target.closest('.provider-row');
  const badges = row.querySelectorAll('.badge-option');
  badges.forEach(b => b.classList.remove('selected'));

  // Add selected class to clicked badge
  event.target.classList.add('selected');

  const providerName = row.querySelector('strong').textContent;
  console.log(`Set ${providerName} badge to ${badgeType}`);
}

// Promote listing
function promoteListing(provider) {
  showNotification(`Promote ${provider} - listing will move up in search results.`, 'info');
}

// Demote listing
function demoteListing(provider) {
  showNotification(`Demote ${provider} - listing will move down in search results.`, 'info');
}

// Remove from featured slot
function removeFeatured(category, provider) {
  showNotification(`Remove ${provider} from ${category} featured slots.`, 'info');
}

// Assign to featured slot
function assignFeatured(category) {
  showNotification(`Assign a provider to ${category} featured slot.`, 'info');
}

// Update category limit
function updateCategoryLimit(category) {
  showNotification(`Update featured slot limit for ${category}.`, 'info');
}

// Moderate review - approve or reject
function moderateReview(reviewId, action) {
  const reviewCard = document.getElementById(reviewId);
  const statusBadge = reviewCard.querySelector('.review-status');

  if (action === 'approve') {
    statusBadge.className = 'review-status approved-badge';
    statusBadge.textContent = 'approved';
    showNotification('Review approved and will appear on the client page.', 'success');
  } else {
    statusBadge.className = 'review-status rejected-badge';
    statusBadge.textContent = 'rejected';
    showNotification('Review rejected and will not be displayed.', 'info');
  }

  // Disable the buttons after action
  const buttons = reviewCard.querySelectorAll('button');
  buttons.forEach(btn => btn.disabled = true);
}

// ========== COMPREHENSIVE PROFILE MODAL ==========

// Complete provider data - matches all fields from client dashboard
const providerData = {
  khan: {
    name: 'Khan Academy SA',
    email: 'contact@khanacademy.org.za',
    accountType: 'Organization/Company',
    yearsExperience: '10+ Years',
    languages: 'English, Afrikaans, isiZulu',
    primaryCategory: 'Curriculum Provider',
    tags: ['mathematics', 'science', 'online learning', 'free curriculum', 'video lessons'],
    bio: 'Free world-class education for anyone anywhere. Our curriculum covers mathematics, science, computing, humanities and more. We provide video lessons, practice exercises, and personalized learning dashboards for homeschoolers across South Africa. Completely free, forever.',
    certifications: 'Khan Academy Certified Content Provider, Google for Education Partner',
    degrees: 'BSc Computer Science (Stanford), MEd (Harvard)',
    memberships: 'SA Curriculum Association, Digital Learning Collective',
    clearance: 'Verified (2025)',
    serviceTitle: 'Math & Science Curriculum (Gr R-12)',
    ageGroups: ['5-7 years', '8-10 years', '11-13 years', '14-18 years'],
    deliveryMode: 'Online',
    province: 'Gauteng',
    city: 'Johannesburg',
    serviceArea: 'National',
    radius: '30',
    pricingModel: 'Custom quote',
    startingPrice: 'Free',
    availabilityDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    availabilityNotes: '24/7 Online - Self-paced learning available anytime',
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
        { reviewer: 'Sarah J.', rating: 5, text: 'Excellent resource for our homeschool curriculum. The video lessons are clear and the practice exercises really help reinforce concepts.' },
        { reviewer: 'Thabo M.', rating: 5, text: 'My kids love the math challenges. It\'s made learning fun and independent.' }
      ]
    }
  },
  therapy: {
    name: 'Therapy4Learning',
    email: 'info@therapy4learning.co.za',
    accountType: 'Individual Provider',
    yearsExperience: '5-10 Years',
    languages: 'English, Afrikaans',
    primaryCategory: 'Therapist',
    tags: ['occupational therapy', 'sensory integration', 'child development'],
    bio: 'Pediatric occupational therapy services for children with learning difficulties.',
    certifications: 'HPCSA, OT Reg',
    degrees: 'MSc Occupational Therapy',
    memberships: 'OTASA',
    clearance: 'Verified (2025)',
    serviceTitle: 'Pediatric OT Assessment & Therapy',
    ageGroups: ['5-7 years', '8-10 years', '11-13 years'],
    deliveryMode: 'In Person',
    province: 'Western Cape',
    city: 'Cape Town',
    serviceArea: 'Local',
    radius: '15',
    pricingModel: 'Hourly / Per package',
    startingPrice: 'R450/hr',
    availabilityDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    availabilityNotes: 'Mon-Fri 9am-5pm',
    contactName: 'Dr Sarah Khumalo',
    phone: '+27 21 555 9876',
    contactEmail: 'drsarah@therapy4learning.co.za',
    social: '@therapy4learning · www.therapy4learning.co.za',
    listingPlan: 'Professional Listing',
    publicDisplay: true,
    reviews: {
      average: 4.7,
      count: 18,
      items: [
        { reviewer: 'Thabo M.', rating: 4, text: 'Great occupational therapist, very good with children.' }
      ]
    }
  },
  creative: {
    name: 'Creative Arts Studio',
    email: 'hello@creativeartsstudio.co.za',
    accountType: 'Organization/Company',
    yearsExperience: '3-5 Years',
    languages: 'English, Afrikaans, isiXhosa',
    primaryCategory: 'Extracurricular Activities',
    tags: ['art', 'music', 'drama', 'creative expression'],
    bio: 'After-school arts program fostering creativity through painting, music, and drama.',
    certifications: 'Arts Education Certification',
    degrees: 'BA Fine Arts, Dip Music',
    memberships: 'SA Arts Education Association',
    clearance: 'Pending',
    serviceTitle: 'After-school Creative Arts Program',
    ageGroups: ['5-7 years', '8-10 years', '11-13 years'],
    deliveryMode: 'In Person',
    province: 'Gauteng',
    city: 'Pretoria',
    serviceArea: 'Local',
    radius: '10',
    pricingModel: 'Per term',
    startingPrice: 'R1200/term',
    availabilityDays: ['Mon', 'Tue', 'Wed', 'Thu'],
    availabilityNotes: 'Mon-Thu 14:00-17:00',
    contactName: 'Lisa van Wyk',
    phone: '+27 12 345 6789',
    contactEmail: 'lisa@creativeartsstudio.co.za',
    social: '@creativeartspta · www.creativeartsstudio.co.za',
    listingPlan: 'Free Listing',
    publicDisplay: true,
    reviews: {
      average: 3.5,
      count: 4,
      items: []
    }
  },
  bright: {
    name: 'Bright Minds Tutoring',
    email: 'hello@brightminds.co.za',
    accountType: 'Organization/Company',
    yearsExperience: '10+ Years',
    languages: 'English, Afrikaans, isiXhosa',
    primaryCategory: 'Tutor (Math & Science)',
    tags: ['mathematics', 'tutoring', 'grade 8-12'],
    bio: 'We offer specialised Maths & Science tutoring for grades 8–12 with a creative curriculum approach. Small groups & individual support. Based in Johannesburg but available nationwide online. Certified educators with 10+ years experience.',
    certifications: 'PGCE, TEFL, Maths Specialist',
    degrees: 'BSc Mathematics, MEd',
    memberships: 'SACE, SAALT, IEB Affiliate',
    clearance: 'Verified (2025)',
    serviceTitle: 'Math & Science Mentor (Gr 8-12)',
    ageGroups: ['14-18 years'],
    deliveryMode: 'Online & In-Person',
    province: 'Gauteng',
    city: 'Johannesburg',
    serviceArea: 'Local, National online',
    radius: '30',
    pricingModel: 'Hourly / Per package',
    startingPrice: 'R280/hr | R1500/5 sessions',
    availabilityDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    availabilityNotes: 'Mon–Fri 14:00-18:00, Sat 09:00-13:00',
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
    yearsExperience: '5-10 Years',
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
    availabilityNotes: 'Mon-Fri 9am-5pm, Sat by appt',
    contactName: 'Dr James Ndlovu',
    phone: '+27 21 555 4321',
    contactEmail: 'james@educonsultpro.co.za',
    social: '@educonsultpro · www.educonsultpro.co.za',
    listingPlan: 'Professional Listing',
    publicDisplay: true,
    reviews: {
      average: 4.9,
      count: 24,
      items: [
        { reviewer: 'Linda van Wyk', rating: 5, text: 'James helped us choose the perfect curriculum for our son.' }
      ]
    }
  }
};

// Enhanced modal function that shows ALL client details
function showProfileModal(providerKey) {
  const modal = document.getElementById('profileModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  
  const data = providerData[providerKey] || providerData.bright;
  
  modalTitle.textContent = `${data.name} - Complete Profile`;
  
  // Build comprehensive HTML with all fields
  modalBody.innerHTML = `
    <div style="border-bottom: 2px solid var(--accent-light); margin-bottom: 1rem; padding-bottom: 0.5rem;">
      <h3 style="color: var(--accent); font-size: 1.2rem;">Account Information</h3>
    </div>
    <div class="modal-field"><label>Full name / Business</label><div class="value">${data.name}</div></div>
    <div class="modal-field"><label>Email address</label><div class="value">${data.email}</div></div>
    <div class="modal-field"><label>Account type</label><div class="value">${data.accountType}</div></div>
    <div class="modal-field"><label>Years of Experience</label><div class="value">${data.yearsExperience}</div></div>
    <div class="modal-field"><label>Languages spoken</label><div class="value">${data.languages}</div></div>
    <div class="modal-field"><label>Primary category</label><div class="value">${data.primaryCategory}</div></div>
    
    <div style="border-bottom: 2px solid var(--accent-light); margin: 1rem 0 0.5rem; padding-bottom: 0.5rem;">
      <h3 style="color: var(--accent); font-size: 1.2rem;">Tags & Bio</h3>
    </div>
    <div class="modal-field"><label>Tags</label><div class="value">${data.tags.join(', ')}</div></div>
    <div class="modal-field"><label>Short bio</label><div class="value">${data.bio}</div></div>
    
    <div style="border-bottom: 2px solid var(--accent-light); margin: 1rem 0 0.5rem; padding-bottom: 0.5rem;">
      <h3 style="color: var(--accent); font-size: 1.2rem;">Qualifications & Experience</h3>
    </div>
    <div class="modal-field"><label>Certifications</label><div class="value">${data.certifications}</div></div>
    <div class="modal-field"><label>Degrees</label><div class="value">${data.degrees}</div></div>
    <div class="modal-field"><label>Professional memberships</label><div class="value">${data.memberships}</div></div>
    <div class="modal-field"><label>Background clearance</label><div class="value">${data.clearance}</div></div>
    
    <div style="border-bottom: 2px solid var(--accent-light); margin: 1rem 0 0.5rem; padding-bottom: 0.5rem;">
      <h3 style="color: var(--accent); font-size: 1.2rem;">Service Details</h3>
    </div>
    <div class="modal-field"><label>Service title</label><div class="value">${data.serviceTitle}</div></div>
    <div class="modal-field"><label>Age groups served</label><div class="value">${data.ageGroups.join(', ')}</div></div>
    <div class="modal-field"><label>Mode of delivery</label><div class="value">${data.deliveryMode}</div></div>
    
    <div style="border-bottom: 2px solid var(--accent-light); margin: 1rem 0 0.5rem; padding-bottom: 0.5rem;">
      <h3 style="color: var(--accent); font-size: 1.2rem;">Location & Reach</h3>
    </div>
    <div class="modal-field"><label>Province</label><div class="value">${data.province}</div></div>
    <div class="modal-field"><label>City / Town</label><div class="value">${data.city}</div></div>
    <div class="modal-field"><label>Service area</label><div class="value">${data.serviceArea}${data.radius ? ' (' + data.radius + ' km radius)' : ''}</div></div>
    
    <div style="border-bottom: 2px solid var(--accent-light); margin: 1rem 0 0.5rem; padding-bottom: 0.5rem;">
      <h3 style="color: var(--accent); font-size: 1.2rem;">Pricing & Availability</h3>
    </div>
    <div class="modal-field"><label>Pricing model</label><div class="value">${data.pricingModel}</div></div>
    <div class="modal-field"><label>Starting price</label><div class="value">${data.startingPrice}</div></div>
    <div class="modal-field"><label>Days available</label><div class="value">${data.availabilityDays.join(', ')}</div></div>
    <div class="modal-field"><label>Availability notes</label><div class="value">${data.availabilityNotes}</div></div>
    
    <div style="border-bottom: 2px solid var(--accent-light); margin: 1rem 0 0.5rem; padding-bottom: 0.5rem;">
      <h3 style="color: var(--accent); font-size: 1.2rem;">Contact & Online Presence</h3>
    </div>
    <div class="modal-field"><label>Primary contact</label><div class="value">${data.contactName}</div></div>
    <div class="modal-field"><label>Phone number</label><div class="value">${data.phone}</div></div>
    <div class="modal-field"><label>Contact email</label><div class="value">${data.contactEmail}</div></div>
    <div class="modal-field"><label>Social / website</label><div class="value">${data.social}</div></div>
    <div class="modal-field"><label>Public display</label><div class="value">${data.publicDisplay ? 'Enabled' : 'Disabled'}</div></div>
    <div class="modal-field"><label>Listing plan</label><div class="value">${data.listingPlan}</div></div>
    
    <div style="border-bottom: 2px solid var(--accent-light); margin: 1rem 0 0.5rem; padding-bottom: 0.5rem;">
      <h3 style="color: var(--accent); font-size: 1.2rem;">Reviews & Ratings</h3>
    </div>
    <div class="modal-field"><label>Average rating</label><div class="value">${data.reviews.average}/5 (${data.reviews.count} reviews)</div></div>
    ${data.reviews.items.map(review => `
      <div style="background: #f8fafc; padding: 0.8rem; border-radius: 12px; margin-bottom: 0.5rem;">
        <div style="display: flex; justify-content: space-between;">
          <strong>${review.reviewer}</strong>
          <span style="color: #f5b342;">${'★'.repeat(review.rating)}${review.rating < 5 ? '☆'.repeat(5-review.rating) : ''}</span>
        </div>
        <div style="font-size: 0.85rem; margin-top: 0.3rem;">"${review.text}"</div>
      </div>
    `).join('')}
  `;
  
  modal.style.display = 'block';
}

function closeModal() {
  document.getElementById('profileModal').style.display = 'none';
}

// ========== NOTIFICATION SYSTEM ==========

function showNotification(message, type = 'info') {
  // Check if notification container exists, create if not
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(container);
  }

  // Create notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-weight: 500;
    animation: slideIn 0.3s ease;
    cursor: pointer;
  `;
  notification.innerHTML = message;

  // Add to container
  container.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// ========== AUTHENTICATION & REDIRECTION ==========

// Handle login
function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('loginEmail')?.value;
  const password = document.getElementById('loginPassword')?.value;

  // Demo validation
  if (!email || !password) {
    showNotification('Please fill in all fields', 'error');
    return;
  }

  // Mock data for admin login
  if (email === 'admin@sahomeschooling.co.za' && password === 'admin123') {
    showNotification('Admin login successful! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = '../dashboards/admin-dashboard.html';
    }, 1500);
  } 
  // Mock data for client login - specific test email or any email with password length >= 8
  else if (email === 'contact@khanacademy.org.za' || (email && password.length >= 8)) {
    showNotification('Client login successful! Redirecting to dashboard...', 'success');
    setTimeout(() => {
      window.location.href = '../dashboards/client-dashboard.html';
    }, 1500);
  } else {
    showNotification('Invalid credentials. Use admin@sahomeschooling.co.za for admin or contact@khanacademy.org.za for client.', 'error');
  }
}

// Handle registration
function handleRegister(event) {
  event.preventDefault();

  const name = document.getElementById('regName')?.value;
  const email = document.getElementById('regEmail')?.value;
  const password = document.getElementById('regPass')?.value;
  const category = document.getElementById('regCat')?.value;
  const accountType = document.getElementById('regType')?.value;

  if (!name || !email || !password || !category || !accountType) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }

  // Store user data in localStorage (demo)
  const users = JSON.parse(localStorage.getItem('sah_users') || '[]');
  const newUser = {
    id: Date.now(),
    name,
    email,
    accountType,
    category,
    status: 'pending', // Default to pending
    registered: new Date().toISOString(),
    tier: 'free'
  };
  users.push(newUser);
  localStorage.setItem('sah_users', JSON.stringify(users));

  showNotification('Registration successful! Your account is pending approval.', 'success');
  setTimeout(() => {
    window.location.href = 'Login.html';
  }, 2000);
}

// ========== INITIALIZATION ==========

// Initialize based on current page
document.addEventListener('DOMContentLoaded', function() {
  const path = window.location.pathname;

  if (path.includes('client-dashboard')) {
    initClientDashboard();
  } else if (path.includes('admin-dashboard')) {
    // Set first tab active
    const firstTab = document.querySelector('.tab-pane');
    if (firstTab) firstTab.classList.add('active');
  }

  // Close modal when clicking outside
  window.onclick = function(event) {
    const modal = document.getElementById('profileModal');
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };
});

// Export functions for global use
window.toggleEditMode = toggleEditMode;
window.addNewTag = addNewTag;
window.removeTag = removeTag;
window.saveChanges = saveChanges;
window.cancelEdit = cancelEdit;
window.handlePhotoUpload = handlePhotoUpload;
window.switchTab = switchTab;
window.handleStatusChange = handleStatusChange;
window.toggleOverride = toggleOverride;
window.selectBadge = selectBadge;
window.promoteListing = promoteListing;
window.demoteListing = demoteListing;
window.removeFeatured = removeFeatured;
window.assignFeatured = assignFeatured;
window.updateCategoryLimit = updateCategoryLimit;
window.moderateReview = moderateReview;
window.showProfileModal = showProfileModal;
window.closeModal = closeModal;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;