import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAJntn-WUZdbUgiccn7zzcO-r27C7FRN3o",
  authDomain: "kagabofinance.firebaseapp.com",
  projectId: "kagabofinance",
  storageBucket: "kagabofinance.firebasestorage.app",
  messagingSenderId: "765572427695",
  appId: "1:765572427695:web:71e51b642dcf8e614b895a",
  measurementId: "G-2F2QPE4WB5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Analytics is only initialized in browser environments
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, auth, db, storage, analytics };
