# Firebase setup — Safe Cities Foundation

Your site now reads Projects & News from **Firestore**, saves contact-form
**messages** to Firestore, and staff manage everything from **`admin.html`**
(protected by Firebase **Authentication**).

You do **NOT** need Firebase **Storage** and you do **NOT** need to upgrade to the
Blaze plan. Photos are compressed in the browser and stored inside the Firestore
document. Everything runs on the free **Spark** plan.

---

## 1. Products to enable (in the Firebase console)

- **Firestore Database** → Build → Firestore → *Create database* → **Production mode** →
  pick a region close to Ghana (e.g. `europe-west1`).
- **Authentication** → Build → Authentication → *Get started* → enable **Email/Password**.
- ~~Storage~~ — **skip it.** (Ignore the "Upgrade project" screen.)

## 2. Create staff logins

Authentication → **Users** → *Add user* → enter an email + password for each staff
member who will post updates. They'll use these to sign in at `admin.html`.

## 3. Paste the security rules

Firestore → **Rules** tab → replace everything with the block below → **Publish**.
This lets the public *read* projects & news, lets anyone *send* a contact message,
and restricts all editing/reading of messages to signed-in staff.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Public website content — anyone can read, only signed-in staff can change
    match /projects/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /news/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Contact form — anyone can submit; only staff can read/manage
    match /messages/{id} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

## 4. Load your current content (once)

1. Open **`admin.html`** on your live site (e.g. `https://your-site/admin.html`).
2. Sign in with a staff account.
3. On the **Projects** tab click **Import starter content** (loads your current 4 projects).
4. On the **News** tab click **Import starter content** (loads your current news).
   *Do this only once* — clicking again creates duplicates.

From then on, use **+ Add**, **Edit**, and **Delete**. Changes appear on the public
site immediately (a refresh).

---

## How it fits together

| File | Role |
|------|------|
| `js/firebase-config.js` | Your project's config (shared by public + admin) |
| `js/firebase.js` | Public pages: load content from Firestore, send contact messages |
| `js/admin.js` | The staff dashboard logic (auth + add/edit/delete) |
| `admin.html` | The staff dashboard page (not linked from the public nav) |
| `js/content.js` | Still holds the **seed** content shown if the database is empty/unreachable |

## Notes & limits

- **Photos:** auto-resized to ~1400px and stored in the document. Keep individual
  photos reasonable; the browser compresses them to stay within Firestore's 1 MB
  per-document limit. For very large galleries later, Firebase Storage (Blaze plan)
  would be the upgrade path — not needed now.
- **Email alerts for new messages:** messages are saved and visible in the admin
  Messages tab. Getting an *email* each time a message arrives would need a Cloud
  Function (Blaze plan). If you want that later, say so and I'll wire it — or we can
  add a free "email me on new submission" service instead.
- **Local preview:** Firebase needs the site served over http(s). Opening the files
  directly with `file://` will show the seed content but Firebase won't connect —
  that's expected. Use Firebase Hosting, Netlify, or a local dev server.
- **`admin.html`** carries a `noindex` tag so search engines don't list it. It's not
  linked from the public site; bookmark the URL.
