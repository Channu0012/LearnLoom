// ---------------------------------------------------------------------------
// API Route: POST /api/ai/quiz
// Generates AI-powered MCQ assessment for a lesson with rate-limiting & sanitization
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import { generateQuiz } from "@/lib/gemini";
import { checkRateLimit, sanitizeInput } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rate = checkRateLimit(ip, "ai-quiz", 15, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: `Rate limit reached. Please wait ${rate.resetInSeconds} seconds before requesting a new assessment.`,
        },
        { status: 429, headers: { "Retry-After": String(rate.resetInSeconds) } }
      );
    }

    const body = await request.json();
    const rawVideoTitle = body?.videoTitle;
    const rawCourseTitle = body?.courseTitle;
    const rawCategory = body?.courseCategory;
    const lessonIndex = Math.max(0, Number(body?.lessonIndex) || 0);
    const totalLessons = Math.max(1, Number(body?.totalLessons) || 1);

    const videoTitle = sanitizeInput(rawVideoTitle, 200);
    const courseTitle = sanitizeInput(rawCourseTitle, 200);
    const courseCategory = sanitizeInput(rawCategory, 100) || "General";

    if (!videoTitle || !courseTitle) {
      return NextResponse.json(
        { error: "Missing required parameters: videoTitle, courseTitle" },
        { status: 400 }
      );
    }

    const questions = await generateQuiz(
      videoTitle,
      courseTitle,
      courseCategory,
      lessonIndex,
      totalLessons
    );

    return NextResponse.json({ questions }, { status: 200 });
  } catch (error) {
    console.error("[API] Quiz generation error:", error);
    // Bulletproof fallback to ensure student is never blocked
    const fallbackQuestions = [
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
    ];
    return NextResponse.json({ questions: fallbackQuestions }, { status: 200 });
  }
}
