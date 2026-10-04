"use client";

import Link from "next/link";

export function Footer() {
  const year = 2026;

  return (
    <footer className="border-t border-border bg-card mt-16 w-full overflow-x-hidden pb-20 md:pb-6">
      <div className="container-page py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="space-y-3 lg:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 hover:opacity-95 transition-opacity"
              aria-label="VeySkill home"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon.png"
                alt="VeySkill Logo"
                width={28}
                height={28}
                className="w-7 h-7 object-contain rounded-lg"
              />
              <span className="font-heading font-extrabold text-lg tracking-tight">
                <span className="text-foreground">Vey</span>
                <span className="text-[#14b8a6]">skill</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground font-body leading-relaxed max-w-sm">
              Transform open video playlists into structured, distraction-free masterclasses.
              Complete comprehensive lecture quizzes, build continuous learning streaks, and earn
              cryptographically verifiable career credentials with 1-click LinkedIn endorsement.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>PCI-DSS Secured · Cashfree Payments</span>
            </div>
          </div>

          {/* Platform Links */}
          <nav aria-label="Footer platform links">
            <p className="font-heading font-bold text-xs uppercase tracking-wider text-foreground mb-3">
              Platform Directory
            </p>
            <ul className="space-y-2 text-sm font-body text-muted-foreground">
              <li>
                <Link href="/explore" className="hover:text-primary-500 transition-colors">
                  Explore Courses
                </Link>
              </li>
              <li>
                <Link href="/quick-watch" className="hover:text-primary-500 transition-colors">
                  Quick Watch (Focus Theatre)
                </Link>
              </li>
              <li>
                <Link href="/create" className="hover:text-primary-500 transition-colors">
                  Course Studio (Create)
                </Link>
              </li>
              <li>
                <Link href="/my-learning" className="hover:text-primary-500 transition-colors">
                  My Learning &amp; Streaks
                </Link>
              </li>
            </ul>
          </nav>

          {/* Legal & Policies */}
          <nav aria-label="Footer legal links">
            <p className="font-heading font-bold text-xs uppercase tracking-wider text-foreground mb-3">
              Policies &amp; Legal
            </p>
            <ul className="space-y-2 text-sm font-body text-muted-foreground">
              <li>
                <Link href="/terms" className="hover:text-primary-500 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-primary-500 transition-colors">
                  Refund &amp; Cancellation
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-primary-500 transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/takedown" className="hover:text-primary-500 transition-colors">
                  DMCA Takedown Request
                </Link>
              </li>
            </ul>
          </nav>

          {/* Trust & External Compliance */}
          <nav aria-label="Footer trust and compliance links">
            <p className="font-heading font-bold text-xs uppercase tracking-wider text-foreground mb-3">
              Trust &amp; Compliance
            </p>
            <ul className="space-y-2 text-sm font-body text-muted-foreground">
              <li>
                <Link href="/contact" className="hover:text-primary-500 transition-colors">
                  Contact &amp; Grievance
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-primary-500 transition-colors">
                  Credential Verification
                </Link>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/t/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-500 transition-colors inline-flex items-center gap-1"
                >
                  <span>YouTube Terms</span>
                  <span className="text-[10px] opacity-70">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-500 transition-colors inline-flex items-center gap-1"
                >
                  <span>Google Privacy</span>
                  <span className="text-[10px] opacity-70">↗</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <hr className="border-border/70 my-8" />

        <div className="space-y-2 text-xs text-muted-foreground font-body">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {year} VeySkill Educational Platform. All rights reserved.</p>
            <p className="text-muted-foreground/80 text-[11px]">
              VeySkill is an independent educational client. Video content belongs to its respective
              copyright holders.
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground/70 leading-relaxed text-center sm:text-left">
            By utilizing VeySkill, you agree to be bound by the{" "}
            <a
              href="https://www.youtube.com/t/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 underline hover:no-underline"
            >
              YouTube Terms of Service
            </a>{" "}
            and acknowledge the{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 underline hover:no-underline"
            >
              Google Privacy Policy
            </a>
            . VeySkill adheres strictly to YouTube API Services Developer Policies.
          </p>
        </div>
      </div>
    </footer>
  );
}
