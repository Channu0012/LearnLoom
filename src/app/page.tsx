import Link from "next/link";
import Image from "next/image";
import { PlaylistGuideVideo } from "@/components/home/PlaylistGuideVideo";

export default function HomePage() {
  return (
    <div className="w-full overflow-x-hidden">
      {/* ── 1. Hero — Clean, Tight, Founder Aesthetic ────────────────────── */}
      <section
        className="relative overflow-hidden pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16"
        aria-labelledby="hero-title"
      >
        {/* Subtle gradient backdrop */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-15 blur-3xl pointer-events-none -z-10"
          style={{
            background:
              "radial-gradient(circle, #0F766E 0%, #14B8A6 35%, #D97706 70%, transparent 100%)",
          }}
          aria-hidden="true"
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Status pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card/80 backdrop-blur-md border border-border/60 text-xs font-heading font-bold mb-6 shadow-sm animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="text-teal-600 dark:text-teal-400 font-extrabold">
              Free · Distraction-Free · Verified
            </span>
          </div>

          {/* Headline — The one that kills */}
          <h1
            id="hero-title"
            className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl text-foreground tracking-tight leading-[1.06] mb-5 animate-slide-up"
          >
            The classroom{" "}
            <span className="bg-gradient-to-r from-teal-600 via-primary-500 to-amber-600 bg-clip-text text-transparent">
              the internet forgot to build.
            </span>
          </h1>

          {/* Curiosity subtitle — don't explain, tease */}
          <p className="font-body text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed animate-slide-up">
            Watch less. Learn more. Prove it.
          </p>

          {/* Two CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 animate-slide-up">
            <Link
              id="cta-explore"
              href="/explore"
              className="btn-primary text-sm sm:text-base px-8 py-3.5 min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 active:scale-95 font-heading font-bold"
            >
              <span>Explore Courses</span>
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

            <Link
              id="cta-create"
              href="/create"
              className="px-7 py-3.5 min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-card border-2 border-border hover:border-teal-500/50 hover:bg-muted text-foreground text-sm sm:text-base active:scale-95 font-heading font-semibold transition-all shadow-sm"
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
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Create Course</span>
            </Link>
          </div>

          {/* Trust ribbon — tight horizontal */}
          <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-7 py-2 px-5 rounded-2xl bg-card/50 border border-border/60 text-xs text-muted-foreground font-body max-w-xl mx-auto">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              <span className="font-heading font-bold text-foreground">Zero Ads</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="font-heading font-bold text-foreground">Quiz-Gated</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-heading font-bold text-foreground">Streak Tracked</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
              <span className="font-heading font-bold text-foreground">Verified Certs</span>
            </span>
          </div>
        </div>
      </section>

      {/* ── 2. How It Works — Visual 3-Step Flow ─────────────────────────── */}
      <section
        className="py-12 sm:py-16 bg-muted/20 border-y border-border/50"
        aria-labelledby="how-title"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
              How It Works
            </span>
            <h2
              id="how-title"
              className="font-heading font-extrabold text-2xl sm:text-4xl text-foreground tracking-tight mt-1"
            >
              Stop watching. Start mastering.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="relative p-6 rounded-3xl bg-card border border-border/80 shadow-sm hover:border-teal-500/50 transition-all group">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4 border border-teal-500/20 font-heading font-black text-sm">
                01
              </div>
              <h3 className="font-heading font-bold text-base text-foreground mb-1.5">
                Copy a Playlist URL
              </h3>
              <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Any YouTube educational playlist — lectures, tutorials, crash courses.
              </p>
              {/* Connector arrow (hidden on mobile) */}
              <div className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card border border-border items-center justify-center text-muted-foreground z-10">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-3xl bg-card border border-border/80 shadow-sm hover:border-amber-500/50 transition-all group">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 border border-amber-500/20 font-heading font-black text-sm">
                02
              </div>
              <h3 className="font-heading font-bold text-base text-foreground mb-1.5">
                Paste into VeySkill
              </h3>
              <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Instant import. Modules load ad-free in distraction-free cinema mode.
              </p>
              <div className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card border border-border items-center justify-center text-muted-foreground z-10">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm hover:border-emerald-500/50 transition-all group">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20 font-heading font-black text-sm">
                03
              </div>
              <h3 className="font-heading font-bold text-base text-foreground mb-1.5">
                Learn, Quiz, Earn
              </h3>
              <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Pass 70% quizzes, build streaks, and earn a verifiable credential.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Bento Grid: 4 Superpowers ─────────────────────────────────── */}
      <section className="py-12 sm:py-16" aria-labelledby="bento-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
              Platform Architecture
            </span>
            <h2
              id="bento-title"
              className="font-heading font-extrabold text-2xl sm:text-4xl text-foreground tracking-tight mt-1"
            >
              Learn anything. Prove everything.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Bento Card 1 (Col 7): Distraction-Free Cinema Flow */}
            <div className="md:col-span-7 p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-sm hover:border-teal-500/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3 border border-teal-500/20">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[10px] font-mono font-bold mb-2">
                  FOCUS THEATRE MODE
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-1.5">
                  Distraction-Free Cinema
                </h3>
                <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg mb-4">
                  Zero sidebars, zero ads, zero algorithm. Pure learning with auto-advancing
                  modules.
                </p>

                {/* Mini player mockup */}
                <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-white font-mono shadow-inner">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-xs">
                    <span className="flex items-center gap-1.5 text-teal-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                      Module 04 · Python Concurrency
                    </span>
                    <span className="text-[10px] text-neutral-400">14:20 / 18:45</span>
                  </div>
                  <div className="mt-2.5 w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full w-[76%]" />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400">
                    <span>Up next: Chapter Assessment</span>
                    <span className="text-teal-400 font-semibold">Auto-Play in 3s</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-heading font-semibold text-teal-600 dark:text-teal-400">
                <span>Auto-next progression</span>
                <span className="font-mono font-bold">Pure Flow</span>
              </div>
            </div>

            {/* Bento Card 2 (Col 5): Mandatory 70% Mastery Quizzes */}
            <div className="md:col-span-5 p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-sm hover:border-amber-500/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 border border-amber-500/20">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-mono font-bold mb-2">
                  70% MASTERY GATE
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-1.5">
                  Mandatory Lecture Quizzes
                </h3>
                <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                  Every lecture ends with a comprehension check. Score 70% to unlock the next
                  module.
                </p>

                {/* Quiz card mockup */}
                <div className="p-3 rounded-2xl bg-muted/60 dark:bg-card border border-border shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-heading font-bold">
                    <span className="text-muted-foreground">ASSESSMENT GATE</span>
                    <span className="text-amber-500 font-mono">Score: 85% ✓</span>
                  </div>
                  <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-foreground text-xs font-medium flex items-center justify-between">
                    <span>✓ Correct Answer Selected</span>
                    <span className="text-teal-600 font-mono font-bold">+10 LP</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-body">
                    Module 5 Unlocked
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-heading font-semibold text-amber-600 dark:text-amber-400">
                <span>Real-time scoring</span>
                <span className="font-mono font-bold">+10 LP / Quiz</span>
              </div>
            </div>

            {/* Bento Card 3 (Col 5): 7-Day Habit Streak */}
            <div className="md:col-span-5 p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-sm hover:border-orange-500/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-3 border border-orange-500/20">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-700 dark:text-orange-300 text-[10px] font-mono font-bold mb-2">
                  DAILY DISCIPLINE
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-1.5">
                  7-Day Streak Engine
                </h3>
                <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                  Build daily study habits. Maintain your streak and compound knowledge.
                </p>

                {/* Streak mockup */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 border border-orange-500/25 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-heading font-extrabold text-xs text-foreground flex items-center gap-1.5">
                      <span className="text-sm">🔥</span> 7-Day Flame Active
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 font-mono text-[10px] font-bold">
                      Max
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px]">
                    {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-[10px] shadow-sm">
                          ✓
                        </span>
                        <span className="text-muted-foreground text-[9px]">{day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-heading font-semibold text-orange-600 dark:text-orange-400">
                <span>Streak protection sync</span>
                <span className="font-mono font-bold">Daily Habit</span>
              </div>
            </div>

            {/* Bento Card 4 (Col 7): Verified Certificates */}
            <div className="md:col-span-7 p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-sm hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 border border-emerald-500/20">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold mb-2">
                  CAREER CREDENTIALS
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-1.5">
                  Verified Completion Certificates
                </h3>
                <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg mb-4">
                  Pass all quizzes → get a verifiable PDF with cryptographic ID. One-click LinkedIn
                  share.
                </p>

                {/* Credential mockup */}
                <div className="p-3 rounded-2xl bg-muted/60 dark:bg-card border border-border shadow-sm flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-heading font-bold text-xs text-foreground flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      VeySkill Diploma of Achievement
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      ID: VS-9A3F1B8E2C · Cryptographically Validated
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0077B5]/15 text-[#0077B5] dark:text-[#38bdf8] text-[11px] font-heading font-bold border border-[#0077B5]/25 shadow-sm flex-shrink-0">
                    <span>LinkedIn</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-heading font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Tamper-proof verification</span>
                <span className="font-mono font-bold">LinkedIn Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Quick Comparison — YouTube vs VeySkill ─────────────────────── */}
      <section
        className="py-10 sm:py-14 bg-muted/20 border-y border-border/50"
        aria-labelledby="comparison-title"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-7">
            <h2
              id="comparison-title"
              className="font-heading font-black text-2xl sm:text-3xl text-foreground tracking-tight"
            >
              Where free education meets real discipline.
            </h2>
          </div>

          <div className="overflow-hidden bg-card border border-border rounded-3xl shadow-lg">
            <div className="grid grid-cols-2 bg-muted/60 p-4 border-b border-border text-xs sm:text-sm font-heading font-bold">
              <div className="text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500/70" />
                <span>Standard YouTube</span>
              </div>
              <div className="text-teal-600 dark:text-teal-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span>VeySkill</span>
              </div>
            </div>

            <div className="divide-y divide-border/60 text-xs sm:text-sm font-body">
              {[
                ["Ads every 7 minutes", "Zero ads, pure cinema"],
                ["Sidebar rabbit holes", "No recommendations"],
                ["No comprehension checks", "70% quiz gate per module"],
                ["No habit tracking", "7-day streaks + certificates"],
              ].map(([yt, vs], i) => (
                <div
                  key={i}
                  className="grid grid-cols-2 p-3.5 sm:p-4 items-center hover:bg-muted/20 transition-colors"
                >
                  <div className="text-muted-foreground pr-3">{yt}</div>
                  <div className="text-foreground font-semibold flex items-center gap-2">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-teal-600 flex-shrink-0"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{vs}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Showcase Banner ────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 relative overflow-hidden" aria-labelledby="showcase-title">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full opacity-12 blur-3xl pointer-events-none -z-10"
          style={{
            background:
              "radial-gradient(circle, #0F766E 0%, #14B8A6 35%, #4F46E5 70%, transparent 100%)",
          }}
          aria-hidden="true"
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2
            id="showcase-title"
            className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-foreground tracking-tight max-w-3xl mx-auto leading-tight mb-4"
          >
            Every skill.{" "}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
              Verified.
            </span>
          </h2>
          <p className="font-body text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            Structured syllabi, real progress tracking, and verifiable credentials — all free.
          </p>

          {/* Banner image */}
          <div className="relative group max-w-4xl mx-auto mb-10">
            <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-teal-500/30 via-indigo-500/20 to-amber-500/30 rounded-3xl blur-2xl opacity-70 group-hover:opacity-100 transition-opacity -z-10" />

            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-border/80 dark:border-white/10 shadow-2xl bg-neutral-950">
              <Image
                src="/images/veyskill-showcase-banner.webp"
                alt="VeySkill Application Showcase Banner — Distraction-Free Video Learning with 7-Day Streaks and Verified Credentials"
                width={1920}
                height={1080}
                priority
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.01]"
              />

              {/* Overlay pills */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-white text-xs font-heading font-semibold shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <span>Cinema Flow Mode</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-white text-xs font-heading font-semibold shadow-lg">
                  <span className="text-amber-400">🔥</span>
                  <span>Streaks &amp; Verified Diplomas</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Stat pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8 text-left">
            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm">
              <div className="text-teal-600 dark:text-teal-400 font-heading font-black text-xl mb-1">
                100%
              </div>
              <div className="font-heading font-bold text-xs text-foreground mb-0.5">Focused</div>
              <div className="text-[11px] font-body text-muted-foreground">Zero distractions</div>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm">
              <div className="text-amber-600 dark:text-amber-400 font-heading font-black text-xl mb-1">
                70%
              </div>
              <div className="font-heading font-bold text-xs text-foreground mb-0.5">Quiz Gate</div>
              <div className="text-[11px] font-body text-muted-foreground">Prove your mastery</div>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm">
              <div className="text-emerald-600 dark:text-emerald-400 font-heading font-black text-xl mb-1">
                Auto
              </div>
              <div className="font-heading font-bold text-xs text-foreground mb-0.5">
                Video Sync
              </div>
              <div className="text-[11px] font-body text-muted-foreground">Accurate tracking</div>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm">
              <div className="text-primary-600 dark:text-primary-400 font-heading font-black text-xl mb-1">
                Free
              </div>
              <div className="font-heading font-bold text-xs text-foreground mb-0.5">Forever</div>
              <div className="text-[11px] font-body text-muted-foreground">No paywalls</div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/explore"
              className="btn-primary text-sm sm:text-base px-8 py-3.5 min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2.5 shadow-xl shadow-teal-500/25 active:scale-95 font-heading font-extrabold rounded-2xl transition-all"
            >
              <span>Start Learning Free</span>
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

            <Link
              href="/create"
              className="px-7 py-3.5 min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-card border-2 border-border hover:border-teal-500/50 hover:bg-muted text-foreground text-sm sm:text-base active:scale-95 font-heading font-bold transition-all shadow-sm"
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
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Build a Free Course</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. Walkthrough Video — Moved to Bottom ────────────────────────── */}
      <PlaylistGuideVideo />
    </div>
  );
}
