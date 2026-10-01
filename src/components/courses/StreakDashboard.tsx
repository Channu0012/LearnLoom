"use client";

// ---------------------------------------------------------------------------
// StreakDashboard — Duolingo-grade streak & progress analytics panel
// Shows daily streak, XP, rank, study calendar, and weekly stats
// ---------------------------------------------------------------------------
import { useState, useEffect } from "react";
import { getStreakData, getRankBadge, type StreakData } from "@/lib/streak";

export function StreakDashboard() {
  const [streak, setStreak] = useState<StreakData | null>(null);

  useEffect(() => {
    setStreak(getStreakData());

    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail as StreakData;
      setStreak(detail);
    };

    window.addEventListener("vidcura:streak-updated", handleUpdate);
    return () => window.removeEventListener("vidcura:streak-updated", handleUpdate);
  }, []);

  if (!streak) return null;

  const { rank, color } = getRankBadge(streak.totalXp);

  // Generate last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    const dayName = d.toLocaleDateString("en", { weekday: "short" });
    const isToday = dateStr === getLocalDateString();
    const isActive = dateStr === streak.lastActiveDate;
    return { dateStr, dayName, isToday, isActive, dayNum: d.getDate() };
  });

  return (
    <div className="clay-card p-5 bg-card border border-border rounded-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-amber-500"
          >
            <path d="M12 2c-1.5 3-4 5.5-4 9a6 6 0 0012 0c0-3.5-2.5-6-4-9-1 2-2 3-4 0z" />
          </svg>
          <span>Curriculum Mastery Analytics</span>
        </h3>
        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-muted ${color}`}>
          {rank}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Streak */}
        <div className="text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <p className="font-heading font-black text-2xl text-amber-600 dark:text-amber-400">
            {streak.currentStreak}
          </p>
          <p className="text-[10px] text-muted-foreground font-bold uppercase">Day Streak</p>
        </div>

        {/* XP */}
        <div className="text-center p-3 rounded-xl bg-primary-500/10 border border-primary-500/20">
          <p className="font-heading font-black text-2xl text-primary-600 dark:text-primary-400">
            {streak.totalXp}
          </p>
          <p className="text-[10px] text-muted-foreground font-bold uppercase">Total Points</p>
        </div>

        {/* Best Streak */}
        <div className="text-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="font-heading font-black text-2xl text-emerald-600 dark:text-emerald-400">
            {streak.bestStreak}
          </p>
          <p className="text-[10px] text-muted-foreground font-bold uppercase">Best Streak</p>
        </div>
      </div>

      {/* Weekly Activity Calendar */}
      <div>
        <p className="text-[10px] uppercase font-extrabold tracking-wider text-muted-foreground mb-2">
          Weekly Study Frequency
        </p>
        <div className="flex items-center justify-between gap-1">
          {last7Days.map((day) => (
            <div key={day.dateStr} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground font-body">{day.dayName}</span>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-heading font-bold transition-all ${
                  day.isActive
                    ? "bg-emerald-500 text-white shadow-sm"
                    : day.isToday
                      ? "bg-primary-500/20 text-primary-600 dark:text-primary-400 border-2 border-primary-500/50"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {day.isActive ? (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  day.dayNum
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Progress */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
        <div className="flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted-foreground"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <span className="text-xs font-body text-muted-foreground">
            Today&apos;s completed lessons
          </span>
        </div>
        <span className="font-heading font-bold text-sm text-foreground">
          {streak.todayLessonsCompleted}
        </span>
      </div>

      {/* XP Progress to Next Rank */}
      <div>
        <div className="flex items-center justify-between text-[10px] mb-1">
          <span className="text-muted-foreground font-body">XP to next rank</span>
          <span className={`font-heading font-bold ${color}`}>{rank}</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-emerald-500 transition-all duration-700"
            style={{ width: `${getXpProgress(streak.totalXp)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function getLocalDateString(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getXpProgress(xp: number): number {
  const thresholds = [0, 200, 500, 1000, 2000];
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]!) {
      const next = thresholds[i + 1] ?? thresholds[i]! * 2;
      return Math.min(100, Math.round(((xp - thresholds[i]!) / (next - thresholds[i]!)) * 100));
    }
  }
  return 0;
}
