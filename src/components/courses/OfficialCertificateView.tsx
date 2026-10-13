"use client";

// ---------------------------------------------------------------------------
// OfficialCertificateView.tsx — Official VeySkill Verified Credential View
// Exact visual fidelity to user's masterwork design.
// Features: Elegant script recipient name (no underline), centered course title in quotes,
// centered "Date of Completion : {date}", centered "Issued by : veyskill",
// and clean uncluttered certificate canvas (without QR code).
// ---------------------------------------------------------------------------
import React from "react";
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
  certificateId: _certificateId,
  issuedDate,
  verifyUrl: _verifyUrl,
  isInteractive = false,
  onNameChange,
}: OfficialCertificateViewProps) {
  const executiveTitle = formatExecutiveCourseTitle(courseTitle);
  const cleanDate = issuedDate.trim() || "13 oct 2026";

  // Proportional responsive script font sizing for recipient name
  const nameLength = recipientName.trim().length;
  const getNameSizeClass = () => {
    if (nameLength > 36) return "text-sm sm:text-xl md:text-2xl lg:text-3xl";
    if (nameLength > 24) return "text-base sm:text-2xl md:text-3xl lg:text-4xl";
    if (nameLength > 16) return "text-lg sm:text-3xl md:text-4xl lg:text-5xl";
    return "text-xl sm:text-4xl md:text-5xl lg:text-6xl";
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-3xl p-1 sm:p-2.5 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 shadow-2xl border border-border">
      {/* Certificate Frame: Exact Aspect Ratio of Template (2048 / 1448 = 1.414, ISO A4 Landscape) */}
      <div className="relative w-full aspect-[2048/1448] rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white select-none">
        {/* 1. Master Template High-Resolution Background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/certificate-template.jpg?v=20261013_perfect"
          alt="VeySkill Official Navy Certificate Template"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        />

        {/* 2. Recipient Full Name — Elegant Calligraphy / Script font, cleanly hovering above the flourish divider with NO artificial underline */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-[84%] max-w-[88%] text-center z-10 flex flex-col items-center justify-center pointer-events-none"
          style={{ top: "37.5%" }}
        >
          {isInteractive && onNameChange ? (
            <input
              type="text"
              value={recipientName}
              onChange={(e) => onNameChange(e.target.value)}
              className={`w-full font-['Dancing_Script',_'Brush_Script_MT',_cursive,_serif] font-bold italic text-[#003049] bg-transparent text-center focus:outline-none whitespace-nowrap leading-none ${getNameSizeClass()}`}
              placeholder="Enter your name"
            />
          ) : (
            <h3
              className={`font-['Dancing_Script',_'Brush_Script_MT',_cursive,_serif] font-bold italic text-[#003049] tracking-normal whitespace-nowrap leading-none ${getNameSizeClass()}`}
              title={recipientName}
            >
              {recipientName.trim() || "channabasav bhimappa b patil"}
            </h3>
          )}
        </div>

        {/* 3. Course Title — Centered in Double Quotes */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-[82%] text-center z-10 pointer-events-none"
          style={{ top: "52.0%" }}
        >
          <h4
            className="font-serif font-bold text-[#003049] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis leading-none text-[10px] sm:text-base md:text-xl lg:text-2xl"
            title={executiveTitle}
          >
            &ldquo;{executiveTitle}&rdquo;
          </h4>
        </div>

        {/* 4. Date of Completion — Cleanly centered single line */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10 pointer-events-none flex items-center justify-center"
          style={{ top: "65.5%" }}
        >
          <span className="font-serif font-bold text-[#003049] text-[7.5px] sm:text-[11px] md:text-[13px] lg:text-[15px] tracking-tight whitespace-nowrap leading-none">
            Date of Completion : {cleanDate}
          </span>
        </div>

        {/* 5. Issued by — Cleanly centered single line */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10 pointer-events-none flex items-center justify-center"
          style={{ top: "69.0%" }}
        >
          <span className="font-serif font-bold text-[#003049] text-[7.5px] sm:text-[11px] md:text-[13px] lg:text-[15px] tracking-tight whitespace-nowrap leading-none">
            Issued by : veyskill
          </span>
        </div>
      </div>
    </div>
  );
}
