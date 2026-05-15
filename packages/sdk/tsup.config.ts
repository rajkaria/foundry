import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    storage: "src/storage.ts",
    da: "src/da.ts",
    attestation: "src/attestation.ts",
    inference: "src/inference.ts",
    abis: "src/abis.ts",
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
  external: [
    "viem",
    "ethers",
    "@0gfoundation/0g-storage-ts-sdk",
    "@langchain/core",
    "ai",
  ],
});
