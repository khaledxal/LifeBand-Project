import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDY65kaF-DfYWkxoMZOAxlnwGj6y_MpM7I",
  authDomain: "lifeband-affa0.firebaseapp.com",
  databaseURL: "https://lifeband-affa0-default-rtdb.firebaseio.com",
  projectId: "lifeband-affa0",
  storageBucket: "lifeband-affa0.firebasestorage.app",
  messagingSenderId: "615316480384",
  appId: "1:615316480384:web:c1969cf872c81d49302165",
  measurementId: "G-1PL4ZTZ1N3"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);