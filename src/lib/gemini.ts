// ---------------------------------------------------------------------------
// AI Client & Academic Curriculum Intelligence System — Server-side only
// Powers: Quiz Generation, AI Notes, Study Companion Chat
// Strict Corporate & Executive Standard: 100% Emoji-Free, Academic Rigor
// Features: Multi-model (Claude Sonnet 3.5/4.6, Gemini 2.0/1.5 Flash) with
// domain-trained curriculum knowledge engine fallback
// ---------------------------------------------------------------------------
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  detectDomain,
  getDomainQuestions,
  getDomainTutorResponse,
  shuffleOptions,
  type QuizQuestion,
} from "./curriculumEngine";

const geminiApiKey = process.env.GEMINI_API_KEY;
const claudeApiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

// Primary and fallback models for high availability
const PRIMARY_MODEL = "gemini-2.0-flash";
const FALLBACK_MODEL = "gemini-1.5-flash";

/**
 * Call Anthropic Claude API if key is available.
 */
async function callClaude(prompt: string): Promise<string | null> {
  if (!claudeApiKey) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": claudeApiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const content = data?.content?.[0]?.text;
    return typeof content === "string" ? content : null;
  } catch {
    return null;
  }
}

/**
 * Generate MCQ quiz questions from a video title and course context.
 * Strict standard: Coursera/Google Career Certificates style. No emojis.
 * Dynamically adapts to subject: Python -> Python MCQs, React -> React MCQs, etc.
 */
export async function generateQuiz(
  videoTitle: string,
  courseTitle: string,
  courseCategory: string,
  lessonIndex: number,
  totalLessons: number
): Promise<QuizQuestion[]> {
  const domain = detectDomain(courseTitle, videoTitle, courseCategory);

  // If Python or core programming, default to 10 rigorous technical questions
  const questionCount =
    domain === "python" ? 10 : [7, 8, 9, 10][(lessonIndex + (totalLessons || 1)) % 4] || 8;

  const prompt = `You are a curriculum designer creating an academic assessment for VeySkill, modeled after Google and Coursera certification standards.

Context:
- Course: "${courseTitle}" (Category: ${courseCategory})
- Technical Domain: ${domain.toUpperCase()}
- Current Module: "${videoTitle}" (Lesson ${lessonIndex + 1} of ${totalLessons})

Generate exactly ${questionCount} multiple-choice questions specifically testing core ${domain.toUpperCase()} principles, syntax, data structures, and real-world execution.

CRITICAL DOMAIN DIRECTIVES:
1. If the subject is Python, questions MUST evaluate Python language mechanics (e.g. list/dict comprehensions, mutability vs immutability, decorators, generators, GIL, dunder methods, *args/**kwargs, slicing, memory reference counting).
2. If the subject is JavaScript/TypeScript or React, questions MUST evaluate modern ECMAScript/React mechanics (e.g. event loop microtasks, closures, useEffect dependencies, virtual DOM reconciliation, state immutability).
3. If the subject is Database/SQL, questions MUST evaluate SQL syntax, indexing, ACID transactions, and query plans.
4. Include authentic code snippets in questions and options where appropriate. Include diverse difficulties (Easy, Medium, Advanced Coding).
5. DO NOT ask generic questions like "What is the primary focus of this video". Questions must evaluate actual technical competence.
6. Each question must have exactly 4 choices (A, B, C, D) and exactly one correct answer.
7. Include an analytical, educational explanation for the correct answer.
8. ABSOLUTE REQUIREMENT: Do NOT include any emojis or unicode pictograms anywhere in questions, options, or explanations. Keep all language formal, crisp, and professional.

Return ONLY a valid JSON array with this exact structure (no markdown fences, no code blocks):
[
  {
    "question": "What is the evaluated output of the following Python expression: ...",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "correctIndex": 0,
    "explanation": "Clear analytical explanation of why this answer is correct."
  }
]`;

  // 1. Try Claude if available
  const claudeText = await callClaude(prompt);
  if (claudeText) {
    const jsonMatch = claudeText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as QuizQuestion[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, questionCount).map((q) =>
            shuffleOptions({
              question: stripEmojis(String(q.question || "")),
              options: Array.isArray(q.options)
                ? q.options.map((opt) => stripEmojis(String(opt))).slice(0, 4)
                : [],
              correctIndex:
                typeof q.correctIndex === "number" && q.correctIndex >= 0 && q.correctIndex < 4
                  ? q.correctIndex
                  : 0,
              explanation: stripEmojis(String(q.explanation || "")),
            })
          );
        }
      } catch {
        // Fall through
      }
    }
  }

  // 2. Try Gemini (Primary then Fallback)
  if (genAI) {
    for (const modelName of [PRIMARY_MODEL, FALLBACK_MODEL]) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) continue;

        const parsed = JSON.parse(jsonMatch[0]) as QuizQuestion[];
        if (!Array.isArray(parsed) || parsed.length === 0) continue;

        return parsed.slice(0, questionCount).map((q) =>
          shuffleOptions({
            question: stripEmojis(String(q.question || "")),
            options: Array.isArray(q.options)
              ? q.options.map((opt) => stripEmojis(String(opt))).slice(0, 4)
              : [],
            correctIndex:
              typeof q.correctIndex === "number" && q.correctIndex >= 0 && q.correctIndex < 4
                ? q.correctIndex
                : 0,
            explanation: stripEmojis(String(q.explanation || "")),
          })
        );
      } catch {
        // Continue to fallback model or domain generator
      }
    }
  }

  // 3. Graceful, intelligent domain-specific curriculum engine fallback (Python -> 10 Python MCQs, React -> React MCQs)
  return getDomainQuestions(domain, videoTitle, questionCount, courseTitle);
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
  const domain = detectDomain(courseTitle, videoTitle, courseCategory);

  const prompt = `You are a technical documentation specialist generating an executive study guide for the learning platform VeySkill.

Context:
- Course: "${courseTitle}" (Category: ${courseCategory})
- Discipline: ${domain.toUpperCase()}
- Lesson: "${videoTitle}"

Generate an authoritative, rigorous study summary for this lesson.
Include actual code snippets, architectural trade-offs, and practical execution details.

Structure the guide strictly as follows:
## Key Takeaways
- 3 to 5 bullet points summarizing core principles and mechanisms

## Technical Overview
A 2-3 paragraph breakdown explaining the theory, architecture, and practical execution of the concepts covered in this module. Include a relevant code or architecture block.

## Core Concepts & Definitions
- 3 to 5 critical terms with concise, professional definitions

## Knowledge Check
- 3 targeted questions that a practitioner should be able to answer after mastering this module

STRICT GUIDELINE: Do NOT use any emojis, icons, or unicode pictograms anywhere in the text. Maintain a refined, academic, and publication-ready standard.`;

  // 1. Try Claude
  const claudeText = await callClaude(prompt);
  if (claudeText) {
    return stripEmojis(claudeText);
  }

  // 2. Try Gemini
  if (genAI) {
    for (const modelName of [PRIMARY_MODEL, FALLBACK_MODEL]) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        return stripEmojis(result.response.text());
      } catch {
        // Continue to fallback
      }
    }
  }

  return getFallbackNotes(videoTitle, domain);
}

