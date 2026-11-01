"use client";
// ---------------------------------------------------------------------------
// InterviewStudio — Full-screen immersive AI Mock Interview experience
// Real interview feel: live conversation, voice I/O, timer, phase indicators
// ---------------------------------------------------------------------------
import { useState, useEffect, useRef, useCallback } from "react";
import {
  type InterviewConfig,
  type InterviewMessage,
  type InterviewScorecard,
  generateSessionId,
  getPhaseForQuestion,
  ROLE_LABELS,
  LEVEL_LABELS,
} from "@/lib/interview";
import { useSpeechRecognition, useSpeechSynthesis } from "./useSpeech";

// ── Phase Labels ───────────────────────────────────────────────────────────

const PHASE_LABELS: Record<string, string> = {
  intro: "Introduction",
  warmup: "Warm-Up",
  technical: "Technical Deep Dive",
  "deep-dive": "Advanced Problem Solving",
  "system-design": "System Design",
  behavioral: "Behavioral Assessment",
  closing: "Closing",
};

// ── Props ──────────────────────────────────────────────────────────────────

interface InterviewStudioProps {
  config: InterviewConfig;
  onComplete: (_scorecard: InterviewScorecard, _messages: InterviewMessage[]) => void;
  onExit: () => void;
}

export function InterviewStudio({ config, onComplete, onExit }: InterviewStudioProps) {
  // ── State ──────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [sessionId] = useState(generateSessionId);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  // ── Speech Hooks ───────────────────────────────────────────────────────
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported: sttSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const { isSpeaking, isSupported: ttsSupported, speak, stop: stopSpeaking } = useSpeechSynthesis();

  // ── Timer ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const maxTime = config.duration * 60;
  const timeProgress = Math.min((elapsed / maxTime) * 100, 100);

  // ── Auto-scroll chat ──────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ── Sync voice transcript to input ────────────────────────────────────
  useEffect(() => {
    if (transcript && voiceEnabled) {
      setInputText(transcript);
    }
  }, [transcript, voiceEnabled]);

  // ── Start Interview ───────────────────────────────────────────────────
  useEffect(() => {
    startInterview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startInterview = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", config }),
      });

      const data = await res.json();
      if (data.response) {
        const msg: InterviewMessage = {
          id: `${sessionId}_0`,
          role: "interviewer",
          content: data.response,
          timestamp: Date.now(),
          phase: "intro",
          questionIndex: 0,
        };
        setMessages([msg]);
        setQuestionCount(1);

        if (autoSpeak && ttsSupported) {
          speak(data.response);
        }
      }
    } catch {
      const fallbackMsg: InterviewMessage = {
        id: `${sessionId}_0`,
        role: "interviewer",
        content: `Welcome to your ${ROLE_LABELS[config.role]} technical interview. I will be evaluating your skills at the ${LEVEL_LABELS[config.level]} level. Let us begin. Tell me about a project you recently worked on and the technical decisions you made.`,
        timestamp: Date.now(),
        phase: "intro",
        questionIndex: 0,
      };
      setMessages([fallbackMsg]);
      setQuestionCount(1);
    }
    setIsLoading(false);
  };

  // ── Send Response ─────────────────────────────────────────────────────
  const sendResponse = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    // Stop listening if voice is active
    if (isListening) {
      stopListening();
    }
    if (isSpeaking) {
      stopSpeaking();
    }

    // Add candidate message
    const candidateMsg: InterviewMessage = {
      id: `${sessionId}_c_${messages.length}`,
      role: "candidate",
      content: text,
      timestamp: Date.now(),
      phase: getPhaseForQuestion(questionCount, Math.ceil(config.duration / 3)),
    };

    const updatedMessages = [...messages, candidateMsg];
    setMessages(updatedMessages);
    setInputText("");
    resetTranscript();
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ask",
          config,
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      if (data.response) {
        const interviewerMsg: InterviewMessage = {
          id: `${sessionId}_i_${updatedMessages.length}`,
          role: "interviewer",
          content: data.response,
          timestamp: Date.now(),
          phase: getPhaseForQuestion(questionCount + 1, Math.ceil(config.duration / 3)),
          questionIndex: questionCount,
        };
        setMessages((prev) => [...prev, interviewerMsg]);
        setQuestionCount((c) => c + 1);

        if (autoSpeak && ttsSupported) {
          speak(data.response);
        }
      }
    } catch {
      // Silent fail — interview continues
    }

    setIsLoading(false);
    inputRef.current?.focus();
  }, [
    inputText,
    isLoading,
    isListening,
    isSpeaking,
    messages,
    sessionId,
    questionCount,
    config,
    stopListening,
    stopSpeaking,
    resetTranscript,
    autoSpeak,
    ttsSupported,
    speak,
  ]);

  // ── End Interview & Evaluate ──────────────────────────────────────────
  const endInterview = async () => {
    if (isSpeaking) stopSpeaking();
    if (isListening) stopListening();
    setIsEvaluating(true);

    try {
      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate",
          config,
          messages,
        }),
      });

      const data = await res.json();
      if (data.scorecard) {
        const scorecard: InterviewScorecard = {
          ...data.scorecard,
          interviewDuration: elapsed,
        };
        onComplete(scorecard, messages);
      }
    } catch {
      // Generate minimal scorecard on error
      onComplete(
        {
          overallScore: 50,
          overallGrade: "C",
          faangReadiness: "Needs Work",
          categories: [],
          summary:
            "Interview evaluation could not be completed. Your session has been recorded for review.",
          topStrengths: [],
          criticalImprovements: [],
          recommendedResources: [],
          interviewDuration: elapsed,
          totalQuestions: questionCount,
          questionsAnswered: messages.filter((m) => m.role === "candidate").length,
        },
        messages
      );
    }
  };

  // ── Handle Enter key ──────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendResponse();
    }
  };

  // ── Current Phase ─────────────────────────────────────────────────────
  const currentPhase = messages.length > 0 ? messages[messages.length - 1].phase : "intro";

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-[#0a0e1a] text-white flex flex-col">
      {/* ── Top Bar ──────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-[#0d1220]/80 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* VeySkill Logo */}
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
            <span className="font-extrabold text-sm tracking-tight hidden sm:inline">
              <span className="text-white">Vey</span>
              <span className="text-teal-400">Skill</span>
              <span className="text-white/40 ml-1.5 font-medium">Interview</span>
            </span>
          </div>

          {/* Phase Indicator */}
          <div className="hidden sm:flex items-center gap-2 ml-4 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs font-medium text-white/70">
              {PHASE_LABELS[currentPhase] || "Interview"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className="flex items-center gap-2">
            <div className="relative w-24 h-1.5 bg-white/10 rounded-full overflow-hidden hidden sm:block">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
                style={{
                  width: `${timeProgress}%`,
                  background:
                    timeProgress > 80
                      ? "linear-gradient(90deg, #ef4444, #dc2626)"
                      : timeProgress > 60
                        ? "linear-gradient(90deg, #f59e0b, #d97706)"
                        : "linear-gradient(90deg, #14b8a6, #10b981)",
                }}
              />
            </div>
            <span
              className={`font-mono text-sm font-bold tabular-nums ${
                timeProgress > 80
                  ? "text-red-400"
                  : timeProgress > 60
                    ? "text-amber-400"
                    : "text-teal-400"
              }`}
            >
              {formatTime(elapsed)}
            </span>
          </div>

          {/* Question Counter */}
          <span className="text-xs text-white/50 hidden sm:inline">Q{questionCount}</span>

          {/* End Interview */}
          {messages.filter((m) => m.role === "candidate").length >= 2 ? (
            <button
              onClick={() => setShowExitConfirm(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
            >
              End Interview
            </button>
          ) : (
            <button
              onClick={onExit}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 transition-colors"
            >
              Exit
            </button>
          )}
        </div>
      </header>

      {/* ── Chat Area ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.role === "interviewer" ? "mr-auto" : "ml-auto flex-row-reverse"
            } animate-slide-up`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                msg.role === "interviewer"
                  ? "bg-gradient-to-br from-teal-500 to-emerald-600"
                  : "bg-gradient-to-br from-blue-500 to-indigo-600"
              }`}
            >
              {msg.role === "interviewer" ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              )}
            </div>

            {/* Message Bubble */}
            <div
              className={`rounded-2xl px-4 py-3 max-w-[85%] sm:max-w-[75%] ${
                msg.role === "interviewer"
                  ? "bg-white/[0.07] border border-white/10 text-white/90"
                  : "bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/20 text-white/90"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap font-body">{msg.content}</p>
              <span className="block text-[10px] text-white/30 mt-1.5 select-none">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-3xl mr-auto animate-slide-up">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="bg-white/[0.07] border border-white/10 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── Evaluating Overlay ────────────────────────────────────────── */}
      {isEvaluating && (
        <div className="absolute inset-0 z-60 bg-[#0a0e1a]/95 flex flex-col items-center justify-center gap-6">
          <div className="w-16 h-16 rounded-full border-4 border-teal-500/30 border-t-teal-400 animate-spin" />
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">Analyzing Your Performance</h3>
            <p className="text-sm text-white/50 max-w-sm">
              Our AI panel is evaluating your technical depth, communication clarity, and
              problem-solving approach across {questionCount} questions.
            </p>
          </div>
        </div>
      )}

      {/* ── Input Area ───────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-white/10 bg-[#0d1220]/80 backdrop-blur-md px-4 sm:px-6 py-3">
        {/* Voice Status */}
        {voiceEnabled && isListening && (
          <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-0.5">
              <div className="w-1 bg-red-400 rounded-full animate-soundwave-1" />
              <div className="w-1 bg-red-400 rounded-full animate-soundwave-2" />
              <div className="w-1 bg-red-400 rounded-full animate-soundwave-3" />
            </div>
            <span className="text-xs text-red-400 font-medium">
              Listening{interimTranscript ? `: "${interimTranscript}"` : "..."}
            </span>
          </div>
        )}

        {/* Speaking Status */}
        {isSpeaking && (
          <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20">
            <div className="flex items-center gap-0.5">
              <div className="w-1 bg-teal-400 rounded-full animate-soundwave-1" />
              <div className="w-1 bg-teal-400 rounded-full animate-soundwave-2" />
              <div className="w-1 bg-teal-400 rounded-full animate-soundwave-3" />
            </div>
            <span className="text-xs text-teal-400 font-medium">Interviewer speaking...</span>
            <button
              onClick={stopSpeaking}
              className="ml-auto text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Skip
            </button>
          </div>
        )}

        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          {/* Voice Toggle */}
          {sttSupported && (
            <button
              onClick={() => {
                if (voiceEnabled && isListening) {
                  stopListening();
                  setVoiceEnabled(false);
                } else if (voiceEnabled) {
                  setVoiceEnabled(false);
                } else {
                  setVoiceEnabled(true);
                  startListening();
                }
              }}
              className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                voiceEnabled
                  ? isListening
                    ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                    : "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                  : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
              }`}
              title={voiceEnabled ? "Disable voice" : "Enable voice input"}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          )}

          {/* Auto-speak toggle */}
          {ttsSupported && (
            <button
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                autoSpeak
                  ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                  : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
              }`}
              title={autoSpeak ? "Mute interviewer voice" : "Enable interviewer voice"}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {autoSpeak ? (
                  <>
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </>
                ) : (
                  <>
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </>
                )}
              </svg>
            </button>
          )}

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isLoading
                  ? "Waiting for interviewer..."
                  : "Type your response... (Shift+Enter for new line)"
              }
              disabled={isLoading || isEvaluating}
              rows={1}
              className="w-full resize-none bg-white/[0.07] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 disabled:opacity-50 transition-all"
              style={{ maxHeight: "120px", minHeight: "42px" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "42px";
                target.style.height = Math.min(target.scrollHeight, 120) + "px";
              }}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={sendResponse}
            disabled={!inputText.trim() || isLoading || isEvaluating}
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-teal-500 to-emerald-600 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:from-teal-400 hover:to-emerald-500 active:scale-95 transition-all"
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
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

        <p className="text-[10px] text-white/20 text-center mt-2 select-none">
          Powered by VeySkill AI — Your responses are evaluated in real-time
        </p>
      </div>

      {/* ── Exit Confirmation Modal ──────────────────────────────────── */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[70] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#141924] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-white mb-2">End Interview?</h3>
            <p className="text-sm text-white/60 mb-6">
              Your interview will be evaluated based on the{" "}
              {messages.filter((m) => m.role === "candidate").length} responses you have provided so
              far. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-colors"
              >
                Continue Interview
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  endInterview();
                }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:from-teal-400 hover:to-emerald-500 transition-all"
              >
                Get Scorecard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
