/* ==========================================================================
   Safe Cities Foundation — interactions
   Runs on every page. All setup is idempotent so it can re-scan after
   content.js injects dynamic cards (via the 'scf:rendered' event).
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Sticky / scrolled nav ---------- */
  function setupNav() {
    var nav = document.getElementById('nav');
    if (!nav || nav.__bound) return;
    nav.__bound = true;

    function onScroll() {
      if (window.scrollY > 60) nav.classList.add('is-scrolled');
      else nav.classList.remove('is-scrolled');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var toggle = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');
    if (toggle && links) {
      function closeMenu() {
        links.classList.remove('is-open');
        nav.classList.remove('is-open-menu');
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
      toggle.addEventListener('click', function () {
        var open = links.classList.toggle('is-open');
        nav.classList.toggle('is-open-menu', open);
        document.body.classList.toggle('nav-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      links.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') closeMenu();
      });
    }
  }

  /* ---------- Reveal on scroll (idempotent) ---------- */
  var revealIO = null;
  function initReveals() {
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(document.querySelectorAll('[data-reveal]'), function (el) { el.classList.add('is-visible'); });
      return;
    }
    if (!revealIO) {
      revealIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var delay = parseFloat(el.getAttribute('data-delay') || '0') * 1000;
            setTimeout(function () { el.classList.add('is-visible'); }, delay);
            revealIO.unobserve(el);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    }
    Array.prototype.forEach.call(document.querySelectorAll('[data-reveal]:not([data-reveal-bound])'), function (el) {
      el.setAttribute('data-reveal-bound', '');
      revealIO.observe(el);
    });
  }

  /* ---------- Animated counters (idempotent) ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-counter'));
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1400, start = null;
    function step(now) {
      if (start === null) start = now;
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var countIO = null;
  function initCounters() {
    if (!('IntersectionObserver' in window)) return;
    if (!countIO) {
      countIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { animateCount(entry.target); countIO.unobserve(entry.target); }
        });
      }, { threshold: 0.6 });
    }
    Array.prototype.forEach.call(document.querySelectorAll('[data-counter]:not([data-counter-bound])'), function (el) {
      el.setAttribute('data-counter-bound', '');
      countIO.observe(el);
    });
  }

  /* ---------- Contact form ----------
     Front-end demo handler. To receive real submissions, either:
       (a) point <form id="contactForm"> at a form service (Formspree / Web3Forms), or
       (b) send to Firebase — see js/firebase.js once configured.
  ------------------------------------- */
  function setupForms() {
    var form = document.getElementById('contactForm');
    var success = document.getElementById('formSuccess');
    if (form && !form.__bound) {
      form.__bound = true;
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }

        var fd = new FormData(form);
        var payload = {
          name: fd.get('name') || '',
          email: fd.get('email') || '',
          organisation: fd.get('organisation') || '',
          country: fd.get('country') || '',
          interest: fd.get('interest') || '',
          message: fd.get('message') || ''
        };
        var btn = form.querySelector('.form-submit');

        function showSuccess() {
          form.classList.add('is-hidden');
          if (success) success.classList.remove('is-hidden');
        }

        if (window.SCF && typeof window.SCF.submitContact === 'function') {
          var label = btn ? btn.textContent : '';
          if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
          window.SCF.submitContact(payload).then(showSuccess).catch(function () {
            if (btn) { btn.disabled = false; btn.textContent = label; }
            alert('Sorry — something went wrong sending your message. Please email info@safecitiesfoundation.org and we will get right back to you.');
          });
        } else {
          // No backend connected yet — front-end demo.
          showSuccess();
        }
      });
    }
  }

  function setupNewsletter() {
    var news = document.getElementById('newsletterForm');
    if (news && !news.__bound) {
      news.__bound = true;
      news.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = news.querySelector('input');
        var btn = news.querySelector('button');
        if (input.value) { btn.textContent = 'Subscribed ✓'; input.value = ''; input.disabled = true; }
      });
    }
  }

  function setYear() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    setupNav();
    setupForms();
    setupNewsletter();
    setYear();
    initReveals();
    initCounters();
  }
  if (document.readyState !== 'loading') boot();
  else document.addEventListener('DOMContentLoaded', boot);

  // Re-scan after content.js injects dynamic project/news cards.
  document.addEventListener('scf:rendered', function () {
    setupNav(); setYear(); initReveals(); initCounters();
  });

  window.SCF = window.SCF || {};
  window.SCF.refreshAnimations = function () { initReveals(); initCounters(); };
})();
