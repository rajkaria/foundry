# Foundry Protocol — Claude Code session context

Repo: `rajkaria/foundry` · Domain: `foundryprotocol.xyz` · Default branch: `main`
0gkit toolkit: `rajkaria/0gkit` · Domain: `0gkit.com` · Local working dir: `/Users/rajkaria/Projects/0G-ai-kit/`

## Always-on rules for this project

- **Squash-merge own PRs** after CI passes; never leave open as a review gate.
- Commit/push/merge every change without per-change approval; no narration between tool calls.
- Honesty rule: never fabricate endpoints/behaviors; stubbed/unverified things must be labeled as such.
- **0gkit neutrality is a hard invariant:** no `@0gkit/*` package may statically depend on `@foundryprotocol/*` app packages. Enforced in CI by `pnpm boundary:check` (now also scans `templates/_kits`).
- **`/save-context` REPLACES the latest-session section below — do not append.** Older session detail lives in git history (`git log` on this file).

## Session Context (Last updated: 2026-07-01 17:35 IST)

### Current State

**K8 is BUILT, MERGED, and PUBLISHED. Kits epic K0–K8 all live on npm.** This session reality-checked the K8 plan (found it ~90% correct — 2 ship-breaking bugs), ran the T0 research gate, built K8 honestly via TDD, ran the final Opus whole-branch review (Ready to merge, 0 Crit/Imp), and shipped+published K8. **3 sprints remain: K9, K10, K11.**

