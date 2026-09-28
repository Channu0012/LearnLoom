"use client";

import { useState, useEffect } from "react";

interface CourseNotesProps {
  courseId: string;
  courseTitle: string;
  activeLessonTitle: string;
}

export function CourseNotes({ courseId, courseTitle, activeLessonTitle }: CourseNotesProps) {
  const storageKey = `learnloom_notes_${courseId}`;
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey);
      if (stored) setNotes(stored);
    }
  }, [storageKey]);

  const handleChange = (val: string) => {
    setNotes(val);
    setSaved(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, val);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

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

  return (
    <div className="clay-card p-6 bg-card border border-border rounded-2xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-heading font-bold text-base text-foreground">Personal Study Notes</h3>
          <p className="font-body text-xs text-muted-foreground">
            Your notes are automatically saved to your browser as you watch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-[11px] font-heading font-bold text-emerald-600 animate-fade-in">
              Saved
            </span>
          )}
          <button
            type="button"
            onClick={handleAddTimestampTag}
            className="btn-ghost text-xs px-3 py-1.5"
          >
            + Add Section Tag
          </button>
          {notes && (
            <button type="button" onClick={handleExport} className="btn-ghost text-xs px-3 py-1.5">
              Export Notes (.txt)
            </button>
          )}
        </div>
      </div>

      <textarea
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        rows={8}
        placeholder={`Jot down key takeaways, code snippets, or ideas while watching...\n\nExample:\n- Lesson key insight\n- Important reference link`}
        className="w-full p-4 rounded-xl border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 leading-relaxed"
      />
    </div>
  );
}
