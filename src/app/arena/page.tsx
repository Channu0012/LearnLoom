"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BattleArena } from "@/components/arena/BattleArena";
import { LeaderboardView } from "@/components/arena/LeaderboardView";
import { FriendChallengeModal } from "@/components/arena/FriendChallengeModal";
import { MultiplayerDuelArena } from "@/components/arena/MultiplayerDuelArena";
import { type ArenaRoomDoc } from "@/lib/arena";

// ── Clean SVG Icons (Zero Emojis, Google Standard) ───────────────────────────

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

function ArenaHubInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomParam = searchParams.get("room");
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"arena" | "leaderboard">(
    tabParam === "leaderboard" ? "leaderboard" : "arena"
  );
  const [activeRoomId, setActiveRoomId] = useState<string | null>(roomParam || null);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);

  // Sync URL search params
  useEffect(() => {
    if (roomParam) {
      setActiveRoomId(roomParam.toUpperCase());
    }
  }, [roomParam]);

  const handleRoomReady = (room: ArenaRoomDoc) => {
    setActiveRoomId(room.id);
    router.replace(`/arena?room=${room.id}`);
  };

  const handleExitRoom = () => {
    setActiveRoomId(null);
    router.replace("/arena");
  };

  return (
    <div className="container-page py-6 sm:py-10 space-y-8 min-h-[85vh]">
      {/* ── Top Hero Banner ───────────────────────────────────────────────── */}
      {!activeRoomId && (
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-card via-card to-muted/20 p-6 sm:p-10 shadow-sm">
          {/* Subtle Glow */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-heading font-bold">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <span>Multiplayer Quiz Arena &amp; Top 20 Leaderboard</span>
              </div>
              <h1 className="font-heading font-black text-3xl sm:text-5xl text-foreground tracking-tight leading-tight">
                Live Technical Duels.{" "}
                <span className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
                  Challenge Friends.
                </span>
              </h1>
              <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Send a 1v1 or group quiz challenge link, race against 15-second question timers,
                multiply your XP with streak combos, and claim your place in the verified Top 20.
              </p>
            </div>

            {/* Quick Challenge CTA Card */}
            <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsChallengeModalOpen(true)}
                className="px-5 py-3 rounded-2xl font-heading font-bold text-xs sm:text-sm text-white bg-teal-600 hover:bg-teal-500 transition-all flex items-center justify-center gap-2 shadow-md shadow-teal-500/15"
              >
                <SwordsIcon size={16} />
                <span>Challenge a Friend (1v1 / Group)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("leaderboard")}
                className="px-4 py-3 rounded-2xl font-heading font-bold text-xs sm:text-sm bg-card border border-border hover:bg-muted text-foreground transition-all flex items-center justify-center gap-2"
              >
                <TrophyIcon size={16} />
                <span>Top 20 Leaderboard</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Active Multiplayer Room Duel ──────────────────────────────────── */}
      {activeRoomId ? (
        <MultiplayerDuelArena
          roomId={activeRoomId}
          onExit={handleExitRoom}
          onLeaderboardClick={() => {
            setActiveRoomId(null);
            setActiveTab("leaderboard");
            router.replace("/arena?tab=leaderboard");
          }}
        />
      ) : (
        /* ── Arena Tabs: Solo / AI Matchmaking vs Top 20 Leaderboard ──────── */
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <button
              type="button"
              onClick={() => setActiveTab("arena")}
              className={`px-4 py-2 rounded-xl font-heading font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                activeTab === "arena"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <SwordsIcon size={16} />
              <span>Matchmaking Arena</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("leaderboard")}
              className={`px-4 py-2 rounded-xl font-heading font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                activeTab === "leaderboard"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrophyIcon size={16} />
              <span>Top 20 Leaderboard</span>
            </button>
          </div>

          {/* Active Tab View */}
          {activeTab === "arena" ? (
            <BattleArena onLeaderboardClick={() => setActiveTab("leaderboard")} />
          ) : (
            <LeaderboardView onStartBattleClick={() => setIsChallengeModalOpen(true)} />
          )}
        </div>
      )}

      {/* Challenge Link Generator Modal */}
      <FriendChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        onRoomReady={handleRoomReady}
      />
    </div>
  );
}

export default function ArenaPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page py-16 text-center space-y-4">
          <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-heading font-bold text-muted-foreground">
            Loading VeySkill Arena...
          </p>
        </div>
      }
    >
      <ArenaHubInner />
    </Suspense>
  );
}
