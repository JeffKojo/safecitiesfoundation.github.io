/* ==========================================================================
   Staff Admin — Safe Cities Foundation
   Login (Firebase Auth) + manage Projects / News, read Messages (Firestore).
   Photos are compressed in the browser and stored in the document (no Storage
   product needed — stays on the free Spark plan).
   ========================================================================== */
import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
  getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ---------- element refs ---------- */
const $ = (id) => document.getElementById(id);
const loginView = $("admLogin");
const dashView = $("admDash");
const panel = $("admPanel");
const whoEl = $("admWho");
const signOutBtn = $("admSignOut");

let currentTab = "projects";

/* ---------- helpers ---------- */
function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function tsMillis(t) { if (!t) return 0; if (typeof t.toMillis === "function") return t.toMillis(); if (t.seconds) return t.seconds * 1000; return 0; }
function fmtDate(t) { const ms = tsMillis(t); return ms ? new Date(ms).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""; }

async function fetchAll(name) {
  const snap = await getDocs(collection(db, name));
  return snap.docs.map((d) => Object.assign({ id: d.id }, d.data()));
}

function compressImage(file, maxDim, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let w = img.naturalWidth, h = img.naturalHeight;
      if (Math.max(w, h) > maxDim) { const s = maxDim / Math.max(w, h); w = Math.round(w * s); h = Math.round(h * s); }
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = url;
  });
}
async function fileToStoredImage(file) {
  let data = await compressImage(file, 1400, 0.82);
  if (data.length > 900000) data = await compressImage(file, 1000, 0.7);   // keep well under Firestore's 1 MB doc limit
  if (data.length > 900000) data = await compressImage(file, 800, 0.6);
  return data;
}

const TAG_VARIANTS = ["orange", "blue", "gold", "purple"];
const NEWS_VARIANTS = ["orange", "green", "gold"];
function optionList(vals, sel) { return vals.map((v) => `<option value="${v}"${v === sel ? " selected" : ""}>${v}</option>`).join(""); }

/* ==========================================================================
   AUTH
   ========================================================================== */
$("admLoginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const err = $("admLoginErr"); err.textContent = "";
  try {
    await signInWithEmailAndPassword(auth, $("admEmail").value.trim(), $("admPass").value);
  } catch (ex) {
    err.textContent = "Sign in failed. Check your email and password.";
  }
});
signOutBtn.addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginView.classList.add("adm-hide");
    dashView.classList.remove("adm-hide");
    whoEl.classList.remove("adm-hide"); signOutBtn.classList.remove("adm-hide");
    whoEl.textContent = user.email;
    renderTab();
  } else {
    loginView.classList.remove("adm-hide");
    dashView.classList.add("adm-hide");
    whoEl.classList.add("adm-hide"); signOutBtn.classList.add("adm-hide");
  }
});

/* ==========================================================================
   TABS
   ========================================================================== */
document.querySelectorAll(".adm-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentTab = btn.getAttribute("data-tab");
    document.querySelectorAll(".adm-tab").forEach((b) => b.classList.toggle("is-active", b === btn));
    renderTab();
  });
});

async function refreshCounts() {
  try {
    const [p, n, m] = await Promise.all([fetchAll("projects"), fetchAll("news"), fetchAll("messages")]);
    $("cntProjects").textContent = p.length;
    $("cntNews").textContent = n.length;
    const unread = m.filter((x) => !x.read).length;
    $("cntMessages").textContent = unread ? unread + " new" : m.length;
  } catch (e) { /* ignore */ }
}

function renderTab() {
  refreshCounts();
  if (currentTab === "projects") renderProjects();
  else if (currentTab === "news") renderNews();
  else renderMessages();
}

/* ==========================================================================
   PROJECTS
   ========================================================================== */
