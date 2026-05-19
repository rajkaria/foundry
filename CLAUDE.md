# Foundry Protocol — Project Instructions

## Session Context (Last updated: 2026-05-19 13:30)

### Current State
- **0gkit toolkit roadmap** (spec: `docs/superpowers/specs/2026-05-18-0gkit-0g-builder-toolkit-design.md` §11) is being built in 8 dependency-ordered sub-projects.
- **Merged to main:** SP1 (core+chain), SP2 (primitives), SP3 (CLI), **SP4 `@0gkit/mcp` (PR #26)**, **SP5 Foundry SDK refactor (PR #27, commit 23d9cae)**.
- **Remaining:** SP6 scaffolder + recipes, SP7 playground + `@0gkit/react`, SP8 community/docs.
- CI is green on main. All `@0gkit/*` packages build/test; `pnpm boundary:check` enforces neutrality.

### Recent Changes (this session)
- `packages/0gkit-mcp/` — new neutral MCP server: 9 `og_*` tools wrapping every primitive, opt-in Foundry plugin (absent by default, computed-specifier loader), stdio CLI, 33 tests, 96% coverage, README. Wired into `.github/workflows/ci.yml` (web job build/test/coverage).
- `packages/mcp-foundry/src/index.ts` — extracted reusable `foundryMcpPlugin()` adapter; `createFoundryMcpServer` delegates to it (public API unchanged).
- `packages/sdk/src/da.ts` — delegates digest+publish to `@0gkit/da`; deleted duplicated serialize/canonical/manual-fetch. `DAClient`/`DAError`/types preserved.
- `packages/sdk/src/attestation.ts` — `digestEnvelope` delegates to `@0gkit/core` `digestJson`; deleted duplicated canonical-JSON.
- `packages/sdk/package.json` + `tsup.config.ts` — added `@0gkit/core` + `@0gkit/da` workspace deps.
- `.github/workflows/ci.yml` — build `@0gkit/core` + `@0gkit/da` before `@foundryprotocol/sdk build` in BOTH `web` and `mainnet-smoke` jobs (SDK DTS build needs their `.d.ts`).

### Next Steps
1. **SP6 — `create-foundry-app` scaffolder + `examples/` recipes.** Branch fresh off `origin/main` (`git fetch && git checkout -b claude/0gkit-sp6 origin/main && pnpm install`). Evolve `packages/create-foundry-forge` into `create-foundry-app` with the A–E archetype templates from `docs/0G-HACKATHON-INTEGRATION-PLAN.md` + a one-command live-Ingot demo; add degit-able `examples/`. Acceptance (spec §11.6): one-command live demo; archetype templates A–E. Mirror existing package conventions; wire CI; own PR; squash-merge.
2. Then SP7, then SP8 — one per session, `/save-context` between (see memory `feedback_0gkit_pacing.md`).

### Key Decisions
- **One sub-project per session**, fresh branch off `origin/main`, full CI-green, own PR, squash-merge, then `/save-context`. User explicitly chose this over a single marathon session (burn-rate).
- **SP5 left `packages/sdk/src/storage.ts` untouched** — its per-call ethers `signer` is documented public API; `@0gkit/storage`'s constructor-key model would break it (out of scope for "API unchanged"). Net deletion came from da/attestation.
- **Neutrality invariant**: `packages/0gkit-*/src` never imports `@foundryprotocol/*` or non-`@0gkit/*` workspace pkgs (`pnpm boundary:check`). Foundry→@0gkit is the allowed direction. Opt-in Foundry uses computed specifiers so dependency-cruiser builds no edge.
- **CI build-order**: any new workspace dep of `packages/sdk` must be built before `@foundryprotocol/sdk build` in the `web` and `mainnet-smoke` jobs (DTS needs declarations). Local green ≠ CI green here — always verify CI.
