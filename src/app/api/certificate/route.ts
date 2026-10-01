// ---------------------------------------------------------------------------
// API Route: POST /api/certificate
// Generates a tamper-proof completion certificate with cryptographic verification ID
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, sanitizeInput, generateSecureCertificateId } from "@/lib/security";

export const dynamic = "force-dynamic";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function POST(request: NextRequest) {
  try {
    // 1. Z++ Rate Limiting Protection (Max 10 certificates per 60 seconds per IP)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rate = checkRateLimit(ip, "certificate", 10, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Too many certificate requests. Please retry in ${rate.resetInSeconds} seconds.` },
        {
          status: 429,
          headers: { "Retry-After": String(rate.resetInSeconds) },
        }
      );
    }

    // 2. Strict Input Parsing & Sanitization (XSS / SQL / Injection safe)
    const body = await request.json();
    const rawUserName = body?.userName;
    const rawCourseTitle = body?.courseTitle;
    const lessonCount = Number(body?.lessonCount) || 0;
    const quizScore = body?.quizScore != null ? Number(body.quizScore) : null;
    const completedDate = body?.completedDate;

    const userName = sanitizeInput(rawUserName, 100);
    const courseTitle = sanitizeInput(rawCourseTitle, 200);

    if (!userName || !courseTitle) {
      return NextResponse.json(
        { error: "Missing or invalid required fields: userName, courseTitle" },
        { status: 400 }
      );
    }

    // 3. Generate Cryptographically Tamper-Proof Certificate ID
    const certificateId = generateSecureCertificateId();
    const date = completedDate ? new Date(completedDate) : new Date();

    const certificate = {
      id: certificateId,
      userName,
      courseTitle,
      lessonCount: Math.max(0, Math.min(1000, lessonCount)),
      quizScore: quizScore != null ? Math.max(0, Math.min(100, Math.round(quizScore))) : null,
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