async function renderProjects() {
  panel.innerHTML = `<div class="adm-panel-head"><h2>Projects</h2>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="adm-btn adm-btn--soft" id="pSeed" type="button">Import starter content</button>
      <button class="adm-btn adm-btn--primary" id="pAdd" type="button">+ Add project</button>
    </div></div>
    <div class="adm-list" id="pList"><div class="adm-empty">Loading…</div></div>`;
  $("pAdd").addEventListener("click", () => projectForm(null));
  $("pSeed").addEventListener("click", seedProjects);

  const list = (await fetchAll("projects")).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const wrap = $("pList");
  if (!list.length) { wrap.innerHTML = `<div class="adm-empty">No projects yet. Click “Import starter content” to load your current 4, or “Add project”.</div>`; return; }
  wrap.innerHTML = list.map((p) => {
    const thumb = p.image
      ? `<img class="adm-row__thumb" src="${esc(p.image)}" alt="" />`
      : `<div class="adm-row__thumb adm-row__thumb--ph">no photo</div>`;
    return `<div class="adm-row">${thumb}
      <div class="adm-row__body"><div class="adm-row__title">${esc(p.title)}</div>
      <div class="adm-row__meta">${esc(p.meta || "")} · ${esc(p.status || "Completed")}</div></div>
      <div class="adm-row__actions">
        <button class="adm-btn adm-btn--soft" data-edit="${p.id}" type="button">Edit</button>
        <button class="adm-btn adm-btn--danger" data-del="${p.id}" type="button">Delete</button>
      </div></div>`;
  }).join("");
  wrap.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => projectForm(list.find((x) => x.id === b.getAttribute("data-edit")))));
  wrap.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", async () => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    await deleteDoc(doc(db, "projects", b.getAttribute("data-del")));
    renderProjects();
  }));
}

function projectForm(p) {
  const isEdit = !!p;
  p = p || { tags: [{ label: "", variant: "orange" }, { label: "", variant: "blue" }] };
  const t0 = p.tags && p.tags[0] || { label: "", variant: "orange" };
  const t1 = p.tags && p.tags[1] || { label: "", variant: "blue" };
  panel.innerHTML = `<div class="adm-form"><h3>${isEdit ? "Edit" : "Add"} project</h3>
    <form id="pForm">
      <div class="adm-field"><label>Title *</label><input name="title" value="${esc(p.title)}" required /></div>
      <div class="adm-field"><label>Description *</label><textarea name="body" required>${esc(p.body)}</textarea></div>
      <div class="adm-grid2">
        <div class="adm-field"><label>Location &amp; date (shown under the card)</label><input name="meta" value="${esc(p.meta)}" placeholder="Kumasi, Ashanti Region · 2025" /></div>
        <div class="adm-field"><label>Status</label><input name="status" value="${esc(p.status || "Completed")}" placeholder="Completed / Ongoing" /></div>
      </div>
      <div class="adm-grid2">
        <div class="adm-field"><label>Tag 1 label</label><input name="t0label" value="${esc(t0.label)}" placeholder="School Zones" /></div>
        <div class="adm-field"><label>Tag 1 colour</label><select name="t0variant">${optionList(TAG_VARIANTS, t0.variant)}</select></div>
      </div>
      <div class="adm-grid2">
        <div class="adm-field"><label>Tag 2 label</label><input name="t1label" value="${esc(t1.label)}" placeholder="Pedestrian Safety" /></div>
        <div class="adm-field"><label>Tag 2 colour</label><select name="t1variant">${optionList(TAG_VARIANTS, t1.variant)}</select></div>
      </div>
      <div class="adm-field"><label>Photo</label>
        <input type="file" name="photo" accept="image/*" />
        <div class="adm-hint">Optional. The photo is automatically resized. Leave empty to keep the current one (or show a placeholder).</div>
        <div class="adm-preview" id="pPreview">${p.image ? `<img src="${esc(p.image)}" alt="" />` : ""}</div>
      </div>
      <div class="adm-field"><label>Display order</label><input name="order" type="number" value="${p.order ?? ""}" placeholder="0 = first" style="max-width:140px" /></div>
      <div class="adm-form__actions">
        <button class="adm-btn adm-btn--primary" type="submit" id="pSave">${isEdit ? "Save changes" : "Add project"}</button>
        <button class="adm-btn adm-btn--soft" type="button" id="pCancel">Cancel</button>
      </div>
    </form></div>`;

  let newImage = null;
  $("pForm").photo.addEventListener("change", async (e) => {
    const f = e.target.files[0]; if (!f) return;
    newImage = await fileToStoredImage(f);
    $("pPreview").innerHTML = `<img src="${newImage}" alt="" />`;
  });
  $("pCancel").addEventListener("click", renderProjects);
  $("pForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const save = $("pSave"); save.disabled = true; save.textContent = "Saving…";
    const data = {
      title: f.title.value.trim(),
      body: f.body.value.trim(),
      meta: f.meta.value.trim(),
      status: f.status.value.trim() || "Completed",
      tags: [
        { label: f.t0label.value.trim(), variant: f.t0variant.value },
        { label: f.t1label.value.trim(), variant: f.t1variant.value }
      ].filter((t) => t.label),
      order: f.order.value === "" ? 0 : Number(f.order.value)
    };
    if (newImage) data.image = newImage;
    else if (isEdit && p.image != null) data.image = p.image;
    try {
      if (isEdit) await updateDoc(doc(db, "projects", p.id), data);
      else { data.createdAt = serverTimestamp(); await addDoc(collection(db, "projects"), data); }
      renderProjects();
    } catch (ex) { alert("Could not save: " + ex.message); save.disabled = false; save.textContent = "Save"; }
  });
}

