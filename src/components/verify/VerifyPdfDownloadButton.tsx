"use client";

// ---------------------------------------------------------------------------
// VerifyPdfDownloadButton.tsx — Instant PDF Generator on Verification Page
// Allows employers, recruiters, and learners scanning the QR code to instantly
// download the official A4 Landscape Vector PDF credential directly from the verification URL.
// ---------------------------------------------------------------------------
import { useState } from "react";
import { generatePdfCertificate } from "@/lib/pdfCertificate";

interface VerifyPdfDownloadButtonProps {
  id: string;
  userName: string;
  courseTitle: string;
  lessonCount: number;
  quizScore: number | null;
  issuedDate: string;
  verifyUrl: string;
}

export function VerifyPdfDownloadButton({
  id,
  userName,
  courseTitle,
  lessonCount,
  quizScore,
  issuedDate,
  verifyUrl,
}: VerifyPdfDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await generatePdfCertificate({
        id,
        userName,
        courseTitle,
        lessonCount,
        quizScore,
        issuedDate,
        verifyUrl,
      });
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 4000);
    } catch (err) {
      console.error("Verification page PDF generation failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="btn-primary w-full sm:w-auto px-6 py-3 text-xs sm:text-sm font-heading font-extrabold inline-flex items-center justify-center gap-2 shadow-lg min-h-[46px] cursor-pointer active:scale-95 transition-all disabled:opacity-50"
      >
        {downloading ? (
          <>
            <div className="simple-loader !w-4 !h-4 !border-2" />
            <span>Generating Official PDF…</span>
          </>
        ) : (
          <>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <polyline points="9 15 12 18 15 15" />
            </svg>
            <span>Download Official PDF Credential</span>
          </>
        )}
      </button>

      {downloaded && (
        <span className="text-xs font-heading font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1.5 animate-fade-in">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Official PDF Downloaded to Your Device!
        </span>
      )}
    </div>
  );
}
