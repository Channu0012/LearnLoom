"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { toggleUpvoteAnswer, markAnswerAsSolution } from "@/lib/firestore";
import type { AnswerDoc, DoubtDoc } from "@/lib/types";

function timeAgo(timestamp: any): string {
  if (!timestamp) return "";
  const date =
    typeof timestamp.toDate === "function"
      ? timestamp.toDate()
      : typeof timestamp.seconds === "number"
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface AnswerListProps {
  doubt: DoubtDoc;
  answers: AnswerDoc[];
  onRefresh?: () => void;
}

export function AnswerList({ doubt, answers, onRefresh }: AnswerListProps) {
  const { user, openAuthModal } = useAuth();
  const [upvotingIds, setUpvotingIds] = useState<Set<string>>(new Set());
  const [solvingId, setSolvingId] = useState<string | null>(null);

  // Sort: Accepted solutions first, then highest upvotes, then oldest
  const sortedAnswers = [...answers].sort((a, b) => {
    if (a.isSolution && !b.isSolution) return -1;
    if (!a.isSolution && b.isSolution) return 1;
    return (b.upvotes || 0) - (a.upvotes || 0);
  });

  const handleUpvote = async (answerId: string) => {
    if (!user) {
      openAuthModal("signin");
      return;
    }
    if (upvotingIds.has(answerId)) return;

    setUpvotingIds((prev) => new Set(prev).add(answerId));
    try {
      await toggleUpvoteAnswer(doubt.id, answerId, user.uid);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Upvote error:", err);
    } finally {
      setUpvotingIds((prev) => {
        const next = new Set(prev);
        next.delete(answerId);
        return next;
      });
    }
  };

  const handleMarkSolution = async (answer: AnswerDoc) => {
    if (!user || user.uid !== doubt.authorId) return;
    if (answer.isSolution) return;

    const confirmed = window.confirm(
      "Mark this answer as the accepted solution? The author will receive +15 Helper XP!"
    );
    if (!confirmed) return;

    setSolvingId(answer.id);
    try {
      await markAnswerAsSolution(doubt.id, answer.id, doubt.authorId, answer.authorId);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Error marking solution:", err);
    } finally {
      setSolvingId(null);
    }
  };

  if (answers.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-2xl bg-card border border-border/80">
        <div className="w-12 h-12 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 mx-auto mb-3 flex items-center justify-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h4 className="font-heading font-bold text-base mb-1">No answers yet</h4>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Be the first community member to solve this doubt and earn +5 Helper XP!
        </p>
      </div>
    );
  }

  const isDoubtAuthor = user?.uid === doubt.authorId;

  return (
    <div className="space-y-4">
      <h3 className="font-heading font-bold text-lg flex items-center gap-2">
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
          className="text-primary-600 dark:text-primary-400"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Answers ({answers.length})
      </h3>

      <div className="space-y-4">
        {sortedAnswers.map((answer) => {
          const hasUpvoted = user ? (answer.upvotedBy || []).includes(user.uid) : false;
          const isUpvoting = upvotingIds.has(answer.id);
          const isThisSolving = solvingId === answer.id;

          return (
            <div
              key={answer.id}
              className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                answer.isSolution
                  ? "bg-emerald-500/5 border-emerald-500/40 shadow-sm"
                  : "bg-card border-border shadow-xs"
              }`}
            >
              {/* Solution Ribbon */}
              {answer.isSolution && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-heading font-bold mb-3">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Accepted Solution
                </div>
              )}

              {/* Author & Header */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {answer.authorPhotoURL ? (
                    <Image
                      src={answer.authorPhotoURL}
                      alt={answer.authorName}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-border"
                      unoptimized
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 flex items-center justify-center font-heading font-bold text-xs shrink-0">
                      {(answer.authorName || "U").charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">{answer.authorName}</span>
                      {answer.authorId === doubt.authorId && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-mono">
                          Author
                        </span>
                      )}
                    </div>
                    <span suppressHydrationWarning className="text-[11px] text-muted-foreground">
                      {timeAgo(answer.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Mark as Solution action button (visible to Doubt Author only) */}
                {isDoubtAuthor && !doubt.solvedAnswerId && !answer.isSolution && (
                  <button
                    onClick={() => handleMarkSolution(answer)}
                    disabled={isThisSolving}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 transition-all flex items-center gap-1.5 shrink-0"
                    title="Mark this as the solution that solved your doubt"
                  >
                    {isThisSolving ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Mark as Solution</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Answer Content */}
              <div className="text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground/90 mb-4 pl-1">
                {answer.text}
              </div>

              {/* Footer: Upvote button */}
              <div className="flex items-center justify-between border-t border-border/50 pt-3">
                <button
                  type="button"
                  onClick={() => handleUpvote(answer.id)}
                  disabled={isUpvoting}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    hasUpvoted
                      ? "bg-primary-500/15 text-primary-600 dark:text-primary-400 border border-primary-500/30"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60"
                  }`}
                  title={hasUpvoted ? "Remove upvote" : "Upvote helpful answer"}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill={hasUpvoted ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                  </svg>
                  <span>{answer.upvotes || 0}</span>
                  <span className="hidden sm:inline">Helpful</span>
                </button>

                <span className="text-[11px] text-muted-foreground/80">
                  {answer.isSolution ? "⭐ Solution rewarded" : "Community response"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
