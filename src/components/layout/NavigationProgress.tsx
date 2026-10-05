"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [, startTransition] = useTransition();

  // Reset navigation indicator on route complete
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  // Animate browser tab title during navigation and add safety timeout
  useEffect(() => {
    if (!isNavigating) return;

    const previousTitle = document.title;
    let frame = 0;
    const frames = ["⏳ Loading… · VeySkill", "⌛ Loading… · VeySkill"];
    document.title = frames[0]!;

    const titleInterval = setInterval(() => {
      frame = (frame + 1) % frames.length;
      document.title = frames[frame]!;
    }, 450);

    const safetyTimer = setTimeout(() => {
      setIsNavigating(false);
    }, 4000);

    return () => {
      clearInterval(titleInterval);
      clearTimeout(safetyTimer);
      setTimeout(() => {
        if (typeof document !== "undefined" && document.title.includes("Loading…")) {
          document.title = previousTitle;
        }
      }, 150);
    };
  }, [isNavigating]);

  useEffect(() => {
    // Intercept internal link clicks to trigger top progress bar immediately
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target || !target.href) return;

      const url = new URL(target.href, window.location.origin);
      const isInternal = url.origin === window.location.origin;
      const isSamePage =
        url.pathname === window.location.pathname && url.search === window.location.search;

      if (
        isInternal &&
        !isSamePage &&
        !target.hasAttribute("download") &&
        target.target !== "_blank"
      ) {
        startTransition(() => {
          setIsNavigating(true);
        });
      }
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  if (!isNavigating) return null;

  return (
    <>
      {/* Top progress bar */}
      <div
        role="progressbar"
        aria-label="Loading page navigation"
        className="fixed top-0 left-0 right-0 z-[100] h-[3px] bg-transparent pointer-events-none"
      >
        <div className="h-full bg-gradient-to-r from-primary-500 via-primary-400 to-accent-500 animate-[progress_1.2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(15,118,110,0.6)]" />
      </div>

      {/* Full-screen overlay loader — subtle, non-blocking */}
      <div className="fixed inset-0 z-[99] pointer-events-none flex items-center justify-center bg-background/40 backdrop-blur-[2px] animate-fade-in">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-[3px] border-teal-500/20 border-t-teal-600 dark:border-t-teal-400 animate-spin" />
            <div className="absolute inset-1.5 rounded-full bg-card/80 flex items-center justify-center shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.png" alt="" className="w-4 h-4 object-contain rounded" />
            </div>
          </div>
          <span className="text-[11px] font-heading font-bold text-muted-foreground tracking-wide animate-pulse">
            Loading…
          </span>
        </div>
      </div>
    </>
  );
}
