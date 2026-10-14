"use client";

interface HelperScoreBadgeProps {
  score?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function HelperScoreBadge({
  score = 0,
  size = "sm",
  showLabel = false,
  className = "",
}: HelperScoreBadgeProps) {
  if (score <= 0 && !showLabel) return null;

  const sizeClasses = {
    sm: "text-[11px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3.5 py-1.5 gap-2",
  }[size];

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  }[size];

  return (
    <span
      title={`${score} Helper XP earned by solving doubts`}
      className={`inline-flex items-center font-heading font-bold rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 backdrop-blur-sm transition-all hover:bg-amber-500/20 select-none ${sizeClasses} ${className}`}
    >
      <svg
        className={`${iconSizes} text-amber-500 shrink-0`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span className="font-mono tracking-tight">{score}</span>
      {showLabel && (
        <span className="text-[10px] font-sans font-medium text-amber-600/80 dark:text-amber-400/80">
          XP
        </span>
      )}
    </span>
  );
}
