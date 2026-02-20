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

// Modal functions
function showProfileModal(provider) {
  const modal = document.getElementById('profileModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  // Set content based on provider
  const profiles = {
    khan: {
      title: 'Khan Academy SA - Profile',
      content: `
        <div class="modal-field"><label>Full name / Business</label><div class="value">Khan Academy SA</div></div>
        <div class="modal-field"><label>Email address</label><div class="value">contact@khanacademy.org.za</div></div>
        <div class="modal-field"><label>Account type</label><div class="value">Organization/Company</div></div>
        <div class="modal-field"><label>Years of Experience</label><div class="value">10+ Years</div></div>
        <div class="modal-field"><label>Languages spoken</label><div class="value">English, Afrikaans, isiZulu</div></div>
        <div class="modal-field"><label>Primary category</label><div class="value">Curriculum Provider</div></div>
        <div class="modal-field"><label>Tags</label><div class="value">mathematics, science, online learning</div></div>
        <div class="modal-field"><label>Short bio</label><div class="value">Free world-class education for anyone anywhere.</div></div>
        <div class="modal-field"><label>Service title</label><div class="value">Math & Science Curriculum (Gr R-12)</div></div>
        <div class="modal-field"><label>Age group served</label><div class="value">5-18 years</div></div>
        <div class="modal-field"><label>Mode of delivery</label><div class="value">Online</div></div>
        <div class="modal-field"><label>Province / City</label><div class="value">Gauteng, Johannesburg</div></div>
        <div class="modal-field"><label>Service area</label><div class="value">National, Online only</div></div>
        <div class="modal-field"><label>Pricing model</label><div class="value">Free / Custom quote</div></div>
        <div class="modal-field"><label>Starting price</label><div class="value">Free</div></div>
        <div class="modal-field"><label>Availability</label><div class="value">24/7 Online</div></div>
        <div class="modal-field"><label>Primary contact</label><div class="value">Support Team · support@khanacademy.org.za</div></div>
        <div class="modal-field"><label>Listing plan</label><div class="value">Free Listing</div></div>
      `
    },
    therapy: {
      title: 'Therapy4Learning - Profile',
      content: `
        <div class="modal-field"><label>Full name / Business</label><div class="value">Therapy4Learning</div></div>
        <div class="modal-field"><label>Email address</label><div class="value">info@therapy4learning.co.za</div></div>
        <div class="modal-field"><label>Account type</label><div class="value">Individual Provider</div></div>
        <div class="modal-field"><label>Years of Experience</label><div class="value">5-10 Years</div></div>
        <div class="modal-field"><label>Languages spoken</label><div class="value">English, Afrikaans</div></div>
        <div class="modal-field"><label>Primary category</label><div class="value">Therapist</div></div>
        <div class="modal-field"><label>Tags</label><div class="value">occupational therapy, sensory integration</div></div>
        <div class="modal-field"><label>Short bio</label><div class="value">Pediatric occupational therapy services for children with learning difficulties.</div></div>
        <div class="modal-field"><label>Service title</label><div class="value">Pediatric OT Assessment & Therapy</div></div>
        <div class="modal-field"><label>Age group served</label><div class="value">5-13 years</div></div>
        <div class="modal-field"><label>Mode of delivery</label><div class="value">In Person</div></div>
        <div class="modal-field"><label>Province / City</label><div class="value">Western Cape, Cape Town</div></div>
        <div class="modal-field"><label>Service area</label><div class="value">Local (15km radius)</div></div>
        <div class="modal-field"><label>Pricing model</label><div class="value">Hourly / Per package</div></div>
        <div class="modal-field"><label>Starting price</label><div class="value">R450/hr</div></div>
        <div class="modal-field"><label>Availability</label><div class="value">Mon-Fri 9am-5pm</div></div>
        <div class="modal-field"><label>Primary contact</label><div class="value">Dr Sarah Khumalo · +27 21 555 9876</div></div>
        <div class="modal-field"><label>Listing plan</label><div class="value">Professional Listing</div></div>
      `
    },
    creative: {
      title: 'Creative Arts Studio - Profile',
      content: `
        <div class="modal-field"><label>Full name / Business</label><div class="value">Creative Arts Studio</div></div>
        <div class="modal-field"><label>Email address</label><div class="value">hello@creativeartsstudio.co.za</div></div>
        <div class="modal-field"><label>Account type</label><div class="value">Organization/Company</div></div>
        <div class="modal-field"><label>Years of Experience</label><div class="value">3-5 Years</div></div>
        <div class="modal-field"><label>Languages spoken</label><div class="value">English, Afrikaans, isiXhosa</div></div>
        <div class="modal-field"><label>Primary category</label><div class="value">Extracurricular Activities</div></div>
        <div class="modal-field"><label>Tags</label><div class="value">art, music, drama, creative expression</div></div>
        <div class="modal-field"><label>Short bio</label><div class="value">After-school arts program fostering creativity through painting, music, and drama.</div></div>
        <div class="modal-field"><label>Service title</label><div class="value">After-school Creative Arts Program</div></div>
        <div class="modal-field"><label>Age group served</label><div class="value">5-13 years</div></div>
        <div class="modal-field"><label>Mode of delivery</label><div class="value">In Person</div></div>
        <div class="modal-field"><label>Province / City</label><div class="value">Gauteng, Pretoria</div></div>
        <div class="modal-field"><label>Service area</label><div class="value">Local (10km radius)</div></div>
        <div class="modal-field"><label>Pricing model</label><div class="value">Per term</div></div>
        <div class="modal-field"><label>Starting price</label><div class="value">R1200/term</div></div>
        <div class="modal-field"><label>Availability</label><div class="value">Mon-Thu 14:00-17:00</div></div>
        <div class="modal-field"><label>Primary contact</label><div class="value">Lisa van Wyk · +27 12 345 6789</div></div>
        <div class="modal-field"><label>Listing plan</label><div class="value">Free Listing</div></div>
      `
    },
    bright: {
      title: 'Bright Minds Tutoring - Profile',
      content: `
        <div class="modal-field"><label>Full name / Business</label><div class="value">Bright Minds Tutoring</div></div>
        <div class="modal-field"><label>Email address</label><div class="value">hello@brightminds.co.za</div></div>
        <div class="modal-field"><label>Account type</label><div class="value">Organization/Company</div></div>
        <div class="modal-field"><label>Years of Experience</label><div class="value">10+ Years</div></div>
        <div class="modal-field"><label>Languages spoken</label><div class="value">English, Afrikaans, isiXhosa</div></div>
        <div class="modal-field"><label>Primary category</label><div class="value">Tutor (Math & Science)</div></div>
        <div class="modal-field"><label>Tags</label><div class="value">mathematics, tutoring, grade 8-12</div></div>
        <div class="modal-field"><label>Short bio</label><div class="value">Specialised Maths & Science tutoring for grades 8–12 with a creative curriculum approach.</div></div>
        <div class="modal-field"><label>Certifications</label><div class="value">PGCE, TEFL, Maths Specialist</div></div>
        <div class="modal-field"><label>Degrees</label><div class="value">BSc Mathematics, MEd</div></div>
        <div class="modal-field"><label>Service title</label><div class="value">Math & Science Mentor (Gr 8-12)</div></div>
        <div class="modal-field"><label>Age group served</label><div class="value">14-18 years</div></div>
        <div class="modal-field"><label>Mode of delivery</label><div class="value">Online & In-Person</div></div>
        <div class="modal-field"><label>Province / City</label><div class="value">Gauteng, Johannesburg</div></div>
        <div class="modal-field"><label>Service area</label><div class="value">Local (30km radius), National online</div></div>
        <div class="modal-field"><label>Pricing model</label><div class="value">Hourly / Per package</div></div>
        <div class="modal-field"><label>Starting price</label><div class="value">R280/hr | R1500/5 sessions</div></div>
        <div class="modal-field"><label>Availability</label><div class="value">Mon–Fri 14:00-18:00, Sat 09:00-13:00</div></div>
        <div class="modal-field"><label>Primary contact</label><div class="value">Maria van der Merwe · +27 82 555 1234</div></div>
        <div class="modal-field"><label>Listing plan</label><div class="value">Professional Listing (paid)</div></div>
      `
    },
    edu: {
      title: 'EduConsult Pro - Profile',
      content: `
        <div class="modal-field"><label>Full name / Business</label><div class="value">EduConsult Pro</div></div>
        <div class="modal-field"><label>Email address</label><div class="value">info@educonsultpro.co.za</div></div>
        <div class="modal-field"><label>Account type</label><div class="value">Individual Provider</div></div>
        <div class="modal-field"><label>Years of Experience</label><div class="value">5-10 Years</div></div>
        <div class="modal-field"><label>Languages spoken</label><div class="value">English, Afrikaans</div></div>
        <div class="modal-field"><label>Primary category</label><div class="value">Educational Consultant</div></div>
        <div class="modal-field"><label>Tags</label><div class="value">curriculum advice, school placement</div></div>
        <div class="modal-field"><label>Short bio</label><div class="value">Independent educational consultancy helping families choose the right curriculum and schools.</div></div>
        <div class="modal-field"><label>Service title</label><div class="value">Homeschool Curriculum Consulting</div></div>
        <div class="modal-field"><label>Age group served</label><div class="value">All ages</div></div>
        <div class="modal-field"><label>Mode of delivery</label><div class="value">Online, In Person</div></div>
        <div class="modal-field"><label>Province / City</label><div class="value">Western Cape, Cape Town</div></div>
        <div class="modal-field"><label>Service area</label><div class="value">National</div></div>
        <div class="modal-field"><label>Pricing model</label><div class="value">Hourly, Per package</div></div>
        <div class="modal-field"><label>Starting price</label><div class="value">R500/hr</div></div>
        <div class="modal-field"><label>Availability</label><div class="value">Mon-Fri 9am-5pm, Sat by appt</div></div>
        <div class="modal-field"><label>Primary contact</label><div class="value">Dr James Ndlovu · +27 21 555 4321</div></div>
        <div class="modal-field"><label>Listing plan</label><div class="value">Professional Listing</div></div>
      `
    }
  };

  const profile = profiles[provider] || profiles.bright;
  modalTitle.textContent = profile.title;
  modalBody.innerHTML = profile.content;

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

  // Demo credentials
  if (email === 'admin@sahomeschooling.co.za' && password === 'admin123') {
    showNotification('Admin login successful! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = '../dashboards/admin-dashboard.html';
    }, 1500);
  } else if (email && password.length >= 8) {
    showNotification('Login successful! Redirecting to dashboard...', 'success');
    setTimeout(() => {
      window.location.href = '../dashboards/client-dashboard.html';
    }, 1500);
  } else {
    showNotification('Invalid credentials', 'error');
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