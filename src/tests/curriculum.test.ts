import { describe, it, expect } from "vitest";
import { detectDomain } from "@/lib/curriculumEngine";
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

  it("generates exactly 10 authentic Python questions for a Python class", async () => {
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
});
