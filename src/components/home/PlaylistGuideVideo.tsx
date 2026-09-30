"use client";

import { useState, useRef } from "react";
import Link from "next/link";

export function PlaylistGuideVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

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

  return (
    <section className="py-12 sm:py-20 relative" aria-labelledby="guide-title">
      <div className="container-page">
        <div className="clay-card p-6 sm:p-10 bg-card/80 backdrop-blur-xl border border-border/80 rounded-3xl shadow-2xl max-w-5xl mx-auto overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Compact Sleek Video Window */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl overflow-hidden border border-border/80 bg-neutral-950 shadow-2xl">
                {/* macOS Mock Header Bar */}
                <div className="px-4 py-2.5 bg-neutral-900/90 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="px-3 py-0.5 rounded-md bg-white/5 text-[11px] text-neutral-400 font-mono tracking-tight">
                    learnloom.app/quick-watch
                  </div>
                  <div className="text-[10px] font-heading font-medium text-neutral-400 uppercase tracking-wider">
                    Demo
                  </div>
                </div>

                {/* Video Container */}
                <div
                  onClick={togglePlay}
                  className="group relative aspect-video w-full bg-black cursor-pointer overflow-hidden"
                  role="region"
                  aria-label="15-second walkthrough: How to paste and learn"
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

                  {/* Play / Pause Overlay Button */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[1px] transition-opacity duration-200 ${
                      isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlay();
                      }}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary-600/95 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-transform min-h-[48px] min-w-[48px]"
                      aria-label={isPlaying ? "Pause walkthrough" : "Play walkthrough"}
                    >
                      {isPlaying ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="4" width="4" height="16" rx="1" />
                          <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Controls Pill */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white/90 text-[11px] font-heading font-medium">
                      <span
                        className={`w-2 h-2 rounded-full ${isPlaying ? "bg-emerald-400 animate-pulse" : "bg-neutral-400"}`}
                      />
                      <span>{isPlaying ? "Playing Walkthrough" : "Click to Play Demo"}</span>
                    </div>

                    <button
                      type="button"
                      onClick={toggleMute}
                      className="p-2 min-w-[36px] min-h-[36px] rounded-full bg-black/70 backdrop-blur-md text-white hover:text-primary-300 transition-colors flex items-center justify-center"
                      aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                    >
                      {isMuted ? (
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
                      ) : (
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
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Clean, Crisp Step Guide */}
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-heading font-bold mb-4 border border-primary-200 dark:border-primary-800">
                <span>⚡ Instant Setup</span>
              </div>

              <h2
                id="guide-title"
                className="font-heading font-extrabold text-2xl sm:text-3xl text-foreground mb-3 leading-snug tracking-tight"
              >
                Copy. Paste. <span className="text-primary-600 dark:text-primary-400">Master.</span>
              </h2>

              <p className="font-body text-sm text-muted-foreground mb-6 leading-relaxed">
                Turn any video series or lecture collection into a clean, distraction-free syllabus
                in three effortless steps:
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-primary-100 dark:bg-primary-950/80 text-primary-700 dark:text-primary-300 font-heading font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-primary-200/50">
                    1
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-foreground">
                      Copy Any Playlist Link
                    </h3>
                    <p className="text-xs text-muted-foreground font-body mt-0.5 leading-relaxed">
                      Copy the share link or browser URL of any online lecture collection.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-primary-100 dark:bg-primary-950/80 text-primary-700 dark:text-primary-300 font-heading font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-primary-200/50">
                    2
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-foreground">
                      Paste into LearnLoom
                    </h3>
                    <p className="text-xs text-muted-foreground font-body mt-0.5 leading-relaxed">
                      Drop the link into Quick Watch or Course Studio. Modules load instantly.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-primary-100 dark:bg-primary-950/80 text-primary-700 dark:text-primary-300 font-heading font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-primary-200/50">
                    3
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-foreground">
                      Learn Without Distractions
                    </h3>
                    <p className="text-xs text-muted-foreground font-body mt-0.5 leading-relaxed">
                      Track finished lessons, take notes, and enjoy automatic next-video autoplay.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/quick-watch"
                  className="btn-primary text-xs sm:text-sm px-5 py-2.5 min-h-[44px] inline-flex items-center gap-2 shadow-sm"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>Try Quick Watch</span>
                </Link>
                <Link
                  href="/create"
                  className="btn-ghost text-xs sm:text-sm px-5 py-2.5 min-h-[44px] inline-flex items-center gap-1.5 border border-border hover:bg-muted"
                >
                  <span>Build a Course →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
