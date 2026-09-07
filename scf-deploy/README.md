# Safe Cities Foundation — Website

A static, multi-page website. No build step, no framework — upload the folder to any
static host. `index.html` is the entry point.

## Pages

| File | Page |
|------|------|
| `index.html` | Home — hero carousel, latest rail, impact, focus areas, projects, contact |
| `about.html` | About — story, mission/vision/values, approach, people, governance, partners |
| `team.html` | Leadership & team |
| `work.html`  | Our Work — focus areas, all projects, impact |
| `news.html`  | News & Insights — featured story, news, spotlight |
| `article.html?id=…` | Full news story (template — one page serves every item) |
| `project.html?id=…` | Full project write-up (template) |
| `privacy.html` | Privacy notice |
| `terms.html` | Terms of use |
| `404.html` | Not-found page with popular destinations |
| `admin.html` | Staff dashboard (not linked publicly, `noindex`) |

Also at the root: `robots.txt` and `sitemap.xml`. **Both hard-code
`https://scfofficial.netlify.app` — update the domain in each if you move to a custom
domain.** Open Graph / Twitter tags and `<link rel="canonical">` on every page use the
same base URL and need the same update.

## Files

```
safe-cities-website/
├── index.html  about.html  work.html  news.html  admin.html
├── css/styles.css        ← whole design system; tokens at the top
├── js/
│   ├── layout.js         ← utility bar, mega-menu header, mobile drawer, footer
│   ├── ui.js             ← carousel, rails, reveals, counters, page fades, forms
│   ├── content.js        ← Projects & News data + rendering  ← CONTENT SEAM
│   ├── firebase-config.js / firebase.js   ← live content + contact form
│   └── admin.js          ← staff dashboard logic
├── assets/img/logo/  assets/img/projects/
├── robots.txt  sitemap.xml  site.webmanifest
└── FIREBASE-SETUP.md
```

### Header, footer and navigation

Defined **once** in `js/layout.js` — the `NAV` array at the top drives the desktop
mega-menus *and* the mobile drawer accordions. Add a link there and it appears in both.
Pages just need `<div id="site-header">` / `<div id="site-footer">` placeholders and
`<body data-page="home|about|work|news">` for the active state.
`data-float-header` makes the header transparent over a hero (used on the homepage).

### Content

Projects and News render from `js/content.js`. Containers are declarative:

```html
<div data-render="projects" data-limit="3"></div>   <!-- project cards -->
<div data-render="news"     data-limit="2"></div>   <!-- featured + cards -->
<div data-render="latest"   data-limit="8"></div>   <!-- horizontal rail -->
<div data-render="spotlight" data-limit="3"></div>  <!-- rule-separated rows -->
<div data-render="article"></div>                   <!-- article.html?id= -->
<div data-render="project"></div>                   <!-- project.html?id= -->
```

### Detail pages

Every card links through to a full read. `article.html` and `project.html` are
**templates** — they read `?id=` and render that item, so you never create a page per
story. The id is the Firestore document id, falling back to a slug of the title when
running on seed data.

Each item has two text fields: **`body`** (the short summary on cards) and
**`content`** (the full write-up, blank line between paragraphs). Projects also carry
`location`, `period` and `partners`, shown in a sticky details panel. Detail pages
include share links and related items, and unknown ids get a proper "not found" state.

In the admin, items missing their full text are flagged **Needs full text**, and a
**Backfill full text** button fills them from the starter copy without overwriting
anything already written.

Live content comes from Firestore; the `SEED` arrays in `content.js` are the fallback
when the database is empty or unreachable, and also feed the admin
"Import starter content" button. Items without a photo get a designed placeholder
rather than an empty box.

**Search** works off `?q=` — the header search box sends visitors to
`work.html?q=…`, and matching filters projects and news client-side.

### Team photos

`team.html` uses monogram placeholders until real headshots exist. To add a photo,
drop the file in `assets/img/team/` and replace that person's monogram span:

```html
<!-- before -->
<div class="tm__photo"><span class="mono mono--b"><span>JN</span></span></div>
<!-- after -->
<div class="tm__photo"><img src="assets/img/team/jeff-kojo-nathan.jpg" alt="Jeff Kojo Nathan" /></div>
```

Team cards are 4:5 portrait and the Executive Director's is 1:1 — shoot headshots
portrait, centred, against a plain background so the crop is predictable.

