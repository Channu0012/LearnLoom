"use client";

// ---------------------------------------------------------------------------
// QuizModal — Coursera/Google-grade AI quiz experience
// Auto-generates MCQs after lesson completion, tracks scores,
// shows explanations, and feeds into the certificate system.
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

      if (!res.ok) throw new Error("Failed to generate quiz");

      const data = await res.json();
      setQuestions(data.questions || []);
    } catch {
      setError("Couldn't generate the quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [lessonTitle, courseTitle, courseCategory, lessonIndex, totalLessons]);

  // Auto-fetch on open
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
      // finalScore is the same as score since last answer was already counted in handleConfirmAnswer
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

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Lesson Quiz"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-card border-2 border-border rounded-3xl shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border bg-gradient-to-r from-primary-50 to-emerald-50 dark:from-primary-950/40 dark:to-emerald-950/40">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🧠</span>
                <span className="text-[11px] uppercase font-extrabold tracking-wider text-primary-600 dark:text-primary-400">
                  AI-Powered Quiz
                </span>
              </div>
              <h2 className="font-heading font-bold text-lg text-foreground line-clamp-1">
                {lessonTitle}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-9 h-9 rounded-xl bg-muted/80 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              aria-label="Close quiz"
            >
              ✕
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
              <span className="text-xs font-heading font-bold text-muted-foreground">
                {currentQ + 1}/{questions.length}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center animate-pulse">
                <span className="text-2xl">🤖</span>
              </div>
              <div className="text-center">
                <p className="font-heading font-bold text-sm text-foreground">
                  AI is generating your quiz…
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Creating personalized questions based on your lesson
                </p>
              </div>
              <div className="simple-loader !w-6 !h-6 !border-2" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="text-sm text-muted-foreground text-center">{error}</p>
              <button type="button" onClick={handleRetry} className="btn-primary text-xs px-5 py-2">
                Try Again
              </button>
            </div>
          )}

          {/* Quiz Question */}
          {!loading && !error && q && !isFinished && (
            <div className="space-y-5">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-muted-foreground mb-2 block">
                  Question {currentQ + 1} of {questions.length}
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
                        {showResult && isCorrect
                          ? "✓"
                          : showResult && isSelected && !isCorrect
                            ? "✕"
                            : String.fromCharCode(65 + idx)}
                      </span>
                      <span className="pt-0.5 leading-snug">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {isAnswered && q.explanation && (
                <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800 animate-fade-in">
                  <p className="text-[10px] uppercase font-extrabold tracking-wider text-primary-600 dark:text-primary-400 mb-1">
                    💡 Explanation
                  </p>
                  <p className="text-sm font-body text-foreground leading-relaxed">
                    {q.explanation}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs font-heading font-bold text-muted-foreground">
                  Score: {score}/{currentQ + (isAnswered ? 1 : 0)}
                </div>
                {!isAnswered ? (
                  <button
                    type="button"
                    onClick={handleConfirmAnswer}
                    disabled={selectedAnswer === null}
                    className="btn-primary text-xs px-5 py-2.5 disabled:opacity-40"
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-1.5"
                  >
                    {currentQ < questions.length - 1 ? (
                      <>
                        <span>Next Question</span>
                        <span>→</span>
                      </>
                    ) : (
                      <>
                        <span>See Results</span>
                        <span>🎯</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Results Screen */}
          {isFinished && (
            <div className="text-center py-6 space-y-5 animate-fade-in">
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl bg-gradient-to-br from-primary-100 to-emerald-100 dark:from-primary-950/60 dark:to-emerald-950/60">
                {scorePercent >= 80 ? "🏆" : scorePercent >= 60 ? "⭐" : "📚"}
              </div>

              <div>
                <h3 className="font-heading font-black text-2xl text-foreground">
                  {scorePercent >= 80
                    ? "Excellent!"
                    : scorePercent >= 60
                      ? "Good Job!"
                      : "Keep Learning!"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 font-body">
                  You scored{" "}
                  <span className="font-heading font-bold text-foreground">
                    {score}/{questions.length}
                  </span>{" "}
                  ({scorePercent}%)
                </p>
              </div>

              {/* Score Bar */}
              <div className="max-w-xs mx-auto">
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      scorePercent >= 80
                        ? "bg-emerald-500"
                        : scorePercent >= 60
                          ? "bg-amber-500"
                          : "bg-primary-500"
                    }`}
                    style={{ width: `${scorePercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="btn-ghost text-xs px-4 py-2.5 inline-flex items-center gap-1.5"
                >
                  🔄 Retry Quiz
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-primary text-xs px-5 py-2.5"
                >
                  Continue Learning
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
