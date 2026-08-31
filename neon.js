/* ============================================================
   NEON.JS — THE NEON GARAGE
   Timeline sequencial, partículas, mouse 3D, parallax
   Otimizado: mobile, tablet, smart TV, reduced-motion
   ============================================================ */

(function () {
  'use strict';

  const C = {
    orange: '#FF7A00',
    orangeBright: '#FFB000',
    blue: '#005DBA',
    blueLight: '#0D7DFF',
    white: '#FFFFFF',
    gold: '#F5B800'
  };

  const CFG = {
    particleCountMobile: 12,
    particleCountTablet: 25,
    particleCountDesktop: 40,
    particleMinSize: 1.5,
    particleMaxSize: 4,
    maxRotate: 6,
    lerpSpeed: 0.04,
    timelineDelay: 200
  };

  const $ = (s, p) => (p || document).querySelector(s);
  const $$ = (s, p) => [...(p || document).querySelectorAll(s)];
  const rand = (a, b) => Math.random() * (b - a) + a;
  const lerp = (a, b, t) => a + (b - a) * t;

  let rafLoopsPaused = false;

  const isMobile = () => window.matchMedia('(max-width:480px)').matches;
  const isTablet = () => window.matchMedia('(max-width:768px)').matches;
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  // ============================================================
  //  1. TIMELINE SEQUENCIAL
  // ============================================================
  function initTimeline() {
    if (prefersReducedMotion()) {
      $$('.sign-frame,.neon-logo,.neon-chico,.neon-car,.neon-divider,.neon-mecanica,.service-line,.phone-line,.hero-text,.hero-ctas,.rep-card-neon,.lens-flare')
        .forEach(el => el && el.classList.add('neon-visible'));
      return;
    }

    const sign = $('.sign-frame');
    const logo = $('.neon-logo');
    const chico = $('.neon-chico');
    const car = $('.neon-car');
    const divider = $('.neon-divider');
    const mec = $('.neon-mecanica');
    const services = $$('.service-line');
    const phones = $$('.phone-line');
    const heroText = $('.hero-text');
    const heroCtas = $('.hero-ctas');
    const repCard = $('.rep-card-neon');
    const flare = $('.lens-flare');

    if (!sign) return;

    const tl = [
      [sign, 0, 'neon-visible'],
      [logo, 400, 'neon-visible'],
      [chico, 700, 'neon-visible'],
      [car, 800, 'neon-visible'],
      [divider, 1100, 'neon-visible'],
      [mec, 1400, 'neon-visible'],
      ...services.map((s, i) => [s, 1800 + i * 250, 'neon-visible']),
      ...phones.map((p, i) => [p, 3200 + i * 300, 'neon-visible']),
      [heroText, 3800, 'neon-visible'],
      [heroCtas, 4100, 'neon-visible'],
      [repCard, 4500, 'neon-visible'],
      [flare, 5000, 'neon-visible']
    ];

    setTimeout(() => {
      tl.forEach(([el, delay, cls]) => {
        if (!el) return;
        setTimeout(() => el.classList.add(cls), delay);
      });
    }, CFG.timelineDelay);
  }

  // ============================================================
  //  2. PARTÍCULAS
  // ============================================================
  function initParticles() {
    const container = $('.particles-container');
    if (!container || prefersReducedMotion()) return;

    let count = CFG.particleCountDesktop;
    if (isMobile()) count = CFG.particleCountMobile;
    else if (isTablet()) count = CFG.particleCountTablet;

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = rand(CFG.particleMinSize, CFG.particleMaxSize);
      Object.assign(p.style, {
        width: size + 'px',
        height: size + 'px',
        left: rand(0, 100) + '%',
        top: rand(0, 100) + '%',
        opacity: rand(0.2, 0.7),
        animationDuration: rand(6, 15) + 's',
        animationDelay: rand(0, 8) + 's',
        '--drift': rand(-40, 40) + 'px'
      });
      fragment.appendChild(p);
    }
    container.appendChild(fragment);
  }

  // ============================================================
  //  3. MOUSE 3D (desktop only)
  // ============================================================
  function initMouse3D() {
    if (isTablet() || prefersReducedMotion()) return;

    const hero = $('.hero-neon');
    const sign = $('.sign-frame');
    if (!hero || !sign) return;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let active = false;
    let rafId = null;

    hero.addEventListener('mousemove', e => {
      const rect = hero.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * CFG.maxRotate;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * -CFG.maxRotate;
      active = true;
    }, { passive: true });

    hero.addEventListener('mouseleave', () => { targetX = 0; targetY = 0; }, { passive: true });

    function tick() {
      if (rafLoopsPaused) { rafId = null; return; }
      currentX = lerp(currentX, targetX, CFG.lerpSpeed);
      currentY = lerp(currentY, targetY, CFG.lerpSpeed);

      if (active || Math.abs(currentX) > 0.01 || Math.abs(currentY) > 0.01) {
        sign.style.transform = `perspective(1000px) rotateX(${currentY}deg) rotateY(${currentX}deg)`;
      }

      rafId = requestAnimationFrame(tick);
    }
    tick();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && rafId) { cancelAnimationFrame(rafId); rafId = null; }
      else if (!document.hidden && !rafId) tick();
    });
  }

  // ============================================================
  //  4. PARALLAX (desktop only)
  // ============================================================
  function initParallax() {
    if (isTablet() || prefersReducedMotion()) return;

    const hero = $('.hero-neon');
    if (!hero) return;

    const layers = [
      { el: $('.mesh-layer'), depth: 0.02 },
      { el: $('.volumetric-light'), depth: 0.04 },
      { el: $('.smoke-layer'), depth: 0.03 }
    ].filter(l => l.el);

    let mx = 0, my = 0, tx = 0, ty = 0, rafId = null;

    hero.addEventListener('mousemove', e => {
      const rect = hero.getBoundingClientRect();
      mx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      my = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    }, { passive: true });

    hero.addEventListener('mouseleave', () => { mx = 0; my = 0; }, { passive: true });

    function tick() {
      if (rafLoopsPaused) { rafId = null; return; }
      tx = lerp(tx, mx, 0.03);
      ty = lerp(ty, my, 0.03);
      layers.forEach(({ el, depth }) => {
        el.style.transform = `translate(${tx * depth * 100}px, ${ty * depth * 100}px)`;
      });
      rafId = requestAnimationFrame(tick);
    }
    tick();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && rafId) { cancelAnimationFrame(rafId); rafId = null; }
      else if (!document.hidden && !rafId) tick();
    });
  }

  // ============================================================
  //  5. SMOOTH REVEAL
  // ============================================================
  function initReveal() {
    if (prefersReducedMotion()) {
      $$('.reveal').forEach(el => el.classList.add('visible'));
      return;
    }

    const ro = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); ro.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    $$('.reveal').forEach(el => ro.observe(el));
  }

  // ============================================================
  //  6. NAV SCROLL
  // ============================================================
  function initNav() {
    const nav = $('#navbar');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // ============================================================
  //  7. BACK TO TOP — INSTANT SCROLL (zero lag)
  // ============================================================
  function initBTT() {
    const btn = $('.btt');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });

    btn.addEventListener('click', e => {
      e.preventDefault();
      rafLoopsPaused = true;
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      requestAnimationFrame(() => { rafLoopsPaused = false; });
    });
  }

  // ============================================================
  //  8. MOBILE MENU
  // ============================================================
  function initMenu() {
    const hamburger = $('.hamburger');
    const mobile = $('.mobile-menu');
    if (!hamburger || !mobile) return;

    hamburger.addEventListener('click', () => {
      const isOpen = mobile.classList.contains('active');
      hamburger.classList.toggle('active');
      mobile.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', !isOpen);
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    mobile.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobile.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // ============================================================
  //  9. MAP LAZY LOAD
  // ============================================================
  function initMap() {
    const section = $('#mapa');
    if (!section) return;

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const iframe = section.querySelector('iframe[data-src]');
          if (iframe) { iframe.src = iframe.dataset.src; iframe.removeAttribute('data-src'); }
          io.unobserve(section);
        }
      });
    }, { threshold: 0.15, rootMargin: '200px 0px' });

    io.observe(section);
  }

  // ============================================================
  //  10. FAQ ACCORDION
  // ============================================================
  function initFAQ() {
    $$('.faq-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const wasActive = item.classList.contains('active');
        $$('.faq-item.active').forEach(i => {
          i.classList.remove('active');
          const q = i.querySelector('.faq-q');
          if (q) q.setAttribute('aria-expanded', 'false');
        });
        if (!wasActive) {
          item.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // ============================================================
  //  11. CAROUSEL
  // ============================================================
  function initCarousel() {
    const track = $('.carousel-track');
    const dots = $$('.dot');
    const prev = $('#prevBtn');
    const next = $('#nextBtn');
    if (!track || !dots.length) return;

    let current = 0;
    const total = dots.length;
    let autoTimer = null;

    function goTo(i) {
      current = ((i % total) + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
    }

    function startAuto() { stopAuto(); autoTimer = setInterval(() => goTo(current + 1), 5000); }
    function stopAuto() { if (autoTimer) clearInterval(autoTimer); }

    dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); startAuto(); }));
    if (prev) prev.addEventListener('click', () => { goTo(current - 1); startAuto(); });
    if (next) next.addEventListener('click', () => { goTo(current + 1); startAuto(); });

    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; stopAuto(); }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
      startAuto();
    }, { passive: true });

    startAuto();
  }

  // ============================================================
  //  INIT ALL
  // ============================================================
  document.addEventListener('DOMContentLoaded', () => {
    initTimeline();
    initParticles();
    initMouse3D();
    initParallax();
    initReveal();
    initNav();
    initBTT();
    initMenu();
    initMap();
    initFAQ();
    initCarousel();
  });

})();
