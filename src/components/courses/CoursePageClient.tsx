"use client";

// ---------------------------------------------------------------------------
// CoursePageClient — VeySkill's flagship learning experience
// Features: Theatre player, Curriculum checklist, AI Quiz, AI Study Notes,
// AI Study Companion, Streak Dashboard, Certificate System,
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
  markLessonExempt,
  saveQuizScore,
  createReport,
  serializeCourse,
} from "@/lib/firestore";
import { LIMITS } from "@/lib/constants";
import type { CourseDoc, LessonDoc, SerializedCourseDoc } from "@/lib/types";
import { ShareModal } from "@/components/ui/ShareModal";
import { CourseNotes } from "@/components/courses/CourseNotes";
import { CourseAdBanner } from "@/components/ads/CourseAdBanner";
import { recordStudyActivity } from "@/lib/streak";
import { QuizModal } from "@/components/courses/QuizModal";
import { StudyCompanion } from "@/components/courses/StudyCompanion";
import { CertificateModal } from "@/components/courses/CertificateModal";
import { PaymentGate } from "@/components/courses/PaymentGate";
import { StreakDashboard } from "@/components/courses/StreakDashboard";
import { checkCertificateEligibility } from "@/lib/curriculumEngine";

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
  const { user, openAuthModal } = useAuth();
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

  // Only show loading skeleton if course data has not arrived yet (e.g. client-side fetch in progress)
  if (!course && fetching) {
    return (
      <div className="container-page py-10 max-w-5xl mx-auto px-4 animate-pulse">
        <div className="h-8 w-64 bg-muted/80 rounded-xl mb-6" />
        <div className="aspect-video w-full bg-muted/60 rounded-3xl mb-8" />
        <div className="space-y-4">
          <div className="h-16 bg-muted/40 rounded-2xl" />
          <div className="h-16 bg-muted/40 rounded-2xl" />
          <div className="h-16 bg-muted/40 rounded-2xl" />
        </div>
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
  const { loading: authLoading } = useAuth();
  const [activeLessonId, setActiveLessonId] = useState(lessons[0]?.id ?? "");
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "quiz" | "report">("overview");
  const [tabTransitioning, setTabTransitioning] = useState<string | null>(null);

  // AI & Certificate Feature States
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isPaymentGateOpen, setIsPaymentGateOpen] = useState(false);
  const [hasPaidCertificate, setHasPaidCertificate] = useState(false);
  const [paidOrderId, setPaidOrderId] = useState<string | null>(null);
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);
  const [quizScores, setQuizScores] = useState<Map<string, { score: number; total: number }>>(
    new Map()
  );
  const [showCourseComplete, setShowCourseComplete] = useState(false);
  const [exemptIds, setExemptIds] = useState<Set<string>>(new Set());
  const [videoError, setVideoError] = useState<{
    lessonId: string;
    errorCode: number;
    message: string;
  } | null>(null);
  const [certificateRecipientName, setCertificateRecipientName] = useState<string>(
    user?.displayName ?? "Learner"
  );
  const [isCredibilityModalOpen, setIsCredibilityModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [videoDuration, setVideoDuration] = useState<number | undefined>(undefined);

  const certEligibility = checkCertificateEligibility(
    course.title,
    lessons.length,
    course.description,
    videoDuration
  );

  // 1. Check local cache for unlocked certificate
  useEffect(() => {
    if (typeof window === "undefined" || !courseId) return;
    try {
      const cachedPaidOrder = localStorage.getItem(`veyskill_paid_${courseId}`);
      if (cachedPaidOrder) {
        setHasPaidCertificate(true);
        setPaidOrderId(cachedPaidOrder);
      }
      const cachedName = localStorage.getItem(`veyskill_paid_name_${courseId}`);
      if (cachedName) {
        setCertificateRecipientName(cachedName);
      }
    } catch {
      // localStorage may be restricted in private browsing
    }
  }, [courseId]);

  // 2. Query server for recorded certificate payment when user is signed in
  useEffect(() => {
    if (!user?.uid || !courseId) return;
    let isMounted = true;
    fetch(
      `/api/payment/check?uid=${encodeURIComponent(user.uid)}&courseId=${encodeURIComponent(courseId)}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.hasPaid) {
          setHasPaidCertificate(true);
          if (data.orderId) {
            setPaidOrderId(data.orderId);
            try {
              localStorage.setItem(`veyskill_paid_${courseId}`, data.orderId);
            } catch {}
          }
        }
      })
      .catch((err) => console.warn("[Payment] Check notice:", err));
    return () => {
      isMounted = false;
    };
  }, [user?.uid, courseId]);

  // 3. Handle return redirect from Cashfree payment gateway
  useEffect(() => {
    if (typeof window === "undefined" || !courseId) return;
    if (authLoading) return; // Wait for Firebase client auth state to finish re-hydrating

    try {
      const params = new URLSearchParams(window.location.search);
      const paymentStatus = params.get("payment_status");
      const returnedOrderId = params.get("order_id");

      if (returnedOrderId && (paymentStatus === "success" || returnedOrderId.startsWith("VS_"))) {
        // Resolve uid from user or storage
        let effectiveUid = user?.uid || "";
        if (!effectiveUid) {
          try {
            const raw =
              sessionStorage.getItem(`veyskill_pending_order_${courseId}`) ||
              localStorage.getItem(`veyskill_pending_order_${courseId}`);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed?.uid) effectiveUid = parsed.uid;
            }
          } catch {}
        }

        fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: returnedOrderId,
            uid: effectiveUid,
            courseId,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.isPaid) {
              setHasPaidCertificate(true);
              setPaidOrderId(returnedOrderId);
              try {
                localStorage.setItem(`veyskill_paid_${courseId}`, returnedOrderId);
              } catch {}
              setIsCertificateOpen(true);
              const cleanUrl = new URL(window.location.href);
              cleanUrl.searchParams.delete("payment_status");
              cleanUrl.searchParams.delete("order_id");
              window.history.replaceState({}, "", cleanUrl.toString());
            }
          })
          .catch((err) => console.warn("[Payment] Redirect verify notice:", err));
      }
    } catch {}
  }, [courseId, user?.uid, authLoading]);

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Keyboard navigation shortcuts: F for Big Screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        const el = document.getElementById("theatre-player");
        if (!el) return;
        if (!document.fullscreenElement) {
          el.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sync recipient name if user signs in or profile updates
  useEffect(() => {
    if (user?.displayName) {
      setCertificateRecipientName(user.displayName);
    }
  }, [user?.displayName]);

  // Active lesson auto-scroll ref for YouTube playlist drawer
  const activeLessonItemRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (activeLessonItemRef.current) {
      activeLessonItemRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeLessonId]);

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
          setExemptIds(new Set(prog.exemptLessonIds || []));
          if (prog.lastLessonId && lessons.find((l) => l.id === prog.lastLessonId)) {
            setActiveLessonId(prog.lastLessonId);
          }
          if (prog.quizScores) {
            const map = new Map<string, { score: number; total: number }>();
            Object.entries(prog.quizScores).forEach(([k, v]) => {
              if (v && typeof v.score === "number" && typeof v.total === "number") {
                map.set(k, v);
              }
            });
            setQuizScores(map);
          }
        } else {
          // Only auto-enroll if user arrived via explicit "Get Started" link (?start=true)
          const urlParams =
            typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
          if (urlParams?.get("start") === "true") {
            await enrollOrStartCourse(user.uid, courseId, lessons[0]?.id);
            if (isMounted) setIsEnrolled(true);
          } else {
            if (isMounted) setIsEnrolled(false);
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
      setVideoError(null);
      setIsCredibilityModalOpen(false);
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
      if (!isAutoplay) return;
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
    [handleSelectLesson, isAutoplay]
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
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: "command", func: "getDuration", args: [] }),
            "*"
          );
        } catch {
          // Cross-origin restriction fallback
        }
      }
    }, 350);
  }, []);

  // Real YouTube Video Tracking (ended state = 0, duration tracking, and onError handler)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        if (!event.data) return;
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        // Capture real video duration emitted by YouTube player
        const possibleDuration =
          typeof data?.info?.duration === "number"
            ? data.info.duration
            : typeof data?.info?.videoData?.duration === "number"
              ? data.info.videoData.duration
              : typeof data?.info === "number" && data.info > 10
                ? data.info
                : undefined;

        if (possibleDuration && possibleDuration > 0) {
          setVideoDuration(possibleDuration);
        }

        // data.info === 0 indicates YouTube player reached ENDED state (100% completed)
        if (data.event === "onStateChange" && data.info === 0) {
          if (activeLesson) {
            if (user) {
              markLessonComplete(user.uid, courseId, activeLesson.id).catch(() => {});
            }
            setCompletedIds((prev) => new Set([...prev, activeLesson.id]));

            const activity = recordStudyActivity(10);
            setXpToast({
              xp: activity.xpGained,
              streak: activity.streak,
              streakIncreased: activity.streakIncreased,
            });
            setTimeout(() => setXpToast(null), 4500);

            // Coursera / Google flow: Immediately trigger knowledge assessment
            setIsQuizOpen(true);
          }
        }

        // data.event === "onError" indicates YouTube player encountered an issue
        // Codes: 100 (private/deleted), 101/150 (embed disabled), 2 (invalid ID), 5 (HTML5 error)
        if (data.event === "onError") {
          const code = Number(data.info);
          let message = "This video is restricted or unavailable on external players.";
          if (code === 100)
            message = "This lecture was removed or marked private by the YouTube creator.";
          else if (code === 101 || code === 150)
            message = "Embedding was restricted by the YouTube creator.";
          else if (code === 2) message = "Invalid YouTube video link.";

          if (activeLesson) {
            setVideoError({ lessonId: activeLesson.id, errorCode: code, message });
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

  // Next & Previous lesson
  const goToNext = useCallback(() => {
    if (activeIdx < lessons.length - 1) {
      handleSelectLesson(lessons[activeIdx + 1]!.id);
    }
  }, [activeIdx, lessons, handleSelectLesson]);

  const goToPrev = useCallback(() => {
    if (activeIdx > 0) {
      handleSelectLesson(lessons[activeIdx - 1]!.id);
    }
  }, [activeIdx, lessons, handleSelectLesson]);

  // Mark privatized or broken lesson as exempt so learner is never stuck
  const handleMarkLessonExempt = useCallback(async () => {
    if (!activeLesson) return;

    if (!user) {
      openAuthModal("signin");
      return;
    }

    try {
      await markLessonExempt(user.uid, courseId, activeLesson.id);
      setCompletedIds((prev) => new Set([...prev, activeLesson.id]));
      setExemptIds((prev) => new Set([...prev, activeLesson.id]));
      setVideoError(null);
      setIsCredibilityModalOpen(false);

      const activity = recordStudyActivity(5);
      setXpToast({
        xp: activity.xpGained,
        streak: activity.streak,
        streakIncreased: activity.streakIncreased,
      });
      setTimeout(() => setXpToast(null), 4500);

      goToNext();
    } catch (err) {
      console.error("Failed to mark lesson exempt:", err);
    }
  }, [activeLesson, user, courseId, openAuthModal, goToNext]);

  // Mark current lesson complete and auto advance to next with credibility verification
  const handleMarkComplete = useCallback(async () => {
    if (!activeLesson) return;

    if (!user) {
      openAuthModal("signin");
      return;
    }

    // If already completed, simply jump to next lesson
    if (completedIds.has(activeLesson.id)) {
      goToNext();
      return;
    }

    // If video error occurred or exempt, mark exempt and advance
    if (videoError?.lessonId === activeLesson.id || exemptIds.has(activeLesson.id)) {
      await handleMarkLessonExempt();
      return;
    }

    // Anti-cheat credibility check: prompt quiz if not yet taken
    const hasTakenQuiz = quizScores.has(activeLesson.id);
    if (!hasTakenQuiz) {
      setIsCredibilityModalOpen(true);
      return;
    }

    setIsMarkingComplete(true);
    try {
      await markLessonComplete(user.uid, courseId, activeLesson.id);
      setCompletedIds((prev) => new Set([...prev, activeLesson.id]));
      setIsEnrolled(true);

      // Record daily streak and XP rewards (+10 points per completed module)
      const activity = recordStudyActivity(10);
      setXpToast({
        xp: activity.xpGained,
        streak: activity.streak,
        streakIncreased: activity.streakIncreased,
      });
      setTimeout(() => setXpToast(null), 4500);

      goToNext();
    } finally {
      setIsMarkingComplete(false);
    }
  }, [
    user,
    courseId,
    activeLesson,
    completedIds,
    videoError,
    exemptIds,
    quizScores,
    openAuthModal,
    goToNext,
    handleMarkLessonExempt,
  ]);

  const handleTabChange = (tab: "overview" | "notes" | "quiz" | "report") => {
    setTabTransitioning(tab);
    setActiveTab(tab);
    setTimeout(() => setTabTransitioning(null), 200);
  };

  const progressPercent =
    lessons.length > 0 ? Math.round((completedIds.size / lessons.length) * 100) : 0;
  const isCompleted = progressPercent === 100;

  // Calculate total quiz score across all lessons
  const totalQuizScore = Array.from(quizScores.values()).reduce((a, b) => a + b.score, 0);
  const totalQuizTotal = Array.from(quizScores.values()).reduce((a, b) => a + b.total, 0);
  const overallQuizPercent =
    totalQuizTotal > 0 ? Math.round((totalQuizScore / totalQuizTotal) * 100) : 0;
  const hasPassedQuiz = totalQuizTotal > 0 && overallQuizPercent >= 70;

  // Quiz completion handler — stores scores per lesson and persists to Firestore
  const handleQuizComplete = useCallback(
    (score: number, total: number) => {
      if (!activeLesson) return;
      setQuizScores((prev) => {
        const next = new Map(prev);
        next.set(activeLesson.id, { score, total });
        return next;
      });
      if (user) {
        saveQuizScore(user.uid, courseId, activeLesson.id, score, total);
        if (!completedIds.has(activeLesson.id)) {
          markLessonComplete(user.uid, courseId, activeLesson.id).catch(() => {});
          setCompletedIds((prev) => new Set([...prev, activeLesson.id]));
          setIsEnrolled(true);
          const activity = recordStudyActivity(10);
          setXpToast({
            xp: activity.xpGained,
            streak: activity.streak,
            streakIncreased: activity.streakIncreased,
          });
          setTimeout(() => setXpToast(null), 4500);
        }
      }
      if (isCompleted || completedIds.size >= lessons.length - 1) {
        setIsQuizOpen(false);
        setShowCourseComplete(true);
      }
    },
    [activeLesson, user, courseId, completedIds, isCompleted, lessons.length]
  );

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

  // Show course completion celebration when 100%
  useEffect(() => {
    if (isCompleted && completedIds.size > 0 && !showCourseComplete) {
      setShowCourseComplete(true);
    }
  }, [isCompleted, completedIds.size, showCourseComplete]);

  return (
    <div className="container-page pt-6 sm:pt-8 pb-28 sm:pb-16 max-w-7xl">
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
            <span className="text-xs font-heading font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md">
              {certEligibility.eligible ? "Academic Masterclass" : certEligibility.label}
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-xl sm:text-2xl lg:text-3xl text-foreground break-words line-clamp-2 sm:line-clamp-none">
            {course.title}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-body mt-1">
            {lessons.length} video lessons · Curated Curriculum
            {isLowInternet && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-semibold">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>Data Saver</span>
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

          {user && !isEnrolled && (
            <button
              type="button"
              onClick={() => handleEnrollAndStart(true)}
              disabled={isEnrolling}
              className="btn-primary text-xs px-4 py-2 min-h-[44px] inline-flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
            >
              <span>{isEnrolling ? "Starting…" : "Get Started"}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </button>
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
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                      <span>Low-speed connection detected · Optimizing stream</span>
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

                  <p className="text-[11px] uppercase font-extrabold tracking-wider text-teal-400 mb-1 flex items-center justify-center gap-1.5">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Lesson Completed · Next Video in {autoAdvanceCountdown}s</span>
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

          {/* Privatized / Restricted Video Fallback Alert */}
          {activeLesson &&
            (videoError?.lessonId === activeLesson.id || exemptIds.has(activeLesson.id)) && (
              <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-heading font-bold text-foreground">
                      {exemptIds.has(activeLesson.id)
                        ? "Module Marked Exempt (Video Restricted)"
                        : videoError?.message ||
                          "This video is restricted or unavailable on external players."}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      {exemptIds.has(activeLesson.id)
                        ? "This module is exempt from your course requirements so your learning streak and diploma qualification remain intact."
                        : "The original creator may have privatized or restricted embeds. You won't get stuck! Mark this lesson exempt to advance your course."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                  <a
                    href={`https://www.youtube.com/watch?v=${activeLesson.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost text-xs px-3.5 py-2 inline-flex items-center justify-center gap-1.5 border border-border text-foreground hover:bg-muted font-heading font-bold rounded-xl transition-all"
                  >
                    <span>Watch on YouTube</span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                  {!exemptIds.has(activeLesson.id) ? (
                    <button
                      type="button"
                      onClick={handleMarkLessonExempt}
                      className="btn-primary text-xs px-4 py-2 flex-shrink-0 shadow-md font-heading font-bold"
                    >
                      Mark Exempt &amp; Proceed
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={goToNext}
                      className="btn-ghost text-xs px-3.5 py-2 flex-shrink-0 text-amber-600 dark:text-amber-400 font-heading font-bold"
                    >
                      Next Lesson →
                    </button>
                  )}
                </div>
              </div>
            )}

          {/* Player Controls & Action Deck (Coursera / Big Company Grade) */}
          {activeLesson && (
            <div className="clay-card p-4 sm:p-5 bg-card/95 backdrop-blur-md border border-border/80 rounded-2xl mb-6 shadow-sm space-y-4">
              {/* Row 1: Lesson Meta + Big Screen + Autoplay Pill */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[11px] font-heading font-extrabold uppercase tracking-wider text-primary-600 dark:text-primary-400 bg-primary-500/10 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                      Lesson {activeIdx + 1} of {lessons.length}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {Math.round(((activeIdx + 1) / lessons.length) * 100)}% through
                    </span>
                    {isEnrolled && (
                      <span className="text-[10px] font-heading font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          aria-hidden="true"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Enrolled</span>
                      </span>
                    )}
                  </div>
                  <h2 className="font-heading font-bold text-base sm:text-lg text-foreground line-clamp-1">
                    {activeLesson.title}
                  </h2>
                </div>

                {/* Right controls: Big Screen + Autoplay Toggle */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {/* Big Screen / Theater Fullscreen Button */}
                  <button
                    type="button"
                    onClick={handleToggleFullscreen}
                    className={`text-xs px-3.5 py-2 min-h-[40px] rounded-xl font-heading font-bold inline-flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-sm ${
                      isFullscreen
                        ? "bg-teal-500 text-white shadow-teal-500/20"
                        : "bg-muted/80 hover:bg-muted text-foreground border border-border/80"
                    }`}
                    title={isFullscreen ? "Exit Big Screen (F)" : "Watch on Big Screen (F)"}
                    aria-label={isFullscreen ? "Exit Big Screen" : "Watch on Big Screen"}
                  >
                    {isFullscreen ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
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
                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                      </svg>
                    )}
                    <span>{isFullscreen ? "Exit Big Screen" : "Big Screen"}</span>
                    <span className="hidden md:inline text-[10px] opacity-60 font-mono px-1 py-0.5 rounded bg-black/10 dark:bg-white/10">
                      F
                    </span>
                  </button>

                  {/* Autoplay Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setIsAutoplay((prev) => !prev)}
                    className={`text-xs px-3 py-2 min-h-[40px] rounded-xl font-heading font-semibold inline-flex items-center gap-1.5 transition-all border cursor-pointer active:scale-95 ${
                      isAutoplay
                        ? "bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-500/30"
                        : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                    }`}
                    title={isAutoplay ? "Continuous playback enabled" : "Autoplay paused"}
                    aria-label="Toggle Autoplay"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isAutoplay ? "bg-primary-500 animate-pulse" : "bg-muted-foreground/40"
                      }`}
                    />
                    <span>Autoplay: {isAutoplay ? "ON" : "OFF"}</span>
                  </button>

                  {/* Mobile Syllabus Drawer Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      document
                        .getElementById("course-curriculum-panel")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="btn-ghost text-xs px-2.5 py-2 min-h-[40px] lg:hidden inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
                    title="View Course Syllabus"
                    aria-label="View Course Syllabus"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                    <span>Syllabus</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Playback Controls (Prev, Complete & Advance, Next) + Quick Study Tools */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
                {/* Left: Prev / Complete / Next Navigation Trio */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  {/* Prev Button */}
                  <button
                    type="button"
                    onClick={goToPrev}
                    disabled={activeIdx === 0 || isVideoLoading}
                    className="btn-ghost text-xs px-3.5 py-2.5 min-h-[42px] disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/60 hover:bg-muted font-heading font-semibold"
                    aria-label="Previous lesson"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    <span>Prev</span>
                  </button>

                  {/* Primary Complete & Advance Button */}
                  <button
                    type="button"
                    onClick={handleMarkComplete}
                    disabled={isMarkingComplete}
                    className={`flex-1 md:flex-initial text-xs px-5 py-2.5 min-h-[42px] font-heading font-bold rounded-xl transition-all inline-flex items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-md ${
                      completedIds.has(activeLesson.id)
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                        : "btn-primary shadow-primary-500/20"
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
                    ) : completedIds.has(activeLesson.id) ? (
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
                        <span>Completed ✓</span>
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
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Complete &amp; Advance</span>
                      </>
                    )}
                  </button>

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={goToNext}
                    disabled={activeIdx === lessons.length - 1 || isVideoLoading}
                    className="btn-ghost text-xs px-3.5 py-2.5 min-h-[42px] disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/60 hover:bg-muted font-heading font-semibold"
                    aria-label="Next lesson"
                  >
                    <span>Next</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>

                {/* Right: Quick Study Suite (AI Companion, Notes, Knowledge Check, Share) */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 md:pt-0">
                  <button
                    type="button"
                    onClick={() => setIsCompanionOpen((o) => !o)}
                    className="btn-ghost text-xs px-3 py-2 min-h-[38px] rounded-xl inline-flex items-center gap-1.5 text-primary-600 dark:text-primary-400 hover:bg-primary-500/10 cursor-pointer active:scale-95 font-heading font-bold"
                    title="Open Coursera-grade AI study companion"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z" />
                    </svg>
                    <span>AI Coach</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabChange("notes")}
                    className="btn-ghost text-xs px-3 py-2 min-h-[38px] rounded-xl inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer active:scale-95 font-heading font-semibold"
                    title="Take AI-assisted study notes"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    <span>Notes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCredibilityModalOpen(true)}
                    className="btn-ghost text-xs px-3 py-2 min-h-[38px] rounded-xl inline-flex items-center gap-1.5 text-muted-foreground hover:text-amber-500 cursor-pointer active:scale-95 font-heading font-semibold"
                    title="Knowledge assessment or report video issue"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>Quiz / Help</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="btn-ghost text-xs px-2.5 py-2 min-h-[38px] rounded-xl inline-flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer active:scale-95"
                    title="Share this lesson"
                    aria-label="Share lesson"
                  >
                    <svg
                      width="13"
                      height="13"
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
                  strokeWidth="2.2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              )}
              <span>AI Notes</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("quiz")}
              className={`px-4 py-3 min-h-[44px] text-xs sm:text-sm font-heading font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === "quiz"
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : "border-transparent text-muted-foreground hover:text-foreground active:bg-muted/50"
              } ${tabTransitioning === "quiz" ? "animate-pulse" : ""}`}
            >
              {tabTransitioning === "quiz" ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              )}
              <span>Assessments</span>
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
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
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
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
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

              {/* Course Completion & Coursera-Grade Credential Unlock */}
              {isCompleted &&
                (!certEligibility.eligible ? (
                  <div className="clay-card p-6 bg-muted/40 border border-teal-500/30 rounded-2xl text-center space-y-4 animate-fade-in">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30 flex items-center justify-center">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <div>
                      <span className="inline-block px-3 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
                        Open Educational Guide · Completed
                      </span>
                      <h3 className="font-heading font-black text-lg text-foreground">
                        Guide Completed
                      </h3>
                      <p className="text-xs text-muted-foreground font-body max-w-md mx-auto mt-1">
                        {certEligibility.reason ||
                          "This is a single-module roadmap or informational guide. Verified completion certificates are reserved exclusively for multi-module accredited masterclasses."}
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3 pt-1">
                      <Link
                        href="/explore"
                        className="btn-primary text-xs px-5 py-2.5 font-heading font-bold shadow-md"
                      >
                        Explore Masterclass Courses →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="clay-card p-6 bg-muted/40 border-2 border-primary-500/30 rounded-2xl text-center space-y-4 animate-fade-in">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/30 flex items-center justify-center">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <polyline points="9 12 11 14 15 10" />
                      </svg>
                    </div>
                    <div>
                      <span className="inline-block px-3 py-0.5 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
                        Curriculum Complete · {lessons.length} Modules
                      </span>
                      <h3 className="font-heading font-black text-lg text-foreground">
                        Course Curriculum Finished
                      </h3>
                      <p className="text-xs text-muted-foreground font-body max-w-md mx-auto mt-1">
                        {totalQuizTotal > 0 &&
                        Math.round((totalQuizScore / totalQuizTotal) * 100) < 70
                          ? `Google & Coursera certification standard: Minimum 70% passing grade required. Your current average is ${Math.round((totalQuizScore / totalQuizTotal) * 100)}%. Retake assessments to unlock your certificate.`
                          : `You have completed all video modules with verified competence. Claim your official verified credential.`}
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-3 pt-1 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setIsQuizOpen(true)}
                        className="btn-ghost text-xs px-4 py-2.5 font-heading font-bold inline-flex items-center gap-2"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <polyline points="23 4 23 10 17 10" />
                          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                        <span>Take Module Assessment</span>
                      </button>

                      {!certEligibility.eligible ? (
                        <span className="text-xs px-4 py-2 rounded-xl bg-muted/60 border border-border text-muted-foreground font-heading font-medium inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span>Educational Guide · Completed</span>
                        </span>
                      ) : totalQuizTotal > 0 &&
                        Math.round((totalQuizScore / totalQuizTotal) * 100) < 70 ? (
                        <button
                          type="button"
                          onClick={() => setIsQuizOpen(true)}
                          className="btn-primary text-xs px-5 py-2.5 font-heading font-bold inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white shadow-md cursor-pointer"
                          title="Attain at least 70% assessment score to unlock certificate"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                          <span>Retake Quiz to Unlock (Need 70%)</span>
                        </button>
                      ) : totalQuizTotal === 0 ? (
                        <button
                          type="button"
                          onClick={() => setIsQuizOpen(true)}
                          className="btn-primary text-xs px-5 py-2.5 font-heading font-bold inline-flex items-center gap-2 bg-primary hover:bg-primary-600 text-white shadow-md cursor-pointer"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <polyline points="23 4 23 10 17 10" />
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                          </svg>
                          <span>Take Quiz to Qualify (70% Required)</span>
                        </button>
                      ) : hasPaidCertificate ? (
                        <button
                          type="button"
                          onClick={() => setIsCertificateOpen(true)}
                          className="btn-primary text-xs px-5 py-2.5 font-heading font-bold inline-flex items-center gap-2 shadow-lg bg-emerald-600 hover:bg-emerald-700 cursor-pointer text-white"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                          >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <polyline points="9 12 11 14 15 10" />
                          </svg>
                          <span>View Verified Certificate</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (!user) {
                              openAuthModal("signin");
                              return;
                            }
                            setIsPaymentGateOpen(true);
                          }}
                          className="btn-primary text-xs px-5 py-2.5 font-heading font-bold inline-flex items-center gap-2 shadow-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 cursor-pointer text-white"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                          >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <polyline points="9 12 11 14 15 10" />
                          </svg>
                          <span>Claim Verified Certificate · ₹29</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Tab 2: AI-Powered Notes */}
          {activeTab === "notes" && (
            <CourseNotes
              courseId={courseId}
              courseTitle={course.title}
              courseCategory={course.category}
              activeLessonTitle={activeLesson?.title ?? "Lesson"}
            />
          )}

          {/* Tab 3: Module Assessment */}
          {activeTab === "quiz" && (
            <div className="space-y-5">
              {/* Quick Assessment Launch */}
              <div className="clay-card p-6 bg-card border border-border rounded-2xl text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-foreground">
                    Module Knowledge Assessment
                  </h3>
                  <p className="text-xs text-muted-foreground font-body mt-1 max-w-md mx-auto">
                    Evaluate your comprehension of &ldquo;{activeLesson?.title}&rdquo;. Google &amp;
                    Coursera standard: 70% passing threshold required for certificate qualification.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuizOpen(true)}
                  className="btn-primary text-xs px-6 py-2.5 font-heading font-bold inline-flex items-center gap-2 shadow-lg"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>Launch Module Quiz</span>
                </button>

                {/* Show previous assessment score if exists */}
                {activeLesson && quizScores.has(activeLesson.id) && (
                  <div className="p-3 rounded-xl bg-muted/60 border border-border max-w-sm mx-auto">
                    <p className="text-xs font-mono font-bold text-foreground">
                      Previous Score: {quizScores.get(activeLesson.id)!.score}/
                      {quizScores.get(activeLesson.id)!.total} (
                      {Math.round(
                        (quizScores.get(activeLesson.id)!.score /
                          quizScores.get(activeLesson.id)!.total) *
                          100
                      )}
                      %)
                      {Math.round(
                        (quizScores.get(activeLesson.id)!.score /
                          quizScores.get(activeLesson.id)!.total) *
                          100
                      ) >= 70 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 ml-2 inline-flex items-center gap-1">
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>Passed</span>
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 ml-2">Needs 70%</span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Assessment Stats Summary */}
              {quizScores.size > 0 && (
                <div className="clay-card p-5 bg-card border border-border rounded-2xl">
                  <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    <span>Curriculum Assessment Analytics</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 rounded-lg bg-muted/60 border border-border/50">
                      <p className="font-heading font-black text-lg text-foreground">
                        {quizScores.size}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-bold">Assessments</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/60 border border-border/50">
                      <p className="font-heading font-black text-lg text-foreground">
                        {totalQuizTotal > 0
                          ? Math.round((totalQuizScore / totalQuizTotal) * 100)
                          : 0}
                        %
                      </p>
                      <p className="text-[10px] text-muted-foreground font-bold">Average Grade</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/60 border border-border/50">
                      <p className="font-heading font-black text-lg text-foreground">
                        {totalQuizScore}/{totalQuizTotal}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-bold">Total Correct</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
          id="course-curriculum-panel"
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
                  <span className="font-bold text-emerald-600 inline-flex items-center gap-1">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Finished!</span>
                  </span>
                ) : isEnrolled ? (
                  <span className="text-primary-600 font-semibold">Active Learner</span>
                ) : (
                  <span className="text-muted-foreground">Not enrolled yet</span>
                )}
              </div>
            </div>

            {/* YouTube-Style Continuous Playlist Header */}
            <div className="px-4 py-2.5 bg-muted/60 border-b border-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <span className="font-heading font-bold text-foreground text-xs">
                  Lesson {activeIdx + 1} of {lessons.length}
                </span>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                {completedIds.size}/{lessons.length} completed
              </span>
            </div>

            {/* Continuous YouTube Playlist Scrollable List */}
            <ol className="divide-y divide-border max-h-[580px] overflow-y-auto overscroll-contain scroll-smooth">
              {lessons.map((lesson, idx) => {
                const globalIdx = idx;
                const isActive = lesson.id === activeLessonId;
                const isDone = completedIds.has(lesson.id);
                const isLoadingThis = loadingLessonId === lesson.id;
                const thumbUrl =
                  lesson.thumbnailUrl ||
                  `https://img.youtube.com/vi/${lesson.youtubeId}/mqdefault.jpg`;

                return (
                  <li key={lesson.id} ref={isActive ? activeLessonItemRef : undefined}>
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
                          alt={
                            lesson.title
                              ? `${lesson.title} thumbnail`
                              : `Lesson ${idx + 1} thumbnail`
                          }
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
                          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
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

          {/* Streak & Progress Dashboard */}
          {user && (
            <div className="mt-4">
              <StreakDashboard />
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
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2c-1.5 3-4 5.5-4 9a6 6 0 0012 0c0-3.5-2.5-6-4-9-1 2-2 3-4 0z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-sm text-foreground">
                +{xpToast.xp} Points Earned!
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold font-mono">
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

      {/* Credibility & Assessment Modal */}
      {isCredibilityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="clay-card p-6 bg-card border border-border rounded-3xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base text-foreground">
                  Knowledge &amp; Credibility Check
                </h3>
                <p className="text-[11px] text-muted-foreground font-body line-clamp-1">
                  Lesson {activeIdx + 1}: {activeLesson?.title}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground font-body leading-relaxed">
              VeySkill credentials are verifiable by employers and corporate recruiters. To ensure
              high credibility, please complete this lecture by passing the quick 3-question
              knowledge check or finishing the video.
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsCredibilityModalOpen(false);
                  setIsQuizOpen(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl btn-primary text-xs font-heading font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Take 3-Question Knowledge Check</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">
                  +10 XP
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsCredibilityModalOpen(false);
                  handleMarkLessonExempt();
                }}
                className="w-full py-2 px-3 rounded-xl btn-ghost text-xs text-muted-foreground hover:text-amber-500 cursor-pointer"
              >
                Video broken or restricted? Mark Exempt &amp; Next
              </button>

              <button
                type="button"
                onClick={async () => {
                  setIsCredibilityModalOpen(false);
                  setIsMarkingComplete(true);
                  try {
                    if (user && activeLesson) {
                      await markLessonComplete(user.uid, courseId, activeLesson.id);
                    }
                    if (activeLesson) {
                      setCompletedIds((prev) => new Set([...prev, activeLesson.id]));
                    }
                    goToNext();
                  } finally {
                    setIsMarkingComplete(false);
                  }
                }}
                className="w-full py-1.5 text-[11px] text-muted-foreground/80 hover:text-foreground underline cursor-pointer"
              >
                I already completed this lecture · Mark Done &amp; Next →
              </button>
            </div>
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

      {/* AI Quiz Modal */}
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        lessonTitle={activeLesson?.title ?? "Lesson"}
        courseTitle={course.title}
        courseCategory={course.category}
        lessonIndex={activeIdx}
        totalLessons={lessons.length}
        onQuizComplete={handleQuizComplete}
      />

      {/* Course Completion & 70% Certification Milestone Modal */}
      {showCourseComplete && (
        <div
          className="fixed inset-0 z-[65] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Course Completion Celebration"
        >
          <div className="relative w-full max-w-lg bg-card border-2 border-border/90 rounded-3xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[92dvh]">
            {/* Header with celebration banner */}
            <div className="relative p-6 sm:p-7 border-b border-border bg-gradient-to-b from-amber-500/15 via-primary/5 to-background text-center overflow-hidden">
              <button
                type="button"
                onClick={() => setShowCourseComplete(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-muted/80 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                aria-label="Close"
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
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Animated Emblem */}
              <div className="w-16 h-16 mx-auto mb-3.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-xl shadow-amber-500/25 ring-4 ring-amber-500/20">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>

              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-500 uppercase block mb-1">
                Curriculum Milestone Reached
              </span>
              <h2 className="font-heading font-black text-xl sm:text-2xl text-foreground">
                Course Mastered! Congratulations!
              </h2>
              <p className="text-xs text-muted-foreground mt-1.5 font-body line-clamp-2 max-w-sm mx-auto">
                {course.title}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 font-body text-xs">
              {/* Progress & Verification Stats Box */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-0.5">
                    Curriculum
                  </span>
                  <div className="font-heading font-black text-lg text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1">
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
                    <span>100% Done</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {lessons.length} Lessons Finished
                  </span>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border text-center ${
                    hasPassedQuiz
                      ? "bg-emerald-500/10 border-emerald-500/20"
                      : totalQuizTotal > 0
                        ? "bg-amber-500/10 border-amber-500/20"
                        : "bg-muted/50 border-border"
                  }`}
                >
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider block mb-0.5 ${
                      hasPassedQuiz
                        ? "text-emerald-600 dark:text-emerald-400"
                        : totalQuizTotal > 0
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-muted-foreground"
                    }`}
                  >
                    Assessment Score
                  </span>
                  <div className="font-heading font-black text-lg text-foreground">
                    {totalQuizTotal > 0 ? `${overallQuizPercent}%` : "Not Taken"}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {hasPassedQuiz ? "70% Benchmark Passed" : "70% Required to Certify"}
                  </span>
                </div>
              </div>

              {/* Conditional Routing Based on Certificate Eligibility */}
              {!certEligibility.eligible ? (
                /* Educational Guide / Single Video Guide Notice */
                <div className="p-4 rounded-2xl bg-muted/60 border border-border space-y-2">
                  <div className="flex items-center gap-2 font-heading font-bold text-foreground">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Educational Guide Completed</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    You completed this educational guide! Note: Accredited vector diplomas and
                    cryptographic verification IDs are awarded for full-length masterclasses (45+
                    mins) or multi-lesson courses.
                  </p>
                  <div className="pt-2 flex justify-end">
                    <Link
                      href="/explore"
                      className="btn-primary text-xs px-4 py-2 font-heading font-bold inline-flex items-center gap-1.5"
                    >
                      <span>Explore Masterclasses →</span>
                    </Link>
                  </div>
                </div>
              ) : hasPassedQuiz ? (
                /* 70%+ Passed Standard — Ready for Certificate */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-teal-500/15 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-heading font-bold">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <polyline points="9 12 11 14 15 10" />
                      </svg>
                      <span>Accredited Credential Ready to Unlock</span>
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      You achieved a score of <strong>{overallQuizPercent}%</strong> (exceeding the
                      strict 70% passing threshold). Your official tamper-proof credential with
                      public registry ID is ready!
                    </p>
                  </div>

                  {hasPaidCertificate ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowCourseComplete(false);
                        setIsCertificateOpen(true);
                      }}
                      className="w-full btn-primary py-3 font-heading font-black text-sm inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/25 cursor-pointer"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <polyline points="9 12 11 14 15 10" />
                      </svg>
                      <span>View Verified Certificate</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCourseComplete(false);
                          if (!user) {
                            openAuthModal("signin");
                            return;
                          }
                          setIsPaymentGateOpen(true);
                        }}
                        className="w-full btn-primary py-3.5 font-heading font-bold text-sm inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-white shadow-xl shadow-amber-500/25 cursor-pointer active:scale-[0.99] transition-all"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <circle cx="12" cy="8" r="7" />
                          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                        </svg>
                        <span>Claim Verified Certificate · ₹29</span>
                      </button>
                      <p className="text-[11px] text-center text-muted-foreground font-body">
                        Instant Delivery • PDF Certificate • LinkedIn Credential • Permanent
                        Verification Link
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Did not reach 70% passing threshold */
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2 font-heading font-bold text-amber-700 dark:text-amber-300">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>70% Passing Score Required to Unlock Certificate</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    {totalQuizTotal > 0
                      ? `Your current assessment score is ${overallQuizPercent}%. To ensure academic credibility, a minimum passing score of 70% is required to certify your diploma.`
                      : "You completed all video lessons! Complete the module assessment and score at least 70% to qualify for your verified certificate."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCourseComplete(false);
                      setIsQuizOpen(true);
                    }}
                    className="w-full btn-primary py-2.5 font-heading font-bold text-xs inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-600 text-primary-foreground shadow-md cursor-pointer"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                    <span>
                      {totalQuizTotal > 0
                        ? "Retake Assessment to Qualify (70%+)"
                        : "Take Assessment to Qualify (70%+)"}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between text-xs font-heading font-semibold text-muted-foreground">
              <button
                type="button"
                onClick={() => setShowCourseComplete(false)}
                className="hover:text-foreground transition-colors cursor-pointer"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCourseComplete(false);
                  handleShare();
                }}
                className="inline-flex items-center gap-1.5 text-primary hover:underline cursor-pointer"
              >
                <span>Share Course</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Gate Modal for ₹29 Certificate Unlock */}
      <PaymentGate
        isOpen={isPaymentGateOpen}
        onClose={() => setIsPaymentGateOpen(false)}
        onPaymentSuccess={(orderId, confirmedName) => {
          setHasPaidCertificate(true);
          setPaidOrderId(orderId);
          try {
            localStorage.setItem(`veyskill_paid_${courseId}`, orderId);
            if (confirmedName) {
              localStorage.setItem(`veyskill_paid_name_${courseId}`, confirmedName);
            }
          } catch {}
          if (confirmedName) {
            setCertificateRecipientName(confirmedName);
          }
          if (user?.uid) {
            import("@/lib/firestore").then(({ recordPaidCertificate }) => {
              recordPaidCertificate(user.uid, courseId, orderId);
            });
          }
          setIsPaymentGateOpen(false);
          setIsCertificateOpen(true);
        }}
        courseId={courseId}
        courseTitle={course.title}
        lessonCount={lessons.length}
        description={course.description}
        duration={videoDuration}
        user={
          user
            ? {
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                phoneNumber: user.phoneNumber,
              }
            : null
        }
      />

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        userName={certificateRecipientName || user?.displayName || "Learner"}
        courseTitle={course.title}
        lessonCount={lessons.length}
        quizScore={totalQuizScore > 0 ? totalQuizScore : undefined}
        quizTotal={totalQuizTotal > 0 ? totalQuizTotal : undefined}
        uid={user?.uid}
        courseId={courseId}
        orderId={paidOrderId ?? undefined}
        onRequestPayment={() => setIsPaymentGateOpen(true)}
      />

      {/* AI Study Companion — Floating Chat */}
      <StudyCompanion
        videoTitle={activeLesson?.title ?? ""}
        courseTitle={course.title}
        courseCategory={course.category}
        isOpen={isCompanionOpen}
        onToggle={() => setIsCompanionOpen((o) => !o)}
      />
    </div>
  );
}
