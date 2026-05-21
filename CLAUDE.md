# Foundry Protocol — Claude Code session context

Repo: `rajkaria/foundry` · Domain: `foundryprotocol.xyz` · Default branch: `main`
Hackathon (HackQuest, deadline May 16 2026) — concluded; work now continues on the **0gkit** open-source toolkit.

## Always-on rules for this project
- **Always squash-merge own PRs** after CI (build/typecheck/test) passes — don't leave them open as a review gate. (See `~/.claude/projects/-Users-rajkaria-Projects-Foundryprotocol/memory/feedback_pr_workflow.md`)
- Commit/push/merge every change without per-change approval; take decisions and get started ("boil the ocean" on quality, no narration between tool calls).
- Honesty rule: never fabricate endpoints/behaviors; stubbed/unverified things must be labeled as such.
- **0gkit neutrality is a hard invariant:** no `@0gkit/*` package may statically depend on `@foundryprotocol/*`. Enforced in CI by `pnpm boundary:check` (dependency-cruiser). Foundry is always a separately-loaded opt-in plugin.

## Session Context (Last updated: 2026-05-21 ~10:55 IST)

### Current State

**0gkit lives at `rajkaria/0G-ai-kit` (separate repo).** **Phase 1 RELEASED** (SP1+SP2+SP3 all merged, all 12 packages live on npm at v0.2.0). Phase 2 next item is **SP4** — `0gkit-contracts` plan + execute.

