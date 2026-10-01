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
  const storageKey = `vidcura_notes_${courseId}`;
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
      const formatted = `${separator}## 🤖 AI Notes: ${activeLessonTitle}\n\n${aiNotes}`;
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
    <div className="clay-card p-6 bg-card border border-border rounded-2xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
            <span>Study Notes</span>
            {aiGenerated && (
              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full animate-fade-in">
                ✓ AI Notes Added
              </span>
            )}
          </h3>
          <p className="font-body text-xs text-muted-foreground">
            Your notes are saved to your browser. Use AI to auto-generate summaries.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {saved && (
            <span className="text-[11px] font-heading font-bold text-emerald-600 animate-fade-in">
              Saved
            </span>
          )}

          {/* AI Generate Button */}
          <button
            type="button"
            onClick={handleGenerateAINotes}
            disabled={aiLoading}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary-500 to-emerald-500 text-white font-heading font-bold hover:shadow-md disabled:opacity-50 transition-all active:scale-95 cursor-pointer"
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
                <span>Generating…</span>
              </>
            ) : (
              <>
                <span>🤖</span>
                <span>AI Generate Notes</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleAddTimestampTag}
            className="btn-ghost text-xs px-3 py-1.5"
          >
            + Add Section
          </button>
          {notes && (
            <button type="button" onClick={handleExport} className="btn-ghost text-xs px-3 py-1.5">
              Export (.txt)
            </button>
          )}
        </div>
      </div>

      <textarea
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        rows={10}
        placeholder={`Jot down key takeaways, code snippets, or ideas while watching…\n\nTip: Click "🤖 AI Generate Notes" to auto-generate a summary for this lesson!\n\nExample:\n- Lesson key insight\n- Important reference link`}
        className="w-full p-4 rounded-xl border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 leading-relaxed"
      />
    </div>
  );
}
