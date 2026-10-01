"use client";

// ---------------------------------------------------------------------------
// QuizModal — Coursera / Google-Grade Assessment Experience
// Enforces minimum passing grade (70%) for certificate eligibility.
// Zero emojis — pure high-precision vector icons and professional typography.
// ---------------------------------------------------------------------------
import { useState, useCallback } from "react";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
  courseTitle: string;
  courseCategory: string;
  lessonIndex: number;
  totalLessons: number;
  onQuizComplete?: (_score: number, _total: number) => void;
}

const PASSING_THRESHOLD_PERCENT = 70;

export function QuizModal({
  isOpen,
  onClose,
  lessonTitle,
  courseTitle,
  courseCategory,
  lessonIndex,
  totalLessons,
  onQuizComplete,
}: QuizModalProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);

    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoTitle: lessonTitle,
          courseTitle,
          courseCategory,
          lessonIndex,
          totalLessons,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate assessment");

      const data = await res.json();
      setQuestions(data.questions || []);
    } catch {
      setError("Unable to generate the module assessment at this time. Please retry.");
    } finally {
      setLoading(false);
    }
  }, [lessonTitle, courseTitle, courseCategory, lessonIndex, totalLessons]);

  // Auto-fetch when modal opens
  const [hasFetched, setHasFetched] = useState(false);
  if (isOpen && !hasFetched && questions.length === 0 && !loading) {
    setHasFetched(true);
    fetchQuiz();
  }
  if (!isOpen && hasFetched) {
    setHasFetched(false);
  }

  const handleSelectAnswer = (idx: number) => {
    if (isAnswered) return;
    setSelectedAnswer(idx);
  };

  const handleConfirmAnswer = () => {
    if (selectedAnswer === null || isAnswered) return;
    setIsAnswered(true);
    const isCorrect = selectedAnswer === questions[currentQ]?.correctIndex;
    if (isCorrect) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      onQuizComplete?.(score, questions.length);
    }
  };

  const handleRetry = () => {
    fetchQuiz();
  };

  const handleClose = () => {
    setQuestions([]);
    setHasFetched(false);
    setIsFinished(false);
    onClose();
  };

  if (!isOpen) return null;

  const q = questions[currentQ];
  const scorePercent = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const isPassed = scorePercent >= PASSING_THRESHOLD_PERCENT;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Module Assessment"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-card border-2 border-border rounded-3xl shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border bg-muted/40">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                <span className="text-[10px] uppercase font-heading font-black tracking-widest text-primary-600 dark:text-primary-400">
                  Module Knowledge Check · 70% Passing Grade
                </span>
              </div>
              <h2 className="font-heading font-bold text-base sm:text-lg text-foreground line-clamp-1">
                {lessonTitle}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-xl bg-muted/80 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              aria-label="Close assessment"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          {questions.length > 0 && !isFinished && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary-500 transition-all duration-500"
                  style={{
                    width: `${((currentQ + (isAnswered ? 1 : 0)) / questions.length) * 100}%`,
                  }}
                />
              </div>
              <span className="text-[11px] font-mono font-bold text-muted-foreground">
                Question {currentQ + 1} of {questions.length}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-600 animate-pulse">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-heading font-bold text-sm text-foreground">
                  Generating Module Assessment…
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Synthesizing questions based on curriculum learning objectives
                </p>
              </div>
              <div className="simple-loader !w-6 !h-6 !border-2" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="text-xs text-muted-foreground text-center">{error}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="btn-primary text-xs px-5 py-2 font-heading font-bold"
              >
                Retry Generation
              </button>
            </div>
          )}

          {/* Quiz Question */}
          {!loading && !error && q && !isFinished && (
            <div className="space-y-5">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-muted-foreground mb-2 block">
                  Objective Assessment · Question {currentQ + 1}
                </span>
                <h3 className="font-heading font-bold text-base sm:text-lg text-foreground leading-snug">
                  {q.question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {q.options.map((option, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = idx === q.correctIndex;
                  const showResult = isAnswered;

                  let optionClass =
                    "w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all text-sm font-body cursor-pointer flex items-start gap-3 active:scale-[0.99]";

                  if (showResult && isCorrect) {
                    optionClass +=
                      " border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
                  } else if (showResult && isSelected && !isCorrect) {
                    optionClass += " border-destructive bg-destructive/10 text-destructive";
                  } else if (isSelected) {
                    optionClass += " border-primary-500 bg-primary-500/5 text-foreground shadow-sm";
                  } else {
                    optionClass +=
                      " border-border hover:border-primary-300 hover:bg-muted/50 text-foreground";
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectAnswer(idx)}
                      className={optionClass}
                      disabled={isAnswered}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-heading font-bold flex-shrink-0 ${
                          showResult && isCorrect
                            ? "bg-emerald-500 text-white"
                            : showResult && isSelected && !isCorrect
                              ? "bg-destructive text-white"
                              : isSelected
                                ? "bg-primary-500 text-white"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {showResult && isCorrect ? (
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
                        ) : showResult && isSelected && !isCorrect ? (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        ) : (
                          String.fromCharCode(65 + idx)
                        )}
                      </span>
                      <span className="pt-0.5 leading-snug">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Analytical Explanation */}
              {isAnswered && q.explanation && (
                <div className="p-4 rounded-xl bg-primary-50/50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800 animate-fade-in">
                  <div className="flex items-center gap-1.5 mb-1 text-primary-600 dark:text-primary-400">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <span className="text-[10px] uppercase font-heading font-extrabold tracking-wider">
                      Technical Explanation
                    </span>
                  </div>
                  <p className="text-xs font-body text-foreground leading-relaxed pl-5">
                    {q.explanation}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs font-mono text-muted-foreground">
                  Score: {score}/{currentQ + (isAnswered ? 1 : 0)}
                </div>
                {!isAnswered ? (
                  <button
                    type="button"
                    onClick={handleConfirmAnswer}
                    disabled={selectedAnswer === null}
                    className="btn-primary text-xs px-5 py-2.5 font-heading font-bold disabled:opacity-40"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-primary text-xs px-5 py-2.5 font-heading font-bold inline-flex items-center gap-2"
                  >
                    {currentQ < questions.length - 1 ? (
                      <>
                        <span>Next Question</span>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <span>Complete Assessment</span>
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
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Results Screen — Coursera / Google Verification Standard */}
          {isFinished && (
            <div className="text-center py-6 space-y-5 animate-fade-in">
              <div
                className={`w-20 h-20 mx-auto rounded-3xl border-2 flex items-center justify-center ${
                  isPassed
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                }`}
              >
                {isPassed ? (
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                ) : (
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                )}
              </div>

              <div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-[10px] font-heading font-black uppercase tracking-wider mb-2 ${
                    isPassed
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {isPassed ? "Assessment Passed · Verified" : "Review Recommended · Passing: 70%"}
                </span>
                <h3 className="font-heading font-black text-2xl text-foreground">
                  {isPassed ? "Competence Verified" : "Further Review Recommended"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 font-body max-w-md mx-auto">
                  {isPassed
                    ? `You scored ${scorePercent}% on this assessment, meeting the 70% standard for course certificate qualification. +10 Learning Points recorded.`
                    : `You scored ${scorePercent}%. A minimum passing score of 70% is required to certify mastery and qualify for the course certificate.`}
                </p>
              </div>

              {/* Score Bar */}
              <div className="max-w-xs mx-auto">
                <div className="flex justify-between text-xs font-mono mb-1 text-muted-foreground">
                  <span>
                    Score: {score}/{questions.length}
                  </span>
                  <span className="font-bold text-foreground">{scorePercent}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isPassed ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${scorePercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="btn-ghost text-xs px-4 py-2.5 font-heading font-bold inline-flex items-center gap-1.5"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                  <span>Retake Assessment</span>
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-primary text-xs px-5 py-2.5 font-heading font-bold"
                >
                  Continue Curriculum
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
