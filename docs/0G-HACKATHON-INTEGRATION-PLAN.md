# Foundry × 0G Hackathon — Integration Plan

> Goal: make Foundry Protocol **the most integrated project in the 0G hackathon**.
> Every project on the master list (95+) already does AI inference, memory, or data.
> Foundry turns each of them into a **revenue-earning co-owner of on-chain models** —
> with **zero bridges**, same 0G Storage + 0G Compute TEEs + 0G Chain (Aristotle).
>
> Every code snippet, package name, contract address, and Ingot ID below is
> verbatim from the shipped repo. Nothing here is aspirational API.

---

## 0. The broadcast post (copy-paste ready)

**Hey 0G Hackathon builders 👋**

Almost every submission is building **AI agents, memory layers, verifiable finance,
marketplaces, infra, or consumer tools** that depend on model inference and data.

**Foundry Protocol** is live on **0G Aristotle mainnet** (chain `16661`). It lets anyone
pool **data + compute + capital** into a **Forge** to co-train a real AI model.
Contributors get **proportional on-chain ownership** of the resulting model — an **Ingot**
(ERC-721 cap table) — and **every inference automatically routes revenue back to
co-owners** through the on-chain `RevenueSplitter`. No middleman, no off-chain trust.

**Why this benefits almost every project here — three concrete upsides:**

1. **Inference with on-chain receipts.** Drop-in OpenAI-compatible endpoint. Every call
   returns `inferenceTxHash` + `revenueTxHash` — verifiable, TEE-attested, auditable.
2. **Your data becomes equity.** Push your memory vaults / signed traces / synthetic
   datasets into a Forge → get minted ownership inside the TEE. Your data literally
   becomes a position in the model.
3. **Passive revenue forever.** Once your agents run on an Ingot you co-own, every
   inference — yours or anyone's — pays your team automatically.

**Integration is genuinely 3 lines** (SDK, HTTP, or MCP — pick one):

```ts
import { Foundry } from '@foundryprotocol/sdk';
const foundry = new Foundry({ contracts: 'aristotle' });
const { output, receipt } = await foundry.inference.run(
  'ingot:0x8e2af4a000000000000000000000000000000001',
  { input: userQuery }
);
```

Ships with **Vercel AI SDK + LangChain adapters** and an **MCP server**
(`npx @foundryprotocol/mcp`) so it works instantly in Claude, Cursor, Cline, or
your agent runtime.

We'll help any team ship this in **< 30 minutes** — reference repo, live Ingot IDs,
co-branded demo. Reply or DM.

cc @0G_labs @dragon0195 — let's turn every hackathon project into a revenue-earning
participant in the 0G model economy. 🚀

---

## 1. What's actually live (so we never overclaim)

| Asset | Reality |
|---|---|
| Network | 0G **Aristotle mainnet**, chain ID **16661** |
| SDK | `@foundryprotocol/sdk` v1.0.0 — `Foundry` class, viem-based |
| MCP | `@foundryprotocol/mcp` — `npx @foundryprotocol/mcp` |
| HTTP API | OpenAI-compatible: `POST https://api.foundryprotocol.xyz/v1/chat/completions` |
| Adapters | `@foundryprotocol/sdk/adapters/vercel-ai`, `/adapters/langchain` |
| Live Ingots | Domain models (translation + clause classifier) — see §6 |
| Receipts | `requestId`, `inferenceTxHash`, `revenueTxHash`, `latencyMs` |

**Deployed contracts (Aristotle, chain 16661):**

| Contract | Address |
|---|---|
| FORGEToken | `0xE716B0260f462b2A1789cB6cfCBd825736b920Ca` |
| ContributionRegistry | `0x05235Ba0F2a77bcaB87371E4d797D6830ddC2d86` |
| Ingot | `0x39B736f424754d05a0da186d89015b74d1DDe1d3` |
| RevenueSplitter | `0xC58E0F32BD43e43153D3CA8ee8F25C8198789289` |
| ForgeFactory | `0x636109264EBF6cFD18CC38bD43eDf9cCad7ae23D` |
| IngotRegistry | `0xF8f3fAE648A8d7ee4Df0A7b10a0F759938aab7e1` |

> Honest framing for outreach: the **inference endpoint is general drop-in**, but the
> **live Ingots are domain models today**. The killer pitch for general agents is
> *"spin up a Forge for your vertical and co-own the model"* — not *"replace GPT-4."*
> Lead with **ownership + revenue + verifiable receipts**, not raw model quality.

---

## 2. Why it benefits every archetype (segment the 95)

Bucket the master list into 5 archetypes. Each gets a different lead value-prop.

