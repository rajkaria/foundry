# 0gkit — The Open-Source 0G Builder Toolkit (Design Spec)

**Date:** 2026-05-18
**Status:** Approved design — ready for implementation planning
**Author:** Brainstormed with Raj

---

## 1. One-line

`0gkit` is a neutral, MIT-licensed toolkit that makes every 0G surface (Storage,
Compute/inference, DA, Chain, TEE attestation) trivial to use from code, the CLI,
or an AI agent — designed to become the **default way anyone starts building on
0G**, genuinely useful with or without Foundry.

## 2. Positioning & guiding principles

- **Neutral-first, Foundry-optional.** The toolkit must be the best standalone
  way to use 0G. A builder who never touches Foundry gets full value. Foundry is
  a **separately-installed, clearly-demarcated plugin** surfaced _only_ where a
  genuine ownership / revenue / verifiable-receipt need arises — never woven into
  `init`, `doctor`, or the primitive packages.
- **Become the defacto.** Beat the raw `@0gfoundation/*` SDKs on every DX axis:
  first-run time, error messages, types, examples, multi-language reach. Trust
  comes from faithfully wrapping the real primitives with **escape hatches**
  (`.raw` access to the underlying SDK/client) so the toolkit is a help, never a
  cage or a lock-in.
- **Genuinely standalone units.** Each primitive package is independently
  `npm install`-able and useful alone. No forced meta-package.
- **First run is the product.** A newcomer with no funds and no docs reaches a
  working "hello 0G" in under a minute, on testnet, via faucet.
- **Boil the ocean, but shippable.** One coherent spec; decomposed into
  dependency-ordered sub-projects, each with its own plan and reviewable PR.

### Non-goals

- Not a new chain SDK or a replacement for viem/ethers — it composes them.
- Not a Foundry funnel. No Foundry branding or imports in neutral packages.
- Not a hosted service (the playground is a thin demo over the same public
  packages, not a backend builders depend on).
- No bespoke wallet/key management beyond thin convenience over viem + env.

## 3. Naming & npm

- Preferred neutral scope: `@0gkit/*`. CLI binary: `0g`.
- **Open decision (resolve at sub-project 1):** npm may reject an org scope
  starting with a digit or `@0gkit` may be taken. Fallbacks, in order:
  `@zerogkit/*`, then unscoped `zerog-*` (e.g. `zerog-storage-kit`). CLI bin `0g`
  is valid regardless. The spec uses `@0gkit/*` as the placeholder; whatever is
  chosen is applied uniformly. This is the only deliberately-open item and it
  blocks nothing but package.json `name` fields.
- Foundry layer keeps `@foundryprotocol/*`.
- License: MIT (matches existing repo).

## 4. Architecture

Built inside this pnpm/turbo monorepo (approach A). Neutral packages publish
under the neutral scope from day one, so the repo location is an implementation
detail — they can graduate to a standalone repo later with zero consumer
breakage.

### Layers (strict, one-directional dependencies)

```
Layer 0  @0gkit/core         network presets, viem client factory, Receipt, ZeroGError
Layer 1  @0gkit/storage      } each: one job, independently installable,
         @0gkit/compute      } depends ONLY on @0gkit/core (+ the relevant
         @0gkit/da           } underlying 0G SDK), exposes a .raw escape hatch
         @0gkit/attestation  }
         @0gkit/chain        faucet / balance / waitForReceipt / explorerUrl
Layer 2  @0gkit/cli (`0g`)   surfaces — consume Layer 0/1, never the reverse
         @0gkit/mcp
         @0gkit/react
         apps/playground
Layer 3  @foundryprotocol/*  Foundry layer — consumes Layer 1; OPTIONAL plugin
```

**Enforced rule:** no `@0gkit/*` package may depend on any `@foundryprotocol/*`
package. Enforced in CI via a dependency-cruiser (or eslint-plugin-boundaries)
rule that fails the build on violation. This is a hard architectural invariant,
not a convention.

### Package contracts (API sketches — final signatures fixed in each plan)

**`@0gkit/core`**

- `networks`: `aristotle` `{ chainId: 16661, rpcUrl: "https://evmrpc.0g.ai",
explorer }`, `galileo` `{ testnet, faucet }`, `local`.
- `createClient({ network, rpcUrl?, privateKey? }) → { public, wallet? }` (viem).
- `Receipt` `{ txHash?, explorerUrl?, blockNumber?, latencyMs, attestation? }`.
- `ZeroGError` base + `ConfigError`, `NetworkError`, `ChainError`,
  `AttestationError`; every error carries `.hint` (actionable, names the exact
  missing env var or the `0g doctor` remedy). No silent fallbacks.

**`@0gkit/storage`** — wraps `@0gfoundation/0g-storage-ts-sdk`

