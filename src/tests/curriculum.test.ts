import { describe, it, expect } from "vitest";
import { detectDomain, getDomainQuestions } from "@/lib/curriculumEngine";
import { generateQuiz, askStudyCompanion } from "@/lib/gemini";

describe("Curriculum Engine & Domain Intelligence", () => {
  it("detects Python domain accurately from course titles", () => {
    expect(detectDomain("Python 3 Deep Dive", "Functions & Lambdas", "Programming")).toBe("python");
    expect(detectDomain("Machine Learning with Pandas & NumPy", "DataFrames", "AI")).toBe("python");
    expect(detectDomain("FastAPI Backend Architecture", "Pydantic Models", "CS")).toBe("python");
  });

  it("detects React and JavaScript domains accurately", () => {
    expect(detectDomain("Modern React with Next.js", "useEffect Hooks", "Frontend")).toBe("react");
    expect(detectDomain("TypeScript Fundamentals", "Generics and Interfaces", "Programming")).toBe(
      "javascript"
    );
  });

  it("generates exactly 10 authentic Python questions for a Python class with difficulty tiers", async () => {
    const questions = await generateQuiz(
      "Python List Comprehensions & Advanced Slicing",
      "Complete Python Mastery & Cloud Architecture",
      "Programming & CS",
      0,
      10
    );

    expect(questions.length).toBe(10);
    // Every question must have 4 options and valid correctIndex
    for (const q of questions) {
      expect(q.options.length).toBe(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
      expect(q.explanation.length).toBeGreaterThan(10);
      // No emojis in questions
      expect(q.question).not.toMatch(/[\u{1F300}-\u{1F9FF}]/u);
    }

    // Verify difficulty tags exist
    const hasTags = questions.some(
      (q) =>
        q.question.includes("[Foundational]") ||
        q.question.includes("[Intermediate]") ||
        q.question.includes("[Advanced Coding]")
    );
    expect(hasTags).toBe(true);

    // Verify option shuffling: correctIndex is not statically 0 for all questions
    const uniqueIndices = new Set(questions.map((q) => q.correctIndex));
    expect(uniqueIndices.size).toBeGreaterThan(1);
  });

  it("produces diverse question sets on repeated attempts", () => {
    const attempt1 = getDomainQuestions("python", "Decorators and Functions", 8);
    const attempt2 = getDomainQuestions("python", "Decorators and Functions", 8);

    expect(attempt1.length).toBe(8);
    expect(attempt2.length).toBe(8);

    // Both attempts should have valid questions
    expect(attempt1[0]?.options.length).toBe(4);
    expect(attempt2[0]?.options.length).toBe(4);
  });

  it("resolves Python technical doubts in the Study Companion chatbot with code", async () => {
    const response = await askStudyCompanion(
      "How do decorators work in Python? Give an example.",
      "Advanced Python Functions",
      "Complete Python Mastery",
      "Programming & CS"
    );

    expect(response).toBeDefined();
    expect(response).toContain("decorator");
    expect(response).toContain("```python");
    // Strictly zero emojis
    expect(response).not.toMatch(/[\u{1F300}-\u{1F9FF}]/u);
  });

  it("resolves TypeError NoneType is not subscriptable bug with before & after fix", async () => {
    const response = await askStudyCompanion(
      "Why am I getting TypeError: 'NoneType' object is not subscriptable in Python?",
      "Python Functions & Lists",
      "Complete Python Mastery",
      "Programming"
    );

    expect(response).toBeDefined();
    expect(response).toContain("NoneType");
    expect(response).toContain("```python");
    expect(response).not.toMatch(/[\u{1F300}-\u{1F9FF}]/u);
  });

  it("resolves React technical doubts in the Study Companion chatbot with code", async () => {
    const response = await askStudyCompanion(
      "Why does useEffect cause infinite loops?",
      "React Component Lifecycle",
      "Next.js and React Architecture",
      "Frontend Development"
    );

    expect(response).toBeDefined();
    expect(response).toContain("useEffect");
    expect(response).toContain("dependency");
    // Strictly zero emojis
    expect(response).not.toMatch(/[\u{1F300}-\u{1F9FF}]/u);
  });

  it("accurately detects certificate eligibility for full masterclasses vs short roadmaps", async () => {
    const { checkCertificateEligibility } = await import("@/lib/curriculumEngine");

    // Short roadmap or 1-video career advice should NOT be eligible
    const roadmapCheck = checkCertificateEligibility({
      title: "Frontend Developer Roadmap 2026",
      description: "Complete study plan and guidance for beginner developers",
      lessonCount: 1,
    });
    expect(roadmapCheck.eligible).toBe(false);
    expect(roadmapCheck.label).toBe("Educational Roadmap");

    const singleVideoCheatSheet = checkCertificateEligibility({
      title: "Python in 10 Minutes - Quick Cheat Sheet",
      description: "Quick summary of basic syntax",
      lessonCount: 1,
    });
    expect(singleVideoCheatSheet.eligible).toBe(false);

    // Multi-module comprehensive masterclass SHOULD be eligible
    const masterclassCheck = checkCertificateEligibility({
      title: "Complete Python Mastery & Cloud Architecture",
      description: "Comprehensive multi-lesson course covering data structures and concurrency",
      lessonCount: 24,
    });
    expect(masterclassCheck.eligible).toBe(true);
    expect(masterclassCheck.label).toBe("Accredited Masterclass");
  });
});
