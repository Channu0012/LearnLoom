"use client";

import { useState, useEffect, Suspense, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { isDisposableEmail } from "@/lib/security";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/my-learning";
  const initialEmail = searchParams.get("email") || "";

  const {
    user,
    signIn,
    signInWithRedirectMode,
    signInWithEmail,
    resetPassword,
    isSigningIn,
    authError,
    authSuccess,
    clearAuthError,
    clearAuthSuccess,
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "forgot">("signin");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [localSuccess, setLocalSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safe redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace(redirectTarget);
    }
  }, [user, router, redirectTarget]);

  if (user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
          <p className="text-sm font-heading font-medium text-muted-foreground">
            Redirecting to your learning space…
          </p>
        </div>
      </div>
    );
  }

  const validateEmailFormat = (rawEmail: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(rawEmail.trim());
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setLocalSuccess("");
    clearAuthError();
    clearAuthSuccess();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setLocalError("Please enter your email address.");
      return;
    }

    if (!validateEmailFormat(cleanEmail)) {
      setLocalError("Please enter a valid email address.");
      return;
    }

    if (isDisposableEmail(cleanEmail)) {
      setLocalError("Disposable email addresses are not permitted. Please use a permanent email.");
      return;
    }

    if (mode === "forgot") {
      setIsSubmitting(true);
      const ok = await resetPassword(cleanEmail);
      setIsSubmitting(false);
      if (ok) {
        setLocalSuccess(
          "Password reset instructions sent. Please check your inbox or spam folder."
        );
      }
      return;
    }

    if (!password) {
      setLocalError("Please enter your account password.");
      return;
    }

    setIsSubmitting(true);
    const ok = await signInWithEmail(cleanEmail, password);
    setIsSubmitting(false);
    if (ok) {
      router.push(redirectTarget);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError("");
    clearAuthError();
    try {
      await signIn();
      router.push(redirectTarget);
    } catch {
      // Automatic fallback to redirect mode if popup blocked
      try {
        await signInWithRedirectMode();
      } catch {
        setLocalError("Google sign-in could not be completed. Please try again or use email.");
      }
    }
  };

  const displayError = localError || authError;
  const displaySuccess = localSuccess || authSuccess;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row w-full bg-background">
      {/* Left: Brand & Trust Panel (Desktop / Tablet) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white relative overflow-hidden flex-col justify-between p-12 xl:p-16 border-r border-border/20">
        {/* Ambient background glows */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-teal-500/15 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Top Header */}
        <div className="relative z-10 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon.svg"
              alt="VeySkill Logo"
              width={40}
              height={40}
              className="w-10 h-10 object-contain transition-transform group-hover:scale-105"
            />
            <span className="font-heading font-black text-2xl tracking-tight text-white">
              Vey<span className="text-teal-400">skill</span>
            </span>
          </Link>
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
            Enterprise Portal
          </span>
        </div>

        {/* Hero Value Proposition */}
        <div className="relative z-10 my-auto py-12 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-heading font-semibold text-teal-200 mb-6 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            Verified Career Credentialing
          </div>

          <h2 className="font-heading font-black text-3xl xl:text-4xl leading-tight text-white mb-4">
            Master High-Impact Skills.{" "}
            <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
              Prove It With Proof.
            </span>
          </h2>

          <p className="font-body text-slate-300 text-sm xl:text-base leading-relaxed mb-8">
            Access distraction-free video playback, automated AI checkpoint quizzes, daily streak
            habits, and cryptographically verified completion certificates recognized by hiring
            teams.
          </p>

          {/* Social Proof & Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
            <div>
              <p className="font-heading font-black text-xl xl:text-2xl text-white">12,000+</p>
              <p className="font-body text-xs text-slate-400">Active Scholars</p>
            </div>
            <div>
              <p className="font-heading font-black text-xl xl:text-2xl text-teal-300">350+</p>
              <p className="font-body text-xs text-slate-400">Curated Courses</p>
            </div>
            <div>
              <p className="font-heading font-black text-xl xl:text-2xl text-emerald-300">100%</p>
              <p className="font-body text-xs text-slate-400">Cryptographic Proof</p>
            </div>
          </div>
        </div>

        {/* Security / Compliance Badge */}
        <div className="relative z-10 flex items-center gap-3 text-xs text-slate-400 font-body">
          <svg
            className="w-4 h-4 text-teal-400 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Secured by Firebase Enterprise Identity &amp; 256-bit encryption.</span>
        </div>
      </div>

      {/* Right: Dedicated Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md">
          {/* Mobile Logo Header */}
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2 select-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon.svg"
                alt="VeySkill Logo"
                width={34}
                height={34}
                className="w-8 h-8 object-contain"
              />
              <span className="font-heading font-extrabold text-xl tracking-tight">
                <span className="text-foreground">Vey</span>
                <span className="text-teal-600 dark:text-teal-400">skill</span>
              </span>
            </Link>
            <Link
              href={`/signup${redirectTarget !== "/my-learning" ? `?redirect=${encodeURIComponent(redirectTarget)}` : ""}`}
              className="text-xs font-heading font-bold text-teal-600 dark:text-teal-400 hover:underline"
            >
              Need an account? →
            </Link>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-foreground tracking-tight">
              {mode === "signin" ? "Sign in to your account" : "Reset your password"}
            </h1>
            <p className="font-body text-sm text-muted-foreground mt-2">
              {mode === "signin"
                ? "Continue your courses, maintain your daily streak, and unlock certificates."
                : "Enter your registered email and we'll dispatch a secure recovery link."}
            </p>
          </div>

          {/* Google 1-Click Sign In Button */}
          {mode === "signin" && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn || isSubmitting}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-card border-2 border-border/80 hover:border-teal-500/50 hover:bg-muted/50 font-heading font-bold text-sm text-foreground transition-all shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group active:scale-[0.99]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" className="flex-shrink-0">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>{isSigningIn ? "Connecting with Google…" : "Continue with Google"}</span>
              </button>

              {/* Clean separator */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-border/80" />
                <span className="text-xs uppercase font-mono text-muted-foreground font-semibold tracking-wider">
                  or with email
                </span>
                <div className="flex-1 h-px bg-border/80" />
              </div>
            </>
          )}

          {/* Feedback Alerts */}
          {displayError && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-body flex items-start gap-2.5 animate-fade-in"
            >
              <svg
                className="w-4 h-4 mt-0.5 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div className="flex-1">{displayError}</div>
            </div>
          )}

          {displaySuccess && (
            <div
              role="status"
              className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-body flex items-start gap-2.5 animate-fade-in"
            >
              <svg
                className="w-4 h-4 mt-0.5 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <div className="flex-1">{displaySuccess}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-heading font-bold text-foreground mb-1.5"
              >
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all shadow-xs"
                autoComplete="email"
                required
              />
            </div>

            {mode === "signin" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-heading font-bold text-foreground"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setLocalError("");
                      setLocalSuccess("");
                      clearAuthError();
                    }}
                    className="text-xs font-heading font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-card border border-border text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all shadow-xs"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
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
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
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
            )}

            <button
              type="submit"
              disabled={isSigningIn || isSubmitting}
              className="btn-primary w-full py-3 min-h-[46px] rounded-xl text-sm font-heading font-bold shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting || isSigningIn ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing…
                </span>
              ) : mode === "signin" ? (
                "Sign In to VeySkill"
              ) : (
                "Send Password Reset Link"
              )}
            </button>
          </form>

          {/* Switchers */}
          <div className="mt-6 text-center text-xs font-body text-muted-foreground space-y-2">
            {mode === "signin" ? (
              <p>
                Don&apos;t have an account yet?{" "}
                <Link
                  href={`/signup${redirectTarget !== "/my-learning" ? `?redirect=${encodeURIComponent(redirectTarget)}` : ""}`}
                  className="font-heading font-bold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  Create your free scholar account →
                </Link>
              </p>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setLocalError("");
                  setLocalSuccess("");
                }}
                className="font-heading font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
              >
                ← Back to sign in
              </button>
            )}
          </div>

          {/* Legal Footer */}
          <p className="mt-8 text-center text-[11px] text-muted-foreground/75 font-body leading-relaxed">
            By signing in, you agree to VeySkill&apos;s{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
