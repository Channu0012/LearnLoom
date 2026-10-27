// ---------------------------------------------------------------------------
// QR Code Generator Utility — VeySkill Certificate Verification
// Generates high-contrast, scannable QR codes for certificate verification URLs.
// Works in both Browser (canvas/data-url) and Node (data-url) environments.
// ---------------------------------------------------------------------------
import QRCode from "qrcode";

/**
 * QR Code generation options for VeySkill branded certificates.
 * Uses high error-correction (H = 30%) so the QR stays scannable even with
 * minor damage, printing artifacts, or a center logo overlay.
 */
const QR_OPTIONS: QRCode.QRCodeToDataURLOptions = {
  errorCorrectionLevel: "H", // 30% error recovery — supports center logo overlay
  type: "image/png",
  margin: 1,
  width: 256,
  color: {
    dark: "#003049", // VeySkill deep navy
    light: "#FFFFFF", // Clean white background
  },
};

/**
 * Generates a QR code as a base64 PNG Data URL for the given verification URL.
 * Used in both the on-screen certificate view and the downloadable PDF.
 *
 * @param verifyUrl - The full verification URL (e.g., https://veyskill.in/verify/VS-XXXXXXXX)
 * @param size - Width/height in pixels (default 256)
 * @returns Base64 PNG data URL string
 */
export async function generateQRCodeDataUrl(
  verifyUrl: string,
  size: number = 256
): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(verifyUrl, {
      ...QR_OPTIONS,
      width: size,
    });
    return dataUrl;
  } catch (err) {
    console.error("[QR] Failed to generate QR code:", err);
    // Return a transparent 1x1 pixel as fallback
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  }
}

/**
 * Generates a QR code as a Canvas element (browser-only).
 * Useful for high-DPI rendering directly into an HTML canvas.
 *
 * @param verifyUrl - The full verification URL
 * @param canvas - Target canvas element
 * @param size - Width/height in pixels (default 256)
 */
export async function renderQRCodeToCanvas(
  verifyUrl: string,
  canvas: HTMLCanvasElement,
  size: number = 256
): Promise<void> {
  await QRCode.toCanvas(canvas, verifyUrl, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: size,
    color: {
      dark: "#003049",
      light: "#FFFFFF",
    },
  });
}

/**
 * Builds the canonical VeySkill certificate verification URL.
 * This is the URL encoded into every QR code on every certificate.
 *
 * @param certificateId - The unique certificate identifier (e.g., VS-9A3F1B8E2C)
 * @returns Full HTTPS verification URL
 */
export function buildVerifyUrl(certificateId: string): string {
  return `https://veyskill.in/verify/${encodeURIComponent(certificateId)}`;
}
