import Link from "next/link";

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
            Weave <span className="text-primary-600 dark:text-primary-400">YouTube videos</span>{" "}
            into
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-teal-600 via-primary-500 to-amber-600 bg-clip-text text-transparent animate-gradient font-black">
              {" "}
              structured courses
            </span>
          </h1>

          <p className="font-body text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up">
            Organize fragmented video tutorials into distraction-free playlists. Track your
            progress, share learning paths, and master new skills without algorithmic interruptions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Link
              href="/explore"
              id="cta-explore"
              className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all"
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
            <Link
              href="/quick-watch"
              id="cta-quick-watch"
              className="btn-ghost text-base px-8 py-3.5 w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-border hover:border-primary-500 shadow-sm"
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
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>Quick Watch (Paste & Play)</span>
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
              <span className="text-xl sm:text-2xl font-heading font-bold text-primary-600">
                10
              </span>
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

      {/* ── Why LearnLoom ──────────────────────────────────────────────────── */}
      <section className="py-16" aria-labelledby="why-heading">
        <div className="container-page">
          <h2
            id="why-heading"
            className="font-heading font-bold text-2xl sm:text-3xl text-center mb-4 text-foreground"
          >
            Why LearnLoom?
          </h2>
          <p className="text-center text-muted-foreground font-body text-sm sm:text-base max-w-xl mx-auto mb-12 leading-relaxed">
            Everything you need to turn scattered YouTube tutorials into a powerful, focused
            learning experience.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
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
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ),
                title: "Distraction-Free Player",
                desc: "Watch lessons without ads, comments, or algorithm-driven rabbit holes. Just pure, focused learning.",
                accent:
                  "bg-teal-50 dark:bg-teal-950/40 group-hover:bg-teal-100 dark:group-hover:bg-teal-950/60",
              },
              {
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
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                ),
                title: "Track Your Progress",
                desc: "Mark lessons complete, pick up where you left off, and see how far you've come across every course.",
                accent:
                  "bg-orange-50 dark:bg-orange-950/40 group-hover:bg-orange-100 dark:group-hover:bg-orange-950/60",
              },
              {
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
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                ),
                title: "Community Curated",
                desc: "Discover courses built by learners who already found the best videos — so you don't have to search again.",
                accent:
                  "bg-orange-50 dark:bg-orange-950/40 group-hover:bg-orange-100 dark:group-hover:bg-orange-950/60",
              },
              {
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
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ),
                title: "Free & Private Forever",
                desc: "No subscription, no tracking, no login walls. Your learning journey stays yours — open and unrestricted.",
                accent:
                  "bg-teal-50 dark:bg-teal-950/40 group-hover:bg-teal-100 dark:group-hover:bg-teal-950/60",
              },
            ].map(({ icon, title, desc, accent }) => (
              <div
                key={title}
                className="clay-card p-6 bg-card hover:border-primary-400 hover:-translate-y-1 transition-all duration-300 group shadow-sm hover:shadow-md flex gap-5 items-start"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${accent} flex-shrink-0 flex items-center justify-center transition-all duration-300 group-hover:scale-110`}
                >
                  {icon}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-foreground mb-1.5 group-hover:text-primary-600 transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform Showcase ─────────────────────────────────────────── */}
      <section className="py-16 bg-card border-y border-border" aria-labelledby="platform-heading">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2
              id="platform-heading"
              className="font-heading font-extrabold text-2xl sm:text-3xl text-foreground mb-4"
            >
              Built for Serious Learners
            </h2>
            <p className="font-body text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              LearnLoom isn&apos;t just another playlist manager. It&apos;s a full-featured learning
              platform designed to help you master new skills — with the polish of apps you already
              love.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              {
                icon: (
                  <svg
                    width="24"
                    height="24"
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
                title: "Theatre-Mode Player",
                desc: "Immersive video player with autoplay, fullscreen, and zero distractions — no ads, no comments, no sidebar.",
                gradient: "from-teal-500/10 to-teal-500/5",
              },
              {
                icon: (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#C2410C"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                ),
                title: "Structured Curriculum",
                desc: "Every course has a clear syllabus with chapters, progress tracking, and a visual completion bar.",
                gradient: "from-orange-500/10 to-orange-500/5",
              },
              {
                icon: (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0F766E"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                ),
                title: "10 Curated Categories",
                desc: "From Programming to Movies, Science to Music — find or create courses in the category that matches your passion.",
                gradient: "from-teal-500/10 to-teal-500/5",
              },
              {
                icon: (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#C2410C"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                ),
                title: "Daily Learning Streaks",
                desc: "Build permanent learning habits with daily streak tracking and XP rewards for every lesson completed.",
                gradient: "from-orange-500/10 to-orange-500/5",
              },
              {
                icon: (
                  <svg
                    width="24"
                    height="24"
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
                ),
                title: "Private & Secure",
                desc: "No tracking, no data selling, no login walls for watching. Your learning stays completely private.",
                gradient: "from-teal-500/10 to-teal-500/5",
              },
              {
                icon: (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#C2410C"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                ),
                title: "Creator-First Platform",
                desc: "Every view counts for the original YouTube creator. We never download, re-host, or monetise their work.",
                gradient: "from-orange-500/10 to-orange-500/5",
              },
            ].map(({ icon, title, desc, gradient }) => (
              <div
                key={title}
                className={`p-5 rounded-2xl bg-gradient-to-br ${gradient} border border-border/50 hover:border-primary-300 hover:-translate-y-0.5 transition-all duration-300 group`}
              >
                <div className="w-11 h-11 rounded-xl bg-card border border-border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  {icon}
                </div>
                <h3 className="font-heading font-bold text-sm text-foreground mb-1 group-hover:text-primary-600 transition-colors">
                  {title}
                </h3>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12">
            <p className="text-xs text-muted-foreground font-body mb-4">
              Join thousands of learners building their skills the distraction-free way.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/explore"
                className="btn-primary text-sm px-8 py-3 inline-flex items-center gap-2 shadow-md"
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
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Browse All Courses
              </Link>
              <Link
                href="/quick-watch"
                className="btn-ghost text-sm px-8 py-3 inline-flex items-center gap-2 border border-border"
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
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Quick Watch
              </Link>
              <Link
                href="/create"
                className="btn-ghost text-sm px-8 py-3 inline-flex items-center gap-2"
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
                Create Your Own
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
