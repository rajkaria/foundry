<div align="center">

  <!-- Foundry mark goes here once shipped -->
  <h1>FOUNDRY</h1>

  **The supply-side protocol for 0G.**

  Pool data, compute, and capital. Co-train an AI model. Own a verifiable, revenue-generating share — minted on mainnet, attributed inside a TEE.

  [Website](https://foundryprotocol.xyz) · [Docs](https://foundryprotocol.xyz/docs) · [Build on Foundry](https://foundryprotocol.xyz/build-on-foundry) · [Dashboard](https://foundryprotocol.xyz/dashboard) · [X](https://x.com/foundryprotocol)

  *0G APAC Hackathon 2026 · Grand Prize Build*

</div>

---

## What is Foundry?

Foundry is a protocol where anyone can pool data, compute, and capital to co-train AI models on 0G — and own a verifiable, revenue-generating share of the result.

Strangers form a **Forge**, a collective that pools datasets, compute credits, and capital. A verifiable attribution eval, executed inside a TEE on 0G Compute, measures **how much each contribution actually improved the model**. Ownership of the resulting **Ingot** — the trained model, registered with an Agent ID and stored on 0G — mints as $FORGE-denominated shares proportional to measured contribution. Every inference call against the Ingot routes revenue back to the co-owners automatically.

Other 0G submissions consume 0G. Foundry supplies it.

## Why this exists

- Individuals with valuable niche datasets have **no way to turn that data into an ongoing asset**.
- People with capital can't **co-invest in a model's creation** — there is no ownership instrument for "a share of a model."
- Compute providers sell at spot price and capture **none of the upside** of what they help create.

Foundry makes "a share of a model" a real, on-chain asset.

## The protocol in one diagram

```
        SMITHS                       THE FORGE                      CONSUMERS
       data → compute → capital      OPEN → EVAL (TEE) → MINTING       0G dApps
                                     → TRAINING → LIVE                 agents
                                                                       SDK users
                                              │
                                              ▼
                                          INGOT                  inference $ →
                                       (Agent ID +              RevenueSplitter
                                        weights on               → claim on-chain
                                        0G Storage)
```

Detailed architecture: [`docs/03-tech-architecture.md`](./docs/03-tech-architecture.md).

## What's in this repo

| Path | What |
|---|---|
| [`docs/`](./docs) | The build spec, the brand, the design system, the architecture, the sprint plan, the enhancements menu, the real-vs-roadmap honesty table |
| [`apps/web/`](./apps/web) | Next.js 16 — landing, app, dashboard, lineage graph, docs |
| [`packages/sdk/`](./packages/sdk) | `@foundryprotocol/sdk` — install via `pnpm add @foundryprotocol/sdk` |
| [`packages/indexer/`](./packages/indexer) | TypeScript indexer feeding the dashboard |
| [`packages/design-tokens/`](./packages/design-tokens) | Color, type, motion, spacing tokens |
| [`contracts/`](./contracts) | Solidity (Foundry toolkit). 6 contracts. 100% line coverage. |
| [`eval/`](./eval) | Python attribution coordinator. TEE-aware. |

## Documentation

The full docs are rendered at [foundryprotocol.xyz/docs](https://foundryprotocol.xyz/docs), but every doc is a real Markdown file in this repo — read them here:

- **[Build Spec v2](./docs/00-build-spec.md)** — the canonical spec.
- **[Brand](./docs/01-brand.md)** — positioning, voice, taglines.
- **[Design System](./docs/02-design-system.md)** — color, type, motion, components.
- **[Technical Architecture](./docs/03-tech-architecture.md)** — stack, package boundaries, contract architecture, threat model.
- **[Sprint Plan](./docs/04-sprint-plan.md)** — 5 sprints, 6 workstreams, dated milestones.
- **[Enhancements](./docs/05-enhancements.md)** — beyond-spec features prioritized for the grand prize.
- **[Real vs Roadmap](./docs/16-real-vs-roadmap.mdx)** — what's live on mainnet vs what's coming.
- **[Competitive Landscape](./docs/00-competitive-landscape.md)** — master submission list and analysis.

## Three-line quickstart

```ts
import { Foundry } from '@foundryprotocol/sdk';

const foundry = new Foundry({ contracts: 'aristotle' });
const result  = await foundry.inference.run('ingot:0x…', { input: 'Hello' });
```

That's it. Your call is routed to the Ingot via 0G Compute. Revenue routes back to the Ingot's co-owners on-chain.

For agent-framework integration, see the [Vercel AI SDK adapter](https://foundryprotocol.xyz/docs/sdk-reference#vercel-ai), the [LangChain adapter](https://foundryprotocol.xyz/docs/sdk-reference#langchain), or our [OpenAI-compatible proxy](https://foundryprotocol.xyz/docs/sdk-reference#openai-compat).

## Live mainnet status

| | |
|---|---|
| Network | 0G Aristotle mainnet |
| Deployed contracts | _populated on first deploy_ |
| Forges live | _live-updated_ |
| Ingots minted | _live-updated_ |
| Total contributions | _live-updated_ |
| Revenue distributed | _live-updated_ |

The [dashboard](https://foundryprotocol.xyz/dashboard) shows real-time figures.

## License

[MIT](./LICENSE) — except `contracts/` (also MIT, but a separate copy for clarity if a future audit firm prefers Apache-2.0).

## Contributing

Foundry is an open protocol. If you're building on 0G and need a model — [build on Foundry](https://foundryprotocol.xyz/build-on-foundry). If you have a dataset or compute and want a share of what gets made — [join a Forge](https://foundryprotocol.xyz/forges). If you want to improve the protocol — open a PR.

---

*Built for the 0G APAC Hackathon 2026 — and beyond.*
