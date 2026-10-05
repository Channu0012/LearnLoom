// ---------------------------------------------------------------------------
// VeySkill Official PDF Certificate Generator (A4 Landscape Brand Standard)
// Uses the official embossed VeySkill template (media_1791181434953.pdf) as master canvas.
// Overlays dynamic recipient name, normalized masterclass course title,
// high-contrast scannable QR code linking to official cryptographic verification,
// credential ID directly underneath QR code, and issuance date.
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

  // Handle single words or common abbreviations
  const lower = title.toLowerCase().replace(/[^a-z0-9+#]/g, "");
  const knownShortTitles: Record<string, string> = {
    java: "Java Programming Masterclass",
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
  };

  if (knownShortTitles[lower]) {
    return knownShortTitles[lower];
  }

  // Strip YouTube playlist / clickbait noise while preserving the academic subject
  title = title
    .replace(/\[.*?\]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(
      /\b(full\s+course|complete\s+course|full\s+tutorial|tutorial\s+for\s+beginners|crash\s+course|free\s+course|202[0-9]|in\s+one\s+video)\b/gi,
      ""
    )
    .replace(/\|\s*.*$/g, "")
    .replace(/[-:]\s*(full\s+course|tutorial).*$/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (title.length < 3) {
    title = rawTitle.trim();
  }

  // Ensure title ends with an authoritative academic term
  if (
    !/masterclass|certification|curriculum|bootcamp|foundations|specialization|mastery|engineering|architecture/i.test(
      title
    )
  ) {
    title = `${title} Masterclass`;
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
      const res = await fetch("/images/certificate-template.jpg");
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

export async function createPdfCertificateDoc(options: CertificatePdfOptions): Promise<jsPDF> {
  const { id, userName, courseTitle, issuedDate, verifyUrl } = options;

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
    doc.setDrawColor(11, 118, 110);
    doc.setLineWidth(1.5);
    doc.roundedRect(10, 10, pageWidth - 20, pageHeight - 20, 6, 6, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(30);
    doc.setTextColor(11, 118, 110);
    doc.text("CERTIFICATE", centerX, 36, { align: "center" });
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text("OF COMPLETION", centerX, 44, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text("This is to certify that", centerX, 68, { align: "center" });
    // Center divider line
    doc.setDrawColor(11, 118, 110);
    doc.setLineWidth(0.8);
    doc.line(72, 102.2, 225, 102.2);
  }

  // 3. Recipient Full Legal Name (Auto-Scaled Single Line sitting cleanly above the teal line)
  const cleanName = userName.trim() || "Distinguished Scholar";
  let nameSize = 26;
  if (cleanName.length > 22) nameSize = 22;
  if (cleanName.length > 32) nameSize = 18;
  if (cleanName.length > 42) nameSize = 15;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(nameSize);
  doc.setTextColor(10, 58, 55); // Deep Teal (#0A3A37)
  doc.text(cleanName, centerX, 97, { align: "center" });

  // 4. Subheading Statement below the teal dividing line
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105); // Slate-600
  doc.text(
    "for successfully completing the curriculum and demonstrating mastery in",
    centerX,
    110,
    {
      align: "center",
    }
  );

  // 5. Clean, Professional Masterclass Course Title
  const executiveTitle = formatExecutiveCourseTitle(courseTitle);
  let titleSize = 16;
  if (executiveTitle.length > 36) titleSize = 13.5;
  if (executiveTitle.length > 50) titleSize = 11.5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(titleSize);
  doc.setTextColor(11, 92, 88); // Prestigious Dark Teal (#0B5C58)
  doc.text(executiveTitle, centerX, 118, { align: "center" });

  // 6. Awarded Date (Sitting symmetrically underneath template's 'Awarded on' text)
  const cleanDate = issuedDate.trim() || "October 2026";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text(cleanDate, centerX, 148, { align: "center" });

  // 7. Scannable QR Code (Bottom-Left Quadrant, creating perfect balance with Instructor Signature)
  const effectiveVerifyUrl = verifyUrl || `https://veyskill.in/verify/${id}`;
  const qrX = 42;
  const qrY = 134;
  const qrSize = 26; // 26mm x 26mm high-precision scannable square

  try {
    const qrDataUrl = await QRCode.toDataURL(effectiveVerifyUrl, {
      margin: 1,
      width: 320,
      color: {
        dark: "#0B4F4A", // Dark Teal
        light: "#FFFFFF", // Pure White
      },
    });

    // Subtle background card backing for guaranteed contrast
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(qrX - 1.5, qrY - 1.5, qrSize + 3, qrSize + 3, 1.5, 1.5, "F");

    doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
  } catch (err) {
    console.error("PDF QR code embedding error:", err);
  }

  // 8. Credential ID directly beneath QR Code
  const qrCenterX = qrX + qrSize / 2; // 55mm

  doc.setFont("courier", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text(`ID: ${id}`, qrCenterX, qrY + qrSize + 4.5, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.5);
  doc.setTextColor(11, 118, 110); // Teal-600
  doc.text("SCAN TO VERIFY", qrCenterX, qrY + qrSize + 8, { align: "center" });

  return doc;
}

export async function generatePdfCertificate(options: CertificatePdfOptions): Promise<void> {
  const doc = await createPdfCertificateDoc(options);
  const cleanId = options.id.replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `VeySkill_Certificate_${cleanId}.pdf`;
  doc.save(filename);
}
