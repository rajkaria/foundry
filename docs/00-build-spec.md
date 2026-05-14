# FOUNDRY — Complete Build Spec v2
### 0G APAC Hackathon 2026 — Grand Prize Build
### (Revised: five competitive additions folded in, traction playbook added, full technical depth)

> **One-liner (29 words):** Foundry is a protocol where anyone can pool data, compute, and capital to co-train AI models on 0G — and own a verifiable, revenue-generating share of the result.

> **Strategic thesis:** Every other submission in the ~95-project field *consumes* 0G. Foundry *supplies* it. This document scopes a build that is not just the best idea in the field, but the best *submission* — by neutralizing, point by point, the specific advantages of every top competitor (Provus's real numbers, AgentCourt's "zero mocks," AgentHub's clean positioning, ClawMind's completeness).

---

## 0. Naming

**Name: FOUNDRY.** A foundry is where raw material is collectively forged into something valuable — the name does explanatory work for free.

**Vocabulary:**
- **$FORGE** — the contribution-accounting and governance token.
- **Ingot** — a co-owned trained model (an on-chain asset with an Agent ID).
- **Forge** — an active training collective/pool.
- **Smith** — a contributor (data, compute, or capital) to a Forge.

**Domains (verified by DNS check — confirm on registrar before purchase):**
- Primary: `foundryprotocol.xyz` (no DNS — likely available)
- Ecosystem redirect: `0gfoundry.xyz` (no DNS — likely available)
- Backups: `foundry0g.xyz`, `forge0g.xyz` (both likely available)
- Taken: `foundry.xyz`, `foundry.ai`
- Backup name if needed: **Crucible** → `crucibleprotocol.xyz` (likely available; `crucible.xyz`/`.ai` taken)

A trademark glance for "Foundry" in software/crypto is advised (Foundry the Ethereum dev toolkit exists — different category, likely fine).

---

## 1. The Problem

Training a useful AI model takes three things almost nobody has all of: **high-quality data, compute budget, and capital.**

- Individuals with valuable niche datasets (a radiologist with labeled scans, a linguist with a rare-language corpus) have **no way to turn that data into an ongoing asset** — they sell it once, or never.
- People with capital who believe in a model idea **can't co-invest in its creation** — there is no ownership instrument for "a share of a model."
- People with compute sell it at spot price and capture **none of the upside** of the models they help create.
- Result: model creation is locked inside companies. The upside accrues to whoever owns the GPUs, not whoever contributed what made the model good.

**For 0G specifically:** the network is decentralized-AI infrastructure, but its *catalog* is empty. ~95 hackathon submissions all **consume** 0G. None **supply** it — none produce new models and datasets that make the network itself more valuable.

## 2. The Solution

Foundry is the **supply-side protocol for 0G**. Strangers form a **Forge** — a collective pooling datasets, compute credits, and capital — to co-train a model (an **Ingot**). A verifiable evaluation on 0G Compute, run inside a TEE, measures **how much each contribution actually improved the model**. Ownership of the Ingot mints as $FORGE-denominated shares **proportional to measured marginal contribution** — not self-reported. The Ingot lives on 0G Storage with an Agent ID and full lineage; every inference call against it routes revenue back to co-owners automatically.

**The novel core (why this is not "Ocean Protocol again"):** existing data markets prove *usage*. Foundry proves *value* — it measures and rewards how much a contribution improved the model. Provus proved on-chain attestation of *inference* works; nobody has done verifiable attribution of *contribution to training*.

## 3. Competitive Positioning — and how Foundry beats each top competitor

Cross-checked against all ~95 submissions (see Master Submission List). The field's lane saturation: ~16 agent-memory, ~18 verifiable-trading, ~12 agent-infra, ~12 security, ~10 marketplaces. Foundry is in none of them.

**But idea-cleanliness is not enough — the top 8 competitors have *shipped*.** Here is the head-to-head and the explicit counter built into this spec:

