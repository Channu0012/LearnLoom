import { describe, it, expect } from "vitest";
import { createPdfCertificateDoc } from "@/lib/pdfCertificate";

describe("PDF Certificate Generator", () => {
  it("creates a valid PDF document with all required options", () => {
    const doc = createPdfCertificateDoc({
      id: "VC-9A3F1B8E2C",
      userName: "Alex Morgan",
      courseTitle: "Full Stack Next.js & Distributed Architecture Mastery",
      lessonCount: 24,
      quizScore: 92,
      issuedDate: "October 1, 2026",
      verifyUrl: "https://vidcura.vercel.app/verify/VC-9A3F1B8E2C",
    });

    expect(doc).toBeDefined();
    const arrayBuffer = doc.output("arraybuffer");
    expect(arrayBuffer.byteLength).toBeGreaterThan(1000);
  });

  it("handles long user names without failing", () => {
    const doc = createPdfCertificateDoc({
      id: "VC-88421099FF",
      userName: "Dr. Alexander Bartholomew Montgomery-Smith III",
      courseTitle: "Advanced Machine Learning & Deep Neural Network Systems",
      lessonCount: 48,
      quizScore: 78,
      issuedDate: "October 1, 2026",
      verifyUrl: "https://vidcura.vercel.app/verify/VC-88421099FF",
    });

    expect(doc).toBeDefined();
    const arrayBuffer = doc.output("arraybuffer");
    expect(arrayBuffer.byteLength).toBeGreaterThan(1000);
  });

  it("handles missing quiz score (defaults to 100%)", () => {
    const doc = createPdfCertificateDoc({
      id: "VC-1122334455",
      userName: "Elena Rostova",
      courseTitle: "Cloud Architecture Foundations",
      lessonCount: 15,
      quizScore: null,
      issuedDate: "October 1, 2026",
      verifyUrl: "https://vidcura.vercel.app/verify/VC-1122334455",
    });

    expect(doc).toBeDefined();
    const arrayBuffer = doc.output("arraybuffer");
    expect(arrayBuffer.byteLength).toBeGreaterThan(1000);
  });
});
