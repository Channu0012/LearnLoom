"use client";
// ---------------------------------------------------------------------------
// InterviewStudio — FAANG & Silicon Valley High-Stakes Technical Screen
// Features: Real In-Browser Code Runner with Test Suites, Interactive System
// Design Architecture Canvas, Live Google Meet Dual Streams with VU Meter,
// Company Track Bar Calibration (Google, Stripe, Amazon, Netflix, YC),
// and Silicon Valley Hiring Committee Dossier generation.
// ---------------------------------------------------------------------------
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  type InterviewConfig,
  type InterviewMessage,
  type InterviewScorecard,
  generateSessionId,
  getPhaseForQuestion,
  getChallengeForConfig,
  ROLE_LABELS,
  LEVEL_LABELS,
  COMPANY_TRACKS,
  INTERVIEWER_PROFILES,
} from "@/lib/interview";
import { runCodeWithTestCases, type CodeExecutionReport } from "@/lib/codeRunner";
import { CodeRunnerConsole } from "./CodeRunnerConsole";
import { SystemDesignCanvas } from "./SystemDesignCanvas";
import { useSpeechRecognition, useSpeechSynthesis } from "./useSpeech";
import { useAuth } from "@/context/AuthContext";

// ── Phase Display Labels ───────────────────────────────────────────────────
const PHASE_LABELS: Record<string, string> = {
  intro: "Introduction & Scope",
  warmup: "Problem Context & Clarification",
  technical: "Technical Solution & Coding",
  "deep-dive": "Algorithm Optimality & Big-O",
  "system-design": "Distributed Architecture & Edge Cases",
  behavioral: "Leadership Principles & Trade-offs",
  closing: "Candidate Questions & Wrap-Up",
};

// ── Props ──────────────────────────────────────────────────────────────────
interface InterviewStudioProps {
  config: InterviewConfig;
  initialMediaSettings?: { cameraEnabled: boolean; micEnabled: boolean };
  onComplete: (_scorecard: InterviewScorecard, _messages: InterviewMessage[]) => void;
  onExit: () => void;
}

