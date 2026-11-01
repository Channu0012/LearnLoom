"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { StreakWidget } from "@/components/layout/StreakWidget";

export function Header() {
  const { user, userDoc, loading, authError, clearAuthError } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Scroll elevation — adds shadow + backdrop when page has scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isNavActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || Boolean(pathname?.startsWith(`${href}/`));
  };

  return (
    <header
      suppressHydrationWarning
      className={`sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-md transition-shadow duration-200 ${
        scrolled ? "shadow-md" : "shadow-none"
      }`}
    >
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

      <div
        suppressHydrationWarning
        className="container-page flex items-center justify-between h-16 gap-2 sm:gap-4"
      >
        {/* Logo */}
        <Link
          href="/"
          suppressHydrationWarning
          className="flex items-center gap-2.5 hover:opacity-95 transition-opacity select-none group flex-shrink-0"
          aria-label="VeySkill home"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.png"
            alt="VeySkill Logo"
            width={34}
            height={34}
            suppressHydrationWarning
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-xl transition-transform duration-200 group-hover:scale-105"
          />
          <span
            suppressHydrationWarning
            className="font-heading font-extrabold text-lg sm:text-xl tracking-tight select-none"
          >
            <span className="text-foreground">Vey</span>
            <span className="text-[#14b8a6]">skill</span>
          </span>
        </Link>

        {/* Desktop & Tablet Navigation */}
        <nav
          className="hidden md:flex items-center gap-1 lg:gap-1.5 xl:gap-2 flex-shrink-0"
          aria-label="Main navigation"
        >
          {/* Explore */}
          <Link
            href="/explore"
            className={`font-body font-semibold text-xs lg:text-sm px-2 sm:px-2.5 py-1.5 rounded-xl transition-all inline-flex items-center gap-1.5 ${
              isNavActive("/explore")
                ? "text-teal-600 dark:text-teal-400 bg-teal-500/10 font-bold"
                : "text-foreground/85 hover:text-foreground hover:bg-muted"
            }`}
            aria-current={isNavActive("/explore") ? "page" : undefined}
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

          {/* AI Mock Interview */}
          <Link
            href="/interview"
            className={`font-body font-semibold text-xs lg:text-sm px-2 sm:px-2.5 py-1.5 rounded-xl transition-all inline-flex items-center gap-1.5 group flex-shrink-0 ${
              isNavActive("/interview")
                ? "text-teal-600 dark:text-teal-400 bg-teal-500/10 font-bold"
                : "text-foreground/85 hover:text-foreground hover:bg-muted"
            }`}
            aria-current={isNavActive("/interview") ? "page" : undefined}
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
              className="text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
            <span>Interview</span>
            <span className="text-[9px] font-heading font-black px-1.5 py-0.2 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30 tracking-tight">
              AI
            </span>
          </Link>

          {/* My Learning */}
          <Link
            href="/my-learning"
            className={`font-body font-semibold text-xs lg:text-sm px-2 sm:px-2.5 py-1.5 rounded-xl transition-all inline-flex items-center gap-1.5 ${
              isNavActive("/my-learning")
                ? "text-teal-600 dark:text-teal-400 bg-teal-500/10 font-bold"
                : "text-foreground/85 hover:text-foreground hover:bg-muted"
            }`}
            aria-current={isNavActive("/my-learning") ? "page" : undefined}
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
            className={`font-body font-semibold text-xs lg:text-sm px-2 sm:px-2.5 py-1.5 rounded-xl transition-all inline-flex items-center gap-1.5 ${
              isNavActive("/my-courses")
                ? "text-teal-600 dark:text-teal-400 bg-teal-500/10 font-bold"
                : "text-foreground/85 hover:text-foreground hover:bg-muted"
            }`}
            aria-current={isNavActive("/my-courses") ? "page" : undefined}
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
              className={`font-body font-semibold text-xs lg:text-sm px-2 sm:px-2.5 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1.5 ${
                isNavActive("/admin")
                  ? "text-accent-600 dark:text-accent-400 bg-accent-500/15 font-bold"
                  : "text-accent-500 hover:text-accent-600 hover:bg-accent-500/10"
              }`}
              aria-current={isNavActive("/admin") ? "page" : undefined}
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

        {/* Right Section: Streak & Auth Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Auth loading skeleton — prevents empty right section flash on SSR */}
          {loading && (
            <div className="flex items-center gap-2 animate-pulse" aria-hidden="true">
              <div className="w-[88px] h-[40px] rounded-xl bg-muted/60 border border-border/40" />
            </div>
          )}
          {/* Auth Controls */}
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <StreakWidget />

                  {/* Direct Profile Link — Opens /profile directly with zero menus, zero popovers, zero tooltips */}
                  <Link
                    href="/profile"
                    prefetch={true}
                    className={`relative group flex items-center justify-center rounded-full p-0.5 transition-all duration-200 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 active:scale-90 ${
                      isNavActive("/profile")
                        ? "ring-2 ring-teal-500 ring-offset-2 ring-offset-background shadow-[0_0_16px_rgba(20,184,166,0.4)]"
                        : "hover:ring-2 hover:ring-teal-500/70 hover:ring-offset-1 hover:ring-offset-background hover:shadow-[0_0_14px_rgba(20,184,166,0.3)]"
                    }`}
                    aria-label="Profile"
                  >
                    <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden transition-transform duration-200 group-hover:scale-105 border border-border/80 bg-card pointer-events-none select-none">
                      {user.photoURL ? (
                        <Image
                          src={user.photoURL}
                          alt={user.displayName ?? "User profile"}
                          width={40}
                          height={40}
                          draggable={false}
                          className="w-full h-full object-cover pointer-events-none select-none"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center font-heading font-black text-sm text-white select-none pointer-events-none">
                          {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    {/* Active online pulse dot */}
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card shadow-xs group-hover:scale-110 transition-transform pointer-events-none select-none"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Link
                    href="/login"
                    className="hidden sm:inline-flex items-center justify-center px-3 py-1.5 min-h-[38px] rounded-xl text-xs sm:text-sm font-heading font-semibold text-foreground/85 hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-1.5 min-h-[38px] inline-flex items-center gap-1.5 shadow-xs font-heading font-bold rounded-xl cursor-pointer"
                  >
                    <span>Sign Up Free</span>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
