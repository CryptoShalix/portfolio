function init() {
  initNavigation();
  initRevealOnScroll();
  initActiveSectionObserver();
  updateDynamicDates();
}

function initNavigation() {
  const navbar = document.querySelector('#navbar');
  const checkbox = navbar?.querySelector('#nav-toggle-checkbox');
  const navLinks = navbar?.querySelectorAll('.nav-links a') ?? [];

  if (!navbar) return;

  const updateNavbar = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };

  updateNavbar();
  window.addEventListener('scroll', updateNavbar, { passive: true });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (checkbox) checkbox.checked = false;
    });
  });

  document.addEventListener('click', event => {
    if (checkbox && !navbar.contains(event.target)) {
      checkbox.checked = false;
    }
  });
}

function initRevealOnScroll() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  if (!('IntersectionObserver' in window)) {
    elements.forEach(element => element.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('visible');
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  elements.forEach(element => observer.observe(element));
}

function initActiveSectionObserver() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  if (!sections.length || !navLinks.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      navLinks.forEach(link => {
        const isActive = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('active', isActive);
      });
    });
  }, { threshold: 0.4 });

  sections.forEach(section => observer.observe(section));
}

function updateDynamicDates() {
  const year = new Date().getFullYear();
  const yearElement = document.querySelector('#current-year');
  if (yearElement) yearElement.textContent = year;

  document.querySelectorAll('[data-start-year]').forEach(element => {
    const startYear = Number(element.dataset.startYear);
    if (Number.isInteger(startYear) && startYear > 0 && startYear <= year) {
      element.textContent = `+${year - startYear}`;
    }
  });
}

init();
