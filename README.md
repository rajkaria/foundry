<div align="center">

  <!-- Foundry mark goes here once shipped -->
  <h1>FOUNDRY</h1>

**The supply-side protocol for 0G.**

Pool data, compute, and capital. Co-train an AI model. Own a verifiable, revenue-generating share — minted on mainnet, attributed inside a TEE.

[Website](https://foundryprotocol.xyz) · [Docs](https://foundryprotocol.xyz/docs) · [Build on Foundry](https://foundryprotocol.xyz/build-on-foundry) · [Dashboard](https://foundryprotocol.xyz/dashboard) · [X](https://x.com/foundryprotocol)

_0G APAC Hackathon 2026 · Grand Prize Build_

</div>

---

## For Judges (reviewer quickstart)

Everything below is **live on 0G Aristotle mainnet** — no testnet, no mocks.

| Resource                | Where                                                                                                       |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| Live system             | https://foundryprotocol.xyz                                                                                 |
| Live dashboard          | https://foundryprotocol.xyz/dashboard (real mainnet counters)                                               |
| Real vs Roadmap         | [`docs/16-real-vs-roadmap.mdx`](./docs/16-real-vs-roadmap.mdx) — every feature is ✅ Real or 🔜 Roadmap     |
| 0G integration matrix   | [`docs/03-tech-architecture.md` §4](./docs/03-tech-architecture.md) — every 0G module and where it's used   |
| Contract addresses      | [Live mainnet status](#live-mainnet-status) below + [`deployments/aristotle.json`](./contracts/deployments) |
| 0G Explorer (Aristotle) | `https://chainscan-galileo.0g.ai/address/<ForgeFactory>` — traces forge creation → mint → revenue flow      |
| Demo Forge              | https://foundryprotocol.xyz/forges (pick any LIVE Forge — they're all real mainnet state)                   |
| Demo Ingot              | https://foundryprotocol.xyz/ingots — call any via the SDK or the OpenAI-compatible curl below               |

### 0G modules integrated (proof for hackathon requirement)

| 0G module                | How Foundry uses it                                                                                              | Where in the code                                    |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **0G Chain (Aristotle)** | 6 Solidity contracts — `FORGEToken`, `ForgeFactory`, `Forge`, `Ingot`, `ContributionRegistry`, `RevenueSplitter` | [`contracts/`](./contracts) (100% line coverage)     |
| **0G Storage (Log)**     | Datasets, weights, encrypted holdouts, lineage records                                                           | `packages/sdk/src/storage.ts`, `eval/`               |
| **0G Storage (KV)**      | Ingot metadata + Forge state cache for fast reads                                                                | `packages/indexer/`                                  |
| **0G Compute**           | Baseline + leave-one-out training runs, all consumer inference                                                   | `eval/coordinator/`, `apps/web/lib/zg-compute.ts`    |
| **0G Compute TEE**       | TEE-executed attribution eval; hardware-signed attestation verified on-chain by `Forge.submitEvalResult`         | `eval/coordinator/tee.py`, `contracts/src/Forge.sol` |

### Run it locally

```bash
# 1. Install
pnpm install

# 2. Configure (every var is documented inline)
cp .env.example .env
# Fill at minimum: RPC_ARISTOTLE, DEPLOYER_KEY_ARISTOTLE, ZG_STORAGE_KEY

# 3. Web app (landing, app, dashboard, docs)
pnpm dev                          # → http://localhost:3000

# 4. Contracts (Foundry toolkit)
make contracts-test               # full test suite
make contracts-coverage           # 100% line coverage report
make deploy-local                 # to a local anvil node
make deploy-aristotle             # to 0G mainnet (requires funded DEPLOYER_KEY_ARISTOTLE)

# 5. Reproduce a TEE attribution eval
make eval FORGE_ID=<forge-id>     # runs baseline + LOO on 0G Compute, posts attestation on-chain

# 6. Indexer (powers the live dashboard)
make indexer-dev
```

### Reviewer notes

- **Faucet:** OG on 0G Aristotle — see https://docs.0g.ai (mainnet OG is acquired via standard channels). The full deploy uses ~0.02 OG.
- **Test wallet (read-only inspection):** the live dashboard at https://foundryprotocol.xyz/dashboard exposes every Forge, Ingot, contribution, and revenue claim without needing a wallet. Connect a wallet only to contribute or claim.
- **TEE label honesty:** the live system labels every attestation as **real DCAP** or **stub** so reviewers can audit `TEE_ENABLED` end-to-end — see the TEE attestation viewer on any Ingot page.
- **One-shot demo:** click any Forge → its Ingot → "Lineage" → "Attestation" — that's the full loop in three clicks.

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

![Foundry Protocol architecture: five engineered surfaces wired to six 0G runtime services](./apps/web/public/architecture.svg)

```
        SMITHS                       THE FORGE                      CONSUMERS
       data → compute → capital      OPEN → EVAL (TEE) → MINTING       0G dApps
                                     → TRAINING → LIVE                 agents · MCP
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

| Path                                                  | What                                                                                                                                      |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| [`docs/`](./docs)                                     | The build spec, the brand, the design system, the architecture, the sprint plan, the enhancements menu, the real-vs-roadmap honesty table |
| [`apps/web/`](./apps/web)                             | Next.js 16 — landing, app, dashboard, lineage graph, docs                                                                                 |
| [`packages/sdk/`](./packages/sdk)                     | `@foundryprotocol/sdk` — install via `pnpm add @foundryprotocol/sdk`                                                                      |
| [`packages/mcp-foundry/`](./packages/mcp-foundry)     | `@foundryprotocol/mcp` — MCP server, run via `npx @foundryprotocol/mcp` (Claude Desktop / Cursor / any MCP-capable agent)                 |
| [`packages/0gkit-*/`](./packages)                     | **`@0gkit/*`** — the neutral 0G builder toolkit (core, chain, storage, compute, da, attestation, cli, mcp, react). No Foundry dependency. |
| [`apps/playground/`](./apps/playground)               | `@0gkit/playground` — zero-setup web console; copy working code in CLI / TS / curl / MCP form                                             |
| [`packages/indexer/`](./packages/indexer)             | TypeScript indexer feeding the dashboard                                                                                                  |
| [`packages/design-tokens/`](./packages/design-tokens) | Color, type, motion, spacing tokens                                                                                                       |
| [`contracts/`](./contracts)                           | Solidity (Foundry toolkit). 6 contracts. 100% line coverage.                                                                              |
| [`eval/`](./eval)                                     | Python attribution coordinator. TEE-aware.                                                                                                |

## Documentation

The full docs are rendered at [foundryprotocol.xyz/docs](https://foundryprotocol.xyz/docs), but every doc is a real Markdown file in this repo — read them here:

- **[Build Spec v2](./docs/00-build-spec.md)** — the canonical spec.
- **[Brand](./docs/01-brand.md)** — positioning, voice, taglines.
- **[Design System](./docs/02-design-system.md)** — color, type, motion, components.
- **[Technical Architecture](./docs/03-tech-architecture.md)** — stack, package boundaries, contract architecture, threat model.
- **[Sprint Plan](./docs/04-sprint-plan.md)** — 5 sprints, 6 workstreams, dated milestones.
- **[Enhancements](./docs/05-enhancements.md)** — beyond-spec features prioritized for the grand prize.
- **[Real vs Roadmap](./docs/16-real-vs-roadmap.mdx)** — what's live on mainnet vs what's coming.
- **[Competitive Landscape](./docs/00-competitive-landscape.md)** — Foundry vs Bittensor, Ocean, Gensyn, Ora.
- **[Product Vision](./docs/VISION.md)** — Month 1 / 3 / 6 roadmap, revenue model, how each 0G integration deepens.

## Install & use the SDK

`@foundryprotocol/sdk` is on npm — public, MIT, zero-config to read mainnet, three lines to call an Ingot.

### Install

```bash
# pnpm
pnpm add @foundryprotocol/sdk

# npm
npm install @foundryprotocol/sdk

# yarn
yarn add @foundryprotocol/sdk
```

`viem` is bundled. `ethers`, `@0gfoundation/0g-storage-ts-sdk`, `@langchain/core`, and `ai` are optional peer dependencies — install only what you use.

### 1. Three-line inference (the canonical quickstart)

```ts
import { Foundry } from "@foundryprotocol/sdk";

const foundry = new Foundry({ contracts: "aristotle" });
const result = await foundry.inference.run("ingot:0x…", { input: "Hello" });
```

That's it. Your call is routed to the Ingot via 0G Compute. Revenue routes back to the Ingot's co-owners on-chain.

For agent-framework integration, see the Vercel AI SDK adapter (§5), the LangChain adapter (§6), the Foundry MCP server (§7), or the OpenAI-compatible proxy (§8) below.

### 2. Read mainnet state — Forges, Ingots, lineage

```ts
const forge = await foundry.forge.get("0x…"); // Forge state, contributors, totals
const ingot = await foundry.ingot.get("0x…"); // shares, owners, revenue accrued
const lineage = await foundry.lineage.get("0x…"); // full ancestry graph
const shares = await foundry.ingot.shareOf("0x…", "0xMyAddr");
```

No signer required for reads — everything streams from 0G Chain + 0G Storage KV.

### 3. Contribute to a Forge (data, compute, or capital)

```ts
import { Foundry } from "@foundryprotocol/sdk";
import { privateKeyToAccount } from "viem/accounts";

const foundry = new Foundry({
  contracts: "aristotle",
  account: privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`),
});

// Pin a dataset to 0G Storage and register the contribution on-chain
const { txHash } = await foundry.forge.contributeData("0xForgeAddr", {
  filePath: "./my-dataset.jsonl",
});

// Or contribute compute credits / capital
await foundry.forge.contributeCompute("0xForgeAddr", { creditsWei: 10n ** 17n });
await foundry.forge.fundForge("0xForgeAddr", { amountWei: 10n ** 18n });
```

### 4. Claim revenue (pull-payment)

```ts
const claimable = await foundry.revenue.claimable("0xIngotAddr", "0xMyAddr");
if (claimable > 0n) {
  await foundry.revenue.claim("0xIngotAddr");
}
```

### 5. Use with Vercel AI SDK

```ts
import { generateText } from "ai";
import { foundryIngot } from "@foundryprotocol/sdk/adapters/vercel-ai";

const { text } = await generateText({
  model: foundryIngot("0xIngotAddr"),
  prompt: "Summarise this contract.",
});
```

### 6. Use with LangChain

```ts
import { FoundryIngotChatModel } from "@foundryprotocol/sdk/adapters/langchain";

const model = new FoundryIngotChatModel({ ingotId: "0xIngotAddr" });
const reply = await model.invoke([{ role: "user", content: "hi" }]);
```

### 7. MCP — for AI agents (Claude Desktop, Cursor, Cline, …)

```bash
npx @foundryprotocol/mcp
```

Exposes `list_ingots`, `run_inference`, `get_ingot`, `get_lineage`, and `get_attestation` as MCP tools. Drop into a Claude Desktop or Cursor config and any Ingot on Foundry becomes a first-class tool for your agent — with revenue automatically routing to the Ingot's co-owners on every call. See [`packages/mcp-foundry`](./packages/mcp-foundry).

### 8. OpenAI-compatible — zero-friction integration

Any tool that speaks OpenAI's API — your existing app, an MCP server, an n8n node, a shell script — can call a Foundry Ingot with one URL swap:

```bash
curl https://foundryprotocol.xyz/api/v1/chat/completions \
  -H "content-type: application/json" \
  -H "x-foundry-ingot-id: 0x8e2…f4a" \
  -d '{"messages":[{"role":"user","content":"Translate to Konkani: …"}]}'
```

Full reference: [SDK reference docs](https://foundryprotocol.xyz/docs/sdk-reference).

## Live mainnet status

| Contract               | Address (0G Aristotle, chain id 16661)                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `FORGEToken`           | [`0xE716B0260f462b2A1789cB6cfCBd825736b920Ca`](https://chainscan.0g.ai/address/0xE716B0260f462b2A1789cB6cfCBd825736b920Ca) |
| `ContributionRegistry` | [`0x05235Ba0F2a77bcaB87371E4d797D6830ddC2d86`](https://chainscan.0g.ai/address/0x05235Ba0F2a77bcaB87371E4d797D6830ddC2d86) |
| `Ingot`                | [`0x39B736f424754d05a0da186d89015b74d1DDe1d3`](https://chainscan.0g.ai/address/0x39B736f424754d05a0da186d89015b74d1DDe1d3) |
| `RevenueSplitter`      | [`0xC58E0F32BD43e43153D3CA8ee8F25C8198789289`](https://chainscan.0g.ai/address/0xC58E0F32BD43e43153D3CA8ee8F25C8198789289) |
| `ForgeFactory`         | [`0x636109264EBF6cFD18CC38bD43eDf9cCad7ae23D`](https://chainscan.0g.ai/address/0x636109264EBF6cFD18CC38bD43eDf9cCad7ae23D) |
| `IngotRegistry`        | [`0xF8f3fAE648A8d7ee4Df0A7b10a0F759938aab7e1`](https://chainscan.0g.ai/address/0xF8f3fAE648A8d7ee4Df0A7b10a0F759938aab7e1) |

Live protocol counters (Forges, Ingots, contributions, revenue distributed) are rendered server-side from on-chain events on the [Forge in Public dashboard](https://foundryprotocol.xyz/dashboard).

**Judges**: wallet-less, pre-funded demo at [`/judges`](https://foundryprotocol.xyz/judges) — one-click inference against a live Ingot, no setup.

## License

[MIT](./LICENSE) — except `contracts/` (also MIT, but a separate copy for clarity if a future audit firm prefers Apache-2.0).

## Contributing & community

Foundry is an open protocol and **0gkit** is its neutral, MIT toolkit. If
you're building on 0G and need a model — [build on Foundry](https://foundryprotocol.xyz/build-on-foundry).
If you have a dataset or compute and want a share — [join a Forge](https://foundryprotocol.xyz/forges).
If you want to improve the toolkit — contributions are very welcome:

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — dev setup, the neutrality
  invariant, testing bar, and the changesets release flow.
- **[Good first issues](./docs/GOOD-FIRST-ISSUES.md)** — a curated, scoped
  backlog with pointers into the code.
- **[Discussions](https://github.com/rajkaria/foundry/discussions)** — Q&A
  and the [Recipes](https://github.com/rajkaria/foundry/discussions/categories/recipes)
  category for proposing `examples/` recipes.
- **[CHANGELOG.md](./CHANGELOG.md)** — the public, semver changelog (the
  `@0gkit/*` packages are version-linked).
- **[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)** ·
  **[SECURITY.md](./SECURITY.md)** (report vulnerabilities privately).

---

_Built for the 0G APAC Hackathon 2026 — and beyond._
