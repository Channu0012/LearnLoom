import Link from "next/link";
import { PlaylistGuideVideo } from "@/components/home/PlaylistGuideVideo";

export default function HomePage() {
  const topCategories = [
    { name: "Programming & CS", count: "140+ Courses", tag: "Most Active" },
    { name: "System Design & DevOps", count: "65+ Courses", tag: "Architect" },
    { name: "Artificial Intelligence", count: "90+ Courses", tag: "New MCQ" },
    { name: "Product & UI/UX", count: "48+ Courses", tag: "Design" },
    { name: "Business & Finance", count: "54+ Courses", tag: "Executive" },
    { name: "Science & Mathematics", count: "72+ Courses", tag: "Foundations" },
    { name: "Academic Exam Prep", count: "36+ Courses", tag: "Mastery" },
    { name: "Data Engineering", count: "58+ Courses", tag: "High Demand" },
  ];

  return (
    <div className="w-full overflow-x-hidden pb-20 md:pb-12">
      {/* ── 1. Hero Section ─────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pt-12 sm:pt-20 lg:pt-28 pb-16 sm:pb-24"
        aria-labelledby="hero-title"
      >
        {/* Subtle Ambient Lighting Orbs - Warm Gold & Deep Teal Brand Grading */}
        <div
          className="absolute top-12 left-1/2 -translate-x-1/2 w-[620px] h-[340px] rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, #0F766E 0%, #D97706 45%, #FE5A50 80%, transparent 100%)",
          }}
          aria-hidden="true"
        />

        <div className="container-page relative z-10 text-center max-w-4xl mx-auto px-4">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-border text-foreground/90 text-xs font-heading font-bold mb-6 shadow-sm animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="text-muted-foreground">Distraction-Free Learning</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <span className="text-teal-600 dark:text-teal-400 font-extrabold">
              Interactive Curricula
            </span>
          </div>

          {/* Master Headline - Bespoke Color Grading */}
          <h1
            id="hero-title"
            className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl text-foreground mb-6 tracking-tight leading-[1.08] animate-slide-up"
          >
            Turn video playlists into{" "}
            <span className="bg-gradient-to-r from-teal-600 via-primary-500 to-amber-600 bg-clip-text text-transparent">
              accredited masterclasses.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="font-body text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up">
            A distraction-free academic workspace. Complete mandatory lecture quizzes after each
            module, maintain verified 7-day study streaks, and build enduring skills at your own
            pace.
          </p>

          {/* Hero CTA - Strictly Only Explore Show */}
          <div className="flex flex-col items-center justify-center gap-3.5 mb-12 animate-slide-up max-w-md mx-auto">
            <Link
              href="/explore"
              id="cta-explore-hero"
              className="btn-primary text-base sm:text-lg px-9 py-4 min-h-[52px] w-full inline-flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all font-heading font-extrabold tracking-wide rounded-2xl"
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
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
              <span>Explore Accredited Courses</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <p className="text-xs text-muted-foreground font-body">
              100% Free · No credit card required · Instant access to all courses
            </p>
          </div>

          {/* Key Value Proof Metrics - Clean Executive Pill Row */}
          <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-8 py-3.5 px-6 rounded-2xl bg-card border border-border text-xs sm:text-sm text-muted-foreground font-body shadow-sm max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              <span className="font-heading font-bold text-foreground">Lecture Quizzes</span>
              <span>After each module</span>
            </div>
            <div className="w-px h-4 bg-border hidden sm:block" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="font-heading font-bold text-foreground">70% Threshold</span>
              <span>Guaranteed mastery</span>
            </div>
            <div className="w-px h-4 bg-border hidden sm:block" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-heading font-bold text-foreground">7-Day Streaks</span>
              <span>Daily habit</span>
            </div>
            <div className="w-px h-4 bg-border hidden sm:block" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
              <span className="font-heading font-bold text-foreground">Zero Ads</span>
              <span>Pure focus</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Compact Video Walkthrough ───────────────────────────────────── */}
      <PlaylistGuideVideo />

      {/* ── 3. The Academic Rigor Engine (Current Updates in 3 Interactive Pillars) */}
      <section
        className="py-16 sm:py-24 bg-card/40 border-y border-border"
        aria-labelledby="rigor-title"
      >
        <div className="container-page max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2
              id="rigor-title"
              className="font-heading font-extrabold text-2xl sm:text-4xl text-foreground mb-3 tracking-tight"
            >
              The Academic Rigor Engine
            </h2>
            <p className="font-body text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Engineered with the standards of Coursera and Google Career Certificates. No passive
              watching. No skipped lessons.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1: Mandatory Adaptive Lecture Assessment */}
            <div className="clay-card p-6 sm:p-7 bg-card border border-border rounded-3xl hover:border-primary-400 transition-all shadow-sm hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5 border border-amber-500/20">
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
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-mono font-bold mb-3">
                  STRICT 70% PASS THRESHOLD
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                  Adaptive Lecture Quizzes
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  Every video lecture concludes with an interactive comprehension assessment. Next
                  lectures unlock only after demonstrating subject mastery.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 text-xs font-heading font-semibold text-amber-600 dark:text-amber-400 flex items-center justify-between">
                <span>Real-time score tracking</span>
                <span className="font-mono font-bold">+10 LP</span>
              </div>
            </div>

            {/* Pillar 2: 7-Day Habit Streak Engine */}
            <div className="clay-card p-6 sm:p-7 bg-card border border-border rounded-3xl hover:border-primary-400 transition-all shadow-sm hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-5 border border-orange-500/20">
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
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-700 dark:text-orange-300 text-[10px] font-mono font-bold mb-3">
                  DUOLINGO-GRADE HABIT
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                  7-Day Streak Architecture
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  Turn sporadic video watching into daily discipline. Maintain your fire streak,
                  earn +10 Learning Points per module, and watch your skills compound.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 text-xs font-heading font-semibold text-orange-600 dark:text-orange-400 flex items-center justify-between">
                <span>Streak protection sync</span>
                <span className="font-mono font-bold">Daily Habit</span>
              </div>
            </div>

            {/* Pillar 3: Distraction-Free Theater Flow Mode */}
            <div className="clay-card p-6 sm:p-7 bg-card border border-border rounded-3xl hover:border-primary-400 transition-all shadow-sm hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-5 border border-teal-500/20">
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
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[10px] font-mono font-bold mb-3">
                  100% AD-FREE THEATER
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                  Distraction-Free Theater
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  Zero ads, zero algorithmic rabbit holes, and zero comment sections. Pure cinema
                  learning with auto-next progression and integrated scratchpad notes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 text-xs font-heading font-semibold text-teal-600 dark:text-teal-400 flex items-center justify-between">
                <span>Auto-resume across devices</span>
                <span className="font-mono font-bold">Flow Mode</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Institutional Comparison: YouTube vs. Vidcura ────────────────── */}
      <section className="py-16 sm:py-24" aria-labelledby="comparison-title">
        <div className="container-page max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2
              id="comparison-title"
              className="font-heading font-black text-2xl sm:text-4xl text-foreground tracking-tight"
            >
              Why Serious Students Switch to Vidcura
            </h2>
            <p className="font-body text-sm sm:text-base text-muted-foreground mt-2 max-w-lg mx-auto">
              YouTube was built for entertainment and commercial retention. Vidcura is built for
              academic completion.
            </p>
          </div>

          <div className="clay-card overflow-hidden bg-card border border-border rounded-3xl shadow-xl">
            <div className="grid grid-cols-2 bg-muted/60 p-4 sm:p-5 border-b border-border text-xs sm:text-sm font-heading font-bold">
              <div className="text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500/70" />
                <span>Standard YouTube</span>
              </div>
              <div className="text-teal-600 dark:text-teal-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span>Vidcura Masterclass</span>
              </div>
            </div>

            <div className="divide-y divide-border/60 text-xs sm:text-sm font-body">
              <div className="grid grid-cols-2 p-4 sm:p-5 items-center hover:bg-muted/20 transition-colors">
                <div className="text-muted-foreground pr-3">
                  Commercial ads interrupt every 7 minutes
                </div>
                <div className="text-foreground font-semibold flex items-center gap-2">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-teal-600 flex-shrink-0"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>100% Ad-Free Cinema Flow Mode</span>
                </div>
              </div>

              <div className="grid grid-cols-2 p-4 sm:p-5 items-center hover:bg-muted/20 transition-colors">
                <div className="text-muted-foreground pr-3">
                  No accountability, easy to skim or drop out
                </div>
                <div className="text-foreground font-semibold flex items-center gap-2">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-teal-600 flex-shrink-0"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Mandatory Lecture Quizzes (70% Pass)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 p-4 sm:p-5 items-center hover:bg-muted/20 transition-colors">
                <div className="text-muted-foreground pr-3">
                  No assessment or comprehension checks
                </div>
                <div className="text-foreground font-semibold flex items-center gap-2">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-teal-600 flex-shrink-0"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Interactive Quizzes &amp; Immediate Feedback</span>
                </div>
              </div>

              <div className="grid grid-cols-2 p-4 sm:p-5 items-center hover:bg-muted/20 transition-colors">
                <div className="text-muted-foreground pr-3">
                  No daily habit system or streak tracking
                </div>
                <div className="text-foreground font-semibold flex items-center gap-2">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-teal-600 flex-shrink-0"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Verified 7-Day Habit Streak Engine</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Category Disciplines Quick Navigation ────────────────────────── */}
      <section
        className="py-14 sm:py-20 border-t border-border"
        aria-labelledby="disciplines-title"
      >
        <div className="container-page max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground mb-4">
            <span>Dynamic Discovery</span>
          </div>
          <h2
            id="disciplines-title"
            className="font-heading font-black text-2xl sm:text-4xl text-foreground mb-4 tracking-tight"
          >
            Open Educational Disciplines &amp; Skill Tracks
          </h2>
          <p className="font-body text-sm sm:text-base text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed">
            Build an unstoppable daily habit. Explore verified masterclasses across any academic
            domain, curated with interactive lecture quizzes and structured progression.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 text-left">
            {topCategories.map((cat) => (
              <Link
                key={cat.name}
                href={`/explore?q=${encodeURIComponent(cat.name.replace("&", ""))}`}
                className="p-4 rounded-2xl bg-card border border-border hover:border-teal-500 hover:shadow-md active:scale-[0.98] transition-all group flex flex-col justify-between min-h-[90px]"
              >
                <div>
                  <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full inline-block mb-1.5">
                    {cat.tag}
                  </span>
                  <div className="text-xs sm:text-sm font-heading font-bold text-foreground group-hover:text-teal-600 transition-colors">
                    {cat.name}
                  </div>
                </div>
                <div className="text-[11px] font-body text-muted-foreground mt-2">{cat.count}</div>
              </Link>
            ))}
          </div>

          {/* Single Explore CTA */}
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-sm font-heading font-bold text-teal-700 dark:text-teal-300 hover:text-teal-800 transition-colors"
          >
            <span>View All Curricula in Library</span>
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
        </div>
      </section>

      {/* ── 6. Minimalist Master Call To Action (Strictly Only Explore Show) ─ */}
      <section className="py-16 sm:py-24 border-t border-border bg-gradient-to-b from-card to-background">
        <div className="container-page max-w-4xl mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-3xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
          </div>

          <h2 className="font-heading font-black text-3xl sm:text-5xl text-foreground mb-4 tracking-tight">
            Start learning in flow.
          </h2>
          <p className="font-body text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
            Free forever. No login required to watch lectures. Complete interactive quizzes and
            build your daily knowledge streak anytime.
          </p>

          {/* Strictly Only Explore Button - No Competing Secondary Option */}
          <div className="flex justify-center max-w-xs mx-auto">
            <Link
              href="/explore"
              id="cta-explore-bottom"
              className="btn-primary text-base px-8 py-3.5 min-h-[50px] w-full inline-flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl active:scale-95 transition-all font-heading font-bold rounded-2xl"
            >
              <span>Explore All Courses</span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