- `new Storage({ network, indexerUrl?, rpcUrl?, privateKey? })`
- `upload(data: Uint8Array | Blob | string | filepath, opts?) → { root, tx: Receipt }`
- `download(root) → Uint8Array`, `exists(root) → boolean`
- `'progress'` events; Node + browser-safe builds; `.raw` → underlying SDK.

**`@0gkit/compute`** — wraps `@0gfoundation/0g-compute-ts-sdk` broker

- `new Compute({ network, brokerRpc?, brokerKey?, provider?, model? })`
- `listProviders() → Provider[]`
- `inference({ model?, messages, temperature? }) → { output, receipt }`
- `openai() →` an OpenAI-SDK-compatible client (baseURL shim) so existing OpenAI
  code works by swapping the client; `.raw` escape hatch.

**`@0gkit/da`** — 0G DA encoder

- `new DA({ network, encoderUrl?, apiKey? })`
- `publish(blob) → { daRef, receipt }`, `verify(daRef) → boolean`

**`@0gkit/attestation`** — TEE attestation (pure; network only to validate a
signer cert chain)

- `parse(envelope) → Attestation`
- `verify(envelope, opts?) → { ok, checks, signer }`
- `report(envelope) → string` (human-readable)
- Delivers the `VISION.md` promise to "open-source the attestation parser for
  other 0G dApps" as a first-class neutral artifact.

**`@0gkit/chain`**

- `faucet(address, { network: "galileo" }) → Receipt`
- `balance(address) → bigint`
- `waitForReceipt(txHash) → Receipt` (adds `explorerUrl`)
- `explorerUrl(txHashOrAddress) → string`

### Surfaces

**`0g` CLI (`@0gkit/cli`)**

- `0g init [name]` — scaffold a minimal, copy-paste-runnable project
  (testnet-default, `.env.example`, runnable entrypoint, prints next steps).
- `0g doctor` — preflight: RPC reachability, broker key/RPC, storage indexer, DA
  encoder, faucet balance; green/red checklist with fix hints. The single
  biggest build-time-reducer; runnable before any code.
- `0g storage put|get|exists`, `0g infer`, `0g da publish|verify`,
  `0g chain faucet|balance|tx`, `0g attest verify`.
- `0g foundry …` — **separate, opt-in namespace** (not shown in default help
  unless `@foundryprotocol/sdk` is resolvable / `--foundry`); the only place
  Foundry appears in the CLI.
- Global flags: `--network` (default `galileo`), `--json` (machine output),
  `--rpc`. Pretty human output by default.

**`@0gkit/mcp`** — every CLI capability as an MCP tool (`og_storage_put`,
`og_infer`, `og_da_publish`, `og_chain_faucet`, `og_attest_verify`, …) so
Claude / Cursor / Cline / agent runtimes drive 0G directly. Foundry tools ship
as an **opt-in plugin** loaded only when configured. Supersedes today's
Foundry-only `@foundryprotocol/mcp`.

**`@0gkit/react`** — `useUpload`, `useDownload`, `useInference`,
`useAttestation`. Justified (not speculative) because the playground consumes
them.

**Playground (`apps/playground`, Next.js)** — zero-setup web console: upload,
infer, verify an attestation, see receipts + explorer links, and **copy working
code** for every action in CLI / TS / curl / MCP form. Pure client over public
packages; no builder-facing backend.

### Foundry layer (optional)

- `@foundryprotocol/sdk` re-implemented on `@0gkit/*` internals. Public API
  unchanged (backward-compatible); net deletion of the duplicated
  storage/da/attestation/inference code now living in `packages/sdk`.
- `@foundryprotocol/mcp` becomes the `@0gkit/mcp` Foundry plugin.
- `create-foundry-app` evolves `create-foundry-forge` with the A–E archetype
  templates from `docs/0G-HACKATHON-INTEGRATION-PLAN.md` and a one-command
  live-Ingot demo.
- Recipes in `examples/` (degit-able), surfaced in playground + docs. Foundry
  recipes are clearly tagged as the ownership/revenue path, not the default.

## 5. First-run UX (the adoption lever)

1. `npx 0g init my-app` → working project in seconds, defaults to **Galileo
   testnet** (no real funds needed).
2. `0g doctor` → tells the newcomer exactly what (if anything) is missing,
   with the exact env var and how to get it (incl. `0g chain faucet`).
3. First example runs against testnet using faucet funds → a real `txHash` +
   explorer link on first try, no docs required.
4. Escape hatches everywhere so power users never feel boxed in.

