"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export function PlaylistGuideVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Synchronize fullscreen state with browser events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullscreen = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playerContainerRef.current) return;

    if (!document.fullscreenElement) {
      try {
        if (playerContainerRef.current.requestFullscreen) {
          await playerContainerRef.current.requestFullscreen();
        } else if ((playerContainerRef.current as any).webkitRequestFullscreen) {
          await (playerContainerRef.current as any).webkitRequestFullscreen();
        }
      } catch (err) {
        console.error("Failed to enter fullscreen:", err);
      }
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      } catch (err) {
        console.error("Failed to exit fullscreen:", err);
      }
    }
  };

  return (
    <section
      className="w-full py-8 sm:py-12 lg:py-14 relative overflow-hidden"
      aria-labelledby="guide-title"
    >
      {/* Background Ambient Glow */}
      <div
        className="absolute top-1/2 left-1/3 -translate-y-1/2 -translate-x-1/2 w-[700px] h-[450px] rounded-full opacity-20 blur-3xl pointer-events-none -z-10"
        style={{
          background:
            "radial-gradient(circle, rgba(15, 118, 110, 0.4) 0%, rgba(217, 119, 6, 0.25) 50%, transparent 80%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-16 items-center">
          {/* ── Left: Expansive Cinema Video Player with Fullscreen ─────────── */}
          <div className="lg:col-span-7 w-full">
            <div className="relative group">
              {/* Subtle Backglow behind Player */}
              <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-teal-500/20 via-primary-500/15 to-amber-500/20 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity -z-10" />

              {/* Fullscreen Target Player Container */}
              <div
                ref={playerContainerRef}
                className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-border/70 dark:border-white/10 bg-neutral-950 shadow-2xl transition-all ${
                  isFullscreen
                    ? "fixed inset-0 z-50 rounded-none border-none flex flex-col justify-center"
                    : ""
                }`}
              >
                {/* Cinema Top Status Bar */}
                <div className="px-4 sm:px-5 py-3 bg-neutral-900/95 border-b border-white/10 flex items-center justify-between z-20">
                  <div className="flex items-center gap-3">
                    {/* macOS Window Controls */}
                    <div className="flex items-center gap-1.5" aria-hidden="true">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]/90" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/90" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]/90" />
                    </div>
                    <span className="w-px h-3.5 bg-white/15" aria-hidden="true" />
                    <span className="text-xs font-heading font-bold text-neutral-200">
                      VeySkill Cinema Flow
                    </span>
                    <span className="hidden sm:inline-block text-[11px] text-neutral-400 font-body">
                      · 1080p Ad-Free Masterclass
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-[10px] font-mono font-bold text-teal-400">
                      LIVE DEMO
                    </span>
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="text-neutral-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
                      title={isFullscreen ? "Exit Fullscreen (Esc)" : "Expand to Fullscreen"}
                      aria-label={isFullscreen ? "Exit Fullscreen" : "Expand to Fullscreen"}
                    >
                      {isFullscreen ? (
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                        >
                          <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                        </svg>
                      ) : (
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                        >
                          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Video Window */}
                <div
                  onClick={togglePlay}
                  className={`group/video relative aspect-video w-full bg-black cursor-pointer overflow-hidden ${
                    isFullscreen ? "max-h-[calc(100vh-60px)]" : ""
                  }`}
                  role="region"
                  aria-label="How to copy playlist link and learn in VeySkill"
                >
                  <video
                    ref={videoRef}
                    src="/videos/how-to-copy-playlist.mp4"
                    preload="metadata"
                    playsInline
                    muted
                    loop
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="w-full h-full object-cover"
                  />

                  {/* Big Play/Pause Central Overlay */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] transition-opacity duration-200 ${
                      isPlaying ? "opacity-0 group-hover/video:opacity-100" : "opacity-100"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlay();
                      }}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-teal-600/95 hover:bg-teal-500 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all"
                      aria-label={isPlaying ? "Pause walkthrough" : "Play walkthrough"}
                    >
                      {isPlaying ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="4" width="4" height="16" rx="1.5" />
                          <rect x="14" y="4" width="4" height="16" rx="1.5" />
                        </svg>
                      ) : (
                        <svg
                          width="26"
                          height="26"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="ml-1"
                        >
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Floating Bottom Control Bar */}
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between pointer-events-auto z-20">
                    {/* Left: Playback Status Pill */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-white text-xs font-heading font-medium shadow-lg">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isPlaying ? "bg-emerald-400 animate-pulse" : "bg-neutral-400"
                        }`}
                      />
                      <span>{isPlaying ? "Playing Walkthrough" : "Click to Play"}</span>
                    </div>

                    {/* Right: Audio & Fullscreen Quick Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={toggleMute}
                        className="px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-white hover:text-teal-300 transition-colors flex items-center gap-1.5 text-xs font-heading font-medium shadow-lg"
                        aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                      >
                        {isMuted ? (
                          <>
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                              <line x1="23" y1="9" x2="17" y2="15" />
                              <line x1="17" y1="9" x2="23" y2="15" />
                            </svg>
                            <span className="hidden sm:inline">Unmute</span>
                          </>
                        ) : (
                          <>
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                            </svg>
                            <span className="hidden sm:inline">Sound On</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="px-3 py-1.5 rounded-full bg-teal-600/90 hover:bg-teal-500 backdrop-blur-md text-white transition-colors flex items-center gap-1.5 text-xs font-heading font-bold shadow-lg"
                        title="Toggle Fullscreen"
                        aria-label="Toggle Fullscreen"
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          {isFullscreen ? (
                            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                          ) : (
                            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                          )}
                        </svg>
                        <span>{isFullscreen ? "Exit" : "Full Screen"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Clear, Modern Side Explanation (No Enclosing Box) ─────── */}
          <div className="lg:col-span-5 w-full space-y-6">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/25 text-teal-700 dark:text-teal-300 text-xs font-heading font-extrabold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <span>Instant 3-Step Flow</span>
            </div>

            {/* Main Headline */}
            <div>
              <h2
                id="guide-title"
                className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-foreground tracking-tight leading-[1.12]"
              >
                Copy any playlist.{" "}
                <span className="bg-gradient-to-r from-teal-600 via-primary-500 to-amber-600 bg-clip-text text-transparent">
                  Learn in pure focus.
                </span>
              </h2>
              <p className="font-body text-base text-muted-foreground mt-3 leading-relaxed">
                Transform any scattered YouTube lecture playlist into an organized, ad-free
                masterclass with interactive quizzes and streak accountability.
              </p>
            </div>

            {/* 3 Clear Numbered Steps */}
            <div className="space-y-4 pt-2">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-2xl bg-teal-500/15 text-teal-700 dark:text-teal-300 font-heading font-black text-sm flex items-center justify-center flex-shrink-0 mt-0.5 border border-teal-500/30">
                  01
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading font-bold text-base text-foreground">
                    Copy the Playlist Link
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed">
                    Grab the browser URL or share link of any course, tutorial series, or
                    educational collection on YouTube.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-300 font-heading font-black text-sm flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-500/30">
                  02
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading font-bold text-base text-foreground">
                    Paste into VeySkill
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed">
                    Paste into Quick Watch. Modules load immediately, stripped of all ads, sponsor
                    popups, and distraction algorithms.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-heading font-black text-sm flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-500/30">
                  03
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading font-bold text-base text-foreground">
                    Master with Quizzes &amp; Streaks
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed">
                    Watch in cinema mode, take comprehension quizzes after lectures, maintain your
                    7-day habit streak, and earn verified credentials.
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Action CTA */}
            <div className="pt-2">
              <Link
                href="/explore"
                className="btn-primary text-sm sm:text-base px-8 py-3.5 min-h-[48px] inline-flex items-center justify-center gap-2.5 shadow-xl shadow-teal-500/20 font-heading font-extrabold rounded-2xl active:scale-95 transition-all w-full sm:w-auto"
              >
                <span>Browse All Free Courses</span>
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
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>

            {/* Value Guarantees */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-body pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                100% Free Forever
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                Zero Commercial Ads
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Instant Auto-Sync
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
