/* Sunshine — shared interactions */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Page curtain transitions */
function initPageTransitions() {
  const curtain = document.querySelector('.page-curtain');
  if (!curtain) return;
  // reveal on load
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      curtain.classList.add('hide');
      document.body.classList.remove('loading');
    });
  });
  // intercept internal links
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return;
    if (url.pathname === window.location.pathname && url.hash) return;
    if (prefersReduced) return;
    e.preventDefault();
    curtain.classList.remove('hide');
    curtain.classList.add('enter');
    setTimeout(() => { window.location.href = url.href; }, 700);
  });
  // handle bfcache
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) { curtain.classList.remove('enter'); curtain.classList.add('hide'); }
  });
}

/* Header scroll */
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* Mobile menu */
function initMenu() {
  const btn = document.querySelector('.menu-btn');
  const nav = document.querySelector('.mobile-nav');
  if (!btn || !nav) return;
  const toggle = (open) => {
    const isOpen = typeof open === 'boolean' ? open : !nav.classList.contains('open');
    btn.classList.toggle('open', isOpen);
    nav.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };
  btn.addEventListener('click', () => toggle());
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggle(false); });
}

/* Reveal on scroll */
function initReveal() {
  const els = document.querySelectorAll('.reveal, .line-grow');
  if (!els.length) return;
  if (prefersReduced || !('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  els.forEach(el => obs.observe(el));
}

/* Magnetic buttons (subtle) */
function initMagnetic() {
  if (prefersReduced || window.matchMedia('(pointer: coarse)').matches) return;
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.18;
      const y = (e.clientY - r.top - r.height / 2) * 0.18;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

/* Collection filters */
function initFilters() {
  const buttons = document.querySelectorAll('[data-filter]');
  const items = document.querySelectorAll('.collection-item');
  if (!buttons.length || !items.length) return;
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      buttons.forEach(b => { b.classList.toggle('active', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
      items.forEach(item => {
        const show = filter === 'all' || item.dataset.category === filter;
        if (show) {
          item.classList.remove('hidden');
          requestAnimationFrame(() => item.classList.remove('hiding'));
        } else {
          item.classList.add('hiding');
          setTimeout(() => { if (item.classList.contains('hiding')) item.classList.add('hidden'); }, 450);
        }
      });
    });
  });
}

/* Quick view modal */
function initModal() {
  const modal = document.getElementById('quick-view');
  if (!modal) return;
  const panel = modal.querySelector('.modal-panel');
  const img = modal.querySelector('[data-modal-img]');
  const title = modal.querySelector('[data-modal-title]');
  const cat = modal.querySelector('[data-modal-cat]');
  const desc = modal.querySelector('[data-modal-desc]');
  let lastFocus = null;
  const open = (card) => {
    lastFocus = document.activeElement;
    img.src = card.dataset.image;
    img.alt = card.dataset.title;
    title.textContent = card.dataset.title;
    cat.textContent = card.dataset.label;
    desc.textContent = card.dataset.desc;
    const link = modal.querySelector('[data-modal-link]');
    if (link) link.href = card.dataset.id ? `product.html?id=${card.dataset.id}` : 'collections.html';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal-close').focus();
  };
  const close = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };
  document.querySelectorAll('[data-open-modal]').forEach(btn => btn.addEventListener('click', () => open(btn.closest('[data-title]'))));
  modal.addEventListener('click', (e) => { if (e.target.closest('[data-close-modal]') || e.target.classList.contains('modal-backdrop')) close(); });
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const focusable = modal.querySelectorAll('button,a,[href]');
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}

/* FAQ accordion */
function initFaq() {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const open = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!open) { item.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
    });
  });
}

/* Inquiry form - mailto fallback */
function initForm() {
  const form = document.getElementById('inquiry-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get('name') || '').trim();
    const email = (data.get('email') || '').trim();
    const interest = data.get('interest') || 'Custom inquiry';
    const message = (data.get('message') || '').trim();
    const subject = encodeURIComponent(`Sunshine inquiry — ${interest}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nInterest: ${interest}\n\n${message}\n\nSent from the Sunshine website.`);
    const status = document.getElementById('form-status');
    // Open mailto as a graceful no-backend path; also show Instagram CTA.
    window.location.href = `mailto:hello@sunshinehandmade.com?subject=${subject}&body=${body}`;
    if (status) {
      status.textContent = 'Your email draft is ready. If it did not open, you can message Namita directly on Instagram.';
      status.classList.remove('opacity-0');
    }
    form.reset();
  });
}

/* Footer year */
function initYear() {
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
}

function initAll() {
  initPageTransitions();
  initHeader();
  initMenu();
  initReveal();
  initMagnetic();
  initFilters();
  initModal();
  initFaq();
  initForm();
  initYear();
}

window.Sunshine = window.Sunshine || {};
window.Sunshine.refresh = () => { initReveal(); initMagnetic(); initFilters(); initModal(); initYear(); };

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}