**Phase 1+2 status:**
- ✅ SP1 — `create-0g-app` ([PR #4](https://github.com/rajkaria/0G-ai-kit/pull/4), merged 2026-05-21)
- ✅ SP2 — `0g dev` local stack ([PR #3](https://github.com/rajkaria/0G-ai-kit/pull/3), merged)
- ✅ SP3 — `0gkit-wallet` + `0gkit-wallet-react` + Signer adoption across all 5 primitives ([PR #5](https://github.com/rajkaria/0G-ai-kit/pull/5), squash-merged as `63a297e`, 24 commits, 342 tests, 95.9%/95.96% coverage on wallet packages).
- ✅ Phase 1 release — `changeset version` consumed 3 changesets on main, manual release commit `e8e4316`. Initial Release workflow run failed on `create-0g-app` (npm 403 — name held by another publisher); after marking it `"private": true` (commit `b7c43ff`), retry runs published all 12 remaining packages successfully.
- ⏭ SP4 — `0gkit-contracts` (wagmi-style codegen + 5 standard 0G contracts + `0g contracts generate` CLI). Spec in roadmap §SP4. Plan not yet written.

**Live on npm at v0.2.0 (verified):** `@foundryprotocol/0gkit-core`, `0gkit-wallet`, `0gkit-wallet-react`, `0gkit-storage`, `0gkit-compute`, `0gkit-da`, `0gkit-attestation`, `0gkit-chain`, `0gkit-cli`, `0gkit-devnet`, `0gkit-mcp`, `0gkit-react`, `create-0gkit-app`.

**npm-create canonical name surprise:** D5 said `create-0g-app` is the front door. That name is held on npm (403 Forbidden during publish). Worked around by marking `create-0g-app` `"private": true`; the public entry is now **`npm create 0gkit-app`** via `create-0gkit-app@0.2.0`. The `create-0gkit-app/src/bin.ts` shim still prints "use `npm create 0g-app` instead" (which is wrong — there's no `create-0g-app` to redirect to). Next session: either restructure (move scaffolder code from create-0g-app into create-0gkit-app) or pursue an npm name dispute for `0g-app`.

Latest `0G-ai-kit` main commit: `4921fc9` (ci: retry publish).

**Phase 1 status (per `docs/specs/2026-05-20-essentials-roadmap.md` in 0G-ai-kit):**
- ✅ Spec + decision log + plans (PR [#2](https://github.com/rajkaria/0G-ai-kit/pull/2), merged)
- ✅ SP2 — `0g dev` local stack (PR [#3](https://github.com/rajkaria/0G-ai-kit/pull/3), merged)
- ✅ SP1 — `create-0g-app` ([PR #4](https://github.com/rajkaria/0G-ai-kit/pull/4), merged 2026-05-21)
- ⏭ Phase-1 release — one changesets PR cutting all three packages together
- ⏭ Phase-2 SP3 — `0gkit-wallet` (wagmi connectors + SIWE + RSC split, plan TBD)

**SP1 ship (this session):**
- New `packages/create-0g-app/` — commander CLI + giget fetch + clack prompts + DI seam (`RunDeps` injects `fetchTemplate`/`runInstall`/`initGit`/`prompts` for offline tests).
- New `packages/create-0gkit-app/` — 3-line defensive redirect shim.
- 5 templates surfaced: `storage-app`, `inference-app`, `attestation-verify`, `mcp-agent`, `react-app`. Pinned via `OGKIT_TEMPLATE_REF` (default `v0.2.x`); CI smoke pins to `main` until release tag exists.
- Networks: `local` + `galileo`; `.env.example` written per network with PRIVATE_KEY left blank + tip comment.
- PM auto-detect: pnpm/npm/yarn/bun via `npm_config_user_agent`.
- 14 commits, 56 tests passing, **96.62% lines / 92% branches** coverage (gate 80/70).
- Docs MDX page + sidebar nav added (`apps/docs/lib/nav.ts`); root README now leads with `npm create 0g-app@latest`.
- CI: new `create-0g-app-e2e` job in `.github/workflows/ci.yml`.

SP2 ship details:
- New `@foundryprotocol/0gkit-devnet` package: anvil spawn (`execa`), storage mock (Node http + fs CAS at `~/.0g-dev/storage/<sha256-root>`), compute mock (OpenAI-compatible, stub/Ollama auto-detect), DA mock (sha256 in-memory), HD-accounts matching anvil dev mnemonic, state file at `~/.0g-dev/devnet.json`.
- CLI: `0g dev start | stop | status | reset` with `--detach` for CI.
- 20 new vitest cases green; full monorepo `typecheck`/`build`/`boundary:check`/`format:check` green; live smoke confirmed (anvil chainId 31337 + all three mocks).

**Plan deviations from spec (documented in SP2 PR body):**
- `ZeroGError` API differs: `(code, message, hint)` with codes `CONFIG|NETWORK|CHAIN|ATTESTATION` (not `{code, helpUrl}` as plan assumed). Adapted inline.
- Storage mock uses sha256 root (not real 0G Merkle); conformance test (real `Storage` class via `loadSdk` injection seam) deferred to SP3 alongside wallet work.
- `0g dev fund <address>` deferred — anvil already prefunds 10 accounts.
- `local` `NetworkPreset` only carries `chainId+rpcUrl` for now; extending with `storageUrl/computeUrl/daUrl` will happen when SP3 wallet/templates consume them.

### Recent Changes (this session)
**0G-ai-kit repo:**
- `docs/specs/2026-05-20-essentials-roadmap.md` — 12 SPs across 4 phases (the north-star plan)
- `docs/DECISIONS.md` — D1–D10 locked (incl. `create-0g-app` name, filesystem CAS, RSC-first wallet, memory-default jobs, flat error codes)
- `docs/plans/2026-05-20-sp2-0g-dev-local-stack.md` — 15-task TDD plan (executed)
- `docs/plans/2026-05-20-sp1-create-0g-app.md` — 13-task TDD plan (queued)
- `packages/0gkit-devnet/` — new package (accounts/anvil/storage-mock/compute-mock/da-mock/state/orchestrator + 5 test files + tsconfig/tsup/vitest config + README)
- `packages/0gkit-cli/src/commands/dev.ts` — new CLI command group
- `packages/0gkit-cli/src/{program,cli}.ts` — wired devnet deps into `ProgramDeps`
- `packages/0gkit-cli/src/__tests__/program.test.ts` — added `dev` to expected command list + fake devnet deps
- `.changeset/sp2-0g-dev.md` — minor bump for devnet + cli

**Foundryprotocol repo:** no source changes — this session's work is all in 0G-ai-kit.

### Next Steps

**Immediate next session:**

1. **Fix `create-0gkit-app` to be a real working CLI.** Today its `src/bin.ts` is a 3-line shim that tells users to run `npm create 0g-app` — but `create-0g-app` is unpublishable (npm 403). Options: (a) move all scaffolder source from `packages/create-0g-app/src/` into `packages/create-0gkit-app/src/` and delete create-0g-app from the monorepo; or (b) keep the dual-package layout but have `create-0gkit-app` bundle the scaffolder via tsup `entry: "../create-0g-app/src/bin.ts"` (workspace-only dep, since create-0g-app is private). Option (a) is simpler. Then bump create-0gkit-app to 0.3.0 via a fresh changeset and publish.
2. **Drop the `OGKIT_TEMPLATE_REF=main` override** in `.github/workflows/ci.yml` — the `v0.2.x` tag now exists, so the smoke job should pin to it. Bonus: update README + docs to lead with `npm create 0gkit-app` instead of `npm create 0g-app`.
3. **Write SP4 plan + execute.** `0gkit-contracts` package: standard 0G contract clients (registry, attestation verifier, token, multicall) shipped pre-typed; `0g contracts generate --abi <foundry-artifact>.json --out src/contracts` codegen for user contracts; emits typed `.read.method()` / `.write.method()` / `.events.Event()` clients (wagmi-style). Depends on SP3's `Signer` (now adopted across all primitives). Spec in `docs/specs/2026-05-20-essentials-roadmap.md` §SP4. Workflow: `superpowers:writing-plans` → `superpowers:subagent-driven-development` → squash-merge.

**Workflow reminders:** Plan-per-SP via `superpowers:writing-plans` → execute via `superpowers:subagent-driven-development` → `gh pr merge --squash --auto`. Project's no-narration / boil-the-ocean rules apply.

**Always:** plan-per-SP via `superpowers:writing-plans` → execute via `superpowers:subagent-driven-development` → squash-merge after CI green.

### Key Decisions (this session)
- **`create-0gkit-app` is now the canonical npm-create entry (D5 amended).** Original D5 picked `create-0g-app`, but that name is held on npm (publish returns 403). Workaround: marked `create-0g-app` as `"private": true` in the monorepo so the Release workflow stops trying to publish it. Public users run `npm create 0gkit-app`. Long-term: either restructure to drop create-0g-app or pursue an npm name dispute.
- **Signer interface lives in `0gkit-core`, not `0gkit-wallet` (D11).** Primitives consume the type, wallet implements it; no `wallet → primitive → wallet` cycle and no install-weight tunneled into every storage user. Locked in this session.
- **`create-0g-app` was the front door (D5 original).** `npm create <thing>` is the muscle memory we ride; defensive `create-0gkit-app` shim redirects. Superseded above due to npm name conflict.
- **`0g dev` ships filesystem-backed storage CAS, not sqlite.** Simpler, portable, debuggable via `ls`/`cat`. (D6)
- **Wallet will split into `0gkit-wallet` (Node) + `0gkit-wallet-react` (client).** RSC-first; impossible to misuse via tree-shaking. (D7)
- **Jobs backend default: `memory`; `sqlite` for prod single-node; `redis` for multi-node.** Conformance suite across all three. (D8)
- **Error codes are flat SCREAMING_SNAKE.** Easier to grep + URL. Adding a code is minor; renaming is major. (D9)
- **No mainnet timing dependency** — everything works on Galileo today and on mainnet at launch with a preset change. (D10)
- **Co-ship Phase 1 as one announcement** — SP1 + SP2 release together. SP2 has shipped; SP1 must complete before public release notes go out.

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

| Decision | Why |
|---|---|
| npm scope `@0gkit` (DECISIONS D1) | Probed free; fallbacks `@zerogkit`/`zerog-` if ever taken |
| CLI: `commander ^14`, no `chalk` (internal ANSI), Foundry via computed-specifier `import(["@foundryprotocol","sdk"].join("/"))` (DECISIONS D4) | Typed nested subcommands + clean test seam; chalk-v5 ESM hazard avoided; computed specifier ⇒ dependency-cruiser builds no edge ⇒ neutrality CI green by construction (proven by `boundary.test.ts`) |
| `buildProgram` calls `.exitOverride()` before registering subcommands; `cli.ts` catches `CommanderError`→`process.exit(code)` | commander v14 copies `_exitCallback` at subcommand-creation; post-build override doesn't propagate. Production binary must still exit cleanly on `--help`/`--version`/errors |
| Honest faucet | Galileo has no programmatic faucet — `0g chain faucet` surfaces `@0gkit/chain`'s real `ConfigError`→faucet.0g.ai; acceptance tests assert this, no fabricated endpoint |
| Workflow: `writing-plans` → `subagent-driven-development` (fresh implementer + 2-stage review per task) → opus final review → `finishing-a-development-branch` | Proven across SP3's 13 tasks; combined sequential reviewer used for small isolated tasks to cut burn while keeping spec-then-quality gate ordering |
| All `@0gkit/cli` test files prettier-`--write` before commit | `pnpm format:check` is the first CI lint step; verbatim plan transcription otherwise tripped printWidth 88 |

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
