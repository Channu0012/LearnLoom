"use client";
// ---------------------------------------------------------------------------
// InterviewScorecard — FAANG-grade performance report with radial gauges,
// category breakdowns, strengths/improvements, and shareable results
// ---------------------------------------------------------------------------
import {
  type InterviewScorecard as ScorecardType,
  ROLE_LABELS,
  LEVEL_LABELS,
  type InterviewConfig,
} from "@/lib/interview";

interface ScorecardProps {
  scorecard: ScorecardType;
  config: InterviewConfig;
  onRetry: () => void;
  onBack: () => void;
}

// ── Grade Colors ───────────────────────────────────────────────────────────
const GRADE_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
  S: { bg: "from-amber-400 to-yellow-500", text: "text-amber-400", glow: "shadow-amber-500/40" },
  A: {
    bg: "from-emerald-400 to-teal-500",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/40",
  },
  B: { bg: "from-blue-400 to-indigo-500", text: "text-blue-400", glow: "shadow-blue-500/40" },
  C: { bg: "from-orange-400 to-amber-500", text: "text-orange-400", glow: "shadow-orange-500/40" },
  D: { bg: "from-red-400 to-rose-500", text: "text-red-400", glow: "shadow-red-500/40" },
  F: { bg: "from-red-600 to-red-800", text: "text-red-500", glow: "shadow-red-600/40" },
};

// ── Readiness Colors ───────────────────────────────────────────────────────
const READINESS_COLORS: Record<string, string> = {
  Ready: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Almost Ready": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Needs Work": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "Not Ready": "bg-red-500/20 text-red-400 border-red-500/30",
};

