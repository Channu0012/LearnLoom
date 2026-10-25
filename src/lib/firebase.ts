// ---------------------------------------------------------------------------
// Firebase Client SDK initialisation (browser-side)
// ---------------------------------------------------------------------------
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import {
  initializeFirestore,
  getFirestore,
  connectFirestoreEmulator,
  setLogLevel,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

// Suppress internal Firebase/gRPC console logs in production/development
try {
  setLogLevel("silent");
} catch {
  // Ignore if already set or unsupported in environment
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCaqADQyqxNJ4QhXZQj6ItS40XTiEnEZaY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "learnloom-27899.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "learnloom-27899",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "learnloom-27899.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1021248602836",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1021248602836:web:f753f40b72a084f5fef141",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

// Prevent reinitialising in hot-reload / server-component contexts
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Enable persistent multi-tab IndexedDB cache in browser for instant loading on slow connections
function getFirestoreInstance() {
  if (typeof window !== "undefined") {
    try {
      return initializeFirestore(app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
        ignoreUndefinedProperties: true,
      });
    } catch {
      return getFirestore(app);
    }
  }
  return getFirestore(app);
}

export const db = getFirestoreInstance();

export function getFreshGoogleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account",
  });
  return provider;
}

export const googleProvider = getFreshGoogleProvider();

// Connect to emulators in development (when env var is set)
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true" && typeof window !== "undefined") {
  // Only connect if not already connected
  try {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", {
      disableWarnings: true,
    });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
  } catch {
    // Already connected — ignore
  }
}
