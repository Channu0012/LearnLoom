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
    <div
      role="progressbar"
      aria-label="Loading page navigation"
      className="fixed top-0 left-0 right-0 z-[100] h-[3px] bg-transparent pointer-events-none"
    >
      <div className="h-full bg-gradient-to-r from-primary-500 via-primary-400 to-accent-500 animate-[progress_1.2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(15,118,110,0.6)]" />
    </div>
  );
}
