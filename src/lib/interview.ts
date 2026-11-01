// ---------------------------------------------------------------------------
// AI Mock Interview Engine — Server-Side + Shared Types
// Powers: Dynamic Technical Grilling, FAANG-Grade Scorecard, Session Management
// Integrates: Gemini AI (primary), Claude (fallback), Curriculum Engine (offline)
// ---------------------------------------------------------------------------

// ── Interview Types ────────────────────────────────────────────────────────

export type InterviewRole =
  "frontend" | "backend" | "fullstack" | "data-science" | "devops" | "mobile" | "system-design";

export type InterviewLevel = "junior" | "mid" | "senior" | "staff";

export type InterviewPhase =
  "intro" | "warmup" | "technical" | "deep-dive" | "system-design" | "behavioral" | "closing";

export interface InterviewConfig {
  role: InterviewRole;
  level: InterviewLevel;
  topics: string[]; // e.g. ["React", "TypeScript", "System Design"]
  duration: number; // minutes (15, 30, 45)
  language: string; // "en" default
}

export interface InterviewMessage {
  id: string;
  role: "interviewer" | "candidate";
  content: string;
  timestamp: number;
  phase: InterviewPhase;
  questionIndex?: number;
}

export interface ScorecardCategory {
  name: string;
  score: number; // 0-100
  maxScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface InterviewScorecard {
  overallScore: number; // 0-100
  overallGrade: "S" | "A" | "B" | "C" | "D" | "F";
  faangReadiness: "Ready" | "Almost Ready" | "Needs Work" | "Not Ready";
  categories: ScorecardCategory[];
  summary: string;
  topStrengths: string[];
  criticalImprovements: string[];
  recommendedResources: string[];
  interviewDuration: number; // seconds
  totalQuestions: number;
  questionsAnswered: number;
}

export interface InterviewSession {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL: string | null;
  config: InterviewConfig;
  messages: InterviewMessage[];
  scorecard: InterviewScorecard | null;
  status: "active" | "completed" | "abandoned";
  startedAt: number;
  completedAt: number | null;
  createdAt: number;
}

// ── Role Display Mappings ──────────────────────────────────────────────────

export const ROLE_LABELS: Record<InterviewRole, string> = {
  frontend: "Frontend Engineer",
  backend: "Backend Engineer",
  fullstack: "Full-Stack Engineer",
  "data-science": "Data Scientist / ML Engineer",
  devops: "DevOps / SRE Engineer",
  mobile: "Mobile Engineer (iOS/Android)",
  "system-design": "System Design Architect",
};

export const LEVEL_LABELS: Record<InterviewLevel, string> = {
  junior: "Junior (0-2 years)",
  mid: "Mid-Level (2-5 years)",
  senior: "Senior (5-8 years)",
  staff: "Staff / Principal (8+ years)",
};

export const ROLE_TOPICS: Record<InterviewRole, string[]> = {
  frontend: [
    "React",
    "TypeScript",
    "CSS/Tailwind",
    "Performance Optimization",
    "Accessibility",
    "State Management",
    "Testing",
    "Next.js",
    "Browser APIs",
    "Web Security",
  ],
  backend: [
    "Node.js",
    "Python",
    "Databases (SQL/NoSQL)",
    "REST APIs",
    "GraphQL",
    "Microservices",
    "Caching",
    "Message Queues",
    "Authentication",
    "Scalability",
  ],
  fullstack: [
    "React",
    "Node.js",
    "TypeScript",
    "Databases",
    "APIs",
    "DevOps Basics",
    "Testing",
    "System Design",
    "Security",
    "Performance",
  ],
  "data-science": [
    "Python",
    "Machine Learning",
    "Statistics",
    "SQL",
    "Data Pipelines",
    "Neural Networks",
    "Feature Engineering",
    "A/B Testing",
    "NLP",
    "Computer Vision",
  ],
  devops: [
    "Docker",
    "Kubernetes",
    "CI/CD",
    "Cloud (AWS/GCP)",
    "Terraform",
    "Monitoring",
    "Linux",
    "Networking",
    "Security",
    "Scripting",
  ],
  mobile: [
    "React Native",
    "Swift/Kotlin",
    "UI/UX Patterns",
    "State Management",
    "APIs",
    "Performance",
    "Testing",
    "App Store",
    "Push Notifications",
    "Offline Storage",
  ],
  "system-design": [
    "Distributed Systems",
    "Load Balancing",
    "Database Sharding",
    "Caching Strategies",
    "Message Queues",
    "CDN Architecture",
    "API Gateway",
    "Microservices",
    "CAP Theorem",
    "Rate Limiting",
  ],
};

// ── Phase Transitions ──────────────────────────────────────────────────────

export function getPhaseForQuestion(questionIndex: number, totalQuestions: number): InterviewPhase {
  const ratio = questionIndex / totalQuestions;
  if (questionIndex === 0) return "intro";
  if (ratio < 0.15) return "warmup";
  if (ratio < 0.5) return "technical";
  if (ratio < 0.7) return "deep-dive";
  if (ratio < 0.85) return "system-design";
  if (ratio < 0.95) return "behavioral";
  return "closing";
}

// ── Generate Unique Session ID ─────────────────────────────────────────────

export function generateSessionId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `iv_${ts}_${rand}`;
}

// ── Calculate Grade from Score ─────────────────────────────────────────────

