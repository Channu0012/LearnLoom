"use client";

// ---------------------------------------------------------------------------
// StudyCompanion — AI Tutor Panel (Coursera / Google Skill Coach Grade)
// Zero emojis — pure high-precision vector iconography.
// Includes XSS sanitization, markdown formatting, and structured doubt clearance.
// ---------------------------------------------------------------------------
import { useState, useRef, useEffect, useCallback } from "react";
import { escapeXml } from "@/lib/security";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface StudyCompanionProps {
  videoTitle: string;
  courseTitle: string;
  courseCategory: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function StudyCompanion({
  videoTitle,
  courseTitle,
  courseCategory,
  isOpen,
  onToggle,
}: StudyCompanionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [copiedMsgIdx, setCopiedMsgIdx] = useState<number | null>(null);
  const [loadingStep, setLoadingStep] = useState("Analyzing curriculum context…");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    setMessages([]);
  }, [videoTitle]);

  // Loading animation step cycler
  useEffect(() => {
    if (!isLoading) return;
    const steps = [
      "Analyzing lesson context & curriculum…",
      "Formulating pedagogical guidance…",
      "Validating technical principles & code…",
    ];
    let stepIndex = 0;
    const interval = setInterval(() => {
      stepIndex = (stepIndex + 1) % steps.length;
      setLoadingStep(steps[stepIndex]);
    }, 1800);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleCopyMessage = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgIdx(idx);
    setTimeout(() => setCopiedMsgIdx(null), 2000);
  };

  const sendMessage = useCallback(
    async (overrideText?: string) => {
      const question = (overrideText || input).trim();
      if (!question || isLoading) return;

      const userMsg: ChatMessage = {
        role: "user",
        content: question,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      if (!overrideText) setInput("");
      setIsLoading(true);
      setLoadingStep("Analyzing lesson context & curriculum…");

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            videoTitle,
            courseTitle,
            courseCategory,
            chatHistory: messages.slice(-6).map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!res.ok) throw new Error("Failed to get response");

        const data = await res.json();
        const aiMsg: ChatMessage = {
          role: "assistant",
          content: data.answer || "Unable to formulate a response. Please rephrase your query.",
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, aiMsg]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Connection to the AI mentor failed. Please verify your connection and retry.",
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, videoTitle, courseTitle, courseCategory, messages]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickPills = [
    {
      label: "Explain Simply",
      prompt: `Explain the core concept in "${videoTitle}" simply with step-by-step intuition.`,
    },
    {
      label: "Code Example",
      prompt: `Provide a clean, runnable, commented code snippet illustrating the concepts in "${videoTitle}".`,
    },
    {
      label: "Key Takeaways",
      prompt: `Summarize the 3 most critical engineering principles and pitfalls in "${videoTitle}".`,
    },
    {
      label: "Test My Knowledge",
      prompt: `Ask me 2 targeted conceptual questions to test if I understood "${videoTitle}".`,
    },
  ];

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-foreground text-background shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer border border-border group"
        aria-label="Open AI Study Assistant"
        title="Consult AI Study Coach"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="group-hover:rotate-12 transition-transform"
        >
          <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
          <rect x="4" y="8" width="16" height="12" rx="2" />
          <circle cx="9" cy="13" r="1" fill="currentColor" />
          <circle cx="15" cy="13" r="1" fill="currentColor" />
          <line x1="8" y1="17" x2="16" y2="17" />
        </svg>
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[440px] h-[88vh] sm:h-[580px] bg-card/95 backdrop-blur-2xl border-t-2 sm:border-2 border-border rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"
      role="complementary"
      aria-label="AI Academic Coach"
    >
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/40 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-primary-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
              <rect x="4" y="8" width="16" height="12" rx="2" />
              <circle cx="9" cy="13" r="1" fill="currentColor" />
              <circle cx="15" cy="13" r="1" fill="currentColor" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-heading font-extrabold text-xs uppercase tracking-wider text-foreground">
                VeySkill Academic Coach
              </h3>
            </div>
            <p className="text-[10px] text-muted-foreground truncate max-w-[240px]">
              Module: {videoTitle}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="w-8 h-8 rounded-xl bg-muted/80 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          aria-label="Close assistant"
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

      {/* Quick Action Category Pills */}
      <div className="px-3 py-2 border-b border-border/60 bg-card/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
        {quickPills.map((pill, i) => (
          <button
            key={i}
            type="button"
            onClick={() => sendMessage(pill.prompt)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-muted border border-border/80 hover:border-primary-500/50 hover:bg-muted/80 text-[11px] font-heading font-bold text-muted-foreground hover:text-foreground transition-all flex-shrink-0 cursor-pointer disabled:opacity-50"
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.length === 0 && (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-3xl bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 flex items-center justify-center shadow-inner">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-heading font-extrabold text-sm text-foreground">
                Coursera-Grade Academic Assistant
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[290px] mx-auto leading-relaxed">
                Stuck on a concept, syntax error, or algorithm? Ask below for step-by-step
                derivations and real-world code solutions.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} animate-fade-in group`}
          >
            <div
              className={`max-w-[90%] p-3.5 rounded-2xl text-xs font-body leading-relaxed shadow-sm ${
                msg.role === "user"
                  ? "bg-primary-600 text-white rounded-br-sm"
                  : "bg-muted/60 dark:bg-card/90 text-foreground border border-border/80 rounded-bl-sm"
              }`}
            >
              {msg.role === "assistant" ? (
                <div
                  className="prose prose-xs dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 font-body text-xs"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeAndFormatMarkdown(msg.content),
                  }}
                />
              ) : (
                msg.content
              )}
            </div>

            {msg.role === "assistant" && (
              <div className="flex items-center gap-2 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => handleCopyMessage(msg.content, idx)}
                  className="text-[10px] font-mono text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>{copiedMsgIdx === idx ? "Copied!" : "Copy Answer"}</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 animate-fade-in items-start">
            <div className="w-7 h-7 rounded-xl bg-primary-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
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
            </div>
            <div className="bg-muted/70 dark:bg-card border border-border/80 rounded-2xl rounded-bl-sm p-3 px-4 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-heading font-bold text-foreground">
                  VeySkill Academic AI
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-xs text-muted-foreground animate-pulse font-body">{loadingStep}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-border bg-background flex-shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a technical question about this lesson…"
            className="flex-1 resize-none p-2.5 rounded-xl border border-border bg-muted/40 text-foreground text-xs font-body focus:outline-none focus:ring-2 focus:ring-primary-500 max-h-24 min-h-[40px] leading-relaxed"
            rows={1}
            maxLength={1000}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer active:scale-95 flex-shrink-0 shadow-sm"
            aria-label="Send inquiry"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-center font-mono">
          VeySkill Socratic AI · Strict Academic Context · Zero Emojis
        </p>
      </div>
    </div>
  );
}

// XSS-safe markdown converter: Preserves code blocks from breaking with <br /> tags
function sanitizeAndFormatMarkdown(rawText: string): string {
  const codeBlocks: string[] = [];
  let placeholderText = rawText.replace(
    /```([a-zA-Z0-9_+-]*)\n?([\s\S]*?)```/g,
    (_m, lang, code) => {
      const idx = codeBlocks.length;
      const cleanLang = lang ? escapeXml(lang) : "text";
      const cleanCode = escapeXml(code.trim());
      codeBlocks.push(
        `<div class="my-3 rounded-xl border border-border bg-neutral-950 text-neutral-100 overflow-hidden shadow-sm">
        <div class="flex items-center justify-between px-3 py-1.5 bg-neutral-900 border-b border-neutral-800 text-[10px] font-mono text-neutral-400">
          <span>${cleanLang}</span>
          <span class="text-[10px] uppercase font-bold tracking-wider text-teal-400">Code Blueprint</span>
        </div>
        <pre class="p-3 text-[11px] font-mono overflow-x-auto leading-relaxed"><code>${cleanCode}</code></pre>
      </div>`
      );
      return `__CODE_BLOCK_${idx}__`;
    }
  );

  placeholderText = escapeXml(placeholderText);

  placeholderText = placeholderText
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono text-primary-600 dark:text-primary-400 border border-border/50">$1</code>'
    )
    .replace(
      /^### (.*?)$/gm,
      '<h4 class="font-heading font-extrabold text-xs uppercase tracking-wider text-foreground mt-3 mb-1.5">$1</h4>'
    )
    .replace(
      /^## (.*?)$/gm,
      '<h3 class="font-heading font-extrabold text-sm text-foreground mt-3.5 mb-1.5">$1</h3>'
    )
    .replace(
      /^- (.*?)$/gm,
      '<li class="ml-4 list-disc text-xs text-muted-foreground my-0.5 leading-relaxed">$1</li>'
    )
    .replace(
      /^(\d+)\. (.*?)$/gm,
      '<li class="ml-4 list-decimal text-xs text-muted-foreground my-0.5 leading-relaxed">$2</li>'
    )
    .replace(/\n\n/g, '<div class="h-2"></div>')
    .replace(/\n/g, "<br />");

  placeholderText = placeholderText.replace(/__CODE_BLOCK_(\d+)__/g, (_m, idx) => {
    return codeBlocks[Number(idx)] || "";
  });

  return placeholderText;
}
