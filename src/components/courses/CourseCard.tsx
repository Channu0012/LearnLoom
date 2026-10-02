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
      className="clay-card block overflow-hidden group cursor-pointer bg-card active:scale-[0.98] transition-all duration-150"
      aria-label={`${course.title} — ${course.lessonCount} lesson${course.lessonCount !== 1 ? "s" : ""}, free course on Vidcura`}
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
      <div className="p-4 flex flex-col justify-between h-36">
        <div>
          {/* Creator / Course Badge */}
          <span className="badge-primary text-[10px] mb-2 inline-block font-heading font-semibold">
            {course.creatorName ? `By ${course.creatorName}` : "Curated Masterclass"}
          </span>

          {/* Title */}
          <h3 className="font-heading font-bold text-sm sm:text-base text-foreground line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
            {course.title}
          </h3>
        </div>

        {/* Course Info & CTA */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[11px] text-muted-foreground font-body">Vidcura Course</span>
          </div>

          <span className="text-[11px] font-heading font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1 group-hover:text-primary-700 transition-colors">
            <span>Start Course</span>
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
    <div className="clay-card overflow-hidden bg-card" aria-hidden="true">
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
