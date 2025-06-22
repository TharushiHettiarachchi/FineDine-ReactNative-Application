// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD6otX0ShRq_YiNp5_6JpFetGuakCfrolc",
  authDomain: "finedine-3970b.firebaseapp.com",
  projectId: "finedine-3970b",
  storageBucket: "finedine-3970b.firebasestorage.app",
  messagingSenderId: "100569643108",
  appId: "1:100569643108:web:1f91e24c5306aca1e4c771",
  measurementId: "G-Q2QRJQM00G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };