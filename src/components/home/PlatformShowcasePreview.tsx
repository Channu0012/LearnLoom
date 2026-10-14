import Link from "next/link";

export function PlatformShowcasePreview() {
  const modules = [
    { id: 1, title: "01. Complexity Analysis & Big O", status: "completed", duration: "24m" },
    { id: 2, title: "02. Pointer Traversal & Arrays", status: "completed", duration: "36m" },
    { id: 3, title: "03. Binary Search Trees & Heaps", status: "active", duration: "48m" },
    { id: 4, title: "04. Dynamic Programming Patterns", status: "locked", duration: "52m" },
    { id: 5, title: "05. Distributed System Graphs", status: "locked", duration: "45m" },
  ];

  return (
    <div className="w-full">
      {/* ── 1. Interactive Platform Workspace Mockup ──────────────────────── */}
      <div className="relative group max-w-5xl mx-auto mb-10">
        {/* Multi-hue ambient glow */}
        <div
          className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-teal-500/25 via-indigo-500/20 to-amber-500/20 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition-opacity -z-10"
          aria-hidden="true"
        />

        {/* macOS Window Frame */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-border/80 dark:border-white/10 shadow-2xl bg-neutral-950">
          {/* Top Window Bar */}
          <div className="px-4 sm:px-5 py-3 bg-neutral-900/95 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 z-20">
            <div className="flex items-center gap-3">
              {/* Traffic light window controls */}
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]/90" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/90" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]/90" />
              </div>
              <span className="w-px h-3.5 bg-white/15" aria-hidden="true" />

              {/* URL bar indicator */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-800/80 border border-white/10 text-[11px] font-mono text-neutral-300">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-teal-400"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>veyskill.in/course/cs-masterclass</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-[10px] font-mono font-bold text-teal-400">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                CINEMA WORKSPACE
              </span>
              <span className="hidden md:inline-flex px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono font-semibold text-amber-300">
                🔥 7-DAY STREAK
              </span>
            </div>
          </div>

          {/* Main Interface Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 bg-neutral-950 text-neutral-200">
            {/* Left Theater Panel (Col 8) */}
            <div className="lg:col-span-8 p-4 sm:p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 bg-neutral-900/40">
              {/* Theater Screen Canvas */}
              <div className="relative aspect-video w-full rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border border-white/10 flex flex-col justify-between p-4 sm:p-6 shadow-inner">
                {/* Active Lecture Badges */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 font-mono text-[11px] font-bold border border-teal-500/30">
                      NOW PLAYING
                    </span>
                    <span className="text-xs font-mono text-neutral-400 hidden sm:inline">
                      1080p · Auto-Sync
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Focus Flow Active</span>
                  </div>
                </div>

                {/* Center Presentation Graphic */}
                <div className="my-auto py-4 text-center">
                  <div className="inline-block p-3 rounded-2xl bg-teal-500/10 border border-teal-500/25 text-teal-400 mb-2">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                  <h4 className="text-base sm:text-lg font-heading font-bold text-white tracking-tight">
                    Module 03: Binary Search Trees &amp; Memory Heaps
                  </h4>
                  <p className="text-xs text-neutral-400 font-body mt-1">
                    Structured YouTube Lecture Stream · Focused Study Workspace
                  </p>
                </div>

                {/* Theater Control Strip */}
                <div className="space-y-2 pt-2">
                  {/* Timeline bar */}
                  <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full w-3/5" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <div className="flex items-center gap-3">
                      <span>▶ 28:50 / 48:10</span>
                      <span className="hidden sm:inline px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 text-[10px]">
                        1.5x Speed
                      </span>
                    </div>
                    <span className="text-teal-400 font-semibold">
                      Chapter 4 of 6: Node Balancing
                    </span>
                  </div>
                </div>
              </div>

              {/* Workspace Action Bar */}
              <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg font-heading font-semibold bg-teal-600 text-white shadow-xs">
                    Cinema Player
                  </span>
                  <span className="px-3 py-1.5 rounded-lg font-heading font-semibold bg-white/5 text-neutral-400">
                    AI Scratchpad
                  </span>
                  <span className="px-3 py-1.5 rounded-lg font-heading font-semibold bg-white/5 text-neutral-400">
                    70% Quiz Gate
                  </span>
                </div>

                <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Progress auto-saved to cloud</span>
                </div>
              </div>
            </div>

            {/* Right Syllabus Panel (Col 4) */}
            <div className="lg:col-span-4 p-4 sm:p-5 flex flex-col justify-between bg-neutral-950">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
                    Course Syllabus
                  </h4>
                  <span className="text-xs font-mono text-teal-400 font-semibold">
                    60% Complete
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full w-3/5" />
                </div>

                {/* Module list */}
                <div className="space-y-2 font-body text-xs">
                  {modules.map((mod) => (
                    <div
                      key={mod.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                        mod.status === "active"
                          ? "bg-teal-500/15 border-teal-500/40 text-white"
                          : mod.status === "completed"
                            ? "bg-neutral-900/60 border-white/5 text-neutral-300"
                            : "bg-neutral-900/30 border-white/5 text-neutral-500"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate mr-2">
                        {mod.status === "completed" && (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="text-emerald-400 flex-shrink-0"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                        {mod.status === "active" && (
                          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse flex-shrink-0" />
                        )}
                        {mod.status === "locked" && (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            className="text-neutral-500 flex-shrink-0"
                          >
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        )}
                        <span className="truncate font-medium">{mod.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 flex-shrink-0">
                        {mod.duration}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unlock criteria badge */}
              <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-300 font-body flex items-start gap-2">
                <span className="text-amber-400 flex-shrink-0">✦</span>
                <span>
                  Pass the 3-question comprehension quiz at 70%+ to unlock Module 04 &amp;
                  certificate eligibility.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Integrated 3-Step Walkthrough Cards ─────────────────────────── */}
      <div className="max-w-4xl mx-auto mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {/* Step 01 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-sm relative group hover:border-teal-500/40 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 font-mono font-bold text-xs flex items-center justify-center mb-3 border border-teal-500/25">
              01
            </div>
            <h3 className="font-heading font-bold text-sm sm:text-base text-foreground mb-1">
              Paste Any YouTube URL
            </h3>
            <p className="text-xs text-muted-foreground font-body leading-relaxed">
              Drop any public lecture or playlist link from YouTube — computer science, web
              development, or DSA series.
            </p>
          </div>

          {/* Step 02 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-sm relative group hover:border-amber-500/40 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono font-bold text-xs flex items-center justify-center mb-3 border border-amber-500/25">
              02
            </div>
            <h3 className="font-heading font-bold text-sm sm:text-base text-foreground mb-1">
              Structured Cinema Theater
            </h3>
            <p className="text-xs text-muted-foreground font-body leading-relaxed">
              Auto-indexed chapters, distraction-free video player, and cloud-synced progress across
              your devices.
            </p>
          </div>

          {/* Step 03 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-sm relative group hover:border-emerald-500/40 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs flex items-center justify-center mb-3 border border-emerald-500/25">
              03
            </div>
            <h3 className="font-heading font-bold text-sm sm:text-base text-foreground mb-1">
              Quizzes &amp; Verified PDF
            </h3>
            <p className="text-xs text-muted-foreground font-body leading-relaxed">
              Validate chapter retention with 70% quiz gates and earn an employer-verifiable digital
              credential.
            </p>
          </div>
        </div>

        {/* Doubt Hub Community & Explore CTAs */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/doubts"
            className="btn-primary text-xs sm:text-sm px-6 py-2.5 rounded-xl font-heading font-bold inline-flex items-center gap-2 shadow-md shadow-teal-500/20"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>Ask &amp; Solve Doubts</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-300/20 text-white font-bold border border-teal-300/30">
              NEW &bull; +XP
            </span>
          </Link>
          <Link
            href="/explore"
            className="btn-secondary text-xs sm:text-sm px-5 py-2.5 rounded-xl font-heading font-bold inline-flex items-center gap-2 border border-border"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
            <span>Explore Masterclasses</span>
          </Link>
          <span className="text-xs text-muted-foreground font-body">
            Peer verified answers &bull; Instant AI tutoring
          </span>
        </div>
      </div>
    </div>
  );
}

export default PlatformShowcasePreview;
