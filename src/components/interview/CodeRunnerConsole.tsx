"use client";
// ---------------------------------------------------------------------------
// CodeRunnerConsole — Interactive In-Browser Test Runner & Terminal Output
// Provides: Instant test validation, input/expected/actual comparison,
// stdout terminal inspection, and stress testing.
// ---------------------------------------------------------------------------
import { useState } from "react";
import { type CodeExecutionReport, formatValueForDisplay } from "@/lib/codeRunner";
import { type TestCase } from "@/lib/interview";

interface CodeRunnerConsoleProps {
  testCases: TestCase[];
  report: CodeExecutionReport | null;
  isRunning: boolean;
  onRunTests: () => void;
  onSubmitSolution: () => void;
  isSubmitting?: boolean;
}

export function CodeRunnerConsole({
  testCases,
  report,
  isRunning,
  onRunTests,
  onSubmitSolution,
  isSubmitting = false,
}: CodeRunnerConsoleProps) {
  const [activeTab, setActiveTab] = useState<"tests" | "console">("tests");
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState(0);

  const selectedResult = report?.testResults?.[selectedTestCaseIdx];
  const selectedTestCase = testCases[selectedTestCaseIdx] || testCases[0];

  return (
    <div className="flex flex-col bg-[#080d1a] border-t border-slate-800/90 text-slate-200 font-mono text-xs select-none">
      {/* ── Console Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0c1322] border-b border-slate-800">
        <div className="flex items-center gap-2">
          {/* Tabs */}
          <button
            type="button"
            onClick={() => setActiveTab("tests")}
            className={`px-3 py-1 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "tests"
                ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Test Cases</span>
            {report && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  report.allPassed
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {report.passedCount}/{report.totalCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("console")}
            className={`px-3 py-1 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "console"
                ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            <span>Console</span>
            {report?.stdout && report.stdout.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                {report.stdout.length}
              </span>
            )}
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Run Code */}
          <button
            type="button"
            onClick={onRunTests}
            disabled={isRunning}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 font-heading font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Execute test cases (Ctrl + Enter)"
          >
            {isRunning ? (
              <span className="w-3 h-3 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
            <span>Run Tests</span>
            <span className="hidden sm:inline text-[10px] text-slate-400 font-mono border-l border-slate-700 pl-1.5 ml-0.5">
              Ctrl+Enter
            </span>
          </button>

          {/* Submit Solution to Interviewer */}
          <button
            type="button"
            onClick={onSubmitSolution}
            disabled={isSubmitting || isRunning}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-heading font-black text-xs flex items-center gap-1.5 shadow-md shadow-teal-950/40 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
            <span>Submit Solution</span>
          </button>
        </div>
      </div>

      {/* ── Tab 1: Test Cases View ─────────────────────────────────────── */}
      {activeTab === "tests" && (
        <div className="p-3 space-y-3 min-h-[140px] max-h-[220px] overflow-y-auto">
          {/* Test Case Selection Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {testCases.map((tc, idx) => {
              const res = report?.testResults?.[idx];
              const isPassed = res?.passed;
              const isFailed = res && !res.passed;

              return (
                <button
                  key={tc.id}
                  type="button"
                  onClick={() => setSelectedTestCaseIdx(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer transition-all flex-shrink-0 ${
                    selectedTestCaseIdx === idx
                      ? "bg-slate-800 text-white border border-teal-500/60 shadow-xs"
                      : "bg-[#0c1220] text-slate-400 border border-slate-800 hover:text-slate-200"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isPassed ? "bg-emerald-400" : isFailed ? "bg-red-400" : "bg-slate-600"
                    }`}
                  />
                  <span>Case {idx + 1}</span>
                  {res && (
                    <span className="text-[10px] text-slate-500 font-normal">
                      ({res.runtimeMs}ms)
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Test Case Detail */}
          {selectedTestCase && (
            <div className="bg-[#0b101c] rounded-xl border border-slate-800 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {selectedTestCase.description}
                </span>

                {selectedResult ? (
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-heading uppercase tracking-wider ${
                      selectedResult.passed
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {selectedResult.passed ? "PASSED" : "FAILED"}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">Not evaluated yet</span>
                )}
              </div>

              {/* Input Args */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Input Parameters:
                </span>
                <div className="mt-1 p-2 rounded-lg bg-black/40 border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto">
                  {selectedTestCase.input
                    .map((arg, i) => `arg${i + 1} = ${formatValueForDisplay(arg)}`)
                    .join(", ")}
                </div>
              </div>

              {/* Expected vs Actual Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">
                    Expected Output:
                  </span>
                  <div className="mt-1 p-2 rounded-lg bg-black/40 border border-emerald-950/40 text-emerald-300 font-mono text-[11px] overflow-x-auto">
                    {formatValueForDisplay(selectedTestCase.expectedOutput)}
                  </div>
                </div>

                <div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider ${
                      selectedResult?.passed ? "text-emerald-500" : "text-amber-400"
                    }`}
                  >
                    Actual Output:
                  </span>
                  <div
                    className={`mt-1 p-2 rounded-lg bg-black/40 border font-mono text-[11px] overflow-x-auto ${
                      selectedResult?.passed
                        ? "border-emerald-950/40 text-emerald-300"
                        : selectedResult
                          ? "border-red-900/50 text-red-300"
                          : "border-slate-800 text-slate-500"
                    }`}
                  >
                    {selectedResult
                      ? selectedResult.error
                        ? `Error: ${selectedResult.error}`
                        : formatValueForDisplay(selectedResult.actual)
                      : "—"}
                  </div>
                </div>
              </div>

              {/* Compilation / Syntax error if any */}
              {report?.compileError && (
                <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/40 text-red-300 text-xs">
                  <span className="font-bold text-red-400">Compilation Error: </span>
                  <span>{report.compileError}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 2: Console / Stdout Terminal ───────────────────────────── */}
      {activeTab === "console" && (
        <div className="p-3 min-h-[140px] max-h-[220px] overflow-y-auto space-y-1">
          {report?.stdout && report.stdout.length > 0 ? (
            report.stdout.map((line, i) => (
              <div
                key={i}
                className={`font-mono text-[11px] leading-relaxed flex items-start gap-2 ${
                  line.startsWith("[stderr]")
                    ? "text-red-400"
                    : line.startsWith("[warn]")
                      ? "text-amber-400"
                      : "text-slate-300"
                }`}
              >
                <span className="text-slate-600 select-none text-[10px] w-6 text-right">
                  {i + 1}
                </span>
                <span className="whitespace-pre-wrap">{line}</span>
              </div>
            ))
          ) : (
            <div className="h-28 flex flex-col items-center justify-center text-slate-500 text-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-40 mb-1"
              >
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
              <p className="text-[11px]">No console logs recorded.</p>
              <p className="text-[10px] text-slate-600 mt-0.5">
                Use <code className="text-teal-400">console.log(...)</code> in your code to inspect
                variables.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
