import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Takedown Request",
  description: "Request removal of a course that contains your copyrighted content.",
};

export default function TakedownPage() {
  return (
    <div className="container-page py-12 max-w-3xl">
      <h1 className="font-heading font-extrabold text-3xl mb-2">Takedown Request</h1>
      <p className="text-muted-foreground font-body text-sm mb-8">
        For copyright and content removal requests
      </p>

      <div className="clay-card p-6 mb-8 border-amber-300">
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
          Important: Videos are hosted by YouTube
        </h2>
        <p className="text-sm font-body text-foreground/80 leading-relaxed">
          LearnLoom does not host any video content. All videos embedded in our courses are hosted
          by YouTube. LearnLoom only links to existing YouTube videos — we do not upload, store, or
          distribute video files.
        </p>
        <p className="text-sm font-body text-foreground/80 leading-relaxed mt-3">
          To remove the video itself, please submit a copyright takedown directly to YouTube:{" "}
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

      <div className="font-body text-foreground space-y-6">
        <section>
          <h2 className="font-heading font-bold text-xl mb-3">Request removal from LearnLoom</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you would like us to remove a course or lesson from LearnLoom (for example, because
            it features your content without permission, or violates our{" "}
            <a href="/terms" className="text-primary-500 underline hover:no-underline">
              Terms of Service
            </a>
            ), please email us with the following information:
          </p>

          <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
            <li>Your full name and contact information</li>
            <li>The URL of the LearnLoom course or lesson you want removed</li>
            <li>A description of why the content should be removed</li>
            <li>
              If a copyright claim: a statement that you are the rights holder or authorised to act
              on their behalf
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading font-bold text-xl mb-3">Contact us</h2>
          <p className="text-muted-foreground leading-relaxed">
            Send your request to:{" "}
            <a
              href="mailto:takedown@learnloom.app"
              className="text-primary-500 underline hover:no-underline font-semibold"
            >
              takedown@learnloom.app
            </a>
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            We aim to respond within 5 business days. Valid requests will result in the course or
            lesson being removed from LearnLoom promptly.
          </p>
        </section>

        <section className="clay-card p-5 bg-muted/30">
          <h2 className="font-heading font-bold text-base mb-2">Signed-in users</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If you are signed in, you can also report individual courses directly using the
            &quot;Report&quot; button on any course page. Our moderation team reviews all reports.
          </p>
        </section>
      </div>
    </div>
  );
}
