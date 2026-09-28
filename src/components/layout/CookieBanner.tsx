"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "learnloom_cookie_consent";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) {
        // Small delay so it smoothly animates in
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // Storage unavailable / private mode
    }
  }, []);

  const handleChoice = (choice: "accepted" | "essential") => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, timestamp: Date.now() }));
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-slide-up"
    >
      <div className="clay-card p-5 bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0 text-primary-600">
            <svg
              width="20"
              height="20"
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
          </div>
          <div className="flex-1">
            <h3 className="font-heading font-bold text-sm text-foreground mb-1">
              Your Privacy Matters
            </h3>
            <p className="text-xs font-body text-muted-foreground leading-relaxed mb-3">
              We use strictly essential storage for secure authentication and course progress. No
              ads, no trackers, ever. Read our{" "}
              <Link href="/cookies" className="text-primary-500 underline hover:no-underline">
                Cookie Policy
              </Link>
              .
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleChoice("accepted")}
                className="px-3.5 py-1.5 rounded-lg text-xs font-heading font-bold text-white bg-primary-500 hover:bg-primary-600 transition-colors"
              >
                Accept All
              </button>
              <button
                type="button"
                onClick={() => handleChoice("essential")}
                className="px-3 py-1.5 rounded-lg text-xs font-heading font-semibold text-muted-foreground bg-muted hover:bg-muted/80 transition-colors"
              >
                Essential Only
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
