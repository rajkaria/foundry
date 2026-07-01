# Foundry Protocol — Claude Code session context

Repo: `rajkaria/foundry` · Domain: `foundryprotocol.xyz` · Default branch: `main`
0gkit toolkit: `rajkaria/0gkit` · Domain: `0gkit.com` · Local working dir: `/Users/rajkaria/Projects/0G-ai-kit/`

## Always-on rules for this project

- **Squash-merge own PRs** after CI passes; never leave open as a review gate.
- Commit/push/merge every change without per-change approval; no narration between tool calls.
- Honesty rule: never fabricate endpoints/behaviors; stubbed/unverified things must be labeled as such.
- **0gkit neutrality is a hard invariant:** no `@0gkit/*` package may statically depend on `@foundryprotocol/*` app packages. Enforced in CI by `pnpm boundary:check` (now also scans `templates/_kits`).
- **`/save-context` REPLACES the latest-session section below — do not append.** Older session detail lives in git history (`git log` on this file).

## Session Context (Last updated: 2026-07-01 10:15 IST)

### Current State

**Kits epic K1–K4 EXECUTED end-to-end this session — all IMPLEMENTATION merged to `0gkit` main. 8 kits now live.** Five PRs squash-merged on green CI, each after a per-task review + an Opus whole-branch review: K0 [#54](https://github.com/rajkaria/0gkit/pull/54) (pre-session), **K1 [#56](https://github.com/rajkaria/0gkit/pull/56)** (`ai-oracle`, `sealed-inference`, `prediction-market`→composes ai-oracle), **K2 [#57](https://github.com/rajkaria/0gkit/pull/57)** (`durable-agent`, `live-feed`), **K3 [#58](https://github.com/rajkaria/0gkit/pull/58)** (`inft-studio`, `yield-intel`), **K4 [#59](https://github.com/rajkaria/0gkit/pull/59)** (all 8 kit docs + `/kits` index + authoring guide + landing GTM page + CI gates). main HEAD `dbf45c5`; `kits:check` 27/27; full gate green on every merge.

**⏸ ONLY remaining K4 step = the npm PUBLISH (T6) — PAUSED pending Raj (genuine blocker).** (1) npm publish is outward-facing/irreversible → needs go-ahead; (2) `NPM_TOKEN` may be expired (last publish 2026-06-01) — Raj must verify/rotate the GitHub secret (I cannot); (3) version-packages PR [#55](https://github.com/rajkaria/0gkit/pull/55) is **stale** (predates today's K1–K3 changesets) + inconsistent (kits/cli→1.6.0, core stays 1.5.0) → regenerate (re-run `release.yml` on main / close+reopen #55) and review the version story before merging. `release.yml` (changesets/action) publishes when #55 is merged + token set. The 4 changesets (kits-engine/verifiable-ai/durability/assets-defi) are on main. `0gkit-kits` debuts at whatever #55 sets (currently 1.6.0, joining the linked group).

**K5–K11 (7 sprints) NOT started.** All plans "ready" on 0gkit main. Working dir `0G-ai-kit` currently on merged branches; next branch off main.

### Recent Changes (this session — 2026-07-01: executed Kits epic K1–K4 via subagent-driven-development)

- **Ran the full SDD loop per sprint** (fresh implementer → task review → fix → re-review → Opus whole-branch review → squash-merge on green CI). Verified ground truth in-repo after every subagent (caught a background agent that stalled, an uncommitted regenerated registry, etc.). Epic + per-sprint ledgers at `0G-ai-kit/.superpowers/sdd/{epic-progress,progress}.md` + per-sprint shared-contexts/briefs (gitignored, durable).
- **K1 #56** — 3 kits; **made `kits:check` composition-aware** (`scripts/check-kits.mjs` — `makeLocalFetchOverlay` resolves the kit name, `runKitIsolatedTsc` pulls composed libs) so `prediction-market`→`ai-oracle` is matrix-tested. Whole-branch review caught **fabricated API names in docs prose** (`signEnvelope`/`verifyEnvelope` — not used) → corrected to the real mechanism before merge.
- **K2 #57** — `durable-agent` first impl **faked durability** (in-process Maps, zero `0gkit-jobs`) → controller caught it → rewired to real `JobRunner`+`MemoryBackend`+`jobs.define` + step ledger persisted to **0G Storage**. `live-feed` reorg-safety honestly env-gated (`OG_FEED_CONTRACT_ADDRESS`, else labeled storage-only). Fixed a UI orphan-flash dead path from review.
- **K3 #58** — `inft-studio`: ships mintable `Inft.sol` (standard `Erc721Abi` has **no** `mint`), real `tokenId` from the on-chain `Minted` event (not the write receipt), added missing `tokens`/`verify` endpoints. `yield-intel`: **execution-free** (negative API-surface test — no execute/trade/swap), testnet-default, non-removable DemoBanner. Honesty audit clean.
- **K4 #59** — filled 8 per-kit doc pages + `/kits` index + nav + `docs/kits/AUTHORING.md` + authoring page; landing `/kits` GTM page + `KitsShowcase` with an honestly-sourced comparison; LHCI `/kits` routes.
- **This CLAUDE.md** update (Foundryprotocol worktree).

### Next Steps

1. **Publish (K4/T6) — needs Raj.** Verify/rotate `NPM_TOKEN` (GitHub secret). Regenerate the stale version-packages PR [#55](https://github.com/rajkaria/0gkit/pull/55) (re-run `release.yml` on main, or close+reopen) so it reflects all 4 kits changesets; review the version story (currently `0gkit-kits`/`cli`→1.6.0, `core`→1.5.0); **merge #55** → `release.yml` publishes. Confirm `0gkit-kits`'s debut version. Verify `npm view @foundryprotocol/0gkit-kits version`; smoke `npm create 0gkit-app -- --kits prediction-market` on a clean machine.
2. **Execute K5–K11** via `superpowers:subagent-driven-development` (branch each off main; whole-branch review + squash-merge). Order: K5 `doctor --fix`+`0g test` → K6 `mcp init` → K7 Compute Router (research-gated) → K8 `contracts import` → K9 Foundry SDK refresh (**cross-repo** `rajkaria/foundry`) → K10 showcase app → K11 community. Plans: `0G-ai-kit/docs/superpowers/plans/2026-06-30-k{5..11}-*.md`; roadmap `…-kits-epic-roadmap.md`. Resume from `0G-ai-kit/.superpowers/sdd/epic-progress.md`.
3. **Kits minor follow-ups** (recorded, non-blocking): ship `live-feed` `FeedEvents.sol` for end-to-end reorg-safety; wire/drop `Inft.sol` dead `mintWithProvenance`; migrate Storage `privateKey`→`signer` repo-wide; `durable-agent` persistent root pointer for full cold-start resume. Plus prior K0 minors (engine `files` list, `appendEnv` escaping, mutable `KITS`, applyKit partial-write).

### Key Decisions (this session)

- **D84 (kit deps convention)** — every kit uses `requires:[]` and self-supplies its `@foundryprotocol/0gkit-*` deps via `dependencies` (the plans' `requires` lists were incompatible with their own `compatibleBases`; matches the K0 `agent-memory` precedent). A declared `compatibleBase` MUST ship a real adapter (no lib-only bases). ABIs live as **lib tier files** so adapters can import them post-apply.
- **D85 (composition-aware `kits:check`)** — `scripts/check-kits.mjs` (test harness, NOT the engine) made composition-aware so a composing kit's matrix check writes + type-checks its composed kits' files. `prediction-market`→`ai-oracle` has a non-tautological CI composition test in the engine pkg.
- **D86 (durable-agent real durability)** — first impl faked it (in-process Maps, no `0gkit-jobs`); real fix = `JobRunner`+`MemoryBackend`+`jobs.define` + the **step ledger persisted to 0G Storage** (survives restart; in-process root-pointer cache is a documented cache, same caveat as `agent-memory`). OTel spans real on `tee-attested-api`, documented noop elsewhere (harness can't resolve `@opentelemetry/api` on non-tee bases).
- **D87 (live-feed honest reorg)** — real `Indexer`+`onReorg` gated on `OG_FEED_CONTRACT_ADDRESS`; without it, clearly-labeled storage-only mode (`reorgSafetyActive:false`) — no fabricated reorg-safety claim.
- **D88 (inft-studio mint)** — standard `Erc721Abi` has **no `mint`**, so the kit ships a mintable `Inft.sol`+`INFT_ABI`; `tokenId` read from the on-chain `Minted` event (the `createTypedContract().write` receipt carries no return value/logs) — throws rather than fabricating.
- **D89 (yield-intel honesty, load-bearing)** — public API is `analyze`+`logDecision` ONLY; a negative test asserts no `execute`/`trade`/`swap`/`send`/`transfer`; testnet-default (`OG_NETWORK=galileo`); non-removable `DemoBanner`; no profit/guarantee copy. Deliberately no auto-trader.
- **D90 (publish, PENDING Raj)** — `0gkit-kits` debuts on npm joining the linked group (version-packages PR #55 sets 1.6.0). Publish PAUSED: npm publish is outward-facing + `NPM_TOKEN` needs Raj's verify/rotate + #55 is stale and needs regeneration/review first.
- **Process win (reaffirmed 3×)** — the whole-branch Opus review + controller ground-truth verification caught integration-seam defects that green per-task gates missed (fake durability, fabricated `tokenId`, fabricated API names in docs). Always verify a plan's pseudocode against real exports first; run the COMPLETE gate.

#### Prior session (2026-06-01) — defect-report shipped + 0gkit 1.5.0 published

`buildDefectReport()`/`suggestOwnership()`/`suggestSeverity()` in `0gkit-core` + `--defect-report` CLI flag (PR [#52](https://github.com/rajkaria/0gkit/pull/52), `006e514`). Published all 18 `@foundryprotocol/0gkit-*` at **1.5.0** (via merging stale version-packages PR #51 + rotating an expired `NPM_TOKEN`). Goodwill PR [lvxuan149/0g-apac-app-test#1](https://github.com/lvxuan149/0g-apac-app-test/pull/1) (P1–P4 severity rubric + YAML defect template; 0gkit auto-emit section dropped pending real QA). Decisions D74–D76.

### Recent Session History (most-recent first; full detail in git history)

- **2026-07-01 10:15 IST — Kits epic K1–K4 executed + merged (8 kits live)** — ran the full subagent-driven-development loop for K1–K4, squash-merging PRs #56/#57/#58/#59 on green CI after per-task + Opus whole-branch reviews. Delivered `ai-oracle`/`sealed-inference`/`prediction-market` (K1), `durable-agent`/`live-feed` (K2), `inft-studio`/`yield-intel` (K3), and all kit docs + `/kits` index + authoring guide + landing GTM + CI (K4). Controller verification caught real integration-seam defects (fake `durable-agent` durability → real 0gkit-jobs+Storage; fabricated `inft-studio` tokenId → on-chain Minted event; fabricated docs API names). Made `kits:check` composition-aware. **K4/T6 npm publish PAUSED pending Raj** (NPM_TOKEN + stale version-PR #55). K5–K11 not started. Decisions D84–D90.
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
- **D84–D90 (K1–K4 execution)** — kits use `requires:[]`+self-supplied deps, every declared base ships a real adapter, ABIs are lib-tier files (D84); `kits:check` made composition-aware in `scripts/check-kits.mjs` (D85); durable-agent step ledger persists to 0G Storage + real `0gkit-jobs` wiring (D86); live-feed reorg-safety env-gated + honestly labeled (D87); inft-studio ships mintable `Inft.sol` (std ERC-721 has no `mint`), tokenId from on-chain `Minted` event (D88); yield-intel is execution-free (negative-tested), testnet-default, non-removable DemoBanner (D89); `0gkit-kits` debut publish joins the linked group @1.6.0 but is PAUSED pending NPM_TOKEN + version-PR #55 review (D90).

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
