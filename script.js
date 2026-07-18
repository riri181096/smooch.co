document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const API_BASE = 'https://smooch-co.onrender.com';

contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!contactForm.checkValidity()) {
    formStatus.textContent = 'Please fill in all required fields.';
    return;
  }

  const submitButton = contactForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  formStatus.textContent = 'Sending…';

  const payload = {
    name: contactForm.name.value.trim(),
    email: contactForm.email.value.trim(),
    company: contactForm.company.value.trim(),
    message: contactForm.message.value.trim(),
  };

  try {
    const response = await fetch(`${API_BASE}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || 'Something went wrong.');
    }

    formStatus.textContent = 'Thanks — we received your request and will follow up within one business day.';
    contactForm.reset();
  } catch (err) {
    formStatus.textContent = `Could not send your request: ${err.message}`;
  } finally {
    submitButton.disabled = false;
  }
});
