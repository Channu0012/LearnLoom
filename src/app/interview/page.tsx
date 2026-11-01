"use client";
// ---------------------------------------------------------------------------
// /interview — AI Mock Interview Hub
// Premium landing page → Interview Configuration → Live Studio → Scorecard
// Replaces the old /doubts feature entirely
// ---------------------------------------------------------------------------
import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  type InterviewConfig,
  type InterviewScorecard,
  type InterviewMessage,
  type InterviewRole,
  type InterviewLevel,
  ROLE_LABELS,
  LEVEL_LABELS,
  ROLE_TOPICS,
} from "@/lib/interview";
import { saveInterviewSession } from "@/lib/firestore";
import { InterviewStudio } from "@/components/interview/InterviewStudio";
import { ScorecardView } from "@/components/interview/ScorecardView";

// ── View State ─────────────────────────────────────────────────────────────
type ViewState = "hub" | "configure" | "studio" | "scorecard";

// ── Role Card Data ─────────────────────────────────────────────────────────
const ROLE_ICONS: Record<InterviewRole, React.ReactNode> = {
  frontend: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  backend: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  ),
  fullstack: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  "data-science": (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  devops: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  mobile: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  "system-design": (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
};

const DURATION_OPTIONS = [
  { value: 15, label: "15 min", desc: "Quick Assessment" },
  { value: 30, label: "30 min", desc: "Standard Interview" },
  { value: 45, label: "45 min", desc: "Deep Evaluation" },
];

export default function InterviewPage() {
  const { user, openAuthModal } = useAuth();
  const [view, setView] = useState<ViewState>("hub");
  const [selectedRole, setSelectedRole] = useState<InterviewRole | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<InterviewLevel>("mid");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig | null>(null);
  const [scorecard, setScorecard] = useState<InterviewScorecard | null>(null);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleRoleSelect = (role: InterviewRole) => {
    setSelectedRole(role);
    setSelectedTopics(ROLE_TOPICS[role].slice(0, 5));
    setView("configure");
  };

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : prev.length < 8
          ? [...prev, topic]
          : prev
    );
  };

  const handleStartInterview = () => {
    if (!user) {
      openAuthModal("signin");
      return;
    }
    if (!selectedRole || selectedTopics.length === 0) return;

    const config: InterviewConfig = {
      role: selectedRole,
      level: selectedLevel,
      topics: selectedTopics,
      duration: selectedDuration,
      language: "en",
    };
    setInterviewConfig(config);
    setView("studio");
  };

  const handleInterviewComplete = useCallback(
    (sc: InterviewScorecard, msgs: InterviewMessage[]) => {
      setScorecard(sc);
      setView("scorecard");

      // Automatically persist to Firestore if authenticated
      if (user && interviewConfig) {
        saveInterviewSession({
          id: `int_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          userId: user.uid,
          userName: user.displayName || user.email || "Candidate",
          userPhotoURL: user.photoURL || null,
          config: interviewConfig,
          messages: msgs,
          scorecard: sc,
          status: "completed",
          startedAt: Date.now() - sc.interviewDuration * 1000,
          completedAt: Date.now(),
          createdAt: Date.now(),
        }).catch((err) => {
          console.warn("Failed to persist interview session:", err);
        });
      }
    },
    [user, interviewConfig]
  );

  const handleRetry = () => {
    setView("configure");
    setScorecard(null);
    setInterviewConfig(null);
  };

  const handleBackToHub = () => {
    setView("hub");
    setSelectedRole(null);
    setSelectedTopics([]);
    setScorecard(null);
    setInterviewConfig(null);
  };

  // ── Studio View ────────────────────────────────────────────────────────
  if (view === "studio" && interviewConfig) {
    return (
      <InterviewStudio
        config={interviewConfig}
        onComplete={handleInterviewComplete}
        onExit={handleBackToHub}
      />
    );
  }

  // ── Scorecard View ─────────────────────────────────────────────────────
  if (view === "scorecard" && scorecard && interviewConfig) {
    return (
      <ScorecardView
        scorecard={scorecard}
        config={interviewConfig}
        onRetry={handleRetry}
        onBack={handleBackToHub}
      />
    );
  }

  // ── Configure View ─────────────────────────────────────────────────────
  if (view === "configure" && selectedRole) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] text-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Back */}
          <button
            onClick={() => setView("hub")}
            className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors mb-8"
          >
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
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                {ROLE_ICONS[selectedRole]}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{ROLE_LABELS[selectedRole]}</h1>
                <p className="text-xs text-white/40">Configure your interview session</p>
              </div>
            </div>
          </div>

          {/* Experience Level */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-white/70 mb-3">Experience Level</h3>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(LEVEL_LABELS) as [InterviewLevel, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedLevel(key)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                    selectedLevel === key
                      ? "bg-teal-500/20 border-teal-500/40 text-teal-400"
                      : "bg-white/[0.03] border-white/10 text-white/60 hover:bg-white/[0.06]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-white/70 mb-3">Duration</h3>
            <div className="grid grid-cols-3 gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedDuration(opt.value)}
                  className={`px-4 py-3 rounded-xl text-center border transition-all ${
                    selectedDuration === opt.value
                      ? "bg-teal-500/20 border-teal-500/40"
                      : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06]"
                  }`}
                >
                  <span
                    className={`block text-lg font-bold ${selectedDuration === opt.value ? "text-teal-400" : "text-white/80"}`}
                  >
                    {opt.label}
                  </span>
                  <span className="block text-[10px] text-white/40 mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Topics */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-white/70 mb-1">
              Focus Topics
              <span className="font-normal text-white/30 ml-2">
                ({selectedTopics.length}/8 selected)
              </span>
            </h3>
            <p className="text-xs text-white/30 mb-3">
              Select the technical areas you want to be evaluated on
            </p>
            <div className="flex flex-wrap gap-2">
              {ROLE_TOPICS[selectedRole].map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleTopicToggle(topic)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    selectedTopics.includes(topic)
                      ? "bg-teal-500/20 border-teal-500/40 text-teal-400"
                      : "bg-white/[0.03] border-white/10 text-white/50 hover:bg-white/[0.06]"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartInterview}
            disabled={selectedTopics.length === 0}
            className="w-full py-4 rounded-xl text-base font-bold bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:from-teal-400 hover:to-emerald-500 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal-500/20"
          >
            {user ? "Start Mock Interview" : "Sign In to Start Interview"}
          </button>

          <p className="text-center text-[10px] text-white/20 mt-3">
            Free — Unlimited mock interviews powered by VeySkill AI
          </p>
        </div>
      </div>
    );
  }

  // ── Hub View (Landing) ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-teal-500/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-gradient-to-t from-emerald-500/5 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-12 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 mb-6">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs font-medium text-teal-400">
              AI-Powered Technical Interviews
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            <span className="text-white">Ace Your Next</span>
            <br />
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              Technical Interview
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/50 max-w-xl mx-auto mb-8 leading-relaxed">
            Practice with an AI interviewer calibrated to FAANG hiring bars. Real questions,
            real-time voice, instant performance scorecard.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 mb-10">
            <div className="text-center">
              <span className="block text-2xl sm:text-3xl font-black text-teal-400">7</span>
              <span className="text-[10px] sm:text-xs text-white/40 uppercase tracking-wider">
                Roles
              </span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <span className="block text-2xl sm:text-3xl font-black text-emerald-400">4</span>
              <span className="text-[10px] sm:text-xs text-white/40 uppercase tracking-wider">
                Levels
              </span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <span className="block text-2xl sm:text-3xl font-black text-blue-400">AI</span>
              <span className="text-[10px] sm:text-xs text-white/40 uppercase tracking-wider">
                Powered
              </span>
            </div>
          </div>

          {/* Features Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-12">
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                </svg>
              </div>
              <div className="text-left">
                <span className="block text-xs font-bold text-white/80">Voice Input</span>
                <span className="block text-[10px] text-white/30">Speak your answers</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
              </div>
              <div className="text-left">
                <span className="block text-xs font-bold text-white/80">Adaptive AI</span>
                <span className="block text-[10px] text-white/30">Dynamic difficulty</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <div className="text-left">
                <span className="block text-xs font-bold text-white/80">FAANG Scorecard</span>
                <span className="block text-[10px] text-white/30">Detailed evaluation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Role Selection Grid ────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
        <h2 className="text-lg font-bold text-white/80 mb-1 text-center">
          Choose Your Interview Track
        </h2>
        <p className="text-sm text-white/30 mb-8 text-center">
          Select the engineering role you want to practice for
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(Object.entries(ROLE_LABELS) as [InterviewRole, string][]).map(([role, label]) => (
            <button
              key={role}
              onClick={() => handleRoleSelect(role)}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-teal-500/30 p-5 text-left transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/5"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-3 group-hover:scale-110 transition-transform">
                {ROLE_ICONS[role]}
              </div>

              {/* Label */}
              <h3 className="text-sm font-bold text-white/90 mb-1 group-hover:text-teal-400 transition-colors">
                {label}
              </h3>

              {/* Topic Preview */}
              <p className="text-[11px] text-white/30 line-clamp-1">
                {ROLE_TOPICS[role].slice(0, 4).join(" · ")}
              </p>

              {/* Arrow */}
              <div className="absolute top-5 right-4 text-white/10 group-hover:text-teal-400/50 transition-colors">
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
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
