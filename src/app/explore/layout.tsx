import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Free Video Courses & Curated Playlists | VeySkill",
  description:
    "Browse hundreds of free, distraction-free courses organized from online video playlists. Learn programming, design, business, sciences, and languages with zero ads.",
  keywords: [
    "explore free courses",
    "video playlists to courses",
    "programming courses",
    "design courses",
    "free online learning",
    "distraction free study",
    "VeySkill catalog",
  ],
  alternates: {
    canonical: "/explore",
  },
  openGraph: {
    title: "Explore Free Video Courses & Curated Playlists | VeySkill",
    description:
      "Browse hundreds of free, distraction-free courses organized from online video playlists across Programming, Design, Business, and more.",
    url: "https://veyskill.in/explore",
    type: "website",
    images: [{ url: "/logo.png", width: 798, height: 220, alt: "VeySkill Explore Courses" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Free Video Courses | VeySkill",
    description:
      "Browse hundreds of free, distraction-free courses organized from online video playlists.",
    images: ["/logo.png"],
  },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
