# Foundry: Product Vision

> Foundry is not a hackathon project. It is the protocol that makes "a share of an AI model" a real, on-chain asset class — and the supply-side primitive that 0G has been missing.

---

## What we built for the hackathon

A working end-to-end protocol on 0G Aristotle mainnet:

- **Six audited-style contracts** (FORGEToken, ForgeFactory, Forge, Ingot, ContributionRegistry, RevenueSplitter, IngotRegistry) with 100% line coverage targets, pull-payment revenue routing, and TEE-attestation-gated minting.
- **A Python eval coordinator** that watches Forge events, dispatches training and Leave-One-Out attribution runs to 0G Compute, and submits scores back to chain with a hardware-signed attestation envelope.
- **A published npm SDK** (`@foundryprotocol/sdk` v1.0) with three-line inference, full Forge lifecycle, and adapters for the Vercel AI SDK, LangChain, and an OpenAI-compatible HTTP proxy.
- **A Next.js 16 web surface** — landing, Forge explorer, Ingot pages with cap tables, lineage graph, Smith profiles, the Forge-in-Public dashboard, docs, and a wallet-less judge demo path.
- **Load-bearing use of every 0G surface**: Chain (Aristotle), Storage (Log + KV), Compute, Compute TEE, and Agent ID. Not one of them is decorative — pull any one and the protocol breaks.

---

## The problem this product solves

Today, three groups of contributors build AI models and capture none of the upside:

1. **Domain experts with niche datasets** (medical, legal, low-resource languages, proprietary corpora) — their data is the rate-limit on model quality, but they have no instrument that turns that data into an ongoing revenue stream.
2. **Capital allocators** — there is no on-chain way to fund the creation of a model and earn from its inference.
3. **Compute providers** — they sell at spot price and capture none of the long-tail value of the models they helped train.

Every existing AI×crypto project orbits one of these axes (data, compute, or model access). **None of them lets the three groups co-own the result.**

Foundry is the missing primitive. A Forge is an LP for an AI model. An Ingot is a share in its revenue.

---

## What this becomes

### Month 1 — Audit + first paying integrators

- **Third-party security audit** of all six contracts (Trail of Bits or Cantina) — funded by hackathon prize + 0G ecosystem grant.
- **5 production Forges** on mainnet, each with a working Ingot serving real inference traffic.
- **3 integrating teams** consuming a Foundry Ingot from inside their dApp via the SDK. We have soft commits from agent framework teams at the hackathon.
- **First $FORGE-denominated revenue distribution** to external (non-team) contributors.
- **Real-time TEE attestation viewer** live on every Ingot page — visible cryptographic proof of every score that ever minted a share.

### Month 3 — Shapley + community Forges

- **Shapley-value attribution** ships as v2 alongside the current LOO method. Contributors can choose attribution method per Forge.
- **Reputation-weighted contribution caps** replace flat per-wallet limits, neutralizing Sybil.
- **First low-resource-language Forge crosses 1,000 inference calls/day** — Konkani↔English Ingot becomes the proof case. Native-speaker contributors earn ongoing revenue from a model their data made possible.
- **`@foundryprotocol/sdk` v2** with streaming inference and on-chain receipts attached to every response.
- **Reforging** — Ingots can be parents of new Forges, with lineage and revenue routing automatically inherited.

### Month 6 — Marketplace + governance

- **Secondary market for Ingot shares** — pull-payment fungibility on share transfers. Liquid market in "shares of an AI model" becomes a real thing.
- **Forge governance** — $FORGE holders vote on protocol parameters (fee splits, eval-coordinator allowlist, attribution methods).
- **10,000 contributions logged** across 50 production Forges. Total distributed revenue > $50k in OG.
- **Cross-ecosystem expansion** — Foundry SDK adopted by at least one large 0G dApp (we are already in conversation with two).

### Year 1 — A new asset class

- "A share of a model" trades on at least one major DEX.
- Foundry has been forked at the protocol layer at least once.
- The translation Forge has handled at least one government or NGO procurement.
- Contributors who joined as anonymous wallet addresses have collectively earned six figures from their data.

---

## How each 0G integration deepens

Every component of 0G that Foundry uses today gets *more* usage as the protocol grows. This is the value flywheel sponsor judges look for.

### 0G Chain (Aristotle mainnet)

- **Hackathon**: 6 contracts, every state transition emits an indexed event. Every Forge lifecycle mints transactions on Aristotle.
- **Month 3**: 50 Forges × ~40 transactions per lifecycle = 2,000 lifecycle transactions. Plus 100+ revenue claims per week. Every inference call to an Ingot reserves a fee on-chain via the 0G Compute serving broker.
- **Month 6**: 500+ Forges, 10,000+ inference fee reservations per month, secondary market trade volume. **Aristotle's tx/day grows directly with Foundry's success.**

### 0G Storage (Log + KV)

- **Hackathon**: Datasets, encrypted holdouts, weights, lineage records all live on 0G Storage. Every contribution is a Storage upload.
- **Month 3**: Multi-TB of model weights and dataset archives. KV holds Ingot metadata and Forge state for fast frontend reads.
- **Month 6**: Foundry becomes one of the largest content publishers on 0G Storage. Reforging means historical weights are kept addressable forever.

