import Link from "next/link";
import { CourseCard } from "@/components/courses/CourseCard";
import { getPublishedCourses } from "@/lib/firestore";

export const dynamic = "force-dynamic";

// This is a Server Component — fetches the latest published courses at request time
async function LatestCourses() {
  try {
    const courses = await getPublishedCourses([], 6);
    if (courses.length === 0) {
      return (
        <div className="clay-card p-10 text-center max-w-lg mx-auto my-6 border-2 border-border bg-card">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <h3 className="font-heading font-bold text-lg text-foreground mb-2">
            No courses published yet
          </h3>
          <p className="text-muted-foreground font-body text-sm mb-6 leading-relaxed max-w-sm mx-auto">
            Be the very first learner to weave YouTube lessons into a free, distraction-free course.
          </p>
          <Link
            href="/create"
            className="btn-accent text-sm px-6 py-2.5 inline-flex items-center gap-2"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Create the first course</span>
          </Link>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    );
  } catch {
    // Firestore may not be configured during static builds — show clean empty state
    return (
      <div className="clay-card p-10 text-center max-w-lg mx-auto my-6 border-2 border-border bg-card">
        <h3 className="font-heading font-bold text-lg text-foreground mb-2">
          Explore our collection
        </h3>
        <p className="text-muted-foreground font-body text-sm mb-6">
          Find and learn from community-built YouTube courses.
        </p>
        <Link href="/explore" className="btn-primary text-sm px-6 py-2.5">
          Browse all courses
        </Link>
      </div>
    );
  }
}

export default function HomePage() {
  return (
    <div className="w-full overflow-x-hidden">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-16 sm:py-24" aria-labelledby="hero-heading">
        {/* Background ambient glow orbs with breathing animation */}
        <div
          className="absolute top-0 left-0 w-[420px] h-[420px] rounded-full opacity-25 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse-glow"
          style={{ background: "#0F766E" }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none animate-pulse-glow"
          style={{ background: "#C2410C" }}
          aria-hidden="true"
        />

        <div className="container-page relative z-10 text-center">
          {/* Eyebrow badge with gentle float animation */}
          <div className="inline-flex items-center gap-2 badge-primary mb-6 text-sm px-4 py-1.5 shadow-sm animate-float">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>100% Free · No Ads · No Login Required to Watch</span>
          </div>

          <h1
            id="hero-heading"
            className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-foreground mb-6 leading-tight tracking-tight animate-slide-up"
          >
            Weave <span className="text-primary-600 dark:text-primary-400">YouTube videos</span> into
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-teal-600 via-primary-500 to-amber-600 bg-clip-text text-transparent animate-gradient font-black">
              {" "}structured courses
            </span>
          </h1>

          <p className="font-body text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up">
            Organize fragmented video tutorials into distraction-free playlists. Track your
            progress, share learning paths, and master new skills without algorithmic interruptions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Link
              href="/create"
              id="cta-create"
              className="btn-accent text-base px-8 py-3.5 w-full sm:w-auto inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Create a course</span>
            </Link>
            <Link
              href="/explore"
              id="cta-explore"
              className="btn-ghost text-base px-8 py-3.5 w-full sm:w-auto inline-flex items-center justify-center gap-2"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Explore courses</span>
            </Link>
          </div>

          {/* Transparent verified metrics */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-sm text-muted-foreground font-body">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-heading font-bold text-primary-600">
                Free
              </span>
              <span>forever</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-border" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-heading font-bold text-primary-600">9</span>
              <span>curated categories</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-border" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-heading font-bold text-primary-600">0</span>
              <span>tracking ads</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section
        className="py-16 bg-card border-y border-border"
        aria-labelledby="how-it-works-heading"
      >
        <div className="container-page">
          <h2
            id="how-it-works-heading"
            className="font-heading font-bold text-2xl sm:text-3xl text-center mb-12 text-foreground"
          >
            How Learnloom Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                icon: (
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0F766E"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                ),
                title: "Paste YouTube links",
                desc: "Paste URLs from your favourite lectures and guides. Lesson titles and thumbnails are fetched instantly.",
              },
              {
                step: "2",
                icon: (
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#C2410C"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                ),
                title: "Curate and publish",
                desc: "Reorder chapters, customize titles, select a category, and publish your course to share with learners.",
              },
              {
                step: "3",
                icon: (
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0F766E"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                ),
                title: "Learn without distractions",
                desc: "Watch in a focused player without comment arguments, recommended tangents, or sidebar noise.",
              },
            ].map(({ step, icon, title, desc }) => (
              <div
                key={step}
                className="clay-card p-6 text-center bg-card hover:border-teal-500 hover:-translate-y-1 transition-all duration-300 group shadow-sm hover:shadow-md"
              >
                <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-primary-50 dark:group-hover:bg-primary-950/60 transition-all duration-300">
                  {icon}
                </div>
                <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 font-heading font-bold text-xs flex items-center justify-center mx-auto mb-3">
                  {step}
                </div>
                <h3 className="font-heading font-bold text-base text-foreground mb-2 group-hover:text-primary-600 transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest courses ─────────────────────────────────────────────────── */}
      <section className="py-16" aria-labelledby="latest-heading">
        <div className="container-page">
          <div className="flex items-center justify-between mb-8">
            <h2
              id="latest-heading"
              className="font-heading font-bold text-2xl sm:text-3xl text-foreground"
            >
              Community Courses
            </h2>
            <Link
              href="/explore"
              className="btn-ghost text-sm px-4 py-2 inline-flex items-center gap-1.5"
              aria-label="Browse all courses"
            >
              <span>See all</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>

          <LatestCourses />
        </div>
      </section>
    </div>
  );
}
