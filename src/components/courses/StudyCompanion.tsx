"use client";

// ---------------------------------------------------------------------------
// StudyCompanion — AI Tutor chat panel for real-time Q&A about lessons
// Appears as a collapsible side panel on the course page
// ---------------------------------------------------------------------------
import { useState, useRef, useEffect, useCallback } from "react";

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

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Clear chat when lesson changes
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
        content: data.answer || "Sorry, I couldn't process that question.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble connecting. Please try again in a moment.",
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
    `Explain the key concepts in "${videoTitle}"`,
    "Can you give me a simple example?",
    "What are common mistakes to avoid?",
    "How does this apply in real-world scenarios?",
  ];

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-emerald-500 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer group"
        aria-label="Open AI Study Companion"
        title="Ask AI about this lesson"
      >
        <span className="text-xl group-hover:scale-110 transition-transform">🤖</span>
        {/* Pulse indicator */}
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 animate-pulse border-2 border-white" />
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[400px] h-[75vh] sm:h-[520px] bg-card border-2 border-border sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"
      role="complementary"
      aria-label="AI Study Companion"
    >
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary-50 to-emerald-50 dark:from-primary-950/40 dark:to-emerald-950/40 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center text-white flex-shrink-0">
            <span className="text-base">🤖</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-heading font-bold text-sm text-foreground">AI Study Companion</h3>
            <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">
              Ask about: {videoTitle}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="w-8 h-8 rounded-lg bg-muted/80 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          aria-label="Close companion"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-xl bg-primary-500/10 flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
            <div>
              <p className="font-heading font-bold text-sm text-foreground">
                Ask me anything about this lesson
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                I can explain concepts, give examples, and answer your doubts
              </p>
            </div>

            {/* Suggested Questions */}
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase font-extrabold tracking-wider text-muted-foreground">
                Try asking:
              </p>
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInput(q);
                    setTimeout(() => inputRef.current?.focus(), 100);
                  }}
                  className="w-full text-left text-xs p-2.5 rounded-xl border border-border hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all cursor-pointer text-muted-foreground hover:text-foreground font-body"
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
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                <span className="text-xs">🤖</span>
              </div>
            )}
            <div
              className={`max-w-[80%] p-3 rounded-2xl text-sm font-body leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary-500 text-white rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              }`}
            >
              {msg.role === "assistant" ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                  dangerouslySetInnerHTML={{
                    __html: formatMarkdown(msg.content),
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
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center text-white flex-shrink-0">
              <span className="text-xs">🤖</span>
            </div>
            <div className="bg-muted rounded-2xl rounded-bl-md p-3 px-5">
              <div className="flex gap-1.5">
                <span
                  className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-border bg-muted/30 flex-shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this lesson…"
            className="flex-1 resize-none p-3 rounded-xl border border-border bg-background text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary-500 max-h-24 min-h-[42px]"
            rows={1}
            maxLength={1000}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer active:scale-95 flex-shrink-0"
            aria-label="Send message"
          >
            <svg
              width="16"
              height="16"
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
        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
          Powered by Vidcura AI · Responses may vary based on topic context
        </p>
      </div>
    </div>
  );
}

// Simple markdown to HTML converter for chat messages
function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-xs">$1</code>')
    .replace(
      /```([\s\S]*?)```/g,
      '<pre class="bg-muted p-3 rounded-xl text-xs overflow-x-auto my-2"><code>$1</code></pre>'
    )
    .replace(/^### (.*?)$/gm, '<h4 class="font-heading font-bold text-sm mt-2 mb-1">$1</h4>')
    .replace(/^## (.*?)$/gm, '<h3 class="font-heading font-bold text-base mt-2 mb-1">$1</h3>')
    .replace(/^- (.*?)$/gm, '<li class="ml-4 list-disc text-sm">$1</li>')
    .replace(/^(\d+)\. (.*?)$/gm, '<li class="ml-4 list-decimal text-sm">$2</li>')
    .replace(/\n/g, "<br />");
}
