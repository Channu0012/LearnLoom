"use client";
// ---------------------------------------------------------------------------
// Auth context — wraps Firebase Auth with React context.
// Provides: user, userDoc, loading, Google and Email signIn, signUp, signOut.
// ---------------------------------------------------------------------------
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { createUserDoc, getUser } from "@/lib/firestore";
import type { UserDoc } from "@/lib/types";
import { LIMITS } from "@/lib/constants";

interface AuthContextValue {
  user: User | null;
  userDoc: UserDoc | null;
  loading: boolean;
  isSigningIn: boolean;
  authError: string | null;
  signIn: () => Promise<void>;
  signInWithEmail: (_email: string, _pass: string) => Promise<boolean>;
  signUpWithEmail: (_email: string, _pass: string, _displayName: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
  isAuthModalOpen: boolean;
  authModalMode: "signin" | "signup";
  openAuthModal: (_mode?: "signin" | "signup") => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");

  const openAuthModal = (mode: "signin" | "signup" = "signin") => {
    setAuthError(null);
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthError(null);
  };

  useEffect(() => {
    // Check for redirect result if popup was blocked earlier
    getRedirectResult(auth).catch(() => {
      // Harmless if no redirect was pending
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Create/merge user document on first login
          await createUserDoc(firebaseUser.uid, {
            uid: firebaseUser.uid,
            displayName: (
              firebaseUser.displayName ??
              firebaseUser.email?.split("@")[0] ??
              "Learner"
            ).slice(0, LIMITS.DISPLAY_NAME),
            photoURL: firebaseUser.photoURL,
          });
          const doc = await getUser(firebaseUser.uid);
          setUserDoc(doc);
        } catch {
          // If Firestore is offline or permission denied, set fallback memory representation
          setUserDoc({
            uid: firebaseUser.uid,
            displayName: (
              firebaseUser.displayName ??
              firebaseUser.email?.split("@")[0] ??
              "Learner"
            ).slice(0, LIMITS.DISPLAY_NAME),
            photoURL: firebaseUser.photoURL,
            isAdmin: false,
            createdAt: null,
          });
        }
      } else {
        setUserDoc(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    // Prevent duplicate simultaneous popup requests
    if (isSigningIn) return;
    setIsSigningIn(true);
    setAuthError(null);

    try {
      await signInWithPopup(auth, googleProvider);
      setIsAuthModalOpen(false);
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      if (fbErr?.code === "auth/popup-blocked") {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch {
          setAuthError(
            "Sign-in popup was blocked by your browser. Please allow popups for this site."
          );
        }
      } else if (
        fbErr?.code === "auth/cancelled-popup-request" ||
        fbErr?.code === "auth/popup-closed-by-user"
      ) {
        // User closed or reopened popup — safe to ignore silently
      } else if (
        fbErr?.code === "auth/api-key-not-valid.-please-pass-a-valid-api-key." ||
        fbErr?.code === "auth/invalid-api-key"
      ) {
        setAuthError(
          "Firebase configuration updated in .env.local. Please restart your dev server (Ctrl+C and npm run dev) so Next.js reloads the new keys."
        );
      } else if (fbErr?.code === "auth/operation-not-allowed") {
        setAuthError(
          "Google Sign-In is not enabled yet in your Firebase Console. In Firebase Console > Authentication > Sign-in method, click Google and Enable it."
        );
      } else if (fbErr?.code === "auth/unauthorized-domain") {
        const host = typeof window !== "undefined" ? window.location.hostname : "this domain";
        setAuthError(
          `Domain not authorized (${host}). Please ensure '${host}' is listed in Firebase Console > Authentication > Settings > Authorized domains.`
        );
      } else {
        setAuthError(
          fbErr?.message ?? "Sign-in failed. Please verify your connection and try again."
        );
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      setIsAuthModalOpen(false);
      return true;
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      if (
        fbErr?.code === "auth/user-not-found" ||
        fbErr?.code === "auth/wrong-password" ||
        fbErr?.code === "auth/invalid-credential"
      ) {
        setAuthError(
          "Invalid email or password. Please verify your details or create a new account."
        );
      } else if (fbErr?.code === "auth/invalid-email") {
        setAuthError("Please enter a valid email address.");
      } else if (fbErr?.code === "auth/too-many-requests") {
        setAuthError(
          "Access temporarily disabled due to multiple failed attempts. Please reset your password or try again later."
        );
      } else {
        setAuthError(fbErr?.message ?? "Failed to sign in. Please try again.");
      }
      return false;
    } finally {
      setIsSigningIn(false);
    }
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    displayName: string
  ): Promise<boolean> => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const cleanName = displayName.trim().slice(0, LIMITS.DISPLAY_NAME) || email.split("@")[0];
      await updateProfile(userCredential.user, { displayName: cleanName });
      await createUserDoc(userCredential.user.uid, {
        uid: userCredential.user.uid,
        displayName: cleanName,
        photoURL: null,
      });
      setIsAuthModalOpen(false);
      return true;
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      if (fbErr?.code === "auth/email-already-in-use") {
        setAuthError("This email address is already registered. Please sign in instead.");
      } else if (fbErr?.code === "auth/weak-password") {
        setAuthError("Password should be at least 6 characters long.");
      } else if (fbErr?.code === "auth/invalid-email") {
        setAuthError("Please enter a valid email address.");
      } else {
        setAuthError(fbErr?.message ?? "Failed to create account. Please try again.");
      }
      return false;
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
    } catch {
      // Safe fallback
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        userDoc,
        loading,
        isSigningIn,
        authError,
        signIn,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        clearAuthError,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
