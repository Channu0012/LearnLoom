// ---------------------------------------------------------------------------
// API Route: POST /api/ai/chat
// AI Study Companion — answers student questions about lesson content
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import { askStudyCompanion } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, videoTitle, courseTitle, courseCategory, chatHistory } = body;

    if (!question || !videoTitle || !courseTitle) {
      return NextResponse.json(
        { error: "Missing required fields: question, videoTitle, courseTitle" },
        { status: 400 }
      );
    }

    if (question.length > 1000) {
      return NextResponse.json(
        { error: "Question too long. Maximum 1000 characters." },
        { status: 400 }
      );
    }

    const answer = await askStudyCompanion(
      question,
      videoTitle,
      courseTitle,
      courseCategory || "General",
      chatHistory || []
    );

    return NextResponse.json({ answer }, { status: 200 });
  } catch (error) {
    console.error("[API] Study companion error:", error);
    return NextResponse.json(
      { error: "Failed to get an answer. Please try again." },
      { status: 500 }
    );
  }
}
