// ---------------------------------------------------------------------------
// VeySkill Executive PDF Certificate Generator (A4 Landscape Brand Standard)
// Modern split-layout with deep navy anchor bar, scannable QR code, gold award medallion,
// subtle guilloché security watermark, auto-scaling single-line recipient name, and cryptographic ID.
// ---------------------------------------------------------------------------
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

export interface CertificatePdfOptions {
  id: string;
  userName: string;
  courseTitle: string;
  lessonCount: number;
  quizScore: number | null;
  issuedDate: string;
  verifyUrl: string;
  instructorName?: string;
  instructorTitle?: string;
  managerName?: string;
  managerTitle?: string;
}

export async function createPdfCertificateDoc(options: CertificatePdfOptions): Promise<jsPDF> {
  const {
    id,
    userName,
    courseTitle,
    lessonCount,
    quizScore,
    issuedDate,
    verifyUrl,
    instructorName = "Jane Kane",
    instructorTitle = "CURRICULUM DIRECTOR",
    managerName = "Thomson Loewe",
    managerTitle = "HEAD OF ACADEMIC CREDENTIALS",
  } = options;

  // A4 Landscape: 297mm width x 210mm height
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const leftBarWidth = 65; // 22% of 297mm

  // 1. Right Content White Background (#FFFFFF)
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // 2. Left Anchor Bar — Deep Obsidian Navy (#081B33)
  doc.setFillColor(8, 27, 51);
  doc.rect(0, 0, leftBarWidth, pageHeight, "F");

  // ── LEFT BAR: Top Brandmark & Logo ───────────────────────────────────────
  const leftCenterX = leftBarWidth / 2;

  // Real VeySkill Layered Crest in White
  const crestY = 24;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(255, 255, 255);

  // Top diamond / cap layer
  doc.triangle(
    leftCenterX,
    crestY,
    leftCenterX - 9,
    crestY + 4.5,
    leftCenterX + 9,
    crestY + 4.5,
    "F"
  );
  doc.triangle(
    leftCenterX,
    crestY + 9,
    leftCenterX - 9,
    crestY + 4.5,
    leftCenterX + 9,
    crestY + 4.5,
    "F"
  );

  // Lower Chevron 1
  doc.setLineWidth(1.2);
  doc.line(leftCenterX - 9, crestY + 8, leftCenterX, crestY + 12.5);
  doc.line(leftCenterX, crestY + 12.5, leftCenterX + 9, crestY + 8);

  // Lower Chevron 2
  doc.line(leftCenterX - 9, crestY + 12, leftCenterX, crestY + 16.5);
  doc.line(leftCenterX, crestY + 16.5, leftCenterX + 9, crestY + 12);

  // Brand Name & Subtitle
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("VEYSKILL", leftCenterX, crestY + 24, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text("ONLINE ACADEMY", leftCenterX, crestY + 28, { align: "center" });

  // ── LEFT BAR: Bottom Scannable QR Code ──────────────────────────────────
  try {
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      margin: 0,
      width: 320,
      color: {
        dark: "#FFFFFF",
        light: "#081B33", // Matched to navy bar background
      },
    });

    const qrSize = 38;
    const qrX = leftCenterX - qrSize / 2;
    const qrY = pageHeight - 58;

    doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(203, 213, 225);
    doc.text("SCAN TO VERIFY", leftCenterX, qrY + qrSize + 5, {
      align: "center",
    });
  } catch (err) {
    console.error("PDF QR code embedding error:", err);
  }

  // ── RIGHT CONTENT: Faint Guilloché Waves (Watermark) ─────────────────────
  doc.setDrawColor(241, 245, 249); // slate-100
  doc.setLineWidth(0.4);
  doc.line(leftBarWidth, 40, pageWidth, 60);
  doc.line(leftBarWidth, 45, pageWidth, 65);
  doc.line(leftBarWidth, 50, pageWidth, 70);
  doc.line(leftBarWidth, 110, pageWidth, 130);
  doc.line(leftBarWidth, 115, pageWidth, 135);
  doc.circle(pageWidth - 30, pageHeight - 30, 45, "S");
  doc.circle(pageWidth - 30, pageHeight - 30, 35, "S");

  // ── RIGHT CONTENT: Top Header & Gold Award Medallion ─────────────────────
  const rightContentX = leftBarWidth + 16;

  // Title: CERTIFICATE
  doc.setFont("helvetica", "bold");
  doc.setFontSize(32);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("CERTIFICATE", rightContentX, 36);

  // Subtitle: OF COMPLETION
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text("OF COMPLETION", rightContentX, 44);

  // ── Top Right Gold Medallion with Dangling Ribbons ────────────────────────
  const medalCenterX = pageWidth - 32;
  const medalCenterY = 32;
  const medalRadius = 13;

  // Dangling Ribbons (Drawn first so medal sits on top)
  doc.setFillColor(8, 27, 51); // Navy ribbons
  // Left ribbon
  doc.triangle(
    medalCenterX - 4,
    medalCenterY + 8,
    medalCenterX - 11,
    medalCenterY + 28,
    medalCenterX - 2,
    medalCenterY + 25,
    "F"
  );
  doc.triangle(
    medalCenterX - 4,
    medalCenterY + 8,
    medalCenterX - 2,
    medalCenterY + 25,
    medalCenterX + 2,
    medalCenterY + 28,
    "F"
  );
  // Right ribbon
  doc.triangle(
    medalCenterX + 4,
    medalCenterY + 8,
    medalCenterX + 2,
    medalCenterY + 28,
    medalCenterX + 6,
    medalCenterY + 25,
    "F"
  );
  doc.triangle(
    medalCenterX + 4,
    medalCenterY + 8,
    medalCenterX + 6,
    medalCenterY + 25,
    medalCenterX + 11,
    medalCenterY + 28,
    "F"
  );

  // Outer Gold Medal Base
  doc.setFillColor(212, 175, 55); // #D4AF37
  doc.circle(medalCenterX, medalCenterY, medalRadius, "F");

  // Inner Shimmer Rim
  doc.setFillColor(243, 229, 171); // #F3E5AB
  doc.circle(medalCenterX, medalCenterY, medalRadius - 1.2, "F");

  // Center Gold Core
  doc.setFillColor(236, 200, 103);
  doc.circle(medalCenterX, medalCenterY, medalRadius - 2.5, "F");

  // Medal Inner Text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(110, 71, 3); // dark amber
  doc.text("2026", medalCenterX, medalCenterY + 0.5, { align: "center" });

  doc.setFontSize(5);
  doc.text("AWARDED", medalCenterX, medalCenterY + 4, { align: "center" });

  // 3 Stars above year
  doc.setFontSize(6);
  doc.text("* * *", medalCenterX, medalCenterY - 3, { align: "center" });

  // ── RECIPIENT BLOCK: We proudly present this certificate to ──────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text("We proudly present this certificate to", rightContentX, 70);

  // Recipient Full Name — Auto-Scaled Single Line
  const cleanName = userName.trim() || "Distinguished Scholar";
  let nameSize = 27;
  if (cleanName.length > 20) nameSize = 23;
  if (cleanName.length > 30) nameSize = 19;
  if (cleanName.length > 40) nameSize = 15;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(nameSize);
  doc.setTextColor(15, 23, 42); // slate-950
  doc.text(cleanName, rightContentX, 84);

  // Thin Accent Divider
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.4);
  doc.line(rightContentX, 90, pageWidth - 20, 90);

  // ── COURSE STATEMENT ─────────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(51, 65, 85); // slate-700

  const introText = `honouring completion of the curriculum: "${courseTitle}".`;
  const descText = `For demonstrating academic mastery, curriculum proficiency across ${lessonCount} comprehensive modules${
    quizScore != null ? ` with a passing grade of ${quizScore}%` : ""
  }.`;

  const fullText = `${introText} ${descText}`;
  const splitDesc = doc.splitTextToSize(fullText, pageWidth - rightContentX - 25);
  doc.text(splitDesc, rightContentX, 100);

  // ── BOTTOM SIGNATURES & VERIFICATION METADATA ────────────────────────────
  const signDividerY = 152;
  doc.setDrawColor(226, 232, 240);
  doc.line(rightContentX, signDividerY, pageWidth - 20, signDividerY);

  const leftSignX = rightContentX;
  const rightSignX = rightContentX + 105;
  const signBaseY = signDividerY + 12;

  // Left Signatory (Calligraphy + Printed Name + Title + Date)
  doc.setFont("times", "italic");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(instructorName, leftSignX, signBaseY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(instructorName, leftSignX, signBaseY + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(instructorTitle, leftSignX, signBaseY + 10);

  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(issuedDate, leftSignX, signBaseY + 16);

  // Right Signatory (Calligraphy + Printed Name + Title + Cryptographic UUID)
  doc.setFont("times", "italic");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(managerName, rightSignX, signBaseY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(managerName, rightSignX, signBaseY + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(managerTitle, rightSignX, signBaseY + 10);

  doc.setFont("courier", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(id, rightSignX, signBaseY + 16);

  return doc;
}

export async function generatePdfCertificate(options: CertificatePdfOptions): Promise<void> {
  const doc = await createPdfCertificateDoc(options);
  const filename = `VeySkill_Certificate_${options.id.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
  doc.save(filename);
}
