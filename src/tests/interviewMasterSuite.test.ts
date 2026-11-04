import { describe, it, expect } from "vitest";
import {
  CHALLENGE_PROBLEMS,
  COMPANY_TRACKS,
  SYSTEM_DESIGN_BLUEPRINTS,
  getChallengeForConfig,
  calculateHiringVerdict,
  buildInterviewerSystemPrompt,
  buildScorecardPrompt,
  type InterviewConfig,
} from "@/lib/interview";
import { runCodeWithTestCases } from "@/lib/codeRunner";

describe("Silicon Valley Interview System — Master Tester Suite", () => {
  describe("Company Calibration Tracks", () => {
    it("has complete configuration for all 5 Silicon Valley tracks", () => {
      const tracks = ["google", "stripe", "amazon", "netflix", "yc"] as const;
      for (const trackId of tracks) {
        const track = COMPANY_TRACKS[trackId];
        expect(track).toBeDefined();
        expect(track.name).toBeTruthy();
        expect(track.companyBar).toBeTruthy();
        expect(track.interviewerName).toBeTruthy();
        expect(track.interviewerTitle).toBeTruthy();
        expect(track.rubricFocus.length).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe("Challenge Problem Bank & Optimal Benchmark Verification", () => {
    it("contains curated challenges for all engineering disciplines", () => {
      expect(CHALLENGE_PROBLEMS.length).toBeGreaterThanOrEqual(7);
      const roles = CHALLENGE_PROBLEMS.map((p) => p.role);
      expect(roles).toContain("frontend");
      expect(roles).toContain("backend");
      expect(roles).toContain("fullstack");
      expect(roles).toContain("system-design");
      expect(roles).toContain("data-science");
      expect(roles).toContain("devops");
      expect(roles).toContain("mobile");
    });

    it("verifies getChallengeForConfig returns appropriate challenge for config", () => {
      const feConfig: InterviewConfig = {
        role: "frontend",
        level: "senior",
        topics: ["React"],
        duration: 30,
        language: "en",
      };
      const feChallenge = getChallengeForConfig(feConfig);
      expect(feChallenge.role).toBe("frontend");
      expect(feChallenge.functionName).toBe("createDebounce");

      const beConfig: InterviewConfig = {
        role: "backend",
        level: "senior",
        topics: ["Node.js"],
        duration: 30,
        language: "en",
      };
      const beChallenge = getChallengeForConfig(beConfig);
      expect(beChallenge.role).toBe("backend");
      expect(beChallenge.functionName).toBe("checkRateLimit");
    });

    it("executes backend rate limiter optimal solution and passes all test cases", async () => {
      const problem = CHALLENGE_PROBLEMS.find(
        (p) => p.id === "backend-sliding-window-rate-limiter"
      )!;
      expect(problem).toBeDefined();

      const report = await runCodeWithTestCases(
        problem.optimalSolution,
        problem.functionName,
        problem.testCases
      );

      expect(report.success).toBe(true);
      expect(report.allPassed).toBe(true);
      expect(report.passedCount).toBe(problem.testCases.length);
    });

    it("executes system design consistent hashing optimal solution and passes all test cases", async () => {
      const problem = CHALLENGE_PROBLEMS.find((p) => p.id === "system-design-consistent-hashing")!;
      expect(problem).toBeDefined();

      const report = await runCodeWithTestCases(
        problem.optimalSolution,
        problem.functionName,
        problem.testCases
      );

      expect(report.success).toBe(true);
      expect(report.allPassed).toBe(true);
      expect(report.passedCount).toBe(problem.testCases.length);
    });

    it("executes data science vector cosine similarity optimal solution and passes test cases", async () => {
      const problem = CHALLENGE_PROBLEMS.find((p) => p.id === "data-science-cosine-similarity")!;
      expect(problem).toBeDefined();

      const report = await runCodeWithTestCases(
        problem.optimalSolution,
        problem.functionName,
        problem.testCases
      );

      expect(report.success).toBe(true);
      expect(report.allPassed).toBe(true);
      expect(report.passedCount).toBe(problem.testCases.length);
    });

    it("executes mobile offline event sync queue optimal solution and passes test cases", async () => {
      const problem = CHALLENGE_PROBLEMS.find((p) => p.id === "mobile-offline-event-sync")!;
      expect(problem).toBeDefined();

      const report = await runCodeWithTestCases(
        problem.optimalSolution,
        problem.functionName,
        problem.testCases
      );

      expect(report.success).toBe(true);
      expect(report.allPassed).toBe(true);
      expect(report.passedCount).toBe(problem.testCases.length);
    });
  });

  describe("System Design Blueprints", () => {
    it("provides complete blueprints with scale estimates and default nodes", () => {
      expect(SYSTEM_DESIGN_BLUEPRINTS["url-shortener"]).toBeDefined();
      expect(SYSTEM_DESIGN_BLUEPRINTS["rate-limiter"]).toBeDefined();

      const urlShortener = SYSTEM_DESIGN_BLUEPRINTS["url-shortener"];
      expect(urlShortener.defaultNodes.length).toBeGreaterThanOrEqual(4);
      expect(urlShortener.defaultEdges.length).toBeGreaterThanOrEqual(3);
      expect(urlShortener.capacityChecklist.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Hiring Committee Verdicts", () => {
    it("maps scores to accurate committee verdicts", () => {
      expect(calculateHiringVerdict(95)).toBe("STRONG_HIRE");
      expect(calculateHiringVerdict(85)).toBe("HIRE");
      expect(calculateHiringVerdict(70)).toBe("LEAN_HIRE");
      expect(calculateHiringVerdict(55)).toBe("LEAN_NO");
      expect(calculateHiringVerdict(30)).toBe("STRONG_NO");
    });
  });

  describe("Prompt Orchestration & Context Injection", () => {
    it("injects company track persona and challenge expectations into system prompt", () => {
      const config: InterviewConfig = {
        role: "backend",
        level: "senior",
        topics: ["Distributed Systems", "Caching"],
        duration: 45,
        language: "en",
        companyTrack: "stripe",
      };
      const challenge = getChallengeForConfig(config);
      const prompt = buildInterviewerSystemPrompt(config, challenge);

      expect(prompt).toContain("Stripe");
      expect(prompt).toContain("Elena Rostova");
      expect(prompt).toContain("checkRateLimit");
      expect(prompt).toContain("ACTIVE CHALLENGE PROBLEM");
    });

    it("injects candidate final code and benchmark solution into scorecard prompt", () => {
      const config: InterviewConfig = {
        role: "backend",
        level: "senior",
        topics: ["Node.js"],
        duration: 30,
        language: "en",
        companyTrack: "google",
      };
      const challenge = getChallengeForConfig(config);
      const messages = [
        {
          id: "1",
          role: "interviewer" as const,
          content: "Explain sliding window.",
          timestamp: 1000,
          phase: "intro" as const,
        },
        {
          id: "2",
          role: "candidate" as const,
          content: "We filter timestamps.",
          timestamp: 2000,
          phase: "technical" as const,
        },
      ];
      const candidateCode = "function checkRateLimit() { return { allowed: true }; }";

      const prompt = buildScorecardPrompt(config, messages, candidateCode, challenge);

      expect(prompt).toContain("Google");
      expect(prompt).toContain(
        "Senior Engineering Manager and Lead of the FAANG / Silicon Valley Hiring Committee"
      );
      expect(prompt).toContain("function checkRateLimit()");
      expect(prompt).toContain(challenge.title);
    });
  });
});
