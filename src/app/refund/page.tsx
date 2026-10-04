import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — VeySkill",
  description:
    "Refund, Cancellation, and Dispute Resolution Policy for VeySkill educational credential services.",
  alternates: {
    canonical: "/refund",
  },
};

export default function RefundPage() {
  return (
    <div className="container-page py-12 max-w-3xl">
      <div className="mb-8">
        <span className="text-xs font-mono uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
          Payment &amp; Consumer Protection
        </span>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground mt-3 mb-2">
          Refund &amp; Cancellation Policy
        </h1>
        <p className="text-muted-foreground font-body text-sm">
          Last updated: October 2026 · Compliant with RBI Payment Aggregator Guidelines &amp;
          Consumer Protection (E-Commerce) Rules
        </p>
      </div>

      <div className="font-body text-foreground space-y-8 leading-relaxed">
        {/* 1. Core Learning is Always Free */}
        <section className="clay-card p-6 border-teal-500/20 bg-teal-50/20 dark:bg-teal-950/10">
          <h2 className="font-heading font-bold text-xl text-foreground mb-2 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            1. Core Learning is 100% Free Forever
          </h2>
          <p className="text-sm text-muted-foreground">
            VeySkill is committed to democratizing education. All video lectures, playlist indexing,
            scratchpad notes, interactive practice quizzes, and learning streak accountability are
            completely free for all learners worldwide. We never charge for watching YouTube videos
            or accessing open educational content.
          </p>
        </section>

        {/* 2. Verifiable Credential Services */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">
            2. Digital Credential Services (₹29 INR)
          </h2>
          <p className="text-muted-foreground text-sm mb-3">
            Upon completing 100% of a course&apos;s lectures and quizzes, learners may optionally
            choose to mint an{" "}
            <strong className="text-foreground">Official Executive Verifiable Credential</strong>.
            The nominal one-time processing fee of{" "}
            <strong className="text-foreground">₹29 (INR, inclusive of applicable taxes)</strong>{" "}
            covers:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
            <li>Instant cryptographic hash generation and verification checksum calculation.</li>
            <li>
              Permanent immutable hosting in our public verification database at{" "}
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                veyskill.in/verify/[id]
              </code>
              .
            </li>
            <li>Real-time scannable QR code generation for employers and recruiters.</li>
            <li>Print-ready high-resolution vector PDF and SVG master certificate rendering.</li>
            <li>1-Click LinkedIn Add-to-Profile integration.</li>
          </ul>
        </section>

        {/* 3. Non-Refundable Nature */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">3. Non-Refundable Once Minted</h2>
          <p className="text-muted-foreground text-sm">
            Because verifiable digital credentials, cryptographic verification IDs, and public
            registry records are generated and committed immediately upon successful payment
            authorization,
            <strong className="text-foreground">
              {" "}
              credentials that have been successfully generated and issued are non-refundable and
              non-returnable
            </strong>
            . Digital credentials cannot be un-minted or returned once made accessible to the public
            verification ledger.
          </p>
        </section>

        {/* 4. Eligible Refund Scenarios */}
        <section className="clay-card p-6 border-amber-500/20 bg-amber-50/20 dark:bg-amber-950/10">
          <h2 className="font-heading font-bold text-xl text-foreground mb-3 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            4. Guaranteed Refund Scenarios &amp; Exceptions
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            We will gladly issue a <strong className="text-foreground">100% full refund</strong>{" "}
            without hesitation in the following situations:
          </p>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="border-l-2 border-amber-500/40 pl-3">
              <strong className="text-foreground block">
                Payment Deducted but Credential Not Generated
              </strong>
              If your bank account or UPI was debited but a technical timeout prevented the
              certificate from being minted or verified.
            </div>
            <div className="border-l-2 border-amber-500/40 pl-3">
              <strong className="text-foreground block">Duplicate Billing</strong>
              If a network lag or double-click resulted in multiple debits for the exact same course
              credential, all redundant charges will be refunded in full.
            </div>
            <div className="border-l-2 border-amber-500/40 pl-3">
              <strong className="text-foreground block">Gateway / Bank Payment Failure</strong>
              Any transaction marked as &quot;Failed&quot; or &quot;User Dropped&quot; where funds
              were temporarily locked by your issuing bank will be automatically reversed.
            </div>
          </div>
        </section>

        {/* 5. Processing Timeline */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">5. Refund Processing Timeline</h2>
          <p className="text-muted-foreground text-sm mb-3">
            Refunds are processed automatically through our RBI-licensed payment gateway partner,
            <strong className="text-foreground"> Cashfree Payments</strong>:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
            <li>
              <strong className="text-foreground">UPI / Instant Wallets:</strong> Typically refunded
              within 24 to 48 hours.
            </li>
            <li>
              <strong className="text-foreground">Net Banking &amp; Debit Cards:</strong> Typically
              credited within 3 to 5 business days.
            </li>
            <li>
              <strong className="text-foreground">Credit Cards:</strong> Credited within 5 to 7
              business days, depending on your card issuer&apos;s billing cycle.
            </li>
          </ul>
        </section>

        {/* 6. Cancellation Terms */}
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">6. Cancellation Policy</h2>
          <p className="text-muted-foreground text-sm">
            VeySkill operates on a per-certificate, pay-per-mint model. We do{" "}
            <strong className="text-foreground">not</strong> charge any recurring monthly or annual
            subscriptions. You may close the payment gate at any time prior to completing the
            transaction with zero penalty or obligation.
          </p>
        </section>

        {/* 7. Contact Support & Grievance */}
        <section className="border-t border-border pt-6">
          <h2 className="font-heading font-bold text-xl mb-3">
            7. Need Help or Disputing a Charge?
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            If you experienced an error during checkout or believe you were billed incorrectly,
            please reach out to our dedicated support team with your
            <strong className="text-foreground"> Order ID</strong> or{" "}
            <strong className="text-foreground">Payment Reference Number</strong>:
          </p>
          <div className="bg-card border border-border rounded-xl p-4 text-sm space-y-1.5">
            <p>
              <span className="text-muted-foreground">Email: </span>
              <a
                href="mailto:support@veyskill.in"
                className="text-primary-500 underline font-medium"
              >
                support@veyskill.in
              </a>
            </p>
            <p>
              <span className="text-muted-foreground">Subject Line: </span>
              <span className="font-mono text-xs">Payment Support - [Your Order ID]</span>
            </p>
            <p>
              <span className="text-muted-foreground">Response SLA: </span>
              <span className="text-foreground font-medium">Within 24 to 48 business hours</span>
            </p>
            <p>
              <span className="text-muted-foreground">Help Center: </span>
              <Link href="/contact" className="text-primary-500 underline">
                Contact &amp; Grievance Redressal Page
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
