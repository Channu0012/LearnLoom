"use client";

import { useEffect, useState } from "react";

export default function GlobalError({
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
      const retryKey = "global_chunk_retry";
      const retries = parseInt(sessionStorage.getItem(retryKey) || "0", 10);
      if (retries < 2) {
        sessionStorage.setItem(retryKey, String(retries + 1));
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-dvh flex items-center justify-center p-6 bg-background font-body text-foreground">
        <div className="max-w-md w-full text-center p-8 rounded-2xl border border-border shadow-lg bg-card">
          <h2 className="text-2xl font-bold mb-3 font-heading">
            {isChunkError ? "Updating Application..." : "Critical application error"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {isChunkError
              ? "A fresh version of this application was updated. Reloading to get the latest updates."
              : "An unexpected error occurred while rendering the page."}
          </p>
          <button
            onClick={() => {
              if (isChunkError) {
                window.location.reload();
              } else {
                reset();
              }
            }}
            className="px-5 py-2.5 rounded-xl font-bold text-white bg-teal-600 hover:opacity-90 transition-opacity cursor-pointer font-heading"
          >
            {isChunkError ? "Reload Now" : "Try again"}
          </button>
        </div>
      </body>
    </html>
  );
}
