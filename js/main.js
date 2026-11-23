/* SUNSHINE — shared interaction controller.
   Everything is progressive enhancement: if a CDN fails, content stays usable. */
import { initThree } from './three-scene.js';

const { gsap, ScrollTrigger, Lenis } = window;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;

document.documentElement.classList.add('js');
if (reduceMotion) document.documentElement.classList.add('no-motion');

if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

/* --- Smooth inertia --------------------------------------------------- */
let lenis = null;
if (!reduceMotion && Lenis && gsap && ScrollTrigger) {
  lenis = new Lenis({
    duration: 1.2,
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.5
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* --- Curtained page transitions --------------------------------------- */
const curtain = document.querySelector('.page-curtain');
const curtainInner = curtain?.querySelector('.page-curtain__inner');
const curtainMark = curtain?.querySelector('.page-curtain__mark');

function revealPage() {
  if (!curtain) return;
  curtain.classList.remove('is-active');
  if (!gsap || !curtainInner) return;
  gsap.set(curtainInner, { scaleY: 1, transformOrigin: 'top center' });
  gsap.to(curtainInner, { scaleY: 0, duration: 0.95, ease: 'expo.inOut', delay: 0.12 });
  if (curtainMark) gsap.fromTo(curtainMark, { opacity: 1 }, { opacity: 0, duration: 0.4, delay: 0.1 });
}
revealPage();

function leavePage(href) {
  if (!curtain || !gsap || !curtainInner || reduceMotion) {
    location.href = href;
    return;
  }
  curtain.classList.add('is-active');
  gsap.timeline({ onComplete: () => { location.href = href; } })
    .set(curtainInner, { transformOrigin: 'bottom center' })
    .to(curtainInner, { scaleY: 1, duration: 0.65, ease: 'expo.inOut' })
    .to(curtainMark, { opacity: 1, duration: 0.32 }, '-=0.22')
    .to({}, { duration: 0.12 });
}

document.querySelectorAll('a[href]').forEach((link) => {
  const url = new URL(link.href, location.href);
  if (url.origin !== location.origin || link.target === '_blank' || link.hasAttribute('download')) return;
  if (url.pathname === location.pathname && url.hash) return; // in-page anchor
  if (url.pathname === location.pathname && !url.search) return;
  link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    leavePage(url.href);
  });
});

/* --- Morphing trailing cursor ----------------------------------------- */
if (finePointer && !reduceMotion && gsap) {
  const cursor = document.querySelector('.cursor');
  const ring = cursor?.querySelector('.cursor__ring');
  const dot = cursor?.querySelector('.cursor__dot');
  const label = cursor?.querySelector('.cursor__label');
  if (cursor && ring && dot) {
    document.body.classList.add('has-custom-cursor');
    const target = { x: innerWidth / 2, y: innerHeight / 2 };
    const trail = { ...target };
    gsap.set([ring, dot], { xPercent: -50, yPercent: -50 });

    addEventListener('pointermove', (event) => {
      target.x = event.clientX;
      target.y = event.clientY;
      gsap.set(dot, { x: target.x, y: target.y });
      cursor.classList.add('is-visible');
    }, { passive: true });

    gsap.ticker.add(() => {
      trail.x += (target.x - trail.x) * 0.16;
      trail.y += (target.y - trail.y) * 0.16;
      gsap.set(ring, {
        x: trail.x,
        y: trail.y,
        rotation: (target.x - trail.x) * 0.06
      });
    });

    document.querySelectorAll('a, button, [data-cursor]').forEach((element) => {
      element.addEventListener('pointerenter', () => {
        cursor.classList.add('is-hover');
        if (label) label.textContent = element.dataset.cursor || '';
      });
      element.addEventListener('pointerleave', () => {
        cursor.classList.remove('is-hover');
        if (label) label.textContent = '';
      });
    });
  }
}

/* --- Magnetic buttons -------------------------------------------------- */
if (finePointer && !reduceMotion && gsap) {
  document.querySelectorAll('.magnetic, .btn, .social-link').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      const dx = (event.clientX - rect.left - rect.width / 2) * 0.24;
      const dy = (event.clientY - rect.top - rect.height / 2) * 0.3;
      gsap.to(element, { x: dx, y: dy, duration: 0.55, ease: 'power3.out' });
    });
    element.addEventListener('pointerleave', () => {
      gsap.to(element, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)' });
    });
  });
}

