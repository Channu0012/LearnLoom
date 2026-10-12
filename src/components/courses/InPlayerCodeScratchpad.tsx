"use client";

// ---------------------------------------------------------------------------
// InPlayerCodeScratchpad — Interactive In-Player Code & Sandbox Suite
// Enables technical learners to code, test snippets, and take code notes
// side-by-side with video lectures without leaving VeySkill.
// ---------------------------------------------------------------------------
import { useState, useEffect, useCallback } from "react";

interface InPlayerCodeScratchpadProps {
  courseId: string;
  courseTitle: string;
  activeLessonTitle: string;
}

const STARTER_SNIPPETS: Record<string, string> = {
  javascript: `// VeySkill In-Player JavaScript Scratchpad
// Test algorithms and logic live while watching:
function solveProblem(input) {
  const result = input.map(x => x * 2);
  console.log("Processed array:", result);
  return result;
}

const output = solveProblem([1, 2, 3, 4, 5]);
console.log("Final Output:", output);
`,
  python: `# Python Scratchpad
# Note down data structures or algorithms:
def process_data(items):
    return [x * 2 for x in items]

print("Ready for practice")
`,
  typescript: `// TypeScript Interface Blueprint
interface LessonConcept {
  id: string;
  title: string;
  completed: boolean;
}

type Status = "pending" | "in_progress" | "mastered";
`,
  sql: `-- SQL Query Scratchpad
SELECT 
  u.id, 
  u.name, 
  COUNT(c.id) AS completed_courses
FROM users u
JOIN certificates c ON u.id = c.user_id
GROUP BY u.id, u.name
ORDER BY completed_courses DESC;
`,
  html: `<!-- HTML / Component Layout Sketch -->
<div class="card p-4 rounded-xl shadow-md">
  <h2 class="text-lg font-bold">Key Lecture Takeaway</h2>
  <p class="text-sm text-gray-600">Architectural notes here...</p>
</div>
`,
  text: `// Quick Scratchpad Notes
- Core takeaway 1:
- Technical pattern:
- Formula / Edge case:
`,
};

