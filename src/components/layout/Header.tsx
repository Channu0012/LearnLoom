"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export function Header() {
  const { user, userDoc, openAuthModal, signOut, loading, isSigningIn, authError, clearAuthError } =
    useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-md">
      {authError && (
        <aside
          role="alert"
          aria-live="assertive"
          className="bg-amber-500/10 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-2.5 text-xs font-body flex items-center justify-between gap-3 animate-fade-in"
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
      <div className="container-page flex items-center justify-between h-16 gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-90 transition-opacity select-none group flex-shrink-0"
          aria-label="Learnloom home"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.svg"
            alt=""
            width={34}
            height={34}
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-xl transition-transform duration-200 group-hover:scale-105"
          />
          <div className="flex flex-col leading-none">
            <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight">
              <span className="text-foreground">Learn</span>
              <span className="text-primary-500">loom</span>
            </span>
            <span className="text-[10px] font-body font-medium text-muted-foreground hidden sm:block tracking-wide mt-0.5">
              Weave videos into courses
            </span>
          </div>
        </Link>

        {/* Desktop nav — Note: "Explore" removed per design specification */}
        <nav className="hidden md:flex items-center gap-5" aria-label="Main navigation">
          {user && (
            <>
              <Link
                href="/my-courses"
                className="font-body font-semibold text-sm text-foreground/80 hover:text-primary-500 transition-colors"
              >
                My Courses
              </Link>
              <Link
                href="/my-learning"
                className="font-body font-semibold text-sm text-foreground/80 hover:text-primary-500 transition-colors"
              >
                My Learning
              </Link>
              {userDoc?.isAdmin && (
                <Link
                  href="/admin"
                  className="font-body font-semibold text-sm text-accent-500 hover:text-accent-600 transition-colors inline-flex items-center gap-1.5"
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
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Auth controls */}
        <div className="flex items-center gap-3">
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-3 relative">
                  <Link
                    href="/create"
                    className="btn-accent text-sm px-4 py-2 inline-flex items-center gap-1.5"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>Create</span>
                  </Link>

                  <button
                    id="user-menu-btn"
                    onClick={() => setMenuOpen((o) => !o)}
                    className="flex items-center gap-2 rounded-full cursor-pointer hover:opacity-80 transition-opacity p-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="User menu"
                    aria-expanded={menuOpen}
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
                      <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center font-heading font-bold text-primary-700 border border-primary-200">
                        {(user.displayName ?? "U")[0].toUpperCase()}
                      </div>
                    )}
                  </button>

                  {/* Dropdown menu */}
                  {menuOpen && (
                    <div
                      className="absolute top-12 right-0 clay-card p-2 min-w-[200px] z-50 bg-card border border-border shadow-xl rounded-2xl animate-scale-in"
                      role="menu"
                      aria-labelledby="user-menu-btn"
                    >
                      <div className="px-3 py-2">
                        <p className="text-xs font-heading font-bold text-foreground truncate">
                          {user.displayName ?? "Student"}
                        </p>
                        {user.email && (
                          <p className="text-[11px] text-muted-foreground font-body truncate">
                            {user.email}
                          </p>
                        )}
                      </div>
                      <hr className="border-border my-1" />
                      <Link
                        href="/my-courses"
                        className="block px-3 py-2 rounded-lg text-sm font-body hover:bg-muted transition-colors md:hidden text-foreground"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                      >
                        My Courses
                      </Link>
                      <Link
                        href="/my-learning"
                        className="block px-3 py-2 rounded-lg text-sm font-body hover:bg-muted transition-colors md:hidden text-foreground"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                      >
                        My Learning
                      </Link>
                      {userDoc?.isAdmin && (
                        <Link
                          href="/admin"
                          className="block px-3 py-2 rounded-lg text-sm font-body text-accent-500 hover:bg-muted transition-colors"
                          role="menuitem"
                          onClick={() => setMenuOpen(false)}
                        >
                          Admin panel
                        </Link>
                      )}
                      <hr className="border-border my-1" />
                      <button
                        type="button"
                        onClick={() => {
                          signOut();
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm font-body text-destructive hover:bg-destructive/10 transition-colors cursor-pointer flex items-center gap-2"
                        role="menuitem"
                      >
                        <svg
                          width="16"
                          height="16"
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
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal("signin")}
                  disabled={isSigningIn}
                  className="btn-primary text-sm px-4 py-2 inline-flex items-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSigningIn ? (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                      width="16"
                      height="16"
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
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/5"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
}
