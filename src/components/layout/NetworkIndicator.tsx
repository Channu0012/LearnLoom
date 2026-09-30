"use client";

import { useEffect, useState } from "react";

export function NetworkIndicator() {
  const [isSlow, setIsSlow] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check initial online status
    if (typeof navigator !== "undefined") {
      setIsOffline(!navigator.onLine);

      // Check connection speed if Network Information API is supported
      const conn = (
        navigator as unknown as {
          connection?: { effectiveType?: string; saveData?: boolean; rtt?: number };
        }
      ).connection;
      if (conn) {
        const checkSpeed = () => {
          const slowType = conn.effectiveType === "2g" || conn.effectiveType === "slow-2g";
          const highRtt = (conn.rtt ?? 0) > 1200;
          setIsSlow(slowType || highRtt);
        };
        checkSpeed();
        if ("addEventListener" in conn) {
          (conn as EventTarget).addEventListener("change", checkSpeed);
        }
      }
    }

    const handleOnline = () => {
      setIsOffline(false);
      setIsSlow(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline && !isSlow) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-4 md:bottom-4 z-40 animate-slide-up"
    >
      <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card/95 border border-border shadow-lg backdrop-blur-sm text-xs font-body text-foreground">
        <span className="relative flex h-2.5 w-2.5">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isOffline ? "bg-red-400" : "bg-amber-400"
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isOffline ? "bg-red-500" : "bg-amber-500"
            }`}
          />
        </span>
        <span>
          {isOffline
            ? "Offline — displaying cached content"
            : "Slow connection detected — loading optimized"}
        </span>
      </div>
    </div>
  );
}
