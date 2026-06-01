# Foundry Protocol — Claude Code session context

Repo: `rajkaria/foundry` · Domain: `foundryprotocol.xyz` · Default branch: `main`
0gkit toolkit: `rajkaria/0gkit` · Domain: `0gkit.com` · Local working dir: `/Users/rajkaria/Projects/0G-ai-kit/`

## Always-on rules for this project

- **Squash-merge own PRs** after CI passes; never leave open as a review gate.
- Commit/push/merge every change without per-change approval; no narration between tool calls.
- Honesty rule: never fabricate endpoints/behaviors; stubbed/unverified things must be labeled as such.
- **0gkit neutrality is a hard invariant:** no `@0gkit/*` package may statically depend on `@foundryprotocol/*`. Enforced in CI by `pnpm boundary:check`.
- **`/save-context` REPLACES the latest-session section below — do not append.** Older session detail lives in git history (`git log` on this file).

## Session Context (Last updated: 2026-06-01 13:55 IST)

### Current State

**Defect-report feature shipped to 0gkit (`main` @ `006e514`, PR [#52](https://github.com/rajkaria/0gkit/pull/52) squash-merged).** New `buildDefectReport()` / `suggestOwnership()` / `suggestSeverity()` in `0gkit-core` + a `--defect-report` CLI flag. Turns any `ZeroGError` into a ready-to-file QA defect in the bilingual template used by the 0G ecosystem app-test program (`github.com/lvxuan149/0g-apac-app-test`). Changeset is **core minor + cli minor**. **Published 2026-06-01** — `@foundryprotocol/0gkit-core@1.5.0` + `0gkit-cli@1.5.0` (and all 18 packages, fixed-version bump `1.3.0→1.5.0`, which also shipped the previously-unpublished SP16 changeset) live on npm. Publish initially failed: version-packages PR [#51](https://github.com/rajkaria/0gkit/pull/51) had been left unmerged since SP16, and on merge the Release `changeset publish` step 404'd on all packages because the `NPM_TOKEN` repo secret had **expired**. Rotated the secret (new automation token) + re-ran run `26742042939` → published clean. **Goodwill contribution PR opened: [lvxuan149/0g-apac-app-test#1](https://github.com/lvxuan149/0g-apac-app-test/pull/1)** (severity rubric + YAML template + 0gkit auto-emit guide).

SP16 (golden path + define0GConfig) landed earlier as PR #50 (`f59b752`). All CI green on #52 (`lint·typecheck·build·test` 6m13s, `create-0gkit-app`, cold-start, lhci). Both working dirs clean.

**Context for this session:** discovered `lvxuan149/0g-apac-app-test` — a manual exploratory-QA repo testing the 0G ecosystem (incl. hackathon submissions like Foundry). Fixed bilingual defect template (标题/归属/严重度/环境/复现步骤/预期/实际/截图/根因), routing buckets (App Suite | 0G Infra | 生态 dApp | Hackathon项目), P1–P4 severity (undefined in their repo), SNR gate. The 0gkit feature makes any 0gkit-based dApp auto-emit that template.

### Recent Changes (this session — 2026-06-01 ~13:55 IST: publish + contribution PR)

- **Published 0gkit 1.5.0.** Squash-merged the stale version-packages PR [#51](https://github.com/rajkaria/0gkit/pull/51) on `rajkaria/0gkit`; Release run 404'd (expired `NPM_TOKEN` secret); rotated the secret + re-ran run `26742042939` → all 18 `@foundryprotocol/0gkit-*` packages live at `1.5.0` (verified via `npm view`).
- **Opened goodwill PR [lvxuan149/0g-apac-app-test#1](https://github.com/lvxuan149/0g-apac-app-test/pull/1)** from fork `rajkaria/0g-apac-app-test`, branch `defect-intel-template-and-0gkit`. Four file changes, strictly additive: `defects/SEVERITY.md` (P1–P4 rubric), `defects/TEMPLATE.md` (YAML front-matter template, groupable by `root_cause_code`), `defects/README.md` (the "if the app is built with 0gkit" auto-emit guide + honesty caveats), and a one-line pointer added to their root `README.md`. Honored their hard rules (no ProofClaw mention; their English ownership bucket names; no feature-request framing).
- **Foundry repo:** updated `CLAUDE.md` (this file, commit `3f1ddb0`) + added memory `project_0gkit_publish_gotchas.md`.

#### Prior session detail (defect-report build — shipped in PR #52)

On `rajkaria/0gkit` (local `/Users/rajkaria/Projects/0G-ai-kit/`), all in PR #52:
- `packages/0gkit-core/src/defect-report.ts` — **new.** `buildDefectReport()` renders the QA defect template (bilingual labels); `suggestOwnership(code)` (infra namespaces → `0G Infra`, else `Hackathon项目`); `suggestSeverity(code)` (P1 blockers / P3 caller-fixable / P2 default). Framework-agnostic, zero deps — callable from a browser dApp error boundary or the CLI.
- `packages/0gkit-core/src/__tests__/defect-report.test.ts` — **new**, 11 tests (incl. exhaustiveness over `ERROR_CODES`).
- `packages/0gkit-core/src/index.ts` — exports the 3 fns + 5 types.
- `packages/0gkit-cli/src/{context.ts,program.ts}` — new `--defect-report` global flag; emits report to **stderr** on error (mirrors `--copy-issue-context`; keeps `--json` stdout clean). Auto-derives Chain ID via `getNetwork`.
- `packages/0gkit-cli/src/__tests__/program.test.ts` — +2 tests.
- `apps/docs/app/packages/core/page.mdx` — API section + exports list.
- `.changeset/defect-report-qa-template.md` — core minor + cli minor.

### Next Steps

1. ~~**Verify publish**~~ ✅ **Done 2026-06-01** — core/cli `1.5.0` live on npm (see Current State). **Carry-forward gotcha:** the version-packages PR must be merged after each feature merge or nothing publishes; and the `NPM_TOKEN` secret expired once — if a future Release run 404s on PUT for all packages, rotate the npm automation token and re-run.
2. ~~**External contribution PR to `lvxuan149/0g-apac-app-test`**~~ ✅ **Opened [#1](https://github.com/lvxuan149/0g-apac-app-test/pull/1)** — added (a) P1–P4 severity rubric, (b) YAML front-matter template, (c) "if the app is built with 0gkit" auto-emit guide, + one additive README pointer. Strictly additive; their repo, their call. **Await their review/merge.** (Respected their hard rule: no ProofClaw mention; used their English ownership bucket names.)
3. **Optionally wire `--defect-report` / `buildDefectReport()` into Foundry's own dApp** error boundary so Foundry is the cleanest testee in their QA queue.
4. **Then SP17** — `0g doctor --fix` + `0g test` conformance runner (frames nicely as "QA noise reduction"). See [post-v1 roadmap](https://github.com/rajkaria/0gkit/blob/main/docs/superpowers/plans/2026-05-23-post-v1-roadmap.md): SP18 MCP init, SP19 Compute Router, SP20 contracts import, SP21 Foundry SDK refresh, SP22 showcase app, SP23 community.

### Key Decisions (this session)

- **D74** — Defect-report renderer + routing/severity heuristics live in `0gkit-core`, **not** the CLI. Rationale: the value prop is "any 0gkit dApp auto-emits the QA template" — a browser dApp can't shell out to the CLI, so the primitive must be importable. CLI just wires the `--defect-report` flag on top.
- **D75** — `suggestOwnership` only ever returns `0G Infra` or `Hackathon项目` (the two buckets a 0gkit *consumer* can legitimately attribute). `App Suite` / `生态 dApp` are valid manual overrides but never auto-suggested — a hackathon dApp can't author defects against 0G's own/other apps.
- **D76** — `suggestSeverity` is explicitly labeled "(suggested — confirm against impact)" in the output. Severity is impact-based and can't be inferred from an error code alone; the heuristic is a starting default, not a verdict. Honesty-rule compliant.

### Recent Session History (most-recent first; full detail in git history)

- **2026-06-01 13:12 IST — defect-report feature** — `buildDefectReport()`/`suggestOwnership()`/`suggestSeverity()` in `0gkit-core` + `--defect-report` CLI flag. Maps any `ZeroGError` onto the 0G app-test QA template (`lvxuan149/0g-apac-app-test`). PR [#52](https://github.com/rajkaria/0gkit/pull/52) merged (`006e514`), CI green, changeset core+cli minor. **Published 1.5.0 on 2026-06-01** (via PR #51 merge + NPM_TOKEN rotation) and **goodwill PR [#1](https://github.com/lvxuan149/0g-apac-app-test/pull/1) opened** to their QA repo (severity rubric + YAML template + 0gkit auto-emit guide). Decisions D74–D76.
- **2026-05-27 00:34 IST — SP16 ship** — golden path + `define0GConfig` typed config across all 9 templates. PR [#50](https://github.com/rajkaria/0gkit/pull/50) (`f59b752`). `define0GConfig`/`detectLocalDevnet`/`printFirstSuccess` in core; auto-devnet detection + first-success banner + "What next?" README per template. Decisions D71–D73.
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
- **D71–D73 (SP16, shipped)** — first-success banner contract token `[0gkit:first-success]`; `detectLocalDevnet` is a pure chainId probe (no doctor shell-out); zod is a direct dep on `0gkit-core`.
- **D74–D76 (defect-report)** — renderer/heuristics in `0gkit-core` not CLI (browser dApps can't shell out); `suggestOwnership` auto-returns only `0G Infra`/`Hackathon项目`; `suggestSeverity` always labeled "(suggested — confirm)".

### Pointers

- **0gkit post-v1 roadmap:** `docs/superpowers/plans/2026-05-23-post-v1-roadmap.md` on the 0gkit repo.
- **Decisions log:** `docs/DECISIONS.md` on the 0gkit repo (D1–D70).
- **Deployer/seed key:** sibling worktree `sad-jemison-e5dba7/.env`; deployer `0x4f18…CfE8`.
- **Memory:** `/Users/rajkaria/.claude/projects/-Users-rajkaria-Projects-Foundryprotocol/memory/MEMORY.md`.

### Workflow reminders

- Plan-already-written → execute via `superpowers:subagent-driven-development` or `superpowers:executing-plans` → squash-merge after CI green.
- `gh pr merge --squash --delete-branch` (auto-merge disabled).
- The Foundryprotocol repo itself has no in-flight work; all current sprints land on `rajkaria/0gkit`.
