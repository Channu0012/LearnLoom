"use client";

import React from "react";

interface OfficialCertificateViewProps {
  recipientName: string;
  courseTitle: string;
  certificateId: string;
  issuedDate: string;
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
  instructorName = "Dr. Ronald Vance",
  instructorTitle = "Instructor",
  managerName = "Elena Rostova",
  managerTitle = "Training Manager",
  isInteractive = false,
  onNameChange,
}: OfficialCertificateViewProps) {
  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-3xl p-3 sm:p-6 bg-gradient-to-b from-amber-100/40 via-amber-50/20 to-amber-100/30 shadow-2xl border border-amber-300/40">
      {/* Outer Paper Sheet with Ivory Parchment Texture */}
      <div className="relative w-full bg-[#FCFBF7] text-[#0A192F] rounded-2xl p-6 sm:p-12 md:p-14 shadow-inner border border-amber-200/80 overflow-hidden font-serif selection:bg-amber-200">
        {/* Subtle Guilloché / Parchment Background Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(#C5A059 0.5px, transparent 0.5px), radial-gradient(#C5A059 0.5px, #FCFBF7 0.5px)",
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 10px 10px",
          }}
          aria-hidden="true"
        />

        {/* Outer Heavy Gold Double Border */}
        <div className="absolute inset-3 sm:inset-5 border-2 border-[#C5A059] rounded-xl pointer-events-none" />
        <div className="absolute inset-4 sm:inset-6 border border-[#D4AF37]/60 rounded-lg pointer-events-none" />

        {/* Ornate Victorian Gold Corner Filigree Ornaments */}
        {/* Top-Left Corner Filigree */}
        <svg
          className="absolute top-4 left-4 sm:top-6 sm:left-6 w-10 h-10 sm:w-16 sm:h-16 text-[#C5A059] pointer-events-none"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M4 4 L4 36 M4 4 L36 4" strokeWidth="3" />
          <path d="M12 12 L12 28 M12 12 L28 12" strokeWidth="1.5" />
          <circle cx="4" cy="4" r="3" fill="currentColor" />
          <path d="M4 20 Q20 20 20 4" strokeWidth="1.5" />
          <path d="M4 32 Q32 32 32 4" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="16" cy="16" r="2" fill="currentColor" />
        </svg>

        {/* Top-Right Corner Filigree */}
        <svg
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 sm:w-16 sm:h-16 text-[#C5A059] pointer-events-none"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M96 4 L96 36 M96 4 L64 4" strokeWidth="3" />
          <path d="M88 12 L88 28 M88 12 L72 12" strokeWidth="1.5" />
          <circle cx="96" cy="4" r="3" fill="currentColor" />
          <path d="M96 20 Q80 20 80 4" strokeWidth="1.5" />
          <path d="M96 32 Q68 32 68 4" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="84" cy="16" r="2" fill="currentColor" />
        </svg>

        {/* Bottom-Left Corner Filigree */}
        <svg
          className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 w-10 h-10 sm:w-16 sm:h-16 text-[#C5A059] pointer-events-none"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M4 96 L4 64 M4 96 L36 96" strokeWidth="3" />
          <path d="M12 88 L12 72 M12 88 L28 88" strokeWidth="1.5" />
          <circle cx="4" cy="96" r="3" fill="currentColor" />
          <path d="M4 80 Q20 80 20 96" strokeWidth="1.5" />
          <path d="M4 68 Q32 68 32 96" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="16" cy="84" r="2" fill="currentColor" />
        </svg>

        {/* Bottom-Right Corner Filigree */}
        <svg
          className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-10 h-10 sm:w-16 sm:h-16 text-[#C5A059] pointer-events-none"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M96 96 L96 64 M96 96 L64 96" strokeWidth="3" />
          <path d="M88 88 L88 72 M88 88 L72 88" strokeWidth="1.5" />
          <circle cx="96" cy="96" r="3" fill="currentColor" />
          <path d="M96 80 Q80 80 80 96" strokeWidth="1.5" />
          <path d="M96 68 Q68 68 68 96" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="84" cy="84" r="2" fill="currentColor" />
        </svg>

        {/* Top Center Flourish Accent */}
        <div className="flex justify-center mb-3 sm:mb-4 relative z-10">
          <svg
            className="w-32 sm:w-44 h-5 text-[#C5A059]"
            viewBox="0 0 200 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M10 12 C 40 4, 70 20, 100 12 C 130 4, 160 20, 190 12" />
            <circle cx="100" cy="12" r="3.5" fill="currentColor" />
            <circle cx="92" cy="12" r="1.5" fill="currentColor" />
            <circle cx="108" cy="12" r="1.5" fill="currentColor" />
          </svg>
        </div>

        {/* 1. Master Headline: Certificate of Completion */}
        <div className="text-center relative z-10 space-y-2 mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight text-[#0B2545] leading-none">
            Certificate of Completion
          </h2>
          <div className="h-0.5 w-24 sm:w-36 bg-[#C5A059] mx-auto mt-2" />
        </div>

        {/* 2. Conferred Subtitle */}
        <div className="text-center relative z-10 mb-4 sm:mb-6">
          <p className="font-serif italic text-sm sm:text-lg text-[#475569] tracking-wide">
            This is to certify that
          </p>
        </div>

        {/* 3. Recipient Name: Big, Elegant, Real Name */}
        <div className="text-center relative z-10 mb-5 sm:mb-7">
          {isInteractive && onNameChange ? (
            <div className="max-w-md mx-auto">
              <input
                type="text"
                value={recipientName}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Full Legal Name"
                className="w-full text-center text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-[#0B2545] bg-transparent border-b-2 border-[#C5A059] focus:outline-none focus:border-[#0B2545] px-2 py-1 transition-all"
                aria-label="Edit Certificate Name"
              />
            </div>
          ) : (
            <div className="inline-block px-4 py-1 border-b-2 border-[#C5A059]">
              <span className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-[#0B2545] tracking-tight block">
                {recipientName}
              </span>
            </div>
          )}
        </div>

        {/* 4. Course Completion Description */}
        <div className="text-center relative z-10 max-w-2xl mx-auto space-y-1.5 mb-8 sm:mb-12">
          <p className="font-serif text-xs sm:text-base text-[#334155] leading-relaxed">
            has successfully completed the
          </p>
          <p className="font-serif font-bold text-sm sm:text-xl text-[#0B2545] tracking-tight">
            {courseTitle}
          </p>
          <p className="font-serif text-xs sm:text-sm text-[#475569]">Training on {issuedDate}</p>
        </div>

        {/* 5. Bottom Three-Column Layout Matching the Uploaded Standard */}
        <div className="grid grid-cols-3 items-end gap-2 sm:gap-6 pt-4 relative z-10 text-center">
          {/* Left Column: Presented by VeySkill + Instructor Signature */}
          <div className="space-y-3">
            <div>
              <span className="text-[10px] sm:text-xs font-serif uppercase tracking-widest text-[#475569] block mb-1">
                Presented by
              </span>
              {/* Solid Navy Brand Badge with Real Logo */}
              <div className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 rounded-lg bg-[#0B2545] text-white shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icon.png"
                  alt="VeySkill Logo"
                  width={18}
                  height={18}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain rounded-sm"
                />
                <span className="font-heading font-extrabold text-[11px] sm:text-sm tracking-tight text-white">
                  Vey<span className="text-[#14b8a6]">skill</span>
                </span>
              </div>
            </div>

            {/* Instructor Signature in Cursive Script */}
            <div className="pt-2">
              <div className="font-serif italic text-base sm:text-2xl text-[#1E293B] tracking-wide leading-tight">
                {instructorName}
              </div>
              <div className="h-px w-20 sm:w-32 bg-[#94A3B8]/60 mx-auto my-1" />
              <p className="text-[9px] sm:text-xs font-serif uppercase tracking-wider text-[#64748B]">
                {instructorTitle}
              </p>
            </div>
          </div>

          {/* Center Column: Radiant Metallic Gold Laurel Wreath Crest */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center">
              {/* Star on top of wreath */}
              <div className="absolute top-0 text-[#C5A059]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>

              {/* Laurel Wreath SVG Vector Emblem */}
              <svg
                className="w-full h-full text-[#C5A059]"
                viewBox="0 0 120 120"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                {/* Outer Circular Laurel Branches */}
                <path
                  d="M30 90 C15 70, 15 45, 32 26 C42 16, 50 18, 54 22"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M90 90 C105 70, 105 45, 88 26 C78 16, 70 18, 66 22"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Laurel Leaves (Left Branch) */}
                <ellipse
                  cx="22"
                  cy="65"
                  rx="5"
                  ry="2.5"
                  transform="rotate(-30 22 65)"
                  fill="currentColor"
                />
                <ellipse
                  cx="23"
                  cy="50"
                  rx="5"
                  ry="2.5"
                  transform="rotate(-15 23 50)"
                  fill="currentColor"
                />
                <ellipse
                  cx="28"
                  cy="38"
                  rx="5"
                  ry="2.5"
                  transform="rotate(10 28 38)"
                  fill="currentColor"
                />
                <ellipse
                  cx="38"
                  cy="28"
                  rx="5"
                  ry="2.5"
                  transform="rotate(30 38 28)"
                  fill="currentColor"
                />

                {/* Laurel Leaves (Right Branch) */}
                <ellipse
                  cx="98"
                  cy="65"
                  rx="5"
                  ry="2.5"
                  transform="rotate(30 98 65)"
                  fill="currentColor"
                />
                <ellipse
                  cx="97"
                  cy="50"
                  rx="5"
                  ry="2.5"
                  transform="rotate(15 97 50)"
                  fill="currentColor"
                />
                <ellipse
                  cx="92"
                  cy="38"
                  rx="5"
                  ry="2.5"
                  transform="rotate(-10 92 38)"
                  fill="currentColor"
                />
                <ellipse
                  cx="82"
                  cy="28"
                  rx="5"
                  ry="2.5"
                  transform="rotate(-30 82 28)"
                  fill="currentColor"
                />

                {/* Bottom Ribbon Knot */}
                <path d="M48 95 Q60 102 72 95" strokeWidth="2.5" />
                <path d="M52 98 L46 112 M68 98 L74 112" strokeWidth="2" strokeLinecap="round" />

                {/* Inner Center Crest: Open Book of Knowledge */}
                <g
                  transform="translate(42, 45)"
                  strokeWidth="2.5"
                  fill="none"
                  stroke="currentColor"
                >
                  {/* Left Page */}
                  <path d="M18 20 C12 16, 4 17, 0 20 L0 5 C5 2, 12 1, 18 5 Z" fill="#FCFBF7" />
                  {/* Right Page */}
                  <path d="M18 20 C24 16, 32 17, 36 20 L36 5 C31 2, 24 1, 18 5 Z" fill="#FCFBF7" />
                  {/* Spine */}
                  <line x1="18" y1="5" x2="18" y2="21" strokeWidth="2" />
                </g>
              </svg>
            </div>
            <span className="text-[9px] font-serif uppercase tracking-widest text-[#C5A059] font-bold mt-1">
              Verified Honors
            </span>
          </div>

          {/* Right Column: Certificate No + Manager Signature */}
          <div className="space-y-3">
            <div>
              <span className="text-[10px] sm:text-xs font-serif uppercase tracking-widest text-[#475569] block mb-1">
                Certificate No
              </span>
              {/* Solid Navy Badge with Unique Verification ID */}
              <div className="inline-flex items-center justify-center px-2.5 sm:px-4 py-1.5 rounded-lg bg-[#0B2545] text-white shadow-md font-mono font-bold text-[10px] sm:text-xs tracking-wider">
                {certificateId}
              </div>
            </div>

            {/* Manager / Registrar Signature in Cursive Script */}
            <div className="pt-2">
              <div className="font-serif italic text-base sm:text-2xl text-[#1E293B] tracking-wide leading-tight">
                {managerName}
              </div>
              <div className="h-px w-20 sm:w-32 bg-[#94A3B8]/60 mx-auto my-1" />
              <p className="text-[9px] sm:text-xs font-serif uppercase tracking-wider text-[#64748B]">
                {managerTitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
