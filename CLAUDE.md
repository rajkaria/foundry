# Foundry Protocol — Claude Code session context

Repo: `rajkaria/foundry` · Domain: `foundryprotocol.xyz` · Default branch: `main`
0gkit toolkit: `rajkaria/0gkit` · Domain: `0gkit.com` · Local working dir: `/Users/rajkaria/Projects/0G-ai-kit/`

## Always-on rules for this project

- **Squash-merge own PRs** after CI passes; never leave open as a review gate.
- Commit/push/merge every change without per-change approval; no narration between tool calls.
- Honesty rule: never fabricate endpoints/behaviors; stubbed/unverified things must be labeled as such.
- **0gkit neutrality is a hard invariant:** no `@0gkit/*` package may statically depend on `@foundryprotocol/*` app packages. Enforced in CI by `pnpm boundary:check` (now also scans `templates/_kits`).
- **`/save-context` REPLACES the latest-session section below — do not append.** Older session detail lives in git history (`git log` on this file).

## Session Context (Last updated: 2026-07-01 22:55 IST)

### Current State

**Kits epic K10 + K11 shipped & merged; docs/landing fully refreshed. The Kits epic K0–K11 is now COMPLETE except K9 (the one cross-repo sprint).** This session finished K11 (community), K10 (showcase app), and a full 0gkit.com docs+landing refresh — 4 PRs, all squash-merged to `rajkaria/0gkit` main. **K9 is the only remaining sprint.**

