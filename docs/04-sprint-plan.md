# Foundry — Sprint Plan

> From spec to shipped. 4 weeks + submission week. Mainnet on day 5. Living system from week 2. No moving the deadline.

This plan implements [00-build-spec.md](./00-build-spec.md) through five sprints. Each sprint has parallel workstreams, hard milestones, owners, and exit criteria. Traction is a first-class workstream (per build-spec §7), not an afterthought.

**Submission deadline:** **May 16, 2026, 23:59 UTC+8** (HackQuest).
**Plan start:** **May 14, 2026** (today). **Final week begins May 9** for buffer if we slip.
*(Note: this plan is structured to deliver against the deadline. Calendar dates are anchored to today; if start moves, weeks shift in lockstep.)*

---

## Sprint structure

Five sprints. Each Monday-to-Sunday. Daily 20-minute async standup in Telegram (`#foundry-standup`). Friday 60-minute sync.

| Sprint | Week | Theme | Headline deliverable |
|---|---|---|---|
| **Sprint 0** | May 14 – May 17 (4 days, pre-flight) | Foundation | Repo, brand, design system, landing page live |
| **Sprint 1** | May 18 – May 24 | Protocol on mainnet | All 6 contracts deployed; first Forge created; SDK alpha |
| **Sprint 2** | May 25 – May 31 | Eval + Killer Ingot | TEE eval working; 2 Ingots minted; external contributor outreach begins |
| **Sprint 3** | Jun 1 – Jun 7 | Traction + integration | 5 external contributors; 1 integrator team consuming an Ingot |
| **Sprint 4** | Jun 8 – Jun 14 | Polish + submit | Demo video, dashboard freeze, pitch deck, submission |

*(Re-anchor as needed — the relative cadence and gates are what matter.)*

---

## Workstreams

Six parallel workstreams. Each owned by one named person. Cross-workstream dependencies are flagged.

| Workstream | Owner | Description |
|---|---|---|
| **A · Contracts** | Lead solidity | 6 contracts, audit-clean, mainnet deploy week 1 |
| **B · Eval** | Lead Python | Attribution coordinator, training pipeline, TEE integration |
| **C · SDK** | Lead TS | `@foundryprotocol/sdk`, adapters, npm publish |
| **D · Web** | Lead frontend | Landing, app, docs, lineage graph, OG cards |
| **E · Indexer + Infra** | Infra | Indexer, Fly + Vercel + Supabase wiring, Cloudflare DNS |
| **F · Traction + Brand** | Community / founder | Outreach, X thread, external contributors, integrators, video, deck |

For a 2–3 person team, one person owns A+C, one owns B+E, one owns D+F. Section "Team configurations" below has both.

---

## Sprint 0 — Foundation (4 days, May 14–17)

**Goal:** by Sunday night, the brand is locked, the design system is in code, the monorepo is real, and the landing page is live on a custom domain.

### A · Contracts
- [ ] foundry.toml configured, OZ + Solady imported
- [ ] Stub all 6 contracts with NatSpec and event signatures only (compiles, no logic)
- [ ] Deployment script skeleton; addresses file format defined

### B · Eval
- [ ] Python project bootstrapped via `uv`
- [ ] Read 0G Compute integration docs end-to-end; produce a 1-page integration-readiness note
- [ ] Spike: dispatch a "hello world" training job to 0G Compute and retrieve result

### C · SDK
- [ ] Package skeleton with tsup config, vitest, dual ESM/CJS
- [ ] Public API types stubbed (no implementation)
- [ ] Adapters subpath structure created (empty)

### D · Web
- [ ] Next.js 16 app bootstrapped with Tailwind 4
- [ ] `packages/design-tokens` published internally; consumed via `@theme`
- [ ] PP Editorial New + Söhne loaded (or Garamond + Inter fallback)
- [ ] Landing page **live** at `foundryprotocol.xyz` — hero with metal-pour, problem/solution, "Real vs. Roadmap" table (rendered from MDX), demo placeholder, CTA, footer
- [ ] OG card system working — auto-generated card for `/`
- [ ] Lighthouse mobile ≥ 95

