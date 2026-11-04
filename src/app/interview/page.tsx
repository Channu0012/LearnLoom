"use client";
// ---------------------------------------------------------------------------
// /interview — Silicon Valley AI Technical Interview Platform
// Features: Real in-browser code execution with test suites, interactive
// system design whiteboard with traffic simulation, 5 company tracks
// (Google, Stripe, Amazon, Netflix, YC), and Silicon Valley Hiring Committee Dossier.
// ---------------------------------------------------------------------------
import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  type InterviewConfig,
  type InterviewScorecard,
  type InterviewMessage,
  type InterviewRole,
  type InterviewLevel,
  type CompanyTrack,
  type InterviewMode,
  ROLE_LABELS,
  LEVEL_LABELS,
  ROLE_TOPICS,
  COMPANY_TRACKS,
} from "@/lib/interview";
import { saveInterviewSession } from "@/lib/firestore";
import { InterviewStudio } from "@/components/interview/InterviewStudio";
import { ScorecardView } from "@/components/interview/ScorecardView";
import { DeviceCheckLobby } from "@/components/interview/DeviceCheckLobby";

// ── View State ─────────────────────────────────────────────────────────────
type ViewState = "hub" | "configure" | "lobby" | "studio" | "scorecard";

// ── Role Card Icons ────────────────────────────────────────────────────────
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
      <rect x="2" y="2" width="8" height="8" rx="2" />
      <rect x="14" y="2" width="8" height="8" rx="2" />
      <rect x="8" y="14" width="8" height="8" rx="2" />
      <line x1="6" y1="10" x2="6" y2="12" />
      <line x1="18" y1="10" x2="18" y2="12" />
      <line x1="6" y1="12" x2="18" y2="12" />
      <line x1="12" y1="12" x2="12" y2="14" />
    </svg>
  ),
};

const DURATION_OPTIONS = [
  { value: 15, label: "15 min", desc: "Quick Screening" },
  { value: 30, label: "30 min", desc: "Standard Technical Round" },
  { value: 45, label: "45 min", desc: "Comprehensive Deep Dive" },
];

