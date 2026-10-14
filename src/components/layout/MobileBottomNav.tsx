"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  href: string;
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
      name: "Doubts",
      href: "/doubts",
      icon: (active: boolean) => (
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
          <path
            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            fill={active ? "currentColor" : "none"}
          />
          <path
            d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
            stroke={active ? "var(--card)" : "currentColor"}
          />
          <line
            x1="12"
            y1="17"
            x2="12.01"
            y2="17"
            stroke={active ? "var(--card)" : "currentColor"}
          />
        </svg>
      ),
    },
    {
      name: "Learning",
      href: "/my-learning",
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
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
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
  ];

  // Hide mobile bottom nav in cinema player and course studio so controls and chat are never obscured
  if (pathname?.startsWith("/course/") || pathname?.startsWith("/edit/")) {
    return null;
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-[0_-2px_8px_rgba(0,0,0,0.05)] pb-safe"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="grid grid-cols-5 h-16 px-1 items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

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
              <div className="flex items-center justify-center w-7 h-7">{item.icon(isActive)}</div>

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
