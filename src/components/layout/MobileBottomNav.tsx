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
          width="20"
          height="20"
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
          width="20"
          height="20"
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
      name: "Watch",
      href: "/quick-watch",
      icon: (active: boolean) => (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      ),
    },
    {
      name: "Learning",
      href: "/my-learning",
      icon: (active: boolean) => (
        <svg
          width="20"
          height="20"
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
      name: "My Courses",
      href: "/my-courses",
      icon: (active: boolean) => (
        <svg
          width="20"
          height="20"
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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)]"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1 items-center">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] py-1 px-0.5 rounded-xl transition-all duration-150 select-none group relative ${
                isActive
                  ? "text-primary-600 dark:text-primary-400 font-bold"
                  : "text-muted-foreground hover:text-foreground active:text-primary-500"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active Indicator Top Glow Pill */}
              {isActive && (
                <span
                  className="absolute -top-1 w-6 h-0.5 rounded-full bg-primary-500 dark:bg-primary-400 shadow-sm"
                  aria-hidden="true"
                />
              )}

              {/* Icon Container with subtle scale feedback on tap */}
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-transform active:scale-90 ${
                  isActive ? "bg-primary-50 dark:bg-primary-950/60" : "group-hover:bg-muted/50"
                }`}
              >
                {item.icon(isActive)}
              </div>

              {/* Label */}
              <span className="text-[10px] font-heading leading-tight tracking-tight mt-0.5 truncate max-w-[64px]">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
