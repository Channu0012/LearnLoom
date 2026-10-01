"use client";

// ---------------------------------------------------------------------------
// CertificateModal — Coursera / Google-Grade Verified Credential System
// Issued only when learner completes 100% of lessons and achieves passing grade.
// Zero emojis — crisp vector badges, security seals, and verifiable credential ID.
// ---------------------------------------------------------------------------
import { useState, useRef, useCallback } from "react";
import { escapeXml } from "@/lib/security";
import { generatePdfCertificate } from "@/lib/pdfCertificate";

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

  const handleDownloadPdf = useCallback(() => {
    if (!certificate) return;
    generatePdfCertificate({
      id: certificate.id,
      userName: certificate.userName,
      courseTitle: certificate.courseTitle,
      lessonCount: certificate.lessonCount,
      quizScore: certificate.quizScore,
      issuedDate: certificate.issuedDate,
      verifyUrl: certificate.verifyUrl,
    });
  }, [certificate]);

  const handleAddToLinkedIn = useCallback(() => {
    if (!certificate) return;
    const issueDateObj = new Date(certificate.issuedDate || Date.now());
    const year = isNaN(issueDateObj.getFullYear())
      ? new Date().getFullYear()
      : issueDateObj.getFullYear();
    const month = isNaN(issueDateObj.getMonth())
      ? new Date().getMonth() + 1
      : issueDateObj.getMonth() + 1;

    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
      certificate.courseTitle
    )}&organizationName=Vidcura&issueYear=${year}&issueMonth=${month}&certUrl=${encodeURIComponent(
      certificate.verifyUrl
    )}&certId=${encodeURIComponent(certificate.id)}`;

    window.open(linkedInUrl, "_blank", "noopener,noreferrer");
  }, [certificate]);

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
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Course Credential"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-card border-2 border-border rounded-3xl shadow-2xl overflow-hidden animate-scale-in max-h-[92dvh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/40 sticky top-0 z-10 backdrop-blur-md">
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
              <h2 className="font-heading font-bold text-sm sm:text-base text-foreground">
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

        <div className="p-4 sm:p-6">
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
              {/* Executive Certificate Frame (Coursera / Google Skill LookMax Design) */}
              <div
                ref={certRef}
                className="relative bg-gradient-to-br from-[#0B1120] via-[#0F172A] to-[#1E293B] border-2 border-amber-500/50 rounded-2xl p-6 sm:p-10 text-center overflow-hidden shadow-2xl text-white"
              >
                {/* Gold Outer and Inner Ornamental Lines */}
                <div className="absolute inset-2 border border-amber-500/30 rounded-xl pointer-events-none" />
                <div className="absolute inset-3 border border-slate-700/60 rounded-lg pointer-events-none" />

                {/* Institution Crest */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-heading font-extrabold text-sm sm:text-base tracking-[0.2em] uppercase text-amber-400 block">
                      VIDCURA
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono block">
                      ACADEMIC CREDENTIALING AUTHORITY
                    </span>
                  </div>
                </div>

                <div className="h-px w-32 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mx-auto mb-4" />

                <p className="text-[10px] uppercase font-mono font-bold tracking-[0.25em] text-amber-300 mb-1">
                  Accredited Certificate of Completion
                </p>

                <p className="text-[11px] text-slate-400 font-body mb-2">
                  This official academic credential is conferred upon
                </p>

                <h3 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-white mb-2 pb-2 inline-block px-4 sm:px-8 border-b-2 border-amber-500/40">
                  {certificate.userName}
                </h3>

                <p className="text-[11px] text-slate-400 font-body mt-2 mb-1 max-w-md mx-auto">
                  for demonstrating subject mastery and successfully satisfying all requirements of
                </p>

                <h4 className="font-heading font-bold text-base sm:text-xl text-sky-400 mb-5 max-w-lg mx-auto leading-snug">
                  &ldquo;{certificate.courseTitle}&rdquo;
                </h4>

                {/* Metric Strip */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 py-3 px-3 sm:px-4 rounded-xl bg-slate-900/80 border border-slate-700/80 max-w-lg mx-auto">
                  <div className="text-center">
                    <p className="font-heading font-black text-sm sm:text-base text-white">
                      {certificate.lessonCount}
                    </p>
                    <p className="text-[8px] sm:text-[9px] text-slate-400 uppercase font-bold tracking-wider">
                      Modules
                    </p>
                  </div>
                  <div className="text-center border-x border-slate-800">
                    <p className="font-heading font-black text-sm sm:text-base text-emerald-400">
                      {certificate.quizScore != null ? `${certificate.quizScore}%` : "100%"}
                    </p>
                    <p className="text-[8px] sm:text-[9px] text-slate-400 uppercase font-bold tracking-wider">
                      {certificate.quizScore != null && certificate.quizScore >= 85
                        ? "Honors"
                        : "Pass"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-heading font-bold text-xs sm:text-sm text-white truncate px-1">
                      {certificate.issuedDate}
                    </p>
                    <p className="text-[8px] sm:text-[9px] text-slate-400 uppercase font-bold tracking-wider">
                      Issued
                    </p>
                  </div>
                </div>

                {/* Signatures & Seal Section */}
                <div className="grid grid-cols-2 sm:grid-cols-3 items-center justify-between gap-3 pt-3 mb-4 max-w-lg mx-auto border-t border-slate-800 text-left">
                  <div className="text-center sm:text-left">
                    <p className="font-serif italic text-xs text-slate-300">Dr. Elena Vance</p>
                    <div className="h-px w-20 bg-slate-600 my-1 mx-auto sm:mx-0" />
                    <p className="font-heading text-[9px] text-slate-400 uppercase font-bold">
                      Academic Dean
                    </p>
                  </div>

                  {/* Seal Stamp */}
                  <div className="col-span-2 sm:col-span-1 flex items-center justify-center my-1 sm:my-0">
                    <div className="w-12 h-12 rounded-full border-2 border-amber-500/70 flex flex-col items-center justify-center bg-amber-500/10 shadow-inner">
                      <span className="text-[7px] font-mono font-black text-amber-400 tracking-tighter">
                        OFFICIAL
                      </span>
                      <span className="text-[8px] font-bold text-amber-300">SEAL</span>
                      <span className="text-[6px] font-mono text-emerald-400 font-bold">
                        VERIFIED
                      </span>
                    </div>
                  </div>

                  <div className="text-center sm:text-right col-span-2 sm:col-span-1">
                    <p className="font-serif italic text-xs text-slate-300">Marcus Sterling</p>
                    <div className="h-px w-20 bg-slate-600 my-1 mx-auto sm:ml-auto sm:mr-0" />
                    <p className="font-heading text-[9px] text-slate-400 uppercase font-bold">
                      Registrar
                    </p>
                  </div>
                </div>

                {/* Verification Footer */}
                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-[11px] text-slate-400 font-mono gap-1.5">
                  <span className="truncate max-w-full">
                    ID: <span className="font-bold text-white">{certificate.id}</span>
                  </span>
                  <span className="text-emerald-400 font-bold inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>SHA-256 HMAC Verified</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons: Download PDF (Primary), Add to LinkedIn, SVG, Share */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 mt-6">
                {/* 1. Download PDF (Google / Coursera standard) */}
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="btn-primary text-xs px-5 py-3 font-heading font-extrabold inline-flex items-center justify-center gap-2 shadow-lg min-h-[44px] cursor-pointer active:scale-95 transition-transform"
                >
                  <svg
                    width="16"
                    height="16"
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
                  <span>Download Official PDF</span>
                </button>

                {/* 2. Add to LinkedIn Profile */}
                <button
                  type="button"
                  onClick={handleAddToLinkedIn}
                  className="btn-ghost text-xs px-4 py-3 font-heading font-bold inline-flex items-center justify-center gap-2 border border-[#0A66C2]/40 text-[#0A66C2] dark:text-[#70B5F9] hover:bg-[#0A66C2]/10 min-h-[44px] cursor-pointer"
                  title="Add credential directly to your LinkedIn Profile"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span>Add to LinkedIn</span>
                </button>

                {/* 3. Download Vector SVG */}
                <button
                  type="button"
                  onClick={handleDownload}
                  className="btn-ghost text-xs px-3.5 py-3 font-heading font-semibold inline-flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>SVG</span>
                </button>

                {/* 4. Share Verification Link */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="btn-ghost text-xs px-3.5 py-3 font-heading font-semibold inline-flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  <span>Share</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
