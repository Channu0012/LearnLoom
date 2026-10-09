import { describe, it, expect } from "vitest";
import { createPdfCertificateDoc, formatExecutiveCourseTitle } from "@/lib/pdfCertificate";

describe("PDF Certificate Generator", () => {
  it("creates a valid PDF document with all required options", async () => {
    const doc = await createPdfCertificateDoc({
      id: "VS-9A3F1B8E2C",
      userName: "Alex Morgan",
      courseTitle: "Full Stack Next.js & Distributed Architecture Mastery",
      lessonCount: 24,
      quizScore: 92,
      issuedDate: "October 1, 2026",
      verifyUrl: "https://veyskill.in/verify/VS-9A3F1B8E2C",
    });

    expect(doc).toBeDefined();
    const arrayBuffer = doc.output("arraybuffer");
    expect(arrayBuffer.byteLength).toBeGreaterThan(1000);
  });

  it("handles long user names without failing", async () => {
    const doc = await createPdfCertificateDoc({
      id: "VS-88421099FF",
      userName: "Dr. Alexander Bartholomew Montgomery-Smith III",
      courseTitle: "Advanced Machine Learning & Deep Neural Network Systems",
      lessonCount: 48,
      quizScore: 78,
      issuedDate: "October 1, 2026",
      verifyUrl: "https://veyskill.in/verify/VS-88421099FF",
    });

    expect(doc).toBeDefined();
    const arrayBuffer = doc.output("arraybuffer");
    expect(arrayBuffer.byteLength).toBeGreaterThan(1000);
  });

  it("handles missing quiz score (defaults to 100%)", async () => {
    const doc = await createPdfCertificateDoc({
      id: "VS-1122334455",
      userName: "Elena Rostova",
      courseTitle: "Cloud Architecture Foundations",
      lessonCount: 15,
      quizScore: null,
      issuedDate: "October 1, 2026",
      verifyUrl: "https://veyskill.in/verify/VS-1122334455",
    });

    expect(doc).toBeDefined();
    const arrayBuffer = doc.output("arraybuffer");
    expect(arrayBuffer.byteLength).toBeGreaterThan(1000);
  });

  describe("formatExecutiveCourseTitle", () => {
    it("converts single words into prestigious masterclasses", () => {
      expect(formatExecutiveCourseTitle("java")).toBe("Java Programming Masterclass");
      expect(formatExecutiveCourseTitle("python")).toBe(
        "Python Architecture & Concurrency Masterclass"
      );
      expect(formatExecutiveCourseTitle("react")).toBe("Full Stack React & Next.js Masterclass");
      expect(formatExecutiveCourseTitle("dsa")).toBe("Data Structures & Algorithms Masterclass");
    });

    it("cleans youtube playlist clutter while preserving academic title", () => {
      expect(
        formatExecutiveCourseTitle(
          "Java Full Course (2026) | Complete 12 Hours Tutorial for Beginners"
        )
      ).toBe("Java Programming Masterclass");
      expect(formatExecutiveCourseTitle("Python for Data Science Bootcamp")).toBe(
        "Python for Data Science Bootcamp"
      );
    });
  });
});
