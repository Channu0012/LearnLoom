"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getUserProgress, getCourse, recordPaidCertificate } from "@/lib/firestore";
import type { CourseDoc, ProgressDoc } from "@/lib/types";
import { CertificateModal } from "@/components/courses/CertificateModal";
import { PaymentGate } from "@/components/courses/PaymentGate";
import { normalizeCertificateId, verifyCertificateId } from "@/lib/security";
import { checkCertificateEligibility } from "@/lib/curriculumEngine";
import { StreakWidget } from "@/components/layout/StreakWidget";
import { generatePdfCertificate } from "@/lib/pdfCertificate";

interface CourseWithProgress {
  course: CourseDoc;
  progress: ProgressDoc;
}

export default function MyLearningPage() {
  const router = useRouter();
  const { user, loading, openAuthModal } = useAuth();
  const [items, setItems] = useState<CourseWithProgress[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState<"all" | "in_progress" | "completed" | "certificates">("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [courseToRemove, setCourseToRemove] = useState<CourseWithProgress | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [paidCourseIds, setPaidCourseIds] = useState<Set<string>>(new Set());
  const [downloadingCertId, setDownloadingCertId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Payment & Certificate Modal States
  const [selectedCertCourse, setSelectedCertCourse] = useState<CourseWithProgress | null>(null);
  const [payingCourse, setPayingCourse] = useState<CourseWithProgress | null>(null);

  // Quick Inline Verification Dialog State
  const [quickVerifyOpen, setQuickVerifyOpen] = useState(false);
  const [testInputId, setTestInputId] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    isValid: boolean;
    id?: string;
    reason?: string;
    certificate?: {
      userName?: string;
      courseTitle?: string;
      issuedDate?: string;
      verificationMethod?: string;
    };
  } | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".mylearning-menu-container")) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  useEffect(() => {
    if (!user) {
      setFetching(false);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const progressList = await getUserProgress(user.uid);
        const results: CourseWithProgress[] = [];
        for (const prog of progressList) {
          const course = await getCourse(prog.courseId);
          if (course && course.status === "published") {
            // Only show courses the user has actually started learning or enrolled in
            const hasStarted =
              (prog.completedLessonIds?.length || 0) > 0 ||
              Boolean(prog.started) ||
              Boolean(prog.lastLessonId);
            if (hasStarted) {
              results.push({ course, progress: prog });
            }
          }
        }

        // Sort by most recently active
        results.sort((a, b) => {
          const timeA = a.progress.updatedAt?.toMillis?.() ?? 0;
          const timeB = b.progress.updatedAt?.toMillis?.() ?? 0;
          return timeB - timeA;
        });

        if (isMounted) setItems(results);

        // Check payment status for completed courses
        const paidSet = new Set<string>();
        for (const item of results) {
          const isDone =
            (item.progress.completedLessonIds?.length || 0) >= (item.course.lessonCount || 1) &&
            (item.course.lessonCount || 0) > 0;
          if (isDone) {
            if (
              item.progress.certificateIssued ||
              item.progress.hasPaidCertificate ||
              item.progress.certificateId
            ) {
              paidSet.add(item.course.id);
            } else {
              try {
                const res = await fetch(
                  `/api/payment/check?uid=${user.uid}&courseId=${item.course.id}`
                );
                if (res.ok) {
                  const data = await res.json();
                  if (data.hasPaid) paidSet.add(item.course.id);
                }
              } catch {
                // Ignore fetch error
              }
            }
          }
        }
        if (isMounted) setPaidCourseIds(paidSet);
      } catch {
        if (isMounted) setItems([]);
      } finally {
        if (isMounted) setFetching(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const inProgressItems = items.filter(
    (item) => (item.progress.completedLessonIds?.length || 0) < (item.course.lessonCount || 1)
  );

  const completedItems = items.filter(
    (item) =>
      (item.progress.completedLessonIds?.length || 0) >= (item.course.lessonCount || 1) &&
      (item.course.lessonCount || 0) > 0
  );

  // Certificates tab shows courses that are completed, paid/issued, AND eligible for verified credentials
  const certificateItems = completedItems.filter(
    (item) =>
      checkCertificateEligibility(
        item.course.title,
        item.course.lessonCount,
        item.course.description
      ).eligible &&
      (paidCourseIds.has(item.course.id) ||
        Boolean(item.progress.certificateIssued) ||
        Boolean(item.progress.hasPaidCertificate) ||
        Boolean(item.progress.certificateId))
  );

  // Completed courses that meet curriculum requirements but certificate hasn't been claimed yet
  const eligibleUnclaimedItems = completedItems.filter(
    (item) =>
      checkCertificateEligibility(
        item.course.title,
        item.course.lessonCount,
        item.course.description
      ).eligible &&
      !paidCourseIds.has(item.course.id) &&
      !Boolean(item.progress.certificateIssued) &&
      !Boolean(item.progress.hasPaidCertificate) &&
      !Boolean(item.progress.certificateId)
  );

  const displayedItems =
    filter === "in_progress"
      ? inProgressItems
      : filter === "completed"
        ? completedItems
        : filter === "certificates"
          ? certificateItems
          : items;

  const handleCopyCourseLink = async (courseId: string) => {
    try {
      const url = `${window.location.origin}/course/${courseId}`;
      await navigator.clipboard.writeText(url);
      setToastMessage("Course link copied to clipboard!");
      setTimeout(() => setToastMessage(null), 2500);
    } catch {}
    setOpenMenuId(null);
  };

  // Handle course removal from dashboard
  const handleConfirmRemove = async () => {
    if (!user || !courseToRemove) return;
    setIsRemoving(true);
    try {
      const { deleteUserProgress } = await import("@/lib/firestore");
      await deleteUserProgress(user.uid, courseToRemove.course.id);
      setItems((prev) => prev.filter((i) => i.course.id !== courseToRemove.course.id));
      setCourseToRemove(null);
    } catch (err) {
      console.error("Failed to remove course from My Learning:", err);
    } finally {
      setIsRemoving(false);
    }
  };

  // 1-Click Instant Vector PDF Download
  const handleDownloadCertificate = async (item: CourseWithProgress) => {
    const certId =
      item.progress.certificateId ||
      `VS-${item.course.id
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(0, 8)
        .toUpperCase()}`;
    const userName = user?.displayName || "Verified Learner";
    const courseTitle = item.course.title;
    const lessonCount = item.course.lessonCount || 12;
    const quizScoreValues = item.progress.quizScores ? Object.values(item.progress.quizScores) : [];
    const quizScore =
      quizScoreValues.length > 0
        ? Math.round(
            (quizScoreValues.reduce((acc, q) => acc + q.score / (q.total || 1), 0) /
              quizScoreValues.length) *
              100
          )
        : null;
    const issuedDate = (() => {
      try {
        const raw = item.progress.updatedAt;
        const d =
          raw && typeof raw.toDate === "function"
            ? raw.toDate()
            : raw && typeof raw.seconds === "number"
              ? new Date(raw.seconds * 1000)
              : new Date();
        return d.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
      } catch {
        return "October 2026";
      }
    })();

    setDownloadingCertId(item.course.id);
    try {
      await generatePdfCertificate({
        id: certId,
        userName,
        courseTitle,
        lessonCount,
        quizScore,
        issuedDate,
        verifyUrl: `https://veyskill.in/verify/${certId}`,
      });
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setDownloadingCertId(null);
    }
  };

  // Perform live API verification
  const handleTestVerify = async (idToTest: string) => {
    const cleanId = normalizeCertificateId(idToTest);
    if (!cleanId) return;

    setTestLoading(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cleanId }),
      });
      const data = await res.json();
      if (res.ok && data.isValid) {
        setTestResult({
          isValid: true,
          id: cleanId,
          certificate: data.certificate,
        });
      } else {
        setTestResult({
          isValid: false,
          id: cleanId,
          reason: data.reason || "Cryptographic checksum mismatch. Unrecognized credential.",
        });
      }
    } catch {
      // Fallback to local security check if offline
      const localCheck = verifyCertificateId(cleanId);
      setTestResult({
        isValid: localCheck.isValid,
        id: cleanId,
        reason: localCheck.reason,
      });
    } finally {
      setTestLoading(false);
    }
  };

  if (loading || fetching) {
    return (
      <div
        className="container-page py-12 max-w-5xl mx-auto px-4"
        role="status"
        aria-label="Loading your courses"
      >
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-3">
            <svg
              className="animate-spin w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
          </div>
          <h2 className="font-heading font-bold text-base text-foreground">
            Synchronizing Your Learning Progress
          </h2>
          <p className="text-xs font-body text-muted-foreground mt-0.5">
            Loading your active courses and verified certifications…
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-card border border-border/60 shadow-sm space-y-3"
            >
              <div className="aspect-video w-full rounded-xl bg-muted/60" />
              <div className="h-4 w-4/5 bg-muted/70 rounded-md" />
              <div className="h-2 w-full bg-muted/50 rounded-full" />
              <div className="h-3 w-1/3 bg-muted/50 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-page py-20 text-center max-w-md mx-auto">
        <div className="enterprise-card p-8 bg-card border border-border text-center rounded-2xl">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary-100 dark:bg-primary-950/60 flex items-center justify-center text-primary-600 dark:text-primary-400">
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
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <h1 className="font-heading font-extrabold text-2xl mb-2 text-foreground">
            Sign In for Learning Progress
          </h1>
          <p className="text-muted-foreground font-body text-sm mb-6 leading-relaxed">
            Sign in to track your started courses, claim verified completion certificates, and
            resume where you left off across all devices.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal("signin")}
            className="btn-primary w-full py-3"
          >
            Sign In with Email or Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10 max-w-5xl">
      {/* Top Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-heading font-bold mb-2 border border-primary-200 dark:border-primary-800">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <span>Student Portal</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground">
              My Learning
            </h1>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Pick up right where you left off across your enrolled courses and certificates of
              completion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StreakWidget />
            <Link
              href="/quick-watch"
              className="btn-ghost text-xs font-heading font-bold px-3.5 py-2 inline-flex items-center gap-1.5 border border-border hover:border-primary-500/50 transition-colors"
              title="Quick Watch Focus Theatre"
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
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>Quick Watch</span>
            </Link>
            <Link
              href="/verify"
              className="btn-ghost text-xs font-heading font-bold px-3.5 py-2 inline-flex items-center gap-1.5 border border-border"
              title="Official Cryptographic Verification Registry"
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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <span>Verification Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Earned Credentials Highlight Banner (ONLY in Certificates tab when earned certificates exist) */}
      {filter === "certificates" && certificateItems.length > 0 && (
        <div className="enterprise-card p-5 sm:p-6 mb-8 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-card border border-emerald-500/30 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="8" r="7" />
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-heading font-black tracking-widest uppercase bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    VERIFIED CREDENTIALS
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {certificateItems.length} Issued
                  </span>
                </div>
                <h2 className="font-heading font-extrabold text-base sm:text-lg text-foreground mt-0.5">
                  Certificates of Completion &amp; Verified Credentials
                </h2>
                <p className="font-body text-xs text-muted-foreground mt-0.5 max-w-xl">
                  You have successfully completed and unlocked official vector PDF certificates of
                  completion with scannable QR codes and verifiable IDs.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setSelectedCertCourse(certificateItems[0] || null)}
                className="btn-primary text-xs font-heading font-bold px-4 py-2.5 inline-flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span>View Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      {items.length > 0 && (
        <div className="flex items-center gap-2 mb-6 border-b border-border pb-3 flex-wrap">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-4 py-2 min-h-[44px] inline-flex items-center justify-center rounded-xl text-xs sm:text-sm font-heading font-bold transition-all cursor-pointer ${
              filter === "all"
                ? "bg-primary-600 text-white shadow-sm"
                : "bg-card border border-border text-foreground hover:bg-muted"
            }`}
          >
            All Courses ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("in_progress")}
            className={`px-4 py-2 min-h-[44px] inline-flex items-center justify-center rounded-xl text-xs sm:text-sm font-heading font-bold transition-all cursor-pointer ${
              filter === "in_progress"
                ? "bg-primary-600 text-white shadow-sm"
                : "bg-card border border-border text-foreground hover:bg-muted"
            }`}
          >
            In Progress ({inProgressItems.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 min-h-[44px] rounded-xl text-xs sm:text-sm font-heading font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${
              filter === "completed"
                ? "bg-primary-600 text-white shadow-sm"
                : "bg-card border border-border text-foreground hover:bg-muted"
            }`}
          >
            <span>Completed</span>
            <span>({completedItems.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter("certificates")}
            className={`px-4 py-2 min-h-[44px] rounded-xl text-xs sm:text-sm font-heading font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${
              filter === "certificates"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-card border border-border text-foreground hover:bg-muted"
            }`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <circle cx="12" cy="8" r="7" />
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
            </svg>
            <span>Certificates</span>
            <span>({certificateItems.length})</span>
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="enterprise-card p-12 text-center max-w-2xl mx-auto bg-card border border-dashed border-border rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-foreground mb-2">
            No Active Courses Yet
          </h2>
          <p className="text-muted-foreground font-body text-sm mb-6 max-w-md mx-auto">
            Explore free community courses on programming, design, business, and more. When you
            start any course, it will automatically appear here!
          </p>
          <Link
            href="/explore"
            className="btn-primary px-6 py-3 text-sm inline-flex items-center gap-2 min-h-[48px]"
          >
            <span>Explore Courses →</span>
          </Link>
        </div>
      ) : displayedItems.length === 0 ? (
        filter === "certificates" && eligibleUnclaimedItems.length > 0 ? (
          <div className="space-y-6">
            <div className="p-5 sm:p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <circle cx="12" cy="8" r="7" />
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-foreground">
                    You Have {eligibleUnclaimedItems.length} Certificate
                    {eligibleUnclaimedItems.length !== 1 ? "s" : ""} Ready to Claim!
                  </h3>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">
                    You completed 100% of the course. Unlock your official verified credential and
                    share it on LinkedIn.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {eligibleUnclaimedItems.map((item) => (
                <div
                  key={item.course.id}
                  className="enterprise-card p-5 bg-card border border-amber-500/40 rounded-2xl flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-heading font-black text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        100% Completed
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {item.course.lessonCount} lessons
                      </span>
                    </div>
                    <h4 className="font-heading font-bold text-sm sm:text-base text-foreground mb-1">
                      {item.course.title}
                    </h4>
                    <p className="text-xs text-muted-foreground font-body">
                      Verifiable certificate issued by VeySkill with credential registry ID.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setPayingCourse(item)}
                      className="btn-primary text-xs px-3.5 py-2 font-heading font-bold rounded-xl shadow-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="8" r="7" />
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                      </svg>
                      <span>Claim Certificate · ₹29</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCertCourse(item)}
                      className="btn-secondary text-xs px-3 py-2 font-heading font-semibold rounded-xl border border-border text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Preview
                    </button>
                    <Link
                      href={`/course/${item.course.id}?review=true&start=true`}
                      className="text-xs font-heading font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1 ml-auto"
                    >
                      <span>Review</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="enterprise-card p-12 text-center max-w-md mx-auto bg-card border border-border rounded-2xl">
            <p className="font-heading font-bold text-base text-foreground mb-2">
              {filter === "completed"
                ? "No completed courses yet"
                : filter === "certificates"
                  ? "No unlocked certificates yet"
                  : "No courses currently in progress"}
            </p>
            <p className="text-xs text-muted-foreground font-body mb-4">
              {filter === "completed"
                ? "Finish watching all lessons in any course to unlock your official verified certificate."
                : filter === "certificates"
                  ? "Complete a course and verify curriculum requirements to claim and display your Certificate of Completion here."
                  : "All your active courses have been finished!"}
            </p>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="btn-ghost text-xs px-4 py-2"
            >
              View All Courses
            </button>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {displayedItems.map((item) => {
            const { course, progress } = item;
            const completedCount = progress.completedLessonIds?.length || 0;
            const totalCount = Math.max(1, course.lessonCount || 1);
            const pct = Math.min(100, Math.max(0, Math.round((completedCount / totalCount) * 100)));
            const isFinished = pct === 100;
            const certEligibility = checkCertificateEligibility(
              course.title,
              course.lessonCount,
              course.description
            );
            const isCertUnlocked =
              certEligibility.eligible &&
              (paidCourseIds.has(course.id) ||
                Boolean(progress.certificateIssued) ||
                Boolean(progress.hasPaidCertificate) ||
                Boolean(progress.certificateId));

            return (
              <div
                key={course.id}
                className={`enterprise-card p-5 flex flex-col justify-between bg-card border rounded-2xl transition-all shadow-xs hover:shadow-sm relative ${
                  filter === "certificates" || isCertUnlocked
                    ? "border-emerald-500/50 hover:border-emerald-500 shadow-emerald-500/5"
                    : isFinished
                      ? "border-teal-500/40 hover:border-teal-500"
                      : "border-border hover:border-primary-400/60"
                }`}
              >
                <div>
                  <div className="flex gap-4 items-start mb-4">
                    {/* Thumbnail */}
                    <Link
                      href={`/course/${course.id}?start=true`}
                      className="group flex-shrink-0"
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      {course.coverVideoId || course.coverThumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={
                            course.coverThumbnailUrl ||
                            `https://i.ytimg.com/vi/${course.coverVideoId}/mqdefault.jpg`
                          }
                          alt={`${course.title} cover`}
                          className="w-24 sm:w-28 aspect-video object-cover rounded-xl border border-border group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (course.coverVideoId && !target.dataset.triedHq) {
                              target.dataset.triedHq = "true";
                              target.src = `https://img.youtube.com/vi/${course.coverVideoId}/hqdefault.jpg`;
                            } else if (course.coverVideoId && !target.dataset.triedDef) {
                              target.dataset.triedDef = "true";
                              target.src = `https://img.youtube.com/vi/${course.coverVideoId}/default.jpg`;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-24 sm:w-28 aspect-video rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </div>
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="badge-primary text-[10px] font-heading font-bold inline-block truncate max-w-[150px]">
                          {course.channelTitle
                            ? `By ${course.channelTitle}`
                            : course.creatorName
                              ? `Curated by ${course.creatorName}`
                              : "Enrolled Masterclass"}
                        </span>

                        {/* 3-Dot Dropdown Menu Trigger */}
                        <div className="relative mylearning-menu-container flex-shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === course.id ? null : course.id);
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                            aria-label="Course actions"
                            title="Course options"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="12" cy="5" r="2.2" />
                              <circle cx="12" cy="12" r="2.2" />
                              <circle cx="12" cy="19" r="2.2" />
                            </svg>
                          </button>

                          {/* 3-Dot Options Dropdown */}
                          {openMenuId === course.id && (
                            <div className="absolute right-0 top-full mt-1.5 w-52 bg-card border border-border rounded-2xl shadow-xl p-1 z-50 animate-fade-in divide-y divide-border/50">
                              <div className="space-y-0.5 pb-1">
                                <Link
                                  href={`/course/${course.id}?review=${isFinished ? "true" : "false"}&start=true`}
                                  onClick={() => setOpenMenuId(null)}
                                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-heading font-semibold text-foreground hover:bg-muted/80 transition-colors"
                                >
                                  <svg
                                    width="13"
                                    height="13"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-teal-500"
                                  >
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                  </svg>
                                  <span>{isFinished ? "Review Lessons" : "Continue Learning"}</span>
                                </Link>

                                {isCertUnlocked && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuId(null);
                                        setSelectedCertCourse(item);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-heading font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-muted/80 transition-colors text-left cursor-pointer"
                                    >
                                      <svg
                                        width="13"
                                        height="13"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                      >
                                        <circle cx="12" cy="8" r="7" />
                                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                                      </svg>
                                      <span>View Certificate</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuId(null);
                                        handleDownloadCertificate(item);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-heading font-semibold text-foreground hover:bg-muted/80 transition-colors text-left cursor-pointer"
                                    >
                                      <svg
                                        width="13"
                                        height="13"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                      >
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                      </svg>
                                      <span>Download PDF</span>
                                    </button>
                                  </>
                                )}

                                {isFinished && !isCertUnlocked && certEligibility.eligible && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      setPayingCourse(item);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-heading font-semibold text-amber-600 dark:text-amber-400 hover:bg-muted/80 transition-colors text-left cursor-pointer"
                                  >
                                    <svg
                                      width="13"
                                      height="13"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <circle cx="12" cy="8" r="7" />
                                      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                                    </svg>
                                    <span>Claim Certificate (₹29)</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleCopyCourseLink(course.id)}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-heading font-semibold text-foreground hover:bg-muted/80 transition-colors text-left cursor-pointer"
                                >
                                  <svg
                                    width="13"
                                    height="13"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-indigo-500"
                                  >
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                  </svg>
                                  <span>Copy Course Link</span>
                                </button>
                              </div>

                              <div className="pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCourseToRemove(item);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-heading font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                                >
                                  <svg
                                    width="13"
                                    height="13"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  </svg>
                                  <span>Remove from Learning</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <Link href={`/course/${course.id}?start=true`} className="group block">
                        <h3 className="font-heading font-bold text-sm sm:text-base text-foreground line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
                          {course.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-muted-foreground font-body mt-0.5 truncate">
                        {course.lessonCount} video lessons
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar (Hidden in pure certificates view to keep it clean) */}
                  {filter !== "certificates" && (
                    <div className="mb-2">
                      <div className="flex justify-between text-xs font-body mb-1">
                        <span className="text-muted-foreground">
                          {completedCount} of {course.lessonCount} lessons completed
                        </span>
                        <span
                          className={`font-heading font-black ${
                            isFinished
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-primary-600 dark:text-primary-400"
                          }`}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div
                        className="h-2 rounded-full overflow-hidden bg-muted"
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isFinished ? "bg-emerald-500" : "bg-primary-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action Area — Contextual to Selected Tab */}
                <div className="pt-3 border-t border-border mt-3 space-y-2">
                  {/* Case 1: In Certificates Tab — Google Skills / Credly 3-Action Row */}
                  {filter === "certificates" ? (
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[10px] font-heading font-bold uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-800/60 inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Verified Certificate
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {item.progress.certificateId || "Active Record"}
                        </span>
                      </div>

                      {/* Clean 3-Action Row: [Download PDF], [Add to LinkedIn], [View Certificate] */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadCertificate(item)}
                          disabled={downloadingCertId === item.course.id}
                          className="btn-primary py-2 px-2.5 text-xs font-heading font-bold inline-flex items-center justify-center gap-1.5 min-h-[38px] rounded-xl shadow-xs cursor-pointer"
                          title="Download official vector PDF certificate"
                        >
                          {downloadingCertId === item.course.id ? (
                            <div className="simple-loader !w-3.5 !h-3.5 !border-2" />
                          ) : (
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                          )}
                          <span>Download PDF</span>
                        </button>

                        <a
                          href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(item.course.title)}&organizationName=${encodeURIComponent("VeySkill")}&certUrl=${encodeURIComponent(`https://veyskill.in/verify/${item.progress.certificateId || item.course.id}`)}&certId=${encodeURIComponent(item.progress.certificateId || item.course.id)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary py-2 px-2.5 text-xs font-heading font-bold inline-flex items-center justify-center gap-1.5 min-h-[38px] rounded-xl border border-border hover:bg-muted text-foreground transition-colors"
                          title="Add to your LinkedIn profile"
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="text-[#0A66C2]"
                          >
                            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                          </svg>
                          <span>Add to LinkedIn</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => setSelectedCertCourse(item)}
                          className="btn-secondary py-2 px-2.5 text-xs font-heading font-bold inline-flex items-center justify-center gap-1.5 min-h-[38px] rounded-xl border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                          title="View certificate full preview"
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                          </svg>
                          <span>View Certificate</span>
                        </button>
                      </div>

                      <div className="pt-1 flex items-center justify-between text-xs">
                        <Link
                          href={`/course/${course.id}?start=true`}
                          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors font-medium"
                        >
                          <span>Review Modules &amp; Code</span>
                          <span>&rarr;</span>
                        </Link>
                        <Link
                          href={`/verify/${item.progress.certificateId || item.course.id}`}
                          target="_blank"
                          className="text-teal-600 dark:text-teal-400 hover:underline text-[11px] font-mono"
                        >
                          Verify Registry URL ↗
                        </Link>
                      </div>
                    </div>
                  ) : isFinished ? (
                    /* Case 2: In Completed Tab — Review Lessons or Claim/View Certificate */
                    <div className="flex flex-col gap-2.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[10px] font-heading font-black text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>Course Completed</span>
                        </span>

                        {isCertUnlocked && (
                          <span className="text-[10px] font-heading font-bold text-emerald-600 dark:text-emerald-400">
                            Verified Credential
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {isCertUnlocked ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setSelectedCertCourse(item)}
                              className="btn-primary text-xs px-3.5 py-1.5 font-heading font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                              >
                                <circle cx="12" cy="8" r="7" />
                                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                              </svg>
                              <span>View Certificate</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadCertificate(item)}
                              disabled={downloadingCertId === course.id}
                              className="btn-secondary text-xs px-3 py-1.5 font-heading font-semibold rounded-xl border border-border inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                              >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                              <span>PDF</span>
                            </button>
                          </>
                        ) : certEligibility.eligible ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setPayingCourse(item)}
                              className="btn-primary text-xs px-3.5 py-1.5 font-heading font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 cursor-pointer text-white"
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <circle cx="12" cy="8" r="7" />
                                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                              </svg>
                              <span>Claim Certificate · ₹29</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedCertCourse(item)}
                              className="btn-secondary text-xs px-2.5 py-1.5 font-heading font-semibold rounded-xl border border-border text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              Preview
                            </button>
                          </>
                        ) : null}

                        <Link
                          href={`/course/${course.id}?review=true&start=true`}
                          className="btn-ghost text-xs px-3 py-1.5 font-heading font-semibold text-muted-foreground hover:text-foreground ml-auto inline-flex items-center gap-1"
                        >
                          <span>Review</span>
                          <span>&rarr;</span>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    /* Case 3: In Progress / All Courses — Clean Learning Action (No Certificate Clutter) */
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-body text-muted-foreground">
                        {completedCount === 0
                          ? "Just Started"
                          : `${completedCount}/${course.lessonCount} done`}
                      </span>
                      <Link
                        href={`/course/${course.id}?start=true`}
                        className="btn-primary text-xs font-heading font-bold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <span>{completedCount === 0 ? "Start Learning" : "Continue Lesson"}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Remove Course Confirmation Modal */}
      {courseToRemove && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="enterprise-card p-6 bg-card border border-border rounded-2xl max-w-sm w-full shadow-xl text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <h3 className="font-heading font-bold text-lg text-foreground mb-1">Remove Course?</h3>
            <p className="text-xs text-muted-foreground font-body mb-5 leading-relaxed">
              Do you want to remove{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{courseToRemove.course.title}&rdquo;
              </span>{" "}
              from your dashboard? You can re-enroll anytime.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCourseToRemove(null)}
                disabled={isRemoving}
                className="btn-ghost flex-1 py-2.5 text-xs font-heading font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                disabled={isRemoving}
                className="btn-destructive flex-1 py-2.5 text-xs font-heading font-bold shadow-md"
              >
                {isRemoving ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Certificate Modal */}
      {selectedCertCourse &&
        (() => {
          let avgQuizScore: number | null = null;
          if (selectedCertCourse.progress.quizScores) {
            const scoreValues = Object.values(selectedCertCourse.progress.quizScores);
            if (scoreValues.length > 0) {
              const earned = scoreValues.reduce((acc, s) => acc + (s.score || 0), 0);
              const max = scoreValues.reduce((acc, s) => acc + (s.total || 0), 0);
              avgQuizScore = max > 0 ? Math.round((earned / max) * 100) : null;
            }
          }

          return (
            <CertificateModal
              isOpen={Boolean(selectedCertCourse)}
              onClose={() => setSelectedCertCourse(null)}
              userName={
                (typeof window !== "undefined"
                  ? localStorage.getItem(`veyskill_paid_name_${selectedCertCourse.course.id}`)
                  : null) ||
                user?.displayName ||
                "Distinguished Scholar"
              }
              courseTitle={selectedCertCourse.course.title}
              lessonCount={selectedCertCourse.course.lessonCount || 12}
              quizScore={avgQuizScore}
              quizTotal={100}
              uid={user?.uid}
              courseId={selectedCertCourse.course.id}
              orderId={
                typeof window !== "undefined"
                  ? localStorage.getItem(`veyskill_paid_${selectedCertCourse.course.id}`) ||
                    selectedCertCourse.progress.paidOrderId ||
                    undefined
                  : selectedCertCourse.progress.paidOrderId || undefined
              }
              onRequestPayment={() => {
                const c = selectedCertCourse;
                setSelectedCertCourse(null);
                setPayingCourse(c);
              }}
            />
          );
        })()}

      {/* Payment Gate Modal for ₹29 Certificate Unlock */}
      {payingCourse && (
        <PaymentGate
          isOpen={Boolean(payingCourse)}
          onClose={() => setPayingCourse(null)}
          courseId={payingCourse.course.id}
          courseTitle={payingCourse.course.title}
          lessonCount={payingCourse.course.lessonCount}
          description={payingCourse.course.description}
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
          onPaymentSuccess={(orderId, confirmedName) => {
            paidCourseIds.add(payingCourse.course.id);
            setPaidCourseIds(new Set(paidCourseIds));
            try {
              localStorage.setItem(`veyskill_paid_${payingCourse.course.id}`, orderId);
              if (confirmedName) {
                localStorage.setItem(`veyskill_paid_name_${payingCourse.course.id}`, confirmedName);
              }
            } catch {}
            if (user?.uid) {
              recordPaidCertificate(user.uid, payingCourse.course.id, orderId);
            }
            const c = payingCourse;
            setPayingCourse(null);
            setSelectedCertCourse(c);
          }}
        />
      )}

      {/* Quick Verification & Strict ID Detector Modal */}
      {quickVerifyOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="verify-modal-title"
        >
          <div className="enterprise-card w-full max-w-lg bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                </div>
                <div>
                  <h3
                    id="verify-modal-title"
                    className="font-heading font-black text-lg text-foreground"
                  >
                    Credential Verification
                  </h3>
                  <p className="text-xs text-muted-foreground font-body">
                    Cryptographic HMAC-SHA256 &amp; Sovereign Registry Engine
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickVerifyOpen(false)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Close verification modal"
              >
                ✕
              </button>
            </div>

            {/* Strict ID Verification Tester */}
            <div className="space-y-3">
              <label
                htmlFor="quick-verify-input"
                className="block text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground"
              >
                Detect &amp; Verify Any Credential ID:
              </label>

              <div className="flex gap-2">
                <input
                  id="quick-verify-input"
                  type="text"
                  value={testInputId}
                  onChange={(e) => setTestInputId(e.target.value)}
                  placeholder="Enter certificate ID or link"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-teal-500 text-foreground font-mono text-xs uppercase outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleTestVerify(testInputId)}
                  disabled={testLoading || !testInputId.trim()}
                  className="btn-primary px-4 py-2.5 text-xs font-heading font-bold disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {testLoading ? (
                    <div className="simple-loader !w-3.5 !h-3.5 !border-2" />
                  ) : (
                    <span>Check</span>
                  )}
                </button>
              </div>

              {/* Quick sample chips */}
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span>Try benchmark:</span>
                <button
                  type="button"
                  onClick={() => {
                    setTestInputId("VS-9A3F1B8E2C");
                    handleTestVerify("VS-9A3F1B8E2C");
                  }}
                  className="font-mono text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  VS-9A3F1B8E2C
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => {
                    setTestInputId("VS-88421099FF");
                    handleTestVerify("VS-88421099FF");
                  }}
                  className="font-mono text-teal-600 dark:text-teal-400 hover:underline"
                >
                  VS-88421099FF
                </button>
              </div>
            </div>

            {/* Test Result Display */}
            {testResult && (
              <div
                className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  testResult.isValid
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                    : "bg-destructive/10 border-destructive/30 text-destructive"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading font-extrabold uppercase tracking-wider text-[11px] flex items-center gap-1">
                    {testResult.isValid ? (
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
                        <span>Verified Authentic Credential</span>
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
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>Verification Failed · Fake/Unrecognized ID</span>
                      </>
                    )}
                  </span>
                  <span className="font-mono text-[10px] bg-background/60 px-2 py-0.5 rounded border border-border">
                    {testResult.id}
                  </span>
                </div>

                {testResult.isValid && testResult.certificate ? (
                  <div className="space-y-1 pt-1 font-body text-foreground">
                    <p>
                      <strong>Scholar:</strong> {testResult.certificate.userName}
                    </p>
                    <p>
                      <strong>Curriculum:</strong> {testResult.certificate.courseTitle}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      Validation: {testResult.certificate.verificationMethod}
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setQuickVerifyOpen(false);
                          router.push(`/verify/${testResult.id}`);
                        }}
                        className="btn-ghost text-xs w-full py-2 font-heading font-bold border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 inline-flex items-center justify-center gap-1"
                      >
                        <span>Open Public Registry Record →</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="font-body text-xs mt-1 leading-relaxed">
                    {testResult.reason ||
                      "The credential ID failed cryptographic checksum validation and is not registered in the VeySkill ledger."}
                  </p>
                )}
              </div>
            )}

            <div className="text-[11px] text-muted-foreground font-body border-t border-border/60 pt-3 flex items-center justify-between">
              <span>Looking for public verify page?</span>
              <Link
                href="/verify"
                className="text-primary-600 dark:text-primary-400 font-heading font-bold hover:underline"
              >
                Go to /verify →
              </Link>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-heading font-bold px-4 py-2 rounded-full shadow-2xl z-50 flex items-center gap-2 animate-scale-in">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-emerald-400 dark:text-emerald-600"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