/* --- Header state and mobile navigation -------------------------------- */
const header = document.querySelector('.site-header');
if (header) {
  const updateHeader = () => header.classList.toggle('is-solid', scrollY > 40);
  updateHeader();
  addEventListener('scroll', updateHeader, { passive: true });

  const menuToggle = header.querySelector('.menu-toggle');
  const nav = header.querySelector('.site-nav');
  menuToggle?.addEventListener('click', () => {
    const open = header.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.textContent = open ? 'Close' : 'Menu';
    if (open) lenis?.stop(); else lenis?.start();
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    header.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    if (menuToggle) menuToggle.textContent = 'Menu';
    lenis?.start();
  }));
}

/* --- Scroll choreography ------------------------------------------------ */
if (gsap && ScrollTrigger && !reduceMotion) {
  // Hero enters on load rather than on scroll.
  const heroLines = document.querySelectorAll('.hero .line-mask > span');
  if (heroLines.length) {
    gsap.timeline({ delay: 0.4 })
      .from(heroLines, { yPercent: 112, duration: 1.25, ease: 'expo.out', stagger: 0.09 })
      .from('.hero__eyebrow', { opacity: 0, x: -18, duration: 0.9, ease: 'power3.out' }, '-=0.95')
      .from('.hero__copy, .hero__aside, .hero__scroll, .hero__index', { opacity: 0, y: 22, duration: 1, ease: 'power3.out', stagger: 0.08 }, '-=0.8');
  }

  // Text blocks: inner line masks rise into place.
  document.querySelectorAll('[data-reveal="text"] .line-mask > span').forEach((line, index) => {
    gsap.fromTo(line, { yPercent: 108 }, {
      yPercent: 0,
      duration: 1.2,
      ease: 'expo.out',
      delay: (index % 3) * 0.06,
      scrollTrigger: { trigger: line.closest('[data-reveal]') || line, start: 'top 88%', once: true }
    });
  });

  // Everything else fades and lifts.
  gsap.utils.toArray('[data-reveal]:not([data-reveal="text"])').forEach((element) => {
    gsap.to(element, {
      opacity: 1,
      y: 0,
      duration: 1.05,
      ease: 'expo.out',
      scrollTrigger: { trigger: element, start: 'top 90%', once: true }
    });
  });

  // Gentle parallax on framed imagery.
  gsap.utils.toArray('[data-parallax]').forEach((element) => {
    gsap.fromTo(element, { yPercent: -5 }, {
      yPercent: 5,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    });
  });

  // Pinned horizontal gallery: desktop only, cleanly torn down on resize.
  const media = gsap.matchMedia();
  media.add('(min-width: 901px)', () => {
    const panel = document.querySelector('.horizontal-panel');
    const track = document.querySelector('.horizontal-track');
    if (!panel || !track) return undefined;
    const distance = () => Math.max(0, track.scrollWidth - innerWidth);
    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: panel,
        start: 'top top',
        end: () => '+=' + distance(),
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });
    return () => {
      if (tween.scrollTrigger) tween.scrollTrigger.kill();
      tween.kill();
      gsap.set(track, { clearProps: 'transform' });
    };
  });

  // Floating preview that follows the pointer over collection rows.
  const preview = document.querySelector('.float-preview');
  if (preview && finePointer) {
    const previewImage = preview.querySelector('img');
    gsap.set(preview, { scale: 0.9 });
    document.querySelectorAll('[data-preview]').forEach((row) => {
      row.addEventListener('pointerenter', () => {
        if (previewImage) previewImage.src = row.dataset.preview;
        gsap.to(preview, { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' });
      });
      row.addEventListener('pointermove', (event) => {
        gsap.to(preview, {
          x: Math.min(event.clientX + 26, innerWidth - preview.offsetWidth - 20),
          y: Math.min(event.clientY - preview.offsetHeight / 2, innerHeight - preview.offsetHeight - 20),
          duration: 0.55,
          ease: 'power3.out'
        });
      });
      row.addEventListener('pointerleave', () => {
        gsap.to(preview, { opacity: 0, scale: 0.9, duration: 0.4, ease: 'power3.out' });
      });
    });
  }
} else if (gsap && reduceMotion) {
  gsap.set('[data-reveal]', { opacity: 1, y: 0 });
  gsap.set('.line-mask > span', { yPercent: 0 });
}

/* --- Collection filtering ---------------------------------------------- */
const filterBar = document.querySelector('.filter-bar');
if (filterBar) {
  const buttons = Array.from(filterBar.querySelectorAll('.filter-btn'));
  const items = Array.from(document.querySelectorAll('.gallery-item'));
  buttons.forEach((button) => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    buttons.forEach((other) => {
      const active = other === button;
      other.classList.toggle('is-active', active);
      other.setAttribute('aria-pressed', String(active));
    });
    items.forEach((item) => {
      const visible = filter === 'all' || item.dataset.category === filter;
      item.classList.toggle('is-hidden', !visible);
      if (visible && !reduceMotion && gsap) {
        gsap.fromTo(item, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
      }
    });
    ScrollTrigger?.refresh();
  }));
}

