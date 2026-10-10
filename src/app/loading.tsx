export default function GlobalLoading() {
  return (
    <div
      className="container-page py-12 w-full max-w-6xl mx-auto px-4"
      role="status"
      aria-live="polite"
      aria-label="Loading VeySkill workspace"
    >
      {/* Centered Branded Pulse Header */}
      <div className="flex flex-col items-center justify-center text-center mb-10">
        <div className="relative mb-4">
          {/* Subtle glowing halo */}
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-teal-500/20 via-emerald-500/20 to-teal-500/20 blur-md animate-pulse" />

          <div className="relative w-14 h-14 rounded-2xl bg-card border border-border/80 shadow-lg flex items-center justify-center p-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon.png"
              alt="VeySkill"
              width={36}
              height={36}
              className="w-9 h-9 object-contain"
            />
          </div>

          {/* Orbiting spinner ring */}
          <div className="absolute -inset-1 rounded-2xl border-2 border-teal-500/40 border-t-teal-500 animate-spin pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-heading font-extrabold text-base sm:text-lg tracking-tight text-foreground">
            Vey<span className="text-[#14b8a6]">skill</span>
          </span>
          <span className="text-muted-foreground/40 font-mono text-xs">/</span>
          <span className="text-xs font-mono font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
            Workspace
          </span>
        </div>

        <p className="text-xs font-body text-muted-foreground max-w-sm leading-relaxed">
          Curating structured lessons, verified certificates, and interactive workspace…
        </p>
      </div>

      {/* Skeletons: Search & Filter Tabs */}
      <div className="mb-8 space-y-4 max-w-2xl mx-auto animate-pulse">
        <div className="h-11 w-full bg-muted/60 rounded-2xl border border-border/40" />
        <div className="flex items-center justify-center gap-2 pt-1">
          <div className="h-7 w-20 bg-muted/50 rounded-full" />
          <div className="h-7 w-28 bg-muted/50 rounded-full" />
          <div className="h-7 w-24 bg-muted/50 rounded-full" />
          <div className="h-7 w-32 bg-muted/50 rounded-full hidden sm:block" />
        </div>
      </div>

      {/* Skeletons: Structured Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-card border border-border/60 shadow-sm space-y-3.5"
          >
            {/* Thumbnail skeleton */}
            <div className="aspect-video w-full rounded-xl bg-muted/60 relative overflow-hidden flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-background/40 flex items-center justify-center text-muted-foreground/40">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
            </div>

            {/* Title & metadata skeletons */}
            <div className="space-y-2 pt-1">
              <div className="h-4 w-4/5 bg-muted/70 rounded-md" />
              <div className="h-3 w-1/2 bg-muted/50 rounded-md" />
            </div>

            {/* Bottom info row */}
            <div className="flex items-center justify-between pt-3 border-t border-border/40">
              <div className="h-3.5 w-24 bg-muted/60 rounded-md" />
              <div className="h-5 w-16 bg-muted/50 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
