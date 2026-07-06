/* ==========================================================================
   Safe Cities Foundation — shared layout (header + footer)
   Injected on every page so nav/footer live in ONE place.
   Set the active page with <body data-page="home|about|work|news">.
   ========================================================================== */
(function () {
  'use strict';

  var page = document.body.getAttribute('data-page') || '';

  var HEADER =
    '<nav class="nav" id="nav">' +
      '<a class="nav__logo" href="index.html" aria-label="Safe Cities Foundation home">' +
        '<img src="assets/img/logo/fc_horizontal.png" alt="Safe Cities Foundation" />' +
      '</a>' +
      '<button class="nav__toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false" aria-controls="navLinks"><span></span></button>' +
      '<div class="nav__links" id="navLinks">' +
        '<a class="nav__link" data-nav="home" href="index.html">Home</a>' +
        '<a class="nav__link" data-nav="about" href="about.html">About</a>' +
        '<a class="nav__link" data-nav="work" href="work.html">Our Work</a>' +
        '<a class="nav__link" data-nav="news" href="news.html">News</a>' +
        '<a class="nav__cta" href="index.html#contact">Get Involved</a>' +
      '</div>' +
    '</nav>';

  var FOOTER =
    '<footer class="footer">' +
      '<div class="footer__grid">' +
        '<div class="footer__brand">' +
          '<img src="assets/img/logo/fc_horizontal.png" alt="Safe Cities Foundation" />' +
          '<p>Advocating for compact, resilient, and inclusive urban spaces across the African continent. Transforming how African cities move, grow, and serve their people.</p>' +
          '<div class="footer__flagchip">' +
            '<svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true"><rect x="0" y="0" width="18" height="4" fill="#CE1126"/><rect x="0" y="4" width="18" height="4" fill="#FCD116"/><rect x="0" y="8" width="18" height="4" fill="#006B3F"/></svg>' +
            'Based in Ghana · Serving Africa' +
          '</div>' +
        '</div>' +
        '<div class="footer__col">' +
          '<h5>Organisation</h5>' +
          '<div class="links"><a href="about.html">About Us</a><a href="about.html#approach">Our Approach</a><a href="work.html#impact">Impact</a><a href="index.html#contact">Contact</a></div>' +
        '</div>' +
        '<div class="footer__col">' +
          '<h5>Work</h5>' +
          '<div class="links"><a href="work.html#programs">Focus Areas</a><a href="work.html#projects">Projects</a><a href="news.html">News &amp; Reports</a><a href="index.html#contact">Get Involved</a></div>' +
        '</div>' +
        '<div class="footer__col">' +
          '<h5>Connect</h5>' +
          '<div class="links"><a href="index.html#contact">Contact Us</a><a href="#">Twitter / X</a><a href="#">LinkedIn</a><a href="#">Facebook</a></div>' +
          '<div class="newsletter">' +
            '<p>Stay updated on our work:</p>' +
            '<form class="newsletter__row" id="newsletterForm">' +
              '<input type="email" placeholder="Your email" aria-label="Email for newsletter" required />' +
              '<button type="submit">Subscribe</button>' +
            '</form>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="footer__bottom">' +
        '<p>© <span data-year>2025</span> Safe Cities Foundation. All rights reserved. Registered NGO, Ghana.</p>' +
        '<div class="legal"><a href="#">Privacy Policy</a><a href="#">Terms of Use</a><a href="index.html#contact">Sitemap</a></div>' +
      '</div>' +
    '</footer>';

  var headerSlot = document.getElementById('site-header');
  var footerSlot = document.getElementById('site-footer');
  if (headerSlot) headerSlot.outerHTML = HEADER;
  if (footerSlot) footerSlot.outerHTML = FOOTER;

  // Active nav state
  if (page) {
    var active = document.querySelector('.nav__link[data-nav="' + page + '"]');
    if (active) active.classList.add('is-active');
  }
})();
