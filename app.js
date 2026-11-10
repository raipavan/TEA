/* CUP2EAT — interactions */
document.documentElement.classList.add('js');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const WA_NUMBER = '919818192575';
const CUPS_PER_BOX = 396;
const PRICE_PER_BOX = 3999;
const MIN_BOXES = 1;
const MAX_BOXES = 50;

const inr = new Intl.NumberFormat('en-IN');
const rupees = n => '₹' + inr.format(n);

/* ---------- toast ---------- */
const toast = document.getElementById('toast');
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

/* ---------- header ---------- */
const header = document.getElementById('site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- mobile nav ---------- */
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
function setMenu(open) {
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  navMenu.classList.toggle('open', open);
}
navToggle.addEventListener('click', () => setMenu(navToggle.getAttribute('aria-expanded') !== 'true'));
navMenu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

/* ---------- active nav link ---------- */
const navLinks = [...document.querySelectorAll('.nav-link')];
const sectionIds = navLinks.map(a => a.getAttribute('href')).filter(h => h.startsWith('#'));
const sections = sectionIds.map(id => document.querySelector(id)).filter(Boolean);
const activeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
  });
}, { rootMargin: '-35% 0px -55% 0px' });
sections.forEach(s => activeObserver.observe(s));

/* ---------- reveal on scroll ---------- */
const revealObserver = new IntersectionObserver(entries => {
  const batch = entries.filter(e => e.isIntersecting);
  batch.forEach((entry, i) => {
    entry.target.style.transitionDelay = reducedMotion ? '0ms' : `${i * 80}ms`;
    entry.target.classList.add('revealed');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

/* ---------- count-up stats ---------- */
const countObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    countObserver.unobserve(el);
    const target = Number(el.dataset.count);
    if (reducedMotion || target === 0) { el.textContent = inr.format(target); return; }
    const duration = 1300;
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = inr.format(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

/* ---------- order builder ---------- */
const slider = document.getElementById('box-slider');
const boxCount = document.getElementById('box-count');
const minusBtn = document.getElementById('box-minus');
const plusBtn = document.getElementById('box-plus');
const calcCups = document.getElementById('calc-cups');
const calcTotal = document.getElementById('calc-total');
const calcPercup = document.getElementById('calc-percup');
const bizName = document.getElementById('biz-name');
const waOrder = document.getElementById('wa-order');
let boxes = 1;

const currentFlavour = () => document.querySelector('input[name="flavour"]:checked').value;

function waLink(message) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

function updateBuilder() {
  const cups = boxes * CUPS_PER_BOX;
  const total = boxes * PRICE_PER_BOX;
  boxCount.value = boxes;
  slider.value = boxes;
  minusBtn.disabled = boxes <= MIN_BOXES;
  plusBtn.disabled = boxes >= MAX_BOXES;
  calcCups.textContent = inr.format(cups);
  calcTotal.textContent = rupees(total);
  calcPercup.textContent = '₹' + (PRICE_PER_BOX / CUPS_PER_BOX).toFixed(2);
  const pct = ((boxes - MIN_BOXES) / (MAX_BOXES - MIN_BOXES)) * 100;
  slider.style.background = `linear-gradient(90deg, #c77f1f ${pct}%, #e4d5bc ${pct}%)`;

  const biz = bizName.value.trim();
  const message =
    `Hi Cup2Eat! I'd like to place a wholesale order.\n\n` +
    `Boxes: ${boxes} × ${CUPS_PER_BOX} cups\n` +
    `Total cups: ${inr.format(cups)}\n` +
    `Flavour: ${currentFlavour()}\n` +
    `Total: ${rupees(total)} (delivery included)\n` +
    (biz ? `Business: ${biz}\n` : '') +
    `\nPlease confirm availability and dispatch details.`;
  waOrder.href = waLink(message);
}

function setBoxes(n) {
  boxes = Math.min(MAX_BOXES, Math.max(MIN_BOXES, n));
  updateBuilder();
}

slider.addEventListener('input', () => setBoxes(Number(slider.value)));
minusBtn.addEventListener('click', () => setBoxes(boxes - 1));
plusBtn.addEventListener('click', () => setBoxes(boxes + 1));
document.querySelectorAll('input[name="flavour"]').forEach(r => r.addEventListener('change', updateBuilder));
bizName.addEventListener('input', updateBuilder);
document.getElementById('order-builder').addEventListener('submit', e => e.preventDefault());
updateBuilder();

/* generic WhatsApp links */
const genericMessage = 'Hi Cup2Eat! I\'d like to order the ₹3,999 wholesale box (396 edible cups). Please share availability and delivery details.';
['hero-wa', 'cta-wa', 'footer-wa'].forEach(id => {
  const el = document.getElementById(id);
  el.href = waLink(genericMessage);
  el.target = '_blank';
  el.rel = 'noopener';
});

/* flavour cards → builder */
document.querySelectorAll('[data-flavour]').forEach(btn => {
  btn.addEventListener('click', () => {
    const flavour = btn.dataset.flavour;
    const radio = document.querySelector(`input[name="flavour"][value="${flavour}"]`);
    radio.checked = true;
    updateBuilder();
    showToast(`${flavour} selected — set your box count below.`);
    document.getElementById('wholesale').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  });
});

/* ---------- FAQ accordion ---------- */
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-q');
  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(other => {
      other.classList.remove('open');
      other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });
    item.classList.toggle('open', !isOpen);
    btn.setAttribute('aria-expanded', String(!isOpen));
  });
});

/* ---------- poster lightbox ---------- */
const modal = document.getElementById('poster-modal');
const posterOpen = document.getElementById('poster-open');
const posterClose = document.getElementById('poster-close');
let lastFocus = null;

function openModal() {
  lastFocus = document.activeElement;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  posterClose.focus();
}
function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = '';
  if (lastFocus) lastFocus.focus();
}
posterOpen.addEventListener('click', openModal);
posterClose.addEventListener('click', closeModal);
modal.querySelector('[data-close]').addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

/* ---------- footer year ---------- */
document.getElementById('year').textContent = new Date().getFullYear();