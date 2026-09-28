import { defineConfig } from "vitest/config";
import path from "path";

// Separate config for Firestore rules tests — requires Firestore emulator running
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/tests/rules/**/*.test.ts"],
    testTimeout: 30000, // Rules tests need more time for emulator calls
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
