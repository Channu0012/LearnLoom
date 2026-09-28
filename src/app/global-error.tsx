"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Suppress console leaks in production
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-dvh flex items-center justify-center p-6 bg-background font-body text-foreground">
        <div className="max-w-md w-full text-center p-8 rounded-2xl border border-border shadow-lg">
          <h2 className="text-2xl font-bold mb-3">Critical application error</h2>
          <p className="text-sm text-muted-foreground mb-6">
            An unexpected error occurred while rendering the page.
          </p>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl font-bold text-white bg-primary hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