### Typography

Headlines in **Source Serif 4** (600 weight — 400 is a text weight and lacks presence
at display sizes), body and UI in **Nunito Sans**, both from Google Fonts and set via
the `--serif` / `--sans` tokens at the top of `css/styles.css`.

Nunito Sans is the same family Kumasi Metropolitan Assembly uses, chosen so the site
sits comfortably alongside a named partner while the serif headline keeps it reading as
an organisation that publishes evidence. It sets about 11% wider than the previous sans
with a taller line box, so long-form sizes and leading are trimmed accordingly and
`.prose` is capped at `62ch` (≈74 characters per line). Statistics use
`font-variant-numeric: tabular-nums` so counting animations don't shift horizontally.

`font-comparison.html` at the project root is the decision aid used to choose this
pairing. It is not part of the site and should not be deployed.

### Performance

**Session caching.** Firestore content is cached in `sessionStorage` for 10 minutes
(`scf:content:v1`). Without it every page load refetched all four collections, so
browsing five pages meant twenty document reads and five network waits. Now page two
onward renders from memory with no network call. A new visit always fetches fresh, and
`js/admin.js` clears the cache after every save so staff see their edits immediately.

**Responsive images.** Each project photo has WebP derivatives at 1000w, 600w and 200w
alongside the original JPEG, served through `<picture>` with `srcset`. A card image on
a phone drops from 172–244KB to roughly 40–67KB; mega-menu thumbnails drop to 6–10KB.
The JPEG stays as the fallback for any browser without WebP support.

To regenerate after adding a photo, the sizes follow the naming convention
`name-1000.webp` / `name-600.webp` / `name-200.webp` in `assets/img/projects/`.
Photos uploaded through the admin are resized in the browser and stored directly, so
they bypass this and are emitted as a plain `<img>`.

### What the admin manages

| Tab | Controls |
|-----|----------|
| Projects | Project cards + full write-ups, photos, tags, status, details panel |
| News | Stories + full articles, category, featured item, photos |
| Team | Members, roles, bios, photos, order, who appears as leadership |
| Partners | The partner names row on home and about |
| Messages | Contact form submissions |
| Subscribers | Newsletter sign-ups, CSV export |

**Spotlight is not separate content** — it is the same News items in a different
layout, so anything added to News appears there too.

**Still hard-coded** (edit the HTML directly): focus areas, impact statistics, hero
carousel slides, and page body copy.

Each content tab has an **Import starter content** button that loads what is currently
on the site into Firestore. Run it once per tab; running it twice creates duplicates.

### Social profiles

`SOCIAL_URLS` at the top of `js/layout.js` is the single source of truth. Icons render
in the footer and the homepage contact block only for entries that have a URL — an
empty value hides that icon rather than leaving a link that goes nowhere. **They are
all empty right now**, so no social icons appear until you paste your real profile
URLs in.

### Forms

The contact form writes to the Firestore `messages` collection and carries a hidden
honeypot field: a submission with it filled is discarded in the browser and never
written. The footer newsletter writes to `subscribers`. Both are visible in the admin,
and subscribers can be exported as CSV.

## Responsive behaviour

- **≥1121px** — full mega-menu nav, hover-to-open flyouts, 3-up card grids.
- **≤1120px** — nav collapses to the slide-in drawer with accordion sub-menus.
- **≤900px** — two-column splits stack; featured news goes single column.
- **≤860px** — hero shortens, slide tabs become a compact label + progress dots.
- **≤720px** — utility bar hides.
- **≤620px** — single-column grids, buttons go full width, larger type ratios.
- **Coarse pointers** get enlarged tap targets (44px minimum).
- `prefers-reduced-motion` disables the carousel autoplay, reveals and page fades.

## Motion

Cross-page navigation fades through a white veil (`ui.js`). Sections reveal on scroll
via `data-rv="up|left|right|in"`, optionally staggered with
`data-rv-stagger="0.07"` on a parent. Stat numbers count up with `data-count`.
All of it is CSS-transition based and re-initialises after dynamic content injects.

## Hosting

Firebase Hosting, Netlify, Vercel, Cloudflare Pages, GitHub Pages or plain cPanel/FTP.
Firebase features need an `http(s)` URL — opening the files directly with `file://`
shows the seed content but won't connect. See `FIREBASE-SETUP.md`.
