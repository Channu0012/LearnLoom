import Link from "next/link";
import { PlaylistGuideVideo } from "@/components/home/PlaylistGuideVideo";

export default function HomePage() {
  const topCategories = [
    "Programming",
    "Design",
    "Business & Finance",
    "Science & Maths",
    "Languages",
    "Exam Prep",
    "Music & Arts",
    "Health & Fitness",
  ];

  return (
    <div className="w-full overflow-x-hidden">
      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-16 sm:py-24 lg:py-28"
        aria-labelledby="hero-title"
      >
        {/* Subtle Ambient Lighting Orbs */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, #0F766E 0%, #C2410C 70%, transparent 100%)",
          }}
          aria-hidden="true"
        />

        <div className="container-page relative z-10 text-center max-w-4xl mx-auto">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-xs font-heading font-semibold mb-6 shadow-sm animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse flex-shrink-0" />
            <span>Open Educational Platform · Zero Tracking · Ad-Free</span>
          </div>

          {/* Master Headline */}
          <h1
            id="hero-title"
            className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl text-foreground mb-6 tracking-tight leading-[1.1] animate-slide-up"
          >
            Turn video playlists into{" "}
            <span className="bg-gradient-to-r from-teal-600 via-primary-500 to-amber-600 bg-clip-text text-transparent">
              structured masterclasses.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="font-body text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up">
            A distraction-free learning workspace. Organize lectures, track completed modules, and
            build daily study habits without algorithmic interruptions.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14 animate-slide-up">
            <Link
              href="/explore"
              id="cta-explore"
              className="btn-primary text-sm sm:text-base px-8 py-3.5 min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 transition-all font-heading font-bold"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Explore Courses</span>
            </Link>

            <Link
              href="/quick-watch"
              id="cta-quick-watch"
              className="btn-ghost text-sm sm:text-base px-7 py-3.5 min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-border bg-card/60 hover:bg-muted font-heading font-semibold"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>Quick Watch (Paste & Play)</span>
            </Link>
          </div>

          {/* Key Value Proof Metrics */}
          <div className="inline-flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-3 px-6 rounded-2xl bg-card/60 border border-border text-xs sm:text-sm text-muted-foreground font-body shadow-sm">
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-foreground">100% Free</span>
              <span>Open to all</span>
            </div>
            <div className="w-px h-4 bg-border hidden sm:block" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-foreground">Zero Ads</span>
              <span>Pure focus</span>
            </div>
            <div className="w-px h-4 bg-border hidden sm:block" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-foreground">Instant Syllabus</span>
              <span>Auto-generated</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Compact Video Walkthrough ──────────────────────────────────────── */}
      <PlaylistGuideVideo />

      {/* ── Three Core Pillars ────────────────────────────────────────────── */}
      <section
        className="py-16 sm:py-24 bg-card/40 border-y border-border"
        aria-labelledby="features-title"
      >
        <div className="container-page max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2
              id="features-title"
              className="font-heading font-extrabold text-2xl sm:text-4xl text-foreground mb-3 tracking-tight"
            >
              Built for deep focus, not endless scrolling.
            </h2>
            <p className="font-body text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Every detail is engineered to help you complete what you start.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="clay-card p-7 bg-card border border-border rounded-3xl hover:border-primary-400 transition-all shadow-sm hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-5 border border-teal-200/50">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                  Distraction-Free Theater
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  Cinema focus mode with automatic lesson progression, zero comments, and zero
                  algorithmic rabbit holes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 text-xs font-heading font-semibold text-primary-600 dark:text-primary-400">
                Theater mode · Auto-next countdown
              </div>
            </div>

            <div className="clay-card p-7 bg-card border border-border rounded-3xl hover:border-primary-400 transition-all shadow-sm hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 flex items-center justify-center mb-5 border border-orange-200/50">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                  Automated Curriculum
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  Paste any public link to get an interactive syllabus with chapter checklists,
                  video durations, and completion badges.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 text-xs font-heading font-semibold text-primary-600 dark:text-primary-400">
                Instant syllabus · Progress tracking
              </div>
            </div>

            <div className="clay-card p-7 bg-card border border-border rounded-3xl hover:border-primary-400 transition-all shadow-sm hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 flex items-center justify-center mb-5 border border-primary-200/50">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                  Private Learning Hub
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  Take in-browser scratchpad notes, maintain daily learning streaks, and resume
                  seamlessly across your laptop, tablet, or phone.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 text-xs font-heading font-semibold text-primary-600 dark:text-primary-400">
                Streak rewards · Scratchpad notes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Tags Quick Navigation ──────────────────────────────── */}
      <section className="py-14 sm:py-16" aria-labelledby="disciplines-title">
        <div className="container-page max-w-5xl mx-auto text-center">
          <h3
            id="disciplines-title"
            className="font-heading font-bold text-xs uppercase tracking-widest text-muted-foreground mb-6"
          >
            Explore Curated Disciplines
          </h3>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {topCategories.map((cat) => (
              <Link
                key={cat}
                href={`/explore?category=${encodeURIComponent(cat)}`}
                className="px-4 py-2 min-h-[40px] rounded-xl bg-card border border-border text-foreground/80 hover:text-foreground hover:border-primary-400 hover:bg-muted text-xs sm:text-sm font-heading font-medium transition-all"
              >
                {cat}
              </Link>
            ))}
            <Link
              href="/explore"
              className="px-4 py-2 min-h-[40px] rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-heading font-bold text-xs sm:text-sm transition-all"
            >
              All Courses →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Minimalist Company-Level Call To Action ────────────────────────── */}
      <section className="py-16 sm:py-24 border-t border-border bg-gradient-to-b from-card to-background">
        <div className="container-page max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-foreground mb-4 tracking-tight">
            Start learning in flow.
          </h2>
          <p className="font-body text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
            Free forever. No login required to watch. Join thousands of focused learners worldwide.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/explore"
              className="btn-primary text-sm px-7 py-3.5 min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 shadow-md"
            >
              <span>Browse Catalog</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>

            <Link
              href="/create"
              id="cta-create"
              className="btn-ghost text-sm px-7 py-3.5 min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-border"
            >
              <span>Create Course from Playlist</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
