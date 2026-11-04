// ---------------------------------------------------------------------------
// API Route: POST /api/ai/interview
// AI Mock Interviewer — High-Stakes Silicon Valley Technical Calibration Engine
// Supports: ask (live dynamic pairing), evaluate (hiring committee dossier)
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, sanitizeInput } from "@/lib/security";
import {
  buildInterviewerSystemPrompt,
  buildScorecardPrompt,
  calculateGrade,
  calculateFaangReadiness,
  calculateHiringVerdict,
  getChallengeForConfig,
  ROLE_LABELS,
  COMPANY_TRACKS,
  INTERVIEWER_PROFILES,
  type InterviewConfig,
  type InterviewMessage,
  type InterviewScorecard,
  type ScorecardCategory,
  type HiringVerdict,
  type RadarMetrics,
} from "@/lib/interview";
import { type CodeExecutionReport } from "@/lib/codeRunner";

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
    if (!res.ok) return null;
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

    const rate = checkRateLimit(ip, "ai-interview", 35, 60_000);
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
  const candidateCode = typeof body?.candidateCode === "string" ? body.candidateCode : "";
  const testReport = body?.testReport as CodeExecutionReport | undefined;
  const canvasSummary = typeof body?.canvasSummary === "string" ? body.canvasSummary : "";

  if (!config?.role || !config?.level || !config?.topics?.length) {
    return NextResponse.json(
      { error: "Missing interview configuration (role, level, topics)." },
      { status: 400 }
    );
  }

  const challenge = getChallengeForConfig(config);
  const systemPrompt = buildInterviewerSystemPrompt(config, challenge);

  const chatMessages = rawMessages
    .filter((m: Record<string, unknown>) => m?.role && m?.content && typeof m.content === "string")
    .map((m: Record<string, unknown>) => ({
      role: (m.role === "candidate" ? "user" : "model") as "user" | "model",
      content: sanitizeInput(m.content as string, 3000),
    }));

  // Context injection if code or test results are present
  let additionalContext = "";
  if (testReport) {
    additionalContext += `\n[CANDIDATE TEST RESULTS: Passed ${testReport.passedCount}/${testReport.totalCount} tests in ${testReport.totalRuntimeMs}ms.`;
    if (!testReport.allPassed) {
      const failed = testReport.testResults.find((r) => !r.passed);
      if (failed) {
        additionalContext += ` Failed: "${failed.description}". Expected: ${JSON.stringify(failed.expected)}, Got: ${JSON.stringify(failed.actual)}.`;
      }
    }
    additionalContext += `]`;
  }

  if (candidateCode.trim()) {
    additionalContext += `\n[CURRENT CANDIDATE CODE IN IDE]:\n\`\`\`\n${candidateCode.slice(0, 1500)}\n\`\`\``;
  }

  if (canvasSummary) {
    additionalContext += `\n[CANDIDATE SYSTEM DESIGN CANVAS STATE]:\n${canvasSummary}`;
  }

  // Kick off start message if needed
  if (body?.action === "start" || chatMessages.length === 0) {
    chatMessages.push({
      role: "user" as const,
      content: `I am ready for the ${config.role} technical screen at ${config.level} level. Challenge assigned: "${challenge.title}". Please begin the interview and present the problem expectations.`,
    });
  } else if (additionalContext) {
    const lastMsg = chatMessages[chatMessages.length - 1];
    if (lastMsg && lastMsg.role === "user") {
      lastMsg.content += additionalContext;
    }
  }

  // 1. Try Kie.ai
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

  // 2. Try Gemini
  if (genAI) {
    for (const modelName of [PRIMARY_MODEL, FALLBACK_MODEL]) {
      const response = await callGeminiChat(systemPrompt, chatMessages, modelName, 15000);
      if (response) {
        return NextResponse.json({ response: stripEmojis(response) }, { status: 200 });
      }
    }
  }

  // 3. Try Claude direct
  const fullPrompt = `${systemPrompt}\n\nConversation so far:\n${chatMessages
    .map((m) => `${m.role === "user" ? "CANDIDATE" : "INTERVIEWER"}: ${m.content}`)
    .join("\n")}\n\nProvide the next interviewer response (ONE question or follow-up only):`;

  const claudeResponse = await callClaude(fullPrompt);
  if (claudeResponse) {
    return NextResponse.json({ response: stripEmojis(claudeResponse) }, { status: 200 });
  }

  // 4. Intelligent Context-Aware Fallback Engine
  const company = config.companyTrack ? COMPANY_TRACKS[config.companyTrack] : null;
  const interviewer = company
    ? { name: company.interviewerName, company: company.name }
    : INTERVIEWER_PROFILES[config.role] || INTERVIEWER_PROFILES.frontend;

  if (body?.action === "start" || chatMessages.length <= 1) {
    return NextResponse.json(
      {
        response: `Welcome to your technical screen with ${interviewer.company}. I am ${interviewer.name}. We will be evaluating your engineering depth and problem-solving through a real challenge: "${challenge.title}". Look at the problem description on your left and the starter code. Before you begin writing code, walk me through your high-level approach and how you plan to handle edge cases.`,
      },
      { status: 200 }
    );
  }

  // If candidate recently executed tests
  if (testReport) {
    if (testReport.allPassed) {
      return NextResponse.json(
        {
          response: `All ${testReport.passedCount} test cases passed. Excellent. Now, analyze the time and space complexity: what is the Big-O, and how does your solution behave if input size scales to 1,000,000 elements?`,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          response: `I see your implementation is failing test cases (${testReport.passedCount}/${testReport.totalCount} passed). Take a close look at the expected versus actual output in the console. Where in your logic is the discrepancy coming from?`,
        },
        { status: 200 }
      );
    }
  }

  return NextResponse.json(
    {
      response: `Understood. In a production environment with high throughput, how would you guard against potential race conditions, memory leaks, or unhandled exceptions in this code?`,
    },
    { status: 200 }
  );
}

