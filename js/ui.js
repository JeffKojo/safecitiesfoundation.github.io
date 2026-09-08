/* ==========================================================================
   UI engine — header behaviour, mega menus, drawer, hero carousel, rails,
   reveals, counters, page transitions, forms.
   All init is idempotent and re-runnable after dynamic content injection.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ======================================================================
     PAGE VEIL — smooth cross-page fade
     ====================================================================== */
  function initVeil() {
    if (reduce) return;
    var veil = document.createElement('div');
    veil.className = 'veil';
    document.body.appendChild(veil);
    setTimeout(function () { if (veil.parentNode) veil.parentNode.removeChild(veil); }, 700);

    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || a.target === '_blank' || a.hasAttribute('download')) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (/^(mailto:|tel:|#|javascript:)/.test(href)) return;
      // same-page anchor on another file? let it through only if different doc
      var url;
      try { url = new URL(a.href, location.href); } catch (_) { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname) return; // same page: no veil
      e.preventDefault();
      var v = document.createElement('div');
      v.className = 'veil is-leaving';
      v.style.opacity = '0';
      document.body.appendChild(v);
      requestAnimationFrame(function () { v.style.opacity = '1'; });
      setTimeout(function () { location.href = a.href; }, 250);
    });
  }

  /* ======================================================================
     HEADER: stuck state, mega menus, search, drawer
     ====================================================================== */
  function initHeader() {
    var hdr = $('#hdr');
    if (!hdr || hdr.__b) return;
    hdr.__b = true;

    var scrim = $('#scrim');
    var megas = $$('.mega');
    var searchPanel = $('#searchPanel');
    var searchBtn = $('#searchBtn');
    var openId = null;

    function onScroll() {
      hdr.classList.toggle('is-stuck', window.scrollY > 20);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    function closeAll() {
      megas.forEach(function (m) { m.classList.remove('is-open'); });
      $$('[data-mega]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
      if (searchPanel) searchPanel.classList.remove('is-open');
      if (searchBtn) searchBtn.setAttribute('aria-expanded', 'false');
      if (scrim) scrim.classList.remove('is-on');
      openId = null;
    }

    $$('[data-mega]').forEach(function (btn) {
      var id = btn.getAttribute('data-mega');
      var panel = $('#mega-' + id);
      btn.addEventListener('click', function () {
        if (openId === id) { closeAll(); return; }
        closeAll();
        panel.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        if (scrim) scrim.classList.add('is-on');
        openId = id;
      });
      // hover-open on precise pointers (institutional feel, no click needed)
      btn.addEventListener('mouseenter', function () {
        if (!window.matchMedia('(hover:hover) and (min-width:1121px)').matches) return;
        if (openId === id) return;
        closeAll();
        panel.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        if (scrim) scrim.classList.add('is-on');
        openId = id;
      });
    });

    // leave the whole header region closes hover menus
    hdr.addEventListener('mouseleave', function () {
      if (!window.matchMedia('(hover:hover) and (min-width:1121px)').matches) return;
      if (openId && openId !== 'search') closeAll();
    });

    if (searchBtn) {
      searchBtn.addEventListener('click', function () {
        var open = searchPanel.classList.contains('is-open');
        closeAll();
        if (!open) {
          searchPanel.classList.add('is-open');
          searchBtn.setAttribute('aria-expanded', 'true');
          if (scrim) scrim.classList.add('is-on');
          openId = 'search';
          var i = $('input', searchPanel);
          if (i) setTimeout(function () { i.focus(); }, 120);
        }
      });
    }

    if (scrim) scrim.addEventListener('click', function () { closeAll(); closeDrawer(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeAll(); closeDrawer(); }
    });

    /* ---- drawer ---- */
    var drawer = $('#drawer');
    var burger = $('#burger');
    var dClose = $('#drawerClose');

    function openDrawer() {
      if (!drawer) return;
      closeAll();
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.classList.add('drawer-open');
      document.body.style.overflow = 'hidden';
      if (scrim) scrim.classList.add('is-on');
      if (burger) burger.setAttribute('aria-expanded', 'true');
    }
    function closeDrawer() {
      if (!drawer) return;
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('drawer-open');
      document.body.style.overflow = '';
      if (scrim) scrim.classList.remove('is-on');
      if (burger) burger.setAttribute('aria-expanded', 'false');
    }
    if (burger) burger.addEventListener('click', function () {
      drawer.classList.contains('is-open') ? closeDrawer() : openDrawer();
    });
    if (dClose) dClose.addEventListener('click', closeDrawer);
    if (drawer) drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeDrawer();
    });

    /* ---- drawer accordions (animated height) ---- */
    $$('.acc').forEach(function (acc) {
      var hd = $('.acc__hd', acc);
      var bd = $('.acc__bd', acc);
      if (!hd || !bd) return;
      hd.addEventListener('click', function () {
        var open = acc.classList.toggle('is-open');
        hd.setAttribute('aria-expanded', open ? 'true' : 'false');
        bd.style.height = open ? bd.firstElementChild.offsetHeight + 'px' : '0px';
      });
    });

    /* ---- search submit ---- */
    function wireSearch(form) {
      if (!form) return;
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var q = (form.querySelector('input').value || '').trim();
        if (!q) return;
        location.href = 'work.html?q=' + encodeURIComponent(q);
      });
    }
    wireSearch($('#searchForm'));
    wireSearch($('#drawerSearch'));
  }
  var closeDrawer = function () {
    var d = $('#drawer');
    if (!d) return;
    d.classList.remove('is-open');
    d.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('drawer-open');
    document.body.style.overflow = '';
    var s = $('#scrim'); if (s) s.classList.remove('is-on');
    var b = $('#burger'); if (b) b.setAttribute('aria-expanded', 'false');
  };

  /* ======================================================================
     HERO CAROUSEL
     ====================================================================== */
  function initHero() {
    var hero = $('.hero');
    if (!hero || hero.__b) return;
    hero.__b = true;

    var slides = $$('.hero__slide', hero);
    var tabs = $$('.hero__tab', hero);
    var dots = $$('.hero__dot', hero);
    if (slides.length < 2) { if (slides[0]) slides[0].classList.add('is-on'); return; }

    var i = 0, DUR = 7000;
    var elapsed = 0, last = 0, raf = null, hover = false, offscreen = false;

    /* One clock drives both the slide change and the progress bar.
       Previously setInterval advanced the slide while a CSS animation drew the
       bar — two independent clocks that drift apart whenever the browser
       throttles timers (background tab), leaving the bar stuck mid-fill or
       full while the slide sat still. */
    function paint() {
      var p = Math.min(elapsed / DUR, 1);
      tabs.forEach(function (t, x) { t.style.setProperty('--p', x === i ? p : 0); });
    }

    function show(n) {
      i = (n + slides.length) % slides.length;
      elapsed = 0;
      slides.forEach(function (s, x) { s.classList.toggle('is-on', x === i); });
      tabs.forEach(function (t, x) {
        var on = x === i;
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      dots.forEach(function (d, x) { d.classList.toggle('is-on', x === i); });
      paint();
    }

    function frame(ts) {
      raf = requestAnimationFrame(frame);
      var dt = last ? ts - last : 0;
      last = ts;
      if (hover || offscreen || document.hidden) return;
      /* A gap this large means the page was suspended, not slow. Swallow it
         rather than fast-forwarding through several slides at once. */
      if (dt > 900) dt = 0;
      elapsed += dt;
      if (elapsed >= DUR) { show(i + 1); return; }
      paint();
    }

    function start() {
      if (reduce) return;
      elapsed = 0; paint();
      if (raf === null) { last = 0; raf = requestAnimationFrame(frame); }
    }
    function stop() {
      if (raf !== null) { cancelAnimationFrame(raf); raf = null; last = 0; }
    }

    tabs.forEach(function (t, x) {
      t.addEventListener('click', function () { show(x); start(); });
    });
    dots.forEach(function (d, x) {
      d.addEventListener('click', function () { show(x); start(); });
    });

    hero.addEventListener('mouseenter', function () { hover = true; });
    hero.addEventListener('mouseleave', function () { hover = false; last = 0; });
    hero.addEventListener('focusin', function () { hover = true; });
    hero.addEventListener('focusout', function () { hover = false; last = 0; });

    /* Returning to a backgrounded tab: restart this slide's countdown from
       zero so the bar and the slide always agree. */
    document.addEventListener('visibilitychange', function () {
      last = 0;
      if (!document.hidden) { elapsed = 0; paint(); }
    });

    // touch swipe
    var sx = 0, sy = 0, tracking = false;
    hero.addEventListener('touchstart', function (e) {
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; tracking = true; hover = true;
    }, { passive: true });
    hero.addEventListener('touchend', function (e) {
      if (!tracking) return; tracking = false;
      var dx = e.changedTouches[0].clientX - sx;
      var dy = e.changedTouches[0].clientY - sy;
      hover = false; last = 0;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show(i + (dx < 0 ? 1 : -1));
      start();
    }, { passive: true });

    // pause when offscreen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (ents) {
        ents.forEach(function (en) {
          offscreen = !en.isIntersecting;
          last = 0;
          if (en.isIntersecting && raf === null && !reduce) raf = requestAnimationFrame(frame);
        });
      }, { threshold: .15 }).observe(hero);
    }

    show(0); start();
  }

  /* ======================================================================
     RAILS — arrow nav + edge disabling
     ====================================================================== */
  function initRails() {
    $$('.rail').forEach(function (rail) {
      // content.js injects rail items after the first bind, and replaces them
      // again when Firestore data arrives. Re-run the edge check on those later
      // passes instead of returning early, or the arrows keep the disabled state
      // computed against an empty track.
      if (rail.__b) { if (rail.__sync) rail.__sync(); return; }
      rail.__b = true;
      var track = $('.rail__track', rail);
      if (!track) return;
      var prev = $('[data-rail="prev"]', rail) || $('[data-rail="prev"][data-for="' + rail.id + '"]');
      var next = $('[data-rail="next"]', rail) || $('[data-rail="next"][data-for="' + rail.id + '"]');
      // controls may live outside the rail (in the section head)
      if (!prev && rail.id) prev = $('[data-rail="prev"][data-for="' + rail.id + '"]', document);
      if (!next && rail.id) next = $('[data-rail="next"][data-for="' + rail.id + '"]', document);

      function step() {
        var first = track.firstElementChild;
        if (!first) return track.clientWidth * 0.8;
        var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        var pitch = first.offsetWidth + gap;
        var perView = Math.max(1, Math.floor(track.clientWidth / pitch));
        return pitch * perView;   // advance whole items so scroll-snap agrees
      }
      function sync() {
        if (!prev || !next) return;
        var max = track.scrollWidth - track.clientWidth - 2;
        prev.disabled = track.scrollLeft <= 2;
        next.disabled = track.scrollLeft >= max;
        var idle = track.scrollWidth <= track.clientWidth + 4;
        prev.disabled = prev.disabled || idle;
        next.disabled = next.disabled || idle;
      }
      // Assign scrollLeft rather than passing behavior:'smooth' to scrollBy —
      // the JS smooth option is silently ignored in some engines, which left
      // these buttons inert. CSS scroll-behavior on .rail__track animates it
      // where supported and degrades to an instant jump where it does not.
      if (prev) prev.addEventListener('click', function () { track.scrollLeft -= step(); });
      if (next) next.addEventListener('click', function () { track.scrollLeft += step(); });
      track.addEventListener('scroll', sync, { passive: true });
      window.addEventListener('resize', sync);
      rail.__sync = sync;
      sync();
      setTimeout(sync, 300);
    });
  }

  /* ======================================================================
     REVEALS
     ====================================================================== */
  var rvIO = null;
  function initReveals() {
    if (reduce || !('IntersectionObserver' in window)) {
      $$('[data-rv]').forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    if (!rvIO) {
      rvIO = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target;
          var d = parseFloat(el.getAttribute('data-rv-d') || '0') * 1000;
          setTimeout(function () { el.classList.add('is-in'); }, d);
          rvIO.unobserve(el);
        });
      }, { threshold: .1, rootMargin: '0px 0px -6% 0px' });
    }
    $$('[data-rv]:not([data-rv-b])').forEach(function (el) {
      el.setAttribute('data-rv-b', '');
      rvIO.observe(el);
    });
    // stagger children of [data-rv-stagger]
    $$('[data-rv-stagger]:not([data-stag-b])').forEach(function (par) {
      par.setAttribute('data-stag-b', '');
      var step = parseFloat(par.getAttribute('data-rv-stagger')) || 0.07;
      Array.prototype.forEach.call(par.children, function (ch, n) {
        if (!ch.hasAttribute('data-rv')) {
          ch.setAttribute('data-rv', 'up');
          ch.setAttribute('data-rv-d', (n * step).toFixed(2));
          if (rvIO) { ch.setAttribute('data-rv-b', ''); rvIO.observe(ch); }
        }
      });
    });
  }

  /* ======================================================================
     COUNTERS
     ====================================================================== */
  var cIO = null;
  function animate(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var pre = el.getAttribute('data-pre') || '';
    var suf = el.getAttribute('data-suf') || '';
    if (isNaN(target)) return;
    if (reduce) { el.textContent = pre + target + suf; return; }
    var dur = 1500, t0 = null;
    function step(now) {
      if (t0 === null) t0 = now;
      var p = Math.min((now - t0) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + Math.round(target * e) + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function initCounters() {
    if (!('IntersectionObserver' in window)) return;
    if (!cIO) {
      cIO = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) { if (en.isIntersecting) { animate(en.target); cIO.unobserve(en.target); } });
      }, { threshold: .5 });
    }
    $$('[data-count]:not([data-count-b])').forEach(function (el) {
      el.setAttribute('data-count-b', '');
      cIO.observe(el);
    });
  }

  /* ======================================================================
     BACK TO TOP
     ====================================================================== */
  function initTop() {
    var b = $('#totop');
    if (!b || b.__b) return; b.__b = true;
    function s() { b.classList.toggle('is-on', window.scrollY > 700); }
    window.addEventListener('scroll', s, { passive: true });
    b.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
    s();
  }

  /* ======================================================================
     FORMS
     ====================================================================== */
  function initForms() {
    var form = $('#contactForm');
    var ok = $('#formOk');
    if (form && !form.__b) {
      form.__b = true;
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        var fd = new FormData(form);
        var payload = {
          name: fd.get('name') || '', email: fd.get('email') || '',
          organisation: fd.get('organisation') || '', country: fd.get('country') || '',
          interest: fd.get('interest') || '', message: fd.get('message') || ''
        };
        var btn = $('.form__submit', form);
        function done() { form.classList.add('is-hidden'); if (ok) ok.classList.remove('is-hidden'); }

        // Honeypot: only a bot fills a field humans cannot see. Show the same
        // success state so the bot learns nothing, but send nothing.
        if ((fd.get('website') || '').trim()) { done(); return; }

        if (window.SCF && typeof window.SCF.submitContact === 'function') {
          var label = btn ? btn.textContent : '';
          if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
          window.SCF.submitContact(payload).then(done).catch(function () {
            if (btn) { btn.disabled = false; btn.textContent = label; }
            alert('Sorry — your message could not be sent. Please email info@safecitiesfoundation.org and we will respond right away.');
          });
        } else { done(); }
      });
    }

    var nl = $('#newsletterForm');
    if (nl && !nl.__b) {
      nl.__b = true;
      nl.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = nl.querySelector('input'), btn = nl.querySelector('button');
        if (!input.value || !nl.checkValidity()) { nl.reportValidity(); return; }
        var email = input.value.trim();
        function ok() { btn.textContent = 'Subscribed ✓'; input.value = ''; input.disabled = true; btn.disabled = true; }
        if (window.SCF && typeof window.SCF.subscribe === 'function') {
          btn.disabled = true; btn.textContent = 'Adding…';
          window.SCF.subscribe(email).then(ok).catch(function () {
            btn.disabled = false; btn.textContent = 'Subscribe';
            alert('Sorry — we could not add you just now. Please email info@safecitiesfoundation.org and we will add you manually.');
          });
        } else { ok(); }
      });
    }
  }

  function setYear() {
    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ======================================================================
     BOOT
     ====================================================================== */
  function boot() {
    initVeil();
    initHeader();
    initHero();
    initRails();
    initForms();
    initTop();
    setYear();
    initReveals();
    initCounters();
  }
  if (document.readyState !== 'loading') boot();
  else document.addEventListener('DOMContentLoaded', boot);

  // after content.js injects dynamic cards
  document.addEventListener('scf:rendered', function () {
    initRails(); initReveals(); initCounters(); initTop(); setYear();
  });

  window.SCF = window.SCF || {};
  window.SCF.refresh = function () { initRails(); initReveals(); initCounters(); };
})();
