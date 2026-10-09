"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStreakData, getRankBadge, type StreakData } from "@/lib/streak";

export function HomeStreakBanner() {
  const [streak, setStreak] = useState<StreakData | null>(null);

  useEffect(() => {
    setStreak(getStreakData());

    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent<StreakData>).detail;
      setStreak(detail || getStreakData());
    };

    window.addEventListener("veyskill:streak-updated", handleUpdate);
    window.addEventListener("learnloom:streak-updated", handleUpdate);
    return () => {
      window.removeEventListener("veyskill:streak-updated", handleUpdate);
      window.removeEventListener("learnloom:streak-updated", handleUpdate);
    };
  }, []);

  if (!streak) return null;

  const isTodayActive = streak.todayLessonsCompleted > 0;
  const rank = getRankBadge(streak.totalXp);

  return (
    <div className="w-full max-w-2xl mx-auto my-5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-card to-emerald-500/10 border border-amber-500/25 shadow-sm backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        {/* Streak & XP Metrics */}
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform ${
              isTodayActive
                ? "bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30 scale-105"
                : "bg-muted text-muted-foreground border border-border"
            }`}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={isTodayActive ? "animate-pulse" : ""}
            >
              <path d="M12 2c-1.5 3-4 5.5-4 9a6 6 0 0012 0c0-3.5-2.5-6-4-9-1 2-2 3-4 0z" />
            </svg>
          </div>

          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-heading font-extrabold text-sm sm:text-base text-foreground">
                {streak.currentStreak > 0
                  ? `${streak.currentStreak}-Day Study Streak`
                  : "Daily Study Streak"}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-bold">
                +{streak.totalXp} Points
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-body mt-0.5">
              {isTodayActive ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  ✓ Active today · {streak.todayLessonsCompleted} video
                  {streak.todayLessonsCompleted === 1 ? "" : "s"} completed (+10 pts each)
                </span>
              ) : (
                <span>
                  Complete any video lecture today to earn +10 points &amp; advance streak
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action Link & Rank */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden sm:block text-right">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
              Skill Rank
            </span>
            <span className={`text-xs font-heading font-extrabold ${rank.color}`}>{rank.rank}</span>
          </div>

          <Link
            href="/my-learning"
            className="px-3.5 py-2 rounded-xl bg-card border border-border hover:border-amber-500/50 hover:bg-muted/60 text-foreground font-heading font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all"
          >
            <span>My Learning</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
