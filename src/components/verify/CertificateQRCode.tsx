"use client";

// ---------------------------------------------------------------------------
// CertificateQRCode.tsx — Branded QR Code Component for VeySkill Certificates
// Renders a scannable QR code that links to the certificate verification page.
// Includes VeySkill branding frame, scan instruction label, and optional ID display.
// ---------------------------------------------------------------------------
import React, { useEffect, useState } from "react";
import { generateQRCodeDataUrl } from "@/lib/qrcode";

interface CertificateQRCodeProps {
  /** The full verification URL (e.g., https://veyskill.in/verify/VS-XXXXXXXX) */
  verifyUrl: string;
  /** Certificate ID to display below the QR code */
  certificateId?: string;
  /** QR code image size in pixels (default 160) */
  size?: number;
  /** Whether to show the "Scan to Verify" label (default true) */
  showLabel?: boolean;
  /** Compact mode for embedding inside certificates (default false) */
  compact?: boolean;
  /** Custom CSS className for the outer wrapper */
  className?: string;
}

export function CertificateQRCode({
  verifyUrl,
  certificateId,
  size = 160,
  showLabel = true,
  compact = false,
  className = "",
}: CertificateQRCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    generateQRCodeDataUrl(verifyUrl, size * 2) // 2x for retina/HiDPI
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [verifyUrl, size]);

  if (error) return null;

  if (compact) {
    // Compact mode: responsive QR code image for embedding inside the certificate canvas
    return (
      <div className={`inline-flex flex-col items-center ${className}`}>
        {qrDataUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={qrDataUrl}
            alt="Certificate verification QR code"
            className="w-full h-auto aspect-square object-contain rounded-sm"
            style={{ imageRendering: "pixelated" }}
          />
        ) : (
          <div className="w-full aspect-square bg-white/80 rounded-sm animate-pulse" />
        )}
        {certificateId && (
          <span
            className="font-mono font-bold text-center leading-none mt-0.5 text-[5.5px] sm:text-[7px] md:text-[8px] lg:text-[9.5px] tracking-tight"
            style={{ color: "#003049" }}
          >
            {certificateId}
          </span>
        )}
      </div>
    );
  }

  // Full branded QR code card
  return (
    <div
      className={`flex flex-col items-center gap-2 p-3 sm:p-4 bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}
    >
      {/* QR Code Image */}
      <div className="relative">
        {qrDataUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={qrDataUrl}
            alt={`Scan to verify certificate ${certificateId || ""}`}
            width={size}
            height={size}
            className="rounded-lg"
            style={{ imageRendering: "pixelated" }}
          />
        ) : (
          <div
            className="bg-slate-100 rounded-lg animate-pulse"
            style={{ width: size, height: size }}
          />
        )}

        {/* Center VeySkill Brand Mark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="bg-white rounded-md flex items-center justify-center shadow-sm border border-slate-100"
            style={{
              width: size * 0.22,
              height: size * 0.22,
            }}
          >
            <span
              className="font-bold text-[#003049] leading-none"
              style={{ fontSize: size * 0.09 }}
            >
              VS
            </span>
          </div>
        </div>
      </div>

      {/* Scan Label */}
      {showLabel && (
        <div className="flex items-center gap-1.5 text-[#003049]">
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
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
            <line x1="7" y1="12" x2="17" y2="12" />
          </svg>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            Scan to Verify
          </span>
        </div>
      )}

      {/* Certificate ID */}
      {certificateId && (
        <span className="font-mono text-[10px] sm:text-xs font-bold text-slate-500 tracking-wide">
          {certificateId}
        </span>
      )}
    </div>
  );
}
