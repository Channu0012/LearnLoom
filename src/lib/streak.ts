// ---------------------------------------------------------------------------
// Streak & XP Gamification Engine
// Drives daily user retention through streaks, XP, and milestone badges.
// ---------------------------------------------------------------------------

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalXp: number;
  todayLessonsCompleted: number;
}

const STORAGE_KEY = "veyskill_streak_data_v1";
const LEGACY_STORAGE_KEY = "learnloom_streak_data_v1";

const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  bestStreak: 0,
  lastActiveDate: "",
  totalXp: 0,
  todayLessonsCompleted: 0,
};

function getLocalDateString(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateString(d);
}

export function getStreakData(): StreakData {
  if (typeof window === "undefined") return DEFAULT_STREAK;
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return DEFAULT_STREAK;
    const parsed = JSON.parse(raw) as StreakData;

    // Check if streak broke (more than 1 day missed)
    const today = getLocalDateString();
    const yesterday = getYesterdayDateString();

    if (
      parsed.lastActiveDate &&
      parsed.lastActiveDate !== today &&
      parsed.lastActiveDate !== yesterday
    ) {
      // Missed yesterday — streak resets to 0 until they study today
      return {
        ...parsed,
        currentStreak: 0,
        todayLessonsCompleted: 0,
      };
    }

    if (parsed.lastActiveDate !== today) {
      return {
        ...parsed,
        todayLessonsCompleted: 0,
      };
    }

    return parsed;
  } catch {
    return DEFAULT_STREAK;
  }
}

export interface ActivityResult {
  streak: number;
  streakIncreased: boolean;
  xpGained: number;
  totalXp: number;
  isFirstToday: boolean;
}

export function recordStudyActivity(xpEarned = 10): ActivityResult {
  if (typeof window === "undefined") {
    return {
      streak: 1,
      streakIncreased: true,
      xpGained: xpEarned,
      totalXp: xpEarned,
      isFirstToday: true,
    };
  }

  const current = getStreakData();
  const today = getLocalDateString();
  const yesterday = getYesterdayDateString();

  let newStreak = current.currentStreak;
  let streakIncreased = false;
  let isFirstToday = false;

  if (current.lastActiveDate === today) {
    // Already active today — maintain streak, add XP
    streakIncreased = false;
    isFirstToday = false;
  } else if (current.lastActiveDate === yesterday) {
    // Active yesterday — streak increments!
    newStreak = (current.currentStreak || 0) + 1;
    streakIncreased = true;
    isFirstToday = true;
  } else {
    // Missed yesterday or new user — streak starts at 1
    newStreak = 1;
    streakIncreased = true;
    isFirstToday = true;
  }

  const updated: StreakData = {
    currentStreak: newStreak,
    bestStreak: Math.max(current.bestStreak, newStreak),
    lastActiveDate: today,
    totalXp: (current.totalXp || 0) + xpEarned,
    todayLessonsCompleted:
      (current.lastActiveDate === today ? current.todayLessonsCompleted : 0) + 1,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Dispatch event so all components update reactively
    window.dispatchEvent(new CustomEvent("veyskill:streak-updated", { detail: updated }));
  } catch {
    // Storage quota or restricted environment
  }

  return {
    streak: updated.currentStreak,
    streakIncreased,
    xpGained: xpEarned,
    totalXp: updated.totalXp,
    isFirstToday,
  };
}

export function getRankBadge(xp: number): { rank: string; color: string } {
  if (xp >= 2000) return { rank: "Grandmaster", color: "text-purple-600 dark:text-purple-400" };
  if (xp >= 1000) return { rank: "Master", color: "text-amber-600 dark:text-amber-400" };
  if (xp >= 500) return { rank: "Expert", color: "text-blue-600 dark:text-blue-400" };
  if (xp >= 200) return { rank: "Apprentice", color: "text-emerald-600 dark:text-emerald-400" };
  return { rank: "Novice", color: "text-muted-foreground" };
}