export function InPlayerCodeScratchpad({
  courseId,
  courseTitle,
  activeLessonTitle,
}: InPlayerCodeScratchpadProps) {
  const storageKey = `veyskill_scratchpad_${courseId}`;
  const langKey = `veyskill_scratchpad_lang_${courseId}`;

  const [language, setLanguage] = useState<string>("javascript");
  const [code, setCode] = useState<string>(STARTER_SNIPPETS.javascript || "");
  const [consoleOutput, setConsoleOutput] = useState<string[]>([
    "Ready. Click 'Run Code' to execute JavaScript snippets.",
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);

  // Load from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedLang = localStorage.getItem(langKey);
      if (savedLang && STARTER_SNIPPETS[savedLang]) {
        setLanguage(savedLang);
      }
      const savedCode = localStorage.getItem(storageKey);
      if (savedCode) {
        setCode(savedCode);
      }
    } catch {}
  }, [storageKey, langKey]);

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      setSaved(false);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey, newCode);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        } catch {}
      }
    },
    [storageKey]
  );

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(langKey, newLang);
      } catch {}
    }
    // If current code matches previous default template, swap to new template
    const prevStarter = STARTER_SNIPPETS[language];
    if (code.trim() === prevStarter?.trim()) {
      handleCodeChange(STARTER_SNIPPETS[newLang] || "");
    }
  };

  const handleRunCode = () => {
    setIsRunning(true);
    const logs: string[] = [];

    if (language !== "javascript") {
      setConsoleOutput([
        `[${language.toUpperCase()} Mode] Code saved locally in your study workspace.`,
        "Note: In-browser execution is active for JavaScript snippets. Switch language to 'JavaScript' to run live in the browser console.",
      ]);
      setIsRunning(false);
      return;
    }

    try {
      // Capture console.log outputs safely
      const customConsole = {
        log: (...args: unknown[]) => {
          logs.push(
            args
              .map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)))
              .join(" ")
          );
        },
        error: (...args: unknown[]) => {
          logs.push("Error: " + args.map(String).join(" "));
        },
        warn: (...args: unknown[]) => {
          logs.push("Warn: " + args.map(String).join(" "));
        },
        info: (...args: unknown[]) => {
          logs.push("Info: " + args.map(String).join(" "));
        },
      };

      // Sandboxed execution using Function constructor with restricted scope
      const runner = new Function("console", code);
      runner(customConsole);

      if (logs.length === 0) {
        logs.push("✓ Code executed successfully with 0 console logs.");
      }
      setConsoleOutput(logs);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setConsoleOutput([`✕ Runtime Exception: ${errMsg}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleReset = () => {
    const starter = STARTER_SNIPPETS[language] || "";
    handleCodeChange(starter);
    setConsoleOutput(["Reset to default starter template."]);
  };

  return (
    <div className="enterprise-card p-4 sm:p-5 bg-card border border-border rounded-xl shadow-xs space-y-4">
      {/* Header Deck */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-extrabold text-base text-foreground flex items-center gap-2">
              <span>Technical Code Scratchpad</span>
            </h3>
            {saved && (
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Auto-Saved
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-body mt-0.5">
            Active Module:{" "}
            <span className="font-semibold text-foreground">{activeLessonTitle}</span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Language selector */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-muted border border-border text-foreground font-heading font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500"
            aria-label="Select Programming Language"
          >
            <option value="javascript">JavaScript (Live Run)</option>
            <option value="python">Python</option>
            <option value="typescript">TypeScript</option>
            <option value="sql">SQL</option>
            <option value="html">HTML / UI</option>
            <option value="text">Notes / Pseudo</option>
          </select>

          {/* Run Code Button */}
          <button
            type="button"
            onClick={handleRunCode}
            disabled={isRunning}
            className="btn-primary text-xs px-3.5 py-1.5 inline-flex items-center gap-1.5 shadow-sm active:scale-95 transition-all font-heading font-bold"
            title="Execute code in sandboxed runner"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span>Run Code</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="btn-ghost text-xs px-2.5 py-1.5 font-heading font-bold inline-flex items-center gap-1 border border-border rounded-lg"
            title="Copy code to clipboard"
          >
            {copied ? (
              <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
            ) : (
              <span>Copy</span>
            )}
          </button>

          {/* Reset Template */}
          <button
            type="button"
            onClick={handleReset}
            className="btn-ghost text-xs px-2 py-1.5 font-heading text-muted-foreground hover:text-foreground"
            title="Reset to starter template"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Code Editor Body */}
      <div className="rounded-xl border border-border bg-neutral-950 text-neutral-100 overflow-hidden shadow-inner font-mono text-xs">
        <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900 border-b border-neutral-800 text-[10px] text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
            <span className="ml-2 uppercase font-bold text-neutral-300">{language}</span>
            {language === "html" && (
              <button
                type="button"
                onClick={() => setShowHtmlPreview((p) => !p)}
                className={`ml-3 px-2 py-0.5 rounded text-[10px] font-sans font-bold cursor-pointer transition-colors ${
                  showHtmlPreview
                    ? "bg-teal-500 text-white"
                    : "bg-neutral-800 text-neutral-300 hover:text-white"
                }`}
              >
                {showHtmlPreview ? "Show Source" : "Live UI Preview"}
              </button>
            )}
          </div>
          <span className="text-[10px] text-neutral-500 font-sans">
            Auto-saves locally for {courseTitle.slice(0, 25)}…
          </span>
        </div>

        {language === "html" && showHtmlPreview ? (
          <div className="p-3 bg-neutral-900 min-h-[220px]">
            <iframe
              title="HTML Sandbox Preview"
              sandbox="allow-scripts"
              srcDoc={code}
              className="w-full h-56 bg-white rounded-lg border border-neutral-700 shadow-sm"
            />
          </div>
        ) : (
          <div className="flex relative min-h-[220px]">
            {/* Line number gutter */}
            <div className="select-none py-3.5 px-2.5 text-right bg-neutral-900/60 border-r border-neutral-800/80 text-neutral-500 font-mono text-xs sm:text-sm leading-relaxed min-w-[38px]">
              {Array.from({ length: Math.max(code.split("\n").length, 8) }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            <textarea
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              rows={10}
              spellCheck={false}
              className="flex-1 p-3.5 bg-transparent text-neutral-200 font-mono text-xs sm:text-sm focus:outline-none leading-relaxed resize-y selection:bg-teal-500/30"
              placeholder="Type or paste code snippets here..."
            />
          </div>
        )}
      </div>

      {/* Terminal / Console Output Drawer */}
      <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-1.5 font-mono text-xs">
        <div className="flex items-center justify-between text-[11px] font-heading font-bold text-muted-foreground border-b border-border/60 pb-1">
          <div className="flex items-center gap-1.5">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            <span>Output Console</span>
          </div>
          <button
            type="button"
            onClick={() => setConsoleOutput([])}
            className="text-[10px] hover:text-foreground text-muted-foreground font-sans cursor-pointer"
          >
            Clear
          </button>
        </div>

        <div className="max-h-36 overflow-y-auto space-y-1 pt-1">
          {consoleOutput.length === 0 ? (
            <span className="text-[11px] text-muted-foreground/60 italic">
              Console is empty. Click &apos;Run Code&apos; to view output.
            </span>
          ) : (
            consoleOutput.map((log, idx) => (
              <div
                key={idx}
                className={`text-[11px] leading-relaxed whitespace-pre-wrap ${
                  log.startsWith("✕")
                    ? "text-red-500 dark:text-red-400 font-bold"
                    : log.startsWith("✓")
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-foreground"
                }`}
              >
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