export function calculateGrade(score: number): "S" | "A" | "B" | "C" | "D" | "F" {
  if (score >= 95) return "S";
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 35) return "D";
  return "F";
}

export function calculateFaangReadiness(
  score: number
): "Ready" | "Almost Ready" | "Needs Work" | "Not Ready" {
  if (score >= 85) return "Ready";
  if (score >= 70) return "Almost Ready";
  if (score >= 50) return "Needs Work";
  return "Not Ready";
}

// ── System Prompt Builder ──────────────────────────────────────────────────

export function buildInterviewerSystemPrompt(config: InterviewConfig): string {
  return `You are a Senior Staff Engineer at a top-tier technology company (Google/Meta/Apple caliber) conducting a live technical interview.

ROLE: ${ROLE_LABELS[config.role]}
CANDIDATE EXPERIENCE LEVEL: ${LEVEL_LABELS[config.level]}
FOCUS AREAS: ${config.topics.join(", ")}
INTERVIEW DURATION: ${config.duration} minutes

INTERVIEW PROTOCOL:
1. You conduct ONE question at a time. Wait for the candidate's response before proceeding.
2. Adapt difficulty based on their answers. If they answer well, increase complexity. If they struggle, guide them.
3. Ask follow-up questions that drill deeper into their response.
4. Be conversational but professional. Acknowledge good answers, provide hints for struggling candidates.
5. Mix question types: conceptual, coding, system design, and behavioral (based on experience level).
6. For coding questions, present a clear problem and evaluate their approach, not just syntax.
7. Never reveal the answer immediately. Guide them with clarifying questions.

PERSONALITY:
- Firm but fair. You want the candidate to succeed.
- Use natural conversational language. No emojis or unicode pictograms.
- Keep responses concise (2-4 sentences for questions, 1-2 sentences for follow-ups).
- Reference real-world scenarios and production systems in your questions.

RESPONSE FORMAT:
- Ask exactly ONE question or follow-up at a time.
- If the candidate gives a complete answer, briefly acknowledge it and move to the next topic.
- Do NOT number your questions or say "Question 1", "Question 2", etc. Keep it natural.
- Do NOT use any emojis or unicode pictograms anywhere in your responses.

CRITICAL RULES:
- NEVER break character. You are the interviewer, not an AI assistant.
- NEVER explain that you are an AI.
- NEVER use emojis or unicode pictograms.
- Keep all language professional, clear, and technically precise.`;
}

// ── Scorecard Generation Prompt ────────────────────────────────────────────

export function buildScorecardPrompt(
  config: InterviewConfig,
  messages: InterviewMessage[]
): string {
  const transcript = messages
    .map((m) => `${m.role === "interviewer" ? "INTERVIEWER" : "CANDIDATE"}: ${m.content}`)
    .join("\n\n");

  return `You are a Senior Engineering Manager evaluating a mock technical interview transcript.

INTERVIEW CONTEXT:
- Role: ${ROLE_LABELS[config.role]}
- Level: ${LEVEL_LABELS[config.level]}
- Topics: ${config.topics.join(", ")}
- Duration: ${config.duration} minutes

TRANSCRIPT:
${transcript}

Evaluate the candidate and return ONLY a valid JSON object (no markdown fences, no code blocks) with this exact structure:

{
  "overallScore": <number 0-100>,
  "categories": [
    {
      "name": "Technical Knowledge",
      "score": <number 0-100>,
      "maxScore": 100,
      "feedback": "<1-2 sentence assessment>",
      "strengths": ["<strength 1>", "<strength 2>"],
      "improvements": ["<improvement 1>", "<improvement 2>"]
    },
    {
      "name": "Problem Solving",
      "score": <number 0-100>,
      "maxScore": 100,
      "feedback": "<1-2 sentence assessment>",
      "strengths": ["<strength 1>"],
      "improvements": ["<improvement 1>"]
    },
    {
      "name": "Communication",
      "score": <number 0-100>,
      "maxScore": 100,
      "feedback": "<1-2 sentence assessment>",
      "strengths": ["<strength 1>"],
      "improvements": ["<improvement 1>"]
    },
    {
      "name": "Code Quality & Best Practices",
      "score": <number 0-100>,
      "maxScore": 100,
      "feedback": "<1-2 sentence assessment>",
      "strengths": ["<strength 1>"],
      "improvements": ["<improvement 1>"]
    },
    {
      "name": "System Design Thinking",
      "score": <number 0-100>,
      "maxScore": 100,
      "feedback": "<1-2 sentence assessment>",
      "strengths": ["<strength 1>"],
      "improvements": ["<improvement 1>"]
    }
  ],
  "summary": "<3-4 sentence executive summary of overall performance>",
  "topStrengths": ["<top strength 1>", "<top strength 2>", "<top strength 3>"],
  "criticalImprovements": ["<critical improvement 1>", "<critical improvement 2>"],
  "recommendedResources": ["<resource 1>", "<resource 2>", "<resource 3>"]
}

SCORING GUIDELINES:
- 90-100: Exceptional. Would receive a strong hire at FAANG.
- 75-89: Good. Would likely pass most technical screens.
- 60-74: Adequate. Shows potential but needs improvement in key areas.
- 40-59: Below expectations. Significant gaps in fundamentals.
- 0-39: Needs substantial preparation before interviewing.

BE HONEST AND CALIBRATED. Do not inflate scores. A real FAANG interview bar is high.
Do NOT use any emojis or unicode pictograms in any text fields.`;
}
