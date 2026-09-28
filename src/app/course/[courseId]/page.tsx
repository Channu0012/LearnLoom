// ---------------------------------------------------------------------------
// Course page — Server Component for SEO, with client player below
// /course/[courseId]
// ---------------------------------------------------------------------------
import { type Metadata } from "next";
import { getCourse, getLessons, serializeCourse } from "@/lib/firestore";
import type { CourseDoc, LessonDoc } from "@/lib/types";
import { CoursePageClient } from "@/components/courses/CoursePageClient";

export const dynamic = "force-dynamic";

// ── Data fetching ──────────────────────────────────────────────────────────

async function getCourseData(
  courseId: string
): Promise<{ course: CourseDoc; lessons: LessonDoc[] } | null> {
  try {
    const course = await getCourse(courseId);
    if (!course) return null;

    const lessons = await getLessons(courseId);
    return { course, lessons };
  } catch {
    return null;
  }
}

// ── generateMetadata ───────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseId: string }>;
}): Promise<Metadata> {
  const { courseId } = await params;
  const data = await getCourseData(courseId);
  if (!data) return { title: "Course | LearnLoom" };

  const { course } = data;
  const thumb = course.coverVideoId
    ? `https://img.youtube.com/vi/${course.coverVideoId}/hqdefault.jpg`
    : undefined;

  return {
    title: course.title,
    description:
      course.description ||
      `Learn ${course.title} — a free course by ${course.creatorName} on LearnLoom.`,
    openGraph: {
      title: course.title,
      description: course.description || `${course.lessonCount} lessons by ${course.creatorName}`,
      images: thumb ? [{ url: thumb, width: 480, height: 360 }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description: `${course.lessonCount} lessons — free on LearnLoom`,
      images: thumb ? [thumb] : [],
    },
  };
}

// ── Page component ─────────────────────────────────────────────────────────

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const data = await getCourseData(courseId);

  const jsonLd = data
    ? {
        "@context": "https://schema.org",
        "@type": "Course",
        name: data.course.title,
        description: data.course.description || `Learn ${data.course.title} online for free.`,
        provider: {
          "@type": "Organization",
          name: "LearnLoom",
          sameAs: "https://learnloom.app",
        },
        instructor: {
          "@type": "Person",
          name: data.course.creatorName,
        },
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "Online",
          courseWorkload: `PT${data.course.lessonCount * 12}M`,
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <CoursePageClient
        courseId={courseId}
        initialCourse={data ? serializeCourse(data.course) : null}
        initialLessons={data ? data.lessons : null}
      />
    </>
  );
}
