"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { StreakWidget } from "@/components/layout/StreakWidget";

export function Header() {
  const { user, userDoc, openAuthModal, signOut, loading, isSigningIn, authError, clearAuthError } =
    useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-md">
      {authError && (
        <aside
          role="alert"
          aria-live="assertive"
          className="bg-amber-500/10 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-2 text-xs font-body flex items-center justify-between gap-3 animate-fade-in"
        >
          <div className="flex items-center gap-2 flex-1">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="flex-shrink-0 text-amber-600 dark:text-amber-400"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{authError}</span>
          </div>
          <button
            type="button"
            onClick={clearAuthError}
            className="p-1 rounded hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold"
            aria-label="Dismiss error notification"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </aside>
      )}

      <div className="container-page flex items-center justify-between h-16 gap-2 sm:gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 hover:opacity-95 transition-opacity select-none group flex-shrink-0"
          aria-label="VeySkill home"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.png"
            alt="VeySkill Logo"
            width={34}
            height={34}
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-xl transition-transform duration-200 group-hover:scale-105"
          />
          <div className="flex flex-col leading-none" suppressHydrationWarning>
            <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight">
              <span className="text-foreground">Vey</span>
              <span className="text-[#14b8a6]">skill</span>
            </span>
            <span
              suppressHydrationWarning
              className="text-[10px] font-body font-medium text-muted-foreground hidden xl:block tracking-wide mt-0.5"
            >
              Structured Masterclasses &amp; Verified Credentials
            </span>
          </div>
        </Link>

        {/* Desktop & Tablet Navigation */}
        <nav
          className="hidden md:flex items-center gap-1 lg:gap-1.5 xl:gap-2 flex-shrink-0"
          aria-label="Main navigation"
        >
          {/* Explore */}
          <Link
            href="/explore"
            className="font-body font-semibold text-xs lg:text-sm px-2 sm:px-2.5 py-1.5 rounded-xl text-foreground/85 hover:text-foreground hover:bg-muted transition-all inline-flex items-center gap-1.5"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
            <span>Explore</span>
          </Link>

          {/* Quick Watch */}
          <Link
            href="/quick-watch"
            className="font-body font-semibold text-xs lg:text-sm px-2 sm:px-2.5 py-1.5 rounded-xl text-foreground/85 hover:text-foreground hover:bg-muted transition-all inline-flex items-center gap-1.5"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span className="hidden lg:inline">Quick Watch</span>
            <span className="lg:hidden">Watch</span>
          </Link>

          {/* My Learning */}
          <Link
            href="/my-learning"
            className="font-body font-semibold text-xs lg:text-sm px-2 sm:px-2.5 py-1.5 rounded-xl text-foreground/85 hover:text-foreground hover:bg-muted transition-all inline-flex items-center gap-1.5"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span className="hidden lg:inline">My Learning</span>
            <span className="lg:hidden">Learning</span>
          </Link>

          {/* My Courses */}
          <Link
            href="/my-courses"
            className="font-body font-semibold text-xs lg:text-sm px-2 sm:px-2.5 py-1.5 rounded-xl text-foreground/85 hover:text-foreground hover:bg-muted transition-all inline-flex items-center gap-1.5"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <span className="hidden lg:inline">My Courses</span>
            <span className="lg:hidden">Courses</span>
          </Link>

          {/* Admin panel (if admin) */}
          {userDoc?.isAdmin && (
            <Link
              href="/admin"
              className="font-body font-semibold text-xs lg:text-sm px-2 sm:px-2.5 py-1.5 rounded-xl text-accent-500 hover:text-accent-600 hover:bg-accent-500/10 transition-colors inline-flex items-center gap-1.5"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* Right Section: Auth Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Auth Controls */}
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-2 relative">
                  <StreakWidget />
                  <button
                    id="user-menu-btn"
                    onClick={() => setUserDropdownOpen((o) => !o)}
                    className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full cursor-pointer hover:opacity-85 transition-opacity p-0.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    aria-label="User profile menu"
                    aria-expanded={userDropdownOpen}
                    aria-haspopup="true"
                  >
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={user.displayName ?? "User profile"}
                        width={36}
                        height={36}
                        className="rounded-full border-2 border-border object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center font-heading font-bold text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                        {(user.displayName ?? "U")[0].toUpperCase()}
                      </div>
                    )}
                  </button>

                  {/* Desktop / Tablet User Dropdown Menu */}
                  {userDropdownOpen && (
                    <div
                      className="absolute top-12 right-0 clay-card p-2 min-w-[220px] z-50 bg-card border border-border shadow-2xl rounded-2xl animate-scale-in"
                      role="menu"
                      aria-labelledby="user-menu-btn"
                    >
                      <div className="px-3 py-2.5 bg-muted/40 rounded-xl mb-1">
                        <p className="text-xs font-heading font-bold text-foreground truncate">
                          {user.displayName ?? "VeySkill Scholar"}
                        </p>
                        {user.email && (
                          <p className="text-[11px] text-muted-foreground font-body truncate">
                            {user.email}
                          </p>
                        )}
                      </div>
                      <hr className="border-border/60 my-1" />
                      <Link
                        href="/my-learning"
                        className="flex items-center gap-2 min-h-[40px] px-3 py-2 rounded-lg text-xs font-body hover:bg-muted transition-colors text-foreground"
                        role="menuitem"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                        <span>My Learning &amp; Streaks</span>
                      </Link>
                      <Link
                        href="/my-courses"
                        className="flex items-center gap-2 min-h-[40px] px-3 py-2 rounded-lg text-xs font-body hover:bg-muted transition-colors text-foreground"
                        role="menuitem"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                        </svg>
                        <span>My Published Courses</span>
                      </Link>
                      {userDoc?.isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 min-h-[40px] px-3 py-2 rounded-lg text-xs font-body text-accent-500 hover:bg-muted transition-colors"
                          role="menuitem"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      <hr className="border-border/60 my-1" />
                      <button
                        type="button"
                        onClick={() => {
                          signOut();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left min-h-[40px] px-3 py-2 rounded-lg text-xs font-body text-destructive hover:bg-destructive/10 transition-colors cursor-pointer flex items-center gap-2"
                        role="menuitem"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Sign out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal("signin")}
                  disabled={isSigningIn}
                  className="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2 min-h-[40px] inline-flex items-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSigningIn ? (
                    <svg
                      className="animate-spin h-3.5 w-3.5 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
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
                  ) : (
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="flex-shrink-0"
                    >
                      <path
                        fill="#FFFFFF"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#FFFFFF"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FFFFFF"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#FFFFFF"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>{isSigningIn ? "Signing in..." : "Sign in"}</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Backdrop overlay for closing dropdown */}
      {userDropdownOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]"
          onClick={() => setUserDropdownOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
}
