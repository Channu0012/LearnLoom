"use client";
// ---------------------------------------------------------------------------
// Auth context — wraps Firebase Auth with React context.
// Provides: user, userDoc, loading, Google and Email signIn, signUp, signOut,
// password reset, and robust error handling for popups, redirects, and edge cases.
// ---------------------------------------------------------------------------
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { auth, getFreshGoogleProvider } from "@/lib/firebase";
import { createUserDoc, getUser } from "@/lib/firestore";
import type { UserDoc } from "@/lib/types";
import { LIMITS } from "@/lib/constants";
import { isDisposableEmail, validateSecurePassword, sanitizeDisplayName } from "@/lib/security";

export type AuthModalMode = "signin" | "signup" | "forgot";

interface AuthContextValue {
  user: User | null;
  userDoc: UserDoc | null;
  loading: boolean;
  isSigningIn: boolean;
  authError: string | null;
  authSuccess: string | null;
  signIn: () => Promise<void>;
  signInWithRedirectMode: () => Promise<void>;
  signInWithEmail: (_email: string, _pass: string) => Promise<boolean>;
  signUpWithEmail: (_email: string, _pass: string, _displayName: string) => Promise<boolean>;
  resetPassword: (_email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
  clearAuthSuccess: () => void;
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  openAuthModal: (_mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  setAuthModalMode: (_mode: AuthModalMode) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>("signin");

  const openAuthModal = (mode: AuthModalMode = "signin") => {
    setAuthError(null);
    setAuthSuccess(null);
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthError(null);
    setAuthSuccess(null);
  };

  useEffect(() => {
    // Ensure persistent session storage in browser
    if (typeof window !== "undefined") {
      setPersistence(auth, browserLocalPersistence).catch(() => {});
    }

    // Process redirect result if returning from a mobile/redirect flow
    getRedirectResult(auth)
      .then((cred) => {
        if (cred?.user) {
          setUser(cred.user);
          const optimisticDoc: UserDoc = {
            uid: cred.user.uid,
            displayName: (
              cred.user.displayName ??
              cred.user.email?.split("@")[0] ??
              "Learner"
            ).slice(0, LIMITS.DISPLAY_NAME),
            photoURL: cred.user.photoURL,
            isAdmin: false,
            createdAt: null,
          };
          setUserDoc(optimisticDoc);
          setIsAuthModalOpen(false);
          setIsSigningIn(false);
          setLoading(false);
        }
      })
      .catch((err) => {
        const fbErr = err as { code?: string; message?: string };
        if (fbErr?.code === "auth/account-exists-with-different-credential") {
          setAuthError(
            "An account already exists with this email address. Please sign in with your password below."
          );
          setAuthModalMode("signin");
          setIsAuthModalOpen(true);
        } else if (fbErr?.code === "auth/unauthorized-domain") {
          const host = typeof window !== "undefined" ? window.location.hostname : "this domain";
          setAuthError(
            `Domain '${host}' is not authorized in Firebase Console. Please add '${host}' to Authorized domains.`
          );
          setIsAuthModalOpen(true);
        }
      });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // Immediate optimistic representation so the UI unlocks instantly (0ms)
        const optimisticDoc: UserDoc = {
          uid: firebaseUser.uid,
          displayName: (
            firebaseUser.displayName ??
            firebaseUser.email?.split("@")[0] ??
            "Learner"
          ).slice(0, LIMITS.DISPLAY_NAME),
          photoURL: firebaseUser.photoURL,
          isAdmin: false,
          createdAt: null,
        };
        setUserDoc(optimisticDoc);
        setLoading(false);
        setIsSigningIn(false);
        setIsAuthModalOpen(false);

        // Background non-blocking sync with Firestore (guarded with 3.5s timeout)
        (async () => {
          try {
            const timeoutPromise = new Promise<null>((resolve) =>
              setTimeout(() => resolve(null), 3500)
            );
            const fetchPromise = getUser(firebaseUser.uid);
            let doc = await Promise.race([fetchPromise, timeoutPromise]);

            if (!doc) {
              try {
                await createUserDoc(firebaseUser.uid, {
                  uid: firebaseUser.uid,
                  displayName: optimisticDoc.displayName,
                  photoURL: firebaseUser.photoURL,
                });
                doc = await Promise.race([getUser(firebaseUser.uid), timeoutPromise]);
              } catch {
                // Ignore firestore write error, optimisticDoc remains active
              }
            }

            if (doc) {
              setUserDoc(doc);
            }
          } catch {
            // Keep optimisticDoc active
          }
        })();
      } else {
        setUser(null);
        setUserDoc(null);
        setLoading(false);
        setIsSigningIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 1-Click Google Sign-In with device-optimized Popup (desktop, tablet & mobile)
  const signIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    setAuthError(null);
    setAuthSuccess(null);

    const safetyTimer = setTimeout(() => {
      setIsSigningIn(false);
    }, 15000);

    try {
      const provider = getFreshGoogleProvider();
      const cred = await signInWithPopup(auth, provider);
      clearTimeout(safetyTimer);

      if (cred?.user) {
        setUser(cred.user);
        const optimisticDoc: UserDoc = {
          uid: cred.user.uid,
          displayName: (cred.user.displayName ?? cred.user.email?.split("@")[0] ?? "Learner").slice(
            0,
            LIMITS.DISPLAY_NAME
          ),
          photoURL: cred.user.photoURL,
          isAdmin: false,
          createdAt: null,
        };
        setUserDoc(optimisticDoc);
        setIsAuthModalOpen(false);
        setIsSigningIn(false);
        setLoading(false);
        return;
      }
    } catch (err: unknown) {
      clearTimeout(safetyTimer);
      const fbErr = err as { code?: string; message?: string };
      console.warn("Google signInWithPopup:", fbErr?.code, fbErr?.message);

      if (fbErr?.code === "auth/popup-blocked" || fbErr?.code === "auth/cancelled-popup-request") {
        try {
          const provider = getFreshGoogleProvider();
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectErr: unknown) {
          const rErr = redirectErr as { code?: string; message?: string };
          setAuthError(
            rErr?.message || "Popup was blocked. Please enable popups or use email sign-in."
          );
        }
      } else if (fbErr?.code === "auth/popup-closed-by-user") {
        setAuthError(
          "Sign-in window was closed. Click 'Continue with Google' and select your account to sign in."
        );
      } else if (
        fbErr?.code === "auth/web-storage-unsupported" ||
        fbErr?.message?.includes("third-party cookies")
      ) {
        setAuthError(
          "Third-party cookies or web storage are restricted. Tap 'Popup blocked? Use direct sign-in →' below."
        );
      } else if (fbErr?.code === "auth/account-exists-with-different-credential") {
        setAuthError(
          "An account already exists with this email address using email & password. Please sign in with your password below."
        );
        setAuthModalMode("signin");
      } else if (
        fbErr?.code === "auth/api-key-not-valid.-please-pass-a-valid-api-key." ||
        fbErr?.code === "auth/invalid-api-key"
      ) {
        setAuthError(
          "Firebase API configuration issue. Please verify your environment keys in .env.local."
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
      } else if (fbErr?.code === "auth/network-request-failed") {
        setAuthError(
          "Network connection failed during Google sign-in. Please check your internet and try again."
        );
      } else {
        setAuthError(fbErr?.message ?? "Google sign-in could not be completed. Please try again.");
      }
    } finally {
      clearTimeout(safetyTimer);
      setIsSigningIn(false);
    }
  };

  // Direct Redirect Google Sign-In (ideal for mobile or strict popup blockers)
  const signInWithRedirectMode = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = getFreshGoogleProvider();
      await signInWithRedirect(auth, provider);
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      if (fbErr?.code === "auth/unauthorized-domain") {
        const host = typeof window !== "undefined" ? window.location.hostname : "this domain";
        setAuthError(
          `Domain not authorized in Firebase (${host}). Please add '${host}' to Firebase Console > Authentication > Settings > Authorized domains.`
        );
      } else {
        setAuthError(fbErr?.message ?? "Failed to redirect for Google Sign-In.");
      }
      setIsSigningIn(false);
    }
  };

  // Email & Password Sign-In with auto-trimming and lowercasing
  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setIsSigningIn(true);
    setAuthError(null);
    setAuthSuccess(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setAuthError("Please enter your email address.");
      setIsSigningIn(false);
      return false;
    }
    if (!pass) {
      setAuthError("Please enter your password.");
      setIsSigningIn(false);
      return false;
    }

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, pass);
      setIsAuthModalOpen(false);
      return true;
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      if (
        fbErr?.code === "auth/user-not-found" ||
        fbErr?.code === "auth/wrong-password" ||
        fbErr?.code === "auth/invalid-credential"
      ) {
        setAuthError("Wrong password. Try again or reset it below.");
      } else if (fbErr?.code === "auth/invalid-email") {
        setAuthError("Please enter a valid email address (e.g. name@example.com).");
      } else if (fbErr?.code === "auth/too-many-requests") {
        setAuthError(
          "Account temporarily locked due to repeated failed attempts. Please reset your password or try again in a few minutes."
        );
      } else if (fbErr?.code === "auth/network-request-failed") {
        setAuthError("Network connection failed. Please check your internet and try again.");
      } else {
        setAuthError(fbErr?.message ?? "Failed to sign in. Please try again.");
      }
      return false;
    } finally {
      setIsSigningIn(false);
    }
  };

  // Email & Password Sign-Up with anti-abuse and strong validation
  const signUpWithEmail = async (
    email: string,
    pass: string,
    displayName: string
  ): Promise<boolean> => {
    setIsSigningIn(true);
    setAuthError(null);
    setAuthSuccess(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setAuthError("Please enter your email address.");
      setIsSigningIn(false);
      return false;
    }

    // Z++ Anti-Abuse: Block disposable / throwaway burner emails
    if (isDisposableEmail(cleanEmail)) {
      setAuthError(
        "Disposable and temporary burner email addresses are not permitted. Please use a verified personal or work email."
      );
      setIsSigningIn(false);
      return false;
    }

    // Z++ Password Security Validation
    const pwCheck = validateSecurePassword(pass);
    if (!pwCheck.valid) {
      setAuthError(
        pwCheck.reason || "Password must be at least 8 characters with letters and numbers."
      );
      setIsSigningIn(false);
      return false;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      const cleanName = sanitizeDisplayName(
        displayName.trim() || cleanEmail.split("@")[0] || "Student",
        LIMITS.DISPLAY_NAME
      );
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
        setAuthError(
          "This email address is already registered. Please sign in below or reset your password."
        );
        setAuthModalMode("signin");
      } else if (fbErr?.code === "auth/weak-password") {
        setAuthError("Password must be at least 8 characters long with letters and numbers.");
      } else if (fbErr?.code === "auth/invalid-email") {
        setAuthError("Please enter a valid email address (e.g. name@example.com).");
      } else if (fbErr?.code === "auth/network-request-failed") {
        setAuthError("Network connection failed. Please check your internet and try again.");
      } else {
        setAuthError(fbErr?.message ?? "Failed to create account. Please try again.");
      }
      return false;
    } finally {
      setIsSigningIn(false);
    }
  };

  // Password Reset with Firebase
  const resetPassword = async (email: string): Promise<boolean> => {
    setIsSigningIn(true);
    setAuthError(null);
    setAuthSuccess(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setAuthError("Please enter your email address to receive a password reset link.");
      setIsSigningIn(false);
      return false;
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setAuthSuccess(
        `Password reset link sent to ${cleanEmail}. Please check your inbox (and spam folder) for instructions.`
      );
      return true;
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      if (fbErr?.code === "auth/user-not-found") {
        setAuthError(
          "No account found with this email address. If you registered with Google, you can sign in with Google directly."
        );
      } else if (fbErr?.code === "auth/invalid-email") {
        setAuthError("Please enter a valid email address (e.g. name@example.com).");
      } else if (fbErr?.code === "auth/too-many-requests") {
        setAuthError(
          "Too many reset requests sent recently. Please wait a few minutes before trying again."
        );
      } else {
        setAuthError(fbErr?.message ?? "Failed to send password reset email. Please try again.");
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
  const clearAuthSuccess = () => setAuthSuccess(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        userDoc,
        loading,
        isSigningIn,
        authError,
        authSuccess,
        signIn,
        signInWithRedirectMode,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signOut,
        clearAuthError,
        clearAuthSuccess,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
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
