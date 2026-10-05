// ---------------------------------------------------------------------------
// API Route: GET /api/payment/check?uid=xxx&courseId=xxx
// Checks if a user has already paid for a certificate on a given course.
// Safe fallback if Firebase Admin is not configured in local/sandbox environments.
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const uid = request.nextUrl.searchParams.get("uid");
    const courseId = request.nextUrl.searchParams.get("courseId");

    if (!uid || !courseId) {
      return NextResponse.json({ error: "Missing uid or courseId" }, { status: 400 });
    }

    // Gracefully handle unconfigured server credentials
    if (!isFirebaseAdminConfigured) {
      return NextResponse.json({ hasPaid: false, notice: "Payment gateway in test mode" });
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
    console.warn("[API] Payment check notice:", error);
    // Return hasPaid: false instead of a hard 500 error to prevent frontend lockups
    return NextResponse.json({ hasPaid: false });
  }
}
