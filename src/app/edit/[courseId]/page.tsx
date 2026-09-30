import type { Metadata } from "next";
import { CourseEditor } from "@/components/courses/CourseEditor";

export const metadata: Metadata = {
  title: "Edit Course",
  robots: {
    index: false,
    follow: false,
  },
};

interface EditPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function EditPage({ params }: EditPageProps) {
  const { courseId } = await params;
  return <CourseEditor courseId={courseId} />;
}
