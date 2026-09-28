import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "LearnLoom Terms of Service — understand your rights and responsibilities.",
};

export default function TermsPage() {
  return (
    <div className="container-page py-12 max-w-3xl">
      <h1 className="font-heading font-extrabold text-3xl mb-2">Terms of Service</h1>
      <p className="text-muted-foreground font-body text-sm mb-8">Last updated: January 2025</p>

      <div className="prose prose-sm max-w-none font-body text-foreground space-y-6">
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">1. About LearnLoom</h2>
          <p className="text-muted-foreground leading-relaxed">
            LearnLoom is a free platform that allows users to create and share structured courses
            built from YouTube video links. LearnLoom does not host any video content itself — all
            videos are embedded directly from YouTube and remain subject to YouTube&apos;s own Terms
            of Service and policies.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-xl mb-3">2. Who can use LearnLoom</h2>
          <p className="text-muted-foreground leading-relaxed">
            Anyone may browse and watch courses without an account. To create courses, save
            progress, or report content, you must sign in with a Google account. You must be at
            least 13 years old to create an account.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-xl mb-3">3. Content and conduct</h2>
          <p className="text-muted-foreground leading-relaxed">
            You are responsible for the courses you create. You must not include links to videos
            that infringe copyright, contain harmful content, promote illegal activity, or otherwise
            violate YouTube&apos;s Terms of Service. LearnLoom reserves the right to remove any
            course at any time, with or without notice.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-xl mb-3">4. Videos and copyright</h2>
          <p className="text-muted-foreground leading-relaxed">
            All videos displayed on LearnLoom are hosted by YouTube, not by LearnLoom. If you are a
            copyright owner and believe that a video embedded in a LearnLoom course infringes your
            rights, please{" "}
            <a href="/takedown" className="text-primary-500 underline hover:no-underline">
              submit a takedown request
            </a>
            . We will remove the course or lesson promptly upon verification.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-xl mb-3">
            5. Disclaimer and limitation of liability
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            LearnLoom is provided &quot;as is&quot; without warranties of any kind. We are not
            liable for any loss or damage arising from the use of this service or any course
            content.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-xl mb-3">6. Changes to these terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update these terms at any time. Continued use of LearnLoom after changes
            constitutes your acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-xl mb-3">7. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            Questions? Email us at{" "}
            <a
              href="mailto:legal@learnloom.app"
              className="text-primary-500 underline hover:no-underline"
            >
              legal@learnloom.app
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
