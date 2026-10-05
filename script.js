const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const header = document.querySelector('.site-header');
const navLinks = [...siteNav.querySelectorAll('a')];
const sections = navLinks.map((link) => document.querySelector(link.getAttribute('href')));

function setMenuOpen(isOpen) {
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? '关闭导航菜单' : '打开导航菜单');
  siteNav.classList.toggle('is-open', isOpen);
}

menuToggle.addEventListener('click', () => {
  setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
});

navLinks.forEach((link) => link.addEventListener('click', () => setMenuOpen(false)));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    setMenuOpen(false);
    menuToggle.focus();
  }
});

document.addEventListener('click', (event) => {
  if (!header.contains(event.target)) setMenuOpen(false);
});

let scrollScheduled = false;
function updateScrollState() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  header.style.setProperty('--scroll-progress', Math.min(1, Math.max(0, progress)));

  const activeIndex = sections.reduce((current, section, index) => {
    return section && section.getBoundingClientRect().top <= window.innerHeight * 0.35 ? index : current;
  }, -1);

  navLinks.forEach((link, index) => {
    if (index === activeIndex) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scrollScheduled = false;
}

window.addEventListener('scroll', () => {
  if (scrollScheduled) return;
  scrollScheduled = true;
  requestAnimationFrame(updateScrollState);
}, { passive: true });
window.addEventListener('resize', updateScrollState);
updateScrollState();

if (window.IntersectionObserver && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const targets = document.querySelectorAll('.section-side, .section h2, .section-intro, .about-copy > p, .focus-list li, .section-heading > p, .project-row, .detail-layout > .lead, .detail-list > div, .contact-copy, .contact-links');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });

  targets.forEach((target, index) => {
    target.classList.add('reveal');
    target.style.setProperty('--reveal-delay', `${index % 3 * 70}ms`);
    observer.observe(target);
  });
  document.documentElement.classList.add('motion-ready');

  // Prevent a direct section link from leaving content hidden before its observer fires.
  window.setTimeout(() => {
    targets.forEach((target) => target.classList.add('is-visible'));
  }, 1200);
}

document.getElementById('year').textContent = new Date().getFullYear();
