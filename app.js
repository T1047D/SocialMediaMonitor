
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
  serverTimestamp
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
onAuthStateChanged(auth, (user) => {

  if (user) {

    authSection.innerHTML = `
      <h2>Welcome, ${user.displayName || "User"}!</h2>
      <p>${user.email}</p>
      <button id="logoutBtn">Logout</button>
    `;

    document.getElementById("logoutBtn").addEventListener("click", async () => {
      await signOut(auth);
    });

  } else {

    authSection.style.display = "block";

  }

});

console.log("Authentication system initialized.");
