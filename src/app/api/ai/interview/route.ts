// ---------------------------------------------------------------------------
// API Route: POST /api/ai/interview
// AI Mock Interviewer — Conducts live technical interviews via Gemini AI
// Supports: ask (get next question), evaluate (generate scorecard)
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, sanitizeInput } from "@/lib/security";
import {
  buildInterviewerSystemPrompt,
  buildScorecardPrompt,
  calculateGrade,
  calculateFaangReadiness,
  ROLE_LABELS,
  INTERVIEWER_PROFILES,
  type InterviewConfig,
  type InterviewMessage,
  type InterviewScorecard,
  type ScorecardCategory,
} from "@/lib/interview";

export const dynamic = "force-dynamic";
export const maxDuration = 30; // Allow longer timeout for interview responses

// ---------------------------------------------------------------------------
// AI Engines: Kie.ai (Claude Wire Protocol) + Gemini AI + Fallback
// ---------------------------------------------------------------------------
import { GoogleGenerativeAI } from "@google/generative-ai";

const kieApiKey = process.env.KIE_API_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;
const claudeApiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

const isDedicatedGeminiKey =
  Boolean(geminiApiKey) &&
  geminiApiKey !== process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  !geminiApiKey?.startsWith("AIzaSyCaqADQyqxNJ4QhXZQj6ItS40XTiEnEZaY");

const genAI = isDedicatedGeminiKey && geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

const PRIMARY_MODEL = "gemini-2.0-flash";
const FALLBACK_MODEL = "gemini-1.5-flash";

// Strip emojis from AI responses
function stripEmojis(text: string): string {
  return text
    .replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ""
    )
    .trim();
}

// Call Gemini with conversation context (chat-style)
async function callGeminiChat(
  systemPrompt: string,
  messages: { role: "user" | "model"; content: string }[],
  modelName: string,
  timeoutMs: number = 12000
): Promise<string | null> {
  if (!genAI) return null;
  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
    });

    // Build chat history
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    const chat = model.startChat({ history });

    const resultPromise = chat.sendMessage(lastMessage.content);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Gemini interview timeout")), timeoutMs)
    );

    const result = await Promise.race([resultPromise, timeoutPromise]);
    const text = result.response.text();
    return typeof text === "string" ? text : null;
  } catch {
    return null;
  }
}

// Call Claude as fallback
async function callClaude(prompt: string): Promise<string | null> {
  if (!claudeApiKey) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": claudeApiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.content?.[0]?.text ?? null;
  } catch {
    return null;
  }
}

