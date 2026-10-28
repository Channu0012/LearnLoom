"use client";

// ---------------------------------------------------------------------------
// OfficialCertificateView.tsx — Official VeySkill Verified Credential View
// Exact visual fidelity to user's masterwork design.
// Features: Elegant script recipient name (no underline), centered course title in quotes,
// centered "Date of Completion : {date}", centered "Issued by : veyskill",
// and clean uncluttered certificate canvas (without QR code).
// ---------------------------------------------------------------------------
import { formatExecutiveCourseTitle } from "@/lib/pdfCertificate";
import { CertificateQRCode } from "@/components/verify/CertificateQRCode";
import { buildCanonicalCertificateUrl } from "@/lib/security";

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
  showQrCode?: boolean;
}

export function OfficialCertificateView({
  recipientName,
  courseTitle,
  certificateId,
  issuedDate,
  lessonCount,
  quizScore,
  verifyUrl,
  instructorName,
  isInteractive = false,
  onNameChange,
  showQrCode = true,
}: OfficialCertificateViewProps) {
  const executiveTitle = formatExecutiveCourseTitle(courseTitle);
  const cleanDate = (() => {
    const raw = issuedDate?.trim();
    if (!raw || raw === "October 2026" || !/\d{1,2}/.test(raw)) {
      try {
        return new Date().toLocaleDateString("en-US", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } catch {
        return new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
    }
    return raw;
  })();
  const cleanId = certificateId?.trim() || "VS-DEMO";
  const effectiveName = recipientName?.trim() || "Distinguished Scholar";

  let effectiveVerifyUrl = verifyUrl;
  if (!effectiveVerifyUrl || !effectiveVerifyUrl.includes("?")) {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "https://veyskill.in";
    effectiveVerifyUrl = buildCanonicalCertificateUrl(
      cleanId,
      {
        userName: effectiveName,
        courseTitle: executiveTitle,
        issuedDate: cleanDate,
        lessonCount,
        quizScore,
      },
      origin
    );
  }

  // Proportional responsive script font sizing for recipient name
  const nameLength = effectiveName.length;
  const getNameSizeClass = () => {
    if (nameLength > 36) return "text-sm sm:text-xl md:text-2xl lg:text-3xl";
    if (nameLength > 24) return "text-base sm:text-2xl md:text-3xl lg:text-4xl";
    if (nameLength > 16) return "text-lg sm:text-3xl md:text-4xl lg:text-5xl";
    return "text-xl sm:text-4xl md:text-5xl lg:text-6xl";
  };

  // Proportional responsive font sizing for course title
  const getTitleSizeClass = () => {
    if (executiveTitle.length > 50) return "text-[8px] sm:text-xs md:text-base lg:text-lg";
    if (executiveTitle.length > 35) return "text-[9px] sm:text-sm md:text-lg lg:text-xl";
    return "text-[10px] sm:text-base md:text-xl lg:text-2xl";
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
              title={effectiveName}
            >
              {effectiveName}
            </h3>
          )}
        </div>

        {/* 3. Course Title — Centered in Double Quotes */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-[82%] text-center z-10 pointer-events-none"
          style={{ top: "52.0%" }}
        >
          <h4
            className={`font-serif font-bold text-[#003049] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis leading-none ${getTitleSizeClass()}`}
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

        {/* 5. Issued by & Curriculum Attribution — Cleanly centered single line */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10 pointer-events-none flex items-center justify-center"
          style={{ top: "69.0%" }}
        >
          <span className="font-serif font-bold text-[#003049] text-[7.5px] sm:text-[11px] md:text-[13px] lg:text-[15px] tracking-tight whitespace-nowrap leading-none">
            {instructorName &&
            !["anonymous", "learner", "user", "admin", "veyskill", "youtube creator"].includes(
              instructorName.trim().toLowerCase()
            )
              ? `Curriculum by : ${instructorName}  •  Issued by : VeySkill`
              : "Issued by : VeySkill"}
          </span>
        </div>

        {/* 6. Scannable Verification QR Code (Bottom Left Open Pedestal — Symmetrical to Founder Signature on Right) */}
        {showQrCode && (
          <div
            className="absolute z-10 flex flex-col items-center pointer-events-auto transition-transform hover:scale-105"
            style={{
              left: "26.5%",
              bottom: "7.2%",
              transform: "translateX(-50%)",
            }}
          >
            <a
              href={effectiveVerifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-1 sm:p-1.5 bg-white/95 backdrop-blur-xs rounded-xl shadow-md border border-slate-200/90 hover:border-teal-500 transition-all hover:shadow-lg"
              title="Click or scan with any smartphone camera to verify official credential on VeySkill"
            >
              <div className="w-9 sm:w-12 md:w-14 lg:w-16">
                <CertificateQRCode
                  verifyUrl={effectiveVerifyUrl}
                  size={140}
                  compact
                  showLabel={false}
                />
              </div>
            </a>
            <div className="text-center mt-1 pointer-events-none flex flex-col items-center">
              <span className="font-mono font-bold text-[#003049] text-[5.5px] sm:text-[7.5px] md:text-[9px] lg:text-[10.5px] block leading-none tracking-tight">
                {cleanId}
              </span>
              <span className="font-sans font-black text-teal-800 uppercase tracking-widest text-[4px] sm:text-[5px] md:text-[6.5px] lg:text-[7.5px] block leading-tight mt-0.5">
                Scan to Verify
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