/* --- Quick-view drawer -------------------------------------------------- */
const drawer = document.querySelector('.quick-view');
const backdrop = document.querySelector('.drawer-backdrop');
if (drawer && backdrop) {
  let lastFocused = null;
  const closeButton = drawer.querySelector('.drawer__close');

  function openDrawer(trigger) {
    const item = trigger.closest('.gallery-item');
    if (!item) return;
    lastFocused = document.activeElement;
    const source = item.querySelector('.gallery-item__frame img');
    const targetImage = drawer.querySelector('.drawer__frame img');
    if (source && targetImage) {
      targetImage.src = source.src;
      targetImage.alt = source.alt;
    }
    const title = item.querySelector('.gallery-item__name')?.textContent.trim() || 'Piece';
    drawer.querySelector('h2').textContent = title;
    drawer.querySelector('[data-detail="material"]').textContent = trigger.dataset.material || 'Hand-formed';
    drawer.querySelector('[data-detail="time"]').textContent = trigger.dataset.time || '2–3 weeks';
    drawer.querySelector('[data-detail="note"]').textContent = trigger.dataset.note || '';
    const inquiry = drawer.querySelector('[data-detail="link"]');
    if (inquiry) {
      inquiry.href = 'https://www.instagram.com/sunshine_handicraft_n/?text=' + encodeURIComponent('Hello Namita — I would love to know more about ' + title + '.');
    }

    drawer.classList.add('is-open');
    backdrop.classList.add('is-open');
    drawer.removeAttribute('inert');
    drawer.setAttribute('aria-hidden', 'false');
    lenis?.stop();
    document.body.style.overflow = 'hidden';
    if (gsap && !reduceMotion) {
      gsap.fromTo(drawer, { xPercent: 100 }, { xPercent: 0, duration: 0.75, ease: 'expo.out' });
      gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' });
    } else {
      drawer.style.transform = 'translateX(0)';
      backdrop.style.opacity = '1';
    }
    closeButton?.focus();
  }

  function closeDrawer() {
    if (!drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    drawer.setAttribute('inert', '');
    drawer.setAttribute('aria-hidden', 'true');
    lenis?.start();
    document.body.style.overflow = '';
    const finish = () => {
      drawer.style.transform = '';
      backdrop.style.opacity = '';
    };
    if (gsap && !reduceMotion) {
      gsap.to(drawer, { xPercent: 100, duration: 0.6, ease: 'expo.inOut', onComplete: finish });
      gsap.to(backdrop, { opacity: 0, duration: 0.45, ease: 'power2.in' });
    } else {
      finish();
    }
    lastFocused?.focus();
  }

  document.querySelectorAll('[data-quick-view]').forEach((button) => {
    button.addEventListener('click', () => openDrawer(button));
  });
  closeButton?.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);
  addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDrawer();
  });
}

