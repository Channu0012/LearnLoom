import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Courses & Studio | Vidcura",
  description: "Manage, publish, and edit your created courses on Vidcura.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MyCoursesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
