/* ==========================================================================
   Safe Cities Foundation — content layer
   --------------------------------------------------------------------------
   Projects and News are rendered from data here. This is the SINGLE seam
   where a database (Firebase Firestore) plugs in later.

   → TODAY: content is served from the SEED arrays below.
   → LATER: replace getProjects()/getNews() so they read from Firestore.
            The render functions and every page stay exactly the same.

   Any element with  data-render="projects"  or  data-render="news"
   is populated automatically (optional data-limit="N").
   ========================================================================== */
(function () {
  'use strict';

  /* -------------------- SEED DATA (edit or replace with Firebase) -------------------- */
  var SEED = {
    projects: [
      {
        title: 'School Zone Improvement — AME Zion School',
        body: 'Installation of road signs and pedestrian crossings at the AME Zion School to create a safer walking environment for pupils arriving at and leaving school each day.',
        image: 'assets/img/projects/ame-zion.jpg',
        alt: 'Road signs and pedestrian crossing installed at AME Zion School',
        tags: [{ label: 'School Zones', variant: 'orange' }, { label: 'Pedestrian Safety', variant: 'blue' }],
        status: 'Completed',
        meta: 'Kumasi, Ashanti Region · 2024'
      },
      {
        title: 'Speed Limit Signage on Major Corridors',
        body: 'Installation of 20 speed limit signs to calm traffic along two major corridors — Susanso (off the Kumasi–Accra Road) and the Metro Mass Transit route from Abrepo Junction to Sofoline Road.',
        image: 'assets/img/projects/speed-signs.jpg',
        alt: 'Speed limit signs installed along a major Kumasi corridor',
        tags: [{ label: 'Speed Management', variant: 'orange' }, { label: 'Road Safety', variant: 'gold' }],
        status: 'Completed',
        meta: 'Kumasi, Ashanti Region · 2024'
      },
      {
        title: 'Amakom Intersection Pedestrian Redesign',
        body: 'A collaboration with KNUST under the UN-Habitat programme “Enhancing Road Safety in Africa and Eastern Mediterranean Cities,” which redesigned the Amakom Intersection and installed new pedestrian signage.',
        image: '',
        alt: '',
        tags: [{ label: 'Partnership', variant: 'purple' }, { label: 'Research', variant: 'blue' }],
        status: 'Completed',
        meta: 'Kumasi, Ashanti Region · 2024–2025'
      },
      {
        title: 'School Zone Improvement — Yaa Asantewaa Corridor',
        body: 'Supported the installation of five rumble strips and accompanying road signs along the Yaa Asantewaa Corridor to slow vehicles travelling through the school zone.',
        image: 'assets/img/projects/yaa-asantewaa.jpg',
        alt: 'Rumble strips installed along the Yaa Asantewaa school corridor',
        tags: [{ label: 'School Zones', variant: 'orange' }, { label: 'Traffic Calming', variant: 'gold' }],
        status: 'Completed',
        meta: 'Kumasi, Ashanti Region · 2024–2025'
      }
    ],
    news: [
      {
        featured: true,
        badge: 'Featured Report',
        category: 'Flagship Partnership',
        title: 'Partnering with KNUST and UN-Habitat to Redesign the Amakom Intersection',
        body: 'Under the UN-Habitat programme "Enhancing Road Safety in Africa and Eastern Mediterranean Cities," we worked with KNUST to redesign the Amakom Intersection and install new pedestrian signage — improving safety for the thousands who cross it every day.',
        source: 'Safe Cities Foundation',
        date: '2024–2025'
      },
      {
        category: 'Field Update', categoryVariant: 'orange',
        title: '20 Speed Limit Signs Installed Across Susanso and the Abrepo–Sofoline Corridor',
        body: 'New speed limit signage now calms traffic along Susanso (off the Kumasi–Accra Road) and the Metro Mass Transit route from Abrepo Junction to Sofoline.',
        date: '2024'
      },
      {
        category: 'School Zones', categoryVariant: 'green',
        title: 'Road Signs and Pedestrian Crossings Completed at AME Zion School',
        body: 'Our first school-zone improvement delivered new signs and crossings to make the daily walk to and from AME Zion School safer for pupils.',
        date: '2024'
      },
      {
        category: 'Traffic Calming', categoryVariant: 'gold',
        title: 'Five Rumble Strips Installed Along the Yaa Asantewaa School Corridor',
        body: 'We supported the installation of five rumble strips and road signs along the Yaa Asantewaa Corridor to slow vehicles through the school zone.',
        date: '2024–2025'
      }
    ]
  };

  /* -------------------- DATA ACCESS (the Firebase seam) --------------------
     When Firebase is connected, these two functions will read from Firestore
     instead of SEED, and everything downstream keeps working. They already
     return a value synchronously today; the render layer also listens for a
     'scf:content-updated' event so an async source can refresh later.
  --------------------------------------------------------------------------- */
  function getProjects() {
    if (window.SCF_DATA && Array.isArray(window.SCF_DATA.projects)) return window.SCF_DATA.projects;
    return SEED.projects;
  }
  function getNews() {
    if (window.SCF_DATA && Array.isArray(window.SCF_DATA.news)) return window.SCF_DATA.news;
    return SEED.news;
  }

  /* -------------------- RENDERING -------------------- */
  var TAG_CLASS = { orange: 'tag--orange', blue: 'tag--blue', gold: 'tag--gold', purple: 'tag--purple' };
  var KICKER_CLASS = { orange: '', green: 'kicker--green', gold: 'kicker--gold' };

  function esc(s) { return String(s == null ? '' : s); }

  function projectCard(p, i) {
    var tags = (p.tags || []).map(function (t) {
      return '<span class="tag ' + (TAG_CLASS[t.variant] || 'tag--orange') + '">' + esc(t.label) + '</span>';
    }).join('');
    var media = p.image
      ? '<div class="project-card__media"><img src="' + esc(p.image) + '" alt="' + esc(p.alt || p.title) + '" loading="lazy" /></div>'
      : '<div class="project-card__media project-card__media--ph"><span class="ph-label">project photo</span></div>';
    var delay = i ? ' data-delay="' + (0.06 * (i % 3)).toFixed(2) + '"' : '';
    return '<article class="project-card" data-reveal="up"' + delay + '>' +
      media +
      '<div class="project-card__body">' +
        '<div class="tags">' + tags + '</div>' +
        '<h3>' + esc(p.title) + '</h3>' +
        '<p>' + esc(p.body) + '</p>' +
        '<div class="project-card__meta"><span class="status"><span class="dot"></span>' + esc(p.status || 'Completed') + '</span><span class="when">' + esc(p.meta) + '</span></div>' +
      '</div>' +
    '</article>';
  }

  var FEATURE_SVG = '<svg width="120" height="96" viewBox="0 0 100 80" fill="none" opacity=".5" aria-hidden="true"><path d="M5 60 L20 30 L35 45 L52 15 L68 35 L82 10 L95 25" stroke="#F5A623" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="35" cy="45" r="4" fill="#F5A623"/><circle cx="52" cy="15" r="4" fill="#E84E1B"/><circle cx="68" cy="35" r="4" fill="#F5A623"/></svg>';

  function newsFeature(n) {
    return '<article class="news-feature" data-reveal="up">' +
      '<div class="news-feature__media">' + FEATURE_SVG +
        '<span class="news-feature__badge">' + esc(n.badge || 'Featured') + '</span>' +
      '</div>' +
      '<div class="news-feature__body">' +
        '<span class="kicker">' + esc(n.category) + '</span>' +
        '<h3>' + esc(n.title) + '</h3>' +
        '<p>' + esc(n.body) + '</p>' +
        '<div class="news-feature__meta"><span>' + esc(n.source || 'Safe Cities Foundation') + '</span><span class="dot"></span><span>' + esc(n.date) + '</span><span class="dot"></span><a href="work.html#projects">Learn more →</a></div>' +
      '</div>' +
    '</article>';
  }

  function newsItem(n, i) {
    var kc = KICKER_CLASS[n.categoryVariant] || '';
    var delay = i ? ' data-delay="' + (0.06 * i).toFixed(2) + '"' : '';
    return '<article class="news-item" data-reveal="up"' + delay + '>' +
      '<span class="kicker ' + kc + '">' + esc(n.category) + '</span>' +
      '<h4>' + esc(n.title) + '</h4>' +
      '<p>' + esc(n.body) + '</p>' +
      '<div class="when">' + esc(n.date) + '</div>' +
    '</article>';
  }

  function renderProjects(el) {
    var limit = parseInt(el.getAttribute('data-limit'), 10) || 0;
    var list = getProjects();
    if (limit) list = list.slice(0, limit);
    el.innerHTML = list.map(projectCard).join('');
  }

  function renderNews(el) {
    var limit = parseInt(el.getAttribute('data-limit'), 10) || 0;
    var list = getNews().slice();
    var feat = null;
    for (var i = 0; i < list.length; i++) { if (list[i].featured) { feat = list.splice(i, 1)[0]; break; } }
    if (!feat) feat = list.shift();
    if (limit) list = list.slice(0, limit);
    el.innerHTML = (feat ? newsFeature(feat) : '') +
      '<div class="news-list">' + list.map(newsItem).join('') + '</div>';
  }

  function renderAll() {
    var i, els;
    els = document.querySelectorAll('[data-render="projects"]');
    for (i = 0; i < els.length; i++) renderProjects(els[i]);
    els = document.querySelectorAll('[data-render="news"]');
    for (i = 0; i < els.length; i++) renderNews(els[i]);
    // Let the animation layer pick up freshly-inserted cards.
    document.dispatchEvent(new CustomEvent('scf:rendered'));
  }

  // Expose for future Firebase code: window.SCF_DATA = {...}; SCF.render();
  window.SCF = window.SCF || {};
  window.SCF.render = renderAll;
  window.SCF.seed = SEED; // used by the admin page's "Import starter content"

  if (document.readyState !== 'loading') renderAll();
  else document.addEventListener('DOMContentLoaded', renderAll);

  // If an async source updates the data later, it can dispatch this event.
  document.addEventListener('scf:content-updated', renderAll);
})();
