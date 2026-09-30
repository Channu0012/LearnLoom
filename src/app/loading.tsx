import { CourseraLoader } from "@/components/ui/CourseraLoader";

export default function GlobalLoading() {
  return (
    <div className="container-page py-16 w-full flex items-center justify-center">
      <CourseraLoader
        title="Loading Vidcura…"
        subtitle="Curating free, distraction-free courses and interactive video lessons"
      />
    </div>
  );
}
