// ---------------------------------------------------------------------------
// In-Browser Sandboxed Code Execution Engine
// Powers: Live test running, timeout protection (infinite loop guard),
// stdout/stderr capture, and deep equality assertions.
// Works seamlessly in both Web Worker (Browser) and Fallback Sandbox (Vitest/Node).
// ---------------------------------------------------------------------------

export interface TestCaseResult {
  id: string;
  description: string;
  passed: boolean;
  input: unknown[];
  expected: unknown;
  actual: unknown;
  runtimeMs: number;
  error?: string;
  isHidden?: boolean;
}

export interface CodeExecutionReport {
  success: boolean;
  allPassed: boolean;
  passedCount: number;
  totalCount: number;
  totalRuntimeMs: number;
  testResults: TestCaseResult[];
  stdout: string[];
  compileError?: string;
}

// Deep equality comparator for test outputs (handles objects, arrays, primitives, nulls)
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null || typeof a !== "object" || typeof b !== "object") {
    // Check float precision tolerance
    if (typeof a === "number" && typeof b === "number") {
      return Math.abs(a - b) < 1e-6;
    }
    return false;
  }

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a as Record<string, unknown>);
  const keysB = Object.keys(b as Record<string, unknown>);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
      return false;
    }
  }

  return true;
}

// Robust TypeScript type-stripper for browser execution
export function stripTypeAnnotations(code: string): string {
  let cleaned = code
    // 1. Remove imports and exports
    .replace(/^\s*export\s+default\s+/gm, "")
    .replace(/^\s*export\s+/gm, "")
    .replace(/^\s*import\s+.*?;?\s*$/gm, "");

  // 2. Remove interfaces and type declarations
  cleaned = cleaned.replace(/^\s*(interface|type)\s+[A-Za-z0-9_<>]+[\s\S]*?(?:;|\n\})/gm, "");

  // 3. Remove generics from function definitions: function foo<T>( or foo<T, U>(
  cleaned = cleaned.replace(/(function\s+[A-Za-z0-9_$]+)\s*<[^>]+>\s*\(/g, "$1(");
  cleaned = cleaned.replace(/(\w+)\s*<[^>]+>\s*\(/g, "$1(");

  // 4. Remove return type annotations: ): Type { or ): Type =>
  cleaned = cleaned.replace(/\)\s*:\s*[A-Za-z0-9_<>[\]|,\s&?]+\s*\{/g, ") {");
  cleaned = cleaned.replace(/\)\s*:\s*[A-Za-z0-9_<>[\]|,\s&?]+\s*=>/g, ") =>");

  // 5. Remove parameter types inside function parentheses: (a: number, b: string = 'val') -> (a, b = 'val')
  cleaned = cleaned.replace(/\(([^)]*)\)/g, (match, paramList) => {
    if (!paramList.includes(":")) return match;
    const parts = paramList.split(",").map((param: string) => {
      const trimmed = param.trim();
      const colonIndex = trimmed.indexOf(":");
      if (colonIndex === -1) return trimmed;
      const name = trimmed.slice(0, colonIndex).trim();
      const eqIndex = trimmed.indexOf("=", colonIndex);
      if (eqIndex !== -1) {
        return name + " " + trimmed.slice(eqIndex).trim();
      }
      return name;
    });
    return "(" + parts.join(", ") + ")";
  });

  // 6. Remove variable type annotations: let x: number = 0 -> let x = 0
  cleaned = cleaned.replace(/(let|const|var)\s+([A-Za-z0-9_$]+)\s*:\s*[^=;\n]+/g, "$1 $2 ");

  // 7. Remove type assertions: x as number -> x
  cleaned = cleaned.replace(/\s+as\s+[A-Za-z0-9_<>[\]|&]+/g, "");

  return cleaned;
}

// Format values for human-readable console inspection
export function formatValueForDisplay(val: unknown): string {
  if (val === undefined) return "undefined";
  if (val === null) return "null";
  if (typeof val === "function") return "[Function]";
  if (typeof val === "string") return `"${val}"`;
  try {
    return JSON.stringify(val);
  } catch {
    return String(val);
  }
}