// Call Kie.ai via Anthropic Wire Protocol
async function callKieClaude(
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[],
  maxTokens: number = 800
): Promise<string | null> {
  if (!kieApiKey) return null;
  try {
    const res = await fetch("https://api.kie.ai/anthropic/v1/messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${kieApiKey}`,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        system: systemPrompt,
        messages,
        max_tokens: maxTokens,
      }),
    });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    const text = data?.content?.[0]?.text;
    return typeof text === "string" ? stripEmojis(text) : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main Handler
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    // Rate limiting: Max 30 interview requests per minute per IP
    const rate = checkRateLimit(ip, "ai-interview", 30, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: `Rate limit reached. Please wait ${rate.resetInSeconds} seconds before continuing.`,
        },
        { status: 429, headers: { "Retry-After": String(rate.resetInSeconds) } }
      );
    }

    const body = await request.json();
    const action = body?.action; // "ask" | "evaluate" | "start"

    if (action === "start" || action === "ask") {
      return handleInterviewQuestion(body);
    } else if (action === "evaluate") {
      return handleEvaluation(body);
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use: start, ask, evaluate" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[API] Interview error:", error);
    return NextResponse.json(
      { error: "Interview service temporarily unavailable. Please try again." },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Handle Interview Question (start or continue)
// ---------------------------------------------------------------------------
async function handleInterviewQuestion(body: Record<string, unknown>) {
  const config = body?.config as InterviewConfig | undefined;
  const rawMessages = Array.isArray(body?.messages) ? body.messages : [];

  if (!config?.role || !config?.level || !config?.topics?.length) {
    return NextResponse.json(
      { error: "Missing interview configuration (role, level, topics)." },
      { status: 400 }
    );
  }

  const systemPrompt = buildInterviewerSystemPrompt(config);

  // Convert messages to Gemini chat format
  const chatMessages = rawMessages
    .filter((m: Record<string, unknown>) => m?.role && m?.content && typeof m.content === "string")
    .map((m: Record<string, unknown>) => ({
      role: (m.role === "candidate" ? "user" : "model") as "user" | "model",
      content: sanitizeInput(m.content as string, 2000),
    }));

  // For "start" action, add an initial prompt to kick off the interview
  if (body?.action === "start" || chatMessages.length === 0) {
    chatMessages.push({
      role: "user" as const,
      content: `I am ready for the ${config.role} interview at ${config.level} level. The topics I want to be interviewed on are: ${config.topics.join(", ")}. Please begin.`,
    });
  }

  // 1. Try Kie.ai (Claude Sonnet / Haiku wire protocol)
  if (kieApiKey) {
    const anthropicMessages = chatMessages.map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    }));
    const kieResponse = await callKieClaude(systemPrompt, anthropicMessages);
    if (kieResponse) {
      return NextResponse.json({ response: stripEmojis(kieResponse) }, { status: 200 });
    }
  }

  // 2. Try Gemini (primary then fallback)
  if (genAI) {
    for (const modelName of [PRIMARY_MODEL, FALLBACK_MODEL]) {
      const response = await callGeminiChat(systemPrompt, chatMessages, modelName, 15000);
      if (response) {
        return NextResponse.json({ response: stripEmojis(response) }, { status: 200 });
      }
    }
  }

  // 3. Try Claude as direct fallback
  const fullPrompt = `${systemPrompt}\n\nConversation so far:\n${chatMessages
    .map((m) => `${m.role === "user" ? "CANDIDATE" : "INTERVIEWER"}: ${m.content}`)
    .join("\n")}\n\nProvide the next interviewer response (ONE question or follow-up only):`;

  const claudeResponse = await callClaude(fullPrompt);
  if (claudeResponse) {
    return NextResponse.json({ response: stripEmojis(claudeResponse) }, { status: 200 });
  }

  // 4. Intelligent Context-Aware Question Sequencer (Resilient Offline Engine)
  const interviewer = INTERVIEWER_PROFILES[config.role] || INTERVIEWER_PROFILES.frontend;
  const candidateMessages = chatMessages.filter((m) => m.role === "user");
  const turnIndex = candidateMessages.length;

  // If candidate has answered questions, formulate realistic dynamic follow-ups
  if (turnIndex > 1) {
    const lastAnswer = candidateMessages[candidateMessages.length - 1].content.trim();
    const wordCount = lastAnswer.split(/\s+/).length;

    // Probe if the answer was brief or vague
    if (wordCount < 15) {
      return NextResponse.json(
        {
          response:
            "That provides a high-level summary, but in a production environment with high concurrency, what failure modes or edge cases would you anticipate? Walk me through how you would handle them.",
        },
        { status: 200 }
      );
    }

    const currentTopic = config.topics[(turnIndex - 1) % config.topics.length] || config.topics[0];
    const followUps = [
      `Good breakdown. Let us explore ${currentTopic}. How would you architect this solution to handle sudden traffic spikes and maintain low p99 latencies?`,
      `Understood. From an observability standpoint on ${currentTopic}, what specific telemetry, health checks, and alerting thresholds would you configure?`,
      `Makes sense. In terms of data consistency and concurrency for ${currentTopic}, how would you prevent race conditions or stale reads?`,
      `Great. Let us examine trade-offs. If engineering constraints required optimizing strictly for memory efficiency and cost, what compromises would you make in ${currentTopic}?`,
      `Well articulated. Now, if this service experiences a network partition or database failover, walk me through your graceful degradation and circuit breaker strategy.`,
    ];

    const followUpQuestion = followUps[(turnIndex - 2) % followUps.length];
    return NextResponse.json({ response: followUpQuestion }, { status: 200 });
  }

  // Initial opening question tailored to the assigned Lead Interviewer persona
  const openingQuestions: Record<string, string> = {
    frontend: `Hello, I am ${interviewer.name}. Welcome to your ${ROLE_LABELS[config.role]} technical interview. Let us start with web performance fundamentals: Walk me through what happens in the browser from the moment an HTML document is received to when pixels are painted on the screen. How do DOM construction, CSSOM calculation, and JavaScript parsing interact on the main thread?`,
    backend: `Hello, I am ${interviewer.name}. Welcome to your ${ROLE_LABELS[config.role]} technical interview. Let us begin with request processing architectures: Can you walk me through the lifecycle of an incoming HTTP request as it flows through a reverse proxy, connection pool, and application event loop?`,
    fullstack: `Hello, I am ${interviewer.name}. Welcome to your ${ROLE_LABELS[config.role]} technical interview. Let us start with distributed architecture: If you were tasked with designing a real-time collaborative application, how would you structure the client state synchronization engine alongside the backend storage layer?`,
    "data-science": `Hello, I am ${interviewer.name}. Welcome to your ${ROLE_LABELS[config.role]} technical interview. Let us begin with model validation: When deploying models to production with potential covariate shift, how do you diagnose data drift and what retraining strategies do you put in place?`,
    devops: `Hello, I am ${interviewer.name}. Welcome to your ${ROLE_LABELS[config.role]} technical interview. Let us start with incident response and resilience: Suppose a Kubernetes service begins throwing intermittent 504 gateway timeouts under 20k RPS. Walk me through your step-by-step triage methodology.`,
    mobile: `Hello, I am ${interviewer.name}. Welcome to your ${ROLE_LABELS[config.role]} technical interview. Let us explore mobile runtime performance: How do you architect an offline-first mobile application with background sync without causing frame drops or main thread stutter?`,
    "system-design": `Hello, I am ${interviewer.name}. Welcome to your ${ROLE_LABELS[config.role]} technical interview. Let us begin with distributed systems: How would you design a globally distributed rate-limiting system that handles 100 million requests per minute across multiple cloud regions with sub-millisecond overhead?`,
  };

  return NextResponse.json(
    {
      response:
        openingQuestions[config.role] ||
        `Hello, I am ${interviewer.name}. Let us begin your ${ROLE_LABELS[config.role]} technical interview. Tell me about a complex technical challenge you solved recently and the trade-offs you made.`,
    },
    { status: 200 }
  );
}

