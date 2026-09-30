"use client";

// ---------------------------------------------------------------------------
// CoursePageClient — Universal Coursera-grade interactive learning experience
// Features: Theatre player, Curriculum checklist, Study notes,
// Ad & sponsor banner, Mobile responsive syllabus, and instant progress tracking.
// ---------------------------------------------------------------------------
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  getCourse,
  getLessons,
  getProgress,
  enrollOrStartCourse,
  markLessonComplete,
  createReport,
  serializeCourse,
} from "@/lib/firestore";
import { LIMITS } from "@/lib/constants";
import type { CourseDoc, LessonDoc, SerializedCourseDoc } from "@/lib/types";
import { ShareModal } from "@/components/ui/ShareModal";
import { CourseNotes } from "@/components/courses/CourseNotes";
import { CourseAdBanner } from "@/components/ads/CourseAdBanner";
import { CourseraLoader } from "@/components/ui/CourseraLoader";
import { recordStudyActivity } from "@/lib/streak";

interface CoursePageClientProps {
  courseId: string;
  initialCourse?: SerializedCourseDoc | CourseDoc | null;
  initialLessons?: LessonDoc[] | null;
  course?: CourseDoc; // Backward-compatible prop
  lessons?: LessonDoc[]; // Backward-compatible prop
}

