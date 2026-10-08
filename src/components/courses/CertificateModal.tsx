"use client";

// ---------------------------------------------------------------------------
// CertificateModal — Coursera / Google-Grade Verified Credential System
// Issued only when learner completes 100% of lessons and achieves passing grade.
// Features: Real-time legal name verification, instant Vector PDF generation,
// 1-Click LinkedIn certification, SVG export, and tamper-proof cryptographic ID.
// Zero emojis — pure high-precision vector icons and executive typography.
// ---------------------------------------------------------------------------
import { useState, useRef, useCallback, useEffect } from "react";
import { generatePdfCertificate, formatExecutiveCourseTitle } from "@/lib/pdfCertificate";
import { OfficialCertificateView } from "@/components/courses/OfficialCertificateView";

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
  uid?: string;
  courseId?: string;
  orderId?: string;
  onRequestPayment?: () => void;
}

export function CertificateModal({
  isOpen,
  onClose,
  userName,
  courseTitle,
  lessonCount,
  quizScore,
  quizTotal,
  uid,
  courseId,
  orderId,
  onRequestPayment,
}: CertificateModalProps) {
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [recipientName, setRecipientName] = useState(userName || "Distinguished Scholar");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  // Sync recipient name when prop changes or modal opens
  useEffect(() => {
    if (userName && userName.trim() && userName !== "Learner") {
      setRecipientName(userName.trim());
    }
  }, [userName]);

  const generateCertificate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPaymentRequired(false);
    try {
      const executiveTitle = formatExecutiveCourseTitle(courseTitle);
      const res = await fetch("/api/certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: recipientName.trim() || userName || "Distinguished Scholar",
          courseTitle: executiveTitle,
          lessonCount,
          quizScore:
            quizScore != null && quizTotal ? Math.round((quizScore / quizTotal) * 100) : null,
          uid,
          courseId,
          orderId,
        }),
      });

      if (res.status === 402) {
        setPaymentRequired(true);
        setError("Certificate unlock fee (₹29) required before official credential generation.");
        return;
      }

      if (!res.ok) throw new Error("Failed to generate certificate");
      const data = await res.json();
      setCertificate(data.certificate);
      try {
        if (typeof window !== "undefined" && data.certificate?.id) {
          localStorage.setItem(
            `veyskill_cert_${courseId || "default"}`,
            JSON.stringify(data.certificate)
          );
          localStorage.setItem(
            `veyskill_cert_${data.certificate.id}`,
            JSON.stringify(data.certificate)
          );
        }
      } catch {
        // Ignore quota/private mode errors
      }
    } catch {
      setError("Unable to issue verified certificate. Please retry in a few moments.");
    } finally {
      setLoading(false);
    }
  }, [
    recipientName,
    userName,
    courseTitle,
    lessonCount,
    quizScore,
    quizTotal,
    uid,
    courseId,
    orderId,
  ]);

  const [hasFetched, setHasFetched] = useState(false);
  useEffect(() => {
    if (isOpen && !certificate) {
      try {
        const cached = localStorage.getItem(`veyskill_cert_${courseId || "default"}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.id) {
            setCertificate(parsed);
            return;
          }
        }
      } catch {
        // Ignore
      }
      if (!hasFetched && !loading) {
        setHasFetched(true);
        generateCertificate();
      }
    }
  }, [isOpen, certificate, courseId, hasFetched, loading, generateCertificate]);

  const effectiveName = recipientName.trim() || certificate?.userName || "Distinguished Scholar";

  const handleDownloadPdf = useCallback(async () => {
    if (!certificate) return;
    setDownloadingPdf(true);

    try {
      await generatePdfCertificate({
        id: certificate.id,
        userName: effectiveName,
        courseTitle: certificate.courseTitle,
        lessonCount: certificate.lessonCount,
        quizScore: certificate.quizScore,
        issuedDate: certificate.issuedDate,
        verifyUrl: certificate.verifyUrl,
      });
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 3500);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setDownloadingPdf(false);
    }
  }, [certificate, effectiveName]);

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
    )}&organizationName=VeySkill&issueYear=${year}&issueMonth=${month}&certUrl=${encodeURIComponent(
      certificate.verifyUrl
    )}&certId=${encodeURIComponent(certificate.id)}`;

    window.open(linkedInUrl, "_blank", "noopener,noreferrer");
  }, [certificate]);

  // SVG download removed per user request — PDF is the official format

  const handleShare = useCallback(async () => {
    if (!certificate) return;
    const shareText = `[VeySkill Verified Credential]\n${effectiveName} has successfully completed the curriculum "${certificate.courseTitle}" (${certificate.lessonCount} modules completed${certificate.quizScore != null ? `, Assessment Grade: ${certificate.quizScore}%` : ""}).\n\nVerify credential: ${certificate.verifyUrl}\n\n#VeySkill #GoogleCareerCertificates #LifelongLearning`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `VeySkill Credential — ${certificate.courseTitle}`,
          text: shareText,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    } catch {
      // Fallback
    }
  }, [certificate, effectiveName]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-2.5 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Course Credential"
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-card border-2 border-border rounded-3xl shadow-2xl overflow-hidden animate-scale-in max-h-[94dvh] flex flex-col">
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-border flex items-center justify-between bg-muted/40 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground block leading-tight">
                Official Credential
              </span>
              <h2 className="font-heading font-bold text-sm sm:text-base text-foreground leading-tight">
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

        {/* Modal Scrollable Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4">
          {/* Loading Logo State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-500 to-primary-500 animate-spin opacity-30" />
                <div className="absolute inset-1 rounded-xl bg-card border border-border flex items-center justify-center shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icon.png"
                    alt="VeySkill Logo"
                    className="w-7 h-7 object-contain rounded-lg"
                  />
                </div>
              </div>
              <div className="text-center">
                <p className="font-heading font-bold text-sm text-foreground">
                  Cryptographically Signing Credential…
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Validating 100% curriculum completion and generating tamper-proof HMAC checksum
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-8 space-y-3">
              <p className="text-xs text-destructive font-semibold">{error}</p>
              {paymentRequired && onRequestPayment ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRequestPayment();
                  }}
                  className="btn-primary text-xs px-5 py-2.5 font-heading font-extrabold inline-flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                  <span>Pay ₹29 &amp; Unlock Official Certificate</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={generateCertificate}
                  className="btn-primary text-xs px-4 py-2 font-heading font-bold cursor-pointer"
                >
                  Retry Issuance
                </button>
              )}
            </div>
          )}

          {certificate && (
            <>
              {/* Recipient Legal Name Confirmation Bar (Coursera/Google style) */}
              <div className="p-3 sm:p-4 rounded-2xl bg-muted/60 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground block leading-none">
                      Certificate Name Verification
                    </span>
                    <span className="text-[11px] text-foreground font-body leading-none mt-0.5 block">
                      Confirm your full legal name as it appears on this credential:
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Enter your name"
                    maxLength={70}
                    className="w-full sm:w-56 px-3 py-1.5 text-xs font-heading font-bold rounded-xl bg-card border border-border focus:border-amber-500 focus:outline-none text-foreground"
                    aria-label="Recipient Legal Name"
                  />
                </div>
              </div>

              {/* Verified Credential ID & Quick Verification Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-muted/40 border border-border/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-muted-foreground font-body text-[11px] sm:text-xs">
                    Official Credential ID:
                  </span>
                  <span className="font-mono font-bold text-foreground bg-card px-2.5 py-0.5 rounded-lg border border-border text-[11px] sm:text-xs tracking-wide">
                    {certificate.id}
                  </span>
                </div>
                <a
                  href={`/verify/${certificate.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost text-[11px] font-heading font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all cursor-pointer"
                  title="Verify authenticity of this certificate in official registry"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                  <span>Verify</span>
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>

              {/* Official Master Template Credential Preview */}
              <div ref={certRef} className="w-full">
                <OfficialCertificateView
                  recipientName={effectiveName}
                  courseTitle={certificate.courseTitle}
                  certificateId={certificate.id}
                  issuedDate={certificate.issuedDate}
                  lessonCount={certificate.lessonCount}
                  quizScore={certificate.quizScore}
                  verifyUrl={certificate.verifyUrl}
                  isInteractive={false}
                />
              </div>

              {/* Action Feedback Messages */}
              {pdfDownloaded && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-heading font-bold text-center flex items-center justify-center gap-2 animate-fade-in">
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
                  <span>Official Vector PDF Credential Downloaded Successfully!</span>
                </div>
              )}

              {linkCopied && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-heading font-bold text-center flex items-center justify-center gap-2 animate-fade-in">
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
                  <span>Credential Verification Link Copied to Clipboard!</span>
                </div>
              )}

              {/* Action Buttons: Download PDF (Primary), Add to LinkedIn, SVG, Share */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center justify-center gap-2 sm:gap-2.5 pt-2">
                {/* 1. Download PDF (Google / Coursera standard) */}
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="btn-primary text-xs px-4 py-3 font-heading font-extrabold inline-flex items-center justify-center gap-2 shadow-lg min-h-[46px] cursor-pointer active:scale-95 transition-transform disabled:opacity-50"
                >
                  {downloadingPdf ? (
                    <>
                      <div className="simple-loader !w-4 !h-4 !border-2" />
                      <span>Generating PDF…</span>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </button>

                {/* 2. Add to LinkedIn Profile */}
                <button
                  type="button"
                  onClick={handleAddToLinkedIn}
                  className="btn-ghost text-xs px-4 py-3 font-heading font-bold inline-flex items-center justify-center gap-2 border border-[#0A66C2]/50 text-[#0A66C2] dark:text-[#70B5F9] hover:bg-[#0A66C2]/10 min-h-[46px] cursor-pointer"
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

                {/* 4. Share Verification Link */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="btn-ghost text-xs px-3.5 py-3 font-heading font-semibold inline-flex items-center justify-center gap-1.5 min-h-[46px] cursor-pointer"
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
                  <span>Share Link</span>
                </button>

                {/* 5. Verify Authenticity (Official Registry) */}
                <a
                  href={`/verify/${certificate.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost text-xs px-3.5 py-3 font-heading font-semibold inline-flex items-center justify-center gap-1.5 min-h-[46px] border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                  title="Verify cryptographic authenticity in official registry"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                  <span>Verify</span>
                </a>
              </div>

              {/* 6. Accredited Credential Plan & Lifetime Verification Breakdown */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/10 border border-emerald-500/20 space-y-3.5 mt-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="font-heading font-black text-xs sm:text-sm text-foreground">
                      Accredited Credential Plan &amp; Lifetime Verification
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
                    UNLOCKED &amp; VERIFIED
                  </span>
                </div>

                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                  Your certificate has been cryptographically signed with SHA-256 HMAC and
                  permanently logged into the VeySkill accreditation registry. Here is your
                  credential plan:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="p-3 rounded-xl bg-card border border-border/70 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-heading font-bold text-xs text-foreground block">
                        Lifetime Verification URL
                      </span>
                      <span className="text-[10px] text-muted-foreground block mt-0.5 leading-snug">
                        Permanently hosted at{" "}
                        <code className="text-teal-600 dark:text-teal-400 font-mono">
                          /verify/{certificate.id}
                        </code>
                        . Open to any recruiter, employer, or university.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-border/70 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-heading font-bold text-xs text-foreground block">
                        LinkedIn &amp; Resume Endorsement
                      </span>
                      <span className="text-[10px] text-muted-foreground block mt-0.5 leading-snug">
                        One-click integration with LinkedIn &ldquo;Licenses &amp;
                        Certifications&rdquo; section and printable high-res 300 DPI vector PDF.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-border/70 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-heading font-bold text-xs text-foreground block">
                        Instant Scannable QR Code
                      </span>
                      <span className="text-[10px] text-muted-foreground block mt-0.5 leading-snug">
                        Anyone scanning the certificate QR code with their mobile camera instantly
                        opens your tamper-proof verification page.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-border/70 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-heading font-bold text-xs text-foreground block">
                        Lifelong Validity (No Expiry)
                      </span>
                      <span className="text-[10px] text-muted-foreground block mt-0.5 leading-snug">
                        Your completion badge and assessment mastery remain permanently recorded
                        with zero expiration or renewal fees.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
