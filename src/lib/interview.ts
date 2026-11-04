// ---------------------------------------------------------------------------
// AI Mock Interview Engine — Server-Side + Shared Types & Problem Bank
// Powers: Dynamic Technical Grilling, FAANG-Grade Scorecard, In-Browser Sandboxes
// Integrates: Gemini AI (primary), Claude (fallback), Curriculum Engine (offline)
// ---------------------------------------------------------------------------

// ── Interview Roles & Experience Levels ────────────────────────────────────

export type InterviewRole =
  "frontend" | "backend" | "fullstack" | "data-science" | "devops" | "mobile" | "system-design";

export type InterviewLevel = "junior" | "mid" | "senior" | "staff";

export type InterviewPhase =
  "intro" | "warmup" | "technical" | "deep-dive" | "system-design" | "behavioral" | "closing";

export type CompanyTrack = "google" | "stripe" | "amazon" | "netflix" | "yc";
export type InterviewMode = "coding" | "system-design" | "full-loop";

export interface CompanyTrackProfile {
  id: CompanyTrack;
  name: string;
  tagline: string;
  companyBar: string;
  badgeColor: string;
  accent: string;
  interviewerName: string;
  interviewerTitle: string;
  rubricFocus: string[];
}

export const COMPANY_TRACKS: Record<CompanyTrack, CompanyTrackProfile> = {
  google: {
    id: "google",
    name: "Google",
    tagline: "Algorithmic Rigor & Distributed Scale",
    companyBar:
      "Focuses on mathematical Big-O optimality, boundary edge cases, and high-scale concurrency.",
    badgeColor: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    accent: "from-blue-500 to-emerald-500",
    interviewerName: "Alex Vance",
    interviewerTitle: "Staff Software Engineer (L6)",
    rubricFocus: [
      "Algorithmic Optimality",
      "Mathematical Proof of Big-O",
      "Boundary Edge Cases",
      "Clean Code",
    ],
  },
  stripe: {
    id: "stripe",
    name: "Stripe",
    tagline: "Production API Ergonomics & Idempotency",
    companyBar:
      "Prioritizes fault tolerance, race condition handling, atomic locks, and real-world failure modes.",
    badgeColor: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400",
    accent: "from-indigo-500 to-purple-500",
    interviewerName: "Elena Rostova",
    interviewerTitle: "Principal Infrastructure Architect",
    rubricFocus: [
      "API Ergonomics",
      "Idempotency & Concurrency",
      "Observability",
      "Defensive Engineering",
    ],
  },
  amazon: {
    id: "amazon",
    name: "Amazon",
    tagline: "Customer Obsession & Bar Raiser Scalability",
    companyBar:
      "Relentless deep dives into architecture bottlenecks, Leadership Principles, and trade-off metrics.",
    badgeColor: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    accent: "from-amber-500 to-orange-500",
    interviewerName: "Marcus Chen",
    interviewerTitle: "Senior Principal Bar Raiser",
    rubricFocus: [
      "Scalability Under Spikes",
      "Dive Deep (Root Cause)",
      "Frugality & Cost",
      "STAR Behavioral",
    ],
  },
  netflix: {
    id: "netflix",
    name: "Netflix",
    tagline: "Chaos Engineering & Microservice Resilience",
    companyBar:
      "Tests circuit breakers, degraded fallbacks, asynchronous message buses, and zero-downtime deploys.",
    badgeColor: "border-red-500/30 bg-red-500/10 text-red-400",
    accent: "from-rose-500 to-red-600",
    interviewerName: "Kai Lindqvist",
    interviewerTitle: "Staff Systems Architect",
    rubricFocus: [
      "Chaos Resilience",
      "Decoupled Architecture",
      "Event Streaming",
      "Blast Radius Mitigation",
    ],
  },
  yc: {
    id: "yc",
    name: "YC Unicorn",
    tagline: "Founder Velocity, Simplicity & Ship Speed",
    companyBar:
      "Values working production code, rapid bug hunting, no over-engineering, and pragmatic execution.",
    badgeColor: "border-orange-500/30 bg-orange-500/10 text-orange-400",
    accent: "from-orange-500 to-amber-500",
    interviewerName: "Dave Miller",
    interviewerTitle: "Co-Founder & VP of Engineering",
    rubricFocus: [
      "Shipping Speed",
      "Pragmatic Architecture",
      "Bug Spotting",
      "First-Principles Thinking",
    ],
  },
};

export interface InterviewConfig {
  role: InterviewRole;
  level: InterviewLevel;
  topics: string[]; // e.g. ["React", "TypeScript", "System Design"]
  duration: number; // minutes (15, 30, 45)
  language: string; // "en" default
  companyTrack?: CompanyTrack;
  mode?: InterviewMode;
  problemId?: string;
}

export interface InterviewMessage {
  id: string;
  role: "interviewer" | "candidate";
  content: string;
  timestamp: number;
  phase: InterviewPhase;
  questionIndex?: number;
}

// ── Test Cases & Challenge Problem Definitions ─────────────────────────────

export interface TestCase {
  id: string;
  description: string;
  input: unknown[];
  expectedOutput: unknown;
  isHidden?: boolean;
}

