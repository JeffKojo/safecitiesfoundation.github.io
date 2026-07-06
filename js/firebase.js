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

async function loadContent() {
  if (!db) return;
  try {
    const [pSnap, nSnap] = await Promise.all([
      getDocs(collection(db, "projects")),
      getDocs(collection(db, "news"))
    ]);

    let projects = pSnap.docs.map((d) => Object.assign({ id: d.id }, d.data()));
    let news = nSnap.docs.map((d) => Object.assign({ id: d.id }, d.data()));

    projects.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    // Newest news first; featured is picked out by the render layer.
    news.sort((a, b) => tsMillis(b.createdAt) - tsMillis(a.createdAt));

    const data = {};
    if (projects.length) data.projects = projects;
    if (news.length) data.news = news;

    if (data.projects || data.news) {
      window.SCF_DATA = Object.assign({}, window.SCF_DATA, data);
      document.dispatchEvent(new CustomEvent("scf:content-updated"));
    }
  } catch (e) {
    console.warn("SCF: could not load live content; using seed.", e);
  }
}
loadContent();

/* Contact form → Firestore 'messages' collection. main.js calls this. */
window.SCF.submitContact = async function (payload) {
  if (!db) throw new Error("Firebase not initialized");
  await addDoc(collection(db, "messages"), Object.assign(
    { read: false, createdAt: serverTimestamp() },
    payload
  ));
};
