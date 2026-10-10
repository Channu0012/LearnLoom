"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeCertificateId } from "@/lib/security";

export function CertificateLookupClient() {
  const router = useRouter();
  const [credentialId, setCredentialId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = normalizeCertificateId(credentialId);

    if (!cleanId) {
      setError("Please enter a valid Credential ID or paste your certificate verification link.");
      return;
    }

    if (!cleanId.startsWith("VS-") && !cleanId.startsWith("VC-") && !cleanId.startsWith("VL-")) {
      setError(
        "Unrecognized credential prefix. Official VeySkill credentials start with 'VS-' (e.g. VS-9A3F1B8E2C) or 'VC-'."
      );
      return;
    }

    setError(null);
    router.push(`/verify/${encodeURIComponent(cleanId)}`);
  };

  const handleSelectSample = (sampleId: string) => {
    setCredentialId(sampleId);
    setError(null);
    router.push(`/verify/${encodeURIComponent(sampleId)}`);
  };

  return (
    <div className="clay-card p-6 sm:p-10 bg-card border border-border rounded-3xl shadow-xl">
      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="credential-input"
              className="block text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground"
            >
              Credential ID, URL, or HMAC Code
            </label>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Auto-Detection Active
            </span>
          </div>

          <div className="relative">
            <input
              id="credential-input"
              type="text"
              value={credentialId}
              onChange={(e) => {
                setCredentialId(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter certificate ID or verification link"
              className="w-full px-4 py-3.5 rounded-2xl bg-muted/40 border border-border focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-foreground font-mono text-sm sm:text-base outline-none transition-all placeholder:text-muted-foreground/60 uppercase"
              aria-describedby={error ? "lookup-error" : undefined}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <span className="hidden sm:inline bg-muted px-2 py-0.5 rounded text-[10px] font-bold">
                SHA-256 HMAC
              </span>
            </div>
          </div>

          {error && (
            <p
              id="lookup-error"
              className="text-xs text-destructive font-body mt-2 flex items-center gap-1.5"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="flex-shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </p>
          )}
        </div>

        <button
          type="submit"
          className="btn-primary w-full py-3.5 rounded-2xl text-sm font-heading font-bold shadow-lg hover:shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <svg
            width="16"
            height="16"
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
          <span>Verify Credential Authenticity</span>
        </button>
      </form>

      {/* Quick Test Benchmark Credentials */}
      <div className="mt-6 pt-5 border-t border-border/60">
        <p className="text-[11px] font-heading font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
          Quick-Check Verified Academic Benchmark Credentials:
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleSelectSample("VS-9A3F1B8E2C")}
            className="px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted border border-border/80 text-foreground font-mono text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>VS-9A3F1B8E2C</span>
            <span className="text-[10px] text-muted-foreground font-body">(Alex Morgan)</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectSample("VC-DEMO")}
            className="px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted border border-border/80 text-foreground font-mono text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            <span>VC-DEMO</span>
            <span className="text-[10px] text-muted-foreground font-body">
              (Masterclass Honors)
            </span>
          </button>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-border/60 text-xs text-muted-foreground font-body space-y-2">
        <p className="font-semibold text-foreground">Where do I find my Credential ID?</p>
        <p className="leading-relaxed">
          The Credential ID is printed on the bottom right footer of your official VeySkill
          Certificate PDF, in the scannable QR code link, and appears in your LinkedIn certification
          license.
        </p>
      </div>
    </div>
  );
}
