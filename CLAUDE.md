# Foundry Protocol — Claude Code session context

Repo: `rajkaria/foundry` · Domain: `foundryprotocol.xyz` · Default branch: `main`
0gkit toolkit: `rajkaria/0gkit` · Domain: `0gkit.com` · Local working dir: `/Users/rajkaria/Projects/0G-ai-kit/`

## Always-on rules for this project

- **Squash-merge own PRs** after CI passes; never leave open as a review gate.
- Commit/push/merge every change without per-change approval; no narration between tool calls.
- Honesty rule: never fabricate endpoints/behaviors; stubbed/unverified things must be labeled as such.
- **0gkit neutrality is a hard invariant:** no `@0gkit/*` package may statically depend on `@foundryprotocol/*` app packages. Enforced in CI by `pnpm boundary:check` (now also scans `templates/_kits`).
- **`/save-context` REPLACES the latest-session section below — do not append.** Older session detail lives in git history (`git log` on this file).

## Session Context (Last updated: 2026-07-02 00:00 IST)

### Current State

**Kits UX + community-authoring session shipped & published.** Made kits first-class on 0gkit.com and opened the catalog to community contributions — a "skills repo for 0G". 2 PRs squash-merged to `rajkaria/0gkit` main; **`@foundryprotocol/0gkit-cli@1.11.0` published to npm** (new `0g kits new`). This was an ad-hoc UX task, **not** part of the K0–K11 epic — **K9 (Foundry SDK refresh) is still the only remaining epic sprint.**

