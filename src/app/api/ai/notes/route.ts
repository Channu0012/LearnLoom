// ---------------------------------------------------------------------------
// API Route: POST /api/ai/notes
// Generates AI-powered study notes for a lesson
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import { generateNotes } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoTitle, courseTitle, courseCategory } = body;

    if (!videoTitle || !courseTitle) {
      return NextResponse.json(
        { error: "Missing required fields: videoTitle, courseTitle" },
        { status: 400 }
      );
    }

    const notes = await generateNotes(videoTitle, courseTitle, courseCategory || "General");

    return NextResponse.json({ notes }, { status: 200 });
  } catch (error) {
    console.error("[API] Notes generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate notes. Please try again." },
      { status: 500 }
    );
  }
}
