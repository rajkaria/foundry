import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "adapters/vercel-ai": "src/adapters/vercel-ai.ts",
    "adapters/langchain": "src/adapters/langchain.ts",
  },
  format: ["esm"],
  dts: true,
  splitting: false,
  clean: true,
  treeshake: true,
  sourcemap: true,
  target: "es2022",
});
