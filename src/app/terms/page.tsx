import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Vidcura Terms of Service — your rights, responsibilities, original creator protections, and content policies.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="container-page py-12 max-w-3xl">
      <h1 className="font-heading font-extrabold text-3xl mb-2">Terms of Service</h1>
      <p className="text-muted-foreground font-body text-sm mb-8">Last updated: September 2026</p>

      <div className="prose prose-sm max-w-none font-body text-foreground space-y-8">
        {/* ── 1. About ─────────────────────────────────────────── */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">1. About Vidcura</h2>
          <p className="text-muted-foreground leading-relaxed">
            Vidcura is a free, non-commercial, open educational platform that allows users to
            organise publicly available YouTube video links into structured, distraction-free
            courses. Vidcura does <strong className="text-foreground">not</strong> host, download,
            store, cache, mirror, or redistribute any video content. All videos are embedded
            directly from YouTube using YouTube&apos;s official embed API and remain subject to
            YouTube&apos;s own Terms of Service and content policies.
          </p>
        </section>

        {/* ── 2. Eligibility ───────────────────────────────────── */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">2. Who Can Use Vidcura</h2>
          <p className="text-muted-foreground leading-relaxed">
            Anyone may browse and watch courses without an account. To create courses, save learning
            progress, or report content, you must sign in with a Google account. You must be at
            least 13 years old to create an account, in compliance with COPPA.
          </p>
        </section>

        {/* ── 3. YouTube Creator Respect ───────────────────────── */}
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
            3. YouTube Creator Rights &amp; Protection
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            Vidcura is built to{" "}
            <strong className="text-foreground">support and promote YouTube creators</strong>, not
            to exploit them. The following principles are non-negotiable:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>
              <strong className="text-foreground">Full creator attribution</strong> — Every embedded
              video displays the original creator&apos;s channel name, video title, and thumbnail.
              Course creators cannot hide or misrepresent the original creator.
            </li>
            <li>
              <strong className="text-foreground">All views benefit the creator</strong> — Views
              through Vidcura embeds are counted by YouTube and contribute to the creator&apos;s
              analytics, watch-time, and monetisation revenue.
            </li>
            <li>
              <strong className="text-foreground">No content theft</strong> — Vidcura never
              downloads, re-hosts, mirrors, transcodes, or redistributes video content. Videos are
              streamed directly from YouTube&apos;s servers.
            </li>
            <li>
              <strong className="text-foreground">No monetisation of creator work</strong> — Vidcura
              is 100% free and non-commercial. We do not charge fees, run ads, use affiliate links,
              or generate any revenue from embedded creator content.
            </li>
            <li>
              <strong className="text-foreground">Respect for embed settings</strong> — If a creator
              disables embedding on their video, it will not play on Vidcura. We fully respect
              YouTube&apos;s embed restrictions.
            </li>
            <li>
              <strong className="text-foreground">Instant takedown rights</strong> — Any YouTube
              creator can request the removal of their content from Vidcura courses at any time via
              our{" "}
              <Link href="/takedown" className="text-primary-500 underline hover:no-underline">
                takedown process
              </Link>
              . We comply within 48 hours.
            </li>
            <li>
              <strong className="text-foreground">No impersonation</strong> — Users must not
              impersonate, falsely claim affiliation with, or misrepresent any YouTube creator.
            </li>
          </ul>
        </section>

        {/* ── 4. Content and Conduct ───────────────────────────── */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">4. Content &amp; Conduct Policy</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            You are responsible for the courses you create. The following are strictly prohibited:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>
              Linking to videos that infringe copyright, contain hate speech, harassment, violence,
              doxxing, or illegal content
            </li>
            <li>
              Creating courses that promote scams, phishing, spam, malware, or commercial
              exploitation
            </li>
            <li>Impersonating other users, creators, or organisations</li>
            <li>
              Uploading misleading titles, descriptions, or categories designed to deceive learners
            </li>
            <li>
              Any activity that violates YouTube&apos;s Terms of Service or Community Guidelines
            </li>
            <li>Bulk-creating courses for SEO manipulation or link farming</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Vidcura reserves the right to remove any course and suspend any account that violates
            these policies, with or without prior notice.
          </p>
        </section>

        {/* ── 5. Copyright ─────────────────────────────────────── */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">5. Copyright &amp; DMCA</h2>
          <p className="text-muted-foreground leading-relaxed">
            All videos displayed on Vidcura are hosted by and remain the property of their
            respective owners on YouTube. Vidcura does not claim any ownership of embedded content.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            If you are a copyright owner and believe that a video embedded in a Vidcura course
            infringes your rights:
          </p>
          <ol className="list-decimal list-inside text-muted-foreground space-y-1.5 mt-3">
            <li>
              <strong className="text-foreground">For the video itself</strong> — Submit a takedown
              directly to YouTube at{" "}
              <a
                href="https://www.youtube.com/reportabuse"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-500 underline hover:no-underline"
              >
                youtube.com/reportabuse
              </a>
            </li>
            <li>
              <strong className="text-foreground">For the Vidcura course</strong> — Submit a{" "}
              <Link href="/takedown" className="text-primary-500 underline hover:no-underline">
                takedown request
              </Link>{" "}
              to us and we will remove the course or lesson promptly
            </li>
          </ol>
        </section>

        {/* ── 6. Community Reporting ───────────────────────────── */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">
            6. Community Reporting &amp; Moderation
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Signed-in users can report courses directly using the &quot;Report&quot; button on any
            course page. Our moderation team reviews all reports within 48 hours. We take action
            based on:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1.5 mt-3">
            <li>Severity of the violation (immediate removal for harmful content)</li>
            <li>Pattern of behaviour (repeat offenders face account suspension)</li>
            <li>Creator takedown requests (always honoured promptly)</li>
          </ul>
        </section>

        {/* ── 7. Intellectual Property ─────────────────────────── */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">7. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Vidcura platform (design, code, and brand) is the intellectual property of Vidcura.
            Course metadata you create (titles, descriptions, lesson ordering) belongs to you.
            YouTube videos and thumbnails belong to their respective creators and are displayed
            under YouTube&apos;s embed licence.
          </p>
        </section>

        {/* ── 8. Privacy ───────────────────────────────────────── */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">8. Privacy &amp; Data Protection</h2>
          <p className="text-muted-foreground leading-relaxed">
            Your privacy is our core priority. We collect minimal data, use no tracking, and never
            sell your information. Full details are in our{" "}
            <Link href="/privacy" className="text-primary-500 underline hover:no-underline">
              Privacy Policy
            </Link>
            . Key highlights:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1.5 mt-3">
            <li>No email storage, no advertising cookies, no analytics trackers</li>
            <li>All data encrypted in transit (TLS) and at rest (AES-256)</li>
            <li>Google OAuth 2.0 authentication — we never handle passwords</li>
            <li>Strict Firestore Security Rules — you can only access your own data</li>
            <li>Full GDPR rights: access, deletion, portability, objection</li>
          </ul>
        </section>

        {/* ── 9. Security ──────────────────────────────────────── */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">9. Platform Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            Vidcura is built on Firebase/Google Cloud infrastructure with enterprise-grade security:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1.5 mt-3">
            <li>HTTPS-only access with TLS 1.2+ encryption</li>
            <li>Server-side security rules enforced at the database level</li>
            <li>No server-side logging of personal or behavioural data</li>
            <li>Regular security reviews of Firestore rules and access patterns</li>
            <li>
              Minimal attack surface — no custom backend servers, no file uploads, no payment
              processing
            </li>
          </ul>
        </section>

        {/* ── 10. Disclaimer ───────────────────────────────────── */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">
            10. Disclaimer &amp; Limitation of Liability
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Vidcura is provided &quot;as is&quot; and &quot;as available&quot; without warranties of
            any kind, express or implied. We are not responsible for the content, accuracy, or
            availability of YouTube videos embedded in courses. We are not liable for any direct,
            indirect, incidental, or consequential loss or damage arising from the use of this
            service or any course content.
          </p>
        </section>

        {/* ── 11. Changes ──────────────────────────────────────── */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">11. Changes to These Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update these terms at any time. When we make material changes, we will update the
            &quot;Last updated&quot; date at the top of this page. Continued use of Vidcura after
            changes constitutes your acceptance of the updated terms. If changes are significant, we
            will provide advance notice when possible.
          </p>
        </section>

        {/* ── 12. Contact ──────────────────────────────────────── */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">12. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            Questions about these terms? Reach out to us:
          </p>
          <ul className="list-none text-muted-foreground space-y-2 mt-3">
            <li className="flex items-center gap-2">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary-500"
                aria-hidden="true"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <span>
                Legal:{" "}
                <a
                  href="mailto:legal@vidcura.app"
                  className="text-primary-500 underline hover:no-underline font-semibold"
                >
                  legal@vidcura.app
                </a>
              </span>
            </li>
            <li className="flex items-center gap-2">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary-500"
                aria-hidden="true"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <span>
                Takedowns:{" "}
                <a
                  href="mailto:takedown@vidcura.app"
                  className="text-primary-500 underline hover:no-underline font-semibold"
                >
                  takedown@vidcura.app
                </a>
              </span>
            </li>
            <li className="flex items-center gap-2">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary-500"
                aria-hidden="true"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <span>
                Privacy:{" "}
                <a
                  href="mailto:privacy@vidcura.app"
                  className="text-primary-500 underline hover:no-underline font-semibold"
                >
                  privacy@vidcura.app
                </a>
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
