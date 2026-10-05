"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export interface PageLoadingOptions {
  autoCompleteMs?: number;
}

/**
 * Triggers the global top loading progress bar on demand (e.g. for custom async actions).
 */
export function startPageLoading(options?: PageLoadingOptions) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("veyskill:start-loading", { detail: options }));
  }
}

/**
 * Stops the global top loading progress bar and completes it to 100%.
 */
export function stopPageLoading() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("veyskill:stop-loading"));
  }
}

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const originalTitleRef = useRef<string>("");
  const activeFetchesRef = useRef<number>(0);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const completeProgress = useCallback(() => {
    clearAllTimers();

    setProgress(100);

    // Restore original document title
    if (typeof document !== "undefined") {
      setTimeout(() => {
        if (originalTitleRef.current && document.title.includes("Loading…")) {
          document.title = originalTitleRef.current;
        }
      }, 100);
    }

    // Graceful fadeout & reset
    const fadeTimer = setTimeout(() => {
      setVisible(false);
      const resetTimer = setTimeout(() => {
        setProgress(0);
      }, 200);
      timersRef.current.push(resetTimer);
    }, 200);

    timersRef.current.push(fadeTimer);
  }, [clearAllTimers]);

  const startProgress = useCallback(
    (options?: PageLoadingOptions) => {
      clearAllTimers();

      if (typeof document !== "undefined" && !document.title.includes("Loading…")) {
        originalTitleRef.current = document.title;
        document.title = "⏳ Loading… · VeySkill";
      }

      setVisible(true);
      // Instant initial burst (Google / Coursera / Amazon style)
      setProgress(32);

      // Dynamic easing progression
      const t1 = setTimeout(() => setProgress(58), 120);
      const t2 = setTimeout(() => setProgress(78), 280);
      const t3 = setTimeout(() => setProgress(88), 600);
      const t4 = setTimeout(() => setProgress(94), 1200);

      const activeTimers = [t1, t2, t3, t4];

      if (options?.autoCompleteMs) {
        // Auto-complete in-page option/feature interactions after duration
        const tAuto = setTimeout(() => {
          if (activeFetchesRef.current === 0) {
            completeProgress();
          }
        }, options.autoCompleteMs);
        activeTimers.push(tAuto);
      } else {
        // Fallback safety timeout if navigation or API hangs
        const tSafety = setTimeout(() => {
          completeProgress();
        }, 5000);
        activeTimers.push(tSafety);
      }

      timersRef.current = activeTimers;
    },
    [clearAllTimers, completeProgress]
  );

  // Complete progress on Next.js route change or search params update
  useEffect(() => {
    completeProgress();
  }, [pathname, searchParams, completeProgress]);

  // Intercept clicks, form submissions, and API fetches
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Intercept pointerdown & click for sudden Google/Amazon responsiveness
    const handleTrigger = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check if user clicked an anchor link
      const anchor = target.closest("a");
      if (anchor && anchor.href) {
        try {
          const url = new URL(anchor.href, window.location.origin);
          const isInternal = url.origin === window.location.origin;
          const isSameUrl =
            url.pathname === window.location.pathname && url.search === window.location.search;

          if (
            isInternal &&
            !isSameUrl &&
            !anchor.hasAttribute("download") &&
            anchor.target !== "_blank" &&
            !anchor.getAttribute("href")?.startsWith("#")
          ) {
            startProgress();
            return;
          }
        } catch {
          // ignore invalid URLs
        }
      }

      // Check if user clicked any interactive button, tab, chip, option, or feature element
      const interactiveEl = target.closest(
        "button, [role='button'], [role='tab'], [role='option'], [role='menuitem'], [data-action], .btn, .btn-primary, .btn-secondary"
      ) as HTMLElement | null;

      if (interactiveEl) {
        // Skip disabled elements
        if (
          (interactiveEl as HTMLButtonElement).disabled ||
          interactiveEl.getAttribute("aria-disabled") === "true" ||
          interactiveEl.classList.contains("disabled")
        ) {
          return;
        }

        // Skip internal media player controls if any
        if (
          interactiveEl.closest(".player-controls") ||
          interactiveEl.hasAttribute("data-no-progress")
        ) {
          return;
        }

        const isSubmit = interactiveEl.getAttribute("type") === "submit";
        const isTabOrOption =
          interactiveEl.getAttribute("role") === "tab" ||
          interactiveEl.getAttribute("role") === "option" ||
          interactiveEl.classList.contains("tab-btn");

        // Sudden loading burst:
        // - Submits or full actions wait for route change or API finish
        // - In-page tabs/chips/options burst for 450ms then smoothly finish
        startProgress({ autoCompleteMs: isSubmit ? undefined : isTabOrOption ? 400 : 450 });
      }
    };

    // 2. Intercept form submissions
    const handleSubmit = () => {
      startProgress();
    };

    // 3. Monitor fetch requests for dynamic API loading states
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = typeof args[0] === "string" ? args[0] : (args[0] as Request)?.url || "";
      const isTrackedApi =
        url.includes("/api/") || url.includes("youtube.com") || url.includes("oembed");

      if (isTrackedApi) {
        activeFetchesRef.current += 1;
        startProgress();
      }

      try {
        const response = await originalFetch.apply(window, args);
        return response;
      } finally {
        if (isTrackedApi) {
          activeFetchesRef.current = Math.max(0, activeFetchesRef.current - 1);
          if (activeFetchesRef.current === 0) {
            completeProgress();
          }
        }
      }
    };

    // 4. Custom event listeners
    const handleCustomStart = (e: Event) => {
      const customEvent = e as CustomEvent<PageLoadingOptions | undefined>;
      startProgress(customEvent.detail);
    };

    const handleCustomStop = () => {
      completeProgress();
    };

    // Attach listeners with capture phase for instant detection
    document.addEventListener("pointerdown", handleTrigger, { capture: true, passive: true });
    document.addEventListener("submit", handleSubmit, { capture: true });
    window.addEventListener("veyskill:start-loading", handleCustomStart as EventListener);
    window.addEventListener("veyskill:stop-loading", handleCustomStop);

    return () => {
      document.removeEventListener("pointerdown", handleTrigger, { capture: true });
      document.removeEventListener("submit", handleSubmit, { capture: true });
      window.removeEventListener("veyskill:start-loading", handleCustomStart as EventListener);
      window.removeEventListener("veyskill:stop-loading", handleCustomStop);
      window.fetch = originalFetch;
      clearAllTimers();
    };
  }, [clearAllTimers, completeProgress, startProgress]);

  return (
    <>
      {/* Sleek top progress bar with glowing leading head (Google / YouTube / Coursera style) */}
      <div
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Loading page navigation"
        className={`fixed top-0 left-0 right-0 z-[999999] pointer-events-none transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="h-[3.5px] bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-300 relative transition-all ease-out"
          style={{
            width: `${progress}%`,
            transitionDuration: progress === 100 ? "150ms" : "280ms",
          }}
        >
          {/* Subtle reflection shimmer */}
          <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-r from-transparent to-white/75" />
          {/* Glowing radiant head at leading edge */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-teal-400 blur-[2px]"
            style={{
              boxShadow: "0 0 12px 3px #14b8a6, 0 0 6px 2px #10b981",
            }}
          />
        </div>
      </div>

      {/* Floating Coursera / Amazon-style non-blocking top indicator */}
      {visible && (
        <div className="fixed top-2.5 right-4 z-[999999] pointer-events-none animate-fade-in flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/95 border border-teal-500/30 shadow-lg backdrop-blur-md">
          <div className="w-3.5 h-3.5 border-2 border-teal-500/25 border-t-teal-600 dark:border-t-teal-400 rounded-full animate-spin" />
          <span className="text-[11px] font-heading font-bold text-teal-600 dark:text-teal-400 tracking-wide">
            Loading…
          </span>
        </div>
      )}
    </>
  );
}
