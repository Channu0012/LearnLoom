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
  if (!data) return { title: "Course | VeySkill" };

  const { course } = data;
  const thumb = course.coverVideoId
    ? `https://img.youtube.com/vi/${course.coverVideoId}/hqdefault.jpg`
    : undefined;

  return {
    title: course.title,
    description: course.description || `Learn ${course.title} — a free curated course on VeySkill.`,
    alternates: {
      canonical: `/course/${courseId}`,
    },
    openGraph: {
      title: course.title,
      description: course.description || `${course.lessonCount} video lessons free on VeySkill`,
      url: `https://veyskill.in/course/${courseId}`,
      images: thumb
        ? [{ url: thumb, width: 480, height: 360, alt: `${course.title} course preview` }]
        : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description: `${course.lessonCount} lessons — free on VeySkill`,
      images: thumb ? [thumb] : [],
    },
  };
}

// ── Page component ─────────────────────────────────────────────────────────

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const data = await getCourseData(courseId);

  const courseCanonical = `https://veyskill.in/course/${courseId}`;

  const jsonLd = data
    ? {
        "@context": "https://schema.org",
        "@type": "Course",
        "@id": `${courseCanonical}#course`,
        url: courseCanonical,
        name: data.course.title,
        description:
          data.course.description ||
          `Master ${data.course.title} on VeySkill. Free structured curriculum with ${data.course.lessonCount} video modules, interactive study tools, and verifiable certificate of completion.`,
        isAccessibleForFree: true,
        inLanguage: "en",
        provider: {
          "@type": "Organization",
          name: "VeySkill",
          url: "https://veyskill.in",
          logo: "https://veyskill.in/logo.png",
          sameAs: "https://veyskill.in",
        },
        instructor: {
          "@type": "Organization",
          name: "VeySkill Academic Faculty",
          url: "https://veyskill.in",
        },
        offers: [
          {
            "@type": "Offer",
            category: "Free",
            price: "0",
            priceCurrency: "INR",
            availability: "https://schema.org/InStock",
            url: courseCanonical,
          },
        ],
        educationalCredentialAwarded: {
          "@type": "EducationalOccupationalCredential",
          name: `Certificate of Completion in ${data.course.title}`,
          credentialCategory: "Certificate",
          validFor: "P99Y",
        },
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "Online",
          courseWorkload: `PT${Math.max(1, data.course.lessonCount) * 15}M`,
        },
      }
    : null;

  const breadcrumbJsonLd = data
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://veyskill.in",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Explore Courses",
            item: "https://veyskill.in/explore",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: data.course.title,
            item: courseCanonical,
          },
        ],
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
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
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