export interface ChallengeProblem {
  id: string;
  title: string;
  role: InterviewRole;
  difficulty: "Easy" | "Medium" | "Hard";
  functionName: string;
  summary: string;
  description: string;
  constraints: string[];
  starterCode: {
    typescript: string;
    javascript: string;
    python: string;
  };
  testCases: TestCase[];
  optimalSolution: string;
  optimalExplanation: string;
}

// ── System Design Canvas Types ─────────────────────────────────────────────

export interface SystemNode {
  id: string;
  label: string;
  type: "client" | "cdn" | "gateway" | "service" | "cache" | "database" | "queue" | "storage";
  x: number;
  y: number;
  status?: "normal" | "degraded" | "failed";
}

export interface SystemEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  protocol?: "HTTPS" | "gRPC" | "TCP" | "WebSocket";
}

export interface SystemDesignBlueprint {
  id: string;
  title: string;
  scaleEstimate: string;
  defaultNodes: SystemNode[];
  defaultEdges: SystemEdge[];
  capacityChecklist: { metric: string; formula: string; target: string }[];
}

export const SYSTEM_DESIGN_BLUEPRINTS: Record<string, SystemDesignBlueprint> = {
  "url-shortener": {
    id: "url-shortener",
    title: "Global Distributed URL Shortener (100M URLs/Day)",
    scaleEstimate: "1,200 Write RPS, 120,000 Read RPS (100:1 ratio), 36 TB Storage/year",
    defaultNodes: [
      { id: "node_client", label: "Web / Mobile Clients", type: "client", x: 60, y: 150 },
      { id: "node_cdn", label: "Cloudflare Edge CDN", type: "cdn", x: 260, y: 150 },
      { id: "node_gw", label: "Envoy API Gateway", type: "gateway", x: 460, y: 150 },
      { id: "node_srv", label: "URL Redirection Service", type: "service", x: 660, y: 150 },
      { id: "node_cache", label: "Redis Cluster (LRU 20% Hot)", type: "cache", x: 860, y: 70 },
      { id: "node_db", label: "Sharded PostgreSQL / DynamoDB", type: "database", x: 860, y: 230 },
    ],
    defaultEdges: [
      {
        id: "e1",
        source: "node_client",
        target: "node_cdn",
        protocol: "HTTPS",
        label: "GET /:code",
      },
      { id: "e2", source: "node_cdn", target: "node_gw", protocol: "HTTPS" },
      { id: "e3", source: "node_gw", target: "node_srv", protocol: "gRPC" },
      { id: "e4", source: "node_srv", target: "node_cache", label: "O(1) Hash Lookup" },
      { id: "e5", source: "node_srv", target: "node_db", label: "Fallback Read/Write" },
    ],
    capacityChecklist: [
      { metric: "Read QPS", formula: "100M * 100 / 86400", target: "~116,000 RPS" },
      { metric: "Write QPS", formula: "100M / 86400", target: "~1,160 RPS" },
      { metric: "Storage Per Year", formula: "100M * 500 bytes * 365", target: "~18.25 TB" },
      {
        metric: "Cache Memory (20% Pareto)",
        formula: "116,000 RPS * 86,400 * 0.20 * 500B",
        target: "~1 TB RAM",
      },
    ],
  },
  "rate-limiter": {
    id: "rate-limiter",
    title: "Multi-Tenant Distributed Rate Limiter (Token Bucket)",
    scaleEstimate: "500,000 RPS ingress, <2ms decision latency SLA",
    defaultNodes: [
      { id: "node_client", label: "External API Clients", type: "client", x: 60, y: 150 },
      { id: "node_gw", label: "NGINX / Envoy Gateway", type: "gateway", x: 280, y: 150 },
      { id: "node_filter", label: "Rate Limiter Sidecar", type: "service", x: 500, y: 150 },
      {
        id: "node_redis",
        label: "Redis Cluster (Atomic Lua Scripts)",
        type: "cache",
        x: 740,
        y: 150,
      },
      { id: "node_backend", label: "Core Business Services", type: "service", x: 740, y: 280 },
    ],
    defaultEdges: [
      { id: "e1", source: "node_client", target: "node_gw", protocol: "HTTPS" },
      {
        id: "e2",
        source: "node_gw",
        target: "node_filter",
        protocol: "gRPC",
        label: "Check Allow",
      },
      { id: "e3", source: "node_filter", target: "node_redis", label: "EVALSHA token_bucket" },
      { id: "e4", source: "node_gw", target: "node_backend", label: "Pass if 200 OK" },
    ],
    capacityChecklist: [
      { metric: "Throughput", formula: "500,000 RPS peak", target: "500k RPS" },
      { metric: "Max Allowed Latency", formula: "Must be under 2ms", target: "< 2 ms" },
      { metric: "Redis Memory", formula: "10M users * 64 bytes", target: "~640 MB" },
    ],
  },
};

// ── Curated Real-World FAANG Challenge Problems ────────────────────────────

