"use client";

// ---------------------------------------------------------------------------
// OfficialCertificateView.tsx — Executive Brand Credential (Coursera/Google/AWS Standard)
// Modern split-layout with deep navy anchor bar, scannable QR code, gold award medallion,
// subtle anti-counterfeit guilloché waves, auto-scaling single-line name, and cryptographic ID.
// ---------------------------------------------------------------------------
import React, { useState, useEffect } from "react";
import QRCode from "qrcode";

interface OfficialCertificateViewProps {
  recipientName: string;
  courseTitle: string;
  certificateId: string;
  issuedDate: string;
  lessonCount?: number;
  quizScore?: number | null;
  verifyUrl?: string;
  instructorName?: string;
  instructorTitle?: string;
  managerName?: string;
  managerTitle?: string;
  isInteractive?: boolean;
  onNameChange?: (_name: string) => void;
}

export function OfficialCertificateView({
  recipientName,
  courseTitle,
  certificateId,
  issuedDate,
  lessonCount = 12,
  quizScore = null,
  verifyUrl,
  instructorName = "Jane Kane",
  instructorTitle = "CURRICULUM DIRECTOR",
  managerName = "Thomson Loewe",
  managerTitle = "HEAD OF ACADEMIC CREDENTIALS",
  isInteractive = false,
  onNameChange,
}: OfficialCertificateViewProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const effectiveVerifyUrl = verifyUrl || `https://veyskill.in/verify/${certificateId}`;

  // Generate real high-contrast scannable QR code (white on transparent/navy)
  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(effectiveVerifyUrl, {
      margin: 1,
      width: 240,
      color: {
        dark: "#FFFFFF",
        light: "#00000000",
      },
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error("QR Code generation failed:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [effectiveVerifyUrl]);

  // Dynamic single-line font sizing for recipient name
  const nameLength = recipientName.trim().length;
  const getNameSizeClass = () => {
    if (nameLength > 42) return "text-lg sm:text-xl md:text-2xl";
    if (nameLength > 30) return "text-xl sm:text-2xl md:text-3xl";
    if (nameLength > 20) return "text-2xl sm:text-3xl md:text-4xl";
    return "text-3xl sm:text-4xl md:text-5xl";
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-3xl p-1.5 sm:p-3 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 shadow-2xl border border-border">
      {/* Main Certificate Canvas: 3:2 Landscape Proportion */}
      <div className="relative w-full bg-white text-slate-900 rounded-2xl overflow-hidden shadow-xl flex flex-row border border-slate-200 select-none">
        {/* =================================================================== */}
        {/* LEFT NAVY ANCHOR BAR (22% Width)                                    */}
        {/* =================================================================== */}
        <div className="w-[24%] sm:w-[22%] bg-[#081B33] text-white flex flex-col justify-between items-center p-3 sm:p-6 relative z-10 flex-shrink-0">
          {/* Top Logo & Brandmark */}
          <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-2 pt-2 sm:pt-4">
            {/* Real VeySkill Layered Crest */}
            <div className="w-9 h-9 sm:w-13 sm:h-13 rounded-xl bg-white/10 p-1.5 sm:p-2 border border-white/20 flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" fillOpacity="0.9" />
                <path
                  d="M2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div>
              <span className="font-heading font-black text-[10px] sm:text-xs tracking-widest text-white uppercase block leading-tight">
                VEYSKILL
              </span>
              <span className="font-mono text-[7px] sm:text-[9px] font-semibold text-slate-300 tracking-wider uppercase block">
                ONLINE ACADEMY
              </span>
            </div>
          </div>

          {/* Bottom QR Code Block */}
          <div className="flex flex-col items-center text-center pb-2 sm:pb-4 w-full">
            {qrDataUrl ? (
              <div className="w-16 h-16 sm:w-24 sm:h-24 p-1 bg-white/5 rounded-xl border border-white/20 flex items-center justify-center shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt={`QR Code to verify certificate ${certificateId}`}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-xl animate-pulse flex items-center justify-center" />
            )}
            <span className="text-[7px] sm:text-[8px] font-mono tracking-widest text-slate-300 uppercase mt-1.5 block">
              SCAN TO VERIFY
            </span>
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT MAIN CONTENT AREA                                             */}
        {/* =================================================================== */}
        <div className="flex-1 p-5 sm:p-9 md:p-12 relative flex flex-col justify-between overflow-hidden bg-white">
          {/* Subtle Anti-Counterfeit Guilloché Wave Watermark */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.045] text-slate-900"
            viewBox="0 0 800 600"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            aria-hidden="true"
          >
            <path d="M 0,100 C 200,20 400,180 800,100" />
            <path d="M 0,120 C 200,40 400,200 800,120" />
            <path d="M 0,140 C 200,60 400,220 800,140" />
            <path d="M 0,160 C 200,80 400,240 800,160" />
            <path d="M 0,300 C 300,150 500,450 800,300" />
            <path d="M 0,320 C 300,170 500,470 800,320" />
            <path d="M 0,340 C 300,190 500,490 800,340" />
            <path d="M 0,460 C 200,380 600,550 800,460" />
            <path d="M 0,480 C 200,400 600,570 800,480" />
            <circle cx="700" cy="500" r="180" strokeWidth="0.8" />
            <circle cx="700" cy="500" r="140" strokeWidth="0.8" />
            <circle cx="700" cy="500" r="100" strokeWidth="0.8" />
          </svg>

          {/* Top Section: Title on Left, Gold Award Badge on Right */}
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div>
              <h1 className="font-heading font-black text-2xl sm:text-4xl md:text-5xl tracking-tight text-slate-950 leading-none">
                CERTIFICATE
              </h1>
              <h2 className="font-heading font-bold text-xs sm:text-base md:text-lg tracking-widest text-slate-800 uppercase mt-1 sm:mt-1.5">
                OF COMPLETION
              </h2>
            </div>

            {/* Official Gold Medallion with Navy Ribbons */}
            <div className="flex flex-col items-center flex-shrink-0 relative">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#AA771C] p-0.5 shadow-lg flex items-center justify-center relative z-10">
                <div className="w-full h-full rounded-full border border-dashed border-[#AA771C]/60 flex flex-col items-center justify-center text-center p-1 bg-gradient-to-b from-[#F9F6E8] to-[#ECC867] shadow-inner">
                  {/* 3 Stars */}
                  <div className="flex items-center gap-0.5 text-[#855806]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <span className="font-heading font-black text-[10px] sm:text-xs text-[#523602] tracking-tighter leading-none mt-0.5">
                    2026
                  </span>
                  <span className="font-heading font-extrabold text-[6px] sm:text-[7px] text-[#6E4703] uppercase tracking-wider leading-none mt-0.5">
                    AWARDED
                  </span>
                </div>
              </div>

              {/* Medallion Dangling Ribbons */}
              <div className="flex items-center -mt-2.5 z-0 space-x-1">
                <div
                  className="w-3.5 sm:w-5 h-6 sm:h-8 bg-[#081B33] shadow-md"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)",
                    transform: "rotate(-12deg)",
                  }}
                />
                <div
                  className="w-3.5 sm:w-5 h-6 sm:h-8 bg-[#081B33] shadow-md"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)",
                    transform: "rotate(12deg)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Middle Section: Recipient & Course Details */}
          <div className="my-3 sm:my-6 space-y-1.5 sm:space-y-2.5 relative z-10">
            <p className="font-heading font-medium text-xs sm:text-sm text-slate-500">
              We proudly present this certificate to
            </p>

            {/* Recipient Full Name — Auto-Scaled Single Line */}
            <div className="w-full overflow-hidden">
              {isInteractive && onNameChange ? (
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => onNameChange(e.target.value)}
                  className={`w-full font-heading font-bold text-slate-950 bg-transparent border-b border-slate-300 focus:border-slate-800 focus:outline-none whitespace-nowrap overflow-hidden text-ellipsis ${getNameSizeClass()}`}
                />
              ) : (
                <h3
                  className={`font-heading font-bold text-slate-950 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis leading-tight ${getNameSizeClass()}`}
                  title={recipientName}
                >
                  {recipientName.trim() || "Distinguished Scholar"}
                </h3>
              )}
            </div>

            {/* Thin Decorative Divider */}
            <div className="w-full h-px bg-gradient-to-r from-slate-300 via-slate-200 to-transparent my-1 sm:my-2" />

            {/* Course Completion Statement */}
            <p className="font-body text-xs sm:text-sm text-slate-700 leading-relaxed max-w-xl">
              honouring completion of the curriculum:{" "}
              <strong className="font-semibold text-slate-950">&ldquo;{courseTitle}&rdquo;</strong>.
              Demonstrating academic mastery across {lessonCount} comprehensive modules
              {quizScore != null ? ` with a passing grade of ${quizScore}%` : ""}.
            </p>
          </div>

          {/* Bottom Section: Dual Signatures, Date & Cryptographic ID */}
          <div className="pt-2 sm:pt-4 border-t border-slate-200/80 grid grid-cols-2 gap-4 items-end relative z-10">
            {/* Left Signatory */}
            <div className="space-y-0.5">
              {/* Calligraphy Signature */}
              <div className="font-serif italic font-normal text-lg sm:text-2xl text-slate-900 tracking-wide select-none leading-none h-6 sm:h-8 flex items-end">
                {instructorName}
              </div>
              <p className="font-heading font-bold text-[11px] sm:text-xs text-slate-900 leading-tight">
                {instructorName}
              </p>
              <p className="font-heading font-semibold text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-500 leading-tight">
                {instructorTitle}
              </p>
              <p className="font-mono text-[9px] sm:text-[10px] text-slate-600 pt-1 leading-none">
                {issuedDate}
              </p>
            </div>

            {/* Right Signatory & Cryptographic UUID */}
            <div className="space-y-0.5">
              {/* Calligraphy Signature */}
              <div className="font-serif italic font-normal text-lg sm:text-2xl text-slate-900 tracking-wide select-none leading-none h-6 sm:h-8 flex items-end">
                {managerName}
              </div>
              <p className="font-heading font-bold text-[11px] sm:text-xs text-slate-900 leading-tight">
                {managerName}
              </p>
              <p className="font-heading font-semibold text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-500 leading-tight">
                {managerTitle}
              </p>
              <div className="flex items-center justify-between gap-1 pt-1">
                <p
                  className="font-mono text-[8px] sm:text-[9.5px] text-slate-600 leading-none tracking-tight truncate"
                  title={`Credential ID: ${certificateId}`}
                >
                  {certificateId}
                </p>
                <a
                  href={effectiveVerifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-[7px] font-heading font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border border-emerald-500/20 flex-shrink-0 transition-colors cursor-pointer"
                  title="Verify authenticity of this credential in official registry"
                >
                  <svg
                    width="7"
                    height="7"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                  <span>VERIFY</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
