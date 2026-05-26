# Foundry Protocol — Claude Code session context

Repo: `rajkaria/foundry` · Domain: `foundryprotocol.xyz` · Default branch: `main`
0gkit toolkit: `rajkaria/0gkit` · Domain: `0gkit.com` · Local working dir: `/Users/rajkaria/Projects/0G-ai-kit/`

## Always-on rules for this project

- **Squash-merge own PRs** after CI passes; never leave open as a review gate.
- Commit/push/merge every change without per-change approval; no narration between tool calls.
- Honesty rule: never fabricate endpoints/behaviors; stubbed/unverified things must be labeled as such.
- **0gkit neutrality is a hard invariant:** no `@0gkit/*` package may statically depend on `@foundryprotocol/*`. Enforced in CI by `pnpm boundary:check`.
- **`/save-context` REPLACES the latest-session section below — do not append.** Older session detail lives in git history (`git log` on this file).

## Session Context (Last updated: 2026-05-26 10:51 IST)

### Current State

**SP15 shipped + released.** `@foundryprotocol/0gkit-cli@1.4.0` live on npm (verified). All 18 v1.x packages still live at the v1.0.x baseline (`0gkit-core@1.3.0`).

**SP16 plan written this session** — saved at `docs/superpowers/plans/2026-05-26-sp16-golden-path-typed-config.md` on 0gkit local `main` (not yet pushed/committed). 10 tasks: new `define0GConfig` + `detectLocalDevnet` + `printFirstSuccess` in `0gkit-core`; all 9 templates adopt `define0GConfig` + auto-devnet + first-success banner + "What next?" README; docs templates page update; CI banner-grep gate.

No open PRs. 0gkit working dir clean on `main` at `41868fc` (post-SP15-release).

### Next Steps

