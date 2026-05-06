import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDliSA0x8WFVdNtWnXQW9p_3ZZIDH0hm80",
  authDomain: "motolog-cf59b.firebaseapp.com",
  projectId: "motolog-cf59b",
  storageBucket: "motolog-cf59b.firebasestorage.app",
  messagingSenderId: "270149348940",
  appId: "1:270149348940:web:79cd7c6601d8cde89d0ee9",
  measurementId: "G-3CGG7YMZ83"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
