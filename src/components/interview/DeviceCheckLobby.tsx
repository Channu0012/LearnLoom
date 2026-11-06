"use client";
// ---------------------------------------------------------------------------
// DeviceCheckLobby — Pre-Flight Hardware & System Readiness Audit
// Simulates Google / FAANG interview waiting room: Camera, Mic VU Meter,
// Speaker test, Network Latency, and Interviewer profile briefing.
// ---------------------------------------------------------------------------
import { useState, useEffect, useRef } from "react";
import {
  type InterviewConfig,
  ROLE_LABELS,
  LEVEL_LABELS,
  COMPANY_TRACKS,
  INTERVIEWER_PROFILES,
  getChallengeForConfig,
} from "@/lib/interview";
import { useAuth } from "@/context/AuthContext";

interface DeviceCheckLobbyProps {
  config: InterviewConfig;
  onReady: (_settings: { cameraEnabled: boolean; micEnabled: boolean }) => void;
  onBack: () => void;
}

export function DeviceCheckLobby({ config, onReady, onBack }: DeviceCheckLobbyProps) {
  const { user } = useAuth();
  const companyTrack = config.companyTrack ? COMPANY_TRACKS[config.companyTrack] : null;
  const challenge = getChallengeForConfig(config);
  const interviewer = companyTrack
    ? {
        name: companyTrack.interviewerName,
        title: companyTrack.interviewerTitle,
        company: companyTrack.name,
        accent: companyTrack.accent,
        bio: companyTrack.companyBar,
      }
    : INTERVIEWER_PROFILES[config.role] || INTERVIEWER_PROFILES.frontend;

  // ── Hardware States ────────────────────────────────────────────────────────
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [cameraPermission, setCameraPermission] = useState<"pending" | "granted" | "denied">(
    "pending"
  );
  const [micPermission, setMicPermission] = useState<"pending" | "granted" | "denied">("pending");
  const [audioLevel, setAudioLevel] = useState(0); // 0-100
  const [soundTested, setSoundTested] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // ── Initialize Camera & Mic Audit ──────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    async function initHardwareAudit() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
          audio: true,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        setCameraPermission("granted");
        setMicPermission("granted");

        // Attach video stream
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
        }

        // Setup Web Audio Analyser for VU Meter
        try {
          const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            audioContextRef.current = audioCtx;
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 128;
            source.connect(analyser);
            analyserRef.current = analyser;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const updateAudioMeter = () => {
              if (!analyserRef.current) return;
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const average = sum / dataArray.length;
              const normalized = Math.min(100, Math.round((average / 128) * 100));
              setAudioLevel(normalized);
              animationFrameRef.current = requestAnimationFrame(updateAudioMeter);
            };
            updateAudioMeter();
          }
        } catch (audioErr) {
          console.warn("Audio meter initialization error:", audioErr);
        }
      } catch (err) {
        console.warn("Hardware permission error:", err);
        setCameraPermission("denied");
        setMicPermission("denied");
      }
    }

    initHardwareAudit();

    // ── Measure Round-Trip Network Latency ───────────────────────────────────
    const pingStart = performance.now();
    fetch("/api/ai/interview", { method: "OPTIONS" })
      .catch(() => {})
      .finally(() => {
        const pingTime = Math.round(performance.now() - pingStart);
        if (isMounted) setLatencyMs(pingTime);
      });

    return () => {
      isMounted = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // ── Toggle Camera in Preview ───────────────────────────────────────────────
  const handleToggleCamera = () => {
    if (!streamRef.current) return;
    const videoTracks = streamRef.current.getVideoTracks();
    videoTracks.forEach((t) => {
      t.enabled = !cameraActive;
    });
    setCameraActive(!cameraActive);
  };

  // ── Toggle Mic in Preview ──────────────────────────────────────────────────
  const handleToggleMic = () => {
    if (!streamRef.current) return;
    const audioTracks = streamRef.current.getAudioTracks();
    audioTracks.forEach((t) => {
      t.enabled = !micActive;
    });
    setMicActive(!micActive);
  };

  // ── Play Speaker Test Sound ────────────────────────────────────────────────
  const testSpeaker = () => {
    if (typeof window === "undefined") return;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        "Audio check confirmed. Your microphone and speakers are calibrated for the interview."
      );
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setSoundTested(true);
      window.speechSynthesis.speak(utterance);
    } else {
      try {
        const win = window as unknown as {
          AudioContext?: typeof AudioContext;
          webkitAudioContext?: typeof AudioContext;
        };
        const AudioContextClass = win.AudioContext || win.webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.6);
          setSoundTested(true);
        } else {
          setSoundTested(true);
        }
      } catch {
        setSoundTested(true);
      }
    }
  };

  // ── Enter Studio ───────────────────────────────────────────────────────────
  const handleJoinInterview = () => {
    // Release preview stream so Studio can grab or reuse it
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Audio prime to unlock browser autoplay policy for speech synthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        const prime = new SpeechSynthesisUtterance("");
        prime.volume = 0;
        window.speechSynthesis.speak(prime);
      } catch {
        // Silently continue
      }
    }

    onReady({
      cameraEnabled: cameraActive && cameraPermission === "granted",
      micEnabled: micActive && micPermission === "granted",
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-body">
      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-slate-800 bg-[#0e1422]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-700/60 shadow-sm flex items-center justify-center bg-[#111827]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon.svg"
              alt="VeySkill"
              width={26}
              height={26}
              className="w-6 h-6 object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-sm sm:text-base text-white">
                Vey<span className="text-[#14b8a6]">skill</span>
              </span>
              <span className="text-slate-500">&bull;</span>
              <span className="text-xs font-heading font-bold text-slate-300">
                System Readiness Check
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Calibrating hardware for {ROLE_LABELS[config.role]} Screen
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="px-3 py-1.5 rounded-xl text-xs font-heading font-semibold bg-slate-800 text-slate-300 border border-slate-700/60 hover:bg-slate-700/80 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </header>

      {/* ── Lobby Content ────────────────────────────────────────────────── */}
      <main className="flex-1 container-page max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Video Preview & Mic Meter (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-2xl flex items-center justify-center">
            {/* Live Camera Stream */}
            <video
              ref={videoPreviewRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${
                cameraActive && cameraPermission === "granted"
                  ? "opacity-100"
                  : "opacity-0 absolute"
              }`}
            />

            {/* Camera Off / Denied Fallback */}
            {(!cameraActive || cameraPermission !== "granted") && (
              <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl font-heading font-bold text-teal-400">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "C"}
                </div>
                <div>
                  <h4 className="text-sm font-heading font-bold text-slate-200">
                    {cameraPermission === "denied" ? "Camera Access Blocked" : "Camera Turned Off"}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    {cameraPermission === "denied"
                      ? "Grant camera permissions in your browser to enable live candidate video."
                      : "You can turn your camera on anytime during the interview."}
                  </p>
                </div>
              </div>
            )}

            {/* Overlaid Badges */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                HD 720P
              </span>
              {latencyMs !== null && (
                <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-slate-700/60">
                  {latencyMs}ms Latency
                </span>
              )}
            </div>

            {/* Candidate Name Watermark */}
            <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md text-xs font-heading font-bold text-slate-200">
              {user?.displayName || user?.email || "Candidate"} (You)
            </div>

            {/* Quick Toggle Controls */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleMic}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  micActive
                    ? "bg-slate-800/90 text-slate-200 hover:bg-slate-700 border border-slate-700"
                    : "bg-red-500/80 text-white hover:bg-red-600 border border-red-500"
                }`}
                title={micActive ? "Mute Microphone" : "Unmute Microphone"}
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
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>

              <button
                type="button"
                onClick={handleToggleCamera}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  cameraActive
                    ? "bg-slate-800/90 text-slate-200 hover:bg-slate-700 border border-slate-700"
                    : "bg-red-500/80 text-white hover:bg-red-600 border border-red-500"
                }`}
                title={cameraActive ? "Turn Off Camera" : "Turn On Camera"}
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
                >
                  <path d="M23 7l-7 5 7 5V7z" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </button>
            </div>
          </div>

          {/* Live Microphone VU Meter */}
          <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-heading font-bold text-slate-300 flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${audioLevel > 5 ? "bg-emerald-400 animate-ping" : "bg-slate-600"}`}
                />
                Microphone Sensitivity Level
              </span>
              <span className="font-mono text-slate-400 text-[11px]">
                {audioLevel > 5 ? "Audio Detected &bull; Clear" : "Say something to test mic"}
              </span>
            </div>

            {/* 12-segment LED VU Meter */}
            <div className="grid grid-cols-12 gap-1.5 h-3 bg-slate-950 p-1 rounded-lg border border-slate-800/80">
              {Array.from({ length: 12 }).map((_, i) => {
                const threshold = (i + 1) * 8;
                const isActive = audioLevel >= threshold && micActive;
                const isHigh = i >= 9;
                return (
                  <div
                    key={i}
                    className={`h-full rounded-xs transition-colors duration-75 ${
                      isActive ? (isHigh ? "bg-amber-400" : "bg-teal-400") : "bg-slate-800/60"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Pre-Flight Checklist & Interviewer Briefing (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Assigned Tech Lead Briefing */}
          <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${interviewer.accent} flex items-center justify-center text-white font-extrabold text-lg shadow-lg flex-shrink-0`}
              >
                {interviewer.name.charAt(0)}
              </div>
              <div>
                <span className="text-[10px] font-heading font-black uppercase tracking-wider text-teal-400">
                  Your Lead Interviewer
                </span>
                <h3 className="font-heading font-extrabold text-base text-white">
                  {interviewer.name}
                </h3>
                <p className="text-xs text-slate-400 leading-snug">
                  {interviewer.title} &bull;{" "}
                  <span className="text-slate-300 font-semibold">{interviewer.company}</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-body bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              &ldquo;{interviewer.bio}&rdquo;
            </p>

            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-heading font-bold block">
                  Track
                </span>
                <span className="font-heading font-bold text-slate-200">
                  {ROLE_LABELS[config.role]}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-heading font-bold block">
                  Level
                </span>
                <span className="font-heading font-bold text-slate-200">
                  {LEVEL_LABELS[config.level].split(" ")[0]}
                </span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-800/50">
                <span className="text-[10px] text-teal-400 uppercase font-heading font-bold block">
                  Assigned Challenge
                </span>
                <span className="font-heading font-bold text-white text-xs block truncate">
                  {challenge.title}
                </span>
              </div>
            </div>
          </div>

          {/* Hardware Audit Checklist */}
          <div className="p-5 rounded-3xl bg-[#111827] border border-slate-800 space-y-3">
            <h4 className="text-xs font-heading font-extrabold text-slate-300 uppercase tracking-wider">
              System Audit Checklist
            </h4>

            <div className="space-y-2.5 text-xs font-heading">
              {/* Camera Status */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
                <div className="flex items-center gap-2.5 text-slate-200">
                  <svg
                    width="15"
                    height="15"
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
                  <span>Camera Stream</span>
                </div>
                <span
                  className={`text-[11px] font-bold ${cameraPermission === "granted" ? "text-emerald-400" : "text-amber-400"}`}
                >
                  {cameraPermission === "granted" ? "Verified" : "Optional"}
                </span>
              </div>

              {/* Mic Status */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
                <div className="flex items-center gap-2.5 text-slate-200">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  </svg>
                  <span>Microphone Voice I/O</span>
                </div>
                <span
                  className={`text-[11px] font-bold ${micPermission === "granted" ? "text-emerald-400" : "text-amber-400"}`}
                >
                  {micPermission === "granted" ? "Verified" : "Optional"}
                </span>
              </div>

              {/* Speaker Test */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
                <div className="flex items-center gap-2.5 text-slate-200">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                  <span>Audio Output (Speakers)</span>
                </div>
                <button
                  type="button"
                  onClick={testSpeaker}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 transition-colors cursor-pointer"
                >
                  {soundTested ? "Passed" : "Test Sound"}
                </button>
              </div>
            </div>
          </div>

          {/* Join Interview Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleJoinInterview}
              className="btn-primary w-full py-4 rounded-2xl text-base font-heading font-black tracking-tight inline-flex items-center justify-center gap-2.5 shadow-xl shadow-teal-900/30 hover:shadow-teal-900/50 cursor-pointer"
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
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              <span>Join Technical Screen</span>
            </button>
            <p className="text-center text-[11px] text-slate-500 mt-2 font-mono">
              Live {config.duration}-min Technical Screen &bull; Calibrated to FAANG Hiring Bar
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
