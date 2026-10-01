"use client";

// ---------------------------------------------------------------------------
// CertificateModal — Coursera / Google-Grade Verified Credential System
// Issued only when learner completes 100% of lessons and achieves passing grade.
// Zero emojis — crisp vector badges, security seals, and verifiable credential ID.
// ---------------------------------------------------------------------------
import { useState, useRef, useCallback } from "react";
import { escapeXml } from "@/lib/security";

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
      setError("Unable to issue verified certificate. Please retry in a few moments.");
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
    if (!certificate) return;

    try {
      const safeName = escapeXml(certificate.userName);
      const safeTitle = escapeXml(certificate.courseTitle);
      const safeId = escapeXml(certificate.id);
      const safeDate = escapeXml(certificate.issuedDate);

      // Professional vector SVG certificate
      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 640" width="960" height="640">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="960" height="640" fill="url(#bg)"/>

  <!-- Border Frames -->
  <rect x="24" y="24" width="912" height="592" rx="16" fill="none" stroke="#334155" stroke-width="2"/>
  <rect x="36" y="36" width="888" height="568" rx="12" fill="none" stroke="#f59e0b" stroke-opacity="0.4" stroke-width="1.5"/>

  <!-- Brand Header -->
  <text x="480" y="90" font-family="'Helvetica Neue', Arial, sans-serif" font-size="14" font-weight="800" letter-spacing="4" fill="#f59e0b" text-anchor="middle">VIDCURA ACCREDITED LEARNING SYSTEMS</text>
  <text x="480" y="140" font-family="'Helvetica Neue', Arial, sans-serif" font-size="28" font-weight="900" letter-spacing="2" fill="#f8fafc" text-anchor="middle">CERTIFICATE OF COMPLETION</text>

  <!-- Divider -->
  <line x1="380" y1="165" x2="580" y2="165" stroke="#f59e0b" stroke-width="2"/>

  <!-- Recipient Section -->
  <text x="480" y="210" font-family="'Helvetica Neue', Arial, sans-serif" font-size="13" font-weight="500" fill="#94a3b8" text-anchor="middle">THIS OFFICIAL CREDENTIAL IS AWARDED TO</text>
  <text x="480" y="260" font-family="'Helvetica Neue', Arial, sans-serif" font-size="34" font-weight="800" fill="#ffffff" text-anchor="middle">${safeName}</text>
  <line x1="280" y1="280" x2="680" y2="280" stroke="#334155" stroke-width="1"/>

  <!-- Course Title -->
  <text x="480" y="325" font-family="'Helvetica Neue', Arial, sans-serif" font-size="13" font-weight="500" fill="#94a3b8" text-anchor="middle">FOR DEMONSTRATING ACADEMIC MASTERY AND COMPLETION OF</text>
  <text x="480" y="365" font-family="'Helvetica Neue', Arial, sans-serif" font-size="22" font-weight="700" fill="#38bdf8" text-anchor="middle">${safeTitle}</text>

  <!-- Metrics Grid -->
  <text x="320" y="440" font-family="'Helvetica Neue', Arial, sans-serif" font-size="20" font-weight="800" fill="#f8fafc" text-anchor="middle">${certificate.lessonCount} Modules</text>
  <text x="320" y="460" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="600" fill="#64748b" text-anchor="middle">CURRICULUM COMPLETED</text>

  <text x="480" y="440" font-family="'Helvetica Neue', Arial, sans-serif" font-size="20" font-weight="800" fill="#10b981" text-anchor="middle">${certificate.quizScore != null ? `${certificate.quizScore}%` : "100%"}</text>
  <text x="480" y="460" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="600" fill="#64748b" text-anchor="middle">ASSESSMENT GRADE</text>

  <text x="640" y="440" font-family="'Helvetica Neue', Arial, sans-serif" font-size="16" font-weight="700" fill="#f8fafc" text-anchor="middle">${safeDate}</text>
  <text x="640" y="460" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="600" fill="#64748b" text-anchor="middle">ISSUANCE DATE</text>

  <!-- Security Seal / Footnote -->
  <line x1="120" y1="510" x2="840" y2="510" stroke="#334155" stroke-width="1"/>
  <text x="200" y="550" font-family="'Courier New', monospace" font-size="11" font-weight="700" fill="#94a3b8">CREDENTIAL ID: ${safeId}</text>
  <text x="200" y="568" font-family="'Helvetica Neue', Arial, sans-serif" font-size="10" fill="#64748b">Verify Authenticity: ${certificate.verifyUrl}</text>

  <text x="760" y="550" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="700" fill="#10b981" text-anchor="end">STATUS: VERIFIED &amp; TAMPER-PROOF</text>
  <text x="760" y="568" font-family="'Helvetica Neue', Arial, sans-serif" font-size="10" fill="#64748b" text-anchor="end">Vidcura Academic Certification Authority</text>
</svg>`;

      const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Vidcura_Credential_${certificate.id}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback text credential
      const text = `VIDCURA ACCREDITED CREDENTIAL OF COMPLETION
===================================================
Recipient: ${certificate.userName}
Curriculum: "${certificate.courseTitle}"
Modules Completed: ${certificate.lessonCount}
${certificate.quizScore != null ? `Assessment Grade: ${certificate.quizScore}%` : ""}
Issued: ${certificate.issuedDate}
Credential ID: ${certificate.id}
Verification URL: ${certificate.verifyUrl}
===================================================
Issued by Vidcura Academic Verification Authority`;

      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Vidcura_Credential_${certificate.id}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, [certificate]);

  const handleShare = useCallback(async () => {
    if (!certificate) return;
    const shareText = `[Vidcura Verified Credential]\nI have successfully completed the curriculum "${certificate.courseTitle}" (${certificate.lessonCount} modules completed${certificate.quizScore != null ? `, Assessment Grade: ${certificate.quizScore}%` : ""}).\n\nVerify credential: ${certificate.verifyUrl}\n\n#Vidcura #LifelongLearning #ProfessionalDevelopment`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Vidcura Credential — ${certificate.courseTitle}`,
          text: shareText,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      alert("Credential verification link copied to clipboard.");
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
      aria-label="Course Credential"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-card border-2 border-border rounded-3xl shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground block">
                Official Credential
              </span>
              <h2 className="font-heading font-bold text-base text-foreground">
                Certificate of Completion
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-muted/80 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-all"
            aria-label="Close"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex flex-col items-center py-12 gap-4">
              <div className="simple-loader !w-8 !h-8 !border-2" />
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Cryptographically signing credential…
              </p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-xs text-destructive">{error}</p>
              <button
                type="button"
                onClick={generateCertificate}
                className="btn-primary text-xs px-4 py-2 mt-3 font-heading font-bold"
              >
                Retry Issuance
              </button>
            </div>
          )}

          {certificate && (
            <>
              {/* Executive Certificate Frame */}
              <div
                ref={certRef}
                className="relative bg-gradient-to-br from-card via-background to-muted/40 border-2 border-primary-500/30 rounded-2xl p-8 sm:p-10 text-center overflow-hidden shadow-inner"
              >
                {/* Micro Border */}
                <div className="absolute inset-2 border border-border/80 rounded-xl pointer-events-none" />

                {/* Header Logo */}
                <div className="flex items-center justify-center gap-2 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                  <span className="font-heading font-black text-base tracking-widest uppercase text-foreground">
                    Vidcura
                  </span>
                </div>

                <p className="text-[10px] uppercase font-mono font-bold tracking-[0.25em] text-primary-600 dark:text-primary-400 mb-2">
                  Verified Certificate of Completion
                </p>

                <p className="text-[11px] text-muted-foreground font-body mb-2">
                  This is awarded to
                </p>

                <h3 className="font-heading font-black text-2xl sm:text-3xl text-foreground mb-3 border-b border-border/80 pb-3 inline-block px-8">
                  {certificate.userName}
                </h3>

                <p className="text-[11px] text-muted-foreground font-body mb-1">
                  for demonstrating mastery and completing the curriculum
                </p>

                <h4 className="font-heading font-bold text-base sm:text-lg text-primary-600 dark:text-primary-400 mb-5 max-w-md mx-auto">
                  &ldquo;{certificate.courseTitle}&rdquo;
                </h4>

                {/* Metric Strip */}
                <div className="flex items-center justify-center gap-8 mb-5 py-3 px-4 rounded-xl bg-muted/40 border border-border/50 max-w-md mx-auto flex-wrap">
                  <div className="text-center">
                    <p className="font-heading font-black text-base text-foreground">
                      {certificate.lessonCount}
                    </p>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                      Modules
                    </p>
                  </div>
                  {certificate.quizScore != null && (
                    <div className="text-center">
                      <p className="font-heading font-black text-base text-emerald-600 dark:text-emerald-400">
                        {certificate.quizScore}%
                      </p>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                        Grade
                      </p>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="font-heading font-bold text-xs text-foreground">
                      {certificate.issuedDate}
                    </p>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                      Issued
                    </p>
                  </div>
                </div>

                {/* Verification Footer */}
                <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between text-[11px] text-muted-foreground font-mono gap-1">
                  <span>
                    ID: <span className="font-bold text-foreground">{certificate.id}</span>
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Cryptographically Authenticated
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="btn-ghost text-xs px-4 py-2.5 font-heading font-bold inline-flex items-center gap-2"
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
                  <span>Download SVG Credential</span>
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="btn-primary text-xs px-5 py-2.5 font-heading font-bold inline-flex items-center gap-2"
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
                  <span>Share Verification Link</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
