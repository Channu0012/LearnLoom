"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getUserProgress, getCourse } from "@/lib/firestore";
import type { CourseDoc, ProgressDoc } from "@/lib/types";
import { CourseraLoader } from "@/components/ui/CourseraLoader";

interface CourseWithProgress {
  course: CourseDoc;
  progress: ProgressDoc;
}

export default function MyLearningPage() {
  const { user, loading, openAuthModal } = useAuth();
  const [items, setItems] = useState<CourseWithProgress[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState<"all" | "in_progress" | "completed">("all");

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
            Sign in to track your started courses, take study notes, and resume where you left off
            across all devices.
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
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground">
          My Learning
        </h1>
        <p className="font-body text-sm text-muted-foreground mt-1">
          Pick up right where you left off across your enrolled courses and daily streaks.
        </p>
      </div>

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
              ? "Finish watching all lessons in any course to see it listed here."
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
          {displayedItems.map(({ course, progress }) => {
            const completedCount = progress.completedLessonIds?.length || 0;
            const totalCount = course.lessonCount || 1;
            const pct = Math.min(100, Math.round((completedCount / totalCount) * 100));
            const isFinished = pct === 100;

            return (
              <Link
                key={course.id}
                href={`/course/${course.id}?start=true`}
                className={`clay-card p-5 flex flex-col justify-between group bg-card border rounded-2xl active:scale-[0.98] transition-all shadow-sm hover:shadow-md ${
                  isFinished
                    ? "border-emerald-500/50 hover:border-emerald-500 shadow-emerald-500/5"
                    : "border-border hover:border-primary-400/60"
                }`}
                aria-label={`${course.title} — ${pct}% completed`}
              >
                <div>
                  <div className="flex gap-4 items-start mb-4">
                    {/* Thumbnail */}
                    {course.coverVideoId ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`https://img.youtube.com/vi/${course.coverVideoId}/hqdefault.jpg`}
                        alt={`${course.title} cover`}
                        className="w-24 sm:w-28 aspect-video object-cover rounded-xl flex-shrink-0 border border-border group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-24 sm:w-28 aspect-video rounded-xl bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground">
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

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="badge-primary text-[10px] font-heading font-bold inline-block">
                          {course.category}
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
                            <span>Completed</span>
                          </span>
                        )}
                      </div>
                      <h3 className="font-heading font-bold text-sm sm:text-base text-foreground line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
                        {course.title}
                      </h3>
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

                {/* Footer Action */}
                <div className="pt-3 border-t border-border flex items-center justify-between mt-2">
                  <span className="text-[11px] font-body text-muted-foreground">
                    {isFinished ? "Finished 100%" : pct === 0 ? "Just Enrolled" : "In progress"}
                  </span>
                  <span
                    className={`text-xs font-heading font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1 ${
                      isFinished
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-primary-600 dark:text-primary-400"
                    }`}
                  >
                    <span>
                      {isFinished ? "Review Course Lessons" : pct === 0 ? "Get Started" : "Resume"}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
