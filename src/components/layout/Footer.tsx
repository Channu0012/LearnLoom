"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RealtimeHomeStats } from "./RealtimeHomeStats";

export function Footer() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const year = 2026;

  return (
    <footer className="border-t border-border bg-card mt-16 w-full overflow-x-hidden pb-20 md:pb-6">
      <div className="container-page py-12">
        {/* Real-Time Database Metrics: Exclusively on Homepage */}
        {isHomePage && <RealtimeHomeStats />}

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3 sm:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 hover:opacity-95 transition-opacity"
              aria-label="Vidcura home"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon.png"
                alt="Vidcura Logo"
                width={28}
                height={28}
                className="w-7 h-7 object-contain rounded-lg"
              />
              <span className="font-heading font-extrabold text-lg tracking-tight">
                <span className="text-foreground">vid</span>
                <span className="text-[#FE5A50]">cura</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground font-body leading-relaxed max-w-sm">
              Transform open video playlists into structured, distraction-free masterclasses.
              Complete comprehensive lecture quizzes, build 7-day learning streaks, and earn
              cryptographically verifiable career credentials with 1-click LinkedIn endorsement.
            </p>
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
                  Quick Watch (Ad-Free)
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

          {/* Legal & Trust */}
          <nav aria-label="Footer legal links">
            <p className="font-heading font-bold text-xs uppercase tracking-wider text-foreground mb-3">
              Legal &amp; Integrity
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
        </div>

        <hr className="border-border/70 my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-body">
          <p>© {year} Vidcura Educational Foundation. All rights reserved.</p>
          <p className="text-muted-foreground/80 text-[11px]">
            Vidcura is an independent open educational client. Video content belongs to its
            respective copyright holders.
          </p>
        </div>
      </div>
    </footer>
  );
}
