"use client";

import { useState, useEffect, useMemo, Suspense, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { isDisposableEmail, validateSecurePassword } from "@/lib/security";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/profile";

  const {
    user,
    signIn,
    signInWithRedirectMode,
    signUpWithEmail,
    isSigningIn,
    authError,
    clearAuthError,
  } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect straight to target
  useEffect(() => {
    if (user) {
      router.replace(redirectTarget);
    }
  }, [user, router, redirectTarget]);

  // Live password validation checklist
  const passwordCriteria = useMemo(() => {
    return {
      length: password.length >= 8,
      lower: /[a-z]/.test(password),
      upper: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  const passwordScore = useMemo(() => {
    return Object.values(passwordCriteria).filter(Boolean).length;
  }, [passwordCriteria]);

  if (user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
          <p className="text-sm font-heading font-medium text-muted-foreground">
            Setting up your scholar account…
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
    clearAuthError();

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || cleanName.length < 2) {
      setLocalError("Please enter your full name (minimum 2 characters).");
      return;
    }

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

    const pwCheck = validateSecurePassword(password);
    if (!pwCheck.valid) {
      setLocalError(
        pwCheck.reason ||
          "Password must be at least 8 characters and contain letters, numbers, and symbols."
      );
      return;
    }

    if (!agreeTerms) {
      setLocalError("Please agree to the Terms of Service to create your account.");
      return;
    }

    setIsSubmitting(true);
    const ok = await signUpWithEmail(cleanEmail, password, cleanName);
    setIsSubmitting(false);

    if (ok) {
      router.push(redirectTarget);
    }
  };

  const handleGoogleSignUp = async () => {
    setLocalError("");
    clearAuthError();
    try {
      await signIn();
      router.push(redirectTarget);
    } catch {
      try {
        await signInWithRedirectMode();
      } catch {
        setLocalError("Google registration could not be completed. Please try again.");
      }
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row w-full bg-background">
      {/* Left: Brand & Scholar Community (Desktop / Tablet) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white relative overflow-hidden flex-col justify-between p-12 xl:p-16 border-r border-border/20">
        {/* Glow lights */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-teal-500/15 blur-3xl pointer-events-none"
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
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Free Scholar Onboarding
          </span>
        </div>

        {/* Middle Core Benefits */}
        <div className="relative z-10 my-auto py-10 max-w-lg">
          <h2 className="font-heading font-black text-3xl xl:text-4xl leading-tight text-white mb-4">
            Start Your Journey.{" "}
            <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
              Earn Verified Credentials.
            </span>
          </h2>
          <p className="font-body text-slate-300 text-sm xl:text-base leading-relaxed mb-8">
            Join thousands of motivated engineers and students converting raw educational content
            into recognized milestones, daily streaks, and official diplomas.
          </p>

          {/* Value Highlights */}
          <div className="space-y-4">
            {[
              {
                title: "Distraction-Free Video Environment",
                desc: "No side recommendations, algorithmic rabbit holes, or toxic comment sections.",
                iconColor: "text-teal-400",
              },
              {
                title: "Automated Checkpoint Comprehension Quizzes",
                desc: "Test retention with dynamic 70%+ mastery requirements before issuing certificates.",
                iconColor: "text-emerald-400",
              },
              {
                title: "Official Cryptographic Proof of Completion",
                desc: "Every certificate features unique QR verification and public proof links.",
                iconColor: "text-indigo-400",
              },
              {
                title: "Daily Streak & Shield Habit Engine",
                desc: "Build lifelong discipline with Duolingo-grade streak tracking and emergency shields.",
                iconColor: "text-amber-400",
              },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    className={`w-3.5 h-3.5 ${item.iconColor}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-white">{item.title}</h3>
                  <p className="font-body text-xs text-slate-400 leading-normal">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="relative z-10 flex items-center gap-3 text-xs text-slate-400 font-body">
          <svg
            className="w-4 h-4 text-emerald-400 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
          <span>Free forever for course learners. No credit card required.</span>
        </div>
      </div>

      {/* Right: Dedicated Registration Form */}
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
              href={`/login${redirectTarget !== "/profile" ? `?redirect=${encodeURIComponent(redirectTarget)}` : ""}`}
              className="text-xs font-heading font-bold text-teal-600 dark:text-teal-400 hover:underline"
            >
              Sign In →
            </Link>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-foreground tracking-tight">
              Create your free account
            </h1>
            <p className="font-body text-sm text-muted-foreground mt-2">
              Start building verified skills, taking quizzes, and earning completion certificates.
            </p>
          </div>

          {/* Google 1-Click Sign Up */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
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
            <span>{isSigningIn ? "Setting up with Google…" : "Sign up with Google"}</span>
          </button>

          {/* Clean Separator */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border/80" />
            <span className="text-xs uppercase font-mono text-muted-foreground font-semibold tracking-wider">
              or register with email
            </span>
            <div className="flex-1 h-px bg-border/80" />
          </div>

          {/* Feedback Alert */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="signup-name"
                className="block text-xs font-heading font-bold text-foreground mb-1.5"
              >
                Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all shadow-xs"
                autoComplete="name"
                required
              />
            </div>

            <div>
              <label
                htmlFor="signup-email"
                className="block text-xs font-heading font-bold text-foreground mb-1.5"
              >
                Email Address
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all shadow-xs"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label
                htmlFor="signup-password"
                className="block text-xs font-heading font-bold text-foreground mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-card border border-border text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all shadow-xs"
                  autoComplete="new-password"
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

              {/* Password Strength Meter & Interactive Checklist */}
              {password.length > 0 && (
                <div className="mt-2.5 p-3 rounded-xl bg-muted/40 border border-border/70 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between text-[11px] font-heading font-semibold">
                    <span className="text-muted-foreground">Password Strength:</span>
                    <span
                      className={
                        passwordScore <= 2
                          ? "text-red-500"
                          : passwordScore <= 4
                            ? "text-amber-500"
                            : "text-emerald-500 font-bold"
                      }
                    >
                      {passwordScore <= 2 ? "Weak" : passwordScore <= 4 ? "Good" : "Strong"}
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordScore <= 2
                          ? "bg-red-500 w-1/3"
                          : passwordScore <= 4
                            ? "bg-amber-500 w-2/3"
                            : "bg-emerald-500 w-full"
                      }`}
                    />
                  </div>
                  {/* Live Criteria Items */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-body text-muted-foreground">
                    <div
                      className={`flex items-center gap-1.5 ${passwordCriteria.length ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}`}
                    >
                      {passwordCriteria.length ? (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-emerald-500 flex-shrink-0"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full border border-muted-foreground/40 inline-block flex-shrink-0" />
                      )}
                      <span>8+ characters</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${passwordCriteria.upper && passwordCriteria.lower ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}`}
                    >
                      {passwordCriteria.upper && passwordCriteria.lower ? (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-emerald-500 flex-shrink-0"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full border border-muted-foreground/40 inline-block flex-shrink-0" />
                      )}
                      <span>Upper &amp; lowercase</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${passwordCriteria.number ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}`}
                    >
                      {passwordCriteria.number ? (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-emerald-500 flex-shrink-0"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full border border-muted-foreground/40 inline-block flex-shrink-0" />
                      )}
                      <span>Number (0-9)</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${passwordCriteria.special ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}`}
                    >
                      {passwordCriteria.special ? (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-emerald-500 flex-shrink-0"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full border border-muted-foreground/40 inline-block flex-shrink-0" />
                      )}
                      <span>Special character</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="agree-terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-teal-600 border-border focus:ring-teal-500 cursor-pointer"
                required
              />
              <label
                htmlFor="agree-terms"
                className="text-xs font-body text-muted-foreground leading-normal cursor-pointer select-none"
              >
                I agree to VeySkill&apos;s{" "}
                <Link href="/terms" target="_blank" className="underline hover:text-foreground">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" target="_blank" className="underline hover:text-foreground">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

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
                  Creating Account…
                </span>
              ) : (
                "Create Free Scholar Account"
              )}
            </button>
          </form>

          {/* Switch to login */}
          <div className="mt-6 text-center text-xs font-body text-muted-foreground">
            <p>
              Already have an account?{" "}
              <Link
                href={`/login${redirectTarget !== "/profile" ? `?redirect=${encodeURIComponent(redirectTarget)}` : ""}`}
                className="font-heading font-bold text-teal-600 dark:text-teal-400 hover:underline"
              >
                Sign in to your account →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
