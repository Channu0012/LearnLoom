"use client";
// ---------------------------------------------------------------------------
// ScorecardView — Official Silicon Valley Hiring Committee Dossier
// Features: Committee Verdict (Strong Hire/Hire/No Hire), 5-Pillar Competency
// Radar Metrics, Side-by-Side Code Diff against Staff Engineer Benchmark,
// and 7-Day Precision Action Plan.
// ---------------------------------------------------------------------------
import { useState } from "react";
import {
  type InterviewScorecard as ScorecardType,
  type HiringVerdict,
  ROLE_LABELS,
  LEVEL_LABELS,
  COMPANY_TRACKS,
  type InterviewConfig,
} from "@/lib/interview";

interface ScorecardProps {
  scorecard: ScorecardType;
  config: InterviewConfig;
  onRetry: () => void;
  onBack: () => void;
}

// ── Verdict Styles ─────────────────────────────────────────────────────────
const VERDICT_CONFIG: Record<
  HiringVerdict,
  { label: string; bg: string; border: string; text: string; glow: string }
> = {
  STRONG_HIRE: {
    label: "STRONG HIRE (L5/L6 BAR)",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/40",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/30",
  },
  HIRE: {
    label: "HIRE (TARGET LEVEL MET)",
    bg: "bg-teal-500/15",
    border: "border-teal-500/40",
    text: "text-teal-400",
    glow: "shadow-teal-500/30",
  },
  LEAN_HIRE: {
    label: "LEAN HIRE (MINOR DEFICITS)",
    bg: "bg-blue-500/15",
    border: "border-blue-500/40",
    text: "text-blue-400",
    glow: "shadow-blue-500/30",
  },
  LEAN_NO: {
    label: "LEAN NO HIRE (GAPS OBSERVED)",
    bg: "bg-amber-500/15",
    border: "border-amber-500/40",
    text: "text-amber-400",
    glow: "shadow-amber-500/30",
  },
  STRONG_NO: {
    label: "NOT INCLINED (BELOW BAR)",
    bg: "bg-red-500/15",
    border: "border-red-500/40",
    text: "text-red-400",
    glow: "shadow-red-500/30",
  },
};

const GRADE_COLORS: Record<string, { bg: string; text: string }> = {
  S: { bg: "from-amber-400 to-yellow-500", text: "text-amber-400" },
  A: { bg: "from-emerald-400 to-teal-500", text: "text-emerald-400" },
  B: { bg: "from-blue-400 to-indigo-500", text: "text-blue-400" },
  C: { bg: "from-orange-400 to-amber-500", text: "text-orange-400" },
  D: { bg: "from-red-400 to-rose-500", text: "text-red-400" },
  F: { bg: "from-red-600 to-red-800", text: "text-red-500" },
};

