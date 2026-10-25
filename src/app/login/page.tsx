"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { isDisposableEmail, validateSecurePassword } from "@/lib/security";

export default function LoginPage() {
  const router = useRouter();
  const {
    user,
    signIn,
    signInWithRedirectMode,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    isSigningIn,
    authError,
    authSuccess,
    clearAuthError,
    clearAuthSuccess,
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [localSuccess, setLocalSuccess] = useState("");

  // Safe redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace("/my-learning");
    }
  }, [user, router]);

  if (user) {
    return null;
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
      setLocalError("Temporary email addresses are not allowed. Please use a permanent email.");
      return;
    }

    if (mode === "forgot") {
      const ok = await resetPassword(cleanEmail);
      if (ok) {
        setLocalSuccess("Password reset email sent. Check your inbox.");
      }
      return;
    }

    if (!password) {
      setLocalError("Please enter your password.");
      return;
    }

    if (mode === "signup") {
      const pwCheck = validateSecurePassword(password);
      if (!pwCheck.valid) {
        setLocalError(pwCheck.reason || "Password does not meet security requirements.");
        return;
      }

      const cleanName = name.trim();
      if (!cleanName || cleanName.length < 2) {
        setLocalError("Please enter your full name (at least 2 characters).");
        return;
      }

      const ok = await signUpWithEmail(cleanEmail, password, cleanName);
      if (ok) {
        router.push("/my-learning");
      }
    } else {
      const ok = await signInWithEmail(cleanEmail, password);
      if (ok) {
        router.push("/my-learning");
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError("");
    clearAuthError();
    try {
      await signIn();
      router.push("/my-learning");
    } catch {
      // Try redirect as fallback
      try {
        await signInWithRedirectMode();
      } catch {
        setLocalError("Google sign-in failed. Please try again.");
      }
    }
  };

  const displayError = localError || authError;
  const displaySuccess = localSuccess || authSuccess;

  return (
    <div className="min-h-screen flex">
      {/* Left: Brand Panel (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden items-center justify-center p-12">
        {/* Subtle gradient orb */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, #0d9488 0%, #059669 50%, transparent 100%)",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-md text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <span className="text-3xl font-heading font-black text-white tracking-tight">
              VeySkill
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight mb-4 leading-tight">
            Learn Anything.{" "}
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              Get Certified.
            </span>
          </h2>

          <p className="text-slate-400 font-body text-sm leading-relaxed mb-8">
            Turn any YouTube playlist into a structured course with focused playback, AI study
            notes, quizzes, and verifiable certificates.
          </p>

          {/* Feature list */}
          <div className="space-y-3 text-left">
            {[
              "Distraction-free video playback",
              "AI-powered study notes",
              "Comprehension quizzes",
              "Verified certificates of completion",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300 text-sm font-body">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2.5 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-md">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <span className="text-2xl font-heading font-black text-foreground tracking-tight">
              VeySkill
            </span>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="font-heading font-extrabold text-2xl text-foreground mb-1">
              {mode === "signin" && "Welcome back"}
              {mode === "signup" && "Create your account"}
              {mode === "forgot" && "Reset your password"}
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              {mode === "signin" && "Sign in to continue your learning journey."}
              {mode === "signup" && "Start learning for free today."}
              {mode === "forgot" && "Enter your email and we'll send you a reset link."}
            </p>
          </div>

          {/* Google Sign In */}
          {mode !== "forgot" && (
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-card border border-border hover:bg-muted hover:border-slate-300 dark:hover:border-slate-600 font-heading font-semibold text-sm text-foreground transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mb-6 shadow-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
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
              <span>{isSigningIn ? "Signing in..." : "Continue with Google"}</span>
            </button>
          )}

          {/* Divider */}
          {mode !== "forgot" && (
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-heading font-medium">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          )}

          {/* Error / Success Messages */}
          {displayError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs font-body">
              {displayError}
            </div>
          )}
          {displaySuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-body">
              {displaySuccess}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label
                  htmlFor="login-name"
                  className="block text-xs font-heading font-semibold text-foreground mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="login-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="input"
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-heading font-semibold text-foreground mb-1.5"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
                autoComplete="email"
                required
              />
            </div>

            {mode !== "forgot" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-heading font-semibold text-foreground"
                  >
                    Password
                  </label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setLocalError("");
                        clearAuthError();
                      }}
                      className="text-xs font-heading font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input pr-10"
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-0.5"
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
              disabled={isSigningIn}
              className="btn-primary w-full py-3 text-sm rounded-xl"
            >
              {isSigningIn
                ? "Please wait..."
                : mode === "signin"
                  ? "Sign In"
                  : mode === "signup"
                    ? "Create Account"
                    : "Send Reset Link"}
            </button>
          </form>

          {/* Mode Switch */}
          <div className="mt-6 text-center text-xs font-body text-muted-foreground">
            {mode === "signin" && (
              <p>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setLocalError("");
                    clearAuthError();
                  }}
                  className="font-heading font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            )}
            {mode === "signup" && (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setLocalError("");
                    clearAuthError();
                  }}
                  className="font-heading font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}
            {mode === "forgot" && (
              <p>
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setLocalError("");
                    clearAuthError();
                  }}
                  className="font-heading font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                >
                  Back to sign in
                </button>
              </p>
            )}
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-[11px] text-muted-foreground/70 font-body">
            By continuing, you agree to VeySkill&apos;s{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              Terms
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
