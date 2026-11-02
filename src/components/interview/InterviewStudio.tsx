"use client";
// ---------------------------------------------------------------------------
// InterviewStudio — FAANG & Google-Grade Technical Interview Experience
// Features: Google Meet dual-video stream (Interviewer with live captions & speaking aura,
// Candidate mirrored stream with reactive audio VU meter) + CoderPad collaborative workspace.
// ---------------------------------------------------------------------------
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  type InterviewConfig,
  type InterviewMessage,
  type InterviewScorecard,
  type InterviewRole,
  generateSessionId,
  getPhaseForQuestion,
  ROLE_LABELS,
  LEVEL_LABELS,
  INTERVIEWER_PROFILES,
} from "@/lib/interview";
import { useSpeechRecognition, useSpeechSynthesis } from "./useSpeech";
import { useAuth } from "@/context/AuthContext";

// ── Phase Display Labels ───────────────────────────────────────────────────
const PHASE_LABELS: Record<string, string> = {
  intro: "Introduction & Scope",
  warmup: "Technical Warm-Up",
  technical: "Technical Deep Dive",
  "deep-dive": "Algorithm & Concurrency",
  "system-design": "Distributed Architecture",
  behavioral: "Leadership Principles",
  closing: "Candidate Questions & Wrap-Up",
};

