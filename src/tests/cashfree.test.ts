import { describe, it, expect, beforeEach, afterEach } from "vitest";
import crypto from "crypto";
import { generateOrderId, verifyCashfreeWebhookSignature } from "@/lib/cashfree";
import { COLLECTIONS } from "@/lib/constants";

describe("Cashfree Payment Engine Tests", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("COLLECTIONS constant", () => {
    it("includes payments collection", () => {
      expect(COLLECTIONS.PAYMENTS).toBe("payments");
    });
  });

  describe("generateOrderId", () => {
    it("generates a unique order ID prefixed with VS_", () => {
      const uid = "user_abc12345";
      const courseId = "course_xyz67890";
      const orderId1 = generateOrderId(uid, courseId);
      const orderId2 = generateOrderId(uid, courseId);

      expect(orderId1).toMatch(/^VS_[a-zA-Z0-9_-]+$/);
      expect(orderId1.startsWith("VS_user_abc_course_x")).toBe(true);
      expect(orderId1).not.toBe(orderId2); // Uniqueness check
    });

    it("handles short uids and courseIds safely", () => {
      const orderId = generateOrderId("u", "c");
      expect(orderId.startsWith("VS_u_c_")).toBe(true);
    });
  });

  describe("verifyCashfreeWebhookSignature", () => {
    const secretKey = "test_cashfree_secret_key_123";
    const timestamp = "1710000000";
    const rawBody = JSON.stringify({
      data: {
        order: { order_id: "VS_123", order_status: "PAID", order_amount: 29 },
      },
      type: "PAYMENT_SUCCESS_WEBHOOK",
    });

    it("verifies a valid Cashfree HMAC-SHA256 signature", () => {
      process.env.CASHFREE_SECRET_KEY = secretKey;

      const validSignature = crypto
        .createHmac("sha256", secretKey)
        .update(timestamp + rawBody)
        .digest("base64");

      const isValid = verifyCashfreeWebhookSignature(validSignature, rawBody, timestamp);
      expect(isValid).toBe(true);
    });

    it("rejects an invalid or tampered signature", () => {
      process.env.CASHFREE_SECRET_KEY = secretKey;

      const tamperedSignature = Buffer.from("fake_invalid_signature").toString("base64");
      const isValid = verifyCashfreeWebhookSignature(tamperedSignature, rawBody, timestamp);
      expect(isValid).toBe(false);
    });

    it("rejects when the payload body has been tampered with", () => {
      process.env.CASHFREE_SECRET_KEY = secretKey;

      const validSignature = crypto
        .createHmac("sha256", secretKey)
        .update(timestamp + rawBody)
        .digest("base64");

      const tamperedBody = JSON.stringify({
        data: {
          order: { order_id: "VS_123", order_status: "PAID", order_amount: 0 }, // Changed amount!
        },
      });

      const isValid = verifyCashfreeWebhookSignature(validSignature, tamperedBody, timestamp);
      expect(isValid).toBe(false);
    });

    it("rejects when timestamp has been tampered with", () => {
      process.env.CASHFREE_SECRET_KEY = secretKey;

      const validSignature = crypto
        .createHmac("sha256", secretKey)
        .update(timestamp + rawBody)
        .digest("base64");

      const isValid = verifyCashfreeWebhookSignature(validSignature, rawBody, "1719999999");
      expect(isValid).toBe(false);
    });

    it("safely returns false when keys or headers are empty", () => {
      process.env.CASHFREE_SECRET_KEY = "";
      expect(verifyCashfreeWebhookSignature("sig", "body", "time")).toBe(false);
      expect(verifyCashfreeWebhookSignature("", "body", "time")).toBe(false);
      expect(verifyCashfreeWebhookSignature("sig", "", "time")).toBe(false);
      expect(verifyCashfreeWebhookSignature("sig", "body", "")).toBe(false);
    });
  });
});
