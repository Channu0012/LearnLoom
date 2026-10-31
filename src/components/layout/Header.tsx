"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { StreakWidget } from "@/components/layout/StreakWidget";

export function Header() {
  const { user, userDoc, signOut, loading, authError, clearAuthError } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Scroll elevation — adds shadow + backdrop when page has scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Dismiss dropdown menu on click outside or Escape key
  useEffect(() => {
    if (!userDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [userDropdownOpen]);

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

          {/* Arena Hub */}
          <Link
            href="/arena"
            className={`font-body font-semibold text-xs lg:text-sm px-2 sm:px-2.5 py-1.5 rounded-xl transition-all inline-flex items-center gap-1.5 group flex-shrink-0 ${
              isNavActive("/arena")
                ? "text-teal-600 dark:text-teal-400 bg-teal-500/10 font-bold"
                : "text-foreground/85 hover:text-foreground hover:bg-muted"
            }`}
            aria-current={isNavActive("/arena") ? "page" : undefined}
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
              <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
              <line x1="13" y1="19" x2="19" y2="13" />
              <line x1="16" y1="16" x2="20" y2="20" />
              <line x1="19" y1="21" x2="21" y2="19" />
              <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
              <line x1="5" y1="14" x2="9" y2="18" />
              <line x1="7" y1="17" x2="4" y2="20" />
              <line x1="3" y1="19" x2="5" y2="21" />
            </svg>
            <span>Arena</span>
            <span className="text-[9px] font-heading font-black px-1.5 py-0.2 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30 tracking-tight">
              NEW
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
                <div ref={dropdownRef} className="flex items-center gap-2 relative">
                  <StreakWidget />
                  <button
                    id="user-menu-btn"
                    onClick={() => setUserDropdownOpen((o) => !o)}
                    className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full cursor-pointer hover:opacity-85 active:scale-95 transition-all p-0.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                      className="absolute top-12 right-0 enterprise-card p-2 min-w-[220px] z-50 bg-card border border-border shadow-xl rounded-xl animate-scale-in"
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
                        href="/profile"
                        className={`flex items-center gap-2 min-h-[40px] px-3 py-2 rounded-lg text-xs font-body transition-colors ${
                          isNavActive("/profile")
                            ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold"
                            : "hover:bg-muted text-foreground"
                        }`}
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
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span>My Scholar Profile</span>
                      </Link>
                      <Link
                        href="/my-learning"
                        className={`flex items-center gap-2 min-h-[40px] px-3 py-2 rounded-lg text-xs font-body transition-colors ${
                          isNavActive("/my-learning")
                            ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold"
                            : "hover:bg-muted text-foreground"
                        }`}
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
                        href="/arena"
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
                          <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
                          <line x1="13" y1="19" x2="19" y2="13" />
                          <line x1="16" y1="16" x2="20" y2="20" />
                          <line x1="19" y1="21" x2="21" y2="19" />
                          <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
                          <line x1="5" y1="14" x2="9" y2="18" />
                          <line x1="7" y1="17" x2="4" y2="20" />
                          <line x1="3" y1="19" x2="5" y2="21" />
                        </svg>
                        <span>Arena (Doubts &amp; Battles)</span>
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
