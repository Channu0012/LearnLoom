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

  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");
  const [copied, setCopied] = useState(false);
  const [aiLoadingStage, setAiLoadingStage] = useState("Analyzing lesson curriculum…");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey) || localStorage.getItem(legacyKey);
      if (stored) {
        setNotes(stored);
      } else {
        // Starter template
        const defaultTemplate = `# Study Notes: ${courseTitle}\n\nClick **"AI Technical Summary"** above to synthesize verified executive notes for **${activeLessonTitle}**, or type your own insights below.`;
        setNotes(defaultTemplate);
      }
    }
  }, [storageKey, legacyKey, courseTitle, activeLessonTitle]);

  // Loading animation step cycler
  useEffect(() => {
    if (!aiLoading) return;
    const stages = [
      "Analyzing lesson curriculum & technical domain…",
      "Extracting core invariants & architectural trade-offs…",
      "Formulating verified executive brief…",
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % stages.length;
      setAiLoadingStage(stages[idx]);
    }, 1500);
    return () => clearInterval(interval);
  }, [aiLoading]);

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
    const header = `\n\n### Notes: ${activeLessonTitle}\n- `;
    handleChange(notes + header);
    setViewMode("edit");
  };

  const handleCopyNotes = () => {
    navigator.clipboard.writeText(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const blob = new Blob([notes], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${courseTitle.replace(/[^a-z0-9]/gi, "_")}_Notes.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Generate AI notes for current lesson
  const handleGenerateAINotes = useCallback(async () => {
    setAiLoading(true);
    setAiLoadingStage("Analyzing lesson curriculum & technical domain…");
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
      const separator = notes ? `\n\n---\n` : "";
      const formatted = `${separator}## Executive Brief: ${activeLessonTitle}\n\n${aiNotes}`;
      handleChange(notes + formatted);
      setAiGenerated(true);
      setViewMode("preview");
      setTimeout(() => setAiGenerated(false), 3500);
    } catch {
      // Fallback
    } finally {
      setAiLoading(false);
    }
  }, [activeLessonTitle, courseTitle, courseCategory, notes, handleChange]);

  return (
    <div className="clay-card p-4 sm:p-6 bg-card border border-border rounded-2xl shadow-sm">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-foreground flex items-center gap-2">
              <span>Executive Study Notes</span>
            </h3>
            {aiGenerated && (
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full animate-fade-in">
                Synthesized ✓
              </span>
            )}
            {saved && (
              <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full animate-fade-in">
                Auto-Saved
              </span>
            )}
          </div>
          <p className="font-body text-xs text-muted-foreground mt-0.5">
            Active Module:{" "}
            <span className="font-semibold text-foreground">{activeLessonTitle}</span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Toggle */}
          <div className="inline-flex rounded-xl bg-muted p-1 border border-border">
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`px-3 py-1 text-xs font-heading font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === "preview"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Formatted
            </button>
            <button
              type="button"
              onClick={() => setViewMode("edit")}
              className={`px-3 py-1 text-xs font-heading font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === "edit"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Edit Markdown
            </button>
          </div>

          {/* AI Generate Button */}
          <button
            type="button"
            onClick={handleGenerateAINotes}
            disabled={aiLoading}
            className="inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-heading font-bold disabled:opacity-50 transition-all active:scale-95 cursor-pointer shadow-sm min-h-[34px]"
            title="Synthesize verified technical notes for this lesson"
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
                  width="13"
                  height="13"
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
            onClick={handleCopyNotes}
            className="btn-ghost text-xs px-2.5 py-1.5 font-heading font-bold inline-flex items-center gap-1 min-h-[34px]"
            title="Copy notes to clipboard"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="btn-ghost text-xs px-2.5 py-1.5 font-heading font-bold inline-flex items-center gap-1 min-h-[34px]"
            title="Download notes as markdown file"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export (.md)</span>
          </button>
        </div>
      </div>

      {/* AI Synthesis Progress Pill */}
      {aiLoading && (
        <div className="mb-4 p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center gap-2.5 animate-pulse">
          <div className="w-2 h-2 rounded-full bg-primary-500 animate-ping" />
          <span className="text-xs font-mono text-primary-700 dark:text-primary-300 font-semibold">
            {aiLoadingStage}
          </span>
        </div>
      )}

      {/* Content Area: Formatted Preview vs Raw Edit */}
      {viewMode === "preview" ? (
        <div className="min-h-[220px] max-h-[480px] overflow-y-auto p-4 rounded-xl border border-border bg-background/50 font-body text-xs sm:text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
          <div
            dangerouslySetInnerHTML={{
              __html: formatNotesMarkdown(notes),
            }}
          />
        </div>
      ) : (
        <textarea
          value={notes}
          onChange={(e) => handleChange(e.target.value)}
          rows={11}
          placeholder={`Jot down architectural takeaways, code snippets, or formulas while watching…\n\nTip: Click "AI Technical Summary" to synthesize a structured brief for this lesson.`}
          className="w-full p-4 rounded-xl border border-border bg-background text-foreground font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 leading-relaxed min-h-[220px]"
        />
      )}

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
        <span>{notes.length} characters</span>
        <button
          type="button"
          onClick={handleAddTimestampTag}
          className="text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
        >
          + Add Section for Current Lesson
        </button>
      </div>
    </div>
  );
}

// Formats notes markdown with code block styles
function formatNotesMarkdown(rawText: string): string {
  if (!rawText) return "<em>No notes captured yet.</em>";

  const codeBlocks: string[] = [];
  let text = rawText.replace(/```([a-zA-Z0-9_+-]*)\n?([\s\S]*?)```/g, (_m, lang, code) => {
    const idx = codeBlocks.length;
    const cleanLang = lang || "code";
    const cleanCode = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    codeBlocks.push(
      `<div class="my-3 rounded-xl border border-border bg-neutral-950 text-neutral-100 overflow-hidden shadow-sm not-prose">
        <div class="flex items-center justify-between px-3 py-1.5 bg-neutral-900 border-b border-neutral-800 text-[10px] font-mono text-neutral-400">
          <span>${cleanLang}</span>
          <span class="text-[10px] uppercase font-bold text-teal-400">Syntax Blueprint</span>
        </div>
        <pre class="p-3 text-[11px] font-mono overflow-x-auto leading-relaxed"><code>${cleanCode}</code></pre>
      </div>`
    );
    return `__CODE_${idx}__`;
  });

  // Basic markdown rendering
  text = text
    .replace(
      /^# (.*?)$/gm,
      '<h1 class="font-heading font-extrabold text-base sm:text-lg text-foreground mt-3 mb-2 border-b border-border pb-1">$1</h1>'
    )
    .replace(
      /^## (.*?)$/gm,
      '<h2 class="font-heading font-bold text-sm sm:text-base text-foreground mt-4 mb-2 text-teal-600 dark:text-teal-400">$1</h2>'
    )
    .replace(
      /^### (.*?)$/gm,
      '<h3 class="font-heading font-semibold text-xs sm:text-sm text-foreground mt-3 mb-1">$1</h3>'
    )
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono border border-border/60 text-primary-600 dark:text-primary-400">$1</code>'
    )
    .replace(
      /^- (.*?)$/gm,
      '<li class="ml-4 list-disc text-xs sm:text-sm text-muted-foreground my-0.5">$1</li>'
    )
    .replace(/^---$/gm, '<hr class="my-4 border-border" />')
    .replace(/\n\n/g, '<div class="h-2"></div>')
    .replace(/\n/g, "<br />");

  text = text.replace(/__CODE_(\d+)__/g, (_m, idx) => codeBlocks[Number(idx)] || "");

  return text;
}
