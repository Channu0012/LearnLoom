import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Learning Portal | VeySkill",
  description: "Track your in-progress courses, completed lessons, notes, and learning streaks.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MyLearningLayout({ children }: { children: React.ReactNode }) {
  return children;
}
