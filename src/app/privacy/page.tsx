import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "LearnLoom Privacy Policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="container-page py-12 max-w-3xl">
      <h1 className="font-heading font-extrabold text-3xl mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground font-body text-sm mb-8">Last updated: January 2025</p>

      <div className="font-body text-foreground space-y-6">
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">What we collect</h2>
          <p className="text-muted-foreground leading-relaxed">
            When you sign in with Google, we receive your name, email address, and profile photo
            from Google. We store your display name and photo URL in our database to show on your
            courses. We do not store your email address.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">We also store:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
            <li>Courses you create (title, description, category, lesson links)</li>
            <li>Your learning progress (which lessons you&apos;ve completed)</li>
            <li>Reports you submit about courses</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading font-bold text-xl mb-3">How we use it</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use your data solely to provide the LearnLoom service — displaying your courses,
            showing your learning progress, and moderating reported content. We do not sell your
            data, use it for advertising, or share it with third parties except Firebase (Google)
            which powers our database and authentication.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-xl mb-3">YouTube</h2>
          <p className="text-muted-foreground leading-relaxed">
            LearnLoom embeds videos hosted by YouTube (google.com/intl/en/policies/privacy). When
            you watch a video, YouTube may collect data according to their own privacy policy. We
            use youtube-nocookie.com embeds to reduce cross-site tracking.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-xl mb-3">Your rights</h2>
          <p className="text-muted-foreground leading-relaxed">
            You can delete your courses at any time from the &quot;My Courses&quot; page. To request
            deletion of all your data, contact us at{" "}
            <a
              href="mailto:privacy@learnloom.app"
              className="text-primary-500 underline hover:no-underline"
            >
              privacy@learnloom.app
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-xl mb-3">Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            LearnLoom uses only functional cookies required for authentication (provided by
            Firebase). We do not use advertising or tracking cookies.
          </p>
        </section>
      </div>
    </div>
  );
}
