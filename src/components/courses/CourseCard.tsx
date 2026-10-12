import Image from "next/image";
import Link from "next/link";
import type { CourseDoc } from "@/lib/types";

interface CourseCardProps {
  course: CourseDoc;
}

export function CourseCard({ course }: CourseCardProps) {
  const thumbnailUrl = course.coverVideoId
    ? `https://img.youtube.com/vi/${course.coverVideoId}/hqdefault.jpg`
    : null;

  return (
    <Link
      href={`/course/${course.id}?start=true`}
      className="enterprise-card block overflow-hidden group cursor-pointer bg-card active:scale-[0.98] transition-all duration-150 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700"
      aria-label={`${course.title} — ${course.lessonCount} lesson${course.lessonCount !== 1 ? "s" : ""}, free course on VeySkill`}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video overflow-hidden rounded-t-xl bg-muted">
        <div className="skeleton absolute inset-0" />
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={`${course.title} course thumbnail`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized // YouTube CDN
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-primary-50">
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0F766E"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        )}

        {/* Free pill tag */}
        <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-sm text-white text-[11px] font-heading font-bold px-2 py-0.5 rounded-md shadow-sm">
          Free
        </div>

        {/* Lesson count badge */}
        <div
          className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-sm text-white text-[11px] font-heading font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm"
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

      {/* Content */}
      <div className="p-4 flex flex-col justify-between min-h-[148px]">
        <div>
          {/* Category & Creator Badge */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[10px] font-heading font-semibold tracking-wide border border-teal-500/20">
              {course.category || "Masterclass"}
            </span>
            {course.creatorName && (
              <span className="text-[11px] text-muted-foreground truncate font-body inline-flex items-center gap-1">
                <span>by</span>
                <span className="font-medium text-foreground">{course.creatorName}</span>
                <svg
                  className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-heading font-bold text-sm sm:text-base text-foreground line-clamp-2 leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            {course.title}
          </h3>
        </div>

        {/* Course Info & CTA */}
        <div className="flex items-center justify-between gap-2 pt-2.5 mt-2 border-t border-border/60">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[11px] text-muted-foreground font-body">
              {course.lessonCount} {course.lessonCount === 1 ? "module" : "modules"} • Quiz
            </span>
          </div>

          <span className="text-[11px] font-heading font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 group-hover:text-teal-700 transition-colors">
            <span>Explore</span>
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="group-hover:translate-x-0.5 transition-transform"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Skeleton placeholder while loading */
export function CourseCardSkeleton() {
  return (
    <div className="enterprise-card overflow-hidden bg-card" aria-hidden="true">
      <div className="aspect-video skeleton rounded-t-xl" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3.5 w-16 rounded-full" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="flex items-center gap-2 pt-2 border-t border-border/40">
          <div className="skeleton w-5 h-5 rounded-full" />
          <div className="skeleton h-3 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}