export function ScorecardView({ scorecard, config, onRetry, onBack }: ScorecardProps) {
  const [codeTab, setCodeTab] = useState<"candidate" | "staff">("candidate");
  const [copiedLink, setCopiedLink] = useState(false);

  const verdict = VERDICT_CONFIG[scorecard.hiringVerdict || "HIRE"] || VERDICT_CONFIG.HIRE;
  const grade = GRADE_COLORS[scorecard.overallGrade] || GRADE_COLORS.B;
  const companyTrack = config.companyTrack ? COMPANY_TRACKS[config.companyTrack] : null;

  const formatDuration = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const radar = scorecard.radarMetrics || {
    codingProwess: scorecard.overallScore,
    systemArchitecture: Math.max(40, scorecard.overallScore - 5),
    communication: Math.min(95, scorecard.overallScore + 3),
    edgeCaseCoverage: Math.max(35, scorecard.overallScore - 8),
    composure: Math.min(98, scorecard.overallScore + 4),
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-body pb-20 select-none">
      {/* ── Sub Header ────────────────────────────────────────────────── */}
      <div className="border-b border-slate-800 bg-[#0b0f1a]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon.png"
              alt="VeySkill"
              width={26}
              height={26}
              className="w-6 h-6 object-contain rounded-md"
            />
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-sm tracking-tight">
                <span className="text-white">Vey</span>
                <span className="text-[#14b8a6]">skill</span>
                <span className="text-slate-400 font-bold ml-1.5 text-xs uppercase tracking-wider hidden sm:inline">
                  Hiring Committee Dossier
                </span>
              </span>
              {companyTrack && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-heading font-bold border ${companyTrack.badgeColor}`}
                >
                  {companyTrack.name} Calibration
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="px-3 py-1.5 rounded-xl text-xs font-heading font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              {copiedLink ? "Link Copied!" : "Share Dossier"}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-3.5 py-1.5 rounded-xl text-xs font-heading font-bold bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/40 transition-colors cursor-pointer"
            >
              Back to Hub
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        {/* ── Hero Dossier Card ────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#0d1322] p-6 sm:p-8 shadow-2xl">
          <div className="relative flex flex-col md:flex-row items-center gap-6 sm:gap-8 justify-between">
            {/* Left: Overall Score Dial */}
            <div className="flex items-center gap-6">
              <div className="relative flex-shrink-0">
                <svg
                  width="150"
                  height="150"
                  viewBox="0 0 160 160"
                  className="transform -rotate-90"
                >
                  <circle cx="80" cy="80" r="68" fill="none" stroke="#1e293b" strokeWidth="10" />
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    fill="none"
                    stroke="url(#scoreGradient)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${(scorecard.overallScore / 100) * 427} 427`}
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
                  <span className="font-heading font-black text-4xl text-white">
                    {scorecard.overallScore}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">
                    Score / 100
                  </span>
                </div>
              </div>

              <div>
                {/* Official Verdict Stamp */}
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-heading font-extrabold tracking-wide mb-2 shadow-sm ${verdict.bg} ${verdict.border} ${verdict.text}`}
                >
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  <span>{verdict.label}</span>
                </div>

                <h1 className="font-heading font-black text-xl sm:text-2xl text-white">
                  {ROLE_LABELS[config.role]} Technical Calibration
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 font-mono mt-0.5">
                  Target: {scorecard.targetLevel || LEVEL_LABELS[config.level]} &bull;{" "}
                  {config.duration} min session
                </p>

                {/* Quick Meta */}
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 font-mono">
                  <span>Time: {formatDuration(scorecard.interviewDuration)}</span>
                  <span>&bull;</span>
                  <span>Questions Answered: {scorecard.questionsAnswered}</span>
                  <span>&bull;</span>
                  <span>
                    Overall Grade: <strong className={grade.text}>{scorecard.overallGrade}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Retake Action */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={onRetry}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-heading font-black text-xs shadow-lg shadow-teal-950/50 transition-all cursor-pointer text-center"
              >
                Re-take Calibration Screen
              </button>
            </div>
          </div>
        </div>

        {/* ── 5-Pillar Competency Radar Meters ─────────────────────────── */}
        <div className="rounded-3xl border border-slate-800 bg-[#0d1322] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <span className="text-teal-400">⚡</span>
              <span>Hiring Committee Competency Signals</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">
              Evaluated on FAANG Rubric (0-100)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              {
                label: "Coding Prowess",
                score: radar.codingProwess,
                color: "from-teal-500 to-emerald-500",
              },
              {
                label: "System Architecture",
                score: radar.systemArchitecture,
                color: "from-blue-500 to-indigo-500",
              },
              {
                label: "Communication",
                score: radar.communication,
                color: "from-purple-500 to-pink-500",
              },
              {
                label: "Edge Case Coverage",
                score: radar.edgeCaseCoverage,
                color: "from-amber-500 to-orange-500",
              },
              {
                label: "Composure & Pacing",
                score: radar.composure,
                color: "from-cyan-500 to-teal-500",
              },
            ].map((pillar, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-heading font-bold text-slate-300 text-[11px]">
                      {pillar.label}
                    </span>
                    <span className="font-mono font-extrabold text-teal-400">{pillar.score}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${pillar.color}`}
                      style={{ width: `${pillar.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Interactive Code Diff: Candidate vs Staff Engineer ───────── */}
        <div className="rounded-3xl border border-slate-800 bg-[#0d1322] overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-5 py-3 bg-[#111827] border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-teal-400">💻</span>
              <span className="font-heading font-black text-sm text-white">
                Technical Implementation Review
              </span>
            </div>

            {/* Toggle Tabs */}
            <div className="flex items-center gap-1 bg-slate-900 rounded-xl p-0.5 border border-slate-800">
              <button
                type="button"
                onClick={() => setCodeTab("candidate")}
                className={`px-3 py-1 rounded-lg text-xs font-heading font-bold cursor-pointer transition-colors ${
                  codeTab === "candidate"
                    ? "bg-teal-500 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Your Code Solution
              </button>
              <button
                type="button"
                onClick={() => setCodeTab("staff")}
                className={`px-3 py-1 rounded-lg text-xs font-heading font-bold cursor-pointer transition-colors ${
                  codeTab === "staff"
                    ? "bg-teal-500 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Staff Engineer Optimal Benchmark
              </button>
            </div>
          </div>

          <div className="p-4 bg-[#090d16] font-mono text-xs overflow-x-auto max-h-[380px]">
            {codeTab === "candidate" ? (
              scorecard.candidateSolutionCode ? (
                <pre className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {scorecard.candidateSolutionCode}
                </pre>
              ) : (
                <div className="py-8 text-center text-slate-500">
                  <p>No explicit code solution was submitted during this session.</p>
                </div>
              )
            ) : (
              <pre className="text-emerald-300 leading-relaxed whitespace-pre-wrap">
                {scorecard.staffSolutionCode || "// Benchmark solution unavailable"}
              </pre>
            )}
          </div>
        </div>

        {/* ── Actionable 7-Day Precision Drill Plan ─────────────────────── */}
        {scorecard.actionableSevenDayPlan && scorecard.actionableSevenDayPlan.length > 0 && (
          <div className="rounded-3xl border border-slate-800 bg-[#0d1322] p-6 shadow-xl space-y-4">
            <h2 className="font-heading font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <span className="text-amber-400">🎯</span>
              <span>Personalized 7-Day Precision Action Plan</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {scorecard.actionableSevenDayPlan.map((plan, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col justify-between"
                >
                  <div>
                    <span className="px-2 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/30 text-[10px] font-mono font-bold text-teal-400">
                      {plan.day}
                    </span>
                    <h3 className="font-heading font-bold text-xs text-white mt-2">{plan.task}</h3>
                    <p className="text-[11px] text-slate-400 font-body mt-1 leading-relaxed">
                      {plan.drill}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Executive Summary ────────────────────────────────────────── */}
        {scorecard.summary && (
          <div className="rounded-3xl border border-slate-800 bg-[#0d1322] p-6 shadow-xl">
            <h2 className="font-heading font-black text-sm text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="text-teal-400">📝</span>
              <span>Executive Committee Assessment</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{scorecard.summary}</p>
          </div>
        )}

        {/* ── Strengths & Critical Gaps ────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 gap-4">
          {scorecard.topStrengths.length > 0 && (
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/20 p-5 shadow-xl">
              <h3 className="font-heading font-black text-xs uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
                <span>+</span>
                <span>Demonstrated Strengths</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-200">
                {scorecard.topStrengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">{i + 1}.</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {scorecard.criticalImprovements.length > 0 && (
            <div className="rounded-3xl border border-amber-500/30 bg-amber-950/20 p-5 shadow-xl">
              <h3 className="font-heading font-black text-xs uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                <span>!</span>
                <span>Critical Focus Areas for Next Level</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-200">
                {scorecard.criticalImprovements.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold shrink-0">&bull;</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
