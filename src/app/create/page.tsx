import { Suspense } from "react";
import type { Metadata } from "next";
import { CourseEditor } from "@/components/courses/CourseEditor";

export const metadata: Metadata = {
  title: "Create a Course from Video Playlist",
  description:
    "Build a structured, interactive course from video playlists in one click. Share your knowledge with the world, free forever.",
  alternates: {
    canonical: "/create",
  },
};

export default function CreatePage() {
  return (
    <Suspense fallback={null}>
      <CourseEditor />
    </Suspense>
  );
}
