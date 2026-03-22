import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@stop-the-bus/shared": path.resolve(__dirname, "packages/shared"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: [
      "packages/shared/logic/**/*.test.ts",
      "packages/shared/logic/**/*.test.js",
    ],
  },
});
