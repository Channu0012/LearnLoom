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
          {/* Institutional Credential Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-border text-foreground/90 text-xs font-heading font-bold mb-6 shadow-sm animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="text-muted-foreground">Accredited Micro-Credentials</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <span className="text-amber-600 dark:text-amber-400 font-extrabold">
              SHA-256 HMAC Verified
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
            A distraction-free academic workspace. Complete mandatory 5-question module assessments,
            maintain verified 7-day study streaks, and earn career credentials with 1-click LinkedIn
            endorsement.
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
              <span className="font-heading font-bold text-foreground">5-Question MCQs</span>
              <span>Per lecture</span>
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
              <span className="font-heading font-bold text-foreground">Vector PDF</span>
              <span>A4 300 DPI Certificate</span>
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

      {/* ── 2. The Signature Credential Showcase (Current Update Live Mockup) ── */}
      <section className="py-12 sm:py-20 relative" aria-labelledby="credential-showcase-title">
        <div className="container-page max-w-5xl mx-auto px-4">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-heading font-bold mb-3 border border-amber-500/20">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <span>Coursera &amp; Google Skills Standard</span>
            </div>
            <h2
              id="credential-showcase-title"
              className="font-heading font-black text-2xl sm:text-4xl text-foreground tracking-tight"
            >
              Real Vector Certificates. Verifiable Worldwide.
            </h2>
            <p className="font-body text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mt-2 leading-relaxed">
              Complete every lecture without skipping, score 70%+ on all module assessments, and
              instantly receive your official cryptographically verified diploma.
            </p>
          </div>

          {/* Interactive Credential Replica Card */}
          <div className="clay-card p-6 sm:p-10 bg-card border-2 border-amber-500/30 rounded-3xl shadow-2xl relative overflow-hidden">
            {/* Guilloché Geometric Border Highlight */}
            <div className="absolute inset-1.5 sm:inset-2.5 rounded-[22px] border border-amber-500/20 pointer-events-none" />
            <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-amber-500/10 via-teal-500/5 to-transparent rounded-bl-full pointer-events-none" />

            <div className="relative z-10 space-y-6 sm:space-y-8">
              {/* Certificate Top Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/80 pb-6 text-center sm:text-left">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="8" r="7" />
                      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 block">
                      Vidcura Academic Board
                    </span>
                    <h3 className="font-heading font-extrabold text-lg sm:text-xl text-foreground">
                      Certificate of Master Examination
                    </h3>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 text-xs font-mono">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    HMAC Verified
                  </span>
                  <span className="px-3 py-1 rounded-full bg-muted border border-border text-foreground font-semibold">
                    ID: VL-2026-F98B-E2A1
                  </span>
                </div>
              </div>

              {/* Certificate Body Text */}
              <div className="text-center py-2 sm:py-4 space-y-3 max-w-2xl mx-auto">
                <p className="text-xs font-heading uppercase tracking-widest text-muted-foreground">
                  This executive credential is conferred upon
                </p>
                <div className="font-heading font-black text-2xl sm:text-4xl text-foreground tracking-tight bg-gradient-to-r from-foreground via-primary-600 to-foreground bg-clip-text">
                  Alex Morgan
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed max-w-xl mx-auto">
                  having satisfactorily passed all comprehensive module examinations, fulfilled 100%
                  video lecture attendance, and demonstrated mastery in
                </p>
                <div className="font-heading font-bold text-lg sm:text-xl text-primary-600 dark:text-primary-400">
                  Distributed Systems &amp; High-Concurrency Cloud Architecture
                </div>
              </div>

              {/* Certificate Signatures & Distinction Footer */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-border/80 items-end text-center">
                {/* Dean Signature */}
                <div className="space-y-1">
                  <div className="font-serif italic text-base sm:text-lg text-foreground/80 tracking-wide">
                    Dr. Ronald Vance
                  </div>
                  <div className="w-32 h-px bg-border mx-auto" />
                  <p className="text-[10px] font-heading font-bold uppercase tracking-wider text-muted-foreground">
                    Director of Curriculum
                  </p>
                </div>

                {/* Academic Seal Badge */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 border-2 border-amber-500/40 text-amber-600 dark:text-amber-400 flex flex-col items-center justify-center shadow-inner">
                    <span className="text-[9px] font-heading font-black">HONORS</span>
                    <span className="text-[11px] font-mono font-bold">94%</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground mt-1">
                    Graduation Seal
                  </span>
                </div>

                {/* Registrar Signature */}
                <div className="space-y-1">
                  <div className="font-serif italic text-base sm:text-lg text-foreground/80 tracking-wide">
                    Elena Rostova
                  </div>
                  <div className="w-32 h-px bg-border mx-auto" />
                  <p className="text-[10px] font-heading font-bold uppercase tracking-wider text-muted-foreground">
                    Registrar of Records
                  </p>
                </div>
              </div>

              {/* Real Value Pillars Bar */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-muted-foreground font-body border-t border-border/50">
                <div className="flex items-center gap-1.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-teal-600"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span className="font-semibold text-foreground">
                    Print-Ready Vector PDF (A4 300 DPI)
                  </span>
                </div>
                <div className="w-1 h-1 rounded-full bg-border" />
                <div className="flex items-center gap-1.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-sky-600"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                  <span className="font-semibold text-foreground">
                    1-Click Direct LinkedIn Sync
                  </span>
                </div>
                <div className="w-1 h-1 rounded-full bg-border" />
                <div className="flex items-center gap-1.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-emerald-600"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span className="font-semibold text-foreground">
                    Online Cryptographic Verification
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Compact Video Walkthrough ───────────────────────────────────── */}
      <PlaylistGuideVideo />

      {/* ── 4. The Academic Rigor Engine (Current Updates in 3 Interactive Pillars) */}
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
            {/* Pillar 1: Mandatory 5-Question Module Assessment */}
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
                  5-Question Module Quizzes
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  Every video lecture concludes with a 5-question comprehensive assessment. Next
                  lectures unlock only after validating comprehension.
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

      {/* ── 5. Institutional Comparison: YouTube vs. Vidcura ────────────────── */}
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
                  <span>Mandatory 5-Question MCQs (70% Pass)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 p-4 sm:p-5 items-center hover:bg-muted/20 transition-colors">
                <div className="text-muted-foreground pr-3">No certificate or proof of study</div>
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
                  <span>Printable Vector PDF + LinkedIn Sync</span>
                </div>
              </div>

              <div className="grid grid-cols-2 p-4 sm:p-5 items-center hover:bg-muted/20 transition-colors">
                <div className="text-muted-foreground pr-3">
                  No verification for employers or universities
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
                  <span>SHA-256 HMAC Credential Registry</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Category Disciplines Quick Navigation ────────────────────────── */}
      <section
        className="py-14 sm:py-20 border-t border-border"
        aria-labelledby="disciplines-title"
      >
        <div className="container-page max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground mb-4">
            <span>Curated Disciplines</span>
          </div>
          <h2
            id="disciplines-title"
            className="font-heading font-black text-2xl sm:text-4xl text-foreground mb-4 tracking-tight"
          >
            Explore Over 500+ Accredited Masterclasses
          </h2>
          <p className="font-body text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed">
            Select a discipline to dive straight into curated lecture syllabi with integrated
            assessments.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 text-left">
            {topCategories.map((cat) => (
              <Link
                key={cat.name}
                href={`/explore?category=${encodeURIComponent(cat.name)}`}
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

      {/* ── 7. Minimalist Master Call To Action (Strictly Only Explore Show) ─ */}
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
            Free forever. No login required to watch lectures. Complete quizzes and claim your
            verifiable certificate anytime.
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
