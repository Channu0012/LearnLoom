import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Mock Interviewer — Live Technical Practice & Scorecard | VeySkill",
  description:
    "Master technical interviews with VeySkill's AI Mock Interviewer. Live role-specific questions, voice interaction, FAANG-calibrated scoring, and actionable feedback.",
  keywords: [
    "AI mock interview",
    "technical interview practice",
    "coding interview prep",
    "system design interview",
    "FAANG interview prep",
    "software engineering interview",
    "frontend mock interview",
    "backend mock interview",
    "VeySkill interview",
  ],
  alternates: {
    canonical: "/interview",
  },
  openGraph: {
    title: "AI Mock Interviewer | VeySkill",
    description:
      "Practice real-time technical interviews with adaptive AI grilling and get FAANG-grade scorecards.",
    url: "https://veyskill.in/interview",
    type: "website",
    images: [{ url: "/logo.png", width: 798, height: 220, alt: "VeySkill AI Mock Interviewer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Mock Interviewer | VeySkill",
    description:
      "Practice real-time technical interviews with adaptive AI grilling and get FAANG-grade scorecards.",
    images: ["/logo.png"],
  },
};

export default function InterviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