// ---------------------------------------------------------------------------
// Handle Evaluation (Generate Scorecard)
// ---------------------------------------------------------------------------
async function handleEvaluation(body: Record<string, unknown>) {
  const config = body?.config as InterviewConfig | undefined;
  const rawMessages = (body?.messages || []) as InterviewMessage[];

  if (!config || !rawMessages.length) {
    return NextResponse.json(
      { error: "Missing config or messages for evaluation." },
      { status: 400 }
    );
  }

  const scorecardPrompt = buildScorecardPrompt(config, rawMessages);

  // Try to get AI-generated scorecard
  let scorecardJson: string | null = null;

  // 1. Try Kie.ai
  if (kieApiKey) {
    const kieScorecard = await callKieClaude(
      "You are a strict FAANG hiring committee bar raiser. Return ONLY valid raw JSON adhering to the specified schema with no commentary.",
      [{ role: "user", content: scorecardPrompt }],
      2500
    );
    if (kieScorecard) {
      scorecardJson = kieScorecard;
    }
  }

  // 2. Try Gemini AI
  if (!scorecardJson && genAI) {
    for (const modelName of [PRIMARY_MODEL, FALLBACK_MODEL]) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const resultPromise = model.generateContent(scorecardPrompt);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Scorecard timeout")), 20000)
        );
        const result = await Promise.race([resultPromise, timeoutPromise]);
        scorecardJson = result.response.text();
        if (scorecardJson) break;
      } catch {
        continue;
      }
    }
  }

  // 3. Try direct Claude
  if (!scorecardJson) {
    scorecardJson = await callClaude(scorecardPrompt);
  }

  if (scorecardJson) {
    try {
      // Extract JSON from response
      const jsonMatch = scorecardJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const overallScore =
          typeof parsed.overallScore === "number"
            ? Math.min(100, Math.max(0, parsed.overallScore))
            : 50;

        const scorecard: InterviewScorecard = {
          overallScore,
          overallGrade: calculateGrade(overallScore),
          faangReadiness: calculateFaangReadiness(overallScore),
          categories: Array.isArray(parsed.categories)
            ? parsed.categories.map((c: Record<string, unknown>): ScorecardCategory => ({
                name: stripEmojis(String(c.name || "General")),
                score: Math.min(100, Math.max(0, Number(c.score) || 0)),
                maxScore: 100,
                feedback: stripEmojis(String(c.feedback || "")),
                strengths: Array.isArray(c.strengths)
                  ? c.strengths.map((s: unknown) => stripEmojis(String(s)))
                  : [],
                improvements: Array.isArray(c.improvements)
                  ? c.improvements.map((s: unknown) => stripEmojis(String(s)))
                  : [],
              }))
            : [],
          summary: stripEmojis(String(parsed.summary || "")),
          topStrengths: Array.isArray(parsed.topStrengths)
            ? parsed.topStrengths.map((s: unknown) => stripEmojis(String(s)))
            : [],
          criticalImprovements: Array.isArray(parsed.criticalImprovements)
            ? parsed.criticalImprovements.map((s: unknown) => stripEmojis(String(s)))
            : [],
          recommendedResources: Array.isArray(parsed.recommendedResources)
            ? parsed.recommendedResources.map((s: unknown) => stripEmojis(String(s)))
            : [],
          interviewDuration: 0,
          totalQuestions: rawMessages.filter((m) => m.role === "interviewer").length,
          questionsAnswered: rawMessages.filter((m) => m.role === "candidate").length,
        };

        return NextResponse.json({ scorecard }, { status: 200 });
      }
    } catch {
      // Fall through to fallback
    }
  }

  // Deterministic fallback scorecard
  const candidateMessages = rawMessages.filter((m) => m.role === "candidate");
  const avgLength =
    candidateMessages.reduce((sum, m) => sum + m.content.length, 0) /
    (candidateMessages.length || 1);

  // Simple heuristic: longer, more detailed answers score higher
  const baseScore = Math.min(
    85,
    Math.max(30, Math.round(avgLength / 5 + candidateMessages.length * 3))
  );

  const fallbackScorecard: InterviewScorecard = {
    overallScore: baseScore,
    overallGrade: calculateGrade(baseScore),
    faangReadiness: calculateFaangReadiness(baseScore),
    categories: [
      {
        name: "Technical Knowledge",
        score: baseScore + 5,
        maxScore: 100,
        feedback:
          "The candidate demonstrated foundational knowledge. Further assessment with deeper technical challenges is recommended.",
        strengths: ["Shows understanding of core concepts"],
        improvements: ["Practice explaining complex topics with specific examples"],
      },
      {
        name: "Problem Solving",
        score: baseScore - 5,
        maxScore: 100,
        feedback:
          "Problem-solving approach was observed but could benefit from more structured methodology.",
        strengths: ["Attempts to break down problems"],
        improvements: ["Practice structured frameworks for problem decomposition"],
      },
      {
        name: "Communication",
        score: baseScore,
        maxScore: 100,
        feedback: "Communication was adequate. Consider articulating trade-offs more explicitly.",
        strengths: ["Clear basic communication"],
        improvements: ["Structure responses with clear introduction, analysis, and conclusion"],
      },
      {
        name: "Code Quality & Best Practices",
        score: baseScore - 10,
        maxScore: 100,
        feedback:
          "Code quality assessment requires more in-depth coding challenges for accurate evaluation.",
        strengths: ["Awareness of coding standards"],
        improvements: ["Practice writing production-grade code with error handling and edge cases"],
      },
      {
        name: "System Design Thinking",
        score: baseScore - 8,
        maxScore: 100,
        feedback:
          "System design skills need further evaluation through dedicated design questions.",
        strengths: ["Basic architectural awareness"],
        improvements: [
          "Study distributed systems patterns and practice whiteboard design sessions",
        ],
      },
    ],
    summary: `The candidate completed a ${rawMessages.filter((m) => m.role === "interviewer").length}-question interview. Performance shows a solid foundation with room for growth in problem-solving depth and system design thinking. Continued practice with technical interview problems is recommended.`,
    topStrengths: [
      "Willingness to engage with technical questions",
      "Foundational knowledge base",
      "Clear communication style",
    ],
    criticalImprovements: [
      "Deepen expertise in core data structures and algorithms",
      "Practice system design interviews with real-world scenarios",
    ],
    recommendedResources: [
      "Cracking the Coding Interview by Gayle Laakmann McDowell",
      "System Design Interview by Alex Xu",
      "LeetCode — focused problem sets for your target role",
    ],
    interviewDuration: 0,
    totalQuestions: rawMessages.filter((m) => m.role === "interviewer").length,
    questionsAnswered: candidateMessages.length,
  };

  return NextResponse.json({ scorecard: fallbackScorecard }, { status: 200 });
}