export function CoursePageClient({
  courseId,
  initialCourse = null,
  initialLessons = null,
  course: legacyCourse,
  lessons: legacyLessons,
}: CoursePageClientProps) {
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const [course, setCourse] = useState<SerializedCourseDoc | CourseDoc | null>(
    initialCourse ?? legacyCourse ?? null
  );
  const [lessons, setLessons] = useState<LessonDoc[]>(initialLessons ?? legacyLessons ?? []);
  const [fetching, setFetching] = useState(!initialCourse && !legacyCourse);
  const [notFoundState, setNotFoundState] = useState(false);

  // If course was not supplied by server, fetch client-side from active session / local cache
  useEffect(() => {
    if (course) return;
    let isMounted = true;
    (async () => {
      try {
        setFetching(true);
        const c = await getCourse(courseId);
        if (!isMounted) return;
        if (!c) {
          setNotFoundState(true);
          setFetching(false);
          return;
        }
        const l = await getLessons(courseId);
        if (!isMounted) return;
        setCourse(serializeCourse(c));
        setLessons(l);
      } catch {
        if (isMounted) setNotFoundState(true);
      } finally {
        if (isMounted) setFetching(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [courseId, course]);

  // Real Coursera-style loading page while resolving auth or fetching course client-side
  if (authLoading || fetching) {
    return (
      <div className="container-page py-20 max-w-4xl flex items-center justify-center">
        <CourseraLoader
          title="Loading Course Curriculum…"
          subtitle="Fetching verified video lessons, syllabus chapters, and study scratchpad"
        />
      </div>
    );
  }

  // Not found card
  if (notFoundState || !course) {
    return (
      <div className="container-page py-20 text-center max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="font-heading font-bold text-2xl mb-2 text-foreground">Course not found</h1>
        <p className="text-muted-foreground font-body text-sm mb-6 max-w-sm mx-auto">
          This course doesn&apos;t exist or hasn&apos;t been published yet.
        </p>
        <Link href="/explore" className="btn-primary">
          Explore Courses
        </Link>
      </div>
    );
  }

  const isOwner = user?.uid === course.creatorId;
  const isDraft = course.status === "draft";

  // Draft course and viewer is NOT owner (only checked after auth has loaded)
  if (isDraft && !isOwner) {
    return (
      <div className="container-page py-20 text-center max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 className="font-heading font-bold text-2xl mb-2 text-foreground">Draft Course</h1>
        <p className="text-muted-foreground font-body text-sm mb-6 max-w-sm mx-auto">
          This course is currently in draft mode and is only visible to its creator.
        </p>
        <Link href="/explore" className="btn-primary">
          Explore Courses
        </Link>
      </div>
    );
  }

  return (
    <CoursePlayerContent
      course={course}
      lessons={lessons}
      courseId={courseId}
      isOwner={isOwner}
      isDraft={isDraft}
      user={user}
      openAuthModal={openAuthModal}
    />
  );
}

// ── The Coursera-Grade Player UI ──────────────────────────────────────────

function CoursePlayerContent({
  course,
  lessons,
  courseId,
  isOwner,
  isDraft,
  user,
  openAuthModal,
}: {
  course: SerializedCourseDoc | CourseDoc;
  lessons: LessonDoc[];
  courseId: string;
  isOwner: boolean;
  isDraft: boolean;
  user: ReturnType<typeof useAuth>["user"];
  openAuthModal: (_mode?: "signin" | "signup") => void;
}) {
  const [activeLessonId, setActiveLessonId] = useState(lessons[0]?.id ?? "");
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "report">("overview");
  const [tabTransitioning, setTabTransitioning] = useState<string | null>(null);

  // Lesson Pagination State (10 lessons per page)
  const LESSONS_PER_PAGE = 10;
  const [lessonPage, setLessonPage] = useState(1);
  const totalLessonPages = Math.max(1, Math.ceil(lessons.length / LESSONS_PER_PAGE));

  // Auto-sync lesson page when active lesson changes
  useEffect(() => {
    if (!activeLessonId || lessons.length === 0) return;
    const idx = lessons.findIndex((l) => l.id === activeLessonId);
    if (idx >= 0) {
      setLessonPage(Math.floor(idx / LESSONS_PER_PAGE) + 1);
    }
  }, [activeLessonId, lessons]);

  // Enrollment & Auto-Start state
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollToast, setEnrollToast] = useState<string | null>(null);
  const [xpToast, setXpToast] = useState<{
    xp: number;
    streak: number;
    streakIncreased: boolean;
  } | null>(null);

  // Big-company low internet & buffering states
  const [isLowInternet, setIsLowInternet] = useState(false);
  const [loadingLessonId, setLoadingLessonId] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  // 3-second Auto-advance playlist countdown states
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  const [autoAdvanceNextLesson, setAutoAdvanceNextLesson] = useState<LessonDoc | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Reporting
  const [reportReason, setReportReason] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [reportError, setReportError] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  const activeLesson = lessons.find((l) => l.id === activeLessonId) ?? lessons[0];
  const activeIdx = lessons.findIndex((l) => l.id === activeLessonId);

  // Clear countdown timer when switching lessons or on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, [activeLessonId]);

  // Low-Internet Network Detection (Network Information API)
  useEffect(() => {
    if (typeof navigator !== "undefined" && "connection" in navigator) {
      const conn = (
        navigator as unknown as {
          connection?: {
            effectiveType?: string;
            saveData?: boolean;
            addEventListener?: (_event: string, _cb: () => void) => void;
            removeEventListener?: (_event: string, _cb: () => void) => void;
          };
        }
      ).connection;

      if (conn) {
        const updateConn = () => {
          const isSlow =
            conn.effectiveType === "slow-2g" ||
            conn.effectiveType === "2g" ||
            conn.effectiveType === "3g" ||
            !!conn.saveData;
          setIsLowInternet(isSlow);
        };
        updateConn();
        conn.addEventListener?.("change", updateConn);
        return () => conn.removeEventListener?.("change", updateConn);
      }
    }
  }, []);

  // Enroll or start course handler
  const handleEnrollAndStart = useCallback(
    async (shouldScroll = true) => {
      if (!user) {
        openAuthModal("signin");
        return;
      }
      setIsEnrolling(true);
      try {
        const firstLessonId = lessons[0]?.id;
        await enrollOrStartCourse(user.uid, courseId, firstLessonId);
        setIsEnrolled(true);
        if (!activeLessonId && firstLessonId) {
          setActiveLessonId(firstLessonId);
        }
        setEnrollToast("Course started! Added to your My Learning dashboard.");
        setTimeout(() => setEnrollToast(null), 5000);

        if (shouldScroll) {
          const el = document.getElementById("theatre-player");
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } catch (err) {
        console.error("Enrollment error:", err);
      } finally {
        setIsEnrolling(false);
      }
    },
    [user, courseId, lessons, activeLessonId, openAuthModal]
  );

  // Load progress on mount & auto-enroll course into My Learning automatically
  useEffect(() => {
    if (!user) {
      setIsEnrolled(false);
      return;
    }
    let isMounted = true;
    (async () => {
      try {
        const prog = await getProgress(user.uid, courseId);
        if (!isMounted) return;
        if (prog) {
          setIsEnrolled(true);
          setCompletedIds(new Set(prog.completedLessonIds || []));
          if (prog.lastLessonId && lessons.find((l) => l.id === prog.lastLessonId)) {
            setActiveLessonId(prog.lastLessonId);
          }
        } else {
          // Auto-start silently into My Learning
          await enrollOrStartCourse(user.uid, courseId, lessons[0]?.id);
          if (isMounted) {
            setIsEnrolled(true);
          }
        }
      } catch {
        if (isMounted) setIsEnrolled(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [user, courseId, lessons]);

  // Fullscreen / Big Screen toggle handler
  const handleToggleFullscreen = () => {
    const el = document.getElementById("theatre-player");
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Cancel auto-advance countdown
  const cancelAutoAdvance = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setAutoAdvanceCountdown(null);
    setAutoAdvanceNextLesson(null);
  }, []);

  // Dynamic lesson selection with buffer & loading feedback
  const handleSelectLesson = useCallback(
    (lessonId: string) => {
      cancelAutoAdvance();
      if (lessonId === activeLessonId && !isVideoLoading) return;
      setLoadingLessonId(lessonId);
      setIsVideoLoading(true);
      setActiveLessonId(lessonId);
    },
    [activeLessonId, isVideoLoading, cancelAutoAdvance]
  );

  // Trigger 3-second auto-advance countdown for playlist
  const triggerAutoAdvance = useCallback(
    (nextLesson: LessonDoc) => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      setAutoAdvanceNextLesson(nextLesson);
      setAutoAdvanceCountdown(3);

      let currentSec = 3;
      countdownTimerRef.current = setInterval(() => {
        currentSec -= 1;
        if (currentSec <= 0) {
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          setAutoAdvanceCountdown(null);
          setAutoAdvanceNextLesson(null);
          handleSelectLesson(nextLesson.id);
        } else {
          setAutoAdvanceCountdown(currentSec);
        }
      }, 1000);
    },
    [handleSelectLesson]
  );

  const playNextNow = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (autoAdvanceNextLesson) {
      const nextId = autoAdvanceNextLesson.id;
      setAutoAdvanceCountdown(null);
      setAutoAdvanceNextLesson(null);
      handleSelectLesson(nextId);
    }
  }, [autoAdvanceNextLesson, handleSelectLesson]);

  // YouTube IFrame Load & handshake listener
  const handleIframeLoad = useCallback(() => {
    setTimeout(() => {
      setIsVideoLoading(false);
      setLoadingLessonId(null);
      if (iframeRef.current?.contentWindow) {
        try {
          iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: "listening" }), "*");
        } catch {
          // Cross-origin restriction fallback
        }
      }
    }, 350);
  }, []);

  // Real YouTube Video Tracking (ended state = 0)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        if (!event.data) return;
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        // data.info === 0 indicates YouTube player reached ENDED state (100% completed)
        if (data.event === "onStateChange" && data.info === 0) {
          if (activeLesson) {
            if (user) {
              markLessonComplete(user.uid, courseId, activeLesson.id).catch(() => {});
            }
            setCompletedIds((prev) => new Set([...prev, activeLesson.id]));

            const activity = recordStudyActivity(25);
            setXpToast({
              xp: activity.xpGained,
              streak: activity.streak,
              streakIncreased: activity.streakIncreased,
            });
            setTimeout(() => setXpToast(null), 4500);

            // Auto-advance if next lesson exists in playlist
            if (activeIdx < lessons.length - 1) {
              triggerAutoAdvance(lessons[activeIdx + 1]!);
            }
          }
        }
      } catch {
        // Non-JSON iframe message
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [activeLesson, activeIdx, lessons, user, courseId, triggerAutoAdvance]);

  // Mark current lesson complete and auto advance to next with 3s countdown
  const handleMarkComplete = useCallback(async () => {
    if (!activeLesson) return;

    if (!user) {
      openAuthModal("signin");
      return;
    }

    setIsMarkingComplete(true);
    try {
      await markLessonComplete(user.uid, courseId, activeLesson.id);
      setCompletedIds((prev) => new Set([...prev, activeLesson.id]));
      setIsEnrolled(true);

      // Record daily streak and XP rewards
      const activity = recordStudyActivity(25);
      setXpToast({
        xp: activity.xpGained,
        streak: activity.streak,
        streakIncreased: activity.streakIncreased,
      });
      setTimeout(() => setXpToast(null), 4500);

      // Auto-advance with 3-second countdown if there's a next lesson
      if (activeIdx < lessons.length - 1) {
        triggerAutoAdvance(lessons[activeIdx + 1]!);
      }
    } finally {
      setIsMarkingComplete(false);
    }
  }, [user, courseId, activeLesson, activeIdx, lessons, openAuthModal, triggerAutoAdvance]);

  // Next & Previous lesson
  const goToNext = () => {
    if (activeIdx < lessons.length - 1) {
      handleSelectLesson(lessons[activeIdx + 1]!.id);
    }
  };

  const goToPrev = () => {
    if (activeIdx > 0) {
      handleSelectLesson(lessons[activeIdx - 1]!.id);
    }
  };

  const handleTabChange = (tab: "overview" | "notes" | "report") => {
    setTabTransitioning(tab);
    setActiveTab(tab);
    setTimeout(() => setTabTransitioning(null), 200);
  };

  // Open YouTube-style rich Share modal
  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  // Report submission
  const handleReport = async () => {
    if (!user) {
      openAuthModal("signin");
      return;
    }
    if (!reportReason.trim()) return;
    setSubmittingReport(true);
    setReportError("");
    try {
      await createReport({
        courseId,
        reporterId: user.uid,
        reason: reportReason.trim().slice(0, LIMITS.REPORT_REASON),
      });
      setReportSent(true);
      setReportReason("");
    } catch {
      setReportError("Couldn't submit your report. Please try again.");
    } finally {
      setSubmittingReport(false);
    }
  };

  const progressPercent =
    lessons.length > 0 ? Math.round((completedIds.size / lessons.length) * 100) : 0;
  const isCompleted = progressPercent === 100;

  return (
    <div className="container-page py-6 sm:py-8 max-w-7xl">
      {/* Draft notice */}
      {isDraft && isOwner && (
        <div
          className="badge-draft px-4 py-2.5 rounded-2xl mb-6 font-body text-sm flex items-center justify-between gap-2 shadow-sm"
          role="status"
        >
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3a1 1 0 011 1v3a1 1 0 01-2 0V5a1 1 0 011-1zm0 7a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            <span>This course is currently in draft mode. Only you can view this page.</span>
          </div>
          <Link
            href={`/edit/${courseId}`}
            className="underline font-heading font-bold hover:no-underline"
          >
            Edit Curriculum →
          </Link>
        </div>
      )}

      {/* Coursera-style Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-border">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Link
              href="/explore"
              className="text-xs font-body text-muted-foreground hover:text-primary-600 transition-colors"
            >
              Explore
            </Link>
            <span className="text-muted-foreground text-xs">/</span>
            <span className="text-xs font-heading font-bold text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-950/60 px-2 py-0.5 rounded-md">
              {course.category}
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-xl sm:text-2xl lg:text-3xl text-foreground break-words line-clamp-2 sm:line-clamp-none">
            {course.title}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-body mt-1">
            {lessons.length} video lessons · Curated Curriculum
            {isLowInternet && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-semibold">
                ⚡ Data Saver
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap flex-shrink-0">
          <button
            type="button"
            onClick={handleShare}
            className="btn-ghost text-xs px-3.5 py-2 min-h-[44px] inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
            aria-label="Share course"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span>Share</span>
          </button>

          {isOwner && (
            <Link
              href={`/edit/${courseId}`}
              className="btn-ghost text-xs px-3.5 py-2 min-h-[44px] inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <span>Edit</span>
            </Link>
          )}

          {!user && (
            <button
              type="button"
              onClick={() => openAuthModal("signin")}
              className="btn-primary text-xs px-3.5 py-2 min-h-[44px] inline-flex items-center cursor-pointer active:scale-95"
            >
              Sign In to Track Progress
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Coursera Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Theatre Video Player + Interactive Tabs */}
        <div className="flex-1 w-full min-w-0">
          {/* Theatre YouTube Player */}
          {activeLesson ? (
            <div
              id="theatre-player"
              className="relative aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-black mb-4 shadow-2xl border border-border/80"
            >
              {/* Top Streaming Buffer Bar */}
              {isVideoLoading && (
                <div className="absolute top-0 left-0 right-0 h-1 z-30 overflow-hidden bg-black/50">
                  <div className="h-full bg-gradient-to-r from-teal-400 via-primary-400 to-emerald-400 w-1/2 animate-stream-buffer" />
                </div>
              )}

              {/* Simple Animated Loading Indicator */}
              {isVideoLoading && (
                <div
                  className="absolute inset-0 z-20 bg-neutral-950/85 flex flex-col items-center justify-center p-6 text-center transition-all duration-200"
                  role="status"
                  aria-live="polite"
                >
                  <div className="simple-loader mb-3 !w-9 !h-9 !border-3" />
                  <p className="font-heading font-semibold text-white text-sm">
                    Loading Lesson {activeIdx + 1}…
                  </p>
                  <p className="text-neutral-400 text-xs mt-0.5 line-clamp-1 max-w-xs">
                    {activeLesson.title}
                  </p>
                  {isLowInternet && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs mt-2 font-body animate-pulse">
                      <span>⚡ Low-speed connection detected · Optimizing stream</span>
                    </div>
                  )}
                </div>
              )}

              {/* 3-Second Auto-Advance Countdown Overlay */}
              {autoAdvanceCountdown !== null && autoAdvanceNextLesson && (
                <div
                  className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in"
                  role="dialog"
                  aria-live="assertive"
                  aria-label="Next lesson auto-advance"
                >
                  <div className="relative mb-3 flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-teal-500/30 flex items-center justify-center bg-teal-500/10">
                      <span className="font-heading font-black text-3xl sm:text-4xl text-teal-400">
                        {autoAdvanceCountdown}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] uppercase font-extrabold tracking-wider text-teal-400 mb-1">
                    ✓ Lesson Completed · Next Video in {autoAdvanceCountdown}s
                  </p>
                  <h3 className="font-heading font-bold text-white text-sm sm:text-base max-w-md line-clamp-1 mb-3">
                    {autoAdvanceNextLesson.title}
                  </h3>

                  {/* Thumbnail preview */}
                  <div className="w-32 sm:w-36 aspect-video rounded-xl overflow-hidden border border-white/20 mb-4 shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        autoAdvanceNextLesson.thumbnailUrl ||
                        `https://img.youtube.com/vi/${autoAdvanceNextLesson.youtubeId}/mqdefault.jpg`
                      }
                      alt={autoAdvanceNextLesson.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={cancelAutoAdvance}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-heading font-semibold text-xs active:scale-95 transition-all"
                    >
                      Cancel Auto-Play
                    </button>
                    <button
                      type="button"
                      onClick={playNextNow}
                      className="btn-primary text-xs px-5 py-2 inline-flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                    >
                      <span>Play Now</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Clean YouTube Video Player (no creator watermark, auto starts, clean controls) */}
              <iframe
                ref={iframeRef}
                key={activeLesson.id}
                src={`https://www.youtube-nocookie.com/embed/${activeLesson.youtubeId}?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0&iv_load_policy=3&fs=1&playsinline=1&enablejsapi=1`}
                title={activeLesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                className="absolute inset-0 w-full h-full z-10"
                loading="eager"
                onLoad={handleIframeLoad}
              />
            </div>
          ) : (
            <div className="aspect-video rounded-3xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
              No lessons available in this course yet.
            </div>
          )}

          {/* Player Controls & Action Bar */}
          {activeLesson && (
            <div className="clay-card p-4 sm:p-5 bg-card border border-border rounded-2xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-heading font-extrabold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                    Lesson {activeIdx + 1} of {lessons.length}
                  </span>
                  {isEnrolled && (
                    <span className="text-[10px] font-heading font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      ✓ In My Learning
                    </span>
                  )}
                </div>
                <h2 className="font-heading font-bold text-base sm:text-xl text-foreground line-clamp-1">
                  {activeLesson.title}
                </h2>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
                {/* Big Screen / Fullscreen Option */}
                <button
                  type="button"
                  onClick={handleToggleFullscreen}
                  className="btn-ghost text-xs px-3 py-2 min-h-[44px] active:scale-95 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  title="Watch on Big Screen"
                  aria-label="Watch on Big Screen"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                  <span className="hidden xs:inline sm:inline">Big Screen</span>
                </button>

                <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
                  <button
                    type="button"
                    onClick={goToPrev}
                    disabled={activeIdx === 0 || isVideoLoading}
                    className="btn-ghost text-xs px-3.5 py-2 min-h-[44px] disabled:opacity-40 active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center"
                    aria-label="Previous lesson"
                  >
                    ← Prev
                  </button>

                  <button
                    type="button"
                    onClick={handleMarkComplete}
                    disabled={isMarkingComplete}
                    className={`text-xs px-4 py-2 min-h-[44px] font-heading font-bold rounded-xl transition-all inline-flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
                      completedIds.has(activeLesson.id)
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "btn-primary"
                    }`}
                  >
                    {isMarkingComplete ? (
                      <>
                        <svg
                          className="animate-spin w-3.5 h-3.5 text-white"
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
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        <span>Saving…</span>
                      </>
                    ) : (
                      <>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>
                          {completedIds.has(activeLesson.id) ? "Next →" : "Complete & Next"}
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={goToNext}
                    disabled={activeIdx === lessons.length - 1 || isVideoLoading}
                    className="btn-ghost text-xs px-3.5 py-2 min-h-[44px] disabled:opacity-40 active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center"
                    aria-label="Next lesson"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Coursera-style Tab Bar */}
          <div className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => handleTabChange("overview")}
              className={`px-4 py-3 min-h-[44px] text-xs sm:text-sm font-heading font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === "overview"
                  ? "border-primary-500 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-muted-foreground hover:text-foreground active:bg-muted/50"
              } ${tabTransitioning === "overview" ? "animate-pulse" : ""}`}
            >
              {tabTransitioning === "overview" && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-ping" />
              )}
              <span>Course Overview</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("notes")}
              className={`px-4 py-3 min-h-[44px] text-xs sm:text-sm font-heading font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === "notes"
                  ? "border-primary-500 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-muted-foreground hover:text-foreground active:bg-muted/50"
              } ${tabTransitioning === "notes" ? "animate-pulse" : ""}`}
            >
              {tabTransitioning === "notes" ? (
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-ping" />
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              )}
              <span>Study Notes</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("report")}
              className={`px-4 py-3 min-h-[44px] text-xs sm:text-sm font-heading font-bold border-b-2 transition-all whitespace-nowrap text-muted-foreground hover:text-destructive active:bg-muted/50 cursor-pointer ${
                activeTab === "report"
                  ? "border-destructive text-destructive"
                  : "border-transparent"
              } ${tabTransitioning === "report" ? "animate-pulse" : ""}`}
            >
              Report Issue
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="clay-card p-6 bg-card border border-border rounded-2xl">
                <h3 className="font-heading font-bold text-lg text-foreground mb-3">
                  About This Course
                </h3>
                <p className="font-body text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                  {course.description || "No description provided for this course."}
                </p>

                {/* Key Course Takeaways */}
                <div className="mt-6 pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      ✓
                    </div>
                    <div>
                      <p className="font-heading font-bold text-xs text-foreground">
                        Self-Paced Learning
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        Learn at your schedule without intrusive ads.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-500/10 text-primary-600 flex items-center justify-center flex-shrink-0">
                      ★
                    </div>
                    <div>
                      <p className="font-heading font-bold text-xs text-foreground">
                        Distraction-Free Video
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        Pure focused learning without algorithm rabbit holes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sponsored Banner */}
              <CourseAdBanner category={course.category} />
            </div>
          )}

          {/* Tab 2: Notes Scratchpad */}
          {activeTab === "notes" && (
            <CourseNotes
              courseId={courseId}
              courseTitle={course.title}
              activeLessonTitle={activeLesson?.title ?? "Lesson"}
            />
          )}

          {/* Tab 4: Report Form */}
          {activeTab === "report" && (
            <div className="clay-card p-6 bg-card border border-destructive/30 rounded-2xl">
              <h3 className="font-heading font-bold text-base mb-2 text-foreground">
                Report this course
              </h3>
              <p className="font-body text-xs text-muted-foreground mb-4">
                If this course contains copyright infringement, inappropriate content, or misleading
                information, let us know.
              </p>
              {reportSent ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-body text-sm">
                  Thank you — your report has been submitted to the moderators.
                </div>
              ) : (
                <>
                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="textarea mb-3"
                    placeholder="Describe the issue in detail…"
                    maxLength={LIMITS.REPORT_REASON}
                    rows={4}
                  />
                  {reportError && (
                    <p className="text-destructive text-xs mb-3" role="alert">
                      {reportError}
                    </p>
                  )}
                  <button
                    onClick={handleReport}
                    disabled={submittingReport || !reportReason.trim()}
                    className="btn-destructive text-xs px-4 py-2"
                    type="button"
                  >
                    {submittingReport ? "Submitting…" : "Submit Report"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Sticky Coursera Curriculum Syllabus on desktop, natural scroll on mobile */}
        <aside
          className="w-full lg:w-96 flex-shrink-0 static lg:sticky lg:top-20"
          aria-label="Course syllabus"
        >
          <div className="clay-card bg-card border-2 border-border rounded-3xl overflow-hidden shadow-lg">
            {/* Syllabus Header with Progress or Get Started button */}
            <div className="p-5 border-b-2 border-border bg-muted/40">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-heading font-extrabold text-base text-foreground">
                  Course Syllabus
                </h3>
                {isEnrolled ? (
                  <span className="text-xs font-heading font-black text-primary-600 dark:text-primary-400">
                    {progressPercent}%
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleEnrollAndStart(true)}
                    disabled={isEnrolling}
                    className="text-[11px] font-heading font-bold bg-primary-600 text-white px-2.5 py-1 rounded-lg hover:bg-primary-700 active:scale-95 transition-all inline-flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    {isEnrolling ? (
                      <span className="animate-pulse">Starting…</span>
                    ) : (
                      <>
                        <span>Get Started</span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Progress bar */}
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] font-body text-muted-foreground mt-2">
                <span>
                  {completedIds.size} of {lessons.length} completed
                </span>
                {isCompleted ? (
                  <span className="font-bold text-emerald-600">✓ Finished!</span>
                ) : isEnrolled ? (
                  <span className="text-primary-600 font-semibold">Active Learner</span>
                ) : (
                  <span className="text-muted-foreground">Not enrolled yet</span>
                )}
              </div>
            </div>

            {/* Page-wise Pagination Header (if more than 10 lessons) */}
            {totalLessonPages > 1 && (
              <div className="px-4 py-2.5 bg-muted/70 border-b border-border flex items-center justify-between text-xs">
                <span className="font-heading font-bold text-muted-foreground text-[11px]">
                  Page {lessonPage} of {totalLessonPages} (Lessons{" "}
                  {(lessonPage - 1) * LESSONS_PER_PAGE + 1}–
                  {Math.min(lessonPage * LESSONS_PER_PAGE, lessons.length)})
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setLessonPage((p) => Math.max(1, p - 1))}
                    disabled={lessonPage === 1}
                    className="p-1 rounded-lg bg-card border border-border/80 text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    aria-label="Previous page"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLessonPage((p) => Math.min(totalLessonPages, p + 1))}
                    disabled={lessonPage === totalLessonPages}
                    className="p-1 rounded-lg bg-card border border-border/80 text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    aria-label="Next page"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Lesson list items with thumbnails and snappy active loading states */}
            <ol className="divide-y divide-border max-h-[520px] overflow-y-auto">
              {lessons
                .slice((lessonPage - 1) * LESSONS_PER_PAGE, lessonPage * LESSONS_PER_PAGE)
                .map((lesson, idx) => {
                  const globalIdx = (lessonPage - 1) * LESSONS_PER_PAGE + idx;
                  const isActive = lesson.id === activeLessonId;
                  const isDone = completedIds.has(lesson.id);
                  const isLoadingThis = loadingLessonId === lesson.id;
                  const thumbUrl =
                    lesson.thumbnailUrl ||
                    `https://img.youtube.com/vi/${lesson.youtubeId}/mqdefault.jpg`;

                  return (
                    <li key={lesson.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectLesson(lesson.id)}
                        className={`w-full text-left p-3 flex items-start gap-3 transition-all duration-150 cursor-pointer relative group active:scale-[0.99] ${
                          isLoadingThis
                            ? "bg-teal-500/20 border-l-4 border-teal-500 ring-2 ring-teal-500/30 animate-pulse"
                            : isActive
                              ? "bg-primary-500/10 border-l-4 border-primary-500 shadow-sm"
                              : "hover:bg-muted/60 active:bg-primary-500/15"
                        }`}
                        aria-current={isActive ? "true" : undefined}
                      >
                        {/* Lesson Thumbnail */}
                        <div className="relative flex-shrink-0 w-24 sm:w-28 aspect-video rounded-lg overflow-hidden bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={thumbUrl}
                            alt=""
                            className={`w-full h-full object-cover transition-all duration-300 ${isActive ? "brightness-75" : "group-hover:brightness-90"}`}
                            loading="lazy"
                          />
                          {/* Play overlay on active */}
                          {isActive && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="#0F766E"
                                  aria-hidden="true"
                                >
                                  <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                              </div>
                            </div>
                          )}
                          {/* Loading spinner overlay */}
                          {isLoadingThis && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <svg
                                className="animate-spin w-5 h-5 text-white"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <circle
                                  className="opacity-30"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-90"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8H4z"
                                />
                              </svg>
                            </div>
                          )}
                          {/* Done checkmark overlay */}
                          {isDone && !isLoadingThis && (
                            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                              ✓
                            </div>
                          )}
                          {/* Lesson number badge */}
                          {!isDone && !isLoadingThis && (
                            <div className="absolute bottom-1 right-1 bg-black/75 text-white text-[10px] font-heading font-bold px-1.5 py-0.5 rounded shadow-sm">
                              {globalIdx + 1}
                            </div>
                          )}
                        </div>

                        {/* Lesson title & meta */}
                        <div className="min-w-0 flex-1 py-0.5">
                          <p
                            className={`text-xs sm:text-sm font-body leading-snug line-clamp-2 ${
                              isLoadingThis
                                ? "font-heading font-bold text-teal-600 dark:text-teal-400"
                                : isActive
                                  ? "font-heading font-bold text-foreground"
                                  : "text-foreground/90 group-hover:text-primary-600 transition-colors"
                            }`}
                          >
                            {lesson.title}
                          </p>
                          <div className="text-[11px] text-muted-foreground font-body mt-1 flex items-center gap-1.5">
                            {isLoadingThis ? (
                              <span className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping" />
                                Buffering video…
                              </span>
                            ) : (
                              <>
                                <svg
                                  width="11"
                                  height="11"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                                <span>Lesson {globalIdx + 1}</span>
                                {isDone && (
                                  <>
                                    <span>·</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                      Completed
                                    </span>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
            </ol>

            {/* Quick Page Jump Pills */}
            {totalLessonPages > 1 && (
              <div className="p-3 bg-muted/40 border-t border-border flex items-center justify-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-muted-foreground mr-1">Pages:</span>
                {Array.from({ length: totalLessonPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setLessonPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
                      lessonPage === pageNum
                        ? "bg-primary-600 text-white shadow-sm"
                        : "bg-card text-muted-foreground hover:text-foreground border border-border"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sign in prompt card if not authenticated */}
          {!user && (
            <div className="clay-card p-5 mt-4 text-center bg-card border border-border rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 mx-auto mb-2 flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <p className="font-heading font-bold text-xs sm:text-sm text-foreground mb-1">
                Save Your Learning Progress
              </p>
              <p className="text-[11px] text-muted-foreground font-body mb-3">
                Sign in with email or Google to track lessons, take notes, and maintain your daily
                learning streak.
              </p>
              <button
                type="button"
                onClick={() => openAuthModal("signin")}
                className="btn-primary w-full py-2.5 text-xs active:scale-95 transition-all"
              >
                Sign In Now
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* Floating Toast Notification on Course Start / Enrollment */}
      {enrollToast && (
        <div
          className="fixed bottom-6 right-6 z-50 bg-teal-800 text-white px-5 py-3.5 rounded-2xl shadow-2xl font-heading font-bold text-sm flex items-center gap-3 animate-slide-up border border-teal-500/60"
          role="status"
          aria-live="polite"
        >
          <div className="w-7 h-7 rounded-full bg-teal-400/20 text-teal-300 flex items-center justify-center flex-shrink-0">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="pr-2">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-teal-200">
              Course Enrolled
            </p>
            <p className="text-xs sm:text-sm font-bold text-white">{enrollToast}</p>
          </div>
          <Link
            href="/my-learning"
            className="text-xs bg-white text-teal-900 px-3 py-1.5 rounded-xl hover:bg-teal-50 active:scale-95 font-extrabold shadow-sm transition-all whitespace-nowrap"
          >
            My Learning →
          </Link>
        </div>
      )}

      {/* Floating XP & Daily Streak Reward Toast */}
      {xpToast && (
        <div
          className="fixed bottom-6 left-6 z-50 clay-card p-4 bg-card/95 backdrop-blur-md border-2 border-amber-500/50 shadow-2xl rounded-2xl flex items-center gap-3.5 max-w-sm animate-slide-up"
          role="status"
          aria-live="polite"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-xl flex-shrink-0">
            🔥
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-sm text-foreground">
                +{xpToast.xp} XP Earned!
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold">
                {xpToast.streak} Day Streak
              </span>
            </div>
            <p className="font-body text-xs text-muted-foreground mt-0.5">
              {xpToast.streakIncreased
                ? `Streak extended to ${xpToast.streak} days! Keep the momentum!`
                : `Lesson completed! Daily study streak maintained.`}
            </p>
          </div>
        </div>
      )}

      {/* YouTube-style Rich Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={course.title}
        url={typeof window !== "undefined" ? window.location.href : ""}
      />
    </div>
  );
}