export const CHALLENGE_PROBLEMS: ChallengeProblem[] = [
  {
    id: "frontend-debounce-cancel",
    title: "High-Performance Debounce & Immediate Execution Engine",
    role: "frontend",
    difficulty: "Medium",
    functionName: "createDebounce",
    summary:
      "Implement a production-grade debounce utility that supports immediate execution (leading edge) and cancellation.",
    description: `### Challenge: Production Debounce with Leading Edge & Cancel
In high-frequency event handling (such as search autocomplete, window resize, or collaborative cursor tracking), excessive function execution degrades browser framerates.

Implement a custom debounce function:
\`createDebounce(fn, delayMs, immediate)\`

#### Requirements:
1. Returns a debounced wrapper function.
2. If \`immediate\` is \`true\`, the target function should fire immediately on the leading edge of call sequences, then suppress subsequent calls until \`delayMs\` has elapsed without calls.
3. If \`immediate\` is \`false\` (default), fire on the trailing edge after \`delayMs\` quiet period.
4. The returned function MUST attach a \`.cancel()\` method that immediately cancels any pending timer.`,
    constraints: [
      "1 <= delayMs <= 5000",
      "Must correctly forward arguments to the wrapped function",
      "Must not leak memory or orphaned timers",
    ],
    starterCode: {
      typescript: `// Implement createDebounce with leading-edge and cancel support
export function createDebounce(
  fn: (...args: any[]) => any,
  delayMs: number = 300,
  immediate: boolean = false
): ((...args: any[]) => any) & { cancel: () => void } {
  let timer: any = null;

  const debounced: any = function (...args: any[]) {
    // Your implementation here
  };

  debounced.cancel = function () {
    // Clear timer
  };

  return debounced;
}
`,
      javascript: `function createDebounce(fn, delayMs = 300, immediate = false) {
  let timer = null;

  const debounced = function (...args) {
    // Your implementation here
  };

  debounced.cancel = function () {
    // Clear timer
  };

  return debounced;
}
`,
      python: `# Python equivalent debounce wrapper
import time

def create_debounce(fn, delay_sec=0.3, immediate=False):
    last_call = 0
    # Implementation
    return fn
`,
    },
    testCases: [
      {
        id: "tc1",
        description: "Returns function with cancel method attached",
        input: [() => 42, 100, false],
        expectedOutput: true,
      },
      {
        id: "tc2",
        description: "Immediate execution returns first call synchronously",
        input: [(x: number) => x * 2, 200, true],
        expectedOutput: 20,
      },
      {
        id: "tc3",
        description: "Cancel method stops pending invocation",
        input: [() => "executed", 150, false],
        expectedOutput: "cancelled",
      },
    ],
    optimalSolution: `export function createDebounce(fn, delayMs = 300, immediate = false) {
  let timer = null;
  const debounced = function (...args) {
    const callNow = immediate && !timer;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (!immediate) fn.apply(this, args);
    }, delayMs);
    if (callNow) return fn.apply(this, args);
  };
  debounced.cancel = function () {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };
  return debounced;
}`,
    optimalExplanation:
      "Employs closure over timer reference, guarantees leading-edge execution without double-invocation, and cleanly provides cancel teardown for component unmounting.",
  },
  {
    id: "backend-sliding-window-rate-limiter",
    title: "Distributed Sliding Window Log Rate Limiter",
    role: "backend",
    difficulty: "Medium",
    functionName: "checkRateLimit",
    summary:
      "Implement an in-memory sliding window rate limiter that guarantees strict limit compliance without boundary burst vulnerabilities.",
    description: `### Challenge: Sliding Window Log Rate Limiter
Standard Fixed-Window limiters suffer from the 2x burst vulnerability at window boundaries. You must implement a sliding window log limiter that evaluates request timestamps.

Implement:
\`checkRateLimit(requestTimestamps, maxRequests, windowSeconds, currentTimestamp)\`

#### Parameters:
- \`requestTimestamps\`: Array of UNIX timestamps (seconds) of past successful requests for this client.
- \`maxRequests\`: Maximum permitted requests inside any rolling window (e.g. 5).
- \`windowSeconds\`: Window duration in seconds (e.g. 60).
- \`currentTimestamp\`: Timestamp of the incoming request.

#### Return Value:
An object:
\`{ allowed: boolean, remaining: number, resetAfterSec: number }\`

If \`allowed\` is \`true\`, the request is granted. If the request is rejected, \`resetAfterSec\` is the seconds until the oldest active timestamp in the window drops off.`,
    constraints: [
      "Timestamps are non-negative integers sorted in ascending order",
      "O(N) or O(log N) search complexity",
      "Window size: 1 <= windowSeconds <= 86400",
    ],
    starterCode: {
      typescript: `// Distributed Sliding Window Rate Limiter
export function checkRateLimit(
  requestTimestamps: number[],
  maxRequests: number,
  windowSeconds: number,
  currentTimestamp: number
): { allowed: boolean; remaining: number; resetAfterSec: number } {
  // Filter out timestamps outside current rolling window
  // Check if count < maxRequests
  return { allowed: true, remaining: 0, resetAfterSec: 0 };
}
`,
      javascript: `function checkRateLimit(requestTimestamps, maxRequests, windowSeconds, currentTimestamp) {
  // Your implementation here
  return { allowed: true, remaining: 0, resetAfterSec: 0 };
}
`,
      python: `def check_rate_limit(request_timestamps, max_requests, window_seconds, current_timestamp):
    # Filter and check
    return {"allowed": True, "remaining": 0, "resetAfterSec": 0}
`,
    },
    testCases: [
      {
        id: "tc1",
        description: "Empty history allows request with max - 1 remaining",
        input: [[], 5, 60, 100],
        expectedOutput: { allowed: true, remaining: 4, resetAfterSec: 60 },
      },
      {
        id: "tc2",
        description: "Rejects request when window capacity reached",
        input: [[45, 50, 55, 60, 65], 5, 60, 70],
        expectedOutput: { allowed: false, remaining: 0, resetAfterSec: 35 },
      },
      {
        id: "tc3",
        description: "Allows request once oldest timestamp falls out of rolling window",
        input: [[10, 50, 55, 60], 4, 60, 75],
        expectedOutput: { allowed: true, remaining: 0, resetAfterSec: 35 },
      },
    ],
    optimalSolution: `export function checkRateLimit(requestTimestamps, maxRequests, windowSeconds, currentTimestamp) {
  const windowStart = currentTimestamp - windowSeconds;
  const active = requestTimestamps.filter(t => t > windowStart);
  if (active.length < maxRequests) {
    return {
      allowed: true,
      remaining: maxRequests - active.length - 1,
      resetAfterSec: active.length > 0 ? (active[0] + windowSeconds - currentTimestamp) : windowSeconds
    };
  }
  const oldest = active[0];
  const resetAfterSec = Math.max(1, (oldest + windowSeconds) - currentTimestamp);
  return { allowed: false, remaining: 0, resetAfterSec };
}`,
    optimalExplanation:
      "Computes the exact dynamic rolling window boundary without bucket boundary cliffs, accurately determining time-to-first-eviction.",
  },
  {
    id: "fullstack-circuit-breaker",
    title: "Resilient Microservice Circuit Breaker State Machine",
    role: "fullstack",
    difficulty: "Medium",
    functionName: "createCircuitBreaker",
    summary:
      "Build an industrial state machine implementing Closed, Open, and Half-Open states with auto-recovery thresholds.",
    description: `### Challenge: Microservice Circuit Breaker
Downstream dependencies (payment gateways, third-party auth) fail intermittently. Without a circuit breaker, cascading thread pool exhaustion will take down your entire cluster.

Implement:
\`createCircuitBreaker(failureThreshold, resetTimeoutMs)\`

#### States:
1. **CLOSED**: Normal operation. Requests pass through. If \`failureThreshold\` consecutive failures occur, transition to **OPEN**.
2. **OPEN**: Fast-fail immediately with error \`"Circuit Breaker is OPEN"\`. When \`resetTimeoutMs\` elapses, transition to **HALF_OPEN**.
3. **HALF_OPEN**: Allow ONE canary request through.
   - If canary succeeds, reset consecutive failures and return to **CLOSED**.
   - If canary fails, immediately return to **OPEN** and restart timer.`,
    constraints: ["Thread-safe simulation", "Deterministic state transitions"],
    starterCode: {
      typescript: `// Microservice Circuit Breaker Pattern
export function createCircuitBreaker(failureThreshold: number = 3, resetTimeoutMs: number = 1000) {
  let state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
  let failureCount = 0;
  let nextAttemptTimestamp = 0;

  return {
    getState: () => state,
    async execute<T>(action: () => Promise<T>): Promise<T> {
      // Implement state check, execution, and transitions
      return action();
    }
  };
}
`,
      javascript: `function createCircuitBreaker(failureThreshold = 3, resetTimeoutMs = 1000) {
  let state = "CLOSED";
  let failureCount = 0;
  let nextAttemptTimestamp = 0;

  return {
    getState: () => state,
    execute: async (action) => {
      // Implement state transitions
      return action();
    }
  };
}
`,
      python: `class CircuitBreaker:
    def __init__(self, failure_threshold=3, reset_timeout_sec=1):
        self.state = "CLOSED"
        self.failures = 0
`,
    },
    testCases: [
      {
        id: "tc1",
        description: "Starts in CLOSED state and executes successful calls",
        input: [3, 500],
        expectedOutput: "CLOSED",
      },
      {
        id: "tc2",
        description: "Trips to OPEN after reaching failureThreshold",
        input: [2, 500],
        expectedOutput: "OPEN",
      },
      {
        id: "tc3",
        description: "Transitions to HALF_OPEN after timeout",
        input: [2, 50],
        expectedOutput: "HALF_OPEN",
      },
    ],
    optimalSolution: `export function createCircuitBreaker(failureThreshold = 3, resetTimeoutMs = 1000) {
  let state = "CLOSED";
  let consecutiveFailures = 0;
  let nextAttempt = 0;

  return {
    getState: () => {
      if (state === "OPEN" && Date.now() >= nextAttempt) return "HALF_OPEN";
      return state;
    },
    async execute(action) {
      const now = Date.now();
      if (state === "OPEN") {
        if (now < nextAttempt) throw new Error("Circuit Breaker is OPEN");
        state = "HALF_OPEN";
      }
      try {
        const result = await action();
        consecutiveFailures = 0;
        state = "CLOSED";
        return result;
      } catch (err) {
        consecutiveFailures++;
        if (consecutiveFailures >= failureThreshold || state === "HALF_OPEN") {
          state = "OPEN";
          nextAttempt = Date.now() + resetTimeoutMs;
        }
        throw err;
      }
    }
  };
}`,
    optimalExplanation:
      "Implements strict state-machine semantics with lazy half-open evaluation based on timestamps, preventing thundering herds on recovering downstreams.",
  },
  {
    id: "system-design-consistent-hashing",
    title: "Consistent Hash Ring with Virtual Nodes",
    role: "system-design",
    difficulty: "Hard",
    functionName: "getAssignedNode",
    summary:
      "Implement consistent hashing with virtual nodes to distribute keys across cache servers with minimal re-shuffling upon node additions.",
    description: `### Challenge: Consistent Hash Ring
When scaling a distributed cache (e.g. Memcached or DynamoDB partition router), modular hashing \`hash(key) % N\` causes 99% cache misses when a node joins or fails.

Implement:
\`getAssignedNode(ringNodes, key)\`

#### Parameters:
- \`ringNodes\`: Array of objects \`{ node: string, hash: number }\` sorted in ascending order by \`hash\` (0 to 1,000,000).
- \`key\`: String key to route.

#### Algorithm:
1. Hash the key into a non-negative integer using a simple polynomial hash \`((charCode * 31) + ...) % 1000000\`.
2. Find the first node on the ring with \`node.hash >= keyHash\`.
3. If no such node exists, wrap around to the first node on the ring (\`ringNodes[0]\`).`,
    constraints: [
      "Binary search lookup in O(log M) where M is virtual node count",
      "ringNodes has at least 1 node",
    ],
    starterCode: {
      typescript: `// Consistent Hash Ring
export function getAssignedNode(
  ringNodes: { node: string; hash: number }[],
  key: string
): string {
  // Hash key, binary search for next clockwise node, wrap around if needed
  if (!ringNodes.length) return "";
  return ringNodes[0].node;
}
`,
      javascript: `function getAssignedNode(ringNodes, key) {
  if (!ringNodes.length) return "";
  return ringNodes[0].node;
}
`,
      python: `def get_assigned_node(ring_nodes, key):
    # Binary search over ring
    return ring_nodes[0]["node"] if ring_nodes else ""
`,
    },
    testCases: [
      {
        id: "tc1",
        description: "Routes key to closest clockwise server node",
        input: [
          [
            { node: "cache-alpha", hash: 100000 },
            { node: "cache-beta", hash: 500000 },
            { node: "cache-gamma", hash: 800000 },
          ],
          "user_session_499",
        ],
        expectedOutput: "cache-beta",
      },
      {
        id: "tc2",
        description: "Wraps around to first server when key hash exceeds highest node",
        input: [
          [
            { node: "cache-alpha", hash: 100000 },
            { node: "cache-beta", hash: 500000 },
          ],
          "key_0",
        ],
        expectedOutput: "cache-alpha",
      },
    ],
    optimalSolution: `export function getAssignedNode(ringNodes, key) {
  if (!ringNodes.length) return "";
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) % 1000000;
  }
  let low = 0, high = ringNodes.length - 1, ans = 0;
  let found = false;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (ringNodes[mid].hash >= hash) {
      ans = mid;
      found = true;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return found ? ringNodes[ans].node : ringNodes[0].node;
}`,
    optimalExplanation:
      "Applies O(log M) binary search with circular ring wraparound, ensuring deterministic distribution with O(K/N) rebalancing impact.",
  },
  {
    id: "data-science-cosine-similarity",
    title: "High-Dimensional Top-K Cosine Similarity Ranking",
    role: "data-science",
    difficulty: "Medium",
    functionName: "topKCosineSimilarity",
    summary:
      "Compute cosine similarity rankings over dense query vectors and matrix embeddings, returning sorted top-k indices and scores.",
    description: `### Challenge: Vector Similarity Search
In modern LLM RAG pipelines and vector databases, finding the most relevant chunk embeddings requires low-latency cosine similarity ranking.

Implement:
\`topKCosineSimilarity(queryVector, indexMatrix, k)\`

#### Parameters:
- \`queryVector\`: Array of numbers (dimension $D$).
- \`indexMatrix\`: Array of vectors, each dimension $D$.
- \`k\`: Number of top results to return.

#### Return:
Array of objects \`{ index: number, score: number }\` sorted by \`score\` descending, truncated to length \`k\`. Score is rounded to 4 decimal places.`,
    constraints: ["1 <= D <= 512", "1 <= k <= indexMatrix.length", "Norm of vectors > 0"],
    starterCode: {
      typescript: `// Vector Search Ranking
export function topKCosineSimilarity(
  queryVector: number[],
  indexMatrix: number[][],
  k: number = 3
): { index: number; score: number }[] {
  // Compute dot product and norms, sort by score descending
  return [];
}
`,
      javascript: `function topKCosineSimilarity(queryVector, indexMatrix, k = 3) {
  // Implementation
  return [];
}
`,
      python: `import numpy as np

def top_k_cosine_similarity(query_vector, index_matrix, k=3):
    # Vectorized cosine similarity
    return []
`,
    },
    testCases: [
      {
        id: "tc1",
        description: "Returns exact match with score 1.0",
        input: [
          [1, 0, 0],
          [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
          ],
          1,
        ],
        expectedOutput: [{ index: 0, score: 1 }],
      },
      {
        id: "tc2",
        description: "Ranks orthogonal and parallel vectors accurately",
        input: [
          [2, 2],
          [
            [1, 1],
            [-1, -1],
            [1, 0],
          ],
          2,
        ],
        expectedOutput: [
          { index: 0, score: 1 },
          { index: 2, score: 0.7071 },
        ],
      },
    ],
    optimalSolution: `export function topKCosineSimilarity(queryVector, indexMatrix, k = 3) {
  const qNorm = Math.sqrt(queryVector.reduce((sum, v) => sum + v * v, 0));
  const scored = indexMatrix.map((vec, idx) => {
    let dot = 0;
    let vNormSq = 0;
    for (let i = 0; i < queryVector.length; i++) {
      dot += queryVector[i] * vec[i];
      vNormSq += vec[i] * vec[i];
    }
    const score = vNormSq > 0 && qNorm > 0 ? dot / (qNorm * Math.sqrt(vNormSq)) : 0;
    return { index: idx, score: Math.round(score * 10000) / 10000 };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}`,
    optimalExplanation:
      "Single-pass dot product and norm accumulation with $O(N \\log K)$ selection efficiency.",
  },
  {
    id: "devops-log-anomaly",
    title: "Rolling Window Error Spike & Anomaly Detector",
    role: "devops",
    difficulty: "Medium",
    functionName: "detectAnomalousWindows",
    summary:
      "Scan streaming application log error counts to flag anomalous microsecond windows exceeding moving baseline standard deviations.",
    description: `### Challenge: SRE Automated Canary Analysis
Detect log error rate spikes across rolling canary windows without false positive alerts during regular traffic variance.

Implement:
\`detectAnomalousWindows(errorCounts, windowSize, stdDevMultiplier)\`

Returns array of indices where the error count in that window exceeds \`mean + (stdDevMultiplier * stdDev)\`.`,
    constraints: ["errorCounts.length >= windowSize", "windowSize >= 3"],
    starterCode: {
      typescript: `export function detectAnomalousWindows(
  errorCounts: number[],
  windowSize: number = 5,
  stdDevMultiplier: number = 2
): number[] {
  // Calculate rolling mean and variance, return spiked indices
  return [];
}
`,
      javascript: `function detectAnomalousWindows(errorCounts, windowSize = 5, stdDevMultiplier = 2) {
  return [];
}
`,
      python: `def detect_anomalous_windows(error_counts, window_size=5, std_dev_multiplier=2):
    return []
`,
    },
    testCases: [
      {
        id: "tc1",
        description: "Detects single sharp anomaly spike",
        input: [[2, 2, 2, 2, 2, 50, 2, 2], 5, 2],
        expectedOutput: [5],
      },
    ],
    optimalSolution: `export function detectAnomalousWindows(errorCounts, windowSize = 5, stdDevMultiplier = 2) {
  const anomalies = [];
  for (let i = windowSize; i < errorCounts.length; i++) {
    const window = errorCounts.slice(i - windowSize, i);
    const mean = window.reduce((a, b) => a + b, 0) / windowSize;
    const variance = window.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / windowSize;
    const stdDev = Math.sqrt(variance);
    const threshold = mean + stdDevMultiplier * stdDev;
    if (errorCounts[i] > threshold) {
      anomalies.push(i);
    }
  }
  return anomalies;
}`,
    optimalExplanation:
      "Sliding window z-score outlier detection mimicking real-time Prometheus canary evaluations.",
  },
  {
    id: "mobile-offline-event-sync",
    title: "Idempotent Mobile Offline Event Queue with Deduplication",
    role: "mobile",
    difficulty: "Medium",
    functionName: "processSyncQueue",
    summary:
      "Deduplicate and reconcile offline optimistic UI action queues before background network synchronization.",
    description: `### Challenge: Mobile Offline-First Event Synchronization
Mobile clients perform actions offline in tunnels or airplane mode. When network restores, the sync queue contains duplicate mutations, retried requests, and conflicting versions.

Implement:
\`processSyncQueue(events)\`

Each event is: \`{ id: string, entityId: string, version: number, action: "insert" | "update" | "delete", timestamp: number }\`

Deduplicate by \`entityId\`, keeping only the latest version based on highest version (or highest timestamp if version tie). Return clean array sorted by entityId.`,
    constraints: ["Preserves latest entity state", "O(N log N) sorting or O(N) hash map grouping"],
    starterCode: {
      typescript: `export function processSyncQueue(
  events: { id: string; entityId: string; version: number; action: string; timestamp: number }[]
): { id: string; entityId: string; version: number; action: string; timestamp: number }[] {
  // Reconcile and deduplicate
  return [];
}
`,
      javascript: `function processSyncQueue(events) {
  return [];
}
`,
      python: `def process_sync_queue(events):
    return []
`,
    },
    testCases: [
      {
        id: "tc1",
        description: "Keeps higher version when same entity has multiple offline mutations",
        input: [
          [
            { id: "e1", entityId: "user_1", version: 1, action: "insert", timestamp: 100 },
            { id: "e2", entityId: "user_1", version: 2, action: "update", timestamp: 200 },
          ],
        ],
        expectedOutput: [
          { id: "e2", entityId: "user_1", version: 2, action: "update", timestamp: 200 },
        ],
      },
    ],
    optimalSolution: `export function processSyncQueue(events) {
  const map = new Map();
  for (const ev of events) {
    if (!map.has(ev.entityId)) {
      map.set(ev.entityId, ev);
    } else {
      const cur = map.get(ev.entityId);
      if (ev.version > cur.version || (ev.version === cur.version && ev.timestamp > cur.timestamp)) {
        map.set(ev.entityId, ev);
      }
    }
  }
  const result = Array.from(map.values());
  result.sort((a, b) => a.entityId.localeCompare(b.entityId));
  return result;
}`,
    optimalExplanation:
      "Hash map reconciliation with last-write-wins conflict resolution guaranteed by monotonic version stamps.",
  },
];