### A. Agent infra / memory / identity
*(SealedMind, MindVault, Lattice, Mnemos, Synapse, …)*
- **Lead with:** "Your memory becomes equity." Contribute memory logs / synthetic
  datasets to a Forge → own part of the model your agents help improve.
- **Integration:** swap inference backend to a co-owned Ingot; keep sovereign memory.
- **Hook:** sovereign memory + community-trained model + revenue, no architecture change.

### B. Verifiable finance / trading / DeFi agents
*(Provus, Aegis Vault, VeraSignal, ClawMind, …)*
- **Lead with:** TEE-attested inference + **on-chain receipts** (`inferenceTxHash`)
  for every decision — verifiable audit trail judges love.
- **Integration:** route reasoning calls through Foundry; store `receipt` alongside
  trades. Feed signed reasoning traces into a Forge for ownership.

### C. Marketplaces / skill / gig / payment protocols
*(AgentHub, SkillMint, AgentMart, zer0Gig, AgentPay, …)*
- **Lead with:** every inference an agent runs on an Ingot you co-own **pays you
  passively** — a built-in revenue rail for your marketplace.
- **Integration:** make Foundry Ingots a first-class "model SKU" in your catalog;
  `RevenueSplitter` handles payout accounting for free.

### D. Consumer / RWA / tools
*(ZeroViza, Compass, LocalHero, …)*
- **Lead with:** drop in a co-owned model instantly; contribute domain data
  (legal docs, real-world quests, health data) and earn from the intelligence layer.
- **Integration:** HTTP endpoint or Vercel AI adapter — no web3 code needed to start.

### E. Pure infra / data / compute
- **Lead with:** you're already producing the inputs Forges need (storage, DA,
  compute). Become a contributor → earn Ingot shares for infra you already run.

> Action: take your master list, tag each project A–E in a spreadsheet, then send the
> matching template from §4. One pass → 95 tailored asks.

---

## 3. The three integration paths (all accurate, all live)

### Path 1 — SDK (TypeScript, full ownership + inference)

```bash
npm install @foundryprotocol/sdk viem
```

```ts
import { Foundry } from '@foundryprotocol/sdk';

// network names: 'aristotle' | 'galileo' | 'local'  (only aristotle is live)
const foundry = new Foundry({ contracts: 'aristotle' });

const { output, ingotId, receipt } = await foundry.inference.run(
  'ingot:0x8e2af4a000000000000000000000000000000001',
  { input: `${yourMemoryOrContext}\n\n${userQuery}`, temperature: 0.7 }
);

// receipt = { requestId, inferenceTxHash?, revenueTxHash?, latencyMs }
await yourMind.remember(output);            // your existing flow
await store(receipt.inferenceTxHash);       // on-chain proof
```

### Path 2 — HTTP (any language, drop-in OpenAI client)

```bash
curl https://api.foundryprotocol.xyz/v1/chat/completions \
  -H "content-type: application/json" \
  -H "x-foundry-ingot-id: 0x8e2af4a000000000000000000000000000000001" \
  -d '{"messages":[{"role":"user","content":"Translate to Konkani: hello"}],"temperature":0.7}'
```

Response is OpenAI-shaped with an extra `foundry` block carrying
`inferenceTxHash` / `revenueTxHash` / `attestation`.

### Path 3 — MCP (Claude Desktop / Cursor / Cline / agent runtimes)

```bash
npx @foundryprotocol/mcp
```

```json
{
  "mcpServers": {
    "foundry": {
      "command": "npx",
      "args": ["-y", "@foundryprotocol/mcp"],
      "env": {
        "FOUNDRY_BASE_URL": "https://foundryprotocol.xyz",
        "FOUNDRY_DEFAULT_INGOT_ID": "0x8e2af4a000000000000000000000000000000001"
      }
    }
  }
}
```

Tools exposed: `list_ingots`, `run_inference`, `get_ingot`, `get_lineage`,
`get_attestation`.

### Adapters (zero rewrite for existing AI apps)

```ts
// Vercel AI SDK
import { foundry } from '@foundryprotocol/sdk/adapters/vercel-ai';
import { generateText } from 'ai';
const model = foundry('ingot:0x8e2af4a000000000000000000000000000000001');
const { text } = await generateText({ model, prompt: '…' });

// LangChain
import { FoundryChat } from '@foundryprotocol/sdk/adapters/langchain';
import { HumanMessage } from '@langchain/core/messages';
const llm = new FoundryChat({ ingotId: 'ingot:0x8e2af4a000000000000000000000000000000001' });
const res = await llm.invoke([new HumanMessage('…')]);
```

---