| Competitor | Their edge | Foundry's built-in counter (see Section 6) |
|---|---|---|
| **Provus** (8.0) | 75k+ real mainnet attestations — proof of *execution at scale* | **Addition 1:** Foundry runs as a living system pre-submission — real cumulative numbers across multiple Forges, not one demo loop |
| **AgentCourt** (8.5) | All 5 components, explicit "zero mocks, zero simulated data" | **Addition 5:** "What's real vs. roadmap" becomes a *headline* trust feature, not a disclaimer |
| **AgentHub** (8.5) | "AWS for AI agents" — clean pitch, built, intuitive lane | **Addition 3:** Foundry becomes AgentHub's *supplier*, not its competitor — agent projects consume Ingots |
| **ClawMind** (8.0) | Mainnet, EIP-712 signed, complete multi-agent system | **Addition 1 + 5:** match completeness with a living system + radical transparency |
| **MindVault** (8.0) | Memory + identity + economy, deep integration | Different lane entirely — Foundry is creation, not memory; no head-to-head |
| **ZeroViza / Compass** (8.0) | Mainnet, emotionally resonant, complete | **Addition 4:** the "killer Ingot" gives Foundry its own emotionally legible artifact (a model that visibly works) |

**Conclusion:** with the five additions, there is no competitor Foundry loses to head-to-head, because the supply-side position removes it from their bracket entirely.

## 4. Target Personas

- **Maya — data Smith.** Computational linguist with a 50k-sentence labeled corpus for a low-resource language. Today it sits on a hard drive. With Foundry she contributes it to a translation Ingot and owns 12% — earning on every inference call.
- **Devansh — capital Smith.** Believes a contract-clause classifier will be valuable; can't train it himself. Funds a Forge's compute budget, owns a proportional share.
- **Priya — compute Smith.** Runs GPUs. Instead of selling compute at spot price, contributes batches to Forges and takes ownership upside.
- **The consumer — every other 0G builder.** AgentHub, ClawMind, future dApps need models. They call Ingots via 0G Compute; revenue flows back to the Forge.

---

## 5. TECHNICAL ARCHITECTURE (full depth)

### 5.1 System overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                          FOUNDRY PROTOCOL                              │
└──────────────────────────────────────────────────────────────────────┘

  SMITHS                       THE FORGE                      CONSUMERS
 ┌──────────┐        ┌──────────────────────────────┐       ┌──────────┐
 │ Data     │───────▶│ 1. Intake + stake            │       │ Any 0G   │
 │ Compute  │───────▶│    (contributions escrowed)  │       │ dApp,    │
 │ Capital  │───────▶│                              │       │ agent,   │
 └──────────┘        │ 2. Baseline training run     │       │ SDK user │
                     │    (0G Compute)              │       └────┬─────┘
                     │                              │            │
                     │ 3. Verifiable attribution    │            │ inference
                     │    eval — IN TEE             │            │ request
                     │    (0G Compute + Privacy)    │            ▼
                     │                              │       ┌──────────┐
                     │ 4. Contribution registry     │       │  INGOT   │
                     │    write (0G Chain)          │       │ model +  │
                     │                              │       │ Agent ID │
                     │ 5. Ownership mint            │──────▶│ weights  │
                     │    ($FORGE shares, 0G Chain) │       │ on 0G    │
                     │                              │       │ Storage  │
                     │ 6. Final training run        │       └────┬─────┘
                     │    (0G Compute)              │            │
                     │                              │            │ revenue
                     │ 7. Ingot registration        │            ▼
                     │    + lineage (0G Storage)    │       ┌──────────────┐
                     └──────────────┬───────────────┘       │  REVENUE     │
                                    │                       │  SPLITTER    │
                                    └──────────────────────▶│  (0G Chain)  │
                                                            │ auto-distrib │
                                                            └──────────────┘
