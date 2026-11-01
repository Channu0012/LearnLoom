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
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="border-b border-white/10 bg-[#0d1220]/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-extrabold text-sm">
              <span className="text-white">Vey</span>
              <span className="text-teal-400">Skill</span>
              <span className="text-white/40 ml-1.5 font-medium">Scorecard</span>
            </span>
          </div>
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 transition-colors"
          >
            Back to Interview Hub
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ── Hero Grade Card ──────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-6 sm:p-8">
          {/* Background Glow */}
          <div
            className={`absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-to-br ${grade.bg} opacity-10 blur-3xl`}
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
                  stroke="rgba(255,255,255,0.05)"
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
                    <stop offset="0%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-black ${grade.text}`}>
                  {scorecard.overallScore}
                </span>
                <span className="text-xs text-white/40 font-medium mt-0.5">out of 100</span>
              </div>
            </div>

            {/* Score Info */}
            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                <span
                  className={`text-5xl font-black bg-gradient-to-br ${grade.bg} bg-clip-text text-transparent`}
                >
                  {scorecard.overallGrade}
                </span>
                <div
                  className={`px-3 py-1 rounded-full border text-xs font-bold ${READINESS_COLORS[scorecard.faangReadiness] || ""}`}
                >
                  {scorecard.faangReadiness}
                </div>
              </div>

              <h1 className="text-lg font-bold text-white/90 mb-1">
                {ROLE_LABELS[config.role]} Interview
              </h1>
              <p className="text-sm text-white/50">
                {LEVEL_LABELS[config.level]} — {config.topics.slice(0, 3).join(", ")}
              </p>

              {/* Stats Row */}
              <div className="flex items-center gap-4 mt-4 text-xs text-white/40">
                <div className="flex items-center gap-1.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {formatDuration(scorecard.interviewDuration)}
                </div>
                <div className="flex items-center gap-1.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {scorecard.totalQuestions} questions
                </div>
                <div className="flex items-center gap-1.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {scorecard.questionsAnswered} answered
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Summary ──────────────────────────────────────────────────── */}
        {scorecard.summary && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-bold text-white/80 mb-2 flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Executive Summary
            </h2>
            <p className="text-sm text-white/60 leading-relaxed">{scorecard.summary}</p>
          </div>
        )}

        {/* ── Category Breakdown ───────────────────────────────────────── */}
        {scorecard.categories.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-white/80 flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              Performance Breakdown
            </h2>

            <div className="grid gap-3">
              {scorecard.categories.map((cat, i) => {
                const barColor =
                  cat.score >= 80
                    ? "from-emerald-400 to-teal-500"
                    : cat.score >= 60
                      ? "from-blue-400 to-indigo-500"
                      : cat.score >= 40
                        ? "from-amber-400 to-orange-500"
                        : "from-red-400 to-rose-500";

                return (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-white/80">{cat.name}</span>
                      <span className="text-sm font-bold text-white/90">
                        {cat.score}
                        <span className="text-white/30 font-normal">/{cat.maxScore}</span>
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>

                    <p className="text-xs text-white/50 mb-3">{cat.feedback}</p>

                    <div className="grid sm:grid-cols-2 gap-3">
                      {cat.strengths.length > 0 && (
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-emerald-400/80 font-bold">
                            Strengths
                          </span>
                          <ul className="mt-1 space-y-0.5">
                            {cat.strengths.map((s, j) => (
                              <li
                                key={j}
                                className="text-xs text-white/50 flex items-start gap-1.5"
                              >
                                <span className="text-emerald-400 mt-0.5 flex-shrink-0">+</span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {cat.improvements.length > 0 && (
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-amber-400/80 font-bold">
                            Areas to Improve
                          </span>
                          <ul className="mt-1 space-y-0.5">
                            {cat.improvements.map((s, j) => (
                              <li
                                key={j}
                                className="text-xs text-white/50 flex items-start gap-1.5"
                              >
                                <span className="text-amber-400 mt-0.5 flex-shrink-0">-</span>
                                {s}
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

        {/* ── Strengths & Improvements ────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 gap-4">
          {scorecard.topStrengths.length > 0 && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Top Strengths
              </h3>
              <ul className="space-y-2">
                {scorecard.topStrengths.map((s, i) => (
                  <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold flex-shrink-0">{i + 1}.</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {scorecard.criticalImprovements.length > 0 && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
              <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Critical Improvements
              </h3>
              <ul className="space-y-2">
                {scorecard.criticalImprovements.map((s, i) => (
                  <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                    <span className="text-amber-400 font-bold flex-shrink-0">{i + 1}.</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── Recommended Resources ──────────────────────────────────── */}
        {scorecard.recommendedResources.length > 0 && (
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
            <h3 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2">
              <svg
                width="16"
                height="16"
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
              Recommended Resources
            </h3>
            <ul className="space-y-2">
              {scorecard.recommendedResources.map((s, i) => (
                <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                  <span className="text-blue-400 flex-shrink-0">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Action Buttons ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 pb-8">
          <button
            onClick={onRetry}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:from-teal-400 hover:to-emerald-500 active:scale-[0.97] transition-all"
          >
            Start New Interview
          </button>
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-colors"
          >
            Back to Interview Hub
          </button>
        </div>
      </div>
    </div>
  );
}
