import { describe, it, expect } from "vitest";
import {
  calculateGrade,
  calculateFaangReadiness,
  getPhaseForQuestion,
  generateSessionId,
  buildInterviewerSystemPrompt,
  buildScorecardPrompt,
  ROLE_LABELS,
  LEVEL_LABELS,
  ROLE_TOPICS,
  type InterviewConfig,
  type InterviewRole,
  type InterviewMessage,
} from "@/lib/interview";

describe("AI Mock Interview Engine", () => {
  describe("Grade Calculation", () => {
    it("returns 'S' for score >= 95", () => {
      expect(calculateGrade(95)).toBe("S");
      expect(calculateGrade(100)).toBe("S");
    });

    it("returns 'A' for 80 <= score < 95", () => {
      expect(calculateGrade(80)).toBe("A");
      expect(calculateGrade(94)).toBe("A");
    });

    it("returns 'B' for 65 <= score < 80", () => {
      expect(calculateGrade(65)).toBe("B");
      expect(calculateGrade(79)).toBe("B");
    });

    it("returns 'C' for 50 <= score < 65", () => {
      expect(calculateGrade(50)).toBe("C");
      expect(calculateGrade(64)).toBe("C");
    });

    it("returns 'D' for 35 <= score < 50", () => {
      expect(calculateGrade(35)).toBe("D");
      expect(calculateGrade(49)).toBe("D");
    });

    it("returns 'F' for score < 35", () => {
      expect(calculateGrade(0)).toBe("F");
      expect(calculateGrade(34)).toBe("F");
    });
  });

  describe("FAANG Readiness Calculation", () => {
    it("returns 'Ready' for score >= 85", () => {
      expect(calculateFaangReadiness(85)).toBe("Ready");
      expect(calculateFaangReadiness(100)).toBe("Ready");
    });

    it("returns 'Almost Ready' for 70 <= score < 85", () => {
      expect(calculateFaangReadiness(70)).toBe("Almost Ready");
      expect(calculateFaangReadiness(84)).toBe("Almost Ready");
    });

    it("returns 'Needs Work' for 50 <= score < 70", () => {
      expect(calculateFaangReadiness(50)).toBe("Needs Work");
      expect(calculateFaangReadiness(69)).toBe("Needs Work");
    });

    it("returns 'Not Ready' for score < 50", () => {
      expect(calculateFaangReadiness(0)).toBe("Not Ready");
      expect(calculateFaangReadiness(49)).toBe("Not Ready");
    });
  });

  describe("Phase Progression", () => {
    it("starts with intro for question 0", () => {
      expect(getPhaseForQuestion(0, 10)).toBe("intro");
    });

    it("transitions through warmup, technical, deep-dive, system-design, and closing", () => {
      expect(getPhaseForQuestion(1, 10)).toBe("warmup"); // 1/10 = 0.1 (<0.15)
      expect(getPhaseForQuestion(3, 10)).toBe("technical"); // 3/10 = 0.3 (<0.5)
      expect(getPhaseForQuestion(6, 10)).toBe("deep-dive"); // 6/10 = 0.6 (<0.7)
      expect(getPhaseForQuestion(8, 10)).toBe("system-design"); // 8/10 = 0.8 (<0.85)
      expect(getPhaseForQuestion(9, 10)).toBe("behavioral"); // 9/10 = 0.9 (<0.95)
      expect(getPhaseForQuestion(10, 10)).toBe("closing");
    });
  });

  describe("Session ID Generation", () => {
    it("generates a session ID with iv_ prefix and unique random string", () => {
      const id1 = generateSessionId();
      const id2 = generateSessionId();
      expect(id1.startsWith("iv_")).toBe(true);
      expect(id2.startsWith("iv_")).toBe(true);
      expect(id1).not.toBe(id2);
    });
  });

  describe("Role & Level Metadata", () => {
    const roles: InterviewRole[] = [
      "frontend",
      "backend",
      "fullstack",
      "data-science",
      "devops",
      "mobile",
      "system-design",
    ];

    it("has human-readable labels for all supported roles", () => {
      roles.forEach((role) => {
        expect(ROLE_LABELS[role]).toBeDefined();
        expect(typeof ROLE_LABELS[role]).toBe("string");
        expect(ROLE_LABELS[role].length).toBeGreaterThan(0);
      });
    });

    it("has topics configured for each role", () => {
      roles.forEach((role) => {
        expect(ROLE_TOPICS[role]).toBeDefined();
        expect(Array.isArray(ROLE_TOPICS[role])).toBe(true);
        expect(ROLE_TOPICS[role].length).toBeGreaterThanOrEqual(8);
      });
    });

    it("has labels for all difficulty levels", () => {
      expect(LEVEL_LABELS.junior).toContain("Junior");
      expect(LEVEL_LABELS.mid).toContain("Mid-Level");
      expect(LEVEL_LABELS.senior).toContain("Senior");
      expect(LEVEL_LABELS.staff).toContain("Staff");
    });
  });

  describe("Prompt Builders", () => {
    const mockConfig: InterviewConfig = {
      role: "backend",
      level: "senior",
      topics: ["Node.js", "Databases", "Distributed Systems"],
      duration: 30,
      language: "en",
    };

    it("builds a system prompt including role, level, topics, and rules", () => {
      const prompt = buildInterviewerSystemPrompt(mockConfig);
      expect(prompt).toContain(ROLE_LABELS.backend);
      expect(prompt).toContain(LEVEL_LABELS.senior);
      expect(prompt).toContain("Node.js");
      expect(prompt).toContain("Databases");
      expect(prompt).toContain("30 minutes");
      expect(prompt).toContain("NEVER break character");
      expect(prompt).toContain("No emojis");
    });

    it("builds a scorecard prompt with transcript and JSON format requirements", () => {
      const mockMessages: InterviewMessage[] = [
        {
          id: "1",
          role: "interviewer",
          content: "Explain database indexing in PostgreSQL.",
          timestamp: 1000,
          phase: "technical",
        },
        {
          id: "2",
          role: "candidate",
          content:
            "PostgreSQL uses B-Tree indexes by default which provide O(log n) lookups. For full-text search we use GIN indexes.",
          timestamp: 2000,
          phase: "technical",
        },
      ];

      const prompt = buildScorecardPrompt(mockConfig, mockMessages);
      expect(prompt).toContain("Senior Engineering Manager");
      expect(prompt).toContain("Explain database indexing");
      expect(prompt).toContain("PostgreSQL uses B-Tree indexes");
      expect(prompt).toContain('"overallScore"');
      expect(prompt).toContain('"categories"');
      expect(prompt).toContain('"topStrengths"');
      expect(prompt).toContain('"criticalImprovements"');
    });
  });
});
