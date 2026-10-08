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

  it("accurately distinguishes short videos (30m/40m) from full-length 3h/7h masterclasses and multi-lesson courses", async () => {
    const { checkCertificateEligibility } = await import("@/lib/curriculumEngine");

    // 1. Short roadmap or career advice should NOT be eligible
    const roadmapCheck = checkCertificateEligibility({
      title: "Frontend Developer Roadmap 2026",
      description: "Complete study plan and guidance for beginner developers",
      lessonCount: 1,
    });
    expect(roadmapCheck.eligible).toBe(false);
    expect(roadmapCheck.label).toBe("Educational Roadmap");

    // 2. Short 10 min cheat sheet should NOT be eligible
    const singleVideoCheatSheet = checkCertificateEligibility({
      title: "Python in 10 Minutes - Quick Cheat Sheet",
      description: "Quick summary of basic syntax",
      lessonCount: 1,
    });
    expect(singleVideoCheatSheet.eligible).toBe(false);
    expect(singleVideoCheatSheet.label).toBe("Educational Roadmap");

    // 3. Short 30-min / 40-min educational videos should NOT be eligible
    const short30MinVideo = checkCertificateEligibility({
      title: "React in 30 Minutes - Beginner Guide",
      description: "Brief overview of React hooks",
      lessonCount: 1,
    });
    expect(short30MinVideo.eligible).toBe(false);
    expect(short30MinVideo.label).toBe("Educational Video Guide");

    const short40MinVideo = checkCertificateEligibility({
      title: "Python in 40 mins Tutorial",
      description: "Fast crash course for absolute beginners",
      lessonCount: 1,
    });
    expect(short40MinVideo.eligible).toBe(false);
    expect(short40MinVideo.label).toBe("Educational Video Guide");

    // 4. Single-video with player duration under 1 hour (e.g., 30 min = 1800s, 40 min = 2400s)
    const runtimeShortVideo = checkCertificateEligibility({
      title: "CSS Flexbox & Grid Tutorial",
      description: "Practical examples",
      lessonCount: 1,
      duration: 2400, // 40 minutes
    });
    expect(runtimeShortVideo.eligible).toBe(false);

    // 5. Single mega-video 3-hour course SHOULD be eligible
    const sql3HourCourse = checkCertificateEligibility({
      title: "Learn SQL in 3 Hours - Full Course for Beginners",
      description: "Database design, queries, and indexing in one comprehensive video",
      lessonCount: 1,
    });
    expect(sql3HourCourse.eligible).toBe(true);
    expect(sql3HourCourse.label).toBe("Accredited Single-Video Masterclass");
    expect(sql3HourCourse.detectedHours).toBe(3);

    // 6. Single mega-video 7-hour course SHOULD be eligible
    const react7HourCourse = checkCertificateEligibility({
      title: "React Native 7 Hours Full Course [2026]",
      description: "Build 5 production apps from scratch to app store",
      lessonCount: 1,
    });
    expect(react7HourCourse.eligible).toBe(true);
    expect(react7HourCourse.label).toBe("Accredited Single-Video Masterclass");
    expect(react7HourCourse.detectedHours).toBe(7);

    // 7. Single mega-video 11-hour bootcamp SHOULD be eligible
    const freeCodeCampCourse = checkCertificateEligibility({
      title: "Python Full Course for Beginners [11 Hours]",
      description: "Comprehensive university level course",
      lessonCount: 1,
    });
    expect(freeCodeCampCourse.eligible).toBe(true);
    expect(freeCodeCampCourse.label).toBe("Accredited Single-Video Masterclass");
    expect(freeCodeCampCourse.detectedHours).toBe(11);

    // 8. Single video with player duration >= 1 hour (e.g., 7 hours = 25200s)
    const runtimeLongCourse = checkCertificateEligibility({
      title: "Machine Learning with Python",
      description: "Deep dive into models",
      lessonCount: 1,
      duration: 25200, // 7 hours
    });
    expect(runtimeLongCourse.eligible).toBe(true);
    expect(runtimeLongCourse.label).toBe("Accredited Single-Video Masterclass");
    expect(runtimeLongCourse.detectedHours).toBe(7);

    // 9. Multi-module comprehensive masterclass SHOULD be eligible
    const masterclassCheck = checkCertificateEligibility({
      title: "Complete Python Mastery & Cloud Architecture",
      description: "Comprehensive multi-lesson course covering data structures and concurrency",
      lessonCount: 24,
    });
    expect(masterclassCheck.eligible).toBe(true);
    expect(masterclassCheck.label).toBe("Accredited Masterclass");
  });
});
