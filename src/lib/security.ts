// ---------------------------------------------------------------------------
// Security & Anti-Abuse Engine (Z++ Grade)
// Protects against bot attacks, API exhaustion, SVG/HTML injection, and forgery
// ---------------------------------------------------------------------------
import crypto from "crypto";

// Secret salt for HMAC verification (fallback to a hardcoded constant if env not set)
const CERT_HMAC_SALT = process.env.CERT_SECRET_SALT || "veyskill_enterprise_sec_2026_salt_89xkp2";

// ── Rate Limiting (In-Memory Sliding Window) ──────────────────────────────
interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

const rateLimitBuckets = new Map<string, RateLimitBucket>();

/**
 * Checks whether an IP or user ID is within allowed rate limits.
 * @param identifier IP address or user ID
 * @param action Action name (e.g. 'quiz', 'chat', 'certificate')
 * @param maxTokens Maximum allowed requests in window
 * @param windowMs Time window in milliseconds (default 60s)
 */
export function checkRateLimit(
  identifier: string,
  action: string,
  maxTokens = 20,
  windowMs = 60_000
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const key = `${action}:${identifier || "anonymous"}`;
  const now = Date.now();

  const bucket = rateLimitBuckets.get(key) || { tokens: maxTokens, lastRefill: now };

  // Calculate elapsed time and replenish tokens
  const elapsed = now - bucket.lastRefill;
  if (elapsed >= windowMs) {
    bucket.tokens = maxTokens;
    bucket.lastRefill = now;
  }

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    rateLimitBuckets.set(key, bucket);
    return {
      allowed: true,
      remaining: bucket.tokens,
      resetInSeconds: Math.ceil((windowMs - (now - bucket.lastRefill)) / 1000),
    };
  }

  return {
    allowed: false,
    remaining: 0,
    resetInSeconds: Math.ceil((windowMs - (now - bucket.lastRefill)) / 1000),
  };
}

// ── Input Sanitization (XSS & Injection Protection) ──────────────────────
/**
 * Strips HTML tags, script vectors, and control characters.
 */
export function sanitizeInput(input: unknown, maxLength = 300): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .replace(/[\x00-\x1F\x7F]/g, "") // Strip control characters
    .trim()
    .slice(0, maxLength);
}

/**
 * Escapes characters for safe XML / SVG and HTML rendering.
 */
export function escapeXml(unsafe: unknown): string {
  if (typeof unsafe !== "string") return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ── Cryptographic Certificate Checksum & Verification ────────────────────
const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Computes a 2-character HMAC checksum for a payload string.
 */
function computeChecksum(payload: string): string {
  const hash = crypto.createHmac("sha256", CERT_HMAC_SALT).update(payload).digest("hex");
  const num1 = parseInt(hash.slice(0, 4), 16) % CHARSET.length;
  const num2 = parseInt(hash.slice(4, 8), 16) % CHARSET.length;
  return CHARSET[num1]! + CHARSET[num2]!;
}

/**
 * Generates an 8-character certificate identifier (VC-XXXXXXCC)
 * where the last 2 characters are a cryptographic checksum of the first 6.
 */
export function generateSecureCertificateId(): string {
  let base = "";
  // 6 cryptographically secure random characters
  const randomBytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    base += CHARSET[randomBytes[i]! % CHARSET.length];
  }
  const checksum = computeChecksum(base);
  return `VC-${base}${checksum}`;
}

/**
 * Verifies if a certificate ID is authentic and matches the checksum.
 */
export function verifyCertificateId(id: string): { isValid: boolean; reason?: string } {
  if (!id || typeof id !== "string") {
    return { isValid: false, reason: "Missing certificate identifier" };
  }

  const clean = id.toUpperCase().trim();
  const match = clean.match(/^VC-([A-HJ-NP-Z2-9]{6})([A-HJ-NP-Z2-9]{2})$/);
  if (!match) {
    // Check if legacy 8-char format
    if (/^VC-[A-HJ-NP-Z2-9]{8}$/.test(clean)) {
      return { isValid: true };
    }
    return { isValid: false, reason: "Malformed credential format" };
  }

  const payload = match[1]!;
  const expectedChecksum = match[2]!;
  const actualChecksum = computeChecksum(payload);

  if (expectedChecksum !== actualChecksum) {
    return { isValid: false, reason: "Cryptographic checksum mismatch (counterfeit credential)" };
  }

  return { isValid: true };
}

// ── Anti-Abuse & Fake Account Protection (Z++ Grade) ─────────────────────
// Known disposable, burner, and throwaway temporary email domains
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "temp-mail.org",
  "guerrillamail.com",
  "guerrillamailblock.com",
  "10minutemail.com",
  "10minutemail.net",
  "yopmail.com",
  "sharklasers.com",
  "trashmail.com",
  "dispostable.com",
  "burnermail.io",
  "dropmail.me",
  "emailondeck.com",
  "fakemailgenerator.com",
  "getairmail.com",
  "throwawaymail.com",
  "crazymailing.com",
  "maildrop.cc",
  "mohmal.com",
]);

/**
 * Validates whether an email address is from a known disposable burner provider.
 */
export function isDisposableEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2) return false;
  const domain = parts[1];
  return domain ? DISPOSABLE_DOMAINS.has(domain) : false;
}

/**
 * Enforces Z++ password criteria: min 8 characters, at least 1 letter and 1 digit.
 */
export function validateSecurePassword(password: string): { valid: boolean; reason?: string } {
  if (!password || password.length < 8) {
    return { valid: false, reason: "Password must be at least 8 characters long." };
  }
  if (!/[A-Za-z]/.test(password)) {
    return { valid: false, reason: "Password must contain at least one letter." };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, reason: "Password must contain at least one number." };
  }
  return { valid: true };
}

/**
 * Sanitizes and normalizes user display names, stripping non-printable characters and scripts.
 */
export function sanitizeDisplayName(name: string, maxLen = 60): string {
  if (!name || typeof name !== "string") return "Student";
  return name
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // Strip zero-width invisible characters
    .trim()
    .slice(0, maxLen);
}
