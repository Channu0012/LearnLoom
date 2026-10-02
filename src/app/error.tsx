"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isChunkError, setIsChunkError] = useState(false);

  useEffect(() => {
    const isChunk =
      error?.name === "ChunkLoadError" ||
      error?.message?.includes("Loading chunk") ||
      error?.message?.includes("ChunkLoadError");

    if (isChunk) {
      setIsChunkError(true);
      const retryKey =
        "app_chunk_retry_" + (typeof window !== "undefined" ? window.location.pathname : "");
      const retries = parseInt(sessionStorage.getItem(retryKey) || "0", 10);
      if (retries < 2) {
        sessionStorage.setItem(retryKey, String(retries + 1));
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div className="container-page py-20 text-center">
      <div className="max-w-md mx-auto clay-card p-8 bg-card border border-border rounded-3xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="font-heading font-bold text-2xl mb-2 text-foreground">
          {isChunkError ? "Updating Application..." : "Something went wrong"}
        </h2>
        <p className="text-muted-foreground font-body text-sm mb-6">
          {isChunkError
            ? "New application assets are available. Reloading to get the latest version."
            : "We encountered an unexpected error. Please try again or return home."}
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => {
              if (isChunkError) {
                window.location.reload();
              } else {
                reset();
              }
            }}
            className="btn-primary cursor-pointer"
          >
            {isChunkError ? "Reload page" : "Try again"}
          </button>
          <Link href="/" className="btn-secondary">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
