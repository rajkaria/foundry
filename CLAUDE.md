# Foundry Protocol — Project Instructions

## Session Context (Last updated: 2026-05-19 16:05)

### Current State

- **0gkit toolkit roadmap is COMPLETE** (spec: `docs/superpowers/specs/2026-05-18-0gkit-0g-builder-toolkit-design.md` §11). All 8 sub-projects merged to `main`.
- **Merged:** SP1 core+chain, SP2 primitives, SP3 CLI, SP4 `@0gkit/mcp` (#26), SP5 Foundry SDK refactor (#27), SP6 scaffolder+recipes (#29), **SP7 playground + `@0gkit/react` (#30)**, **SP8 community + release infra (#31)**.
- CI green on main. All `@0gkit/*` build/test; `pnpm boundary:check` enforces neutrality; Playwright golden-path smoke wired.

### Recent Changes (this session — SP7 + SP8, done in one session at user request)

- **SP7 `@0gkit/react`** — `useUpload/useDownload/useInference/useAttestation`; one `{data,error,loading,reset}`+runner shape via `useAsyncAction` (ref-read config so callers can recompute per render); `react` peer dep; 7 vitest tests, 100% line cov; boundary-clean.
- **SP7 `apps/playground`** — Next.js zero-setup console (Storage/Compute/Attestation panels + explorer links). Pure `lib/codegen.ts` emits CLI/TS/curl/MCP for every action (9 vitest tests, 100% cov). Attestation verify runs **live in-browser** (pure crypto). `e2e/golden-path.spec.ts` Playwright smoke (build+serve prod bundle).
- **SP7 `@0gkit/compute` fix** — the optional broker dynamic import is a _variable_ `import()` carrying `/* webpackIgnore */ /* turbopackIgnore */ /* @vite-ignore */` so it survives every toolchain (esbuild/vite skip, vitest consumers don't resolve an uninstalled peer, Turbopack honours the ignore). esbuild preserves comments inside `import()`. No API/behaviour change.
- **SP7 playground browser stub** — `lib/browser-sdk-stub.ts` + `next.config.ts` `turbopack.resolveAlias` aliases the Node-only `@0gfoundation/*`/`@0glabs/*` SDKs out of the client bundle; live upload/infer then surface a clean ConfigError (honest — those need a server/CLI). `turbopack.root`+`outputFileTracingRoot` pin the workspace root (worktree lockfile ambiguity).
- **SP8 community/release** — CONTRIBUTING/CODE_OF_CONDUCT/SECURITY, root CHANGELOG, `docs/GOOD-FIRST-ISSUES.md`, issue/PR/discussion templates. **changesets**: `.changeset/config.json` (`linked: [["@0gkit/*"]]`, `ignore: ["@0gkit/playground"]` since linked-glob would bump the private app), root `@changesets/cli` + scripts. `.github/workflows/release.yml` opens a Version PR and publishes only when `NPM_TOKEN` set (degrades green, separate from CI gate).

### Next Steps

- Roadmap done. Possible follow-ups (not started): enabling the GitHub Discussions tab + Recipes category (one-click repo setting), wiring `NPM_TOKEN` to actually publish, enriching neutral package READMEs with curl/CLI blocks (good-first-issue #1).

### Key Decisions

- **One sub-project per session** is the default (memory `feedback_0gkit_pacing.md`); **the final session overrode it once** — user explicitly asked for SP7+SP8 together. Workflow still: fresh branch off `origin/main`, full CI-green, own PR, squash-merge.
- **Optional-peer dynamic imports must stay non-analyzable + ignore-commented** (`@0gkit/compute`). A literal `import("pkg")` breaks both esbuild build and vitest consumers when the peer isn't installed; a bare `import(var)` breaks Turbopack. The variable + triple ignore-comment form is the only one that satisfies all toolchains — don't "tidy" it to a literal.
- **SP5 left `packages/sdk/src/storage.ts` untouched** — its per-call ethers `signer` is documented public API; `@0gkit/storage`'s constructor-key model would break it (out of scope for "API unchanged"). Net deletion came from da/attestation.
- **Neutrality invariant**: `packages/0gkit-*/src` never imports `@foundryprotocol/*` or non-`@0gkit/*` workspace pkgs (`pnpm boundary:check`). Foundry→@0gkit is the allowed direction. Opt-in Foundry uses computed specifiers so dependency-cruiser builds no edge.
- **CI build-order**: any new workspace dep of `packages/sdk` must be built before `@foundryprotocol/sdk build` in the `web` and `mainnet-smoke` jobs (DTS needs declarations). Local green ≠ CI green here — always verify CI.
