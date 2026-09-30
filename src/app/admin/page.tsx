"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ReportDoc, CourseDoc } from "@/lib/types";
import { getCourse } from "@/lib/firestore";

interface ReportWithCourse extends ReportDoc {
  course?: CourseDoc | null;
}

export default function AdminPage() {
  const { user, userDoc, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<ReportWithCourse[]>([]);
  const [fetching, setFetching] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || !userDoc?.isAdmin)) {
      router.push("/");
    }
  }, [user, userDoc, loading, router]);

  useEffect(() => {
    if (!userDoc?.isAdmin) return;
    (async () => {
      const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ ...(d.data() as ReportDoc), id: d.id }));

      // Hydrate with course info
      const hydrated = await Promise.all(
        list.map(async (r) => ({
          ...r,
          course: await getCourse(r.courseId).catch(() => null),
        }))
      );
      setReports(hydrated);
      setFetching(false);
    })();
  }, [userDoc?.isAdmin]);

  const handleUnpublish = async (report: ReportWithCourse) => {
    setActionId(report.id);
    try {
      await updateDoc(doc(db, "courses", report.courseId), { status: "draft" });
      await updateDoc(doc(db, "reports", report.id), { status: "reviewed" });
      setReports((prev) =>
        prev.map((r) =>
          r.id === report.id
            ? {
                ...r,
                status: "reviewed",
                course: r.course ? { ...r.course, status: "draft" } : r.course,
              }
            : r
        )
      );
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteCourse = async (report: ReportWithCourse) => {
    if (!confirm("Permanently delete this course? This cannot be undone.")) return;
    setActionId(report.id);
    try {
      await deleteDoc(doc(db, "courses", report.courseId));
      await updateDoc(doc(db, "reports", report.id), { status: "reviewed" });
      setReports((prev) =>
        prev.map((r) => (r.id === report.id ? { ...r, status: "reviewed" } : r))
      );
    } finally {
      setActionId(null);
    }
  };

  if (loading || fetching) {
    return (
      <div className="container-page py-12">
        <div className="skeleton h-8 w-48 mb-6 rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-24 rounded-xl mb-4" />
        ))}
      </div>
    );
  }

  if (!userDoc?.isAdmin) return null;

  return (
    <div className="container-page py-12 max-w-4xl">
      <h1 className="font-heading font-extrabold text-3xl mb-2">Admin Panel</h1>
      <p className="text-muted-foreground font-body mb-8">Review reports and moderate courses.</p>

      {reports.length === 0 ? (
        <div className="clay-card p-12 text-center">
          <p className="text-muted-foreground font-body">No reports yet — all clear!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className={`clay-card p-5 ${report.status !== "open" ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-heading font-bold text-sm">
                    Course:{" "}
                    {report.course ? (
                      <Link
                        href={`/course/${report.courseId}`}
                        className="text-primary-600 underline hover:no-underline"
                      >
                        {report.course.title}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">[deleted]</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">
                    Status:{" "}
                    <span
                      className={report.status === "open" ? "text-destructive font-semibold" : ""}
                    >
                      {report.status}
                    </span>
                    {report.course && ` · Course status: ${report.course.status}`}
                  </p>
                </div>
                <span className={report.status === "open" ? "badge-draft" : "badge-published"}>
                  {report.status}
                </span>
              </div>

              <blockquote className="text-sm font-body text-foreground/80 border-l-4 border-border pl-4 mb-4 italic">
                {report.reason}
              </blockquote>

              {report.status === "open" && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleUnpublish(report)}
                    disabled={
                      actionId === report.id || !report.course || report.course.status === "draft"
                    }
                    className="btn-ghost text-sm px-3.5 py-2 min-h-[44px] inline-flex items-center justify-center"
                    type="button"
                  >
                    Unpublish course
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(report)}
                    disabled={actionId === report.id}
                    className="btn-destructive text-sm px-3.5 py-2 min-h-[44px] inline-flex items-center justify-center"
                    type="button"
                  >
                    {actionId === report.id ? "Working…" : "Delete course"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
