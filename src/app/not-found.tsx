import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-20 sm:py-28 text-center max-w-2xl mx-auto">
      <div className="clay-card p-8 sm:p-12 bg-card border border-border rounded-3xl shadow-xl">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-primary-100 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-6 shadow-sm">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <div className="inline-block px-3 py-1 rounded-full bg-muted border border-border text-muted-foreground font-mono text-xs font-bold uppercase tracking-widest mb-3">
          Error 404 · Page Not Found
        </div>

        <h1 className="font-heading font-black text-3xl sm:text-4xl text-foreground tracking-tight mb-3">
          This page doesn&apos;t exist
        </h1>
        <p className="font-body text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed mb-8">
          The link you followed may be broken, or the page may have been moved or removed.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href="/"
            className="btn-primary w-full sm:w-auto px-6 py-3 text-xs font-heading font-bold shadow-md"
          >
            <span>Return to Home</span>
          </Link>
          <Link
            href="/explore"
            className="btn-ghost w-full sm:w-auto px-6 py-3 text-xs font-heading font-bold border border-border"
          >
            <span>Browse Masterclasses</span>
          </Link>
          <Link
            href="/verify"
            className="btn-ghost w-full sm:w-auto px-5 py-3 text-xs font-heading font-bold border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
          >
            <span>Verify Credential</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
