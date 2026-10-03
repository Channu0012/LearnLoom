import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quick Watch — Distraction-Free Video Player | VeySkill",
  description:
    "Paste any video link or lecture URL and watch instantly in cinema focus mode. Zero logins required, zero tracking, zero algorithmic interruptions.",
  keywords: [
    "distraction free video player",
    "theatre mode video player",
    "ad-free lecture player",
    "video scratchpad notes",
    "focus video learning",
    "VeySkill quick watch",
  ],
  alternates: {
    canonical: "/quick-watch",
  },
  openGraph: {
    title: "Quick Watch — Distraction-Free Video Player | VeySkill",
    description:
      "Paste any video link or lecture URL and watch instantly in cinema focus mode with private scratchpad notes.",
    url: "https://veyskill.in/quick-watch",
    type: "website",
    images: [{ url: "/logo.png", width: 798, height: 220, alt: "VeySkill Quick Watch" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quick Watch — Distraction-Free Video Player | VeySkill",
    description: "Paste any video link and watch in pure cinema focus mode.",
    images: ["/logo.png"],
  },
};

export default function QuickWatchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
