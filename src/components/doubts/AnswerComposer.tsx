"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createAnswer } from "@/lib/firestore";
import { DOUBT_LIMITS } from "@/lib/constants";

interface AnswerComposerProps {
  doubtId: string;
  onAnswerSubmitted?: (_newAnswerId: string) => void;
}

export function AnswerComposer({ doubtId, onAnswerSubmitted }: AnswerComposerProps) {
  const { user, openAuthModal } = useAuth();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal("signin");
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) {
      setError("Please write an answer before submitting.");
      return;
    }

    if (trimmed.length > DOUBT_LIMITS.MAX_ANSWER_TEXT) {
      setError(`Answer exceeds maximum length of ${DOUBT_LIMITS.MAX_ANSWER_TEXT} characters.`);
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const answerId = await createAnswer(doubtId, {
        doubtId,
        authorId: user.uid,
        authorName: user.displayName || "Fellow Learner",
        authorPhotoURL: user.photoURL || null,
        text: trimmed,
      });

      setText("");
      if (onAnswerSubmitted) {
        onAnswerSubmitted(answerId);
      }
    } catch (err: any) {
      console.error("Failed to post answer:", err);
      setError(err?.message || "Failed to post answer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading font-bold text-base sm:text-lg flex items-center gap-2">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="text-amber-500"
          >
            <path d="M12 2a6 6 0 0 1 6 6c0 2.22-1.2 4.15-3 5.19V17a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-3.81C7.2 12.15 6 10.22 6 8a6 6 0 0 1 6-6z" />
            <path d="M9 21h6" />
          </svg>
          Your Answer
        </h3>
        <span className="text-xs text-muted-foreground font-mono">
          {text.length}/{DOUBT_LIMITS.MAX_ANSWER_TEXT}
        </span>
      </div>

      {!user ? (
        <div className="py-6 px-4 text-center rounded-xl bg-muted/40 border border-dashed border-border/80">
          <p className="text-sm text-muted-foreground mb-3">
            Sign in to contribute your answer and earn Helper XP (+5 XP).
          </p>
          <button
            type="button"
            onClick={() => openAuthModal("signin")}
            className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all shadow-sm"
          >
            Sign in to Answer
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share step-by-step guidance, code snippet, or explanation..."
            rows={4}
            maxLength={DOUBT_LIMITS.MAX_ANSWER_TEXT}
            disabled={submitting}
            className="w-full px-4 py-3 text-sm bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 resize-y transition-all placeholder:text-muted-foreground"
          />

          {error && <p className="text-xs text-red-500 dark:text-red-400 font-medium">{error}</p>}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                +5 XP for answering
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                +15 XP if selected as solution
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-heading font-semibold text-sm text-white bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Post Answer</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
