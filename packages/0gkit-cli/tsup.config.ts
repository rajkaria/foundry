import { defineConfig } from "tsup";

export default defineConfig({
  entry: { cli: "src/cli.ts" },
  format: ["esm"],
  dts: false,
  splitting: false,
  clean: true,
  treeshake: true,
  sourcemap: true,
  target: "es2022",
  banner: { js: "#!/usr/bin/env node" },
  external: [
    "@0gkit/core",
    "@0gkit/chain",
    "@0gkit/storage",
    "@0gkit/compute",
    "@0gkit/da",
    "@0gkit/attestation",
    "commander",
  ],
});
