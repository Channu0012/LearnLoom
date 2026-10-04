import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact & Support — VeySkill",
  description:
    "Get in touch with the VeySkill team for payment inquiries, technical assistance, creator copyright support, or grievance redressal.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="container-page py-12 max-w-4xl">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left">
        <span className="text-xs font-mono uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
          Support &amp; Grievance Redressal
        </span>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground mt-3 mb-2">
          Contact VeySkill Support
        </h1>
        <p className="text-muted-foreground font-body text-base max-w-2xl">
          Have questions about your learning streaks, payment processing, or credential
          verification? We&apos;re here to assist you every step of the way.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Card 1: Payment & Order Help */}
        <div className="clay-card p-6 border border-border flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h2 className="font-heading font-bold text-lg text-foreground mb-1">
              Payment &amp; Billing
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Assistance with Cashfree transactions, duplicate debits, invoice queries, or pending
              orders.
            </p>
          </div>
          <a
            href="mailto:support@veyskill.in?subject=Payment%20Support%20Inquiry"
            className="inline-flex items-center text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
          >
            support@veyskill.in →
          </a>
        </div>

        {/* Card 2: Creator & Copyright */}
        <div className="clay-card p-6 border border-border flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="font-heading font-bold text-lg text-foreground mb-1">
              Creator &amp; DMCA
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Notice of proprietary content removal, YouTube creator attribution updates, or
              licensing inquiries.
            </p>
          </div>
          <Link
            href="/takedown"
            className="inline-flex items-center text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
          >
            Takedown Request Process →
          </Link>
        </div>

        {/* Card 3: Credential Verification */}
        <div className="clay-card p-6 border border-border flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h2 className="font-heading font-bold text-lg text-foreground mb-1">
              Verification Registry
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              For employers, university registrars, and corporate recruiters verifying credential
              checksums.
            </p>
          </div>
          <Link
            href="/verify"
            className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Verify a Certificate →
          </Link>
        </div>
      </div>

      {/* Operational & Compliance Details */}
      <div className="space-y-6">
        <div className="clay-card p-6 border border-border">
          <h2 className="font-heading font-bold text-xl mb-4 text-foreground">
            Operational &amp; Grievance Officer Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-body">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                Platform Operator
              </p>
              <p className="font-semibold text-foreground mt-0.5">
                VeySkill Open Education Platform
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                Operating Region
              </p>
              <p className="font-semibold text-foreground mt-0.5">Bengaluru, Karnataka, India</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                Customer Support Hours
              </p>
              <p className="font-semibold text-foreground mt-0.5">
                Monday – Saturday: 9:00 AM – 6:00 PM IST
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                Response SLA
              </p>
              <p className="font-semibold text-foreground mt-0.5">Within 24 to 48 business hours</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                Official Support Desk
              </p>
              <a
                href="mailto:support@veyskill.in"
                className="font-semibold text-primary-500 hover:underline mt-0.5 block"
              >
                support@veyskill.in
              </a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                Grievance Redressal
              </p>
              <a
                href="mailto:grievance@veyskill.in"
                className="font-semibold text-primary-500 hover:underline mt-0.5 block"
              >
                grievance@veyskill.in
              </a>
            </div>
          </div>
        </div>

        {/* RBI & Payment Gateway Disclosure */}
        <div className="p-4 rounded-xl bg-card border border-border/80 text-xs text-muted-foreground font-body space-y-2">
          <p>
            <strong className="text-foreground">Payment Partner Disclosure:</strong> VeySkill
            partners with Cashfree Payments (authorized by the Reserve Bank of India as a Payment
            Aggregator) to facilitate secure, encrypted payment processing via UPI, Credit/Debit
            Cards, and NetBanking.
          </p>
          <p>
            <strong className="text-foreground">YouTube Disclosure:</strong> VeySkill is an
            independent educational client using YouTube API Services. For information on
            YouTube&apos;s data policies, please review the{" "}
            <a
              href="https://www.youtube.com/t/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-foreground"
            >
              YouTube Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-foreground"
            >
              Google Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
