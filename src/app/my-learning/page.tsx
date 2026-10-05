"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getUserProgress, getCourse } from "@/lib/firestore";
import type { CourseDoc, ProgressDoc } from "@/lib/types";
import { CourseraLoader } from "@/components/ui/CourseraLoader";
import { CertificateModal } from "@/components/courses/CertificateModal";
import { normalizeCertificateId, verifyCertificateId } from "@/lib/security";

interface CourseWithProgress {
  course: CourseDoc;
  progress: ProgressDoc;
}

export default function MyLearningPage() {
  const router = useRouter();
  const { user, loading, openAuthModal } = useAuth();
  const [items, setItems] = useState<CourseWithProgress[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState<"all" | "in_progress" | "completed">("all");

  // Certificate Modal State
  const [selectedCertCourse, setSelectedCertCourse] = useState<CourseWithProgress | null>(null);

  // Quick Inline Verification Dialog State
  const [quickVerifyOpen, setQuickVerifyOpen] = useState(false);
  const [activeVerifyCourse, setActiveVerifyCourse] = useState<CourseWithProgress | null>(null);
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
            results.push({ course, progress: prog });
          }
        }

        // Sort by most recently active
        results.sort((a, b) => {
          const timeA = a.progress.updatedAt?.toMillis?.() ?? 0;
          const timeB = b.progress.updatedAt?.toMillis?.() ?? 0;
          return timeB - timeA;
        });

        if (isMounted) setItems(results);
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

  const displayedItems =
    filter === "in_progress" ? inProgressItems : filter === "completed" ? completedItems : items;

  // Open Quick Verify for a specific completed course
  const handleOpenVerifyForCourse = (item: CourseWithProgress) => {
    setActiveVerifyCourse(item);
    setTestResult(null);
    setTestInputId("");
    setQuickVerifyOpen(true);
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
      <div className="container-page py-16 max-w-5xl flex items-center justify-center">
        <CourseraLoader
          title="Loading Your Learning Progress…"
          subtitle="Fetching your enrolled courses, syllabus checklists, and daily progress"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-page py-20 text-center max-w-md mx-auto">
        <div className="clay-card p-8 bg-card border border-border text-center rounded-3xl">
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
            Sign in to track your started courses, claim accredited completion certificates, and
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
              Pick up right where you left off across your enrolled courses and accredited diplomas.
            </p>
          </div>

          <div className="flex items-center gap-2">
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

      {/* Earned Credentials Highlight Banner (When completed courses exist) */}
      {completedItems.length > 0 && (
        <div className="clay-card p-5 sm:p-6 mb-8 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-card border border-emerald-500/30 shadow-lg">
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
                    ACCREDITED HONORS
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {completedItems.length} Available
                  </span>
                </div>
                <h2 className="font-heading font-extrabold text-base sm:text-lg text-foreground mt-0.5">
                  Academic Certificates &amp; Tamper-Proof Credentials
                </h2>
                <p className="font-body text-xs text-muted-foreground mt-0.5 max-w-xl">
                  You have successfully completed 100% curriculum requirements. View and download
                  official vector PDF diplomas, share to LinkedIn, or verify cryptographic IDs.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setSelectedCertCourse(completedItems[0] || null)}
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

              <button
                type="button"
                onClick={() => handleOpenVerifyForCourse(completedItems[0] || null)}
                className="btn-ghost text-xs font-heading font-bold px-3 py-2.5 inline-flex items-center gap-1 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                title="Strict cryptographic verification check"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
                <span>Verify</span>
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
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-card border border-border text-foreground hover:bg-muted"
            }`}
          >
            <span>Completed</span>
            <span>({completedItems.length})</span>
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="clay-card p-12 text-center max-w-2xl mx-auto bg-card border-2 border-dashed border-border rounded-3xl">
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
        <div className="clay-card p-12 text-center max-w-md mx-auto bg-card border border-border rounded-2xl">
          <p className="font-heading font-bold text-base text-foreground mb-2">
            {filter === "completed"
              ? "No completed courses yet"
              : "No courses currently in progress"}
          </p>
          <p className="text-xs text-muted-foreground font-body mb-4">
            {filter === "completed"
              ? "Finish watching all lessons in any course to unlock your official verified certificate."
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {displayedItems.map((item) => {
            const { course, progress } = item;
            const completedCount = progress.completedLessonIds?.length || 0;
            const totalCount = Math.max(1, course.lessonCount || 1);
            const pct = Math.min(100, Math.max(0, Math.round((completedCount / totalCount) * 100)));
            const isFinished = pct === 100;

            return (
              <div
                key={course.id}
                className={`clay-card p-5 flex flex-col justify-between bg-card border rounded-2xl transition-all shadow-sm hover:shadow-md ${
                  isFinished
                    ? "border-emerald-500/50 hover:border-emerald-500 shadow-emerald-500/5"
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
                      {course.coverVideoId ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`https://img.youtube.com/vi/${course.coverVideoId}/hqdefault.jpg`}
                          alt={`${course.title} cover`}
                          className="w-24 sm:w-28 aspect-video object-cover rounded-xl border border-border group-hover:scale-105 transition-transform"
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
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="badge-primary text-[10px] font-heading font-bold inline-block">
                          {course.creatorName ? `By ${course.creatorName}` : "Enrolled Masterclass"}
                        </span>
                        {isFinished && (
                          <span className="text-[10px] font-heading font-black text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
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
                            <span>100% Completed</span>
                          </span>
                        )}
                      </div>
                      <Link href={`/course/${course.id}?start=true`} className="group">
                        <h3 className="font-heading font-bold text-sm sm:text-base text-foreground line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
                          {course.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-muted-foreground font-body mt-0.5 truncate">
                        {course.lessonCount} video lessons
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
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
                </div>

                {/* Footer Action Area */}
                <div className="pt-3 border-t border-border mt-3 space-y-2">
                  {/* Completed Course Certificate Actions */}
                  {isFinished ? (
                    <div className="flex items-center gap-2">
                      {/* 1. Main Get / View Certificate Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedCertCourse(item)}
                        className="btn-primary flex-1 py-2 px-3 text-xs font-heading font-extrabold inline-flex items-center justify-center gap-1.5 shadow-sm min-h-[38px] cursor-pointer"
                        title="View and download your official certificate"
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
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span>Certificate</span>
                      </button>

                      {/* 2. Small Verify Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenVerifyForCourse(item)}
                        className="px-3 py-2 text-xs font-heading font-bold rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 inline-flex items-center justify-center gap-1 transition-all min-h-[38px] cursor-pointer"
                        title="Verify cryptographic authenticity in official registry"
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
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          <polyline points="9 12 11 14 15 10" />
                        </svg>
                        <span>Verify</span>
                      </button>

                      {/* 3. Review Syllabus Link */}
                      <Link
                        href={`/course/${course.id}?start=true`}
                        className="p-2 text-xs text-muted-foreground hover:text-foreground rounded-xl border border-border hover:bg-muted inline-flex items-center justify-center min-h-[38px]"
                        title="Review course video lessons"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-body text-muted-foreground">
                        {pct === 0 ? "Just Enrolled" : "In progress"}
                      </span>
                      <Link
                        href={`/course/${course.id}?start=true`}
                        className="text-xs font-heading font-bold text-primary-600 dark:text-primary-400 hover:translate-x-0.5 transition-transform inline-flex items-center gap-1"
                      >
                        <span>{pct === 0 ? "Get Started" : "Resume"}</span>
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
              userName={user?.displayName || "Distinguished Scholar"}
              courseTitle={selectedCertCourse.course.title}
              lessonCount={selectedCertCourse.course.lessonCount || 12}
              quizScore={avgQuizScore}
              quizTotal={100}
              uid={user?.uid}
              courseId={selectedCertCourse.course.id}
            />
          );
        })()}

      {/* Quick Verification & Strict ID Detector Modal */}
      {quickVerifyOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="verify-modal-title"
        >
          <div className="clay-card w-full max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
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

            {/* Course Status Summary */}
            {activeVerifyCourse && (
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2 text-xs font-body">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Certified Course:</span>
                  <span className="font-heading font-bold text-foreground truncate max-w-[240px]">
                    {activeVerifyCourse.course.title}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Candidate:</span>
                  <span className="font-semibold text-foreground">
                    {user?.displayName || "Distinguished Scholar"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    100% Completed &amp; Eligible
                  </span>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setQuickVerifyOpen(false);
                      setSelectedCertCourse(activeVerifyCourse);
                    }}
                    className="btn-primary text-xs w-full py-2 font-heading font-bold inline-flex items-center justify-center gap-1.5"
                  >
                    <span>Open Official Certificate</span>
                  </button>
                </div>
              </div>
            )}

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
                  placeholder="e.g. VS-9A3F1B8E2C or paste link"
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
                    setTestInputId("VC-DEMO");
                    handleTestVerify("VC-DEMO");
                  }}
                  className="font-mono text-teal-600 dark:text-teal-400 hover:underline"
                >
                  VC-DEMO
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
    </div>
  );
}
