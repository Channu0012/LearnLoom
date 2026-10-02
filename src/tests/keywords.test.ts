import { describe, it, expect } from "vitest";
import {
  generateKeywords,
  parseQueryTerms,
  rankByRelevance,
  searchCoursesFullStrength,
} from "@/lib/keywords";

describe("generateKeywords", () => {
  it("tokenises and deduplicates words", () => {
    const kw = generateKeywords({
      title: "JavaScript Basics",
      description: "Learn javascript basics",
      category: "Programming",
      lessonTitles: [],
    });
    // "javascript" and "basics" should appear once each
    const jsCount = kw.filter((k) => k === "javascript").length;
    const bCount = kw.filter((k) => k === "basics").length;
    expect(jsCount).toBe(1);
    expect(bCount).toBe(1);
  });

  it("lowercases all tokens", () => {
    const kw = generateKeywords({
      title: "REACT HOOKS",
      description: "",
      category: "Programming",
      lessonTitles: [],
    });
    expect(kw).toContain("react");
    expect(kw).toContain("hooks");
    expect(kw.every((k) => k === k.toLowerCase())).toBe(true);
  });

  it("removes stopwords", () => {
    const kw = generateKeywords({
      title: "How to learn programming",
      description: "This is a course about programming",
      category: "Programming",
      lessonTitles: [],
    });
    expect(kw).not.toContain("how");
    expect(kw).not.toContain("to");
    expect(kw).not.toContain("this");
    expect(kw).not.toContain("is");
    expect(kw).not.toContain("a");
    expect(kw).not.toContain("about");
    expect(kw).toContain("programming");
    expect(kw).toContain("learn");
  });

  it("includes lesson titles", () => {
    const kw = generateKeywords({
      title: "Python",
      description: "",
      category: "Programming",
      lessonTitles: ["Variables and types", "Functions"],
    });
    expect(kw).toContain("variables");
    expect(kw).toContain("types");
    expect(kw).toContain("functions");
  });

  it("caps at MAX_KEYWORDS (100)", () => {
    const manyLessons = Array.from({ length: 50 }, (_, i) => `lesson${i} word${i}`);
    const kw = generateKeywords({
      title: "Big course with many topics",
      description: "Many different topics covered here",
      category: "Science and maths",
      lessonTitles: manyLessons,
    });
    expect(kw.length).toBeLessThanOrEqual(100);
  });

  it("strips punctuation", () => {
    const kw = generateKeywords({
      title: "C++, Python & Java!",
      description: "",
      category: "Programming",
      lessonTitles: [],
    });
    // Should not contain punctuation
    expect(kw.every((k) => /^[a-z0-9]+$/.test(k))).toBe(true);
  });

  it("filters out single-character tokens", () => {
    const kw = generateKeywords({
      title: "A b c programming",
      description: "",
      category: "Programming",
      lessonTitles: [],
    });
    expect(kw.every((k) => k.length >= 2)).toBe(true);
  });
});

describe("parseQueryTerms", () => {
  it("returns up to 10 terms by default", () => {
    const terms = parseQueryTerms("one two three four five six seven eight nine ten eleven");
    expect(terms.length).toBeLessThanOrEqual(10);
  });

  it("deduplicates terms", () => {
    const terms = parseQueryTerms("react react react hooks hooks");
    const reactCount = terms.filter((t) => t === "react").length;
    expect(reactCount).toBe(1);
  });

  it("respects custom maxTerms", () => {
    const terms = parseQueryTerms("one two three four five six", 3);
    expect(terms.length).toBeLessThanOrEqual(3);
  });

  it("returns empty array for stopword-only query", () => {
    const terms = parseQueryTerms("the and or");
    expect(terms.length).toBe(0);
  });
});

describe("rankByRelevance", () => {
  const courses = [
    { id: "a", keywords: ["react", "hooks", "javascript"] },
    { id: "b", keywords: ["react", "javascript"] },
    { id: "c", keywords: ["python", "django"] },
  ] as Array<{ id: string; keywords: string[] }>;

  it("ranks courses by number of matching terms", () => {
    const ranked = rankByRelevance(courses, ["react", "hooks", "javascript"]);
    expect(ranked[0].id).toBe("a"); // 3 matches
    expect(ranked[1].id).toBe("b"); // 2 matches
    expect(ranked[2].id).toBe("c"); // 0 matches
  });

  it("returns all courses even with no match", () => {
    const ranked = rankByRelevance(courses, ["xyz"]);
    expect(ranked.length).toBe(3);
  });

  it("does not mutate the original array", () => {
    const original = [...courses];
    rankByRelevance(courses, ["react"]);
    expect(courses).toEqual(original);
  });
});

describe("searchCoursesFullStrength", () => {
  const testCourses = [
    {
      title: "Python 101: Absolute Fundamentals",
      description: "Learn clean coding and backend automation",
      creatorName: "Guido van Rossum",
      keywords: ["python", "fundamentals", "backend", "programming"],
    },
    {
      title: "Deep Dive into Machine Learning",
      description: "Build neural networks and predictive models with PyTorch",
      creatorName: "Andrew Ng",
      keywords: ["machine", "learning", "neural", "pytorch", "ai"],
    },
    {
      title: "Mastering React & Next.js",
      description: "Modern frontend web development with server components",
      creatorName: "Dan Abramov",
      keywords: ["react", "nextjs", "frontend", "javascript", "web"],
    },
    {
      title: "Data Structures & Algorithms in C++",
      description: "Ace your competitive programming and technical interviews",
      creatorName: "Stroustrup",
      keywords: ["data", "structures", "algorithms", "cpp", "interviews"],
    },
  ];

  it("returns all courses with score 0 when search query is empty", () => {
    const res = searchCoursesFullStrength(testCourses, "");
    expect(res.length).toBe(testCourses.length);
    expect(res.every((r) => r.score === 0)).toBe(true);
  });

  it("ranks exact title match at top with highest score", () => {
    const res = searchCoursesFullStrength(testCourses, "Mastering React & Next.js");
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].course.title).toBe("Mastering React & Next.js");
  });

  it("finds courses using prefix matching (e.g. 'py' matches Python)", () => {
    const res = searchCoursesFullStrength(testCourses, "py");
    expect(res.length).toBeGreaterThan(0);
    const titles = res.map((r) => r.course.title);
    expect(titles).toContain("Python 101: Absolute Fundamentals");
  });

  it("expands acronyms like 'ml' to find Machine Learning", () => {
    const res = searchCoursesFullStrength(testCourses, "ml");
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].course.title).toContain("Machine Learning");
  });

  it("expands acronyms like 'dsa' to find Data Structures & Algorithms", () => {
    const res = searchCoursesFullStrength(testCourses, "dsa");
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].course.title).toContain("Data Structures & Algorithms");
  });

  it("finds courses by creator name", () => {
    const res = searchCoursesFullStrength(testCourses, "Andrew Ng");
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].course.creatorName).toBe("Andrew Ng");
  });

  it("finds courses by description terms", () => {
    const res = searchCoursesFullStrength(testCourses, "competitive programming");
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].course.title).toContain("C++");
  });

  it("boosts courses matching all multi-word query terms", () => {
    const res = searchCoursesFullStrength(testCourses, "neural networks pytorch");
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].course.title).toContain("Machine Learning");
  });
});
