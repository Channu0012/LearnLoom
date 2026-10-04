// ---------------------------------------------------------------------------
// API Route: GET /api/payment/check?uid=xxx&courseId=xxx
// Checks if a user has already paid for a certificate on a given course.
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const uid = request.nextUrl.searchParams.get("uid");
    const courseId = request.nextUrl.searchParams.get("courseId");

    if (!uid || !courseId) {
      return NextResponse.json({ error: "Missing uid or courseId" }, { status: 400 });
    }

    // Query Firestore for a PAID payment matching this user + course
    const snap = await adminDb
      .collection("payments")
      .where("uid", "==", uid)
      .where("courseId", "==", courseId)
      .where("isPaid", "==", true)
      .limit(1)
      .get();

    if (!snap.empty) {
      const payment = snap.docs[0].data();
      return NextResponse.json({
        hasPaid: true,
        orderId: payment.orderId,
        amount: payment.amount,
        paidAt: payment.verifiedAt || payment.webhookReceivedAt || payment.createdAt,
      });
    }

    return NextResponse.json({ hasPaid: false });
  } catch (error) {
    console.error("[API] Payment check error:", error);
    return NextResponse.json({ error: "Failed to check payment status." }, { status: 500 });
  }
}
