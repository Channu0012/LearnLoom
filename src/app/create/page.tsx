import type { Metadata } from "next";
import { CourseEditor } from "@/components/courses/CourseEditor";

export const metadata: Metadata = {
  title: "Create a Course",
  description: "Build a free course from YouTube videos and share it with the world.",
};

export default function CreatePage() {
  return <CourseEditor />;
}
