import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Takedown Request",
  description:
    "Request removal of your content from Vidcura. We respect all original creators and process takedowns within 48 hours.",
  alternates: {
    canonical: "/takedown",
  },
};

export default function TakedownPage() {
  return (
    <div className="container-page py-12 max-w-3xl">
      <h1 className="font-heading font-extrabold text-3xl mb-2">Takedown &amp; Content Removal</h1>
      <p className="text-muted-foreground font-body text-sm mb-8">
        For copyright holders, original content creators, and content removal requests
      </p>

      {/* ── Creator Respect Banner ─────────────────────────────── */}
      <div className="clay-card p-6 mb-8 border-teal-300 dark:border-teal-700 bg-teal-50/30 dark:bg-teal-950/20">
        <h2 className="font-heading font-bold text-base mb-3 flex items-center gap-2">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0F766E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          We Respect YouTube Creators
        </h2>
        <p className="text-sm font-body text-foreground/80 leading-relaxed mb-3">
          Vidcura is built to support and promote YouTube creators — not to exploit them. We
          understand that your content is your livelihood and your intellectual property.
        </p>
        <ul className="text-sm font-body text-foreground/80 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-teal-600 font-bold mt-0.5">✓</span>
            <span>
              We <strong>never</strong> download, re-host, mirror, or redistribute your videos
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 font-bold mt-0.5">✓</span>
            <span>
              All views through Vidcura count towards{" "}
              <strong>your YouTube analytics and monetisation</strong>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 font-bold mt-0.5">✓</span>
            <span>
              Your channel name, video title, and thumbnail are{" "}
              <strong>always credited and linked</strong>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 font-bold mt-0.5">✓</span>
            <span>
              We are <strong>100% free and non-commercial</strong> — zero ads, zero revenue from
              your content
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 font-bold mt-0.5">✓</span>
            <span>
              If you still want your content removed, we will{" "}
              <strong>comply within 48 hours</strong>, no questions asked
            </span>
          </li>
        </ul>
      </div>

      {/* ── Important: Video Hosting ───────────────────────────── */}
      <div className="clay-card p-6 mb-8 border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/20">
        <h2 className="font-heading font-bold text-base mb-2 flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="text-amber-600"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          Important: Videos Are Hosted by YouTube
        </h2>
        <p className="text-sm font-body text-foreground/80 leading-relaxed">
          Vidcura does <strong>not</strong> host any video content. All videos embedded in our
          courses are hosted by YouTube. Vidcura only links to existing YouTube videos — we do not
          upload, store, cache, or distribute video files.
        </p>
        <p className="text-sm font-body text-foreground/80 leading-relaxed mt-3">
          To remove the video itself from YouTube, please submit a copyright takedown directly to
          YouTube:{" "}
          <a
            href="https://www.youtube.com/reportabuse"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-500 underline hover:no-underline"
          >
            youtube.com/reportabuse
          </a>
        </p>
      </div>

      <div className="font-body text-foreground space-y-8">
        {/* ── For YouTube Creators ─────────────────────────────── */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">For YouTube Creators</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you are a YouTube creator and want your videos removed from any Vidcura course, we
            will honour your request immediately —{" "}
            <strong className="text-foreground">no proof of ownership required</strong> beyond being
            the channel owner. Simply email us with:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
            <li>Your YouTube channel name and link</li>
            <li>The URL(s) of the Vidcura course(s) containing your content (if known)</li>
            <li>
              Whether you want specific videos removed or{" "}
              <strong className="text-foreground">all</strong> of your content removed from the
              entire platform
            </li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            We will process your request within{" "}
            <strong className="text-foreground">48 hours</strong> and confirm via email once
            complete.
          </p>
        </section>

        {/* ── For Copyright Holders ────────────────────────────── */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">For Copyright Holders (DMCA)</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you are a copyright owner (or authorised to act on behalf of one) and believe that
            content in a Vidcura course infringes your rights, please provide the following
            information:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
            <li>Your full legal name and contact information</li>
            <li>The URL of the Vidcura course or lesson you want removed</li>
            <li>The original copyrighted work being infringed (with URL if possible)</li>
            <li>
              A statement that you are the rights holder or are authorised to act on their behalf
            </li>
            <li>
              A statement, under penalty of perjury, that the information in your notice is accurate
            </li>
            <li>Your physical or electronic signature</li>
          </ul>
        </section>

        {/* ── For General Content Issues ───────────────────────── */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">For Content Abuse Reports</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you find a course on Vidcura that contains harmful, misleading, abusive, or
            inappropriate content, you can report it through:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
            <li>
              <strong className="text-foreground">The Report button</strong> — Available on every
              course page for signed-in users
            </li>
            <li>
              <strong className="text-foreground">Email</strong> — Send details to{" "}
              <a
                href="mailto:takedown@vidcura.app"
                className="text-primary-500 underline hover:no-underline font-semibold"
              >
                takedown@vidcura.app
              </a>
            </li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Our moderation team reviews all reports. Courses containing harmful content are removed
            immediately. Repeat offenders have their accounts permanently suspended.
          </p>
        </section>

        {/* ── Contact ──────────────────────────────────────────── */}
        <section className="clay-card p-6 bg-card">
          <h2 className="font-heading font-bold text-xl mb-3">Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Send all takedown and content removal requests to:
          </p>
          <a
            href="mailto:takedown@vidcura.app"
            className="text-primary-500 underline hover:no-underline font-heading font-bold text-lg"
          >
            takedown@vidcura.app
          </a>
          <p className="text-muted-foreground leading-relaxed mt-4">
            We aim to respond within <strong className="text-foreground">48 hours</strong> for all
            requests. For urgent matters involving harmful content, we act immediately.
          </p>
        </section>

        {/* ── Our Commitment ───────────────────────────────────── */}
        <section className="clay-card p-6 border-primary-300 dark:border-primary-700 bg-primary-50/30 dark:bg-primary-950/20">
          <h2 className="font-heading font-bold text-xl mb-3 flex items-center gap-2">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="text-primary-600"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Our Commitment
          </h2>
          <ul className="text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 font-bold mt-0.5">•</span>
              <span>
                We will <strong className="text-foreground">always</strong> honour creator takedown
                requests — no legal threats needed
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 font-bold mt-0.5">•</span>
              <span>
                We will <strong className="text-foreground">never</strong> profit from embedded
                YouTube content
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 font-bold mt-0.5">•</span>
              <span>
                We will <strong className="text-foreground">always</strong> credit and link back to
                original creators
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 font-bold mt-0.5">•</span>
              <span>We proactively remove abusive content — even without a formal request</span>
            </li>
          </ul>
        </section>

        {/* ── Related Pages ────────────────────────────────────── */}
        <section>
          <h2 className="font-heading font-bold text-base mb-3 text-muted-foreground">
            Related Policies
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/privacy"
              className="btn-ghost text-sm px-4 py-2 inline-flex items-center gap-1.5"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="btn-ghost text-sm px-4 py-2 inline-flex items-center gap-1.5"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="btn-ghost text-sm px-4 py-2 inline-flex items-center gap-1.5"
            >
              Cookie Policy
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
