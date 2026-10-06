"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getCoursesByCreator, deleteCourse } from "@/lib/firestore";
import type { CourseDoc } from "@/lib/types";

export default function MyCoursesPage() {
  const { user, loading, openAuthModal } = useAuth();
  const [courses, setCourses] = useState<CourseDoc[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Delete modal state
  const [courseToDelete, setCourseToDelete] = useState<CourseDoc | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".menu-trigger-container")) {
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
    getCoursesByCreator(user.uid)
      .then((data) => {
        if (isMounted) setCourses(data);
      })
      .finally(() => {
        if (isMounted) setFetching(false);
      });
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Analytics computation
  const stats = useMemo(() => {
    const total = courses.length;
    const published = courses.filter((c) => c.status === "published").length;
    const drafts = total - published;
    const totalLessons = courses.reduce((sum, c) => sum + (c.lessonCount || 0), 0);
    const estMinutes = totalLessons * 12; // Average 12 mins per lesson
    return { total, published, drafts, totalLessons, estMinutes };
  }, [courses]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "published"
            ? c.status === "published"
            : c.status === "draft";
      const matchesSearch =
        !searchQuery.trim() ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [courses, filter, searchQuery]);

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteCourse(courseToDelete.id);
      setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
      setCourseToDelete(null);
    } catch {
      setDeleteError("Failed to delete the course. Please check your connection and try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyLink = (courseId: string) => {
    const url = `${window.location.origin}/course/${courseId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(courseId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  if (loading || fetching) {
    return (
      <div className="container-page py-10 max-w-6xl mx-auto px-4 animate-pulse">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-48 bg-muted/80 rounded-xl" />
          <div className="h-10 w-32 bg-muted/70 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-muted/50 rounded-2xl border border-border/40" />
          <div className="h-64 bg-muted/50 rounded-2xl border border-border/40" />
          <div className="h-64 bg-muted/50 rounded-2xl border border-border/40" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-page py-20 text-center max-w-md mx-auto">
        <div className="clay-card p-8 bg-card border border-border text-center rounded-3xl shadow-xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-primary-100 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 flex items-center justify-center text-primary-600 dark:text-primary-400 shadow-sm">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="inline-block px-3 py-1 rounded-full bg-muted border border-border text-muted-foreground font-mono text-[11px] font-bold uppercase tracking-wider mb-3">
            Creator Studio Access
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-foreground mb-2">
            My Courses & Studio
          </h1>
          <p className="font-body text-xs sm:text-sm text-muted-foreground mb-6 leading-relaxed max-w-xs mx-auto">
            Sign in to create, publish, and monitor your courses, student analytics, and curriculum
            chapters.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => openAuthModal("signin")}
              className="btn-primary w-full sm:w-auto px-6 py-2.5 text-xs font-heading font-bold shadow-md cursor-pointer"
            >
              Sign In to Studio
            </button>
            <button
              type="button"
              onClick={() => openAuthModal("signup")}
              className="btn-secondary w-full sm:w-auto px-6 py-2.5 text-xs font-heading font-bold cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-heading font-bold mb-2 border border-primary-200 dark:border-primary-800">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>Creator Studio</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground">
            My Courses
          </h1>
          <p className="font-body text-sm sm:text-base text-muted-foreground mt-1">
            Build, publish, and manage your YouTube-powered courses for thousands of learners.
          </p>
        </div>

        <Link
          href="/create"
          className="btn-accent px-5 py-3 text-sm inline-flex items-center gap-2 self-start sm:self-auto shadow-md hover:shadow-lg transition-all min-h-[44px]"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Create New Course</span>
        </Link>
      </div>

      {/* Analytics Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="clay-card p-4 sm:p-5 bg-card border border-border">
          <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Total Courses
          </p>
          <p className="font-heading font-black text-2xl sm:text-3xl text-foreground">
            {stats.total}
          </p>
          <p className="font-body text-[11px] text-muted-foreground mt-1">In your studio</p>
        </div>

        <div className="clay-card p-4 sm:p-5 bg-card border border-border">
          <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Published Live
          </p>
          <p className="font-heading font-black text-2xl sm:text-3xl text-emerald-600 dark:text-emerald-400">
            {stats.published}
          </p>
          <p className="font-body text-[11px] text-muted-foreground mt-1">
            Discoverable by learners
          </p>
        </div>

        <div className="clay-card p-4 sm:p-5 bg-card border border-border">
          <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Total Lessons
          </p>
          <p className="font-heading font-black text-2xl sm:text-3xl text-primary-600 dark:text-primary-400">
            {stats.totalLessons}
          </p>
          <p className="font-body text-[11px] text-muted-foreground mt-1">Video modules created</p>
        </div>

        <div className="clay-card p-4 sm:p-5 bg-card border border-border">
          <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Est. Content Hours
          </p>
          <p className="font-heading font-black text-2xl sm:text-3xl text-amber-600 dark:text-amber-400">
            {(stats.estMinutes / 60).toFixed(1)}h
          </p>
          <p className="font-body text-[11px] text-muted-foreground mt-1">
            Total curriculum length
          </p>
        </div>
      </div>

      {/* Search & Tabs */}
      {courses.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          {/* Filter Tabs */}
          <div className="inline-flex p-1 bg-muted rounded-xl self-start max-w-full overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-4 py-2 min-h-[44px] inline-flex items-center justify-center rounded-lg font-heading font-bold text-xs transition-all ${
                filter === "all"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({courses.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("published")}
              className={`px-4 py-2 min-h-[44px] inline-flex items-center justify-center rounded-lg font-heading font-bold text-xs transition-all ${
                filter === "published"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Published ({stats.published})
            </button>
            <button
              type="button"
              onClick={() => setFilter("draft")}
              className={`px-4 py-2 min-h-[44px] inline-flex items-center justify-center rounded-lg font-heading font-bold text-xs transition-all ${
                filter === "draft"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Drafts ({stats.drafts})
            </button>
          </div>

          {/* Search filter input */}
          <div className="relative sm:w-64">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search your courses…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground font-body text-base sm:text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
            />
          </div>
        </div>
      )}

      {/* Courses List */}
      {courses.length === 0 ? (
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
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-foreground mb-2">
            Create Your First Masterclass
          </h2>
          <p className="text-muted-foreground font-body text-sm mb-6 max-w-md mx-auto">
            Organize YouTube tutorials, lectures, and guides into structured, distraction-free
            courses. Free forever for your students.
          </p>
          <Link
            href="/create"
            className="btn-accent px-6 py-3 text-sm inline-flex items-center gap-2 min-h-[48px]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Create Course Now</span>
          </Link>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="clay-card p-10 text-center bg-card">
          <p className="text-muted-foreground font-body text-sm mb-3">
            No courses match your current search or filter criteria.
          </p>
          <button
            type="button"
            onClick={() => {
              setFilter("all");
              setSearchQuery("");
            }}
            className="btn-ghost text-xs px-4 py-2"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="clay-card p-5 sm:p-6 bg-card border border-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:border-primary-400/50 transition-all"
            >
              {/* Left: Thumbnail & Details */}
              <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                {course.coverVideoId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://img.youtube.com/vi/${course.coverVideoId}/hqdefault.jpg`}
                    alt={`${course.title} thumbnail`}
                    className="w-24 sm:w-28 aspect-video object-cover rounded-xl flex-shrink-0 border border-border shadow-sm"
                  />
                ) : (
                  <div className="w-24 sm:w-28 aspect-video rounded-xl bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground border border-border">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className={`text-[10px] font-heading font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        course.status === "published"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                      }`}
                    >
                      {course.status === "published" ? "Published Live" : "Draft"}
                    </span>
                    <span className="text-[11px] font-body text-muted-foreground">
                      {course.category}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-base sm:text-lg text-foreground truncate">
                    {course.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-body mt-0.5 line-clamp-1">
                    {course.description || "No description provided."}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-body mt-2">
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      {course.lessonCount} {course.lessonCount === 1 ? "lesson" : "lessons"}
                    </span>
                    <span>·</span>
                    <span>~{course.lessonCount * 12} mins</span>
                  </div>
                </div>
              </div>

              {/* Right: Quick Action + Sleek 3-Dot Actions Menu */}
              <div className="relative menu-trigger-container flex items-center gap-2 flex-shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto justify-end border-border">
                {course.status === "published" ? (
                  <Link
                    href={`/course/${course.id}`}
                    className="btn-primary text-xs px-3.5 py-2 inline-flex items-center gap-1.5 min-h-[42px] font-heading font-bold shadow-sm active:scale-95"
                    aria-label={`View live ${course.title}`}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span>View Live</span>
                  </Link>
                ) : (
                  <Link
                    href={`/edit/${course.id}`}
                    className="btn-primary text-xs px-3.5 py-2 inline-flex items-center gap-1.5 min-h-[42px] font-heading font-bold shadow-sm active:scale-95"
                    aria-label={`Edit ${course.title}`}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    <span>Continue Edit</span>
                  </Link>
                )}

                {/* 3-Dot Dropdown Options Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === course.id ? null : course.id);
                    }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                      openMenuId === course.id
                        ? "bg-muted border-primary-500 text-foreground shadow-sm scale-105"
                        : "bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground active:scale-95"
                    }`}
                    aria-label="Course options menu"
                    title="Course Options"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="5" r="2.2" />
                      <circle cx="12" cy="12" r="2.2" />
                      <circle cx="12" cy="19" r="2.2" />
                    </svg>
                  </button>

                  {/* Dropdown Menu Popover */}
                  {openMenuId === course.id && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-card/95 dark:bg-card/95 backdrop-blur-xl border border-border/90 rounded-2xl shadow-2xl p-1.5 z-40 animate-fade-in divide-y divide-border/50">
                      <div className="space-y-0.5 pb-1">
                        {course.status === "published" && (
                          <Link
                            href={`/course/${course.id}`}
                            onClick={() => setOpenMenuId(null)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-heading font-semibold text-foreground hover:bg-muted/80 transition-colors"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="text-teal-500"
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            <span>View Live Course</span>
                          </Link>
                        )}

                        <Link
                          href={`/edit/${course.id}`}
                          onClick={() => setOpenMenuId(null)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-heading font-semibold text-foreground hover:bg-muted/80 transition-colors"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-primary-500"
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                          <span>Edit Curriculum</span>
                        </Link>

                        {course.status === "published" && (
                          <button
                            type="button"
                            onClick={() => {
                              handleCopyLink(course.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-heading font-semibold text-foreground hover:bg-muted/80 transition-colors text-left cursor-pointer"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="text-amber-500"
                            >
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                            <span>
                              {copiedId === course.id ? "Link Copied!" : "Copy Share Link"}
                            </span>
                          </button>
                        )}
                      </div>

                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setCourseToDelete(course);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-heading font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          <span>Delete Course</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {courseToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="w-full max-w-md bg-card border-2 border-destructive/40 rounded-2xl p-6 sm:p-8 shadow-2xl animate-scale-in max-h-[90dvh] overflow-y-auto">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>

            <h2
              id="delete-dialog-title"
              className="font-heading font-extrabold text-xl text-foreground mb-2"
            >
              Delete Course?
            </h2>
            <p className="font-body text-sm text-muted-foreground mb-2">
              Are you sure you want to permanently delete{" "}
              <span className="font-bold text-foreground">
                &ldquo;{courseToDelete.title}&rdquo;
              </span>
              ?
            </p>
            <p className="font-body text-xs text-destructive/90 bg-destructive/10 p-3 rounded-xl mb-6">
              This will remove all {courseToDelete.lessonCount} video lessons and student progress.
              This action cannot be undone.
            </p>

            {deleteError && (
              <div className="p-3 mb-4 rounded-xl border border-destructive bg-destructive/10 text-destructive text-xs font-body">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCourseToDelete(null)}
                disabled={isDeleting}
                className="btn-ghost flex-1 py-2.5 text-sm min-h-[44px] flex items-center justify-center"
              >
                Keep Course
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="btn-destructive flex-1 py-2.5 text-sm min-h-[44px] inline-flex items-center justify-center gap-2"
              >
                {isDeleting ? (
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
                    <span>Deleting…</span>
                  </>
                ) : (
                  <span>Yes, Delete Course</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
