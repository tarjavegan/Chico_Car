/* ============================================================
   NEON.JS — THE NEON GARAGE (PHOTO-BASED)
   "A Oficina Desperta" timeline, partículas, mouse 3D
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
    particleCountMobile: 10,
    particleCountTablet: 20,
    particleCountDesktop: 30,
    particleMinSize: 1,
    particleMaxSize: 3,
    maxRotateX: 4,
    maxRotateY: 5,
    lerpSpeed: 0.035,
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
  //  1. TIMELINE — "A OFICINA DESPERTA"
  //  Fases: dark → sign-off visible → crossfade ligada →
  //         glow + reflection + lens flare → texto → rep card
  // ============================================================
  function initTimeline() {
    const heroText = $('.hero-text');
    const signStage = $('.sign-stage');
    const glowOverlay = $('.sign-glow-overlay');
    const reflection = $('.sign-reflection');
    const flare = $('.lens-flare');
    const repCard = $('.rep-card-neon');

    if (prefersReducedMotion()) {
      // Instant reveal for reduced-motion users
      [heroText, signStage, repCard].forEach(el => el && el.classList.add('visible'));
      if (glowOverlay) { glowOverlay.style.opacity = '1'; glowOverlay.classList.add('active'); }
      if (reflection) { reflection.style.opacity = '1'; reflection.classList.add('active'); }
      if (flare) { flare.style.opacity = '1'; flare.classList.add('active'); }
      const vGlow = $('.volumetric-glow');
      if (vGlow) { vGlow.style.opacity = '1'; vGlow.classList.add('active'); }
      injectLitSign(signStage);
      return;
    }

    if (!signStage) return;

    // Timeline: [delay_ms, action]
    // Cinematic: desligada visível 4s → transição suave 3.2s → glow+reflection+flare → rep
    const tl = [
      [0, 'text'],
      [200, 'stage'],
      [4000, 'crossfade-start'],   // brilho começa a surgir
      [5000, 'crossfade'],          // placa ligada injetada
      [5800, 'glow'],              // glow volumétrico
      [6400, 'reflection'],        // reflexo piso
      [6800, 'flare'],             // lens flare
      [7200, 'rep']                // rep card
    ];

    setTimeout(() => {
      tl.forEach(([delay, action]) => {
        setTimeout(() => {
          switch (action) {
            case 'text':
              if (heroText) heroText.classList.add('visible');
              break;
            case 'stage':
              if (signStage) signStage.classList.add('visible');
              break;
            case 'crossfade-start':
              // Saturação e brilho começam a aumentar antes do crossfade
              const offImg = signStage ? signStage.querySelector('.sign-off img') : null;
              if (offImg) {
                offImg.style.filter = 'brightness(.55) contrast(1.2) saturate(.8)';
                offImg.style.transition = 'filter 1.5s ease-in';
              }
              break;
            case 'crossfade':
              // Inject lit sign photo and crossfade
              injectLitSign(signStage);
              break;
            case 'glow':
              if (glowOverlay) { glowOverlay.style.opacity = '1'; glowOverlay.classList.add('active'); }
              // Volumetric glow também
              const vGlow = $('.volumetric-glow');
              if (vGlow) { vGlow.style.opacity = '1'; vGlow.classList.add('active'); }
              break;
            case 'reflection':
              if (reflection) { reflection.style.opacity = '1'; reflection.classList.add('active'); }
              break;
            case 'flare':
              if (flare) { flare.style.opacity = '1'; flare.classList.add('active'); }
              break;
            case 'rep':
              if (repCard) repCard.classList.add('visible');
              break;
          }
        }, delay);
      });
    }, CFG.timelineDelay);
  }

  // Inject the lit sign photo and crossfade it in
  function injectLitSign(stage) {
    const photo = document.createElement('div');
    photo.className = 'sign-photo sign-on';
    photo.innerHTML = '<img src="placa ligada.png" alt="Placa Chico Car Serviços Automotivos iluminada com neon laranja" width="400" height="533">';
    stage.appendChild(photo);

    // Force reflow, then trigger crossfade
    photo.offsetHeight;
    requestAnimationFrame(() => {
      photo.style.opacity = '1';
    });
  }

  // ============================================================
  //  2. PARTÍCULAS ATMOSFÉRICAS
  // ============================================================
  function initParticles() {
    const container = $('.particles-container');
    if (!container || prefersReducedMotion()) return;

    let count = CFG.particleCountDesktop;
    if (isMobile()) count = CFG.particleCountMobile;
    else if (isTablet()) count = CFG.particleCountTablet;

    const fragment = document.createDocumentFragment();
    const useBlur = !isMobile();
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = rand(CFG.particleMinSize, CFG.particleMaxSize);
      const depth = rand(0, 1);
      const blur = useBlur && depth < 0.3 ? rand(1, 2.5) : 0;
      Object.assign(p.style, {
        width: size + 'px',
        height: size + 'px',
        left: rand(0, 100) + '%',
        top: rand(0, 100) + '%',
        opacity: rand(0.15, 0.5) * (0.5 + depth * 0.5),
        animationDuration: rand(8, 18) + 's',
        animationDelay: rand(0, 10) + 's',
        '--drift': rand(-30, 30) + 'px',
        filter: blur > 0 ? `blur(${blur}px)` : 'none'
      });
      fragment.appendChild(p);
    }
    container.appendChild(fragment);
  }

  // ============================================================
  //  3. MOUSE 3D — perspective on .sign-stage (max 5°)
  // ============================================================
  function initMouse3D() {
    if (isTablet() || prefersReducedMotion()) return;

    const hero = $('.hero-neon');
    const stage = $('.sign-stage');
    if (!hero || !stage) return;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let active = false;
    let rafId = null;

    hero.addEventListener('mousemove', e => {
      const rect = hero.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * CFG.maxRotateY;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * -CFG.maxRotateX;
      active = true;
      if (!rafId && !rafLoopsPaused) tick();
    }, { passive: true });

    hero.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
      active = false;
    }, { passive: true });

    function tick() {
      if (rafLoopsPaused) { rafId = null; return; }
      currentX = lerp(currentX, targetX, CFG.lerpSpeed);
      currentY = lerp(currentY, targetY, CFG.lerpSpeed);

      if (active || Math.abs(currentX) > 0.01 || Math.abs(currentY) > 0.01) {
        const tz = active ? 8 : 0;
        stage.style.transform = `perspective(1200px) rotateX(${currentY}deg) rotateY(${currentX}deg) translateZ(${tz}px) scale(1)`;
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    }
    tick();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && rafId) { cancelAnimationFrame(rafId); rafId = null; }
      else if (!document.hidden && !rafId) tick();
    });
  }

  // ============================================================
  //  4. SMOOTH REVEAL (IntersectionObserver)
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
  //  5. NAV SCROLL
  // ============================================================
  function initNav() {
    const nav = $('#navbar');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // ============================================================
  //  6. BACK TO TOP — INSTANT SCROLL (zero lag)
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
  //  7. MOBILE MENU
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
  //  8. MAP LAZY LOAD
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
  //  9. FAQ ACCORDION
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
  //  10. CAROUSEL
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
    initReveal();
    initNav();
    initBTT();
    initMenu();
    initMap();
    initFAQ();
    initCarousel();

    // Safety fallback: ensure everything is visible after 10s
    setTimeout(() => {
      $$('.hero-text,.sign-stage,.rep-card-neon').forEach(el => {
        if (!el.classList.contains('visible')) el.classList.add('visible');
      });
      const glow = $('.sign-glow-overlay');
      const refl = $('.sign-reflection');
      const flare = $('.lens-flare');
      const vGlow = $('.volumetric-glow');
      if (glow && !glow.classList.contains('active')) { glow.style.opacity='1'; glow.classList.add('active'); }
      if (refl && !refl.classList.contains('active')) { refl.style.opacity='1'; refl.classList.add('active'); }
      if (flare && !flare.classList.contains('active')) { flare.style.opacity='1'; flare.classList.add('active'); }
      if (vGlow && !vGlow.classList.contains('active')) { vGlow.style.opacity='1'; vGlow.classList.add('active'); }
      const stage = $('.sign-stage');
      if (stage && !stage.querySelector('.sign-on')) injectLitSign(stage);
    }, 10000);
  });

})();
