"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { getDomainQuestions, type QuizQuestion, type DomainType } from "@/lib/curriculumEngine";
import { recordUserBattleResult } from "@/lib/firestore";
import {
  playCountdownTick,
  playBattleStart,
  playOptionSelect,
  playCorrectSound,
  playWrongSound,
  playStreakSound,
  playVictoryFanfare,
  isSoundEnabled,
  setSoundEnabled as persistSoundEnabled,
} from "@/lib/arenaSound";
import { ConfettiCanvas } from "./ConfettiCanvas";
import {
  BATTLE_TOPICS,
  PEER_OPPONENTS,
  DISCIPLINE_BRANCHES,
  type OpponentProfile,
  type DisciplineBranch,
} from "@/lib/arena";

// ── SVG Icons (Zero Emojis) ──────────────────────────────────────────────────

function SearchIcon({ size = 15 }: { size?: number }) {
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

function Volume2Icon({ size = 16 }: { size?: number }) {
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
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function VolumeXIcon({ size = 16 }: { size?: number }) {
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
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="22" y1="9" x2="16" y2="15" />
      <line x1="16" y1="9" x2="22" y2="15" />
    </svg>
  );
}

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

function ZapIcon({ size = 18 }: { size?: number }) {
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
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
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

function TimerIcon({ size = 18 }: { size?: number }) {
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

function CheckIcon({ size = 16 }: { size?: number }) {
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

function ShieldCheckIcon({ size = 18 }: { size?: number }) {
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

function RefreshIcon({ size = 16 }: { size?: number }) {
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
      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
    </svg>
  );
}

function UsersIcon({ size = 18 }: { size?: number }) {
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

// ── Models & Topics are imported from @/lib/arena
export { type BattleTopic, BATTLE_TOPICS, type OpponentProfile, PEER_OPPONENTS } from "@/lib/arena";

type BattleState =
  "lobby" | "matchmaking" | "ready" | "question" | "round_result" | "match_finished";

interface RoundResult {
  question: QuizQuestion;
  userAnswer: number | null;
  opponentAnswer: number | null;
  userCorrect: boolean;
  opponentCorrect: boolean;
  userTimeTaken: number;
  userPointsEarned: number;
  opponentPointsEarned: number;
}

interface BattleRecord {
  id: string;
  opponentName: string;
  topicLabel: string;
  userScore: number;
  opponentScore: number;
  outcome: "victory" | "defeat" | "draw";
  xpEarned: number;
  date: string;
}

// ── Component ────────────────────────────────────────────────────────────────

interface BattleArenaProps {
  onLeaderboardClick?: () => void;
}

export function BattleArena({ onLeaderboardClick }: BattleArenaProps) {
  const { user, openAuthModal } = useAuth();

  const [selectedTopic, setSelectedTopic] = useState<DomainType>("react");
  const [selectedBranch, setSelectedBranch] = useState<DisciplineBranch>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTopics = useMemo(() => {
    return BATTLE_TOPICS.filter((t) => {
      const matchBranch = selectedBranch === "all" || t.branch === selectedBranch;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        t.label.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchBranch && matchSearch;
    });
  }, [selectedBranch, searchQuery]);
  const [battleState, setBattleState] = useState<BattleState>("lobby");
  const [activeOpponent, setActiveOpponent] = useState<OpponentProfile>(PEER_OPPONENTS[0]!);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Round Timer & Answering State
  const QUESTION_SECONDS = 15;
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [opponentLockedIn, setOpponentLockedIn] = useState(false);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);

  // Live Scores
  const [userScore, setUserScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [userStreak, setUserStreak] = useState(0);
  const [soundEnabled, setSoundEnabledState] = useState(true);

  // Sync sound setting on mount
  useEffect(() => {
    setSoundEnabledState(isSoundEnabled());
  }, []);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabledState(next);
    persistSoundEnabled(next);
  };

  // Match Outcome
  const [xpDelta, setXpDelta] = useState(0);
  const [matchHistory, setMatchHistory] = useState<BattleRecord[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("veyskill_battle_history");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: "prev-1",
        opponentName: "Aarav S.",
        topicLabel: "React & Next.js",
        userScore: 420,
        opponentScore: 350,
        outcome: "victory",
        xpEarned: 135,
        date: "Today, 14:20",
      },
      {
        id: "prev-2",
        opponentName: "Priya M.",
        topicLabel: "JavaScript ES6+",
        userScore: 310,
        opponentScore: 440,
        outcome: "defeat",
        xpEarned: 40,
        date: "Yesterday",
      },
    ];
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const opponentTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Save history on changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("veyskill_battle_history", JSON.stringify(matchHistory));
      } catch {}
    }
  }, [matchHistory]);

  // Clean timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (opponentTimerRef.current) clearTimeout(opponentTimerRef.current);
    };
  }, []);

  // ── Start Matchmaking Flow ──────────────────────────────────────────────────

  const handleStartBattle = () => {
    if (!user) {
      openAuthModal("signin");
      return;
    }

    // Pick a random opponent from the pool
    const randomOpponent =
      PEER_OPPONENTS[Math.floor(Math.random() * PEER_OPPONENTS.length)] ?? PEER_OPPONENTS[0]!;
    setActiveOpponent(randomOpponent);

    // Fetch 5 domain questions
    const qList = getDomainQuestions(selectedTopic, "Battle Assessment", 5);
    setQuestions(qList);
    setCurrentQIndex(0);
    setUserScore(0);
    setOpponentScore(0);
    setUserStreak(0);
    setRoundResults([]);
    setBattleState("matchmaking");

    // Matchmaking takes ~2.2 seconds
    setTimeout(() => {
      setBattleState("ready");
      playCountdownTick(440);
      setTimeout(() => playCountdownTick(554), 500);
      setTimeout(() => playCountdownTick(659), 1000);
      // 1.5 seconds countdown
      setTimeout(() => {
        playBattleStart();
        startQuestionRound(0, qList, randomOpponent);
      }, 1500);
    }, 2200);
  };

  // ── Question Round Management ───────────────────────────────────────────────

  const startQuestionRound = (qIdx: number, qList: QuizQuestion[], opp: OpponentProfile) => {
    setCurrentQIndex(qIdx);
    setSelectedOption(null);
    setOpponentLockedIn(false);
    setTimeLeft(QUESTION_SECONDS);
    setBattleState("question");
    startTimeRef.current = Date.now();

    // Schedule Opponent Answer Simulation
    const minTime = opp.responseTimeRange[0];
    const maxTime = opp.responseTimeRange[1];
    const opponentAnswerDelaySec = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;

    if (opponentTimerRef.current) clearTimeout(opponentTimerRef.current);
    opponentTimerRef.current = setTimeout(() => {
      setOpponentLockedIn(true);
    }, opponentAnswerDelaySec * 1000);

    // Main 15s Countdown
    if (timerRef.current) clearInterval(timerRef.current);
    let currentSeconds = QUESTION_SECONDS;

    timerRef.current = setInterval(() => {
      currentSeconds -= 1;
      setTimeLeft(currentSeconds);

      if (currentSeconds <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        resolveRound(null, qIdx, qList, opp);
      }
    }, 1000);
  };

  const handleOptionSelect = (optIndex: number) => {
    if (selectedOption !== null || battleState !== "question") return;

    playOptionSelect();
    setSelectedOption(optIndex);
    if (timerRef.current) clearInterval(timerRef.current);

    const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;
    resolveRound(optIndex, currentQIndex, questions, activeOpponent, elapsedSeconds);
  };

  const resolveRound = (
    chosenOpt: number | null,
    qIdx: number,
    qList: QuizQuestion[],
    opp: OpponentProfile,
    elapsed = 15
  ) => {
    const q = qList[qIdx];
    if (!q) return;

    const userIsCorrect = chosenOpt === q.correctIndex;

    // Streak Multiplier & Audio feedback
    const nextStreak = userIsCorrect ? userStreak + 1 : 0;
    setUserStreak(nextStreak);

    let streakMultiplier = 1.0;
    if (nextStreak === 2) streakMultiplier = 1.1;
    else if (nextStreak === 3) streakMultiplier = 1.25;
    else if (nextStreak >= 4) streakMultiplier = 1.5;

    if (userIsCorrect) {
      if (nextStreak >= 2) {
        playStreakSound(nextStreak);
      } else {
        playCorrectSound();
      }
    } else {
      playWrongSound();
    }

    // Simulate opponent correctness
    const oppRoll = Math.random();
    const oppIsCorrect = oppRoll <= opp.accuracy;
    const simulatedOpponentChoice = oppIsCorrect
      ? q.correctIndex
      : (q.correctIndex + 1) % q.options.length;

    // Calculate Points
    // Base 100 for correct + up to 50 for speed multiplied by streak combo
    const userSpeedBonus = userIsCorrect ? Math.max(0, Math.round((15 - elapsed) * 3.3)) : 0;
    const userRoundPoints = userIsCorrect
      ? Math.round((100 + userSpeedBonus) * streakMultiplier)
      : 0;

    const oppElapsed = Math.min(13, opp.responseTimeRange[0] + 2);
    const oppSpeedBonus = oppIsCorrect ? Math.max(0, Math.round((15 - oppElapsed) * 3.3)) : 0;
    const oppRoundPoints = oppIsCorrect ? 100 + oppSpeedBonus : 0;

    setUserScore((prev) => prev + userRoundPoints);
    setOpponentScore((prev) => prev + oppRoundPoints);

    const roundData: RoundResult = {
      question: q,
      userAnswer: chosenOpt,
      opponentAnswer: simulatedOpponentChoice,
      userCorrect: userIsCorrect,
      opponentCorrect: oppIsCorrect,
      userTimeTaken: Math.min(15, Math.round(elapsed * 10) / 10),
      userPointsEarned: userRoundPoints,
      opponentPointsEarned: oppRoundPoints,
    };

    setRoundResults((prev) => [...prev, roundData]);
    setBattleState("round_result");

    // Hold on explanation / round result for 2.4 seconds, then proceed
    setTimeout(() => {
      const nextIdx = qIdx + 1;
      if (nextIdx < qList.length) {
        startQuestionRound(nextIdx, qList, opp);
      } else {
        finishMatch(userScore + userRoundPoints, opponentScore + oppRoundPoints, [
          ...roundResults,
          roundData,
        ]);
      }
    }, 2400);
  };

  const finishMatch = (finalUser: number, finalOpp: number, _allRounds: RoundResult[]) => {
    setBattleState("match_finished");

    let outcome: "victory" | "defeat" | "draw" = "draw";
    let earnedXp = 50; // base participation

    if (finalUser > finalOpp) {
      outcome = "victory";
      earnedXp = 150 + Math.round(finalUser / 10);
      playVictoryFanfare();
    } else if (finalUser < finalOpp) {
      outcome = "defeat";
      earnedXp = 40 + Math.round(finalUser / 20);
      playWrongSound();
    } else {
      outcome = "draw";
      earnedXp = 80 + Math.round(finalUser / 15);
    }

    setXpDelta(earnedXp);

    const currentTopicObj = BATTLE_TOPICS.find((t) => t.id === selectedTopic);
    const newRecord: BattleRecord = {
      id: `battle-${Date.now()}`,
      opponentName: activeOpponent.name,
      topicLabel: currentTopicObj?.label ?? "Battle Duel",
      userScore: finalUser,
      opponentScore: finalOpp,
      outcome,
      xpEarned: earnedXp,
      date: "Just now",
    };

    setMatchHistory((prev) => {
      const updated = [newRecord, ...prev.slice(0, 9)];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("veyskill_battle_history", JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });

    // Real-Time persistence to Firestore users/{uid} collection
    if (user?.uid) {
      recordUserBattleResult(user.uid, {
        xpEarned: earnedXp,
        outcome,
        userScore: finalUser,
      }).catch((err) => {
        console.error("Failed to persist battle XP to Firestore:", err);
      });
    }
  };

  // ── Render Views ────────────────────────────────────────────────────────────

  return (
    <div className="py-2">
      {/* ─── 1. LOBBY VIEW ─────────────────────────────────────────────────── */}
      {battleState === "lobby" && (
        <div className="space-y-6">
          {/* Main Action Banner */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-heading font-semibold">
                  <SwordsIcon size={14} />
                  <span>Real-Time 1v1 Knowledge Duel</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-heading font-black text-foreground tracking-tight">
                  Test Your Technical Mastery Head-to-Head
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  5 rapid-fire technical questions. 15 seconds per question. Answer faster and more
                  accurately to defeat peers, earn XP, and climb the verified leaderboard.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto flex-shrink-0">
                <button
                  type="button"
                  onClick={handleStartBattle}
                  className="px-6 py-3 rounded-xl font-heading font-bold text-sm text-white bg-teal-600 hover:bg-teal-500 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <SwordsIcon size={17} />
                  <span>Quick Match</span>
                </button>
              </div>
            </div>
          </div>

          {/* Live Arena Activity Ticker */}
          <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-cyan-500/10 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-heading font-black text-foreground">Live Arena Network</span>
              <span className="text-muted-foreground hidden sm:inline">
                &middot; 1,420 Duels Completed Today
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 font-bold">
                <ZapIcon size={12} /> 18 Battle Disciplines
              </span>
              <span className="hidden md:inline">&middot; &lt; 2.5s Matchmaking</span>
              <span>&middot; Top 20 Verified</span>
            </div>
          </div>

          {/* Topic & Branch Discipline Selector */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground">
                  Select Battle Discipline
                </h3>
                <p className="text-xs text-muted-foreground">
                  Covering all engineering disciplines, computer science tracks, and campus
                  placements.
                </p>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                Showing {filteredTopics.length} of {BATTLE_TOPICS.length} disciplines
              </span>
            </div>

            {/* Branch Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {DISCIPLINE_BRANCHES.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBranch(b.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold whitespace-nowrap transition-all flex items-center gap-1.5 select-none ${
                    selectedBranch === b.id
                      ? "bg-teal-600 text-white shadow-xs"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  <span>{b.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      selectedBranch === b.id
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {b.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Instant Search Bar */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <SearchIcon size={14} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search disciplines by branch, subject, tags (e.g. Python, ECE, Aptitude, SQL, Thermodynamics)..."
                className="w-full bg-card border border-border rounded-xl pl-9 pr-8 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs p-1"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Active Selected Discipline Card Launcher */}
            {(() => {
              const activeMeta = BATTLE_TOPICS.find((t) => t.id === selectedTopic);
              if (!activeMeta) return null;
              return (
                <div className="p-4 sm:p-5 rounded-2xl border border-teal-500/30 bg-gradient-to-r from-teal-500/[0.08] via-card to-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-heading font-black px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                        {activeMeta.branchBadge}
                      </span>
                      <span className="text-[10px] font-heading font-bold px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground">
                        {activeMeta.difficultyTier} Tier
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        🔥 {activeMeta.activeBattlesCount} scholars dueling
                      </span>
                    </div>
                    <h4 className="font-heading font-black text-base sm:text-lg text-foreground">
                      Locked In: {activeMeta.label}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-1 max-w-xl">
                      {activeMeta.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartBattle}
                    className="px-5 py-2.5 rounded-xl font-heading font-bold text-xs sm:text-sm text-white bg-teal-600 hover:bg-teal-500 transition-all flex items-center justify-center gap-2 shadow-md shadow-teal-500/20 active:scale-[0.98] flex-shrink-0"
                  >
                    <SwordsIcon size={16} />
                    <span>Launch 1v1 Battle Now</span>
                  </button>
                </div>
              );
            })()}

            {/* Disciplines Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredTopics.map((topic) => {
                const isSelected = selectedTopic === topic.id;

                let branchBadgeStyle = "bg-teal-500/10 text-teal-600 border-teal-500/20";
                if (topic.branch === "ai_data") {
                  branchBadgeStyle =
                    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
                } else if (topic.branch === "core_engineering") {
                  branchBadgeStyle =
                    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
                } else if (topic.branch === "placement_aptitude") {
                  branchBadgeStyle =
                    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
                } else if (topic.branch === "applied_sciences") {
                  branchBadgeStyle =
                    "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
                }

                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`text-left p-4 rounded-2xl border transition-all relative flex flex-col justify-between select-none ${
                      isSelected
                        ? "bg-teal-500/[0.08] border-teal-500 shadow-md ring-2 ring-teal-500/30"
                        : "bg-card border-border hover:border-border/80 hover:bg-muted/30"
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`text-[9px] font-heading font-black px-2 py-0.5 rounded-full border ${branchBadgeStyle}`}
                        >
                          {topic.branchBadge}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                          <span>{topic.difficultyTier}</span>
                          <span>&middot;</span>
                          <span className="text-amber-600 dark:text-amber-400 font-bold">
                            {topic.activeBattlesCount} duels
                          </span>
                        </div>
                      </div>

                      {/* Title & Category */}
                      <h4 className="font-heading font-bold text-sm text-foreground mb-0.5">
                        {topic.label}
                      </h4>
                      <p className="text-[11px] text-muted-foreground font-mono mb-2">
                        {topic.category}
                      </p>

                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                        {topic.description}
                      </p>

                      {/* Topic Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {topic.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-muted/60 text-muted-foreground"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium pt-2.5 border-t border-border/50">
                      <span>5 Qs &middot; 15s Timer</span>
                      {isSelected ? (
                        <span className="text-teal-600 dark:text-teal-400 font-heading font-bold flex items-center gap-1">
                          <CheckIcon size={13} />
                          Selected
                        </span>
                      ) : (
                        <span className="text-muted-foreground group-hover:text-foreground text-[10px] font-heading font-semibold">
                          Click to Select
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredTopics.length === 0 && (
              <div className="text-center py-10 rounded-2xl border border-dashed border-border bg-card/40 space-y-2">
                <p className="text-xs text-muted-foreground">
                  No disciplines found matching &quot;{searchQuery}&quot;.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedBranch("all");
                  }}
                  className="text-xs font-heading font-bold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>

          {/* Battle Mechanics & Campus Pride */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3">
                <TimerIcon size={18} />
              </div>
              <h4 className="font-heading font-bold text-sm text-foreground mb-1">
                Precision &amp; Speed Scoring
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                100 points for every correct answer, plus up to 50 bonus points based on remaining
                seconds on the clock.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                <ShieldCheckIcon size={18} />
              </div>
              <h4 className="font-heading font-bold text-sm text-foreground mb-1">
                Anti-Cheat Verification
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Rigorous 15-second windows make external lookup impossible. Only genuine conceptual
                fluency prevails.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                <TrophyIcon size={18} />
              </div>
              <h4 className="font-heading font-bold text-sm text-foreground mb-1">
                Verified Skill Rank
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Win battles to progress through Bronze to Conqueror tier. Recruiter-verifiable proof
                of competence.
              </p>
            </div>
          </div>

          {/* Recent Battles List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Your Recent Battle Record
              </h3>
              {onLeaderboardClick && (
                <button
                  type="button"
                  onClick={onLeaderboardClick}
                  className="text-xs font-heading font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  View Global Rankings &rarr;
                </button>
              )}
            </div>

            {matchHistory.length > 0 ? (
              <div className="rounded-xl border border-border bg-card divide-y divide-border/60 overflow-hidden">
                {matchHistory.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-heading font-bold text-xs flex-shrink-0 ${
                          m.outcome === "victory"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : m.outcome === "defeat"
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                              : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {m.outcome === "victory" ? "W" : m.outcome === "defeat" ? "L" : "D"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-heading font-semibold text-sm text-foreground truncate">
                          vs {m.opponentName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {m.topicLabel} &middot; {m.date}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="font-mono text-sm font-bold text-foreground">
                        {m.userScore} - {m.opponentScore}
                      </span>
                      <p className="text-[11px] font-heading font-semibold text-teal-600 dark:text-teal-400">
                        +{m.xpEarned} XP
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 rounded-xl border border-dashed border-border bg-card/50">
                <p className="text-xs text-muted-foreground">
                  No battles recorded yet. Launch your first Quick Match to begin!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 2. MATCHMAKING SCREEN ─────────────────────────────────────────── */}
      {battleState === "matchmaking" && (
        <div className="py-16 text-center max-w-md mx-auto">
          <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            {/* Radar wave rings */}
            <span className="absolute inset-0 rounded-full border-2 border-teal-500/30 animate-ping opacity-75" />
            <span className="absolute -inset-2 rounded-full border border-teal-500/20 animate-pulse" />
            <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <SwordsIcon size={26} />
            </div>
          </div>

          <h3 className="font-heading font-bold text-lg text-foreground mb-1">
            Finding Peer Opponent...
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Matching by skill rating in{" "}
            <span className="font-semibold text-foreground">
              {BATTLE_TOPICS.find((t) => t.id === selectedTopic)?.label}
            </span>
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/80 text-muted-foreground text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span>Scanning active scholars...</span>
          </div>
        </div>
      )}

      {/* ─── 3. READY COUNTDOWN SCREEN ─────────────────────────────────────── */}
      {battleState === "ready" && (
        <div className="py-12 text-center max-w-lg mx-auto animate-scale-in">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-heading font-bold mb-4 border border-emerald-500/20">
            <CheckIcon size={14} />
            <span>Opponent Matched</span>
          </div>

          {/* Head-to-Head Intro */}
          <div className="grid grid-cols-2 gap-4 items-center mb-8">
            {/* You */}
            <div className="p-4 rounded-xl border border-border bg-card">
              <div className="w-12 h-12 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 mx-auto flex items-center justify-center font-heading font-black text-base border border-teal-500/30 mb-2">
                {(user?.displayName ?? "You")[0]?.toUpperCase()}
              </div>
              <h4 className="font-heading font-bold text-sm text-foreground truncate">
                {user?.displayName ?? "You"}
              </h4>
              <span className="text-[11px] text-muted-foreground">Scholar</span>
            </div>

            {/* Opponent */}
            <div className="p-4 rounded-xl border border-border bg-card">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center font-heading font-black text-base border border-indigo-500/30 mb-2">
                {activeOpponent.name[0]}
              </div>
              <h4 className="font-heading font-bold text-sm text-foreground truncate">
                {activeOpponent.name}
              </h4>
              <span className="text-[11px] text-muted-foreground">{activeOpponent.campus}</span>
            </div>
          </div>

          <p className="font-heading font-black text-2xl text-teal-600 dark:text-teal-400 animate-pulse">
            Duel Starting in 3... 2... 1...
          </p>
        </div>
      )}

      {/* ─── 4. QUESTION ROUND & 5. ROUND RESULT SCREEN ─────────────────────── */}
      {(battleState === "question" || battleState === "round_result") && (
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Top Status Bar: Scores, Streak, Sound & Timer */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between gap-4">
              {/* You */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-heading font-bold text-xs border border-teal-500/25">
                    {(user?.displayName ?? "U")[0]?.toUpperCase()}
                  </div>
                  {userStreak >= 2 && (
                    <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-white shadow-xs">
                      <FlameIcon size={10} className="text-white" />
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-heading font-bold text-xs text-foreground truncate max-w-[100px] sm:max-w-none">
                      {user?.displayName ?? "You"}
                    </p>
                    {userStreak >= 2 && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                        x{userStreak >= 4 ? "1.5" : userStreak === 3 ? "1.25" : "1.1"} Streak
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                    {userScore} pts
                  </p>
                </div>
              </div>

              {/* Central Timer & Velocity */}
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-heading font-semibold text-muted-foreground mb-0.5">
                  Round {currentQIndex + 1} of {questions.length}
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold transition-colors ${
                      timeLeft <= 4
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse"
                        : "bg-muted text-foreground border border-border"
                    }`}
                  >
                    <TimerIcon size={13} />
                    <span>{timeLeft}s</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleSound}
                    title={soundEnabled ? "Mute Arena Audio" : "Enable Arena Audio"}
                    className="p-1 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-all"
                  >
                    {soundEnabled ? <Volume2Icon size={14} /> : <VolumeXIcon size={14} />}
                  </button>
                </div>
              </div>

              {/* Opponent */}
              <div className="flex items-center gap-3 text-right">
                <div>
                  <div className="flex items-center justify-end gap-1.5">
                    {opponentLockedIn && (
                      <span className="text-[9px] font-heading font-bold px-1.5 py-px rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 animate-pulse">
                        Locked In
                      </span>
                    )}
                    <p className="font-heading font-bold text-xs text-foreground truncate max-w-[100px] sm:max-w-none">
                      {activeOpponent.name}
                    </p>
                  </div>
                  <p className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {opponentScore} pts
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-heading font-bold text-xs border border-indigo-500/25">
                  {activeOpponent.name[0]}
                </div>
              </div>
            </div>

            {/* Live Tug-of-War Momentum Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground px-0.5">
                <span className="text-teal-600 dark:text-teal-400 font-bold">
                  {userScore >= opponentScore ? "Leading" : "Trailing"}
                </span>
                <span>Speed Bonus: +{Math.max(0, Math.round(timeLeft * 3.3))} pts</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">Rival</span>
              </div>
              <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-500 ease-out ${
                    userScore >= opponentScore ? "bg-teal-500" : "bg-rose-500"
                  }`}
                  style={{
                    width: `${
                      userScore + opponentScore === 0
                        ? 50
                        : Math.min(95, Math.max(5, (userScore / (userScore + opponentScore)) * 100))
                    }%`,
                  }}
                />
                <div
                  className="h-full bg-indigo-500/60 transition-all duration-500 ease-out"
                  style={{
                    width: `${
                      userScore + opponentScore === 0
                        ? 50
                        : Math.min(
                            95,
                            Math.max(5, (opponentScore / (userScore + opponentScore)) * 100)
                          )
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Question Body */}
          {questions[currentQIndex] && (
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 space-y-5">
              <h3 className="font-heading font-bold text-base sm:text-lg text-foreground leading-snug">
                {questions[currentQIndex]!.question}
              </h3>

              {/* 4 Options Grid */}
              <div className="grid grid-cols-1 gap-2.5">
                {questions[currentQIndex]!.options.map((optText, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isSelected = selectedOption === optIdx;
                  const isCorrect = questions[currentQIndex]!.correctIndex === optIdx;

                  let btnStyle =
                    "border-border bg-card hover:border-teal-500/40 hover:bg-muted/30 text-foreground";

                  if (battleState === "round_result") {
                    if (isCorrect) {
                      btnStyle =
                        "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 font-semibold";
                    } else if (isSelected && !isCorrect) {
                      btnStyle =
                        "border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-200 line-through";
                    } else {
                      btnStyle = "border-border/60 bg-muted/20 text-muted-foreground opacity-60";
                    }
                  } else if (isSelected) {
                    btnStyle =
                      "border-teal-600 dark:border-teal-400 bg-teal-500/10 text-foreground ring-1 ring-teal-500/30";
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={selectedOption !== null || battleState === "round_result"}
                      onClick={() => handleOptionSelect(optIdx)}
                      className={`text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-start gap-3 select-none active:scale-[0.99] ${btnStyle}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-heading font-bold text-xs flex-shrink-0 ${
                          battleState === "round_result" && isCorrect
                            ? "bg-emerald-500 text-white"
                            : battleState === "round_result" && isSelected && !isCorrect
                              ? "bg-rose-500 text-white"
                              : isSelected
                                ? "bg-teal-600 text-white"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="font-body text-sm leading-relaxed flex-1">{optText}</span>
                    </button>
                  );
                })}
              </div>

              {/* Round Explanation Reveal */}
              {battleState === "round_result" && (
                <div className="p-4 rounded-xl bg-muted/40 border border-border/80 text-xs text-muted-foreground leading-relaxed animate-fade-in">
                  <div className="flex items-center gap-1.5 font-heading font-bold text-foreground mb-1">
                    <ShieldCheckIcon size={14} />
                    <span>Explanation</span>
                  </div>
                  <p>{questions[currentQIndex]!.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── 6. MATCH FINISHED / VICTORY / DEFEAT SCREEN ───────────────────── */}
      {battleState === "match_finished" && (
        <div className="relative max-w-2xl mx-auto space-y-6 animate-scale-in py-4">
          {userScore > opponentScore && <ConfettiCanvas durationMs={4500} />}

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-center space-y-4 shadow-xl">
            {/* Outcome Icon & Title */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mx-auto">
              {userScore > opponentScore ? (
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <TrophyIcon size={32} />
                </div>
              ) : userScore < opponentScore ? (
                <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <SwordsIcon size={32} />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <UsersIcon size={32} />
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-heading font-black tracking-tight text-foreground">
                {userScore > opponentScore
                  ? "Victory!"
                  : userScore < opponentScore
                    ? "Defeat"
                    : "Honorable Draw"}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {userScore > opponentScore
                  ? "Outstanding execution! You outperformed your opponent across rounds."
                  : userScore < opponentScore
                    ? "Close contest! Review the explanations to reinforce conceptual gaps."
                    : "Evenly matched performance across technical questions."}
              </p>
            </div>

            {/* Final Scoreboard */}
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto py-2">
              <div className="p-3 rounded-xl border border-border bg-muted/30">
                <p className="text-xs text-muted-foreground">Your Score</p>
                <p className="text-2xl font-mono font-black text-foreground">{userScore}</p>
              </div>
              <div className="p-3 rounded-xl border border-border bg-muted/30">
                <p className="text-xs text-muted-foreground">{activeOpponent.name}</p>
                <p className="text-2xl font-mono font-black text-muted-foreground">
                  {opponentScore}
                </p>
              </div>
            </div>

            {/* Stats Trio */}
            <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto text-center py-1">
              <div className="p-2 rounded-xl bg-muted/20 border border-border/70">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                  Accuracy
                </span>
                <span className="font-mono font-bold text-xs text-foreground">
                  {Math.round(
                    (roundResults.filter((r) => r.userCorrect).length /
                      Math.max(1, roundResults.length)) *
                      100
                  )}
                  %
                </span>
              </div>
              <div className="p-2 rounded-xl bg-muted/20 border border-border/70">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                  Avg Velocity
                </span>
                <span className="font-mono font-bold text-xs text-foreground">
                  {(
                    roundResults.reduce((acc, r) => acc + r.userTimeTaken, 0) /
                    Math.max(1, roundResults.length)
                  ).toFixed(1)}
                  s
                </span>
              </div>
              <div className="p-2 rounded-xl bg-muted/20 border border-border/70">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                  XP Earned
                </span>
                <span className="font-mono font-bold text-xs text-teal-600 dark:text-teal-400">
                  +{xpDelta}
                </span>
              </div>
            </div>

            {/* XP Awarded */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-700 dark:text-teal-300 text-sm font-heading font-bold">
              <ZapIcon size={16} />
              <span>+{xpDelta} Battle XP Awarded</span>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleStartBattle}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-heading font-bold text-sm text-white bg-teal-600 hover:bg-teal-500 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <RefreshIcon size={16} />
                <span>Play Again</span>
              </button>

              <button
                type="button"
                onClick={() => setBattleState("lobby")}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-heading font-semibold text-sm text-foreground bg-card border border-border hover:bg-muted active:scale-[0.98] transition-all"
              >
                Back to Lobby
              </button>
            </div>
          </div>

          {/* Round-by-Round Breakdown */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground">
              Round Breakdown
            </h3>
            <div className="space-y-2">
              {roundResults.map((res, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl border border-border/80 bg-muted/20 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0 ${
                        res.userCorrect
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {res.userCorrect ? "✓" : "✕"}
                    </span>
                    <span className="font-heading font-semibold text-foreground truncate">
                      Q{i + 1}: {res.question.question}
                    </span>
                  </div>
                  <span className="font-mono text-muted-foreground flex-shrink-0">
                    +{res.userPointsEarned} pts ({res.userTimeTaken}s)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