async function seedProjects() {
  if (!window.SCF || !window.SCF.seed) { alert("Starter content unavailable."); return; }
  if (!confirm("Import the current 4 starter projects into the database? Do this only once.")) return;
  const seed = window.SCF.seed.projects;
  for (let i = 0; i < seed.length; i++) {
    const p = Object.assign({}, seed[i], { order: i, createdAt: serverTimestamp() });
    await addDoc(collection(db, "projects"), p);
  }
  renderProjects();
}

/* ==========================================================================
   NEWS
   ========================================================================== */
async function renderNews() {
  panel.innerHTML = `<div class="adm-panel-head"><h2>News &amp; Insights</h2>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="adm-btn adm-btn--soft" id="nSeed" type="button">Import starter content</button>
      <button class="adm-btn adm-btn--primary" id="nAdd" type="button">+ Add news item</button>
    </div></div>
    <div class="adm-note">The one item marked <strong>Featured</strong> shows as the large highlighted card. Newest items appear first.</div>
    <div class="adm-list" id="nList"><div class="adm-empty">Loading…</div></div>`;
  $("nAdd").addEventListener("click", () => newsForm(null));
  $("nSeed").addEventListener("click", seedNews);

  const list = (await fetchAll("news")).sort((a, b) => tsMillis(b.createdAt) - tsMillis(a.createdAt));
  const wrap = $("nList");
  if (!list.length) { wrap.innerHTML = `<div class="adm-empty">No news yet. Click “Import starter content”, or “Add news item”.</div>`; return; }
  wrap.innerHTML = list.map((n) => `<div class="adm-row">
    <div class="adm-row__body"><div class="adm-row__title">${esc(n.title)}${n.featured ? '<span class="adm-badge">Featured</span>' : ""}</div>
    <div class="adm-row__meta">${esc(n.category || "")} · ${esc(n.date || "")}</div></div>
    <div class="adm-row__actions">
      <button class="adm-btn adm-btn--soft" data-edit="${n.id}" type="button">Edit</button>
      <button class="adm-btn adm-btn--danger" data-del="${n.id}" type="button">Delete</button>
    </div></div>`).join("");
  wrap.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => newsForm(list.find((x) => x.id === b.getAttribute("data-edit")))));
  wrap.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", async () => {
    if (!confirm("Delete this news item?")) return;
    await deleteDoc(doc(db, "news", b.getAttribute("data-del")));
    renderNews();
  }));
}

