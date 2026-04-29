/**
 * Main script for CryptoShalix portfolio interactions.
 * Loaded with defer in the page, so DOMContentLoaded is safe.
 */

const TELEGRAM_API_TOKEN = '5807116207:AAHAUD7P10-InYaWn_X4O3-Pdo6MsY5crq4';
const TELEGRAM_CHAT_ID = '@BitAkashicoContact';
const SITE_NAME = 'CryptoShalix Portfolio';

window.addEventListener('DOMContentLoaded', initApp);

/**
 * Application entry point.
 * Initialize navigation, scroll reveals, section tracking and form handling.
 */
function initApp() {
  initNavigation();
  initRevealOnScroll();
  initActiveSectionObserver();
  initContactForm();
}

/**
 * Configure header behavior and mobile menu closing.
 */
function initNavigation() {
  const navbar = document.getElementById('navbar');
  const nav = document.querySelector('nav');
  const checkbox = document.querySelector('.nav-toggle-checkbox');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }

    if (checkbox) {
      checkbox.checked = false;
    }
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (checkbox) {
        checkbox.checked = false;
      }
    });
  });

  document.addEventListener('click', event => {
    if (!nav || !checkbox) {
      return;
    }

    if (!nav.contains(event.target)) {
      checkbox.checked = false;
    }
  });
}

/**
 * Reveal elements when they enter the viewport.
 */
function initRevealOnScroll() {
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealElements.forEach(element => revealObserver.observe(element));
}

/**
 * Highlight the active navigation link based on the visible section.
 */
function initActiveSectionObserver() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        return;
      }

      navLinks.forEach(link => {
        const isActive = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('active', isActive);
      });
    });
  }, { threshold: 0.4 });

  sections.forEach(section => sectionObserver.observe(section));
}

/**
 * Initialize contact form submission handler.
 */
function initContactForm() {
  const form = document.querySelector('#contact-form');
  if (!form) { return; }
  form.addEventListener('submit', handleContactSubmit);
}

/**
 * Handle contact form submission and send data to Telegram.
 */
async function handleContactSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const nickname = form.querySelector('#nickname');
  const email = form.querySelector('#email');
  const phone = form.querySelector('#phone');
  const message = form.querySelector('#message');

  /* if (!nickname || !email || !message) {
    showFormNotice('Revisa los campos marcados como obligatorios y vuelve a intentarlo.', 'error');
    return;
  } */

  const requiredFields = [nickname, email, message];
  const formIsValid = validateField(requiredFields, form);

  if (!formIsValid) {
    showFormNotice('Revisa los campos marcados y vuelve a intentarlo.', 'error');
    return;
  }

  const payload = {
    nickname: nickname.value.trim(),
    email: email.value.trim(),
    phone: phone ? phone.value.trim() : '',
    message: message.value.trim()
  };

  const result = await sendMessageToTelegram(payload);
  if (result.success) {
    showFormNotice('¡Gracias! Tu mensaje ha sido enviado correctamente.', 'success');
    form.reset();
  } else {
    showFormNotice(result.error || 'No se pudo enviar tu mensaje. Por favor, inténtalo de nuevo.', 'error');
  }
}

/**
 * Validate a single field and display the inline error message.
 */
function validateField(requiredFields, form) {
  let isFormValid = true;
  requiredFields.forEach(field => {
    const errorElement = form.querySelector(`#error-${field.id}`);
    const isValid = field.checkValidity();

    if (!errorElement) {
      isFormValid = isFormValid && isValid;
      return;
    }

    if (!isValid) {
      errorElement.textContent = 'Por favor, completa este campo correctamente.';
      errorElement.classList.remove('hidden');
      isFormValid = false;
    } else {
      errorElement.textContent = '';
      errorElement.classList.add('hidden');
    }
  });
  return isFormValid;
}

/**
 * Send the contact message to Telegram via bot API.
 */
async function sendMessageToTelegram({ nickname, email, phone, message }) {
  if (!TELEGRAM_API_TOKEN || !TELEGRAM_CHAT_ID) {
    return { success: false, error: 'Telegram credentials are missing.' };
  }

  const cleanedMessage = message
    .replace(/<[^>]*>/g, '')
    .replace(/(\r\n)|([\r\n])/g, '\n')
    .trim();

  const text = [
    `*NUEVO MENSAJE DESDE ${SITE_NAME}*`,
    '',
    `👤 *Nombre:* ${nickname}`,
    `✉️ *Email:* ${email}`,
    `📞 *Teléfono:* ${phone || 'No especificado'}`,
    '',
    `📝 *Mensaje:*`,
    cleanedMessage
  ].join('\n');

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_API_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'Markdown'
      })
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      return { success: false, error: data.description || 'Telegram API error.' };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Show a form notification message and hide it after timeout.
 */
function showFormNotice(message, type) {
  const notice = document.querySelector('#form-notice');
  if (!notice) {
    return;
  }

  notice.textContent = message;
  notice.classList.remove('hidden', 'success', 'error');
  notice.classList.add(type);

  window.clearTimeout(notice.dismissTimeout);
  notice.dismissTimeout = window.setTimeout(() => {
    notice.classList.add('hidden');
  }, 10000);
}
