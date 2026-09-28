"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, send digest or telemetry safely if needed without raw console leaking
  }, [error]);

  return (
    <div className="container-page py-20 text-center">
      <div className="max-w-md mx-auto clay-card p-8 bg-card">
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
          Something went wrong
        </h2>
        <p className="text-muted-foreground font-body text-sm mb-6">
          We encountered an unexpected error. Please try again or return home.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => reset()} className="btn-primary">
            Try again
          </button>
          <Link href="/" className="btn-secondary">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
