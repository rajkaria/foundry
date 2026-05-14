# Foundry — Enhancements

> Beyond-spec features that move Foundry from "best idea" to "default grand-prize choice." Each enhancement is scored on three axes: **judge impact**, **integrator pull**, and **build effort**, then assigned a priority.

The build spec is already over-qualified. This document is the *additional* surface that compounds the win — the things competitors aren't doing that we *could* do without breaking the schedule. Selection rule: an enhancement only enters scope if it (a) survives the priority filter below, and (b) does not displace a build-spec deliverable.

---

## Priority filter

For each enhancement we ask three questions, score 1–5, sum to a single priority score.

| Axis | Question |
|---|---|
| **Judge impact** | Does a judge land on this and instantly upgrade their score? |
| **Integrator pull** | Does this make another team's life easier and create adoption? |
| **Build effort (inverse)** | Can we ship this without breaking the sprint plan? |

Cutoffs:
- **P1 — In scope for hackathon.** Total score ≥ 12, all axes ≥ 3.
- **P2 — Stretch.** Total score 9–11; ship only if a sprint exits early.
- **P3 — Roadmap.** Documented honestly in `/docs/16-real-vs-roadmap.mdx` as 🔜.

---

## P1 — Hackathon-scope enhancements (ship)

### P1.1 — Vercel AI SDK adapter (`@foundryprotocol/sdk/adapters/vercel-ai`)
**Score: 5/5/4 = 14**
A drop-in `LanguageModelV2` that wraps an Ingot. The integrator writes:
```ts
const model = foundry('ingot:0x…');
await generateText({ model, prompt: '…' });
```
This is the **single highest-leverage line of code in the entire project.** It turns Foundry into a default for the Vercel AI SDK ecosystem. Effort: ~6 hours. Judge impact: enormous — judges *use* the AI SDK. Integrator pull: immediate.

Built in Sprint 2 (already in plan).

### P1.2 — OpenAI-compatible HTTP proxy (`api.foundryprotocol.xyz/v1/chat/completions`)
**Score: 5/5/4 = 14**
Any tool that speaks OpenAI's API can now speak to a Foundry Ingot by changing the base URL and passing the Ingot ID as a header. This is the **lowest-friction integration possible** — Cursor, every agent framework, every chatbot SDK.

Implementation: a Next.js edge route at `/api/v1/chat/completions` that translates OpenAI request → SDK `runInference` → OpenAI-shaped response. Effort: ~8 hours. Built Sprint 3.

