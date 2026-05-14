# Foundry — Technical Architecture

> The complete technical decision record. Every choice has a reason and an exit criterion.

This document is the contract between the build spec ([00-build-spec.md](./00-build-spec.md)) and the implementation. It locks the stack, defines package boundaries, names the integration points with 0G, and records the trade-offs we accept.

---

## 1. System overview

Foundry has five engineered surfaces and one runtime registry (0G).

```
                                            ┌───────────────────────────────┐
                                            │            0G NETWORK         │
                                            │ ┌────────┐ ┌────────┐ ┌─────┐ │
                                            │ │  Chain │ │Storage │ │Comp.│ │
                                            │ │Aristotl│ │Log + KV│ │ TEE │ │
                                            │ └────────┘ └────────┘ └─────┘ │
                                            │       Agent ID standard       │
                                            └────────────┬──────────────────┘
                                                         │
                       ┌─────────────────────────────────┴─────────────────┐
                       │                                                   │
        ┌──────────────┴──────────────┐                       ┌────────────┴────────────┐
        │    contracts/  (Solidity)    │                       │    eval/  (Python)       │
        │  ForgeFactory · Forge        │  ◀── reads ──────     │  attribution coordinator │
        │  Ingot · ContributionRegistry│      events           │  watches Forge events    │
        │  RevenueSplitter · FORGEToken│                       │  dispatches TEE jobs     │
        └──────────────┬───────────────┘                       │  submitEvalResult tx     │
                       │                                       └──────────────┬───────────┘
                       │ ABIs + addresses                                     │
                       ▼                                                      │
        ┌─────────────────────────────┐                                       │
        │  packages/sdk  (TypeScript)  │                                       │
        │  createForge · contribute…   │ ◀──────────────────────────────────── │
        │  runInference · getLineage   │                                       │
        │  published to npm            │                                       │
        └──────────────┬───────────────┘                                       │
                       │                                                      │
        ┌──────────────┴───────────────┐                                       │
        │  apps/web  (Next.js)         │                                       │
        │  landing · app · docs        │                                       │
        │  ImageResponse for OG cards  │                                       │
        │  websockets for live numbers │ ◀─── indexer ─────                    │
        └──────────────────────────────┘                                       │
                       ▲                                                      │
                       │                                                      │
        ┌──────────────┴───────────────┐                                       │
        │  packages/indexer (TS, Node) │ ◀─────────────────────────────────────┘
        │  pulls 0G Chain logs         │     reads contract events
        │  serves to web via tRPC      │
        └──────────────────────────────┘
```

The flow of value: contributions go to **storage**, get **scored on compute (inside TEE)**, attribution is written to **chain**, ownership mints, inference runs **on compute**, revenue settles **on chain**, distribution is **pull-based on chain**.

---

## 2. Monorepo layout

```
foundry/                              <— git root, github.com/rajkaria/foundry
├── apps/
│   └── web/                          Next.js 16 (App Router, Cache Components)
│       ├── app/(marketing)/          landing, /about, /build-on, /forges, /ingots
│       ├── app/(docs)/               MDX-rendered docs (auto-routed from /docs)
│       ├── app/(app)/                in-app: explorer, profile, claim
│       ├── app/api/                  OG cards, public-readonly aggregations
│       ├── components/{ui,marketing,app}/
│       ├── lib/{wagmi,trpc,fonts}/
│       └── public/
├── packages/
│   ├── sdk/                          @foundryprotocol/sdk  (npm, public)
│   │   ├── src/{forge,ingot,inference,lineage,sub}/
│   │   ├── src/adapters/{vercel-ai,langchain,openai-compat}/
│   │   └── package.json
│   ├── indexer/                      @foundryprotocol/indexer  (private)
│   │   ├── src/{poller,decoder,store,tRPC}/
│   │   └── package.json
│   ├── design-tokens/                @foundryprotocol/design-tokens  (private)
│   │   ├── src/{colors,type,motion,space}.css
│   │   ├── marks/                    SVG of mark, wordmark, lockups
│   │   └── tokens.ts
│   └── eslint-config/                shared lint
├── contracts/                        Foundry toolkit (forge, anvil, cast)
│   ├── src/{FORGEToken,ForgeFactory,Forge,Ingot,ContributionRegistry,RevenueSplitter}.sol
│   ├── test/                         forge test, 100% line coverage target
│   ├── script/                       Deploy.s.sol, OperateForge.s.sol
│   ├── lib/                          OZ contracts, solady
│   └── foundry.toml
├── eval/                             Python — uv-managed
│   ├── src/foundry_eval/{watcher,trainer,tee_dispatch,attribution,signer}/
│   ├── tests/
│   ├── pyproject.toml
│   └── Dockerfile                    deployed to Fly.io
├── docs/                             source-of-truth markdown (rendered by apps/web)
│   ├── 00-build-spec.md
│   ├── 00-competitive-landscape.md
│   ├── 01-brand.md
│   ├── 02-design-system.md
│   ├── 03-tech-architecture.md       (this file)
│   ├── 04-sprint-plan.md
│   ├── 05-enhancements.md
│   ├── 10-protocol-overview.mdx      public-facing docs (rendered)
│   ├── 11-quickstart.mdx
│   ├── 12-sdk-reference.mdx
│   ├── 13-attribution.mdx
│   ├── 14-threat-model.mdx
│   ├── 15-build-on-foundry.mdx
│   └── 16-real-vs-roadmap.mdx
├── .github/workflows/                ci.yml, deploy.yml, release.yml
├── .changeset/                       semantic releases for sdk
├── turbo.json                        cache layout
├── pnpm-workspace.yaml
├── package.json
├── README.md                         submission-grade
└── LICENSE                           MIT
```

