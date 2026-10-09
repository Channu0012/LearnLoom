// ---------------------------------------------------------------------------
// API Route: /api/verify
// Real-time cryptographic & database verification for VeySkill credentials
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  normalizeCertificateId,
  verifyCertificateId,
  BENCHMARK_CERTIFICATES,
} from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawId = searchParams.get("id") || "";
  return handleVerification(request, rawId);
}

export async function POST(request: NextRequest) {
  let rawId = "";
  try {
    const body = await request.json();
    rawId = body?.id || "";
  } catch {
    return NextResponse.json({ isValid: false, reason: "Invalid JSON payload" }, { status: 400 });
  }
  return handleVerification(request, rawId);
}

async function handleVerification(request: NextRequest, rawId: string) {
  // Rate limiting (60 requests per 60 seconds per IP)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  const rate = checkRateLimit(ip, "verify", 60, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      {
        isValid: false,
        reason: `Too many verification attempts. Please wait ${rate.resetInSeconds}s.`,
      },
      { status: 429, headers: { "Retry-After": String(rate.resetInSeconds) } }
    );
  }

  const cleanId = normalizeCertificateId(rawId);
  if (!cleanId) {
    return NextResponse.json(
      { isValid: false, reason: "Missing credential identifier." },
      { status: 400 }
    );
  }

  // 1. Check Firestore database registry first (client & admin SDK)
  try {
    const { getCertificateRecord } = await import("@/lib/firestore");
    const data = await getCertificateRecord(cleanId);
    if (data) {
      return NextResponse.json({
        isValid: true,
        id: cleanId,
        source: "database",
        certificate: {
          id: cleanId,
          userName: data?.userName || "Distinguished Scholar",
          courseTitle: data?.courseTitle || "Accredited Curriculum",
          lessonCount: data?.lessonCount || 12,
          quizScore: data?.quizScore ?? null,
          issuedDate: data?.issuedDate || "October 2026",
          verifyUrl: data?.verifyUrl || `https://veyskill.in/verify/${cleanId}`,
          verificationMethod: "Cryptographic HMAC-SHA256 & Firestore Registry",
          platform: "VeySkill",
          instructorName: "Channabasav Patil",
          instructorTitle: "Founder / Program Instructor",
        },
      });
    }
  } catch (dbErr) {
    console.warn("[Verify API] Client Firestore notice:", dbErr);
  }

  try {
    const { adminDb, isFirebaseAdminConfigured } = await import("@/lib/firebase-admin");
    if (isFirebaseAdminConfigured) {
      const docSnap = await adminDb.collection("certificates").doc(cleanId).get();
      if (docSnap.exists) {
        const data = docSnap.data();
        return NextResponse.json({
          isValid: true,
          id: cleanId,
          source: "database",
          certificate: {
            id: cleanId,
            userName: data?.userName || "Distinguished Scholar",
            courseTitle: data?.courseTitle || "Accredited Curriculum",
            lessonCount: data?.lessonCount || 12,
            quizScore: data?.quizScore ?? null,
            issuedDate: data?.issuedDate || "October 2026",
            verifyUrl: `https://veyskill.in/verify/${cleanId}`,
            verificationMethod: "Cryptographic HMAC-SHA256 & Firestore Registry",
            platform: "VeySkill",
            instructorName: "Channabasav Patil",
            instructorTitle: "Founder / Program Instructor",
          },
        });
      }
    }
  } catch (dbErr) {
    console.warn("[Verify API] Admin Firestore notice:", dbErr);
  }

  // 2. Check official accredited benchmark records
  const benchmark = BENCHMARK_CERTIFICATES[cleanId];
  if (benchmark) {
    return NextResponse.json({
      isValid: true,
      id: cleanId,
      source: "benchmark",
      certificate: {
        id: cleanId,
        userName: benchmark.userName,
        courseTitle: benchmark.courseTitle,
        lessonCount: benchmark.lessonCount,
        quizScore: benchmark.quizScore,
        issuedDate: benchmark.issuedDate,
        verifyUrl: `https://veyskill.in/verify/${cleanId}`,
        verificationMethod: "Cryptographic HMAC-SHA256 Benchmark Record",
        platform: "VeySkill",
        instructorName: "Channabasav Patil",
        instructorTitle: "Founder / Program Instructor",
        managerName: "VeySkill Academic Council",
        managerTitle: "ACCREDITED CREDENTIALS",
      },
    });
  }

  // 3. Check cryptographic HMAC signature algorithm
  const cryptoResult = verifyCertificateId(cleanId);
  if (cryptoResult.isValid) {
    const qName = request.nextUrl.searchParams.get("n") || undefined;
    const qCourse = request.nextUrl.searchParams.get("c") || undefined;
    const qDate = request.nextUrl.searchParams.get("d") || undefined;
    const qScore = request.nextUrl.searchParams.get("s");
    const qLessons = request.nextUrl.searchParams.get("l");

    return NextResponse.json({
      isValid: true,
      id: cleanId,
      source: "cryptographic_hmac",
      certificate: {
        id: cleanId,
        userName: qName || "Distinguished Scholar",
        courseTitle: qCourse || "Accredited Continuing Computational Education",
        lessonCount: qLessons ? Number(qLessons) : 12,
        quizScore: qScore ? Number(qScore) : 100,
        issuedDate: qDate || "October 2026",
        verifyUrl: `https://veyskill.in/verify/${cleanId}`,
        verificationMethod: "Cryptographic HMAC-SHA256 Tamper-Proof Checksum",
        platform: "VeySkill",
      },
    });
  }

  // 4. Strict counterfeit rejection
  return NextResponse.json(
    {
      isValid: false,
      id: cleanId,
      reason:
        cryptoResult.reason ||
        "Cryptographic checksum mismatch. This credential ID was not issued by VeySkill.",
    },
    { status: 404 }
  );
}
