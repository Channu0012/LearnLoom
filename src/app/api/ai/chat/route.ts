// ---------------------------------------------------------------------------
// API Route: POST /api/ai/chat
// AI Study Companion — answers student questions with rate-limiting & anti-abuse guards
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import { askStudyCompanion } from "@/lib/gemini";
import { checkRateLimit, sanitizeInput } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    // Rate limiting: Max 20 queries per minute per IP
    const rate = checkRateLimit(ip, "ai-chat", 20, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: `Rate limit reached. Please wait ${rate.resetInSeconds} seconds before sending another question.`,
        },
        { status: 429, headers: { "Retry-After": String(rate.resetInSeconds) } }
      );
    }

    const body = await request.json();
    const rawQuestion = body?.question;
    const rawVideoTitle = body?.videoTitle;
    const rawCourseTitle = body?.courseTitle;
    const rawCategory = body?.courseCategory;
    const rawChatHistory = Array.isArray(body?.chatHistory) ? body.chatHistory : [];

    const question = sanitizeInput(rawQuestion, 1000);
    const videoTitle = sanitizeInput(rawVideoTitle, 200);
    const courseTitle = sanitizeInput(rawCourseTitle, 200);
    const courseCategory = sanitizeInput(rawCategory, 100) || "General";

    if (!question || !videoTitle || !courseTitle) {
      return NextResponse.json(
        { error: "Missing required parameters: question, videoTitle, courseTitle" },
        { status: 400 }
      );
    }

    const safeHistory = rawChatHistory
      .slice(-6)
      .map((m: { role?: unknown; content?: unknown }) => ({
        role: m?.role === "user" ? ("user" as const) : ("assistant" as const),
        content: sanitizeInput(m?.content, 1000),
      }));

    const answer = await askStudyCompanion(
      question,
      videoTitle,
      courseTitle,
      courseCategory,
      safeHistory
    );

    return NextResponse.json({ answer }, { status: 200 });
  } catch (error) {
    console.error("[API] Study companion error:", error);
    return NextResponse.json(
      {
        answer:
          "### Technical Analysis\n\nWhen reviewing this lesson, focus on core architecture, defensive programming, and structured error handling. Validate inputs at interface boundaries and keep components modular.\n\nPlease refine or repost your specific question with any relevant code snippet for immediate review.",
      },
      { status: 200 }
    );
  }
}
