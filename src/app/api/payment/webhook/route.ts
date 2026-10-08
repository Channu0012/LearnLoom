// ---------------------------------------------------------------------------
// API Route: POST /api/payment/webhook
// Cashfree server-to-server webhook notification.
// Verifies HMAC-SHA256 signature before processing.
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import { verifyCashfreeWebhookSignature } from "@/lib/cashfree";
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // 1. Extract signature headers
    const signature = request.headers.get("x-webhook-signature") ?? "";
    const timestamp = request.headers.get("x-webhook-timestamp") ?? "";

    // 2. Get raw body for signature verification
    const rawBody = await request.text();

    if (!signature || !timestamp || !rawBody) {
      return NextResponse.json({ error: "Missing webhook headers." }, { status: 400 });
    }

    // 3. Verify webhook signature (HMAC-SHA256)
    const isValid = verifyCashfreeWebhookSignature(signature, rawBody, timestamp);
    if (!isValid) {
      console.error("[Webhook] Invalid signature — potential tampering attempt.");
      return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
    }

    // 4. Parse the webhook payload
    const payload = JSON.parse(rawBody);
    const eventType = payload?.type;
    const orderData = payload?.data?.order;
    const paymentData = payload?.data?.payment;

    if (!orderData) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const orderId = orderData.order_id;
    const orderStatus = orderData.order_status;
    const isPaid = orderStatus === "PAID";

    // 5. Save/update payment record in Firestore (if Admin SDK configured)
    if (isFirebaseAdminConfigured) {
      try {
        const paymentRef = adminDb.collection("payments").doc(orderId);
        const paymentSnap = await paymentRef.get();

        const paymentRecord = {
          orderId,
          cfOrderId: orderData.cf_order_id ?? null,
          amount: orderData.order_amount,
          currency: orderData.order_currency || "INR",
          status: orderStatus,
          isPaid,
          webhookEventType: eventType,
          paymentMethod: paymentData?.payment_group ?? null,
          paymentInstrument: paymentData?.payment_method?.type ?? null,
          webhookReceivedAt: new Date().toISOString(),
        };

        if (!paymentSnap.exists) {
          await paymentRef.set({
            ...paymentRecord,
            uid: orderData.order_tags?.customerUid ?? null,
            courseId: orderData.order_tags?.courseId ?? null,
            createdAt: new Date().toISOString(),
          });
        } else {
          await paymentRef.update(paymentRecord);
        }
      } catch (dbErr) {
        console.warn("[Webhook] Could not persist to Firestore Admin:", dbErr);
      }
    }

    console.warn(`[Webhook] Order ${orderId}: ${orderStatus} (${eventType})`);

    // 6. Respond 200 to Cashfree (required to acknowledge receipt)
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.error("[Webhook] Processing error:", error);
    // Return 200 anyway to prevent Cashfree from retrying indefinitely
    return NextResponse.json({ status: "error_logged" }, { status: 200 });
  }
}
