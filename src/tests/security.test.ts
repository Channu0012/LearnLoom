import { describe, it, expect } from "vitest";
import {
  checkRateLimit,
  sanitizeInput,
  escapeXml,
  generateSecureCertificateId,
  verifyCertificateId,
} from "@/lib/security";

describe("Security Engine Tests (Z++ Enterprise Protection)", () => {
  describe("checkRateLimit", () => {
    it("allows requests up to max tokens and blocks excess requests", () => {
      const id = "test-user-" + Math.random();
      const first = checkRateLimit(id, "test-action", 3, 60_000);
      expect(first.allowed).toBe(true);
      expect(first.remaining).toBe(2);

      checkRateLimit(id, "test-action", 3, 60_000);
      checkRateLimit(id, "test-action", 3, 60_000);

      const fourth = checkRateLimit(id, "test-action", 3, 60_000);
      expect(fourth.allowed).toBe(false);
      expect(fourth.remaining).toBe(0);
      expect(fourth.resetInSeconds).toBeGreaterThan(0);
    });
  });

  describe("sanitizeInput", () => {
    it("strips HTML tags and script injections", () => {
      const malicious = '<script>alert("xss")</script>Hello World<b>!</b>';
      const clean = sanitizeInput(malicious);
      expect(clean).toBe('alert("xss")Hello World!');
      expect(clean).not.toContain("<script>");
      expect(clean).not.toContain("<b>");
    });

    it("respects max length limits", () => {
      const longStr = "A".repeat(500);
      const truncated = sanitizeInput(longStr, 50);
      expect(truncated.length).toBe(50);
    });
  });

  describe("escapeXml", () => {
    it("properly escapes XML and SVG reserved characters", () => {
      const raw = `<svg onload="alert('hack')">&"test"</svg>`;
      const escaped = escapeXml(raw);
      expect(escaped).toBe(
        `&lt;svg onload=&quot;alert(&apos;hack&apos;)&quot;&gt;&amp;&quot;test&quot;&lt;/svg&gt;`
      );
    });
  });

  describe("Cryptographic Certificate Checksum & Verification", () => {
    it("generates a valid certificate ID with correct format", () => {
      const certId = generateSecureCertificateId();
      expect(certId).toMatch(/^VC-[A-HJ-NP-Z2-9]{8}$/);
    });

    it("verifies an authentic generated certificate ID as valid", () => {
      const certId = generateSecureCertificateId();
      const result = verifyCertificateId(certId);
      expect(result.isValid).toBe(true);
    });

    it("detects tampered / counterfeit certificate IDs", () => {
      const certId = generateSecureCertificateId();
      // Tamper with the last character (the checksum)
      const lastChar = certId[certId.length - 1];
      const tamperedChar = lastChar === "A" ? "B" : "A";
      const tamperedId = certId.slice(0, -1) + tamperedChar;

      const result = verifyCertificateId(tamperedId);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain("checksum mismatch");
    });

    it("rejects malformed IDs", () => {
      expect(verifyCertificateId("invalid-id").isValid).toBe(false);
      expect(verifyCertificateId("").isValid).toBe(false);
    });
  });
});
