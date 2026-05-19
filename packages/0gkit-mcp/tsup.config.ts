import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts", cli: "src/cli.ts" },
  format: ["esm"],
  dts: true,
  splitting: false,
  clean: true,
  treeshake: true,
  sourcemap: true,
  target: "es2022",
  external: [
    "@0gkit/core",
    "@0gkit/chain",
    "@0gkit/storage",
    "@0gkit/compute",
    "@0gkit/da",
    "@0gkit/attestation",
    "@modelcontextprotocol/sdk",
    "viem",
    "zod",
  ],
});