### E · Indexer + Infra
- [ ] Domains: `foundryprotocol.xyz` purchased + Cloudflare DNS configured; backups reserved (`0gfoundry.xyz`)
- [ ] Vercel project linked to GitHub; preview + production deploys working
- [ ] Supabase project provisioned (empty schema)
- [ ] Fly.io organization set up for `eval` and `indexer` apps
- [ ] Sentry projects created (web, eval, indexer)
- [ ] Email: Resend wired; `@foundryprotocol.xyz` MX; reply-to working

### F · Traction + Brand
- [ ] X handle `@foundryprotocol` reserved; profile/banner shipped
- [ ] GitHub org `foundryprotocol` reserved (or use personal until logo + bio finalized)
- [ ] npm scope `@foundryprotocol` reserved
- [ ] **First X thread published:** "We're building Foundry — the supply-side protocol for 0G. Building in public starts now." (4-tweet thread, includes the architecture diagram and pillars.)
- [ ] Introduced in 0G Telegram + Discord with the one-line + landing link
- [ ] Identify 20 candidate external contributors (data Smiths, GPU runners) and 10 candidate integrator teams from the gallery — capture in a Notion/sheet
- [ ] Pitch deck v0 (10 slides; problem, solution, mechanism, demo, traction targets, team) — text-only, design later

