"use client";

// ---------------------------------------------------------------------------
// OfficialCertificateView.tsx — Official VeySkill Accredited Credential View
// Exact visual fidelity to the official VeySkill template (media_1791181434953.pdf).
// Features: Dynamic recipient name over the teal divider, executive masterclass title,
// high-contrast scannable QR code linked to cryptographic verification,
// credential ID directly under QR code, and issuance date.
// ---------------------------------------------------------------------------
import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { formatExecutiveCourseTitle } from "@/lib/pdfCertificate";

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
  verifyUrl,
  isInteractive = false,
  onNameChange,
}: OfficialCertificateViewProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const executiveTitle = formatExecutiveCourseTitle(courseTitle);
  const cleanDate = issuedDate.trim() || "October 2026";

  // Build high-integrity verification URL embedding certificate metadata
  // so scanning this QR code from any external camera/phone opens this specific credential
  const effectiveVerifyUrl = (() => {
    try {
      const base = verifyUrl || `https://veyskill.in/verify/${certificateId}`;
      const url = new URL(base, "https://veyskill.in");
      if (recipientName && !url.searchParams.has("n")) {
        url.searchParams.set("n", recipientName.trim());
      }
      if (executiveTitle && !url.searchParams.has("c")) {
        url.searchParams.set("c", executiveTitle);
      }
      if (cleanDate && !url.searchParams.has("d")) {
        url.searchParams.set("d", cleanDate);
      }
      return url.toString();
    } catch {
      return verifyUrl || `https://veyskill.in/verify/${certificateId}`;
    }
  })();

  // Generate high-contrast scannable QR code (Dark Teal on Pure White)
  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(effectiveVerifyUrl, {
      margin: 1,
      width: 280,
      color: {
        dark: "#0B4F4A", // Dark Teal
        light: "#FFFFFF", // Pure White
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
    if (nameLength > 40) return "text-sm sm:text-lg md:text-2xl lg:text-3xl";
    if (nameLength > 28) return "text-base sm:text-xl md:text-3xl lg:text-4xl";
    if (nameLength > 18) return "text-lg sm:text-2xl md:text-4xl lg:text-5xl";
    return "text-xl sm:text-3xl md:text-5xl lg:text-6xl";
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-3xl p-1 sm:p-2.5 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 shadow-2xl border border-border">
      {/* Certificate Frame: Standard ISO A4 Landscape Aspect Ratio (297 / 210 = 1.414) */}
      <div className="relative w-full aspect-[297/210] rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white select-none">
        {/* 1. Master Template High-Resolution Background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/certificate-template.jpg"
          alt="VeySkill Official Certificate Template"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0"
        />

        {/* 2. Recipient Full Legal Name (Above the Teal Divider Line at y = 46.2%) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-[72%] text-center z-10"
          style={{ top: "42.5%" }}
        >
          {isInteractive && onNameChange ? (
            <input
              type="text"
              value={recipientName}
              onChange={(e) => onNameChange(e.target.value)}
              className={`w-full font-heading font-black text-[#0A3A37] bg-transparent text-center border-b-2 border-[#0B766E]/40 focus:border-[#0B766E] focus:outline-none whitespace-nowrap overflow-hidden text-ellipsis ${getNameSizeClass()}`}
              placeholder="Enter your name"
            />
          ) : (
            <h3
              className={`font-heading font-black text-[#0A3A37] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis leading-tight ${getNameSizeClass()}`}
              title={recipientName}
            >
              {recipientName.trim() || "Distinguished Scholar"}
            </h3>
          )}
        </div>

        {/* 3. Curriculum Completion Subheading Statement (Below the Line at y = 52.4%) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-[80%] text-center z-10 pointer-events-none"
          style={{ top: "52.4%" }}
        >
          <p className="font-heading font-medium text-[8px] sm:text-xs md:text-sm text-slate-600 leading-tight">
            for successfully completing the curriculum and demonstrating mastery in
          </p>
        </div>

        {/* 4. Normalized Executive Masterclass Course Title (at y = 56.2%) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-[78%] text-center z-10 pointer-events-none"
          style={{ top: "56.2%" }}
        >
          <h4
            className="font-heading font-extrabold text-[#0B5C58] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis leading-tight text-[10px] sm:text-base md:text-xl lg:text-2xl"
            title={executiveTitle}
          >
            {executiveTitle}
          </h4>
        </div>

        {/* 4b. Professional Credential Validation Statement (at y = 62.5%) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-[72%] text-center z-10 pointer-events-none"
          style={{ top: "62.5%" }}
        >
          <p className="font-heading font-medium text-[6px] sm:text-[9px] md:text-[11px] text-slate-500 leading-tight">
            This credential validates professional-grade competency through comprehensive curriculum
            mastery and verified assessment performance.
          </p>
        </div>

        {/* 5. Issuance Date (Positioned below template's 'Awarded on' at y = 70.5%) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none"
          style={{ top: "70.5%" }}
        >
          <p className="font-heading font-bold text-slate-800 text-[8px] sm:text-xs md:text-sm leading-tight">
            {cleanDate}
          </p>
        </div>

        {/* 6. Scannable QR Code & Cryptographic ID Block (Bottom-Left Quadrant) */}
        <div
          className="absolute z-20 flex flex-col items-center text-center"
          style={{ left: "14.1%", top: "63.8%" }}
        >
          {/* Real Scannable QR Code */}
          <a
            href={effectiveVerifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`Scan or click to verify credential ${certificateId}`}
            className="group block"
          >
            <div className="w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 p-1 bg-white rounded-xl shadow-md border border-slate-200/90 group-hover:scale-105 transition-transform flex items-center justify-center">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt={`QR Code to verify certificate ${certificateId}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 rounded-lg animate-pulse" />
              )}
            </div>
          </a>

          {/* Credential ID directly under QR code */}
          <div className="mt-1 sm:mt-1.5 flex flex-col items-center">
            <span
              className="font-mono font-bold text-slate-800 tracking-tight text-[6px] sm:text-[9px] md:text-[11px] block leading-none"
              title={`Credential ID: ${certificateId}`}
            >
              ID: {certificateId}
            </span>
            <span className="font-heading font-bold text-[#0B766E] uppercase tracking-wider text-[5px] sm:text-[7px] md:text-[8px] mt-0.5 block leading-none">
              SCAN TO VERIFY
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