- **K11 (Community)** — PR [#73](https://github.com/rajkaria/0gkit/pull/73). Idempotent `scripts/setup-discussions.sh` (seeds welcome posts into existing categories, prints UI-only steps), `docs/community/` seed bodies (`HOW_TO_ASK.md` + `seeds/*.md`), `.github/DISCUSSION_TEMPLATE/{q-and-a,show-your-kit}.yml`, landing Footer "Show your kit" link, README Community section. **Ran the seed LIVE:** Q&A [#70](https://github.com/rajkaria/0gkit/discussions/70), Show-and-tell [#71](https://github.com/rajkaria/0gkit/discussions/71), Ideas [#72](https://github.com/rajkaria/0gkit/discussions/72). Decisions **D94–D95**.
- **Docs + landing refresh** — PR [#74](https://github.com/rajkaria/0gkit/pull/74). CLI reference (`apps/docs/app/cli/page.mdx`) gained every missing command (`0g test`, `doctor --fix`, `dev`, `contracts`, `estimate`, `kits`, `jobs`, `mcp init`), all source-grounded. **Runnable `## Quick start` on all 7 kit pages** (agent-memory/ai-oracle/sealed-inference/durable-agent/prediction-market/live-feed/yield-intel), each verified against real kit `lib/` exports. Fixed stale prose (agent-memory Tiers `appendMemory`→`createMemory`; yield-intel `Compute.inference`→`compute.router()`), landing CodeSamples `inference()`→`router()`, added `ROUTER_API_KEY` to getting-started.
- **K10 (Showcase)** — PR [#75](https://github.com/rajkaria/0gkit/pull/75). `showcase/0gkit-status/` — live 0G network dashboard on **published** `@foundryprotocol/0gkit-*@^1.x` (outside the pnpm workspace; mirrors D24), composed from `agent-memory` + `live-feed` kit `lib/` overlays, `Compute.router()` AI summary, `0g test` CI gate. `next build` green + runtime-smoke verified against **live galileo** (chainId 16602, block ~41.6M). Honest keyless degradation — network panel always live, keyed features show "configure X" not fabricated numbers. Decisions **D96–D97**.
- **Roadmap** — PR [#76](https://github.com/rajkaria/0gkit/pull/76): K10 + K11 marked done.

**Two manual handoffs (no API/tool can do these):**

1. **K11:** create **RFCs** + **Show your kit** Discussion categories in the repo UI (Discussions → Edit categories → New category, Open-ended format), then re-run `bash scripts/setup-discussions.sh` to seed them; pin [#70](https://github.com/rajkaria/0gkit/discussions/70) (⋯ → Pin). GitHub API has NO `createDiscussionCategory`/`pinDiscussion` mutation (D95).
2. **K10:** create a Vercel project with **Root Directory = `showcase/0gkit-status`** (env optional per `.env.example`), map `apps.0gkit.com`, then swap the TrustSignals href from the GitHub source to the live URL. The Vercel MCP `deploy_to_vercel` is parameterless and can't target a subdirectory safely (D97).

### Next Steps

1. **K9 next** (`@foundryprotocol/sdk` refresh → thin adapter over published `0gkit-* ^1.x`, bump to 1.1.0 — **cross-repo, in the Foundryprotocol repo**). This is the LAST Kits-epic sprint. Roadmap: `docs/superpowers/plans/2026-06-30-kits-epic-roadmap.md` (K0–K8, K10, K11 done; K9 the only "ready" row). **Reality-check the plan against the real `@foundryprotocol/sdk` `storage.ts`/`attestation.ts`/`da.ts` surface + current `0gkit-storage`/`0gkit-attestation` exports before coding** (every recent plan had ≥2 fictional assumptions the research gate caught — incl. K10, where the plan's scaffold command was actually FINE and my own wrong-name npm query was the fiction; see D97). A storage-adapter draft from a prior session transcript exists — lift it as the T2 start but verify against the current `0gkit-storage` surface first. K9 only adds Foundry → `0gkit-*` deps (allowed direction; neutrality unaffected).
2. **K10 follow-ups (Minor):** (a) deploy + wire the live `apps.0gkit.com` URL into `apps/landing/components/TrustSignals.tsx` (currently links the GitHub source); (b) the showcase's `.github/workflows/ci.yml` only runs when the app is its own repo (monorepo doesn't build it — it's out-of-workspace); (c) keyless pins/feed are in-memory (honest note) — a keyed deploy exercises the real 0G Storage path.
3. **K11 follow-ups (Minor):** after creating the 2 UI categories, the footer/README/docs already point at the right slugs (`rfcs`, `show-your-kit`).
4. **Docs follow-ups (Minor):** none outstanding — the audit's other flagged items were verified already-correct (18-package count, compute concept page, contracts `fetchExplorerAbi`, testing `--kits`).

### Key Decisions (this session — K11 D94–D95, K10 D96–D97)

- **D94 (K11)** — Community surface = GitHub Discussions (Q&A / Show and tell / Ideas / RFCs / Show your kit) + landing footer; Discord deferred; no paid tiers. Seed bodies in `docs/community/`; `setup-discussions.sh` is the runbook. "Show your kit" is the K4-authoring funnel.
- **D95 (K11)** — Discussion **categories and pins are UI-only** (introspection-confirmed: no `createDiscussionCategory`/`pinDiscussion` mutation; only `pinIssue`/`pinIssueComment`/`pinEnvironment`). The seed script seeds into existing categories idempotently and prints the two UI-only steps. Support routes through `--copy-issue-context` (SP15).
- **D96 (K10)** — `0gkit-status` consumes published `@foundryprotocol/0gkit-*@^1.x`, lives outside the workspace (mirrors D24), and is composed from the `agent-memory` + `live-feed` kits — the epic's dogfood. Network panel reads real galileo; keyed features degrade honestly (never a fabricated number).
- **D97 (K10)** — The showcase is **hand-authored by choice** (bespoke network panel + control), not because the scaffolder is broken: `create-0gkit-app@1.1.0` (unscoped; D12) IS published with `--kits` — a mid-session wrong-name npm query (`@foundryprotocol/create-0gkit-app`, scoped) falsely suggested a 404. Verify npm with the exact unscoped name. Subdirectory deploys need an explicit Vercel Root Directory, not the parameterless MCP deploy.

### Recent Session History (most-recent first; full detail in git history)

- **2026-07-01 22:55 IST — ship K11 + K10 + full docs/landing refresh (4 PRs merged).** K11 (#73, seeded Discussions live) → docs/landing refresh (#74, full CLI ref + 7 kit Quick-starts + router/env fixes) → K10 (#75, `showcase/0gkit-status` composed from kits on published packages, build+runtime verified against live galileo) → roadmap (#76). Two manual handoffs remain (K11 UI categories/pin; K10 Vercel deploy). Verify-before-asserting caught real plan fictions AND this session's own false "scaffolder broken" claim. Decisions D94–D97.
- **2026-07-01 17:35 IST — ship+publish K8 (`0g contracts import`).** ChainScan `/open/api` verified-ABI → SP4 codegen; typed `ConfigError` on any failure. PRs #67→#68→#69 → published contracts/cli/indexer/react @1.10.0. D92–D93.
- **2026-07-01 16:15 IST — ship+publish K7 (`Compute.router()`).** Real 0G Router endpoint + honest client-side fallback; templates + 14 kit adapters default to `router()`. PR #64 → published compute/cli/mcp @1.9.0. D89–D91.
- **2026-07-01 14:50 IST — ship+publish K6 (`0g mcp init`) + fix latent K0 bug.** PR #62 → published mcp/kits/cli @1.8.0. D87–D88.
- **2026-07-01 12:55 IST — publish Kits epic + ship+publish K5.** PR #60 → published cli/testing/kits @1.7.0. D84–D86.
- **2026-06-30 — K0–K4 (Kits engine + kits) built + merged.** D77–D83.
- **2026-05-27 → 2026-05-20 — SP1–SP16 + v1.0.0.** D8–D73. Full detail in git history.

### Key Architectural Decisions (still load-bearing — full list in `docs/DECISIONS.md` on 0gkit repo, current through D97)

- **D10** — No mainnet timing dependency; galileo + local devnet always work.
- **D12** — Canonical scaffolder is **`create-0gkit-app`** (unscoped, published @1.1.0 with `--kits`); `create-0g-app` is the legacy/private name. **Query npm with the exact unscoped name.**
- **D13** — Repo `rajkaria/0gkit`; no rename of published surfaces (additive only). Local working dir `/Users/rajkaria/Projects/0G-ai-kit/`.
- **D24** — `templates/*`, `templates/_kits/*`, and `showcase/*` are **not** in `pnpm-workspace.yaml` (globs are `apps/*` + `packages/*`); they consume published packages like a real user.
- **D39** — CLI lazy-loads heavy/optional deps via computed-specifier dynamic import (cold-start budget; CI-verified by `0g --help cold-start`).
- **D77–D80 (Kits engine)** — git-overlay kits; engine `@foundryprotocol/*`-app-free (neutrality); 3-tier lib/adapters/ui; composition deps-first/deduped/cycle-safe.
- **D89–D91 (K7)** — `Compute.router()` wires the real 0G Router when configured, else honest client-side selection; `router()`/`direct()` additive + optional per-call `prefer` pin; templates + compute-kits default to `router()`.
- **D92–D93 (K8)** — `0g contracts import` reuses SP4 codegen (only new surface `fetchExplorerAbi`); explorer fetch hits ChainScan `/open/api` (Etherscan-compat, keyless), never fabricates.
- **D94–D95 (K11)** — Community = Discussions + footer; categories/pins are UI-only (no API mutation); support via `--copy-issue-context`.
- **D96–D97 (K10)** — `0gkit-status` showcase = published packages, out-of-workspace, composed from kits; hand-authored by choice; subdirectory deploy needs an explicit Vercel root.

### Pointers

- **Kits epic:** spec `docs/superpowers/specs/2026-06-30-0gkit-kits-design.md`; plans `docs/superpowers/plans/2026-06-30-k{0..11}-*.md`; roadmap `…/2026-06-30-kits-epic-roadmap.md` (K0–K8, K10, K11 done; **K9 next**). These live in the **0gkit repo** (`/Users/rajkaria/Projects/0G-ai-kit/docs/superpowers/`).
- **Showcase app:** `showcase/0gkit-status/` on the 0gkit repo — `next build`-green, deploy-ready (`vercel.json`, `.env.example`), NOT yet deployed.
- **Decisions log:** `docs/DECISIONS.md` on 0gkit repo (current through D97).
- **Publish:** Changesets `release.yml` on push to `main` — pending changesets ⇒ version PR; merge it to publish. K10/K11 shipped **no** published-package change (no changesets). `NPM_TOKEN` secret refreshed 2026-07-01. Gotchas in memory `project_0gkit_publish_gotchas`.
- **Deployer/seed key:** sibling worktree `sad-jemison-e5dba7/.env`; deployer `0x4f18…CfE8`.
- **Memory:** `/Users/rajkaria/.claude/projects/-Users-rajkaria-Projects-Foundryprotocol/memory/MEMORY.md`.

### Workflow reminders

- Plan-already-written → **reality-check it against real exports/tooling first** (the recurring lesson — K10 even caught a self-inflicted wrong-name npm query, D97), then execute via `superpowers:subagent-driven-development` (or TDD inline for micro-sprints) → squash-merge after CI green. **Always run the final whole-branch review** (most-capable model) even when per-task gates are green.
- **`format:check` runs `prettier --check "**/\*"`** across the whole repo incl. `showcase/`and`docs/superpowers/` — a latent unformatted file (e.g. the roadmap table after a wide-cell edit) fails CI. Run prettier on every changed file before pushing.
- `gh pr merge --squash --delete-branch` (auto-merge disabled). Publishing = merge the Changesets version-packages PR. **Pull `main` before branching a follow-up.**
- All Kits sprints land on `rajkaria/0gkit`. **K9 (Foundry SDK refresh) is the one cross-repo sprint (lands in the Foundryprotocol repo).**
