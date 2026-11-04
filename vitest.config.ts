import path from "path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "packages/frontend/src"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["packages/**/*.spec.ts", "packages/**/*.test.ts"],
  },
});
