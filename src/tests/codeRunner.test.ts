import { describe, it, expect } from "vitest";
import { deepEqual, stripTypeAnnotations, runCodeWithTestCases } from "@/lib/codeRunner";

describe("In-Browser Code Runner & Assertion Engine", () => {
  describe("deepEqual", () => {
    it("correctly compares primitives", () => {
      expect(deepEqual(1, 1)).toBe(true);
      expect(deepEqual("hello", "hello")).toBe(true);
      expect(deepEqual(true, true)).toBe(true);
      expect(deepEqual(1, 2)).toBe(false);
      expect(deepEqual("a", "b")).toBe(false);
    });

    it("correctly handles floating points within epsilon", () => {
      expect(deepEqual(0.1 + 0.2, 0.3)).toBe(true);
    });

    it("correctly compares arrays", () => {
      expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(deepEqual([1, 2, [3, 4]], [1, 2, [3, 4]])).toBe(true);
      expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
    });

    it("correctly compares deep nested objects", () => {
      expect(deepEqual({ a: 1, b: { c: [2, 3] } }, { a: 1, b: { c: [2, 3] } })).toBe(true);
      expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
    });
  });

  describe("stripTypeAnnotations", () => {
    it("strips export and basic type signatures", () => {
      const code = `export function solve(a: number, b: string): boolean {\n  return true;\n}`;
      const stripped = stripTypeAnnotations(code);
      expect(stripped).not.toContain("export");
      expect(stripped).toContain("function solve(a: number, b: string) {");
    });
  });

  describe("runCodeWithTestCases", () => {
    it("executes valid code and passes all test cases", async () => {
      const code = `
        function twoSum(nums, target) {
          const map = new Map();
          for (let i = 0; i < nums.length; i++) {
            const complement = target - nums[i];
            if (map.has(complement)) {
              return [map.get(complement), i];
            }
            map.set(nums[i], i);
          }
          return [];
        }
      `;

      const tests = [
        {
          id: "tc1",
          description: "Standard pair",
          input: [[2, 7, 11, 15], 9],
          expectedOutput: [0, 1],
        },
        { id: "tc2", description: "Multiple items", input: [[3, 2, 4], 6], expectedOutput: [1, 2] },
        { id: "tc3", description: "Identical items", input: [[3, 3], 6], expectedOutput: [0, 1] },
      ];

      const report = await runCodeWithTestCases(code, "twoSum", tests);
      expect(report.success).toBe(true);
      expect(report.allPassed).toBe(true);
      expect(report.passedCount).toBe(3);
      expect(report.totalCount).toBe(3);
    });

    it("reports failing test cases when output does not match expected", async () => {
      const buggyCode = `
        function add(a, b) {
          return a - b; // deliberate bug
        }
      `;

      const tests = [{ id: "tc1", description: "1 + 2", input: [1, 2], expectedOutput: 3 }];

      const report = await runCodeWithTestCases(buggyCode, "add", tests);
      expect(report.success).toBe(true);
      expect(report.allPassed).toBe(false);
      expect(report.passedCount).toBe(0);
      expect(report.testResults[0].passed).toBe(false);
      expect(report.testResults[0].actual).toBe(-1);
    });

    it("captures console.log output", async () => {
      const code = `
        function greet(name) {
          console.log("Hello", name);
          return "Hi " + name;
        }
      `;

      const tests = [
        { id: "tc1", description: "Greeting", input: ["Alice"], expectedOutput: "Hi Alice" },
      ];

      const report = await runCodeWithTestCases(code, "greet", tests);
      expect(report.allPassed).toBe(true);
      expect(report.stdout.some((log) => log.includes("Hello") && log.includes("Alice"))).toBe(
        true
      );
    });

    it("handles syntax or runtime compilation error gracefully", async () => {
      const badCode = `function broken( { return 42; }`;
      const tests = [{ id: "tc1", description: "test", input: [], expectedOutput: 42 }];

      const report = await runCodeWithTestCases(badCode, "broken", tests);
      expect(report.success).toBe(false);
      expect(report.compileError).toBeDefined();
    });
  });
});
