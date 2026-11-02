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
import { DeviceCheckLobby } from "@/components/interview/DeviceCheckLobby";

// ── View State ─────────────────────────────────────────────────────────────
type ViewState = "hub" | "configure" | "lobby" | "studio" | "scorecard";

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
    setView("lobby");
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
      <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground py-8 sm:py-12">
        <div className="container-page max-w-2xl mx-auto px-4 sm:px-6">
          {/* Back button */}
          <button
            onClick={() => setView("hub")}
            className="inline-flex items-center gap-1.5 text-sm font-heading font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6 cursor-pointer"
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
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Back to Tracks</span>
          </button>

          {/* Main Card Container */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-7">
            {/* Header */}
            <div className="flex items-center gap-3.5 pb-5 border-b border-border/60">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                {ROLE_ICONS[selectedRole]}
              </div>
              <div>
                <h1 className="font-heading font-black text-xl sm:text-2xl text-foreground tracking-tight">
                  {ROLE_LABELS[selectedRole]}
                </h1>
                <p className="font-body text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Customize your mock interview session
                </p>
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block font-heading font-bold text-xs uppercase tracking-wider text-foreground mb-3">
                Experience Level
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {(Object.entries(LEVEL_LABELS) as [InterviewLevel, string][]).map(
                  ([key, label]) => {
                    const isSelected = selectedLevel === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedLevel(key)}
                        className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-heading font-bold border transition-all text-left cursor-pointer ${
                          isSelected
                            ? "bg-teal-500/15 border-teal-500 text-teal-700 dark:text-teal-300 shadow-xs ring-1 ring-teal-500"
                            : "bg-muted/40 border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block font-heading font-bold text-xs uppercase tracking-wider text-foreground mb-3">
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
                      className={`px-3 py-3 rounded-2xl text-center border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-teal-500/15 border-teal-500 text-teal-700 dark:text-teal-300 shadow-xs ring-1 ring-teal-500"
                          : "bg-muted/40 border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <span
                        className={`block font-heading font-black text-base sm:text-lg ${
                          isSelected ? "text-teal-700 dark:text-teal-300" : "text-foreground"
                        }`}
                      >
                        {opt.label}
                      </span>
                      <span className="block text-[10px] font-body text-muted-foreground mt-0.5">
                        {opt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Topics */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-heading font-bold text-xs uppercase tracking-wider text-foreground">
                  Focus Topics
                </label>
                <span className="text-xs font-body text-muted-foreground">
                  {selectedTopics.length}/8 selected
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-3 font-body">
                Select specific competencies you want the AI interviewer to grill you on.
              </p>
              <div className="flex flex-wrap gap-2">
                {ROLE_TOPICS[selectedRole].map((topic) => {
                  const isSelected = selectedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => handleTopicToggle(topic)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-body font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-teal-500/15 border-teal-500 text-teal-700 dark:text-teal-300 shadow-xs"
                          : "bg-muted/50 border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
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
                className="btn-primary w-full py-4 rounded-2xl text-base font-heading font-black tracking-tight inline-flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
                  aria-hidden="true"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
                <span>{user ? "Enter Interview Studio" : "Sign In to Begin Interview"}</span>
              </button>
              <p className="text-center text-[11px] text-muted-foreground mt-3 font-body">
                Free &amp; Unlimited — Adaptive questions &middot; Real-time voice &middot; FAANG
                scorecards
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Hub View (Landing) ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 sm:pt-16 pb-10 sm:pb-14 border-b border-border/60">
        {/* Subtle Background Glow — Matches site palette */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-teal-500/10 via-emerald-500/5 to-transparent rounded-full blur-3xl opacity-70" />
        </div>

        <div className="container-page max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/25 mb-5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="font-heading font-black text-xs text-teal-700 dark:text-teal-300 tracking-wide uppercase">
              AI Technical Interviewer
            </span>
          </div>

          <h1 className="font-heading font-black text-3xl sm:text-5xl md:text-6xl text-foreground tracking-tight mb-4">
            <span>Ace Your Next</span>{" "}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
              Technical Interview
            </span>
          </h1>

          <p className="font-body text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Practice live with an AI interviewer calibrated to FAANG hiring bars. Real technical
            questions, speech-to-text dictation, and an actionable performance scorecard.
          </p>

          {/* Quick Metrics Bar */}
          <div className="inline-flex items-center justify-center gap-6 sm:gap-10 p-3 sm:px-8 rounded-2xl bg-card border border-border/80 shadow-xs mb-10">
            <div className="text-center">
              <span className="block font-heading font-black text-2xl sm:text-3xl text-teal-600 dark:text-teal-400">
                7
              </span>
              <span className="text-[10px] sm:text-xs font-heading font-bold text-muted-foreground uppercase tracking-wider">
                Tracks
              </span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <span className="block font-heading font-black text-2xl sm:text-3xl text-emerald-600 dark:text-emerald-400">
                4
              </span>
              <span className="text-[10px] sm:text-xs font-heading font-bold text-muted-foreground uppercase tracking-wider">
                Levels
              </span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <span className="block font-heading font-black text-2xl sm:text-3xl text-accent-500">
                FAANG
              </span>
              <span className="text-[10px] sm:text-xs font-heading font-bold text-muted-foreground uppercase tracking-wider">
                Calibrated
              </span>
            </div>
          </div>

          {/* Features Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs text-left">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                </svg>
              </div>
              <div>
                <span className="block font-heading font-bold text-xs sm:text-sm text-foreground">
                  Voice &amp; Audio I/O
                </span>
                <span className="block text-[11px] font-body text-muted-foreground">
                  Speak answers naturally
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs text-left">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
              </div>
              <div>
                <span className="block font-heading font-bold text-xs sm:text-sm text-foreground">
                  Dynamic Grilling
                </span>
                <span className="block text-[11px] font-body text-muted-foreground">
                  Probes your exact logic
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs text-left">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <div>
                <span className="block font-heading font-bold text-xs sm:text-sm text-foreground">
                  FAANG Scorecard
                </span>
                <span className="block text-[11px] font-body text-muted-foreground">
                  Calibrated feedback &amp; XP
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Role Selection Grid ────────────────────────────────────────── */}
      <section className="container-page max-w-5xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-foreground tracking-tight mb-2">
            Choose Your Interview Track
          </h2>
          <p className="font-body text-xs sm:text-sm text-muted-foreground">
            Select an engineering domain to start your targeted interview practice.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.entries(ROLE_LABELS) as [InterviewRole, string][]).map(([role, label]) => (
            <button
              key={role}
              type="button"
              onClick={() => handleRoleSelect(role)}
              className="group relative rounded-2xl border border-border/80 bg-card hover:border-teal-500/60 hover:shadow-md p-5 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Icon */}
                <div className="w-11 h-11 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-3.5 group-hover:scale-105 group-hover:bg-teal-500/15 transition-all">
                  {ROLE_ICONS[role]}
                </div>

                {/* Label */}
                <h3 className="font-heading font-bold text-base text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors mb-1.5">
                  {label}
                </h3>

                {/* Topic Preview */}
                <p className="text-xs font-body text-muted-foreground line-clamp-2 leading-relaxed">
                  {ROLE_TOPICS[role].slice(0, 5).join(" · ")}
                </p>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-between pt-4 mt-3 border-t border-border/40 text-xs font-heading font-semibold text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform">
                <span>Start Practice</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
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
