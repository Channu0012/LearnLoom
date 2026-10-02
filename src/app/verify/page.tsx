import type { Metadata } from "next";
import { CertificateLookupClient } from "@/components/verify/CertificateLookupClient";

export const metadata: Metadata = {
  title: "Verify Academic Credential | Vidcura",
  description:
    "Official cryptographic verification portal for Vidcura certificates. Enter any Credential ID to validate authenticity, student honors, and completion records.",
};

export default function VerifyPortalPage() {
  return (
    <div className="container-page py-12 sm:py-20 max-w-3xl">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-heading font-bold mb-4">
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
          <span>Cryptographic Credential Registry</span>
        </div>
        <h1 className="font-heading font-black text-3xl sm:text-5xl text-foreground tracking-tight mb-3">
          Verify Vidcura Credential
        </h1>
        <p className="font-body text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Validate the authenticity, issuance date, and mastery records of any graduate certificate
          issued by Vidcura.
        </p>
      </div>

      <CertificateLookupClient />
    </div>
  );
}
