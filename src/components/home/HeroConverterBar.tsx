"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startPageLoading } from "@/components/layout/NavigationProgress";

export function HeroConverterBar() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const starterChips = [
    { label: "Next.js 15 Full-Stack", query: "nextjs fullstack" },
    { label: "Python for AI & LLMs", query: "python artificial intelligence" },
    { label: "DSA in Java", query: "dsa data structures java" },
    { label: "System Design", query: "system design interview" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please paste a YouTube playlist or video link.");
      return;
    }

    const isYouTube =
      trimmed.includes("youtube.com") || trimmed.includes("youtu.be") || trimmed.includes("list=");

    if (!isYouTube) {
      setError(
        "Please enter a valid YouTube link (e.g. https://www.youtube.com/playlist?list=...)"
      );
      return;
    }

    const lower = trimmed.toLowerCase();
    if (
      lower.includes("music.youtube.com") ||
      lower.includes("list=rd") ||
      lower.includes("list=olak") ||
      lower.includes("list=lm")
    ) {
      setError(
        "Commercial music tracks, songs, and albums cannot be imported. VeySkill is strictly for educational courses and masterclasses."
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);
    startPageLoading();
    router.push(`/create?url=${encodeURIComponent(trimmed)}`);
  };

  const handleChipClick = (query: string) => {
    startPageLoading();
    router.push(`/explore?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl sm:rounded-3xl bg-card border-2 border-border/90 shadow-xl group-focus-within:border-teal-500 group-focus-within:ring-4 group-focus-within:ring-teal-500/15 transition-all">
          <div className="flex items-center gap-3 w-full sm:flex-1 px-3 py-1">
            <svg
              className="w-5 h-5 text-muted-foreground group-focus-within:text-teal-500 flex-shrink-0 transition-colors"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Paste any YouTube playlist or video URL…"
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm sm:text-base outline-none font-body"
              aria-label="YouTube playlist or video URL"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3 min-h-[44px] rounded-xl sm:rounded-2xl btn-primary text-xs sm:text-sm font-heading font-bold shadow-md inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all whitespace-nowrap"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Importing…</span>
              </>
            ) : (
              <>
                <span>Convert to Course</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <p
          className="mt-2 text-xs text-rose-500 font-heading font-semibold text-center animate-fade-in"
          role="alert"
        >
          {error}
        </p>
      )}

      {/* Instant starter pills */}
      <div className="mt-4 flex items-center justify-center gap-2 flex-wrap text-xs">
        <span className="text-muted-foreground font-body text-[11px] mr-1">Trending Topics:</span>
        {starterChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleChipClick(chip.query)}
            className="px-3 py-1 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60 transition-all cursor-pointer font-heading font-medium text-[11px] active:scale-95"
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}