export function ScorecardView({ scorecard, config, onRetry, onBack }: ScorecardProps) {
  const grade = GRADE_COLORS[scorecard.overallGrade] || GRADE_COLORS.C;

  const formatDuration = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      {/* ── Sub Header ────────────────────────────────────────────────── */}
      <div className="border-b border-border/80 bg-card/80 backdrop-blur-md sticky top-16 z-20">
        <div className="container-page max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon.png"
              alt="VeySkill Logo"
              width={26}
              height={26}
              className="w-6 h-6 object-contain rounded-lg"
            />
            <span className="font-heading font-extrabold text-sm tracking-tight select-none">
              <span className="text-foreground">Vey</span>
              <span className="text-[#14b8a6]">skill</span>
              <span className="text-muted-foreground ml-1.5 font-bold text-xs uppercase tracking-wider">
                Scorecard
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="px-3 py-1.5 rounded-xl text-xs font-heading font-bold bg-muted/60 hover:bg-muted text-foreground border border-border/80 transition-colors cursor-pointer"
          >
            Back to Interview Hub
          </button>
        </div>
      </div>

      <div className="container-page max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        {/* ── Hero Grade Card ──────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm">
          {/* Subtle Glow */}
          <div
            className={`absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br ${grade.bg} opacity-10 blur-3xl pointer-events-none`}
          />

          <div className="relative flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            {/* Score Circle */}
            <div className="relative flex-shrink-0">
              <svg width="160" height="160" viewBox="0 0 160 160" className="transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="currentColor"
                  className="text-muted/60 dark:text-muted/30"
                  strokeWidth="8"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(scorecard.overallScore / 100) * 440} 440`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0d9488" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
                <span className="font-heading font-black text-4xl text-foreground">
                  {scorecard.overallScore}
                </span>
                <span className="text-[11px] font-body text-muted-foreground font-semibold">
                  out of 100
                </span>
              </div>
            </div>

            {/* Score Info */}
            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-2.5">
                <span
                  className={`font-heading font-black text-5xl bg-gradient-to-br ${grade.bg} bg-clip-text text-transparent`}
                >
                  {scorecard.overallGrade}
                </span>
                <div
                  className={`px-3 py-1 rounded-full border text-xs font-heading font-bold ${READINESS_COLORS[scorecard.faangReadiness] || ""}`}
                >
                  {scorecard.faangReadiness}
                </div>
              </div>

              <h1 className="font-heading font-black text-xl sm:text-2xl text-foreground mb-1">
                {ROLE_LABELS[config.role]} Mock Interview
              </h1>
              <p className="font-body text-xs sm:text-sm text-muted-foreground">
                {LEVEL_LABELS[config.level]} &middot; {config.topics.slice(0, 4).join(", ")}
              </p>

              {/* Stats Row */}
              <div className="flex items-center justify-center sm:justify-start gap-4 mt-4 text-xs font-body text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{formatDuration(scorecard.interviewDuration)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>{scorecard.totalQuestions} questions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{scorecard.questionsAnswered} answered</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Summary ──────────────────────────────────────────────────── */}
        {scorecard.summary && (
          <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs">
            <h2 className="font-heading font-bold text-sm text-foreground mb-2 flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-teal-600 dark:text-teal-400"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span>Executive Assessment</span>
            </h2>
            <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {scorecard.summary}
            </p>
          </div>
        )}

        {/* ── Category Breakdown ───────────────────────────────────────── */}
        {scorecard.categories.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-heading font-black text-base text-foreground flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-teal-600 dark:text-teal-400"
                aria-hidden="true"
              >
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              <span>Competency Breakdown</span>
            </h2>

            <div className="grid gap-3">
              {scorecard.categories.map((cat, i) => {
                const barColor =
                  cat.score >= 80
                    ? "from-emerald-500 to-teal-500"
                    : cat.score >= 60
                      ? "from-blue-500 to-indigo-500"
                      : cat.score >= 40
                        ? "from-amber-500 to-orange-500"
                        : "from-red-500 to-rose-500";

                return (
                  <div
                    key={i}
                    className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-heading font-bold text-sm text-foreground">
                        {cat.name}
                      </span>
                      <span className="font-heading font-bold text-sm text-foreground">
                        {cat.score}
                        <span className="text-muted-foreground font-normal text-xs ml-0.5">
                          /{cat.maxScore}
                        </span>
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>

                    <p className="font-body text-xs text-muted-foreground mb-3 leading-relaxed">
                      {cat.feedback}
                    </p>

                    <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-border/50">
                      {cat.strengths.length > 0 && (
                        <div>
                          <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            Strengths
                          </span>
                          <ul className="mt-1 space-y-1">
                            {cat.strengths.map((s, j) => (
                              <li
                                key={j}
                                className="text-xs font-body text-foreground/80 flex items-start gap-1.5"
                              >
                                <span className="text-emerald-500 font-bold mt-0.5 shrink-0">
                                  +
                                </span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {cat.improvements.length > 0 && (
                        <div>
                          <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            Areas to Polish
                          </span>
                          <ul className="mt-1 space-y-1">
                            {cat.improvements.map((s, j) => (
                              <li
                                key={j}
                                className="text-xs font-body text-foreground/80 flex items-start gap-1.5"
                              >
                                <span className="text-amber-500 font-bold mt-0.5 shrink-0">-</span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Strengths & Improvements Columns ────────────────────────── */}
        <div className="grid sm:grid-cols-2 gap-4">
          {scorecard.topStrengths.length > 0 && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 p-5 shadow-xs">
              <h3 className="font-heading font-bold text-sm text-emerald-700 dark:text-emerald-300 mb-3 flex items-center gap-2">
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
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>Key Strengths</span>
              </h3>
              <ul className="space-y-2">
                {scorecard.topStrengths.map((s, i) => (
                  <li
                    key={i}
                    className="text-xs sm:text-sm font-body text-foreground/80 flex items-start gap-2"
                  >
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                      {i + 1}.
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {scorecard.criticalImprovements.length > 0 && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10 p-5 shadow-xs">
              <h3 className="font-heading font-bold text-sm text-amber-700 dark:text-amber-300 mb-3 flex items-center gap-2">
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
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>Priority Action Items</span>
              </h3>
              <ul className="space-y-2">
                {scorecard.criticalImprovements.map((s, i) => (
                  <li
                    key={i}
                    className="text-xs sm:text-sm font-body text-foreground/80 flex items-start gap-2"
                  >
                    <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">
                      {i + 1}.
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── Recommended Resources ──────────────────────────────────── */}
        {scorecard.recommendedResources.length > 0 && (
          <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 dark:bg-teal-500/10 p-5 shadow-xs">
            <h3 className="font-heading font-bold text-sm text-teal-700 dark:text-teal-300 mb-3 flex items-center gap-2">
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
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span>Recommended Study Topics</span>
            </h3>
            <ul className="space-y-2">
              {scorecard.recommendedResources.map((s, i) => (
                <li
                  key={i}
                  className="text-xs sm:text-sm font-body text-foreground/80 flex items-start gap-2"
                >
                  <span className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5">&bull;</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Action Buttons ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 pb-8">
          <button
            type="button"
            onClick={onRetry}
            className="btn-primary w-full sm:w-auto px-6 py-3.5 rounded-2xl font-heading font-black text-sm shadow-md cursor-pointer active:scale-95"
          >
            Start New Interview
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-heading font-bold text-sm bg-card border border-border/80 text-foreground hover:bg-muted shadow-xs transition-all cursor-pointer active:scale-95"
          >
            Back to Interview Hub
          </button>
        </div>
      </div>
    </div>
  );
}