**Sprint 0 exit criteria (must all be green):**
1. `foundryprotocol.xyz` resolves and renders with the metal-pour animation.
2. Repo is public on GitHub with README, LICENSE, all six docs, CI green.
3. 0G Compute "hello world" dispatch confirmed working.
4. First X thread shipped; at least 5 organic likes/replies (signal we're not invisible).

---

## Sprint 1 — Protocol on mainnet (May 18–24)

**Goal:** all 6 contracts deployed to 0G Aristotle mainnet by **end of Tuesday May 19** (no flexibility — the living-system clock starts that day). First real Forge created Wednesday. SDK alpha published to npm Friday. Eval coordinator running by Sunday.

### A · Contracts
- [ ] Full implementation of `FORGEToken`, `ContributionRegistry`
- [ ] Full implementation of `ForgeFactory`, `Forge` (state machine + all contributor methods)
- [ ] Full implementation of `Ingot` (shares as packed mapping)
- [ ] Full implementation of `RevenueSplitter` (pull-payments)
- [ ] 100% line coverage; slither clean; forge fuzz on `mintOwnership`
- [ ] **Mainnet deploy — Tuesday May 19**, all 6 addresses verified on explorer
- [ ] Deployment addresses committed to `contracts/deployments/aristotle.json`
- [ ] Tenderly alerts wired

### B · Eval
- [ ] Coordinator scaffolding: watcher → trainer → submitter
- [ ] Baseline + LOO training pipeline working end-to-end with a tiny model on local dev (no TEE yet)
- [ ] **TEE integration spike** — first attestation captured, signature verifiable
- [ ] Non-TEE fallback path coded behind a feature flag (per build-spec §5.4)

### C · SDK
- [ ] `Foundry` client class; `forge.*`, `ingot.*` read methods
- [ ] `forge.create()`, `contributeData()`, `contributeCompute()`, `fundForge()` write methods
- [ ] **Alpha (`0.1.0-alpha`) published to npm — Friday May 23**
- [ ] Quickstart docs live in `/build-on-foundry`

### D · Web
- [ ] App routes: `/forges` (list), `/forges/[id]` (detail with contribution UI)
- [ ] Wallet connect (WalletConnect + injected) working against Aristotle
- [ ] Forge in Public dashboard v1 with live indexer-fed counters
- [ ] OG cards working for `/forges/[id]`
- [ ] Lineage Graph stub: empty state polished, ready for data

### E · Indexer + Infra
- [ ] Indexer deployed to Fly.io; watching deployed contracts
- [ ] Supabase schema: forges, contributions, ingots, share_holders, revenue_claims, events
- [ ] tRPC server live; web consuming `getLiveStats`, `getForges`, `getForge`
- [ ] WebSocket fan-out from indexer for live counters

### F · Traction + Brand
- [ ] **First Forge created on mainnet Wednesday May 20** — for the Konkani↔English translation Ingot. Logged publicly with explorer link.
- [ ] X thread update: "Foundry live on 0G mainnet. First Forge open: a translation model for [language]. Anyone with corpus data can contribute."
- [ ] 1:1 reach-out begins to top-10 candidate contributors (warm DMs, not cold sells)
- [ ] First Smith group chat opened (Telegram or Discord) — onboard team-sourced contributors with the same flow strangers will use
- [ ] Pitch deck v1: visual design applied; review with one outside person

**Sprint 1 exit criteria:**
1. 6 contracts on 0G Aristotle mainnet, all events firing, all addresses public.
2. SDK `0.1.0-alpha` on npm; `npm install @foundryprotocol/sdk` works.
3. At least one Forge in `OPEN` state, accepting real contributions.
4. Dashboard shows real on-chain numbers (no placeholders).
5. Eval coordinator running on Fly, watching the contracts.

---

## Sprint 2 — Eval + Killer Ingot (May 25–31)

**Goal:** the end-to-end loop is **complete and demoable** on mainnet. First Ingot mints. Killer Ingot (Konkani translator) demonstrates measurable quality. External contributor outreach goes from warm to active.

### A · Contracts
- [ ] Any bug fixes from real Forge usage; redeploy only if necessary (immutability is a brand commitment — prefer fixes via new Forge instance)
- [ ] Add `forkFrom` support to Ingot if simple (else move to roadmap)

### B · Eval
- [ ] Full LOO attribution pipeline against a real Forge → real `submitEvalResult` tx on mainnet
- [ ] **TEE eval working end-to-end** — TEE attestation accepted by `submitEvalResult` (or non-TEE fallback labeled in the dashboard and README per spec §5.4)
- [ ] First Ingot's weights uploaded to 0G Storage; weight root set on `Ingot`
- [ ] Eval reproducibility: `make eval FORGE_ID=...` works from a clean clone
- [ ] **The Konkani Ingot beats baseline by a measurable margin** (BLEU or equivalent, visible to a human)

### C · SDK
- [ ] `inference.run()` working against the first Ingot
- [ ] `revenue.claim()` working
- [ ] `lineage.get()` returning data
- [ ] **Vercel AI SDK adapter v0** — `import { foundry } from '@foundryprotocol/sdk/adapters/vercel-ai'`; works in a vanilla AI SDK example
- [ ] Beta (`0.2.0-beta`) published to npm

### D · Web
- [ ] `/ingots/[id]` page with cap table, weights ref, lineage parent
- [ ] Inference widget: type input → get output → see revenue route on-chain (the demo wow)
- [ ] **Attribution Bloom animation** working with real data
- [ ] Lineage Graph rendering with 1–2 Ingots; ready to scale
- [ ] Build-on-Foundry page v1: 3-line quickstart, adapter examples

### E · Indexer + Infra
- [ ] Lineage edges indexed
- [ ] Dashboard stats include cumulative revenue distributed
- [ ] Performance: dashboard live-update latency confirmed ≤ 4s p95

### F · Traction + Brand
- [ ] **Onboard first 2–3 external contributors** to the Konkani Forge — provide hand-holding via the Smith chat
- [ ] **Reach out to 5 integrator teams** with the AI SDK adapter as the ask: "we built a Vercel AI SDK adapter, you can swap in our Ingot in 3 lines"
- [ ] Publish technical writeup #1: "Verifiable attribution in a TEE — how Foundry measures contribution"
- [ ] X thread update: first attribution score vector demo (with screenshot of the Attribution Bloom)

**Sprint 2 exit criteria:**
1. At least 2 Ingots minted on mainnet.
2. At least one real inference call against an Ingot with on-chain revenue distribution.
3. Vercel AI SDK adapter published, with a working example in `/build-on-foundry`.
4. At least 2 external contributors with shares on-chain in real wallets they control.
5. Demo loop end-to-end takes ≤ 90 seconds to walk through.

---

## Sprint 3 — Traction + integration (Jun 1–7)

**Goal:** convert the working protocol into **evidence of adoption**. By end of sprint, 5+ external contributors, 1+ integrator team consuming an Ingot, building-in-public thread has growing audience.

### A · Contracts
- [ ] Audit-grade self-review with `slither`, `mythril`, manual checklist
- [ ] Publish a third-party informal review (Code4rena Discord, Trail of Bits OSS reach-out) — even one external pair of eyes is signal

### B · Eval
- [ ] **Reforging support** (if feasible — else state in roadmap): a Forge can run round 2 on an existing Ingot
- [ ] Second Killer Ingot Forge opened: a different model class (sentiment / intent classifier) to demonstrate generality

### C · SDK
- [ ] **LangChain adapter** shipped
- [ ] **OpenAI-compatible HTTP proxy** live at `api.foundryprotocol.xyz/v1/chat/completions` (with x-foundry-ingot-id header)
- [ ] `1.0.0-rc` published; documented stable surface
- [ ] Programmatic OG-card generation for share artifacts

### D · Web
- [ ] **Lineage Graph polished** with 5+ Ingots — the screenshot artifact
- [ ] Smith profile page (`/smiths/[address]`) with contribution history + claimable revenue
- [ ] **"Forge in Public" dashboard final polish** — hero numbers tick live during demo; sparkline trends visible
- [ ] Docs site fully fleshed: protocol overview, quickstart, SDK reference, attribution writeup, threat model, build-on-foundry, real-vs-roadmap

### E · Indexer + Infra
- [ ] Lineage graph endpoint cached aggressively; full re-derive ≤ 2s
- [ ] Backup: nightly Supabase snapshot to S3; restore tested

### F · Traction + Brand
- [ ] **5+ external contributors** with shares on at least 3 different Ingots
- [ ] **1 integrator team consuming a Foundry Ingot via the SDK** — documented with screenshots and on-chain proof
- [ ] X thread weekly cadence: "real strangers now co-own Foundry Ingots" + the integration announcement
- [ ] Second technical writeup: "Building on Foundry — three lines to call a co-owned model"
- [ ] **Pitch deck v2** — design polish, real numbers throughout, demo screenshot inline
- [ ] Engage 0G team for visibility (Community Award angle)

**Sprint 3 exit criteria:**
1. ≥ 5 external contributors with on-chain shares.
2. ≥ 1 integrator team with deployed code calling a Foundry Ingot.
3. ≥ 4 Forges, ≥ 4 Ingots, ≥ 20 contributions total on mainnet.
4. Lineage Graph screenshot-ready (the share artifact).
5. Docs site complete; judge quickstart works on a clean machine in ≤ 5 minutes.

---

## Sprint 4 — Polish + submit (Jun 8–14)

**Goal:** convert everything into the submission. Feature-freeze Monday. Video Tuesday. Iterate to perfection through Friday. Submit Saturday.

### A · Contracts
- [ ] **Feature freeze Monday Jun 9**. No new contracts. Only event-decoder or indexer bug fixes.
- [ ] Final deployment audit: contracts file vs. deployed bytecode parity confirmed.

### B · Eval
- [ ] **Feature freeze Monday Jun 9**.
- [ ] Eval coordinator runs a daily heartbeat Forge (one self-funded data Forge per day) to keep the dashboard ticking.

### C · SDK
- [ ] **`1.0.0` published Monday Jun 9** — frozen public surface.
- [ ] README polished: badges, install, three-line quickstart, adapter examples, link to docs.

### D · Web
- [ ] **Feature freeze Tuesday Jun 10**.
- [ ] Demo-day pass: every animation perfect, every empty state polished, every transition tight.
- [ ] Performance pass: Lighthouse mobile ≥ 95 on every page.
- [ ] Accessibility pass: pa11y CI green; keyboard tour video recorded for archive.

### E · Indexer + Infra
- [ ] **Stability lock**: indexer auto-restart on chain hiccups; alerting on lag > 60s pages on-call.
- [ ] Cache warmth: nightly cron pre-renders OG cards for every Forge and Ingot.

### F · Traction + Brand
- [ ] **Pitch deck final** — design tight, narrative crisp, 12 slides max
- [ ] **Demo video shot and edited** (≤ 3 min, narrated, scripted per build-spec §6.7) — backup recording saved
- [ ] **Submission package assembled**:
  - README submission-grade
  - Demo video (primary + backup)
  - Pitch deck PDF
  - Architecture diagram PNG (1200×1200)
  - Public X thread (5+ tweets cumulative)
  - All explorer links cataloged
  - Real-vs-roadmap table verified accurate
- [ ] **Final X thread** — submission announcement with demo video, architecture image, tags `#0GHackathon #BuildOn0G @0G_labs @0g_CN @0g_Eco @HackQuest_`
- [ ] Submit on HackQuest ≥ 12 hours before deadline (buffer is non-negotiable)

**Sprint 4 exit criteria:**
1. Submission accepted on HackQuest with all required artifacts.
2. ≥ 5 Forges, ≥ 7 Ingots, ≥ 40 contributions, ≥ 5 external contributors, ≥ 1 integration — all real, all linked.
3. Demo video tested on three devices.
4. Real-vs-roadmap table 100% accurate.
5. Team has slept.

---

## Daily ritual

Same every day; takes 10 minutes total.

1. **Standup** (async, in Telegram, 09:30 local). Each workstream owner: what shipped, what's blocked, what's next.
2. **Dashboard check** — open `foundryprotocol.xyz/dashboard`; confirm it ticked something in the last 24h.
3. **Health gates**: any of the "must exist" items in tech-arch §16 red? If so, that's the day's priority.

Friday 16:00 — 60-minute sync: demo the week's work to each other; verify the exit criteria; lock the X update for Sunday.

---

## Team configurations

### 3-person team (preferred)
| Person | Workstreams |
|---|---|
| Engineer 1 | A · Contracts + C · SDK + E · part of Infra |
| Engineer 2 | B · Eval + E · Indexer + Infra |
| Engineer 3 / Founder | D · Web + F · Traction + Brand |

### 2-person team (lean)
| Person | Workstreams |
|---|---|
| Engineer 1 | A · Contracts + B · Eval + E · Infra |
| Engineer 2 / Founder | C · SDK + D · Web + F · Traction + Brand |

### Solo (high-stakes)
The plan is achievable solo only with extreme discipline and aggressive use of AI agents on the SDK / web boilerplate. Single biggest risk: bandwidth for traction (Workstream F). Mitigation: do Workstream F **first** every day (it has lead time), then Workstreams in order C → D → A → B → E.

---

## Cross-cutting rituals

### Building in public (Workstream F, every week)
Every Sunday, an X thread with one of:
- A screenshot of a new working feature
- A real number (contributors, contributions, revenue) from the dashboard
- A technical decision and trade-off (light writeup)
- A direct quote from a Smith or integrator

### Real-vs-roadmap table (every PR)
Every PR that ships or removes a feature updates `/docs/16-real-vs-roadmap.mdx`. The table is referenced from the README, the dashboard, and the pitch.

### Weekly retro (Sundays)
Five questions:
1. What shipped that we can point to?
2. What slipped?
3. What's the riskiest open item next week?
4. What did we learn about a competitor?
5. What did we learn about a user (Smith or integrator)?

---

## Decision log (template)

Every irreversible decision is logged in `/docs/specs/decisions/YYYY-MM-DD-<topic>.md`. Examples to be filed during the build:

- `2026-05-19-aristotle-deploy.md` — final deployed addresses
- `2026-05-21-eval-tee-vs-fallback.md` — TEE readiness decision
- `2026-05-23-sdk-public-surface.md` — frozen API surface for 1.0
- `2026-06-09-feature-freeze.md` — exact commit hashes of the freeze

---

## Anti-scope (what we don't build for the hackathon)

Honest about what's roadmap (per build-spec §6.4):
- Shapley / influence-function attribution (LOO is v1, documented)
- Forge governance (votes, proposals)
- Secondary market for Ingot shares
- Multi-round reforging (target if simple; otherwise roadmap)
- Reputation-weighted contributions
- DAO governance of $FORGE
- Mobile-native experience (responsive web suffices)
- Multilingual UI (English only for hackathon)
- Audit-grade contracts (informal review, full audit Month 1)

This is in `/docs/16-real-vs-roadmap.mdx` and the dashboard.

---

## Win condition

If by submission day we have:
- 5+ Forges live on mainnet, 7+ Ingots minted
- 5+ external contributors (real strangers, on-chain shares)
- 1+ integrator team consuming an Ingot
- A demo video that shows the full loop in 3 minutes
- A pitch deck that explains the supply-side thesis in 6 slides
- Real-vs-roadmap honesty on every public surface
- A dashboard ticking in real time during judging

…then per build-spec §3, there is no competitor we lose to head-to-head. That is the bet, and this plan executes it.
