"use client";

import { useState, useRef } from "react";
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
  // Available courses for quick suggestions
  enrolledCourses?: Array<{ id: string; title: string }>;
}

const QUICK_TOPIC_SUGGESTIONS = [
  "Next.js",
  "React",
  "Python & AI",
  "DSA & Algorithms",
  "TypeScript",
  "JavaScript",
  "SQL & Databases",
  "DevOps & Docker",
  "System Design",
];

function slugifyTopic(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "general-engineering";
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
  const [manualTopic, setManualTopic] = useState(prefillCourseTitle || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!isOpen) return null;

  const handleSelectQuickTopic = (topic: string) => {
    setManualTopic(topic);
    setError("");
  };

  const insertCodeSnippet = () => {
    const textarea = textareaRef.current;
    const snippet = "\n```ts\n// Paste your code or error here\n\n```\n";
    if (!textarea) {
      setText((prev) => prev + snippet);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const prev = text;
    const newText = prev.substring(0, start) + snippet + prev.substring(end);
    setText(newText);
    setTimeout(() => {
      textarea.focus();
      const cursorTarget = start + "\n```ts\n".length;
      textarea.setSelectionRange(cursorTarget, cursorTarget + 31);
    }, 50);
  };

  const handleSubmit = async () => {
    if (!user) {
      openAuthModal("signin");
      return;
    }
    if (!text.trim()) {
      setError("Please describe your doubt or problem.");
      return;
    }
    if (text.trim().length > DOUBT_LIMITS.MAX_DOUBT_TEXT) {
      setError(`Doubt must be under ${DOUBT_LIMITS.MAX_DOUBT_TEXT} characters.`);
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

      // Determine topic title and courseId gracefully (never block user)
      const topicTitle = manualTopic.trim() || prefillCourseTitle || "General Technical Doubt";
      const matchedEnrolled = enrolledCourses.find(
        (c) => c.title.toLowerCase() === topicTitle.toLowerCase()
      );
      const courseId = prefillCourseId || matchedEnrolled?.id || slugifyTopic(topicTitle);

      const doubtId = await createDoubt({
        courseId,
        courseTitle: topicTitle,
        lessonId: prefillLessonId,
        lessonTitle: prefillLessonTitle,
        authorId: user.uid,
        authorName: user.displayName || "Learner",
        authorPhotoURL: user.photoURL || null,
        text: text.trim(),
      });

      setSuccess(true);
      setText("");
      setManualTopic("");
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
      <div className="w-full sm:max-w-lg bg-card border border-border rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
        {/* Mobile Swipe Handle Pill */}
        <div className="w-12 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30 flex items-center justify-center flex-shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-foreground">Ask a Doubt</h3>
              <p className="text-[11px] text-muted-foreground font-body">
                Community & peer engineers will answer in real-time
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 min-h-[36px] min-w-[36px] rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95 transition-all cursor-pointer"
            aria-label="Close"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Success State */}
        {success && (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-center space-y-2 mb-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="font-heading font-bold text-base">Doubt Published Live!</p>
            <p className="text-xs font-body text-emerald-600/90 dark:text-emerald-400/90">
              Your doubt is now visible in real-time to fellow learners and mentors.
            </p>
          </div>
        )}

        {!success && (
          <>
            {/* Pre-filled Course Context (if opened from video page) */}
            {prefillCourseTitle && (
              <div className="mb-4 p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 block mb-0.5">
                    Course Context
                  </span>
                  <p className="text-xs font-heading font-bold text-foreground truncate">
                    {prefillCourseTitle}
                    {prefillLessonTitle && (
                      <span className="text-muted-foreground font-normal">
                        {" "}
                        · {prefillLessonTitle}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Manual Topic / Technology Input */}
            {!prefillCourseTitle && (
              <div className="mb-4">
                <label className="block text-xs font-heading font-bold text-foreground mb-1.5">
                  Subject, Topic or Framework
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={manualTopic}
                    onChange={(e) => {
                      setManualTopic(e.target.value);
                      setError("");
                    }}
                    placeholder="Type manually: e.g., React Hooks, Next.js 15, Python Pandas, DSA Graph..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border text-foreground text-sm font-body placeholder:text-muted-foreground/60 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 outline-none transition-all min-h-[44px]"
                  />
                  {manualTopic && (
                    <button
                      type="button"
                      onClick={() => setManualTopic("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground text-xs cursor-pointer"
                      title="Clear topic"
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* 1-Tap Quick Suggestion Pills */}
                <div className="mt-2">
                  <p className="text-[10px] font-heading font-semibold text-muted-foreground mb-1.5">
                    Or pick a quick topic:
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {/* Prioritize enrolled courses */}
                    {enrolledCourses.map((c) => {
                      const isSelected = manualTopic.toLowerCase() === c.title.toLowerCase();
                      return (
                        <button
                          key={`enrolled-${c.id}`}
                          type="button"
                          onClick={() => handleSelectQuickTopic(c.title)}
                          className={`text-[11px] font-heading font-medium px-2.5 py-1 rounded-lg border transition-all cursor-pointer min-h-[32px] flex items-center gap-1 ${
                            isSelected
                              ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                              : "bg-muted/50 border-border text-foreground hover:border-teal-500/50"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                          <span className="truncate max-w-[140px]">{c.title}</span>
                        </button>
                      );
                    })}

                    {/* Standard technical subjects */}
                    {QUICK_TOPIC_SUGGESTIONS.map((suggestion) => {
                      const isSelected = manualTopic.toLowerCase() === suggestion.toLowerCase();
                      return (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleSelectQuickTopic(suggestion)}
                          className={`text-[11px] font-heading font-medium px-2.5 py-1 rounded-lg border transition-all cursor-pointer min-h-[32px] ${
                            isSelected
                              ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                              : "bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:border-slate-300 dark:hover:border-slate-600"
                          }`}
                        >
                          {suggestion}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Doubt Textarea */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-heading font-bold text-foreground">
                  Describe your doubt or question
                </label>
                {/* Code Block Inserter Helper */}
                <button
                  type="button"
                  onClick={insertCodeSnippet}
                  className="text-[11px] font-mono font-semibold px-2 py-1 rounded-lg bg-muted border border-border text-teal-600 dark:text-teal-400 hover:bg-muted/80 active:scale-95 transition-all inline-flex items-center gap-1 cursor-pointer min-h-[28px]"
                  title="Insert code snippet template"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                  <span>&lt;/&gt; Add Code</span>
                </button>
              </div>

              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setError("");
                }}
                placeholder="What concept or bug are you struggling with? Be clear and paste code/error snippets so others can solve it fast..."
                className="w-full px-3.5 py-3 rounded-xl bg-muted/30 border border-border text-foreground text-sm font-body leading-relaxed placeholder:text-muted-foreground/60 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 outline-none resize-none min-h-[140px] transition-all"
                maxLength={DOUBT_LIMITS.MAX_DOUBT_TEXT}
                autoFocus
              />

              <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground font-mono">
                <span>Markdown & code blocks supported</span>
                <span
                  className={
                    text.length > DOUBT_LIMITS.MAX_DOUBT_TEXT * 0.9
                      ? "text-amber-500 font-bold"
                      : ""
                  }
                >
                  {text.length}/{DOUBT_LIMITS.MAX_DOUBT_TEXT}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-body flex items-start gap-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="flex-shrink-0 mt-0.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !text.trim()}
              className="w-full py-3.5 text-sm font-heading font-bold rounded-xl inline-flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md bg-teal-600 hover:bg-teal-500 text-white active:scale-[0.99] transition-all min-h-[48px]"
            >
              {submitting ? (
                <>
                  <div className="simple-loader !w-4 !h-4 !border-2" />
                  <span>Publishing Doubt…</span>
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  <span>Post Doubt Live</span>
                </>
              )}
            </button>

            {/* Free Tier Note */}
            {!userDoc?.isPlusMember && (
              <p className="text-[11px] text-muted-foreground text-center mt-3 font-body">
                Free Tier: {DOUBT_LIMITS.FREE_DOUBTS_PER_MONTH} doubts/month · Community powered
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
