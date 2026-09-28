"use client";

import { useState } from "react";
import type { CourseDoc, SerializedCourseDoc } from "@/lib/types";

interface CourseCertificateProps {
  course: CourseDoc | SerializedCourseDoc;
  studentName: string;
  courseId: string;
  isUnlocked: boolean;
  completionPercent: number;
}

export function CourseCertificate({
  course,
  studentName,
  courseId,
  isUnlocked,
  completionPercent,
}: CourseCertificateProps) {
  const [copied, setCopied] = useState(false);
  const certId = `LL-${courseId.slice(0, 6).toUpperCase()}-CERT`;
  const issueDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleShareLinkedIn = () => {
    const certUrl = typeof window !== "undefined" ? window.location.href : "";
    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
      course.title
    )}&organizationName=LearnLoom&certUrl=${encodeURIComponent(
      certUrl
    )}&certId=${encodeURIComponent(certId)}`;
    window.open(linkedInUrl, "_blank");
  };

  const handleCopyLink = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isUnlocked) {
    return (
      <div className="clay-card p-8 text-center bg-card border-2 border-dashed border-border rounded-2xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h3 className="font-heading font-extrabold text-xl text-foreground mb-2">
          Certificate Locked ({completionPercent}% Complete)
        </h3>
        <p className="font-body text-sm text-muted-foreground max-w-md mx-auto mb-6">
          Complete all {course.lessonCount} video lessons to earn your verified LearnLoom
          Certificate of Completion. You can share it directly on LinkedIn and your resume!
        </p>
        <div className="max-w-xs mx-auto">
          <div className="h-3 rounded-full bg-muted overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <span className="text-xs font-heading font-bold text-muted-foreground">
            {completionPercent}% Completed
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Certificate Frame */}
      <div
        id="printable-certificate"
        className="relative p-8 sm:p-12 rounded-3xl bg-card border-8 border-double border-primary-600/30 shadow-2xl text-center overflow-hidden"
      >
        {/* Background watermark badge */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <svg width="350" height="350" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>

        {/* Certificate Header */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0D9488"
            strokeWidth="2.5"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span className="font-heading font-extrabold text-xs sm:text-sm tracking-widest text-primary-700 dark:text-primary-300 uppercase">
            LearnLoom Verified Credential
          </span>
        </div>

        <h2 className="font-heading font-black text-2xl sm:text-4xl text-foreground mb-4 tracking-tight">
          Certificate of Completion
        </h2>

        <p className="font-body text-xs sm:text-sm text-muted-foreground mb-3">
          This certifies that
        </p>

        <p className="font-heading font-extrabold text-xl sm:text-3xl text-primary-600 dark:text-primary-400 mb-4 underline decoration-primary-300 underline-offset-8">
          {studentName || "Learner"}
        </p>

        <p className="font-body text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto mb-3">
          has successfully completed all modules and curriculum requirements for the online course:
        </p>

        <p className="font-heading font-bold text-lg sm:text-2xl text-foreground mb-8">
          &ldquo;{course.title}&rdquo;
        </p>

        {/* Certificate Meta Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t-2 border-border/60 text-xs font-body max-w-lg mx-auto">
          <div>
            <span className="text-muted-foreground block text-[11px] uppercase tracking-wider">
              Instructor
            </span>
            <span className="font-heading font-bold text-foreground mt-0.5 block">
              {course.creatorName}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px] uppercase tracking-wider">
              Date Issued
            </span>
            <span className="font-heading font-bold text-foreground mt-0.5 block">{issueDate}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px] uppercase tracking-wider">
              Credential ID
            </span>
            <span className="font-mono text-xs font-bold text-foreground mt-0.5 block">
              {certId}
            </span>
          </div>
        </div>
      </div>

      {/* Sharing & Action Toolbar */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={handleShareLinkedIn}
          className="btn-primary text-xs px-4 py-2.5 inline-flex items-center gap-2"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
          <span>Add to LinkedIn</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="btn-ghost text-xs px-4 py-2.5 inline-flex items-center gap-2"
        >
          {copied ? (
            <span className="text-emerald-600 font-bold">Link Copied!</span>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Copy Verification Link</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="btn-ghost text-xs px-4 py-2.5 inline-flex items-center gap-2"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          <span>Print / Save PDF</span>
        </button>
      </div>
    </div>
  );
}
