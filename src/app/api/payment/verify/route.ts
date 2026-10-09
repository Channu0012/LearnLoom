// ---------------------------------------------------------------------------
// API Route: POST /api/payment/verify
// Verifies payment status with Cashfree after checkout completion.
// Saves verified payment record to Firestore.
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import { getCashfreeOrderStatus } from "@/lib/cashfree";
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase-admin";
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
    let uid = typeof body.uid === "string" ? body.uid.trim() : "";
    let courseId = typeof body.courseId === "string" ? body.courseId.trim() : "";

    if (!orderId) {
      return NextResponse.json({ error: "Missing required field: orderId" }, { status: 400 });
    }

    // 3. Verify order status directly with Cashfree
    const orderStatus = await getCashfreeOrderStatus(orderId);

    // If uid was delayed during client auth re-hydration, retrieve from Cashfree order
    if (!uid && orderStatus?.customer_details?.customer_id) {
      uid = String(orderStatus.customer_details.customer_id).trim();
    }
    if (!courseId && orderStatus?.order_tags?.courseId) {
      courseId = String(orderStatus.order_tags.courseId).trim();
    }

    if (!uid || !courseId) {
      return NextResponse.json(
        { error: "Missing required fields: uid or courseId cannot be resolved." },
        { status: 400 }
      );
    }

    const isPaid = orderStatus.order_status === "PAID";

    // 4. Save/update payment record in Firestore (if Admin SDK configured)
    if (isFirebaseAdminConfigured) {
      try {
        const customerName =
          (typeof orderStatus?.customer_details?.customer_name === "string"
            ? orderStatus.customer_details.customer_name.trim()
            : "") || (typeof body.legalName === "string" ? body.legalName.trim() : "");

        const paymentRef = adminDb.collection("payments").doc(orderId);
        const paymentSnap = await paymentRef.get();

        if (!paymentSnap.exists) {
          await paymentRef.set({
            orderId,
            cfOrderId: orderStatus.cf_order_id,
            uid,
            courseId,
            customerName: customerName || null,
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
            ...(customerName ? { customerName } : {}),
            verifiedAt: new Date().toISOString(),
          });
        }
      } catch (dbError) {
        console.warn("[API] Could not persist payment record to Firestore:", dbError);
      }
    }

    const verifiedCustomerName =
      typeof orderStatus?.customer_details?.customer_name === "string"
        ? orderStatus.customer_details.customer_name.trim()
        : typeof body.legalName === "string"
          ? body.legalName.trim()
          : "";

    return NextResponse.json(
      {
        orderId,
        status: orderStatus.order_status,
        isPaid,
        amount: orderStatus.order_amount,
        customerName: verifiedCustomerName || undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] Payment verification error:", error);
    return NextResponse.json({ error: "Failed to verify payment status." }, { status: 500 });
  }
}
