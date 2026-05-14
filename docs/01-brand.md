# Foundry — Brand

> The supply-side protocol for AI. A foundry is where raw material is collectively forged into something valuable.

This document is the source of truth for Foundry's brand. Everything we ship — code, copy, UI, video, social — defers to it. The goal is **a brand that earns trust on first contact**: judges, integrators, contributors, capital partners should land cold and immediately feel "this is a serious thing built by serious people."

---

## 1. Positioning

### One-line (29 words, locked)

> Foundry is a protocol where anyone can pool data, compute, and capital to co-train AI models on 0G — and own a verifiable, revenue-generating share of the result.

### Category

**Supply-side protocol for decentralized AI.** Foundry is not an agent platform, not a memory layer, not a marketplace — it is the **production layer**: where the models, datasets, and lineage that the rest of the ecosystem consumes get _created_.

### Strategic moat

Every other team in the field **consumes** 0G. Foundry **supplies** it. This is not a feature comparison — it is a different lane.

### Anti-positioning

We are not:

- "AI tokens" or speculative meme infrastructure
- A data marketplace (those prove usage; we prove **value**)
- A compute aggregator (those sell hashpower; we sell **ownership**)
- A model registry (those host; we **forge**)

---

## 2. Narrative pillars

Four pillars. Every piece of public copy reinforces at least one. If a sentence reinforces none, it is removed.

### Pillar 1 — Collective ownership of intelligence

Models are owned by capital. We make them owned by **whoever made them good**.

### Pillar 2 — Verifiable contribution

Other systems prove that something happened. Foundry proves **how much it mattered**. The TEE'd attribution eval is the trust primitive.

### Pillar 3 — A real, on-chain asset

An Ingot is not a file in a folder. It is a tradeable, composable, forkable on-chain asset with an Agent ID, full lineage, and a live revenue split.

### Pillar 4 — Built in public, on mainnet, from day one

No testnets. No mocks. No "we will ship." Foundry is operating before anyone reads about it. The dashboard's numbers are real.

---

## 3. Voice

### Posture

**Confident, precise, understated.** Foundry is a serious financial-grade protocol. We speak like Stripe documentation, not like a Discord launch. Never hype, never crypto-slang, never emoji-spam.

### Voice attributes

| Trait     | Yes                                                                                | No                                                                         |
| --------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Confident | "Foundry measures contribution."                                                   | "We think Foundry might measure contribution."                             |
| Precise   | "$FORGE-denominated shares mint proportionally to measured marginal contribution." | "You earn tokens based on what you did."                                   |
| Plain     | "An Ingot is a co-owned trained model."                                            | "An Ingot represents a synergistic tokenized AI agent intelligence layer." |
| Honest    | "v1 uses leave-one-out attribution. Shapley is on the roadmap."                    | "Foundry implements verifiable attribution." (vague flex)                  |
| Human     | "Maya's dataset shouldn't be dead weight on a hard drive."                         | "Foundry empowers data providers to unlock latent asset value."            |

### Forbidden phrases

- "revolutionary," "disrupt," "next-gen," "game-changer," "Web3 native," "AI-powered" (vague), "synergy," "harness the power of," "leverage" (as a verb), "unlock," "ecosystem play"
- "We are excited to announce" → just announce
- "Join the future of …" → just describe what it is

### Standard sentence shapes

- **The hook:** "[Class of person] has [valuable thing]. Today, [problem]. With Foundry, [outcome]."
- **The proof:** "[Specific real number] on [0G Aristotle mainnet]." Link the explorer.
- **The mechanism:** "Inside a TEE on 0G Compute, baseline + contribution is measured against a secret holdout. The marginal delta determines your share."

### Examples (use these as templates)

**Landing page hero**

> Anyone can pool data, compute, and capital to co-train an AI model — and own a verifiable, revenue-generating share of the result. On 0G. On mainnet. Today.

**Forge card subtitle**

> Open · 12 contributors · 0.47 ETH escrowed · evaluation in 38h

**Inference page CTA**

> Three lines of code. Your agent now calls a co-owned model. Revenue routes back automatically.

**Submission tweet (Week 4)**

> 95 teams built apps that rent 0G. Foundry built the thing that fills it.
> 7 Ingots minted by 24 contributors. Real models. Real revenue. Real strangers, co-owning.
> Mainnet. Live.

---

## 4. Naming system

| Term            | Meaning                                      | Note                                                                                         |
| --------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Foundry**     | The protocol                                 | Always capitalized. Never "the Foundry protocol" except in formal copy.                      |
| **$FORGE**      | The accounting + governance token            | Ticker styled with `$`. Avoid "FORGE token".                                                 |
| **Ingot**       | A co-owned, trained model on-chain           | Singular noun. Plural "Ingots". Title-case in UI.                                            |
| **Forge**       | An active training collective                | Lowercase in body copy ("a forge"), title-case as proper noun ("the Medical-Imaging Forge"). |
| **Smith**       | A contributor (data / compute / capital)     | Capitalized when role-specific ("data Smith").                                               |
| **Reforging**   | Re-running a Forge for a new round (roadmap) |                                                                                              |
| **Lineage**     | Parent/child Ingot relationships             |                                                                                              |
| **Holdout**     | The secret eval dataset inside the TEE       |                                                                                              |
| **Attribution** | Measured marginal contribution scores        |                                                                                              |

**Domain:** `foundryprotocol.xyz` (primary). Confirm DNS before launch. Backup: `0gfoundry.xyz`.

**Social handles:** Reserve `@foundryprotocol` on X, GitHub `foundryprotocol`, npm scope `@foundryprotocol`.

