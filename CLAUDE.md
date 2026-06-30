# Foundry Protocol — Claude Code session context

Repo: `rajkaria/foundry` · Domain: `foundryprotocol.xyz` · Default branch: `main`
0gkit toolkit: `rajkaria/0gkit` · Domain: `0gkit.com` · Local working dir: `/Users/rajkaria/Projects/0G-ai-kit/`

## Always-on rules for this project

- **Squash-merge own PRs** after CI passes; never leave open as a review gate.
- Commit/push/merge every change without per-change approval; no narration between tool calls.
- Honesty rule: never fabricate endpoints/behaviors; stubbed/unverified things must be labeled as such.
- **0gkit neutrality is a hard invariant:** no `@0gkit/*` package may statically depend on `@foundryprotocol/*` app packages. Enforced in CI by `pnpm boundary:check` (now also scans `templates/_kits`).
- **`/save-context` REPLACES the latest-session section below — do not append.** Older session detail lives in git history (`git log` on this file).

## Session Context (Last updated: 2026-06-30 18:30 IST)

### Current State

**K0 (the Kits engine) is MERGED — PR [rajkaria/0gkit#54](https://github.com/rajkaria/0gkit/pull/54) squash-merged to `main` (commit `6ca9f39`).** Kits = drop-in, composable, **multi-framework** feature overlays for 0G apps (`npm create 0gkit-app -- --kits <kit>` or `0g add <kit>`). Engine = `@foundryprotocol/0gkit-kits` (zod+giget only, neutrality-enforced) + `agent-memory` reference kit + 3-tier model + `kits:check` CI gate. Landed after fixing **3 CI failures** (2 were masked behind the first): create-0gkit-app DTS build-order, format:check (root-caused — `gen-registry.mjs` now auto-prettier-formats its generated output), and docs:check (added the `0gkit-kits` package docs page + nav).

**K1 (Verifiable AI + flagship prediction-market) is PLANNED + reconciled, NOT yet built.** Branch `kits-k1-verifiable-ai` (off merged main, pushed). The original K1 draft was written against **non-existent APIs** (`compute.inferAttested`/`chain.anchor`/`attestation.verify`) — the same integration-seam trap K0's review caught. The plan is now **rewritten against the real stack** (`Compute.inference`, `Storage.upload/download`, `verifyEnvelope`/`signEnvelope`+`digestJson`, `0gkit-contracts.createTypedContract`). Three kits — `ai-oracle`, `sealed-inference`, `prediction-market` (composes ai-oracle) — each a portable injected-deps lib + per-base adapters + React UI (mirrors `agent-memory`). Execution = `subagent-driven-development`; fresh ledger at `.superpowers/sdd/progress.md`.

**Both working dirs:** `0G-ai-kit` on `kits-k1-verifiable-ai` (pushed); Foundryprotocol worktree = this CLAUDE.md update.

### Recent Changes (this session — 2026-06-30 PM: land K0 #54 + reconcile K1)

- **Landed K0 / PR #54.** CI was RED on 2 checks → fixed **3 failures**: (1) `create-0gkit-app-e2e` built the package before the kits engine → DTS `TS2307`; added an engine pre-build step in `.github/workflows/ci.yml`. (2) `format:check` — 7 carryover plan docs + `registry.generated.ts`; **root-caused the generated file** (codegen emitted raw `JSON.stringify` that never matched prettier → perpetual drift) and **fixed at source: `gen-registry.mjs` now formats its output through prettier** (idempotent, cold-build fallback); also `.prettierignore`'d the local `.superpowers` ledger. (3) `docs:check` (masked behind format) — new `0gkit-kits` pkg had no docs → wrote `apps/docs/app/packages/0gkit-kits/page.mdx` (all 24 exports) + sidebar nav. **Validated every build-job step locally incl. playwright**, then squash-merged on green.
- **Reconciled the K1 plan** to real package APIs. Inventoried `0gkit-{compute,attestation,chain,storage,indexer,contracts,core,testing}` and found the draft assumed verbs that don't exist (`compute.inferAttested`/`chain.anchor`/`attestation.verify`) and that **no TEE quote verification exists in the stack**. Rewrote `docs/superpowers/plans/2026-06-30-k1-verifiable-ai-market.md` against the real surface + Raj's 2 decisions (D81/D82). Branch `kits-k1-verifiable-ai` pushed; fresh SDD ledger written.
- **Foundry repo:** this CLAUDE.md update.

### Next Steps

1. **Execute K1** via `superpowers:subagent-driven-development` on `kits-k1-verifiable-ai`: T1 `ai-oracle` → T2 `sealed-inference` → T3 `prediction-market` (composes ai-oracle) → T4 matrix+docs+changeset+full-gate+PR. Plan: `docs/superpowers/plans/2026-06-30-k1-verifiable-ai-market.md` (REVISED — read its "Reality check" table). Ledger: `.superpowers/sdd/progress.md`. **Whole-branch opus review before merge**; squash-merge on green CI. (No publish in K1 — that's K4.)
2. Then **K2** (durable-agent/live-feed) → **K3** (inft-studio/yield-intel) → **K4** (docs/GTM/**publish** — `0gkit-kits` joins the linked `@foundryprotocol/0gkit-*` group) → carryover **K5–K11**. Roadmap: `docs/superpowers/plans/2026-06-30-kits-epic-roadmap.md`.
3. **K0 deferred minors** (triage later): engine `package.json` `files` lists README/LICENSE not present; `appendEnv` regex not metachar-escaped; raw mutable `KITS` export; applyKit I/O-failure mid-loop partial write.

### Key Decisions (this session)

- **D81 (K1 honesty)** — the stack has **no TEE quote verification** (`0gkit-attestation` = EIP-191 signed-envelope over an eval-result schema; the `tee-attested-api` template verifies a *provider-signed* envelope). K1 frames attestation honestly as a **signed inference receipt, signature-verified** (badge = "✓ signature verified", never "TEE attested"), behind an injected `Attestor` interface so a real TEE-quote verifier can slot in later. No fabricated behavior (honesty rule).
- **D82 (K1 anchor)** — no `chain.anchor` primitive exists; K1 ships **both**: default **0G Storage anchor** (immutable content-addressed `root` = commitment) + **opt-in on-chain anchor** (bundled `Anchor.sol` via `0gkit-contracts.createTypedContract`, env-flag-gated; mirrors `templates/nft-with-storage`).
- **D83 (codegen hygiene)** — `0gkit-kits/scripts/gen-registry.mjs` now formats `registry.generated.ts` through prettier (was raw `JSON.stringify` → perpetual `format:check` drift). Idempotent; graceful cold-build fallback.
- **Process win (reaffirmed)** — a **pre-build API inventory** caught K1's fictional-API gap before any code was written; the whole-branch review remains the net. Always verify a plan's pseudocode against real exports first, and **run the COMPLETE gate** — `docs:check` was masked behind `format:check` on #54 and only surfaced once format passed.

#### Prior session (2026-06-01) — defect-report shipped + 0gkit 1.5.0 published

`buildDefectReport()`/`suggestOwnership()`/`suggestSeverity()` in `0gkit-core` + `--defect-report` CLI flag (PR [#52](https://github.com/rajkaria/0gkit/pull/52), `006e514`). Published all 18 `@foundryprotocol/0gkit-*` at **1.5.0** (via merging stale version-packages PR #51 + rotating an expired `NPM_TOKEN`). Goodwill PR [lvxuan149/0g-apac-app-test#1](https://github.com/lvxuan149/0g-apac-app-test/pull/1) (P1–P4 severity rubric + YAML defect template; 0gkit auto-emit section dropped pending real QA). Decisions D74–D76.

### Recent Session History (most-recent first; full detail in git history)

- **2026-06-30 18:30 IST — K0 #54 landed + K1 reconciled** — fixed 3 CI failures on #54 (create-0gkit-app DTS build-order; `gen-registry.mjs` prettier-formats output; new `0gkit-kits` docs page) and squash-merged K0 to `main` (`6ca9f39`). Then a pre-build API inventory caught that the K1 plan was written against non-existent verbs → rewrote it against the real stack + Raj's decisions (honest signed-receipt attestation D81; storage+opt-in-on-chain anchor D82). Branch `kits-k1-verifiable-ai` ready for SDD. Decisions D81–D83.
- **2026-06-30 16:25 IST — Kits epic + K0 ship** — designed + spec'd the Kits feature-overlay system, batch-planned K0–K11, and built **K0** (engine `@foundryprotocol/0gkit-kits` + `agent-memory` reference kit + `--kits`/`0g add` wiring + `kits:check` CI gate) via subagent-driven development. Whole-branch opus review caught + fixed 4 cross-task bugs. PR [#54](https://github.com/rajkaria/0gkit/pull/54) shipped (squash-merged). Decisions D77–D80.
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
- **D81–D83 (K1)** — attestation = honest **signed inference receipt** (no TEE-quote verification exists; injected `Attestor` seam for a future real one); anchor = **0G Storage by default + opt-in on-chain** (`Anchor.sol` via `0gkit-contracts`); `gen-registry.mjs` prettier-formats its generated `registry.generated.ts` (kills perpetual `format:check` drift).

### Pointers

- **Kits epic:** spec `docs/superpowers/specs/2026-06-30-0gkit-kits-design.md`; plans `docs/superpowers/plans/2026-06-30-k{0..11}-*.md` (on 0gkit `main` since #54); master roadmap `…/2026-06-30-kits-epic-roadmap.md`. Active branch `kits-k1-verifiable-ai`; K1 SDD ledger `.superpowers/sdd/progress.md` (gitignored — local only).
- **0gkit post-v1 roadmap (carryover scope source):** `docs/superpowers/plans/2026-05-23-post-v1-roadmap.md` (re-sequenced banner → kits-epic-roadmap).
- **Decisions log:** `docs/DECISIONS.md` on 0gkit repo.
- **Deployer/seed key:** sibling worktree `sad-jemison-e5dba7/.env`; deployer `0x4f18…CfE8`.
- **Memory:** `/Users/rajkaria/.claude/projects/-Users-rajkaria-Projects-Foundryprotocol/memory/MEMORY.md`.

### Workflow reminders

- Plan-already-written → execute via `superpowers:subagent-driven-development` (same session) or `superpowers:executing-plans` → squash-merge after CI green. **Always run the final whole-branch review** (most-capable model) even when per-task gates are green.
- `gh pr merge --squash --delete-branch` (auto-merge disabled).
- All current sprints (Kits K0–K11) land on `rajkaria/0gkit`. The Foundryprotocol repo itself has no in-flight code work (K9 Foundry SDK refresh is the one cross-repo carryover, far out).
