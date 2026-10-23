import type { DomainType } from "@/lib/curriculumEngine";

// ── Rank Tiers Definition (Zero Emojis, Google Standard) ────────────────────

export interface RankTier {
  name: string;
  minXp: number;
  textColor: string;
  bgColor: string;
  borderColor: string;
}

export const RANK_TIERS: RankTier[] = [
  {
    name: "Conqueror",
    minXp: 5000,
    textColor: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
  },
  {
    name: "Grandmaster",
    minXp: 3000,
    textColor: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  {
    name: "Master",
    minXp: 2000,
    textColor: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  {
    name: "Diamond",
    minXp: 1200,
    textColor: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
  },
  {
    name: "Gold",
    minXp: 600,
    textColor: "text-yellow-700 dark:text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
  },
  {
    name: "Silver",
    minXp: 200,
    textColor: "text-slate-600 dark:text-slate-300",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/30",
  },
  {
    name: "Bronze",
    minXp: 0,
    textColor: "text-orange-800 dark:text-orange-300",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
];

export function getRankTier(xp: number): RankTier {
  return RANK_TIERS.find((t) => xp >= t.minXp) ?? RANK_TIERS[RANK_TIERS.length - 1]!;
}

// ── Battle Topics ────────────────────────────────────────────────────────────

export interface BattleTopic {
  id: DomainType;
  label: string;
  category: string;
  questionCount: number;
  description: string;
}

export const BATTLE_TOPICS: BattleTopic[] = [
  {
    id: "react",
    label: "React & Next.js",
    category: "Frontend",
    questionCount: 5,
    description: "Hooks, hydration, server components, and component lifecycle.",
  },
  {
    id: "javascript",
    label: "JavaScript ES6+",
    category: "Frontend & Node",
    questionCount: 5,
    description: "Event loop, closures, promises, prototypes, and async execution.",
  },
  {
    id: "python",
    label: "Python Core",
    category: "Backend & Data",
    questionCount: 5,
    description: "Decorators, generators, slicing, list comprehensions, and GIL.",
  },
  {
    id: "database",
    label: "SQL & Databases",
    category: "Data Systems",
    questionCount: 5,
    description: "ACID transactions, query plans, indexing, and joins.",
  },
  {
    id: "algorithms",
    label: "DSA & Problem Solving",
    category: "Computer Science",
    questionCount: 5,
    description: "Big-O complexity, binary search, trees, and dynamic programming.",
  },
];

// ── Opponent Profiles ────────────────────────────────────────────────────────

export interface OpponentProfile {
  name: string;
  campus: string;
  rankTitle: string;
  xp: number;
  winRate: number;
  accuracy: number;
  responseTimeRange: [number, number];
}

export const PEER_OPPONENTS: OpponentProfile[] = [
  {
    name: "Rohan K.",
    campus: "IIT Bombay",
    rankTitle: "Master",
    xp: 2280,
    winRate: 72,
    accuracy: 0.8,
    responseTimeRange: [4, 9],
  },
  {
    name: "Priya M.",
    campus: "BITS Pilani",
    rankTitle: "Grandmaster",
    xp: 2510,
    winRate: 75,
    accuracy: 0.85,
    responseTimeRange: [3, 8],
  },
  {
    name: "Aarav S.",
    campus: "IIT Delhi",
    rankTitle: "Grandmaster",
    xp: 2840,
    winRate: 78,
    accuracy: 0.88,
    responseTimeRange: [3, 7],
  },
  {
    name: "Sneha R.",
    campus: "NIT Trichy",
    rankTitle: "Diamond",
    xp: 1950,
    winRate: 69,
    accuracy: 0.75,
    responseTimeRange: [5, 11],
  },
  {
    name: "Vikram D.",
    campus: "IIIT Hyderabad",
    rankTitle: "Diamond",
    xp: 1720,
    winRate: 66,
    accuracy: 0.72,
    responseTimeRange: [5, 10],
  },
  {
    name: "Ananya P.",
    campus: "DTU Delhi",
    rankTitle: "Gold",
    xp: 1580,
    winRate: 64,
    accuracy: 0.7,
    responseTimeRange: [6, 12],
  },
];

// ── Verified Leaderboard Data ────────────────────────────────────────────────

export interface LeaderboardStudent {
  rank: number;
  name: string;
  campus: string;
  xp: number;
  battles: number;
  winRate: number;
  streak: number;
  verified: boolean;
  topicDomain: string;
}

export const LEADERBOARD_DATA: LeaderboardStudent[] = [
  {
    rank: 1,
    name: "Aarav Sharma",
    campus: "IIT Delhi",
    xp: 3840,
    battles: 194,
    winRate: 81,
    streak: 26,
    verified: true,
    topicDomain: "react",
  },
  {
    rank: 2,
    name: "Priya Mukherjee",
    campus: "BITS Pilani",
    xp: 3410,
    battles: 172,
    winRate: 78,
    streak: 19,
    verified: true,
    topicDomain: "javascript",
  },
  {
    rank: 3,
    name: "Rohan Kulkarni",
    campus: "IIT Bombay",
    xp: 3120,
    battles: 158,
    winRate: 75,
    streak: 15,
    verified: true,
    topicDomain: "python",
  },
  {
    rank: 4,
    name: "Sneha Reddy",
    campus: "NIT Trichy",
    xp: 2650,
    battles: 132,
    winRate: 72,
    streak: 12,
    verified: true,
    topicDomain: "database",
  },
  {
    rank: 5,
    name: "Vikram Das",
    campus: "IIIT Hyderabad",
    xp: 2280,
    battles: 114,
    winRate: 68,
    streak: 10,
    verified: true,
    topicDomain: "algorithms",
  },
  {
    rank: 6,
    name: "Ananya Patel",
    campus: "DTU Delhi",
    xp: 1980,
    battles: 99,
    winRate: 67,
    streak: 8,
    verified: false,
    topicDomain: "react",
  },
  {
    rank: 7,
    name: "Karthik Nair",
    campus: "NIT Surathkal",
    xp: 1640,
    battles: 82,
    winRate: 64,
    streak: 6,
    verified: true,
    topicDomain: "python",
  },
  {
    rank: 8,
    name: "Divya Lakshmi",
    campus: "Anna University",
    xp: 1420,
    battles: 71,
    winRate: 62,
    streak: 5,
    verified: false,
    topicDomain: "javascript",
  },
  {
    rank: 9,
    name: "Siddharth Jain",
    campus: "IIT Roorkee",
    xp: 1250,
    battles: 64,
    winRate: 60,
    streak: 4,
    verified: true,
    topicDomain: "algorithms",
  },
  {
    rank: 10,
    name: "Meera Krishnan",
    campus: "Manipal Tech",
    xp: 1100,
    battles: 56,
    winRate: 59,
    streak: 4,
    verified: false,
    topicDomain: "database",
  },
];
