// ---------------------------------------------------------------------------
// Firebase Admin SDK initialisation (server-only)
// Never import this in client components or pages that run in the browser.
// ---------------------------------------------------------------------------
import { initializeApp, getApps, cert, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function initAdmin() {
  if (getApps().length > 0) return getApp();

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  // In emulator/CI environments without credentials, fall back to projectId only
  if (!clientEmail || !privateKey) {
    return initializeApp({ projectId: projectId ?? "vidcura-dev" });
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

const adminApp = initAdmin();

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
