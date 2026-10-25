"use client";

import { useState } from "react";
import Link from "next/link";

interface CourseAdBannerProps {
  category?: string;
}

interface CategoryConfig {
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  badge: string;
}

function getCategoryConfig(category: string): CategoryConfig {
  const lower = (category || "").toLowerCase();

  if (lower.includes("program") || lower.includes("tech") || lower.includes("code")) {
    return {
      title: "Test Your Coding Knowledge in 1v1 Battle Arena",
      description:
        "Compete head-to-head with peer engineers in real-time knowledge duels, climb the verified student leaderboard, and earn bonus rank XP.",
      ctaText: "Enter 1v1 Battle Arena →",
      ctaHref: "/arena",
      badge: "Skill Acceleration",
    };
  }

  if (lower.includes("design") || lower.includes("art")) {
    return {
      title: "Master High-Impact UI/UX & Design Systems",
      description:
        "Build modern component architectures, master typography hierarchies, and craft accessible interfaces with structured design curricula.",
      ctaText: "Explore Design Tracks →",
      ctaHref: "/explore?q=Design",
      badge: "Creative Excellence",
    };
  }

  if (lower.includes("business") || lower.includes("finance")) {
    return {
      title: "Executive Business & Analytical Modeling",
      description:
        "Develop market intuition, master strategic frameworks, and validate commercial case-study insights with verifiable milestone assessments.",
      ctaText: "Explore Business Masterclasses →",
      ctaHref: "/explore?q=Business",
      badge: "Executive Leadership",
    };
  }

  if (lower.includes("science") || lower.includes("math")) {
    return {
      title: "Scientific Inquiry & Computational Problem Solving",
      description:
        "Solidify theoretical fundamentals, solve complex problem sets, and prepare for competitive technical evaluations with distraction-free lectures.",
      ctaText: "Explore Science & Maths →",
      ctaHref: "/explore?q=Science",
      badge: "Academic Rigor",
    };
  }

  if (lower.includes("lang")) {
    return {
      title: "Linguistic Fluency & Technical Communication",
      description:
        "Enhance grammatical intuition, expand professional vocabulary, and track learning accountability with daily streak progression.",
      ctaText: "Explore Language Tracks →",
      ctaHref: "/explore?q=Languages",
      badge: "Fluency & Streaks",
    };
  }

  return {
    title: `Level Up Your Domain Competency in ${category || "Your Field"}`,
    description:
      "Complete structured video lectures, test comprehension checkpoint quizzes at 70%+, and mint an Official Cryptographic Certificate of Completion.",
    ctaText: "Explore Course Catalog →",
    ctaHref: "/explore",
    badge: "Official Learning Path",
  };
}

export function CourseAdBanner({ category = "Education" }: CourseAdBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const config = getCategoryConfig(category);

  if (dismissed) return null;

  return (
    <div className="w-full my-6 rounded-2xl border border-border bg-gradient-to-r from-card via-muted/40 to-card p-4 sm:p-5 shadow-xs transition-all hover:border-teal-500/40 relative overflow-hidden">
      {/* Subtle Milestone Tag */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20">
          {config.badge}
        </span>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground p-1 text-xs rounded transition-colors"
          aria-label="Dismiss recommendation"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="18" x2="18" y2="6" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0 border border-teal-500/25">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <p className="font-heading font-bold text-sm text-foreground">{config.title}</p>
            <p className="font-body text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {config.description}
            </p>
          </div>
        </div>

        <Link
          href={config.ctaHref}
          className="btn-ghost text-xs px-4 py-2 whitespace-nowrap self-start sm:self-auto font-heading font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 hover:bg-teal-500/10 border border-teal-500/30 rounded-xl"
        >
          {config.ctaText}
        </Link>
      </div>
    </div>
  );
}
