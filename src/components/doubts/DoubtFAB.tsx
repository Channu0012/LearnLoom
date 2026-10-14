"use client";

import { useState } from "react";
import { DoubtComposer } from "./DoubtComposer";

interface DoubtFABProps {
  courseId: string;
  courseTitle: string;
  lessonId?: string;
  lessonTitle?: string;
}

export function DoubtFAB({ courseId, courseTitle, lessonId, lessonTitle }: DoubtFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-heading font-semibold text-xs sm:text-sm shadow-lg hover:shadow-primary-500/25 active:scale-95 transition-all group border border-white/20"
        title="Ask a doubt for this lesson"
      >
        <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs group-hover:rotate-12 transition-transform">
          ❓
        </span>
        <span className="hidden sm:inline">Stuck? Ask a Doubt</span>
        <span className="sm:hidden">Ask Doubt</span>
      </button>

      <DoubtComposer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        courseId={courseId}
        courseTitle={courseTitle}
        lessonId={lessonId}
        lessonTitle={lessonTitle}
      />
    </>
  );
}
