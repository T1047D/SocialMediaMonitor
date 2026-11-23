
import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";


import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Elements
const authSection = document.getElementById("authSection");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authMessage = document.getElementById("authMessage");

const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

// Switch forms
showRegister.addEventListener("click", (e) => {
  e.preventDefault();

  loginForm.hidden = true;
  registerForm.hidden = false;
  authMessage.textContent = "";
});

showLogin.addEventListener("click", (e) => {
  e.preventDefault();

  registerForm.hidden = true;
  loginForm.hidden = false;
  authMessage.textContent = "";
});

// Registration
registerBtn.addEventListener("click", async () => {

  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;

  if (!name || !email || !password) {
    authMessage.textContent = "Please fill in all fields.";
    return;
  }

  if (password.length < 6) {
    authMessage.textContent = "Password must be at least 6 characters.";
    return;
  }

  registerBtn.disabled = true;
  authMessage.textContent = "Creating account...";

  try {

    const result = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await updateProfile(result.user, {
      displayName: name
    });

    await setDoc(doc(db, "users", result.user.uid), {
      name: name,
      email: email,
      createdAt: serverTimestamp()
    });

    authMessage.textContent = "Account created successfully!";

  } catch (error) {

    authMessage.textContent = error.message;

  } finally {

    registerBtn.disabled = false;

  }

});

// Login
loginBtn.addEventListener("click", async () => {

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    authMessage.textContent = "Enter email and password.";
    return;
  }

  loginBtn.disabled = true;
  authMessage.textContent = "Logging in...";

  try {

    await signInWithEmailAndPassword(auth, email, password);

    authMessage.textContent = "Login successful!";

  } catch (error) {

    authMessage.textContent = error.message;

  } finally {

    loginBtn.disabled = false;

  }

});


// Authentication state
const userPanel = document.getElementById("userPanel");

onAuthStateChanged(auth, (user) => {

  if (user) {

    loginForm.hidden = true;
    registerForm.hidden = true;
    authMessage.textContent = "";
    userPanel.hidden = false;

    userPanel.innerHTML = `
      <h2>Welcome, ${user.displayName || "User"}!</h2>
      <p>${user.email}</p>
      <button id="logoutBtn">Logout</button>
    `;

    document.getElementById("logoutBtn").addEventListener(
      "click",
      async () => {
        try {
          await signOut(auth);
        } catch (error) {
          authMessage.textContent = error.message;
        }
      }
    );

  } else {

    userPanel.hidden = true;
    userPanel.innerHTML = "";

    authSection.style.display = "block";

    loginForm.hidden = false;
    registerForm.hidden = true;

  }

});

console.log("Authentication system initialized.");


// =================================
// SOURCE MANAGER
// =================================

const monitoringSection = document.getElementById("monitoringSection");
const sourceForm = document.getElementById("sourceForm");
const sourceList = document.getElementById("sourceList");
const sourceMessage = document.getElementById("sourceMessage");
const addSourceBtn = document.getElementById("addSourceBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
let currentUser = null;
let unsubscribeSources = null;

// Validate supported social media URLs
function isValidSourceUrl(platform, url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (platform === "facebook") {
      return host === "facebook.com" ||
             host.endsWith(".facebook.com");
    }

    if (platform === "x") {
      return host === "x.com" ||
             host.endsWith(".x.com") ||
             host === "twitter.com" ||
             host.endsWith(".twitter.com");
    }

    return false;

  } catch {
    return false;
  }
}

