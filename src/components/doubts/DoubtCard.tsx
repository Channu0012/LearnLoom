"use client";

import Link from "next/link";
import type { DoubtDoc } from "@/lib/types";

function timeAgo(timestamp: any): string {
  if (!timestamp) return "";
  const date =
    typeof timestamp.toDate === "function"
      ? timestamp.toDate()
      : typeof timestamp.seconds === "number"
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface DoubtCardProps {
  doubt: DoubtDoc;
  compact?: boolean;
}

export function DoubtCard({ doubt, compact = false }: DoubtCardProps) {
  const isSolved = doubt.status === "solved";

  return (
    <Link
      href={`/doubts/${doubt.id}`}
      className={`block p-4 sm:p-5 rounded-2xl border transition-all hover:shadow-md group ${
        isSolved
          ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40"
          : "bg-card border-border hover:border-primary-400/60"
      }`}
    >
      {/* Top Row: Course Tag + Status + Time */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-heading font-bold px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 truncate max-w-[180px]">
            {doubt.courseTitle}
          </span>
          {doubt.lessonTitle && !compact && (
            <span className="text-[10px] text-muted-foreground truncate max-w-[120px] hidden sm:inline">
              · {doubt.lessonTitle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isSolved && (
            <span className="text-[10px] font-heading font-black text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Solved
            </span>
          )}
          <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
            {timeAgo(doubt.createdAt)}
          </span>
        </div>
      </div>

      {/* Doubt Text */}
      <p
        className={`font-body text-sm text-foreground leading-relaxed ${compact ? "line-clamp-2" : "line-clamp-3"} group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors`}
      >
        {doubt.text}
      </p>

      {/* Bottom Row: Author + Answer Count */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
        <div className="flex items-center gap-2">
          {doubt.authorPhotoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={doubt.authorPhotoURL} alt="" className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-[9px] font-bold text-primary-600 dark:text-primary-400">
              {(doubt.authorName || "?")[0]?.toUpperCase()}
            </div>
          )}
          <span className="text-[11px] font-heading font-semibold text-muted-foreground truncate max-w-[120px]">
            {doubt.authorName}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="text-[11px] font-heading font-bold">
            {doubt.answerCount || 0} {doubt.answerCount === 1 ? "answer" : "answers"}
          </span>
        </div>
      </div>
    </Link>
  );
}
