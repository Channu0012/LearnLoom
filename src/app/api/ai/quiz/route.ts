// ---------------------------------------------------------------------------
// API Route: POST /api/ai/quiz
// Generates AI-powered MCQ quiz for a lesson
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import { generateQuiz } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoTitle, courseTitle, courseCategory, lessonIndex, totalLessons } = body;

    if (!videoTitle || !courseTitle) {
      return NextResponse.json(
        { error: "Missing required fields: videoTitle, courseTitle" },
        { status: 400 }
      );
    }

    const questions = await generateQuiz(
      videoTitle,
      courseTitle,
      courseCategory || "General",
      lessonIndex ?? 0,
      totalLessons ?? 1
    );

    return NextResponse.json({ questions }, { status: 200 });
  } catch (error) {
    console.error("[API] Quiz generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz. Please try again." },
      { status: 500 }
    );
  }
}
