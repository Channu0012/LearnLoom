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
    <section
      className="py-12 sm:py-16 bg-gradient-to-b from-card to-background border-b border-border/80"
      aria-labelledby="playlist-guide-heading"
    >
      <div className="container-page">
        <div className="clay-card p-6 sm:p-8 lg:p-10 bg-card/90 border border-border rounded-3xl shadow-xl max-w-5xl mx-auto overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Video Player Box */}
            <div className="lg:col-span-7">
              <div
                onClick={togglePlay}
                className="group relative aspect-video w-full rounded-2xl overflow-hidden bg-black/95 border border-border shadow-lg cursor-pointer"
                role="region"
                aria-label="Video tutorial: How to copy a YouTube playlist link"
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
                  className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity duration-200 ${
                    isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                  }`}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
                    }}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary-600/90 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform min-h-[48px] min-w-[48px]"
                    aria-label={isPlaying ? "Pause tutorial video" : "Play tutorial video"}
                  >
                    {isPlaying ? (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Bottom Video Controls Pill */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white/90 text-[11px] font-heading font-medium">
                    <span
                      className={`w-2 h-2 rounded-full ${isPlaying ? "bg-emerald-400 animate-pulse" : "bg-neutral-400"}`}
                    />
                    <span>{isPlaying ? "Playing Guide" : "Click to Play Demo"}</span>
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

            {/* Right: Step-by-Step Explanation */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-heading font-bold mb-3 self-start border border-primary-200 dark:border-primary-800">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span>Quick Video Guide</span>
              </div>

              <h2
                id="playlist-guide-heading"
                className="font-heading font-extrabold text-2xl sm:text-3xl text-foreground mb-3 leading-snug"
              >
                How to Copy &amp; Paste Any YouTube Playlist
              </h2>

              <p className="font-body text-sm text-muted-foreground mb-6 leading-relaxed">
                Watch the 15-second screen demo on the left, or follow these three simple steps to
                turn any series into a structured course:
              </p>

              <ol className="space-y-3 font-body text-xs sm:text-sm text-foreground/90 mb-6">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 font-heading font-bold text-xs flex items-center justify-center mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-foreground">Open the YouTube playlist:</strong> Go to
                    any tutorial, lecture series, or course page on YouTube.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 font-heading font-bold text-xs flex items-center justify-center mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-foreground">Copy the URL:</strong> Click{" "}
                    <em>&ldquo;Share&rdquo;</em> and copy the link, or copy the address bar
                    containing{" "}
                    <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded font-mono text-primary-600 dark:text-primary-400">
                      ?list=...
                    </code>
                    .
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 font-heading font-bold text-xs flex items-center justify-center mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-foreground">Paste &amp; Learn:</strong> Paste the link
                    into LearnLoom to instantly generate all lesson modules with zero distractions!
                  </div>
                </li>
              </ol>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/quick-watch"
                  className="btn-primary text-xs sm:text-sm px-5 py-2.5 min-h-[44px] inline-flex items-center gap-1.5"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>Try in Quick Watch</span>
                </Link>
                <Link
                  href="/create"
                  className="btn-ghost text-xs sm:text-sm px-5 py-2.5 min-h-[44px] inline-flex items-center gap-1.5 border border-border"
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