- **K8 (`0g contracts import <address|--abi>`)** — closes the contracts story (SP4 shipped `generate`/`list`/`info`). Fetches a **verified** ABI from the 0G ChainScan explorer and feeds the **existing SP4 `generate()` codegen** (no duplicate emitter) → typed client at `./0gkit/contracts/<Name>.ts` (`--out` overrides). New `0gkit-contracts` export **`fetchExplorerAbi(address, network)`**; new `ProgramDeps.contracts` seams `fetchExplorerAbi` + `writeTempAbi`. PR [#67](https://github.com/rajkaria/0gkit/pull/67) → version PR #65→#68 → **published `0gkit-contracts`/`0gkit-cli`/`0gkit-indexer`/`0gkit-react` @ 1.10.0** (all verified live on npm; linked-version group snaps bumped pkgs to a common version — contracts changed, indexer depends on it, react depends on indexer, cli is the CLI; every other 0gkit-* correctly NOT republished). Roadmap-status PR #69. Decisions **D92–D93**.
- **The research gate flipped 2 core assumptions** (the K1/K5/K7 lesson): **(1) the ABI URL** — the plan hard-coded `${explorer}/api?…getabi`, but that path serves the explorer's **React SPA HTML** (custom "0G ChainScan", not Blockscout). The **real** Etherscan-compatible JSON API is at **`${explorer}/open/api`** — verified live on **both** galileo (`chainscan-galileo.0g.ai`) + mainnet (`chainscan.0g.ai`); keyless (optional `OG_EXPLORER_API_KEY`). **(2)** `generate()`→`parseFoundryArtifact` **rejects a bare ABI array** (requires a top-level `{ abi }` wrapper + name); `getabi` returns a **bare** array with no name → `writeTempAbi` wraps it as `{ abi, contractName }`, and **`--name` is required on the address path**. Both would have shipped a broken `import <address>` (every fetch → SPA HTML → `JSON.parse` fail, or generate() rejecting the bare array) had the research gate not caught them.
- **Honesty:** unverified/HTTP-error/malformed/explorer-less all throw a typed `ConfigError` pointing at `--abi` — never a fabricated ABI. Galileo default; no Aristotle-live gating (D10). `fetch` injected → offline unit tests. Final Opus review hardened one minor (`mkdtemp` for the temp-ABI path, concurrency-safe). CI green incl. `0g --help cold-start` (D84 — the new static `fetchExplorerAbi` import didn't bloat cold-start; `0gkit-contracts` was already imported by cli.ts).

**(Superseded)** K7 (`Compute.router()`) + K6 (`0g mcp init`) + Kits epic K0–K5 were built+published in prior sessions (2026-06-30 → 2026-07-01); detail in this file's git history + Recent Session History below.

### Next Steps

1. **K9 next** (`@foundryprotocol/sdk` refresh → thin adapter over published `0gkit-* ^1.x`, bump to 1.1.0 — **cross-repo, in the Foundryprotocol repo**) → K10 (showcase app) → K11 (community). Roadmap: `docs/superpowers/plans/2026-06-30-kits-epic-roadmap.md` (K0–**K8** done+published). **Reality-check each plan against the real exports before coding** (the K1/K5/K6/K7/K8 lesson — every recent plan had ≥2 fictional/ship-breaking assumptions the research gate caught). K9: verify against the real `@foundryprotocol/sdk` `storage.ts`/`attestation.ts`/`da.ts` surface + current `0gkit-storage`/`0gkit-attestation` exports before touching code. **A storage-adapter draft from a prior session transcript exists — lift it as the T2 start but verify it against the current `0gkit-storage` surface first.** K9 only adds Foundry → `0gkit-*` deps (the allowed direction; neutrality unaffected).
2. **K8 follow-ups (Minor, non-blocking, from the final Opus review):** (a) `writeTempAbi` now uses `mkdtemp` (done) — the temp artifact dir is left in `os.tmpdir()` after `generate()` consumes it (harmless, not persisted state); (b) `getsourcecode` could yield the `ContractName` to make `--name` optional on the address path (deferred — the plan specced `getabi` and `--name`-required is honest); (c) docs' "kits like inft-studio reference `0g contracts import`" is a soft forward-reference — no kit README literally instructs it yet.
3. **K7 follow-ups (Minor, triage later):** (a) managed-Router path ignores `prefer`/`PROVIDER` (no verified provider-pin field — do not invent one); (b) kit adapters read `process.env.ROUTER_API_KEY` but no kit surfaces it in a README/`.env.example`; (c) same for a `MODEL` hint when `ROUTER_API_KEY` is set.
4. **K6/K5/K0 follow-ups (Minor, triage later):** K6 — lazy-dep convention split (`0gkit-kits`/`0gkit-jobs` still devDeps a global `0g add`/`jobs` can't resolve); durable-agent's `mcpToolPlugin(_env)` ignores its arg. K5 — `--kits` conformance inert until a kit ships `conformance.ts`; live `makeCompute` still uses deprecated `{ brokerKey }`. K0 — engine `files` lists absent README/LICENSE; `appendEnv` regex not metachar-escaped; raw mutable `KITS` export.

### Key Decisions (this session — K8 D92–D93)

- **D92 (K8)** — `0g contracts import` reuses the SP4 `generate()` codegen; the only new surface is `fetchExplorerAbi(address, network)`. Address path and `--abi` path converge on one emitter. The fetched **bare** ABI is wrapped in `{ abi, contractName }` (`writeTempAbi`) because `parseFoundryArtifact` rejects a bare array; `--name` required on the address path.
- **D93 (K8)** — Explorer ABI fetch hits ChainScan's **`/open/api`** (Etherscan-compatible `getabi`; verified live galileo + mainnet), is **keyless** (optional `OG_EXPLORER_API_KEY`), and **never fabricates** — unverified/HTTP-error/malformed → typed `ConfigError` → `--abi`. Galileo default; no Aristotle gating (D10). Never point ABI fetch at `${explorer}/api` (SPA HTML).

### Recent Session History (most-recent first; full detail in git history)

- **2026-07-01 17:35 IST — ship+publish K8 (`0g contracts import`)** — reality-checked the plan (~90% correct); research gate caught 2 ship-breaking bugs (real ABI API is `/open/api` not `/api`; `generate()` rejects a bare ABI array → wrap in `{ abi }`). Built via TDD (contracts 50/50, cli 173/173): `fetchExplorerAbi` + `contracts import` converging on SP4 codegen; typed `ConfigError` for every failure (never fabricate). Final Opus review = Ready to merge (0 Crit/Imp; hardened 1 minor via `mkdtemp`). PRs #67→#68→#69 → **published contracts/cli/indexer/react @1.10.0**. Decisions D92–D93.
- **2026-07-01 16:15 IST — ship+publish K7 (`Compute.router()`) + fix `kits:check`** — T0 research gate found the 0G Router is a **real** OpenAI-compatible endpoint (`router-api.0g.ai/v1`) so wired it + honest client-side fallback. `router()`/`direct()` + additive per-call provider on `inference()` (D13-safe); 3 templates + 14 kit adapters default to `router()` (fixed a latent no-provider bug). Fixed pre-existing `kits:check` (26→27 PASS). PR #64 → **published compute/cli/mcp @1.9.0**. Decisions D89–D91.
- **2026-07-01 14:50 IST — ship+publish K6 (`0g mcp init`) + fix latent K0 bug** — reality-checked (synergy was fictional), rebuilt around the real plugin seam; fixed a K0 copy-path bug (`resolveTierFiles` src↔dest). PR #62 → **published mcp/kits/cli @1.8.0**. Decisions D87–D88.
- **2026-07-01 12:55 IST — publish epic + ship+publish K5** — refreshed `NPM_TOKEN`, published the Kits epic; built K5 (`0g test`, `doctor --fix`, `.0gkit/kits.json`). PR #60 → published cli/testing/kits@1.7.0. Decisions D84–D86.
- **2026-06-30 — K0–K4 (Kits engine + kits) built + merged; K0 #54 landed, K1 reconciled.** Decisions D77–D83.
- **2026-05-27 → 2026-05-20 — SP1–SP16 + v1.0.0** — scaffolder, `0g dev`, primitives, 9 templates, error taxonomy/jobs/observability, docs/landing, golden-path `define0GConfig`. Decisions D8–D73. Full detail in git history.

### Key Architectural Decisions (still load-bearing — full list in `docs/DECISIONS.md` on 0gkit repo, current through D93)

- **D10** — No mainnet timing dependency; galileo + local devnet always work.
- **D13** — Repo `rajkaria/0gkit`; no rename of published surfaces (additive only). Local working dir `/Users/rajkaria/Projects/0G-ai-kit/`.
- **D24** — `templates/*` (and `templates/_kits/*`) are **not** in `pnpm-workspace.yaml`.
- **D39** — CLI lazy-loads heavy/optional deps via computed-specifier dynamic import (cold-start budget; CI-verified by `0g --help cold-start`).
- **D77–D80 (Kits engine)** — git-overlay kits; engine `@foundryprotocol/*`-app-free (neutrality); 3-tier lib/adapters/ui; composition deps-first/deduped/cycle-safe.
- **D81–D83 (K1)** — honest signed-receipt attestation (no TEE-quote verifier); 0G-Storage-default anchor + opt-in on-chain; `gen-registry.mjs` prettier-formats output.
- **D84–D86 (K5)** — `0g test` lazy-imports `0gkit-testing`, offline suites; `doctor --fix` advisory-only; `applyKit` persists `.0gkit/kits.json`.
- **D87–D88 (K6)** — kit MCP tools reach editors via the neutral plugin seam inside the user's own kitted project; `0g mcp init` writes editor config only, neutral-by-default.
- **D89–D91 (K7)** — `Compute.router()` wires the real 0G Router endpoint when configured, else honest client-side selection; `router()`/`direct()` additive + optional per-call `provider` (no rename); templates + compute-kits default to `router()` (kits:check 27/27).
- **D92–D93 (K8)** — `0g contracts import` reuses SP4 codegen (only new surface `fetchExplorerAbi`; bare ABI wrapped in `{ abi }`); explorer fetch hits ChainScan `/open/api` (Etherscan-compat, keyless), never fabricates an ABI.

### Pointers

- **Kits epic:** spec `docs/superpowers/specs/2026-06-30-0gkit-kits-design.md`; plans `docs/superpowers/plans/2026-06-30-k{0..11}-*.md`; roadmap `…/2026-06-30-kits-epic-roadmap.md` (K0–**K8** done+published; **K9 next**).
- **Decisions log:** `docs/DECISIONS.md` on 0gkit repo (current through D93).
- **Publish:** Changesets `release.yml` on push to `main` — pending changesets ⇒ version PR; merge it to publish. `"linked": [["@foundryprotocol/0gkit-*"]]` snaps all bumped 0gkit-* pkgs to a common version; unchanged pkgs are NOT republished. `NPM_TOKEN` secret refreshed 2026-07-01. Gotchas in memory `project_0gkit_publish_gotchas`.
- **Deployer/seed key:** sibling worktree `sad-jemison-e5dba7/.env`; deployer `0x4f18…CfE8`.
- **Memory:** `/Users/rajkaria/.claude/projects/-Users-rajkaria-Projects-Foundryprotocol/memory/MEMORY.md`.

### Workflow reminders

- Plan-already-written → **reality-check it against real exports first** (the K1/K5/K6/K7/K8 lesson — every recent plan had ≥2 fictional assumptions; K8 needed a research gate on the real ChainScan ABI API), then execute via `superpowers:subagent-driven-development` (or TDD inline for micro-sprints) → squash-merge after CI green. **Always run the final whole-branch review** (most-capable model) even when per-task gates are green.
- In SDD implementer dispatches, add **"do NOT spawn sub-agents / background monitors"** (a K5 implementer monitor-looped and stalled).
- `gh pr merge --squash --delete-branch` (auto-merge disabled). Publishing = merge the Changesets version-packages PR (don't leave it open). **Pull `main` before branching a follow-up** so the branch isn't based on a stale main (a K8 roadmap-PR near-miss).
- All current sprints (Kits K0–K11) land on `rajkaria/0gkit`. K9 (Foundry SDK refresh) is the one cross-repo sprint (lands in the Foundryprotocol repo).
