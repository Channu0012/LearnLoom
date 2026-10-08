// ---------------------------------------------------------------------------
// API Route: POST /api/payment/create-order
// Creates a Cashfree payment order for certificate purchase (₹29)
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import { createCashfreeOrder, generateOrderId, getCashfreeConfig } from "@/lib/cashfree";
import { checkRateLimit } from "@/lib/security";

export const dynamic = "force-dynamic";

const CERTIFICATE_PRICE = 29; // ₹29

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting (max 5 orders per minute per IP)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rate = checkRateLimit(ip, "payment-order", 5, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Too many payment requests. Retry in ${rate.resetInSeconds}s.` },
        { status: 429, headers: { "Retry-After": String(rate.resetInSeconds) } }
      );
    }

    // 2. Parse body
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    const uid = typeof body.uid === "string" ? body.uid.trim() : "";
    const courseId = typeof body.courseId === "string" ? body.courseId.trim() : "";
    const courseTitle = typeof body.courseTitle === "string" ? body.courseTitle.trim() : "";
    const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
    const customerEmail = typeof body.customerEmail === "string" ? body.customerEmail.trim() : "";
    const customerPhone =
      typeof body.customerPhone === "string" ? body.customerPhone.trim() : "9999999999";

    if (!uid || !courseId || !courseTitle || !customerName) {
      return NextResponse.json(
        { error: "Missing required fields: uid, courseId, courseTitle, customerName" },
        { status: 400 }
      );
    }

    // 2b. Check Certificate Eligibility (distinguish 30m/40m short videos from 3h/7h masterclasses)
    const { checkCertificateEligibility } = await import("@/lib/curriculumEngine");
    const lessonCount = typeof body.lessonCount === "number" ? body.lessonCount : 1;
    const description = typeof body.description === "string" ? body.description : undefined;
    const duration = typeof body.duration === "number" ? body.duration : undefined;
    const eligibility = checkCertificateEligibility({
      title: courseTitle,
      description,
      lessonCount,
      duration,
    });
    if (!eligibility.eligible) {
      return NextResponse.json({ error: eligibility.reason, notEligible: true }, { status: 400 });
    }

    // 3. Generate unique order ID
    const orderId = generateOrderId(uid, courseId);

    // 4. Build return URL
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("learnloom-zeta")
        ? process.env.NEXT_PUBLIC_APP_URL
        : "https://veyskill.in";
    const returnUrl = `${appUrl}/course/${courseId}?payment_status=success&order_id={order_id}`;

    // 5. Create order via Cashfree API
    const order = await createCashfreeOrder({
      orderId,
      orderAmount: CERTIFICATE_PRICE,
      customerName,
      customerEmail: customerEmail || `${uid.slice(0, 8)}@veyskill.in`,
      customerPhone,
      customerUid: uid,
      courseId,
      courseTitle,
      returnUrl,
    });

    const { mode } = getCashfreeConfig();

    return NextResponse.json(
      {
        orderId: order.order_id,
        paymentSessionId: order.payment_session_id,
        orderAmount: CERTIFICATE_PRICE,
        cfOrderId: order.cf_order_id,
        mode,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] Payment order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order. Please try again." },
      { status: 500 }
    );
  }
}
