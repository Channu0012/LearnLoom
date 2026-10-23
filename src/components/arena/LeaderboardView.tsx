"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";

// ── Clean SVG Icons (Zero Emojis) ────────────────────────────────────────────

function TrophyIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function MedalIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}

function FlameIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function StarIcon({ size = 13, filled = false }: { size?: number; filled?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ShieldCheckIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

// ── Rank Tiers & Models imported from @/lib/arena
import {
  type RankTier,
  RANK_TIERS,
  getRankTier,
  type LeaderboardStudent,
  LEADERBOARD_DATA,
} from "@/lib/arena";
export { type RankTier, RANK_TIERS, getRankTier, type LeaderboardStudent, LEADERBOARD_DATA };

// ── Component ────────────────────────────────────────────────────────────────

interface LeaderboardViewProps {
  onStartBattleClick?: () => void;
}

export function LeaderboardView({ onStartBattleClick }: LeaderboardViewProps) {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<"all" | "weekly" | "campus">("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filtered leaderboard data
  const filteredList = useMemo(() => {
    return LEADERBOARD_DATA.filter((student) => {
      if (topicFilter !== "all" && student.topicDomain !== topicFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return student.name.toLowerCase().includes(q) || student.campus.toLowerCase().includes(q);
      }
      return true;
    });
  }, [topicFilter, searchQuery]);

  const topThree = useMemo(() => {
    return filteredList.slice(0, 3);
  }, [filteredList]);

  return (
    <div className="py-2 space-y-6">
      {/* ── Filters & Search Header ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-heading font-bold text-foreground">Verified Standings</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Rankings calibrated from 1v1 battle victories, response speed, and question accuracy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border">
            <button
              type="button"
              onClick={() => setTimeframe("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all ${
                timeframe === "all"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Time
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("weekly")}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all ${
                timeframe === "weekly"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              This Week
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("campus")}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all ${
                timeframe === "campus"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Campus Pride
            </button>
          </div>

          {/* Discipline Select */}
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="text-xs bg-card border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="all">All Disciplines</option>
            <option value="react">React &amp; Next.js</option>
            <option value="javascript">JavaScript ES6+</option>
            <option value="python">Python Core</option>
            <option value="database">SQL &amp; Databases</option>
            <option value="algorithms">DSA &amp; Algorithms</option>
          </select>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground pointer-events-none">
          <SearchIcon size={15} />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search scholar by name or university..."
          className="w-full pl-9 pr-4 py-2 text-xs bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>

      {/* ── Top 3 Podium (Google Design Style, Clean Architecture) ────────── */}
      {topThree.length >= 3 && !searchQuery && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Order for Podium: #2 Silver, #1 Gold, #3 Bronze */}
          {[1, 0, 2].map((podiumIndex) => {
            const student = topThree[podiumIndex];
            if (!student) return null;
            const isFirst = student.rank === 1;
            const isSecond = student.rank === 2;
            const rankTier = getRankTier(student.xp);

            return (
              <div
                key={student.rank}
                className={`relative rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all ${
                  isFirst
                    ? "bg-amber-500/[0.04] border-amber-500/30 sm:-mt-2 shadow-xs"
                    : isSecond
                      ? "bg-slate-500/[0.03] border-slate-400/30"
                      : "bg-orange-500/[0.03] border-orange-500/30"
                }`}
              >
                {/* Header Rank Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-heading font-black border ${
                      isFirst
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                        : isSecond
                          ? "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-400/30"
                          : "bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-500/30"
                    }`}
                  >
                    {isFirst ? <TrophyIcon size={14} /> : <MedalIcon size={14} />}
                    <span>Rank #{student.rank}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                    <FlameIcon size={13} />
                    <span>{student.streak} streak</span>
                  </div>
                </div>

                {/* Profile Identity */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-heading font-bold text-xs border ${rankTier.bgColor} ${rankTier.textColor} ${rankTier.borderColor}`}
                    >
                      {student.name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <h3 className="font-heading font-bold text-sm text-foreground truncate">
                          {student.name}
                        </h3>
                        {student.verified && (
                          <span
                            title="Verified Scholar"
                            className="text-teal-600 dark:text-teal-400 flex-shrink-0"
                          >
                            <ShieldCheckIcon size={13} />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{student.campus}</p>
                    </div>
                  </div>
                </div>

                {/* Metrics Footer */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                      Total XP
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {student.xp.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                      Win Rate
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {student.winRate}% ({student.battles} duels)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Full Rankings Table ───────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 font-heading font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Scholar</th>
                <th className="px-4 py-3 hidden sm:table-cell">Tier</th>
                <th className="px-4 py-3 text-right hidden md:table-cell">Duels</th>
                <th className="px-4 py-3 text-right hidden sm:table-cell">Win Rate</th>
                <th className="px-4 py-3 text-right">Battle XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredList.map((student) => {
                const rankTier = getRankTier(student.xp);

                return (
                  <tr key={student.rank} className="hover:bg-muted/20 transition-colors">
                    {/* Rank */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`font-mono font-bold ${
                          student.rank === 1
                            ? "text-amber-600 dark:text-amber-400 font-black text-sm"
                            : student.rank === 2
                              ? "text-slate-500 dark:text-slate-300 font-bold"
                              : student.rank === 3
                                ? "text-orange-700 dark:text-orange-400 font-bold"
                                : "text-muted-foreground"
                        }`}
                      >
                        #{student.rank}
                      </span>
                    </td>

                    {/* Scholar info */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-heading font-bold text-xs flex-shrink-0 border ${rankTier.bgColor} ${rankTier.textColor} ${rankTier.borderColor}`}
                        >
                          {student.name[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-heading font-semibold text-foreground text-xs sm:text-sm truncate">
                              {student.name}
                            </span>
                            {student.verified && (
                              <span
                                title="Verified Scholar"
                                className="text-teal-600 dark:text-teal-400 flex-shrink-0"
                              >
                                <ShieldCheckIcon size={12} />
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground truncate block">
                            {student.campus}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Tier */}
                    <td className="px-4 py-3.5 hidden sm:table-cell whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-heading font-bold border ${rankTier.bgColor} ${rankTier.textColor} ${rankTier.borderColor}`}
                      >
                        <StarIcon filled size={10} />
                        <span>{rankTier.name}</span>
                      </span>
                    </td>

                    {/* Duels */}
                    <td className="px-4 py-3.5 text-right font-mono text-xs text-muted-foreground hidden md:table-cell whitespace-nowrap">
                      {student.battles}
                    </td>

                    {/* Win Rate */}
                    <td className="px-4 py-3.5 text-right hidden sm:table-cell whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {student.winRate}%
                      </span>
                    </td>

                    {/* Battle XP */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <span className="font-mono font-bold text-foreground text-xs sm:text-sm">
                        {student.xp.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Your Live Position Card ────────────────────────────────────────── */}
      <div className="rounded-2xl border border-teal-500/30 bg-teal-500/[0.03] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-heading font-bold text-sm border border-teal-500/30 flex-shrink-0">
            {(user?.displayName ?? "You")[0]?.toUpperCase()}
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm text-foreground">
              {user ? (user.displayName ?? "Your Battle Profile") : "Join the Verified Leaderboard"}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {user
                ? "Challenge fellow scholars to duels to raise your rank tier and earn recruiter-verified standing."
                : "Sign in and compete in 1v1 duels to establish your official skill standing."}
            </p>
          </div>
        </div>

        {onStartBattleClick && (
          <button
            type="button"
            onClick={onStartBattleClick}
            className="w-full sm:w-auto px-4 py-2 rounded-xl font-heading font-bold text-xs text-white bg-teal-600 hover:bg-teal-500 transition-all flex items-center justify-center gap-1.5 flex-shrink-0 shadow-sm"
          >
            <TrophyIcon size={14} />
            <span>Launch Duel</span>
          </button>
        )}
      </div>

      {/* ── Rank Tiers Progression Guide ──────────────────────────────────── */}
      <div>
        <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Rank Tier Qualifications
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {RANK_TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`p-3 rounded-xl border text-center ${tier.bgColor} ${tier.borderColor}`}
            >
              <div className="flex items-center justify-center mb-1">
                <span className={tier.textColor}>
                  <StarIcon filled size={14} />
                </span>
              </div>
              <p className={`font-heading font-bold text-xs ${tier.textColor}`}>{tier.name}</p>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                {tier.minXp.toLocaleString()}+ XP
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