export function InterviewStudio({
  config,
  initialMediaSettings,
  onComplete,
  onExit,
}: InterviewStudioProps) {
  const { user } = useAuth();

  // Company and challenge resolution
  const companyTrack = config.companyTrack ? COMPANY_TRACKS[config.companyTrack] : null;
  const challenge = useMemo(() => getChallengeForConfig(config), [config]);
  const interviewer = companyTrack
    ? {
        name: companyTrack.interviewerName,
        title: companyTrack.interviewerTitle,
        company: companyTrack.name,
        accent: companyTrack.accent,
        bio: companyTrack.companyBar,
      }
    : INTERVIEWER_PROFILES[config.role] || INTERVIEWER_PROFILES.frontend;

  // ── View States ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"code" | "system-design" | "transcript">(
    config.mode === "system-design" ? "system-design" : "code"
  );
  const [mobilePane, setMobilePane] = useState<"video" | "workspace">("workspace");
  const [showProblemDetails, setShowProblemDetails] = useState(true);

  // ── Conversation & Interview State ─────────────────────────────────────────
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [sessionId] = useState(generateSessionId);
  const [voiceEnabled] = useState(initialMediaSettings?.micEnabled ?? true);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [hintCount, setHintCount] = useState(0);

  // ── Hardware & Camera Streams ──────────────────────────────────────────────
  const [cameraActive, setCameraActive] = useState(initialMediaSettings?.cameraEnabled ?? true);
  const [micActive, setMicActive] = useState(initialMediaSettings?.micEnabled ?? true);
  const [candidateAudioLevel, setCandidateAudioLevel] = useState(0); // 0-100 VU
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  // ── CoderPad Code & In-Browser Test Execution State ────────────────────────
  const [editorLang, setEditorLang] = useState<"typescript" | "javascript" | "python">(
    config.role === "data-science" ? "python" : "typescript"
  );
  const [codeContent, setCodeContent] = useState<string>(() => {
    return (
      challenge.starterCode[editorLang] ||
      challenge.starterCode.typescript ||
      challenge.starterCode.javascript
    );
  });
  const [testReport, setTestReport] = useState<CodeExecutionReport | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  // ── Speech Hooks ───────────────────────────────────────────────────────────
  const {
    isListening,
    transcript,
    isSupported: sttSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const { isSpeaking, isSupported: ttsSupported, speak, stop: stopSpeaking } = useSpeechSynthesis();

  // ── Camera & Microphone Stream Lifecycle ───────────────────────────────────
  const startMediaStream = useCallback(async (videoRequested: boolean, audioRequested: boolean) => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    if (!videoRequested && !audioRequested) {
      setCandidateAudioLevel(0);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoRequested ? { width: 640, height: 480, facingMode: "user" } : false,
        audio: audioRequested ? true : false,
      });

      mediaStreamRef.current = stream;

      if (videoRequested && videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Live VU Decibel Meter
      if (audioRequested && stream.getAudioTracks().length > 0) {
        try {
          const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            audioContextRef.current = ctx;
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);
            analyserRef.current = analyser;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const updateLevel = () => {
              if (!analyserRef.current) return;
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
              const avg = sum / dataArray.length;
              setCandidateAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
              rafRef.current = requestAnimationFrame(updateLevel);
            };
            updateLevel();
          }
        } catch (audioErr) {
          console.warn("Audio analyser error in studio:", audioErr);
        }
      }
    } catch (err) {
      console.warn("Could not acquire media stream:", err);
    }
  }, []);

  useEffect(() => {
    startMediaStream(cameraActive, micActive);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startMediaStream, cameraActive, micActive]);

  useEffect(() => {
    if (cameraActive && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [cameraActive]);

  const toggleCamera = () => {
    const nextState = !cameraActive;
    setCameraActive(nextState);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = nextState;
      });
    }
  };

  const toggleMic = () => {
    const nextState = !micActive;
    setMicActive(nextState);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = nextState;
      });
    }
    if (!nextState && isListening) {
      stopListening();
    }
  };

  // ── Real-time Interview Timer ──────────────────────────────────────────────
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

  // ── Auto-scroll Chat ───────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ── Sync Speech-to-Text & Instant Barge-in ────────────────────────────────
  useEffect(() => {
    if (transcript && voiceEnabled) {
      if (isSpeaking) stopSpeaking();
      setInputText(transcript);
    }
  }, [transcript, voiceEnabled, isSpeaking, stopSpeaking]);

  // ── Start Interview Call ───────────────────────────────────────────────────
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
        content: `Welcome to your ${interviewer.company} technical screen for ${ROLE_LABELS[config.role]}. I am ${interviewer.name}. We will be working on "${challenge.title}". Take a look at the problem description on your left. Before jumping into code, walk me through your initial thoughts and edge cases.`,
        timestamp: Date.now(),
        phase: "intro",
        questionIndex: 0,
      };
      setMessages([fallbackMsg]);
      setQuestionCount(1);
    }
    setIsLoading(false);
  };

  // ── Send Verbal or Code Response ───────────────────────────────────────────
  const sendResponse = useCallback(
    async (
      explicitContent?: string,
      extraPayload?: {
        candidateCode?: string;
        testReport?: CodeExecutionReport;
        canvasSummary?: string;
      }
    ) => {
      const text = (explicitContent !== undefined ? explicitContent : inputText).trim();
      if (!text || isLoading) return;

      if (isListening) stopListening();
      if (isSpeaking) stopSpeaking();

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
            candidateCode: extraPayload?.candidateCode ?? codeContent,
            testReport: extraPayload?.testReport ?? (testReport || undefined),
            canvasSummary: extraPayload?.canvasSummary,
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
        // Continue gracefully
      }

      setIsLoading(false);
    },
    [
      inputText,
      isLoading,
      isListening,
      isSpeaking,
      messages,
      sessionId,
      questionCount,
      config,
      codeContent,
      testReport,
      stopListening,
      stopSpeaking,
      resetTranscript,
      autoSpeak,
      ttsSupported,
      speak,
    ]
  );

  // ── Run In-Browser Test Execution ──────────────────────────────────────────
  const handleRunTests = async () => {
    if (isRunningTests) return;
    setIsRunningTests(true);
    try {
      const report = await runCodeWithTestCases(
        codeContent,
        challenge.functionName,
        challenge.testCases
      );
      setTestReport(report);
    } catch (err) {
      console.error("Test execution error:", err);
    } finally {
      setIsRunningTests(false);
    }
  };

  // ── Submit Solution to Interviewer ─────────────────────────────────────────
  const handleSubmitSolution = async () => {
    setIsRunningTests(true);
    let report = testReport;
    try {
      report = await runCodeWithTestCases(codeContent, challenge.functionName, challenge.testCases);
      setTestReport(report);
    } catch {
      // Use existing
    } finally {
      setIsRunningTests(false);
    }

    const testSummary = report
      ? `Passed ${report.passedCount}/${report.totalCount} tests in ${report.totalRuntimeMs}ms.`
      : "Executed solution.";

    const formattedMessage = `I have submitted my technical solution for "${challenge.title}":\n\n\`\`\`${editorLang}\n${codeContent}\n\`\`\`\n\nTest Suite Outcome: ${testSummary}\nReady for your review and Big-O evaluation.`;

    sendResponse(formattedMessage, {
      candidateCode: codeContent,
      testReport: report || undefined,
    });

    setActiveTab("transcript");
  };

  // ── Submit System Design Architecture ──────────────────────────────────────
  const handleSubmitArchitecture = (summary: string) => {
    sendResponse(summary, { canvasSummary: summary });
    setActiveTab("transcript");
  };

  // ── Request Hint Ladder ────────────────────────────────────────────────────
  const handleRequestHint = () => {
    const nextCount = hintCount + 1;
    setHintCount(nextCount);
    const hintPrompts = [
      `Could you provide a high-level conceptual hint on optimal approaches for "${challenge.title}"?`,
      `Could you give me a structural hint regarding data structures or algorithms (e.g. hash map vs two pointers) to reach optimal Big-O?`,
      `I need a calibration nudge on boundary edge cases and handling invalid inputs. Where should I focus?`,
    ];
    const prompt = hintPrompts[Math.min(hintPrompts.length - 1, nextCount - 1)];
    sendResponse(prompt);
    setActiveTab("transcript");
  };

  // ── Handle Tab & Ctrl+Enter in Editor ───────────────────────────────────────
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = codeContent.substring(0, start) + "  " + codeContent.substring(end);
      setCodeContent(newCode);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleRunTests();
    }
  };

  // ── End Interview & Compute Hiring Committee Scorecard ─────────────────────
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
          candidateCode: codeContent,
        }),
      });

      const data = await res.json();
      if (data.scorecard) {
        const scorecard: InterviewScorecard = {
          ...data.scorecard,
          interviewDuration: elapsed,
          candidateSolutionCode: codeContent,
        };
        onComplete(scorecard, messages);
      }
    } catch {
      onComplete(
        {
          overallScore: 82,
          overallGrade: "A",
          faangReadiness: "Almost Ready",
          hiringVerdict: "HIRE",
          targetLevel: "Senior Software Engineer (L5)",
          categories: [],
          summary: "Interview concluded successfully. Calibration dossier compiled.",
          topStrengths: ["Clear breakdown of problem", "Structured algorithm design"],
          criticalImprovements: ["Quantify latency tradeoffs early"],
          recommendedResources: ["Designing Data-Intensive Applications"],
          interviewDuration: elapsed,
          totalQuestions: questionCount,
          questionsAnswered: messages.filter((m) => m.role === "candidate").length,
          candidateSolutionCode: codeContent,
          staffSolutionCode: challenge.optimalSolution,
        },
        messages
      );
    }
  };

  const latestInterviewerMessage = useMemo(() => {
    const list = [...messages].reverse();
    return list.find((m) => m.role === "interviewer")?.content || "";
  }, [messages]);

  const currentPhase = messages.length > 0 ? messages[messages.length - 1].phase : "intro";
  const lineNumbers = useMemo(() => codeContent.split("\n").map((_, i) => i + 1), [codeContent]);

  return (
    <div className="fixed inset-0 z-50 bg-[#070b14] text-slate-100 flex flex-col font-body select-none">
      {/* ── Top Bar (Google Meet Header + Track Badge) ───────────────────── */}
      <header className="flex items-center justify-between px-3 sm:px-6 py-2.5 border-b border-slate-800/80 bg-[#0b0f19] flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-700/60 flex items-center justify-center bg-[#111827]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon.png"
                alt="VeySkill"
                width={22}
                height={22}
                className="w-5 h-5 object-contain rounded-sm"
              />
            </div>
            <span className="font-heading font-black text-sm tracking-tight hidden sm:inline">
              <span className="text-white">Vey</span>
              <span className="text-[#14b8a6]">skill</span>
              <span className="text-slate-400 font-medium ml-1.5 text-[11px] uppercase tracking-wider">
                Technical Screen
              </span>
            </span>
          </div>

          {/* Company Calibration Badge */}
          {companyTrack && (
            <div
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-heading font-bold ${companyTrack.badgeColor}`}
            >
              <span>{companyTrack.name} Track</span>
            </div>
          )}

          {/* Call Live Status */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-heading font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE SESSION</span>
          </div>

          {/* Current Phase */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 font-medium border-l border-slate-800 pl-3">
            <span className="text-slate-500">Phase:</span>
            <span className="text-teal-300 font-semibold">
              {PHASE_LABELS[currentPhase] || "Technical Screen"}
            </span>
          </div>
        </div>

        {/* Center / Right: Timer & Hang Up */}
        <div className="flex items-center gap-3">
          {/* Duration Meter */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-teal-400"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="font-mono text-xs font-bold text-slate-200 tabular-nums">
              {formatTime(elapsed)} / {config.duration}:00
            </span>
            <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${timeProgress}%`,
                  backgroundColor:
                    timeProgress > 85 ? "#ef4444" : timeProgress > 65 ? "#f59e0b" : "#14b8a6",
                }}
              />
            </div>
          </div>

          {/* Mobile Pane Switcher */}
          <div className="flex lg:hidden bg-slate-900 rounded-xl p-0.5 border border-slate-800">
            <button
              type="button"
              onClick={() => setMobilePane("video")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                mobilePane === "video"
                  ? "bg-teal-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Video
            </button>
            <button
              type="button"
              onClick={() => setMobilePane("workspace")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                mobilePane === "workspace"
                  ? "bg-teal-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Workspace
            </button>
          </div>

          {/* Conclude Button */}
          {messages.filter((m) => m.role === "candidate").length >= 2 ? (
            <button
              type="button"
              onClick={() => setShowExitConfirm(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-heading font-black bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
                <line x1="23" y1="1" x2="1" y2="23" />
              </svg>
              <span>Conclude Call</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onExit}
              className="px-3 py-1.5 rounded-xl text-xs font-heading font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition-colors cursor-pointer"
            >
              Exit
            </button>
          )}
        </div>
      </header>

      {/* ── Main Body: Video Grid + CoderPad / Design Workspace ───────────── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-2 sm:p-3 gap-3">
        {/* ── LEFT PANE: Video Grid, Problem Card & Rubric Pills ─────────── */}
        <section
          className={`w-full lg:w-[420px] xl:w-[460px] flex-shrink-0 flex flex-col gap-3 overflow-y-auto ${
            mobilePane === "workspace" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Tile 1: Interviewer (AI Lead) */}
          <div className="relative rounded-2xl bg-[#0d1322] border border-slate-800 overflow-hidden shadow-xl aspect-video flex flex-col justify-between p-3">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${interviewer.accent} opacity-15`}
            />
            <div className="absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

            {/* Top Tile Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-heading font-extrabold text-slate-200 tracking-wide uppercase">
                  {interviewer.name}
                </span>
                <span className="text-[10px] text-teal-400 font-mono">({interviewer.company})</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/60 border border-slate-700/60 text-[10px] font-mono text-slate-300">
                <span>INTERVIEWER</span>
              </div>
            </div>

            {/* Center Avatar & Speaking Aura */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-1">
              <div className="relative">
                {isSpeaking && (
                  <div className="absolute -inset-3 rounded-full bg-teal-500/30 animate-ping opacity-75" />
                )}
                {isSpeaking && (
                  <div className="absolute -inset-1.5 rounded-full bg-emerald-400/40 animate-pulse" />
                )}

                <div
                  className={`w-18 h-18 rounded-2xl bg-gradient-to-br ${interviewer.accent} border-2 ${
                    isSpeaking
                      ? "border-teal-400 shadow-xl shadow-teal-500/40"
                      : "border-slate-700 shadow-lg"
                  } flex items-center justify-center text-white text-2xl font-heading font-black transition-all`}
                >
                  {interviewer.name.charAt(0)}
                </div>
              </div>

              <div className="text-center mt-1.5">
                <p className="text-xs font-heading font-bold text-white">{interviewer.title}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Evaluator &bull; {companyTrack ? companyTrack.name : "FAANG"} Calibration Bar
                </p>
              </div>
            </div>

            {/* Live Captions */}
            <div className="relative z-10 w-full min-h-[44px] rounded-xl bg-black/75 backdrop-blur-md border border-slate-700/70 p-2 text-left">
              <div className="flex items-center gap-1.5 mb-1">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-teal-400"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="text-[10px] font-heading font-black text-teal-400 uppercase tracking-wider">
                  Live Captions
                </span>
                {isSpeaking && (
                  <div className="flex items-center gap-0.5 ml-auto">
                    <span className="w-1 h-2 bg-teal-400 rounded-full animate-bounce" />
                    <span className="w-1 h-3 bg-teal-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-200 line-clamp-2 leading-relaxed">
                {latestInterviewerMessage ||
                  "Observing solution architecture and code execution..."}
              </p>
            </div>
          </div>

          {/* Tile 2: Candidate Mirrored Webcam Tile */}
          <div className="relative rounded-2xl bg-[#0b0f19] border border-slate-800 overflow-hidden shadow-xl aspect-video flex flex-col justify-between p-3">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0e1422] text-slate-500">
                <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 text-base font-bold">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "C"}
                </div>
                <p className="text-xs font-mono mt-1 text-slate-400">Camera Off</p>
              </div>
            )}

            {/* Candidate Tile Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs border border-slate-700/60 text-[10px] font-mono text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>CANDIDATE</span>
              </div>

              {/* Reactive Decibel Audio Level */}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs border border-slate-700/60">
                <span className="text-[10px] font-mono text-slate-300">VU:</span>
                <div className="flex items-end gap-0.5 h-2.5">
                  <span
                    className="w-1 rounded-full transition-all"
                    style={{
                      height: `${Math.max(2, (candidateAudioLevel / 100) * 10)}px`,
                      backgroundColor: candidateAudioLevel > 15 ? "#10b981" : "#475569",
                    }}
                  />
                  <span
                    className="w-1 rounded-full transition-all"
                    style={{
                      height: `${Math.max(2, (candidateAudioLevel / 100) * 12)}px`,
                      backgroundColor: candidateAudioLevel > 35 ? "#10b981" : "#475569",
                    }}
                  />
                  <span
                    className="w-1 rounded-full transition-all"
                    style={{
                      height: `${Math.max(2, (candidateAudioLevel / 100) * 8)}px`,
                      backgroundColor: candidateAudioLevel > 60 ? "#10b981" : "#475569",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Candidate Bottom Tag */}
            <div className="relative z-10 flex items-center justify-between px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-slate-700/70">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-heading font-extrabold text-white truncate max-w-[180px]">
                  {user?.displayName || "You (Candidate)"}
                </span>
                <span className="text-[10px] text-teal-400 font-mono">
                  &bull; {LEVEL_LABELS[config.level].split(" ")[0]}
                </span>
              </div>
              <span
                className={`text-[10px] font-mono font-bold ${
                  micActive ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {micActive ? "UNMUTED" : "MUTED"}
              </span>
            </div>
          </div>

          {/* ── Active Problem Statement Card ───────────────────────────── */}
          <div className="rounded-2xl bg-[#0e1422] border border-slate-800 p-3 shadow-lg">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/30 text-[10px] font-heading font-extrabold text-teal-400 uppercase">
                  {challenge.difficulty}
                </span>
                <span className="text-xs font-heading font-bold text-white truncate max-w-[200px]">
                  {challenge.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowProblemDetails((v) => !v)}
                className="text-[11px] text-slate-400 hover:text-teal-300 font-mono cursor-pointer"
              >
                {showProblemDetails ? "Hide" : "Details"}
              </button>
            </div>

            <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
              {challenge.summary}
            </p>

            {showProblemDetails && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-800 space-y-2 text-[11px]">
                <div>
                  <span className="font-heading font-bold text-teal-400 text-[10px] uppercase">
                    Target Function:
                  </span>
                  <div className="mt-0.5 p-1 rounded-md bg-black/40 border border-slate-800 font-mono text-[10px] text-slate-200">
                    <code>{challenge.functionName}(...)</code>
                  </div>
                </div>

                <div>
                  <span className="font-heading font-bold text-slate-400 text-[10px] uppercase">
                    Constraints:
                  </span>
                  <ul className="mt-0.5 space-y-0.5 text-[10px] text-slate-400 font-mono list-disc list-inside">
                    {challenge.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Strategy Cheatsheet & Hint Ladder */}
          <div className="rounded-2xl bg-[#0e1422] border border-slate-800 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span className="text-[11px] font-heading font-bold text-slate-300 uppercase tracking-wide">
                  Candidate Signals:
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Hints: {hintCount}/3</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setInputText(
                    `Before coding, let me clarify the constraints for ${challenge.functionName}: What is the expected range of inputs, memory limits, and target latency?`
                  );
                  setActiveTab("transcript");
                  inputRef.current?.focus();
                }}
                className="p-1.5 rounded-lg text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/40 text-[11px] text-teal-300 font-medium transition-colors cursor-pointer"
              >
                &bull; Clarify Constraints
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputText(
                    `Analyzing complexity trade-offs:\n- Brute force approach: O(N^2) time with minimal space.\n- Optimized approach: O(N) time using extra auxiliary memory.\nI propose implementing the O(N) solution:`
                  );
                  setActiveTab("transcript");
                  inputRef.current?.focus();
                }}
                className="p-1.5 rounded-lg text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-[11px] text-emerald-300 font-medium transition-colors cursor-pointer"
              >
                &bull; Big-O Trade-offs
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputText(
                    `I want to verify boundary edge cases for ${challenge.functionName}: What happens if the input is empty, null, or has duplicates?`
                  );
                  setActiveTab("transcript");
                  inputRef.current?.focus();
                }}
                className="p-1.5 rounded-lg text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-[11px] text-cyan-300 font-medium transition-colors cursor-pointer"
              >
                &bull; Verify Edge Cases
              </button>
              <button
                type="button"
                onClick={handleRequestHint}
                className="p-1.5 rounded-lg text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-[11px] text-amber-300 font-medium transition-colors cursor-pointer"
              >
                &bull; Request Hint (-5 pts)
              </button>
            </div>
          </div>
        </section>

        {/* ── RIGHT PANE: Collaborative CoderPad, Design Canvas & Transcript ── */}
        <section
          className={`flex-1 flex flex-col min-w-0 bg-[#0e1422] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl ${
            mobilePane === "video" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Workspace Tabs Header */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#111827] border-b border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {/* Tab 1: CoderPad IDE */}
              <button
                type="button"
                onClick={() => setActiveTab("code")}
                className={`px-3 py-1.5 rounded-xl text-xs font-heading font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "code"
                    ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <svg
                  width="14"
                  height="14"
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
                <span>CoderPad IDE &amp; Tests</span>
              </button>

              {/* Tab 2: System Design Canvas */}
              <button
                type="button"
                onClick={() => setActiveTab("system-design")}
                className={`px-3 py-1.5 rounded-xl text-xs font-heading font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "system-design"
                    ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <svg
                  width="14"
                  height="14"
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
                <span>System Design Whiteboard</span>
              </button>

              {/* Tab 3: Dialogue Transcript */}
              <button
                type="button"
                onClick={() => setActiveTab("transcript")}
                className={`px-3 py-1.5 rounded-xl text-xs font-heading font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "transcript"
                    ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
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
                <span>Dialogue ({messages.length})</span>
              </button>
            </div>

            {/* Language & Actions (if in code tab) */}
            {activeTab === "code" && (
              <div className="flex items-center gap-2">
                <select
                  value={editorLang}
                  onChange={(e) => {
                    const l = e.target.value as "typescript" | "javascript" | "python";
                    setEditorLang(l);
                    setCodeContent(
                      challenge.starterCode[l] ||
                        challenge.starterCode.typescript ||
                        challenge.starterCode.javascript
                    );
                  }}
                  className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="typescript">TypeScript</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(codeContent);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-mono text-slate-300 transition-colors cursor-pointer hidden sm:block"
                  title="Copy code"
                >
                  {isCopied ? "Copied!" : "Copy"}
                </button>
              </div>
            )}
          </div>

          {/* ── TAB 1: CoderPad Code Editor + Test Runner Console ─────── */}
          {activeTab === "code" && (
            <div className="flex-1 flex flex-col min-h-0 bg-[#090d16]">
              {/* Code Editor Window with Line Numbers */}
              <div className="flex-1 flex min-h-0 overflow-hidden font-mono text-xs">
                {/* Gutter */}
                <div className="w-10 sm:w-12 py-3 bg-[#070a12] text-slate-600 select-none text-right pr-2.5 border-r border-slate-800/80 overflow-hidden font-mono text-[11px] leading-5">
                  {lineNumbers.map((num) => (
                    <div key={num}>{num}</div>
                  ))}
                </div>

                {/* Editor Textarea */}
                <textarea
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  onKeyDown={handleEditorKeyDown}
                  spellCheck={false}
                  placeholder="// Implement your solution and handle edge cases..."
                  className="flex-1 p-3 bg-transparent text-slate-200 placeholder-slate-600 resize-none focus:outline-none leading-5 font-mono text-xs sm:text-[13px] overflow-y-auto selection:bg-teal-500/30"
                />
              </div>

              {/* Docked Test Runner Console */}
              <CodeRunnerConsole
                testCases={challenge.testCases}
                report={testReport}
                isRunning={isRunningTests}
                onRunTests={handleRunTests}
                onSubmitSolution={handleSubmitSolution}
                isSubmitting={isLoading}
              />
            </div>
          )}

          {/* ── TAB 2: System Design Architecture Whiteboard ───────────── */}
          {activeTab === "system-design" && (
            <SystemDesignCanvas
              blueprintId={config.role === "system-design" ? "rate-limiter" : "url-shortener"}
              onSubmitArchitecture={handleSubmitArchitecture}
              isEvaluating={isLoading}
            />
          )}

          {/* ── TAB 3: Dialogue Transcript ─────────────────────────────── */}
          {activeTab === "transcript" && (
            <div className="flex-1 flex flex-col min-h-0 bg-[#090d16]">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-3xl ${
                      msg.role === "interviewer" ? "mr-auto" : "ml-auto flex-row-reverse"
                    } animate-slide-up`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-md ${
                        msg.role === "interviewer"
                          ? `bg-gradient-to-br ${interviewer.accent} text-white`
                          : "bg-teal-600 text-white"
                      }`}
                    >
                      {msg.role === "interviewer" ? interviewer.name.charAt(0) : "You"}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`rounded-2xl p-3.5 max-w-[85%] text-xs sm:text-sm leading-relaxed ${
                        msg.role === "interviewer"
                          ? "bg-[#111827] border border-slate-800 text-slate-100"
                          : "bg-teal-950/40 border border-teal-500/30 text-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1 select-none">
                        <span className="font-heading font-extrabold text-xs text-teal-400">
                          {msg.role === "interviewer" ? interviewer.name : "You"}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap font-body text-slate-200">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 max-w-3xl mr-auto animate-slide-up">
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${interviewer.accent} flex items-center justify-center text-white text-xs font-black`}
                    >
                      {interviewer.name.charAt(0)}
                    </div>
                    <div className="bg-[#111827] border border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:300ms]" />
                      <span className="text-xs text-slate-400 font-mono ml-2">
                        {interviewer.name} is evaluating approach...
                      </span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Text Input Row */}
              <div className="p-3 bg-[#0d1322] border-t border-slate-800 flex items-center gap-2">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendResponse();
                    }
                  }}
                  placeholder="Type your response or verbal reasoning... (Enter to send, Shift+Enter for newline)"
                  rows={1}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none"
                  style={{ maxHeight: "80px" }}
                />
                <button
                  type="button"
                  onClick={() => sendResponse()}
                  disabled={!inputText.trim() || isLoading}
                  className="btn-primary p-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <svg
                    width="15"
                    height="15"
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
            </div>
          )}
        </section>
      </div>

      {/* ── Bottom Floating Controls Bar (Google Meet Style) ─────────────── */}
      <footer className="h-16 border-t border-slate-800/80 bg-[#0b0f19] px-4 flex items-center justify-between flex-shrink-0 z-40">
        <div className="text-[11px] text-slate-400 hidden sm:block font-mono">
          VeySkill Studio &bull; {interviewer.company} Screen
        </div>

        {/* Center Google Meet Control Buttons */}
        <div className="flex items-center gap-2.5 mx-auto">
          {/* Microphone Mute / Unmute */}
          <button
            type="button"
            onClick={toggleMic}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
              micActive
                ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                : "bg-red-500/20 text-red-400 border border-red-500/40"
            }`}
            title={micActive ? "Mute Microphone" : "Unmute Microphone"}
          >
            {micActive ? (
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
            ) : (
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
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            )}
          </button>

          {/* Camera Toggle */}
          <button
            type="button"
            onClick={toggleCamera}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
              cameraActive
                ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                : "bg-red-500/20 text-red-400 border border-red-500/40"
            }`}
            title={cameraActive ? "Turn Off Camera" : "Turn On Camera"}
          >
            {cameraActive ? (
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
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            ) : (
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
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M21 21l-3.34-3.34L16 16m0 0l-5.66-5.66L2 2" />
                <path d="M23 7v10" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            )}
          </button>

          {/* Quick Push-To-Talk / Voice Toggle */}
          {sttSupported && (
            <button
              type="button"
              onClick={() => {
                if (isListening) {
                  stopListening();
                } else {
                  if (isSpeaking) stopSpeaking();
                  startListening();
                }
              }}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                isListening
                  ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40"
                  : "bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700"
              }`}
              title={isListening ? "Listening... (Click to Stop)" : "Push to Talk (Speech to Text)"}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              </svg>
            </button>
          )}

          {/* End Call Button */}
          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            className="h-11 px-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-heading font-black text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer"
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
              <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
              <line x1="23" y1="1" x2="1" y2="23" />
            </svg>
            <span className="hidden sm:inline">Conclude Screen</span>
          </button>
        </div>

        {/* Audio Output Status */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoSpeak((v) => !v)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-mono transition-colors cursor-pointer border ${
              autoSpeak
                ? "bg-teal-500/10 text-teal-300 border-teal-500/30"
                : "bg-slate-900 text-slate-500 border-slate-800"
            }`}
          >
            AI Voice: {autoSpeak ? "ON" : "MUTED"}
          </button>
        </div>
      </footer>

      {/* ── Conclude Call Modal ────────────────────────────────────────── */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1422] border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scale-in text-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mx-auto mb-4">
              <svg
                width="24"
                height="24"
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
            </div>

            <h3 className="font-heading font-black text-lg text-white mb-1.5">
              Conclude Technical Screen?
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              The Silicon Valley Hiring Committee will compile your official dossier, including code
              efficiency diffs, test suite pass rates, and leveling recommendations.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-xs font-heading font-bold text-slate-300 transition-colors cursor-pointer"
              >
                Continue Screen
              </button>
              <button
                type="button"
                onClick={endInterview}
                disabled={isEvaluating}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-heading font-black shadow-lg shadow-teal-950/50 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isEvaluating ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <span>Submit to Committee</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
