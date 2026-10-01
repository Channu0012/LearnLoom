// ---------------------------------------------------------------------------
// Gemini AI Client — Server-side only
// Powers: Quiz Generation, AI Notes, Study Companion Chat
// ---------------------------------------------------------------------------
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("[Gemini] GEMINI_API_KEY not set — AI features will be unavailable.");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Use Gemini 2.0 Flash for speed and cost efficiency
const MODEL_NAME = "gemini-2.0-flash";

/**
 * Generate MCQ quiz questions from a video title and course context.
 * Returns structured JSON for client-side rendering.
 */
export async function generateQuiz(
  videoTitle: string,
  courseTitle: string,
  courseCategory: string,
  lessonIndex: number,
  totalLessons: number
): Promise<QuizQuestion[]> {
  if (!genAI) return getFallbackQuiz(videoTitle);

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = `You are an expert educator creating a quiz for an online learning platform called Vidcura.

Context:
- Course: "${courseTitle}" (Category: ${courseCategory})
- Current Lesson: "${videoTitle}" (Lesson ${lessonIndex + 1} of ${totalLessons})

Generate exactly 5 multiple-choice questions based on the topic "${videoTitle}" that would test a student's understanding after watching this video lesson.

Rules:
1. Questions should test conceptual understanding, not trivial details
2. Each question must have exactly 4 options (A, B, C, D)
3. Only one option should be correct
4. Include a brief explanation for the correct answer
5. Questions should progressively increase in difficulty
6. Make questions practical and application-oriented

Return ONLY a valid JSON array with this exact structure (no markdown, no code blocks):
[
  {
    "question": "What is...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Brief explanation of why this is correct"
  }
]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return getFallbackQuiz(videoTitle);

    const parsed = JSON.parse(jsonMatch[0]) as QuizQuestion[];
    // Validate structure
    if (!Array.isArray(parsed) || parsed.length === 0) return getFallbackQuiz(videoTitle);

    return parsed.slice(0, 5).map((q) => ({
      question: String(q.question || ""),
      options: Array.isArray(q.options) ? q.options.map(String).slice(0, 4) : [],
      correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : 0,
      explanation: String(q.explanation || ""),
    }));
  } catch (error) {
    console.error("[Gemini] Quiz generation failed:", error);
    return getFallbackQuiz(videoTitle);
  }
}

/**
 * Generate AI-powered study notes/summary from a video title.
 */
export async function generateNotes(
  videoTitle: string,
  courseTitle: string,
  courseCategory: string
): Promise<string> {
  if (!genAI) return getFallbackNotes(videoTitle);

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = `You are an expert study-note generator for the learning platform Vidcura.

Generate comprehensive study notes for a video lesson titled "${videoTitle}" from the course "${courseTitle}" (Category: ${courseCategory}).

Structure the notes as follows:
## 📝 Key Takeaways
- 3-5 bullet points of the most important concepts

## 📖 Detailed Summary
A 2-3 paragraph summary of what this lesson likely covers based on the title

## 💡 Important Concepts
- List 3-5 key terms or concepts with brief definitions

## 🔗 How This Connects
- How this lesson connects to the broader course topic

## ✅ Self-Check Questions
- 3 questions students should be able to answer after this lesson

Keep the language clear, concise, and student-friendly. Use markdown formatting.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("[Gemini] Notes generation failed:", error);
    return getFallbackNotes(videoTitle);
  }
}

/**
 * AI Study Companion — answer questions about the video content.
 */
export async function askStudyCompanion(
  question: string,
  videoTitle: string,
  courseTitle: string,
  courseCategory: string,
  chatHistory: { role: "user" | "assistant"; content: string }[] = []
): Promise<string> {
  if (!genAI) return "AI Study Companion is currently unavailable. Please try again later.";

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const historyContext = chatHistory
    .slice(-6) // Keep last 6 messages for context
    .map((m) => `${m.role === "user" ? "Student" : "AI Tutor"}: ${m.content}`)
    .join("\n");

  const prompt = `You are an expert AI Study Companion tutor on the learning platform Vidcura.

Context:
- Course: "${courseTitle}" (Category: ${courseCategory})
- Current Lesson: "${videoTitle}"

${historyContext ? `Previous conversation:\n${historyContext}\n` : ""}

Student's question: "${question}"

Rules:
1. Answer clearly and concisely, as if explaining to a student
2. If the question is about a concept from the video topic, give a thorough explanation
3. Use examples and analogies when helpful
4. If you're unsure about specifics of the video (since you can't watch it), be honest but still provide helpful context about the topic
5. Keep answers focused and under 300 words
6. Use markdown formatting for clarity (bold, lists, code blocks if needed)
7. Be encouraging and supportive — you're a tutor, not a textbook`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("[Gemini] Study companion failed:", error);
    return "I'm having trouble right now. Please try asking your question again in a moment.";
  }
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// ── Fallbacks ──────────────────────────────────────────────────────────────

function getFallbackQuiz(videoTitle: string): QuizQuestion[] {
  return [
    {
      question: `What is the main topic covered in "${videoTitle}"?`,
      options: [
        "Core concepts and fundamentals",
        "Advanced optimisation techniques",
        "Historical background and context",
        "Troubleshooting common issues",
      ],
      correctIndex: 0,
      explanation: "This lesson primarily covers the core concepts and fundamentals of the topic.",
    },
    {
      question: "Why is understanding this topic important?",
      options: [
        "It has no practical application",
        "It builds a foundation for more advanced concepts",
        "It is only useful for examinations",
        "It is outdated and rarely used",
      ],
      correctIndex: 1,
      explanation:
        "Understanding foundational concepts is crucial as they build the basis for more advanced learning.",
    },
    {
      question: "What is the best approach to master this lesson's content?",
      options: [
        "Read it once and move on",
        "Practice with real examples and revisit key concepts",
        "Memorize everything word for word",
        "Skip ahead to more interesting topics",
      ],
      correctIndex: 1,
      explanation:
        "Active practice with real examples and revisiting key concepts leads to deeper understanding.",
    },
  ];
}

function getFallbackNotes(videoTitle: string): string {
  return `## 📝 Key Takeaways
- This lesson covers the fundamentals of "${videoTitle}"
- Pay attention to core concepts and terminology
- Practice exercises will reinforce your understanding

## 📖 Summary
This lesson introduces key concepts related to ${videoTitle}. Review the video content and take notes on the main points discussed.

## ✅ Self-Check
- Can you explain the main concept in your own words?
- What are the practical applications of what you learned?
- How does this connect to previous lessons?`;
}