function newsForm(n) {
  const isEdit = !!n;
  n = n || { categoryVariant: "orange" };
  panel.innerHTML = `<div class="adm-form"><h3>${isEdit ? "Edit" : "Add"} news item</h3>
    <form id="nForm">
      <div class="adm-field"><label>Headline *</label><input name="title" value="${esc(n.title)}" required /></div>
      <div class="adm-field"><label>Summary *</label><textarea name="body" required>${esc(n.body)}</textarea></div>
      <div class="adm-grid2">
        <div class="adm-field"><label>Category label</label><input name="category" value="${esc(n.category)}" placeholder="Field Update" /></div>
        <div class="adm-field"><label>Category colour</label><select name="categoryVariant">${optionList(NEWS_VARIANTS, n.categoryVariant)}</select></div>
      </div>
      <div class="adm-grid2">
        <div class="adm-field"><label>Date (free text)</label><input name="date" value="${esc(n.date)}" placeholder="2025" /></div>
        <div class="adm-field"><label>Source (featured only)</label><input name="source" value="${esc(n.source)}" placeholder="Safe Cities Foundation" /></div>
      </div>
      <div class="adm-field"><label>Featured badge text (featured only)</label><input name="badge" value="${esc(n.badge)}" placeholder="Featured Report" /></div>
      <div class="adm-field adm-check"><input type="checkbox" name="featured" id="nFeat" ${n.featured ? "checked" : ""} /><label for="nFeat" style="margin:0">Show as the featured (large) item</label></div>
      <div class="adm-form__actions">
        <button class="adm-btn adm-btn--primary" type="submit" id="nSave">${isEdit ? "Save changes" : "Add item"}</button>
        <button class="adm-btn adm-btn--soft" type="button" id="nCancel">Cancel</button>
      </div>
    </form></div>`;
  $("nCancel").addEventListener("click", renderNews);
  $("nForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const save = $("nSave"); save.disabled = true; save.textContent = "Saving…";
    const featured = f.featured.checked;
    const data = {
      title: f.title.value.trim(),
      body: f.body.value.trim(),
      category: f.category.value.trim(),
      categoryVariant: f.categoryVariant.value,
      date: f.date.value.trim(),
      source: f.source.value.trim(),
      badge: f.badge.value.trim() || "Featured",
      featured: featured
    };
    try {
      // Ensure only one featured item: clear the flag on the others.
      if (featured) {
        const all = await fetchAll("news");
        await Promise.all(all.filter((x) => x.featured && x.id !== (n.id || "")).map((x) => updateDoc(doc(db, "news", x.id), { featured: false })));
      }
      if (isEdit) await updateDoc(doc(db, "news", n.id), data);
      else { data.createdAt = serverTimestamp(); await addDoc(collection(db, "news"), data); }
      renderNews();
    } catch (ex) { alert("Could not save: " + ex.message); save.disabled = false; save.textContent = "Save"; }
  });
}

async function seedNews() {
  if (!window.SCF || !window.SCF.seed) { alert("Starter content unavailable."); return; }
  if (!confirm("Import the current starter news items into the database? Do this only once.")) return;
  const seed = window.SCF.seed.news;
  for (let i = 0; i < seed.length; i++) {
    const item = Object.assign({}, seed[i], { createdAt: serverTimestamp() });
    await addDoc(collection(db, "news"), item);
  }
  renderNews();
}

/* ==========================================================================
   MESSAGES  (read-only)
   ========================================================================== */
async function renderMessages() {
  panel.innerHTML = `<div class="adm-panel-head"><h2>Contact messages</h2></div>
    <div class="adm-list" id="mList"><div class="adm-empty">Loading…</div></div>`;
  const list = (await fetchAll("messages")).sort((a, b) => tsMillis(b.createdAt) - tsMillis(a.createdAt));
  const wrap = $("mList");
  if (!list.length) { wrap.innerHTML = `<div class="adm-empty">No messages yet. Submissions from the website contact form will appear here.</div>`; return; }
  wrap.innerHTML = list.map((m) => `<div class="adm-row" style="align-items:flex-start;flex-direction:column">
      <div style="display:flex;width:100%;gap:12px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap">
        <div class="adm-row__body">
          <div class="adm-row__title">${esc(m.name || "—")}${!m.read ? '<span class="adm-badge adm-badge--new">New</span>' : ""}</div>
          <div class="adm-row__meta">
            <a href="mailto:${esc(m.email)}">${esc(m.email)}</a>${m.organisation ? " · " + esc(m.organisation) : ""}${m.country ? " · " + esc(m.country) : ""}
            ${m.interest ? " · " + esc(m.interest) : ""} · ${esc(fmtDate(m.createdAt))}
          </div>
        </div>
        <div class="adm-row__actions">
          ${!m.read ? `<button class="adm-btn adm-btn--soft" data-read="${m.id}" type="button">Mark read</button>` : ""}
          <button class="adm-btn adm-btn--danger" data-del="${m.id}" type="button">Delete</button>
        </div>
      </div>
      <div class="adm-msg-body">${esc(m.message || "")}</div>
    </div>`).join("");
  wrap.querySelectorAll("[data-read]").forEach((b) => b.addEventListener("click", async () => {
    await updateDoc(doc(db, "messages", b.getAttribute("data-read")), { read: true });
    renderMessages();
  }));
  wrap.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", async () => {
    if (!confirm("Delete this message?")) return;
    await deleteDoc(doc(db, "messages", b.getAttribute("data-del")));
    renderMessages();
  }));
}
