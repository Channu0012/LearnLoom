"use client";

import { useEffect, useState, useRef } from "react";
import { getStreakData, getRankBadge, type StreakData } from "@/lib/streak";

export function StreakWidget() {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial read
    setStreak(getStreakData());

    // Listen for real-time updates from lesson completions
    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent<StreakData>).detail;
      if (detail) {
        setStreak(detail);
      } else {
        setStreak(getStreakData());
      }
    };

    window.addEventListener("learnloom:streak-updated", handleUpdate);
    return () => window.removeEventListener("learnloom:streak-updated", handleUpdate);
  }, []);

  // Close popup when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  if (!streak) return null;

  const isTodayComplete = streak.todayLessonsCompleted > 0;
  const rank = getRankBadge(streak.totalXp);
  const nextRankTarget =
    streak.totalXp < 200 ? 200 : streak.totalXp < 500 ? 500 : streak.totalXp < 1000 ? 1000 : 2000;
  const rankProgress = Math.min(100, Math.round((streak.totalXp / nextRankTarget) * 100));

  return (
    <div className="relative" ref={popoverRef}>
      {/* Streak Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-heading font-extrabold transition-all cursor-pointer ${
          isTodayComplete
            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 shadow-sm"
            : "bg-muted text-muted-foreground hover:text-foreground border border-border"
        }`}
        aria-label={`Learning streak: ${streak.currentStreak} days, ${streak.totalXp} XP`}
        title="Click to view your Daily Learning Streak and XP"
      >
        <span className={isTodayComplete ? "animate-bounce" : "opacity-75"}>🔥</span>
        <span>{streak.currentStreak}</span>
        <span className="hidden sm:inline font-semibold text-[11px] opacity-80">
          {streak.currentStreak === 1 ? "day" : "days"}
        </span>
      </button>

      {/* Streak Popover Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 p-4 rounded-2xl bg-card border-2 border-border/80 shadow-2xl z-50 animate-fade-in text-left">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <div>
                <p className="font-heading font-extrabold text-sm text-foreground">
                  {streak.currentStreak > 0
                    ? `${streak.currentStreak}-Day Streak!`
                    : "Start Your Streak!"}
                </p>
                <p className="font-body text-[11px] text-muted-foreground">
                  {isTodayComplete
                    ? "Completed for today! Awesome habit."
                    : "Complete 1 lesson today to keep it active."}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 my-3">
            <div className="p-2.5 rounded-xl bg-muted/50 border border-border/50 text-center">
              <span className="text-[10px] uppercase font-heading font-bold text-muted-foreground block">
                Total XP
              </span>
              <span className="text-lg font-heading font-black text-primary-600 dark:text-primary-400">
                ⚡ {streak.totalXp}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-muted/50 border border-border/50 text-center">
              <span className="text-[10px] uppercase font-heading font-bold text-muted-foreground block">
                Best Streak
              </span>
              <span className="text-lg font-heading font-black text-foreground">
                🏆 {streak.bestStreak}d
              </span>
            </div>
          </div>

          {/* Rank & Level Progress */}
          <div className="p-3 rounded-xl bg-primary-50/50 dark:bg-primary-950/20 border border-primary-200/50 dark:border-primary-900/50 mb-3">
            <div className="flex items-center justify-between text-xs font-heading font-bold mb-1.5">
              <span className="text-foreground">
                Rank: <span className={rank.color}>{rank.rank}</span>
              </span>
              <span className="text-muted-foreground text-[10px]">
                {streak.totalXp} / {nextRankTarget} XP
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary-500 transition-all duration-500"
                style={{ width: `${rankProgress}%` }}
              />
            </div>
          </div>

          {/* Daily Goal Status */}
          <div className="flex items-center gap-2 text-xs font-body text-muted-foreground">
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                isTodayComplete
                  ? "bg-emerald-500 text-white"
                  : "border-2 border-muted-foreground/40"
              }`}
            >
              {isTodayComplete && (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span>
              {isTodayComplete
                ? `Completed ${streak.todayLessonsCompleted} lesson(s) today (+${streak.todayLessonsCompleted * 25} XP)`
                : "Daily goal: Complete 1 video lesson"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
