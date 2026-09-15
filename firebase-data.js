import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, serverTimestamp, setDoc, writeBatch } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const config = window.CINEWISE_FIREBASE_CONFIG || {};
const configured = Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);

if (!configured) {
  window.cinewiseCloud = { configured: false };
  window.dispatchEvent(new CustomEvent("cinewise-cloud-ready"));
} else {
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const provider = new GoogleAuthProvider();
  const cleanId = id => String(id).replace(/[^a-zA-Z0-9_-]/g, "_");
  const userRoot = uid => doc(db, "users", uid);
  const itemDoc = (uid, group, id) => doc(db, "users", uid, group, cleanId(id));

  async function loadUserData(uid) {
    const [preferences, watchlist, watched] = await Promise.all([
      getDoc(doc(userRoot(uid), "profile", "preferences")),
      getDocs(collection(userRoot(uid), "watchlist")),
      getDocs(collection(userRoot(uid), "watched"))
    ]);
    return {
      preferences: preferences.exists() ? preferences.data() : null,
      watchlist: watchlist.docs.map(item => item.data()),
      watched: watched.docs.map(item => item.data()).sort((a, b) => String(b.watchedAt || "").localeCompare(String(a.watchedAt || "")))
    };
  }

  async function savePreferences(uid, preferences) {
    return setDoc(doc(userRoot(uid), "profile", "preferences"), { ...preferences, updatedAt: serverTimestamp() }, { merge: true });
  }

  async function saveWatchlistItem(uid, entry) {
    return setDoc(itemDoc(uid, "watchlist", entry.id), { ...entry, updatedAt: serverTimestamp() });
  }

  async function removeWatchlistItem(uid, id) {
    return deleteDoc(itemDoc(uid, "watchlist", id));
  }

  async function markWatched(uid, entry) {
    const batch = writeBatch(db);
    batch.set(itemDoc(uid, "watched", entry.id), { ...entry, watchedAt: new Date().toISOString(), updatedAt: serverTimestamp() });
    batch.delete(itemDoc(uid, "watchlist", entry.id));
    return batch.commit();
  }

  async function restoreWatched(uid, id) {
    return deleteDoc(itemDoc(uid, "watched", id));
  }

  async function migrate(uid, data) {
    const batch = writeBatch(db);
    batch.set(doc(userRoot(uid), "profile", "preferences"), { owned: data.owned, region: data.region, updatedAt: serverTimestamp() }, { merge: true });
    data.watchlist.forEach(entry => batch.set(itemDoc(uid, "watchlist", entry.id), { ...entry, updatedAt: serverTimestamp() }));
    data.watched.forEach(entry => batch.set(itemDoc(uid, "watched", entry.id), { ...entry, watchedAt: entry.watchedAt || new Date().toISOString(), updatedAt: serverTimestamp() }));
    return batch.commit();
  }

  window.cinewiseCloud = {
    configured: true,
    observe: callback => onAuthStateChanged(auth, callback),
    signIn: () => signInWithPopup(auth, provider),
    signOut: () => signOut(auth),
    loadUserData, savePreferences, saveWatchlistItem, removeWatchlistItem,
    markWatched, restoreWatched, migrate
  };
  window.dispatchEvent(new CustomEvent("cinewise-cloud-ready"));
}
