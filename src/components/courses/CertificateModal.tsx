"use client";

// ---------------------------------------------------------------------------
// CertificateModal — Professional course completion certificate
// Shareable, downloadable, with unique verification ID
// ---------------------------------------------------------------------------
import { useState, useRef, useCallback } from "react";

interface CertificateData {
  id: string;
  userName: string;
  courseTitle: string;
  lessonCount: number;
  quizScore: number | null;
  issuedDate: string;
  verifyUrl: string;
}

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  courseTitle: string;
  lessonCount: number;
  quizScore?: number | null;
  quizTotal?: number;
}

export function CertificateModal({
  isOpen,
  onClose,
  userName,
  courseTitle,
  lessonCount,
  quizScore,
  quizTotal,
}: CertificateModalProps) {
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const certRef = useRef<HTMLDivElement>(null);

  const generateCertificate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName,
          courseTitle,
          lessonCount,
          quizScore:
            quizScore != null && quizTotal ? Math.round((quizScore / quizTotal) * 100) : null,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate certificate");
      const data = await res.json();
      setCertificate(data.certificate);
    } catch {
      setError("Could not generate certificate. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [userName, courseTitle, lessonCount, quizScore, quizTotal]);

  const [hasFetched, setHasFetched] = useState(false);
  if (isOpen && !hasFetched && !certificate && !loading) {
    setHasFetched(true);
    generateCertificate();
  }
  if (!isOpen && hasFetched) {
    setHasFetched(false);
    setCertificate(null);
  }

  const handleDownload = useCallback(async () => {
    if (!certRef.current) return;
    try {
      // Use html2canvas-like approach with SVG foreignObject
      const certEl = certRef.current;
      const svgData = `
        <svg xmlns="http://www.w3.org/2000/svg" width="800" height="560">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml">${certEl.outerHTML}</div>
          </foreignObject>
        </svg>`;
      const blob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Vidcura_Certificate_${certificate?.id || "cert"}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: download as text
      const text = `
CERTIFICATE OF COMPLETION
━━━━━━━━━━━━━━━━━━━━━━━━━━

This certifies that

${certificate?.userName}

has successfully completed

"${certificate?.courseTitle}"

${certificate?.lessonCount} video lessons completed
${certificate?.quizScore != null ? `Quiz Score: ${certificate.quizScore}%` : ""}

Issued: ${certificate?.issuedDate}
Certificate ID: ${certificate?.id}
Verify at: ${certificate?.verifyUrl}

Issued by Vidcura — Turn Videos Into Mastery
      `;
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Vidcura_Certificate_${certificate?.id || "cert"}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, [certificate]);

  const handleShare = useCallback(async () => {
    if (!certificate) return;
    const shareText = `🎓 I just earned a Certificate of Completion for "${certificate.courseTitle}" on Vidcura!\n\n📋 ${certificate.lessonCount} lessons completed${certificate.quizScore != null ? `\n🎯 Quiz Score: ${certificate.quizScore}%` : ""}\n\nVerify: ${certificate.verifyUrl}\n\n#Vidcura #Learning #Certificate`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Vidcura Certificate — ${certificate.courseTitle}`,
          text: shareText,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      alert("Certificate details copied to clipboard!");
    } catch {
      // Unable to copy
    }
  }, [certificate]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Course Certificate"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-card border-2 border-border rounded-3xl shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-gradient-to-r from-amber-50 to-emerald-50 dark:from-amber-950/30 dark:to-emerald-950/30">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <h2 className="font-heading font-bold text-lg text-foreground">
              Certificate of Completion
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-muted/80 hover:bg-muted flex items-center justify-center text-muted-foreground cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex flex-col items-center py-12 gap-4">
              <div className="simple-loader !w-8 !h-8 !border-2" />
              <p className="text-sm text-muted-foreground">Generating your certificate…</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-sm text-destructive">{error}</p>
              <button
                type="button"
                onClick={generateCertificate}
                className="btn-primary text-xs px-4 py-2 mt-3"
              >
                Retry
              </button>
            </div>
          )}

          {certificate && (
            <>
              {/* The Certificate */}
              <div
                ref={certRef}
                className="relative bg-gradient-to-br from-white via-amber-50/30 to-emerald-50/30 dark:from-neutral-900 dark:via-amber-950/20 dark:to-emerald-950/20 border-2 border-amber-300/50 dark:border-amber-700/30 rounded-2xl p-8 sm:p-10 text-center overflow-hidden"
                style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
              >
                {/* Decorative borders */}
                <div className="absolute inset-3 border border-amber-200/40 dark:border-amber-700/20 rounded-xl pointer-events-none" />

                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                  <span className="font-heading font-black text-lg tracking-tight text-foreground">
                    Vidcura
                  </span>
                </div>

                <p className="text-[10px] uppercase font-extrabold tracking-[0.3em] text-amber-700 dark:text-amber-400 mb-3">
                  Certificate of Completion
                </p>

                <p className="text-xs text-muted-foreground font-body mb-1">This certifies that</p>

                <h3 className="font-heading font-black text-2xl sm:text-3xl text-foreground mb-3 border-b-2 border-amber-300/50 dark:border-amber-700/30 pb-3 inline-block px-6">
                  {certificate.userName}
                </h3>

                <p className="text-xs text-muted-foreground font-body mb-2">
                  has successfully completed
                </p>

                <h4 className="font-heading font-bold text-lg sm:text-xl text-primary-600 dark:text-primary-400 mb-4 max-w-md mx-auto">
                  &ldquo;{certificate.courseTitle}&rdquo;
                </h4>

                {/* Stats */}
                <div className="flex items-center justify-center gap-6 mb-5 flex-wrap">
                  <div className="text-center">
                    <p className="font-heading font-black text-lg text-foreground">
                      {certificate.lessonCount}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Lessons</p>
                  </div>
                  {certificate.quizScore != null && (
                    <div className="text-center">
                      <p className="font-heading font-black text-lg text-foreground">
                        {certificate.quizScore}%
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">
                        Quiz Score
                      </p>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="font-heading font-bold text-sm text-foreground">
                      {certificate.issuedDate}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Issued</p>
                  </div>
                </div>

                {/* Verification */}
                <div className="pt-4 border-t border-amber-200/40 dark:border-amber-700/20">
                  <p className="text-[10px] text-muted-foreground font-body">
                    Certificate ID:{" "}
                    <span className="font-heading font-bold text-foreground">{certificate.id}</span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="btn-ghost text-xs px-4 py-2.5 inline-flex items-center gap-1.5"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download Certificate
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-1.5"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  Share Certificate
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
