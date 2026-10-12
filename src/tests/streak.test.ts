import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import {
  getStreakData,
  recordStudyActivity,
  getRankBadge,
  getLocalDateString,
  getCurrentMonthString,
} from "../lib/streak";

class MockStorage {
  private store: Record<string, string> = {};
  get length() {
    return Object.keys(this.store).length;
  }
  clear() {
    this.store = {};
  }
  getItem(key: string) {
    return this.store[key] ?? null;
  }
  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }
  removeItem(key: string) {
    delete this.store[key];
  }
  key(index: number) {
    return Object.keys(this.store)[index] ?? null;
  }
}

describe("Streak & XP Gamification Engine with Shield Defense", () => {
  beforeAll(() => {
    const mock = new MockStorage();
    Object.defineProperty(globalThis, "localStorage", {
      value: mock,
      writable: true,
    });
    // Ensure window.dispatchEvent does not crash in test
    if (typeof (globalThis as any).window === "undefined") {
      (globalThis as any).window = {
        dispatchEvent: () => true,
      };
    } else {
      (globalThis as any).window.dispatchEvent = () => true;
    }
  });

  beforeEach(() => {
    localStorage.clear();
  });

  it("returns default streak data when storage is empty", () => {
    const data = getStreakData();
    expect(data.currentStreak).toBe(0);
    expect(data.bestStreak).toBe(0);
    expect(data.totalXp).toBe(0);
    expect(data.streakShieldAvailable).toBe(true);
  });

  it("records study activity and increments streak and XP", () => {
    const res = recordStudyActivity(25);
    expect(res.streak).toBe(1);
    expect(res.streakIncreased).toBe(true);
    expect(res.xpGained).toBe(25);
    expect(res.totalXp).toBe(25);

    const updated = getStreakData();
    expect(updated.currentStreak).toBe(1);
    expect(updated.totalXp).toBe(25);
    expect(updated.todayLessonsCompleted).toBe(1);
    expect(updated.recentActiveDates).toContain(getLocalDateString());
  });

  it("does not increment streak twice on the same day", () => {
    recordStudyActivity(10);
    const second = recordStudyActivity(15);

    expect(second.streak).toBe(1);
    expect(second.streakIncreased).toBe(false);
    expect(second.totalXp).toBe(25);

    const updated = getStreakData();
    expect(updated.todayLessonsCompleted).toBe(2);
  });

  it("activates monthly streak shield to protect streak when 1 day was missed", () => {
    const today = new Date();
    // 2 days ago
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(today.getDate() - 2);
    const twoDaysAgoStr = getLocalDateString(twoDaysAgo);

    const initialStreakData = {
      currentStreak: 10,
      bestStreak: 10,
      lastActiveDate: twoDaysAgoStr,
      totalXp: 500,
      todayLessonsCompleted: 1,
      lastShieldUsedMonth: "", // Unused this month
      streakShieldAvailable: true,
      recentActiveDates: [twoDaysAgoStr],
    };

    localStorage.setItem("veyskill_streak_data_v1", JSON.stringify(initialStreakData));

    // Calling getStreakData() should deploy the shield!
    const evaluated = getStreakData();
    expect(evaluated.currentStreak).toBe(10); // Streak preserved!
    expect(evaluated.shieldUsedRecently).toBe(true);
    expect(evaluated.streakShieldAvailable).toBe(false);
    expect(evaluated.lastShieldUsedMonth).toBe(getCurrentMonthString());
  });

  it("maps rank badges correctly according to XP thresholds", () => {
    expect(getRankBadge(50).rank).toBe("Novice");
    expect(getRankBadge(250).rank).toBe("Apprentice");
    expect(getRankBadge(600).rank).toBe("Expert");
    expect(getRankBadge(1200).rank).toBe("Master");
    expect(getRankBadge(2500).rank).toBe("Grandmaster");
  });
});
