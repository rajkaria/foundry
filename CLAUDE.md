# Foundry Protocol — Claude Code session context

Repo: `rajkaria/foundry` · Domain: `foundryprotocol.xyz` · Default branch: `main`
Hackathon (HackQuest, deadline May 16 2026) — concluded; work now continues on the **0gkit** open-source toolkit.

## Always-on rules for this project

- **Always squash-merge own PRs** after CI (build/typecheck/test) passes — don't leave them open as a review gate. (See `~/.claude/projects/-Users-rajkaria-Projects-Foundryprotocol/memory/feedback_pr_workflow.md`)
- Commit/push/merge every change without per-change approval; take decisions and get started ("boil the ocean" on quality, no narration between tool calls).
- Honesty rule: never fabricate endpoints/behaviors; stubbed/unverified things must be labeled as such.
- **0gkit neutrality is a hard invariant:** no `@0gkit/*` package may statically depend on `@foundryprotocol/*`. Enforced in CI by `pnpm boundary:check` (dependency-cruiser). Foundry is always a separately-loaded opt-in plugin.

## Session Context (Last updated: 2026-05-21 ~15:55 IST)

### Current State

**0gkit lives at `rajkaria/0gkit`** (renamed from `0G-ai-kit` this session — GitHub redirects the old slug). **Phase 1 (SP1–SP3) is released; Phase 2 SP4 + SP5 shipped and merged.** Next is **SP6 — `0gkit-indexer`** (reorg-safe event subscriptions built on SP4 typed contracts + SP5 fixtures).

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
