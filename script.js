// ===== Theme toggle =====
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');
const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

if (savedTheme) {
  root.setAttribute('data-theme', savedTheme);
} else if (prefersLight) {
  root.setAttribute('data-theme', 'light');
}

themeToggle.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// ===== Nav scroll state =====
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ===== Mobile menu =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// ===== Typewriter =====
const roles = ['retrieval-grounded AI systems', 'full-stack web platforms', 'agentic RAG assistants', 'things people actually use'];
const typewriterEl = document.getElementById('typewriter');
let roleIndex = 0, charIndex = 0, deleting = false;

function typeLoop() {
  const current = roles[roleIndex];
  if (!deleting) {
    charIndex++;
    typewriterEl.textContent = current.slice(0, charIndex);
    if (charIndex === current.length) {
      deleting = true;
      setTimeout(typeLoop, 1600);
      return;
    }
  } else {
    charIndex--;
    typewriterEl.textContent = current.slice(0, charIndex);
    if (charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  }
  setTimeout(typeLoop, deleting ? 35 : 55);
}
typeLoop();

// ===== Scroll-generation effect =====
// Reveal blocks fade/slide up with a scan-line sweep, staggered per group,
// and re-trigger every time they enter the viewport (either scroll direction)
// so the page keeps "generating" itself as you move up and down.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function groupAndStagger(selector, container) {
  document.querySelectorAll(container).forEach(group => {
    const items = group.querySelectorAll(selector);
    items.forEach((el, i) => el.style.setProperty('--d', `${i * 70}ms`));
  });
}
// Stagger siblings within their natural groups
groupAndStagger('.skill-group', '.skills-grid');
groupAndStagger('.cert-card', '.certs-grid');
groupAndStagger('.stat', '.about-stats');
groupAndStagger('.timeline-item', '.timeline');

const revealBlocks = document.querySelectorAll('.reveal-block');
const blockObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    entry.target.classList.toggle('in-view', entry.isIntersecting);
  });
}, { threshold: 0.15 });
revealBlocks.forEach(el => blockObserver.observe(el));

// Section titles "type" themselves out character by character on scroll
document.querySelectorAll('.section-title').forEach(title => {
  const text = title.textContent;
  title.textContent = '';
  title.setAttribute('aria-label', text);
  [...text].forEach((char, i) => {
    const span = document.createElement('span');
    span.className = 'ch';
    span.style.setProperty('--i', i);
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.setAttribute('aria-hidden', 'true');
    title.appendChild(span);
  });
  const cursor = document.createElement('span');
  cursor.className = 'type-cursor';
  cursor.textContent = '|';
  cursor.setAttribute('aria-hidden', 'true');
  title.appendChild(cursor);

  let cursorTimer;
  const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        title.classList.add('in-view');
        clearTimeout(cursorTimer);
        const totalDelay = text.length * 14 + 200;
        cursor.classList.remove('show');
        void cursor.offsetWidth; // restart animation
        cursorTimer = setTimeout(() => cursor.classList.add('show'), totalDelay);
        cursorTimer = setTimeout(() => cursor.classList.remove('show'), totalDelay + 1400);
      } else {
        title.classList.remove('in-view');
        cursor.classList.remove('show');
        clearTimeout(cursorTimer);
      }
    });
  }, { threshold: 0.3 });
  titleObserver.observe(title);
});

if (reduceMotion) {
  document.querySelectorAll('.reveal-block, .section-title').forEach(el => el.classList.add('in-view'));
}

// ===== Footer year =====
document.getElementById('year').textContent = new Date().getFullYear();
