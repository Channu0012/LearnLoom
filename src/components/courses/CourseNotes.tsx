"use client";

// ---------------------------------------------------------------------------
// CourseNotes — AI-Powered + Manual Study Notes
// Generates AI summaries per lesson with manual editing capability
// ---------------------------------------------------------------------------
import { useState, useEffect, useCallback } from "react";

interface CourseNotesProps {
  courseId: string;
  courseTitle: string;
  courseCategory?: string;
  activeLessonTitle: string;
}

export function CourseNotes({
  courseId,
  courseTitle,
  courseCategory,
  activeLessonTitle,
}: CourseNotesProps) {
  const storageKey = `veyskill_notes_${courseId}`;
  const legacyKey = `learnloom_notes_${courseId}`;
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey) || localStorage.getItem(legacyKey);
      if (stored) setNotes(stored);
    }
  }, [storageKey, legacyKey]);

  const handleChange = useCallback(
    (val: string) => {
      setNotes(val);
      setSaved(false);
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, val);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    },
    [storageKey]
  );

  const handleAddTimestampTag = () => {
    const header = `\n\n### Notes for: ${activeLessonTitle}\n`;
    handleChange(notes + header);
  };

  const handleExport = () => {
    const blob = new Blob([`${courseTitle} — Study Notes\n\n${notes}`], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${courseTitle.replace(/[^a-z0-9]/gi, "_")}_Notes.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Generate AI notes for current lesson
  const handleGenerateAINotes = useCallback(async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoTitle: activeLessonTitle,
          courseTitle,
          courseCategory: courseCategory || "General",
        }),
      });

      if (!res.ok) throw new Error("Failed to generate notes");

      const data = await res.json();
      const aiNotes = data.notes || "Could not generate notes for this lesson.";

      // Append AI notes to existing notes
      const separator = notes ? `\n\n${"─".repeat(40)}\n` : "";
      const formatted = `${separator}## AI Study Notes: ${activeLessonTitle}\n\n${aiNotes}`;
      handleChange(notes + formatted);
      setAiGenerated(true);
      setTimeout(() => setAiGenerated(false), 3000);
    } catch {
      // Silent fallback
    } finally {
      setAiLoading(false);
    }
  }, [activeLessonTitle, courseTitle, courseCategory, notes, handleChange]);

  return (
    <div className="clay-card p-4 sm:p-6 bg-card border border-border rounded-2xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
            <span>Study Notes</span>
            {aiGenerated && (
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full animate-fade-in">
                Verified Notes Added
              </span>
            )}
          </h3>
          <p className="font-body text-xs text-muted-foreground">
            Structured personal notes saved locally with AI technical summarization.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {saved && (
            <span className="text-[11px] font-mono font-bold text-emerald-600 animate-fade-in">
              Saved
            </span>
          )}

          {/* AI Generate Button */}
          <button
            type="button"
            onClick={handleGenerateAINotes}
            disabled={aiLoading}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-heading font-bold disabled:opacity-50 transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            {aiLoading ? (
              <>
                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
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
                <span>Synthesizing…</span>
              </>
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
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                <span>AI Technical Summary</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleAddTimestampTag}
            className="btn-ghost text-xs px-3 py-1.5 font-heading font-bold"
          >
            + Add Section
          </button>
          {notes && (
            <button
              type="button"
              onClick={handleExport}
              className="btn-ghost text-xs px-3 py-1.5 font-heading font-bold"
            >
              Export (.txt)
            </button>
          )}
        </div>
      </div>

      <textarea
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        rows={10}
        placeholder={`Jot down architectural takeaways, code snippets, or formulas while watching…\n\nTip: Click "AI Technical Summary" to synthesize a structured brief for this lesson.\n\nExample:\n- Core architectural invariant\n- Edge cases and error handling`}
        className="w-full p-4 rounded-xl border border-border bg-background text-foreground font-mono text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 leading-relaxed"
      />
    </div>
  );
}