/* --- FAQ accordion ------------------------------------------------------ */
document.querySelectorAll('.faq-item__trigger').forEach((trigger) => {
  const item = trigger.closest('.faq-item');
  const panel = item?.querySelector('.faq-item__panel');
  const inner = panel?.querySelector('.faq-item__panel-inner');
  if (!item || !panel || !inner) return;
  trigger.addEventListener('click', () => {
    const wasOpen = item.classList.contains('is-open');
    document.querySelectorAll('.faq-item.is-open').forEach((other) => {
      if (other === item) return;
      other.classList.remove('is-open');
      other.querySelector('.faq-item__trigger')?.setAttribute('aria-expanded', 'false');
      const otherPanel = other.querySelector('.faq-item__panel');
      if (gsap && !reduceMotion) gsap.to(otherPanel, { height: 0, duration: 0.5, ease: 'power3.inOut' });
      else otherPanel.style.height = '0px';
    });
    item.classList.toggle('is-open', !wasOpen);
    trigger.setAttribute('aria-expanded', String(!wasOpen));
    if (gsap && !reduceMotion) {
      gsap.to(panel, {
        height: wasOpen ? 0 : inner.offsetHeight,
        duration: 0.6,
        ease: 'power3.inOut',
        onComplete: () => {
          if (!wasOpen) gsap.set(panel, { height: 'auto' });
          ScrollTrigger?.refresh();
        }
      });
    } else {
      panel.style.height = wasOpen ? '0px' : inner.offsetHeight + 'px';
    }
  });
});

/* --- Inquiry form: validation and honest confirmation ------------------ */
const form = document.querySelector('#inquiry-form');
if (form) {
  const validators = {
    name: (value) => value.trim().length >= 2 || 'Please tell me your name',
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || 'A valid email, please',
    message: (value) => value.trim().length >= 10 || 'A few more words, please'
  };
  const fieldOf = (input) => input.closest('.field');

  Object.keys(validators).forEach((name) => {
    const input = form.elements[name];
    if (!input) return;
    input.addEventListener('input', () => {
      const field = fieldOf(input);
      if (!field?.classList.contains('has-error')) return;
      const valid = validators[name](input.value) === true;
      if (valid) {
        field.classList.remove('has-error');
        input.removeAttribute('aria-invalid');
        const error = field.querySelector('.error-text');
        if (error) error.textContent = '';
      }
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    let valid = true;
    Object.entries(validators).forEach(([name, validate]) => {
      const input = form.elements[name];
      if (!input) return;
      const result = validate(input.value);
      const field = fieldOf(input);
      const error = field?.querySelector('.error-text');
      if (result === true) {
        field?.classList.remove('has-error');
        input.removeAttribute('aria-invalid');
        if (error) error.textContent = '';
      } else {
        valid = false;
        field?.classList.add('has-error');
        input.setAttribute('aria-invalid', 'true');
        if (error) error.textContent = result;
      }
    });
    if (!valid) {
      form.querySelector('.has-error input, .has-error textarea')?.focus();
      return;
    }
    const success = form.querySelector('.form-success');
    success?.classList.add('is-visible');
    if (success && !reduceMotion && gsap) gsap.fromTo(success, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
    ScrollTrigger?.refresh();
  });
}

/* --- Footer year and ambient WebGL -------------------------------------- */
document.querySelectorAll('[data-year]').forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

try {
  initThree();
} catch (error) {
  document.querySelectorAll('.webgl-hero, .webgl-ambient').forEach((host) => host.classList.add('is-fallback'));
  console.warn('Sunshine: WebGL scene unavailable.', error);
}