/**
 * Execute candidate code against a suite of test cases with strict timeout & stdout capture.
 */
export async function runCodeWithTestCases(
  userCode: string,
  functionName: string,
  testCases: {
    id: string;
    description: string;
    input: unknown[];
    expectedOutput: unknown;
    isHidden?: boolean;
  }[],
  timeoutMs: number = 2500
): Promise<CodeExecutionReport> {
  const stdout: string[] = [];
  const testResults: TestCaseResult[] = [];
  const startTime = Date.now();

  const cleanedCode = stripTypeAnnotations(userCode);

  // In Node.js / SSR / Unit test environment or where Web Worker is unavailable
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    try {
      // Create isolated logging interceptor
      const customConsole = {
        log: (...args: unknown[]) => stdout.push(args.map(formatValueForDisplay).join(" ")),
        error: (...args: unknown[]) =>
          stdout.push("[stderr] " + args.map(formatValueForDisplay).join(" ")),
        warn: (...args: unknown[]) =>
          stdout.push("[warn] " + args.map(formatValueForDisplay).join(" ")),
      };

      // Wrap code in an evaluation scope
      const wrappedCode = `
        ${cleanedCode};
        if (typeof ${functionName} !== "function") {
          throw new Error("Target function '${functionName}' is not defined. Please declare 'function ${functionName}(...)' or 'const ${functionName} = ...'");
        }
        return ${functionName};
      `;

      // eslint-disable-next-line no-new-func
      const evaluator = new Function("console", wrappedCode);
      const targetFn = evaluator(customConsole);

      for (const tc of testCases) {
        const tcStart = Date.now();
        try {
          // Clone inputs to avoid mutation between test runs
          const inputClones = JSON.parse(JSON.stringify(tc.input));
          const actual = await targetFn(...inputClones);
          const runtimeMs = Math.max(1, Date.now() - tcStart);
          const passed = deepEqual(actual, tc.expectedOutput);

          testResults.push({
            id: tc.id,
            description: tc.description,
            passed,
            input: tc.input,
            expected: tc.expectedOutput,
            actual,
            runtimeMs,
            isHidden: tc.isHidden,
          });
        } catch (err: unknown) {
          testResults.push({
            id: tc.id,
            description: tc.description,
            passed: false,
            input: tc.input,
            expected: tc.expectedOutput,
            actual: undefined,
            runtimeMs: Date.now() - tcStart,
            error: err instanceof Error ? err.message : String(err),
            isHidden: tc.isHidden,
          });
        }
      }

      const passedCount = testResults.filter((r) => r.passed).length;
      return {
        success: true,
        allPassed: passedCount === testResults.length,
        passedCount,
        totalCount: testResults.length,
        totalRuntimeMs: Date.now() - startTime,
        testResults,
        stdout,
      };
    } catch (err: unknown) {
      return {
        success: false,
        allPassed: false,
        passedCount: 0,
        totalCount: testCases.length,
        totalRuntimeMs: Date.now() - startTime,
        testResults: testCases.map((tc) => ({
          id: tc.id,
          description: tc.description,
          passed: false,
          input: tc.input,
          expected: tc.expectedOutput,
          actual: undefined,
          runtimeMs: 0,
          error: "Compilation failed",
          isHidden: tc.isHidden,
        })),
        stdout,
        compileError: err instanceof Error ? err.message : String(err),
      };
    }
  }

  // Browser Environment: Run in Sandboxed Web Worker with Infinite Loop Protection
  return new Promise<CodeExecutionReport>((resolve) => {
    const workerScript = `
      self.onmessage = async function(e) {
        const { code, fnName, tests } = e.data;
        const logs = [];
        const results = [];

        const mockConsole = {
          log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
          error: (...args) => logs.push('[stderr] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
          warn: (...args) => logs.push('[warn] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '))
        };

        try {
          const evalFn = new Function('console', code + '; if (typeof ' + fnName + ' !== "function") throw new Error("Function " + fnName + " is not defined"); return ' + fnName + ';');
          const fn = evalFn(mockConsole);

          function deepEq(a, b) {
            if (a === b) return true;
            if (typeof a !== typeof b) return false;
            if (a === null || b === null || typeof a !== 'object') {
              if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 1e-6;
              return false;
            }
            if (Array.isArray(a) !== Array.isArray(b)) return false;
            if (Array.isArray(a)) {
              if (a.length !== b.length) return false;
              for (let i = 0; i < a.length; i++) if (!deepEq(a[i], b[i])) return false;
              return true;
            }
            const ka = Object.keys(a), kb = Object.keys(b);
            if (ka.length !== kb.length) return false;
            for (let k of ka) {
              if (!Object.prototype.hasOwnProperty.call(b, k) || !deepEq(a[k], b[k])) return false;
            }
            return true;
          }

          for (let tc of tests) {
            const t0 = performance.now();
            try {
              const inputClone = JSON.parse(JSON.stringify(tc.input));
              const actual = await fn(...inputClone);
              const runtime = Math.max(1, Math.round(performance.now() - t0));
              const passed = deepEq(actual, tc.expectedOutput);
              results.push({
                id: tc.id,
                description: tc.description,
                passed,
                input: tc.input,
                expected: tc.expectedOutput,
                actual,
                runtimeMs: runtime,
                isHidden: tc.isHidden
              });
            } catch (tcErr) {
              results.push({
                id: tc.id,
                description: tc.description,
                passed: false,
                input: tc.input,
                expected: tc.expectedOutput,
                actual: undefined,
                runtimeMs: Math.round(performance.now() - t0),
                error: tcErr && tcErr.message ? tcErr.message : String(tcErr),
                isHidden: tc.isHidden
              });
            }
          }

          self.postMessage({ success: true, results, logs });
        } catch (compileErr) {
          self.postMessage({
            success: false,
            compileError: compileErr && compileErr.message ? compileErr.message : String(compileErr),
            logs
          });
        }
      };
    `;

    let blobUrl: string | null = null;
    let worker: Worker | null = null;
    let timedOut = false;

    try {
      const blob = new Blob([workerScript], { type: "application/javascript" });
      blobUrl = URL.createObjectURL(blob);
      worker = new Worker(blobUrl);
    } catch {
      // If Web Worker construction is blocked by CSP, fall back to in-memory runner
      worker = null;
    }

    if (!worker) {
      // Fallback: run directly
      try {
        const customConsole = {
          log: (...args: unknown[]) => stdout.push(args.map(formatValueForDisplay).join(" ")),
          error: (...args: unknown[]) =>
            stdout.push("[stderr] " + args.map(formatValueForDisplay).join(" ")),
          warn: (...args: unknown[]) =>
            stdout.push("[warn] " + args.map(formatValueForDisplay).join(" ")),
        };

        const wrappedCode = `
          ${cleanedCode};
          if (typeof ${functionName} !== "function") {
            throw new Error("Target function '${functionName}' is not defined");
          }
          return ${functionName};
        `;
        // eslint-disable-next-line no-new-func
        const targetFn = new Function("console", wrappedCode)(customConsole);

        for (const tc of testCases) {
          const tcStart = Date.now();
          try {
            const inputClones = JSON.parse(JSON.stringify(tc.input));
            const actual = targetFn(...inputClones);
            const passed = deepEqual(actual, tc.expectedOutput);
            testResults.push({
              id: tc.id,
              description: tc.description,
              passed,
              input: tc.input,
              expected: tc.expectedOutput,
              actual,
              runtimeMs: Math.max(1, Date.now() - tcStart),
              isHidden: tc.isHidden,
            });
          } catch (tcErr: unknown) {
            testResults.push({
              id: tc.id,
              description: tc.description,
              passed: false,
              input: tc.input,
              expected: tc.expectedOutput,
              actual: undefined,
              runtimeMs: Date.now() - tcStart,
              error: tcErr instanceof Error ? tcErr.message : String(tcErr),
              isHidden: tc.isHidden,
            });
          }
        }

        const passedCount = testResults.filter((r) => r.passed).length;
        resolve({
          success: true,
          allPassed: passedCount === testResults.length,
          passedCount,
          totalCount: testResults.length,
          totalRuntimeMs: Date.now() - startTime,
          testResults,
          stdout,
        });
        return;
      } catch (err: unknown) {
        resolve({
          success: false,
          allPassed: false,
          passedCount: 0,
          totalCount: testCases.length,
          totalRuntimeMs: Date.now() - startTime,
          testResults: testCases.map((tc) => ({
            id: tc.id,
            description: tc.description,
            passed: false,
            input: tc.input,
            expected: tc.expectedOutput,
            actual: undefined,
            runtimeMs: 0,
            error: "Compilation failed",
            isHidden: tc.isHidden,
          })),
          stdout,
          compileError: err instanceof Error ? err.message : String(err),
        });
        return;
      }
    }

    const timer = setTimeout(() => {
      timedOut = true;
      if (worker) {
        worker.terminate();
      }
      if (blobUrl) URL.revokeObjectURL(blobUrl);

      resolve({
        success: false,
        allPassed: false,
        passedCount: 0,
        totalCount: testCases.length,
        totalRuntimeMs: timeoutMs,
        testResults: testCases.map((tc) => ({
          id: tc.id,
          description: tc.description,
          passed: false,
          input: tc.input,
          expected: tc.expectedOutput,
          actual: undefined,
          runtimeMs: timeoutMs,
          error:
            "Time Limit Exceeded (TLE) — Code took longer than " +
            timeoutMs +
            "ms or entered an infinite loop.",
          isHidden: tc.isHidden,
        })),
        stdout: [...stdout, "[System] Process killed: Time Limit Exceeded (2500ms)"],
        compileError: "Time Limit Exceeded: Infinite loop or blocking operation detected.",
      });
    }, timeoutMs);

    worker.onmessage = (event) => {
      if (timedOut) return;
      clearTimeout(timer);
      if (worker) worker.terminate();
      if (blobUrl) URL.revokeObjectURL(blobUrl);

      const data = event.data;
      if (data.success) {
        const passedCount = data.results.filter((r: TestCaseResult) => r.passed).length;
        resolve({
          success: true,
          allPassed: passedCount === data.results.length,
          passedCount,
          totalCount: data.results.length,
          totalRuntimeMs: Date.now() - startTime,
          testResults: data.results,
          stdout: data.logs || [],
        });
      } else {
        resolve({
          success: false,
          allPassed: false,
          passedCount: 0,
          totalCount: testCases.length,
          totalRuntimeMs: Date.now() - startTime,
          testResults: testCases.map((tc) => ({
            id: tc.id,
            description: tc.description,
            passed: false,
            input: tc.input,
            expected: tc.expectedOutput,
            actual: undefined,
            runtimeMs: 0,
            error: "Execution Error",
            isHidden: tc.isHidden,
          })),
          stdout: data.logs || [],
          compileError: data.compileError,
        });
      }
    };

    worker.onerror = (err) => {
      if (timedOut) return;
      clearTimeout(timer);
      if (worker) worker.terminate();
      if (blobUrl) URL.revokeObjectURL(blobUrl);

      resolve({
        success: false,
        allPassed: false,
        passedCount: 0,
        totalCount: testCases.length,
        totalRuntimeMs: Date.now() - startTime,
        testResults: testCases.map((tc) => ({
          id: tc.id,
          description: tc.description,
          passed: false,
          input: tc.input,
          expected: tc.expectedOutput,
          actual: undefined,
          runtimeMs: 0,
          error: "Worker Error",
          isHidden: tc.isHidden,
        })),
        stdout,
        compileError: err.message || "Failed to execute in Web Worker.",
      });
    };

    worker.postMessage({
      code: cleanedCode,
      fnName: functionName,
      tests: testCases,
    });
  });
}