```

### 5.2 0G component mapping — every component load-bearing, with the *how*

| 0G Component | How Foundry uses it | Why it is load-bearing (not decorative) |
|---|---|---|
| **0G Storage** | Stores: (a) contributed datasets, content-addressed; (b) the secret eval holdout set; (c) baseline + final model weights; (d) the lineage record for each Ingot; (e) eval result artifacts | Foundry *cannot function* without persistent, content-addressed storage for datasets and weights. Lineage is impossible without it. Uses dual-layer: Log layer for permanent dataset/weight archival, KV layer for fast lineage/registry queries. |
| **0G Compute** | Runs: (a) the baseline training run; (b) the **verifiable attribution eval**; (c) the final training run; (d) all consumer inference calls against Ingots | This is the part ~90% of the field skipped — they use Compute for inference only. Foundry uses it for **fine-tuning + eval**, exactly what Track 1 explicitly asked for. The pay-as-you-go + ZK-verifiable settlement model is what makes capital contribution accountable. |
| **0G Chain** | Hosts: `ForgeFactory`, `Ingot` (identity + share ledger), `ContributionRegistry`, `RevenueSplitter`, `$FORGE` token. All contribution proofs, ownership mints, and revenue distributions settle here. | The entire ownership and accounting layer. Proportional ownership minting and automated revenue splitting are smart-contract-native operations. |
| **Agent ID** | Each Ingot is registered under the Agent ID standard — tokenized model intelligence, encrypted metadata (training config, lineage parent), tradeable ownership, composability | Makes an Ingot a real, portable, composable on-chain asset rather than a file. Enables the lineage graph and the future secondary market. Agent ID's "tradeable ownership" is exactly the Ingot ownership instrument. |
| **TEE / Privacy** | The attribution eval runs **inside a TEE**: the holdout set is decrypted only inside the enclave, contribution data is sandboxed, and the eval produces a hardware-signed attestation of the marginal-contribution scores | This is the anti-gaming core. Without TEE, contributors could reverse-engineer the holdout and game their ownership share. The TEE attestation is what makes the ownership split *trustless*. Directly answers the security judge. |

### 5.3 Smart contract suite (0G Chain — Aristotle mainnet)

**`FORGEToken.sol`** — ERC-20. The contribution-accounting and governance token. Fixed supply; used to denominate Ingot ownership shares and (post-hackathon) governance.

**`ForgeFactory.sol`** — deploys and registers Forges.
- `createForge(modelSpec, evalSpec, contributionWindow)` → deploys a `Forge` instance
- Holds the registry of all Forges; emits events for the dashboard
- `modelSpec` = base model ref + training config hash (on 0G Storage); `evalSpec` = holdout ref + eval method id

**`Forge.sol`** — one instance per training collective. State machine:
- States: `OPEN` (accepting contributions) → `EVALUATING` → `MINTING` → `TRAINING` → `LIVE` → (`REFORGING` for v2 rounds)
- `contributeData(storageRoot, metadataURI)` — registers a data contribution; dataset already on 0G Storage
- `contributeCompute(amount)` — escrows compute credits
- `fundForge(amount)` — escrows capital
- `submitEvalResult(attestation, scores[])` — callable only by the registered eval coordinator; `attestation` is the TEE hardware signature; `scores[]` is the per-contribution marginal-improvement vector
- `mintOwnership()` — reads verified scores, mints `Ingot` shares proportionally
- Anti-abuse: contribution window closes before eval; eval coordinator address is immutable post-creation; eval result must carry a valid TEE attestation or the call reverts

**`Ingot.sol`** — ERC-721 (the model identity / Agent ID anchor) + an internal share ledger (ERC-1155-style balances, or a dedicated `IngotShares` ERC-20 per Ingot).
- Holds: Agent ID reference, weights storage root, lineage parent pointer, $FORGE-denominated share cap table
- `shareOf(address)` → ownership fraction
- `setWeightsRoot(root)` — set once after final training run
- `forkFrom(parentIngotId)` — (v2) creates a child Ingot, lineage recorded

**`ContributionRegistry.sol`** — immutable log of every contribution across all Forges: contributor, type, storage root, timestamp, the Forge it went to, and the eventual measured score. This is the data source for the lineage graph and the public dashboard. Append-only.

**`RevenueSplitter.sol`** — receives inference payments for an Ingot, splits to current share holders per the `Ingot` cap table.
- `receivePayment(ingotId)` — payable; or pull-based `claimRevenue(ingotId)` to avoid gas-griefing on distribution
- **Use pull-based claiming** (PullPayment pattern) — never loop-distribute to N holders in one tx; holders claim. Prevents gas-bomb DoS.
- Protocol fee (e.g. 2.5%) skimmed here to the protocol treasury

**Security patterns baked in (answers the auditor judge):**
- Pull-payments everywhere (no push-distribution loops)
- Eval coordinator address immutable after Forge creation; eval result gated on valid TEE attestation
- Contribution window strictly closes before `EVALUATING` — no contributions after results are visible
- Reentrancy guards on all value-moving functions
- Holdout set never on-chain and never leaves the TEE unencrypted
- Sybil resistance on contributions: minimum stake to contribute + per-wallet contribution caps per Forge for the hackathon; reputation-weighting is roadmap
- Checks-effects-interactions ordering; no `delegatecall`; no upgradeable proxies for the hackathon (immutability is a trust signal)

### 5.4 The eval & attribution engine (the hardest, most novel component)

**The honest framing (critical — answers the ML judge):** full credit attribution in ML (Shapley values, influence functions) is an unsolved research problem. Foundry ships a **credible, transparent v1** and says so plainly.

**v1 attribution method — Leave-One-Out (LOO) marginal contribution:**
1. Train a baseline model on the common/seed data only → score against the secret holdout. Call it `S_base`.
2. For each contribution `i`, train `baseline + contribution_i` → score `S_i`. The marginal improvement is `Δ_i = S_i − S_base`.
3. For capital and compute contributions: their share is derived from the fraction of the *total compute budget* they funded/supplied, then weighted against the data contributions by a governance-set ratio (hackathon: a fixed, documented ratio, e.g. data contributions split 70% of ownership, compute 20%, capital 10% — transparent and stated).
4. Normalize all `Δ_i` (and the compute/capital shares) → proportional ownership vector.
5. The entire computation runs inside the TEE; output is the score vector + a hardware-signed attestation.

**Why LOO and not Shapley for the hackathon:** Shapley requires evaluating all subsets — exponential, infeasible in the window. LOO is the honest, computable v1. The README states explicitly: "v1 uses leave-one-out; Shapley-approximation and influence-function attribution are on the roadmap." This honesty is a *trust signal*, per Addition 5.

**Eval orchestration service (off-chain → 0G Compute):**
- A Python coordinator service watches `Forge` contracts for the `EVALUATING` state
- Pulls contributed datasets + holdout from 0G Storage (holdout stays encrypted until inside the enclave)
- Dispatches training + eval jobs to 0G Compute, requesting TEE execution
- Collects the TEE attestation + score vector, calls `submitEvalResult` on-chain
- Fully open-source and documented — judges can reproduce

**Fallback (in the risk register, but plan for the real thing):** if TEE execution on 0G Compute proves not integration-ready in time, run the eval on 0G Compute *without* the enclave for the demo, clearly labeled, with TEE as the immediate next step. **Start this integration in Week 1** — it is the critical-path risk.

### 5.5 The `foundry-sdk` (TypeScript) — and why it must be load-bearing

Published npm package. Surface:
- `createForge(spec)`, `contributeData(forgeId, dataset)`, `contributeCompute(forgeId, amount)`, `fundForge(forgeId, amount)`
- `getIngot(ingotId)` → metadata, cap table, weights root, lineage
- `runInference(ingotId, input)` → calls the Ingot via 0G Compute, triggers revenue routing
- `claimRevenue(ingotId)`
- `getLineage(ingotId)` → the family tree

**Per Addition 3:** the SDK is not a checkbox. The goal is that *another team can consume a Foundry Ingot.* `runInference()` must be dead-simple — three lines to call a co-owned model. This is what turns Foundry from "a competitor to agent projects" into "the supplier agent projects depend on."

### 5.6 Frontend

- Next.js + TypeScript + Tailwind + shadcn/ui, dark theme, wagmi/viem on 0G Chain
- **Screens:** (1) Forge explorer — browse active/completed Forges; (2) Forge detail — contribute UI, live contribution list, eval status; (3) Ingot page — cap table, weights, lineage, "run inference" widget; (4) **The Lineage Graph** — visual on-chain family tree of all Ingots; (5) **"Forge in Public" dashboard** — live cumulative mainnet stats; (6) Smith profile — your contributions, your shares, your claimable revenue
- 30-second rule: a judge landing cold understands "pool resources → co-own a model" within 30 seconds

### 5.7 Repo structure

```
foundry/
├── contracts/        Solidity, Foundry(toolkit) or Hardhat, full test suite
├── eval/             Python eval+attribution coordinator, TEE job dispatch
├── sdk/              foundry-sdk TypeScript package (published to npm)
├── web/              Next.js frontend + dashboard + lineage graph
├── docs/             architecture, threat model, "how 0G is used", judge quickstart
└── .github/          CI: contract tests, sdk build, lint — all green
```

---

## 6. HACKATHON BUILD — Demo-First Requirements

> **Principle: not a minimum build. A functional, mainnet, over-qualified build.** The core loop must be **genuinely real end-to-end** — no mocked collective, no fake eval.

### 6.1 The non-negotiable core loop (100% real, on mainnet)

One complete cycle, fully on-chain on 0G Aristotle mainnet:

1. **A Forge is created** for a real, small, well-defined model (recommended: a low-resource-language translation LoRA, or a sentiment/intent classifier — see Addition 4 for why the choice matters).
2. **Multiple real contributions** from multiple independent wallets: data → 0G Storage (hash on chain); compute credits escrowed; capital escrowed on 0G Chain.
3. **The verifiable attribution eval runs on 0G Compute, inside a TEE.** Baseline scored vs. secret holdout; each contribution's marginal Δ measured (LOO v1); TEE emits signed attestation + score vector.
4. **Ownership mints proportionally.** `Ingot` shares mint to contributors based on *measured* contribution. Real contracts, real 0G Chain mainnet addresses, real explorer activity.
5. **The Ingot is registered** with an Agent ID; weights on 0G Storage; lineage recorded.
6. **A real inference call** against the Ingot via 0G Compute → payment → `RevenueSplitter` → contributors claim on-chain, live.

### 6.2 The five competitive additions — now FIRST-CLASS hackathon requirements

These are **not roadmap.** They are required for the submission to be the *best submission*, not just the best idea. Each neutralizes a specific competitor advantage.

#### Addition 1 — Run Foundry as a LIVING SYSTEM (neutralizes Provus's 75k attestations)
- Not one demo loop — a system that has been *running* for weeks before submission.
- **Target for submission day:** 5+ real Forges created, 7+ Ingots minted, 40+ real contributions logged, real inference volume, real $FORGE revenue distributed.
- The "Forge in Public" dashboard shows these as live cumulative on-chain numbers.
- **Build requirement:** deploy to mainnet in Week 1, then *operate* it continuously. Cumulative real activity is the deliverable.

#### Addition 2 — Recruit GENUINE EXTERNAL CONTRIBUTORS (neutralizes the "is the collective real?" attack)
- Before submission, 5–10 real people from outside the team contribute real data/compute/capital to real Forges.
- Converts the biggest vulnerability ("is the Forge just the team wearing three hats?") into the biggest flex ("real strangers co-own these Ingots").
- **Build requirement:** the contribution UX must be smooth enough for an external person to use unassisted by Week 3. See Traction Playbook (Section 7).

#### Addition 3 — Make the SDK LOAD-BEARING FOR ANOTHER TEAM (neutralizes every agent project)
- `foundry-sdk` published to npm, and **at least one other hackathon team consuming a Foundry Ingot** via the SDK before judging.
- Foundry becomes the *supplier*, not the competitor. The DevRel and ecosystem judges become advocates.
- **Build requirement:** `runInference()` must be three-lines-simple by Week 3; then actively recruit one integrator. See Traction Playbook.

#### Addition 4 — Ship a KILLER INGOT (neutralizes the "toy demo" risk)
- The flagship demo Ingot must produce output that is *genuinely, visibly useful on its own* — e.g. a low-resource-language translation model that measurably beats baseline, demonstrated live.
- A judge should think "that model is actually good" independent of the protocol.
- **Build requirement:** choose the demo model for *output quality achievable in the window*, not convenience. The Ingot is a deliverable in its own right.

#### Addition 5 — RADICAL TRANSPARENCY as a headline feature (neutralizes AgentCourt's "zero mocks")
- A prominent "What's Real vs. What's Roadmap" table in the README, the dashboard, and the pitch — not a buried disclaimer.
- ✅ real & on mainnet / 🔜 roadmap, line by line.
- The honest v1-attribution framing lives here too. Transparency becomes a trust signal that beats vaguer competitors.
- **Build requirement:** maintain this table from Day 1; it doubles as the team's own progress tracker.

### 6.3 0G requirement compliance — over-qualified against every line

| Requirement | Minimum to pass | **Foundry's over-qualified target** |
|---|---|---|
| **1. Basic info** | Name + 30-word desc + summary | Name, 29-word tagline, summary, *plus* one-page litepaper + architecture diagram in README |
| **2. Code repo** | Public, meaningful commits | Public monorepo, clean daily commits, 4 packages, CI green, MIT license, no secrets in history |
| **3. 0G integration proof** | 1 component + 1 mainnet contract + explorer link | **All 5 components**, **5+ mainnet contracts**, multiple explorer links, live dashboard of real on-chain activity with real cumulative numbers |
| **4. Demo video** | ≤3 min, shows functionality + 0G usage | Scripted, ≤3 min, real mainnet loop, narrated, backup recording saved |
| **5. README** | Overview, arch, modules, repro steps | All that + per-module "how 0G is load-bearing", threat model, "what's real vs roadmap" table, judge quick-start with pre-funded wallets |
| **6. Public X post** | Name, screenshot, hashtags, tags | Full thread: project + demo clip + architecture image + supply-side narrative. #0GHackathon #BuildOn0G, @0G_labs @0g_CN @0g_Eco @HackQuest_. Posted early |
| **7. Optional bonus** | — | Pitch deck, live frontend, **published npm SDK**, technical write-up on verifiable attribution, "build on Foundry" page, **another team's integration** |

### 6.4 Hackathon feature scope — three core features, fully working

1. **The Forge loop** — create, contribute (data/compute/capital), all real on 0G Storage + Chain.
2. **Verifiable attribution + ownership mint** — TEE eval on 0G Compute, LOO attribution, proportional $FORGE share minting. The novel core.
3. **Live revenue split** — real inference call against an Ingot, RevenueSplitter, on-chain claim.

Plus the five additions (6.2) as first-class requirements. Plus the X-factor polish (6.5).

**Deferred to roadmap, stated honestly:** large-model training, Shapley/influence attribution, Forge governance, secondary market for Ingot shares, multi-round reforging, reputation-weighted contributions.

### 6.5 X-factor polish

- **The Lineage Graph** — visual on-chain family tree of every Ingot. The shareable screenshot.
- **The eval drama** — make the TEE eval visible: baseline score on screen, each marginal Δ appearing as measured, shares minting from deltas. Progress bar → wow moment.
- **"Forge in Public" dashboard** — real cumulative mainnet numbers (this is also Addition 1's surface).
- **"Build on Foundry" page** — shows other teams how to consume Ingots (this is also Addition 3's funnel).
- **Custom domain + clean branding** — `foundryprotocol.xyz`, consistent logo across repo/site/submission.

### 6.6 Track targeting

- **Primary: Track 3** (Agentic Economy) — "foundational economic protocols," revenue-sharing rails.
- **Secondary: Track 1** (Agentic Infrastructure) — explicitly asks for "0G Compute for model fine-tuning"; almost nobody did it.
- **Tertiary: Track 5** (Privacy) — the TEE'd attribution eval.

### 6.7 Demo video script (≤3 min)

```
[0:00–0:15] HOOK — "95 teams built apps that rent 0G. We built the thing that
            fills it. This is Foundry."
