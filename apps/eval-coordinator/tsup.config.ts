import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  clean: true,
  sourcemap: true,
  target: "es2022",
  shims: true,
  external: ["ethers", "viem", "@0gfoundation/0g-storage-ts-sdk"],
});
