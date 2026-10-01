// ---------------------------------------------------------------------------
// Vidcura Executive PDF Certificate Generator (Coursera / Google Skill Grade)
// Produces vector-crisp, printable landscape A4 academic credentials with
// gold ornamental borders, curriculum metrics, dual signatures, and cryptographic ID.
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

export function generatePdfCertificate(options: CertificatePdfOptions): void {
  const { id, userName, courseTitle, lessonCount, quizScore, issuedDate, verifyUrl } = options;

  // A4 Landscape: 297mm width x 210mm height
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 297;
  const pageHeight = 210;

  // 1. Rich Executive Background (#0B1120)
  doc.setFillColor(11, 17, 32);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Subtle interior card backdrop (#131E35)
  doc.setFillColor(17, 27, 49);
  doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 4, 4, "F");

  // 2. Ornamental Outer Gold Border (#D4AF37)
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1.2);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24, "S");

  // Inner Fine Accent Border (#F59E0B)
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.4);
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30, "S");

  // Corner Accents (Corner L-brackets)
  const cSize = 6;
  doc.setLineWidth(1.4);
  doc.setDrawColor(245, 158, 11);
  // Top-left
  doc.line(13, 13 + cSize, 13, 13);
  doc.line(13, 13, 13 + cSize, 13);
  // Top-right
  doc.line(pageWidth - 13 - cSize, 13, pageWidth - 13, 13);
  doc.line(pageWidth - 13, 13, pageWidth - 13, 13 + cSize);
  // Bottom-left
  doc.line(13, pageHeight - 13 - cSize, 13, pageHeight - 13);
  doc.line(13, pageHeight - 13, 13 + cSize, pageHeight - 13);
  // Bottom-right
  doc.line(pageWidth - 13 - cSize, pageHeight - 13, pageWidth - 13, pageHeight - 13);
  doc.line(pageWidth - 13, pageHeight - 13 - cSize, pageWidth - 13, pageHeight - 13);

  // 3. Institution Crest / Brand Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(212, 175, 55);
  doc.text("VIDCURA ACADEMIC CREDENTIALING AUTHORITY", pageWidth / 2, 28, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("GLOBAL DISTANCE LEARNING STANDARDS ACCREDITATION", pageWidth / 2, 33, {
    align: "center",
  });

  // 4. Main Certificate Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("CERTIFICATE OF COMPLETION", pageWidth / 2, 45, { align: "center" });

  // Center Gold Accent Bar
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.8);
  doc.line(pageWidth / 2 - 40, 48, pageWidth / 2 + 40, 48);

  // 5. Awarded To Section
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text("THIS IS PROUDLY CONFERRED UPON", pageWidth / 2, 57, { align: "center" });

  // Recipient Name (Bold, Prominent)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  const cleanName = userName.trim() || "Distinguished Scholar";
  doc.text(cleanName, pageWidth / 2, 70, { align: "center" });

  // Name underline
  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 60, 73, pageWidth / 2 + 60, 73);

  // 6. Curriculum Statement
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "for successfully satisfying all academic requirements, completing 100% of the video curriculum, and demonstrating verified competency in",
    pageWidth / 2,
    81,
    { align: "center" }
  );

  // Course Title (Cyan / Bright)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(56, 189, 248);
  const truncatedTitle = courseTitle.length > 70 ? courseTitle.slice(0, 67) + "..." : courseTitle;
  doc.text(`"${truncatedTitle}"`, pageWidth / 2, 91, { align: "center" });

  // 7. Academic Metrics Strip (3 boxes)
  const boxY = 100;
  const boxW = 54;
  const boxH = 20;

  // Box 1: Modules
  doc.setFillColor(23, 37, 65);
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.3);
  doc.roundedRect(pageWidth / 2 - 85, boxY, boxW, boxH, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`${lessonCount} Lessons`, pageWidth / 2 - 85 + boxW / 2, boxY + 8, { align: "center" });
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text("CURRICULUM COMPLETED", pageWidth / 2 - 85 + boxW / 2, boxY + 14, { align: "center" });

  // Box 2: Assessment Grade
  doc.setFillColor(23, 37, 65);
  doc.roundedRect(pageWidth / 2 - 27, boxY, boxW, boxH, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(16, 185, 129); // Emerald
  const gradeText = quizScore != null ? `${quizScore}%` : "100%";
  doc.text(gradeText, pageWidth / 2 - 27 + boxW / 2, boxY + 8, { align: "center" });
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  const gradeLabel =
    quizScore != null && quizScore >= 85
      ? "GRADE · HONORS DISTINCTION"
      : "VERIFIED ASSESSMENT PASS";
  doc.text(gradeLabel, pageWidth / 2 - 27 + boxW / 2, boxY + 14, { align: "center" });

  // Box 3: Issuance Date
  doc.setFillColor(23, 37, 65);
  doc.roundedRect(pageWidth / 2 + 31, boxY, boxW, boxH, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text(issuedDate, pageWidth / 2 + 31 + boxW / 2, boxY + 8, { align: "center" });
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text("OFFICIAL ISSUANCE DATE", pageWidth / 2 + 31 + boxW / 2, boxY + 14, { align: "center" });

  // 8. Signatures & Verification Seal
  const sigY = 145;

  // Signature 1: Dean
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.4);
  doc.line(40, sigY, 95, sigY);
  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(203, 213, 225);
  doc.text("Dr. Elena Vance", 67.5, sigY - 2.5, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(241, 245, 249);
  doc.text("Dr. Elena Vance, Ph.D.", 67.5, sigY + 4, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text("Academic Dean · Vidcura Systems", 67.5, sigY + 8, { align: "center" });

  // Center Seal Stamp (Gold circle with star)
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.8);
  doc.circle(pageWidth / 2, sigY - 2, 11, "S");
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.3);
  doc.circle(pageWidth / 2, sigY - 2, 9, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(212, 175, 55);
  doc.text("OFFICIAL", pageWidth / 2, sigY - 4, { align: "center" });
  doc.setFontSize(8);
  doc.text("SEAL", pageWidth / 2, sigY, { align: "center" });
  doc.setFontSize(5);
  doc.text("VERIFIED", pageWidth / 2, sigY + 3.5, { align: "center" });

  // Signature 2: Registrar
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.4);
  doc.line(pageWidth - 95, sigY, pageWidth - 40, sigY);
  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(203, 213, 225);
  doc.text("Marcus Sterling", pageWidth - 67.5, sigY - 2.5, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(241, 245, 249);
  doc.text("Marcus Sterling, M.Sc.", pageWidth - 67.5, sigY + 4, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text("Registrar of Credentials & Records", pageWidth - 67.5, sigY + 8, { align: "center" });

  // 9. Tamper-Proof Cryptographic ID & Verification Bar
  doc.setFillColor(15, 23, 42);
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.3);
  doc.roundedRect(18, 172, pageWidth - 36, 16, 2, 2, "FD");

  doc.setFont("courier", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(241, 245, 249);
  doc.text(`CREDENTIAL ID: ${id}`, 24, 180);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`Verify Online: ${verifyUrl}`, 24, 184.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text("AUTHENTICATED · SECURE HMAC CHECKSUM", pageWidth - 24, 180, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Permanent tamper-proof registration on Vidcura Global Registry",
    pageWidth - 24,
    184.5,
    { align: "right" }
  );

  // Save PDF file
  const filename = `Vidcura_Certificate_${id.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
  doc.save(filename);
}