// Helper to select the best challenge for a given role or config
export function getChallengeForConfig(config: InterviewConfig): ChallengeProblem {
  if (config.problemId) {
    const found = CHALLENGE_PROBLEMS.find((p) => p.id === config.problemId);
    if (found) return found;
  }
  const roleProblem = CHALLENGE_PROBLEMS.find((p) => p.role === config.role);
  return roleProblem || CHALLENGE_PROBLEMS[0];
}

// ── Scorecard & Committee Dossier Types ─────────────────────────────────────

export type HiringVerdict = "STRONG_HIRE" | "HIRE" | "LEAN_HIRE" | "LEAN_NO" | "STRONG_NO";

export interface RadarMetrics {
  codingProwess: number; // 0-100
  systemArchitecture: number; // 0-100
  communication: number; // 0-100
  edgeCaseCoverage: number; // 0-100
  composure: number; // 0-100
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
  hiringVerdict?: HiringVerdict;
  targetLevel?: string;
  radarMetrics?: RadarMetrics;
  categories: ScorecardCategory[];
  summary: string;
  topStrengths: string[];
  criticalImprovements: string[];
  recommendedResources: string[];
  interviewDuration: number; // seconds
  totalQuestions: number;
  questionsAnswered: number;
  staffSolutionCode?: string;
  candidateSolutionCode?: string;
  actionableSevenDayPlan?: { day: string; task: string; drill: string }[];
  momentsOfTruth?: { timestampMin: string; type: "strength" | "critical"; note: string }[];
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

export interface InterviewerProfile {
  name: string;
  title: string;
  company: string;
  accent: string;
  bio: string;
}

export const INTERVIEWER_PROFILES: Record<InterviewRole, InterviewerProfile> = {
  frontend: {
    name: "Alex Vance",
    title: "Staff Frontend Architect",
    company: "Google / ex-Meta",
    accent: "from-teal-500 to-emerald-600",
    bio: "12+ yrs scaling web runtimes, browser rendering engines & micro-frontends.",
  },
  backend: {
    name: "Marcus Chen",
    title: "Principal Distributed Systems Architect",
    company: "Amazon AWS / ex-Stripe",
    accent: "from-blue-500 to-indigo-600",
    bio: "Architect of multi-region fault-tolerant backends handling 500k RPS.",
  },
  fullstack: {
    name: "Elena Rostova",
    title: "Staff Systems Engineer",
    company: "Netflix / ex-Google",
    accent: "from-emerald-500 to-teal-600",
    bio: "Full-stack cloud architectures, Edge rendering & GraphQL federations.",
  },
  "data-science": {
    name: "Dr. Sanjay Nair",
    title: "Principal ML Scientist",
    company: "DeepMind / ex-OpenAI",
    accent: "from-purple-500 to-indigo-600",
    bio: "Large language models, distributed training & production recommender systems.",
  },
  devops: {
    name: "Kai Lindqvist",
    title: "Staff SRE & Infrastructure Architect",
    company: "Spotify / ex-Uber",
    accent: "from-cyan-500 to-teal-600",
    bio: "Kubernetes clusters, multi-cloud Terraform, zero-downtime CI/CD pipelines.",
  },
  mobile: {
    name: "Chloe Dupont",
    title: "Lead Mobile Architect",
    company: "Apple / ex-Snapchat",
    accent: "from-rose-500 to-pink-600",
    bio: "High-performance iOS & Android runtimes, 60fps rendering, offline-first sync.",
  },
  "system-design": {
    name: "Vikram Mehta",
    title: "VP of Core Infrastructure",
    company: "Stripe / ex-LinkedIn",
    accent: "from-amber-500 to-orange-600",
    bio: "Global payments routing, Raft consensus & distributed key-value stores.",
  },
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

// ── Calculate Grade & FAANG Readiness ──────────────────────────────────────

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

export function calculateHiringVerdict(score: number): HiringVerdict {
  if (score >= 90) return "STRONG_HIRE";
  if (score >= 78) return "HIRE";
  if (score >= 65) return "LEAN_HIRE";
  if (score >= 48) return "LEAN_NO";
  return "STRONG_NO";
}

// ── Enhanced System Prompt Builder (Proactive Pairing Partner) ─────────────

export function buildInterviewerSystemPrompt(
  config: InterviewConfig,
  challenge?: ChallengeProblem
): string {
  const company = config.companyTrack ? COMPANY_TRACKS[config.companyTrack] : null;
  const interviewer = company
    ? {
        name: company.interviewerName,
        title: company.interviewerTitle,
        company: company.name,
      }
    : INTERVIEWER_PROFILES[config.role] || INTERVIEWER_PROFILES.frontend;

  const problemContext = challenge
    ? `
ACTIVE CHALLENGE PROBLEM:
- Title: ${challenge.title}
- Target Function: ${challenge.functionName}
- Problem Summary: ${challenge.summary}
- Constraints: ${challenge.constraints.join(", ")}
`
    : "";

  return `You are ${interviewer.name}, ${interviewer.title} at ${interviewer.company}, conducting an authentic, high-stakes Silicon Valley technical interview.

ROLE: ${ROLE_LABELS[config.role]}
CANDIDATE EXPERIENCE LEVEL: ${LEVEL_LABELS[config.level]}
COMPANY BAR CALIBRATION: ${company ? company.companyBar : "FAANG-grade high technical rigor"}
FOCUS AREAS: ${config.topics.join(", ")}
INTERVIEW DURATION: ${config.duration} minutes
${problemContext}

YOUR INTERVIEW BEHAVIOR & PROTOCOL:
1. YOU ARE A PAIRING PARTNER, NOT A PASSIVE CHATBOT.
   - You observe the candidate's code, their test results, their architecture proposals, and their spoken logic.
   - If their code has an $O(N^2)$ brute-force, challenge them: "Before you commit to this nested loop, how does this scale when N = 100,000?"
   - If tests fail, ask them to inspect the failing test input and trace their pointer or variable logic.
   - If they are doing well, increase complexity (e.g., concurrency, network partitions, memory optimization).
2. CONVERSATIONAL CADENCE:
   - Keep each turn concise (2-4 sentences max).
   - React directly to what the candidate just typed, said, or executed.
   - Ask exactly ONE clear question or follow-up at a time.
   - Never write full solutions for the candidate during the interview. Provide progressive hints if they request one.
3. TONE & PERSONA:
   - Professional, razor-sharp, calm, encouraging yet firm on technical standards.
   - Speak as an engineering leader at ${interviewer.company}.
   - NEVER break character. You are the interviewer, not an AI assistant.
   - No emojis or unicode pictograms anywhere in your responses.`;
}

// ── Enhanced Hiring Committee Scorecard Prompt Builder ─────────────────────

export function buildScorecardPrompt(
  config: InterviewConfig,
  messages: InterviewMessage[],
  candidateCode?: string,
  challenge?: ChallengeProblem
): string {
  const transcript = messages
    .map((m) => `${m.role === "interviewer" ? "INTERVIEWER" : "CANDIDATE"}: ${m.content}`)
    .join("\n\n");

  const company = config.companyTrack ? COMPANY_TRACKS[config.companyTrack] : null;

  return `You are a Senior Engineering Manager and Lead of the FAANG / Silicon Valley Hiring Committee evaluating a technical candidate for ${ROLE_LABELS[config.role]} (${LEVEL_LABELS[config.level]}).
Company Target Bar: ${company ? company.name + " — " + company.tagline : "FAANG Calibration"}

INTERVIEW PROBLEM:
${challenge ? challenge.title + " (" + challenge.functionName + ")" : "General Technical Screen"}

CANDIDATE FINAL CODE SOLUTION:
\`\`\`
${candidateCode || "// No explicit code submitted"}
\`\`\`

COMPLETE INTERVIEW TRANSCRIPT:
${transcript}

Evaluate this interview with extreme rigor and return ONLY a valid JSON object (no markdown fences, no explanatory text):

{
  "overallScore": <number 0-100>,
  "hiringVerdict": <"STRONG_HIRE" | "HIRE" | "LEAN_HIRE" | "LEAN_NO" | "STRONG_NO">,
  "targetLevel": "<e.g. Senior Software Engineer (L5 / IC5)>",
  "radarMetrics": {
    "codingProwess": <number 0-100>,
    "systemArchitecture": <number 0-100>,
    "communication": <number 0-100>,
    "edgeCaseCoverage": <number 0-100>,
    "composure": <number 0-100>
  },
  "categories": [
    {
      "name": "Algorithmic & Code Hygiene",
      "score": <number 0-100>,
      "maxScore": 100,
      "feedback": "<2-sentence precise evaluation>",
      "strengths": ["<concrete observation>"],
      "improvements": ["<concrete actionable critique>"]
    },
    {
      "name": "System Architecture & Scalability",
      "score": <number 0-100>,
      "maxScore": 100,
      "feedback": "<2-sentence evaluation>",
      "strengths": ["<observation>"],
      "improvements": ["<critique>"]
    },
    {
      "name": "Technical Communication",
      "score": <number 0-100>,
      "maxScore": 100,
      "feedback": "<2-sentence evaluation>",
      "strengths": ["<observation>"],
      "improvements": ["<critique>"]
    },
    {
      "name": "Edge Case & Error Resilience",
      "score": <number 0-100>,
      "maxScore": 100,
      "feedback": "<2-sentence evaluation>",
      "strengths": ["<observation>"],
      "improvements": ["<critique>"]
    }
  ],
  "summary": "<3-4 sentence official executive committee debrief summarizing technical bar, trade-off depth, and hiring consensus>",
  "topStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "criticalImprovements": ["<improvement 1>", "<improvement 2>"],
  "recommendedResources": ["<resource 1>", "<resource 2>", "<resource 3>"],
  "staffSolutionCode": ${JSON.stringify(challenge ? challenge.optimalSolution : "// Optimal Staff-Engineer solution")},
  "actionableSevenDayPlan": [
    { "day": "Day 1-2", "task": "<specific topic>", "drill": "<concrete drill to practice>" },
    { "day": "Day 3-4", "task": "<specific topic>", "drill": "<concrete drill to practice>" },
    { "day": "Day 5-7", "task": "<specific topic>", "drill": "<concrete drill to practice>" }
  ]
}

CALIBRATION SCORING:
- 90-100: STRONG_HIRE (High L5/L6 bar)
- 78-89: HIRE (Solid L4/L5 bar)
- 65-77: LEAN_HIRE (Needs slight ramp-up)
- 48-64: LEAN_NO (Misses fundamentals or boundary testing)
- 0-47: STRONG_NO (Significant knowledge gaps)
Do NOT use emojis anywhere in text.`;
}
