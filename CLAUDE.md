# Foundry Protocol — Claude Code session context

Repo: `rajkaria/foundry` · Domain: `foundryprotocol.xyz` · Default branch: `main`
0gkit toolkit: `rajkaria/0gkit` · Domain: `0gkit.com` · Local working dir: `/Users/rajkaria/Projects/0G-ai-kit/`

## Always-on rules for this project

- **Squash-merge own PRs** after CI passes; never leave open as a review gate.
- Commit/push/merge every change without per-change approval; no narration between tool calls.
- Honesty rule: never fabricate endpoints/behaviors; stubbed/unverified things must be labeled as such.
- **0gkit neutrality is a hard invariant:** no `@0gkit/*` package may statically depend on `@foundryprotocol/*` app packages. Enforced in CI by `pnpm boundary:check` (now also scans `templates/_kits`).
- **`/save-context` REPLACES the latest-session section below — do not append.** Older session detail lives in git history (`git log` on this file).

## Session Context (Last updated: 2026-06-30 16:25 IST)

### Current State

**0gkit "Kits" epic launched. K0 (the engine) is fully built and shipped to PR [rajkaria/0gkit#54](https://github.com/rajkaria/0gkit/pull/54) (branch `kits-epic`); awaiting GitHub CI → squash-merge.** Kits = drop-in, composable, **multi-framework** feature overlays for 0G apps (`npm create 0gkit-app -- --kits <kit>` at scaffold time, or `0g add <kit>` into an existing project). Clean-room design that takes *reference* from `create-0g-dapp`'s "skills" (Schema Labs) but is our own better version: heavy logic in versioned `0gkit-*` packages (upgradeable, not a code dump), a **3-tier portability model**, per-`(kit × base)` CI gating, durability + real-attestation categories they lack, and honest finance framing.

**What's in PR #54 (all local gates green: lint·typecheck·build·test·boundary·templates·kits 4/4·format):**
- **New engine package `@foundryprotocol/0gkit-kits`** — pure, deps `zod`+`giget` only (neutrality-enforced). Surface: `KitManifestSchema`, registry (`listKits`/`getKit`/`loadRegistry` + build-time codegen `gen-registry.mjs`), `resolveTiers`, `applyKit` (composition closure deps-first/deduped/cycle-safe; conflicts throw `KitError`; kit self-supplies its 0gkit deps via `dependencies`), idempotent `mergePackageJson`/`appendEnv`, `fetchKitOverlay`, `detectBase`.
- **3-tier model:** portable `lib` (always) + per-framework `adapters/<base>` + React-only `ui`. Kits live as git overlays under `templates/_kits/<kit>/` (NOT a workspace pkg, mirrors `templates/_ci`).
- **`agent-memory` reference kit** — lib-only core via injected `MemoryStorage` (portable + unit-tested); mcp + react adapters wire real `0gkit-storage` (content-addressed root-registry pattern); react UI.
- **Wiring:** `--kits` flag + interactive picker in `create-0g-app`; `0g add` / `0g kits list|info` in `0gkit-cli` (engine **lazy-loaded** via computed dynamic import, D39 — no static dep). `create-0gkit-app` declares the engine dep so the published command works.
- **CI gate `pnpm kits:check`** — applies every `(kit × base)` from the *local* tree + type-checks (incl. React/Next bases — the tsc-skip hole was closed). Wired into fresh-machine-smoke.
- **Plans:** full bite-sized plans for **K0–K11** (K0–K4 Kits + carryover K5–K11 = old SP17–SP23, re-sequenced after the epic) + consolidated roadmap + design spec, all under `docs/superpowers/{specs,plans}/` on `kits-epic`.

**Both working dirs:** `0G-ai-kit` on `kits-epic` (pushed); Foundryprotocol worktree clean.

### Recent Changes (this session — 2026-06-30: Kits epic design + plan + K0 build)

- **Brainstormed + spec'd the Kits epic** (`docs/superpowers/specs/2026-06-30-0gkit-kits-design.md`). Decisions: name = **"kits"** (the 0gkit pun); clean-room not a port; **dropped create-0g-dapp's hackathon-track taxonomy** (unverified marketing) in favor of 0G capability domains; finance kit reframed honest (analysis + attested log, **no money-moving bot**).
- **Batch-planned all 12 sprints** (multi-sprint-planning): K0–K4 (Kits) + K5–K11 (carryover old SP17–SP23, folded in per Raj's request). The carryover plans were authored by a background agent in an isolated worktree (branch `kits-carryover-plans`), then merged into `kits-epic`.
- **Executed K0 end-to-end via `superpowers:subagent-driven-development`** — 11 tasks, fresh implementer + spec/quality review each, ledger at `.superpowers/sdd/progress.md`. Then a **whole-branch opus review caught 4 cross-task bugs the 11 green per-task gates structurally couldn't** (see Key Decisions). All fixed (`74f4825`). Opened **PR #54**.
- **Foundry repo:** this CLAUDE.md update.

### Next Steps

1. **Land K0:** verify CI green on [#54](https://github.com/rajkaria/0gkit/pull/54) → `gh pr merge 54 --squash --delete-branch`. (Publish of `0gkit-kits`+`0gkit-cli`+`create-0g-app`/`create-0gkit-app` happens in **K4**, not yet — changeset is staged; `0gkit-kits` joins the `@foundryprotocol/0gkit-*` linked group.)
2. **K1** — `ai-oracle`, `sealed-inference`, `prediction-market` (composition + real attestation). Plan ready: `docs/superpowers/plans/2026-06-30-k1-verifiable-ai-market.md`. Execute via subagent-driven-development off fresh `main` after #54 merges.
3. Then **K2** (durable-agent/live-feed) → **K3** (inft-studio/yield-intel) → **K4** (docs/GTM/publish) → carryover **K5–K11**. Master sequence: `docs/superpowers/plans/2026-06-30-kits-epic-roadmap.md`.
4. **Deferred Minors from K0's final review** (non-blocking, triage in a later sprint): engine `package.json` `files` lists README/LICENSE not present; `appendEnv` regex not metachar-escaped; raw mutable `KITS` export; applyKit I/O-failure mid-loop partial write (optional stage-then-commit hardening).

### Key Decisions (this session)

- **D77** — Kits are git overlays under `templates/_kits/`, applied via giget (reusing the `fetchCi` pattern); NOT published packages or string codegen.
- **D78** — the `0gkit-kits` engine imports only `zod`+`giget`+`node:*`; never another `0gkit-*`/`@foundryprotocol/*` (neutrality + CLI cold-start). Kit *overlays* MAY import `@foundryprotocol/0gkit-*` but never a Foundry app pkg. Both rules CI-enforced (`boundary:check` now scans `templates/_kits`).
- **D79** — 3-tier model: `lib` always applied, `adapters[base]` if present, `ui` on React bases only; a kit is offered for a base iff `resolveTiers` is non-empty.
- **D80** — composition: `composes[]` auto-applies deps first (deps-first DFS, deduped, cycle-safe); `conflicts[]` throws `KitError`; a kit's required 0gkit packages travel in its own `dependencies` (not `requires`) so it is self-sufficient on any base.
- **Process win** — the **whole-branch opus review is load-bearing**: it caught 4 integration-seam bugs invisible to 11 green per-task gates — (C1) published `create-0gkit-app` missing the engine dep → `MODULE_NOT_FOUND`; (C2) the react adapter written against a **non-existent** `0gkit-storage` API, hidden because `kits:check` skipped `tsc` on Next bases; (I3) scaffold `writeEnvExample` clobbering kit env vars; (I4) `detectBase` vocab not matching template/registry bases. Lesson: always run the final whole-branch review even when every task is green, and never let a CI matrix silently skip type-checking a base.

#### Prior session (2026-06-01) — defect-report shipped + 0gkit 1.5.0 published

`buildDefectReport()`/`suggestOwnership()`/`suggestSeverity()` in `0gkit-core` + `--defect-report` CLI flag (PR [#52](https://github.com/rajkaria/0gkit/pull/52), `006e514`). Published all 18 `@foundryprotocol/0gkit-*` at **1.5.0** (via merging stale version-packages PR #51 + rotating an expired `NPM_TOKEN`). Goodwill PR [lvxuan149/0g-apac-app-test#1](https://github.com/lvxuan149/0g-apac-app-test/pull/1) (P1–P4 severity rubric + YAML defect template; 0gkit auto-emit section dropped pending real QA). Decisions D74–D76.

### Recent Session History (most-recent first; full detail in git history)

- **2026-06-30 16:25 IST — Kits epic + K0 ship** — designed + spec'd the Kits feature-overlay system, batch-planned K0–K11, and built **K0** (engine `@foundryprotocol/0gkit-kits` + `agent-memory` reference kit + `--kits`/`0g add` wiring + `kits:check` CI gate) via subagent-driven development. Whole-branch opus review caught + fixed 4 cross-task bugs. PR [#54](https://github.com/rajkaria/0gkit/pull/54) open, local gates green. Decisions D77–D80.
- **2026-06-01 13:55 IST — defect-report + publish 1.5.0** — see Prior session above. PR #52 (`006e514`); 1.5.0 live on npm; goodwill PR #1. Decisions D74–D76.
- **2026-05-27 00:34 IST — SP16 ship** — golden path + `define0GConfig` across all 9 templates. PR [#50](https://github.com/rajkaria/0gkit/pull/50) (`f59b752`). Decisions D71–D73.
- **2026-05-26 06:39 IST — SP15 ship** — `--copy-issue-context` CLI flag + stale error-page refresh. PRs [#48](https://github.com/rajkaria/0gkit/pull/48)+[#49](https://github.com/rajkaria/0gkit/pull/49). Published `0gkit-cli@1.4.0`. Decisions D67–D70.
- **2026-05-26 04:45 IST — SP14 ship** — local `0g traces` explorer + `0g cost forecast --from-jaeger`. PRs [#46](https://github.com/rajkaria/0gkit/pull/46)+[#47](https://github.com/rajkaria/0gkit/pull/47). Decisions D62–D66.
- **2026-05-23 — SP13 + 0gkit.com stand-up** — docs cleanup + migration guide + landing + sentinels. PRs #26–#45. Decisions D38–D57.
- **2026-05-22 — Phase 4 (SP9–SP12 + v1.0.0)** — error taxonomy, jobs, observability, Pagefind/LHCI. 18 packages published. Decisions D27–D37.
- **2026-05-20→22 — Phase 1–3 (SP1–SP8)** — scaffolder, `0g dev`, wallet/contracts/testing/indexer, 9 templates. Repo renamed `0G-ai-kit`→`0gkit` (D13). Decisions D8–D26.
- **Pre-2026-05-20 — hackathon era** — Foundry monorepo + contracts + SDK + inference loop. Superseded by the real `@foundryprotocol/0gkit-*` primitives.

### Key Architectural Decisions (still load-bearing — full list in `docs/DECISIONS.md` on 0gkit repo)

- **D13** — Repo named `rajkaria/0gkit` (no `ai` suffix). Local working dir `/Users/rajkaria/Projects/0G-ai-kit/` unchanged.
- **D24** — `templates/*` (and now `templates/_kits/*`) are **not** in `pnpm-workspace.yaml` (they use published packages / are overlays).
- **D27 / D38** — `ZeroGError.helpUrl` computed from code (`ERROR_HELP_BASE + code`); `ERROR_HELP_BASE = "https://docs.0gkit.com/errors/"`.
- **D39** — CLI lazy-loads heavy/optional deps (`0gkit-jobs`, `0gkit-testing`, **`0gkit-kits`**) via computed-specifier dynamic import to keep cold-start under the SP13 perf budget.
- **D58** — `OGKIT_TRACE_DIR` opts in to local JSONL trace mirror in `0gkit-observability` (off by default).
- **D67 / D68** — `--copy-issue-context` writes to stderr (clean `--json`); `import.meta.resolve` is the prod path for version discovery; every `0gkit-*` `exports` is `"import"`-only.
- **D71–D73 (SP16)** — first-success banner token `[0gkit:first-success]`; `detectLocalDevnet` pure chainId probe; zod a direct dep of `0gkit-core`.
- **D74–D76 (defect-report)** — renderer/heuristics in `0gkit-core`; `suggestOwnership` auto-returns only `0G Infra`/`Hackathon项目`; `suggestSeverity` always labeled "(suggested — confirm)".
- **D77–D80 (Kits)** — git-overlay kits (not pkgs/codegen); engine `@foundryprotocol/*`-app-free (neutrality); 3-tier `lib`/`adapters`/`ui`; composition deps-first/deduped/cycle-safe + kit self-supplies deps via `dependencies`.

### Pointers

- **Kits epic:** spec `docs/superpowers/specs/2026-06-30-0gkit-kits-design.md`; plans `docs/superpowers/plans/2026-06-30-k{0..11}-*.md`; master roadmap `…/2026-06-30-kits-epic-roadmap.md`. K0 SDD ledger: `.superpowers/sdd/progress.md` (all on 0gkit repo / `kits-epic` branch).
- **0gkit post-v1 roadmap (carryover scope source):** `docs/superpowers/plans/2026-05-23-post-v1-roadmap.md` (re-sequenced banner → kits-epic-roadmap).
- **Decisions log:** `docs/DECISIONS.md` on 0gkit repo.
- **Deployer/seed key:** sibling worktree `sad-jemison-e5dba7/.env`; deployer `0x4f18…CfE8`.
- **Memory:** `/Users/rajkaria/.claude/projects/-Users-rajkaria-Projects-Foundryprotocol/memory/MEMORY.md`.

### Workflow reminders

- Plan-already-written → execute via `superpowers:subagent-driven-development` (same session) or `superpowers:executing-plans` → squash-merge after CI green. **Always run the final whole-branch review** (most-capable model) even when per-task gates are green.
- `gh pr merge --squash --delete-branch` (auto-merge disabled).
- All current sprints (Kits K0–K11) land on `rajkaria/0gkit`. The Foundryprotocol repo itself has no in-flight code work (K9 Foundry SDK refresh is the one cross-repo carryover, far out).