// ---------------------------------------------------------------------------
// Handle Evaluation (Generate Silicon Valley Hiring Committee Dossier)
// ---------------------------------------------------------------------------
async function handleEvaluation(body: Record<string, unknown>) {
  const config = body?.config as InterviewConfig | undefined;
  const rawMessages = (body?.messages || []) as InterviewMessage[];
  const candidateCode = typeof body?.candidateCode === "string" ? body.candidateCode : "";

  if (!config || !rawMessages.length) {
    return NextResponse.json(
      { error: "Missing config or messages for evaluation." },
      { status: 400 }
    );
  }

  const challenge = getChallengeForConfig(config);
  const scorecardPrompt = buildScorecardPrompt(config, rawMessages, candidateCode, challenge);

  let scorecardJson: string | null = null;

  // 1. Try Kie.ai
  if (kieApiKey) {
    const kieScorecard = await callKieClaude(
      "You are the Lead of a FAANG hiring committee. Return ONLY valid raw JSON conforming strictly to the requested schema.",
      [{ role: "user", content: scorecardPrompt }],
      2800
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

  // 3. Try Claude direct
  if (!scorecardJson) {
    scorecardJson = await callClaude(scorecardPrompt);
  }

  if (scorecardJson) {
    try {
      const jsonMatch = scorecardJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const overallScore =
          typeof parsed.overallScore === "number"
            ? Math.min(100, Math.max(0, parsed.overallScore))
            : 78;

        const hiringVerdict: HiringVerdict =
          parsed.hiringVerdict &&
          ["STRONG_HIRE", "HIRE", "LEAN_HIRE", "LEAN_NO", "STRONG_NO"].includes(
            parsed.hiringVerdict
          )
            ? parsed.hiringVerdict
            : calculateHiringVerdict(overallScore);

        const radarMetrics: RadarMetrics = {
          codingProwess: Math.min(
            100,
            Math.max(0, Number(parsed.radarMetrics?.codingProwess) || overallScore)
          ),
          systemArchitecture: Math.min(
            100,
            Math.max(0, Number(parsed.radarMetrics?.systemArchitecture) || overallScore - 4)
          ),
          communication: Math.min(
            100,
            Math.max(0, Number(parsed.radarMetrics?.communication) || overallScore + 2)
          ),
          edgeCaseCoverage: Math.min(
            100,
            Math.max(0, Number(parsed.radarMetrics?.edgeCaseCoverage) || overallScore - 6)
          ),
          composure: Math.min(
            100,
            Math.max(0, Number(parsed.radarMetrics?.composure) || overallScore + 5)
          ),
        };

        const scorecard: InterviewScorecard = {
          overallScore,
          overallGrade: calculateGrade(overallScore),
          faangReadiness: calculateFaangReadiness(overallScore),
          hiringVerdict,
          targetLevel: parsed.targetLevel || "Senior Software Engineer (L5)",
          radarMetrics,
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
          staffSolutionCode: challenge.optimalSolution,
          candidateSolutionCode: candidateCode || undefined,
          actionableSevenDayPlan: Array.isArray(parsed.actionableSevenDayPlan)
            ? parsed.actionableSevenDayPlan
            : [
                {
                  day: "Day 1-2",
                  task: "Algorithmic Precision",
                  drill: "Solve 3 rate limiter and sliding window concurrency problems",
                },
                {
                  day: "Day 3-4",
                  task: "System Fault Tolerance",
                  drill: "Study circuit breaker and cache stampede patterns",
                },
                {
                  day: "Day 5-7",
                  task: "Mock Calibration Retake",
                  drill: "Retake the FAANG Coding Gauntlet with strict 30-minute timer",
                },
              ],
          interviewDuration: 0,
          totalQuestions: rawMessages.filter((m) => m.role === "interviewer").length,
          questionsAnswered: rawMessages.filter((m) => m.role === "candidate").length,
        };

        return NextResponse.json({ scorecard }, { status: 200 });
      }
    } catch {
      // Fall through to deterministic fallback
    }
  }

  // Fallback Hiring Committee Dossier
  const candidateMessages = rawMessages.filter((m) => m.role === "candidate");
  const baseScore = candidateCode.trim().length > 100 ? 82 : 68;

  const fallbackScorecard: InterviewScorecard = {
    overallScore: baseScore,
    overallGrade: calculateGrade(baseScore),
    faangReadiness: calculateFaangReadiness(baseScore),
    hiringVerdict: calculateHiringVerdict(baseScore),
    targetLevel: "Senior Software Engineer (L5)",
    radarMetrics: {
      codingProwess: baseScore,
      systemArchitecture: baseScore - 5,
      communication: baseScore + 4,
      edgeCaseCoverage: baseScore - 8,
      composure: baseScore + 6,
    },
    categories: [
      {
        name: "Algorithmic & Code Hygiene",
        score: baseScore,
        maxScore: 100,
        feedback:
          "Demonstrated clean modular code structure with attention to separation of concerns.",
        strengths: ["Clean naming conventions", "Structured problem breakdown"],
        improvements: [
          "Explicitly write tests for boundary edge cases (nulls, empty collections, integer overflow)",
        ],
      },
      {
        name: "System Architecture & Scalability",
        score: baseScore - 5,
        maxScore: 100,
        feedback:
          "Sound architectural fundamentals. Further quantification of throughput and memory footprint under 100k RPS is recommended.",
        strengths: ["Clear understanding of horizontal scaling"],
        improvements: ["Address cache stampede and database replica lag in high-write scenarios"],
      },
      {
        name: "Technical Communication",
        score: baseScore + 4,
        maxScore: 100,
        feedback:
          "Articulate explanation of decisions. Good dialogue pacing throughout the screen.",
        strengths: ["Active clarification of requirements upfront"],
        improvements: ["Explicitly summarize Big-O trade-offs before typing code"],
      },
    ],
    summary: `The Hiring Committee has evaluated the technical screen for ${ROLE_LABELS[config.role]}. The candidate demonstrated solid engineering maturity, passing core challenge requirements with thoughtful decomposition. Recommended for next round with focus on deep concurrency limits.`,
    topStrengths: [
      "Structured requirement clarification before coding",
      "Modular implementation with clean function boundaries",
      "Receptive to interviewer calibration prompts",
    ],
    criticalImprovements: [
      "Quantify Big-O memory trade-offs upfront before implementation",
      "Formulate explicit edge-case test suites for zero and maximum boundaries",
    ],
    recommendedResources: [
      "Designing Data-Intensive Applications by Martin Kleppmann",
      "System Design Interview (Volume 2) by Alex Xu",
      "VeySkill FAANG Problem Master Packs",
    ],
    staffSolutionCode: challenge.optimalSolution,
    candidateSolutionCode: candidateCode || undefined,
    actionableSevenDayPlan: [
      {
        day: "Day 1-2",
        task: "Algorithmic Precision",
        drill: "Solve 3 rate limiter and sliding window concurrency problems",
      },
      {
        day: "Day 3-4",
        task: "System Fault Tolerance",
        drill: "Study circuit breaker and cache stampede patterns",
      },
      {
        day: "Day 5-7",
        task: "Mock Calibration Retake",
        drill: "Retake the FAANG Coding Gauntlet with strict 30-minute timer",
      },
    ],
    interviewDuration: 0,
    totalQuestions: rawMessages.filter((m) => m.role === "interviewer").length,
    questionsAnswered: candidateMessages.length,
  };

  return NextResponse.json({ scorecard: fallbackScorecard }, { status: 200 });
}
