import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCD8Ms0GbRB832L69auqATjle5njjyRPeQ",
  authDomain: "social-seo-a93a6.firebaseapp.com",
  projectId: "social-seo-a93a6",
  storageBucket: "social-seo-a93a6.firebasestorage.app",
  messagingSenderId: "783290066742",
  appId: "1:783290066742:web:992fdd9fd3e5df06faf597",
  measurementId: "G-X002KVP046"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Simple anonymous login helper
export const loginAnonymously = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in anonymously:", error);
    throw error;
  }
};

export { db, auth };
