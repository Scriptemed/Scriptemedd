/* =====================================================
   PRESENTATION — Direct Visual Servoing
   Premium navigation : keyboard, click, swipe, dots, rail
   ===================================================== */

(function () {
  'use strict';

  const slides       = Array.from(document.querySelectorAll('.slide'));
  const totalSlides  = slides.length;
  const progressFill = document.getElementById('progressFill');
  const currentEl    = document.getElementById('currentSlide');
  const totalEl      = document.getElementById('totalSlides');
  const navPrev      = document.getElementById('navPrev');
  const navNext      = document.getElementById('navNext');
  const dotsNav      = document.getElementById('dotsNav');
  const rail         = document.getElementById('chapterRail');
  const railItems    = rail ? Array.from(rail.querySelectorAll('li')) : [];

  let current = 0;
  let isAnimating = false;

  // ---------- init dots ----------
  totalEl.textContent = String(totalSlides).padStart(2, '0');
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsNav.appendChild(dot);
  });
  const dots = Array.from(document.querySelectorAll('.dot'));

  // mark first rail item active
  if (railItems[0]) railItems[0].classList.add('active');
  // bind rail clicks
  railItems.forEach((li) => {
    const target = parseInt(li.dataset.target, 10) - 1;
    li.addEventListener('click', () => goTo(target));
  });

  // ---------- count-up animation ----------
  function animateCounters(slide) {
    const counters = slide.querySelectorAll('[data-count]');
    counters.forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const duration = 1400;
      const start = performance.now();
      const startVal = 0;
      function step(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3); // ease out cubic
        const v = startVal + (target - startVal) * eased;
        el.textContent = decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString();
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  // ---------- navigation ----------
  function goTo(index) {
    if (isAnimating) return;
    if (index < 0 || index >= totalSlides || index === current) return;

    isAnimating = true;
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    if (railItems[current]) railItems[current].classList.remove('active');

    current = index;

    slides[current].classList.add('active');
    dots[current].classList.add('active');
    if (railItems[current]) railItems[current].classList.add('active');

    // counter + progress
    currentEl.textContent = String(current + 1).padStart(2, '0');
    const pct = ((current + 1) / totalSlides) * 100;
    progressFill.style.width = pct + '%';

    // disable buttons at edges
    navPrev.disabled = current === 0;
    navNext.disabled = current === totalSlides - 1;

    // reset scroll inside the slide
    slides[current].scrollTop = 0;

    // trigger count-up animations on reveal
    setTimeout(() => animateCounters(slides[current]), 300);

    setTimeout(() => { isAnimating = false; }, 700);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  navPrev.addEventListener('click', prev);
  navNext.addEventListener('click', next);
  navPrev.disabled = true;

  // run counters on first slide too
  setTimeout(() => animateCounters(slides[0]), 300);

  // ---------- keyboard ----------
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault(); next();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault(); prev();
    } else if (e.key === 'Home') {
      e.preventDefault(); goTo(0);
    } else if (e.key === 'End') {
      e.preventDefault(); goTo(totalSlides - 1);
    } else if (e.key === 'f' || e.key === 'F') {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    } else if (/^[0-9]$/.test(e.key)) {
      const n = parseInt(e.key, 10);
      const target = n === 0 ? 9 : n - 1;
      if (target < totalSlides) goTo(target);
    }
  });

  // ---------- mouse wheel (debounced) ----------
  let wheelTimeout = null;
  document.addEventListener('wheel', (e) => {
    const target = e.target.closest('.slide');
    if (target && target.scrollHeight > target.clientHeight + 5) return;

    if (wheelTimeout) return;
    if (Math.abs(e.deltaY) < 30) return;

    if (e.deltaY > 0) next(); else prev();

    wheelTimeout = setTimeout(() => { wheelTimeout = null; }, 800);
  }, { passive: true });

  // ---------- touch swipe ----------
  let touchStartX = 0, touchStartY = 0;
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next(); else prev();
    }
  }, { passive: true });

  // ---------- mouse parallax on hero visual ----------
  const heroVisual = document.querySelector('.hero-visual');
  if (heroVisual) {
    document.addEventListener('mousemove', (e) => {
      if (current !== 0) return;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      heroVisual.style.transform =
        `translate(${dx * 14}px, ${dy * 14}px)`;
    });
  }

  // ---------- init progress ----------
  progressFill.style.width = (1 / totalSlides * 100) + '%';

  // ---------- expose API ----------
  window.__presentation = { goTo, next, prev, get current() { return current; } };
})();
