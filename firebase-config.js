
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCdp168ghQwiG1IRFmkJC-e2Sfwkyn8H",
  authDomain: "socialmediamonitor-4d326.firebaseapp.com",
  projectId: "socialmediamonitor-4d326",
  storageBucket: "socialmediamonitor-4d326.firebasestorage.app",
  messagingSenderId: "594250034960",
  appId: "1:594250034960:web:f7a1aa71e99de01304ff95"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

export { app, auth, db };
