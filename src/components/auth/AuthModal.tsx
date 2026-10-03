"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { isDisposableEmail, validateSecurePassword } from "@/lib/security";

export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    signIn,
    signInWithEmail,
    signUpWithEmail,
    isSigningIn,
    authError,
    clearAuthError,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Bot honeypot trap
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  // Sync mode changes & clear inputs on open
  useEffect(() => {
    if (isAuthModalOpen) {
      setEmail("");
      setPassword("");
      setName("");
      setHoneypot("");
      setLocalError("");
      clearAuthError();
    }
  }, [isAuthModalOpen, authModalMode, clearAuthError]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isAuthModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuthModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError("");

    // Bot trap: automated scrapers fill all inputs
    if (honeypot.trim()) {
      closeAuthModal();
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setLocalError("Please enter your email address.");
      return;
    }
    if (!password) {
      setLocalError("Please enter your password.");
      return;
    }

    if (authModalMode === "signup") {
      if (isDisposableEmail(cleanEmail)) {
        setLocalError(
          "Disposable and burner email addresses are not permitted. Please use a verified email."
        );
        return;
      }
      const pwCheck = validateSecurePassword(password);
      if (!pwCheck.valid) {
        setLocalError(
          pwCheck.reason || "Password must be at least 8 characters with letters and numbers."
        );
        return;
      }
      await signUpWithEmail(cleanEmail, password, name || cleanEmail.split("@")[0]);
    } else {
      await signInWithEmail(cleanEmail, password);
    }
  };

  const errorMessage = localError || authError;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div className="relative w-full max-w-md bg-card border-2 border-border rounded-2xl shadow-2xl overflow-y-auto max-h-[90dvh] p-6 sm:p-8 animate-scale-in">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-3 right-3 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-colors"
          aria-label="Close modal"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="18" x2="18" y2="6" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 mb-3 border border-primary-200 dark:border-primary-800">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <h2
            id="auth-modal-title"
            className="font-heading font-extrabold text-2xl text-foreground"
          >
            {authModalMode === "signin" ? "Welcome back to VeySkill" : "Start Learning on VeySkill"}
          </h2>
          <p className="font-body text-xs sm:text-sm text-muted-foreground mt-1">
            {authModalMode === "signin"
              ? "Sign in to track progress, save notes, and publish courses."
              : "Create a free account to track lessons, take notes, and build daily streaks."}
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 bg-muted rounded-xl mb-6 font-heading font-bold text-xs">
          <button
            type="button"
            onClick={() => openAuthModal("signin")}
            className={`py-2.5 min-h-[44px] inline-flex items-center justify-center rounded-lg transition-all ${
              authModalMode === "signin"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => openAuthModal("signup")}
            className={`py-2.5 min-h-[44px] inline-flex items-center justify-center rounded-lg transition-all ${
              authModalMode === "signup"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="p-3 mb-4 rounded-xl border border-destructive/30 bg-red-500/10 text-destructive text-xs font-body flex items-start gap-2 animate-fade-in"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="flex-shrink-0 mt-0.5"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {/* Google One-Click Button */}
        <button
          type="button"
          onClick={signIn}
          disabled={isSigningIn}
          className="w-full btn-ghost py-3 min-h-[48px] text-sm flex items-center justify-center gap-3 mb-4 border-2 hover:bg-muted font-heading font-bold transition-transform active:scale-[0.99]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] font-body uppercase tracking-wider text-muted-foreground">
            or with email
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot field for trapping automated malicious bots */}
          <div className="hidden" aria-hidden="true" style={{ display: "none" }}>
            <label htmlFor="website-trap">Leave this blank</label>
            <input
              id="website-trap"
              type="text"
              name="website_trap"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {authModalMode === "signup" && (
            <div>
              <label
                htmlFor="auth-name"
                className="block text-xs font-heading font-bold text-foreground mb-1"
              >
                Your Full Name
              </label>
              <input
                id="auth-name"
                type="text"
                autoComplete="name"
                placeholder="e.g. Marie Curie"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-body text-base sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="block text-xs font-heading font-bold text-foreground mb-1"
            >
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-body text-base sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="auth-password"
                className="text-xs font-heading font-bold text-foreground"
              >
                Password
              </label>
              <span className="text-[11px] text-primary-600 dark:text-primary-400 font-body">
                {authModalMode === "signin"
                  ? "Min 6 characters"
                  : "Min 8 chars (letters + numbers)"}
              </span>
            </div>
            <div className="relative">
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                autoComplete={authModalMode === "signin" ? "current-password" : "new-password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-border bg-background text-foreground font-body text-base sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSigningIn}
            className="w-full btn-primary py-3 min-h-[48px] text-sm mt-2 flex items-center justify-center gap-2"
          >
            {isSigningIn ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Please wait…</span>
              </>
            ) : (
              <span>
                {authModalMode === "signin" ? "Sign In with Email" : "Create Free Account"}
              </span>
            )}
          </button>
        </form>

        {/* Security & Free Guarantee Notice */}
        <div className="mt-6 pt-4 border-t border-border flex items-center justify-center gap-2 text-[11px] text-muted-foreground font-body">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>100% Free · Cloud Synced · Never any spam</span>
        </div>
      </div>
    </div>
  );
}
