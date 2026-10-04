"use client";

// ---------------------------------------------------------------------------
// VeySkill Quick Watch — Zero-Data-Store Distraction-Free Theatre Player
// Seamlessly plays single videos and multi-video playlists in distraction-free cinema mode.
// Zero login required, zero tracking, zero algorithmic interruptions.
// ---------------------------------------------------------------------------
import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { extractYouTubeId, extractYouTubePlaylistId, youtubeThumbnail } from "@/lib/constants";

interface QuickLesson {
  videoId: string;
  title: string;
  thumbnailUrl: string;
}

interface QuickPlaylist {
  playlistId: string;
  title: string;
  channelTitle?: string;
  itemCount: number;
  lessons: QuickLesson[];
}

interface HistoryItem {
  id: string;
  type: "video" | "playlist";
  title: string;
  channel?: string;
  thumbnailUrl: string;
  timestamp: number;
  totalLessons?: number;
}

const CURATED_DEMOS = [
  {
    title: "Python for Beginners — Full Course in 1 Hour",
    channel: "Programming with Mosh",
    url: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
    videoId: "kqtD5dpn9C8",
    badge: "Programming",
    tag: "Python 3",
  },
  {
    title: "Next.js 15 Full Tutorial for Beginners",
    channel: "freeCodeCamp.org",
    url: "https://www.youtube.com/watch?v=wm5gMKuwSYk",
    videoId: "wm5gMKuwSYk",
    badge: "Web Dev",
    tag: "Next.js 15",
  },
  {
    title: "Harvard CS50: Intro to Computer Science (Lecture 0)",
    channel: "CS50",
    url: "https://www.youtube.com/watch?v=LfaMVlDaQ24",
    videoId: "LfaMVlDaQ24",
    badge: "Computer Science",
    tag: "Algorithms",
  },
  {
    title: "Figma UI/UX Design Essentials Course",
    channel: "Envato Tuts+",
    url: "https://www.youtube.com/watch?v=c9Wg6Cb_YlU",
    videoId: "c9Wg6Cb_YlU",
    badge: "Design",
    tag: "Figma UI",
  },
];

