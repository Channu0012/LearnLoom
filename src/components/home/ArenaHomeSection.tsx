"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BATTLE_TOPICS, LEADERBOARD_DATA } from "@/lib/arena";
import { createArenaRoom } from "@/lib/arenaBattle";
import { useAuth } from "@/context/AuthContext";
import type { DomainType } from "@/lib/curriculumEngine";

// ── Clean Vector SVGs (Zero Emojis, Google Standard) ─────────────────────────

function SwordsIcon({ size = 18 }: { size?: number }) {
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
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
      <line x1="13" y1="19" x2="19" y2="13" />
      <line x1="16" y1="16" x2="20" y2="20" />
      <line x1="19" y1="21" x2="21" y2="19" />
      <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
      <line x1="5" y1="14" x2="9" y2="18" />
      <line x1="7" y1="17" x2="4" y2="20" />
      <line x1="3" y1="19" x2="5" y2="21" />
    </svg>
  );
}

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

function FlameIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function ArrowRightIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function UsersIcon({ size = 16 }: { size?: number }) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function ArenaHomeSection() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState<DomainType>("react");
  const [joinCode, setJoinCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const topThree = LEADERBOARD_DATA.slice(0, 3);

  const handleCreateFastDuel = async () => {
    setIsGenerating(true);
    try {
      const currentUserName =
        user?.displayName || (user?.email ? user.email.split("@")[0] : "Learner");
      const currentUserUid = user?.uid || `guest-${Math.random().toString(36).substring(2, 9)}`;

      const room = await createArenaRoom({
        topic: selectedTopic,
        hostUid: currentUserUid,
        hostName: currentUserName,
        hostAvatar: user?.photoURL || null,
        maxPlayers: 2,
      });

      router.push(`/arena?room=${room.id}`);
    } catch {
      router.push(`/arena`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleJoinCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    router.push(`/arena?room=${joinCode.trim().toUpperCase()}`);
  };

  return (
    <section className="py-14 sm:py-20 relative overflow-hidden" aria-labelledby="arena-home-title">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-teal-500/5 via-indigo-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-heading font-bold mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              <span>Multiplayer Technical Arena</span>
            </div>
            <h2
              id="arena-home-title"
              className="font-heading font-black text-2xl sm:text-4xl text-foreground tracking-tight"
            >
              Compete With Friends.{" "}
              <span className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
                Climb the Top 20.
              </span>
            </h2>
            <p className="font-body text-xs sm:text-sm text-muted-foreground mt-2 max-w-xl">
              Generate a shareable quiz link, race the 15-second clock in live 1v1 and group duels,
              multiply your XP with streak combos, and earn national standing.
            </p>
          </div>

          <Link
            href="/arena"
            className="text-xs sm:text-sm font-heading font-bold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1.5 flex-shrink-0"
          >
            <span>Enter Arena Hub</span>
            <ArrowRightIcon size={14} />
          </Link>
        </div>

        {/* Two-Column Interactive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Instant Duel Link Generator (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col justify-between shadow-xs">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground">
                  Quick 1v1 &amp; Group Challenge Link
                </span>
                <span className="text-[11px] font-mono text-teal-600 dark:text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20">
                  5 Questions · 15s Clock
                </span>
              </div>

              {/* Topic Pills */}
              <div className="space-y-2">
                <label className="text-xs font-heading font-bold text-foreground block">
                  Select Technical Discipline
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BATTLE_TOPICS.map((topic) => {
                    const isSelected = selectedTopic === topic.id;
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => setSelectedTopic(topic.id)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                          isSelected
                            ? "bg-teal-500/15 border-teal-500/40 text-teal-700 dark:text-teal-300 font-bold shadow-xs"
                            : "bg-muted/20 border-border text-foreground hover:bg-muted/40"
                        }`}
                      >
                        <span className="block truncate font-heading">{topic.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleCreateFastDuel}
                  className="w-full sm:w-auto flex-1 py-3 px-5 rounded-2xl font-heading font-bold text-xs sm:text-sm text-white bg-teal-600 hover:bg-teal-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <SwordsIcon size={16} />
                  <span>{isGenerating ? "Generating Room..." : "Generate Challenge Link"}</span>
                </button>

                <Link
                  href="/arena"
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl font-heading font-bold text-xs sm:text-sm bg-muted/30 border border-border hover:bg-muted text-foreground transition-all flex items-center justify-center gap-1.5"
                >
                  <UsersIcon size={15} />
                  <span>Lobby Hub</span>
                </Link>
              </div>

              {/* Join Code Input Form */}
              <form onSubmit={handleJoinCode} className="pt-3 border-t border-border/80">
                <label className="text-[11px] font-heading font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Have a Friend&apos;s Room Code?
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Enter Code (e.g. VS-A8F2)"
                    className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-muted/20 border border-border text-foreground placeholder:text-muted-foreground font-mono focus:outline-none focus:ring-1 focus:ring-teal-500 uppercase"
                  />
                  <button
                    type="submit"
                    disabled={!joinCode.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-heading font-bold bg-card border border-border hover:bg-muted text-foreground disabled:opacity-40 transition-all flex-shrink-0"
                  >
                    Join Duel
                  </button>
                </div>
              </form>
            </div>

            {/* Feature Perks Footer */}
            <div className="mt-6 pt-4 border-t border-border/60 grid grid-cols-3 gap-2 text-center text-[11px] text-muted-foreground font-body">
              <div>
                <strong className="text-foreground font-heading block">Speed Bonus</strong>
                <span>Up to +50 pts</span>
              </div>
              <div>
                <strong className="text-foreground font-heading block">Streak Multiplier</strong>
                <span>Up to 1.5x Flame</span>
              </div>
              <div>
                <strong className="text-foreground font-heading block">Top 20 Standing</strong>
                <span>Verified Ranks</span>
              </div>
            </div>
          </div>

          {/* Right Column: Top 3 Scholars Podium Preview (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrophyIcon size={16} />
                  <span className="font-heading font-bold text-sm text-foreground">
                    Top 20 Leaderboard
                  </span>
                </div>
                <span className="text-[10px] font-heading font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  National Ranking
                </span>
              </div>

              <p className="text-xs text-muted-foreground mb-4">
                Top student scholars competing across India premier technical institutes.
              </p>

              {/* Top 3 Roster */}
              <div className="space-y-3">
                {topThree.map((scholar) => {
                  const isGold = scholar.rank === 1;
                  const isSilver = scholar.rank === 2;

                  return (
                    <div
                      key={scholar.rank}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                        isGold
                          ? "bg-amber-500/[0.06] border-amber-500/30"
                          : isSilver
                            ? "bg-slate-500/[0.04] border-slate-400/25"
                            : "bg-orange-500/[0.04] border-orange-500/25"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-full font-heading font-black text-xs flex items-center justify-center border flex-shrink-0 ${
                            isGold
                              ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40"
                              : isSilver
                                ? "bg-slate-400/20 text-slate-700 dark:text-slate-300 border-slate-400/40"
                                : "bg-orange-500/20 text-orange-800 dark:text-orange-300 border-orange-500/40"
                          }`}
                        >
                          #{scholar.rank}
                        </div>
                        <div className="min-w-0">
                          <span className="font-heading font-bold text-xs text-foreground block truncate">
                            {scholar.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground truncate block">
                            {scholar.campus}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">
                          <FlameIcon size={12} />
                          <span>{scholar.streak} streak</span>
                        </div>
                        <span className="font-mono font-bold text-xs text-foreground">
                          {scholar.xp.toLocaleString()} XP
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Link to Full Top 20 */}
            <div className="pt-5 border-t border-border/60">
              <Link
                href="/arena?tab=leaderboard"
                className="w-full py-2.5 rounded-xl font-heading font-bold text-xs bg-muted/40 hover:bg-muted border border-border text-foreground transition-all flex items-center justify-center gap-1.5"
              >
                <span>View Full Top 20 Scoreboard</span>
                <ArrowRightIcon size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
