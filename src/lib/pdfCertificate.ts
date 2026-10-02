// ---------------------------------------------------------------------------
// Vidcura Executive PDF Certificate Generator (A4 Landscape Classical Diploma)
// Produces vector-crisp, printable landscape A4 academic credentials matching
// the ivory parchment, ornate gold border, navy titles, laurel crest, and
// presented-by / certificate-no layout requested by the user.
// ---------------------------------------------------------------------------
import { jsPDF } from "jspdf";

export interface CertificatePdfOptions {
  id: string;
  userName: string;
  courseTitle: string;
  lessonCount: number;
  quizScore: number | null;
  issuedDate: string;
  verifyUrl: string;
}

export function createPdfCertificateDoc(options: CertificatePdfOptions): jsPDF {
  const { id, userName, courseTitle, issuedDate, verifyUrl } = options;

  // A4 Landscape: 297mm width x 210mm height
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 297;
  const pageHeight = 210;

  // 1. Warm Ivory / Cream Parchment Background (#FCFBF7)
  doc.setFillColor(252, 251, 247);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // 2. Heavy Double Gold Filigree Border (#C5A059)
  doc.setDrawColor(197, 160, 89);
  doc.setLineWidth(1.6);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20, "S");

  // Inner Fine Accent Border
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.rect(13, 13, pageWidth - 26, pageHeight - 26, "S");

  // Corner L-Accents with Gold Medallion Pips
  const cornerLen = 10;
  doc.setDrawColor(197, 160, 89);
  doc.setLineWidth(1.2);
  // Top-left
  doc.line(11, 11 + cornerLen, 11, 11);
  doc.line(11, 11, 11 + cornerLen, 11);
  doc.circle(11, 11, 1.2, "FD");
  // Top-right
  doc.line(pageWidth - 11 - cornerLen, 11, pageWidth - 11, 11);
  doc.line(pageWidth - 11, 11, pageWidth - 11, 11 + cornerLen);
  doc.circle(pageWidth - 11, 11, 1.2, "FD");
  // Bottom-left
  doc.line(11, pageHeight - 11 - cornerLen, 11, pageHeight - 11);
  doc.line(11, pageHeight - 11, 11 + cornerLen, pageHeight - 11);
  doc.circle(11, pageHeight - 11, 1.2, "FD");
  // Bottom-right
  doc.line(pageWidth - 11 - cornerLen, pageHeight - 11, pageWidth - 11, pageHeight - 11);
  doc.line(pageWidth - 11, pageHeight - 11 - cornerLen, pageWidth - 11, pageHeight - 11);
  doc.circle(pageWidth - 11, pageHeight - 11, 1.2, "FD");

  // Top Center Decorative Flourish Line
  doc.setDrawColor(197, 160, 89);
  doc.setLineWidth(0.6);
  doc.line(pageWidth / 2 - 35, 23, pageWidth / 2 + 35, 23);
  doc.setFillColor(197, 160, 89);
  doc.circle(pageWidth / 2, 23, 1.4, "F");
  doc.circle(pageWidth / 2 - 8, 23, 0.8, "F");
  doc.circle(pageWidth / 2 + 8, 23, 0.8, "F");

  // 3. Master Title: Certificate of Completion in Deep Navy (#0B2545)
  doc.setFont("times", "bold");
  doc.setFontSize(30);
  doc.setTextColor(11, 37, 69);
  doc.text("Certificate of Completion", pageWidth / 2, 38, { align: "center" });

  // Gold Title Underline
  doc.setDrawColor(197, 160, 89);
  doc.setLineWidth(0.8);
  doc.line(pageWidth / 2 - 24, 42, pageWidth / 2 + 24, 42);

  // 4. Subtitle: This is to certify that
  doc.setFont("times", "italic");
  doc.setFontSize(13);
  doc.setTextColor(71, 85, 105);
  doc.text("This is to certify that", pageWidth / 2, 54, { align: "center" });

  // 5. Recipient Name: Large, Bold Serif, Real Name
  const cleanName = userName.trim() || "Sarah Jenkins";
  let nameFontSize = 26;
  if (cleanName.length > 25) nameFontSize = 22;
  if (cleanName.length > 36) nameFontSize = 18;
  if (cleanName.length > 50) nameFontSize = 14;

  doc.setFont("times", "bold");
  doc.setFontSize(nameFontSize);
  doc.setTextColor(11, 37, 69);
  doc.text(cleanName, pageWidth / 2, 72, { align: "center" });

  // Name Gold Underline
  doc.setDrawColor(197, 160, 89);
  doc.setLineWidth(0.7);
  doc.line(pageWidth / 2 - 50, 77, pageWidth / 2 + 50, 77);

  // 6. Conferred Statement
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  doc.text("has successfully completed the", pageWidth / 2, 87, { align: "center" });

  // Course Title (Bold Navy)
  let courseFontSize = 15;
  if (courseTitle.length > 50) courseFontSize = 13;
  if (courseTitle.length > 75) courseFontSize = 11;

  doc.setFont("times", "bold");
  doc.setFontSize(courseFontSize);
  doc.setTextColor(11, 37, 69);
  const truncatedTitle = courseTitle.length > 85 ? courseTitle.slice(0, 82) + "..." : courseTitle;
  doc.text(truncatedTitle, pageWidth / 2, 97, { align: "center" });

  // Date Completed
  doc.setFont("times", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Training on ${issuedDate}`, pageWidth / 2, 106, { align: "center" });

  // 7. Bottom Three-Column Layout Matching User Reference Image
  // Left Column: Presented by Vidcura
  // Center Column: Gold Laurel Wreath Crest with Star
  // Right Column: Certificate No + ID

  // ── LEFT: Presented By ──────────────────────────────────────
  const leftX = 55;
  const bottomY = 135;

  doc.setFont("times", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Presented by", leftX, bottomY, { align: "center" });

  // Solid Navy Pill for Vidcura
  doc.setFillColor(11, 37, 69);
  doc.roundedRect(leftX - 25, bottomY + 3, 50, 9, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("vidcura.app", leftX, bottomY + 8.5, { align: "center" });

  // Instructor Signature
  doc.setFont("times", "italic");
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text("Dr. Ronald Vance", leftX, bottomY + 28, { align: "center" });

  // Signature line
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(leftX - 25, bottomY + 31, leftX + 25, bottomY + 31);

  doc.setFont("times", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Instructor", leftX, bottomY + 36, { align: "center" });

  // ── CENTER: Metallic Gold Laurel Wreath Crest ───────────────
  const centerX = pageWidth / 2;
  const crestY = bottomY + 12;

  // Star on top of laurel
  doc.setFillColor(197, 160, 89);
  doc.setDrawColor(197, 160, 89);
  doc.circle(centerX, crestY - 14, 1.8, "F");

  // Double circle wreath border
  doc.setDrawColor(197, 160, 89);
  doc.setLineWidth(0.9);
  doc.circle(centerX, crestY, 13, "S");
  doc.setLineWidth(0.4);
  doc.circle(centerX, crestY, 11, "S");

  // Center Open Book Motif
  doc.setFont("times", "bold");
  doc.setFontSize(7);
  doc.setTextColor(197, 160, 89);
  doc.text("HONORS", centerX, crestY - 2, { align: "center" });
  doc.setFontSize(9);
  doc.text("VERIFIED", centerX, crestY + 2.5, { align: "center" });
  doc.setFontSize(6);
  doc.text("MASTERY", centerX, crestY + 6.5, { align: "center" });

  doc.setFont("times", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(197, 160, 89);
  doc.text("ACADEMIC EXCELLENCE", centerX, crestY + 18, { align: "center" });

  // ── RIGHT: Certificate No ───────────────────────────────────
  const rightX = pageWidth - 55;

  doc.setFont("times", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Certificate No", rightX, bottomY, { align: "center" });

  // Solid Navy Pill for Certificate ID
  doc.setFillColor(11, 37, 69);
  doc.roundedRect(rightX - 25, bottomY + 3, 50, 9, 2, 2, "F");
  doc.setFont("courier", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(id, rightX, bottomY + 8.5, { align: "center" });

  // Training Manager Signature
  doc.setFont("times", "italic");
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text("Elena Rostova", rightX, bottomY + 28, { align: "center" });

  // Signature line
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(rightX - 25, bottomY + 31, rightX + 25, bottomY + 31);

  doc.setFont("times", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Training Manager", rightX, bottomY + 36, { align: "center" });

  // 8. Footer Link for Instant Clickable Verification
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  if (typeof (doc as unknown as { textWithLink?: unknown }).textWithLink === "function") {
    doc.textWithLink(`Cryptographically verified at: ${verifyUrl}`, pageWidth / 2, 196, {
      url: verifyUrl,
      align: "center",
    });
  } else {
    doc.text(`Cryptographically verified at: ${verifyUrl}`, pageWidth / 2, 196, {
      align: "center",
    });
  }

  return doc;
}

export function generatePdfCertificate(options: CertificatePdfOptions): void {
  const doc = createPdfCertificateDoc(options);
  const filename = `Vidcura_Certificate_${options.id.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
  doc.save(filename);
}
