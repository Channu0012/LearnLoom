// ---------------------------------------------------------------------------
// API Route: POST /api/certificate
// Generates a completion certificate with unique verification ID
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server";

function generateCertificateId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "VC-";
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userName, courseTitle, lessonCount, quizScore, completedDate } = body;

    if (!userName || !courseTitle) {
      return NextResponse.json(
        { error: "Missing required fields: userName, courseTitle" },
        { status: 400 }
      );
    }

    const certificateId = generateCertificateId();
    const date = completedDate ? new Date(completedDate) : new Date();

    const certificate = {
      id: certificateId,
      userName: String(userName).slice(0, 100),
      courseTitle: String(courseTitle).slice(0, 200),
      lessonCount: Number(lessonCount) || 0,
      quizScore: quizScore != null ? Number(quizScore) : null,
      issuedDate: formatDate(date),
      issuedTimestamp: date.toISOString(),
      verifyUrl: `https://vidcura.vercel.app/verify/${certificateId}`,
      platform: "Vidcura",
    };

    return NextResponse.json({ certificate }, { status: 200 });
  } catch (error) {
    console.error("[API] Certificate generation error:", error);
    return NextResponse.json({ error: "Failed to generate certificate." }, { status: 500 });
  }
}