---

## 5. Logo & mark

### Concept direction (chosen)

**The Ingot mark.** A geometric, slightly trapezoidal "ingot" silhouette — flat on top, two angled sides converging to a wider base — rendered as a single solid form. The mark is **the asset**: when you see it, you should immediately feel "object of value." Pair with the wordmark **FOUNDRY** in tracking-wide caps.

The mark must work:

- As a 16×16 favicon
- As a 24×24 chat avatar
- Embossed in deck headers
- As a 256×256 npm package icon
- Animated as the metal-pour intro animation (see Design System §6)

### Wordmark

**FOUNDRY** set in our display serif (PP Editorial New Ultralight or equivalent — confirm license; fallback Tiempos Headline Light), letter-spacing +120 milli-em, all caps. The wordmark is intentionally _thin_, in counterpoint to the mark's solidity — restraint signals quality.

### Lockups

- **Primary horizontal:** mark + wordmark, 8px gap, baseline-aligned.
- **Centered stacked:** mark above wordmark, used for square OG cards.
- **Mark only:** for favicons, social avatars, end-of-deck stamps.

### Clear space

Minimum clear space = 0.5× the height of the mark on all sides.

### Color treatments

- **Primary on dark:** mark in `--ember-500`, wordmark in `--platinum-100`.
- **Primary on light:** mark in `--ember-700`, wordmark in `--ink-900`.
- **Monochrome:** all in `--ink-900` or all in `--platinum-100`.
- **Never** apply gradients, drop shadows, glows, or rotation to the mark.

(Full color tokens in [Design System §2](./02-design-system.md).)

### Trademark posture

A trademark glance for "Foundry" in the software/crypto class is advised — Foundry the Ethereum dev toolkit is a different category (dev tools, not protocol) and likely fine; document the distinction. File a wordmark application Month 1 post-hackathon.

---

## 6. Taglines & headline bank

### Primary tagline (use on landing, deck, video)

> **Co-own the models you help create.**

### Supporting headlines (pick one per surface)

- "The supply-side protocol for 0G."
- "Pool data, compute, and capital. Co-train a model. Own a verifiable share."
- "A foundry, on-chain. Anyone can contribute. Everyone who matters, owns."
- "Other protocols rent compute. Foundry rents you the upside."
- "Models become assets. Contributors become owners."
- "Built where the catalog gets made."

### One-paragraph descriptions

**60-word (for press, deck back-cover)**

> Foundry is the supply-side protocol for decentralized AI. On 0G mainnet, anyone can join a Forge — a collective that pools datasets, compute, and capital to co-train a model. A verifiable attribution eval, executed inside a TEE, measures how much each contribution improved the result and mints proportional ownership. Every inference call against the model routes revenue back to contributors automatically.

**30-word (for X bio, GitHub description)**

> Pool data, compute, and capital. Co-train an AI model on 0G. Own a verifiable, revenue-generating share — minted on mainnet, attributed inside a TEE.

---

## 7. The Trust System

Trust is built mechanically, not rhetorically. The brand commits to five trust mechanics that show up everywhere:

1. **Real vs. Roadmap table** — published in README, dashboard, and pitch. Honesty as a flex.
2. **Live mainnet numbers** — the Forge in Public dashboard. No simulated counters, ever.
3. **Open eval methodology** — the LOO attribution method is documented, reproducible, and labeled v1.
4. **Threat model in the README** — we name the attacks we defend against and how.
5. **Pre-funded judge wallets + 3-line quickstart** — the lowest-friction reproducibility in the field.

Each of these is also a content artifact. The "Real vs. Roadmap" table is also a tweet. The threat model is also a technical writeup. The judge quickstart is also a "Build on Foundry" funnel.

---

## 8. Application gallery (where the brand shows up)

| Surface                                     | Owner     | Brand pressure                                                    |
| ------------------------------------------- | --------- | ----------------------------------------------------------------- |
| `foundryprotocol.xyz` landing               | web       | Highest — first impression for judges & integrators               |
| App (Forge explorer, Ingot pages)           | web       | High — consistent with landing; the brand experienced through use |
| Docs site                                   | web       | High — judges read docs cold                                      |
| `foundry-sdk` npm package + README          | sdk       | Medium — devs see this; brand = "this is a real library"          |
| GitHub repo (README, social card, releases) | all       | High — judges land here first                                     |
| OG cards (auto-generated per Forge / Ingot) | web       | Medium — sharable proof artifacts                                 |
| Demo video                                  | all       | Highest — the 3 minutes that decide the prize                     |
| Pitch deck                                  | all       | Highest — used by humans in rooms                                 |
| X thread (weekly)                           | community | Medium — "building in public" cadence                             |
| Discord / Telegram intros                   | community | Low — but consistency matters                                     |
| Lineage Graph (in-app)                      | web       | Highest visual artifact — the screenshot that travels             |

---

## 9. Brand checklist (apply before every public artifact)

- [ ] Does it reinforce at least one of the four narrative pillars (§2)?
- [ ] Does it pass the voice test (§3)? No forbidden phrases, no hype.
- [ ] Does it use the correct vocabulary (§4)? "Ingot" not "model NFT". "$FORGE" not "FORGE coin".
- [ ] Are the visuals consistent with the Design System? Logo rendered correctly, colors from the palette, motion from the motion library.
- [ ] If it claims a number, is the number real and on mainnet?
- [ ] If it claims a feature, is the feature real (or labeled roadmap)?
- [ ] Is the call-to-action present and frictionless?