## 4. Per-archetype outreach templates (fill name, send)

**A — Memory/identity:**
> Hey {{project}} — {{one-line on what they built}}. You're already managing sovereign
> memory; Foundry lets that memory become *equity*. Push your logs into a Forge, own
> part of the model, and swap your inference to a co-owned Ingot in 3 lines (SDK/HTTP/MCP).
> 30-min co-branded demo on us — interested?

**B — Verifiable finance:**
> {{project}} — your edge is verifiability. Foundry gives every inference a TEE
> attestation + `inferenceTxHash` on Aristotle. Route reasoning through us, store the
> receipt next to each trade — instant on-chain audit trail. Want the reference repo?

**C — Marketplace/payments:**
> {{project}} — add Foundry Ingots as a model SKU. `RevenueSplitter` handles
> per-inference payout accounting on-chain for free, and every call pays co-owners.
> Built-in revenue rail for your marketplace. 30 min to wire it up.

**D — Consumer/RWA:**
> {{project}} — no web3 code needed to start: drop-in OpenAI endpoint. Contribute your
> domain data to a Forge later and earn from the model. Want a live Ingot ID + demo?

**E — Infra/data:**
> {{project}} — you already produce the storage/DA/compute Forges consume. Become a
> contributor and earn Ingot shares for infra you already run. Quick call?

---

## 5. "Your data becomes equity" — the Forge flow (the real moat)

This is the differentiator no other hackathon project has. Real SDK calls:

```ts
const { forgeId } = await foundry.forge.create({ modelSpec, evalSpec, evalCoordinator, contributionWindowEnds });
await foundry.forge.contributeData(forgeId, storageRootHash);   // 0G Storage root
await foundry.forge.contributeCompute(forgeId, '0.5');          // stake OG
await foundry.forge.fundForge(forgeId, '1.0');                  // capital
await foundry.forge.startEvaluating(forgeId);
await foundry.forge.submitEvalResult(forgeId, attestationHex, scores); // TEE-attested
await foundry.forge.mintOwnership(forgeId);                     // ERC-721 cap table
await foundry.forge.setWeightsAndGoLive(forgeId, weightsRoot);  // Ingot callable
// later, any co-owner:
await foundry.revenue.claim(tokenId);                           // pull from RevenueSplitter
```

Pitch line: *"Other projects let you use a model. Foundry lets you **own** the model
you helped train — and get paid every time anyone uses it."*

---

## 6. Live Ingot catalog (for demos)

| Ingot ID | Model | Contributors | License |
|---|---|---|---|
| `ingot:0x8e2af4a000000000000000000000000000000001` | Konkani ↔ English v1 | 9 | open-noncommercial |
| `ingot:0x8e2af4a000000000000000000000000000000002` | Konkani · news domain | 6 | open-noncommercial |
| `ingot:0x8e2af4a000000000000000000000000000000003` | Tulu ↔ English v1 | 4 | open-noncommercial |
| `ingot:0x8e2af4a000000000000000000000000000000004` | Clause Classifier — contract intent | 7 | open-permissive |
| `ingot:0x8e2af4a000000000000000000000000000000005` | Clause · MSA specialization | 5 | open-permissive |

---

## 7. Campaign plan — how we actually win "most integrated"

**Week 1 — Reach:**
- Post §0 in the hackathon Discord/Telegram + 0G channels; tag @0G_labs @dragon0195.
- Tag the master list A–E (§2); send §4 templates in batches of ~20/day.

**Week 2 — Convert:**
- Ship a public **`foundry-0g-starter`** reference repo: SDK + HTTP + MCP examples,
  one-command demo against a live Ingot.
- Offer **15 co-branded 30-min pairing slots**; each yields a tweet + a screenshot of
  a real `inferenceTxHash` on Aristotle explorer.

**Week 3 — Amplify:**
- Publish "N projects integrated Foundry in 72h" thread with explorer links.
- Each integrated team gets a Forge invite → flips them from *users* to *co-owners*
  (the sticky outcome).

**Definition of "most integrated":** count of distinct hackathon projects with a
real `inferenceTxHash` on Aristotle from their codebase. Track it publicly on a
leaderboard — social proof compounds.

---

## 8. The < 30-min onboarding kit (what we hand each team)

1. Their archetype tag + the matching §3 path (most pick HTTP or Vercel adapter).
2. A live Ingot ID from §6.
3. `foundry-0g-starter` repo link.
4. One pairing call → goal: a green `inferenceTxHash` in their repo before we hang up.
5. Forge invite for the ownership upsell.

**One ask per team. One Ingot ID. One receipt. Then they're in the economy.**
