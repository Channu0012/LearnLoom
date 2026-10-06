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

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const completeProgress = useCallback(() => {
    clearAllTimers();
    setProgress(100);

    const fadeTimer = setTimeout(() => {
      setVisible(false);
      const resetTimer = setTimeout(() => {
        setProgress(0);
      }, 150);
      timersRef.current.push(resetTimer);
    }, 150);

    timersRef.current.push(fadeTimer);
  }, [clearAllTimers]);

  const startProgress = useCallback(
    (options?: PageLoadingOptions) => {
      clearAllTimers();
      setVisible(true);
      setProgress(28);

      const t1 = setTimeout(() => setProgress(58), 100);
      const t2 = setTimeout(() => setProgress(78), 240);
      const t3 = setTimeout(() => setProgress(90), 500);

      const activeTimers = [t1, t2, t3];

      if (options?.autoCompleteMs) {
        const tAuto = setTimeout(() => {
          completeProgress();
        }, options.autoCompleteMs);
        activeTimers.push(tAuto);
      } else {
        // Fallback safety timeout so progress bar never stays stuck
        const tSafety = setTimeout(() => {
          completeProgress();
        }, 3500);
        activeTimers.push(tSafety);
      }

      timersRef.current = activeTimers;
    },
    [clearAllTimers, completeProgress]
  );

  // Complete progress whenever the Next.js route or searchParams changes
  useEffect(() => {
    completeProgress();
  }, [pathname, searchParams, completeProgress]);

  // Clean, lightweight click listener on internal links only (NO pointerdown, NO fetch monkeypatch, NO title tampering)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleClick = (e: MouseEvent) => {
      // Only process primary left clicks without modifier keys
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest("a");
      if (!anchor || !anchor.href) return;

      // Skip external links, hash anchors, downloads, or target="_blank"
      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        anchor.getAttribute("href")?.startsWith("#")
      ) {
        return;
      }

      try {
        const url = new URL(anchor.href, window.location.origin);
        const isInternal = url.origin === window.location.origin;
        const isSameUrl =
          url.pathname === window.location.pathname && url.search === window.location.search;

        if (isInternal && !isSameUrl) {
          startProgress();
        }
      } catch {
        // Ignore invalid URLs
      }
    };

    const handleCustomStart = (e: Event) => {
      const customEvent = e as CustomEvent<PageLoadingOptions | undefined>;
      startProgress(customEvent.detail);
    };

    const handleCustomStop = () => {
      completeProgress();
    };

    document.addEventListener("click", handleClick, { passive: true });
    window.addEventListener("veyskill:start-loading", handleCustomStart as EventListener);
    window.addEventListener("veyskill:stop-loading", handleCustomStop);

    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("veyskill:start-loading", handleCustomStart as EventListener);
      window.removeEventListener("veyskill:stop-loading", handleCustomStop);
      clearAllTimers();
    };
  }, [clearAllTimers, completeProgress, startProgress]);

  return (
    <div
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading page navigation"
      className={`fixed top-0 left-0 right-0 z-[999999] pointer-events-none transition-opacity duration-150 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-[3px] bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-300 relative transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? "120ms" : "250ms",
        }}
      >
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/70" />
      </div>
    </div>
  );
}
