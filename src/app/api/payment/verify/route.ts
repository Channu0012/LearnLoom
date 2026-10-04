// ---------------------------------------------------------------------------
// API Route: POST /api/payment/verify
// Verifies payment status with Cashfree after checkout completion.
// Saves verified payment record to Firestore.
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import { getCashfreeOrderStatus } from "@/lib/cashfree";
import { adminDb } from "@/lib/firebase-admin";
import { checkRateLimit } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting (10 verifications per minute per IP)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rate = checkRateLimit(ip, "payment-verify", 10, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Retry in ${rate.resetInSeconds}s.` },
        { status: 429 }
      );
    }

    // 2. Parse request
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
    }

    const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
    const uid = typeof body.uid === "string" ? body.uid.trim() : "";
    const courseId = typeof body.courseId === "string" ? body.courseId.trim() : "";

    if (!orderId || !uid || !courseId) {
      return NextResponse.json(
        { error: "Missing required fields: orderId, uid, courseId" },
        { status: 400 }
      );
    }

    // 3. Verify order status directly with Cashfree
    const orderStatus = await getCashfreeOrderStatus(orderId);

    const isPaid = orderStatus.order_status === "PAID";

    // 4. Save/update payment record in Firestore
    const paymentRef = adminDb.collection("payments").doc(orderId);
    const paymentSnap = await paymentRef.get();

    if (!paymentSnap.exists) {
      await paymentRef.set({
        orderId,
        cfOrderId: orderStatus.cf_order_id,
        uid,
        courseId,
        amount: orderStatus.order_amount,
        currency: orderStatus.order_currency || "INR",
        status: orderStatus.order_status,
        isPaid,
        createdAt: new Date().toISOString(),
        verifiedAt: new Date().toISOString(),
      });
    } else {
      await paymentRef.update({
        status: orderStatus.order_status,
        isPaid,
        verifiedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        orderId,
        status: orderStatus.order_status,
        isPaid,
        amount: orderStatus.order_amount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] Payment verification error:", error);
    return NextResponse.json({ error: "Failed to verify payment status." }, { status: 500 });
  }
}
