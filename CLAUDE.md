# Foundry Protocol — Project Instructions

## Session Context (Last updated: 2026-05-19 14:00)

### Current State

- **0gkit toolkit roadmap** (spec: `docs/superpowers/specs/2026-05-18-0gkit-0g-builder-toolkit-design.md` §11) is being built in 8 dependency-ordered sub-projects.
- **Merged to main:** SP1 (core+chain), SP2 (primitives), SP3 (CLI), **SP4 `@0gkit/mcp` (PR #26)**, **SP5 Foundry SDK refactor (PR #27)**, **SP6 scaffolder + recipes (PR #29)**.
- **Remaining:** SP7 playground + `@0gkit/react`, SP8 community/docs.
- CI is green on main. All `@0gkit/*` packages build/test; `pnpm boundary:check` enforces neutrality.

### Recent Changes (this session — SP6)

- `packages/create-foundry-app/` — `create-foundry-forge` evolved (git-mv, clean rename, no compat shim) into `create-foundry-app`. Split into testable modules: `archetypes.ts` (A–E + zero-setup `demo` catalog), `generate.ts` (pure `generateProject → FileMap`), `cli.ts` (flags `--archetype/--network/--demo/--yes` + interactive picker). 21 vitest tests, **100% coverage** on the pure modules (`cli.ts` excluded like `@0gkit/cli`). README rewritten.
- A–E archetypes map to `docs/0G-HACKATHON-INTEGRATION-PLAN.md` §2 value-props; `demo` archetype is the one-command live-Ingot path (`--demo` → Galileo, no key, public demo Ingot `ingot:0x8e2af4a0…001`).
- `examples/` (new, top-level, **not** a workspace glob so not installed) — 5 degit-able recipes: 3 neutral `@0gkit/*` (da-publish-verify, storage-roundtrip, inference-quickstart) + 2 Foundry-tagged ownership/revenue (foundry-own-a-model, foundry-revenue-split). `examples/README.md` indexes them and tags the Foundry path as non-default.
- `scripts/check-examples.mjs` + root `examples:check` script — cheap CI gate (required files, valid pkg JSON, name==dir, start entry exists; no installs/network).
- `.github/workflows/ci.yml` web job — added `create-foundry-app` build/test, folded it into the coverage aggregation `--filter` line, added `pnpm examples:check`.

### Next Steps

1. **SP7 — `apps/playground` + `@0gkit/react`.** Branch fresh off `origin/main` (`git fetch && git checkout -b claude/0gkit-sp7 origin/main && pnpm install`). `@0gkit/react` hooks (`useUpload`, `useDownload`, `useInference`, `useAttestation`) + Next.js playground (zero-setup web console; copy-code in CLI/TS/curl/MCP forms). Acceptance (spec §11.7): golden-path Playwright smoke green; copy-code works for all 4 forms. `apps/*` IS a workspace glob. Mirror conventions; wire CI; own PR; squash-merge.
2. Then SP8 — one per session, `/save-context` between (see memory `feedback_0gkit_pacing.md`).

### Key Decisions

- **One sub-project per session**, fresh branch off `origin/main`, full CI-green, own PR, squash-merge, then `/save-context`. User explicitly chose this over a single marathon session (burn-rate).
- **SP5 left `packages/sdk/src/storage.ts` untouched** — its per-call ethers `signer` is documented public API; `@0gkit/storage`'s constructor-key model would break it (out of scope for "API unchanged"). Net deletion came from da/attestation.
- **Neutrality invariant**: `packages/0gkit-*/src` never imports `@foundryprotocol/*` or non-`@0gkit/*` workspace pkgs (`pnpm boundary:check`). Foundry→@0gkit is the allowed direction. Opt-in Foundry uses computed specifiers so dependency-cruiser builds no edge.
- **CI build-order**: any new workspace dep of `packages/sdk` must be built before `@foundryprotocol/sdk build` in the `web` and `mainnet-smoke` jobs (DTS needs declarations). Local green ≠ CI green here — always verify CI.