---

## 3. Tech stack — locked decisions

Each row records the chosen tool, the reason chosen, and the exit criterion (what would make us switch).

| Layer | Choice | Why | Exit criterion |
|---|---|---|---|
| **Monorepo** | pnpm + Turborepo | Best caching, native workspace support, no Nx complexity | If a single-package SDK release becomes painful (it won't). |
| **TS package manager** | pnpm 9 | Fastest, content-addressed store | — |
| **Language (web/sdk)** | TypeScript strict | Strict typing across SDK boundary is non-negotiable | — |
| **Web framework** | Next.js 16 App Router with Cache Components | SSR + ISR + edge OG cards + RSC for ingestion pages | Switch only if Vercel becomes deploy-blocking. |
| **Style** | Tailwind 4 (`@theme` consuming our CSS vars) | Tokens-first, atomic, fast | — |
| **Motion** | `motion` (Framer Motion fork) | Best primitives for layout, scroll, springs, reduced-motion | — |
| **Component primitives** | Radix UI primitives, custom-styled | Headless + a11y baked in; we own the visual language | — |
| **Chain access (web)** | wagmi v2 + viem | Best DX, viem's typed contracts | — |
| **Wallet** | WalletConnect v3 + injected | Multi-wallet support without lock-in | — |
| **Smart contracts toolkit** | Foundry (forge, anvil, cast) | Industry standard, fast tests, fuzz-first | — |
| **Contracts language** | Solidity 0.8.24 | Latest stable, Aristotle-compatible | — |
| **Contract libs** | OpenZeppelin (ERC20/721/1155 base, ReentrancyGuard, AccessControl) + Solady (gas-optimal utilities where appropriate) | Audited primitives, minimal surface | — |
| **Eval language** | Python 3.12 | ML ecosystem + 0G SDK examples are Python | — |
| **Eval deps** | uv (package mgmt) + pydantic v2 + httpx + sentence-transformers / transformers (for small fine-tunes) | Modern, fast, reproducible | — |
| **TEE runtime** | 0G Compute TEE (per 0G integration docs) | Mandatory for verifiable attribution | If 0G TEE not integration-ready, ship labeled non-TEE fallback on 0G Compute (per spec §5.4) |
| **Indexer** | Custom TS Node service with viem `watchEvent` → Postgres (Supabase) → tRPC | Lightweight, type-safe, no Subgraph dependency | If Supabase rate-limited at submission scale, move to Railway/Postgres direct. |
| **Cache** | Vercel Runtime Cache for dashboard aggregates; revalidateTag on chain events | Tag-based invalidation is exactly the access pattern | — |
| **Auth (app)** | Wallet-only (SIWE) — no email, no oauth | Wallet IS the identity | — |
| **Auth (docs admin / preview)** | Vercel password protection on preview | Simple, sufficient | — |
| **Hosting (web)** | Vercel | Best DX for Next; AI Gateway, ImageResponse, Cron all native | — |
| **Hosting (eval)** | Fly.io (Docker, 1×CPU + 4GB to start; auto-stop when idle) | Cheap, fast cold start, persistent volumes for model artifacts | If GPU eval scale exceeds Fly's offering, move to Modal or RunPod. |
| **Hosting (indexer)** | Fly.io alongside eval, or Vercel Cron with edge functions | — | — |
| **DNS / domains** | Cloudflare for `foundryprotocol.xyz` | Free, fast, DDoS mitigation | — |
| **Email** | Resend for transactional + outreach templates | Best DX for Next | — |
| **Analytics** | Vercel Analytics + a single privacy-respecting product analytics (PostHog self-host or skip for hackathon) | Minimal | — |
| **Observability** | Sentry (Next + Node) | Standard; free tier sufficient | — |
| **CI** | GitHub Actions, matrix per package | Fast, free, integrates with PR checks | — |
| **SDK release** | Changesets + npm publish on merge to `main` with the `release` label | Semantic versioning enforced | — |
| **Docs rendering** | Source MDX in `/docs` rendered by `apps/web` `(docs)` route group with `next-mdx-remote/rsc` | Single source of truth; no separate docs site to maintain | — |
| **Code style** | Prettier + ESLint (typescript-eslint, eslint-plugin-react-hooks, eslint-plugin-tailwindcss) | — | — |
| **Solidity style** | forge fmt + slither + cloc gates | Audit-ready cleanliness | — |
| **License** | MIT (root) + Apache-2.0 (contracts, optional) | Permissive, audit-friendly | — |

---

## 4. Network: 0G integration matrix

Mapped to the build spec §5.2. Every component is **load-bearing** (Foundry breaks without it), not decorative.

| Component | Surface that uses it | Concrete data |
|---|---|---|
| **0G Storage (Log)** | datasets, weights archival, holdout (encrypted), lineage records | content-addressed blobs, ≤4GB per chunk |
| **0G Storage (KV)** | Ingot metadata, Forge state cache, lineage indices (fast reads) | small JSON docs, write-on-event |
| **0G Compute** | baseline + final training runs, attribution eval (inside TEE), all consumer inference | per-Forge: 1 baseline + N LOO runs (N = contribution count); per-inference: 1 call per consumer request |
| **0G Compute TEE / Privacy** | the attribution eval *only* | holdout decrypted only inside enclave; result = score vector + hardware-signed attestation; the attestation is what `Forge.submitEvalResult` validates |
| **0G Chain (Aristotle)** | all contracts (FORGEToken, ForgeFactory, Forge, Ingot, ContributionRegistry, RevenueSplitter); all state transitions and value-moving operations | EVM-compatible |
| **Agent ID** | each Ingot registered with an Agent ID; metadata encrypted; tradeable ownership reflects Ingot share ledger | one Agent ID per Ingot |

Integration order (per the sprint plan): Chain → Storage Log → Compute (without TEE) → Storage KV → Agent ID → Compute TEE. Each adds verifiable proof of the previous; TEE is last because it's the highest-risk integration.

---

## 5. Smart contract architecture

Detailed contract spec is in build-spec §5.3. Implementation notes:

### 5.1 Compiler & deploy

- Solidity `0.8.24`, optimizer `200` runs, `via_ir` enabled (smaller bytecode for the share-ledger math).
- All contracts deployed via `forge script` with verified source on 0G Aristotle explorer.
- Deploys recorded in `contracts/deployments/aristotle.json` and consumed by SDK + indexer at build time.

### 5.2 Patterns

- **Pull payments** in RevenueSplitter (`claimRevenue(ingotId)`); no push loops, no DoS risk.
- **Re-entrancy guards** on every payable / value-moving fn (OZ `ReentrancyGuard`).
- **Custom errors** instead of revert strings (gas).
- **Immutability**: eval coordinator address set in `Forge` constructor; never mutable.
- **No upgradeability**: no proxies. Immutable contracts are a trust signal; we redeploy if needed.
- **Events first**: every state transition emits a structured event consumed by indexer & frontend.

### 5.3 Test coverage targets

- 100% line coverage on contracts (forge coverage)
- Fuzz tests on `mintOwnership` (random score vectors, edge cases: 0 scores, single contributor, max contributors)
- Invariant test on RevenueSplitter: `sum(claimable across holders) == receivedTotal - claimed`
- Static analysis: `slither` clean, `mythril` zero high/medium findings before mainnet deploy

### 5.4 Gas posture

We are not optimizing for L1 — 0G Chain gas is cheap. Optimize for clarity. The one gas-conscious pattern is the share-ledger: per-Ingot ERC-20 is gas-heavier than packed mapping; the choice is **packed mapping** (`mapping(address => uint128)`) + a `shareOf` view function. ERC-20 wrapping is a roadmap item.

---

## 6. SDK (`@foundryprotocol/sdk`)

The SDK is **load-bearing for Addition 3** (another team integrating). Its DX is non-negotiable.

### 6.1 Public surface (v0.1)

```ts
import { Foundry } from '@foundryprotocol/sdk';

const foundry = new Foundry({
  rpcUrl: 'https://rpc.0g.network',          // or use default
  contracts: 'aristotle',                     // resolves to deployment addresses
  signer,                                     // viem WalletClient or PrivateKeyAccount
});

await foundry.forge.create({ /* modelSpec, evalSpec, window */ });
await foundry.forge.contributeData(forgeId, { datasetRef });
await foundry.forge.contributeCompute(forgeId, { amount });
await foundry.forge.fundForge(forgeId, { amount });

const ingot   = await foundry.ingot.get(ingotId);
const result  = await foundry.inference.run(ingotId, { input });
await foundry.revenue.claim(ingotId);
const lineage = await foundry.lineage.get(ingotId);
foundry.subscribe.onForgeStateChange(forgeId, cb);
```

### 6.2 Adapters (Addition 3 turbocharger)

`@foundryprotocol/sdk/adapters/*` — drop-in adapters for popular agent frameworks. Integrators don't think about Foundry; they think "I'm using the AI SDK" or "I'm using LangChain" and Foundry slots in transparently.

```ts
// Vercel AI SDK adapter
import { foundry } from '@foundryprotocol/sdk/adapters/vercel-ai';
const model = foundry('ingot:0x...');                          // returns a LanguageModelV2
await generateText({ model, prompt: 'Translate ...' });        // revenue auto-routes

// LangChain adapter
import { FoundryChat } from '@foundryprotocol/sdk/adapters/langchain';
const llm = new FoundryChat({ ingotId: '0x...' });

// OpenAI-compatible HTTP proxy
//   POST https://api.foundryprotocol.xyz/v1/chat/completions
//   header: x-foundry-ingot-id: 0x...
//   body: standard OpenAI request
```

The adapters are how Foundry becomes consumable in **one line** for any agent project. Each adapter is its own subpath export; tree-shakeable.

### 6.3 Build & release

- Built with `tsup` (ESM-first, dual output for CJS); types via `tsc --emitDeclarationOnly`.
- Tested with `vitest` + `viem`'s test wallet.
- Released via Changesets; tagged versions published to npm on every `main` merge with a `release` label.
- 0.x while contracts are pre-audit; 1.0 after post-hackathon audit.

---

## 7. Eval / attribution engine

Detailed in build-spec §5.4. Implementation notes:

### 7.1 Architecture

```
┌────────────────────────────────────────────────────────┐
│  Eval Coordinator (Python service, deployed on Fly)    │
│                                                        │
│  Watcher  ─→  on Forge.state == EVALUATING:            │
│                fetch contribution refs from chain      │
│                fetch datasets from 0G Storage          │
│                fetch encrypted holdout                 │
│                                                        │
│  Trainer  ─→  for each (baseline+contribution_i):      │
│                dispatch training job to 0G Compute     │
│                                                        │
│  TEE Job  ─→  dispatch eval inside TEE                 │
│                holdout decrypted inside enclave        │
│                returns: score_vector + attestation      │
│                                                        │
│  Submit   ─→  submitEvalResult(attestation, scores)    │
│                via signer (eval-coordinator key)       │
└────────────────────────────────────────────────────────┘
```

### 7.2 Demo model (Addition 4 — the Killer Ingot)

**Choice: a low-resource-language translation LoRA.** Specifically a small (≤200M parameter) translation model fine-tuned on a community-contributed sentence corpus — e.g. **Konkani↔English** or **Tulu↔English**, both real low-resource languages with passionate native-speaker communities (latter has none in production; output will be visibly novel).

Why this choice over alternatives:
- A judge with no ML background can *feel* the quality: type a sentence → see a coherent translation.
- The improvement curve is steep enough that contributing data has *measurable* impact in the eval.
- Native-speaker contributors are findable on X / Reddit (Addition 2).
- It's small enough to train end-to-end inside the hackathon window.

Fallback Ingots if translation underperforms: sentiment classifier for a domain (medical / legal), specialty embedding model.

### 7.3 Repro

Eval is deterministic given the same dataset hashes + seed. Anyone can re-run with `make eval FORGE_ID=...` and verify the score vector against on-chain. This reproducibility is part of the trust system.

---

## 8. Indexer

Lightweight TS Node service. The frontend never reads chain logs directly; everything comes through the indexer for cached, paginated, typed responses.

- **Watch**: `viem.publicClient.watchEvent` against deployed contracts (Forge events, Ingot events, Splitter events).
- **Decode**: typed event handlers per contract.
- **Store**: Postgres (Supabase), schema versioned + migrated via `drizzle-kit`.
- **Serve**: tRPC over HTTP, consumed by `apps/web` with React Query.

Critical queries:
- `getLiveStats()` — for the Forge in Public dashboard (cumulative Forges, Ingots, contributions, revenue).
- `getForge(id)` — Forge detail + contribution list + state.
- `getIngot(id)` — cap table + weights ref + lineage parent.
- `getLineageGraph()` — all Ingots + edges (cached aggressively).
- `getSmith(address)` — contributions, owned shares, claimable revenue.

---

## 9. Web app structure

Next.js 16 with App Router and Cache Components (the new `use cache` directive + tag-based invalidation). Route groups:

- `(marketing)` — landing, /about, /build-on-foundry, /blog — fully static or PPR, edge.
- `(docs)` — MDX-rendered docs, indexed by Algolia DocSearch (free).
- `(app)` — wallet-gated routes — Forge explorer, Forge detail, Ingot detail, Smith profile, claim revenue, lineage graph.
- `api/` — OG cards, public read-only aggregations, the OpenAI-compatible inference proxy.

### 9.1 Hero pages

| Page | Static? | Notes |
|---|---|---|
| `/` (landing) | PPR | Metal-pour intro, "Real vs. Roadmap" table, live dashboard preview from indexer (revalidate on chain-event tag) |
| `/forges` | dynamic with `use cache` | tagged `forge-list`, invalidated by indexer on new Forge event |
| `/forges/[id]` | dynamic | tagged `forge:${id}` |
| `/ingots/[id]` | dynamic | tagged `ingot:${id}` |
| `/lineage` | dynamic with `use cache` | tagged `lineage-graph` |
| `/dashboard` (Forge in Public) | dynamic | tagged `dashboard-stats`, ws-driven counters |
| `/build-on-foundry` | static | the integrator funnel; SDK quickstart |
| `/docs/*` | static (build-time MDX) | rendered from `/docs/*.mdx` |

---

## 10. Security & threat model (summary; full doc in `/docs/14-threat-model.mdx`)

Threats addressed at the design level. Each maps to a defense.

| Threat | Defense |
|---|---|
| Sybil — one entity creating many wallets to game contribution shares | Per-wallet contribution cap per Forge (hackathon). Reputation-weighting roadmap. |
| Holdout leakage — contributor reverse-engineering the eval set | Holdout never on-chain. Decrypted only inside TEE. Holdout ref + symmetric key encrypted with TEE enclave public key. |
| Eval coordinator compromise — malicious score vector submitted | Eval result MUST carry valid TEE attestation; `Forge.submitEvalResult` reverts on invalid signature/measurement. |
| Re-entrancy on RevenueSplitter | OZ ReentrancyGuard + checks-effects-interactions ordering. |
| Gas-bomb DoS on revenue distribution | Pull-payments. No N-holder loops. |
| Front-running of `mintOwnership` | Mint is single-shot per Forge; no MEV-exploitable parameters. |
| Compromised SDK npm publish | npm 2FA + GitHub Actions provenance attestation on every publish. |
| Phishing of judge wallets | Pre-funded wallets are PR'd into the README as test addresses; judges generate their own keys; we hand them an explicit "do not share" warning. |
| Domain hijack | Cloudflare DNS with 2FA on the registrar; TLS everywhere; HSTS preload. |
| Supply chain — malicious dep | Renovate + `pnpm audit` + lockfile review; minimize deps. |

---

## 11. Observability

- **Web**: Sentry (browser + RSC), Vercel Analytics (Web Vitals), Speed Insights.
- **Eval**: Sentry Python SDK, structured logs to Fly's log shipper, weekly digest to a Discord channel.
- **Indexer**: Sentry, simple `/health` endpoint, on-chain-vs-indexed lag gauge.
- **Contracts**: Tenderly alerts on every `submitEvalResult`, `mintOwnership`, large revenue claim — pages the on-call (Raj) if any reverts hit mainnet.
- **The Forge in Public dashboard is also our observability dashboard** — if it stops updating, we know within 60s.

---

## 12. Performance budgets

| Surface | Budget |
|---|---|
| Landing — LCP | ≤ 1.6s (mobile) |
| Landing — CLS | ≤ 0.02 |
| Landing — INP | ≤ 200ms |
| App route transitions | ≤ 320ms perceived |
| Dashboard counter latency | ≤ 4s from on-chain event |
| OG card generation | ≤ 800ms p95 (Vercel Edge) |
| SDK `runInference()` overhead (excluding model latency) | ≤ 120ms |
| Bundle (landing, gzipped) | ≤ 110 KB |
| Bundle (app shell, gzipped) | ≤ 240 KB |

Enforced in CI via `next build` size analysis + Lighthouse CI on every PR.

---

## 13. Quality gates

A PR cannot merge unless:

- [ ] CI green: lint, typecheck, unit tests, contract tests, build
- [ ] Coverage: contracts 100%, SDK ≥85%, indexer ≥70%
- [ ] No new color hex outside `packages/design-tokens`
- [ ] No new motion import outside `components/motion/`
- [ ] Lighthouse mobile perf ≥ 90 (landing, app)
- [ ] No new mainnet deploy without `forge inspect` review + slither pass
- [ ] Threat-model entry added if security-sensitive surface changed

---

## 14. Environments

- **Mainnet** (0G Aristotle): the only production environment. The living system runs here.
- **Local devnet**: anvil with chainId fork of Aristotle for SDK/eval integration tests.
- **Preview**: every PR deploys a Vercel preview with WALLET_CONNECT_PROJECT_ID and the production contract addresses (read-only mode unless `?signer=` enabled).
- **No testnet**: per build-spec, mainnet from Week 1. Testnet is only a labeled fallback if mainnet has a multi-hour outage.

---

## 15. Risk register (engineering only)

Full risk register in build-spec §12. Engineering-specific:

| Risk | Owner | Mitigation |
|---|---|---|
| TEE integration delay | eval team | Start Week 1. Non-TEE labeled fallback ready by end of Week 2. |
| Indexer falls behind chain | infra | Restart-from-block, idempotent decode. On-call alert if lag > 60s. |
| SDK breaking changes mid-week | sdk owner | Changesets; pre-1.0; documented in release notes; integrators pinned to exact version. |
| Aristotle mainnet downtime | infra | Cache last-known-good dashboard state; degrade gracefully ("Network unreachable, last update 4m ago"). |
| Vercel build failure on deploy day | infra | Frozen `next` version; `pnpm-lock.yaml` committed; build-cache primed nightly. |

---

## 16. The "this exists or we cannot ship" list

Single-page summary for the daily standup:

1. 0G Chain RPC working from Vercel + Fly
2. 0G Storage upload + retrieve working from SDK
3. 0G Compute training dispatch working from eval
4. 0G Compute TEE attestation parseable + verifiable on-chain
5. Agent ID registration accepting an Ingot
6. `mintOwnership` reverts on tampered attestation
7. RevenueSplitter `claimRevenue` works for at least 3 holders
8. SDK `runInference()` end-to-end against a real Ingot in three lines
9. Landing page passes Lighthouse mobile ≥ 95
10. Dashboard ticks live within 4s of an on-chain event

If any of these is red on a given day, that day's standup discusses nothing else.
