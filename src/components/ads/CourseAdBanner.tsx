"use client";

import { useState } from "react";

interface CourseAdBannerProps {
  category?: string;
}

export function CourseAdBanner({ category = "Tech & Education" }: CourseAdBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="w-full my-6 rounded-2xl border border-border bg-gradient-to-r from-card via-muted/40 to-card p-4 sm:p-5 shadow-sm transition-all hover:border-primary-400/40 relative overflow-hidden">
      {/* Subtle Ad / Sponsor tag */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border">
          Sponsored Learning Resource
        </span>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground p-1 text-xs rounded transition-colors"
          aria-label="Dismiss sponsor message"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="18" x2="18" y2="6" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950/80 text-primary-600 dark:text-primary-300 flex items-center justify-center flex-shrink-0 border border-primary-200 dark:border-primary-800">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <p className="font-heading font-bold text-sm text-foreground">
              Level up your skills in {category}
            </p>
            <p className="font-body text-xs text-muted-foreground mt-0.5">
              Practice coding, build portfolio projects, and master in-demand skills with
              industry-standard developer tools.
            </p>
          </div>
        </div>

        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost text-xs px-4 py-2 whitespace-nowrap self-start sm:self-auto font-heading font-bold"
        >
          Explore Developer Tools →
        </a>
      </div>
    </div>
  );
}
