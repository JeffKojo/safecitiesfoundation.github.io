/* ==========================================================================
   Firebase integration — PUBLIC SITE
   --------------------------------------------------------------------------
   • Loads Projects & News from Firestore and hands them to the render layer.
   • Sends contact-form messages to Firestore.
   If Firestore is empty or unreachable, the site quietly keeps showing the
   seed content in js/content.js — nothing breaks.
   Loaded as: <script type="module" src="js/firebase.js"></script>
   ========================================================================== */
import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

window.SCF = window.SCF || {};

let db = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.warn("SCF: Firebase failed to initialize; using seed content.", e);
}

function tsMillis(t) {
  if (!t) return 0;
  if (typeof t.toMillis === "function") return t.toMillis();
  if (t.seconds) return t.seconds * 1000;
  return 0;
}

/* ---------------------------------------------------------------------------
   Session cache
   Without this, every page load refetches all four collections — so browsing
   five pages costs twenty document reads and five network waits. Caching for
   the session means page two onward renders from memory, immediately.
   sessionStorage (not localStorage) so a new visit always gets fresh content,
   and staff see their admin edits on the next visit rather than days later.
--------------------------------------------------------------------------- */
const CACHE_KEY = "scf:content:v1";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes, also expires within a session

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.at !== "number") return null;
    if (Date.now() - parsed.at > CACHE_TTL) return null;
    return parsed.data || null;
  } catch (_) { return null; }
}

function writeCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data: data }));
  } catch (_) { /* private mode or quota — caching is optional, never fatal */ }
}

/* Timestamps don't survive JSON, so store a sortable number alongside them. */
function normalise(list) {
  return list.map((d) => Object.assign({}, d, { _t: tsMillis(d.createdAt) }));
}

function applyData(data, fromCache) {
  const out = {};
  ["projects", "news", "team", "partners"].forEach((k) => {
    const list = (data && data[k]) || [];
    if (!list.length) return;
    const copy = list.slice();
    if (k === "news") copy.sort((a, b) => (b._t || 0) - (a._t || 0));
    else copy.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    out[k] = copy;
  });
  if (!Object.keys(out).length) return false;
  window.SCF_DATA = Object.assign({}, window.SCF_DATA, out);
  document.dispatchEvent(new CustomEvent("scf:content-updated"));
  if (fromCache) console.info("SCF: content served from session cache (no network reads).");
  return true;
}

async function loadContent() {
  // 1. Paint from cache first if we have it — no network wait at all.
  const cached = readCache();
  const servedFromCache = cached ? applyData(cached, true) : false;
  if (servedFromCache) return;

  if (!db) return;

  // 2. Each collection is fetched independently: if one is denied by the
  // security rules, missing, or added later, only that collection falls back to
  // the seed. A single shared try/catch would drop everything on one denial.
  const safeGet = async (name) => {
    try {
      const snap = await getDocs(collection(db, name));
      return normalise(snap.docs.map((d) => Object.assign({ id: d.id }, d.data())));
    } catch (e) {
      console.warn("SCF: '" + name + "' unavailable (" + (e.code || e.message) +
        "). Using built-in content for it. If this is 'permission-denied', publish the " +
        "rules for this collection from FIREBASE-SETUP.md.");
      return [];
    }
  };

  const [projects, news, team, partners] = await Promise.all([
    safeGet("projects"), safeGet("news"), safeGet("team"), safeGet("partners")
  ]);

  const data = { projects, news, team, partners };
  if (applyData(data, false)) writeCache(data);
}
loadContent();

/* Staff action that changes content should clear the cache so the next page
   load is fresh. admin.js calls this after every save. */
window.SCF.clearContentCache = function () {
  try { sessionStorage.removeItem(CACHE_KEY); } catch (_) {}
};

/* Contact form → Firestore 'messages' collection. ui.js calls this. */
window.SCF.submitContact = async function (payload) {
  if (!db) throw new Error("Firebase not initialized");
  await addDoc(collection(db, "messages"), Object.assign(
    { read: false, createdAt: serverTimestamp() },
    payload
  ));
};

/* Newsletter → Firestore 'subscribers' collection. */
window.SCF.subscribe = async function (email) {
  if (!db) throw new Error("Firebase not initialized");
  await addDoc(collection(db, "subscribers"), {
    email: String(email || "").trim().toLowerCase(),
    createdAt: serverTimestamp()
  });
};