### P1.3 — LangChain adapter (`@foundryprotocol/sdk/adapters/langchain`)
**Score: 4/5/5 = 14**
Lower judge novelty than the AI SDK adapter (LangChain is less hyped), but LangChain has the **biggest install base** in the agent ecosystem; Addition 3 (integrator team) is more likely from LangChain users than anywhere else. Effort: ~3 hours (LangChain's `BaseChatModel` is well-defined). Sprint 3.

### P1.4 — AI-assisted Forge creation
**Score: 5/3/4 = 12**
Wizard on `/forges/new`: a single prompt — "I want a translator for legal contracts from Japanese to English" — and Foundry suggests a `modelSpec` (base model, fine-tune config), recommends required dataset size, generates an `evalSpec` (holdout method), and pre-fills the contribution window. Confirmation step before deployment.

This is a **wow moment for judges** — they associate Foundry with "AI on top of AI" without it being slop. Effort: ~10 hours (one Claude call with a typed schema; the magic is in the prompt + product polish). Sprint 2.

### P1.5 — Live TEE attestation viewer
**Score: 5/3/3 = 11 → bumped to P1**
The eval is the most novel technical claim Foundry makes. On the Forge's `EVALUATING` state, show a **live, animated view of the TEE** — a real, slowly-revealing diagram of the enclave with: baseline measurement appearing, each contribution being scored one-by-one inside the box, the hardware attestation animating in at the end. This is the **"alchemy moment"** of the demo.

Implementation: indexer pushes eval progress events via WebSocket; the UI animates each step with the Attribution Bloom motion (design-system §6.2). The diagram itself is a custom SVG illustration. Effort: ~12 hours. Sprint 2 (or stretch from Sprint 3).

### P1.6 — Public Goods Forge (the flagship narrative)
**Score: 4/3/5 = 12**
One of the first three Forges is explicitly **public-goods**: an open low-resource-language translation model for a language under-served by Google Translate. The Forge is funded by the protocol treasury for initial compute; revenue from inference is split between contributors and a community wallet that re-funds future public-goods Forges.

This is **narrative gold**: "the first Foundry Ingot is a translator for a language Big Tech ignores, owned by the native speakers who made it." It is the emotionally legible artifact (build-spec Addition 4) and it converts to media coverage during judging week.

Effort: ~0 engineering hours (just configuration of an existing Forge + a community wallet + copy on the Ingot page). Sprint 1.

### P1.7 — Auto-generated lineage SVG NFT
**Score: 4/2/5 = 11 → bumped to P1**
Every Ingot's lineage tree generates a unique, beautiful SVG that is also the Ingot's metadata image. Holders can mint the SVG as a free Agent ID metadata asset. The lineage graph becomes a **collectible artifact**, which means every Ingot page is shareable.

Effort: ~4 hours (the lineage SVG already exists; just expose it as image metadata and add a `mint to wallet` button). Sprint 3.

### P1.8 — Foundry CLI (`npx create-foundry-forge`)
**Score: 4/4/5 = 13**
Scaffold a Foundry-integrating project from one command:
```bash
npx create-foundry-forge my-app
```
Drops a Next.js + Vercel AI SDK starter pre-wired to Foundry, with a demo Ingot ID. The integrator goes from zero to running inference against a Foundry Ingot in **under 60 seconds**.

Effort: ~6 hours (small templates package, similar to `create-next-app`). Sprint 3.

---

## P2 — Stretch (ship if a sprint runs ahead of schedule)

### P2.1 — The Foundry Index Ingot
**Score: 4/2/2 = 8** *(under cutoff but compelling)*
A meta-Ingot that routes inference requests to the best-performing Ingot in its category by an auto-rebalanced score. Token holders of `INDEX` participate in revenue across the whole basket. Demonstrates Foundry's composability and creates a self-referential flywheel.

Honest assessment: the *concept* is great but execution requires either rule-based routing (boring) or a router model (extra training). Defer to roadmap unless a contributor wants to own it.

### P2.2 — Smith reputation v0
**Score: 3/3/3 = 9**
Per-wallet contribution history with a public reputation score (number of contributions, average marginal Δ, total ETH earned). Used eventually for reputation-weighted contributions but **even as a read-only profile**, it dramatically increases trust for new Smiths joining a Forge.

The data already exists in the indexer; this is a UX surface, not new infrastructure. Effort: ~4 hours. Sprint 4 if time permits.

### P2.3 — Insurance pool
**Score: 3/2/2 = 7**
A small slice of the protocol fee (e.g., 0.5%) funds an insurance pool that pays out to Smiths if an eval fails verifiably (e.g., a TEE attestation is rejected). Increases contributor confidence but adds complexity. Roadmap unless we run far ahead of schedule.

### P2.4 — Discord / Telegram bot
**Score: 3/2/4 = 9**
`/forge status <id>` returns a live snapshot of any Forge — contributions, state, time remaining. Built in Sprint 3 or 4 if time permits; useful for community channels.

### P2.5 — Embeddable widget (`<foundry-ingot id="…" />`)
**Score: 3/4/3 = 10**
A web component anyone can embed in their site: "Try this Ingot." Drives end-user inference (and revenue). Useful long-term, optional for hackathon. Stretch.

### P2.6 — Foundry ranking on every Ingot in the lineage graph
**Score: 4/2/3 = 9**
Add a **"Quality" score** to each Ingot node (relative to peer Ingots in the same category) — surfaces which models are *actually good*. Compute simply: aggregate eval scores over time. Sprint 4 stretch.

---

## P3 — Roadmap (declared explicitly in `/docs/16-real-vs-roadmap.mdx`)

These are documented as 🔜 in the Real-vs-Roadmap table and the README. Honesty about them is a trust signal.

- **Shapley / influence-function attribution** — research-grade method beyond LOO.
- **Forge governance** — $FORGE holders vote on training params and direction.
- **Secondary market for Ingot shares** — share trading with price discovery.
- **Multi-round reforging** — Forges run round 2, 3, … attribution re-computed per round.
- **Reputation-weighted contributions** — contribution caps and weights scale with Smith reputation.
- **FHE-light contributions** — encrypted data that only decrypts inside the TEE for training.
- **Foundry Index Ingot** — meta-routing across a basket.
- **Mobile-native experience** — beyond responsive web.
- **Multi-language UI** — internationalization of the app.
- **DAO governance of $FORGE** — protocol-level voting.
- **Cross-chain Ingots** — Ingots callable from non-0G chains via bridges.

---

## P4 — Anti-scope (things we will NOT build)

Explicitly out of scope so we don't waste time considering them.

- **A Foundry-branded chat assistant** — Foundry is not a chat product. Adapters expose Ingots in other chat surfaces.
- **An exchange or DEX for $FORGE** — distract from the protocol; market emerges.
- **Reward farming / yield optimization on $FORGE** — DeFi misadventure; not the brand.
- **Mobile app for hackathon** — responsive web suffices; native is roadmap.
- **A "decentralized GPU marketplace"** — that's Akash / io.net's lane; Foundry consumes 0G Compute.
- **NFT collection unrelated to Ingots** — the lineage SVG is the only NFT we touch.
- **Token sale, presale, launchpad** — $FORGE is fixed-supply, allocated to contributors via the protocol mechanic. No public sale this year.

---

## How enhancements appear in the submission

Each P1 enhancement gets:
1. A line on the dashboard ("Adapters live: Vercel AI SDK · LangChain · OpenAI-compat").
2. A section in `/docs/15-build-on-foundry.mdx` with a copy-paste example.
3. A bullet in the README's feature list with ✅ Real marker.
4. A mention in the demo video — usually the SDK adapter (P1.1) is the integrator-funnel beat at minute 1:30.

Each P2 enhancement that ships gets a row in the dashboard's "Recently shipped" section — a low-key flex without front-loading the narrative.

P3 (roadmap) items appear *only* in the Real-vs-Roadmap table with the 🔜 marker. Never claimed, always declared.

---

## The grand-prize calculus

The build spec already neutralizes every top competitor by lane and by execution. The enhancements compound on top:

| Competitor advantage | Spec response | Enhancement that further widens the gap |
|---|---|---|
| Provus's "real numbers" | Living-system Forges (Addition 1) | OpenAI-compat proxy + AI SDK adapter → *integrator volume* shows in dashboard numbers |
| AgentCourt's "zero mocks" | Radical transparency (Addition 5) | Live TEE attestation viewer — the eval is *visually verifiable*, not just attestable |
| AgentHub's clean pitch | Foundry supplies AgentHub (Addition 3) | Foundry CLI + adapters → Foundry becomes the default scaffold for new agent projects |
| ClawMind's completeness | Killer Ingot (Addition 4) + full SDK | Public Goods Forge → emotional + ethical narrative ClawMind cannot match |
| ZeroViza's narrative | Living system + external Smiths | Lineage SVG mint → the protocol's *artifact* is itself collectible and shareable |
| MindVault's depth of integration | Different lane (production, not memory) | AI-assisted Forge creation → a wow moment that has no parallel in the field |

Net effect: Foundry's grand-prize case rests not on one slam-dunk but on **a system that wins on every axis a judge cares about**: protocol depth, ecosystem effect, honest engineering, narrative resonance, and demonstrable adoption — all backed by mainnet proof.

---

## Decision: which P2 enhancements to greenlight at the Sprint 2 retro

By the end of Sprint 2 (May 31), we know:
- TEE integration readiness (drives whether we have spare cycles)
- Adapter adoption (one or two integrators committed?)
- Eval quality of the Killer Ingot

Based on those, the Sprint 2 retro picks **at most one P2 enhancement** to add to Sprint 3, with an explicit owner. Picking zero is acceptable.

Default greenlight priority order if cycles available:
1. P2.4 — Discord/Telegram bot (low effort, community surface)
2. P2.5 — Embeddable widget (medium effort, integrator pull)
3. P2.2 — Smith reputation page (low effort, contributor trust)
4. P2.6 — Ingot Quality score (medium effort, narrative)
5. P2.1 — Index Ingot (only if a contributor takes ownership)
