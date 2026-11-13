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

export type DisciplineBranch =
  | "all"
  | "cs_software"
  | "ai_data"
  | "core_engineering"
  | "placement_aptitude"
  | "applied_sciences";

export interface BattleTopic {
  id: DomainType;
  label: string;
  category: string;
  branch: DisciplineBranch;
  branchBadge: string;
  difficultyTier: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  activeBattlesCount: number;
  questionCount: number;
  description: string;
  tags: string[];
}

export const DISCIPLINE_BRANCHES: { id: DisciplineBranch; label: string; count: number }[] = [
  { id: "all", label: "All Disciplines", count: 18 },
  { id: "cs_software", label: "Computer Science & IT", count: 7 },
  { id: "ai_data", label: "AI & Data Science", count: 2 },
  { id: "core_engineering", label: "Core Engineering", count: 4 },
  { id: "placement_aptitude", label: "Placement & Aptitude", count: 3 },
  { id: "applied_sciences", label: "Science & Mathematics", count: 2 },
];

export const BATTLE_TOPICS: BattleTopic[] = [
  // ── 1. Computer Science & Software Engineering
  {
    id: "react",
    label: "React & Next.js",
    category: "Web & Frontend",
    branch: "cs_software",
    branchBadge: "CS / IT",
    difficultyTier: "Intermediate",
    activeBattlesCount: 185,
    questionCount: 5,
    description: "Hooks, hydration, server components, and component lifecycle.",
    tags: ["Hooks", "SSR/SSG", "Next.js 15"],
  },
  {
    id: "javascript",
    label: "JavaScript & TypeScript",
    category: "Full Stack Core",
    branch: "cs_software",
    branchBadge: "CS / IT",
    difficultyTier: "Intermediate",
    activeBattlesCount: 164,
    questionCount: 5,
    description: "Event loop, closures, promises, prototypes, and async execution.",
    tags: ["Event Loop", "Closures", "Async/Await"],
  },
  {
    id: "python",
    label: "Python Core & Frameworks",
    category: "Backend & Systems",
    branch: "cs_software",
    branchBadge: "CS / IT",
    difficultyTier: "Beginner",
    activeBattlesCount: 210,
    questionCount: 5,
    description: "Decorators, generators, slicing, list comprehensions, and OOP.",
    tags: ["FastAPI", "OOP", "Generators"],
  },
  {
    id: "algorithms",
    label: "DSA & Problem Solving",
    category: "Algorithms",
    branch: "cs_software",
    branchBadge: "CS / IT",
    difficultyTier: "Advanced",
    activeBattlesCount: 295,
    questionCount: 5,
    description: "Big-O complexity, binary search, trees, and dynamic programming.",
    tags: ["Dynamic Prog", "Trees", "Big-O"],
  },
  {
    id: "systems",
    label: "System Design & Architecture",
    category: "Systems Engineering",
    branch: "cs_software",
    branchBadge: "CS / IT",
    difficultyTier: "Expert",
    activeBattlesCount: 142,
    questionCount: 5,
    description: "Distributed systems, CAP theorem, caching, load balancers, and microservices.",
    tags: ["CAP Theorem", "Microservices", "Caching"],
  },
  {
    id: "database",
    label: "SQL & Database Systems",
    category: "Data Storage",
    branch: "cs_software",
    branchBadge: "CS / IT",
    difficultyTier: "Intermediate",
    activeBattlesCount: 128,
    questionCount: 5,
    description: "ACID transactions, query plans, indexing, sharding, and joins.",
    tags: ["ACID", "Query Plans", "Indexing"],
  },
  {
    id: "devops",
    label: "Cloud, Docker & Kubernetes",
    category: "Cloud & Infrastructure",
    branch: "cs_software",
    branchBadge: "CS / IT",
    difficultyTier: "Advanced",
    activeBattlesCount: 96,
    questionCount: 5,
    description: "Kubernetes pods, Docker layer caching, CI/CD, and Linux process signals.",
    tags: ["Kubernetes", "Docker", "CI/CD"],
  },

  // ── 2. AI, Machine Learning & Data Science
  {
    id: "ai_ml",
    label: "Machine Learning & Deep Learning",
    category: "Artificial Intelligence",
    branch: "ai_data",
    branchBadge: "AI & DATA",
    difficultyTier: "Advanced",
    activeBattlesCount: 174,
    questionCount: 5,
    description:
      "Neural network activations, dropout regularization, self-attention, and gradients.",
    tags: ["Transformers", "Self-Attention", "Backprop"],
  },
  {
    id: "data_science",
    label: "Data Science & Statistics",
    category: "Data Science",
    branch: "ai_data",
    branchBadge: "AI & DATA",
    difficultyTier: "Intermediate",
    activeBattlesCount: 112,
    questionCount: 5,
    description: "Probability distributions, evaluation metrics, Precision-Recall, and F1.",
    tags: ["F1-Score", "Model Metrics", "Statistics"],
  },

  // ── 3. Core Engineering Branches (ECE, EEE, Mechanical, Civil)
  {
    id: "ece_embedded",
    label: "ECE: Digital Logic & Embedded",
    category: "Electronics",
    branch: "core_engineering",
    branchBadge: "ECE",
    difficultyTier: "Intermediate",
    activeBattlesCount: 88,
    questionCount: 5,
    description: "Flip-flops vs latches, Nyquist sampling theorem, CMOS gates, and ADC resolution.",
    tags: ["Flip-Flops", "Nyquist", "CMOS", "ADC"],
  },
  {
    id: "eee_power",
    label: "EEE: Electrical Machines & Power",
    category: "Electrical",
    branch: "core_engineering",
    branchBadge: "EEE",
    difficultyTier: "Intermediate",
    activeBattlesCount: 76,
    questionCount: 5,
    description: "High-voltage transmission, transformer turn ratios, power factor, and KCL.",
    tags: ["Transformers", "Power Factor", "Induction"],
  },
  {
    id: "mech_thermal",
    label: "Mechanical: Thermodynamics & Fluids",
    category: "Mechanical",
    branch: "core_engineering",
    branchBadge: "MECH",
    difficultyTier: "Advanced",
    activeBattlesCount: 84,
    questionCount: 5,
    description:
      "Second law of thermodynamics, Bernoulli's equation, material toughness, and Otto cycle.",
    tags: ["Bernoulli", "Otto Cycle", "Stress-Strain"],
  },
  {
    id: "civil_structural",
    label: "Civil: Structures & Geotechnical",
    category: "Civil",
    branch: "core_engineering",
    branchBadge: "CIVIL",
    difficultyTier: "Intermediate",
    activeBattlesCount: 68,
    questionCount: 5,
    description:
      "Bending moment diagrams, concrete slump testing, Hooke's law, and Terzaghi stress.",
    tags: ["Bending Moment", "Slump Test", "Soil Mechanics"],
  },

  // ── 4. Campus Placements, Aptitude & General Tech
  {
    id: "aptitude_quant",
    label: "Quantitative Aptitude & Reasoning",
    category: "Campus Placement",
    branch: "placement_aptitude",
    branchBadge: "PLACEMENT",
    difficultyTier: "Beginner",
    activeBattlesCount: 245,
    questionCount: 5,
    description:
      "Train speeds, work and time equations, permutations, probability, and percentages.",
    tags: ["Speed & Distance", "Time & Work", "Probability"],
  },
  {
    id: "os_networks",
    label: "Operating Systems & Networking",
    category: "Computer Fundamentals",
    branch: "placement_aptitude",
    branchBadge: "GATE & INTERVIEW",
    difficultyTier: "Intermediate",
    activeBattlesCount: 160,
    questionCount: 5,
    description:
      "Deadlock Coffman conditions, processes vs threads, TCP 3-way handshake, and thrashing.",
    tags: ["Deadlocks", "TCP Handshake", "Virtual Memory"],
  },
  {
    id: "cybersecurity",
    label: "Cybersecurity & Web Defense",
    category: "Security Engineering",
    branch: "placement_aptitude",
    branchBadge: "SECURITY",
    difficultyTier: "Advanced",
    activeBattlesCount: 94,
    questionCount: 5,
    description:
      "Salted password hashing, SQL injection mitigation, digital signatures, and Zero Trust.",
    tags: ["Zero Trust", "SQL Injection", "RSA Signing"],
  },

  // ── 5. Applied Sciences & Mathematics
  {
    id: "science_math",
    label: "Engineering Mathematics",
    category: "Applied Mathematics",
    branch: "applied_sciences",
    branchBadge: "MATH",
    difficultyTier: "Advanced",
    activeBattlesCount: 108,
    questionCount: 5,
    description:
      "Eigenvectors and eigenvalues, Bayes theorem, chain rule calculus, and singular matrices.",
    tags: ["Eigenvalues", "Bayes Theorem", "Matrix Rank"],
  },
  {
    id: "science",
    label: "Applied Physics & Technology",
    category: "Applied Sciences",
    branch: "applied_sciences",
    branchBadge: "PHYSICS",
    difficultyTier: "Intermediate",
    activeBattlesCount: 72,
    questionCount: 5,
    description:
      "Fundamental scientific reasoning, engineering equations, and computational logic.",
    tags: ["Applied Physics", "Scientific Logic", "Calculus"],
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
  uid?: string;
  photoURL?: string | null;
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
  {
    rank: 11,
    name: "Aditya Verma",
    campus: "IIT Madras",
    xp: 1040,
    battles: 52,
    winRate: 58,
    streak: 4,
    verified: true,
    topicDomain: "react",
  },
  {
    rank: 12,
    name: "Tanvi Deshmukh",
    campus: "IIT Kharagpur",
    xp: 980,
    battles: 49,
    winRate: 57,
    streak: 3,
    verified: true,
    topicDomain: "python",
  },
  {
    rank: 13,
    name: "Harsh Vardhan",
    campus: "BITS Goa",
    xp: 910,
    battles: 46,
    winRate: 56,
    streak: 3,
    verified: false,
    topicDomain: "algorithms",
  },
  {
    rank: 14,
    name: "Pooja Hegde",
    campus: "RVCE Bangalore",
    xp: 850,
    battles: 43,
    winRate: 55,
    streak: 3,
    verified: true,
    topicDomain: "javascript",
  },
  {
    rank: 15,
    name: "Nikhil Joshi",
    campus: "COEP Pune",
    xp: 790,
    battles: 40,
    winRate: 54,
    streak: 2,
    verified: false,
    topicDomain: "database",
  },
  {
    rank: 16,
    name: "Ishita Sen",
    campus: "Jadavpur University",
    xp: 730,
    battles: 37,
    winRate: 53,
    streak: 2,
    verified: true,
    topicDomain: "react",
  },
  {
    rank: 17,
    name: "Rahul Bansal",
    campus: "NSUT Delhi",
    xp: 680,
    battles: 35,
    winRate: 52,
    streak: 2,
    verified: false,
    topicDomain: "algorithms",
  },
  {
    rank: 18,
    name: "Shruti Iyer",
    campus: "IIIT Bangalore",
    xp: 630,
    battles: 32,
    winRate: 51,
    streak: 2,
    verified: true,
    topicDomain: "python",
  },
  {
    rank: 19,
    name: "Varun Chopra",
    campus: "PEC Chandigarh",
    xp: 590,
    battles: 30,
    winRate: 50,
    streak: 1,
    verified: false,
    topicDomain: "javascript",
  },
  {
    rank: 20,
    name: "Neha Kulkarni",
    campus: "VNIT Nagpur",
    xp: 550,
    battles: 28,
    winRate: 50,
    streak: 1,
    verified: true,
    topicDomain: "database",
  },
];

// ── Real-Time Multiplayer Room Models ────────────────────────────────────────

export type ArenaRoomStatus = "waiting" | "starting" | "active" | "completed";

export interface ArenaParticipant {
  uid: string;
  name: string;
  avatar?: string | null;
  campus?: string;
  isHost: boolean;
  score: number;
  streak: number;
  currentQ: number;
  answers: Array<{
    qIndex: number;
    selectedOption: number;
    isCorrect: boolean;
    timeTakenMs: number;
    points: number;
  }>;
  status: "joined" | "ready" | "in_quiz" | "finished";
  finishedAt?: number;
  updatedAt: number;
}

export interface ArenaRoomDoc {
  id: string; // e.g. "VS-8K49A"
  hostUid: string;
  hostName: string;
  topic: DomainType;
  topicLabel: string;
  maxPlayers: number; // 2 for 1v1, up to 5 for group
  status: ArenaRoomStatus;
  createdAt: number;
  startedAt?: number;
  questionIds?: string[];
  participants: Record<string, ArenaParticipant>;
}