1. **Pull `main`** on `rajkaria/0gkit` (`git fetch && git pull --ff-only`). Local working dir is `/Users/rajkaria/Projects/0G-ai-kit/`.
2. **Commit the SP16 plan** if not already committed: `git add docs/superpowers/plans/2026-05-26-sp16-golden-path-typed-config.md && git commit -m "docs(plan): SP16 golden path + typed config"`.
3. **Execute SP16** via `superpowers:subagent-driven-development` against the saved plan. The plan is self-contained — every task has TDD test code, file paths, and commit guidance.
4. **After SP16 lands**, the auto-generated changeset PR publishes `0gkit-core` minor (new exports) + `create-0gkit-app` / `create-0g-app` patches. Verify with `npm view @foundryprotocol/0gkit-core version`.
5. **Then SP17** — `0g doctor --fix` + `0g test` conformance runner. See [post-v1 roadmap](https://github.com/rajkaria/0gkit/blob/main/docs/superpowers/plans/2026-05-23-post-v1-roadmap.md) for the full Wave A→D sequence (SP18 MCP init, SP19 Compute Router, SP20 contracts import, SP21 Foundry SDK refresh, SP22 showcase app, SP23 community).

### Recent Session History (most-recent first; full detail in git history)

- **2026-05-26 06:39 IST — SP15 ship** — `--copy-issue-context` CLI flag (markdown error dump on stderr with redacted argv + node/OS/package versions) + 5 stale error-page snippets refreshed + `/errors` index callout. PRs [#48](https://github.com/rajkaria/0gkit/pull/48) + [#49](https://github.com/rajkaria/0gkit/pull/49) (version packages). Published `0gkit-cli@1.4.0`. Decisions D67–D70.
- **2026-05-26 04:45 IST — SP14 ship** — local `0g traces` explorer (`OGKIT_TRACE_DIR` JSONL sink in `0gkit-observability`; `0g traces list|inspect` CLI; `0g cost forecast --from-jaeger -` stdin). PRs [#46](https://github.com/rajkaria/0gkit/pull/46) + [#47](https://github.com/rajkaria/0gkit/pull/47). Published `0gkit-observability@1.1.0` + `0gkit-cli@1.3.0` + `0gkit-core@1.0.2`. Decisions D62–D66.
- **2026-05-23 20:45 IST — SP13 ship** — docs cleanup + migration guide (`/migrate-from-official-sdks`) + `docs:check --versions` CI gate + perf benchmark workflow. PRs [#44](https://github.com/rajkaria/0gkit/pull/44) + [#45](https://github.com/rajkaria/0gkit/pull/45). Decisions D51–D57.
- **2026-05-23 — 0gkit.com domain stand-up + v1.0.x onboarding fixes** — landing page (`apps/landing`), `ERROR_HELP_BASE` → 0gkit.com, fresh-machine-smoke + link-check sentinel workflows, docs UI brand overhaul, cookbook tutorials. PRs #26–#40. Decisions D38–D50.
- **2026-05-22 — Phase 4 wave (SP9–SP12 + v1.0.0)** — error taxonomy (45 codes + helpUrl + per-code MDX), `0gkit-jobs` durable runner, `0gkit-observability` OTel + `0g cost forecast`, SP12 polish + Pagefind + Lighthouse CI. **Cut v1.0.0** — 18 packages published. Decisions D27–D37.
- **2026-05-20 to 2026-05-22 — Phase 1–3 (SP1–SP8)** — `create-0gkit-app` scaffolder, `0g dev` local stack, wallet packages, `0gkit-contracts` typed clients, `0gkit-testing` mocks, `0gkit-indexer` reorg-safe events, cost estimator + dryRun, 9-template library. Repo renamed `0G-ai-kit` → `0gkit` (D13). Decisions D8–D26.
- **Pre-2026-05-20 — hackathon era (Sprint 0–3)** — Foundry monorepo + landing + 6 contracts + SDK + indexer + inference loop + Ingot + Lineage + AI-wizard + TEE-viewer. Superseded by the real `@foundryprotocol/0gkit-*` primitives.

### Key Architectural Decisions (still load-bearing — full list in `docs/DECISIONS.md` on 0gkit repo)

- **D13** — Repo named `rajkaria/0gkit` (no `ai` suffix). Local working dir `/Users/rajkaria/Projects/0G-ai-kit/` unchanged.
- **D24** — `templates/*` is **not** in `pnpm-workspace.yaml` (templates use published packages).
- **D27** — `ZeroGError.helpUrl` is computed from the error code (`ERROR_HELP_BASE + code`), not stored per-throw. `ERROR_HELP_BASE = "https://docs.0gkit.com/errors/"` from v1.0.1 (D38 rebased from `0gkit.dev`).
- **D32** — `instrument0g()` patches `Storage` / `Compute` / `DA` prototypes; attestation deferred (free functions, no class).
- **D39** — CLI lazy-loads heavy deps (`0gkit-jobs`, `0gkit-testing`) via computed-specifier dynamic import to keep cold-start under the SP13 perf budget.
- **D58** — `OGKIT_TRACE_DIR` env opts in to local JSONL trace mirror in `0gkit-observability` (off by default for privacy).
- **D67** — `--copy-issue-context` writes to **stderr**, not stdout — keeps the `--json` envelope contract clean for pipelines.
- **D68** — `import.meta.resolve` is the production path for package-version discovery (not `createRequire`); every `@foundryprotocol/0gkit-*` `exports` field is `"import"`-only.
- **D71–D73 (planned for SP16)** — first-success banner contract token `[0gkit:first-success]`; `detectLocalDevnet` is a pure chainId probe (no doctor shell-out); zod is a direct dep on `0gkit-core`.

### Pointers

- **0gkit post-v1 roadmap:** `docs/superpowers/plans/2026-05-23-post-v1-roadmap.md` on the 0gkit repo.
- **Decisions log:** `docs/DECISIONS.md` on the 0gkit repo (D1–D70).
- **Deployer/seed key:** sibling worktree `sad-jemison-e5dba7/.env`; deployer `0x4f18…CfE8`.
- **Memory:** `/Users/rajkaria/.claude/projects/-Users-rajkaria-Projects-Foundryprotocol/memory/MEMORY.md`.

### Workflow reminders

- Plan-already-written → execute via `superpowers:subagent-driven-development` or `superpowers:executing-plans` → squash-merge after CI green.
- `gh pr merge --squash --delete-branch` (auto-merge disabled).
- The Foundryprotocol repo itself has no in-flight work; all current sprints land on `rajkaria/0gkit`.
