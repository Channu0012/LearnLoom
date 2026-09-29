interface CourseraLoaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function CourseraLoader({
  title = "Loading your learning experience…",
  subtitle = "Preparing video lessons, curriculum syllabus, and study notes",
  className = "",
}: CourseraLoaderProps) {
  return (
    <div
      className={`min-h-[55vh] flex flex-col items-center justify-center p-6 text-center ${className}`}
      role="status"
      aria-live="polite"
      aria-label={title}
    >
      {/* Coursera-style Animated Orbital Brand Beacon */}
      <div className="relative mb-6">
        {/* Outer glowing pulsing ring */}
        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-3 border-teal-500/20 border-t-teal-600 dark:border-t-teal-400 animate-spin" />

        {/* Inner centered brand logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-teal-500/10 dark:bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-inner">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-pulse"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Title */}
      <h2 className="font-heading font-extrabold text-lg sm:text-xl text-foreground mb-2">
        {title}
      </h2>

      {/* Subtitle */}
      <p className="font-body text-xs sm:text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {subtitle}
      </p>

      {/* Coursera-style Sleek Horizontal Progress Buffer Bar */}
      <div className="w-56 sm:w-72 h-1.5 rounded-full bg-muted overflow-hidden relative mb-6">
        <div className="h-full bg-gradient-to-r from-teal-500 via-primary-500 to-emerald-400 w-1/2 rounded-full animate-stream-buffer" />
      </div>

      {/* Trust micro-pills */}
      <div className="flex items-center gap-3 sm:gap-4 text-[11px] font-heading font-semibold text-muted-foreground flex-wrap justify-center">
        <span className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400">
          <span>✓</span>
          <span>Self-Paced</span>
        </span>
        <span className="text-border">·</span>
        <span className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400">
          <span>✓</span>
          <span>Habit Streaks</span>
        </span>
        <span className="text-border">·</span>
        <span className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400">
          <span>✓</span>
          <span>Distraction-Free</span>
        </span>
      </div>
    </div>
  );
}
