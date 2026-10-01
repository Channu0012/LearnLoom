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

  const sendMessage = useCallback(async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: question,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

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
  }, [input, isLoading, videoTitle, courseTitle, courseCategory, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    `Summarize key principles covered in "${videoTitle}"`,
    "Provide a concrete industry example of this concept",
    "What architectural anti-patterns should be avoided here?",
    "How do these principles scale in production?",
  ];

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-foreground text-background shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer border border-border group"
        aria-label="Open AI Study Assistant"
        title="Consult AI Study Assistant"
      >
        <svg
          width="22"
          height="22"
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
      className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[420px] h-[78vh] sm:h-[540px] bg-card border-2 border-border sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"
      role="complementary"
      aria-label="AI Study Assistant"
    >
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/40 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center flex-shrink-0">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="4" y="8" width="16" height="12" rx="2" />
              <path d="M12 2v6" />
              <circle cx="9" cy="13" r="1" fill="currentColor" />
              <circle cx="15" cy="13" r="1" fill="currentColor" />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-foreground">
              AI Study Assistant
            </h3>
            <p className="text-[10px] text-muted-foreground truncate max-w-[220px]">
              Lesson: {videoTitle}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="w-7 h-7 rounded-lg bg-muted/80 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          aria-label="Close assistant"
        >
          <svg
            width="12"
            height="12"
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

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-heading font-bold text-xs uppercase tracking-wider text-foreground">
                Technical Inquiry Desk
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[280px] mx-auto">
                Request conceptual breakdowns, architectural reviews, or code clarifications for
                this lesson.
              </p>
            </div>

            {/* Quick Questions */}
            <div className="space-y-1.5 text-left">
              <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-muted-foreground">
                Suggested Inquiries:
              </p>
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInput(q);
                    setTimeout(() => inputRef.current?.focus(), 100);
                  }}
                  className="w-full text-left text-xs p-2.5 rounded-xl border border-border bg-card hover:bg-muted/60 transition-all cursor-pointer text-muted-foreground hover:text-foreground font-body leading-snug"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
          >
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-md bg-muted border border-border flex items-center justify-center text-foreground flex-shrink-0 mt-0.5">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="4" y="8" width="16" height="12" rx="2" />
                  <path d="M12 2v6" />
                </svg>
              </div>
            )}
            <div
              className={`max-w-[85%] p-3 rounded-2xl text-xs font-body leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary-500 text-white rounded-br-md shadow-sm"
                  : "bg-muted/70 text-foreground border border-border/60 rounded-bl-md"
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
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 animate-fade-in">
            <div className="w-6 h-6 rounded-md bg-muted border border-border flex items-center justify-center text-foreground flex-shrink-0">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="4" y="8" width="16" height="12" rx="2" />
                <path d="M12 2v6" />
              </svg>
            </div>
            <div className="bg-muted/70 border border-border/60 rounded-2xl rounded-bl-md p-3 px-4 flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
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
            placeholder="Type your question regarding this lesson…"
            className="flex-1 resize-none p-2.5 rounded-xl border border-border bg-muted/40 text-foreground text-xs font-body focus:outline-none focus:ring-1 focus:ring-primary-500 max-h-24 min-h-[38px]"
            rows={1}
            maxLength={1000}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-xl bg-foreground text-background flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer active:scale-95 flex-shrink-0"
            aria-label="Transmit inquiry"
          >
            <svg
              width="14"
              height="14"
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
          Vidcura Academic AI Engine · Verified Curriculum Context
        </p>
      </div>
    </div>
  );
}

// XSS-safe markdown converter: Escapes raw HTML first, then applies markdown rules
function sanitizeAndFormatMarkdown(rawText: string): string {
  const safeText = escapeXml(rawText);
  return safeText
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono">$1</code>'
    )
    .replace(
      /```([\s\S]*?)```/g,
      '<pre class="bg-card p-3 rounded-xl text-[11px] font-mono border border-border overflow-x-auto my-2"><code>$1</code></pre>'
    )
    .replace(
      /^### (.*?)$/gm,
      '<h4 class="font-heading font-bold text-xs uppercase tracking-wider mt-2 mb-1">$1</h4>'
    )
    .replace(/^## (.*?)$/gm, '<h3 class="font-heading font-bold text-sm mt-2 mb-1">$1</h3>')
    .replace(/^- (.*?)$/gm, '<li class="ml-4 list-disc text-xs">$1</li>')
    .replace(/^(\d+)\. (.*?)$/gm, '<li class="ml-4 list-decimal text-xs">$2</li>')
    .replace(/\n/g, "<br />");
}
