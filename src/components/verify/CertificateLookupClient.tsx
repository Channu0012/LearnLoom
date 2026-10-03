"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CertificateLookupClient() {
  const router = useRouter();
  const [credentialId, setCredentialId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = credentialId.trim().toUpperCase();

    if (!cleanId) {
      setError("Please enter a valid Credential ID.");
      return;
    }

    if (!cleanId.startsWith("VL-")) {
      setError("Credential IDs must start with the 'VL-' prefix (e.g., VL-2026-F98B-E2A1).");
      return;
    }

    setError(null);
    router.push(`/verify/${encodeURIComponent(cleanId)}`);
  };

  return (
    <div className="clay-card p-6 sm:p-10 bg-card border border-border rounded-3xl shadow-xl">
      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <label
            htmlFor="credential-input"
            className="block text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground mb-2"
          >
            Credential ID or HMAC Code
          </label>
          <div className="relative">
            <input
              id="credential-input"
              type="text"
              value={credentialId}
              onChange={(e) => {
                setCredentialId(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. VL-2026-F98B-E2A1"
              className="w-full px-4 py-3.5 rounded-2xl bg-muted/40 border border-border focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-foreground font-mono text-sm sm:text-base outline-none transition-all placeholder:text-muted-foreground/60 uppercase"
              aria-describedby={error ? "lookup-error" : undefined}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <span className="hidden sm:inline">SHA-256</span>
            </div>
          </div>
          {error && (
            <p
              id="lookup-error"
              className="text-xs text-destructive font-body mt-2 flex items-center gap-1"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
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

      <div className="mt-8 pt-6 border-t border-border/60 text-xs text-muted-foreground font-body space-y-2">
        <p className="font-semibold text-foreground">Where do I find my Credential ID?</p>
        <p className="leading-relaxed">
          The Credential ID is printed on the bottom footer of your official VeySkill Certificate
          PDF and appears in your LinkedIn certification URL.
        </p>
      </div>
    </div>
  );
}
