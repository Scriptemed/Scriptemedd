/* =====================================================
   PRESENTATION — Direct Visual Servoing using Multiscale Decomposition
   Navigation : keyboard, click, swipe, dots
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

  let current = 0;
  let isAnimating = false;

  // ---------- init dots ----------
  totalEl.textContent = totalSlides;
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Aller à la slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsNav.appendChild(dot);
  });
  const dots = Array.from(document.querySelectorAll('.dot'));

  // ---------- navigation ----------
  function goTo(index) {
    if (isAnimating) return;
    if (index < 0 || index >= totalSlides || index === current) return;

    isAnimating = true;
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');

    current = index;

    slides[current].classList.add('active');
    dots[current].classList.add('active');

    // counter + progress
    currentEl.textContent = current + 1;
    const pct = ((current + 1) / totalSlides) * 100;
    progressFill.style.width = pct + '%';

    // disable buttons at edges
    navPrev.disabled = current === 0;
    navNext.disabled = current === totalSlides - 1;

    // reset scroll inside the slide
    slides[current].scrollTop = 0;

    setTimeout(() => { isAnimating = false; }, 600);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  navPrev.addEventListener('click', prev);
  navNext.addEventListener('click', next);
  navPrev.disabled = true;

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
      // fullscreen toggle
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
    // ignore if scrolling inside a long slide
    const target = e.target.closest('.slide');
    if (target && target.scrollHeight > target.clientHeight + 5) return;

    if (wheelTimeout) return;
    if (Math.abs(e.deltaY) < 30) return;

    if (e.deltaY > 0) next(); else prev();

    wheelTimeout = setTimeout(() => { wheelTimeout = null; }, 700);
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

  // ---------- click on edges (presentation feeling) ----------
  // disabled to avoid conflicts with interactive elements

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
        `translate(${dx * 12}px, ${dy * 12}px)`;
    });
  }

  // ---------- prevent context menu on background ----------
  // (kept default — useful for screenshots)

  // ---------- init progress ----------
  progressFill.style.width = (1 / totalSlides * 100) + '%';

  // ---------- expose minimal API for debugging ----------
  window.__presentation = { goTo, next, prev, get current() { return current; } };
})();
