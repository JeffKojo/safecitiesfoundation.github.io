/* ==========================================================================
   Shared chrome — utility bar, mega-menu header, mobile drawer, footer.
   Defined once, injected on every page.
   Set the active page with <body data-page="home|about|work|news">.
   ========================================================================== */
(function () {
  'use strict';

  var page = document.body.getAttribute('data-page') || '';
  var floatHdr = document.body.hasAttribute('data-float-header');

  var ICON = {
    search: '<svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="8.5" cy="8.5" r="6" stroke="currentColor" stroke-width="1.7"/><path d="M13 13l4.5 4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    close: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    arrow: '<span class="tlink__ar" aria-hidden="true"></span>',
    chevL: '<svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M11 4L6 9l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chevR: '<svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M7 4l5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    up: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M4 11l5-5 5 5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ghFlag: '<svg class="util__flag" viewBox="0 0 18 12" aria-hidden="true"><rect width="18" height="4" fill="#CE1126"/><rect y="4" width="18" height="4" fill="#FCD116"/><rect y="8" width="18" height="4" fill="#006B3F"/><path d="M9 4.6l.5 1.5h1.6l-1.3.95.5 1.55L9 7.65l-1.3.95.5-1.55-1.3-.95h1.6z" fill="#000"/></svg>',
    pin: '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 4 4.5 8.5 4.5 8.5S12.5 10 12.5 6c0-2.5-2-4.5-4.5-4.5z" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="6" r="1.6" stroke="currentColor" stroke-width="1.3"/></svg>',
    mail: '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="1" y="3.5" width="14" height="9" rx="1" stroke="currentColor" stroke-width="1.3"/><path d="M1.5 4.2L8 9l6.5-4.8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    phone: '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2.5 2h3l1.5 3.8-1.9 1.1c.9 2.1 2.6 3.8 4.7 4.7l1.1-1.9L14.5 11v3c0 .3-.2.5-.5.5C7.2 14.5 1.5 8.8 1.5 2.5c0-.3.2-.5.5-.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>'
  };

  /* ---------- Social profiles ----------
     Add your real profile URLs here and the icons appear automatically in the
     footer and the contact section. Leave a value empty ('') and that icon is
     hidden — better an absent icon than a link that goes nowhere.          */
  var SOCIAL_URLS = {
    x:  '',
    li: 'https://www.linkedin.com/company/safe-cities-foundation/',
    fb: ''
  };

  var SOCIAL = {
    x: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M12.8 2h2.1l-4.6 5.3L15.6 14h-4.3L8 9.9 4.2 14H2.1l4.8-5.5L1.9 2h4.4l3 4z" fill="currentColor"/></svg>',
    li: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M5 6.8V12M5 4.6v.02M8.2 12V8.9c0-1 .8-1.9 1.9-1.9s1.9.9 1.9 1.9V12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    fb: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.8" stroke="currentColor" stroke-width="1.4"/><path d="M10 4.6H8.9c-.9 0-1.6.7-1.6 1.6v1.1H5.9v2h1.4v4.1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M5.9 9.3h4" stroke="currentColor" stroke-width="1.4"/></svg>'
  };

  var SOCIAL_LABEL = { x: 'X (Twitter)', li: 'LinkedIn', fb: 'Facebook' };
  function socialHTML(cls) {
    return Object.keys(SOCIAL_URLS).filter(function (k) { return SOCIAL_URLS[k]; }).map(function (k) {
      return '<a class="' + cls + '" href="' + SOCIAL_URLS[k] + '" target="_blank" rel="noopener" ' +
        'aria-label="Safe Cities Foundation on ' + SOCIAL_LABEL[k] + '">' + SOCIAL[k] + '</a>';
    }).join('');
  }

  /* ---------- Nav model: one source of truth for desktop + drawer ---------- */
  var NAV = [
    { id: 'home', label: 'Home', href: 'index.html' },
    {
      id: 'about', label: 'About', href: 'about.html',
      cols: [
        { h: 'Our Story', links: [
          { t: 'Who we are', d: 'A Ghanaian NGO for people-centred cities', h: 'about.html#story' },
          { t: 'Mission, vision & values', h: 'about.html#vmv' },
          { t: 'Our approach', d: 'Advocacy, co-design, evidence', h: 'about.html#approach' }
        ]},
        { h: 'People & Governance', links: [
          { t: 'Leadership & team', d: 'The people behind the work', h: 'team.html' },
          { t: 'Registration & accountability', h: 'about.html#governance' },
          { t: 'Partners & collaborators', h: 'about.html#partners' },
          { t: 'Contact us', h: 'index.html#contact' }
        ]}
      ],
      spot: [
        { img: 'assets/img/projects/ame-zion-200.webp', k: 'Approach', t: 'Why we design streets with communities, not for them', h: 'about.html#approach' },
        { img: 'assets/img/projects/speed-signs-200.webp', k: 'Impact', t: '20 speed limit signs across two major corridors', h: 'work.html#projects' }
      ]
    },
    {
      id: 'work', label: 'Our Work', href: 'work.html',
      cols: [
        { h: 'Focus Areas', links: [
          { t: 'Urban mobility advocacy', h: 'work.html#fa-mobility' },
          { t: 'Community-led spatial planning', h: 'work.html#fa-planning' },
          { t: 'Data-driven research', h: 'work.html#fa-research' },
          { t: 'Policy engagement', h: 'work.html#fa-policy' },
          { t: 'Capacity building', h: 'work.html#fa-capacity' },
          { t: 'Knowledge exchange', h: 'work.html#fa-knowledge' }
        ]},
        { h: 'Projects & Impact', links: [
          { t: 'All projects', d: 'Everything we have delivered', h: 'work.html#projects' },
          { t: 'Our impact', d: 'Measurable change on the ground', h: 'work.html#impact' },
          { t: 'Partner on a project', h: 'index.html#contact' }
        ]}
      ],
      spot: [
        { img: 'assets/img/projects/yaa-asantewaa-200.webp', k: 'Project', t: 'Rumble strips slow traffic on the Yaa Asantewaa corridor', h: 'work.html#projects' },
        { img: 'assets/img/projects/ame-zion-200.webp', k: 'School Zones', t: 'Safer crossings for pupils at AME Zion School', h: 'work.html#projects' }
      ]
    },
    {
      id: 'news', label: 'News', href: 'news.html',
      cols: [
        { h: 'Latest', links: [
          { t: 'All news & insights', h: 'news.html' },
          { t: 'Field updates', h: 'news.html' },
          { t: 'Reports & publications', h: 'news.html' },
          { t: 'Partnerships', h: 'news.html' }
        ]},
        { h: 'Get Involved', links: [
          { t: 'Partner with us', h: 'index.html#contact' },
          { t: 'Support our work', h: 'index.html#cta' },
          { t: 'Work with us', d: 'Roles and fellowships', h: 'index.html#contact' }
        ]}
      ],
      spot: [
        { img: 'assets/img/projects/speed-signs-200.webp', k: 'Partnership', t: 'Redesigning the Amakom Intersection with KNUST & UN-Habitat', h: 'news.html' }
      ]
    }
  ];

  var POPULAR = ['road safety', 'school zones', 'Kumasi', 'pedestrian crossings', 'research', 'partnerships'];

  /* ---------- Build header ---------- */
  function megaHTML(item) {
    var cols = item.cols.map(function (c) {
      return '<div class="mega__col"><h5>' + c.h + '</h5>' +
        c.links.map(function (l) {
          return '<a href="' + l.h + '">' + l.t + (l.d ? '<span class="d">' + l.d + '</span>' : '') + '</a>';
        }).join('') + '</div>';
    }).join('');
    var spot = item.spot && item.spot.length
      ? '<div class="mega__spot"><h5>Spotlight</h5>' + item.spot.map(function (s) {
          return '<a class="sp" href="' + s.h + '"><img src="' + s.img + '" alt="" loading="lazy" /><span><b>' + s.k + '</b>' + s.t + '</span></a>';
        }).join('') + '</div>'
      : '';
    return '<div class="mega" id="mega-' + item.id + '" role="region" aria-label="' + item.label + ' menu">' +
      '<div class="wrap mega__in">' + cols + spot + '</div></div>';
  }

  var navHTML = NAV.map(function (item) {
    if (!item.cols) {
      return '<a class="hdr__link' + (page === item.id ? ' is-active' : '') + '" href="' + item.href + '">' + item.label + '</a>';
    }
    return '<button class="hdr__link' + (page === item.id ? ' is-active' : '') + '" type="button" ' +
      'data-mega="' + item.id + '" aria-expanded="false" aria-controls="mega-' + item.id + '">' +
      item.label + '<span class="chev" aria-hidden="true"></span></button>';
  }).join('');

  var HEADER =
    '<a class="skip" href="#main">Skip to content</a>' +
    '<div class="util"><div class="wrap util__in">' +
      '<div class="util__l">' + ICON.ghFlag + '<span>Registered NGO · Kumasi, Ghana · Serving Africa</span></div>' +
      '<div class="util__r">' +
        '<a href="mailto:info@safecitiesfoundation.org">info@safecitiesfoundation.org</a>' +
        '<a href="tel:+233243628336">+233 24 362 8336</a>' +
      '</div>' +
    '</div></div>' +
    '<header class="hdr' + (floatHdr ? ' hdr--float' : '') + '" id="hdr">' +
      '<div class="wrap hdr__in">' +
        '<a class="hdr__logo" href="index.html" aria-label="Safe Cities Foundation — home">' +
          '<img class="hdr__logo--dark" src="assets/img/logo/fc_horizontal.png" alt="Safe Cities Foundation" />' +
          (floatHdr ? '<img class="hdr__logo--light" src="assets/img/logo/logo-white-horizontal.png" alt="Safe Cities Foundation" />' : '') +
        '</a>' +
        '<nav class="hdr__nav" aria-label="Main">' + navHTML + '</nav>' +
        '<div class="hdr__tools">' +
          '<button class="hdr__ico hdr__ico--search" id="searchBtn" type="button" aria-label="Search" aria-expanded="false">' + ICON.search + '</button>' +
          '<a class="btn hdr__cta" href="index.html#contact">Get Involved</a>' +
          '<button class="burger" id="burger" type="button" aria-label="Open menu" aria-expanded="false"><i></i></button>' +
        '</div>' +
      '</div>' +
      NAV.filter(function (n) { return n.cols; }).map(megaHTML).join('') +
      '<div class="search" id="searchPanel" role="region" aria-label="Site search">' +
        '<div class="wrap search__in">' +
          '<form class="search__form" id="searchForm" role="search">' +
            '<input type="search" name="q" placeholder="Search projects, news, reports…" aria-label="Search the site" />' +
            '<button type="submit" aria-label="Submit search">' + ICON.search + '</button>' +
          '</form>' +
          '<div class="search__pop"><span>Popular</span>' +
            POPULAR.map(function (p) { return '<a href="work.html?q=' + encodeURIComponent(p) + '">' + p + '</a>'; }).join('') +
          '</div>' +
        '</div>' +
      '</div>' +
    '</header>' +
    '<div class="scrim" id="scrim"></div>' +
    /* ---- drawer ---- */
    '<aside class="drawer" id="drawer" aria-label="Menu" aria-hidden="true">' +
      '<div class="drawer__top">' +
        '<img src="assets/img/logo/fc_horizontal.png" alt="Safe Cities Foundation" />' +
        '<button class="hdr__ico" id="drawerClose" type="button" aria-label="Close menu">' + ICON.close + '</button>' +
      '</div>' +
      '<div class="drawer__body">' +
        '<form class="drawer__search" id="drawerSearch" role="search">' +
          '<input type="search" name="q" placeholder="Search…" aria-label="Search the site" />' +
          '<button type="submit" aria-label="Search" style="color:var(--orange);display:grid;place-items:center">' + ICON.search + '</button>' +
        '</form>' +
        NAV.map(function (item) {
          if (!item.cols) return '<a class="drawer__flat" href="' + item.href + '">' + item.label + '</a>';
          var inner = item.cols.map(function (c) {
            return '<h6>' + c.h + '</h6>' + c.links.map(function (l) { return '<a href="' + l.h + '">' + l.t + '</a>'; }).join('');
          }).join('');
          return '<div class="acc">' +
            '<button class="acc__hd" type="button" aria-expanded="false">' + item.label + '<span class="pm" aria-hidden="true"></span></button>' +
            '<div class="acc__bd"><div class="acc__bd-in">' +
              '<a href="' + item.href + '" style="font-weight:600;color:var(--navy)">Overview</a>' + inner +
            '</div></div></div>';
        }).join('') +
        '<a class="btn drawer__cta" href="index.html#contact">Get Involved</a>' +
        '<div class="drawer__meta">' +
          'No. 12, 2nd Close, Odeneho Kwadaso<br />Kumasi · Ashanti Region · Ghana<br />' +
          '<a href="mailto:info@safecitiesfoundation.org" style="color:var(--orange)">info@safecitiesfoundation.org</a>' +
        '</div>' +
      '</div>' +
    '</aside>';

  /* ---------- Footer ---------- */
  var FOOTER =
    '<footer class="ftr">' +
      '<div class="wrap ftr__top"><div class="ftr__grid">' +
        '<div class="ftr__brand">' +
          '<img src="assets/img/logo/logo-white-horizontal.png" alt="Safe Cities Foundation" />' +
          '<p>Advocating for compact, resilient and inclusive urban spaces across the African continent — transforming how cities move, grow and serve their people.</p>' +
          '<div class="ftr__chip">' + ICON.ghFlag + 'Based in Ghana · Serving Africa</div>' +
          (socialHTML('') ? '<div class="ftr__socials">' + socialHTML('') + '</div>' : '') +
        '</div>' +
        '<div class="ftr__col"><h5>Organisation</h5>' +
          '<a href="about.html">About us</a><a href="team.html">Leadership &amp; team</a>' +
          '<a href="about.html#approach">Our approach</a><a href="about.html#partners">Partners</a>' +
        '</div>' +
        '<div class="ftr__col"><h5>Our Work</h5>' +
          '<a href="work.html#programs">Focus areas</a><a href="work.html#projects">Projects</a>' +
          '<a href="work.html#impact">Impact</a><a href="news.html">Reports</a>' +
        '</div>' +
        '<div class="ftr__col"><h5>Connect</h5>' +
          '<a href="index.html#contact">Contact us</a><a href="index.html#cta">Support our work</a>' +
          '<a href="index.html#contact">Work with us</a><a href="news.html">Newsroom</a>' +
          '<div class="ftr__nl">' +
            '<p>Updates on our work, a few times a year.</p>' +
            '<form class="ftr__nl-row" id="newsletterForm">' +
              '<input type="email" placeholder="Your email" aria-label="Email address" required />' +
              '<button type="submit">Subscribe</button>' +
            '</form>' +
          '</div>' +
        '</div>' +
      '</div></div>' +
      '<div class="wrap"><div class="ftr__bot">' +
        '<p>© <span data-year>2026</span> Safe Cities Foundation. Registered Non-Governmental Organisation, Ghana.</p>' +
        '<div class="ftr__legal"><a href="privacy.html">Privacy notice</a><a href="terms.html">Terms of use</a></div>' +
      '</div></div>' +
    '</footer>' +
    '<button class="totop" id="totop" type="button" aria-label="Back to top">' + ICON.up + '</button>';

  var hs = document.getElementById('site-header');
  var fs = document.getElementById('site-footer');
  if (hs) hs.outerHTML = HEADER;
  if (fs) fs.outerHTML = FOOTER;

  /* Fill any [data-socials] container from the same config */
  Array.prototype.forEach.call(document.querySelectorAll('[data-socials]'), function (el) {
    var html = socialHTML('social');
    if (html) el.innerHTML = html; else el.remove();
  });

  /* Expose icons for other modules */
  window.SCF = window.SCF || {};
  window.SCF.icons = ICON;
})();
