# Foundry Protocol — Claude Code session context

Repo: `rajkaria/foundry` · Domain: `foundryprotocol.xyz` · Default branch: `main`
0gkit toolkit: `rajkaria/0gkit` · Domain: `0gkit.com` · Local working dir: `/Users/rajkaria/Projects/0G-ai-kit/`

## Always-on rules for this project

- **Squash-merge own PRs** after CI passes; never leave open as a review gate.
- Commit/push/merge every change without per-change approval; no narration between tool calls.
- Honesty rule: never fabricate endpoints/behaviors; stubbed/unverified things must be labeled as such.
- **0gkit neutrality is a hard invariant:** no `@0gkit/*` package may statically depend on `@foundryprotocol/*` app packages. Enforced in CI by `pnpm boundary:check` (now also scans `templates/_kits`).
- **`/save-context` REPLACES the latest-session section below — do not append.** Older session detail lives in git history (`git log` on this file).

## Session Context (Last updated: 2026-07-02 13:10 IST)

### Current State

**The Kits epic K0–K11 is now 100% COMPLETE.** K9 (the one cross-repo sprint) shipped this session — `@foundryprotocol/sdk@1.1.0` is **published to npm**. Also finished the K10 post-deploy wiring now that `apps.0gkit.com` is live.

- **K9 — Foundry SDK refresh (this session, DONE + published).** `@foundryprotocol/sdk` is now a **thin adapter over published `@foundryprotocol/0gkit-*` ^1.x** instead of a parallel impl:
  - `storage.ts` → `StorageClient` delegates `upload`/`download`/`computeRoot` to `@foundryprotocol/0gkit-storage`. Public surface byte-preserved (`{ rootHash, txHash, txSeq, size }`, `StorageError`, all methods).
  - `attestation.ts` → re-exports `@foundryprotocol/0gkit-attestation`; keeps Foundry's **throw-on-mismatch** `verifyEnvelope` (returns recovered `Address`; throws `digest mismatch`/`signer mismatch`).
  - `da.ts` already delegated to `0gkit-da`; `inference.ts` (revenue proxy) untouched.
  - Dropped `@0gfoundation/0g-storage-ts-sdk` + `ethers` from `peerDependencies` (now transitive via `0gkit-storage`); bumped `0gkit-*` deps to `^1.x`.
  - PRs: Foundry [#43](https://github.com/rajkaria/foundry/pull/43) (refactor) → [#44](https://github.com/rajkaria/foundry/pull/44) (version bump, opened manually — Foundry Actions can't create PRs) → **published `@foundryprotocol/sdk@1.1.0`**. Decisions **D98–D99**.
- **K9 Phase 1 — `0gkit-storage` widening (prerequisite, published).** `Storage.upload(data, opts?)` gained `UploadOptions { signer?, uploadOptions?, txOptions? }` + `txSeq` on `UploadResult` (per-call ready-ethers-signer bypasses constructor key; backward compatible). PRs [0gkit#80](https://github.com/rajkaria/0gkit/pull/80) + version [#82](https://github.com/rajkaria/0gkit/pull/82) → **published `@foundryprotocol/0gkit-storage@1.12.0`** (bundled with pending cli/mcp/react bumps).
- **K10 post-deploy (DONE).** `apps.0gkit.com` is **live** (HTTP 200, serving `0gkit-status`). Landing `TrustSignals` + docs `/kits` callout now link the live app. PR [0gkit#79](https://github.com/rajkaria/0gkit/pull/79) merged.

**Remaining is only minor / manual (nothing substantive in the epic):**

1. **K11 (manual UI):** create **RFCs** + **Show your kit** Discussion categories in the 0gkit repo UI (Open-ended format), re-run `bash scripts/setup-discussions.sh` to seed, pin [#70](https://github.com/rajkaria/0gkit/discussions/70). GitHub API has no `createDiscussionCategory`/`pinDiscussion` (D95).
2. **K10 (minor):** showcase `.github/workflows/ci.yml` only runs standalone (out-of-workspace); keyless pins/feed are in-memory — a keyed deploy exercises real 0G Storage.

### Next Steps

- **Epic is done.** No coding sprint remains. If picking up: verify `@foundryprotocol/sdk@1.1.0` is consumed where intended, or move to the two minor/manual items above.
- **Security:** an npm token was pasted into a session transcript on 2026-07-02 to set the Foundry `NPM_TOKEN` secret — **rotate/revoke that npm Automation token.**

### Key Decisions (this session — K9 D98–D99)

- **D98 (K9)** — Full dedup across BOTH repos (user-chosen over Foundry-only): the plan's premise that `0gkit-storage` could host Foundry's `upload` was fiction — `0gkit-storage` took the signer at construction, no `txSeq`, no per-call options. So **additively widened `0gkit-storage.upload`** (per-call ready-ethers-signer + `uploadOptions`/`txOptions` + `txSeq`; neutral, backward compatible) → published `1.12.0`, THEN made `@foundryprotocol/sdk` a true thin adapter (`1.1.0`). Public `StorageClient`/attestation surface preserved; `txSeq` is consumed by `apps/web/.../storage/upload/route.ts` so it had to survive.
- **D99 (K9)** — The `rajkaria/foundry` repo has its **own `release.yml` + `NPM_TOKEN`**, separate from 0gkit. That token was **empty**, so publish silently skipped (`Not publishing because no publish script found`). Foundry Actions also **can't create PRs** (repo setting) — the changesets version bump lands on `changeset-release/main` but the "chore: version packages" PR must be opened manually. Fixed by setting the secret + `gh run rerun`. Full detail in memory `project_0gkit_publish_gotchas`.

### Recent Session History (most-recent first; full detail in git history)

- **2026-07-02 13:10 IST — ship+publish K9 (Foundry SDK thin adapter) → Kits epic COMPLETE.** Reality-check caught 3 plan fictions (per-call signer, `checks`-as-array, `verifyEnvelope` return type). Two-repo full-dedup: widened `0gkit-storage` (→ published 1.12.0, PRs #80/#82) then Foundry adapter (→ published `sdk@1.1.0`, PRs #43/#44). Also wired live `apps.0gkit.com` (0gkit #79). Hit + fixed: a concurrent session racing the shared 0gkit checkout (isolated my commit via worktree); a pre-existing broken `format:check` gate on Foundry main; empty Foundry `NPM_TOKEN` (set it). D98–D99.
- **2026-07-01 22:55 IST — ship K11 + K10 + full docs/landing refresh (4 PRs).** K11 (#73, seeded Discussions live) → docs/landing (#74) → K10 showcase `showcase/0gkit-status` (#75) → roadmap (#76). D94–D97.
- **2026-07-01 17:35 IST — ship+publish K8 (`0g contracts import`).** PRs #67→#69 → contracts/cli/indexer/react @1.10.0. D92–D93.
- **2026-07-01 16:15 IST — ship+publish K7 (`Compute.router()`).** PR #64 → compute/cli/mcp @1.9.0. D89–D91.
- **2026-07-01 14:50 IST — ship+publish K6 (`0g mcp init`) + K0 bug.** PR #62 → mcp/kits/cli @1.8.0. D87–D88.
- **2026-07-01 12:55 IST — publish Kits epic + K5.** PR #60 → cli/testing/kits @1.7.0. D84–D86.
- **2026-06-30 — K0–K4 (Kits engine + kits).** D77–D83.
- **2026-05-27 → 2026-05-20 — SP1–SP16 + v1.0.0.** D8–D73. Full detail in git history.

### Key Architectural Decisions (still load-bearing — full list in `docs/DECISIONS.md` on 0gkit repo, current through D97)

- **D10** — No mainnet timing dependency; galileo + local devnet always work.
- **D12** — Canonical scaffolder is **`create-0gkit-app`** (unscoped, published @1.1.0 with `--kits`); `create-0g-app` is the legacy/private name. **Query npm with the exact unscoped name.**
- **D13** — Repo `rajkaria/0gkit`; no rename of published surfaces (additive only). Local working dir `/Users/rajkaria/Projects/0G-ai-kit/`.
- **D24** — `templates/*`, `templates/_kits/*`, and `showcase/*` are **not** in `pnpm-workspace.yaml` (globs are `apps/*` + `packages/*`); they consume published packages like a real user.
- **D39** — CLI lazy-loads heavy/optional deps via computed-specifier dynamic import (cold-start budget; CI-verified).
- **D77–D80 (Kits engine)** — git-overlay kits; engine `@foundryprotocol/*`-app-free (neutrality); 3-tier lib/adapters/ui; composition deps-first/deduped/cycle-safe.
- **D89–D91 (K7)** — `Compute.router()` wires the real 0G Router when configured, else honest client-side selection.
- **D92–D93 (K8)** — `0g contracts import` reuses SP4 codegen (`fetchExplorerAbi`); ChainScan `/open/api` (keyless), never fabricates.
- **D94–D95 (K11)** — Community = Discussions + footer; categories/pins are UI-only (no API mutation).
- **D96–D97 (K10)** — `0gkit-status` showcase = published packages, out-of-workspace, composed from kits; hand-authored by choice; subdirectory deploy needs explicit Vercel root.
- **D98–D99 (K9)** — Foundry SDK is a thin adapter over `0gkit-*` ^1.x (widened `0gkit-storage.upload` additively to host it); Foundry repo has its own `release.yml`/`NPM_TOKEN` and Actions can't create PRs.

### Pointers

- **Kits epic:** spec + plans + roadmap live on the **0gkit repo** (`/Users/rajkaria/Projects/0G-ai-kit/docs/superpowers/`); roadmap `…/2026-06-30-kits-epic-roadmap.md` — **all K0–K11 done** (K9 was the last; may still show "ready" if roadmap not updated — cosmetic).
- **Showcase app:** `showcase/0gkit-status/` on the 0gkit repo — deployed at **`apps.0gkit.com`** (live).
- **Decisions log:** `docs/DECISIONS.md` on 0gkit repo (through D97; D98–D99 above are new, not yet in that log).
- **Publish (0gkit):** Changesets `release.yml` on push to `main` — merge the version PR to publish. Gotchas in memory `project_0gkit_publish_gotchas`.
- **Publish (Foundry `@foundryprotocol/sdk`):** SEPARATE `release.yml` on `rajkaria/foundry`. **Foundry Actions can't create PRs** → open the `changeset-release/main` PR manually. **Foundry `NPM_TOKEN` set 2026-07-02** (was empty → publish silently skipped). D99 + memory.
- **Deployer/seed key:** sibling worktree `sad-jemison-e5dba7/.env`; deployer `0x4f18…CfE8`.
- **Memory:** `/Users/rajkaria/.claude/projects/-Users-rajkaria-Projects-Foundryprotocol/memory/MEMORY.md`.

### Workflow reminders

- Plan-already-written → **reality-check it against real exports/tooling first** (K9 caught 3 plan fictions), then execute via `superpowers:subagent-driven-development` (or TDD inline for micro-sprints) → squash-merge after CI green. **Always run the final whole-branch review** (most-capable model) even when per-task gates are green.
- **Shared checkouts can be raced by a concurrent session.** The 0gkit local dir was being edited by another session mid-K9 (branch switched under me). Prefer an **isolated `git worktree`** for multi-step git work in a shared repo; stage explicit files (never `git add -A`) so stray changes don't get committed.
- **`format:check` runs `prettier --check` across the whole repo** — a latent unformatted file fails CI (incl. pre-existing ones on main). Run prettier on every changed file before pushing.
- `gh pr merge --squash --delete-branch` (auto-merge disabled). **Pull `main` before branching a follow-up.**
- Kits sprints landed on `rajkaria/0gkit`; **K9 was the one cross-repo sprint (Foundry repo).** Epic is now complete.
