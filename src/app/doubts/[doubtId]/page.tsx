"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { subscribeDoubt, subscribeAnswers } from "@/lib/firestore";
import type { DoubtDoc, AnswerDoc } from "@/lib/types";
import { AnswerList } from "@/components/doubts/AnswerList";
import { AnswerComposer } from "@/components/doubts/AnswerComposer";

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

interface PageProps {
  params: Promise<{ doubtId: string }>;
}

export default function DoubtDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const doubtId = resolvedParams.doubtId;

  const [doubt, setDoubt] = useState<DoubtDoc | null>(null);
  const [answers, setAnswers] = useState<AnswerDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let doubtLoaded = false;
    let answersLoaded = false;

    const checkFinished = () => {
      if (doubtLoaded && answersLoaded) {
        setLoading(false);
      }
    };

    const unsubDoubt = subscribeDoubt(doubtId, (d) => {
      setDoubt(d);
      doubtLoaded = true;
      checkFinished();
    });

    const unsubAnswers = subscribeAnswers(doubtId, (a) => {
      setAnswers(a);
      answersLoaded = true;
      checkFinished();
    });

    return () => {
      unsubDoubt();
      unsubAnswers();
    };
  }, [doubtId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-10 max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="h-6 w-32 bg-card animate-pulse rounded-lg" />
        <div className="h-48 bg-card animate-pulse rounded-2xl border border-border" />
        <div className="h-64 bg-card animate-pulse rounded-2xl border border-border" />
      </div>
    );
  }

  if (!doubt) {
    return (
      <div className="min-h-screen bg-background py-20 text-center px-4">
        <div className="w-16 h-16 rounded-3xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto mb-4 border border-border">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <h2 className="text-xl font-heading font-bold mb-2">Doubt Not Found</h2>
        <p className="text-sm text-muted-foreground mb-6">
          This doubt may have been removed or does not exist.
        </p>
        <Link
          href="/arena"
          className="px-5 py-2.5 rounded-xl font-heading font-semibold text-sm text-white bg-primary-600 hover:bg-primary-500 transition-all shadow-sm inline-flex items-center gap-2"
        >
          ← Back to Arena
        </Link>
      </div>
    );
  }

  const isSolved = doubt.status === "solved";

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-16 pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <Link
            href="/arena"
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <span>←</span> Arena
          </Link>
          <span>/</span>
          <Link
            href={`/course/${doubt.courseId}`}
            className="hover:text-foreground transition-colors truncate max-w-[200px]"
          >
            {doubt.courseTitle}
          </Link>
          {doubt.lessonTitle && (
            <>
              <span>/</span>
              <span className="truncate max-w-[150px]">{doubt.lessonTitle}</span>
            </>
          )}
        </nav>

        {/* Doubt Card Header & Body */}
        <div
          className={`rounded-3xl border p-5 sm:p-7 shadow-sm transition-all ${
            isSolved ? "bg-emerald-500/5 border-emerald-500/30" : "bg-card border-border"
          }`}
        >
          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-heading font-bold px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-950/80 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                {doubt.courseTitle}
              </span>
              {doubt.lessonTitle && (
                <span className="text-xs text-muted-foreground font-medium">
                  Lesson: {doubt.lessonTitle}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 text-[11px] font-heading font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                Live Thread
              </span>
              {isSolved ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-heading font-black">
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
                  Solved
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-heading font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Open Doubt
                </span>
              )}
            </div>
          </div>

          {/* Doubt Text */}
          <h1 className="text-lg sm:text-xl font-medium text-foreground leading-relaxed whitespace-pre-wrap break-words mb-6">
            {doubt.text}
          </h1>

          {/* Author info & timestamps */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/60">
            <div className="flex items-center gap-3">
              {doubt.authorPhotoURL ? (
                <Image
                  src={doubt.authorPhotoURL}
                  alt={doubt.authorName}
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover border border-border"
                  unoptimized
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 flex items-center justify-center font-heading font-bold text-xs">
                  {(doubt.authorName || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-xs sm:text-sm font-semibold">{doubt.authorName}</p>
                <p suppressHydrationWarning className="text-[11px] text-muted-foreground">
                  Asked {timeAgo(doubt.createdAt)}
                </p>
              </div>
            </div>

            <Link
              href={`/course/${doubt.courseId}${doubt.lessonId ? `?lesson=${doubt.lessonId}` : ""}`}
              className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
            >
              <span>View Course Video</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Answer Composer */}
        <AnswerComposer doubtId={doubt.id} />

        {/* Answers List */}
        <AnswerList doubt={doubt} answers={answers} />
      </div>
    </div>
  );
}
