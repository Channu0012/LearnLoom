import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Vidcura Privacy Policy — how we collect, use, protect your data, and protect creator content.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="container-page py-12 max-w-3xl">
      <h1 className="font-heading font-extrabold text-3xl mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground font-body text-sm mb-8">Last updated: September 2026</p>

      <div className="font-body text-foreground space-y-8">
        {/* ── Introduction ─────────────────────────────────────── */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">Our Privacy Commitment</h2>
          <p className="text-muted-foreground leading-relaxed">
            Vidcura is built on the principle of{" "}
            <strong className="text-foreground">privacy by design</strong>. We collect only what is
            strictly necessary to provide our service. We do not sell, rent, trade, or monetise your
            personal data — now or ever. We do not run advertisements or tracking pixels. Your
            learning experience is yours alone.
          </p>
        </section>

        {/* ── What we collect ──────────────────────────────────── */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">1. What We Collect</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            When you sign in with Google, we receive and store only:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1.5">
            <li>
              <strong className="text-foreground">Display name</strong> — shown as the course
              creator name
            </li>
            <li>
              <strong className="text-foreground">Profile photo URL</strong> — shown next to your
              courses
            </li>
            <li>
              <strong className="text-foreground">Firebase UID</strong> — an anonymous identifier
              used internally
            </li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            We do <strong className="text-foreground">not</strong> store your email address, Google
            password, contacts, calendar, or any other Google account data.
          </p>

          <p className="text-muted-foreground leading-relaxed mt-4 mb-2">
            We also store data you explicitly create:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1.5">
            <li>Courses you create (title, description, category, lesson links)</li>
            <li>Your learning progress (which lessons you&apos;ve completed)</li>
            <li>Reports you submit about courses</li>
          </ul>
        </section>

        {/* ── What we do NOT collect ───────────────────────────── */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">2. What We Do NOT Collect</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            Vidcura explicitly does not collect:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1.5">
            <li>Email addresses or phone numbers</li>
            <li>Location data or IP-based geolocation</li>
            <li>Device fingerprints or browser fingerprints</li>
            <li>Browsing history outside of Vidcura</li>
            <li>Any financial information (no payments, no credit cards)</li>
            <li>Analytics or advertising trackers of any kind</li>
          </ul>
        </section>

        {/* ── How we use your data ─────────────────────────────── */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">3. How We Use Your Data</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use your data solely and exclusively to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1.5 mt-3">
            <li>Display your name and photo on courses you create</li>
            <li>Save and restore your learning progress across sessions</li>
            <li>Process and moderate content reports to keep the platform safe</li>
            <li>Enforce our Terms of Service and community guidelines</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            We <strong className="text-foreground">never</strong> sell your data, use it for
            advertising, share it with data brokers, or use it for profiling. We share data only
            with <strong className="text-foreground">Firebase (Google Cloud)</strong>, which powers
            our database and authentication infrastructure.
          </p>
        </section>

        {/* ── YouTube & Creator Respect ─────────────────────────── */}
        <section className="clay-card p-6 border-teal-300 dark:border-teal-700 bg-teal-50/30 dark:bg-teal-950/20">
          <h2 className="font-heading font-bold text-xl mb-3 flex items-center gap-2">
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
            4. YouTube &amp; Creator Protection
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            Vidcura deeply respects YouTube creators and their content. Our platform is designed to
            promote, credit, and protect creators — never to exploit them:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>
              <strong className="text-foreground">No video downloading or re-hosting</strong> — All
              videos are embedded directly from YouTube. We never download, copy, re-upload, mirror,
              or cache video content.
            </li>
            <li>
              <strong className="text-foreground">Creator attribution is mandatory</strong> — Every
              lesson links directly to the original YouTube video. The original creator&apos;s
              channel name, thumbnail, and video title are always displayed and credited.
            </li>
            <li>
              <strong className="text-foreground">Views go to the creator</strong> — Because videos
              are embedded via YouTube&apos;s official embed API, all watch-time and views count
              towards the original creator&apos;s YouTube analytics and monetisation.
            </li>
            <li>
              <strong className="text-foreground">No monetisation of creator content</strong> —
              Vidcura does not run ads, charge fees, or earn any revenue from embedded videos. We
              are a 100% free, non-commercial platform.
            </li>
            <li>
              <strong className="text-foreground">Immediate takedown on request</strong> — Any
              creator can request removal of their content from our platform at any time via our{" "}
              <Link href="/takedown" className="text-primary-500 underline hover:no-underline">
                takedown process
              </Link>
              , and we will comply promptly.
            </li>
            <li>
              <strong className="text-foreground">YouTube API compliance</strong> — We use only
              official YouTube oEmbed/embed endpoints and comply fully with YouTube&apos;s Terms of
              Service and API Terms of Service.
            </li>
            <li>
              <strong className="text-foreground">No circumvention of YouTube features</strong> — We
              do not bypass age restrictions, geographic restrictions, copyright protections, or any
              other YouTube content controls.
            </li>
          </ul>
        </section>

        {/* ── No Abuse Policy ──────────────────────────────────── */}
        <section className="clay-card p-6 border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/20">
          <h2 className="font-heading font-bold text-xl mb-3 flex items-center gap-2">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C2410C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
            5. Zero-Abuse Guarantee
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            Vidcura has a strict zero-tolerance policy against abuse of any kind:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>
              <strong className="text-foreground">No impersonation</strong> — Users must not create
              courses that impersonate, misrepresent, or falsely claim affiliation with any YouTube
              creator or channel.
            </li>
            <li>
              <strong className="text-foreground">No harmful or misleading content</strong> —
              Courses linking to videos containing hate speech, harassment, violence,
              misinformation, or any illegal content are strictly prohibited and will be removed
              immediately.
            </li>
            <li>
              <strong className="text-foreground">No spam or commercial exploitation</strong> —
              Creating courses to promote scams, phishing, affiliate marketing, or any commercial
              activity is forbidden.
            </li>
            <li>
              <strong className="text-foreground">Community reporting</strong> — Any user can report
              a course for abuse. Our moderation team reviews all reports and takes action within 48
              hours.
            </li>
            <li>
              <strong className="text-foreground">Account suspension</strong> — Users who violate
              these policies may have their accounts permanently suspended and all their courses
              removed without notice.
            </li>
          </ul>
        </section>

        {/* ── YouTube Embeds ───────────────────────────────────── */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">
            6. YouTube Embeds &amp; Third-Party Data
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Vidcura embeds videos via{" "}
            <strong className="text-foreground">youtube-nocookie.com</strong> (YouTube&apos;s
            privacy-enhanced mode) to minimise cross-site tracking. When you watch a video, YouTube
            may still collect data according to{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-500 underline hover:no-underline"
            >
              Google&apos;s Privacy Policy
            </a>
            . We have no control over YouTube&apos;s data collection practices.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            We do not embed content from any other third-party service. We do not use third-party
            analytics (no Google Analytics, no Hotjar, no Mixpanel, etc.).
          </p>
        </section>

        {/* ── Data Security ────────────────────────────────────── */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">7. Data Security &amp; Protection</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            We implement industry-standard security measures to protect your data:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1.5">
            <li>
              <strong className="text-foreground">Encryption in transit</strong> — All data
              transmitted between your browser and our servers is encrypted via TLS/HTTPS
            </li>
            <li>
              <strong className="text-foreground">Encryption at rest</strong> — All data stored in
              Firebase/Google Cloud is encrypted at rest using AES-256
            </li>
            <li>
              <strong className="text-foreground">Firestore Security Rules</strong> — Strict
              server-side rules ensure users can only access and modify their own data
            </li>
            <li>
              <strong className="text-foreground">Authentication via Google</strong> — We delegate
              authentication to Google&apos;s secure OAuth 2.0 infrastructure; we never handle or
              store passwords
            </li>
            <li>
              <strong className="text-foreground">Minimal data surface</strong> — We collect the
              absolute minimum data needed, reducing risk exposure
            </li>
            <li>
              <strong className="text-foreground">No server-side logging of personal data</strong> —
              We do not log user activities, search queries, or viewing patterns
            </li>
          </ul>
        </section>

        {/* ── Cookies ──────────────────────────────────────────── */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">8. Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            Vidcura uses only{" "}
            <strong className="text-foreground">strictly necessary functional cookies</strong>{" "}
            required for authentication (provided by Firebase). We do not use:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1.5 mt-3">
            <li>Advertising cookies</li>
            <li>Tracking or analytics cookies</li>
            <li>Social media cookies</li>
            <li>Third-party marketing cookies</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            For full details, see our{" "}
            <Link href="/cookies" className="text-primary-500 underline hover:no-underline">
              Cookie Policy
            </Link>
            .
          </p>
        </section>

        {/* ── Children's privacy ───────────────────────────────── */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">9. Children&apos;s Privacy</h2>
          <p className="text-muted-foreground leading-relaxed">
            Vidcura does not knowingly collect personal information from children under the age of
            13. Anyone may browse and watch courses without signing in. To create courses or save
            progress, users must sign in with a Google account and be at least 13 years old, in
            compliance with COPPA (Children&apos;s Online Privacy Protection Act). If we discover
            that we have inadvertently collected data from a child under 13, we will delete it
            immediately.
          </p>
        </section>

        {/* ── Data Retention ───────────────────────────────────── */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">10. Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed">
            We retain your data only for as long as your account is active or as needed to provide
            the service. Specifically:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1.5 mt-3">
            <li>
              <strong className="text-foreground">Course data</strong> — Kept until you delete the
              course or request account deletion
            </li>
            <li>
              <strong className="text-foreground">Learning progress</strong> — Kept until you clear
              your progress or request account deletion
            </li>
            <li>
              <strong className="text-foreground">Reports</strong> — Kept for up to 12 months after
              resolution for moderation audit purposes, then permanently deleted
            </li>
            <li>
              <strong className="text-foreground">Account data</strong> — Deleted within 30 days of
              an account deletion request
            </li>
          </ul>
        </section>

        {/* ── Your Rights ──────────────────────────────────────── */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">
            11. Your Rights (GDPR &amp; Global)
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            Regardless of where you are located, you have the following rights regarding your
            personal data:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1.5">
            <li>
              <strong className="text-foreground">Right to access</strong> — You can request a copy
              of all data we hold about you
            </li>
            <li>
              <strong className="text-foreground">Right to deletion</strong> — You can delete your
              courses from the &quot;My Courses&quot; page at any time, or request full account
              deletion
            </li>
            <li>
              <strong className="text-foreground">Right to rectification</strong> — You can update
              your course information at any time
            </li>
            <li>
              <strong className="text-foreground">Right to portability</strong> — You can request an
              export of your data in a machine-readable format
            </li>
            <li>
              <strong className="text-foreground">Right to object</strong> — You can object to any
              processing of your data
            </li>
            <li>
              <strong className="text-foreground">Right to withdraw consent</strong> — You can sign
              out and stop using the service at any time
            </li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            To exercise any of these rights, contact us at{" "}
            <a
              href="mailto:privacy@vidcura.app"
              className="text-primary-500 underline hover:no-underline font-semibold"
            >
              privacy@vidcura.app
            </a>
            . We will respond within 30 days.
          </p>
        </section>

        {/* ── Future-proofing ──────────────────────────────────── */}
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
            12. Our Promise for the Future
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            As Vidcura grows, we commit to these principles:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>
              We will <strong className="text-foreground">never</strong> introduce tracking,
              advertising, or sell user data
            </li>
            <li>
              We will <strong className="text-foreground">never</strong> download, re-host, or
              redistribute YouTube video content
            </li>
            <li>
              We will <strong className="text-foreground">always</strong> credit and link back to
              the original YouTube creators
            </li>
            <li>
              We will <strong className="text-foreground">always</strong> honour creator takedown
              requests promptly
            </li>
            <li>
              We will <strong className="text-foreground">always</strong> remain free for learners
            </li>
            <li>
              If we ever need to change our privacy practices significantly, we will notify users in
              advance and give them the option to delete their data before the changes take effect
            </li>
          </ul>
        </section>

        {/* ── Changes ──────────────────────────────────────────── */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">13. Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this privacy policy from time to time. When we make material changes, we
            will update the &quot;Last updated&quot; date at the top of this page. Continued use of
            Vidcura after changes constitutes your acceptance of the updated policy.
          </p>
        </section>

        {/* ── Contact ──────────────────────────────────────────── */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">14. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions about this privacy policy, your data, or our practices,
            contact us at:
          </p>
          <ul className="list-none text-muted-foreground space-y-1.5 mt-3">
            <li>
              📧 Privacy:{" "}
              <a
                href="mailto:privacy@vidcura.app"
                className="text-primary-500 underline hover:no-underline font-semibold"
              >
                privacy@vidcura.app
              </a>
            </li>
            <li>
              📧 Legal:{" "}
              <a
                href="mailto:legal@vidcura.app"
                className="text-primary-500 underline hover:no-underline font-semibold"
              >
                legal@vidcura.app
              </a>
            </li>
            <li>
              📧 Takedowns:{" "}
              <a
                href="mailto:takedown@vidcura.app"
                className="text-primary-500 underline hover:no-underline font-semibold"
              >
                takedown@vidcura.app
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
