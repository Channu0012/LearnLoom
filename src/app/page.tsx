import Link from "next/link";
import Image from "next/image";
import { PlaylistGuideVideo } from "@/components/home/PlaylistGuideVideo";

export default function HomePage() {
  return (
    <div className="w-full overflow-x-hidden">
      {/* ── 1. Hero Section: Tight, High-Impact, Billion-Dollar Polish ────── */}
      <section
        className="relative overflow-hidden pt-8 sm:pt-12 lg:pt-14 pb-8 sm:pb-10 border-b border-border/50"
        aria-labelledby="hero-title"
      >
        {/* Subtle Ambient Studio Lighting Glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-20 blur-3xl pointer-events-none -z-10"
          style={{
            background:
              "radial-gradient(circle, #0F766E 0%, #D97706 40%, #14B8A6 75%, transparent 100%)",
          }}
          aria-hidden="true"
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Executive Micro-Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card/90 backdrop-blur-md border border-border/80 text-foreground text-xs font-heading font-bold mb-4 shadow-sm animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="text-muted-foreground">The Ad-Free Video University</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span className="text-teal-600 dark:text-teal-400 font-extrabold">
              100% Free · Real Video Tracking
            </span>
          </div>

          {/* Master Headline */}
          <h1
            id="hero-title"
            className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl text-foreground tracking-tight leading-[1.08] mb-4 animate-slide-up"
          >
            Turn video playlists into{" "}
            <span className="bg-gradient-to-r from-teal-600 via-primary-500 to-amber-600 bg-clip-text text-transparent">
              accredited masterclasses.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="font-body text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed animate-slide-up">
            A distraction-free academic workspace. Complete mandatory lecture quizzes after each
            module, maintain verified 7-day study streaks, and earn career credentials.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 animate-slide-up">
            <Link
              href="/explore"
              className="btn-primary text-sm sm:text-base px-7 py-3 min-h-[46px] w-full sm:w-auto inline-flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 active:scale-95 font-heading font-bold"
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
              href="/create"
              className="px-6 py-3 min-h-[46px] w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-card border-2 border-border hover:border-teal-500/50 hover:bg-muted text-foreground text-sm sm:text-base active:scale-95 font-heading font-semibold transition-all shadow-sm"
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

          {/* Key Value Proof Metrics - Tight Linear Ribbon */}
          <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-8 py-2 px-5 sm:px-6 rounded-2xl bg-card/60 border border-border/80 text-xs text-muted-foreground font-body shadow-sm max-w-2xl mx-auto">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              <span className="font-heading font-bold text-foreground">Zero Ads</span>
            </div>
            <div className="w-px h-3.5 bg-border hidden sm:block" aria-hidden="true" />
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="font-heading font-bold text-foreground">70% Quiz Gate</span>
            </div>
            <div className="w-px h-3.5 bg-border hidden sm:block" aria-hidden="true" />
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-heading font-bold text-foreground">7-Day Streaks</span>
            </div>
            <div className="w-px h-3.5 bg-border hidden sm:block" aria-hidden="true" />
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
              <span className="font-heading font-bold text-foreground">Verifiable Credentials</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Walkthrough Video Showcase (Tight, Expansive, Fullscreen) ─── */}
      <PlaylistGuideVideo />

      {/* ── 3. Bento Grid: 4 Superpowers of VeySkill (Visual UI Widgets) ───── */}
      <section
        className="py-10 sm:py-14 bg-muted/20 border-y border-border"
        aria-labelledby="bento-title"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
              Platform Architecture
            </span>
            <h2
              id="bento-title"
              className="font-heading font-extrabold text-2xl sm:text-4xl text-foreground tracking-tight mt-1"
            >
              Engineered for Academic Mastery
            </h2>
            <p className="font-body text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
              Standard video platforms prioritize commercial ad revenue and click retention.
              VeySkill is engineered strictly for comprehension and verifiable graduation.
            </p>
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
                  100% AD-FREE CINEMA
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-1.5">
                  Distraction-Free Cinema Mode
                </h3>
                <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg mb-4">
                  Zero preroll ads, zero sidebar rabbit holes, and zero comment section noise. Enjoy
                  pure cinema learning with auto-advancing modules and instant resume.
                </p>

                {/* Billion-Dollar Visual Mockup: Simulated Player HUD */}
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
                    <span className="text-teal-400 font-semibold">Auto-Play Next in 3s</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-heading font-semibold text-teal-600 dark:text-teal-400">
                <span>Auto-next chapter progression</span>
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
                  STRICT 70% MASTERY GATE
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-1.5">
                  Mandatory Lecture Quizzes
                </h3>
                <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                  No passive skimming. Every lecture concludes with an adaptive comprehension
                  assessment to unlock subsequent modules.
                </p>

                {/* Billion-Dollar Visual Mockup: Quiz Result Card */}
                <div className="p-3 rounded-2xl bg-muted/60 dark:bg-card border border-border shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-heading font-bold">
                    <span className="text-muted-foreground">ASSESSMENT GATE</span>
                    <span className="text-amber-500 font-mono">Score: 85% ✓</span>
                  </div>
                  <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-foreground text-xs font-medium flex items-center justify-between">
                    <span>✓ Accurate Logic Flow Selected</span>
                    <span className="text-teal-600 font-mono font-bold">+10 LP</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-body">
                    Module 5 Unlocked Automatically
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-heading font-semibold text-amber-600 dark:text-amber-400">
                <span>Real-time score tracking</span>
                <span className="font-mono font-bold">+10 LP / Quiz</span>
              </div>
            </div>

            {/* Bento Card 3 (Col 5): 7-Day Habit Streak Engine */}
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
                  7-Day Streak Architecture
                </h3>
                <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                  Transform sporadic video watching into daily academic discipline. Maintain your
                  fire streak and compound your knowledge.
                </p>

                {/* Billion-Dollar Visual Mockup: 7-Day Streak Calendar */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 border border-orange-500/25 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-heading font-extrabold text-xs text-foreground flex items-center gap-1.5">
                      <span className="text-sm">🔥</span> 7-Day Flame Active
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 font-mono text-[10px] font-bold">
                      Streak Max
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

            {/* Bento Card 4 (Col 7): Cryptographic Career Certificates */}
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
                  Cryptographic Completion Certificates
                </h3>
                <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg mb-4">
                  Pass all module quizzes to unlock a verifiable PDF credential with cryptographic
                  ID and 1-click LinkedIn endorsement.
                </p>

                {/* Billion-Dollar Visual Mockup: Credential Seal */}
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
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0077B5]/15 text-[#0077B5] dark:text-[#38bdf8] text-[11px] font-heading font-bold border border-[#0077B5]/25 shadow-sm">
                    <span>1-Click LinkedIn</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-heading font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Tamper-proof verification link</span>
                <span className="font-mono font-bold">LinkedIn Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Comparison Matrix: YouTube vs. VeySkill ──────────────────────── */}
      <section className="py-10 sm:py-14" aria-labelledby="comparison-title">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-7">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
              Direct Comparison
            </span>
            <h2
              id="comparison-title"
              className="font-heading font-black text-2xl sm:text-3xl text-foreground tracking-tight mt-1"
            >
              Why Serious Students Switch to VeySkill
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
                <span>VeySkill Masterclass</span>
              </div>
            </div>

            <div className="divide-y divide-border/60 text-xs sm:text-sm font-body">
              <div className="grid grid-cols-2 p-3.5 sm:p-4 items-center hover:bg-muted/20 transition-colors">
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

              <div className="grid grid-cols-2 p-3.5 sm:p-4 items-center hover:bg-muted/20 transition-colors">
                <div className="text-muted-foreground pr-3">
                  Algorithmic sidebar feeds click-traps
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
                  <span>Zero Recommendation Distractions</span>
                </div>
              </div>

              <div className="grid grid-cols-2 p-3.5 sm:p-4 items-center hover:bg-muted/20 transition-colors">
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
                  <span>Mandatory Lecture Quizzes (70% Pass)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 p-3.5 sm:p-4 items-center hover:bg-muted/20 transition-colors">
                <div className="text-muted-foreground pr-3">
                  No habit tracking or completion proof
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
                  <span>Verified 7-Day Habit Streaks &amp; Certificate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Grand Application Showcase Banner (Billion-Dollar Tier) ────────── */}
      <section
        className="py-12 sm:py-16 border-t border-border bg-gradient-to-b from-card/30 via-muted/20 to-card/50 relative overflow-hidden"
        aria-labelledby="showcase-title"
      >
        {/* Subtle Ambient Backglow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full opacity-15 blur-3xl pointer-events-none -z-10"
          style={{
            background:
              "radial-gradient(circle, #0F766E 0%, #14B8A6 35%, #4F46E5 70%, transparent 100%)",
          }}
          aria-hidden="true"
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/25 text-xs font-mono font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 mb-3">
            <span>The VeySkill Ecosystem</span>
          </div>
          <h2
            id="showcase-title"
            className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-foreground tracking-tight max-w-3xl mx-auto leading-tight"
          >
            The Future of Free Education Is Distraction-Free
          </h2>
          <p className="font-body text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mt-3 mb-8 leading-relaxed">
            Stop losing hours to YouTube recommendation rabbit holes. Experience structured syllabi,
            real video completion tracking, lecture quizzes, and verifiable credentials.
          </p>

          {/* Master Visual Banner Card with Studio Lighting */}
          <div className="relative group max-w-5xl mx-auto mb-10">
            {/* Holographic Glowing Backdrop Rim */}
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

              {/* Floating Glassmorphic Value Overlay Pills */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-white text-xs font-heading font-semibold shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <span>Pure Focus Cinema Flow</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-white text-xs font-heading font-semibold shadow-lg">
                  <span className="text-amber-400">🔥</span>
                  <span>7-Day Streaks &amp; Verified Diplomas</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Pillars of Excellence */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8 text-left">
            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm">
              <div className="text-teal-600 dark:text-teal-400 font-heading font-black text-xl mb-1">
                100%
              </div>
              <div className="font-heading font-bold text-xs text-foreground mb-0.5">
                Ad-Free Learning
              </div>
              <div className="text-[11px] font-body text-muted-foreground">
                Zero commercial interruptions or pre-roll sponsor traps.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm">
              <div className="text-amber-600 dark:text-amber-400 font-heading font-black text-xl mb-1">
                70% Gate
              </div>
              <div className="font-heading font-bold text-xs text-foreground mb-0.5">
                Lecture Quizzes
              </div>
              <div className="text-[11px] font-body text-muted-foreground">
                Adaptive comprehension check to prove genuine mastery.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm">
              <div className="text-emerald-600 dark:text-emerald-400 font-heading font-black text-xl mb-1">
                Auto-Next
              </div>
              <div className="font-heading font-bold text-xs text-foreground mb-0.5">
                Real Video Sync
              </div>
              <div className="text-[11px] font-body text-muted-foreground">
                Accurately detects lesson completion via YouTube Player API.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm">
              <div className="text-primary-600 dark:text-primary-400 font-heading font-black text-xl mb-1">
                Free Forever
              </div>
              <div className="font-heading font-bold text-xs text-foreground mb-0.5">
                Open Education
              </div>
              <div className="text-[11px] font-body text-muted-foreground">
                No paywalls or hidden subscriptions for any student.
              </div>
            </div>
          </div>

          {/* Grand Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/explore"
              className="btn-primary text-sm sm:text-base px-8 py-3.5 min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2.5 shadow-xl shadow-teal-500/25 active:scale-95 font-heading font-extrabold rounded-2xl transition-all"
            >
              <span>Start Learning on VeySkill</span>
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
    </div>
  );
}
