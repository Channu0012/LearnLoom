// ---------------------------------------------------------------------------
// Streak & XP Gamification Engine (Duolingo-Grade Habit Defense)
// Drives daily user retention through streaks, XP, monthly shields, and weekly habit tracking.
// ---------------------------------------------------------------------------

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalXp: number;
  todayLessonsCompleted: number;
  streakShieldAvailable?: boolean;
  lastShieldUsedMonth?: string; // YYYY-MM
  shieldUsedRecently?: boolean;
  recentActiveDates?: string[]; // List of YYYY-MM-DD in the last 14 days
}

const STORAGE_KEY = "veyskill_streak_data_v1";
const LEGACY_STORAGE_KEY = "learnloom_streak_data_v1";

const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  bestStreak: 0,
  lastActiveDate: "",
  totalXp: 0,
  todayLessonsCompleted: 0,
  streakShieldAvailable: true,
  lastShieldUsedMonth: "",
  shieldUsedRecently: false,
  recentActiveDates: [],
};

export function getLocalDateString(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getCurrentMonthString(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateString(d);
}

function getDaysDiff(dateStr1: string, dateStr2: string): number {
  try {
    const d1 = new Date(dateStr1 + "T00:00:00");
    const d2 = new Date(dateStr2 + "T00:00:00");
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 999;
  }
}

export function getStreakData(): StreakData {
  if (typeof window === "undefined") return DEFAULT_STREAK;
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return DEFAULT_STREAK;
    const parsed = JSON.parse(raw) as StreakData;

    const today = getLocalDateString();
    const yesterday = getYesterdayDateString();
    const currentMonth = getCurrentMonthString();

    const isShieldAvailable = parsed.lastShieldUsedMonth !== currentMonth;

    if (
      parsed.lastActiveDate &&
      parsed.lastActiveDate !== today &&
      parsed.lastActiveDate !== yesterday
    ) {
      // User missed at least yesterday. Check if missed exactly 1 day and can use monthly shield
      const daysDiff = getDaysDiff(parsed.lastActiveDate, today);

      if (daysDiff === 2 && isShieldAvailable && (parsed.currentStreak || 0) > 0) {
        // Automatically activate the 1 free monthly Streak Shield!
        const protectedData: StreakData = {
          ...parsed,
          lastActiveDate: yesterday, // Preserved via shield
          lastShieldUsedMonth: currentMonth,
          shieldUsedRecently: true,
          streakShieldAvailable: false,
          todayLessonsCompleted: 0,
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(protectedData));
        } catch {}
        return protectedData;
      }

      // Missed more than 1 day or shield already spent this month — streak resets
      return {
        ...parsed,
        currentStreak: 0,
        todayLessonsCompleted: 0,
        streakShieldAvailable: isShieldAvailable,
        shieldUsedRecently: false,
      };
    }

    if (parsed.lastActiveDate !== today) {
      return {
        ...parsed,
        todayLessonsCompleted: 0,
        streakShieldAvailable: isShieldAvailable,
        shieldUsedRecently: false,
      };
    }

    return {
      ...parsed,
      streakShieldAvailable: isShieldAvailable,
    };
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
  const currentMonth = getCurrentMonthString();

  let newStreak = current.currentStreak;
  let streakIncreased = false;
  let isFirstToday = false;

  if (current.lastActiveDate === today) {
    // Already active today — maintain streak, add XP
    streakIncreased = false;
    isFirstToday = false;
  } else if (current.lastActiveDate === yesterday) {
    // Active yesterday (or shielded yesterday) — streak increments!
    newStreak = (current.currentStreak || 0) + 1;
    streakIncreased = true;
    isFirstToday = true;
  } else {
    // Missed yesterday or new user — streak starts at 1
    newStreak = 1;
    streakIncreased = true;
    isFirstToday = true;
  }

  // Update recent active dates (keep last 14 days)
  const existingRecent = Array.isArray(current.recentActiveDates) ? current.recentActiveDates : [];
  const updatedRecent = Array.from(new Set([...existingRecent, today])).slice(-14);

  const updated: StreakData = {
    currentStreak: newStreak,
    bestStreak: Math.max(current.bestStreak, newStreak),
    lastActiveDate: today,
    totalXp: (current.totalXp || 0) + xpEarned,
    todayLessonsCompleted:
      (current.lastActiveDate === today ? current.todayLessonsCompleted : 0) + 1,
    lastShieldUsedMonth: current.lastShieldUsedMonth,
    streakShieldAvailable: current.lastShieldUsedMonth !== currentMonth,
    shieldUsedRecently: false,
    recentActiveDates: updatedRecent,
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
