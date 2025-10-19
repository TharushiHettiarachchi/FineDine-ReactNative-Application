
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyD6otX0ShRq_YiNp5_6JpFetGuakCfrolc",
  authDomain: "finedine-3970b.firebaseapp.com",
  databaseURL: "https://finedine-3970b-default-rtdb.asia-southeast1.firebasedatabase.app", 
  projectId: "finedine-3970b",
  storageBucket: "finedine-3970b.firebasestorage.app",
  messagingSenderId: "100569643108",
  appId: "1:100569643108:web:1f91e24c5306aca1e4c771",
  measurementId: "G-Q2QRJQM00G"
};


const app = initializeApp(firebaseConfig);


const db = getFirestore(app);


const database = getDatabase(app);

export { db, database };
