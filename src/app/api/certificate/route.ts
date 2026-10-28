// ---------------------------------------------------------------------------
// API Route: POST /api/certificate
// Generates a tamper-proof completion certificate with cryptographic verification ID
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  sanitizeInput,
  generateSecureCertificateId,
  buildCanonicalCertificateUrl,
} from "@/lib/security";
import { formatExecutiveCourseTitle } from "@/lib/pdfCertificate";

export const dynamic = "force-dynamic";

function formatDate(date: Date): string {
  try {
    return date.toLocaleDateString("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
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
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }
    let rawUserName = body?.userName;
    const rawCourseTitle = body?.courseTitle;
    const lessonCount = Number(body?.lessonCount) || 0;
    const quizScore = body?.quizScore != null ? Number(body.quizScore) : null;
    const completedDate = body?.completedDate;
    let uid = typeof body?.uid === "string" ? body.uid.trim() : "";
    let courseId = typeof body?.courseId === "string" ? body.courseId.trim() : "";
    const orderId = typeof body?.orderId === "string" ? body.orderId.trim() : "";

    // If uid or courseId is missing due to client auth rehydration after redirect,
    // recover them directly from the Cashfree order record
    if ((!uid || !courseId) && orderId) {
      try {
        const { getCashfreeOrderStatus } = await import("@/lib/cashfree");
        const cfOrder = await getCashfreeOrderStatus(orderId);
        if (!uid && cfOrder?.customer_details?.customer_id) {
          uid = String(cfOrder.customer_details.customer_id).trim();
        }
        if (!courseId && cfOrder?.order_tags?.courseId) {
          courseId = String(cfOrder.order_tags.courseId).trim();
        }
        if (
          (!rawUserName || rawUserName === "Learner") &&
          cfOrder?.customer_details?.customer_name
        ) {
          rawUserName = cfOrder.customer_details.customer_name;
        }
      } catch (err) {
        console.warn("[Certificate] Notice recovering order details:", err);
      }
    }

    let userName = sanitizeInput(rawUserName, 100);
    const sanitizedTitle = sanitizeInput(rawCourseTitle, 200);
    const courseTitle = formatExecutiveCourseTitle(sanitizedTitle);

    if (!uid || !courseId || !userName || !courseTitle) {
      return NextResponse.json(
        { error: "Missing required authentication fields: uid, courseId, userName, courseTitle" },
        { status: 400 }
      );
    }

    // 2b. Educational Roadmap / Short Video Check (distinguish 30m/40m from 3h/7h masterclasses)
    const { checkCertificateEligibility } = await import("@/lib/curriculumEngine");
    const eligibility = checkCertificateEligibility({
      title: sanitizedTitle,
      description: typeof body.description === "string" ? body.description : undefined,
      lessonCount,
      duration: typeof body.duration === "number" ? body.duration : undefined,
    });
    if (!eligibility.eligible) {
      return NextResponse.json(
        {
          error: eligibility.reason,
          notEligible: true,
        },
        { status: 400 }
      );
    }

    // 2c. Server-Side Anti-Cheat & Assessment Passing Threshold (70% Minimum)
    if (quizScore != null && quizScore < 70) {
      return NextResponse.json(
        {
          error:
            "A minimum passing score of 70% is required on module assessments to qualify for a Certificate of Completion.",
          quizThresholdNotMet: true,
        },
        { status: 400 }
      );
    }

    // 3. Server-Side Payment Verification (Cashfree ₹29 Fee)
    // If Cashfree keys are configured in production/sandbox, verify that payment is completed.
    const isCashfreeConfigured = Boolean(
      process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY
    );

    if (isCashfreeConfigured) {
      const { adminDb, isFirebaseAdminConfigured } = await import("@/lib/firebase-admin");
      let isVerified = false;

      // 1. Check Firestore record if Firebase Admin is configured
      if (isFirebaseAdminConfigured) {
        try {
          if (orderId) {
            const orderDoc = await adminDb.collection("payments").doc(orderId).get();
            if (orderDoc.exists) {
              const p = orderDoc.data();
              if (p?.isPaid === true && p?.uid === uid && p?.courseId === courseId) {
                isVerified = true;
                if (
                  p?.customerName &&
                  typeof p.customerName === "string" &&
                  p.customerName.trim()
                ) {
                  userName = sanitizeInput(p.customerName.trim(), 100);
                }
              }
            }
          }

          if (!isVerified) {
            const snap = await adminDb
              .collection("payments")
              .where("uid", "==", uid)
              .where("courseId", "==", courseId)
              .where("isPaid", "==", true)
              .limit(1)
              .get();

            if (!snap.empty) {
              isVerified = true;
              const p = snap.docs[0].data();
              if (p?.customerName && typeof p.customerName === "string" && p.customerName.trim()) {
                userName = sanitizeInput(p.customerName.trim(), 100);
              }
            }
          }
        } catch (dbErr) {
          console.warn("[Certificate] Firestore payment query failed:", dbErr);
        }
      }

      // 2. Direct Cashfree status verification fallback if orderId provided
      if (!isVerified && orderId) {
        try {
          const { getCashfreeOrderStatus } = await import("@/lib/cashfree");
          const cfOrder = await getCashfreeOrderStatus(orderId);
          if (cfOrder.order_status === "PAID") {
            isVerified = true;
            if (
              cfOrder.customer_details?.customer_name &&
              (!userName || userName === "Learner" || userName === "Distinguished Scholar")
            ) {
              userName = sanitizeInput(cfOrder.customer_details.customer_name, 100);
            }
          }
        } catch (cfErr) {
          console.warn("[Certificate] Direct Cashfree status fallback check:", cfErr);
        }
      }

      if (!isVerified) {
        return NextResponse.json(
          {
            error:
              "Payment required. Please complete the ₹29 certificate fee to unlock your official credential.",
            paymentRequired: true,
          },
          { status: 402 }
        );
      }
    }

    // 4. Generate Cryptographically Tamper-Proof Certificate ID
    const certificateId = generateSecureCertificateId();
    let date = new Date();
    if (completedDate) {
      const parsed = new Date(completedDate);
      if (!isNaN(parsed.getTime())) {
        date = parsed;
      }
    }

    const formattedDate = formatDate(date);
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    const proto = request.headers.get("x-forwarded-proto") || "https";
    const origin = host
      ? `${proto}://${host}`
      : process.env.NEXT_PUBLIC_APP_URL || "https://veyskill.in";

    const verifyUrl = buildCanonicalCertificateUrl(
      certificateId,
      {
        userName,
        courseTitle,
        issuedDate: formattedDate,
        lessonCount,
        quizScore,
      },
      origin
    );

    const certificate = {
      id: certificateId,
      userName,
      courseTitle,
      lessonCount: Math.max(0, Math.min(1000, lessonCount)),
      quizScore: quizScore != null ? Math.max(0, Math.min(100, Math.round(quizScore))) : null,
      issuedDate: formattedDate,
      issuedTimestamp: date.toISOString(),
      verifyUrl,
      platform: "VeySkill",
    };

    // 5. Save Immutable Credential to Firestore Registry (if configured)
    try {
      const { adminDb, isFirebaseAdminConfigured } = await import("@/lib/firebase-admin");
      if (isFirebaseAdminConfigured) {
        await adminDb
          .collection("certificates")
          .doc(certificateId)
          .set({
            ...certificate,
            uid: uid || null,
            courseId: courseId || null,
            orderId: orderId || null,
            createdAt: date.toISOString(),
          });
      }
    } catch (saveErr) {
      console.warn("[API] Certificate record save notice:", saveErr);
    }

    return NextResponse.json({ certificate }, { status: 200 });
  } catch (error) {
    console.error("[API] Certificate generation error:", error);
    return NextResponse.json({ error: "Failed to generate certificate." }, { status: 500 });
  }
}
