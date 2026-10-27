// ---------------------------------------------------------------------------
// VeySkill Official PDF Certificate Generator (A4 Landscape Brand Standard)
// Uses the official embossed VeySkill template (media_1791181434953.pdf) as master canvas.
// Overlays dynamic recipient name, normalized masterclass course title,
// high-contrast scannable QR code linking to official cryptographic verification,
// credential ID directly underneath QR code, and issuance date.
// ---------------------------------------------------------------------------
import { jsPDF } from "jspdf";
import { generateQRCodeDataUrl } from "@/lib/qrcode";
import { buildCanonicalCertificateUrl } from "@/lib/security";

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

// In-memory cache for browser image fetch
let cachedBrowserTemplateDataUrl: string | null = null;

/**
 * Normalizes raw course titles into prestigious, executive-grade masterclass names.
 * Ensures single words (e.g. 'java', 'python') or cluttered YouTube playlist strings
 * become dignified credentials (e.g. 'Java Programming Masterclass').
 */
export function formatExecutiveCourseTitle(rawTitle: string): string {
  if (!rawTitle || !rawTitle.trim()) return "Advanced Technology Masterclass";

  let title = rawTitle.trim();

  // 1. Aggressively strip all emojis, symbols, and pictographs
  title = title
    .replace(
      /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{200D}\u{FE0F}\u{20E3}\u{E0020}-\u{E007F}]/gu,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();

  // Strip YouTube playlist / clickbait noise while preserving the academic subject
  title = title
    .replace(/\[.*?\]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(
      /\b(full\s+course|complete\s+course|complete\s+full|full\s+tutorial|tutorial\s+for\s+beginners|crash\s+course|free\s+course|202[0-9]|in\s+one\s+video|in\s+1\s+video|for\s+beginners|masterclass|tutorial)\b/gi,
      ""
    )
    .replace(/\|\s*.*$/g, "")
    .replace(/[-:]\s*(full\s+course|tutorial).*$/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  // Handle single words or common abbreviations
  const lower = title.toLowerCase().replace(/[^a-z0-9+#]/g, "");
  const knownShortTitles: Record<string, string> = {
    java: "Java Programming Masterclass",
    corejava: "Java Programming Masterclass",
    advancedjava: "Advanced Java Architecture Masterclass",
    python: "Python Architecture & Concurrency Masterclass",
    javascript: "Modern JavaScript & TypeScript Masterclass",
    js: "Modern JavaScript Masterclass",
    ts: "TypeScript Enterprise Masterclass",
    typescript: "TypeScript Enterprise Masterclass",
    react: "Full Stack React & Next.js Masterclass",
    reactjs: "Full Stack React & Next.js Masterclass",
    nextjs: "Full Stack Next.js & Server Architecture Masterclass",
    c: "C Systems Programming Masterclass",
    cpp: "Modern C++ Systems Engineering Masterclass",
    "c++": "Modern C++ Systems Engineering Masterclass",
    golang: "Go Distributed Systems Masterclass",
    go: "Go Distributed Systems Masterclass",
    rust: "Rust Systems & Memory Safety Masterclass",
    flutter: "Flutter & Mobile Engineering Masterclass",
    ai: "Artificial Intelligence & LLM Systems Masterclass",
    ml: "Machine Learning & Neural Networks Masterclass",
    sql: "Relational Database Design & SQL Masterclass",
    html: "Modern Web Foundations & Semantic HTML Masterclass",
    css: "Modern CSS Architecture & Design Systems Masterclass",
    dsa: "Data Structures & Algorithms Masterclass",
    webdev: "Full Stack Web Development Masterclass",
    webdevelopment: "Full Stack Web Development Masterclass",
  };

  if (knownShortTitles[lower]) {
    return knownShortTitles[lower];
  }

  if (title.length < 3) {
    title = rawTitle
      .replace(
        /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu,
        ""
      )
      .trim();
  }

  // Keep title clean — only add a suffix if title is very short and bare
  if (
    title.split(/\s+/).length <= 2 &&
    !/masterclass|certification|curriculum|bootcamp|foundations|specialization|mastery|engineering|architecture|programming|development/i.test(
      title
    )
  ) {
    title = `${title} Programming`;
  }

  return title;
}

/**
 * Loads the official certificate template image as a base64 Data URL.
 * Supports both Node (Vitest/SSR) and Browser runtime environments.
 */
async function getCertificateTemplateDataUrl(): Promise<string | null> {
  // 1. Browser runtime
  if (typeof window !== "undefined") {
    if (cachedBrowserTemplateDataUrl) {
      return cachedBrowserTemplateDataUrl;
    }
    try {
      const res = await fetch("/images/certificate-template.jpg?v=20261013_perfect");
      if (res.ok) {
        const blob = await res.blob();
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            cachedBrowserTemplateDataUrl = dataUrl;
            resolve(dataUrl);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
    } catch {
      // Fallback
    }
    return null;
  }

  // 2. Node runtime (vitest / build / test)
  if (typeof window === "undefined") {
    try {
      // Use dynamic require so Webpack client-side bundler skips this module
      const req = new Function("moduleName", "return require(moduleName)");
      const fs = req("fs");
      const path = req("path");
      const imagePath = path.join(process.cwd(), "public", "images", "certificate-template.jpg");
      if (fs.existsSync(imagePath)) {
        const buffer = fs.readFileSync(imagePath);
        return `data:image/jpeg;base64,${buffer.toString("base64")}`;
      }
    } catch {
      // Ignore Node read failure and fallback
    }
  }

  return null;
}

let cachedBrowserSignatureDataUrl: string | null = null;

async function getSignatureDataUrl(): Promise<string | null> {
  // 1. Browser runtime
  if (typeof window !== "undefined") {
    if (cachedBrowserSignatureDataUrl) {
      return cachedBrowserSignatureDataUrl;
    }
    try {
      const res = await fetch("/images/signature.png?v=20261012_pen");
      if (res.ok) {
        const blob = await res.blob();
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            cachedBrowserSignatureDataUrl = dataUrl;
            resolve(dataUrl);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
    } catch {
      // Fallback
    }
    return null;
  }

  // 2. Node runtime (vitest / build / test)
  if (typeof window === "undefined") {
    try {
      const req = new Function("moduleName", "return require(moduleName)");
      const fs = req("fs");
      const path = req("path");
      const imagePath = path.join(process.cwd(), "public", "images", "signature.png");
      if (fs.existsSync(imagePath)) {
        const buffer = fs.readFileSync(imagePath);
        return `data:image/png;base64,${buffer.toString("base64")}`;
      }
    } catch {
      // Fallback
    }
  }

  return null;
}

export async function createPdfCertificateDoc(options: CertificatePdfOptions): Promise<jsPDF> {
  const { userName, courseTitle, issuedDate } = options;

  // A4 Landscape: 297mm width x 210mm height (ISO 216 standard)
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const centerX = pageWidth / 2; // 148.5mm

  // 1. Base Canvas White Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // 2. Load and draw the official high-resolution VeySkill template background
  const templateDataUrl = await getCertificateTemplateDataUrl();
  if (templateDataUrl) {
    try {
      doc.addImage(templateDataUrl, "JPEG", 0, 0, pageWidth, pageHeight);
    } catch (err) {
      console.warn("Could not draw template background image, using vector fallback:", err);
    }
  } else {
    // Elegant Vector Fallback if template image is missing
    doc.setDrawColor(0, 48, 73); // Deep Navy (#003049)
    doc.setLineWidth(1.5);
    doc.roundedRect(10, 10, pageWidth - 20, pageHeight - 20, 6, 6, "S");
    doc.setLineWidth(0.5);
    doc.roundedRect(13, 13, pageWidth - 26, pageHeight - 26, 4, 4, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(0, 48, 73);
    doc.text("CERTIFICATE", centerX, 36, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(85, 117, 133);
    doc.text("OF COMPLETION", centerX, 44, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(85, 117, 133);
    doc.text("This is to certify that", centerX, 62, { align: "center" });

    // Center flourish divider line
    doc.setDrawColor(0, 48, 73);
    doc.setLineWidth(0.5);
    doc.line(centerX - 45, 87, centerX + 45, 87);

    doc.setFontSize(9.5);
    doc.text("has successfully completed the training program in", centerX, 97, {
      align: "center",
    });

    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "The participant has demonstrated competence in programming and the ability to apply coding skills in practical scenarios.",
      centerX,
      123,
      { align: "center" }
    );

    // Labels in fallback
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(0, 48, 73);
    doc.text("Date of Completion :", 115, 138.8);
    doc.text("Issued by :", 125, 146.7);

    // Signature image & founder details in fallback
    const fallbackSigData = await getSignatureDataUrl();
    if (fallbackSigData) {
      try {
        doc.addImage(fallbackSigData, "PNG", 198, 152, 44, 14);
      } catch {
        // Fallback signature text
      }
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(0, 48, 73);
    doc.text("Channabasav Patil", 220, 168, { align: "center" });
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("FOUNDER", 220, 173, { align: "center" });
  }

  // 3. Recipient Full Legal Name (Elegant Italic Script, centered gracefully above flourish divider with NO underline)
  const cleanName = userName?.trim() || "Distinguished Scholar";
  let nameSize = 28;
  if (cleanName.length > 20) nameSize = 23;
  if (cleanName.length > 28) nameSize = 18.5;
  if (cleanName.length > 38) nameSize = 15;

  doc.setFont("times", "bolditalic");
  doc.setFontSize(nameSize);
  doc.setTextColor(0, 48, 73); // Deep Navy (#003049)
  doc.text(cleanName, centerX, 80.5, { align: "center" });

  // 4. Course Title (Centered in double quotes)
  const executiveTitle = formatExecutiveCourseTitle(courseTitle);
  let titleSize = 14.5;
  if (executiveTitle.length > 36) titleSize = 12;
  if (executiveTitle.length > 50) titleSize = 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(titleSize);
  doc.setTextColor(0, 48, 73); // Deep Navy (#003049)
  doc.text(`\u201C${executiveTitle}\u201D`, centerX, 109.5, { align: "center" });

  // 5. Date of Completion (Single clean line centered at 50%)
  const cleanDate =
    issuedDate?.trim() ||
    new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(0, 48, 73); // Deep Navy (#003049)
  doc.text(`Date of Completion : ${cleanDate}`, centerX, 137.5, { align: "center" });

  // 6. Issued by (Single clean line centered at 50%)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(0, 48, 73); // Deep Navy (#003049)
  doc.text("Issued by : veyskill", centerX, 145.0, { align: "center" });

  // 7. Scannable Verification QR Code (Bottom Left)
  const cleanId = options.id?.trim() || "VS-DEMO";
  let effectiveVerifyUrl = options.verifyUrl;
  if (!effectiveVerifyUrl || !effectiveVerifyUrl.includes("?")) {
    effectiveVerifyUrl = buildCanonicalCertificateUrl(cleanId, {
      userName: cleanName,
      courseTitle: executiveTitle,
      issuedDate: cleanDate,
      lessonCount: options.lessonCount,
      quizScore: options.quizScore,
    });
  }

  try {
    const qrDataUrl = await generateQRCodeDataUrl(effectiveVerifyUrl, 256);
    if (qrDataUrl && qrDataUrl.startsWith("data:image/")) {
      const qrSize = 22; // 22mm x 22mm
      const qrX = 22;
      const qrY = 148;

      // Clean white backing card for flawless scanning contrast
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240); // subtle border
      doc.setLineWidth(0.3);
      doc.roundedRect(qrX - 1.5, qrY - 1.5, qrSize + 3, qrSize + 3, 1, 1, "FD");

      // Draw high-contrast QR code image
      doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

      // Micro credential ID and scan prompt
      doc.setFont("courier", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(0, 48, 73);
      doc.text(cleanId, qrX + qrSize / 2, qrY + qrSize + 3.8, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(5.5);
      doc.setTextColor(13, 148, 136); // Teal-600
      doc.text("SCAN TO VERIFY", qrX + qrSize / 2, qrY + qrSize + 6.4, { align: "center" });

      // Interactive hyperlink on the QR block in PDF readers
      doc.link(qrX - 1.5, qrY - 1.5, qrSize + 3, qrSize + 9, { url: effectiveVerifyUrl });
    }
  } catch (qrErr) {
    console.warn("Could not render QR code onto PDF:", qrErr);
  }

  return doc;
}

export async function generatePdfCertificate(options: CertificatePdfOptions): Promise<void> {
  const doc = await createPdfCertificateDoc(options);
  const cleanId = options.id.replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `VeySkill_Certificate_${cleanId}.pdf`;
  doc.save(filename);
}
