# Safe Cities Foundation — Website

A static, multi-page website. No build step, no framework — open `index.html` in a
browser, or upload the whole folder to any static host.

## Pages

| File | Page |
|------|------|
| `index.html` | Home — overview, featured projects & news, contact form |
| `about.html` | About — story, vision/mission/values, approach |
| `work.html`  | Our Work — focus areas, all projects, impact |
| `news.html`  | News & Insights — all news items |

The header and footer are defined **once** in `js/layout.js` and injected into every
page (the `<div id="site-header">` / `<div id="site-footer">` placeholders). Change the
nav or footer there and it updates everywhere.

## Directory structure

```
safe-cities-website/
├── index.html  about.html  work.html  news.html
├── css/
│   └── styles.css          ← all styling (design tokens at the top)
├── js/
│   ├── layout.js           ← shared header + footer
│   ├── content.js          ← Projects & News data + rendering  ← EDIT CONTENT HERE
│   └── main.js             ← nav, scroll reveals, counters, forms
└── assets/
    └── img/
        ├── logo/           ← wordmark + favicon
        └── projects/       ← project photos
```

## Editing Projects & News (today, before Firebase)

All project and news content lives in **one place**: the `SEED` object at the top of
`js/content.js`. To add an item, copy an existing entry in the `projects` or `news`
array and edit its fields. Drop new photos in `assets/img/projects/` and reference them
by relative path. Every page that lists projects/news updates automatically.

- A project with `image: ''` shows a "project photo" placeholder until you add a photo.
- The news item marked `featured: true` becomes the large featured card.
- Pages control how many items show via `data-limit` on the container (home shows 3
  projects / 2 news; Our Work and News show everything).

## Connecting Firebase (later)

`js/content.js` is written so the database swaps in at a single seam — the
`getProjects()` / `getNews()` functions. When Firestore is connected, a small
`js/firebase.js` will fetch the collections, set `window.SCF_DATA = { projects, news }`,
and call `SCF.render()`. No page markup changes. See the notes in `content.js` and the
contact-form `TODO(firebase)` in `main.js`.

## Contact form

`js/main.js` currently shows a success message on submit (front-end demo — nothing is
sent yet). To receive real messages, either point `<form id="contactForm">` at a form
service (Formspree / Web3Forms), or send submissions to Firebase once configured.

## Hosting

Upload the entire `safe-cities-website/` folder to Netlify (drag-and-drop), Vercel,
Firebase Hosting, GitHub Pages, Cloudflare Pages, or ordinary cPanel/FTP.
`index.html` is the entry point.
