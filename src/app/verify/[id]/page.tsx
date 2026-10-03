import type { Metadata } from "next";
import Link from "next/link";
import { verifyCertificateId } from "@/lib/security";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Verify Credential ${id} | VeySkill`,
    description: `Official cryptographic credential verification for certificate ${id} issued by VeySkill.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function VerifyCertificatePage({ params }: Props) {
  const { id } = await params;
  const verification = verifyCertificateId(id);
  const isValid = verification.isValid;

  return (
    <div className="container-page py-12 max-w-2xl">
      <div className="clay-card p-8 sm:p-10 bg-card border border-border rounded-3xl shadow-xl text-center space-y-6">
        {/* Verification Status Badge Icon */}
        <div
          className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-inner border-2 ${
            isValid
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-destructive/10 border-destructive/30 text-destructive"
          }`}
        >
          {isValid ? (
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          ) : (
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </div>

        {isValid ? (
          <>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-heading font-black uppercase tracking-wider mb-3">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Cryptographically Verified Credential
              </span>
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-foreground">
                Certificate of Completion
              </h1>
              <p className="font-body text-sm text-muted-foreground mt-2 max-w-lg mx-auto leading-relaxed">
                This official credential was issued by VeySkill to recognize the verified completion
                of structured video curriculum and assessments.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-muted/50 border border-border/80 text-left space-y-3 font-body text-sm">
              <div className="flex justify-between items-center pb-2.5 border-b border-border/50">
                <span className="text-muted-foreground">Credential ID</span>
                <span className="font-mono font-bold text-foreground text-sm tracking-wide bg-background px-2.5 py-1 rounded-lg border border-border">
                  {id}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-border/50">
                <span className="text-muted-foreground">Issuing Authority</span>
                <span className="font-semibold text-foreground">VeySkill Learning Platform</span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-border/50">
                <span className="text-muted-foreground">Authenticity Status</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active &amp; Authenticated
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Verification Standard</span>
                <span className="text-foreground text-xs font-semibold">
                  100% Video Completion + Assessment Mastery
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/explore"
                className="btn-primary w-full sm:w-auto px-6 py-2.5 text-xs font-heading font-bold inline-flex items-center justify-center gap-2"
              >
                <span>Browse Accredited Courses</span>
              </Link>
              <Link
                href="/"
                className="btn-ghost w-full sm:w-auto px-6 py-2.5 text-xs font-heading font-bold inline-flex items-center justify-center gap-2"
              >
                <span>Platform Home</span>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-destructive/10 text-destructive text-[11px] font-heading font-black uppercase tracking-wider mb-3">
                Invalid or Forged Identifier
              </span>
              <h1 className="font-heading font-black text-2xl text-foreground">
                Certificate Verification Failed
              </h1>
              <p className="font-body text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
                The identifier <code className="font-mono font-bold text-foreground">{id}</code>{" "}
                failed cryptographic checksum validation. This credential does not exist or has been
                tampered with.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="btn-primary px-6 py-2.5 text-xs font-heading font-bold inline-flex items-center gap-2"
              >
                <span>Return to VeySkill</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
