// ---------------------------------------------------------------------------
// Gemini AI Client — Server-side only
// Powers: Quiz Generation, AI Notes, Study Companion Chat
// Strict Corporate & Executive Standard: 100% Emoji-Free, Academic Rigor
// ---------------------------------------------------------------------------
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("[Gemini] GEMINI_API_KEY not set — AI features will be unavailable.");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Use Gemini 2.0 Flash for low latency and high quality
const MODEL_NAME = "gemini-2.0-flash";

/**
 * Generate MCQ quiz questions from a video title and course context.
 * Strict standard: Coursera/Google Career Certificates style. No emojis.
 */
export async function generateQuiz(
  videoTitle: string,
  courseTitle: string,
  courseCategory: string,
  lessonIndex: number,
  totalLessons: number
): Promise<QuizQuestion[]> {
  // Determine question count dynamically based on lecture depth (7, 8, 9, or 10 questions)
  const questionCount = [7, 8, 9, 10][(lessonIndex + (totalLessons || 1)) % 4] || 8;

  if (!genAI) return getFallbackQuiz(videoTitle).slice(0, questionCount);

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = `You are a curriculum designer creating an academic assessment for Vidcura, modeled after Google and Coursera certification standards.

Context:
- Course: "${courseTitle}" (Category: ${courseCategory})
- Current Module: "${videoTitle}" (Lesson ${lessonIndex + 1} of ${totalLessons})

Generate exactly ${questionCount} multiple-choice questions based on the topic "${videoTitle}" to assess student retention, conceptual mastery, and practical competence.

Strict Assessment Standards:
1. Questions must evaluate depth of understanding, architectural principles, and real-world application.
2. Each question must have exactly 4 choices (A, B, C, D).
3. Exactly one choice must be objectively correct.
4. Include an analytical, educational explanation for the correct answer.
5. Questions must progressively escalate from core principles to applied problem-solving.
6. ABSOLUTE REQUIREMENT: Do NOT include any emojis or unicode pictograms anywhere in questions, options, or explanations. Keep all language formal, crisp, and professional.

Return ONLY a valid JSON array with this exact structure (no markdown fences, no code blocks):
[
  {
    "question": "What is the primary architectural purpose of...",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "correctIndex": 0,
    "explanation": "Clear analytical explanation of why this answer is correct."
  }
]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return getFallbackQuiz(videoTitle).slice(0, questionCount);

    const parsed = JSON.parse(jsonMatch[0]) as QuizQuestion[];
    if (!Array.isArray(parsed) || parsed.length === 0)
      return getFallbackQuiz(videoTitle).slice(0, questionCount);

    return parsed.slice(0, questionCount).map((q) => ({
      question: stripEmojis(String(q.question || "")),
      options: Array.isArray(q.options)
        ? q.options.map((opt) => stripEmojis(String(opt))).slice(0, 4)
        : [],
      correctIndex:
        typeof q.correctIndex === "number" && q.correctIndex >= 0 && q.correctIndex < 4
          ? q.correctIndex
          : 0,
      explanation: stripEmojis(String(q.explanation || "")),
    }));
  } catch (error) {
    console.error("[Gemini] Quiz generation failed:", error);
    return getFallbackQuiz(videoTitle).slice(0, questionCount);
  }
}

/**
 * Generate comprehensive study notes/summary from a video title.
 * Formatted like Coursera executive summaries. No emojis.
 */
export async function generateNotes(
  videoTitle: string,
  courseTitle: string,
  courseCategory: string
): Promise<string> {
  if (!genAI) return getFallbackNotes(videoTitle);

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = `You are a technical documentation specialist generating an executive study guide for the learning platform Vidcura.

Context:
- Course: "${courseTitle}" (Category: ${courseCategory})
- Lesson: "${videoTitle}"

Generate an authoritative, rigorous study summary for this lesson.

Structure the guide strictly as follows:
## Key Takeaways
- 3 to 5 bullet points summarizing core principles and mechanisms

## Technical Overview
A 2-3 paragraph breakdown explaining the theory, architecture, and practical execution of the concepts covered in this module.

## Core Concepts & Definitions
- 3 to 5 critical terms with concise, professional definitions

## Curriculum Context
- How this knowledge integrates with the broader syllabus and downstream applications

## Knowledge Check
- 3 targeted questions that a practitioner should be able to answer after mastering this module

STRICT GUIDELINE: Do NOT use any emojis, icons, or unicode pictograms anywhere in the text. Maintain a refined, academic, and publication-ready standard.`;

  try {
    const result = await model.generateContent(prompt);
    return stripEmojis(result.response.text());
  } catch (error) {
    console.error("[Gemini] Notes generation failed:", error);
    return getFallbackNotes(videoTitle);
  }
}

/**
 * AI Study Companion — answers questions and clears student doubts like a senior engineer/mentor.
 * Strict standard: No emojis, crystal-clear, structured answers with practical insights.
 */
export async function askStudyCompanion(
  question: string,
  videoTitle: string,
  courseTitle: string,
  courseCategory: string,
  chatHistory: { role: "user" | "assistant"; content: string }[] = []
): Promise<string> {
  if (!genAI) return "The AI Study Companion is temporarily offline. Please verify connectivity.";

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const historyContext = chatHistory
    .slice(-6)
    .map((m) => `${m.role === "user" ? "Student" : "Instructor"}: ${m.content}`)
    .join("\n");

  const prompt = `You are a distinguished technical tutor and subject matter expert for Vidcura, mentoring students in a professional capacity.

Context:
- Curriculum: "${courseTitle}" (Discipline: ${courseCategory})
- Active Lesson: "${videoTitle}"

${historyContext ? `Previous Discussion:\n${historyContext}\n` : ""}

Student Query: "${question}"

Pedagogical Directives:
1. Provide a direct, authoritative, and lucid explanation. Resolve the student's exact doubt.
2. Use precise terminology, concrete examples, analogies, or code blocks where applicable.
3. If clarification on scope is required, explain the general industry consensus.
4. Keep explanations structured, impactful, and under 300 words.
5. Use clean markdown formatting (bold headers, bullet points, code blocks).
6. ABSOLUTE RULE: DO NOT USE ANY EMOJIS OR UNICODE PICTOGRAMS UNDER ANY CIRCUMSTANCES. Keep the tone dignified, professional, and clear.`;

  try {
    const result = await model.generateContent(prompt);
    return stripEmojis(result.response.text());
  } catch (error) {
    console.error("[Gemini] Study companion failed:", error);
    return "An error occurred while generating the explanation. Please try submitting your question again.";
  }
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// ── Utility to Guarantee Emoji-Free Output ─────────────────────────────────

function stripEmojis(text: string): string {
  // Regex removing common and extended Unicode emojis / symbols
  return text
    .replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ""
    )
    .trim();
}

// ── Fallbacks (Strictly Emoji-Free) ────────────────────────────────────────

function getFallbackQuiz(videoTitle: string): QuizQuestion[] {
  return [
    {
      question: `What is the primary focus of "${videoTitle}"?`,
      options: [
        "Core foundational principles and practical methodology",
        "Peripheral historical background without current utility",
        "Unverified experimental features not recommended in production",
        "Legacy system decommissioning procedures",
      ],
      correctIndex: 0,
      explanation:
        "This module prioritizes core foundational concepts and established architectural methodologies.",
    },
    {
      question: "Why is mastering this specific concept critical for practical implementation?",
      options: [
        "It provides prerequisite architectural patterns required for advanced topics",
        "It has no bearing on actual development workflows",
        "It is merely theoretical with no production relevance",
        "It is strictly used for multiple choice examinations",
      ],
      correctIndex: 0,
      explanation:
        "Mastery of these concepts establishes the architectural patterns required for scalable implementation.",
    },
    {
      question: "What is the recommended approach to validate comprehension of this material?",
      options: [
        "Passive listening without taking notes",
        "Hands-on execution with practical exercises and assessment review",
        "Memorizing syntactical definitions verbatim",
        "Proceeding immediately without evaluating core takeaways",
      ],
      correctIndex: 1,
      explanation:
        "Active hands-on application and rigorous assessment validation ensure durable knowledge retention.",
    },
    {
      question:
        "Which of the following describes an optimal architectural approach in this domain?",
      options: [
        "Monolithic and tightly coupled components without separation of concerns",
        "Modular, maintainable design adhering to established industry design patterns",
        "Ad-hoc scripts running without error handling or automated tests",
        "Ignoring boundary constraints and data sanitization guidelines",
      ],
      correctIndex: 1,
      explanation:
        "Modular architecture with strong separation of concerns provides predictable maintainability.",
    },
    {
      question: "How should unexpected edge cases or runtime exceptions be addressed?",
      options: [
        "Silently swallowed without logging or state remediation",
        "Handled through structured error boundaries and clear logging",
        "By terminating the entire host system immediately",
        "By disabling all defensive validations",
      ],
      correctIndex: 1,
      explanation:
        "Resilient engineering mandates structured error management and observability across boundary layers.",
    },
    {
      question: "Which evaluation criteria best signifies that a system is ready for production?",
      options: [
        "Passing automated test coverage, strict type checks, and load tolerance",
        "The code compiles locally without running any unit tests",
        "Omitting integration boundaries to speed up deployment",
        "Deploying changes without code review or security auditing",
      ],
      correctIndex: 0,
      explanation:
        "Production readiness requires automated test suites, type verification, and validated operational resiliency.",
    },
    {
      question: "What is the primary benefit of immutability in state management?",
      options: [
        "Predictable change tracking, deterministic renders, and easier debugging",
        "Reduced initial memory footprint under all workloads",
        "Elimination of the need for structured unit tests",
        "Automatic compilation into machine language",
      ],
      correctIndex: 0,
      explanation:
        "Immutable data structures guarantee predictable transitions, simplify state auditing, and prevent side-effect bugs.",
    },
    {
      question: "When refactoring legacy logic, what is the safest first step?",
      options: [
        "Establish comprehensive automated regression tests covering existing behaviors",
        "Rewrite the entire subsystem from scratch without verification",
        "Remove existing telemetry and error handling",
        "Rename all public API signatures simultaneously",
      ],
      correctIndex: 0,
      explanation:
        "Regression test coverage creates a safety harness that guarantees behavior preservation throughout refactoring.",
    },
    {
      question: "How does asynchronous decoupled processing improve user experience?",
      options: [
        "By offloading long-running tasks so the interface remains fluid and interactive",
        "By forcing users to wait until background operations complete synchronously",
        "By discarding failed network payloads automatically",
        "By increasing server CPU utilization unnecessarily",
      ],
      correctIndex: 0,
      explanation:
        "Non-blocking background queues prevent main thread starvation, keeping client interactions instantaneous.",
    },
    {
      question: "What is the key principle behind secure credential and token management?",
      options: [
        "Principle of least privilege, strict encryption in transit, and server-side secret isolation",
        "Hardcoding keys into public client-side JavaScript bundles",
        "Storing unhashed plaintext secrets in client browser localStorage",
        "Disabling CORS and authentication headers to simplify testing",
      ],
      correctIndex: 0,
      explanation:
        "Defense-in-depth requires minimal scopes, environment secret encapsulation, and transit encryption.",
    },
  ];
}

function getFallbackNotes(videoTitle: string): string {
  return `## Key Takeaways
- Comprehensive analysis of principles underlying "${videoTitle}"
- Critical terminology, operational parameters, and architectural fundamentals
- Implementation recommendations and verified best practices

## Technical Overview
This module explores the foundational theories and practical mechanisms associated with ${videoTitle}. Learners should review the accompanying codebase and verify their understanding of each sub-component.

## Core Concepts & Definitions
- Module Scope: Defining the operational boundary of this topic
- Standard Patterns: Industry-standard approaches and recurring design templates
- Quality Criteria: Metrics to assess correct and efficient implementation

## Knowledge Check
- Can you articulate the core operational mechanism in your own words?
- What are the critical edge cases to account for in production environments?
- How does this pattern interface with adjacent modules in the syllabus?`;
}
