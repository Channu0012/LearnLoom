"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createDoubt, getUserMonthlyDoubtCount } from "@/lib/firestore";
import { DOUBT_LIMITS } from "@/lib/constants";

interface DoubtComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (_doubtId: string) => void;
  // Pre-fill from course video page
  courseId?: string;
  courseTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  // Available courses for manual selection
  enrolledCourses?: Array<{ id: string; title: string }>;
}

export function DoubtComposer({
  isOpen,
  onClose,
  onCreated,
  courseId: prefillCourseId,
  courseTitle: prefillCourseTitle,
  lessonId: prefillLessonId,
  lessonTitle: prefillLessonTitle,
  enrolledCourses = [],
}: DoubtComposerProps) {
  const { user, userDoc, openAuthModal } = useAuth();
  const [text, setText] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(prefillCourseId || "");
  const [selectedCourseTitle, setSelectedCourseTitle] = useState(prefillCourseTitle || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCourseSelect = (courseId: string) => {
    const course = enrolledCourses.find((c) => c.id === courseId);
    setSelectedCourseId(courseId);
    setSelectedCourseTitle(course?.title || "");
  };

  const handleSubmit = async () => {
    if (!user) {
      openAuthModal("signin");
      return;
    }
    if (!text.trim()) {
      setError("Please describe your doubt.");
      return;
    }
    if (text.trim().length > DOUBT_LIMITS.MAX_DOUBT_TEXT) {
      setError(`Doubt must be under ${DOUBT_LIMITS.MAX_DOUBT_TEXT} characters.`);
      return;
    }
    if (!selectedCourseId) {
      setError("Please select a course for your doubt.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Check free tier limit
      const monthlyCount = await getUserMonthlyDoubtCount(user.uid);
      if (monthlyCount >= DOUBT_LIMITS.FREE_DOUBTS_PER_MONTH) {
        setError(
          `You've used all ${DOUBT_LIMITS.FREE_DOUBTS_PER_MONTH} free doubts this month. Upgrade to VeySkill Plus for unlimited doubts!`
        );
        setSubmitting(false);
        return;
      }

      const doubtId = await createDoubt({
        courseId: selectedCourseId,
        courseTitle: selectedCourseTitle,
        lessonId: prefillLessonId,
        lessonTitle: prefillLessonTitle,
        authorId: user.uid,
        authorName: user.displayName || "Learner",
        authorPhotoURL: user.photoURL || null,
        text: text.trim(),
      });

      setSuccess(true);
      setText("");
      setTimeout(() => {
        setSuccess(false);
        onClose();
        onCreated?.(doubtId);
      }, 1200);
    } catch (err) {
      console.error("Failed to create doubt:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-lg bg-card border border-border rounded-t-3xl sm:rounded-2xl shadow-xl p-5 sm:p-6 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-foreground">Ask a Doubt</h3>
              <p className="text-[10px] text-muted-foreground font-body">
                Community will help you out
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Success State */}
        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-center space-y-1 mb-4">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="mx-auto"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <p className="font-heading font-bold text-sm">Doubt Posted!</p>
            <p className="text-[10px] font-body">Students will start helping you soon.</p>
          </div>
        )}

        {!success && (
          <>
            {/* Course Selector (if not pre-filled) */}
            {!prefillCourseId && enrolledCourses.length > 0 && (
              <div className="mb-4">
                <label className="block text-xs font-heading font-bold text-muted-foreground mb-1.5">
                  Which course is this about?
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => handleCourseSelect(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm font-body focus:border-primary-500 outline-none cursor-pointer"
                >
                  <option value="">Select a course…</option>
                  {enrolledCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Pre-filled Course Info */}
            {prefillCourseId && (
              <div className="mb-4 p-3 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-heading font-bold px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                    {prefillCourseTitle}
                  </span>
                  {prefillLessonTitle && (
                    <span className="text-[10px] text-muted-foreground">
                      · {prefillLessonTitle}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Doubt Text */}
            <div className="mb-4">
              <label className="block text-xs font-heading font-bold text-muted-foreground mb-1.5">
                Describe your doubt
              </label>
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setError("");
                }}
                placeholder="What concept are you struggling with? Be specific so others can help…"
                className="w-full px-3.5 py-3 rounded-xl bg-muted/30 border border-border text-foreground text-sm font-body leading-relaxed placeholder:text-muted-foreground/60 focus:border-primary-500 outline-none resize-none min-h-[120px]"
                maxLength={DOUBT_LIMITS.MAX_DOUBT_TEXT}
                autoFocus
              />
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-muted-foreground font-mono">
                  {text.length}/{DOUBT_LIMITS.MAX_DOUBT_TEXT}
                </span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-body">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !text.trim() || !selectedCourseId}
              className="w-full btn-primary py-3 text-sm font-heading font-bold rounded-xl inline-flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md"
            >
              {submitting ? (
                <>
                  <div className="simple-loader !w-4 !h-4 !border-2" />
                  <span>Posting…</span>
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  <span>Post Doubt</span>
                </>
              )}
            </button>

            {/* Free Tier Note */}
            {!userDoc?.isPlusMember && (
              <p className="text-[10px] text-muted-foreground text-center mt-3 font-body">
                Free: {DOUBT_LIMITS.FREE_DOUBTS_PER_MONTH} doubts/month · Upgrade to Plus for
                unlimited
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
