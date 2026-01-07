// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
