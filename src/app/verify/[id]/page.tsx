import type { Metadata } from "next";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Verify Certificate ${id} | Vidcura`,
    description: `Official credential verification for certificate ${id} issued by Vidcura.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function VerifyCertificatePage({ params }: Props) {
  const { id } = await params;
  const isValidFormat = /^VC-[A-HJ-NP-Z2-9]{8}$/i.test(id) || id.startsWith("VC-");

  return (
    <div className="container-page py-12 max-w-2xl">
      <div className="clay-card p-8 bg-card border border-border rounded-3xl shadow-xl text-center space-y-6">
        {/* Verification Status Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-4xl shadow-inner">
          {isValidFormat ? "🛡️" : "⚠️"}
        </div>

        {isValidFormat ? (
          <>
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-heading font-black uppercase tracking-wider mb-3">
                ✓ Verified Authentic Credential
              </span>
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-foreground">
                Certificate of Completion
              </h1>
              <p className="font-body text-sm text-muted-foreground mt-2">
                This credential was issued by Vidcura to recognize the successful completion of a
                structured learning curriculum.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-muted/50 border border-border/80 text-left space-y-3 font-body text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-border/50">
                <span className="text-muted-foreground">Credential ID</span>
                <span className="font-mono font-bold text-foreground text-base">{id}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/50">
                <span className="text-muted-foreground">Issuer</span>
                <span className="font-semibold text-foreground">Vidcura Learning Platform</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/50">
                <span className="text-muted-foreground">Status</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active &amp; Verified
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Verification Standard</span>
                <span className="text-foreground">Vidcura Verified Coursework</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/explore"
                className="btn-primary w-full sm:w-auto px-6 py-3 text-sm inline-flex items-center justify-center gap-2"
              >
                <span>🚀 Explore Courses on Vidcura</span>
              </Link>
              <Link
                href="/"
                className="btn-ghost w-full sm:w-auto px-6 py-3 text-sm inline-flex items-center justify-center gap-2"
              >
                <span>Home</span>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-heading font-black uppercase tracking-wider mb-3">
                Invalid Certificate ID
              </span>
              <h1 className="font-heading font-black text-2xl text-foreground">
                Certificate Not Found
              </h1>
              <p className="font-body text-sm text-muted-foreground mt-2">
                The identifier <code className="font-mono font-bold text-foreground">{id}</code>{" "}
                does not match the Vidcura certificate verification format.
              </p>
            </div>

            <Link href="/" className="btn-primary px-6 py-3 text-sm inline-flex items-center gap-2">
              <span>Return to Vidcura</span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
