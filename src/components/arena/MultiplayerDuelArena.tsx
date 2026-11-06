"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { type ArenaRoomDoc } from "@/lib/arena";
import {
  subscribeArenaRoom,
  startArenaBattle,
  submitPlayerAnswer,
  getShareableChallengeUrl,
  getWhatsAppShareUrl,
} from "@/lib/arenaBattle";
import { getDomainQuestions, type QuizQuestion } from "@/lib/curriculumEngine";
import { recordUserBattleResult } from "@/lib/firestore";

// ── Clean Vector SVGs (Zero Emojis, Google / Stripe standard) ─────────────────

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

function FlameIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
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
      className={className}
      aria-hidden="true"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
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

function TimerIcon({ size = 16 }: { size?: number }) {
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
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CopyIcon({ size = 14 }: { size?: number }) {
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
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function WhatsAppIcon({ size = 15 }: { size?: number }) {
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
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  );
}

// ── Component Props ──────────────────────────────────────────────────────────

interface MultiplayerDuelArenaProps {
  roomId: string;
  onExit: () => void;
  onLeaderboardClick?: () => void;
}

export function MultiplayerDuelArena({
  roomId,
  onExit,
  onLeaderboardClick,
}: MultiplayerDuelArenaProps) {
  const { user } = useAuth();
  const currentUid = user?.uid || "current-player";
  const currentName = user?.displayName || (user?.email ? user.email.split("@")[0] : "Scholar");

  const [room, setRoom] = useState<ArenaRoomDoc | null>(null);
  const [copied, setCopied] = useState(false);

  // Active Question State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLockedIn, setIsLockedIn] = useState(false);
  const [roundTimeLeft, setRoundTimeLeft] = useState(15);
  const [roundStartTime, setRoundStartTime] = useState<number>(Date.now());
  const [roundStatus, setRoundStatus] = useState<"answering" | "breakdown" | "finished">(
    "answering"
  );
  const [countdownValue, setCountdownValue] = useState<number | null>(null);

  // Questions cache
  const questions: QuizQuestion[] = useMemo(() => {
    if (!room) return [];
    const rWithQ = room as unknown as { questions?: QuizQuestion[] };
    if (rWithQ.questions && rWithQ.questions.length > 0) {
      return rWithQ.questions;
    }
    return getDomainQuestions(room.topic, "Technical Arena Challenge", 5);
  }, [room]);

  // Subscribe to real-time room changes
  useEffect(() => {
    const unsub = subscribeArenaRoom(roomId, (updatedRoom) => {
      if (updatedRoom) {
        setRoom(updatedRoom);
      }
    });
    return () => unsub();
  }, [roomId]);

  // Countdown timer when room is starting
  useEffect(() => {
    if (room?.status === "active" && room.startedAt) {
      const now = Date.now();
      const diff = Math.ceil((room.startedAt - now) / 1000);
      if (diff > 0) {
        setCountdownValue(diff);
        const timer = setInterval(() => {
          const rem = Math.ceil((room.startedAt! - Date.now()) / 1000);
          if (rem <= 0) {
            setCountdownValue(null);
            clearInterval(timer);
            setRoundStartTime(Date.now());
            setRoundTimeLeft(15);
          } else {
            setCountdownValue(rem);
          }
        }, 500);
        return () => clearInterval(timer);
      } else {
        setCountdownValue(null);
      }
    }
  }, [room?.status, room?.startedAt]);

  const handleSelectOption = useCallback(
    async (optionIdx: number) => {
      if (isLockedIn || !room) return;
      setSelectedOption(optionIdx);
      setIsLockedIn(true);

      const timeTaken = Date.now() - roundStartTime;
      const q = questions[currentQIndex];
      const isCorrect = optionIdx === q?.correctIndex;

      await submitPlayerAnswer(room.id, currentUid, {
        qIndex: currentQIndex,
        selectedOption: optionIdx,
        isCorrect,
        timeTakenMs: timeTaken,
      });

      setRoundStatus("breakdown");
    },
    [isLockedIn, room, roundStartTime, questions, currentQIndex, currentUid]
  );

  const handleTimeExpired = useCallback(() => {
    if (isLockedIn) return;
    handleSelectOption(-1);
  }, [isLockedIn, handleSelectOption]);

  // 15s Per-Question Clock
  useEffect(() => {
    if (room?.status !== "active" || countdownValue !== null || roundStatus !== "answering") {
      return;
    }

    const interval = setInterval(() => {
      setRoundTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [room?.status, countdownValue, roundStatus, currentQIndex, handleTimeExpired]);

  const handleNextQuestion = () => {
    if (currentQIndex < 4) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsLockedIn(false);
      setRoundStatus("answering");
      setRoundTimeLeft(15);
      setRoundStartTime(Date.now());
    } else {
      setRoundStatus("finished");
      recordFinalMatch();
    }
  };

  const recordFinalMatch = () => {
    if (!room || !user) return;
    const me = room.participants[currentUid];
    const myScore = me?.score || 0;

    // Determine outcome
    const otherScores = Object.values(room.participants)
      .filter((p) => p.uid !== currentUid)
      .map((p) => p.score);
    const highestOther = otherScores.length > 0 ? Math.max(...otherScores) : 0;

    let outcome: "victory" | "defeat" | "draw" = "draw";
    if (myScore > highestOther) outcome = "victory";
    else if (myScore < highestOther) outcome = "defeat";

    const xpEarned = outcome === "victory" ? 140 : 50;

    recordUserBattleResult(user.uid, {
      xpEarned,
      outcome,
      userScore: myScore,
    });
  };

  const handleStartBattle = async () => {
    if (!room) return;
    await startArenaBattle(room.id);
  };

  const handleCopy = async () => {
    if (!room) return;
    try {
      await navigator.clipboard.writeText(getShareableChallengeUrl(room.id));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
    }
  };

  if (!room) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-heading font-bold text-muted-foreground">
          Connecting to Arena Room {roomId}...
        </p>
      </div>
    );
  }

  const participantsList = Object.values(room.participants || {});
  const myParticipant = room.participants[currentUid];
  const isHost = myParticipant?.isHost || room.hostUid === currentUid;
  const currentQuestion = questions[currentQIndex];

  // ── 1. WAITING LOBBY ───────────────────────────────────────────────────────
  if (room.status === "waiting") {
    return (
      <div className="max-w-2xl mx-auto py-6 space-y-6">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl text-center space-y-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-heading font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              Battle Lobby Live
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-foreground">
              {room.topicLabel} Duel
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Share the invite link with a friend or study buddy to duel in real-time.
            </p>
          </div>

          {/* Room Code & Copy */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-muted-foreground block">
              Room Challenge Code
            </span>
            <div className="font-mono font-black text-3xl sm:text-4xl text-teal-600 dark:text-teal-400 tracking-widest">
              {room.id}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopy}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-heading font-bold bg-card border border-border hover:bg-muted text-foreground transition-all flex items-center justify-center gap-1.5"
              >
                {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                <span>{copied ? "Link Copied!" : "Copy Challenge Link"}</span>
              </button>

              <a
                href={getWhatsAppShareUrl(room.id, room.topicLabel)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-heading font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                <WhatsAppIcon size={15} />
                <span>Share via WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Joined Scholars */}
          <div className="space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-bold text-foreground">
                Joined Scholars ({participantsList.length}/{room.maxPlayers})
              </span>
              <span className="text-xs text-muted-foreground">
                {participantsList.length < 2 ? "Waiting for rival..." : "Ready to battle"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {participantsList.map((player) => (
                <div
                  key={player.uid}
                  className="p-3 rounded-xl border border-border bg-muted/20 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-heading font-bold text-xs flex items-center justify-center border border-teal-500/20 flex-shrink-0">
                      {player.name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-heading font-bold text-foreground truncate">
                          {player.name}
                        </span>
                        {player.isHost && (
                          <span className="text-[9px] font-heading font-bold px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-600 border border-amber-500/30">
                            Host
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground truncate block">
                        {player.campus || "Scholar"}
                      </span>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              ))}

              {/* Empty slot placeholder */}
              {participantsList.length < (room.maxPlayers || 2) && (
                <div className="p-3 rounded-xl border border-dashed border-border/80 flex items-center justify-center text-xs text-muted-foreground gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>Waiting for friend to click link...</span>
                </div>
              )}
            </div>
          </div>

          {/* Start CTA */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              onClick={onExit}
              className="w-full sm:w-1/3 py-2.5 rounded-xl font-heading font-bold text-xs border border-border bg-card hover:bg-muted text-foreground transition-all"
            >
              Leave Room
            </button>

            {isHost ? (
              <button
                type="button"
                onClick={handleStartBattle}
                className="w-full sm:w-2/3 py-2.5 rounded-xl font-heading font-bold text-xs text-white bg-teal-600 hover:bg-teal-500 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <SwordsIcon size={15} />
                <span>
                  {participantsList.length > 1
                    ? "Start Battle Now"
                    : "Start Battle (Solo Practice Mode)"}
                </span>
              </button>
            ) : (
              <div className="w-full sm:w-2/3 py-2.5 rounded-xl font-heading font-bold text-xs bg-muted/60 text-muted-foreground text-center">
                Waiting for host to launch the battle...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── 2. COUNTDOWN OVERLAY ───────────────────────────────────────────────────
  if (countdownValue !== null) {
    return (
      <div className="py-24 text-center space-y-4 animate-scale-up">
        <span className="text-xs font-heading font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
          Battle Commencing
        </span>
        <div className="font-mono font-black text-7xl sm:text-9xl text-foreground animate-pulse">
          {countdownValue}
        </div>
        <p className="text-xs text-muted-foreground">
          Prepare your engineering instincts. 15 seconds per question.
        </p>
      </div>
    );
  }

  // ── 3. MATCH COMPLETED (VICTORY PODIUM) ────────────────────────────────────
  if (room.status === "completed" || roundStatus === "finished") {
    const sortedRanking = [...participantsList].sort((a, b) => b.score - a.score);
    const isWinner = sortedRanking[0]?.uid === currentUid;

    return (
      <div className="max-w-2xl mx-auto py-6 space-y-6 animate-fade-in">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl text-center space-y-6">
          <div className="space-y-2">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-heading font-bold border ${
                isWinner
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30"
              }`}
            >
              <TrophyIcon size={15} />
              <span>{isWinner ? "Match Victory" : "Duel Concluded"}</span>
            </div>
            <h2 className="text-3xl font-heading font-black text-foreground">
              {isWinner ? "You Emerged Victorious!" : "Great Technical Showdown!"}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Topic: <strong className="text-foreground">{room.topicLabel}</strong> · 5 Questions
            </p>
          </div>

          {/* Results Table */}
          <div className="space-y-2.5">
            {sortedRanking.map((player, idx) => {
              const isMe = player.uid === currentUid;
              const isFirst = idx === 0;
              return (
                <div
                  key={player.uid}
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                    isFirst
                      ? "bg-amber-500/[0.08] border-amber-500/30 shadow-xs"
                      : "bg-muted/20 border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full font-heading font-black text-xs flex items-center justify-center border ${
                        isFirst
                          ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      #{idx + 1}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading font-bold text-sm text-foreground">
                          {player.name}
                        </span>
                        {isMe && (
                          <span className="text-[10px] font-heading font-bold px-1.5 py-0.2 rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        Streak: {player.streak} max · {player.campus || "Scholar"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                      Score
                    </span>
                    <span className="font-mono font-black text-base text-foreground">
                      {player.score.toLocaleString()} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              onClick={onExit}
              className="w-full sm:w-1/2 py-2.5 rounded-xl font-heading font-bold text-xs border border-border bg-card hover:bg-muted text-foreground transition-all"
            >
              Return to Arena Hub
            </button>

            {onLeaderboardClick && (
              <button
                type="button"
                onClick={onLeaderboardClick}
                className="w-full sm:w-1/2 py-2.5 rounded-xl font-heading font-bold text-xs text-white bg-teal-600 hover:bg-teal-500 transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <TrophyIcon size={14} />
                <span>View Top 20 Leaderboard</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── 4. ACTIVE QUESTION ARENA ───────────────────────────────────────────────
  if (!currentQuestion) return null;

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-5 animate-fade-in">
      {/* Live Header: Scores & Flame Streak */}
      <div className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between gap-3">
        {/* Current Player Card */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-heading font-bold text-xs flex items-center justify-center border border-teal-500/20 flex-shrink-0">
            {currentName[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-heading font-bold text-foreground block truncate">
              {currentName} (You)
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-xs text-teal-600 dark:text-teal-400">
                {myParticipant?.score || 0} pts
              </span>
              {(myParticipant?.streak || 0) >= 2 && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold text-amber-500">
                  <FlameIcon size={12} />
                  <span>x{myParticipant?.streak}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Question Counter & Timer */}
        <div className="text-center flex flex-col items-center flex-shrink-0">
          <span className="text-[10px] font-heading font-bold text-muted-foreground uppercase tracking-wider">
            Round {currentQIndex + 1}/5
          </span>
          <div
            className={`font-mono font-bold text-sm px-2.5 py-0.5 rounded-full border flex items-center gap-1 mt-0.5 ${
              roundTimeLeft <= 4
                ? "bg-rose-500/10 text-rose-600 border-rose-500/30 animate-pulse"
                : "bg-muted text-foreground border-border"
            }`}
          >
            <TimerIcon size={12} />
            <span>{roundTimeLeft}s</span>
          </div>
        </div>

        {/* Rival/Friends Live Status */}
        <div className="flex items-center gap-2">
          {participantsList
            .filter((p) => p.uid !== currentUid)
            .slice(0, 2)
            .map((rival) => (
              <div key={rival.uid} className="text-right">
                <span className="text-xs font-heading font-bold text-foreground block truncate max-w-[90px]">
                  {rival.name}
                </span>
                <span className="font-mono font-bold text-xs text-muted-foreground">
                  {rival.score} pts
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-500 transition-all duration-300"
          style={{ width: `${((currentQIndex + 1) / 5) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-sm">
        <h3 className="font-heading font-bold text-base sm:text-lg text-foreground leading-relaxed">
          {currentQuestion.question}
        </h3>

        {/* Options */}
        <div className="space-y-2.5">
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrectOption = idx === currentQuestion.correctIndex;
            const showOutcome = roundStatus === "breakdown";

            let btnStyle = "bg-muted/20 border-border hover:bg-muted/40 text-foreground";

            if (isSelected) {
              btnStyle = "bg-teal-500/15 border-teal-500/40 text-foreground";
            }

            if (showOutcome) {
              if (isCorrectOption) {
                btnStyle =
                  "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold";
              } else if (isSelected && !isCorrectOption) {
                btnStyle = "bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300";
              } else {
                btnStyle = "opacity-50 border-border bg-muted/10 text-muted-foreground";
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isLockedIn}
                onClick={() => handleSelectOption(idx)}
                className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-body transition-all flex items-center justify-between ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-card border border-border text-[11px] font-heading font-bold flex items-center justify-center flex-shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </div>
                {showOutcome && isCorrectOption && (
                  <span className="text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                    <CheckIcon size={16} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation & Next Round Action */}
        {roundStatus === "breakdown" && (
          <div className="pt-4 border-t border-border/80 space-y-4 animate-fade-in">
            {currentQuestion.explanation && (
              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border text-xs text-muted-foreground">
                <strong className="text-foreground font-heading block mb-1">
                  Technical Insight:
                </strong>
                {currentQuestion.explanation}
              </div>
            )}

            <button
              type="button"
              onClick={handleNextQuestion}
              className="w-full py-3 rounded-xl font-heading font-bold text-xs sm:text-sm text-white bg-teal-600 hover:bg-teal-500 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{currentQIndex < 4 ? "Proceed to Next Round" : "View Final Results"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
