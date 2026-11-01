import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Learning Portal — Track Courses, Quizzes & Verified Certificates | VeySkill",
  description:
    "Access your enrolled YouTube masterclasses, track real-time study streaks, take interactive comprehension quizzes, and download official verified certificates of completion on VeySkill.",
  alternates: {
    canonical: "https://veyskill.in/my-learning",
  },
  openGraph: {
    title: "My Learning Portal — VeySkill",
    description:
      "Track course progress, study streaks, and claim verifiable certificates of completion with QR verification.",
    url: "https://veyskill.in/my-learning",
    siteName: "VeySkill",
    images: [{ url: "/logo.png", width: 798, height: 220, alt: "VeySkill Learning Portal" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Learning Portal — VeySkill",
    description:
      "Track course progress, study streaks, and claim verifiable certificates of completion.",
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
      "@id": "https://veyskill.in/my-learning#webpage",
      url: "https://veyskill.in/my-learning",
      name: "Student Learning Portal & Course Progress Tracker | VeySkill",
      description:
        "Student portal to track enrolled video courses, manage completed lesson checkpoints, study daily streaks, and claim verifiable certificates of completion.",
      isPartOf: {
        "@type": "WebSite",
        "@id": "https://veyskill.in/#website",
        name: "VeySkill",
        url: "https://veyskill.in",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://veyskill.in/my-learning#breadcrumb",
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
          name: "My Learning Portal",
          item: "https://veyskill.in/my-learning",
        },
      ],
    },
  ],
};

export default function MyLearningLayout({ children }: { children: React.ReactNode }) {
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
