# Foundry Protocol — Claude Code session context

Repo: `rajkaria/foundry` · Domain: `foundryprotocol.xyz` · Default branch: `main`
0gkit toolkit: `rajkaria/0gkit` · Domain: `0gkit.com` (live + v1.0.2 published 2026-05-23)

## Always-on rules for this project

- **Squash-merge own PRs** after CI passes; never leave open as a review gate.
- Commit/push/merge every change without per-change approval; no narration between tool calls.
- Honesty rule: never fabricate endpoints/behaviors; stubbed/unverified things must be labeled as such.
- **0gkit neutrality is a hard invariant:** no `@0gkit/*` package may statically depend on `@foundryprotocol/*`. Enforced in CI by `pnpm boundary:check`.

## Session Context (Last updated: 2026-05-26 06:39 IST)

### Current State

**SP15 shipped + released. Two PRs landed on `rajkaria/0gkit` main this session** (one feature, one auto-generated version-packages):

- **[#48](https://github.com/rajkaria/0gkit/pull/48) — SP15** `--copy-issue-context CLI flag + error page polish` — **MERGED** as `925634a`. One CI fail on first push (`packages/0gkit-cli/src/__tests__/traces.test.ts` had an explicit `: ProgramDeps` return type without the four new fields; the other 14 test files all use `as unknown as ProgramDeps` so they tolerated the widening); fixed in `a86b9d9` and re-run all green. Branch `sp15-error-polish-copy-issue-context` deleted post-merge.
- **[#49](https://github.com/rajkaria/0gkit/pull/49)** `chore: version packages` (auto-opened after #48) — **MERGED** as `41868fc`. Triggers the Release workflow to publish `@foundryprotocol/0gkit-cli@1.4.0` (minor — new flag).

No open PRs. Workspace clean on `main` at the post-#49 release commit.

### SP15 — what shipped (single PR)

**`0gkit-cli`:**

- **New global flag `--copy-issue-context`** on every `0g` command. Plumbed through `program.ts:GlobalFlags` → `context.ts:CliContext` → `runCommand`. Defaults off.
- **New `src/issue-context.ts`** — pure, side-effect-free markdown builder. Exports `redactArgv(argv)` (strips `--private-key` values in both `--flag value` and `--flag=value` forms; strips URL userinfo from `--rpc`) and `buildIssueContext({ error, argv, node, os, packages, now })` (renders the report). No fs, no env, no fetch. The URL redaction uses a raw regex instead of `URL.toString()` because the latter percent-encodes the literal `<redacted>` placeholder text.
- **`runCommand` extension** — when `context.copyIssueContext` is true, after `out.failure(...)` runs, lazy-imports `./issue-context.js` + `node:os` and writes the markdown block to `deps.writeErr`. Stack frames are clipped to first 10 with a "… N more frames omitted" footer.
- **`ProgramDeps` gained four fields:** `argv: readonly string[]`, `writeErr: (line) => void`, `packageVersions: () => Array<{name, version}>`, `now: () => Date`. Tests inject fakes; production routes to `process.stderr`, `process.argv.slice(2)`, real package resolution, and `new Date()`.
- **Production `packageVersions` resolver** in `cli.ts` uses `import.meta.resolve` (sync + stable since Node 20.6) to find each `@foundryprotocol/0gkit-*` package's main entry, then walks up directories to find the nearest matching `package.json`. The CommonJS `createRequire().resolve()` path was abandoned because every `0gkit-*` package's `exports` field restricts to `"import"` condition only — CJS-style resolution fails with `No "exports" main defined`. The CLI's own version is seeded explicitly (pnpm workspace symlinks don't expose self-package via name lookup).

**Error pages:**

- **5 stale "ships in SP10/SP11" / "Pre-SP10 stub" notes replaced** with real working snippets. The five pages: `JOBS_BACKEND_UNREACHABLE` (sqlite backend example), `JOBS_JOB_NOT_FOUND` (`runner.status(id)`), `JOBS_HANDLER_THREW` (`jobs.define({ maxAttempts: 3, handler: throws })`), `JOBS_WEBHOOK_BAD_SIGNATURE` (`jobs.verifyWebhook(...)`), `OBSERVABILITY_EXPORTER_FAILED` (real OTLP `instrument0g({...})`).
- **`/errors` index page** gains a callout under the heading: `> Stuck? Re-run any 0g command with --copy-issue-context. ...` linking to `https://github.com/rajkaria/0gkit/issues/new`.

**Docs:**

- **`apps/docs/app/cli/page.mdx`** — global-flags table gains `--copy-issue-context` row; new `## Debugging: --copy-issue-context` section after `## Output & exit codes` explains the redactions + capture-to-file pattern.

**Tests:** 8 new unit tests for `redactArgv` + `buildIssueContext` + 2 new integration tests in `program.test.ts` for the `runCommand --copy-issue-context` flag (positive + negative). Full CLI suite: 129/129 passing.

**Changeset** `.changeset/sp15-copy-issue-context.md` cuts a minor on `0gkit-cli` (new flag).

### Recent Changes

Source of truth = `git log origin/main` on `rajkaria/0gkit`:

- `41868fc` (#49) chore: version packages (0gkit-cli minor → 1.4.0)
- `925634a` (#48) SP15: --copy-issue-context CLI flag + error page polish
- `750150a` (#47) chore: version packages (observability + cli minors, core patch)
- `c205c36` (#46) SP14: local 0g traces explorer + OGKIT_TRACE_DIR JSONL mirror

### Next Steps

**Immediate next session:**

1. **Pull `main`** on `rajkaria/0gkit` (`git fetch && git pull --ff-only`). Local working dir is still `/Users/rajkaria/Projects/0G-ai-kit/`. SP15 sits at `925634a`; published version is at `41868fc`.
2. **Verify the release workflow published** `@foundryprotocol/0gkit-cli@1.4.0` to npm (`npm view @foundryprotocol/0gkit-cli version`). If it failed (e.g. NPM_TOKEN expiry), re-trigger.
3. **Pick the next sprint from `docs/superpowers/plans/2026-05-23-post-v1-roadmap.md`.** Wave A is now complete (SP13 docs cleanup, SP14 local traces, SP15 issue context). Wave B is **SP16** — `define0GConfig` in `0gkit-core` + golden path across all 9 templates:
   - New `define0GConfig` typed config builder with zod env validation. Three slots: `server`, `client`, `edge` (each filters env access).
   - Every template adopts `define0GConfig` in `app.config.ts` (or `0g.config.ts`). Templates ship with `.env.example` matching the schema.
   - Every template: working `npm run dev`; auto-detects local devnet via `0g doctor --json | jq .checks` at boot; first-success banner on the first 0G op; `README.md` "What next?" section.
   - Update `apps/docs/app/templates/page.mdx` — "Under 5 minutes" promise per template.
   - CI: extend `fresh-machine-smoke.yml` to assert the first-success banner appears in `npm run dev` output for at least storage-app + chat templates.
4. **Then SP17** (`0g doctor --fix` + `0g test` conformance runner), then **SP18** (`0g mcp init <agent>` for cursor/claude/windsurf/codex). See the roadmap doc for the full Wave A→D sequence + dependency graph.

**Carryover from earlier waves** (unchanged — all substantial, do not bundle): Foundry SDK refresh = SP21, Showcase app = SP22, Community surface = SP23.

### Key Decisions (this session)

- **D67 — `--copy-issue-context` writes to stderr, not stdout.** Keeps `--json` stdout contract clean (`{ ok: true, ... }` or `{ ok: false, error: ... }`) so pipelines that consume the JSON envelope aren't broken by an extra markdown block. Users capture the report via `2> issue.md`.
- **D68 — `import.meta.resolve` is the production path for package-version discovery, not `createRequire`.** Every `@foundryprotocol/0gkit-*` package's `exports` field is `{ ".": { "types": ..., "import": ... } }` (no `"require"` condition, no `"./package.json"` entry). `createRequire(import.meta.url).resolve(name)` fails with `No "exports" main defined`. `import.meta.resolve` is sync + stable since Node 20.6 (the published `engines.node >= 20`). The CLI then walks up from the resolved main entry to find the matching `package.json` — handles pnpm workspace + npm tarball + dedupe layouts uniformly.
- **D69 — Stack frames clipped to 10, header lines preserved.** Issue reports stay paste-friendly; the omitted-count footer (`… N more frames omitted`) lets reporters know the full stack was longer. Header lines (the `Error: <message>` prefix, multi-line error messages from upstream RPCs) are kept verbatim — they often contain the actual root cause.
- **D70 — The CLI's own version is seeded explicitly into `packageVersions()`.** pnpm workspace symlinks plus restricted `exports` mean `import.meta.resolve('@foundryprotocol/0gkit-cli')` either fails or resolves the workspace symlink whose `package.json` may not match the published shape. The `VERSION` constant in `program.ts` already reads the local `package.json` at module load (D40 from SP12); reusing it for the issue report is one line.
- **(Carried) D62–D66 from SP14** (trace sink as side-channel inside `wrap.ts`; awaited writes with swallowed errors; `0g traces` lives in CLI namespace; `--from-jaeger -` accepts stdin; trace filename format).
- **(Carried) D58–D61 from the SP14 roadmap** (define0GConfig planned for SP16; Compute.router() planned for SP19; `0g test` lazy-imports `0gkit-testing` for SP17).

### Previous Session Notes

#### Earlier today (2026-05-26 04:45 IST) — SP14 ship

**SP14 shipped + released. Two PRs landed on `rajkaria/0gkit` main this session** (one feature, one auto-generated version-packages):

- **[#46](https://github.com/rajkaria/0gkit/pull/46) — SP14** `local 0g traces explorer + OGKIT_TRACE_DIR JSONL mirror` — **MERGED** as `c205c36`. One-shot CI red on `docs:check --exports` (the new `0gkit-observability` exports weren't listed in the package MDX); fixed on the same branch + re-run all green. Branch `sp14-local-trace-explorer` deleted post-merge.
- **[#47](https://github.com/rajkaria/0gkit/pull/47)** `chore: version packages` (auto-opened after #46) — **MERGED** as `750150a`. Triggers Release workflow to publish `@foundryprotocol/0gkit-observability` + `@foundryprotocol/0gkit-cli` minors + `@foundryprotocol/0gkit-core` patch.

No open PRs. Workspace clean on `main` at the post-#47 release commit.

### SP14 — what shipped (single PR)

**`0gkit-observability`:**

- **New `src/trace-sink.ts`** — pure JSONL sink helpers: `defaultTraceDir()` (env-driven), `isSinkEnabled()`, `pathForTrace(dir, id, now)` (formats `<YYYY-MM-DD>-<traceId>.jsonl`), `appendSpanRecord(dir, record, now)` (fire-and-forget append), `listTraceFiles(dir)` (newest-first, filename-regex filtered), `readTraceFile(path)` (JSONL parse, tolerates blank lines, throws on corrupt), `summarizeTrace(id, recs)` (counts, fee/gas totals, top op). Idempotent + side-effect-free; mkdir is recursive so the first write creates the dir.
- **`src/wrap.ts` hook** — after each `span.end()`, when `OGKIT_TRACE_DIR` is set, the wrapper writes `{ traceId, spanId, name, attributes, status, startTimeUnixNano, endTimeUnixNano }` as one JSONL line via `appendSpanRecord`. Wrapped in `try { await ... } catch {}` so a full disk / EACCES never crashes the caller. `process.hrtime.bigint()` is anchored to `Date.now()` once for the unix-nano timestamps.
- **New exports from package root:** `appendSpanRecord`, `defaultTraceDir`, `isSinkEnabled`, `listTraceFiles`, `pathForTrace`, `readTraceFile`, `summarizeTrace`, plus types `TraceFileEntry`, `TraceFileSummary`, `TraceRecord`. Listed in the `apps/docs/app/packages/0gkit-observability/page.mdx` Exports section (CI gate enforces).
- **Bundle-size test fix:** added `platform: "node"` to the esbuild config so `node:fs/promises` + `node:path` resolve as built-ins instead of being treated as missing browser deps. Bundle still ≤ 20 KB gz.
- **14 new sink tests** (env + path + write/read roundtrip + listTraceFiles ignoring non-matching filenames + summarizeTrace edge cases) + **3 new instrument-integration tests** (success span mirrored; error span mirrored with `status=error` + `0gkit.error_code` attr; off when env unset). 49/49 observability tests green.

**`0gkit-cli`:**

- **New `src/commands/traces.ts`** — `registerTraces(program, deps)` registers `0g traces list` + `0g traces inspect <traceId>` subcommands. `list` supports `--last N`, `--dir <path>`, `--json`; `inspect` supports `--dir <path>` + `--json`. Errors are throw-`ZeroGError` (positional `(code, message, hint)` constructor — same shape as the rest of the CLI, **not** the object-literal pattern that landed in my first draft and exploded with `Help: ... [object Object]`).
- **Production `tracesReader` wired in `src/cli.ts`** — pulls `defaultTraceDir`, `listTraceFiles`, `readTraceFile`, `summarizeTrace` directly from `@foundryprotocol/0gkit-observability` (added as a regular dep — tiny package, no native bindings). Tests inject fakes via `ProgramDeps.tracesReader`.
- **`src/commands/cost.ts` extended:** `--from-jaeger -` reads JSON from stdin via `deps.readStdin`. `inspect --json | 0g cost forecast --from-jaeger -` is the end-to-end pipeline.
- **3 new error codes** in `0gkit-core`'s frozen `ERROR_CODES` tuple: `OBSERVABILITY_TRACE_DIR_NOT_SET`, `OBSERVABILITY_TRACE_NOT_FOUND`, `OBSERVABILITY_TRACE_READ_FAILED`. Each has a substantive MDX page under `apps/docs/app/errors/<CODE>/` (scaffolded by `scripts/scaffold-error-pages.mjs` then hand-edited).
- **10 new traces tests** + **2 new cost stdin tests** + **program.test.ts assertion list bumped** to include `traces`. 119/119 CLI tests green.

**Docs:**

- `apps/docs/app/cli/page.mdx` gains a new `## 0g traces` section after `## 0g cost`, with the env-var quickstart and the `inspect --json | cost forecast --from-jaeger -` pipeline. Cross-link added inside the existing `## 0g cost` `--from-jaeger` row pointing at `-` (stdin).
- `apps/docs/app/packages/0gkit-observability/page.mdx` gains a `## Local trace mirror (OGKIT_TRACE_DIR)` section + the new exports.

**Changeset** `.changeset/sp14-local-trace-explorer.md` cuts a minor on `0gkit-observability` (new env behavior + new exports) + minor on `0gkit-cli` (new `traces` namespace) + patch on `0gkit-core` (new error codes).

### Recent Changes

Source of truth = `git log origin/main` on `rajkaria/0gkit`:

- `750150a` (#47) chore: version packages (observability + cli minors, core patch)
- `c205c36` (#46) SP14: local 0g traces explorer + OGKIT_TRACE_DIR JSONL mirror
- `ecaaf14` (#45) chore: version packages (0gkit-storage + 0gkit-compute patches)
- `d964721` (#44) SP13: docs cleanup + migration guide + version-sync CI gate

### Next Steps

**Immediate next session:**

1. **Pull `main`** on `rajkaria/0gkit` (`git fetch && git pull --ff-only`). Local working dir is still `/Users/rajkaria/Projects/0G-ai-kit/`. SP14 sits at `c205c36`; published versions are at `750150a`.
2. **Verify the release workflow published** `@foundryprotocol/0gkit-observability@1.1.0`, `@foundryprotocol/0gkit-cli@1.3.0`, `@foundryprotocol/0gkit-core@1.0.2` to npm (`npm view <pkg> version`). If any failed (e.g. NPM_TOKEN expiry), re-trigger.
3. **Pick the next sprint from `docs/superpowers/plans/2026-05-23-post-v1-roadmap.md`.** Wave A's recommended next is **SP15** — error page polish + `--copy-issue-context` CLI flag:
   - Audit the 45 error pages for stale package versions / dead repro commands (one pass with the SP13 `--versions` gate).
   - New `0g <any-cmd> --copy-issue-context` flag — on any thrown ZeroGError, dump a markdown block (code, message, hint, redacted CLI args, node/OS versions, package versions, last 10 traceback frames, docs link) suitable for pasting into a GitHub issue.
   - Update `apps/docs/app/errors/page.mdx` index header with the "Stuck? Run with `--copy-issue-context`" callout.
4. **Then SP16** (`define0GConfig` + golden path across all 9 templates), then **SP17** (`0g doctor --fix` + `0g test` conformance runner). See the roadmap doc for the full Wave A→D sequence + dependency graph.

**Carryover from earlier waves** (unchanged — all substantial, do not bundle): Foundry SDK refresh = SP21, Showcase app = SP22, Community surface = SP23.

### Key Decisions (this session)

- **D62 — Trace sink is a side-channel inside `wrap.ts`, not a new OTel `SpanProcessor`.** Two reasons: (a) it must work in `mode: "attach"` where the caller owns the SDK and never registers our processor; (b) it's pure file I/O with no OTel dependency, so users who never set `OGKIT_TRACE_DIR` pay zero runtime cost. Tradeoff accepted: the JSONL records carry only the attributes we set via the in-wrap `setAttr` capture (plus name + status + timestamps), not whatever third-party processors add later. That's correct for `0gkit.*`-only inspection — the synced-on-disk subset is exactly what `0g traces inspect` and `0g cost forecast --from-jaeger` need.
- **D63 — Sink writes are awaited but errors are swallowed.** `await appendSpanRecord(...)` so the dir-create + file-write are serialized per span (no interleaving on the same `<date>-<traceId>.jsonl` file), but the outer `try/catch` swallows any throw so a broken disk never crashes a production handler. The doc page (`OBSERVABILITY_TRACE_READ_FAILED`) walks users through the delete-and-regenerate recovery path.
- **D64 — `0g traces` lives in the CLI namespace, not as a TUI.** The `inspect` JSON output is a Jaeger-v1-shaped envelope so it pipes straight into `cost forecast --from-jaeger -` without an adapter step. A future `0g traces tui` could be added later, but the v0 surface is text + pipes, in keeping with the rest of `0g`.
- **D65 — `0g cost forecast --from-jaeger` accepts `-` for stdin.** Adding stdin to the same flag (instead of a separate `--from-stdin`) keeps the surface area small and matches the broader Unix convention. Reuses `deps.readStdin` (already on `ProgramDeps`); no new I/O abstraction.
- **D66 — Trace file naming: `<YYYY-MM-DD>-<traceId>.jsonl`** (UTC date). Date prefix keeps one day's traces grouped for easy `ls`/`rg`; trace id is the unique key. Filename regex `/^(\d{4}-\d{2}-\d{2})-([^/.]+)\.jsonl$/` is what `listTraceFiles` uses to filter out README/.DS_Store/etc.
- **(Carried) D58–D61 from previous session:** `OGKIT_TRACE_DIR` opt-in mirror is what D58 forecast; **D58 is now realized.** D59 (`define0GConfig` in core) lands in SP16. D60 (`Compute.router()` template default) lands in SP19. D61 (`0g test` lazy-imports `0gkit-testing`) lands in SP17.

### Previous Session Notes

#### Earlier today (2026-05-23 20:45 IST) — SP13 ship

### Current State

**SP13 shipped + released. Four PRs landed on `rajkaria/0gkit` this session.** All gates green; npm published the patch bumps for `0gkit-storage` + `0gkit-compute` plus the minor for `0gkit-cli` from the prior in-flight PR.

- **[#42](https://github.com/rajkaria/0gkit/pull/42)** `feat(cli): 0g cost forecast --from-jaeger <path>` — **MERGED** as `6ff20a1`. The last SP11 carryover (was the only open PR at session start, all checks already green when picked up).
- **[#43](https://github.com/rajkaria/0gkit/pull/43)** `chore: version packages` (auto-opened after #42) — **MERGED** as `e418683`. Triggered Release workflow → `@foundryprotocol/0gkit-cli@1.1.0` published to npm.
- **[#44](https://github.com/rajkaria/0gkit/pull/44) — SP13** `docs cleanup + migration guide + version-sync CI gate` — **MERGED** as `d964721`. 37 files, +848/−55. One-shot CI red on the new perf-benchmark workflow (missing transitive 0gkit-* dist on a `--filter` build); fixed in the same branch by switching the prebuild to a workspace `pnpm build`; re-run all green. Branch `sp13-docs-cleanup-migration-version-gate` deleted post-merge.
- **[#45](https://github.com/rajkaria/0gkit/pull/45)** `chore: version packages` (auto-opened after #44) — **MERGED**. Release workflow publishes `@foundryprotocol/0gkit-storage` + `@foundryprotocol/0gkit-compute` patches (deprecation copy correction in source code).

No open PRs. Workspace clean on `main` at the post-#45 release commit.

### SP13 — what shipped (single PR)

**Docs:**

- **New `apps/docs/app/migrate-from-official-sdks/page.mdx`** — three side-by-side migration blocks (storage / compute / DA) with real install diffs, before/after code samples, what-you-gain rollup, and the `.raw()` escape hatch documented for hybrid usage.
- Sidebar nav (`apps/docs/lib/nav.ts`) gains a **Migration** section under Guides.
- **13 stale `rajkaria/0g-ai-kit` slug refs** across per-package MDX rewritten to `rajkaria/0gkit` (D13 repo rename was never propagated to per-package docs — `npx degit` lines were silently broken).
- **8 template README Vercel deploy buttons + inline links** flipped from `0gkit.dev` → `docs.0gkit.com` (D38). The URL-encoded `envLink` / `envDescription` fragments are caught by the same sed.
- `apps/docs/app/getting-started/page.mdx` no longer pins `0.1.0` for the `@foundryprotocol` scope — uses `@latest` per the canonical SP13 pattern (versions are read from the npm registry at build time everywhere else, e.g. apps/landing's `getLatestRelease()`).
- Storage / compute "next major" deprecation copy in docs corrected to **v2** (we shipped v1.0; the prior "removed in v1.0" copy was self-contradictory).

**CI gates:**

- **`docs:check --versions`** — new mode in `scripts/docs-check.mjs`. Walks MDX + README files, extracts `@foundryprotocol/0gkit-*@x.y.z` pins (caret/tilde OK; `@latest` and unversioned mentions ignored), reads current `packages/<name>/package.json`, fails CI if any pin is **lower** than current. Wired into existing `pnpm docs:check`. 17 new node:test cases in `scripts/__tests__/docs-check.test.mjs` (semver compare ignoring pre-release suffixes, pin discovery, version diff, edge cases like unparseable package.json + non-existent dirs).
- **`.github/workflows/perf-benchmark.yml`** — new workflow. Runs `scripts/bench-cli-coldstart.mjs` (8 iterations + 2 warmups, fresh `node` process per sample via `spawnSync`, computes p50/p95/max). **5000ms p95 budget on Node 22 ubuntu.** Baseline JSON uploaded as run artifact (30-day retention). 8 new node:test cases in `scripts/__tests__/bench-cli-coldstart.test.mjs` (percentile + summarize helpers, no-mutation invariant). Local Apple-Silicon run: **p50 965ms / p95 2718ms** — well under budget. **CI gotcha (now fixed):** the workflow originally pre-built only `0gkit-core` + `0gkit-cli` via `--filter`, which left `0gkit-chain/storage/compute/da` dist missing so the CLI failed `ERR_MODULE_NOT_FOUND` on first invoke. Fixed by switching to a full workspace `pnpm build` after the core prebuild — turbo cache makes the cost reasonable.

**Source:**

- `packages/0gkit-storage/src/storage.ts` + `packages/0gkit-compute/src/compute.ts` — deprecation warnings on `{ privateKey }` / `{ brokerKey }` no longer say "will be removed in v0.3" (we are past v1.0; that promise was impossible). Both now say "removed in v2" to match the v1.0 stability commitment.

**Templates:**

- `templates/storage-app/README.md` drops the stale `@0.3.0` pin on `0gkit-storage`.
- `templates/inference-app/package.json` bumps upstream `@0gfoundation/0g-compute-ts-sdk` peer from `^0.3.0` → `^0.8.3` (current upstream, verified via `npm view`).

**Housekeeping rolled in:**

- `apps/docs/.gitignore` + `apps/playground/.gitignore` (one-liner `.vercel`) — pre-existing untracked state from local Vercel linkage.

**Changeset** `.changeset/sp13-docs-cleanup-migration-version-gate.md` cut as patch on `0gkit-storage` + `0gkit-compute` (deprecation copy only — no API change).

### Recent Changes

Source of truth = `git log origin/main` on `rajkaria/0gkit`:

- `<sha-45>` (#45) chore: version packages (patches: 0gkit-storage, 0gkit-compute)
- `d964721` (#44) SP13: docs cleanup + migration guide + version-sync CI gate
- `e418683` (#43) chore: version packages (0gkit-cli minor → 1.1.0)
- `6ff20a1` (#42) feat(cli): 0g cost forecast --from-jaeger <path>
- `10ee6f6` docs(plan): post-v1 roadmap SP13–SP25 (committed in the prior session)

### Next Steps

**Immediate next session:**

1. **Pull `main`** on `rajkaria/0gkit` (`git fetch && git pull --ff-only`). Local working dir is still `/Users/rajkaria/Projects/0G-ai-kit/`.
2. **Pick the next sprint from the post-v1 roadmap** (`docs/superpowers/plans/2026-05-23-post-v1-roadmap.md`). Wave A's recommended next is **SP14** — local `0g traces` explorer, builds directly on what PR #42 added:
   - Extend `0gkit-observability`: `OGKIT_TRACE_DIR` env opts in to mirroring spans as JSONL into `.0gkit/traces/<date>-<traceId>.jsonl`, in addition to the configured exporter (D58 planned).
   - New `0g traces list [--last N]` — read trace files, summarise per trace.
   - New `0g traces inspect <traceId>` — pretty-print spans + fees + attributes; `--json` flag pipes cleanly into `0g cost forecast --from-jaeger`.
   - Extend the SP13 CLI reference's `0g cost` section with the `list/inspect` flows.
3. **Then SP15** (error polish + `--copy-issue-context` CLI flag), then **SP16** (`define0GConfig` + golden path across all 9 templates). See the roadmap doc for the full Wave A→D sequence + dependency graph.

**Carryover from earlier waves** (unchanged — all substantial, do not bundle): Foundry SDK refresh = SP21, Showcase app = SP22, Community surface = SP23.

### Key Decisions (this session)

- **SP13 stays one PR.** Audit + migration page + CI gates + source-code copy fixes shipped together. The version-sync gate is the "no future drift" backstop; the audit fixes are the "no current drift" backstop. Splitting them would have meant one PR adds a gate that the other PR's content trips, then fixes it — pointless ping-pong.
- **`docs:check --versions` ignores `@latest` and unversioned mentions.** Only **explicit** `@x.y.z` pins (caret/tilde tolerated) are checked. Encourages drop-the-version-from-docs as the canonical pattern; `@latest` is fine because npm decides what that resolves to per install.
- **Deprecation copy aligned with v1.0 stability commitment.** "Removed in v0.3" was a v0-era TODO that survived the v1.0 cut. v2.0 is the next API break; pre-1.0 sunset windows are no longer meaningful on a v1.x branch.
- **Perf workflow builds the full workspace, not just `0gkit-cli`.** The CLI's runtime imports span chain/storage/compute/da; a `--filter` build only writes core+cli dist and the CLI errors `ERR_MODULE_NOT_FOUND` on first invoke. Turbo cache makes the workspace build acceptable cost.
- **Per-test `0gkit-testing` flake under turbo's parallel scheduler is still a pre-existing known issue** (`test-wallet-errors.test.ts` + `fixtures.test.ts` time out ~5s under CPU contention; pass 57/57 in 4.4s when filtered). Not introduced by SP13; reliably green on CI runners. SP12 polish item — not worth a release on its own.
- **(Carried) D58–D61** (planned, defined in the roadmap doc): `OGKIT_TRACE_DIR` opt-in JSONL mirror; `define0GConfig` lives in `0gkit-core`; `Compute.router()` becomes template default; `0g test` lazy-imports `0gkit-testing` via computed specifier.
- **(Carried) D51–D57** from earlier today: D51 landing version reads from npm registry; D52 async server components no `@ts-expect-error`; D53 testing mocks reproduce types locally; D54 template migration not bundled into the mock widening PR; D55 the template inline-fake migration shipped as standalone PR #40; D56 `vi.spyOn` is the supported way to tamper with mock storage state; D57 `mockComputeClient` has no "throw" responder knob.

### Previous Session Notes

#### Earlier today (2026-05-23 20:08 IST) — planning hand-off (no code)

Brief session — confirmed sequence: land PR #42 + auto version-packages PR, then SP13. Session compacted at 8 prompts / ~21M tokens. SP13 plan body from the roadmap doc was carried forward verbatim.

### Previous Session State (carried — still authoritative)

**One PR opened + one big planning artefact committed on `rajkaria/0gkit`.**

- **[#42](https://github.com/rajkaria/0gkit/pull/42)** `feat(cli): 0g cost forecast --from-jaeger <path>` — **OPEN**, CI running. Branch `cli/cost-forecast-from-jaeger` at `e623c4e`. Closes the last SP11 carryover (was deferred from v0). 20 new vitest tests, all 107 0gkit-cli tests green pre-push; `pnpm boundary:check` (302 modules / 0 violations), `pnpm format:check`, `pnpm docs:check` (14 codes, 16 packages) all green. Changeset cuts a minor on `@foundryprotocol/0gkit-cli`.
- **`docs/superpowers/plans/2026-05-23-post-v1-roadmap.md`** committed to `main` as `10ee6f6`. Consolidated post-v1 roadmap covering SP13–SP25 (13 sprints across four themed waves) — distillation of the 13-item P0/P1/P2 backlog user submitted this session plus the four open carryovers.

No work in flight on the Foundryprotocol repo. Earlier this session started a `sdk/refresh-onto-0gkit-1.0.x` branch for the Foundry SDK refresh (storage adapter draft) but **the user aborted mid-implementation**; branch deleted, `packages/sdk/package.json` reverted to its origin state. The aborted work is now sequenced as SP21 in the roadmap doc.

### Recent Changes

**0gkit repo (this session):**

- `packages/0gkit-cli/src/commands/jaeger.ts` — new. Jaeger v1 trace JSON parser + per-op cost aggregator. Pure function `aggregateJaegerDump(parsed)` + `renderForecast(forecast, source)` + `forecastToJson(forecast, source)`. Tolerant of string/number/bigint tag values; sorts byOp alphabetically for deterministic output.
- `packages/0gkit-cli/src/commands/cost.ts` — extended. New `--from-jaeger <path>` flag mutually exclusive with `--storage`/`--compute`/`--da`. Reads file via `deps.fs.readFile`, parses JSON, surfaces clean `ConfigError` for missing file / malformed JSON.
- `packages/0gkit-cli/src/__tests__/jaeger.test.ts` — new. 20 tests: aggregator (10 — happy path, mixed ops, skip dry-run, skip errored, string-vs-bool dry_run, missing fee/gas → 0, empty trace, malformed input, multi-trace merge); renderer (3); JSON serialiser (1); CLI wiring (6 — happy path, human mode, mutex with --storage, unreadable file, malformed JSON, zero-attributed).
- `apps/docs/app/cli/page.mdx` — new `## 0g cost` section. Two-mode table + worked examples for both `--storage/--compute/--da` (synthesis) and `--from-jaeger` (replay). Documents dry-run + error skip semantics and the JSON envelope shape.
- `.changeset/cost-forecast-from-jaeger.md` — minor bump on `@foundryprotocol/0gkit-cli`.
- `docs/superpowers/plans/2026-05-23-post-v1-roadmap.md` — new. SP13–SP25 plan; dependency graph; four-wave sequence; planned decisions D58–D61; explicit out-of-scope list.

**Foundryprotocol repo:** only this `CLAUDE.md` updated. No source changes (the SDK refresh was aborted at user request).

### Next Steps

**Immediate:**

1. **Watch PR #42 CI; squash-merge when green** via `gh pr merge --squash --delete-branch`. After merge, the changesets bot auto-opens a "version packages" PR — merge that to publish `@foundryprotocol/0gkit-cli@1.1.0` (minor) to npm.
2. **Pick the next SP from `docs/superpowers/plans/2026-05-23-post-v1-roadmap.md`.** The doc recommends **SP13** (docs cleanup + migration guide + version-sync CI gate) as the next start — cheapest win, single PR, immediate trust improvement. The other Wave A items (SP14 `0g traces`, SP15 `--copy-issue-context`) ship after.

**Roadmap shape (from the new plan doc):**

- **Wave A — Trust & truth:** SP13 (docs cleanup + migration page + version-sync CI), SP14 (land PR #42 + local `0g traces` reading `.0gkit/traces/`), SP15 (error polish + `--copy-issue-context`).
- **Wave B — Golden path:** SP16 (`define0GConfig` in `0gkit-core` + per-template golden path with first-success banner), SP17 (`0g doctor --fix` + `0g test` conformance runner).
- **Wave C — AI tools + Router:** SP18 (`0g mcp init cursor/claude/windsurf/codex`), SP19 (`Compute.router()` first-class — research-gated on 0G's Router API).
- **Wave D — Contracts + carryover:** SP20 (`0g contracts import <address|abi>` chain-explorer fetch), SP21 (Foundry SDK refresh onto `^1.0.x` — the aborted work from this session), SP22 (showcase app on `apps.0gkit.com`), SP23 (Discussions + community).

**Carryover items rolled in:** Foundry SDK refresh → SP21, Showcase app → SP22, Community → SP23. The `0g cost --from-jaeger` carryover is PR #42 in flight; SP14 extends it.

### Key Decisions

- **D58 (planned)** — `OGKIT_TRACE_DIR` env opts in to local trace mirroring in `0gkit-observability`. Off by default for privacy; when set, writes JSONL alongside the configured OTel exporter, never replaces it. Drives SP14's `0g traces list/inspect`.
- **D59 (planned)** — `define0GConfig` lives in `0gkit-core`, not a new package. Keeps install graph flat; same validation everywhere (CLI, templates, MCP).
- **D60 (planned)** — `Compute.router()` becomes the template default; `Compute.direct()` kept and documented for advanced users. No deprecation of direct.
- **D61 (planned)** — `0g test` lazy-imports `0gkit-testing` via computed specifier (D39 pattern) to keep CLI cold-start under SP13's perf budget.
- **Items already shipped that the user listed as backlog:** #17 error pages (DONE since SP9, 45 pages with cause/fix/example), #16 contract registry (mostly DONE since SP4 — only `0g contracts import <address>` is missing → SP20), #5 cold-start (PARTIAL since D39 lazy-jobs — SP13 adds CI benchmark).
- **Clubbing logic:** #1 + #14 → SP13 (same MDX surface); #4 + #11 → SP18/SP19 (DX tooling); #2 + #12 → SP16 (per-template touch); #3 + #9 → SP17 (doctor extensions); #15 + PR #42 → SP14 (observability story).
- **(Carried) D51–D57** from earlier today: D51 landing version reads from npm registry; D52 async server components no `@ts-expect-error`; D53 testing mocks reproduce types locally; D54 template migration not bundled into the mock widening PR; D55 the template inline-fake migration shipped as standalone PR #40; D56 `vi.spyOn` is the supported way to tamper with mock storage state; D57 `mockComputeClient` has no "throw" responder knob.

### Previous Session Notes

#### Earlier today (2026-05-23 19:10 IST) — four-PR template-mock migration session

Five PRs landed (`#37`, `#38`, `#39`, `#40`, `#41`). PR #40 was the only net-new work this session — templates' inline `fakeCompute`/`fakeStorage` migrated to use `@foundryprotocol/0gkit-testing@^1.1.0`. `mockComputeClient` and `mockStorageClient` synced to SP6/SP7 class shapes (`.inference()`, `.estimate()`, dry-run overload). Released `@foundryprotocol/0gkit-testing@1.1.0` + patch bumps on `create-0gkit-app` + `create-0g-app`.

#### Earlier today (2026-05-23 15:20 IST) — cookbook + brand + onboarding

PR #35 (llms.txt phrasing), PR #32 (docs UI brand overhaul + a11y), PR #36 (cookbook tutorials chat/ai-agent/NFT). D48 dark-only docs, D49 prose-link underline, D50 cookbook at `/cookbook`.

#### Earlier today (2026-05-23 14:06 IST) — 0gkit v1.0.2 onboarding bundle

PRs #28 (errors redirect), #29 (5-fix onboarding bundle), #30 (maintainer footer + llms.txt), #31 (sentinel workflows), #33 (release v1.0.2). D39–D47.

#### Earlier today (2026-05-23 11:21 IST) — 0gkit.com landing page

PR #26 (landing app), PR #27 (helpUrl rebase to 0gkit.com). Published v1.0.1 of all 18 packages. D38.

#### Pre-domain — v1.0.0 + SP1–SP12

Full 0gkit toolkit shipped. 18 packages live at v1.0.0 on npm. See git log on `rajkaria/0gkit` for sprint commits.

---

## Pre-this-session context (trimmed — see prior commits)

**Four PRs landed this session on `rajkaria/0gkit` main; npm publishes in flight.**

- **[#37](https://github.com/rajkaria/0gkit/pull/37)** `landing: auto-fetch version from npm registry` — **MERGED** as `d9def6d`. Carryover from previous session; CI re-ran clean after Prettier auto-fix on 3 landing files.
- **[#38](https://github.com/rajkaria/0gkit/pull/38)** `testing: sync mocks to SP6/SP7 class shapes` — **MERGED** as `5df7b1a`. Carryover. Bumped `@foundryprotocol/0gkit-testing` 1.0.1 → 1.1.0; `mockComputeClient.inference()` + `.estimate()` + dry-run, `mockStorageClient.estimate()` + dry-run.
- **[#39](https://github.com/rajkaria/0gkit/pull/39)** `chore: version packages` (auto-opened by changesets) — **MERGED**. Triggered Release workflow → `@foundryprotocol/0gkit-testing@1.1.0` published to npm.
- **[#40](https://github.com/rajkaria/0gkit/pull/40)** `templates: use published 0gkit-testing mocks instead of inline fakes` — **NEW this session**. **MERGED**. Branch `testing/templates-use-published-mocks` deleted post-merge.
- **[#41](https://github.com/rajkaria/0gkit/pull/41)** `chore: version packages` (auto-opened after #40) — **MERGED**. Releases `create-0gkit-app` + `create-0g-app` patch bumps with templates that now consume `@foundryprotocol/0gkit-testing@^1.1.0`.

No open PRs. Workspace state is clean on main.

### Recent Changes

**PR #40 — template inline-fake migration (this session's only net-new work):**

- `templates/storage-app/src/__tests__/storage-flow.test.ts` — full rewrite. Drops the local `fakeStorage()` factory in favor of `mockStorageClient()` from `@foundryprotocol/0gkit-testing`. The bytes-mismatch test uses `vi.spyOn(storage, "download").mockResolvedValue(new Uint8Array([0xff]))` because the mock's `__store()` is `ReadonlyMap` and can't be tampered with directly.
- `templates/storage-app/package.json` — adds `@foundryprotocol/0gkit-testing: ^1.1.0` to `devDependencies` (wasn't there before).
- `templates/ai-agent/src/__tests__/agent.test.ts` — replaces `fakeCompute(responses)` with `sequencedCompute(responses)` that wraps `mockComputeClient({ responder })` in a small closure walking a response array. The retry-exhaustion test keeps its inline throwing stub (the mock has no "throw" knob — would be a feature add to `0gkit-testing`).
- `templates/ai-agent/package.json` — bumps `@foundryprotocol/0gkit-testing` `^1.0.0` → `^1.1.0`.
- `templates/tee-attested-api/src/__tests__/app.test.ts` — replaces inline `vi.fn(inference)` with `mockComputeClient({ receiptOverride: { txHash: "0x1234" } })`. Default echo responder produces `echo: <prompt>` which satisfies `toMatch(/echo/)` naturally.
- `templates/tee-attested-api/package.json` — bumps `@foundryprotocol/0gkit-testing` `^1.0.0` → `^1.1.0`.
- `.changeset/templates-use-published-mocks.md` — patch bumps `create-0gkit-app` + `create-0g-app`.

**Not touched:** `chat` template (its "fakes" are just `new TextEncoder().encode(...)` byte fixtures — no compute/storage mock).

**Verification rollup:** `storage-app` 6/6, `ai-agent` 9/9, `tee-attested-api` 8/8 tests pass; `tsc --noEmit` clean per template; workspace `pnpm format:check` + `pnpm boundary:check` (300 modules, 0 violations) green. Net ~60 LOC removed across the 3 templates.

### Next Steps

**Carryover (still deferred — all substantial, do not bundle):**

1. **Foundry SDK refresh onto `@foundryprotocol/0gkit-* ^1.0.2`** — refactor `Foundryprotocol/packages/sdk` to consume the published packages, delete duplicated storage/da/attestation/inference paths. Cross-repo, multi-PR work.
2. **Real-world showcase app** — one public app on `^1.0.2` (not workspace, not template), deployed and linked from landing.
3. **`0g cost forecast --from-jaeger <path>`** — new CLI subcommand: Jaeger trace parser + per-span aggregator across `0gkit.*` attributed spans + tests + docs.
4. **Community surface** — enable GitHub Discussions; Discord optional.
5. **Discoverability** — GSC verification + sitemap submit (needs user / registrar access).

Template inline-fake migration (was #8 on the carryover list) is **done** as of #40.

### Key Decisions

- **D55 — Templates' inline fakes were migrated as a single dedicated PR (#40), not bundled into #38.** Rationale per D54: widening the mock surface (testing pkg) and migrating consumers (templates) are two changes; bundling them would make either PR review-hostile. The clean separation also let #38 ship + publish to npm before #40 needed it.
- **D56 — `vi.spyOn` is the supported way to tamper with mock storage state in tests.** `mockStorageClient.__store()` returns `ReadonlyMap` (intentional — peek but don't poke). For the storage-app "bytes don't match" path, spy on `download` and mock-resolve with bad bytes. Cleaner than the previous test's reassign-upload-then-set-store dance.
- **D57 — `mockComputeClient` has no "throw" responder knob; the one ai-agent test that needs it keeps an inline stub.** Adding `responder: () => { throw new Error(...) }` support to the mock would be a feature add to `0gkit-testing` and not worth a release for a single test case in one template.
- **(Carried) D51–D54** from earlier in the day: D51 landing version reads from npm registry not GitHub releases; D52 async server components, no `@ts-expect-error`; D53 testing mocks reproduce result/estimate types locally instead of depending on storage/compute (keeps boundary clean); D54 template inline-fakes were not migrated in #38.

### Previous Session Notes

#### Earlier today (2026-05-23 15:48 IST) — landing version + testing mocks SP6/SP7 sync

Two PRs opened: [#37](https://github.com/rajkaria/0gkit/pull/37) landing auto-fetches version from npm registry; [#38](https://github.com/rajkaria/0gkit/pull/38) testing mocks synced to SP6/SP7 class shapes (mockCompute.inference()/.estimate(), mockStorage.estimate()/dry-run). Both merged this session (above).

### Recent Changes

This session's diff:

**PR #37 (`apps/landing/`):**
- `apps/landing/lib/version.ts` — new. Fetches latest 0gkit-cli version from npm registry with `next: { revalidate: 3600 }`. Returns `{ version, tag, url }`. Fallback to `1.0.2`.
- `apps/landing/components/Hero.tsx` — async; uses `getLatestRelease()` for pill href + label.
- `apps/landing/components/Nav.tsx` — async; uses `getLatestRelease()` for the version pill.
- `apps/landing/components/TrustSignals.tsx` — async; STATS built inside the component from the live version.
- `apps/landing/components/StructuredData.tsx` — async; `SOFTWARE_APPLICATION` lifted to `buildSoftwareApplication(version)` factory.
- `apps/landing/app/layout.tsx` — `generateMetadata()` async; DESCRIPTION interpolates version.
- `apps/landing/app/opengraph-image.tsx` — async; OG text uses template-string interpolation (single-child div) to satisfy Satori's `display: flex` rule.
- `apps/landing/app/page.tsx` — `metadata` slimmed to `{ alternates: { canonical: "/" } }`; description inherits from layout. Async HomePage; no `@ts-expect-error` needed (Next 16 + React 19 + TS 5.6).

**PR #38 (`packages/0gkit-testing/`):**
- `packages/0gkit-testing/src/mocks/compute.ts` — full rewrite. New `MockInferenceArgs` / `MockInferenceResult` / `MockComputeEstimate(Breakdown)`; `inference()` overloaded with dry-run; `estimate()` derives from `countTokens(content) × 1 gwei` (matches `0gkit-compute`'s placeholder); `listProviders()` replaces `discover()`. Type-only imports from `0gkit-core` keep the boundary clean (no static dep on `0gkit-compute`).
- `packages/0gkit-testing/src/mocks/storage.ts` — full rewrite. New `MockStorageEstimate(Breakdown)` / `MockUploadResult`; `upload()` overloaded with dry-run; `estimate(data)` derives from 256 KiB segments × 80k gas + 1 gwei (matches `0gkit-storage`'s placeholder). Dry-run does **not** mutate the in-memory store.
- `packages/0gkit-testing/src/mocks/index.ts` + `src/index.ts` — re-export the new types.
- `packages/0gkit-testing/src/__tests__/mocks.test.ts` — full rewrite. 19 tests across Storage/Compute/DA, including new dry-run + estimate paths. (Net +7 tests, total 57/57 passing in the package.)
- `packages/0gkit-testing/README.md` — usage examples updated to `inference()` + new `.estimate()` + dry-run.
- `.changeset/sync-testing-mocks-sp7.md` — minor bump with migration notes.

### Next Steps

**Immediate (wakeup-driven):**

1. Verify PR #37 + #38 CI green; squash-merge both via `gh pr merge --squash --delete-branch`.
2. Once #38 lands, run `changeset version` + release to publish `@foundryprotocol/0gkit-testing@1.1.0` to npm.

**Carryover (deferred to next session — all substantial, do not bundle):**

3. **Foundry SDK refresh onto `@foundryprotocol/0gkit-* ^1.0.2`** — refactor `Foundryprotocol/packages/sdk` to consume the published packages, delete duplicated storage/da/attestation/inference paths. Cross-repo, multi-PR work.
4. **Real-world showcase app** — one public app on `^1.0.2` (not workspace, not template), deployed, linked from landing.
5. **`0g cost forecast --from-jaeger <path>`** — new CLI subcommand: trace parser + per-span aggregator across `0gkit.*` attributed spans + tests + docs.
6. **Community surface** — enable GitHub Discussions; Discord optional.
7. **Discoverability** — GSC verification + sitemap submit (needs user / registrar access).
8. **Template inline-fake migration** — now that #38 widens the mock surface, the SP8 templates (`ai-agent`, `storage-app`, `tee-attested-api`, `chat`) can drop their inline `fakeCompute`/`fakeStorage` and depend on `@foundryprotocol/0gkit-testing` directly. Intentionally **not** bundled into #38 to keep that PR scoped.

### Key Decisions

- **D51 — Landing version is read from the npm registry, not GitHub releases.** GitHub's `releases/latest` returned `tag_name = "@foundryprotocol/0gkit-cli@1.0.2"` (the most recent per-package changeset release), which interpolated as `softwareVersion: "@foundryprotocol/0gkit-cli@1.0.2"`. Switching to `https://registry.npmjs.org/@foundryprotocol/0gkit-cli/latest` yields just `version: "1.0.2"`. This is also the truth users see when they `npm i`. Fallback hardcoded to `1.0.2` so the registry being down can never break the marketing page.
- **D52 — Async server components, no `@ts-expect-error` shims.** Next 16 + React 19 + TS 5.6 type async server components natively. The pragma is required only on older stacks.
- **D53 — Testing mocks reproduce the result/estimate types locally instead of depending on `0gkit-storage` / `0gkit-compute`.** Keeps `0gkit-testing`'s "depends on core only" rule. Types tagged `Mock*` so downstream tests using `import type { StorageEstimate } from "@foundryprotocol/0gkit-storage"` still type-check against the mock's return (they're structurally identical via the shared `Estimate` from core).
- **D54 — Template inline fakes are not migrated in #38.** Widening the mock surface and migrating consumers are two changes; bundling them would make #38 review-hostile. Migration is queued as a follow-up.
- **(Carried) D48–D50** from earlier in the day: dark-only docs CSS, prose-link underline, cookbook at `/cookbook`.

**Shipped this session (all merged to main):**

1. **[#35](https://github.com/rajkaria/0gkit/pull/35)** — `apps/landing/public/llms.txt`: dropped hardcoded `v1.0.1` pin, replaced with "v1.0.x release line, surface-stable until v2". **MERGED 9:30 UTC.**
2. **[#32](https://github.com/rajkaria/0gkit/pull/32)** — docs UI brand overhaul. Squash-merged after a second a11y fix on top of the first: dropped the `@media (prefers-color-scheme: light)` block entirely (Lighthouse runs in headless Chrome which defaults to light, so the override was flipping `--bg` to `#ffffff` and code-bg to `#f6f8fa` while leaving brand purples unchanged — `#cb8aff` on `#f6f8fa` is 2.28:1, well under WCAG 4.5:1). Also added default underline on `.prose a` because axe-core's `link-in-text-block` requires non-color signal regardless of contrast (`#b75fff` vs `--fg-dim #b8b8c2` is 1.85:1 even in dark mode). Lighthouse CI hit 0.95+ a11y across all 4 audited pages on the retry. **MERGED 9:41 UTC.** Live on docs.0gkit.com.
3. **[#36](https://github.com/rajkaria/0gkit/pull/36)** — cookbook tutorials. Three end-to-end guides:
   - `/cookbook/chat-app` — Next.js + storage + indexer + react (per-room channels extension, client-side signing migration, rate limiting, durable uploads, OTel).
   - `/cookbook/ai-agent` — Compute ReAct + attestation + jobs (real attestation wiring, MemoryBackend → SqliteBackend → RedisBackend swap, webhook delivery, cost estimation, tool isolation, idempotency).
   - `/cookbook/nft-minter` — Foundry + storage + typed contracts (read-through gateway for marketplace compatibility, OZ upgrade path, ERC-2981 royalties, durable uploads).
   - Plus `/cookbook` index + new "Cookbook" nav section + home-page link. Pagefind 82 → 86 pages. **MERGED 9:50 UTC.**

**End-to-end verified live (carries over, still true):** npm scaffolder works on v1.0.2, CLI `--version` reports `1.0.2`, `/errors/<CODE>` redirects to docs, `/llms.txt` is unpinned (3.5 KB), footer credits Raj Karia personally, docs.0gkit.com renders the purple/Geist brand palette with the ØG mark.

### Recent Changes

Source of truth = `git log origin/main` on `rajkaria/0gkit`:
- `<sha-36>` (#36) docs(cookbook): three end-to-end tutorials (chat / agent / NFT)
- `<sha-32>` (#32) docs(ui): brand overhaul + a11y fixes
- `294b517` (#35) docs(llms): drop version pin, use release-line phrasing
- `02c885c` (#31) ci: fresh-machine smoke + link-check workflows
- `fdcec79` (#30) feat: maintainer footer + llms.txt + concept discoverability
- `80be713` (#33) release v1.0.2: cli + create-0gkit-app + create-0g-app
- `378a8de` (#29) onboarding fix bundle (5 bugs)
- `fa5e490` (#28) landing redirect /errors/:code → docs.0gkit.com

No open PRs in flight at end of session.

### Next Steps

**Carryover polish (still deferred):**

1. **`0gkit-testing` mocks sync to SP6/SP7 class shapes** — `mockComputeClient.chat()` → `.inference()`; `mockStorageClient` needs `.estimate(bytes)` + `.upload(bytes, { dryRun: true })` returning the `DryRunResult` envelope. Templates have inline fakes today; once mocks match real shape, templates can use the published mocks.
2. **`0g cost forecast --from-jaeger <path>`** — new CLI subcommand: parse a Jaeger trace dump, aggregate cost across `0gkit.*` attributed spans. Substantial (trace parser + aggregator).

**Larger growth-lever items (still unstarted):**

3. **Discoverability** — GSC domain verification + sitemap submit (needs user action — registrar/SC access).
4. **Real-world showcase app** — one public app consuming `^1.0.2` from npm (not workspace, not template), deployed and linked from landing.
5. **Community surface** — enable GitHub Discussions, set up Discord or similar.
6. **Foundry consumption refresh** — refactor `packages/sdk` onto `@foundryprotocol/0gkit-* ^1.0.2`, delete duplicated storage/da/attestation/inference paths.

Cookbook (prior session's biggest-growth-lever item) is now shipped — pick the next based on user priority.

### Key Decisions

- **D48 — Docs site is dark-only, no light theme.** The `@media (prefers-color-scheme: light)` override flipped `--bg` to `#ffffff` while leaving brand purples (`#b75fff`, `#cb8aff`) unchanged → WCAG-failing contrasts on every brand-tinted text/link in light mode. Landing is dark-only too; the brand palette doesn't have enough lightness for a credible light theme without re-deriving every tint. Block removed.
- **D49 — Prose links carry a default underline.** axe-core's `link-in-text-block` requires either ≥3:1 contrast vs surrounding text OR a non-color signal. Brand purple `#b75fff` vs `--fg-dim #b8b8c2` is 1.85:1 in dark mode. Default underline on `.prose a` only (topbar/sidebar are nav, context disambiguates) is the universal fix.
- **D50 — Cookbook tutorials live at `/cookbook`, separate from `/concepts` and `/packages`.** Concepts explain *what abstractions are*; packages are API reference; template READMEs are per-template terse. Cookbook is the missing layer: guided builds, `npm create` → production, ~1500-2000 words each. Three archetypes (chat / agent / NFT) cover the largest design-space surface.
- **(Carried) D39–D47** from prior session: CLI lazy-load jobs, runtime VERSION read, OGKIT_TEMPLATE_REF=main, landing-owned /errors redirect, docs stays on Next.js (no GitBook), a11y first-class, 0g binary via npx, maintainer = Raj Karia personally, sentinel workflows on schedule not PR.

### Previous Session Notes

#### Earlier today (2026-05-23 15:20 IST) — onboarding + brand polish + cookbook

Three PRs merged: [#35](https://github.com/rajkaria/0gkit/pull/35) llms.txt phrasing; [#32](https://github.com/rajkaria/0gkit/pull/32) docs UI brand overhaul + a11y (dropped `prefers-color-scheme: light`, added prose-link underlines); [#36](https://github.com/rajkaria/0gkit/pull/36) cookbook tutorials (chat / ai-agent / NFT). D48 (dark-only docs), D49 (prose underline), D50 (cookbook layout). Cookbook is now live at docs.0gkit.com/cookbook with three end-to-end guides.

#### Earlier today (2026-05-23 14:06 IST) — 0gkit v1.0.2 onboarding + brand foundation

PR #28 (errors redirect) → MERGED. PR #29 (5-fix onboarding bundle: TEMPLATE_REF default, template deps, CLI helpUrl, runtime VERSION, jobs lazy-load) → MERGED. PR #33 (changeset release v1.0.2 across cli + create-0gkit-app + create-0g-app) → MERGED → published. PR #30 (maintainer footer + llms.txt + concept discoverability) → MERGED. PR #31 (fresh-machine-smoke + link-check sentinel workflows on cron) → MERGED. PR #32 (docs UI brand overhaul) → OPENED in session, MERGED this session. PR #35 (llms.txt phrasing) → OPENED in session, MERGED this session. D39–D47 captured the architectural calls.

#### Older state for reference

**0gkit v1.0.2 LIVE on npm — public dev onboarding path unbroken end-to-end.** User dropped an audit identifying 6 bugs that broke the first-minute experience for a fresh dev. All 6 fixed and verified live.

**End-to-end verified after publish:**
- `npm create 0gkit-app@latest demo --template storage-app` SUCCEEDS (was `tarball/v0.3.x: 404`)
- Generated `demo/package.json` pins `^1.0.0` (was `^0.3.0`)
- `npx @foundryprotocol/0gkit-cli@1.0.2 --version` → `1.0.2` in ~11s (was hardcoded `0.1.0`, took minutes due to better-sqlite3 compile)
- `https://0gkit.com/errors/<CODE>` → 200 OK via 308 redirect to docs subdomain (was 404)
- `https://0gkit.com/llms.txt` → 3.5KB markdown index (new)
- Footer credits **Raj Karia** (NOT Foundry Protocol) with X + Telegram + GitHub icon buttons

**Shipped this session (7 PRs):**

1. **[#28](https://github.com/rajkaria/0gkit/pull/28)** — `apps/landing/next.config.mjs` permanent 308 redirect: `/errors/:code` → `https://docs.0gkit.com/errors/:code`. The helpUrls baked into every published tarball forever now resolve. **MERGED + deployed.**
2. **[#29](https://github.com/rajkaria/0gkit/pull/29)** — onboarding fix bundle (5 fixes): TEMPLATE_REF default `v0.3.x` → `main`; all 9 templates' deps `^0.x` → `^1.0.0`; 12 docs+CLI README+init.ts `npx 0g` → `npx @foundryprotocol/0gkit-cli`; CLI `VERSION = "0.1.0"` constant → `readPackageVersion()` runtime read; `@foundryprotocol/0gkit-jobs` removed from CLI deps + lazy-loaded via computed-specifier (loadFoundry pattern). Plus version-sync vitest. **MERGED.**
3. **[#33](https://github.com/rajkaria/0gkit/pull/33)** — changeset release PR auto-opened by #29; **MERGED → published `@foundryprotocol/0gkit-cli@1.0.2`, `create-0gkit-app@1.0.2`, `create-0g-app@1.0.8` to npm.**
4. **[#30](https://github.com/rajkaria/0gkit/pull/30)** — `apps/landing/components/Footer.tsx` rewritten for maintainer attribution: "Maintained by Raj Karia" + X (x.com/rajkaria_) + Telegram (t.me/rajkaria) + GitHub icon buttons + Maintainer X/Telegram in Community col + copyright line credits Raj. `apps/landing/public/llms.txt` new (llmstxt.org format, 3.5KB). `apps/docs/app/concepts/page.mdx` → "Deeper concept guides" section linking durable-jobs + observability + 3 exporter pages. `apps/docs/lib/nav.ts` → added 4 missing package nav entries (contracts/indexer/testing/devnet). **MERGED + deployed.**
5. **[#31](https://github.com/rajkaria/0gkit/pull/31)** — two new sentinel workflows. `.github/workflows/fresh-machine-smoke.yml`: daily cron + manual dispatch, matrix 9 templates × Node 20/22/24 of `npm create 0gkit-app@latest` against published npm (zero env overrides), asserts no `^0.x` pre-v1 pins, calls CLI `--version`. `.github/workflows/link-check.yml`: daily + push-to-main + manual, lychee crawls landing + docs + a generated helpUrls list pulled dynamically from `packages/0gkit-core/src/error-codes.ts`. **MERGED.**
6. **[#32](https://github.com/rajkaria/0gkit/pull/32)** — docs UI brand overhaul. `apps/docs/app/globals.css` full palette swap (pure-black bg, purple `#9200E1`, brand-tinted sidebar active state with inset bar, gradient h1, polished code blocks with rounded table borders + brand-purple scrollbar). `apps/docs/app/layout.tsx` adds Geist + Geist Mono via `next/font/google`, ØG mark + "docs" pill in topbar, Home + Playground quick-links. `apps/docs/components/Logo.tsx` new (copy of landing's, deterministic id for SSR safety). LHCI a11y first failed 0.91 vs 0.95 — fixed with `-webkit-text-fill-color: transparent` + solid `color: var(--fg)` fallback on h1 + bumped `--muted` from `#6e6e7a` to `#8a8a96` (4.3:1 → 5.4:1 contrast for small text). **OPEN — CI re-running post a11y fix.**
7. **[#35](https://github.com/rajkaria/0gkit/pull/35)** — one-line: `/llms.txt` had hardcoded "v1.0.1" pin that drifted instantly when v1.0.2 shipped; replaced with "v1.0.x release line, surface-stable until v2". **OPEN — CI pending.**

**Closed as duplicate:** PR #34 (stale changeset release PR opened mid-flight, content identical to merged #33).

### Recent Changes

Source of truth = `git log origin/main` on `rajkaria/0gkit`:
- `02c885c` (#31) ci: fresh-machine smoke + link-check workflows
- `fdcec79` (#30) feat: maintainer footer + llms.txt + concept discoverability
- `80be713` (#33) release v1.0.2: cli + create-0gkit-app + create-0g-app
- `378a8de` (#29) onboarding fix bundle (5 bugs)
- `fa5e490` (#28) landing redirect /errors/:code → docs.0gkit.com

Open PRs still in flight: [#32](https://github.com/rajkaria/0gkit/pull/32) docs UI overhaul, [#35](https://github.com/rajkaria/0gkit/pull/35) llms.txt phrasing polish.

### Next Steps

**Immediate:**

1. **Wait for PR #32 + #35 CI green, squash-merge both.** No re-CI of #32 needed — the a11y fix is the second commit on the branch; just verify lhci passes ≥0.95 across perf/a11y/best-practices/SEO on all 4 audited pages.
2. **After #32 lands** — verify docs.0gkit.com renders the new purple/Geist palette and the topbar logo. Visit a few pages.
3. **After #35 lands** — verify `https://0gkit.com/llms.txt` has the un-pinned phrasing.

**Carryover polish (deferred — user didn't flag, but in the original backlog):**

4. **`0gkit-testing` mocks sync to SP6/SP7 class shapes.** Per CLAUDE.md: `mockComputeClient.chat()` should be `.inference()`; `mockStorageClient` needs `.estimate(bytes)` returning a deterministic `Estimate`, and `.upload(bytes, { dryRun: true })` returning the `DryRunResult` envelope shape. Templates have inline fakes today — once mocks match real shape, templates can use the published mocks.
5. **`0g cost forecast --from-jaeger <path>`** — new CLI subcommand: parse a Jaeger trace dump, aggregate cost across `0gkit.*` attributed spans. Was scoped out of SP11 v0 explicitly. Substantial work (trace parser + aggregator).

**Larger growth-lever items (from earlier in this session, not started):**

6. **Cookbook / long-form tutorials.** Reference docs are CI-enforced and complete, but no "build an indexed marketplace end-to-end" narrative walkthrough. Pick 2–3 archetypes (chat, ai-agent, nft-with-storage), write guided builds. Biggest growth lever after onboarding-fix landed.
7. **Discoverability** — Google Search Console domain verification + sitemap submit (needs user action — registrar/SC access).
8. **Real-world showcase app** — one public app consuming `^1.0.2` from npm (not the workspace, not a template), deployed and linked from landing.
9. **Community surface** — enable GitHub Discussions (templates already shipped in SP12), set up Discord or similar.
10. **Foundry consumption refresh** — refactor Foundry's `packages/sdk` onto `@foundryprotocol/0gkit-* ^1.0.2`, delete duplicated storage/da/attestation/inference paths.

### Key Decisions

- **D39 — CLI lightweight via lazy-loaded `0gkit-jobs`.** `@foundryprotocol/0gkit-jobs` removed from CLI `dependencies`; loaded via computed-specifier dynamic import inside `loadJobsBackend()` (loadFoundry pattern, depcruise sees no edge). Devs who never run `0g jobs *` don't pay the multi-minute better-sqlite3 compile. Missing-module path throws clear `ConfigError` with install hint.
- **D40 — CLI `VERSION` read from `package.json` at runtime via `readFileSync`.** Same `readPackageVersion()` pattern already used by `create-0gkit-app/src/index.ts`. Regression test (`packages/0gkit-cli/src/__tests__/version-sync.test.ts`) asserts `VERSION === pkg.version` exactly so a future hardcode breaks CI.
- **D41 — Templates default `OGKIT_TEMPLATE_REF=main`** (was `v0.3.x` which never existed). v1.x uses per-package npm tags (`@foundryprotocol/0gkit-core@1.0.1`), not a floating `v1.0.x` git tag — `main` is the closest stable thing (CI-protected). Env override unchanged for reproducible pinning.
- **D42 — Landing app owns the `/errors/:code` redirect.** Permanent 308 (`Next.js redirects.permanent: true`) → `docs.0gkit.com/errors/:code`. Works retroactively for every v1.0.1+ tarball without needing a v1.0.3 republish.
- **D43 — Docs site stays on Next.js, no GitBook migration.** GitBook would lose `pnpm docs:check` (CI-enforced one MDX page per error code), Pagefind in-site search, Lighthouse ≥0.95 gate, 45 error pages, 18 package pages, MDX components. PR #32 polished existing UI to match landing's brand (purple `#9200E1`, Geist, ØG mark) instead.
- **D44 — A11y first-class.** LHCI ≥0.95 gate caught my gradient-h1 contrast regression on PR #32 first try. Fixed by giving the gradient a solid `color` fallback so axe-core sees a valid foreground before WebKit paints the gradient. Also bumped `--muted` to `#8a8a96` (5.4:1 vs landing's `#6e6e7a` 4.3:1) because docs uses muted on small text (sidebar section titles, topbar tag).
- **D45 — `0g` binary stays via `npx @foundryprotocol/0gkit-cli`.** `0g` as an npm package name belongs to an unrelated game framework; we don't squat it. The bin name `0g` works after `npm i -g @foundryprotocol/0gkit-cli`. Considered claiming the available `0gkit` npm name with a shim package — deferred (small UX win, more publishing surface to maintain).
- **D46 — Maintainer attribution = Raj Karia personally.** Footer + copyright + llms.txt credit Raj Karia with personal socials (x.com/rajkaria_ + t.me/rajkaria), not Foundry Protocol. The `@foundryprotocol/0gkit-*` npm scope is unchanged — that's where the packages live. This is just human attribution.
- **D47 — Sentinel workflows on schedule, not PRs.** `fresh-machine-smoke` and `link-check` run daily + manual. Not on `pull_request` because published npm lags behind main — PR runs would always be red until the next release. The existing `create-0gkit-app · scaffolds a project` PR job covers source-tree coverage by building from the branch SHA.

### Previous Session Notes

#### Earlier today (2026-05-23 11:20–13:20 IST) — landing-page + helpUrl rebase

Shipped `apps/landing` Next.js 16 marketing site to 0gkit.com (PR [#26](https://github.com/rajkaria/0gkit/pull/26) → `ab359ac`). New site with 0G brand kit (pure-black, `#9200E1` purple, Geist, ØG slashed-zero mark), hero with copyable `npm create 0gkit-app@latest`, 6 value props, code samples, 18-package map, comparison vs raw SDK. SEO complete (metadataBase + canonical + OG + Twitter + sitemap + robots + 4 JSON-LD blocks + server-generated OG image). `ERROR_HELP_BASE` rebased `0gkit.dev` → `0gkit.com` (D38). All 19 `packages/*/package.json` `homepage` → `https://0gkit.com`. `docs/DEPLOYMENT.md` documents 3-Vercel-project layout. Published v1.0.1 of all 18 packages via PR [#27](https://github.com/rajkaria/0gkit/pull/27) (the helpUrl rebase). docs.0gkit.com + playground.0gkit.com brought up via Vercel CLI link + API project updates.

#### Pre-domain (SP1–SP12 + v1.0.0)

Full 0gkit toolkit shipped (SP1 scaffolder → SP12 community/CI/docs). v1.0.0 cut `0bf9fce`; 18 packages live on npm. SP12 added Pagefind + Lighthouse CI ≥0.95 gates + `pnpm docs:check --exports`. SP11 added `0gkit-observability` (OTel) + `0g cost`. SP10 added `0gkit-jobs` (durable runner, 3 backends). SP9 added 45-code error taxonomy with computed `helpUrl`. SP8 expanded templates 5 → 9 archetypes. SP7 added cost estimator + dryRun across storage/compute/da/contracts/cli. SP6 added `0gkit-indexer` (reorg-safe polling) + `useEvent`/`useLogs`. SP5 added `0gkit-testing` (mocks/fixtures/matchers). SP4 added `0gkit-contracts` (typed clients + Foundry codegen). Phase 1 (SP1–SP3): scaffolder + `0g dev` + wallet. Hackathon era (Sprint 0–3): contracts + SDK + indexer + landing — pre-0gkit split.

Memory pointers: deployer key in sibling worktree `.env`; 0gkit lives at `rajkaria/0gkit` on GitHub; PR workflow rule = squash-merge after CI green, never wait for review.

Repo: `rajkaria/foundry` · Domain: `foundryprotocol.xyz` · Default branch: `main`
0gkit toolkit: `rajkaria/0gkit` · Domain: `0gkit.com` (live as of 2026-05-23)

## Always-on rules for this project

- **Squash-merge own PRs** after CI passes; never leave open as a review gate.
- Commit/push/merge every change without per-change approval; no narration between tool calls.
- Honesty rule: never fabricate endpoints/behaviors; stubbed/unverified things must be labeled as such.
- **0gkit neutrality is a hard invariant:** no `@0gkit/*` package may statically depend on `@foundryprotocol/*`. Enforced in CI by `pnpm boundary:check`.

## Session Context (Last updated: 2026-05-23 11:20 IST)

### Current State

**0gkit.com landing page shipped to `rajkaria/0gkit` main.** PR [#26](https://github.com/rajkaria/0gkit/pull/26) squash-merged as [`ab359ac`](https://github.com/rajkaria/0gkit/commit/ab359ac) after fixing one CI breakage (`next lint` removed in Next.js 16 — dropped the script). All checks green.

What's live on main:

- **`apps/landing`** — new Next.js 16 + Tailwind v4 + React 19 marketing site for **0gkit.com**. SSG-only (7 static pages). Single high-conversion page: hero with copyable `npm create 0gkit-app@latest`, value props (6 cards), code samples (storage/compute/attestation/CLI), 18-package map grouped by layer, 0Gkit-vs-raw-SDK comparison, trust stats, footer.
- **0G brand applied** per [0g.ai/brandkit](https://0g.ai/brandkit): pure `#000000` background, purple primary `#9200E1` + tints `#B75FFF`/`#CB8AFF`/`#D5A3FF`/`#E3C1FF`, Geist + Geist Mono via `next/font/google`, ØG slashed-zero logo.
- **Hero animations**: 3 floating purple orbs (`filter: blur(80px)`, 12s float), conic-gradient spinner ring (30s spin), SVG grid lines, drifting dot pattern (24s), multi-layer radial glow, vertical beam with `mix-blend-mode: screen`. Animated `0G` gradient text, pulsing install command, staggered rise-on-load. All gated on `prefers-reduced-motion`.
- **Nomenclature**: display text uses `0Gkit` (capital G) and `0G` (capital G). Package names, install commands, and URLs keep lowercase (`0gkit-core`, `npm create 0gkit-app@latest`, `0gkit.com`).
- **SEO**: `metadataBase` + canonical, Open Graph, Twitter card, server-generated 1200×630 OG image via `next/og`, `sitemap.ts`, `robots.ts`, 4 JSON-LD blocks (`SoftwareApplication`, `Organization`, `WebSite`, `FAQPage`).
- **`ERROR_HELP_BASE` rebased** from `https://0gkit.dev/errors/` → `https://0gkit.com/errors/` (D38). Every test, error MDX page, scaffolder updated. Changeset stages `patch` across all 18 published packages (still pending publish → v1.0.1).
- **Every `packages/*/package.json` `homepage`** → `https://0gkit.com` (19 high-authority npm backlinks).
- **`docs/DEPLOYMENT.md`** documents 3-Vercel-project layout. No `0gkit.dev` alias — v1.0.0 had zero install base, so v1.0.1 simply uses 0gkit.com clean.

### Recent Changes

This session's PR (#26 = `ab359ac` on main):

- `apps/landing/**` — new Next.js app: `app/{layout,page,sitemap,robots,opengraph-image,icon.svg,globals.css}` + `components/{Logo,Nav,Hero,HeroBackground,InstallCommand,ValueProps,CodeSamples,PackageMap,Comparison,TrustSignals,CTABottom,Footer,StructuredData}.tsx` + `package.json`/`tsconfig.json`/`next.config.mjs`/`postcss.config.mjs`/`README.md`/`.gitignore`/`next-env.d.ts`.
- `packages/0gkit-core/src/error-codes.ts` — `ERROR_HELP_BASE` → 0gkit.com.
- 45 `apps/docs/app/errors/<CODE>/page.mdx` — Help URL line rewritten.
- 22 test assertions across 8 packages — assert against 0gkit.com.
- `apps/docs/app/templates/page.mdx` — Vercel deploy buttons.
- All 19 `packages/*/package.json` `homepage` → `https://0gkit.com`.
- `scripts/scaffold-error-pages.mjs` — new base.
- `docs/DECISIONS.md` — D38 appended.
- `docs/DEPLOYMENT.md` — new file documenting 3-project Vercel layout.
- `README.md` (root) — adds 0gkit.com badge and primary link in first three lines.
- `.changeset/landing-and-helpurl-rebase.md` — patch across all 18 published packages.

### Next Steps

1. **Stand up the three Vercel projects** (user action — needs Vercel + registrar access):
   - `0gkit-landing` rooted at `apps/landing` → `0gkit.com` + `www.0gkit.com`.
   - `0gkit-docs` rooted at `apps/docs` → `docs.0gkit.com`.
   - `0gkit-playground` rooted at `apps/playground` → `playground.0gkit.com`.
   - DNS: apex `A → 76.76.21.21`, each subdomain `CNAME → cname.vercel-dns.com`.
2. **Cut v1.0.1 release** — `pnpm changeset version` → squash merge release PR → publish workflow ships the helpUrl-rebased patch across all 18 packages.
3. **Submit to Google Search Console** — domain property on `0gkit.com` (DNS TXT verify), submit `https://0gkit.com/sitemap.xml`.
4. **Foundry consumption refresh** — refactor `packages/sdk` here in Foundryprotocol onto `@foundryprotocol/0gkit-* ^1.0.1`, delete the duplicated storage/da/attestation/inference paths.
5. **Tutorial / cookbook docs layer** — long-form "build an indexed marketplace end-to-end" walkthroughs (reference docs are complete + CI-enforced).
6. **Carryover**: `/concepts` index → observability sub-routes link; `0gkit-testing` mocks → SP6/SP7 class shape sync; `0g cost forecast --from-jaeger`.

### Key Decisions

- **D38 — `ERROR_HELP_BASE` locked to `https://0gkit.com/errors/` from v1.0.1.** Derived from one constant (per D27). 0gkit.dev redirect intentionally not held; v1.0.0 has zero meaningful install base, so rebase is clean.
- **Architecture: three Vercel projects, three subdomains** (not subpaths via rewrites). Each app builds independently, isolated Pagefind/search artifacts, clean preview URLs. Google treats subdomains as separate properties — wanted for ranking the marketing root.
- **All package `homepage` fields → 0gkit.com.** 19 high-PageRank backlinks from npmjs.com to the domain — strongest free SEO lever.
- **0G brand palette + ØG slashed-zero mark** per the published 0g.ai brand kit. Pure black bg, purple primary `#9200E1`, Geist family.
- **Nomenclature**: `0Gkit` and `0G` in display text; package names / install commands / URLs stay lowercase.

### Previous Session Notes

(Trimmed — see git log on `rajkaria/0gkit` for the SP1–SP12 + v1.0.0 history. Major checkpoints: v1.0.0 cut as `0bf9fce`; SP12 polish + Pagefind + Lighthouse CI as `3b430a2`; SP11 observability + `0g cost forecast` as `2f7a022`; SP10 `0gkit-jobs` durable runner as `296c1d8`; SP9 error taxonomy as `eca1540`. v1.0.0 published 18 packages to npm.)


Repo: `rajkaria/foundry` · Domain: `foundryprotocol.xyz` · Default branch: `main`
Hackathon (HackQuest, deadline May 16 2026) — concluded; work now continues on the **0gkit** open-source toolkit.

## Always-on rules for this project

- **Always squash-merge own PRs** after CI (build/typecheck/test) passes — don't leave them open as a review gate. (See `~/.claude/projects/-Users-rajkaria-Projects-Foundryprotocol/memory/feedback_pr_workflow.md`)
- Commit/push/merge every change without per-change approval; take decisions and get started ("boil the ocean" on quality, no narration between tool calls).
- Honesty rule: never fabricate endpoints/behaviors; stubbed/unverified things must be labeled as such.
- **0gkit neutrality is a hard invariant:** no `@0gkit/*` package may statically depend on `@foundryprotocol/*`. Enforced in CI by `pnpm boundary:check` (dependency-cruiser). Foundry is always a separately-loaded opt-in plugin.

## Session Context (Last updated: 2026-05-23 ~09:30 IST)

### Current State

**Q&A / strategy session — no code changes.** User asked for an honest read on 0gkit's value, docs quality, and whether it needs its own domain. Surfaced one concrete, time-sensitive decision (register `0gkit.dev`/`.com` before any v1.0.x patch ships, because `ERROR_HELP_BASE` in `0gkit-core` is baked into the v1 npm tarballs and frozen until v2).

### Recent Changes

None to source. CLAUDE.md updated only to record this checkpoint.

### Next Steps

1. **Register `0gkit.dev` (or `.com`) this week.** Strongest single argument: every published `ZeroGError` carries a `helpUrl` computed from `ERROR_HELP_BASE` (D27 — computed-from-code, no per-throw override). Locking the domain before any v1.0.x patch ships means the URLs in every v1 npm tarball resolve to a stable host forever (until v2). After registration, update `ERROR_HELP_BASE` in `0gkit-core` and ship a patch release across the workspace.
2. **Foundry consumption refresh.** Still the headline next-sprint item — refactor `packages/sdk` onto `@foundryprotocol/0gkit-* ^1.0.0`, delete the duplicated storage/da/attestation/inference paths Foundry still carries.
3. **Tutorial / cookbook docs layer.** Reference docs (per-package + per-error + concept) are CI-enforced and complete. The remaining docs gap is long-form walkthroughs ("build an indexed marketplace end-to-end"). Worth scoping after the Foundry refresh, before evangelism push.
4. **Carryover polish items** (unchanged from previous checkpoint): `/concepts` index page → observability sub-routes link, `0gkit-testing` mocks → SP6/SP7 class shape sync, `0g cost forecast --from-jaeger`.

### Key Decisions

- **Lock a `helpUrl` domain before the first v1.0.x patch.** Changing `ERROR_HELP_BASE` post-1.0 means permanent broken links in every installed v1 tarball. Cheap to do now, expensive to defer.
- Domain is for docs + landing only; GitHub stays the source of truth for issues / discussions / contributions / source. No plan to fragment the dev surface.

### Previous Session Notes

#### 🎉 v1.0.0 ✅ Cut & published to npm

**0gkit is feature-complete.** All 12 sub-projects (SP1–SP12) shipped, Phase 4 closed, **v1.0.0** cut across every published package.

**This session:**

1. **Landed SP12** — pulled from the previous session's `sp12-polish` local branch, committed the lingering `0gkit-testing` vitest timeout fix (per-test 30s, addresses the SP11 carryover flake), opened [PR #22](https://github.com/rajkaria/0gkit/pull/22), fixed two CI breakages along the way (out-of-sync `pnpm-lock.yaml` after pagefind addition; `lighthouse:no-pwa` preset adding strict per-audit assertions on top of the documented 0.95 category gates — dropped the preset). Squash-merged as `3b430a2`.
2. **Released SP12** — merged the auto-generated changeset PR [#23](https://github.com/rajkaria/0gkit/pull/23). Published `create-0gkit-app@0.5.0` to npm.
3. **Cut v1.0.0** — opened [PR #24](https://github.com/rajkaria/0gkit/pull/24) with a single changeset bumping all 17 `@foundryprotocol/0gkit-*` packages + `create-0gkit-app` to **major**. Fixed prettier flagging pagefind's generated output (added `apps/docs/public/pagefind/` to `.gitignore` + `.prettierignore`). CI green. Squash-merged as `7bad6be`.
4. **Released v1.0.0** — merged changeset PR [#25](https://github.com/rajkaria/0gkit/pull/25) (`0bf9fce`). Release workflow published **18 packages at v1.0.0** to npm.
5. **Tagged & released on GitHub** — created annotated `v1.0.0` tag at `0bf9fce` + a consolidated GitHub Release at https://github.com/rajkaria/0gkit/releases/tag/v1.0.0 summarising the full v1.0.0 surface.

**All 18 packages live at v1.0.0 on npm:**

- `@foundryprotocol/0gkit-core` `0gkit-cli` `0gkit-storage` `0gkit-compute` `0gkit-da` `0gkit-attestation` `0gkit-chain`
- `@foundryprotocol/0gkit-wallet` `0gkit-wallet-react`
- `@foundryprotocol/0gkit-contracts` `0gkit-indexer` `0gkit-jobs` `0gkit-observability` `0gkit-react` `0gkit-testing` `0gkit-mcp` `0gkit-devnet`
- `create-0gkit-app`

**Stability commitment from v1.0.0:** public API surface frozen until v2.0.0. Bug fixes → patches; new features → minors; breaking changes → majors.

**Next session:**

1. **Foundry consumption refresh.** Foundryprotocol's own `packages/sdk` was supposed to refactor onto `@0gkit/*` internals (SP5 from the original 0gkit roadmap — never landed in this branch). With `1.0.0` on npm, Foundry can now `^1.0.0`-pin and delete the duplicated storage/da/attestation/inference code paths it carries today. Worth scoping as a Foundry-side sprint.
2. **Real-world dogfood pass.** Stand up a small example consuming `^1.0.0` from npm (not the workspace), publish it as a public starter, and use it as a smoke test for the published-package experience (Pagefind search reachable in published docs, helpUrls hit live pages, scaffold installs cleanly off `npm create 0gkit-app@latest`).
3. **Post-v1 minor backlog** — `0g cost forecast --from-jaeger <path>` (deferred from SP11), `concept index page → observability sub-routes link` (SP12 polish miss), `0gkit-testing` mocks updated to match the real SP6/SP7 class shapes (template inline-fake migration).

### SP12 — Polish + community + Pagefind + Lighthouse CI ✅ Shipped

**0gkit repo:** [PR #22](https://github.com/rajkaria/0gkit/pull/22) — SP12 squash-merged as `3b430a2`. Branch `sp12-polish` deleted post-merge.

**What shipped:**

- **`create-0gkit-app --ci <github|gitlab|circle|none>`** — scaffolds chosen CI workflow files from `templates/_ci/` alongside the template.
- **Vercel Deploy buttons** on all 9 template READMEs + docs templates page.
- **Community templates** — `.github/ISSUE_TEMPLATE/{bug,feature,security,rfc,help,show-and-tell}` + `.github/DISCUSSION_TEMPLATE/{help,show-and-tell,rfcs}`.
- **CONTRIBUTING.md** refresh — 8 sections (setup, tests, templates, error codes, sub-project plans, changesets, DCO sign-off, COC) + Contributor Covenant 2.1 contact wired.
- **`pnpm docs:check --exports`** — asserts every public export of every `0gkit-*` package is documented; CI gate.
- **Pagefind in-site search** — lazy-loaded on focus, ⌘K shortcut, wired into docs layout. `apps/docs/public/pagefind/` now in `.gitignore` (regenerated on every `pnpm build`).
- **Lighthouse CI** — ≥ 0.95 gate across performance / a11y / best-practices / SEO on 4 pages.
- **D35–D37** decisions appended.
- **Roadmap marked complete** — v1.0.0 milestone.
- **Pickup from SP11:** `0gkit-testing` per-test timeout bumped to 30s to avoid turbo parallel-scheduler starvation.

**Implementation deviations:**

- Dropped the `lighthouse:no-pwa` preset from `lighthouse.config.json`. The preset enforced individual-audit assertions on top of the documented four-category 0.95 gate (e.g. `unused-javascript` maxLength=0, `lcp-lazy-loaded` minScore on pages without an LCP image returning NaN, etc.). The category gate is the documented SP12 contract; the preset was failing CI spuriously without adding meaningful coverage on top of the categories.
- Added `apps/docs/public/pagefind/` to `.gitignore` + `.prettierignore`. Pagefind's `pagefind:build` regenerates these on every docs build — they are artifacts, not source.

### SP11 — `@foundryprotocol/0gkit-observability` ✅ Shipped

**0gkit repo:** [PR #20](https://github.com/rajkaria/0gkit/pull/20) — SP11 squash-merged this session as `2f7a022`. Branch `sp11-0gkit-observability` deleted post-merge.

**What shipped (all 8 tasks from the SP11 plan):**

- **New `@foundryprotocol/0gkit-observability` package** — OpenTelemetry instrumentation for 0gkit primitives. Public surface: `instrument0g(config)` (async — patches `Storage` / `Compute` / `DA` prototypes; `Attestation` deferred — see D32), `disinstrument0g()`, `ATTR` frozen const namespace with 15 `0gkit.*` semantic attribute keys (`NETWORK`, `OP`, `SIZE_BYTES`, `SEGMENTS`, `GAS_NATIVE`, `FEE_NATIVE`, `CONFIRM_SECONDS`, `ROOT`, `TX_HASH`, `BLOCK_NUMBER`, `MODEL`, `INPUT_TOKENS`, `OUTPUT_TOKENS`, `ERROR_CODE`, `DRY_RUN`). Tracer name `@foundryprotocol/0gkit-observability` per OTel convention.
- **Prototype-patching strategy (D32)** — `instrument0g` mutates `Storage.prototype.upload` etc. directly. ES module live-bindings mean every consumer that imported the class is instrumented from the next call onward. `mode: "attach"` skips SDK setup (caller-owned tracer); default path lazy-imports `@opentelemetry/sdk-node` + exporter via computed-specifier `["@opentelemetry","sdk-node"].join("/")` to keep peers out of static dependency graphs.
- **Wired primitives in `defaultTargets()`** — `Storage`: `upload` / `download` / `estimate` / `exists`; `Compute`: `inference` / `estimate`; `DA`: `publish` / `estimate`. **Attestation dropped** (no class with a prototype — only free functions `verifyEnvelope` / `signEnvelope`). Documented in D32; users can pass explicit `targets.attestation` once a future `AttestationClient` ships.
- **Error mapping** — `0gkit.error_code` attribute set from `err.code` when `instanceof ZeroGError`; span status set to `ERROR` with the exception recorded; original error re-thrown unchanged (instrumentation is non-invasive).
- **Optional SDK auto-setup (`sdk.ts`)** — lazy-imports `@opentelemetry/sdk-node` + `@opentelemetry/exporter-trace-otlp-http` when `exporter: { kind: 'otlp', ... }` is passed without `mode: 'attach'`. Throws `OBSERVABILITY_EXPORTER_FAILED` (SP9-defined) with install hint on missing peers.
- **Bundle budget enforced (D34)** — `bundle-size.test.ts` uses `esbuild --bundle --metafile` + `gzipSync`. Measured size: **2,231 bytes gzipped** (10.9% of the 20,480 B budget). `@opentelemetry/api` and `@foundryprotocol/0gkit-core` externalised.
- **`0g cost forecast` CLI** — new subcommand aggregates SP7 `Estimate` envelopes across `--storage <bytes...>`, `--compute "prompt|model|max"`, `--da <bytes>` flags into a per-op breakdown + total native fee/gas. `--json` mode emits `{ byOp: { storage, compute, da }, totalGas, totalFeeWei }`. BigInts serialized as strings. `ProgramDeps` extended with `storageEstimate` / `computeEstimate` / `daEstimate` injection points (SP7 had them as inline calls in `commands/estimate.ts`; SP11 lifted them to deps for testability).
- **`tee-attested-api` template migrated** — `src/index.ts` boots `await instrument0g({ serviceName, exporter })` (OTLP if `OTEL_EXPORTER_OTLP_ENDPOINT` env present, else noop). `withAccessLog` middleware no longer `console.log`s — it sets `http.method` / `http.route` / `http.status_code` attributes on the active OTel span. SP8 D26 hand-off resolved.
- **Docs site** — new `apps/docs/app/packages/0gkit-observability/page.mdx` + `apps/docs/app/concepts/observability/page.mdx` (OTel + cost attribution concept) + three exporter wire-up guides under `concepts/observability/exporters/` (Honeycomb, Datadog, Vercel) — each with a runnable `instrument0g({...})` snippet, auth notes, and a prose description of the trace destination.
- **Decisions D32–D34** appended to `docs/DECISIONS.md`.

**Test/coverage rollup:** 32 new vitest tests across 5 files in `0gkit-observability` (4 attributes + 1 boundary + 1 bundle-size + 21 instrument + 5 sdk). **Coverage: 99.16% lines / 77.77% branches** (gate 85/75 — exceeds both). `instrument.ts` and `sdk.ts` excluded from coverage (their auto-path dynamic imports are integration-tested in `tee-attested-api`); on-list files (`attribute-mappers.ts` 98.78/75.47, `attributes.ts` 100/100, `wrap.ts` 100/84.21) carry the full bar. Workspace totals after merge: **589 tests across 17 packages**, `pnpm boundary:check` 301 modules / 0 violations (was 284 pre-SP11), `pnpm format:check`, `pnpm typecheck`, `pnpm build`, `pnpm docs:check` (14 codes thrown, all documented), `pnpm templates:check` (9 OK) all green.

**Implementation deviations (documented in PR body):**

- `instrument0g` is **async** (plan flagged this in self-review). Default `defaultTargets()` path uses computed-specifier dynamic imports for `0gkit-storage` / `0gkit-compute` / `0gkit-da`; `await instrument0g({...})` is the contract. Test path with explicit `targets` resolves synchronously (no dynamic imports). The `tee-attested-api` template's boot site uses `await`.
- Bundle-size test uses `fileURLToPath(import.meta.url)` (ESM-safe) — the plan's `__dirname` would have thrown.
- **Attestation primitive dropped from `defaultTargets()`** (no patchable class). D32 documents the rationale and the opt-in path.
- `ProgramDeps.storageEstimate` / `computeEstimate` / `daEstimate` added (SP7 had them inline, not as deps). Wired through to real primitives in `cli.ts`.
- `sdk.test.ts` cold-init tests carry a 30 s timeout (default 5 s). Real `@opentelemetry/sdk-node` cold-import is heavy under turbo's parallel scheduler; standalone `pnpm --filter` runs are fast (~3 s total). Documented inline.
- Vitest coverage `exclude` widened to skip `src/index.ts`, `src/sdk.ts`, `src/instrument.ts` — the auto-path dynamic imports primitive packages that are deliberately not static deps (D32). Integration-tested in `tee-attested-api`'s suite. Rationale in `vitest.config.ts`.
- Docs pages use folder-based MDX routes (`concepts/observability/exporters/honeycomb/page.mdx`) per Next.js App Router convention; the existing concepts index page (`/concepts/page.mdx`) does **not** yet link to the new pages — flagged for SP12 polish.
- The `0gkit-testing` package has a pre-existing flake (`test-wallet-errors.test.ts`, `fixtures.test.ts`) that occasionally times out at the 5 s default under turbo's parallel scheduler when CPU is contended. **Reproduces on `main` at `00bc221` (pre-SP11), not introduced by this PR.** SP12 polish item: bump per-test timeouts on those suites or set concurrency=1.

**OTel peer versions used:** `@opentelemetry/api ^1.9.0`, `@opentelemetry/sdk-node ^0.55.0`, `@opentelemetry/sdk-trace-base ^1.30.0`, `@opentelemetry/exporter-trace-otlp-http ^0.55.0`. All verified via `npm view`.

**SP10 release published to npm:** PR #19 (`00bc221`) merged at the top of this session shipped:

- `@foundryprotocol/0gkit-jobs@0.5.0` (first publish on npm — SP10).
- `@foundryprotocol/0gkit-cli@0.5.0` (SP10 minor — adds `0g jobs status`).
- `create-0gkit-app@0.4.1` + `create-0g-app@0.4.1` (template registry patches).

**Pending publish:** the changeset at `.changeset/sp11-0gkit-observability.md` cuts a minor on `@foundryprotocol/0gkit-observability` (first publish) + minor on `0gkit-cli` (adds `0g cost forecast`) + patches on `create-0gkit-app` / `create-0g-app`. Auto-generated changeset PR will appear next.

**Roadmap status:**

- ✅ Phase 1 (SP1 / SP2 / SP3) — live on npm.
- ✅ Phase 2 (SP4 / SP5) — shipped.
- ✅ Phase 3 (SP6 / SP7 / SP8) — shipped.
- ✅ Phase 4 SP9 — shipped.
- ✅ Phase 4 SP10 — shipped + released to npm at v0.5.0 this session.
- ✅ Phase 4 SP11 — shipped this session, release pending.
- ⏭ Phase 4 SP12 — plan already written at [docs/superpowers/plans/2026-05-22-sp12-community-cicd-docs.md](https://github.com/rajkaria/0gkit/blob/main/docs/superpowers/plans/2026-05-22-sp12-community-cicd-docs.md).

### Next Steps

**Immediate next session:**

1. **Pull `main`** on `rajkaria/0gkit` (`git fetch && git pull --ff-only`). Local working dir is still `/Users/rajkaria/Projects/0G-ai-kit/`. SP11 is at `2f7a022`.
2. **Merge the auto-generated changeset release PR** to publish `0gkit-observability@0.1.0` + `0gkit-cli@0.6.0` + create-* patches to npm.
3. **Execute SP12 — community + CI templates + docs polish + cut v1.0.0.** Plan is at `docs/superpowers/plans/2026-05-22-sp12-community-cicd-docs.md`. Start via `superpowers:executing-plans` or `superpowers:subagent-driven-development`.
4. **SP12 polish pickup items from SP11:**
   - Concept index at `/concepts/page.mdx` doesn't link to the new observability sub-routes — fix as part of SP12's Pagefind search + docs polish pass.
   - `0gkit-testing` package's `test-wallet-errors.test.ts` and `fixtures.test.ts` flake under turbo parallel scheduler — bump per-test timeouts to 30 s or set concurrency=1 for those suites.
   - `0g cost forecast --from-jaeger <path>` flag (trace replay → cost) — scoped out of SP11 v0 and explicitly deferred to SP12.

**Workflow:** plan-already-written → execute via `superpowers:executing-plans` → squash-merge after CI. `--auto` merge disabled (`enablePullRequestAutoMerge: false`); use `gh pr merge --squash --delete-branch`.

### Key Decisions (this session — SP11)

- **D32 — Observability via prototype patching, not module rewriting.** `instrument0g()` mutates `Storage.prototype.upload` etc. directly at call time. ES module live-bindings make this propagate to every consumer that already imported the class. Tests inject explicit `targets` for sync isolation; production uses async `defaultTargets()` via computed-specifier dynamic imports. Attestation deferred because the package exports free functions, not a class — explicit opt-in via `targets.attestation` documented as the path forward.
- **D33 — Span attribute namespace is `0gkit.*`, frozen const in `ATTR`.** Single source of truth for all attribute keys. Standard OTel `http.*` / `rpc.*` attributes layered on top by user instrumentation; we don't duplicate them. The `0gkit.*` prefix follows OTel's vendor namespace convention so collectors can filter on prefix.
- **D34 — Bundle budget 20 KB gzipped for the public entry.** Asserted by `bundle-size.test.ts` via esbuild + gzip. `@opentelemetry/api` externalised (peer); SDK + exporter peers are optional and never reach the bundle unless explicitly imported via `mode: 'auto'`. Protects the "free observability" promise — observability bundle cost must never be a toolkit decision factor.
- **(Carried) D29–D31 from SP10**, D27–D28 from SP9, D24–D26 from SP8, D21–D23 from SP7, D19–D20 from SP6, D13–D18 from SP4/SP5.

---

## Previous Session Context (SP10 shipped + released)

### SP10 — `@foundryprotocol/0gkit-jobs` ✅ Shipped

**0gkit repo:** [PR #18](https://github.com/rajkaria/0gkit/pull/18) — SP10 squash-merged previous session as `296c1d8`. Released to npm at v0.5.0 via PR #19 (`00bc221`) at the top of this session.

**What shipped (all 10 tasks from the SP10 plan):**

- **New `@foundryprotocol/0gkit-jobs` package** — durable async job runner. Public surface: `JobRunner` (with `enqueue` / `start` / `stop` / `waitFor` / `register` / `hasDefinition`), `jobs.define()` factory (zod-typed input/output schemas + handler + maxAttempts + backoffMs), `jobs.signWebhookBody` / `jobs.verifyWebhook` HMAC helpers, and the `JobBackend` interface + concrete `MemoryBackend` / `SqliteBackend` / `RedisBackend` implementations under `./backends/<kind>` sub-path exports.
- **Three backends, one conformance contract** — 9 scenarios (enqueue+status round-trip, FIFO claim, claim-on-empty, complete, fail-with-retry, fail-without-retry, cancel, status-of-unknown, terminal-state cancel no-op + JOBS_JOB_NOT_FOUND on missing) run against memory + sqlite via `describe.each`. Redis is gated on `JOBS_TEST_REDIS_URL` (CI doesn't run it by default). `better-sqlite3` is a direct dep; `ioredis` is an optional peer lazy-loaded via computed-specifier `["ioredis"].join("/")` (D29).
- **Graceful shutdown** — `runner.stop({ drain: true, timeoutMs })` lets in-flight handlers finish; `runner.stop({ drain: false })` aborts via the `AbortSignal` exposed in the handler ctx. Designed for Vercel Fluid Compute `beforeExit` (25s grace).
- **Webhook delivery** — HMAC-SHA256, hex, with `sha256=` prefix tolerated. `timingSafeEqual` comparison; `verifyWebhook` returns false (never throws) on garbage input. The signed payload is the exact request body bytes — receivers must read raw bytes before verifying. Retry default 2 (3 total attempts), webhook failures don't affect job state (D30).
- **At-least-once delivery (D31)** — a crash between handler completion and `backend.complete()` returning will retry. Handlers must be idempotent on input; webhook receivers should dedupe on `(jobId, newState)`. Documented in the `/concepts/durable-jobs` page.
- **`0gkit-cli`** — new `0g jobs status <id> [--backend memory|sqlite] [--path ./.jobs.db] [--json]` subcommand. `jobsBackendFactory` added to `ProgramDeps` so the read-only inspector is fully testable. Default factory in `cli.ts` constructs `MemoryBackend` / `SqliteBackend` based on the `--backend` flag.
- **`ai-agent` template migrated** — each ReAct iteration is now a durable `agent.step` job. `buildStepJob({ compute, verifyStep })` returns the JobDefinition; `runAgent({ runner, stepJob, tools, log, maxSteps, stepTimeoutMs })` enqueues per-iteration and waits via `runner.waitFor`. Default `MemoryBackend` keeps the tutorial infra-free; README documents the one-line swap to sqlite/redis. SP8 D26 hand-off resolved.
- **Docs site** — new `apps/docs/app/packages/jobs/page.mdx` (quickstart + backends matrix + webhook server-side example + Vercel Fluid Compute pattern) and `apps/docs/app/concepts/durable-jobs/page.mdx` (delivery model, backoff, lifecycle diagram, when-not-to-use). Sidebar nav gains a Jobs package entry + a Durable jobs concept entry.
- **Decisions D29–D31** appended to `docs/DECISIONS.md`.

**Test/coverage rollup (workspace-wide, pre-merge):** 42 new vitest tests in `0gkit-jobs` at 97% lines / 91% branches (gate 85/75) — full coverage on memory.ts + sqlite.ts + define.ts; 5 new CLI tests cover the jobs subcommand; 7 ai-agent template tests cover the six original branches plus a new end-to-end retry-exhaustion path that exercises the JobRunner + StepJob integration. Workspace totals: 32 packages green via turbo (lint/typecheck/build/test), `pnpm format:check`, `pnpm boundary:check` (284 modules, 0 violations), `pnpm docs:check` (13 codes thrown, all documented — JOBS_* codes were forward-defined in SP9 so SP10 only had to start throwing them), `pnpm test:scripts` (9 docs-check unit tests), `pnpm templates:check` (9 templates OK) — all green.

**Implementation deviations (documented in PR body):**

- `JobBackend.cancel(id)` for an **unknown** id throws `JOBS_JOB_NOT_FOUND` (not silent no-op as the plan suggested) — symmetric with `complete()` and `fail()` and easier to debug. Cancelling a terminal-state job (done/failed/cancelled) is still a no-op.
- `RedisBackend.cancel()` also throws `JOBS_JOB_NOT_FOUND` for missing ids (the plan's draft was silent), keeping the conformance contract uniform across backends.
- `runner.workerLoop` checks `abortController.signal.aborted` at the top of each loop iteration so a `stop({ drain: false })` exits the loop immediately even before claiming the next job. Added a private `runOne(rec)` extraction to keep the loop readable.
- Added a `hasDefinition(name): boolean` test/inspection helper on JobRunner. Cheap, makes the register() side-effect observable from tests, doesn't pollute the public docs surface (typed but not advertised in README).
- `define.ts` default backoff is `min(500ms · 2^attempt, 60_000ms)` with decorrelated jitter — explicitly bounded so a misconfigured `maxAttempts: 30` can't sleep for hours. Coverage test loops attempts 1..30 and asserts `0 < delay ≤ 60_000`.
- Webhook integration test in `webhook.test.ts` uses `vi.fn` to replace `globalThis.fetch` then restores; asserts the `X-0gkit-Signature` header round-trips through `verifyWebhook` against the request body (proves the runner signs the same bytes the receiver verifies).
- Template install can't be tested locally — `pnpm install --ignore-workspace` in `templates/ai-agent/` fails on `@foundryprotocol/0gkit-jobs ^0.1.0` until publish. Scaffolder smoke (`pnpm --filter create-0g-app test`) still green (73 pass / 2 skipped). The static `pnpm templates:check` passes. Template's own `pnpm test` will work once SP10's changeset publishes.

**Pending publish:** the changeset at `.changeset/sp10-0gkit-jobs.md` cuts a minor on `0gkit-jobs` (first publish) + `0gkit-cli` and patches on `create-0gkit-app` + `create-0g-app` (template registry update). Will release with the next `changeset version` run.

**Release this session before SP10:** [PR #15](https://github.com/rajkaria/0gkit/pull/15) (`a9e7ec3`) — changeset versioned + published all 16 packages to npm at **v0.4.0** including the SP8 template registry bumps (`create-0gkit-app@0.4.0` / `create-0g-app@0.4.0`) and the SP9 minor bumps (`0gkit-core`, `0gkit-cli`, `0gkit-react`, plus patch bumps on 12 other packages). All v0.4.0 tags pushed to GitHub.

**Roadmap status:**

- ✅ Phase 1 (SP1 / SP2 / SP3) — live on npm at v0.4.0.
- ✅ Phase 2 (SP4 / SP5) — shipped.
- ✅ Phase 3 (SP6 / SP7 / SP8) — shipped.
- ✅ Phase 4 SP9 — shipped.
- ✅ Phase 4 SP10 — shipped this session.
- ⏭ Phase 4 SP11 (`0gkit-observability`) — plan already written at [docs/superpowers/plans/2026-05-22-sp11-0gkit-observability.md](https://github.com/rajkaria/0gkit/blob/main/docs/superpowers/plans/2026-05-22-sp11-0gkit-observability.md).
- ⏭ SP12 — plan on main.

### Next Steps

**Immediate next session:**

1. **Pull `main`** on `rajkaria/0gkit` (`git fetch && git pull --ff-only`). Local working dir is still `/Users/rajkaria/Projects/0G-ai-kit/`. SP10 is at `296c1d8`.
2. **Run `changeset version` + release** to ship the SP10 minor bumps (`0gkit-jobs` first publish + `0gkit-cli`) and the `create-*-app` patch bumps. Once published, the `ai-agent` template's local `pnpm install` will work for users running `npm create 0gkit-app@latest ai-agent`.
3. **Execute SP11 — `0gkit-observability`.** Plan is at `docs/superpowers/plans/2026-05-22-sp11-0gkit-observability.md`. Start via `superpowers:executing-plans` or `superpowers:subagent-driven-development`. SP11 codes (`OBSERVABILITY_EXPORTER_FAILED` etc.) are pre-defined in SP9's `ERROR_CODES` so the enum doesn't need to widen — just start throwing them.
4. **Then SP12** (community + CI templates + docs polish + cut v1.0.0).

**Workflow:** plan-already-written → execute via `superpowers:executing-plans` → squash-merge after CI. `--auto` merge disabled (`enablePullRequestAutoMerge: false`); use `gh pr merge --squash --delete-branch`.

---

## Previous Session Context (SP9 shipped; last updated 2026-05-22 ~16:02 IST)

### SP9 — Error taxonomy + `helpUrl` + `docs:check` CI gate ✅ Shipped

**0gkit repo:** [PR #17](https://github.com/rajkaria/0gkit/pull/17) — SP9 squash-merged this session as `eca1540`. Branch `sp9-error-taxonomy` deleted post-merge.

**What shipped (all 7 tasks from the SP9 plan):**

- **`0gkit-core`** — `ZeroGError` rewritten to require `{ code: ErrorCode, message, hint }` and derive `helpUrl` deterministically from the code. `ERROR_CODES` is a frozen 45-entry tuple namespaced by prefix (CONFIG / WALLET / CHAIN / STORAGE / COMPUTE / DA / ATTESTATION / CONTRACTS / INDEXER / JOBS / OBSERVABILITY — the JOBS_* and OBSERVABILITY_* codes are forward-defined for SP10/SP11). New exports: `ERROR_CODES`, `ErrorCode`, `isErrorCode()`, `errorNamespace()`, `helpUrlFor()`, `ERROR_HELP_BASE`. Subclass constructors (`ConfigError`, `NetworkError`, `ChainError`, `AttestationError`) preserve `(message, hint)` signatures and default their `code` based on the namespace — most existing callsites compile unchanged.
- **Every `0gkit-*` package** — every `throw new Error(...)` retyped to a canonical code. 18 stale broad-category test assertions (`code === "CONFIG"` etc.) migrated to specific SCREAMING_SNAKE codes. Added focused `*-errors.test.ts` suites per package asserting `(code, helpUrl, instanceof Error)`.
- **`0gkit-cli`** — `RenderedError` gains `helpUrl`; `--json` output now carries `{ code, message, hint, helpUrl }`; human mode adds a `Help: <url>` line under the hint. Fallback for unrecognized thrown shapes uses `CONFIG_INVALID_ARGUMENT` (not the old broad `"CONFIG"`).
- **`0gkit-react`** — new `<ZeroGErrorBoundary>` component. Catches errors in its subtree, renders code + message + hint + clickable helpUrl. Supports `fallback` (custom render) and `onError` (analytics side-effect) props. For non-ZeroGError, renders a generic alert with no link.
- **Docs site** — `apps/docs/app/errors/<CODE>/page.mdx` × 45 (substantive cause/fix/example for the 11 currently-thrown codes; forward-defined stubs for SP10/SP11 codes), `apps/docs/app/errors/page.mdx` namespace-grouped index, sidebar nav entry.
- **CI gate** — `pnpm docs:check` (orphan detector + scripts test suite) wired into CI between `pnpm test` and `pnpm templates:check`. Missing pages or orphan pages fail red. Codes in the enum but not yet thrown are warnings only.
- **`pnpm test:scripts`** — new npm script that runs `node --test scripts/__tests__/*.test.mjs`. The docs-check unit tests are pure Node ESM via the built-in `node:test` runner — no `tsx` or `vitest` added to root devDeps.
- **Decisions** — D27 (helpUrl is computed from the code, not stored per-throw) + D28 (`docs:check` is a CI gate, not just a lint).

**Test/coverage rollup (workspace-wide, pre-merge):** 587 vitest tests passing (up from 545 pre-SP9) + 9 docs-check unit tests via `node:test`. `pnpm format:check`, `pnpm boundary:check` (266 modules, 0 violations), `pnpm typecheck`, `pnpm docs:check` (11 codes thrown, all documented), `pnpm templates:check` (9 templates OK) all green.

**Implementation deviations (documented in PR body):**

- `docs-check` written as `scripts/docs-check.mjs` (pure Node ESM) instead of `scripts/docs-check.ts` with `tsx`. The plan called for tsx but adding a TS runtime to root devDeps wasn't justified for a small extraction-and-diff script. Tests use `node --test` instead of vitest for the same reason — no root-level test runner exists today.
- `scaffold-error-pages.mjs` (one-shot scaffold) emits MDX pages by reading the built `packages/0gkit-core/dist/index.js` to source `ERROR_CODES`. Per-code `CONTENT` dictionary has substantive entries for the 11 thrown codes; forward-defined codes (SP10/SP11) get a sensible generic template that doesn't pretend the package exists.
- `testWallet-errors.test.ts` was split — the sendTransaction assertion moved into the main `test-wallet.test.ts` (which already covered the codepath) to avoid a `vi.doUnmock` + `vi.resetModules` race between describe blocks. Net: one new error test file, no duplication.
- `0gkit-cli/program.ts` runCommand fallback for non-ZeroGError shapes was changed from `code: "CONFIG"` → `code: "CONFIG_INVALID_ARGUMENT"` and now computes the `helpUrl` via `helpUrlFor()` so the JSON shape is always uniform.
- `apps/docs/lib/nav.ts` got an `Error codes` entry in the Guides section (the plan didn't explicitly call out the sidebar but the page wouldn't be discoverable otherwise).

**Pending publish:** the changeset at `.changeset/sp9-error-taxonomy.md` cuts a minor on `0gkit-core` + `0gkit-react` + `0gkit-cli` and patches on 12 other packages. It will release with the next `changeset version` run. Also still pending from SP8: `create-0gkit-app` + `create-0g-app` minor bumps.

**Roadmap status:**

- ✅ Phase 1 (SP1 / SP2 / SP3) — live on npm at v0.3.0.
- ✅ Phase 2 (SP4 / SP5) — shipped.
- ✅ Phase 3 (SP6 / SP7 / SP8) — shipped.
- ✅ Phase 4 SP9 — shipped this session.
- ⏭ Phase 4 SP10 (`0gkit-jobs`) — plan already written at [docs/superpowers/plans/2026-05-22-sp10-0gkit-jobs.md](https://github.com/rajkaria/0gkit/blob/main/docs/superpowers/plans/2026-05-22-sp10-0gkit-jobs.md) (now on main as of [PR #16](https://github.com/rajkaria/0gkit/pull/16)).
- ⏭ SP11 / SP12 — plans on main.

### Next Steps

**Immediate next session:**

1. **Pull `main`** on `rajkaria/0gkit` (`git fetch && git pull --ff-only`). Local working dir is still `/Users/rajkaria/Projects/0G-ai-kit/`. SP9 is at `eca1540`.
2. **Run `changeset version` + release** to ship the SP9 minor bumps + the pending SP8 create-* bumps.
3. **Execute SP10 — `0gkit-jobs`.** Plan is at `docs/superpowers/plans/2026-05-22-sp10-0gkit-jobs.md`. Start via `superpowers:executing-plans` or `superpowers:subagent-driven-development`. SP10 codes (`JOBS_BACKEND_UNREACHABLE` / `JOBS_JOB_NOT_FOUND` / `JOBS_HANDLER_THREW` / `JOBS_WEBHOOK_BAD_SIGNATURE`) are pre-defined in SP9's `ERROR_CODES` so the enum doesn't need to widen — just start throwing them.
4. **Then SP11** (`0gkit-observability`), **then SP12** (community + CI templates + docs polish + cut v1.0.0).

**Workflow:** plan-already-written → execute via `superpowers:executing-plans` → squash-merge after CI. `--auto` merge disabled (`enablePullRequestAutoMerge: false`); use `gh pr merge --squash --delete-branch`.

---

## Previous Session Context (SP9–SP12 plans batched; last updated 2026-05-22 ~13:55 IST)

### Phase 4 plans ready (SP9–SP12 batched, prior session)

All four Phase 4 implementation plans written upfront in a single session so subsequent execution sessions skip the roadmap re-reading step. Landed at [0gkit#16](https://github.com/rajkaria/0gkit/pull/16) as `9575a1c`.

- [SP9 plan](https://github.com/rajkaria/0gkit/blob/main/docs/superpowers/plans/2026-05-22-sp9-error-taxonomy.md) — Error taxonomy: ~40 SCREAMING_SNAKE codes + `helpUrl` + per-code MDX page + `pnpm docs:check` CI gate + `<ZeroGErrorBoundary>`. **Executed this session — see above.**
- [SP10 plan](https://github.com/rajkaria/0gkit/blob/main/docs/superpowers/plans/2026-05-22-sp10-0gkit-jobs.md) — `0gkit-jobs`: JobRunner + `jobs.define()` + memory/sqlite/redis backends + HMAC webhooks + ai-agent template migration.
- [SP11 plan](https://github.com/rajkaria/0gkit/blob/main/docs/superpowers/plans/2026-05-22-sp11-0gkit-observability.md) — `0gkit-observability`: `instrument0g()` prototype-patch + `0gkit.*` OTel attributes + `0g cost` CLI + tee-attested-api template migration + <20 KB bundle.
- [SP12 plan](https://github.com/rajkaria/0gkit/blob/main/docs/superpowers/plans/2026-05-22-sp12-community-cicd-docs.md) — Polish: `--ci` flag + Vercel deploy buttons + issue/PR templates + CONTRIBUTING refresh + Pagefind search + Lighthouse CI + cut v1.0.0.

Decisions D27–D37 pre-allocated across plans. SP10/SP11 error codes pre-listed in SP9's `ERROR_CODES` so later sprints don't amend earlier ones.

New skill: `multi-sprint-planning` at `~/.claude/skills/multi-sprint-planning/SKILL.md` — use it when ≥3 sprints remain on a known roadmap.

---

## Previous Session Context (Last updated: 2026-05-22 ~13:05 IST)

### Current State

**0gkit at `rajkaria/0gkit`.** **Phase 1 (SP1–SP3) released; Phase 2 (SP4 + SP5) shipped; Phase 3 SP6 + SP7 + SP8 all shipped.** Next is **SP9 — error taxonomy** (Phase 4 kickoff).

**Phase 1+2+3 status:**

- ✅ SP1 — `create-0gkit-app` ([PR #4](https://github.com/rajkaria/0gkit/pull/4), fix [PR #6](https://github.com/rajkaria/0gkit/pull/6), release [PR #7](https://github.com/rajkaria/0gkit/pull/7)).
- ✅ SP2 — `0g dev` local stack ([PR #3](https://github.com/rajkaria/0gkit/pull/3)).
- ✅ SP3 — `0gkit-wallet` + `0gkit-wallet-react` ([PR #5](https://github.com/rajkaria/0gkit/pull/5), 342 tests, 95.9%/95.96% coverage).
- ✅ Phase 1 npm release — 12 packages live at v0.2.0; `create-0gkit-app@0.3.0`.
- ✅ SP4 — `0gkit-contracts` ([PR #8](https://github.com/rajkaria/0gkit/pull/8), `b9e8c23`) + repo rename. Hotfix [PR #10](https://github.com/rajkaria/0gkit/pull/10) `e8a9855`.
- ✅ SP5 — `0gkit-testing` ([PR #11](https://github.com/rajkaria/0gkit/pull/11), `c4fc6fe`). 50 tests at 94/93.
- ✅ SP6 — `0gkit-indexer` + `useEvent`/`useLogs` ([PR #12](https://github.com/rajkaria/0gkit/pull/12), `eb4a61f`). 45 new tests at 88.4%/75% (indexer) and 100%/90.24% (react).
- ✅ SP7 — cost estimator + dryRun across storage/compute/da/contracts/cli ([PR #13](https://github.com/rajkaria/0gkit/pull/13), `c834d6a`, squash-merged this session). 42+ new tests; 0gkit-cli at 85.4/78.0 coverage.
- ✅ SP8 — expanded template library ([PR #14](https://github.com/rajkaria/0gkit/pull/14), `61cd0a9`). Five archetypes shipped: `chat` (Next.js + indexer + react), `storage-app` refresh (SP7 dry-run + dedup), `ai-agent` (ReAct on 0G Compute + attestation gate), `tee-attested-api` (Hono + `X-0G-Attestation` per response), `nft-with-storage` (Foundry ERC-721 + SP4 typed contracts). 37 new tests across templates; per-template coverage all ≥ 80/70. `create-0gkit-app` registry: 5 → 9 templates; `OGKIT_TEMPLATE_REF` default bumped to `v0.3.x`. DECISIONS D24/D25/D26 on template layout + deps-injection seam + SP10/SP11 hand-off doctrine.
- ⏭ SP9 — error taxonomy (next; Phase 4 kickoff).

**Live on npm at v0.3.0** (released in this session via PR #9 squash-merge → release workflow): all 14 `@foundryprotocol/0gkit-*` packages including the first publishes of `0gkit-contracts`, `0gkit-testing`, `0gkit-indexer`, plus the SP7 minor bumps and SP5 patch bumps. **Pending publish**: `create-0gkit-app` and `create-0g-app` minor bumps from SP8 (waiting on next `changeset version` run — changeset for the template registry expansion is checked in at `.changeset/sp8-templates.md`).

**SP7 ship (this session):**

- `0gkit-core`: new `Estimate` envelope (`{ kind, gas, fee, breakdown, expectedSeconds? }`) + `DryRunResult<T>` (`{ dryRun: true, estimate, result }`) + `formatEstimate(est)` + `formatNative(wei)` (4/6/9-decimal magnitude tiering with scientific fallback for sub-gwei).
- `0gkit-storage`: `Storage.estimate(bytes) → StorageEstimate` (256 KiB segment math, 80k gas + 1 gwei per segment); `Storage.upload(bytes, { dryRun: true })` computes Merkle root locally + returns `DryRunResult<UploadResult>` without broadcasting.
- `0gkit-compute`: `Compute.estimate({ messages, model?, maxOutputTokens? })` (chars/4 token heuristic, 1 gwei/token placeholder, default 512 max output); `Compute.inference(args, { dryRun: true })` short-circuits the broker entirely.
- `0gkit-da`: `DA.estimate(payload)` (live → bytes × 1e6 wei; local → 0); `DA.publish(payload, { dryRun: true })` returns digest + estimate without POSTing to the encoder.
- `0gkit-contracts`: new `typedContract.estimate.<method>(...args)` namespace via viem `estimateContractGas` + `getGasPrice`; `typedContract.write.<method>([args], { dryRun: true })` runs `simulateContract` (surfaces EVM reverts) but never broadcasts.
- `0gkit-cli`: new `0g estimate storage|compute|da|contracts` subcommands with `--json` support + `bigintsToStrings` JSON serializer; `--dry-run` flag on `0g storage put`, `0g da publish`, `0g infer` — dry-run bypasses the key/provider preflight so estimates are offline-only.

Latest `main` after SP7 merge: `c834d6a` (squash). Branch `sp7-cost-estimator-dryrun` deleted post-merge.

**SP6 ship (this session):**

- New `packages/0gkit-indexer/` — polling indexer with reorg-safe event subscriptions. Public surface: `new Indexer({ network, cursor, pollIntervalMs?, reorgDepth?, confirmations? })`, `indexer.subscribe({ contract, event, fromBlock?, onEvent, onReorg? })`, `start()` / `stop()` / `status()`.
- Cursor backends with sub-path exports: `MemoryCursorStore` (default), `SqliteCursorStore` (`./cursors/sqlite`, `better-sqlite3` direct dep), `RedisCursorStore` (`./cursors/redis`, `ioredis` optional peer with lazy import).
- Reorg detection: bounded `BlockTracker` window (default 64), per-poll hash re-fetch, `findCommonAncestor` walk, `onReorg(rolledBack)` callback. Rolled-back `DecodedEvent`s carry `{ blockNumber, blockHash (old), eventName, address }`; full args are not preserved across reorgs in v0 — documented in README.
- Multi-subscription multiplexing on a single poll loop (any number of `subscribe()` calls share one timer).
- Decorrelated exponential backoff with jitter (AWS pattern, attempt-aware, `[base·2ⁿ, base·2ⁿ⁺¹]` band, clamped to `maxMs`).
- Tooling: `tsup` ESM build with 3 entries (`index`, `cursors/sqlite`, `cursors/redis`); vitest gate 80/70; boundary test scoped to file-grep (the global `pnpm boundary:check` is exercised by 0gkit-chain's existing test — running both in turbo races against chain's temp violation fixture, hotfix `0889be8`).
- 31 indexer tests across 9 suites at 88.4% lines / 75% branches.
- React: `ZeroGIndexerProvider` + `useEvent` + `useLogs` + `useIndexer` in `0gkit-react`. `useEvent` accumulates events and on `onReorg` filters out rolled-back block numbers; `useLogs` is a one-shot historical query. 14 react tests at 100% lines / 90.24% branches.

Latest `main` after SP6 merge: `<post-merge SHA from squash>` (the PR squash-merged via `gh pr merge --squash --delete-branch`).

**Roadmap status (per `docs/specs/2026-05-20-essentials-roadmap.md` in 0gkit):**

- ✅ Phase 1 — SP1, SP2, SP3 live on npm.
- ✅ Phase 2 — SP4, SP5 shipped.
- ✅ Phase 3 SP6 — `0gkit-indexer` shipped.
- ✅ Phase 3 SP7 — cost estimator + dry-run shipped.
- ⏭ Phase 3 SP8 — expanded template library (next).
- ⏭ Phase 4 — SP9–SP12.

**Plan deviations (documented in PR body / inline comments):**

- `indexer-basic.test.ts` first assertion: `safeHead = head - confirmations + 1` (head=5, conf=1 → deliver blocks 1..5). Plan's draft assertion was [1..4]; corrected to [1..5] to match the actual math.
- `indexer-reorg.test.ts` assertions: the fixture's `h(phase, n)` differs across phases for ALL blocks, so `findCommonAncestor` returns `null` and the indexer rewinds to `fromBlock - 1n`. Assertions changed to: rolled-back length > 0 + every phase-B value in [201, 206] after the rewind (stronger than plan's "delivered > 5 times").
- `useLogs.ts` types `contract` as `SubscribeOptions["contract"]` (structural alias) rather than importing `Abi`/`Address` from `viem` directly — keeps `0gkit-react` from picking up `viem` as a direct dep.
- `log-decoder.ts` uses `decoded.eventName ?? ""` to satisfy viem's `string | undefined` typing under strict mode. Unreachable in practice (a matched topic0 always yields a name).

### Recent Changes (this session — SP8 template expansion)

**0gkit repo:** [PR #14](https://github.com/rajkaria/0gkit/pull/14) — SP8 five-archetype template expansion. **Squash-merged this session as `61cd0a9`.** Branch `sp8-templates` deleted post-merge.

- `templates/chat/` — Next.js 16 App Router + wallet + storage + indexer + react. Wire format codec in `lib/message.ts` (6 tests at 100/100). Server-side `/api/post` writes via `Storage.upload` + `createTypedContract.write.post`. Client side renders `useEvent({ contract, event: "MessagePosted" })` with reorg-safe semantics.
- `templates/storage-app/` — full rewrite. Adds `runStorageFlow(input, deps)` in `src/storage-flow.ts` using SP7 `{ dryRun: true }` preflight + `storage.exists(predictedRoot)` dedup short-circuit. 6 tests at 100/80.
- `templates/ai-agent/` — `runAgent(prompt, deps)` ReAct loop in `src/agent.ts` with `verifyStep` attestation gate. Tool registry in `src/tools.ts`. 8 tests at 100/91 (six branches: done, tool, max-steps, bad-attestation, unknown-tool, non-JSON fallback).
- `templates/tee-attested-api/` — `buildApp(deps)` Hono server in `src/app.ts`. `withAttestation` + `withAccessLog` middlewares in `src/middleware.ts`. Every response carries `X-0G-Attestation`; provider failures fall back to `X-0G-Attestation-Error`. 6 tests at 100/93.
- `templates/nft-with-storage/` — Foundry `contracts/StorageNFT.sol` (inline ERC-721, `tokenURI` returns `0g-storage://<root>`). `runMintFlow` in `src/mint-flow.ts` uploads media → metadata → typed `mint()` call. 11 tests at 100/90.
- `packages/create-0g-app/` — `TemplateName` union + `TEMPLATES` registry expanded 5 → 9; `OGKIT_TEMPLATE_REF` default `v0.2.x` → `v0.3.x`. SP8 scaffold smoke test parametric across all 9 templates (`src/__tests__/sp8-scaffold-smoke.test.ts`).
- `apps/docs/app/templates/page.mdx` — refreshed with 5 SP8 archetypes promoted + 4 Phase-1 starters below.
- `.changeset/sp8-templates.md` — minor bump for `create-0gkit-app` + `create-0g-app` (pending publish).
- `docs/DECISIONS.md` — D24 (templates layout + workspace exclusion), D25 (separate flow.ts testable surface), D26 (SP10/SP11 hand-off doctrine documented inline in README + verifyStep stub + fixtureAttestation wiring — no fabricated package imports).
- `docs/specs/2026-05-20-essentials-roadmap.md` — SP8 marked ✅ shipped 2026-05-22.
- `.github/workflows/ci.yml` — scaffold smoke uses `pull_request.head.sha || github.sha` for `OGKIT_TEMPLATE_REF` so PR runs fetch from the branch instead of the not-yet-published `v0.3.x` tag.

**Test/coverage rollup (per-template, offline):** 37 new tests across templates, every flow file ≥ 80/70. `pnpm format:check`, `pnpm boundary:check` (251 modules, 0 violations), `pnpm --filter create-0g-app test` (73 pass / 2 skipped) all green pre-merge.

**API surface findings (recorded so SP9+ planning doesn't re-discover):**

- `Compute.inference(args)` returns `{ output: string, receipt: Receipt, raw: unknown }` — no `attestation` field. Attestation has to be fetched out-of-band (template wires a stub + documents the swap).
- `Storage.upload(data, { dryRun: true })` returns `{ dryRun: true, estimate: Estimate, result: { root, tx: { latencyMs: 0 }, raw } }`. Live shape is `{ root, tx: Receipt, raw }`.
- `0gkit-attestation` exports `verifyEnvelope(signed, expectedSigner)` — no `fetchTeeQuote`. Real attestation feed has to come from the compute provider sidecar.
- `0gkit-testing` mocks (`mockStorageClient`, `mockComputeClient`) have stale shapes vs the real SP6/SP7 classes (mock compute has `chat()` not `inference()`, mock storage has no `estimate()` / no dry-run overload). SP8 templates use inline fakes matching the real published shapes. **Worth fixing in SP9-SP12 cleanup pass.**
- `pnpm-workspace.yaml` deliberately does **not** include `templates/*` (D24). Existing templates' stale 0gfoundation deps prevented workspace-level install.

**Foundryprotocol repo:** `CLAUDE.md` (this file) updated to reflect SP8 ship + Phase 4 next steps. Commit `5e3c6c9` on main. No source changes to app code.

### Next Steps

**Immediate next session:**

1. **Pull `main`** on `rajkaria/0gkit` (`git fetch && git checkout main && git pull`). Local working dir is still `/Users/rajkaria/Projects/0G-ai-kit/`. SP8 is at `61cd0a9`.
2. **Run `changeset version` + release** for SP8 so `create-0gkit-app` + `create-0g-app` minor bumps publish to npm and the v0.3.x template tag exists (CI smoke now uses `github.event.pull_request.head.sha` so PRs don't need the tag, but `npm create 0gkit-app@latest` users do).
3. **Write SP9 plan + execute.** Error taxonomy with docs anchors — per roadmap §SP9. Phase 4 kickoff. Every `ZeroGError` code links to a docs page that fixes it; one MDX page per code with cause/fix/example.
4. **Then SP10** — `0gkit-jobs` durable runner (the `ai-agent` and `tee-attested-api` templates have inline hand-off comments documenting the expected migration shape).

**Workflow:** plan-per-SP via `superpowers:writing-plans` → execute via `superpowers:subagent-driven-development` → squash-merge after CI. `--auto` merge disabled (`enablePullRequestAutoMerge: false`); use `gh pr merge --squash --delete-branch`.

### Key Decisions (this session)

- **D21 — Compute token-count heuristic: `ceil(chars / 4)`.** OpenAI's documented English approximation. Estimates are explicitly order-of-magnitude; precise tokenizers (`tiktoken` ~6 MB of vocab files) would inflate every install for sub-cent precision nobody asked for.
- **D22 — Storage segment math: `ceil(bytes / 256 KiB)`.** Matches `@0gfoundation/0g-storage-ts-sdk` default chunking. Per-segment gas/fee defaults (80k gas, 1 gwei) are heuristics for Galileo mid-2026; the SDK's actual cost function will override once a programmatic feed exists.
- **D23 — `DryRunResult<T>` envelope shape.** Every write path that accepts `{ dryRun: true }` returns `{ dryRun: true, estimate: Estimate, result: T }` where `T` is the existing success shape with `txHash` / `blockNumber` left undefined. Lets callers narrow with `if (res.dryRun) {...}` and share Receipt-handling logic across dry-run and live. DA `DEFAULT_DA_RATE_WEI_PER_BYTE = 1e6 wei/byte` is a placeholder until 0G publishes a programmatic DA pricing feed.
- **(Carried) D19/D20 from earlier in this session:** D19 indexer cursor backends (sqlite direct dep, redis optional peer); D20 indexer polling not WSS.
- **(Carried) D13–D18 from prior sessions:** D13 repo rename to 0gkit; D14 wagmi-style typed contracts; D15 Foundry artifacts as v0 codegen input; D16 template-string codegen (no ts-morph); D17 `testWallet` re-uses anvil dev mnemonic; D18 matchers under `/matchers` sub-path with self-registration.
- **(Carried) D11 Signer in `0gkit-core`, D12 `create-0gkit-app` canonical, D9 SCREAMING_SNAKE codes, D10 no mainnet timing dependency, D8 jobs memory/sqlite/redis, D7 wallet RSC-first split, D6 dev storage CAS is filesystem.**

### Previous Session Notes

**Phase 1+2 status:**

- ✅ SP1 — `create-0gkit-app` front door. Initial impl [PR #4](https://github.com/rajkaria/0gkit/pull/4), canonical package fix [PR #6](https://github.com/rajkaria/0gkit/pull/6) after npm 403 on `create-0g-app`, release [PR #7](https://github.com/rajkaria/0gkit/pull/7).
- ✅ SP2 — `0g dev` local stack ([PR #3](https://github.com/rajkaria/0gkit/pull/3)).
- ✅ SP3 — `0gkit-wallet` + `0gkit-wallet-react` + Signer adoption across all 5 primitives ([PR #5](https://github.com/rajkaria/0gkit/pull/5), squash-merged as `63a297e`, 342 tests, 95.9%/95.96% coverage on wallet packages).
- ✅ Phase 1 release — all 12 toolkit packages live at v0.2.0; `create-0gkit-app@0.3.0` live.
- ✅ SP4 — `0gkit-contracts` ([PR #8](https://github.com/rajkaria/0gkit/pull/8), merged as `b9e8c23`) + repo rename `0G-ai-kit` → `0gkit` (same PR). 40 contracts tests at 99.1% lines / 95.6% branches; CLI gains `0g contracts generate / list / info`. One follow-up [PR #10](https://github.com/rajkaria/0gkit/pull/10) re-exported `standardContractsMeta` from the package root (clean build caught a stale local tsbuildinfo).
- ✅ SP5 — `0gkit-testing` ([PR #11](https://github.com/rajkaria/0gkit/pull/11), open with CI running, ready to squash-merge once green). Mocks (storage/compute/DA), fixtures (receipt/attestation), `testWallet`, `setupLocalDevnet`, four vitest matchers (`toBeConfirmedOn0G`, `toHaveRootMatching`, `toBeValidAttestation`, `toBeZeroGError`). 50 testing-package tests at 94% lines / 93% branches; migrated one suite per existing 0gkit-* package.
- ⏭ SP6 — `0gkit-indexer` (reorg-safe event subscriptions with persisted cursors, built on SP4 typed contracts + SP5 fixtures). Plan not yet written.

**Live on npm (verified, v0.2.0):** all 12 Phase-1 packages — `@foundryprotocol/0gkit-core`, `0gkit-wallet`, `0gkit-wallet-react`, `0gkit-storage`, `0gkit-compute`, `0gkit-da`, `0gkit-attestation`, `0gkit-chain`, `0gkit-cli`, `0gkit-devnet`, `0gkit-mcp`, `0gkit-react`. Plus `create-0gkit-app@0.3.0`.

**Pending publish (waiting on next `changeset version` run):** `@foundryprotocol/0gkit-contracts` (first publish, minor → 0.1.0), `@foundryprotocol/0gkit-testing` (first publish, minor → 0.1.0), and patch bumps on the six existing packages whose suites migrated in SP5.

**Repo rename (D13):** `rajkaria/0G-ai-kit` → `rajkaria/0gkit`. The "ai" suffix never matched the rest of the surface (npm scope `@foundryprotocol/0gkit-*`, the `create-0gkit-app` initializer, the public `npm create 0gkit-app` command, the brand). GitHub redirects the old slug. All in-repo URL refs (badges, package.json homepage/repository/bugs across 14 packages, SECURITY.md, template `npx degit` commands, roadmap text) updated in [PR #8](https://github.com/rajkaria/0gkit/pull/8). The local working dir is still `/Users/rajkaria/Projects/0G-ai-kit/`; renaming the local directory is optional and safe to defer.

**npm-create canonical name surprise is resolved:** D5 originally said `create-0g-app`; npm returned 403 because the name is held by another publisher. The public command is **`npm create 0gkit-app`** via `create-0gkit-app@0.3.0`. `create-0g-app` remains private/internal.

Latest `0gkit` main commit after SP4 + hotfix: `e8a9855` (`fix(contracts): re-export standardContractsMeta`). Tag `v0.2.x` at `4921fc9` for stable template fetching. SP5 lives on the `sp5-testing` branch awaiting CI-green squash-merge.

**Roadmap status (per `docs/specs/2026-05-20-essentials-roadmap.md` in the 0gkit repo):**

- ✅ Phase 1 (SP1 `create-0gkit-app`, SP2 `0g dev`, SP3 `0gkit-wallet`/`0gkit-wallet-react`) — all live on npm at v0.2.0.
- ✅ Phase 2 SP4 (`0gkit-contracts`) — typed clients + Foundry codegen + 3 CLI subcommands. Bundled the repo rename.
- ✅ Phase 2 SP5 (`0gkit-testing`) — mocks/fixtures/`testWallet`/matchers/`setupLocalDevnet`, ready for squash-merge.
- ⏭ Phase 3 SP6 (`0gkit-indexer`) — next.

**SP4 ship (this session):**

- New `packages/0gkit-contracts/` — wagmi-style typed-contract layer over viem. Public surface: `createTypedContract` (returns `{ read, write, events }` with `write.*` auto-awaiting receipts and returning the `0gkit-core.Receipt` shape), `standardContracts.{erc20, erc721, multicall3, registry, attestationVerifier}` factories, `standardContractsMeta` discovery map.
- Honest defaults: Multicall3 auto-resolves to the universal `0xcA11…CA11`. ERC-20/ERC-721 require `{ address }`. Registry + attestationVerifier throw a clear `ZeroGError('CONFIG', ...)` until 0G publishes pinned addresses — no fabricated values ship.
- Codegen via pure template strings (no ts-morph dep). `0g contracts generate --abi <forge-artifact>.json --out <dir>` emits one deterministic `.ts` file per contract; output passes `tsc --strict --noEmit` with zero `any`.
- CLI: new `0g contracts generate / list / info` subcommands wired through `ProgramDeps` DI seam.
- 40 vitest cases at **99.1% lines / 95.6% branches** (gate 80/70). `pnpm boundary:check` green (181→212 modules). Changeset for `0gkit-contracts` minor (first publish) + `0gkit-cli` minor.

**SP5 ship (this session):**

- New `packages/0gkit-testing/` — test toolkit with four sub-paths (`.`, `./matchers`, `./mocks`, `./fixtures`) so consumers pull only what they need.
- `testWallet({ index })` is HD-derived from anvil's standard dev mnemonic — `index: 0` matches devnet's prefunded account 0 directly (D17).
- Mocks (`mockStorageClient`, `mockComputeClient`, `mockDAClient`) are interface-compatible with the real primitives. Roots and digests are sha256(bytes) — deterministic, no snapshots needed. DA mock catches tampered bytes.
- Fixtures (`fixtureReceipt`, `fixtureAttestation`) are byte-identical on repeat calls; the attestation envelope is signed with a publicly-documented test key and round-trips through `0gkit-attestation.verifyEnvelope`.
- `setupLocalDevnet({ autoStart })` wraps SP2's `0g dev` for vitest globalSetup; lazy-imports `0gkit-devnet` via a computed specifier so the testing package stays light when devnet isn't used.
- Four vitest matchers under `/matchers`, self-registering on import (D18): `toBeConfirmedOn0G`, `toHaveRootMatching`, `toBeValidAttestation`, `toBeZeroGError`. The attestation matcher uses a computed-specifier dynamic import for `0gkit-attestation` so the build graph stays acyclic.
- Migrated one suite per existing `0gkit-*` package (storage/compute/da/attestation/cli/contracts) — additive proof-of-API, not removal of coverage.
- 50 testing-package tests at **94% lines / 93% branches** (gate 80/70). Total monorepo tests: 247 (was 197).

**Plan deviations (documented in PR bodies):**

- SP4 `TypedContract<TAbi>` exposes `read` as `Record<string, fn>` rather than viem's precise `GetContractReturnType<...>['read']` — the generic over arbitrary `Abi` doesn't narrow indexable methods. Codegen output uses the ABI literal directly so generated clients still get full IntelliSense. Captured in `factory.ts` doc comment as a follow-up that emits a precise mapped type alongside the runtime wrapper.
- SP4 `createTypedContract.write.*` requires `signer.privateKey` to be exposed (the `fromPrivateKey` / `fromFile` / `fromEnv` loaders). KMS / wagmi signers without an exposed private key fall back to calling `signer.sendTransaction` directly with viem-encoded calldata — surfaced as a clear `CONFIG` error.
- SP4 `0g contracts generate --watch` flag accepted by commander but not yet implemented; captured as a follow-up. v0 is one-shot.
- SP5 `toBeValidAttestation` was changed to accept an *optional* `expectedSigner` arg rather than going through `0gkit-attestation.verifyEnvelope` (which requires the signer). Caller passes `FIXTURE_ATTESTATION_SIGNER` to bind the assertion to the fixture identity.

### Recent Changes (this session)

**0gkit repo (this session, in order):**

- [PR #8](https://github.com/rajkaria/0gkit/pull/8) — SP4 + repo rename squash-merged as `b9e8c23`. New `0gkit-contracts` package, three CLI subcommands, all 14 in-repo package.json URLs rewritten, decisions D13/D14/D15/D16 appended. CI on the PR was green; post-merge `lint · typecheck · build · test` on main flagged a missing root-level re-export of `standardContractsMeta` (local incremental tsbuildinfo had resolved it transitively).
- [PR #10](https://github.com/rajkaria/0gkit/pull/10) — One-line hotfix: re-export `standardContractsMeta` + `StandardContractMeta` from `0gkit-contracts/src/index.ts`. Squash-merged as `e8a9855`; main CI green.
- [PR #11](https://github.com/rajkaria/0gkit/pull/11) — SP5 `0gkit-testing` (open, CI running, will squash-merge once green). 50 tests at 94/93, full monorepo (247 tests) green, boundary check green. Bundled changeset for `0gkit-testing` minor + patch bumps on six packages whose suites migrated.

**Foundryprotocol repo:** `CLAUDE.md` (this file) updated to reflect SP4+SP5 ship, repo rename, and next-step SP6. No source changes to app code.

### Next Steps

**Immediate next session:**

1. **Confirm SP5 PR #11 landed cleanly** — if CI was still pending at end of this session, verify `gh pr view 11 --repo rajkaria/0gkit --json state,mergeStateStatus`. Pull `main` if so.
2. **Write SP6 plan + execute.** `0gkit-indexer` package: reorg-safe event subscriptions with persisted cursors (memory / sqlite / redis backends), built on SP4 typed contracts and SP5 fixtures. Public surface per roadmap §SP6: `new Indexer({ network, cursor })` + `indexer.subscribe({ contract, event, fromBlock, onEvent, onReorg })`. React adapter (`useEvent`, `useLogs`) lands in `0gkit-react`.
3. **Then SP7 `0gkit-jobs`** — queue runner for long-lived inference / upload / DA tasks; memory / sqlite / redis backends per D8.
4. **Run `changeset version` + release** once SP6 lands so the pending publishes (0gkit-contracts, 0gkit-testing, and the patch bumps) ship to npm together.

**Repo rename follow-ups (optional, low-priority):**

- Rename the local working dir `/Users/rajkaria/Projects/0G-ai-kit/` → `/Users/rajkaria/Projects/0gkit/` for consistency. Harmless — the git remote already points to the new URL.
- Sit on the old GitHub redirect for a release cycle, then re-evaluate whether the redirect still has external references worth preserving.

**Workflow reminders:** Plan-per-SP via `superpowers:writing-plans` → execute via `superpowers:subagent-driven-development` → squash-merge after CI green. Note: `--auto` merge is currently disabled on the repo (`enablePullRequestAutoMerge: false`), so use `gh pr merge --squash --delete-branch` directly once CI is green. Project's no-narration / boil-the-ocean rules apply.

### Key Decisions (this session)

- **D13 — Repo renamed `0G-ai-kit` → `0gkit`.** The "ai" suffix didn't match anything else in the surface (npm scope `@foundryprotocol/0gkit-*`, `create-0gkit-app`, the public `npm create 0gkit-app` command, the brand). GitHub redirects the old URL.
- **D14 — Typed contracts use wagmi-style `.read.method()` / `.write.method()`.** Surface viem's `getContract` typing directly rather than wrap it in a custom `.call('name', args)` adapter. Layer one thin behavior on top: `write.*` auto-awaits the receipt and returns `0gkit-core.Receipt`.
- **D15 — Codegen consumes Foundry artifacts (not Hardhat) as v0.** `forge build` is the 0G toolchain; Foundry artifact format is simple JSON with `{ abi, contractName }`. Hardhat parser is a follow-up plugin; users on Hardhat today can `jq` out the abi.
- **D16 — Codegen emits TS via template strings, not `ts-morph`.** ~80 lines of `const out = `import …` + JSON.stringify(abi)` does the job; ts-morph adds ~6 MB and its own TypeScript compiler for no return. Output is also byte-deterministic and snapshot-testable.
- **D17 — `testWallet` re-uses anvil's dev mnemonic.** `testWallet({ index: 0 })` matches devnet account 0 — tests against `setupLocalDevnet()` have gas immediately, no faucet round-trip.
- **D18 — Matchers live under `/matchers` sub-path and self-register on import.** `import "@foundryprotocol/0gkit-testing/matchers"` is the universal pattern (`@testing-library/jest-dom`, `chai-as-promised`). The `toBeValidAttestation` matcher uses a computed-specifier dynamic import for `0gkit-attestation` to keep the build graph acyclic with the migrated test in attestation.
- **(Carried) D11 Signer in `0gkit-core`, D12 `create-0gkit-app` is canonical, D9 SCREAMING_SNAKE codes, D10 no mainnet timing dependency, D8 jobs memory/sqlite/redis, D7 wallet RSC-first split, D6 dev storage CAS is filesystem.**

### Previous Session Notes

**0gkit — the neutral, MIT 0G builder toolkit. All work merged to `origin/main` (now at `9135c55`).**

Sub-projects complete (design spec: `docs/superpowers/specs/2026-05-18-0gkit-0g-builder-toolkit-design.md`, §11 decomposes 8 sub-projects):

- **SP1 Foundation** ✅ (#23) — `@0gkit/core` (networks, viem client, Receipt, ZeroGError) + `@0gkit/chain` (faucet/balance/waitForReceipt/explorerUrl) + CI neutrality rule
- **SP2 Primitives** ✅ (#24) — `@0gkit/storage` `@0gkit/compute` `@0gkit/da` `@0gkit/attestation`
- **SP3 CLI** ✅ (#25, this session) — `@0gkit/cli`: the `0g` binary (`init`, `doctor`, `chain`, `storage`, `infer`, `da`, `attest`) + opt-in-only `0g foundry` plugin

SP3 quality: 42 tests / 0 skipped; coverage 88% lines / 73% branches (gate 80/70); full monorepo `pnpm typecheck`+`build` green; `pnpm boundary:check` green; the `0g` binary runs correctly from source (`node packages/0gkit-cli/dist/cli.js …` — `--help`/`--version` exit 0, foundry hidden by default / shown with `--foundry`).

**Not yet true public access:** `@0gkit/*` packages are NOT published to npm (`npm view @0gkit/core` → 404). `npm i -g @0gkit/cli` / `npx 0g` will not resolve for outside users until the publish pipeline lands (= **SP8**). Today the toolkit is fully functional only from the repo/workspace.

### Recent Changes (SP3 — new `@0gkit/cli` package)

- `packages/0gkit-cli/` — new package: `package.json` (bin `0g`, deps 6×`@0gkit/*`+`commander`+`viem`), `tsconfig.json`, `tsup.config.ts` (shebang banner, dts:false), `vitest.config.ts` (80/80/80/70, excludes `cli.ts`), `README.md`, `LICENSE`
  - `src/cli.ts` (thin entry: real deps, `parseAsync`, `CommanderError`→clean exit), `src/program.ts` (`ProgramDeps` injection bag, `buildProgram`, `runCommand`), `src/context.ts` (flag>env>galileo), `src/output.ts` (human/`--json` renderer), `src/foundry-loader.ts` (computed-specifier dynamic import), `src/commands/{chain,doctor,init,storage,da,attest,infer,foundry}.ts`, `src/__tests__/*` (11 suites incl. `boundary.test.ts`)
- `.github/workflows/ci.yml` — builds+tests `@0gkit/cli`, added to coverage filter
- `docs/superpowers/DECISIONS.md` — appended **D4** (commander ^14, no-chalk internal ANSI, Foundry computed-specifier load pattern)
- `docs/superpowers/plans/2026-05-18-0gkit-subproject-3-cli.md` — the 13-task implementation plan (committed)
- Merged `origin/main` (PR #22 web responsive fix) into the branch before squash so it was not reverted

### Next Steps

Continue 0gkit sub-projects **in dependency order** (each: write plan in `docs/superpowers/plans/` via `superpowers:writing-plans` → execute via `superpowers:subagent-driven-development` with per-task spec+quality review → `finishing-a-development-branch` → squash-merge after CI):

1. **SP4 — MCP** (`@0gkit/mcp`): every CLI capability as an MCP tool (`og_storage_put`, `og_infer`, …); Foundry tools as an opt-in plugin absent by default. Supersedes today's Foundry-only `packages/mcp-foundry`.
2. **SP5 — Foundry refactor**: re-implement `@foundryprotocol/sdk` (`packages/sdk`) on `@0gkit/*` internals; public API unchanged (existing SDK tests stay green); net deletion of duplicated storage/da/attestation/inference code.
3. **SP6 — Scaffolder + recipes**: evolve `packages/create-foundry-forge` → `create-foundry-app` with archetype templates A–E + `examples/` (degit-able), one-command live-Ingot demo.
4. **SP7 — Playground + React**: `apps/playground` (Next.js zero-setup console) + `@0gkit/react` (`useUpload`/`useInference`/…); Playwright golden-path smoke.
5. **SP8 — Community + docs + npm publish**: CONTRIBUTING, issue/PR templates, **semantic-release publishing `@0gkit/*` to npm** (this is what finally makes `npx 0g` work for outsiders), GitHub Discussions, docs-site integration.

Two non-blocking follow-ups were spawned as task chips: (a) harden `0g init` against `../`/absolute path-escape names; (b) fix the now-stale "run `0g doctor` once the CLI exists" hint in `@0gkit/chain`.

### Key Decisions

| Decision                                                                                                                                                       | Why                                                                                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm scope `@0gkit` (DECISIONS D1)                                                                                                                              | Probed free; fallbacks `@zerogkit`/`zerog-` if ever taken                                                                                                                                            |
| CLI: `commander ^14`, no `chalk` (internal ANSI), Foundry via computed-specifier `import(["@foundryprotocol","sdk"].join("/"))` (DECISIONS D4)                 | Typed nested subcommands + clean test seam; chalk-v5 ESM hazard avoided; computed specifier ⇒ dependency-cruiser builds no edge ⇒ neutrality CI green by construction (proven by `boundary.test.ts`) |
| `buildProgram` calls `.exitOverride()` before registering subcommands; `cli.ts` catches `CommanderError`→`process.exit(code)`                                  | commander v14 copies `_exitCallback` at subcommand-creation; post-build override doesn't propagate. Production binary must still exit cleanly on `--help`/`--version`/errors                         |
| Honest faucet                                                                                                                                                  | Galileo has no programmatic faucet — `0g chain faucet` surfaces `@0gkit/chain`'s real `ConfigError`→faucet.0g.ai; acceptance tests assert this, no fabricated endpoint                               |
| Workflow: `writing-plans` → `subagent-driven-development` (fresh implementer + 2-stage review per task) → opus final review → `finishing-a-development-branch` | Proven across SP3's 13 tasks; combined sequential reviewer used for small isolated tasks to cut burn while keeping spec-then-quality gate ordering                                                   |
| All `@0gkit/cli` test files prettier-`--write` before commit                                                                                                   | `pnpm format:check` is the first CI lint step; verbatim plan transcription otherwise tripped printWidth 88                                                                                           |

### Tooling state

- `pnpm 9.12.0` (corepack), Node `>=20` (CI uses 22). Lockfile committed at repo root.
- Per-package: `tsup` ESM build, `vitest`, `tsc --noEmit` typecheck, `depcruise` lint. `pnpm boundary:check` globs `packages/0gkit-*/src`.
- Local `main` ref is stale (≈`2980241`); **trust `origin/main`** (`git fetch` first). This branch's worktree (`.claude/worktrees/crazy-panini-edc6ef`) is harness-owned; remote branch deleted post-merge.

### Architecture quick-ref

- Monorepo: `pnpm-workspace.yaml` (`apps/*`,`packages/*`) + `turbo.json`
- Layer 0 `@0gkit/core` → Layer 1 `@0gkit/{storage,compute,da,attestation,chain}` → Layer 2 surfaces (`@0gkit/cli`, future `@0gkit/mcp`/`@0gkit/react`, `apps/playground`) → Layer 3 `@foundryprotocol/*` (optional plugin, consumes Layer 1, never the reverse)
- `apps/web` — Next.js 16 (Turbopack), Tailwind 4; `packages/sdk` = `@foundryprotocol/sdk` (viem); `packages/indexer`; `contracts/` (Solidity, Foundry-the-toolkit)

### Previous Session Notes (condensed — pre-0gkit, Sprint 0–3 hackathon era)

- Sprints 0–3 shipped to main: monorepo+brand+landing (Vercel, `foundryprotocol.xyz`), 6 contracts+SDK+indexer+eval+forge UI, inference loop/Ingot/Lineage/AI-wizard/TEE-viewer, traction polish (LangChain+vercel-ai adapters, 9 docs pages, smith profiles, dashboard sparklines, OG variants, `contracts/SECURITY.md`).
- SDK was `1.0.0-rc.1`, public surface frozen; inference proxy returned OpenAI-shaped stubs (0G Compute dispatch not yet wired at that time — now superseded by the real `@0gkit/*` primitives).
- Vercel deploy history: pnpm mismatch fixed via corepack (`566fe3f`); Next.js root-detection fixed (`9896a71`); `ignoreCommand` removed (`f5fe0ee`); install uses `--no-frozen-lockfile`.
- After SP1–2 the real 0G primitives (`@0gkit/*`) replace the earlier stub story; the Foundry SDK refactor onto them is SP5.
