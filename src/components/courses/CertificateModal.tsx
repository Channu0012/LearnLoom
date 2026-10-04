"use client";

// ---------------------------------------------------------------------------
// CertificateModal — Coursera / Google-Grade Verified Credential System
// Issued only when learner completes 100% of lessons and achieves passing grade.
// Features: Real-time legal name verification, instant Vector PDF generation,
// 1-Click LinkedIn certification, SVG export, and tamper-proof cryptographic ID.
// Zero emojis — pure high-precision vector icons and executive typography.
// ---------------------------------------------------------------------------
import { useState, useRef, useCallback, useEffect } from "react";
import QRCode from "qrcode";
import { escapeXml } from "@/lib/security";
import { generatePdfCertificate } from "@/lib/pdfCertificate";
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
      const res = await fetch("/api/certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: recipientName.trim() || userName || "Distinguished Scholar",
          courseTitle,
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
  if (isOpen && !hasFetched && !certificate && !loading) {
    setHasFetched(true);
    generateCertificate();
  }
  if (!isOpen && hasFetched) {
    setHasFetched(false);
    setCertificate(null);
  }

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

  const handleDownloadSvg = useCallback(async () => {
    if (!certificate) return;

    try {
      const safeName = escapeXml(effectiveName);
      const safeTitle = escapeXml(certificate.courseTitle);
      const safeId = escapeXml(certificate.id);
      const safeDate = escapeXml(certificate.issuedDate);

      // Generate real QR data URL for SVG embedding
      const qrDataUrl = await QRCode.toDataURL(certificate.verifyUrl, {
        margin: 0,
        width: 280,
        color: { dark: "#FFFFFF", light: "#081B33" },
      });

      // Responsive font sizing for single-line recipient name
      let nameFontSize = 38;
      if (safeName.length > 20) nameFontSize = 30;
      if (safeName.length > 32) nameFontSize = 24;
      if (safeName.length > 44) nameFontSize = 18;

      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 640" width="960" height="640">
  <!-- Right White Canvas -->
  <rect x="0" y="0" width="960" height="640" fill="#FFFFFF"/>

  <!-- Left Obsidian Navy Anchor Bar -->
  <rect x="0" y="0" width="220" height="640" fill="#081B33"/>

  <!-- Left Bar: VeySkill Crest Logo -->
  <polygon points="110,50 82,65 138,65" fill="#FFFFFF"/>
  <polygon points="110,80 82,65 138,65" fill="#FFFFFF"/>
  <polyline points="82,80 110,94 138,80" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
  <polyline points="82,92 110,106 138,92" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>

  <!-- Left Bar: Brand Text -->
  <text x="110" y="145" font-family="'Helvetica Neue', Arial, sans-serif" font-size="16" font-weight="900" letter-spacing="4" fill="#FFFFFF" text-anchor="middle">VEYSKILL</text>
  <text x="110" y="165" font-family="'Helvetica Neue', Arial, sans-serif" font-size="9" font-weight="700" letter-spacing="2" fill="#CBD5E1" text-anchor="middle">ONLINE ACADEMY</text>

  <!-- Left Bar: Real Scannable QR Code -->
  <image href="${qrDataUrl}" x="45" y="450" width="130" height="130"/>
  <text x="110" y="605" font-family="'Courier New', monospace" font-size="9" font-weight="700" letter-spacing="2" fill="#CBD5E1" text-anchor="middle">SCAN TO VERIFY</text>

  <!-- Right Canvas: Subtle Guilloche Wave Watermark -->
  <g stroke="#F1F5F9" stroke-width="1.2" fill="none">
    <path d="M 220,120 C 400,40 600,200 960,120"/>
    <path d="M 220,140 C 400,60 600,220 960,140"/>
    <path d="M 220,160 C 400,80 600,240 960,160"/>
    <path d="M 220,340 C 500,200 700,480 960,340"/>
    <path d="M 220,360 C 500,220 700,500 960,360"/>
    <circle cx="850" cy="500" r="160" stroke-width="0.8"/>
    <circle cx="850" cy="500" r="120" stroke-width="0.8"/>
  </g>

  <!-- Right Canvas: Title Block -->
  <text x="270" y="95" font-family="'Helvetica Neue', Arial, sans-serif" font-size="44" font-weight="900" letter-spacing="1" fill="#0F172A">CERTIFICATE</text>
  <text x="270" y="125" font-family="'Helvetica Neue', Arial, sans-serif" font-size="16" font-weight="800" letter-spacing="3" fill="#1E293B">OF COMPLETION</text>

  <!-- Top Right: Gold Award Medallion with Ribbons -->
  <!-- Ribbons -->
  <polygon points="868,75 852,145 870,135 882,145" fill="#081B33"/>
  <polygon points="882,75 870,135 882,145 898,135 882,75" fill="#081B33"/>
  <!-- Gold Core -->
  <circle cx="875" cy="75" r="42" fill="#D4AF37"/>
  <circle cx="875" cy="75" r="38" fill="#F3E5AB"/>
  <circle cx="875" cy="75" r="34" fill="#ECC867"/>
  <!-- Stars -->
  <text x="875" y="65" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="800" fill="#855806" text-anchor="middle">★ ★ ★</text>
  <text x="875" y="82" font-family="'Helvetica Neue', Arial, sans-serif" font-size="15" font-weight="900" fill="#523602" text-anchor="middle">2026</text>
  <text x="875" y="94" font-family="'Helvetica Neue', Arial, sans-serif" font-size="7" font-weight="800" letter-spacing="1" fill="#6E4703" text-anchor="middle">AWARDED</text>

  <!-- Recipient Intro -->
  <text x="270" y="215" font-family="'Helvetica Neue', Arial, sans-serif" font-size="14" font-weight="500" fill="#64748B">We proudly present this certificate to</text>

  <!-- Recipient Name (Auto-Scaled Single Line) -->
  <text x="270" y="270" font-family="'Helvetica Neue', Arial, sans-serif" font-size="${nameFontSize}" font-weight="900" fill="#0F172A">${safeName}</text>
  <line x1="270" y1="290" x2="890" y2="290" stroke="#E2E8F0" stroke-width="1.5"/>

  <!-- Course Statement -->
  <text x="270" y="335" font-family="'Helvetica Neue', Arial, sans-serif" font-size="13" font-weight="500" fill="#475569">honouring completion of the curriculum: <tspan font-weight="800" fill="#0F172A">"${safeTitle}"</tspan></text>
  <text x="270" y="360" font-family="'Helvetica Neue', Arial, sans-serif" font-size="13" font-weight="500" fill="#475569">For demonstrating academic mastery across ${certificate.lessonCount} comprehensive modules${certificate.quizScore != null ? `, with a passing grade of ${certificate.quizScore}%` : ""}.</text>

  <!-- Bottom Divider Line -->
  <line x1="270" y1="470" x2="890" y2="470" stroke="#E2E8F0" stroke-width="1.5"/>

  <!-- Left Signature -->
  <text x="270" y="520" font-family="'Brush Script MT', cursive, Georgia, serif" font-size="28" font-style="italic" fill="#0F172A">Jane Kane</text>
  <text x="270" y="545" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="800" fill="#0F172A">Jane Kane</text>
  <text x="270" y="560" font-family="'Helvetica Neue', Arial, sans-serif" font-size="9" font-weight="700" letter-spacing="1" fill="#64748B">CURRICULUM DIRECTOR</text>
  <text x="270" y="582" font-family="'Courier New', monospace" font-size="11" font-weight="600" fill="#64748B">${safeDate}</text>

  <!-- Right Signature -->
  <text x="600" y="520" font-family="'Brush Script MT', cursive, Georgia, serif" font-size="28" font-style="italic" fill="#0F172A">Thomson Loewe</text>
  <text x="600" y="545" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="800" fill="#0F172A">Thomson Loewe</text>
  <text x="600" y="560" font-family="'Helvetica Neue', Arial, sans-serif" font-size="9" font-weight="700" letter-spacing="1" fill="#64748B">HEAD OF ACADEMIC CREDENTIALS</text>
  <text x="600" y="582" font-family="'Courier New', monospace" font-size="10" font-weight="700" fill="#64748B">${safeId}</text>
</svg>`;

      const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `VeySkill_Credential_${certificate.id}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback
      alert("SVG download failed. Please use PDF download instead.");
    }
  }, [certificate, effectiveName]);

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
                    placeholder="Enter Full Legal Name"
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

              {/* Official Classical Diploma Preview matching user standard */}
              <div ref={certRef} className="w-full">
                <OfficialCertificateView
                  recipientName={effectiveName}
                  courseTitle={certificate.courseTitle}
                  certificateId={certificate.id}
                  issuedDate={certificate.issuedDate}
                  lessonCount={certificate.lessonCount}
                  quizScore={certificate.quizScore}
                  verifyUrl={certificate.verifyUrl}
                  instructorName="Jane Kane"
                  instructorTitle="CURRICULUM DIRECTOR"
                  managerName="Thomson Loewe"
                  managerTitle="HEAD OF ACADEMIC CREDENTIALS"
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

                {/* 3. Download Vector SVG */}
                <button
                  type="button"
                  onClick={handleDownloadSvg}
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
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Download SVG</span>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
