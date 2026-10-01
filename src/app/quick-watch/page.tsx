"use client";

// ---------------------------------------------------------------------------
// Quick Watch — Zero-Data-Store Instant Distraction-Free YouTube Player
// Allows users to paste any video link and watch immediately with zero
// login required, zero database storing, zero algorithm interruptions.
// ---------------------------------------------------------------------------
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

function extractYouTubeId(urlOrId: string): string | null {
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const regExp =
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);
  return match ? match[1]! : null;
}

export default function QuickWatchPage() {
  const [urlInput, setUrlInput] = useState("");
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [cinemaMode, setCinemaMode] = useState(false);
  const [notes, setNotes] = useState("");
  const [copiedNotification, setCopiedNotification] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load local scratch notes whenever active video changes
  useEffect(() => {
    if (!activeVideoId) return;
    try {
      const saved =
        localStorage.getItem(`vidcura_quick_notes_${activeVideoId}`) ||
        localStorage.getItem(`learnloom_quick_notes_${activeVideoId}`);
      if (saved) {
        setNotes(saved);
      } else {
        setNotes("");
      }
    } catch {
      // LocalStorage fallback
    }
  }, [activeVideoId]);

  // Save scratch notes in client-side localStorage only (no database storing)
  const handleNotesChange = (text: string) => {
    setNotes(text);
    if (!activeVideoId) return;
    try {
      localStorage.setItem(`vidcura_quick_notes_${activeVideoId}`, text);
    } catch {
      // LocalStorage fallback
    }
  };

  const handleStartWatching = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    if (!urlInput.trim()) {
      setErrorMessage("Please paste a YouTube link or 11-character video ID first.");
      return;
    }
    const id = extractYouTubeId(urlInput);
    if (!id) {
      setErrorMessage(
        "Could not detect a valid YouTube video link. Please check the URL and try again."
      );
      return;
    }
    setActiveVideoId(id);
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        setUrlInput(text);
        const id = extractYouTubeId(text);
        if (id) {
          setActiveVideoId(id);
          setErrorMessage("");
        }
      }
    } catch {
      // Clipboard permission denied or unsupported
    }
  };

  const handleClear = () => {
    setUrlInput("");
    setActiveVideoId(null);
    setErrorMessage("");
    setCinemaMode(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
  };

  return (
    <div
      className={`min-h-[calc(100vh-4rem)] transition-colors duration-300 ${
        cinemaMode ? "bg-black text-white" : "bg-background text-foreground"
      }`}
    >
      <div className="container-page py-8 max-w-6xl">
        {/* Header Title & Pitch */}
        {!cinemaMode && (
          <div className="mb-6 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-heading font-bold mb-3 border border-teal-500/20">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>Private One-Time Player · Zero Data Stored</span>
            </div>
            <h1 className="font-heading font-black text-3xl sm:text-4xl tracking-tight text-foreground">
              Quick Watch
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground font-body mt-2 leading-relaxed">
              Paste any YouTube video link to watch instantly in a distraction-free theatre player.
              No login required, no tracking, and no data is stored on our servers.
            </p>
          </div>
        )}

        {/* Video Link Input Bar */}
        <div
          className={`mb-8 max-w-3xl mx-auto ${cinemaMode ? "opacity-60 hover:opacity-100 transition-opacity" : ""}`}
        >
          <form
            onSubmit={handleStartWatching}
            className="clay-card p-2 sm:p-2.5 bg-card border-2 border-border shadow-lg rounded-2xl flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="relative flex-1 w-full">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste YouTube link (e.g. https://www.youtube.com/watch?v=... or youtu.be/...)"
                className="w-full bg-transparent pl-10 pr-10 py-3 text-base sm:text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[44px]"
                aria-label="YouTube video URL"
              />
              {urlInput && (
                <button
                  type="button"
                  onClick={() => setUrlInput("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Clear input"
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
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="18" x2="18" y2="6" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="btn-ghost text-xs px-4 py-2.5 min-h-[44px] flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5"
                title="Paste from clipboard"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
                <span>Paste</span>
              </button>

              <button
                type="submit"
                className="btn-primary text-xs px-5 py-2.5 min-h-[44px] flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 shadow-md active:scale-95"
              >
                <span>Watch Now</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </button>
            </div>
          </form>

          {errorMessage && (
            <p
              className="text-destructive text-xs font-body mt-2.5 px-3 flex items-center gap-1.5"
              role="alert"
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
                aria-hidden="true"
                className="flex-shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </p>
          )}
        </div>

        {/* Video Player Display */}
        {activeVideoId ? (
          <div className="space-y-6">
            {/* Control Bar above Player */}
            <div className="flex items-center justify-between gap-3 flex-wrap pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <span className="text-xs font-heading font-bold text-foreground">
                  Distraction-Free Mode Active
                </span>
                <span className="text-[11px] text-muted-foreground font-body hidden sm:inline">
                  (Zero data stored)
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Cinema Mode Toggle */}
                <button
                  type="button"
                  onClick={() => setCinemaMode((c) => !c)}
                  className={`text-xs px-3.5 py-2 min-h-[44px] rounded-xl border transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    cinemaMode ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "btn-ghost"
                  }`}
                  title="Dim background lights"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                  <span>{cinemaMode ? "Lights On" : "Cinema Dim"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareLink}
                  className="btn-ghost text-xs px-3.5 py-2 min-h-[44px] inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Copy video link"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  <span>{copiedNotification ? "Link Copied!" : "Share"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  className="btn-ghost text-xs px-3.5 py-2 min-h-[44px] cursor-pointer active:scale-95"
                  title="Close current video and paste another"
                >
                  Close & New
                </button>
              </div>
            </div>

            {/* Theatre Video Frame */}
            <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-black shadow-2xl border border-border/80">
              <iframe
                key={activeVideoId}
                src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0&iv_load_policy=3&fs=1&playsinline=1`}
                title="Distraction-Free Video Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                loading="eager"
              />
            </div>

            {/* Bottom Actions & Private Local Scratchpad */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
              <div className="lg:col-span-2 clay-card p-5 bg-card border border-border rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    <h3 className="font-heading font-bold text-sm text-foreground">
                      Private Study Scratchpad
                    </h3>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-body">
                    Saved in browser memory only · Private to you
                  </span>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Take private notes while watching… (e.g. 02:45 Key concept on algorithms)"
                  rows={5}
                  className="textarea w-full text-xs font-body leading-relaxed"
                />
              </div>

              <div className="clay-card p-5 bg-card border border-border rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-heading font-bold text-sm text-foreground mb-2">
                    Why Quick Watch?
                  </h3>
                  <ul className="text-xs text-muted-foreground font-body space-y-2 leading-relaxed">
                    <li className="flex items-start gap-1.5">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-emerald-500 flex-shrink-0 mt-0.5"
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>No algorithm recommendations or sidebar rabbit holes.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-emerald-500 flex-shrink-0 mt-0.5"
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Zero database storage — nothing is logged to Firestore.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-emerald-500 flex-shrink-0 mt-0.5"
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Pure distraction-free theatre view for maximum focus.</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Like Vidcura?</span>
                  <Link
                    href="/explore"
                    className="text-xs font-heading font-bold text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Browse Full Courses →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty / Suggestion state */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto mt-6">
            {[
              {
                icon: (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0F766E"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ),
                title: "1. Paste Link",
                desc: "Paste any YouTube video or shorts link into the box above.",
              },
              {
                icon: (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#C2410C"
                    strokeWidth="2"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                ),
                title: "2. Watch Instantly",
                desc: "Starts immediately in high-definition without comment noise or suggested traps.",
              },
              {
                icon: (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0F766E"
                    strokeWidth="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ),
                title: "3. Completely Private",
                desc: "Zero records stored in database. Your session is 100% private to your browser.",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="clay-card p-6 bg-card border border-border text-center rounded-2xl shadow-sm hover:border-primary-400/60 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center mx-auto mb-3">
                  {icon}
                </div>
                <h3 className="font-heading font-bold text-sm text-foreground mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