function QuickWatchContent() {
  const searchParams = useSearchParams();

  const [urlInput, setUrlInput] = useState("");
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [activeVideoTitle, setActiveVideoTitle] = useState("");
  const [activeChannel, setActiveChannel] = useState("");
  const [playlist, setPlaylist] = useState<QuickPlaylist | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [cinemaMode, setCinemaMode] = useState(false);
  const [autoNext, setAutoNext] = useState(true);
  const [notes, setNotes] = useState("");
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [copiedNotesNotification, setCopiedNotesNotification] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [lessonSearchQuery, setLessonSearchQuery] = useState("");
  const [showCurriculumDrawer, setShowCurriculumDrawer] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const stored = localStorage.getItem("veyskill_quickwatch_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // LocalStorage unavailable
    }
  }, []);

  const saveToHistory = useCallback((item: HistoryItem) => {
    try {
      const stored = localStorage.getItem("veyskill_quickwatch_history");
      let list: HistoryItem[] = stored ? JSON.parse(stored) : [];
      // Remove duplicate
      list = list.filter((h) => h.id !== item.id);
      list.unshift(item);
      const trimmed = list.slice(0, 8);
      setHistory(trimmed);
      localStorage.setItem("veyskill_quickwatch_history", JSON.stringify(trimmed));
    } catch {
      // LocalStorage unavailable
    }
  }, []);

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("veyskill_quickwatch_history");
    } catch {
      // LocalStorage unavailable
    }
  };

  // Load notes whenever active video changes
  useEffect(() => {
    if (!activeVideoId) {
      setNotes("");
      return;
    }
    try {
      const saved =
        localStorage.getItem(`veyskill_quick_notes_${activeVideoId}`) ||
        localStorage.getItem(`learnloom_quick_notes_${activeVideoId}`);
      setNotes(saved || "");
    } catch {
      setNotes("");
    }
  }, [activeVideoId]);

  const handleNotesChange = (text: string) => {
    setNotes(text);
    if (!activeVideoId) return;
    try {
      localStorage.setItem(`veyskill_quick_notes_${activeVideoId}`, text);
    } catch {
      // LocalStorage fallback
    }
  };

  const insertTimestamp = (timestampText: string) => {
    const textarea = notesTextareaRef.current;
    const toInsert = `\n${timestampText} - `;
    if (!textarea) {
      handleNotesChange(notes + toInsert);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const updated = notes.substring(0, start) + toInsert + notes.substring(end);
    handleNotesChange(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + toInsert.length, start + toInsert.length);
    }, 10);
  };

  const copyNotesToClipboard = () => {
    if (!notes.trim()) return;
    navigator.clipboard?.writeText(notes);
    setCopiedNotesNotification(true);
    setTimeout(() => setCopiedNotesNotification(false), 2000);
  };

  const downloadNotesFile = () => {
    if (!notes.trim()) return;
    const titleSlug = (activeVideoTitle || "quick-watch-notes")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 40);
    const content = `# Study Notes: ${activeVideoTitle || "Video Lecture"}\n${activeChannel ? `Channel: ${activeChannel}\n` : ""}Date: ${new Date().toLocaleDateString()}\n\n---\n\n${notes}`;
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${titleSlug}-notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Main loader: handles both playlists and individual video URLs
  const loadMedia = useCallback(
    async (rawInput: string, preferVideoId?: string) => {
      const trimmed = rawInput.trim();
      if (!trimmed) return;

      setIsLoading(true);
      setErrorMessage("");

      const playlistId = extractYouTubePlaylistId(trimmed);

      // ── Scenario A: Playlist Link ─────────────────────────────────────────
      if (playlistId) {
        try {
          const res = await fetch(`/api/youtube/playlist?url=${encodeURIComponent(trimmed)}`);
          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "Failed to load playlist.");
          }

          if (!data.videos || data.videos.length === 0) {
            throw new Error("No playable videos were found in this playlist.");
          }

          const parsedPlaylist: QuickPlaylist = {
            playlistId: data.playlistId || playlistId,
            title: data.title || "YouTube Playlist",
            channelTitle: data.channelTitle || "YouTube Creator",
            itemCount: data.totalVideos || data.videos.length,
            lessons: data.videos,
          };

          setPlaylist(parsedPlaylist);

          // Find preferred or initial lesson
          let startIndex = 0;
          if (preferVideoId) {
            const idx = parsedPlaylist.lessons.findIndex((l) => l.videoId === preferVideoId);
            if (idx !== -1) startIndex = idx;
          } else {
            const inlineVideoId = extractYouTubeId(trimmed);
            if (inlineVideoId) {
              const idx = parsedPlaylist.lessons.findIndex((l) => l.videoId === inlineVideoId);
              if (idx !== -1) startIndex = idx;
            }
          }

          setCurrentLessonIndex(startIndex);
          const initialLesson = parsedPlaylist.lessons[startIndex];
          if (initialLesson) {
            setActiveVideoId(initialLesson.videoId);
            setActiveVideoTitle(initialLesson.title);
            setActiveChannel(parsedPlaylist.channelTitle || "");
          }

          // Save to local history
          saveToHistory({
            id: parsedPlaylist.playlistId,
            type: "playlist",
            title: parsedPlaylist.title,
            channel: parsedPlaylist.channelTitle,
            thumbnailUrl:
              initialLesson?.thumbnailUrl || youtubeThumbnail(initialLesson?.videoId || ""),
            timestamp: Date.now(),
            totalLessons: parsedPlaylist.itemCount,
          });

          // Sync URL params without full page reload
          if (typeof window !== "undefined") {
            const nextUrl = `/quick-watch?list=${parsedPlaylist.playlistId}&v=${initialLesson?.videoId || ""}`;
            window.history.replaceState(null, "", nextUrl);
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Unable to load playlist.";
          setErrorMessage(msg);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // ── Scenario B: Single Video Link ─────────────────────────────────────
      const videoId = extractYouTubeId(trimmed);
      if (videoId) {
        setPlaylist(null);
        setActiveVideoId(videoId);
        setActiveVideoTitle("Loading video information…");
        setActiveChannel("");

        // Fetch oEmbed metadata for real title & creator
        fetch(`/api/oembed?url=https://www.youtube.com/watch?v=${videoId}`)
          .then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              setActiveVideoTitle(data.title || "YouTube Video");
              setActiveChannel(data.channelName || data.author_name || "");

              saveToHistory({
                id: videoId,
                type: "video",
                title: data.title || "YouTube Video",
                channel: data.channelName || data.author_name || "",
                thumbnailUrl: data.thumbnailUrl || youtubeThumbnail(videoId),
                timestamp: Date.now(),
              });
            } else {
              setActiveVideoTitle("Video Lecture");
            }
          })
          .catch(() => {
            setActiveVideoTitle("Video Lecture");
          })
          .finally(() => {
            setIsLoading(false);
          });

        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", `/quick-watch?v=${videoId}`);
        }
        return;
      }

      setIsLoading(false);
      setErrorMessage(
        "Could not detect a valid YouTube video or playlist link. Please verify the URL and try again."
      );
    },
    [saveToHistory]
  );

  // Synchronize from searchParams on mount
  useEffect(() => {
    const listParam = searchParams.get("list");
    const vParam = searchParams.get("v");
    const urlParam = searchParams.get("url");

    if (listParam) {
      setUrlInput(`https://www.youtube.com/playlist?list=${listParam}`);
      loadMedia(`https://www.youtube.com/playlist?list=${listParam}`, vParam || undefined);
    } else if (vParam) {
      setUrlInput(`https://www.youtube.com/watch?v=${vParam}`);
      loadMedia(`https://www.youtube.com/watch?v=${vParam}`);
    } else if (urlParam) {
      setUrlInput(urlParam);
      loadMedia(urlParam);
    }
  }, [searchParams, loadMedia]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setErrorMessage("Please paste a YouTube playlist or video link first.");
      return;
    }
    loadMedia(urlInput);
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrlInput(text);
          loadMedia(text);
        }
      }
    } catch {
      inputRef.current?.focus();
    }
  };

  const handleSelectLesson = (index: number) => {
    if (!playlist || !playlist.lessons[index]) return;
    const lesson = playlist.lessons[index];
    setCurrentLessonIndex(index);
    setActiveVideoId(lesson.videoId);
    setActiveVideoTitle(lesson.title);
    if (typeof window !== "undefined") {
      window.history.replaceState(
        null,
        "",
        `/quick-watch?list=${playlist.playlistId}&v=${lesson.videoId}`
      );
    }
  };

  const handleNextLesson = () => {
    if (!playlist) return;
    if (currentLessonIndex < playlist.lessons.length - 1) {
      handleSelectLesson(currentLessonIndex + 1);
    }
  };

  const handlePrevLesson = () => {
    if (!playlist) return;
    if (currentLessonIndex > 0) {
      handleSelectLesson(currentLessonIndex - 1);
    }
  };

  const handleClear = () => {
    setUrlInput("");
    setActiveVideoId(null);
    setActiveVideoTitle("");
    setActiveChannel("");
    setPlaylist(null);
    setErrorMessage("");
    setCinemaMode(false);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/quick-watch");
    }
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

  // Filter lessons for playlist drawer
  const filteredLessons = playlist?.lessons.filter((l) =>
    l.title.toLowerCase().includes(lessonSearchQuery.toLowerCase())
  );

  return (
    <div
      className={`min-h-[calc(100vh-4rem)] transition-colors duration-300 ${
        cinemaMode ? "bg-[#09090b] text-white" : "bg-background text-foreground"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* ── Top Header & Mission Statement ─────────────────────────────────── */}
        {!cinemaMode && (
          <div className="mb-8 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-heading font-bold mb-3 border border-teal-500/20 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>Zero Ads · Instant Playlist &amp; Video Cinema Mode</span>
            </div>

            <h1 className="font-heading font-black text-3xl sm:text-5xl tracking-tight text-foreground">
              Quick Watch
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground font-body mt-3 leading-relaxed max-w-2xl mx-auto">
              Paste any YouTube video or multi-lesson playlist link. Experience pure cinema focus
              with auto-next lesson progression, private scratchpad notes, and zero algorithmic
              distractions.
            </p>
          </div>
        )}

        {/* ── Universal Input Bar (Video OR Playlist) ────────────────────────── */}
        <div
          className={`mb-10 max-w-3xl mx-auto ${cinemaMode ? "opacity-75 hover:opacity-100 transition-opacity" : ""}`}
        >
          <form
            onSubmit={handleFormSubmit}
            className="p-2 sm:p-2.5 bg-card/90 backdrop-blur-md border-2 border-border shadow-xl rounded-2xl flex flex-col sm:flex-row items-center gap-2 hover:border-teal-500/60 transition-all"
          >
            <div className="relative flex-1 w-full">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-600 dark:text-teal-400 pointer-events-none"
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

              <input
                ref={inputRef}
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste any YouTube playlist or video link (e.g. playlist?list=... or watch?v=...)"
                className="w-full bg-transparent pl-11 pr-10 py-3 text-sm sm:text-base font-body text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[46px]"
                aria-label="YouTube video or playlist link"
              />

              {urlInput && (
                <button
                  type="button"
                  onClick={() => setUrlInput("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-xs text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
                  aria-label="Clear input"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
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
                className="px-4 py-2.5 min-h-[44px] flex-1 sm:flex-initial rounded-xl bg-muted/60 hover:bg-muted border border-border text-foreground text-xs font-heading font-bold inline-flex items-center justify-center gap-1.5 transition-colors"
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
                disabled={isLoading}
                className="btn-primary text-xs sm:text-sm px-6 py-2.5 min-h-[44px] flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 shadow-md active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Loading…</span>
                  </>
                ) : (
                  <>
                    <span>Watch Now</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          {errorMessage && (
            <div
              className="mt-3 p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-body flex items-start gap-2 shadow-sm animate-fade-in"
              role="alert"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="flex-shrink-0 mt-0.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* ── Active Player Experience ───────────────────────────────────────── */}
        {activeVideoId ? (
          <div className="space-y-6">
            {/* Top Player Action Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                  <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    {playlist ? "Playlist Track" : "Distraction-Free Cinema"}
                  </span>
                  {playlist && (
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-muted border border-border text-foreground">
                      Lesson {currentLessonIndex + 1} of {playlist.lessons.length}
                    </span>
                  )}
                  <span className="text-[11px] text-muted-foreground font-body">
                    · Zero Data Stored
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-heading font-bold text-foreground line-clamp-1">
                  {activeVideoTitle || "YouTube Video"}
                </h2>

                {activeChannel && (
                  <p className="text-xs text-muted-foreground font-body">
                    Creator: <span className="text-foreground font-medium">{activeChannel}</span>
                  </p>
                )}
              </div>

              {/* Utility Toggles */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Playlist Drawer Toggle */}
                {playlist && (
                  <button
                    type="button"
                    onClick={() => setShowCurriculumDrawer((s) => !s)}
                    className="px-3 py-1.5 min-h-[38px] rounded-xl bg-card border border-border text-foreground text-xs font-heading font-bold inline-flex items-center gap-1.5 hover:bg-muted transition-colors shadow-sm"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                    <span>{showCurriculumDrawer ? "Hide Syllabus" : "View Syllabus"}</span>
                  </button>
                )}

                {/* Cinema Mode Toggle */}
                <button
                  type="button"
                  onClick={() => setCinemaMode((c) => !c)}
                  className={`text-xs px-3 py-1.5 min-h-[38px] rounded-xl border transition-all inline-flex items-center gap-1.5 shadow-sm font-heading font-bold ${
                    cinemaMode
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-card border-border text-foreground hover:bg-muted"
                  }`}
                  title="Toggle cinema dimmed mode"
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
                  </svg>
                  <span>{cinemaMode ? "Lights On" : "Cinema Mode"}</span>
                </button>

                {/* Share Link */}
                <button
                  type="button"
                  onClick={handleShareLink}
                  className="px-3 py-1.5 min-h-[38px] rounded-xl bg-card border border-border text-foreground text-xs font-heading font-bold inline-flex items-center gap-1.5 hover:bg-muted transition-colors shadow-sm"
                  title="Copy shareable link"
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
                  <span>{copiedNotification ? "Copied!" : "Share"}</span>
                </button>

                {/* Close & New */}
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-1.5 min-h-[38px] rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground text-xs font-heading font-medium inline-flex items-center gap-1 hover:bg-muted transition-colors"
                >
                  <span>Close</span>
                </button>
              </div>
            </div>

            {/* Theatre Video Frame with Ambient Halo */}
            <div className="relative group">
              <div
                className={`absolute -inset-2 rounded-3xl opacity-40 blur-2xl transition-opacity pointer-events-none -z-10 ${
                  cinemaMode
                    ? "bg-gradient-to-r from-teal-500/30 via-primary-500/20 to-amber-500/30 opacity-75"
                    : "bg-teal-500/10"
                }`}
              />

              <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10">
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
            </div>

            {/* Playlist Progression Bar & Controls (if playlist) */}
            {playlist && (
              <div className="p-4 rounded-2xl bg-card/90 border border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePrevLesson}
                    disabled={currentLessonIndex === 0}
                    className="px-3.5 py-2 rounded-xl bg-muted border border-border text-xs font-heading font-bold text-foreground disabled:opacity-40 inline-flex items-center gap-1.5 hover:bg-muted/80 transition-colors"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    <span>Previous</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextLesson}
                    disabled={currentLessonIndex >= playlist.lessons.length - 1}
                    className="btn-primary text-xs px-4 py-2 rounded-xl inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Next Lesson</span>
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>

                  <div className="hidden md:flex items-center gap-2 text-xs font-body text-muted-foreground border-l border-border pl-3">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoNext}
                        onChange={(e) => setAutoNext(e.target.checked)}
                        className="rounded border-border text-teal-600 focus:ring-teal-500"
                      />
                      <span>Auto-Next Advance</span>
                    </label>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                    {Math.round(((currentLessonIndex + 1) / playlist.lessons.length) * 100)}% Track
                    Completed
                  </span>
                  <div className="w-full sm:w-48 h-1.5 rounded-full bg-muted mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-teal-500 transition-all duration-300"
                      style={{
                        width: `${((currentLessonIndex + 1) / playlist.lessons.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Two-Column Bottom Workspace: Scratchpad & Syllabus ──────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              {/* Left Column: Private Timestamped Study Scratchpad */}
              <div
                className={`${playlist && showCurriculumDrawer ? "lg:col-span-7" : "lg:col-span-8"} space-y-4`}
              >
                <div className="p-5 sm:p-6 bg-card border border-border rounded-2xl sm:rounded-3xl shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-sm text-foreground">
                          Private Study Scratchpad
                        </h3>
                        <p className="text-[11px] text-muted-foreground font-body">
                          Saved locally in your browser · Zero server storage
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={copyNotesToClipboard}
                        className="px-2.5 py-1 text-xs font-heading font-bold rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors inline-flex items-center gap-1"
                        title="Copy all notes"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        <span>{copiedNotesNotification ? "Copied!" : "Copy"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={downloadNotesFile}
                        className="px-2.5 py-1 text-xs font-heading font-bold rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors inline-flex items-center gap-1"
                        title="Download Markdown file"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        <span>Export .md</span>
                      </button>
                    </div>
                  </div>

                  {/* Timestamp quick-insert helpers */}
                  <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                    <span className="font-heading font-bold text-[11px]">Quick Timestamp:</span>
                    {["01:00", "05:00", "10:00", "15:00", "20:00"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => insertTimestamp(`[${t}]`)}
                        className="px-2 py-0.5 rounded-md bg-muted/60 hover:bg-teal-500/10 hover:text-teal-600 dark:hover:text-teal-400 font-mono text-[11px] border border-border transition-colors"
                      >
                        + [{t}]
                      </button>
                    ))}
                  </div>

                  <textarea
                    ref={notesTextareaRef}
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Take notes while watching… Click the timestamp chips above or write your own notes (e.g. [03:45] Key algorithm insight)."
                    rows={6}
                    className="w-full p-3.5 rounded-xl bg-muted/30 border border-border text-xs sm:text-sm font-body leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-body">
                    <span>{notes.length} characters · Auto-saved to device</span>
                    {notes && (
                      <button
                        type="button"
                        onClick={() => handleNotesChange("")}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        Clear scratchpad
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Playlist Syllabus OR Focus Highlights */}
              <div
                className={`${playlist && showCurriculumDrawer ? "lg:col-span-5" : "lg:col-span-4"} space-y-4`}
              >
                {playlist && showCurriculumDrawer ? (
                  /* Playlist Curriculum Sidebar */
                  <div className="p-5 bg-card border border-border rounded-2xl sm:rounded-3xl shadow-sm space-y-3 flex flex-col max-h-[480px]">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-bold text-sm text-foreground">
                        Curriculum Syllabus ({playlist.lessons.length})
                      </h3>
                      <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-bold uppercase">
                        Interactive
                      </span>
                    </div>

                    {/* Lesson Filter */}
                    <div className="relative">
                      <input
                        type="text"
                        value={lessonSearchQuery}
                        onChange={(e) => setLessonSearchQuery(e.target.value)}
                        placeholder="Search modules in playlist…"
                        className="w-full text-xs py-2 pl-8 pr-3 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                      <svg
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </div>

                    {/* Scrollable Lesson Items */}
                    <div className="overflow-y-auto space-y-1.5 flex-1 pr-1 divide-y divide-border/30">
                      {filteredLessons && filteredLessons.length > 0 ? (
                        filteredLessons.map((item) => {
                          const originalIndex = playlist.lessons.findIndex(
                            (l) => l.videoId === item.videoId
                          );
                          const isActive = originalIndex === currentLessonIndex;

                          return (
                            <button
                              key={item.videoId}
                              type="button"
                              onClick={() => handleSelectLesson(originalIndex)}
                              className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 pt-2.5 ${
                                isActive
                                  ? "bg-teal-500/15 border border-teal-500/30 text-teal-900 dark:text-teal-200"
                                  : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <span
                                className={`text-[11px] font-mono font-bold w-5 text-center flex-shrink-0 mt-0.5 ${
                                  isActive
                                    ? "text-teal-600 dark:text-teal-400"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {String(originalIndex + 1).padStart(2, "0")}
                              </span>

                              {/* Small Thumbnail */}
                              <div className="w-12 h-8 rounded-md overflow-hidden bg-black flex-shrink-0 border border-border/60">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={item.thumbnailUrl || youtubeThumbnail(item.videoId)}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p
                                  className={`text-xs font-heading font-medium line-clamp-2 leading-snug ${isActive ? "font-bold text-foreground" : ""}`}
                                >
                                  {item.title}
                                </p>
                              </div>

                              {isActive && (
                                <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0 mt-1.5" />
                              )}
                            </button>
                          );
                        })
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          No matching lessons found.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Single Video Study Highlights */
                  <div className="p-5 bg-card border border-border rounded-2xl sm:rounded-3xl shadow-sm space-y-4">
                    <h3 className="font-heading font-bold text-sm text-foreground">
                      Why Students Love Quick Watch
                    </h3>

                    <ul className="text-xs text-muted-foreground font-body space-y-3 leading-relaxed">
                      <li className="flex items-start gap-2">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="text-teal-600 flex-shrink-0 mt-0.5"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Zero commercial ads, preroll traps, or banner popups.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="text-teal-600 flex-shrink-0 mt-0.5"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>No algorithmic recommendations or distracting comment sections.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="text-teal-600 flex-shrink-0 mt-0.5"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Private scratchpad saved right inside your device browser.</span>
                      </li>
                    </ul>

                    {/* Keyboard Shortcuts Pill */}
                    <div className="pt-3 border-t border-border">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                        Keyboard Shortcuts
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-muted-foreground">
                        <span className="p-1 rounded bg-muted/60 text-center">
                          <kbd>Space</kbd> Play/Pause
                        </span>
                        <span className="p-1 rounded bg-muted/60 text-center">
                          <kbd>F</kbd> Fullscreen
                        </span>
                        <span className="p-1 rounded bg-muted/60 text-center">
                          <kbd>M</kbd> Mute/Unmute
                        </span>
                        <span className="p-1 rounded bg-muted/60 text-center">
                          <kbd>J</kbd> / <kbd>L</kbd> 10s Seek
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bridge to Course Studio */}
                <div className="p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-teal-500/10 via-primary-500/5 to-amber-500/10 border border-teal-500/20 shadow-sm space-y-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                      Upgrade to Accredited Track
                    </span>
                    <h4 className="font-heading font-bold text-sm text-foreground mt-0.5">
                      Turn this into a full course
                    </h4>
                    <p className="text-xs text-muted-foreground font-body leading-relaxed mt-1">
                      Unlock AI-generated quizzes, 7-day habit streaks, and cryptographic completion
                      credentials.
                    </p>
                  </div>

                  <Link
                    href={`/create${playlist ? `?playlistUrl=${encodeURIComponent(`https://www.youtube.com/playlist?list=${playlist.playlistId}`)}` : `?videoUrl=${encodeURIComponent(`https://www.youtube.com/watch?v=${activeVideoId}`)}`}`}
                    className="w-full btn-primary text-xs py-2.5 min-h-[40px] inline-flex items-center justify-center gap-1.5 shadow-sm rounded-xl font-heading font-bold"
                  >
                    <span>Create Course with Quizzes</span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── Empty State: Curated Starters & Recent Sessions ─────────────── */
          <div className="space-y-12 max-w-5xl mx-auto mt-4">
            {/* Curated 1-Click Starter Masterclasses */}
            <div>
              <div className="text-center mb-6">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                  Instant Preview
                </span>
                <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-foreground mt-1">
                  Try with Popular Masterclasses
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground font-body mt-1">
                  Click any lecture below to experience immediate distraction-free cinema mode in
                  one click:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {CURATED_DEMOS.map((demo) => (
                  <button
                    key={demo.videoId}
                    type="button"
                    onClick={() => {
                      setUrlInput(demo.url);
                      loadMedia(demo.url);
                    }}
                    className="p-3.5 rounded-2xl bg-card border border-border hover:border-teal-500 hover:shadow-lg active:scale-[0.98] transition-all text-left flex flex-col justify-between group h-full"
                  >
                    <div>
                      {/* Thumbnail Preview */}
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-black mb-3 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={youtubeThumbnail(demo.videoId)}
                          alt={demo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-teal-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full">
                          {demo.badge}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {demo.tag}
                        </span>
                      </div>

                      <h3 className="font-heading font-bold text-xs sm:text-sm text-foreground line-clamp-2 leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {demo.title}
                      </h3>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground font-body">
                      <span className="truncate">{demo.channel}</span>
                      <span className="text-teal-600 dark:text-teal-400 font-heading font-bold">
                        Play →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Sessions (100% Private to Browser) */}
            {history.length > 0 && (
              <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-teal-600"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <h3 className="font-heading font-bold text-sm sm:text-base text-foreground">
                      Recent Quick Watch Sessions
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={clearHistory}
                    className="text-xs text-muted-foreground hover:text-destructive font-body transition-colors"
                  >
                    Clear History
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        const targetUrl =
                          item.type === "playlist"
                            ? `https://www.youtube.com/playlist?list=${item.id}`
                            : `https://www.youtube.com/watch?v=${item.id}`;
                        setUrlInput(targetUrl);
                        loadMedia(targetUrl);
                      }}
                      className="p-3 rounded-xl bg-muted/40 hover:bg-muted border border-border/80 text-left transition-all group flex items-start gap-2.5"
                    >
                      <div className="w-16 h-11 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.thumbnailUrl || youtubeThumbnail(item.id)}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-mono uppercase font-bold text-teal-600 dark:text-teal-400 block">
                          {item.type === "playlist"
                            ? `${item.totalLessons || ""} Playlist`
                            : "Video"}
                        </span>
                        <p className="text-xs font-heading font-bold text-foreground line-clamp-1 group-hover:text-teal-600 transition-colors">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-body truncate mt-0.5">
                          {item.channel || "YouTube"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3 Pillars of Quick Watch */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div className="p-6 bg-card border border-border text-center rounded-2xl shadow-sm hover:border-teal-500/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-3 border border-teal-500/20">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <h4 className="font-heading font-bold text-sm text-foreground mb-1">
                  1. Multi-Track Support
                </h4>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                  Paste either individual video links or complete YouTube playlist URLs. Curricula
                  load instantly.
                </p>
              </div>

              <div className="p-6 bg-card border border-border text-center rounded-2xl shadow-sm hover:border-teal-500/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-500/20">
                  <svg
                    width="22"
                    height="22"
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
                  </svg>
                </div>
                <h4 className="font-heading font-bold text-sm text-foreground mb-1">
                  2. Pure Cinema Mode
                </h4>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                  Zero ads, zero algorithmic rabbit holes, and dimmed cinema lights for
                  uninterrupted study sessions.
                </p>
              </div>

              <div className="p-6 bg-card border border-border text-center rounded-2xl shadow-sm hover:border-teal-500/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h4 className="font-heading font-bold text-sm text-foreground mb-1">
                  3. 100% Client-Side Privacy
                </h4>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                  No database tracking, no cookies, and no logins. Notes and watch history stay
                  completely on your device.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuickWatchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-body">
            <svg className="animate-spin h-5 w-5 text-teal-600" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Loading Quick Watch…</span>
          </div>
        </div>
      }
    >
      <QuickWatchContent />
    </Suspense>
  );
}