- **Feature PR** [#77](https://github.com/rajkaria/0gkit/pull/77) (squash-merged):
  - **Prominence** — home page gains `apps/landing/components/KitsHighlight.tsx` (6 clickable featured kits + "Browse all kits"/"Publish your own kit" CTAs) after ValueProps; highlighted **Kits** nav link.
  - **Clickable cards (bugfix)** — kit cards were plain `<div>`s (dead click). New shared `apps/landing/components/KitCard.tsx` links to `docs.0gkit.com/kits/<slug>` with "View kit →" + focus ring; data centralized in `apps/landing/lib/kits.ts`. Fixed stale `/kits` hero pill; added Publish-your-own CTA.
  - **`0g kits new <name>` scaffolder** — `packages/0gkit-cli/src/commands/kit-scaffold.ts` (pure `buildKitScaffold`) + wired in `commands/kits.ts`. Generates registry-valid `kit.json` + DI portable lib + per-base adapters + optional React UI + (in-repo) docs stub; prints catalog-PR runbook. 17 unit tests (`__tests__/kit-scaffold.test.ts`).
  - **Docs** — rewrote `apps/docs/app/kits/authoring/page.mdx` + `docs/kits/AUTHORING.md` into "Build & publish a kit" (scaffolder-first); nav label updated.
  - **Premium polish** — landing `.card-link` (lift+glow+animated arrow) in `globals.css`; docs theme (page glow, topbar, sidebar active gradient, code-block depth + brand hairline, focus ring) in `apps/docs/app/globals.css`.
- **Release PR** [#78](https://github.com/rajkaria/0gkit/pull/78) (squash-merged) → Release workflow green → **npm `0gkit-cli@1.11.0` live** (confirmed `npm view`).

**Verification done:** build 23/23, `kits:check` 27/27, `0gkit-cli` 190 tests, format/boundary/docs:check/typecheck all green; **real on-disk `0g kits new` smoke + validation against the actual `KitManifestSchema`**; browser screenshots of home kits, `/kits` cards, AuthorKitCTA, and the docs authoring page (no console errors).

**Prior epic handoffs still open (unchanged this session):**
1. **K11:** create **RFCs** + **Show your kit** Discussion categories in the repo UI, re-run `bash scripts/setup-discussions.sh`, pin [#70](https://github.com/rajkaria/0gkit/discussions/70). No `createDiscussionCategory`/`pinDiscussion` API (D95).
2. **K10:** create a Vercel project with **Root Directory = `showcase/0gkit-status`**, map `apps.0gkit.com`, swap the TrustSignals href to the live URL (D97).

### Next Steps

0. **Kits-UX follow-ups (Minor, optional):** the `0g kits new` scaffolder templates were verified via unit tests + on-disk smoke + real-schema parse, but NOT added to the `templates/_kits/` matrix (by design — it's a user scaffolder, not a catalog kit). If you later ship a real community kit, run it through `pnpm kits:check`. Landing kit cards link to `docs.0gkit.com/kits/<slug>` (absolute, cross-subdomain) — correct since landing/docs are separate deploys.
1. **K9 next** (`@foundryprotocol/sdk` refresh → thin adapter over published `0gkit-* ^1.x`, bump to 1.1.0 — **cross-repo, in the Foundryprotocol repo**). This is the LAST Kits-epic sprint. Roadmap: `docs/superpowers/plans/2026-06-30-kits-epic-roadmap.md` (K0–K8, K10, K11 done; K9 the only "ready" row). **Reality-check the plan against the real `@foundryprotocol/sdk` `storage.ts`/`attestation.ts`/`da.ts` surface + current `0gkit-storage`/`0gkit-attestation` exports before coding** (every recent plan had ≥2 fictional assumptions the research gate caught — incl. K10, where the plan's scaffold command was actually FINE and my own wrong-name npm query was the fiction; see D97). A storage-adapter draft from a prior session transcript exists — lift it as the T2 start but verify against the current `0gkit-storage` surface first. K9 only adds Foundry → `0gkit-*` deps (allowed direction; neutrality unaffected).
2. **K10 follow-ups (Minor):** (a) deploy + wire the live `apps.0gkit.com` URL into `apps/landing/components/TrustSignals.tsx` (currently links the GitHub source); (b) the showcase's `.github/workflows/ci.yml` only runs when the app is its own repo (monorepo doesn't build it — it's out-of-workspace); (c) keyless pins/feed are in-memory (honest note) — a keyed deploy exercises the real 0G Storage path.
3. **K11 follow-ups (Minor):** after creating the 2 UI categories, the footer/README/docs already point at the right slugs (`rfcs`, `show-your-kit`).
4. **Docs follow-ups (Minor):** none outstanding — the audit's other flagged items were verified already-correct (18-package count, compute concept page, contracts `fetchExplorerAbi`, testing `--kits`).

### Key Decisions (this session — kits UX D98–D99)

- **D98 (kit authoring)** — Community-kit distribution = **catalog-PR**, not a decentralized registry. `0g kits new <name>` (in the `0g` CLI, flag-driven, unit-testable — the long-term-best home vs a separate `create-0gkit-kit` package) scaffolds a valid kit locally; publish = PR into `rajkaria/0gkit` `templates/_kits/` so it's CI-gated and instantly available via `0g add`. `kit-scaffold.ts` **duplicates** `KIT_DOMAINS`/`REACT_BASES` (does NOT import `@foundryprotocol/0gkit-kits`) to preserve the D39 cold-start constraint (`0g --help cold-start` CI stayed green).
- **D99 (kits UX/premium)** — Kit cards are shared `KitCard` anchors → `docs.0gkit.com/kits/<slug>` (absolute; landing+docs are separate deploys). Kit catalog data centralized in `apps/landing/lib/kits.ts`. Premium = tasteful refinement of the existing dark/purple system (`.card-link` interactive treatment, docs page-glow/code-depth), NOT a rebrand.
- **D94 (K11)** — Community surface = GitHub Discussions (Q&A / Show and tell / Ideas / RFCs / Show your kit) + landing footer; Discord deferred; no paid tiers. Seed bodies in `docs/community/`; `setup-discussions.sh` is the runbook. "Show your kit" is the K4-authoring funnel.
- **D95 (K11)** — Discussion **categories and pins are UI-only** (introspection-confirmed: no `createDiscussionCategory`/`pinDiscussion` mutation; only `pinIssue`/`pinIssueComment`/`pinEnvironment`). The seed script seeds into existing categories idempotently and prints the two UI-only steps. Support routes through `--copy-issue-context` (SP15).
- **D96 (K10)** — `0gkit-status` consumes published `@foundryprotocol/0gkit-*@^1.x`, lives outside the workspace (mirrors D24), and is composed from the `agent-memory` + `live-feed` kits — the epic's dogfood. Network panel reads real galileo; keyed features degrade honestly (never a fabricated number).
- **D97 (K10)** — The showcase is **hand-authored by choice** (bespoke network panel + control), not because the scaffolder is broken: `create-0gkit-app@1.1.0` (unscoped; D12) IS published with `--kits` — a mid-session wrong-name npm query (`@foundryprotocol/create-0gkit-app`, scoped) falsely suggested a 404. Verify npm with the exact unscoped name. Subdirectory deploys need an explicit Vercel Root Directory, not the parameterless MCP deploy.

### Recent Session History (most-recent first; full detail in git history)

- **2026-07-02 00:00 IST — kits UX + community authoring (2 PRs merged, published @1.11.0).** Ad-hoc (not epic). PR [#77](https://github.com/rajkaria/0gkit/pull/77): home `KitsHighlight` + Kits nav link, clickable `KitCard`→docs (dead-click bugfix), **`0g kits new` scaffolder** (`kit-scaffold.ts`, 17 TDD tests), "Build & publish a kit" docs rewrite, landing `.card-link` + docs theme premium polish. PR [#78](https://github.com/rajkaria/0gkit/pull/78) → Release green → **npm `0gkit-cli@1.11.0`**. All gates green + on-disk scaffolder smoke + screenshots. D98–D99.
- **2026-07-01 22:55 IST — ship K11 + K10 + full docs/landing refresh (4 PRs merged).** K11 (#73, seeded Discussions live) → docs/landing refresh (#74, full CLI ref + 7 kit Quick-starts + router/env fixes) → K10 (#75, `showcase/0gkit-status` composed from kits on published packages, build+runtime verified against live galileo) → roadmap (#76). Two manual handoffs remain (K11 UI categories/pin; K10 Vercel deploy). Verify-before-asserting caught real plan fictions AND this session's own false "scaffolder broken" claim. Decisions D94–D97.
- **2026-07-01 17:35 IST — ship+publish K8 (`0g contracts import`).** ChainScan `/open/api` verified-ABI → SP4 codegen; typed `ConfigError` on any failure. PRs #67→#68→#69 → published contracts/cli/indexer/react @1.10.0. D92–D93.
- **2026-07-01 16:15 IST — ship+publish K7 (`Compute.router()`).** Real 0G Router endpoint + honest client-side fallback; templates + 14 kit adapters default to `router()`. PR #64 → published compute/cli/mcp @1.9.0. D89–D91.
- **2026-07-01 14:50 IST — ship+publish K6 (`0g mcp init`) + fix latent K0 bug.** PR #62 → published mcp/kits/cli @1.8.0. D87–D88.
- **2026-07-01 12:55 IST — publish Kits epic + ship+publish K5.** PR #60 → published cli/testing/kits @1.7.0. D84–D86.
- **2026-06-30 — K0–K4 (Kits engine + kits) built + merged.** D77–D83.
- **2026-05-27 → 2026-05-20 — SP1–SP16 + v1.0.0.** D8–D73. Full detail in git history.

### Key Architectural Decisions (still load-bearing — full list in `docs/DECISIONS.md` on 0gkit repo, current through D99)

- **D10** — No mainnet timing dependency; galileo + local devnet always work.
- **D12** — Canonical scaffolder is **`create-0gkit-app`** (unscoped, published @1.1.0 with `--kits`); `create-0g-app` is the legacy/private name. **Query npm with the exact unscoped name.**
- **D13** — Repo `rajkaria/0gkit`; no rename of published surfaces (additive only). Local working dir `/Users/rajkaria/Projects/0G-ai-kit/`.
- **D24** — `templates/*`, `templates/_kits/*`, and `showcase/*` are **not** in `pnpm-workspace.yaml` (globs are `apps/*` + `packages/*`); they consume published packages like a real user.
- **D39** — CLI lazy-loads heavy/optional deps via computed-specifier dynamic import (cold-start budget; CI-verified by `0g --help cold-start`).
- **D77–D80 (Kits engine)** — git-overlay kits; engine `@foundryprotocol/*`-app-free (neutrality); 3-tier lib/adapters/ui; composition deps-first/deduped/cycle-safe.
- **D89–D91 (K7)** — `Compute.router()` wires the real 0G Router when configured, else honest client-side selection; `router()`/`direct()` additive + optional per-call `prefer` pin; templates + compute-kits default to `router()`.
- **D92–D93 (K8)** — `0g contracts import` reuses SP4 codegen (only new surface `fetchExplorerAbi`); explorer fetch hits ChainScan `/open/api` (Etherscan-compat, keyless), never fabricates.
- **D94–D95 (K11)** — Community = Discussions + footer; categories/pins are UI-only (no API mutation); support via `--copy-issue-context`.
- **D98–D99 (kits UX)** — Community kits via `0g kits new` scaffolder + catalog-PR (no registry; CLI stays D39-cold-start-safe by duplicating enums); kit cards are shared `KitCard` anchors → docs; premium = refine existing system, not rebrand.
- **D96–D97 (K10)** — `0gkit-status` showcase = published packages, out-of-workspace, composed from kits; hand-authored by choice; subdirectory deploy needs an explicit Vercel root.

### Pointers

- **Kits epic:** spec `docs/superpowers/specs/2026-06-30-0gkit-kits-design.md`; plans `docs/superpowers/plans/2026-06-30-k{0..11}-*.md`; roadmap `…/2026-06-30-kits-epic-roadmap.md` (K0–K8, K10, K11 done; **K9 next**). These live in the **0gkit repo** (`/Users/rajkaria/Projects/0G-ai-kit/docs/superpowers/`).
- **Showcase app:** `showcase/0gkit-status/` on the 0gkit repo — `next build`-green, deploy-ready (`vercel.json`, `.env.example`), NOT yet deployed.
- **Decisions log:** `docs/DECISIONS.md` on 0gkit repo (current through D99).
- **Publish:** Changesets `release.yml` on push to `main` — pending changesets ⇒ version PR; merge it to publish. K10/K11 shipped **no** published-package change (no changesets). `NPM_TOKEN` secret refreshed 2026-07-01. Gotchas in memory `project_0gkit_publish_gotchas`.
- **Deployer/seed key:** sibling worktree `sad-jemison-e5dba7/.env`; deployer `0x4f18…CfE8`.
- **Memory:** `/Users/rajkaria/.claude/projects/-Users-rajkaria-Projects-Foundryprotocol/memory/MEMORY.md`.

### Workflow reminders

- Plan-already-written → **reality-check it against real exports/tooling first** (the recurring lesson — K10 even caught a self-inflicted wrong-name npm query, D97), then execute via `superpowers:subagent-driven-development` (or TDD inline for micro-sprints) → squash-merge after CI green. **Always run the final whole-branch review** (most-capable model) even when per-task gates are green.
- **`format:check` runs `prettier --check "**/*"`** across the whole repo incl. `showcase/` and `docs/superpowers/` — a latent unformatted file (e.g. the roadmap table after a wide-cell edit) fails CI. Run prettier on every changed file before pushing.
- `gh pr merge --squash --delete-branch` (auto-merge disabled). Publishing = merge the Changesets version-packages PR. **Pull `main` before branching a follow-up.**
- All Kits sprints land on `rajkaria/0gkit`. **K9 (Foundry SDK refresh) is the one cross-repo sprint (lands in the Foundryprotocol repo).**