### 0G Compute (training + inference)

- **Hackathon**: Baseline training + N Leave-One-Out runs per Forge + all consumer inference. Each Forge with N contributors is N+1 training jobs.
- **Month 3**: Demand grows linearly with Forges. Shapley attribution increases compute per Forge by ~3×.
- **Month 6**: Foundry is a top-3 consumer of 0G Compute by total hours. Predictable, schedulable training demand stabilizes Compute provider revenue.

### 0G Compute TEE / Privacy

- **Hackathon**: The attribution eval runs inside the enclave. Holdout is decrypted only inside TEE. Hardware-signed attestation is verified on-chain in `Forge.submitEvalResult`.
- **Month 3**: TEE-based eval becomes the default. Every Ingot has a parseable attestation viewable on its page. We open-source the attestation parser for other 0G dApps.
- **Month 6**: TEE-attested inference (not just attribution) for sensitive Ingots — medical, legal. This makes 0G Compute TEE the canonical surface for trust-sensitive AI on chain.

### 0G Agent ID

- **Hackathon**: Every Ingot is registered with an Agent ID. Ownership of the Agent ID reflects the Ingot share ledger.
- **Month 3**: Foundry Ingots become a meaningful share of all Agent IDs registered on 0G.
- **Month 6**: Agent ID becomes the canonical handle for any model that other agent frameworks consume. Foundry's adapters (Vercel AI, LangChain, OpenAI-compat) make "Agent ID → working model in your code" a one-line operation.

**The flywheel:** Every Forge mints chain txs, uploads storage, books compute hours, runs a TEE job, and registers an Agent ID. **Foundry growing is 0G growing.** A single Forge generates more 0G activity than most consumer dApps do in a month.

---

## Revenue model

Foundry charges a **protocol fee on inference revenue** routed through Ingots.

- **Inference call** → consumer pays $X to the serving broker.
- **$X is split** by `RevenueSplitter`:
  - **2% protocol fee** → Foundry treasury (funds audits, eval-coordinator infra, ongoing dev).
  - **98% to Ingot co-owners** pro-rata to their share ledger, pull-claimable.
- **No mint fees, no contribution fees.** Foundry only earns when an Ingot earns. Aligned incentives.

Rough unit economics (Month 6 target):
- 50 Forges × avg 200 inference calls/day × $0.005 per call = **$50/day per Forge** = **$2,500/day protocol-wide.**
- 2% protocol fee = **$50/day** to Foundry treasury = **~$18k/year run rate** at Month 6 scale.
- This is intentionally low; the moat is the network, not the rake. Year 1 targets are revenue routed through (the GMV-equivalent), not protocol take.

The protocol token $FORGE is **not** sold. It is minted to contributors as their share-ledger position in their first Ingot, and as governance weight as Foundry matures. There will be no presale, IDO, or treasury sale.

---

## What the hackathon validated

- **The user need is real.** Conversations with low-resource-language communities (Konkani, Tulu) during the hackathon confirmed that native-speaker contributors will participate when there is an ownership instrument. Without one, they don't.
- **The technical claim works.** TEE attestation can be verified on-chain. LOO attribution scores can be reproduced from on-chain dataset hashes. The eval is deterministic given inputs.
- **The integration story scales.** Three SDK adapters (Vercel AI, LangChain, OpenAI-compat) hide all on-chain complexity behind one line. Any AI app can consume a Foundry Ingot without knowing it's on 0G.
- **The supply-side narrative resonates.** "Other 0G submissions consume 0G — Foundry supplies it" is a thesis we can defend in front of 0G core team, VCs, and other hackathon teams.

---

## What is still hypothesized

- **At what scale does LOO become uneconomical?** N+1 training runs per Forge gets expensive past ~50 contributors. Shapley + influence-function approximations are documented as the v2 path.
- **Will native-speaker contributors trust a wallet?** UX work in Month 1 will use Foundry-issued custodial wallets to lower the on-ramp; non-custodial export later.
- **Pricing.** $0.005/inference call is a guess based on competitor pricing. Real demand curve emerges in Month 1-3.

---

## The ask

To accelerate this from a hackathon submission to a production protocol:

- **0G ecosystem grant** — $50k–$100k to fund the third-party audit (Trail of Bits / Cantina, ~$60k for 6 contracts) and 6 months of eval-coordinator compute.
- **A formal slot in 0G's go-to-market**: feature Foundry in 0G's launch announcements as the canonical supply-side primitive on the network.
- **Introductions to two integrating teams** at the hackathon for early SDK adoption.
- **Compute credits** on 0G Compute (training + TEE eval) sufficient to run 50 Forges through their first lifecycle without consumer-paid revenue.

In exchange, 0G gets:
- The first AI-model-ownership primitive on its chain. A defensible position vs. Bittensor, Ocean, and every other AI×crypto network.
- A consumer-recognizable proof case (a community-owned translation model for a real low-resource language).
- A growing % of all Aristotle transactions, Storage uploads, Compute hours, TEE jobs, and Agent IDs.

---

_The hackathon ends. Foundry doesn't. Every contract is immutable, every adapter is published, every contributor's share is on-chain. The protocol exists whether or not the prize comes._