export default function InterviewPage() {
  const { user, openAuthModal } = useAuth();
  const [view, setView] = useState<ViewState>("hub");

  // Configuration States
  const [selectedRole, setSelectedRole] = useState<InterviewRole | null>(null);
  const [selectedCompanyTrack, setSelectedCompanyTrack] = useState<CompanyTrack>("google");
  const [selectedMode, setSelectedMode] = useState<InterviewMode>("coding");
  const [selectedLevel, setSelectedLevel] = useState<InterviewLevel>("senior");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState(30);

  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig | null>(null);
  const [scorecard, setScorecard] = useState<InterviewScorecard | null>(null);
  const [mediaSettings, setMediaSettings] = useState<{
    cameraEnabled: boolean;
    micEnabled: boolean;
  }>({
    cameraEnabled: true,
    micEnabled: true,
  });

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleRoleSelect = (role: InterviewRole) => {
    setSelectedRole(role);
    setSelectedTopics(ROLE_TOPICS[role].slice(0, 5));
    if (role === "system-design") {
      setSelectedMode("system-design");
    }
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
      companyTrack: selectedCompanyTrack,
      mode: selectedMode,
    };
    setInterviewConfig(config);
    setView("lobby");
  };

  const handleInterviewComplete = useCallback(
    (sc: InterviewScorecard, msgs: InterviewMessage[]) => {
      setScorecard(sc);
      setView("scorecard");

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

  // ── Lobby View (Hardware & Readiness Audit) ────────────────────────────
  if (view === "lobby" && interviewConfig) {
    return (
      <DeviceCheckLobby
        config={interviewConfig}
        onReady={(settings) => {
          setMediaSettings(settings);
          setView("studio");
        }}
        onBack={() => setView("configure")}
      />
    );
  }

  // ── Studio View ────────────────────────────────────────────────────────
  if (view === "studio" && interviewConfig) {
    return (
      <InterviewStudio
        config={interviewConfig}
        initialMediaSettings={mediaSettings}
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
      <div className="min-h-[calc(100vh-4rem)] bg-[#070b14] text-slate-100 py-8 sm:py-12 select-none">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Back button */}
          <button
            onClick={() => setView("hub")}
            className="inline-flex items-center gap-1.5 text-xs font-heading font-semibold text-slate-400 hover:text-white transition-colors mb-6 cursor-pointer"
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
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Back to Tracks</span>
          </button>

          {/* Main Card Container */}
          <div className="bg-[#0e1422] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-7">
            {/* Header */}
            <div className="flex items-center gap-4 pb-5 border-b border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400 shrink-0">
                {ROLE_ICONS[selectedRole]}
              </div>
              <div>
                <h1 className="font-heading font-black text-xl sm:text-2xl text-white tracking-tight">
                  {ROLE_LABELS[selectedRole]}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Calibrate target company standards and interview modality
                </p>
              </div>
            </div>

            {/* 1. Target Company Bar Track */}
            <div>
              <label className="block font-heading font-bold text-xs uppercase tracking-wider text-slate-300 mb-2.5">
                Target Company Calibration Bar
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {(
                  Object.entries(COMPANY_TRACKS) as [
                    CompanyTrack,
                    (typeof COMPANY_TRACKS)[CompanyTrack],
                  ][]
                ).map(([key, track]) => {
                  const isSelected = selectedCompanyTrack === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedCompanyTrack(key)}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-teal-500/15 border-teal-500 text-white shadow-md ring-1 ring-teal-500/50"
                          : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <div>
                        <span className="font-heading font-black text-sm block text-white">
                          {track.name}
                        </span>
                        <span className="text-[10px] text-teal-400 font-mono block mt-0.5 line-clamp-1">
                          {track.tagline}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Modality Mode */}
            <div>
              <label className="block font-heading font-bold text-xs uppercase tracking-wider text-slate-300 mb-2.5">
                Interview Modality
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: "coding" as InterviewMode,
                    title: "CoderPad Gauntlet",
                    desc: "In-Browser Code Execution & Automated Test Suites",
                    icon: "💻",
                  },
                  {
                    id: "system-design" as InterviewMode,
                    title: "System Design Canvas",
                    desc: "Interactive Visual Whiteboard & Chaos Simulator",
                    icon: "📐",
                  },
                  {
                    id: "full-loop" as InterviewMode,
                    title: "Full Loop Screen",
                    desc: "Algorithmic Code + Architecture Scalability",
                    icon: "⚡",
                  },
                ].map((m) => {
                  const isSelected = selectedMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMode(m.id)}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-teal-500/15 border-teal-500 text-white shadow-md ring-1 ring-teal-500/50"
                          : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-base mb-1">
                        <span>{m.icon}</span>
                        <span className="font-heading font-bold text-xs text-white">{m.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-snug">{m.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Experience Level */}
            <div>
              <label className="block font-heading font-bold text-xs uppercase tracking-wider text-slate-300 mb-2.5">
                Candidate Seniority Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.entries(LEVEL_LABELS) as [InterviewLevel, string][]).map(
                  ([key, label]) => {
                    const isSelected = selectedLevel === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedLevel(key)}
                        className={`px-3 py-2.5 rounded-2xl text-xs font-heading font-bold border transition-all text-center cursor-pointer ${
                          isSelected
                            ? "bg-teal-500/15 border-teal-500 text-teal-300 shadow-xs ring-1 ring-teal-500"
                            : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                        }`}
                      >
                        {label.split(" ")[0]}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* 4. Duration */}
            <div>
              <label className="block font-heading font-bold text-xs uppercase tracking-wider text-slate-300 mb-2.5">
                Duration
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {DURATION_OPTIONS.map((opt) => {
                  const isSelected = selectedDuration === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedDuration(opt.value)}
                      className={`p-3 rounded-2xl text-center border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-teal-500/15 border-teal-500 text-teal-300 shadow-xs ring-1 ring-teal-500"
                          : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <span className="block font-heading font-black text-sm text-white">
                        {opt.label}
                      </span>
                      <span className="block text-[10px] text-slate-500 mt-0.5 font-mono">
                        {opt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Focus Topics */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-heading font-bold text-xs uppercase tracking-wider text-slate-300">
                  Focus Topics &amp; Competencies
                </label>
                <span className="text-xs text-slate-500 font-mono">
                  {selectedTopics.length}/8 selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {ROLE_TOPICS[selectedRole].map((topic) => {
                  const isSelected = selectedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => handleTopicToggle(topic)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-body font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-teal-500/20 border-teal-500 text-teal-300 shadow-xs"
                          : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartInterview}
                disabled={selectedTopics.length === 0}
                className="w-full py-4 rounded-2xl text-base font-heading font-black tracking-tight inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white shadow-xl shadow-teal-950/60 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>{user ? "Enter Live Technical Screen" : "Sign In to Begin Interview"}</span>
              </button>
              <p className="text-center text-[11px] text-slate-500 mt-3 font-mono">
                Real In-Browser Sandbox &middot; Live Test Execution &middot; Official Hiring
                Committee Report
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Hub View (Landing) ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 pb-20 select-none">
      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 sm:pt-16 pb-12 sm:pb-16 border-b border-slate-800/80">
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[350px] bg-gradient-to-b from-teal-500/15 via-emerald-500/5 to-transparent rounded-full blur-3xl opacity-70" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 mb-5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="font-heading font-extrabold text-xs text-teal-400 tracking-wide uppercase">
              Silicon Valley AI Interview Simulator
            </span>
          </div>

          <h1 className="font-heading font-black text-3xl sm:text-5xl md:text-6xl text-white tracking-tight mb-4">
            <span>Real Code. Real Architecture.</span>
            <br />
            <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Zero Generic Chatbots.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Practice live technical interviews with active pairing AI calibrated to Google, Stripe,
            Amazon, and Netflix hiring bars. Featuring real in-browser test runners and an
            interactive system design whiteboard.
          </p>

          {/* 3 Core Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg text-left">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400 mb-2.5">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-sm text-white">
                Live Test-Driven Code Runner
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Run code against visible and hidden stress test cases in a sandboxed Web Worker.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg text-left">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 mb-2.5">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-sm text-white">
                Visual System Design Canvas
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Drag-and-drop CDN, gateways, Redis caches, and queues with real-time QPS
                calculators.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-2.5">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-sm text-white">
                Hiring Committee Dossier
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Official Strong Hire/No Hire leveling verdict, radar competencies, and side-by-side
                code diff.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Role Selection Grid ────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight mb-2">
            Select Your Technical Engineering Track
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Choose a specialization to begin your live technical evaluation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.entries(ROLE_LABELS) as [InterviewRole, string][]).map(([role, label]) => (
            <button
              key={role}
              type="button"
              onClick={() => handleRoleSelect(role)}
              className="group relative rounded-2xl border border-slate-800 bg-[#0d1322] hover:border-teal-500/60 hover:shadow-xl p-5 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Icon */}
                <div className="w-11 h-11 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-3.5 group-hover:scale-105 group-hover:bg-teal-500/15 transition-all">
                  {ROLE_ICONS[role]}
                </div>

                {/* Label */}
                <h3 className="font-heading font-bold text-base text-white group-hover:text-teal-400 transition-colors mb-1.5">
                  {label}
                </h3>

                {/* Topic Preview */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-body">
                  {ROLE_TOPICS[role].slice(0, 5).join(" · ")}
                </p>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-800 text-xs font-heading font-semibold text-teal-400 group-hover:translate-x-0.5 transition-transform">
                <span>Start Calibration</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
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
