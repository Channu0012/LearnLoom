// ---------------------------------------------------------------------------
// API Route: POST /api/ai/notes
// Generates AI-powered study notes with rate limiting & anti-abuse checks
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import { generateNotes } from "@/lib/gemini";
import { checkRateLimit, sanitizeInput } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    // Rate limiting: Max 10 note generations per minute per IP
    const rate = checkRateLimit(ip, "ai-notes", 10, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: `Rate limit reached. Please wait ${rate.resetInSeconds} seconds before generating more notes.`,
        },
        { status: 429, headers: { "Retry-After": String(rate.resetInSeconds) } }
      );
    }

    const body = await request.json();
    const rawVideoTitle = body?.videoTitle;
    const rawCourseTitle = body?.courseTitle;
    const rawCategory = body?.courseCategory;

    const videoTitle = sanitizeInput(rawVideoTitle, 200);
    const courseTitle = sanitizeInput(rawCourseTitle, 200);
    const courseCategory = sanitizeInput(rawCategory, 100) || "General";

    if (!videoTitle || !courseTitle) {
      return NextResponse.json(
        { error: "Missing required parameters: videoTitle, courseTitle" },
        { status: 400 }
      );
    }

    const notes = await generateNotes(videoTitle, courseTitle, courseCategory);

    return NextResponse.json({ notes }, { status: 200 });
  } catch (error) {
    console.error("[API] Notes generation error:", error);
    return NextResponse.json(
      { error: "An error occurred while generating study notes. Please retry." },
      { status: 500 }
    );
  }
}
