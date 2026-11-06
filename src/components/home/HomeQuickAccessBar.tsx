"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

// ── Clean Vector SVGs (Zero Emojis, Google Standard) ─────────────────────────

function BookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
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
  );
}

function SwordsIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
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
  );
}

function MicIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function CompassIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function ArrowRightIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function HomeQuickAccessBar() {
  const { user } = useAuth();

  const actions = [
    {
      title: "My Courses",
      description: user ? "Resume your active playlists & notes" : "Track playlists & certificates",
      href: "/my-courses",
      icon: BookIcon,
      badge: user ? "Enrolled" : "Fast Track",
      color: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-500/10",
      borderColor: "border-teal-500/30 hover:border-teal-500/60",
      glowColor: "hover:shadow-teal-500/10",
      featured: true,
    },
    {
      title: "Arena 1v1",
      description: "Multiplayer quiz battles & Top 20",
      href: "/arena",
      icon: SwordsIcon,
      badge: "LIVE",
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30 hover:border-amber-500/60",
      glowColor: "hover:shadow-amber-500/10",
      featured: false,
    },
    {
      title: "AI Interview",
      description: "Voice-driven technical practice",
      href: "/interview",
      badge: "AI 2.0",
      icon: MicIcon,
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30 hover:border-cyan-500/60",
      glowColor: "hover:shadow-cyan-500/10",
      featured: false,
    },
    {
      title: "Explore",
      description: "12,000+ curated curriculum lessons",
      href: "/explore",
      badge: "Catalog",
      icon: CompassIcon,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30 hover:border-emerald-500/60",
      glowColor: "hover:shadow-emerald-500/10",
      featured: false,
    },
  ];

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-10" aria-label="Student Quick Navigation">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.title}
              href={act.href}
              className={`relative rounded-2xl p-3.5 sm:p-4 bg-card border ${act.borderColor} hover:shadow-md ${act.glowColor} transition-all duration-200 flex flex-col justify-between group active:scale-[0.98] select-none`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-xl ${act.bgColor} ${act.color} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105`}
                  >
                    <Icon size={16} />
                  </div>
                  <span className="text-[10px] font-heading font-black px-1.5 py-0.5 rounded-full bg-muted border border-border text-muted-foreground">
                    {act.badge}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-xs sm:text-sm text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {act.title}
                </h3>
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                  {act.description}
                </p>
              </div>

              <div className="pt-2.5 mt-2 border-t border-border/50 flex items-center justify-between text-[11px] font-heading font-bold text-foreground">
                <span className={act.color}>Open</span>
                <span className="text-muted-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all">
                  <ArrowRightIcon size={12} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