/**
 * AI Study Companion — answers questions and clears student doubts like a senior engineer/mentor.
 * Strict standard: No emojis, crystal-clear, structured answers with practical insights and code.
 * Highly trained for VeySkill: Fallback engine resolves real technical problems seamlessly.
 */
export async function askStudyCompanion(
  question: string,
  videoTitle: string,
  courseTitle: string,
  courseCategory: string,
  chatHistory: { role: "user" | "assistant"; content: string }[] = []
): Promise<string> {
  const domain = detectDomain(courseTitle, videoTitle, courseCategory);

  const historyContext = chatHistory
    .slice(-6)
    .map((m) => `${m.role === "user" ? "Student" : "Instructor"}: ${m.content}`)
    .join("\n");

  const prompt = `You are an elite Staff Engineer, Computer Science Professor, and Technical Mentor for VeySkill.
You are directly mentoring a student working through an accredited course.

Context:
- Curriculum: "${courseTitle}" (Discipline: ${courseCategory})
- Technical Domain: ${domain.toUpperCase()}
- Active Lesson: "${videoTitle}"

${historyContext ? `Previous Discussion:\n${historyContext}\n` : ""}

Student Question: "${question}"

Pedagogical Directives:
1. Provide a direct, authoritative, and lucid technical explanation. Solve the student's exact doubt or problem.
2. If the question involves code (e.g. Python, TypeScript, SQL, algorithms), write clean, idiomatic, runnable code examples with comments.
3. Explain common pitfalls, memory considerations, and performance characteristics where applicable.
4. Keep explanations structured, impactful, and under 350 words.
5. Format with clean markdown headers (###), bullet points, and syntax-highlighted code blocks (\`\`\`python, \`\`\`tsx, \`\`\`sql).
6. ABSOLUTE RULE: DO NOT USE ANY EMOJIS OR UNICODE PICTOGRAMS UNDER ANY CIRCUMSTANCES. Keep the tone dignified, professional, and clear.`;

  // 1. Try Claude
  const claudeText = await callClaude(prompt);
  if (claudeText) {
    return stripEmojis(claudeText);
  }

  // 2. Try Gemini
  if (genAI) {
    for (const modelName of [PRIMARY_MODEL, FALLBACK_MODEL]) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        return stripEmojis(result.response.text());
      } catch {
        // Continue to next model or fallback
      }
    }
  }

  // 3. Domain-trained intelligent tutor resolves the student's actual doubt
  return getDomainTutorResponse(question, videoTitle, courseTitle, courseCategory, chatHistory);
}

// ── Utility to Guarantee Emoji-Free Output ─────────────────────────────────

function stripEmojis(text: string): string {
  return text
    .replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ""
    )
    .trim();
}

function getFallbackNotes(videoTitle: string, domain: string): string {
  return `## Key Takeaways
- Comprehensive analysis of architectural principles underlying "${videoTitle}"
- Deep dive into ${domain.toUpperCase()} syntax, operational parameters, and standard patterns
- Production guidelines and defensive programming best practices

## Technical Overview
This module explores the foundational theories and practical mechanisms associated with ${videoTitle}. Learners should review the accompanying codebase and verify their understanding of each sub-component.

\`\`\`text
[Data Flow Architecture]
Input Validation -> Domain Controller -> State Transition -> Error Boundary
\`\`\`

## Core Concepts & Definitions
- Module Scope: Defining the operational boundary of this topic in ${domain.toUpperCase()}
- Idiomatic Patterns: Established industry conventions and reusable designs
- Quality Criteria: Automated test coverage, type constraints, and computational complexity

## Knowledge Check
- Can you articulate the core operational mechanism in your own words?
- What are the critical edge cases to account for in production environments?
- How does this pattern interface with adjacent modules in the syllabus?`;
}

export type { QuizQuestion };
