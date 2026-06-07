import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCogixCyHR-nLagqKWqh-RIGTakj5uRoZA",
  authDomain: "vex-central.firebaseapp.com",
  projectId: "vex-central",
  storageBucket: "vex-central.firebasestorage.app",
  messagingSenderId: "33666853522",
  appId: "1:33666853522:web:21efd973870a5ecb0cd44b",
  measurementId: "G-TYPCKHQGZJ"
};

// Prevent re-initializing on hot reload in dev mode
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
