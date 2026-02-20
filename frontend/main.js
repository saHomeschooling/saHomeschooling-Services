document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('onboardingForm');
  if (!form) return;

  const steps = document.querySelectorAll('.form-step');
  const progressSteps = document.querySelectorAll('.step');

  let current = 1;

  function showStep(n) {
    steps.forEach(s => s.classList.remove('active'));
    progressSteps.forEach(p => p.classList.remove('active'));
    document.querySelector(`.form-step[data-step="${n}"]`).classList.add('active');
    document.querySelector(`.step[data-step="${n}"]`).classList.add('active');
  }

  document.querySelectorAll('.next-step').forEach(btn => {
    btn.addEventListener('click', () => {
      if (current < steps.length) {
        current++;
        showStep(current);
      }
    });
  });

  document.querySelectorAll('.prev-step').forEach(btn => {
    btn.addEventListener('click', () => {
      if (current > 1) {
        current--;
        showStep(current);
      }
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    localStorage.setItem('providerDraft', JSON.stringify(data));
    alert('Profile saved to localStorage! (In real version → send to server)');
    // Later: fetch('/api/providers', { method: 'POST', body: JSON.stringify(data) })
  });

  // Load draft if exists
  const draft = localStorage.getItem('providerDraft');
  if (draft) {
    console.log('Loaded draft:', JSON.parse(draft));
    // Optionally pre-fill form
  }
});