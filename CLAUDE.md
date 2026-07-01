# Foundry Protocol — Claude Code session context

Repo: `rajkaria/foundry` · Domain: `foundryprotocol.xyz` · Default branch: `main`
0gkit toolkit: `rajkaria/0gkit` · Domain: `0gkit.com` · Local working dir: `/Users/rajkaria/Projects/0G-ai-kit/`

## Always-on rules for this project

- **Squash-merge own PRs** after CI passes; never leave open as a review gate.
- Commit/push/merge every change without per-change approval; no narration between tool calls.
- Honesty rule: never fabricate endpoints/behaviors; stubbed/unverified things must be labeled as such.
- **0gkit neutrality is a hard invariant:** no `@0gkit/*` package may statically depend on `@foundryprotocol/*` app packages. Enforced in CI by `pnpm boundary:check` (now also scans `templates/_kits`).
- **`/save-context` REPLACES the latest-session section below — do not append.** Older session detail lives in git history (`git log` on this file).

## Session Context (Last updated: 2026-07-01 12:55 IST)

### Current State

**The Kits epic is BUILT, MERGED, and PUBLISHED. K0–K5 are all live on npm.** This session (1) published the previously-merged-but-unpublished Kits epic, then (2) built + shipped + published K5.

- **Kits epic (K0–K4)** — was merged to `main` in the prior session but never published. This session merged Changesets release PR #55 → published **`@foundryprotocol/0gkit-kits@1.6.0`** (brand-new flagship pkg), **`0gkit-cli@1.6.0`**, **`create-0gkit-app@1.1.0`**. Kits = drop-in, composable, multi-framework feature overlays (`npm create 0gkit-app -- --kits <kit>` / `0g add <kit>`). 8 kits live: `agent-memory`, `ai-oracle`, `sealed-inference`, `prediction-market`, `durable-agent`, `live-feed`, `inft-studio`, `yield-intel`.
- **K5 (`0g doctor --fix` + `0g test`)** — built this session via subagent-driven-development, whole-branch **Opus** reviewed (Ready to merge, all 5 integration seams verified sound), merged (PR [#60](https://github.com/rajkaria/0gkit/pull/60) → `f356a91`), and published: **`0gkit-cli@1.7.0` + `0gkit-testing@1.7.0` + `0gkit-kits@1.7.0`** (all verified live on npm; version PR #61).
- **Next sprint = K6** (`0g mcp init <agent>`). Nothing in flight; `main` is green + released.
- **This CLAUDE.md was VERY stale at session start** (claimed K1 unbuilt) — it now reflects reality. Fresh SDD ledger for K5 lived at `0G-ai-kit/.superpowers/sdd/progress.md` (gitignored, local; marked DONE + PUBLISHED).

### Recent Changes (this session — 2026-07-01: publish epic + ship+publish K5)

- **Published the Kits epic.** The expired `NPM_TOKEN` GitHub secret was refreshed (Raj supplied a fresh Automation token; validated with `npm whoami` first), then squash-merged version PR #55; `release.yml` published clean. **`0gkit-kits@1.6.0` 404'd on the npm read-CDN for ~minutes despite publishing fine** (brand-new scoped packument lags; write endpoint already knew it, `npm access get status` = public) — became HTTP 200 on its own. Do not panic-republish (memory `project_0gkit_publish_gotchas` updated).
- **Reality-checked the K5 plan before coding** (the K1 discipline) and caught two real drifts + one wiring note → rewrote `docs/superpowers/plans/2026-06-30-k5-doctor-fix-test.md` (see its "Reality check" table): (a) plan reused K1's **D81–D83** → renumbered K5 to **D84–D86** and **backfilled K1's D81–D83** into `docs/DECISIONS.md` (which had stalled at D80); (b) plan's `0g test --kits` assumed a `.0gkit/kits.json` that **K0 never persisted** → added the persistence to `applyKit`; (c) real compute is broker-based (`broker.inference.*`), so live `conformanceDeps.makeCompute` wraps it, suites stay mock-injected.
- **Built K5 via SDD** (6 consolidated groups): conformance suites + `runConformance()` in `0gkit-testing`; `applyKit` persists `.0gkit/kits.json`; `0g test` CLI (lazy-imported per D39/D84, `--suite/--local/--galileo/--kits`); `0g doctor --fix` with per-check `→ run <cmd> to fix` + `.env`/stale-pin/rpc fixers (production seam wired in `cli.ts` so `bumpStalePins` isn't a no-op — a review catch); 9 templates adopt `0g test` (5 with real vitest got a separate `test:conformance`); `0gkit-testing` docs page; changeset + decisions.
- **Whole-branch Opus review** returned Ready-to-merge (0 Critical/Important); fixed 2 doc/comment Minors (a stranded D80 paragraph in DECISIONS.md; an over-claiming live-compute comment). CI green incl. the `0g --help cold-start` benchmark → D84 lazy-import is CI-verified.
- **Process note:** one implementer subagent got stuck in a self-spawned monitor loop and stopped without committing; controller verified the WIP (163 tests / build / typecheck / boundary all green) and finalized the commits. Add `"Do NOT spawn sub-agents / background monitors"` to implementer dispatches.

### Next Steps

1. **K6** (old SP18) — `0g mcp init <agent>` writes MCP config for cursor/claude/windsurf/codex, exposing the 0gkit tool set. Synergy: kits with MCP adapters (agent-memory, durable-agent, sealed-inference) auto-register their tools. Plan: `docs/superpowers/plans/2026-06-30-k6-mcp-init.md` — **reality-check it against the real CLI/MCP surface first** (the K1/K5 lesson). Then K7 (compute-router, research-gated) → K8 (contracts import) → K9 (Foundry SDK refresh, cross-repo) → K10 (showcase) → K11 (community). Roadmap: `docs/superpowers/plans/2026-06-30-kits-epic-roadmap.md`.
2. **K5 follow-ups (Minor, triage later):** `--kits` conformance discovery is inert until a kit ships a `conformance.ts` (path/extension needs reconciling with the compiled runtime; currently emits an honest "no conformance module" note — D86-compliant). Live `makeCompute` still uses deprecated `{ brokerKey }` (no sync `signerFromKey` in `0gkit-wallet` yet).
3. **K0 deferred minors** (still open): engine `package.json` `files` lists README/LICENSE not present; `appendEnv` regex not metachar-escaped; raw mutable `KITS` export; applyKit I/O-failure mid-loop partial write.

### Key Decisions (this session — 2026-07-01)

- **D84 (K5)** — `0g test` lazy-imports `0gkit-testing` via a computed dynamic specifier (D39); conformance suites are pure functions over injected factories → run offline in CI, never gate on Aristotle (D10). CI-verified by the `0g --help cold-start` benchmark.
- **D85 (K5)** — `0g doctor --fix` is advisory-only: writes `.env*` and prints commands (npm-install line for stale pins, `0g dev` rpc fallback) — never auto-installs or mutates network state. Every non-ok check exposes a `fixCmd` shown with or without `--fix`.
- **D86 (K5)** — `applyKit` persists `.0gkit/kits.json` (`{applied,base,at}`, union-merge on re-apply, dryRun no-op); `0g test --kits` reads it; missing manifest / no kits ⇒ informational note, never a failure. (Closed the K0 gap where applied-kit state was never persisted.)
- **Publish learnings** — a brand-new scoped package's first-ever publish can 404 on the read CDN for minutes though it's live (don't republish; confirm via `npm publish --dry-run` "cannot publish over" + `npm access get status`=public). `create-0g-app` is `"private": true` (canonical scaffolder is `create-0gkit-app`). Leaving version-packages PRs open indefinitely strands releases (the SP16/#51 gotcha).

#### Prior session (2026-06-30 PM) — K0 #54 landed + K1 reconciled

Fixed 3 CI failures on #54 and squash-merged the K0 engine to `main` (`6ca9f39`). A pre-build API inventory caught that the original K1 plan was written against non-existent verbs → rewrote it against the real stack. Decisions D81–D83 (K1): honest signed-receipt attestation (no TEE-quote verifier; injected `Attestor` seam); 0G-Storage-default + opt-in-on-chain anchor (`Anchor.sol`); `gen-registry.mjs` prettier-formats its generated output. (K1–K4 were subsequently built + merged; this session published them.)

### Recent Session History (most-recent first; full detail in git history)

- **2026-07-01 12:55 IST — publish epic + ship+publish K5** — refreshed `NPM_TOKEN`, merged #55 → published the Kits epic (kits@1.6.0/cli@1.6.0/create-0gkit-app@1.1.0). Reality-checked + built K5 via SDD (conformance runner, `0g test`, `doctor --fix`, `.0gkit/kits.json`), Opus whole-branch review, merged #60 (`f356a91`), then merged version PR #61 → published cli/testing/kits@1.7.0. Decisions D84–D86.
- **2026-06-30 18:30 IST — K0 #54 landed + K1 reconciled** — squash-merged K0 to `main` (`6ca9f39`); rewrote the K1 plan against the real stack. Decisions D81–D83. (K1–K4 built+merged after this; published 2026-07-01.)
- **2026-06-30 16:25 IST — Kits epic + K0 ship** — designed the Kits system, batch-planned K0–K11, built K0 via SDD. PR #54. Decisions D77–D80.
- **2026-06-01 13:55 IST — defect-report + publish 1.5.0** — `buildDefectReport()` + `--defect-report` (PR #52). Published all 18 packages at 1.5.0. Decisions D74–D76.
- **2026-05-27 → 2026-05-20 — SP1–SP16 + v1.0.0** — scaffolder, `0g dev`, primitives, 9 templates, error taxonomy/jobs/observability, docs/landing, golden-path `define0GConfig`. Decisions D8–D73. Full detail in git history.

### Key Architectural Decisions (still load-bearing — full list in `docs/DECISIONS.md` on 0gkit repo)

- **D13** — Repo named `rajkaria/0gkit` (no `ai` suffix). Local working dir `/Users/rajkaria/Projects/0G-ai-kit/` unchanged.
- **D24** — `templates/*` (and `templates/_kits/*`) are **not** in `pnpm-workspace.yaml` (they use published packages / are overlays).
- **D27 / D38** — `ZeroGError.helpUrl` computed from code; `ERROR_HELP_BASE = "https://docs.0gkit.com/errors/"`.
- **D39** — CLI lazy-loads heavy/optional deps (`0gkit-jobs`, `0gkit-testing`, `0gkit-kits`) via computed-specifier dynamic import to keep cold-start under budget.
- **D71–D73 (SP16)** — first-success banner token `[0gkit:first-success]`; `detectLocalDevnet` pure chainId probe; zod a direct dep of `0gkit-core`.
- **D74–D76 (defect-report)** — renderer/heuristics in `0gkit-core`; `suggestOwnership` auto-returns only `0G Infra`/`Hackathon项目`; `suggestSeverity` always labeled "(suggested — confirm)".
- **D77–D80 (Kits engine)** — git-overlay kits (not pkgs/codegen); engine `@foundryprotocol/*`-app-free (neutrality); 3-tier `lib`/`adapters`/`ui`; composition deps-first/deduped/cycle-safe (`composes[]`), deps travel in `dependencies`.
- **D81–D83 (K1)** — attestation = honest **signed inference receipt** (no TEE-quote verification exists; injected `Attestor` seam); anchor = **0G Storage default + opt-in on-chain** (`Anchor.sol`, `OG_ANCHOR_ONCHAIN=1`); `gen-registry.mjs` prettier-formats its generated `registry.generated.ts`.
- **D84–D86 (K5)** — `0g test` lazy-imports `0gkit-testing`, suites pure/offline over injected factories (D84); `0g doctor --fix` advisory-only, writes `.env*`/prints commands, every check exposes `fixCmd` (D85); `applyKit` persists `.0gkit/kits.json` and `0g test --kits` reads it additively (D86).

### Pointers

- **Kits epic:** spec `docs/superpowers/specs/2026-06-30-0gkit-kits-design.md`; plans `docs/superpowers/plans/2026-06-30-k{0..11}-*.md`; roadmap `…/2026-06-30-kits-epic-roadmap.md` (K0–K5 done+published; **K6 next**).
- **Decisions log:** `docs/DECISIONS.md` on 0gkit repo (now current through D86).
- **Publish:** Changesets `release.yml` on push to `main` — pending changesets ⇒ version PR; versions bumped + `NPM_TOKEN` ⇒ publish. `NPM_TOKEN` secret refreshed 2026-07-01. Gotchas in memory `project_0gkit_publish_gotchas`.
- **Deployer/seed key:** sibling worktree `sad-jemison-e5dba7/.env`; deployer `0x4f18…CfE8`.
- **Memory:** `/Users/rajkaria/.claude/projects/-Users-rajkaria-Projects-Foundryprotocol/memory/MEMORY.md`.

### Workflow reminders

- Plan-already-written → **reality-check it against real exports first** (the K1/K5 fictional-API lesson), then execute via `superpowers:subagent-driven-development` → squash-merge after CI green. **Always run the final whole-branch review** (most-capable model) even when per-task gates are green.
- In SDD implementer dispatches, add **"do NOT spawn sub-agents / background monitors"** (a K5 implementer monitor-looped and stalled).
- `gh pr merge --squash --delete-branch` (auto-merge disabled). Publishing = merge the Changesets version-packages PR (don't leave it open).
- All current sprints (Kits K0–K11) land on `rajkaria/0gkit`. The Foundryprotocol repo itself has no in-flight code work (K9 Foundry SDK refresh is the one cross-repo carryover, far out).
