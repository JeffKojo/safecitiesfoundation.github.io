/* ==========================================================================
   Content layer — Projects & News data, list rendering, and detail pages.
   The SINGLE seam where Firestore plugs in: getProjects() / getNews().

   List containers (declarative):
     <div data-render="projects"  data-limit="3"></div>
     <div data-render="news"      data-limit="2"></div>
     <div data-render="latest"    data-limit="8"></div>
     <div data-render="spotlight" data-limit="3"></div>
   Detail mounts:
     <div data-render="article"></div>   on article.html?id=…
     <div data-render="project"></div>   on project.html?id=…
   Supports ?q= search filtering on list pages.
   ========================================================================== */
(function () {
  'use strict';

  /* -------------------- SEED (fallback + admin import) -------------------- */
  var SEED = {
    projects: [
      {
        title: 'School Zone Improvement — AME Zion School',
        body: 'Installation of road signs and pedestrian crossings at the AME Zion School to create a safer walking environment for pupils arriving at and leaving school each day.',
        content: 'The stretch of road outside AME Zion School carries a steady flow of traffic through the morning and afternoon peaks, precisely when hundreds of pupils are arriving and leaving. Drivers had no advance warning that they were entering a school zone, and children were crossing wherever a gap appeared.\n\nWorking with the school administration and the surrounding community, we identified the two crossing points pupils actually use, rather than the ones a plan might assume. Pedestrian crossings were marked at both, and warning signage was installed on the approaches in each direction so that drivers slow before they reach the gate.\n\nThis was our first school-zone improvement, and it set the pattern for the work that followed: observe how a street is really used, agree the intervention with the people who use it, install, then come back to see whether it changed behaviour.',
        image: 'assets/img/projects/ame-zion.jpg',
        alt: 'New road signs and pedestrian crossing outside AME Zion School',
        tags: [{ label: 'School Zones', variant: 'orange' }, { label: 'Pedestrian Safety', variant: 'blue' }],
        status: 'Completed', meta: 'Kumasi, Ashanti Region · 2024',
        location: 'Kumasi, Ashanti Region', period: '2024',
        partners: 'AME Zion School administration, local community'
      },
      {
        title: 'Speed Limit Signage on Major Corridors',
        body: 'Installation of 20 speed limit signs to calm traffic along two major corridors: Susanso (off the Kumasi–Accra Road) and the Metro Mass Transit route from Abrepo Junction to Sofoline Road.',
        content: 'Two corridors carry a disproportionate share of Kumasi\u2019s through traffic: Susanso, just off the Kumasi\u2013Accra Road, and the Metro Mass Transit route running from Abrepo Junction to Sofoline Road. Both pass directly through residential and commercial areas where people cross on foot all day, and neither had consistent speed limit signage.\n\nWe installed twenty speed limit signs across the two routes, placed at the points where vehicles typically accelerate and where pedestrian activity is heaviest. The positions were chosen from observation rather than uniform spacing: junctions, market frontages and the approaches to informal crossing points.\n\nSignage alone does not solve speeding, and we are clear about that. What it does is establish a legal limit that can be enforced, give drivers an unambiguous expectation, and create the baseline against which further measures (enforcement, physical calming, road design changes) can be argued for with evidence.',
        image: 'assets/img/projects/speed-signs.jpg',
        alt: 'Speed limit signage installed along a major Kumasi corridor',
        tags: [{ label: 'Speed Management', variant: 'orange' }, { label: 'Road Safety', variant: 'gold' }],
        status: 'Completed', meta: 'Kumasi, Ashanti Region · 2024',
        location: 'Susanso & Abrepo–Sofoline, Kumasi', period: '2024',
        partners: 'Department of Urban Roads'
      },
      {
        title: 'Amakom Intersection Pedestrian Redesign',
        body: 'A collaboration with KNUST under the UN-Habitat programme “Enhancing Road Safety in Africa and Eastern Mediterranean Cities,” which redesigned the Amakom Intersection and installed new pedestrian signage.',
        content: 'The Amakom Intersection is one of the busiest crossing points in Kumasi, and one of the least forgiving for people on foot. It became the focus of our collaboration with the Kwame Nkrumah University of Science and Technology under the UN-Habitat programme “Enhancing Road Safety in Africa and Eastern Mediterranean Cities.”\n\nThe work combined KNUST\u2019s technical capacity with our community engagement approach. Pedestrian movements through the intersection were mapped, conflict points between vehicles and people were identified, and a revised layout was developed to shorten and clarify crossing routes. New pedestrian signage was installed to support the redesign.\n\nWorking inside an international programme framework gave the project reporting standards and technical review that a young organisation benefits from. It also demonstrated something we intend to repeat: that local NGOs, universities and multilateral programmes can each contribute a distinct capability to the same street.',
        image: '', alt: '',
        tags: [{ label: 'Partnership', variant: 'purple' }, { label: 'Research', variant: 'blue' }],
        status: 'Completed', meta: 'Kumasi, Ashanti Region · 2024–2025',
        location: 'Amakom, Kumasi', period: '2024–2025',
        partners: 'KNUST, UN-Habitat'
      },
      {
        title: 'School Zone Improvement — Yaa Asantewaa Corridor',
        body: 'Supported the installation of five rumble strips and accompanying road signs along the Yaa Asantewaa Corridor to slow vehicles travelling through the school zone.',
        content: 'The Yaa Asantewaa Corridor runs past a school, and vehicles were travelling through it at speeds that left drivers little room to react. Signage had already been tried on comparable stretches; here the need was for something that changes driver behaviour physically rather than by instruction.\n\nWe supported the installation of five rumble strips along the corridor, positioned on the approaches to the school zone, with accompanying road signs so that the strips are anticipated rather than a surprise. Rumble strips are deliberately modest infrastructure: they are cheap, they need no enforcement to work, and drivers feel them whether or not they were paying attention.\n\nThe corridor is now noticeably slower through the school frontage. We are monitoring it alongside our other school-zone sites to build a comparative picture of which measures hold up over time.',
        image: 'assets/img/projects/yaa-asantewaa.jpg',
        alt: 'Rumble strips and signage along the Yaa Asantewaa corridor',
        tags: [{ label: 'School Zones', variant: 'orange' }, { label: 'Traffic Calming', variant: 'gold' }],
        status: 'Completed', meta: 'Kumasi, Ashanti Region · 2024–2025',
        location: 'Yaa Asantewaa Corridor, Kumasi', period: '2024–2025',
        partners: 'School community, Department of Urban Roads'
      }
    ],
    news: [
      {
        featured: true, badge: 'Featured Report', category: 'Flagship Partnership',
        title: 'Partnering with KNUST and UN-Habitat to redesign the Amakom Intersection',
        body: 'Under the UN-Habitat programme “Enhancing Road Safety in Africa and Eastern Mediterranean Cities,” we worked with KNUST to redesign the Amakom Intersection and install new pedestrian signage, improving safety for the thousands who cross it every day.',
        content: 'Amakom is where a great many of Kumasi\u2019s daily journeys converge, and for people on foot it has long been the hardest kind of place to cross: wide, busy, and laid out for vehicle throughput rather than pedestrian movement.\n\nOver 2024 and 2025 we worked with the Kwame Nkrumah University of Science and Technology on a redesign of the intersection, delivered under the UN-Habitat programme “Enhancing Road Safety in Africa and Eastern Mediterranean Cities.” KNUST brought the engineering and analytical capacity; we brought the community engagement and the on-the-ground observation of how the intersection is actually used.\n\nThe redesign shortened and clarified pedestrian crossing routes and was supported by new signage installed across the junction. For the thousands of people who cross Amakom every day, whether traders, commuters or schoolchildren, the change is measured in seconds of exposure to traffic, which is exactly the currency that matters.\n\nThe partnership also mattered for what it proved. A young Ghanaian NGO, a national university and a multilateral programme each contributed something the others could not, on a single intersection, and the work got built. That is the model we intend to scale.',
        image: 'assets/img/projects/speed-signs.jpg',
        source: 'Safe Cities Foundation', date: '2024–2025'
      },
      {
        category: 'Field Update', categoryVariant: 'orange',
        title: '20 speed limit signs installed across Susanso and the Abrepo–Sofoline corridor',
        body: 'New speed limit signage now calms traffic along Susanso (off the Kumasi–Accra Road) and the Metro Mass Transit route from Abrepo Junction to Sofoline.',
        content: 'Twenty new speed limit signs are now in place across two of Kumasi\u2019s heavier-trafficked routes: Susanso, off the Kumasi\u2013Accra Road, and the Metro Mass Transit corridor between Abrepo Junction and Sofoline Road.\n\nBoth corridors run through areas where people are on foot throughout the day, and neither carried consistent speed limit signage before this work. Sign positions were chosen from observation rather than at uniform intervals: the points where vehicles pick up speed, and the frontages and junctions where pedestrian activity concentrates.\n\nWe are candid that signage is a first step rather than a solution. Its value is that it establishes an enforceable limit and a clear expectation for drivers, and gives us the baseline needed to argue for physical calming measures where speeds stay high.',
        date: '2024'
      },
      {
        category: 'School Zones', categoryVariant: 'green',
        title: 'Road signs and pedestrian crossings completed at AME Zion School',
        body: 'Our first school-zone improvement delivered new signs and crossings to make the daily walk to and from AME Zion School safer for pupils.',
        content: 'Our first school-zone improvement is complete. Pedestrian crossings have been marked and warning signage installed on the approaches to AME Zion School, where hundreds of pupils arrive and leave each day through moving traffic.\n\nRather than assume where children should cross, we spent time observing where they do cross, and marked those points. Signage was placed far enough back on each approach that drivers slow before reaching the school gate rather than at it.\n\nThe project established the working pattern we have used since: observe, agree the intervention with the school and surrounding community, install, and return afterwards to check whether behaviour actually changed.',
        date: '2024'
      },
      {
        category: 'Traffic Calming', categoryVariant: 'gold',
        title: 'Five rumble strips installed along the Yaa Asantewaa school corridor',
        body: 'We supported the installation of five rumble strips and road signs along the Yaa Asantewaa Corridor to slow vehicles through the school zone.',
        content: 'Five rumble strips and accompanying road signs are now installed along the Yaa Asantewaa Corridor, on the approaches to the school zone.\n\nWhere signage instructs, rumble strips intervene. They are inexpensive, they require no enforcement to be effective, and a driver feels them whether or not they were paying attention to a sign. On a corridor where vehicles were passing a school frontage at speed, that difference matters.\n\nTraffic through the school frontage is now noticeably slower. We are tracking the corridor alongside our other school-zone sites to understand which measures hold their effect over time, the kind of comparative evidence Ghanaian cities currently lack.',
        date: '2024–2025'
      }
    ],
    team: [
      {
        name: 'Akwasi Wireko Brobby', role: 'Executive Director', leadership: true, order: 0, image: '',
        bio: 'Leads Safe Cities Foundation\u2019s strategy, partnerships and institutional relationships, including our collaborations with KNUST, the Kumasi Metropolitan Assembly and the Department of Urban Roads. Responsible to the board for the organisation\u2019s programme direction and accountability.'
      },
      {
        name: 'Jeff Kojo Nathan', role: 'Programme Coordinator, Urban Safety Initiatives', order: 1, image: '',
        bio: 'Coordinates the delivery of school-zone improvements, signage and traffic-calming interventions, from site assessment through installation and follow-up.'
      },
      {
        name: 'Philemon Kwaku Nkrumah', role: 'Programme Coordinator, Community Engagement', order: 2, image: '',
        bio: 'Leads the participatory side of our work, convening residents, traders, schools and drivers so that interventions are agreed with the people who use the street daily.'
      },
      {
        name: 'Carmilla Mensah', role: 'Research Officer', order: 3, image: '',
        bio: 'Pedestrian counts, conflict-point analysis and survey design, building the evidence base that our advocacy and project prioritisation rest on.'
      },
      {
        name: 'Fiifi Amoako A.P Essiam', role: 'Research Officer', order: 4, image: '',
        bio: 'Spatial data and mapping, incident-record analysis and reporting, turning field observation into the documentation we publish.'
      }
    ],
    partners: [
      { name: 'KNUST', order: 0 },
      { name: 'Kumasi Metropolitan Assembly', order: 1 },
      { name: 'Department of Urban Roads', order: 2 },
      { name: 'Ghana Highways Authority', order: 3 },
      { name: 'Department of Feeder Roads', order: 4 },
      { name: 'National Road Safety Authority', order: 5 }
    ]
  };

  /* -------------------- DATA ACCESS (Firebase seam) -------------------- */
  function getProjects() {
    if (window.SCF_DATA && Array.isArray(window.SCF_DATA.projects) && window.SCF_DATA.projects.length) return window.SCF_DATA.projects;
    return SEED.projects;
  }
  function getNews() {
    if (window.SCF_DATA && Array.isArray(window.SCF_DATA.news) && window.SCF_DATA.news.length) return window.SCF_DATA.news;
    return SEED.news;
  }
  function getTeam() {
    if (window.SCF_DATA && Array.isArray(window.SCF_DATA.team) && window.SCF_DATA.team.length) return window.SCF_DATA.team;
    return SEED.team;
  }
  function getPartners() {
    if (window.SCF_DATA && Array.isArray(window.SCF_DATA.partners) && window.SCF_DATA.partners.length) return window.SCF_DATA.partners;
    return SEED.partners;
  }

  /* -------------------- helpers -------------------- */
  var TAG = { orange: 'tag--orange', blue: 'tag--blue', gold: 'tag--gold', purple: 'tag--purple' };
  var KICK = { orange: '', green: 'litem__k--green', gold: 'litem__k--gold', blue: 'litem__k--blue' };
  var ARROW = '<span class="tlink__ar" aria-hidden="true"></span>';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function slug(s) {
    return String(s || '').toLowerCase()
      .replace(/[\u2018\u2019\u201c\u201d]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70);
  }
  /* Stable key: Firestore doc id when present, otherwise a title slug so the
     seed fallback and pre-Firebase links keep working. */
  function keyOf(o) { return o.id || slug(o.title); }

  function param(name) {
    try { return (new URLSearchParams(location.search).get(name) || '').trim(); }
    catch (_) { return ''; }
  }
  function query() { return param('q').toLowerCase(); }

  function matches(o, q) {
    if (!q) return true;
    var hay = [o.title, o.body, o.content, o.meta, o.category, o.status, o.date, o.location, o.partners]
      .concat((o.tags || []).map(function (t) { return t && t.label; }))
      .join(' ').toLowerCase();
    return q.split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
  }
  function find(list, k) {
    if (!k) return null;
    for (var i = 0; i < list.length; i++) if (keyOf(list[i]) === k) return list[i];
    return null;
  }
  function paras(text) {
    var t = String(text || '').trim();
    if (!t) return '';
    return t.split(/\n\s*\n/).map(function (p) {
      return '<p>' + esc(p.trim()).replace(/\n/g, '<br />') + '</p>';
    }).join('');
  }

  var GRAPHIC = '<div class="fnews__ph" aria-hidden="true">' +
    '<svg width="150" height="118" viewBox="0 0 100 80" fill="none">' +
    '<path d="M5 62 L20 32 L35 47 L52 16 L68 36 L82 11 L95 26" stroke="#F5A623" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>' +
    '<circle cx="35" cy="47" r="3.6" fill="#F5A623"/><circle cx="52" cy="16" r="3.6" fill="#E84E1B"/><circle cx="68" cy="36" r="3.6" fill="#F5A623"/>' +
    '</svg></div>';

  /* Responsive image helper.
     Bundled project photos have pre-built WebP derivatives, so those get a
     <picture> with a srcset. Photos uploaded through the admin arrive as data
     URIs (already resized in the browser) and are emitted as a plain <img>. */
  var ASSET_RE = /^assets\/img\/projects\/([a-z0-9-]+)\.jpg$/i;
  function pictureTag(src, alt, sizes, eager) {
    var s = String(src || '');
    var load = eager ? '' : ' loading="lazy" decoding="async"';
    var m = s.match(ASSET_RE);
    if (!m) return '<img src="' + esc(s) + '" alt="' + esc(alt) + '"' + load + ' />';
    var n = m[1];
    return '<picture>' +
      '<source type="image/webp" sizes="' + sizes + '" srcset="' +
        'assets/img/projects/' + n + '-600.webp 600w, ' +
        'assets/img/projects/' + n + '-1000.webp 1000w" />' +
      '<img src="' + esc(s) + '" alt="' + esc(alt) + '"' + load + ' />' +
    '</picture>';
  }

  var CARD_SIZES = '(max-width: 700px) 92vw, (max-width: 1120px) 46vw, 30vw';
  var WIDE_SIZES = '(max-width: 900px) 100vw, 52vw';
  var HERO_SIZES = '(max-width: 1320px) 92vw, 1220px';
  var PORTRAIT_SIZES = '(max-width: 620px) 92vw, (max-width: 1120px) 44vw, 300px';

  /* -------------------- LIST renderers -------------------- */
  function projectCard(p) {
    var tags = (p.tags || []).filter(function (t) { return t && t.label; }).map(function (t) {
      return '<span class="tag ' + (TAG[t.variant] || 'tag--orange') + '">' + esc(t.label) + '</span>';
    }).join('');
    var media = p.image
      ? pictureTag(p.image, p.alt || p.title, CARD_SIZES)
      : '<div class="pcard__ph"><span>project photo</span></div>';
    return '<a class="pcard" href="project.html?id=' + encodeURIComponent(keyOf(p)) + '">' +
      '<div class="pcard__media">' +
        '<span class="pcard__badge"><span class="d"></span>' + esc(p.status || 'Completed') + '</span>' +
        media +
      '</div>' +
      '<div class="pcard__body">' +
        (tags ? '<div class="tags">' + tags + '</div>' : '') +
        '<h3 class="pcard__t">' + esc(p.title) + '</h3>' +
        '<p class="pcard__b">' + esc(p.body) + '</p>' +
        '<div class="pcard__meta"><span>' + esc(p.meta) + '</span>' +
          '<span class="pcard__more">Read more' + ARROW + '</span></div>' +
      '</div></a>';
  }

  function featuredNews(n) {
    var href = 'article.html?id=' + encodeURIComponent(keyOf(n));
    var media = n.image
      ? pictureTag(n.image, n.alt || n.title, WIDE_SIZES)
      : GRAPHIC;
    return '<article class="fnews">' +
      '<a class="fnews__media" href="' + href + '" aria-label="' + esc(n.title) + '">' + media +
        '<span class="fnews__tag">' + esc(n.badge || 'Featured') + '</span>' +
      '</a>' +
      '<div class="fnews__body">' +
        '<span class="fnews__k">' + esc(n.category) + '</span>' +
        '<h3 class="d3 fnews__t"><a href="' + href + '">' + esc(n.title) + '</a></h3>' +
        '<p class="fnews__b">' + esc(n.body) + '</p>' +
        '<div class="fnews__m"><span>' + esc(n.source || 'Safe Cities Foundation') + '</span>' +
          '<span class="d"></span><span>' + esc(n.date) + '</span></div>' +
        '<div style="margin-top:22px"><a class="tlink tlink--light" href="' + href + '">Read the full story' + ARROW + '</a></div>' +
      '</div></article>';
  }

  function listItem(n) {
    return '<a class="litem" href="article.html?id=' + encodeURIComponent(keyOf(n)) + '">' +
      '<div class="litem__k ' + (KICK[n.categoryVariant] || '') + '">' + esc(n.category || 'Update') + '</div>' +
      '<h3 class="litem__t">' + esc(n.title) + '</h3>' +
      '<div class="litem__d">' + esc(n.date) + '</div>' +
    '</a>';
  }

  function newsCard(n) {
    return '<a class="tcard" href="article.html?id=' + encodeURIComponent(keyOf(n)) + '">' +
      '<div class="litem__k ' + (KICK[n.categoryVariant] || '') + '" style="margin-bottom:14px">' + esc(n.category || 'Update') + '</div>' +
      '<h3 class="h4 tcard__t">' + esc(n.title) + '</h3>' +
      '<p class="tcard__b">' + esc(n.body) + '</p>' +
      '<div class="tcard__f" style="display:flex;align-items:center;justify-content:space-between;gap:12px">' +
        '<span class="litem__d">' + esc(n.date) + '</span>' +
        '<span class="tlink" style="padding:0">Read' + ARROW + '</span>' +
      '</div></a>';
  }

  function spotRow(n) {
    return '<a class="spot__row" href="article.html?id=' + encodeURIComponent(keyOf(n)) + '">' +
      '<div class="spot__k">' + esc(n.category || 'Update') + '</div>' +
      '<div><div class="spot__t">' + esc(n.title) + '</div>' +
      '<p class="spot__b">' + esc(n.body) + '</p></div>' +
      '<span class="spot__ar tlink__ar" aria-hidden="true"></span>' +
    '</a>';
  }

  function emptyState(what, q) {
    return '<div style="grid-column:1/-1;padding:56px 0;text-align:center;color:var(--muted)">' +
      '<p class="lede" style="margin-bottom:8px">No ' + what + ' matched \u201c' + esc(q) + '\u201d.</p>' +
      '<a class="tlink" href="' + location.pathname.split('/').pop() + '">Clear search' + ARROW + '</a></div>';
  }

  /* -------------------- DETAIL renderers -------------------- */
  function notFound(kind, backHref, backLabel) {
    return '<div class="wrap" style="padding-block:clamp(80px,12vw,160px);text-align:center">' +
      '<p class="eyebrow eyebrow--plain eyebrow--mute" style="display:block;margin-bottom:14px">Not found</p>' +
      '<h1 class="d2" style="margin-bottom:16px">We couldn\u2019t find that ' + kind + '</h1>' +
      '<p class="lede" style="max-width:46ch;margin:0 auto 28px">It may have been moved or removed. Everything we have published is listed on the ' + backLabel.toLowerCase() + ' page.</p>' +
      '<a class="btn" href="' + backHref + '">' + backLabel + ARROW + '</a></div>';
  }

  function shareBar(title) {
    var u = encodeURIComponent(location.href), t = encodeURIComponent(title);
    return '<div class="art__share">' +
      '<span class="detail__l">Share</span>' +
      '<a class="social" target="_blank" rel="noopener" aria-label="Share on X" href="https://twitter.com/intent/tweet?url=' + u + '&text=' + t + '"><svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M12.8 2h2.1l-4.6 5.3L15.6 14h-4.3L8 9.9 4.2 14H2.1l4.8-5.5L1.9 2h4.4l3 4z" fill="currentColor"/></svg></a>' +
      '<a class="social" target="_blank" rel="noopener" aria-label="Share on LinkedIn" href="https://www.linkedin.com/sharing/share-offsite/?url=' + u + '"><svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M5 6.8V12M5 4.6v.02M8.2 12V8.9c0-1 .8-1.9 1.9-1.9s1.9.9 1.9 1.9V12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></a>' +
      '<a class="social" target="_blank" rel="noopener" aria-label="Share by email" href="mailto:?subject=' + t + '&body=' + u + '"><svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="1" y="3.5" width="14" height="9" rx="1" stroke="currentColor" stroke-width="1.35"/><path d="M1.5 4.2L8 9l6.5-4.8" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/></svg></a>' +
    '</div>';
  }

  function renderArticle(mount) {
    var all = getNews();
    var item = find(all, param('id'));
    if (!item) { mount.innerHTML = notFound('story', 'news.html', 'All news'); return; }

    document.title = item.title + ' — Safe Cities Foundation';
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', String(item.body || '').slice(0, 180));

    var hero = item.image
      ? '<figure class="art__hero">' + pictureTag(item.image, item.alt || item.title, HERO_SIZES, true) +
        (item.caption ? '<figcaption>' + esc(item.caption) + '</figcaption>' : '') + '</figure>'
      : '';

    var related = all.filter(function (x) { return keyOf(x) !== keyOf(item); }).slice(0, 3);

    mount.innerHTML =
      '<article>' +
        '<header class="phero phero--art">' +
          '<div class="wrap phero__in">' +
            '<nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span class="s">/</span>' +
              '<a href="news.html">News</a><span class="s">/</span><span>' + esc(item.category || 'Update') + '</span></nav>' +
            '<p class="eyebrow eyebrow--light" style="margin-top:20px">' + esc(item.category || 'Update') + '</p>' +
            '<h1 class="d1 phero__ttl" style="max-width:34ch">' + esc(item.title) + '</h1>' +
            '<div class="art__meta">' +
              '<span>' + esc(item.source || 'Safe Cities Foundation') + '</span>' +
              '<span class="d"></span><span>' + esc(item.date) + '</span>' +
            '</div>' +
          '</div>' +
        '</header>' +
        '<div class="wrap art__wrap">' +
          hero +
          '<div class="prose">' +
            '<p class="prose__lede">' + esc(item.body) + '</p>' +
            (paras(item.content) || '') +
          '</div>' +
          shareBar(item.title) +
          '<div class="art__back"><a class="tlink tlink--ink" href="news.html">Back to all news' + ARROW + '</a></div>' +
        '</div>' +
        (related.length ?
        '<section class="sec sec--paper">' +
          '<div class="wrap">' +
            '<div class="sechead"><div><p class="eyebrow">More from the newsroom</p>' +
            '<h2 class="d3 sechead__t">Related updates</h2></div>' +
            '<a class="tlink tlink--ink" href="news.html">All news' + ARROW + '</a></div>' +
            '<div class="grid grid--3" data-rv-stagger="0.07">' + related.map(newsCard).join('') + '</div>' +
          '</div></section>' : '') +
      '</article>';
  }

  function renderProject(mount) {
    var all = getProjects();
    var item = find(all, param('id'));
    if (!item) { mount.innerHTML = notFound('project', 'work.html#projects', 'All projects'); return; }

    document.title = item.title + ' — Safe Cities Foundation';
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', String(item.body || '').slice(0, 180));

    var tags = (item.tags || []).filter(function (t) { return t && t.label; }).map(function (t) {
      return '<span class="tag ' + (TAG[t.variant] || 'tag--orange') + '">' + esc(t.label) + '</span>';
    }).join('');

    var hero = item.image
      ? '<figure class="art__hero">' + pictureTag(item.image, item.alt || item.title, HERO_SIZES, true) +
        (item.caption ? '<figcaption>' + esc(item.caption) + '</figcaption>' : '') + '</figure>'
      : '';

    var facts = [
      { l: 'Status', v: item.status || 'Completed' },
      { l: 'Location', v: item.location || item.meta },
      { l: 'Period', v: item.period },
      { l: 'Partners', v: item.partners }
    ].filter(function (f) { return f.v; });

    var related = all.filter(function (x) { return keyOf(x) !== keyOf(item); }).slice(0, 3);

    mount.innerHTML =
      '<article>' +
        '<header class="phero phero--art">' +
          '<div class="wrap phero__in">' +
            '<nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span class="s">/</span>' +
              '<a href="work.html#projects">Our Work</a><span class="s">/</span><span>Project</span></nav>' +
            '<p class="eyebrow eyebrow--light" style="margin-top:20px">Project</p>' +
            '<h1 class="d1 phero__ttl" style="max-width:32ch">' + esc(item.title) + '</h1>' +
            '<div class="art__meta"><span>' + esc(item.meta) + '</span></div>' +
          '</div>' +
        '</header>' +
        '<div class="wrap art__wrap">' +
          hero +
          (tags ? '<div class="tags" style="margin-bottom:22px">' + tags + '</div>' : '') +
          '<div class="art__cols">' +
            '<div class="prose">' +
              '<p class="prose__lede">' + esc(item.body) + '</p>' +
              (paras(item.content) || '') +
            '</div>' +
            '<aside class="art__facts">' +
              '<h3>Project details</h3>' +
              facts.map(function (f) {
                return '<div class="art__fact"><div class="detail__l">' + esc(f.l) + '</div>' +
                  '<div class="art__fact-v">' + esc(f.v) + '</div></div>';
              }).join('') +
              '<a class="btn btn--outline" href="index.html#contact" style="width:100%;margin-top:8px">Partner on a project</a>' +
            '</aside>' +
          '</div>' +
          shareBar(item.title) +
          '<div class="art__back"><a class="tlink tlink--ink" href="work.html#projects">Back to all projects' + ARROW + '</a></div>' +
        '</div>' +
        (related.length ?
        '<section class="sec sec--paper">' +
          '<div class="wrap">' +
            '<div class="sechead"><div><p class="eyebrow">More of our work</p>' +
            '<h2 class="d3 sechead__t">Related projects</h2></div>' +
            '<a class="tlink tlink--ink" href="work.html#projects">All projects' + ARROW + '</a></div>' +
            '<div class="grid grid--3">' + related.map(projectCard).join('') + '</div>' +
          '</div></section>' : '') +
      '</article>';
  }

  /* -------------------- TEAM & PARTNERS renderers -------------------- */
  var MONO = ['mono--a', 'mono--b', 'mono--c', 'mono--d', 'mono--e'];
  function initials(name) {
    var parts = String(name || '').trim().split(/\s+/).filter(function (w) { return /^[A-Za-z]/.test(w); });
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  function photoOr(person, i, cls) {
    if (person.image) return pictureTag(person.image, person.name, PORTRAIT_SIZES);
    return '<span class="mono ' + MONO[i % MONO.length] + '"><span>' + esc(initials(person.name)) + '</span></span>';
  }

  function leadershipCard(p, i) {
    return '<div class="lead-card" data-rv="up">' +
      '<div class="lead-card__photo">' + photoOr(p, i) + '</div>' +
      '<div>' +
        '<p class="lead-card__role">' + esc(p.role) + '</p>' +
        '<h3 class="lead-card__name">' + esc(p.name) + '</h3>' +
        (p.bio ? '<p class="lead-card__b">' + esc(p.bio) + '</p>' : '') +
      '</div></div>';
  }

  function memberCard(p, i) {
    return '<article class="tm">' +
      '<div class="tm__photo">' + photoOr(p, i + 1) + '</div>' +
      '<div class="tm__body">' +
        '<h3 class="tm__name">' + esc(p.name) + '</h3>' +
        '<p class="tm__role">' + esc(p.role) + '</p>' +
        (p.bio ? '<p class="tm__b">' + esc(p.bio) + '</p>' : '') +
      '</div></article>';
  }

  /* -------------------- mount -------------------- */
  function limitOf(el) { return parseInt(el.getAttribute('data-limit'), 10) || 0; }

  function renderAll() {
    var q = query();

    if (q) {
      document.querySelectorAll('[data-search-note]').forEach(function (el) {
        el.innerHTML = '<div class="eyebrow eyebrow--mute eyebrow--plain" style="margin-bottom:10px">Search results</div>' +
          '<p class="lede">Showing matches for <strong style="color:var(--navy)">\u201c' + esc(q) + '\u201d</strong> \u00b7 ' +
          '<a href="' + location.pathname.split('/').pop() + '" style="color:var(--orange);font-weight:600">clear</a></p>';
        el.style.display = '';
      });
    }

    document.querySelectorAll('[data-render="projects"]').forEach(function (el) {
      var list = getProjects().filter(function (p) { return matches(p, q); });
      var n = limitOf(el); if (n) list = list.slice(0, n);
      el.innerHTML = list.length ? list.map(projectCard).join('') : emptyState('projects', q);
      el.setAttribute('data-rv-stagger', '0.07');
    });

    document.querySelectorAll('[data-render="news"]').forEach(function (el) {
      var all = getNews().filter(function (x) { return matches(x, q); });
      var rest = all.slice(), feat = null;
      for (var i = 0; i < rest.length; i++) { if (rest[i].featured) { feat = rest.splice(i, 1)[0]; break; } }
      if (!feat && !q) feat = rest.shift();
      var n = limitOf(el); if (n) rest = rest.slice(0, n);
      if (!all.length) { el.innerHTML = emptyState('news', q); return; }
      el.innerHTML = (feat ? featuredNews(feat) : '') +
        (rest.length ? '<div class="grid grid--2" data-rv-stagger="0.07" style="align-content:start">' + rest.map(newsCard).join('') + '</div>' : '');
    });

    document.querySelectorAll('[data-render="latest"]').forEach(function (el) {
      var list = getNews().filter(function (x) { return matches(x, q); });
      var n = limitOf(el); if (n) list = list.slice(0, n);
      el.innerHTML = list.map(listItem).join('');
    });

    document.querySelectorAll('[data-render="spotlight"]').forEach(function (el) {
      var list = getNews().filter(function (x) { return matches(x, q) && !x.featured; });
      var n = limitOf(el); if (n) list = list.slice(0, n);
      el.innerHTML = list.map(spotRow).join('');
    });

    document.querySelectorAll('[data-project-count]').forEach(function (el) {
      el.textContent = getProjects().length;
    });

    /* Team */
    var team = getTeam().slice().sort(function (a, b) { return (a.order ?? 0) - (b.order ?? 0); });
    document.querySelectorAll('[data-render="leadership"]').forEach(function (el) {
      var leads = team.filter(function (p) { return p.leadership; });
      if (!leads.length) leads = team.slice(0, 1);
      el.innerHTML = leads.map(leadershipCard).join('');
    });
    document.querySelectorAll('[data-render="team"]').forEach(function (el) {
      var rest = team.filter(function (p) { return !p.leadership; });
      if (!team.some(function (p) { return p.leadership; })) rest = team.slice(1);
      el.innerHTML = rest.map(memberCard).join('');
      el.setAttribute('data-rv-stagger', '0.07');
    });
    document.querySelectorAll('[data-team-count]').forEach(function (el) {
      el.textContent = team.length;
    });

    /* Partners */
    document.querySelectorAll('[data-render="partners"]').forEach(function (el) {
      var list = getPartners().slice().sort(function (a, b) { return (a.order ?? 0) - (b.order ?? 0); });
      el.innerHTML = list.map(function (p) {
        return p.url
          ? '<a href="' + esc(p.url) + '" target="_blank" rel="noopener"><span>' + esc(p.name) + '</span></a>'
          : '<span>' + esc(p.name) + '</span>';
      }).join('');
    });

    /* detail pages */
    var a = document.querySelector('[data-render="article"]');
    if (a) renderArticle(a);
    var p = document.querySelector('[data-render="project"]');
    if (p) renderProject(p);

    document.dispatchEvent(new CustomEvent('scf:rendered'));
  }

  window.SCF = window.SCF || {};
  window.SCF.render = renderAll;
  window.SCF.seed = SEED;
  window.SCF.slug = slug;
  window.SCF.keyOf = keyOf;

  if (document.readyState !== 'loading') renderAll();
  else document.addEventListener('DOMContentLoaded', renderAll);

  document.addEventListener('scf:content-updated', renderAll);
})();
