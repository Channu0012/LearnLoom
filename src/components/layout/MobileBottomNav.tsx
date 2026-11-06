"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  href: string;
  badge?: string;
  icon: (_active: boolean) => React.ReactNode;
}

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      name: "Home",
      href: "/",
      icon: (active: boolean) => (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      name: "Explore",
      href: "/explore",
      icon: (active: boolean) => (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <polygon
            points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
            fill={active ? "var(--card)" : "none"}
          />
        </svg>
      ),
    },
    {
      name: "Interview",
      href: "/interview",
      badge: "AI",
      icon: (_active: boolean) => (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
      ),
    },
    {
      name: "Courses",
      href: "/my-courses",
      icon: (active: boolean) => (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      name: "Arena",
      href: "/arena",
      badge: "LIVE",
      icon: (active: boolean) => (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke={active ? "var(--teal-500, #14b8a6)" : "currentColor"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
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
      ),
    },
  ];

  // Hide mobile bottom nav in cinema player and course studio so controls and chat are never obscured
  if (pathname?.startsWith("/course/") || pathname?.startsWith("/edit/")) {
    return null;
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-sm border-t border-border shadow-[0_-1px_0_0_rgba(0,0,0,0.06),0_-4px_16px_rgba(0,0,0,0.04)]"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        transform: "translateZ(0)",
        willChange: "transform",
      }}
      aria-label="Mobile Bottom Navigation"
    >
      <div className="grid grid-cols-5 h-16 px-1 items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const isInterviewMatch =
            item.href === "/interview" &&
            (pathname === "/interview" ||
              pathname?.startsWith("/interview/") ||
              pathname === "/doubts" ||
              pathname?.startsWith("/doubts/"));

          const isCoursesMatch =
            item.href === "/my-courses" &&
            (pathname === "/my-courses" ||
              pathname?.startsWith("/my-courses/") ||
              pathname === "/my-learning" ||
              pathname?.startsWith("/my-learning/") ||
              pathname === "/profile");

          const isActive =
            item.href === "/"
              ? pathname === "/"
              : isInterviewMatch ||
                isCoursesMatch ||
                pathname === item.href ||
                Boolean(pathname?.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex flex-col items-center justify-center min-h-[50px] min-w-[48px] py-1 transition-colors duration-150 select-none group cursor-pointer active:scale-95 ${
                isActive
                  ? "text-teal-600 dark:text-teal-400"
                  : "text-muted-foreground hover:text-foreground active:text-teal-500"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active top indicator bar */}
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-teal-600 dark:bg-teal-400" />
              )}

              {/* Icon */}
              <div className="relative flex items-center justify-center w-7 h-7">
                {item.icon(isActive)}
                {item.badge && (
                  <span className="absolute -top-1 -right-2 text-[8px] font-heading font-black px-1 py-0.2 rounded-full bg-teal-500 text-white leading-tight shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] leading-tight tracking-tight mt-0.5 truncate max-w-[60px] ${
                  isActive ? "font-heading font-bold" : "font-heading font-medium"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