[0:15–0:40] PROBLEM — Maya's dataset is dead weight. Devansh's capital can't
            buy a share of a model. Model creation is locked in companies.
[0:40–1:05] SOLUTION — "A Forge: pool data, compute, capital. Co-train a model.
            Own a verifiable share." Show the Forge UI.
[1:05–2:20] LIVE DEMO (mainnet) — independent wallets contribute → TEE eval on
            0G Compute, marginal deltas appear live → $FORGE shares mint
            proportionally → Ingot registered with Agent ID → real inference
            call → RevenueSplitter → on-chain claim. Show the explorer.
[2:20–2:40] PROOF — the "Forge in Public" dashboard: real cumulative numbers,
            real external contributors, another team consuming an Ingot.
            The Lineage Graph.
[2:40–3:00] VISION + CLOSE — one line roadmap, one line revenue model.
            "Foundry doesn't use 0G. Foundry grows it."
```

---

## 7. TRACTION PLAYBOOK — building the things that need people, from Day 1

Three of the five additions (1: living system, 2: external contributors, 3: another team integrating) require **traction, not just code.** Traction has lead time — it cannot be done in the final week. This section is the day-one-onward playbook.

### 7.1 Why this starts on Day 1
- A "living system" with weeks of cumulative data needs the system *live* in Week 1.
- External contributors need to be *found, onboarded, and supported* — that's relationship lead time.
- Another team integrating your SDK needs your SDK stable early *and* needs you embedded in the community where those teams are.

### 7.2 The channels (where the people are)
- **0G APAC Hackathon Telegram** (`t.me/zerog_apac_dev`) — the other ~95 teams. This is where Addition 3 integrators live.
- **0G Discord / Office Hours** — ecosystem contributors, potential data Smiths, 0G team relationships.
- **0G APAC showcase channel** — where builds get posted; your visibility surface.
- **X** — public building-in-public thread, started Week 1, updated continuously (not a one-shot submission post).

### 7.3 Week-by-week traction plan (parallel to the build)

**Week 1 — Presence + infrastructure for traction**
- Deploy contracts to mainnet (also the build's critical path) → the living system clock starts now.
- Post the "building Foundry" intro thread on X. Begin building in public.
- Introduce Foundry in the 0G Telegram + Discord — the supply-side narrative, one clear sentence.
- Create the project's showcase post in the 0G APAC channel.
- Identify 10–15 candidate external contributors (linguists, data folks, GPU runners) and 5–8 candidate integrator teams from the gallery whose projects need models.
- Start logging the "what's real vs roadmap" table publicly (Addition 5) — it doubles as building-in-public content.

**Week 2 — Seed the living system + warm the contributor pipeline**
- Team creates the first 2–3 Forges with real (team-sourced but real) data → first Ingots minting. The dashboard starts showing real numbers.
- Reach out 1:1 to the candidate contributors. Offer: "contribute data, own a real share of a real model, earn on inference." Make the value concrete.
- Reach out 1:1 to 2–3 candidate integrator teams. Offer: "you need a model — call ours in 3 lines, here's the SDK." Low-friction ask.
- Publish the SDK to npm (rough but working) so integrators can start.
- Weekly X update: first Ingots forged, dashboard screenshot.

**Week 3 — External contributors live + first integration**
- Contribution UX must be smooth enough for unassisted external use. Onboard the first 3–5 external contributors to real Forges.
- Support them actively (a dedicated TG group or channel for Smiths).
- Land the first external team consuming an Ingot via the SDK — pair-debug with them if needed.
- More Forges, more Ingots. Push toward the Addition 1 targets.
- Weekly X update: "real strangers now co-own Foundry Ingots" + the integration.

**Week 4 — Scale traction + lock proof**
- Push external contributor count to 5–10, Forges to 5+, Ingots to 7+.
- Confirm and document the external integration(s) — screenshots, quotes, on-chain proof.
- Capture everything for the submission: dashboard numbers, contributor testimonials, integrator confirmation.
- Final X thread for submission. Engage the 0G team directly for visibility (also helps Community Award voting).

**Submission week — Convert traction into evidence**
- Freeze features. The dashboard, the external contributors, the integration are now *evidence* in the README, video, and pitch.
- Community Award angle: the building-in-public thread + real contributors = genuine community engagement to point to.

### 7.4 Traction KPIs to track from Day 1
| Metric | Week 2 | Week 3 | Submission |
|---|---|---|---|
| Forges created | 2–3 | 4 | 5+ |
| Ingots minted | 1–2 | 4 | 7+ |
| Total contributions logged | 5+ | 20+ | 40+ |
| External (non-team) contributors | 0 | 3–5 | 5–10 |
| Other teams consuming an Ingot | 0 | 1 | 1–2 |
| $FORGE revenue distributed on-chain | first | growing | real cumulative figure |
| Building-in-public X updates | 1 | 2 | 4+ |

### 7.5 Risks specific to traction
| Risk | Mitigation |
|---|---|
| External contributors don't show up | Start outreach Week 1, not Week 3. Over-recruit candidates (15 to land 5–10). Make the value visceral: "own a real share." Have team-sourced-but-real contributions as the floor so the system is never empty. |
| No team will integrate the SDK | Target teams whose projects *visibly need models* (agent projects, app projects). Make the ask tiny (3 lines). Offer to do the integration with them. One integration is enough. |
| Living system looks thin at submission | Week 1 mainnet deploy is non-negotiable — every week of delay is a week of lost cumulative numbers. The team operates Forges continuously as a background task. |
| Traction work cannibalizes build time | Traction is mostly outreach + support, not engineering — assign it as a distinct workstream/role. The engineering for it (smooth contribution UX, stable SDK) is already in the build plan for Weeks 2–3. |

---

## 8. Post-Hackathon Roadmap

### Month 1 — Foundation
- Advanced attribution: LOO → influence-function / Shapley-approximation.
- Forge governance: $FORGE holders vote on training params, model direction, compute budgets.
- Full `foundry-sdk` surface + docs site.
- Scale to 20+ real Forges with external contributors.

### Month 3 — Growth
- Secondary market: Ingot shares become tradeable — price discovery for "a share of a model."
- Multi-round Forges: Ingots continuously improved, each round re-attributed.
- Fine-tune lineage: fork an Ingot into a child; revenue flows up the lineage tree.
- Integrate as the supply layer for agent platforms — the AgentHubs consume Foundry Ingots by default.

### Month 6 — Scale
- Foundry is the default way models are created on 0G — the network's catalog is Foundry-built.
- Compute-provider network matures: GPU providers prefer ownership upside to spot pricing.
- Reputation system for data contributors.
- DAO-managed flagship Forges for public-good models (open low-resource-language models).

### Why each 0G integration deepens over time
- **0G Compute:** hackathon = small LoRA fine-tunes + eval. Month 6 = Foundry is one of the largest consumers of 0G Compute *and* a reason new compute providers join.
- **0G Storage:** hackathon = datasets + weights. Month 6 = the network's entire model catalog with full lineage.
- **Agent ID:** hackathon = Ingot identity. Month 6 = a rich graph of tradeable, composable, forkable model assets.
- **The flywheel:** more Forges → more Ingots → more for other dApps to build on → more inference revenue → more contributors → more Forges.

## 9. Revenue Model
- **Protocol fee** on inference revenue through RevenueSplitter (~2.5%).
- **Forge creation / Ingot mint fee.**
- **Secondary-market fee** on Ingot share trades (Month 3+).
- Unit economics to validate post-hackathon: protocol fee × total inference volume across all Ingots; compounds as the catalog grows.

## 10. What the Hackathon Build Validates
**Proven by submission:** the contribute → verifiable-eval → proportional-ownership → revenue-split loop works end-to-end on mainnet; 0G Compute can run a TEE'd attribution eval; "model as co-owned on-chain asset" is real; *and* (via the additions) real external people will contribute and at least one other team will build on it.
**Still hypothesized (stated honestly):** that LOO attribution scales to a robust un-gameable system (research roadmap); that four-sided liquidity bootstraps at scale (Month 1+ addresses it).

## 11. Submission Checklist (over-qualified)
- [ ] Name + 29-word tagline + summary
- [ ] Public monorepo, clean daily commits, CI green, MIT, no secrets
- [ ] 5+ contracts on 0G Aristotle mainnet — addresses recorded
- [ ] Multiple 0G Explorer links — real Forge/Ingot/revenue activity
- [ ] All 5 0G components integrated + documented
- [ ] Demo video ≤3 min — real mainnet loop, narrated, backup saved
- [ ] Live frontend on custom domain + "Forge in Public" dashboard with real numbers
- [ ] `foundry-sdk` published to npm
- [ ] **Addition 1:** living system — 5+ Forges, 7+ Ingots, 40+ contributions, real revenue
- [ ] **Addition 2:** 5–10 genuine external contributors documented
- [ ] **Addition 3:** 1+ other team consuming a Foundry Ingot, documented
- [ ] **Addition 4:** killer Ingot — a model that visibly works, demoed
- [ ] **Addition 5:** "what's real vs roadmap" table in README + dashboard + pitch
- [ ] README: overview, arch diagram, per-module 0G usage, threat model, judge quick-start with pre-funded wallets
- [ ] Technical write-up: "How Foundry uses 0G Compute for verifiable attribution"
- [ ] Pitch deck
- [ ] Public X thread — name, demo clip, architecture image, #0GHackathon #BuildOn0G, @0G_labs @0g_CN @0g_Eco @HackQuest_
- [ ] "Build on Foundry" page live
- [ ] Lineage Graph working
- [ ] Building-in-public X updates posted weekly from Week 1
- [ ] Submitted on HackQuest before May 16, 2026, 23:59 UTC+8

## 12. Risk Register
| Risk | Mitigation |
|---|---|
| TEE eval on 0G Compute harder than expected | Start Week 1 — critical path. Labeled non-TEE fallback on 0G Compute if needed, with TEE as stated next step. |
| Attribution looks "too simple" to the ML judge | Transparent: LOO is a credible, honest v1. Never claim attribution is "solved." Shapley/influence framed as roadmap. |
| Four-sided cold start makes the demo feel artificial | Additions 1 & 2: real external contributors + a living system make every side genuinely real. |
| Mainnet instability near deadline | Deploy Week 1, operate continuously, test the full loop repeatedly. Testnet only as last-resort, clearly labeled. |
| Scope creep (the roadmap is exciting) | Feature freeze after the 3 core features + 5 additions work. Roadmap stays in this doc, not the build. |
| Traction work starts too late | Section 7 — traction is a Day-1 workstream with its own owner and weekly KPIs. |
| Team bandwidth — build + traction simultaneously | Assign a distinct traction/community owner. Traction is mostly outreach + support; the supporting engineering (smooth UX, stable SDK) is already in the Week 2–3 build plan. |

---

*Build spec v2 — Foundry, 0G APAC Hackathon 2026. Scoped from a 9-judge panel (7.8 baseline) plus a full competitive re-analysis against ~95 submissions. The five additions and the Day-1 traction playbook are what move it from "best idea, loses to shipped competitors" to "best submission in the field" — target 8.7–9.0, no head-to-head loss.*
