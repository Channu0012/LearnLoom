import { CourseEditor } from "@/components/courses/CourseEditor";

interface EditPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function EditPage({ params }: EditPageProps) {
  const { courseId } = await params;
  return <CourseEditor courseId={courseId} />;
}
