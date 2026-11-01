import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creator Studio & Course Management — Build & Publish Courses | VeySkill",
  description:
    "Convert YouTube playlists into distraction-free masterclasses. Organize video chapters, publish courses, track student analytics, and issue verifiable completion certificates on VeySkill.",
  alternates: {
    canonical: "https://veyskill.in/my-courses",
  },
  openGraph: {
    title: "Creator Studio & Course Management — VeySkill",
    description:
      "Convert YouTube playlists into structured courses. Track student engagement and issue verified certificates.",
    url: "https://veyskill.in/my-courses",
    siteName: "VeySkill",
    images: [{ url: "/logo.png", width: 798, height: 220, alt: "VeySkill Creator Studio" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Creator Studio & Course Management — VeySkill",
    description:
      "Convert YouTube playlists into structured courses. Track student engagement and issue verified certificates.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://veyskill.in/my-courses#webpage",
      url: "https://veyskill.in/my-courses",
      name: "Creator Studio — Build & Publish Structured Courses | VeySkill",
      description:
        "Creator studio enabling instructors and developers to transform public YouTube tutorials into accredited, distraction-free courses with automated certificates.",
      isPartOf: {
        "@type": "WebSite",
        "@id": "https://veyskill.in/#website",
        name: "VeySkill",
        url: "https://veyskill.in",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://veyskill.in/my-courses#breadcrumb",
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
          name: "Creator Studio",
          item: "https://veyskill.in/my-courses",
        },
      ],
    },
  ],
};

export default function MyCoursesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
