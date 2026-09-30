import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Vidcura Cookie Policy — understanding how we handle cookies and local storage.",
  alternates: {
    canonical: "/cookies",
  },
};

export default function CookiesPage() {
  return (
    <div className="container-page py-12 max-w-3xl">
      <h1 className="font-heading font-extrabold text-3xl mb-2 text-foreground">Cookie Policy</h1>
      <p className="text-muted-foreground font-body text-sm mb-8">Last updated: September 2026</p>

      <div className="font-body text-foreground space-y-8">
        <section className="clay-card p-6 bg-card border-border">
          <h2 className="font-heading font-bold text-xl mb-3 text-primary-500">
            Summary: Privacy First
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Vidcura operates on a strict minimal-data philosophy. We do <strong>not</strong> use
            tracking cookies, third-party advertising cookies, or behavioral surveillance. We only
            utilize strictly necessary storage for authentication sessions and your theme/cookie
            preferences.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-xl mb-3">
            1. What are Cookies and Local Storage?
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Cookies and browser local storage are small text files placed on your device to enable
            websites to function properly, remember your preferences, and maintain secure login
            states.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-xl mb-3">2. How Vidcura Uses Storage</h2>
          <div className="overflow-x-auto my-4">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="py-2.5 px-3 font-heading font-semibold text-foreground">Item</th>
                  <th className="py-2.5 px-3 font-heading font-semibold text-foreground">Type</th>
                  <th className="py-2.5 px-3 font-heading font-semibold text-foreground">
                    Purpose
                  </th>
                  <th className="py-2.5 px-3 font-heading font-semibold text-foreground">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-muted-foreground">
                <tr>
                  <td className="py-2.5 px-3 font-mono text-xs text-foreground">
                    firebase:authUser
                  </td>
                  <td className="py-2.5 px-3">Session Storage</td>
                  <td className="py-2.5 px-3">Keeps you signed in securely to create courses</td>
                  <td className="py-2.5 px-3">Session / Auth duration</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono text-xs text-foreground">
                    vidcura_cookie_consent
                  </td>
                  <td className="py-2.5 px-3">Local Storage</td>
                  <td className="py-2.5 px-3">Remembers your cookie banner acknowledgment</td>
                  <td className="py-2.5 px-3">1 year</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-heading font-bold text-xl mb-3">3. Third-Party Video Embeds</h2>
          <p className="text-muted-foreground leading-relaxed">
            When watching course videos, playback is rendered through privacy-enhanced embedded
            players. According to the video platform, privacy-enhanced mode does not set tracking
            cookies unless you click play.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-xl mb-3">4. Managing Your Preferences</h2>
          <p className="text-muted-foreground leading-relaxed">
            You can clear local storage and cookies at any time through your browser settings. For
            questions about our cookie policy or data privacy, please review our{" "}
            <Link href="/privacy" className="text-primary-500 underline hover:no-underline">
              Privacy Policy
            </Link>{" "}
            or contact us at{" "}
            <a
              href="mailto:privacy@vidcura.app"
              className="text-primary-500 underline hover:no-underline"
            >
              privacy@vidcura.app
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