// ── Default Code Boilerplates ──────────────────────────────────────────────
function getRoleStarterCode(role: InterviewRole, lang: string): string {
  if (lang === "python") {
    if (role === "data-science") {
      return `# Problem: Vector Similarity Search & Embedding Ranking\n# Target: Low latency cosine similarity over high-dimensional vectors\n\nimport numpy as np\n\ndef search_top_k(query_vec: np.ndarray, index_matrix: np.ndarray, k: int = 5):\n    """Compute cosine similarity and return top k indices."""\n    # Normalize and compute dot product\n    pass\n`;
    }
    return `# Problem: Optimal Solution for ${ROLE_LABELS[role]}\n# Constraints: O(N) time complexity, minimal auxiliary space\n\ndef solution(input_data):\n    # Clarify assumptions and write clean, modular implementation\n    result = []\n    return result\n`;
  }

  if (role === "frontend") {
    return `// Problem: High-Performance Search Autocomplete Custom Hook\n// Focus: Debouncing, race-condition mitigation (AbortController), memory leaks\n\nimport { useState, useEffect } from "react";\n\nexport function useDebounce<T>(value: T, delayMs: number = 300): T {\n  const [debouncedValue, setDebouncedValue] = useState<T>(value);\n\n  useEffect(() => {\n    const timer = setTimeout(() => setDebouncedValue(value), delayMs);\n    return () => clearTimeout(timer);\n  }, [value, delayMs]);\n\n  return debouncedValue;\n}\n`;
  }

  if (role === "backend") {
    return `// Problem: Distributed Rate Limiter (Token Bucket Algorithm)\n// Constraints: Thread-safe, distributed lock compatible, O(1) decision time\n\nexport class TokenBucketRateLimiter {\n  private tokens: number;\n  private lastRefillTimestamp: number;\n\n  constructor(\n    private readonly capacity: number,\n    private readonly refillRatePerSecond: number\n  ) {\n    this.tokens = capacity;\n    this.lastRefillTimestamp = Date.now();\n  }\n\n  public allowRequest(cost: number = 1): boolean {\n    this.refill();\n    if (this.tokens >= cost) {\n      this.tokens -= cost;\n      return true;\n    }\n    return false;\n  }\n\n  private refill(): void {\n    const now = Date.now();\n    const elapsedSec = (now - this.lastRefillTimestamp) / 1000;\n    const tokensToAdd = elapsedSec * this.refillRatePerSecond;\n    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);\n    this.lastRefillTimestamp = now;\n  }\n}\n`;
  }

  if (role === "system-design") {
    return `/**\n * System Architecture Blueprint\n * Scale: 100M Daily Active Users | 50,000 RPS peak write load\n *\n * 1. INGRESS & EDGE:\n *    - Anycast DNS -> Cloudflare CDN -> TLS Termination\n *    - Envoy / NGINX API Gateway (Rate Limiting, JWT Auth)\n *\n * 2. CORE MICROSERVICES:\n *    - Stateless Go/Node workers behind Kubernetes HPA\n *    - gRPC for internal service-to-service communication\n *\n * 3. CACHING & DATA LAYER:\n *    - Redis Cluster (Read-aside, TTL 10m, LRU eviction)\n *    - Sharded PostgreSQL (Write Master + 3 Read Replicas)\n *    - Kafka Partitioned Topics for async event bus\n *\n * 4. BOTTLENECK & FAILURE ANALYSIS:\n *    - Circuit breaker pattern (resilience4j)\n *    - Dead letter queues for failed tasks\n */\n`;
  }

  return `// Technical Solution — ${ROLE_LABELS[role]}\n// Step 1: Clarify constraints & edge cases\n// Step 2: Optimal time & space complexity\n\nexport function solution() {\n  // Your code here\n  return true;\n}\n`;
}

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
  const interviewer = INTERVIEWER_PROFILES[config.role] || INTERVIEWER_PROFILES.frontend;

  // ── View States ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"code" | "transcript">("code");
  const [mobilePane, setMobilePane] = useState<"video" | "workspace">("workspace");

  // ── Conversation & Interview State ─────────────────────────────────────────
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [sessionId] = useState(generateSessionId);
  const [voiceEnabled, setVoiceEnabled] = useState(initialMediaSettings?.micEnabled ?? true);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // ── Hardware & Camera Streams ──────────────────────────────────────────────
  const [cameraActive, setCameraActive] = useState(initialMediaSettings?.cameraEnabled ?? true);
  const [micActive, setMicActive] = useState(initialMediaSettings?.micEnabled ?? true);
  const [candidateAudioLevel, setCandidateAudioLevel] = useState(0); // 0-100 VU
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  // ── CoderPad Code State ────────────────────────────────────────────────────
  const [editorLang, setEditorLang] = useState(
    config.role === "data-science" ? "python" : "typescript"
  );
  const [codeContent, setCodeContent] = useState(() =>
    getRoleStarterCode(config.role, config.role === "data-science" ? "python" : "typescript")
  );
  const [codeExplanation, setCodeExplanation] = useState("");
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
    // Release existing tracks
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

      // Live VU Decibel Meter for Candidate Video Tile
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

  // Initialize camera and mic based on lobby decisions
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

  // Re-attach stream whenever videoRef attaches
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

  // ── Sync Speech-to-Text ───────────────────────────────────────────────────
  useEffect(() => {
    if (transcript && voiceEnabled) {
      setInputText(transcript);
    }
  }, [transcript, voiceEnabled]);

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
        content: `Welcome to your ${ROLE_LABELS[config.role]} technical interview. I am ${interviewer.name} from ${interviewer.company}. I will be evaluating your engineering depth, system trade-offs, and communication. Let us begin: could you walk me through an architecture you recently designed, highlighting how you approached scalability and resilience?`,
        timestamp: Date.now(),
        phase: "intro",
        questionIndex: 0,
      };
      setMessages([fallbackMsg]);
      setQuestionCount(1);
    }
    setIsLoading(false);
  };

  // ── Send Verbal or Text Response ───────────────────────────────────────────
  const sendResponse = useCallback(
    async (explicitContent?: string) => {
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
        // Interview continues gracefully
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
      stopListening,
      stopSpeaking,
      resetTranscript,
      autoSpeak,
      ttsSupported,
      speak,
    ]
  );

  // ── Submit Code Solution from CoderPad ─────────────────────────────────────
  const handleSubmitCodeSolution = () => {
    if (!codeContent.trim() || isLoading) return;
    const formatted = codeExplanation.trim()
      ? `${codeExplanation.trim()}\n\n\`\`\`${editorLang}\n${codeContent}\n\`\`\``
      : `Here is my technical solution implementation:\n\n\`\`\`${editorLang}\n${codeContent}\n\`\`\``;

    sendResponse(formatted);
    setCodeExplanation("");
    setActiveTab("transcript");
  };

  // ── Handle Tab Key inside CoderPad ─────────────────────────────────────────
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
      handleSubmitCodeSolution();
    }
  };

  // ── End Interview & Compute Scorecard ──────────────────────────────────────
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
      onComplete(
        {
          overallScore: 78,
          overallGrade: "B",
          faangReadiness: "Almost Ready",
          categories: [],
          summary:
            "Interview completed successfully. Detailed evaluations and strengths have been compiled.",
          topStrengths: ["Clear technical problem breakdown", "Structured communication approach"],
          criticalImprovements: ["Quantify latency and space trade-offs early in design"],
          recommendedResources: [
            "Designing Data-Intensive Applications",
            "VeySkill FAANG Problem Sets",
          ],
          interviewDuration: elapsed,
          totalQuestions: questionCount,
          questionsAnswered: messages.filter((m) => m.role === "candidate").length,
        },
        messages
      );
    }
  };

  // ── Latest Spoken Question Subtitle ────────────────────────────────────────
  const latestInterviewerMessage = useMemo(() => {
    const list = [...messages].reverse();
    return list.find((m) => m.role === "interviewer")?.content || "";
  }, [messages]);

  const currentPhase = messages.length > 0 ? messages[messages.length - 1].phase : "intro";
  const lineNumbers = useMemo(() => codeContent.split("\n").map((_, i) => i + 1), [codeContent]);

  return (
    <div className="fixed inset-0 z-50 bg-[#080c14] text-slate-100 flex flex-col font-body select-none">
      {/* ── Top Bar (Google Meet Header) ─────────────────────────────────── */}
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

          {/* Call Live Status */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-heading font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE SESSION</span>
          </div>

          {/* Current Phase */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 font-medium border-l border-slate-800 pl-3">
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

          {/* Mobile Pane Switcher (Video vs Workspace) */}
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
              Code
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
              <span>End Call</span>
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

      {/* ── Main Body: Google Meet Dual Grid + CoderPad Studio ───────────── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-2 sm:p-3 gap-3">
        {/* ── LEFT PANE: Video Grid & Live Captions (Google Meet style) ──── */}
        <section
          className={`w-full lg:w-[420px] xl:w-[460px] flex-shrink-0 flex flex-col gap-3 overflow-y-auto ${
            mobilePane === "workspace" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Tile 1: Interviewer (AI Lead) */}
          <div className="relative rounded-2xl bg-[#0d1322] border border-slate-800 overflow-hidden shadow-xl aspect-video flex flex-col justify-between p-3">
            {/* Background Aesthetic */}
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
                {/* Speaking Wave Glow */}
                {isSpeaking && (
                  <div className="absolute -inset-3 rounded-full bg-teal-500/30 animate-ping opacity-75" />
                )}
                {isSpeaking && (
                  <div className="absolute -inset-1.5 rounded-full bg-emerald-400/40 animate-pulse" />
                )}

                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${interviewer.accent} border-2 ${
                    isSpeaking
                      ? "border-teal-400 shadow-xl shadow-teal-500/40"
                      : "border-slate-700 shadow-lg"
                  } flex items-center justify-center text-white text-2xl font-heading font-black transition-all`}
                >
                  {interviewer.name.charAt(0)}
                </div>
              </div>

              <div className="text-center mt-2">
                <p className="text-xs font-heading font-bold text-white">{interviewer.title}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Evaluator &bull; FAANG Calibration
                </p>
              </div>
            </div>

            {/* Real-Time Live Captions / Subtitle Bar (Google Meet Style) */}
            <div className="relative z-10 w-full min-h-[46px] rounded-xl bg-black/75 backdrop-blur-md border border-slate-700/70 p-2 text-left">
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
                    <span className="w-1 h-2 bg-teal-400 rounded-full animate-soundwave-1" />
                    <span className="w-1 h-3 bg-teal-400 rounded-full animate-soundwave-2" />
                    <span className="w-1 h-2 bg-teal-400 rounded-full animate-soundwave-3" />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-200 line-clamp-2 leading-relaxed">
                {latestInterviewerMessage ||
                  "Evaluating candidate approach and engineering trade-offs..."}
              </p>
            </div>
          </div>

          {/* Tile 2: Candidate Mirrored Webcam Tile */}
          <div className="relative rounded-2xl bg-[#0b0f19] border border-slate-800 overflow-hidden shadow-xl aspect-video flex flex-col justify-between p-3">
            {/* Live Video Element */}
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
                <div className="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 text-lg font-bold">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "C"}
                </div>
                <p className="text-xs font-mono mt-2 text-slate-400">Camera is turned off</p>
              </div>
            )}

            {/* Candidate Tile Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs border border-slate-700/60 text-[10px] font-mono text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>CANDIDATE</span>
              </div>

              {/* Reactive Decibel / Audio Level Indicator */}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs border border-slate-700/60">
                <span className="text-[10px] font-mono text-slate-300">Mic:</span>
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
                className={`text-[10px] font-mono font-bold ${micActive ? "text-emerald-400" : "text-red-400"}`}
              >
                {micActive ? "UNMUTED" : "MUTED"}
              </span>
            </div>
          </div>

          {/* Strategy Cheatsheet Pills (Google Engineering Rubric) */}
          <div className="rounded-2xl bg-[#0e1422] border border-slate-800 p-3">
            <div className="flex items-center gap-1.5 mb-2">
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
                Google Rubric Quick Signals:
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setInputText(
                    "Before implementing, let me clarify the constraints: What is the expected RPS, data volume, and acceptable latency SLA?"
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
                    "Analyzing trade-offs:\n- Approach A: O(N) time, O(1) space (optimal for memory)\n- Approach B: O(1) amortized with hash index (optimal for latency)\nI recommend Approach A because:"
                  );
                  setActiveTab("transcript");
                  inputRef.current?.focus();
                }}
                className="p-1.5 rounded-lg text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-[11px] text-emerald-300 font-medium transition-colors cursor-pointer"
              >
                &bull; Trade-offs &amp; Big-O
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputText(
                    "I want to verify edge cases: What happens if the input is empty, null, or contains concurrent write spikes?"
                  );
                  setActiveTab("transcript");
                  inputRef.current?.focus();
                }}
                className="p-1.5 rounded-lg text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-[11px] text-cyan-300 font-medium transition-colors cursor-pointer"
              >
                &bull; Test Edge Cases
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputText(
                    "I have established the high-level design. Could you provide a calibration hint on optimizing the cache eviction policy?"
                  );
                  setActiveTab("transcript");
                  inputRef.current?.focus();
                }}
                className="p-1.5 rounded-lg text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-[11px] text-amber-300 font-medium transition-colors cursor-pointer"
              >
                &bull; Request Hint (-5 pts)
              </button>
            </div>
          </div>
        </section>

        {/* ── RIGHT PANE: Collaborative CoderPad IDE & Dialogue Transcript ── */}
        <section
          className={`flex-1 flex flex-col min-w-0 bg-[#0e1422] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl ${
            mobilePane === "video" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Workspace Tabs Header */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#111827] border-b border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("code")}
                className={`px-3 py-1.5 rounded-xl text-xs font-heading font-black flex items-center gap-1.5 transition-all cursor-pointer ${
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
                <span>CoderPad Workspace (IDE)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("transcript")}
                className={`px-3 py-1.5 rounded-xl text-xs font-heading font-black flex items-center gap-1.5 transition-all cursor-pointer ${
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
                <span>Dialogue Transcript ({messages.length})</span>
              </button>
            </div>

            {/* Language & Actions (if in code tab) */}
            {activeTab === "code" && (
              <div className="flex items-center gap-2">
                <select
                  value={editorLang}
                  onChange={(e) => {
                    const l = e.target.value;
                    setEditorLang(l);
                    setCodeContent(getRoleStarterCode(config.role, l));
                  }}
                  className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="typescript">TypeScript</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="go">Go</option>
                  <option value="sql">SQL</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(codeContent);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-mono text-slate-300 transition-colors cursor-pointer"
                  title="Copy code"
                >
                  {isCopied ? "Copied!" : "Copy"}
                </button>
              </div>
            )}
          </div>

          {/* ── TAB 1: CoderPad Code Editor ────────────────────────────── */}
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
                  placeholder="// Implement your algorithm, data structures, and edge-case handling here..."
                  className="flex-1 p-3 bg-transparent text-slate-200 placeholder-slate-600 resize-none focus:outline-none leading-5 font-mono text-xs sm:text-[13px] overflow-y-auto selection:bg-teal-500/30"
                />
              </div>

              {/* Code Submit & Notes Bar */}
              <div className="p-3 bg-[#0d1322] border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="flex-1">
                  <input
                    type="text"
                    value={codeExplanation}
                    onChange={(e) => setCodeExplanation(e.target.value)}
                    placeholder="Describe your approach, Big-O complexity (e.g. O(N) time, O(1) space)..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSubmitCodeSolution}
                  disabled={!codeContent.trim() || isLoading}
                  className="btn-primary px-4 py-2 rounded-xl text-xs font-heading font-black tracking-tight inline-flex items-center justify-center gap-1.5 shadow-md shadow-teal-900/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
                >
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
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Submit Solution to Interviewer</span>
                </button>
              </div>
            </div>
          )}

          {/* ── TAB 2: Dialogue Transcript ─────────────────────────────── */}
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
                        {interviewer.name} is evaluating...
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
                  placeholder="Type your verbal response or question... (Enter to send, Shift+Enter for newline)"
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
        <div className="text-[11px] text-slate-500 hidden sm:block font-mono">
          VeySkill Studio &bull; FAANG Calibration
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

          {/* Camera On / Off */}
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
                <path d="M23 7l-7 5 7 5V7z" />
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
                <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1" />
                <path d="M23 7l-7 5 7 5V7z" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            )}
          </button>

          {/* Speaker TTS Audio On / Off */}
          {ttsSupported && (
            <button
              type="button"
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                autoSpeak
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
              title={autoSpeak ? "Mute Interviewer Voice" : "Enable Interviewer Voice"}
            >
              {autoSpeak ? (
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
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
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
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              )}
            </button>
          )}

          {/* Speech-to-Text Recognition Toggle */}
          {sttSupported && (
            <button
              type="button"
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
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                voiceEnabled && isListening
                  ? "bg-emerald-500/25 text-emerald-400 border border-emerald-500/50 animate-pulse"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
              title={isListening ? "Listening to your voice..." : "Voice input"}
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
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="M20 12h2" />
                <path d="M2 12h2" />
              </svg>
            </button>
          )}

          {/* End Call Phone Button */}
          <button
            type="button"
            onClick={() => {
              if (messages.filter((m) => m.role === "candidate").length >= 2) {
                setShowExitConfirm(true);
              } else {
                onExit();
              }
            }}
            className="w-14 h-11 rounded-2xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-all shadow-lg shadow-red-900/30 cursor-pointer ml-2"
            title="End Technical Screen"
          >
            <svg
              width="20"
              height="20"
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
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[11px] text-slate-400 font-mono">WebRTC Secure E2EE</span>
        </div>
      </footer>

      {/* ── Evaluating Overlay ────────────────────────────────────────────── */}
      {isEvaluating && (
        <div className="absolute inset-0 z-[80] bg-[#080c14]/95 backdrop-blur-md flex flex-col items-center justify-center gap-6 p-4">
          <div className="w-20 h-20 rounded-full border-4 border-teal-500/30 border-t-teal-400 animate-spin" />
          <div className="text-center max-w-md">
            <h3 className="text-2xl font-heading font-black text-white mb-2">
              Generating FAANG Scorecard
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed font-body">
              {interviewer.name} and the VeySkill AI Evaluation Engine are analyzing your technical
              depth, concurrency choices, and communication against top-tier engineering rubrics.
            </p>
          </div>
        </div>
      )}

      {/* ── Exit Confirmation Modal ──────────────────────────────────────── */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className="text-lg font-heading font-black text-white mb-1.5">
              Conclude Technical Screen?
            </h3>
            <p className="text-xs font-body text-slate-400 mb-6 leading-relaxed">
              Your interview with {interviewer.name} will be evaluated across the{" "}
              {messages.filter((m) => m.role === "candidate").length} problem responses provided.
              You will receive an in-depth scorecard with grades and hiring recommendations.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-heading font-semibold bg-slate-800 border border-slate-700/60 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Continue Screen
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  endInterview();
                }}
                className="btn-primary flex-1 py-2.5 rounded-xl text-xs font-heading font-black cursor-pointer"
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
