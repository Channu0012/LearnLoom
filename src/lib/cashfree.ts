// ---------------------------------------------------------------------------
// Cashfree Payment Gateway — Server-Only Utility
// Creates payment orders and verifies webhook signatures.
// NEVER import this file in client components (browser).
// ---------------------------------------------------------------------------
import crypto from "crypto";

// ---------------------------------------------------------------------------
// Configuration (dynamically retrieved from environment variables)
// ---------------------------------------------------------------------------
export function getCashfreeConfig() {
  const appId = process.env.CASHFREE_APP_ID ?? "";
  const secretKey = process.env.CASHFREE_SECRET_KEY ?? "";
  const mode = process.env.NEXT_PUBLIC_CASHFREE_MODE ?? "sandbox";
  const apiBase =
    mode === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";

  return { appId, secretKey, mode, apiBase };
}

const API_VERSION = "2023-08-01";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface CreateOrderParams {
  orderId: string;
  orderAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerUid: string;
  courseId: string;
  courseTitle: string;
  returnUrl: string;
}

export interface CashfreeOrderResponse {
  cf_order_id: string;
  order_id: string;
  order_status: string;
  payment_session_id: string;
  order_amount: number;
}

export interface CashfreeOrderStatusResponse {
  cf_order_id: string;
  order_id: string;
  order_status: string;
  order_amount: number;
  order_currency: string;
  order_note?: string;
}

// ---------------------------------------------------------------------------
// Create Order — calls Cashfree API to create a ₹29 payment order
// ---------------------------------------------------------------------------
export async function createCashfreeOrder(
  params: CreateOrderParams
): Promise<CashfreeOrderResponse> {
  const { appId, secretKey, apiBase } = getCashfreeConfig();

  if (!appId || !secretKey) {
    throw new Error("Cashfree API credentials not configured");
  }

  const requestBody = {
    order_id: params.orderId,
    order_amount: params.orderAmount,
    order_currency: "INR",
    customer_details: {
      customer_id: params.customerUid,
      customer_name: params.customerName,
      customer_email: params.customerEmail,
      customer_phone: params.customerPhone,
    },
    order_meta: {
      return_url: params.returnUrl,
    },
    order_note: `VeySkill Certificate: ${params.courseTitle}`,
    order_tags: {
      courseId: params.courseId,
      customerUid: params.customerUid,
    },
  };

  const response = await fetch(`${apiBase}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": appId,
      "x-client-secret": secretKey,
      "x-api-version": API_VERSION,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errBody = await response.text();
    console.error("[Cashfree] Order creation failed:", response.status, errBody);
    throw new Error(`Cashfree order creation failed: ${response.status}`);
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// Get Order Status — verify payment on server side
// ---------------------------------------------------------------------------
export async function getCashfreeOrderStatus(
  orderId: string
): Promise<CashfreeOrderStatusResponse> {
  const { appId, secretKey, apiBase } = getCashfreeConfig();

  if (!appId || !secretKey) {
    throw new Error("Cashfree API credentials not configured");
  }

  const response = await fetch(`${apiBase}/orders/${orderId}`, {
    method: "GET",
    headers: {
      "x-client-id": appId,
      "x-client-secret": secretKey,
      "x-api-version": API_VERSION,
    },
  });

  if (!response.ok) {
    const errBody = await response.text();
    console.error("[Cashfree] Order status check failed:", response.status, errBody);
    throw new Error(`Cashfree order status check failed: ${response.status}`);
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// Verify Webhook Signature — HMAC-SHA256 tamper-proof verification
// Cashfree signs: timestamp + rawBody → HMAC-SHA256 → Base64
// ---------------------------------------------------------------------------
export function verifyCashfreeWebhookSignature(
  signature: string,
  rawBody: string,
  timestamp: string
): boolean {
  const { secretKey } = getCashfreeConfig();

  if (!secretKey || !signature || !rawBody || !timestamp) {
    return false;
  }

  const signatureData = timestamp + rawBody;
  const expectedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(signatureData)
    .digest("base64");

  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "base64"),
      Buffer.from(expectedSignature, "base64")
    );
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Generate a unique order ID for each payment
// ---------------------------------------------------------------------------
export function generateOrderId(uid: string, courseId: string): string {
  const timestamp = Date.now().toString(36);
  const rand = crypto.randomBytes(4).toString("hex");
  return `VS_${uid.slice(0, 8)}_${courseId.slice(0, 8)}_${timestamp}_${rand}`;
}