Rationale: `VISION.md` itself flags on-ramp friction ("will contributors trust a
wallet?"). Testnet-first + faucet + `doctor` is the answer, and it is exactly
what makes the toolkit the natural default for _everyone_ starting with 0G.

## 6. Multi-language reach

Core is TypeScript, but defacto status requires non-TS builders succeed too:

- The `0g` CLI is language-agnostic (any stack shells out; `--json` for
  scripting).
- `@0gkit/compute` ships an OpenAI-compatible HTTP shim so Python/Go/any
  OpenAI client works by swapping baseURL.
- Docs include curl + CLI for every primitive, not just TS.

(Native Python/Go SDKs are explicitly out of scope for v1 — noted as a future
sub-project, not built now.)

## 7. Error handling

One `ZeroGError` taxonomy in `@0gkit/core`. Every thrown error names the precise
cause and a concrete remedy (missing env var, unreachable endpoint → run
`0g doctor`, decoded chain revert reason, which attestation check failed). CLI
maps errors to colored, fix-oriented output. `0g doctor` is the proactive
counterpart that surfaces these before the builder hits them.

## 8. Testing strategy

- Each neutral package: unit tests with the underlying 0G SDK mocked +
  contract tests on the wrapper surface.
- **Opt-in live integration tests** gated by env, run against real Galileo
  testnet (proves reality without breaking CI for contributors without keys).
- `@0gkit/attestation`: valid + tampered fixture envelopes — must verify and
  must reject. Trust-critical, highest-rigor unit.
- CLI: snapshot tests on human output; JSON-schema tests on `--json`.
- Playground: Playwright smoke on the golden path (upload → infer → attest →
  copy code).
- ≥ 80% line coverage on all neutral packages.
- Foundry refactor: existing `@foundryprotocol/sdk` test suite must stay green
  unchanged (proves backward compatibility).

## 9. Open-source & community

MIT. `CONTRIBUTING.md`, issue/PR templates, a curated `good-first-issue`
backlog, semantic-release with a public changelog, GitHub Discussions enabled
for recipe contributions. Each package has a standalone README with quickstart,
curl/CLI/TS examples, and the escape-hatch documented.

## 10. Delivery / CI / publish workflow

Per existing repo workflow: each sub-project on its own branch → implement →
CI green (lint, typecheck, tests, the no-Foundry-dep boundary check, prettier)
→ squash-merge to `main`. Neutral packages published to npm via semantic-release
on merge. Turbo pipeline + changesets for coordinated versioning.

## 11. Scope decomposition (dependency-ordered sub-projects)

Each gets its own spec → plan → implementation → reviewable PR.

1. **Foundation** — `@0gkit/core` + `@0gkit/chain`. Resolve the npm scope
   decision here. Acceptance: `createClient`, `Receipt`, `ZeroGError`, faucet,
   `waitForReceipt`, explorer URLs; CI boundary rule live.
2. **Primitives** — `@0gkit/storage`, `@0gkit/compute`, `@0gkit/da`,
   `@0gkit/attestation` (parallelizable after 1). Acceptance: each
   independently installable, `.raw` escape hatch, ≥80% coverage, opt-in live
   tests pass on Galileo.
3. **CLI** — `@0gkit/cli` incl. `0g init` + `0g doctor`. Acceptance: a
   newcomer reaches a real testnet `txHash` in < 60s with no prior setup.
4. **MCP** — `@0gkit/mcp` (neutral tools). Acceptance: drives all primitives
   from an MCP client; Foundry plugin is opt-in and absent by default.
5. **Foundry refactor** — `@foundryprotocol/sdk` on `@0gkit/*`. Acceptance:
   public API unchanged, existing SDK tests green, net code deleted.
6. **Scaffolder + recipes** — `create-foundry-app` + `examples/`. Acceptance:
   one-command live demo; archetype templates A–E.
7. **Playground + React** — `apps/playground` + `@0gkit/react`. Acceptance:
   golden-path Playwright smoke green; copy-code works for all 4 forms.
8. **Community + docs** — CONTRIBUTING, templates, semantic-release, docs-site
   integration. Acceptance: public changelog + Discussions live.

**This spec covers the whole toolkit. The first implementation plan covers
sub-project 1 only**; 2–8 are sequenced behind it.

## 12. Risks & mitigations

- **npm scope availability** — default + ordered fallbacks (§3); decided in
  sub-project 1, blocks nothing structural.
- **Underlying 0G SDK churn** (`@0gfoundation/*` versions) — pin versions,
  wrap behind our interface, `.raw` escape hatch isolates breakage.
- **Neutrality erosion over time** — CI boundary rule makes a Foundry import
  into a neutral package a build failure, not a code-review judgment call.
- **Scope creep / never shipping** — strict sub-project ordering; sub-project 1
  is independently valuable even if later ones slip.
- **Galileo testnet/faucet instability** — `0g doctor` degrades gracefully and
  reports it; `local` (Anvil) network preset as offline fallback.

## 13. Success metrics ("defacto")

- Time-to-first-`txHash` for a new builder: target < 60s via `0g init` +
  `0g doctor` + faucet.
- A 0G builder can complete a real Storage upload / inference / attestation
  verification without ever reading Foundry docs or installing
  `@foundryprotocol/*`.
- Each primitive package usable in isolation (independent install proven by
  per-package smoke tests).
- External contributions land via the `good-first-issue` backlog +
  Discussions.
