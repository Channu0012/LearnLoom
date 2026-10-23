import { describe, it, expect } from "vitest";
import { RANK_TIERS, getRankTier, BATTLE_TOPICS, LEADERBOARD_DATA } from "@/lib/arena";
import { getDomainQuestions } from "@/lib/curriculumEngine";

describe("Arena — Rank Tiers & Qualifications", () => {
  it("defines the 7 standard rank tiers in descending XP order", () => {
    expect(RANK_TIERS.length).toBe(7);
    expect(RANK_TIERS[0]?.name).toBe("Conqueror");
    expect(RANK_TIERS[RANK_TIERS.length - 1]?.name).toBe("Bronze");
  });

  it("correctly resolves student rank tier from XP score", () => {
    expect(getRankTier(5500).name).toBe("Conqueror");
    expect(getRankTier(3200).name).toBe("Grandmaster");
    expect(getRankTier(2100).name).toBe("Master");
    expect(getRankTier(1300).name).toBe("Diamond");
    expect(getRankTier(750).name).toBe("Gold");
    expect(getRankTier(250).name).toBe("Silver");
    expect(getRankTier(50).name).toBe("Bronze");
    expect(getRankTier(0).name).toBe("Bronze");
  });
});

describe("Arena — Battle Engine & Question Sampling", () => {
  it("provides valid technical battle topics with 5 questions per duel", () => {
    expect(BATTLE_TOPICS.length).toBeGreaterThanOrEqual(4);
    for (const topic of BATTLE_TOPICS) {
      expect(topic.questionCount).toBe(5);
      expect(topic.label.length).toBeGreaterThan(0);
      expect(topic.description.length).toBeGreaterThan(0);
    }
  });

  it("generates authentic, non-empty questions for each battle topic domain", () => {
    for (const topic of BATTLE_TOPICS) {
      const questions = getDomainQuestions(topic.id, "1v1 Duel", 5);
      expect(questions.length).toBe(5);
      for (const q of questions) {
        expect(q.question.length).toBeGreaterThan(10);
        expect(q.options.length).toBe(4);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(4);
        expect(q.explanation.length).toBeGreaterThan(0);

        // Verify zero emojis in technical assessment content
        const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;
        expect(emojiRegex.test(q.question)).toBe(false);
      }
    }
  });

  it("verifies leaderboard rankings integrity and verified badges", () => {
    expect(LEADERBOARD_DATA.length).toBe(10);
    expect(LEADERBOARD_DATA[0]?.rank).toBe(1);
    expect(LEADERBOARD_DATA[0]?.name).toBe("Aarav Sharma");
    // All win rates should be between 50 and 100
    for (const student of LEADERBOARD_DATA) {
      expect(student.winRate).toBeGreaterThanOrEqual(50);
      expect(student.winRate).toBeLessThanOrEqual(100);
      expect(student.streak).toBeGreaterThan(0);
    }
  });

  it("verifies firestore doubt helpers are exported as functions", async () => {
    const firestore = await import("@/lib/firestore");
    expect(typeof firestore.getDoubtsFeed).toBe("function");
    expect(typeof firestore.getDoubtsByUser).toBe("function");
    expect(typeof firestore.getDoubtsForCompletedCourses).toBe("function");
    expect(typeof firestore.getUserEnrolledCourses).toBe("function");
    expect(typeof firestore.getHelperScore).toBe("function");
  });
});
