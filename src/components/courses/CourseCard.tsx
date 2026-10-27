"use client";

import { useState, useRef, useEffect, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CourseDoc } from "@/lib/types";
import { useCourseInstructor } from "@/lib/courseInstructor";

interface CourseCardProps {
  course: CourseDoc;
}

export function CourseCard({ course }: CourseCardProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const primaryThumb =
    course.coverThumbnailUrl ||
    (course.coverVideoId ? `https://i.ytimg.com/vi/${course.coverVideoId}/mqdefault.jpg` : null);

  const [currentThumb, setCurrentThumb] = useState<string | null>(primaryThumb);
  const [hasThumbError, setHasThumbError] = useState(!primaryThumb);
  const [fallbackAttempt, setFallbackAttempt] = useState(0);

  useEffect(() => {
    const nextThumb =
      course.coverThumbnailUrl ||
      (course.coverVideoId ? `https://i.ytimg.com/vi/${course.coverVideoId}/mqdefault.jpg` : null);
    setCurrentThumb(nextThumb);
    setHasThumbError(!nextThumb);
    setFallbackAttempt(0);
  }, [course.coverThumbnailUrl, course.coverVideoId]);

  const handleThumbError = () => {
    if (!course.coverVideoId) {
      setHasThumbError(true);
      return;
    }
    if (fallbackAttempt === 0) {
      setFallbackAttempt(1);
      setCurrentThumb(`https://img.youtube.com/vi/${course.coverVideoId}/hqdefault.jpg`);
    } else if (fallbackAttempt === 1) {
      setFallbackAttempt(2);
      setCurrentThumb(`https://i.ytimg.com/vi/${course.coverVideoId}/default.jpg`);
    } else {
      setHasThumbError(true);
    }
  };

  // Authentic YouTube Channel Owner / Instructor Info (reactively resolved from video if needed)
  const instructor = useCourseInstructor(course);
  const creatorInitial = instructor.avatarInitial;

  // Color palette for creator avatar based on instructor name hash
  const avatarColors = [
    "from-teal-500 to-emerald-600",
    "from-indigo-500 to-purple-600",
    "from-blue-500 to-cyan-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
  ];
  const colorIndex = (instructor.name.length || 0) % avatarColors.length;
  const avatarGradient = avatarColors[colorIndex];

  // Close dropdown on click outside
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const handleCardClick = () => {
    router.push(`/course/${course.id}?start=true`);
  };

  const handleMenuToggle = (e: MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
  };

  const handleCopyLink = async (e: MouseEvent) => {
    e.stopPropagation();
    try {
      const url = `${window.location.origin}/course/${course.id}`;
      await navigator.clipboard.writeText(url);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2200);
    } catch {
      // Fallback
    }
    setIsMenuOpen(false);
  };

  const handleShare = async (e: MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/course/${course.id}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: course.title,
          text: `Learn "${course.title}" by ${instructor.name} on VeySkill with AI notes and verified certificate:`,
          url,
        });
      } catch {
        // Share cancelled or unavailable
      }
    } else {
      await handleCopyLink(e);
    }
    setIsMenuOpen(false);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col bg-card rounded-2xl border border-border/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-visible active:scale-[0.99]"
      role="article"
      aria-label={`${course.title} — ${course.lessonCount} lessons`}
    >
      {/* ── 1. Thumbnail Container (YouTube 16:9 Standard) ── */}
      <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl bg-muted">
        {!hasThumbError && currentThumb ? (
          <Image
            src={currentThumb}
            alt={`${course.title} thumbnail`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized // YouTube CDN
            onError={handleThumbError}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-teal-400 p-4 text-center">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center mb-2 shadow-inner">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <span className="text-xs font-heading font-bold text-slate-200 line-clamp-1">
              {course.title}
            </span>
            <span className="text-[10px] font-mono text-teal-400/80 uppercase tracking-wider mt-0.5">
              {course.category || "Masterclass"}
            </span>
          </div>
        )}

        {/* Free Badge */}
        <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-sm text-white text-[10px] font-heading font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
          Free
        </div>

        {/* YouTube-Style Lesson Count Pill */}
        <div
          className="absolute bottom-2.5 right-2.5 bg-black/85 backdrop-blur-sm text-white text-[11px] font-heading font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md"
          aria-label={`${course.lessonCount} lessons`}
        >
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
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <span>
            {course.lessonCount} {course.lessonCount === 1 ? "lesson" : "lessons"}
          </span>
        </div>
      </div>

      {/* ── 2. Content Block (YouTube-Style Channel Avatar + Details + 3-Dot) ── */}
      <div className="p-4 flex gap-3 items-start flex-1">
        {/* Creator Avatar / Channel Icon */}
        <div
          className={`w-9 h-9 rounded-full bg-gradient-to-tr ${avatarGradient} text-white font-heading font-black text-xs flex items-center justify-center shrink-0 shadow-xs ring-1 ring-black/5 dark:ring-white/10`}
          title={`Instructor: ${instructor.name}`}
        >
          {creatorInitial}
        </div>

        {/* Main Metadata */}
        <div className="min-w-0 flex-1">
          {/* Title */}
          <h3 className="font-heading font-bold text-sm sm:text-base text-foreground line-clamp-2 leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            {course.title}
          </h3>

          {/* Authentic YouTube Channel Owner / Instructor with Verified Checkmark */}
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground font-body truncate">
            <span className="font-semibold text-foreground/95 truncate inline-flex items-center gap-1">
              <span className="text-[9px] font-black uppercase text-red-600 dark:text-red-400 bg-red-500/10 px-1 py-0.2 rounded tracking-tight shrink-0">
                YT
              </span>
              {instructor.name}
            </span>
            <svg
              className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-label="Verified YouTube Instructor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>

          {/* Secondary Details: Modules • Verified Certificate */}
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground font-body">
            <span>{course.lessonCount} lessons</span>
            <span>•</span>
            <span className="text-teal-600 dark:text-teal-400 font-medium">
              Verified Certificate
            </span>
          </div>
        </div>

        {/* ── 3. Three-Dot Options Menu (YouTube-Style) ── */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={handleMenuToggle}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            aria-label="More course options"
            title="Options"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          {/* Dropdown Popover */}
          {isMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-1.5 w-48 bg-card border border-border rounded-2xl shadow-xl p-1 z-50 animate-fade-in divide-y divide-border/60"
            >
              <div className="space-y-0.5 pb-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    router.push(`/course/${course.id}?start=true`);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-heading font-semibold text-foreground hover:bg-muted text-left cursor-pointer transition-colors"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-teal-600"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>Start Learning</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-heading font-semibold text-foreground hover:bg-muted text-left cursor-pointer transition-colors"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-indigo-600"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>Copy Course Link</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-heading font-semibold text-foreground hover:bg-muted text-left cursor-pointer transition-colors"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-amber-600"
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  <span>Share Course</span>
                </button>
              </div>

              <div className="pt-1">
                <Link
                  href={`/course/${course.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-heading font-semibold text-muted-foreground hover:text-foreground hover:bg-muted text-left transition-colors"
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
                  <span>View Syllabus</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Copy Toast Feedback */}
      {copiedToast && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-heading font-bold px-3 py-1.5 rounded-full shadow-lg z-50 flex items-center gap-1.5 animate-scale-in"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-emerald-400 dark:text-emerald-600"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Link copied!</span>
        </div>
      )}
    </div>
  );
}

/** Skeleton placeholder while loading */
export function CourseCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border/80 overflow-hidden" aria-hidden="true">
      <div className="aspect-video skeleton rounded-t-2xl" />
      <div className="p-4 flex gap-3 items-start">
        <div className="w-9 h-9 skeleton rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-5/6 rounded-md" />
          <div className="skeleton h-3 w-1/2 rounded-md" />
          <div className="skeleton h-3 w-1/3 rounded-md" />
        </div>
      </div>
    </div>
  );
}