// Display sources
function renderSources(snapshot) {
    const allSources = snapshot.docs.map(doc => doc.data());

  document.getElementById("totalSources").textContent =
    allSources.length;

  document.getElementById("facebookSources").textContent =
    allSources.filter(source => source.platform === "facebook").length;

  document.getElementById("xSources").textContent =
    allSources.filter(source => source.platform === "x").length;
  sourceList.replaceChildren();

  if (snapshot.empty) {
    sourceList.textContent = "No sources added yet.";
    return;
  }

  snapshot.forEach((sourceDoc) => {
    const source = sourceDoc.data();

    const card = document.createElement("div");
    card.className = "platform-card";

    const title = document.createElement("h3");
    title.textContent = source.name;

    const platform = document.createElement("p");
    platform.textContent =
      source.platform === "facebook" ? "Facebook" : "X (Twitter)";

    const link = document.createElement("a");
    link.href = source.url;
    link.textContent = "Open Source";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    const editBtn = document.createElement("button");
editBtn.type = "button";
editBtn.textContent = "Edit Source";

editBtn.addEventListener("click", () => {
  document.getElementById("sourcePlatform").value = source.platform;
  document.getElementById("sourceName").value = source.name;
  document.getElementById("sourceUrl").value = source.url;

  sourceForm.dataset.editId = sourceDoc.id;

  addSourceBtn.textContent = "Update Source";
  sourceMessage.textContent = "Editing: " + source.name;

  document.getElementById("sourceName").focus();
});

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete Source";

    deleteBtn.addEventListener("click", async () => {
      if (!currentUser) return;

      if (!confirm("Delete this source?")) return;

      try {
        await deleteDoc(
          doc(db, "users", currentUser.uid, "sources", sourceDoc.id)
        );
        sourceMessage.textContent = "Source deleted successfully.";

      } catch (error) {
        sourceMessage.textContent = error.message;
      }
    });
    card.append(title, platform, link, editBtn, deleteBtn);
    sourceList.appendChild(card);
  });
}

// Add new source
sourceForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentUser) {
    sourceMessage.textContent = "Please login first.";
    return;
  }

  const platform = document.getElementById("sourcePlatform").value;
  const name = document.getElementById("sourceName").value.trim();
  const url = document.getElementById("sourceUrl").value.trim();

  if (!name || !url) {
    sourceMessage.textContent = "Please fill in all fields.";
    return;
  }

  if (!isValidSourceUrl(platform, url)) {
    sourceMessage.textContent =
      "Please enter a valid Facebook or X URL.";
    return;
  }

  addSourceBtn.disabled = true;
  sourceMessage.textContent = "Saving source...";

  try {
  const editId = sourceForm.dataset.editId;

  if (editId) {
    await updateDoc(
      doc(db, "users", currentUser.uid, "sources", editId),
      {
        platform,
        name,
        url,
        updatedAt: serverTimestamp()
      }
    );

    sourceMessage.textContent = "Source updated successfully!";

  } else {
    await addDoc(
      collection(db, "users", currentUser.uid, "sources"),
      {
        platform,
        name,
        url,
        createdAt: serverTimestamp()
      }
    );

    sourceMessage.textContent = "Source added successfully!";
  }

  sourceForm.reset();
  delete sourceForm.dataset.editId;
  addSourceBtn.textContent = "Add Source";

  }

  } catch (error) {
    sourceMessage.textContent = error.message;

  } finally {
    addSourceBtn.disabled = false;
  }
});

// Load sources for logged-in user
onAuthStateChanged(auth, (user) => {

  currentUser = user;

  if (unsubscribeSources) {
    unsubscribeSources();
    unsubscribeSources = null;
  }

  if (!user) {
    monitoringSection.hidden = true;
    return;
  }

  monitoringSection.hidden = false;

  const sourcesRef = collection(
    db,
    "users",
    user.uid,
    "sources"
  );

  unsubscribeSources = onSnapshot(
    sourcesRef,
    renderSources,
    (error) => {
      sourceMessage.textContent =
        "Could not load sources: " + error.message;
    }
  );

});

console.log("Source Manager initialized.");
cancelEditBtn.addEventListener("click", () => {
  sourceForm.reset();

  delete sourceForm.dataset.editId;

  addSourceBtn.textContent = "Add Source";
  cancelEditBtn.hidden = true;

  sourceMessage.textContent = "Edit cancelled.";
});
