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

const NETHER_TIPS = [
  'Tip: Portals connect two worlds.',
  'Tip: Obsidian forms where lava meets water.',
  'Tip: Watch your step near the lava.',
  'Tip: Ghasts lurk in the haze.'
];
const OVERWORLD_TIPS = [
  'Tip: The sun rises in the east.',
  'Tip: Grass grows where light reaches.',
  'Tip: Villagers trade for emeralds.',
  'Tip: Sheep regrow their wool over time.'
];

const NETHER_STAGES = ['entering the nether...', 'building terrain...', 'loading terrain...', 'simulating world for a bit...'];
const OVERWORLD_STAGES = ['returning to the overworld...', 'building terrain...', 'loading terrain...', 'preparing spawn area...'];

let loaderRunning = false;

// Eases fast at first, then stalls near the end before snapping to 100 —
// mirrors the way Minecraft's own world-load bar hangs just before it's done.
function terrainEase(t) {
  if (t < 0.7) return (t / 0.7) * 0.85; // 0 -> 85% over the first 70% of the time
  const tail = (t - 0.7) / 0.3; // remaining 30% of time crawls the last 15%
  return 0.85 + Math.pow(tail, 3) * 0.15;
}

themeToggle.addEventListener('click', () => {
  if (loaderRunning) return;

  const current = root.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  const reduceMotionNow = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotionNow) {
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    return;
  }

  const DURATION = 5000; // slow, deliberate — like a real Minecraft world load

  const loader = document.getElementById('terrainLoader');
  const loaderLabel = document.getElementById('loaderLabel');
  const loaderFill = document.getElementById('loaderFill');
  const loaderPct = document.getElementById('loaderPct');
  const loaderTip = document.getElementById('loaderTip');

  const tips = next === 'dark' ? NETHER_TIPS : OVERWORLD_TIPS;
  const stages = next === 'dark' ? NETHER_STAGES : OVERWORLD_STAGES;
  loaderLabel.textContent = stages[0];
  loaderTip.textContent = tips[Math.floor(Math.random() * tips.length)];

  loaderRunning = true;
  loaderFill.classList.remove('filling');
  loaderPct.textContent = '0%';
  void loaderFill.offsetWidth; // reset the fill before replaying
  loader.classList.add('active');

  requestAnimationFrame(() => loaderFill.classList.add('filling'));

  // Cycle through stage labels at uneven intervals, like the real loading screen
  const stageTimers = [
    setTimeout(() => { loaderLabel.textContent = stages[1]; }, DURATION * 0.15),
    setTimeout(() => { loaderLabel.textContent = stages[2]; }, DURATION * 0.5),
    setTimeout(() => { loaderLabel.textContent = stages[3]; }, DURATION * 0.8)
  ];

  // Drive the percentage readout with a stall-then-snap curve across the full duration
  const startTime = performance.now();
  function tickPct(now) {
    const t = Math.min(1, (now - startTime) / DURATION);
    const pct = Math.round(terrainEase(t) * 100);
    loaderPct.textContent = pct + '%';
    if (t < 1 && loaderRunning) {
      requestAnimationFrame(tickPct);
    }
  }
  requestAnimationFrame(tickPct);

  // Swap the actual theme underneath partway through, once the screen is fully opaque
  setTimeout(() => {
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  }, DURATION * 0.5);

  // Hold the loader for the full duration before revealing the new world
  setTimeout(() => {
    loader.classList.remove('active');
    loaderRunning = false;
    stageTimers.forEach(clearTimeout);
  }, DURATION);
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
}, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
revealBlocks.forEach(el => blockObserver.observe(el));

// Section titles "type" themselves out character by character on scroll,
// and reset every time they leave the viewport so they retype on the way back.
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

  let showTimer, hideTimer;
  const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      cursor.classList.remove('show');
      if (entry.isIntersecting) {
        title.classList.remove('in-view');
        void title.offsetWidth; // force reflow so the animation restarts every time
        title.classList.add('in-view');
        const totalDelay = text.length * 14 + 200;
        showTimer = setTimeout(() => cursor.classList.add('show'), totalDelay);
        hideTimer = setTimeout(() => cursor.classList.remove('show'), totalDelay + 1400);
      } else {
        title.classList.remove('in-view');
      }
    });
  }, { threshold: 0.3, rootMargin: '0px 0px -5% 0px' });
  titleObserver.observe(title);
});

if (reduceMotion) {
  document.querySelectorAll('.reveal-block, .section-title').forEach(el => el.classList.add('in-view'));
}

// ===== Footer year =====
document.getElementById('year').textContent = new Date().getFullYear();
