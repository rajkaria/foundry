# Foundry · Pitch Video Script

> Target length: **2:50**. Hard ceiling: 3:00. This is the *story* video — thesis, market, vision.
> The demo video ([DEMO-SCRIPT.md](./DEMO-SCRIPT.md)) shows it working; this one explains why it matters.
> Format: talking-head intercut with 4 simple slides + ~20s of product B-roll. Slower than feels natural.

## Slides to prepare (Keynote/Figma, dark, Foundry mark bottom-right)

1. **Title** — "Foundry — the supply-side protocol for 0G"
2. **The gap** — 3 columns: `Compute (Render, Akash)` · `Data (Ocean)` · `Inference (Bittensor, Ritual)` → big text under all three: **"None give contributors a share of the model."**
3. **The primitive** — "A Forge is an LP for an AI model. An Ingot is a share in its revenue."
4. **Vision** — Month 1 → Month 3 → Month 6 → Year 1, one line each.

---

## Frame-by-frame

### [0:00 – 0:20] HOOK

**On screen:** talking head. No slide yet.

**Voice over:**

> "A community of Konkani speakers has the data to build a translation model for a language Google ignores. They can label it, clean it, prove it works. But the moment a model ships, they own nothing. The company keeps the upside forever. That's not a Konkani problem. That's how every AI model gets built."

### [0:20 – 0:50] PROBLEM

**On screen:** Slide 2 (the gap — three columns).

**Voice over:**

> "Three groups create every AI model and capture none of it. Domain experts with the data that sets the quality ceiling. Capital that funds the training. Compute that runs it. Crypto has built a marketplace for each one — Ocean for data, Render and Akash for compute, Bittensor for inference. Every one of them rents a resource. None of them lets the people who made the model *own* the model. There has never been an on-chain way to say: I helped train this, I hold a share, every call pays me."

### [0:50 – 1:25] SOLUTION + WHY NOW

**On screen:** Slide 3 (the primitive). Then cut to talking head.

**Voice over:**

> "Foundry is that primitive. A Forge is a liquidity pool for an AI model — you pool data, compute, or capital. A coordinator runs a leave-one-out attribution eval inside a 0G trusted execution environment, so a hardware-signed proof — not a promise — decides each contributor's share. The Forge mints an Ingot: a co-owned model with its own Agent ID. Every inference call routes revenue to the cap table, claimable forever. This is only possible now because 0G is the first stack where chain, storage, compute, and a TEE are all on one network. Foundry uses all of them — pull any one out and the protocol breaks."

### [1:25 – 1:55] PROOF (brief — depth is in the demo video)

**On screen:** ~30s product B-roll, no narration of clicks: Forge lifecycle OPEN→LIVE, an inference call, the tx on 0G explorer, the cap table paying out.

**Voice over:**

> "This is live on 0G Aristotle mainnet right now. Six audited-style contracts. Real Forges, real Ingots, real revenue splitting to real wallets. No testnet, no mocks. Every contributor's share is already on-chain. And it's three lines of SDK to consume an Ingot — with drop-in adapters for the Vercel AI SDK, LangChain, and an MCP server. Integrators never have to learn 0G. It just slots in."

### [1:55 – 2:20] MARKET + MODEL

**On screen:** talking head.

**Voice over:**

> "Foundry only earns when an Ingot earns: a two percent protocol fee, ninety-eight percent to co-owners. No mint fees, no token sale — $FORGE is minted to contributors, never sold. The moat isn't the rake, it's the network. And the flywheel is 0G's flywheel: every Forge mints transactions, uploads storage, books compute, runs a TEE job, registers an Agent ID. Foundry growing *is* 0G growing — a single Forge generates more 0G activity than most consumer dApps do in a month."

### [2:20 – 2:40] VISION

**On screen:** Slide 4 (roadmap).

**Voice over:**

> "Month one: third-party audit and the first paying integrators. Month three: Shapley attribution and a thousand calls a day to a community-owned language model. Month six: a secondary market — shares of an AI model that actually trade. Year one: contributors who joined as anonymous wallets have collectively earned six figures from data they once gave away for free."

### [2:40 – 2:55] CLOSE

**On screen:** Slide 1 (title) → fade to single line: **"A share of an AI model is now an asset class."**

**Voice over (slower, drop pitch):**

> "Other submissions consume 0G. Foundry supplies it. The hackathon ends — Foundry doesn't. Every contract is immutable, every share is on-chain. It exists whether or not the prize comes."

---

## Voice direction

- 30% slower than natural. The hook and the close get the most air.
- Pause before every number ("two percent" … "six figures"). Isolated numbers land.
- No "we're excited to" / "in this video" / "as you can see". Cut all filler.
- The close is conviction, not enthusiasm — low tone, no smile-voice.

## Recording checklist

- [ ] Mic peak ~ -12 dB, Do Not Disturb on
- [ ] Talking-head segments framed identically (same crop, same background)
- [ ] B-roll pre-recorded so the live system can't fail mid-pitch
- [ ] Read aloud with a timer once before the first real take; first take is a throwaway
- [ ] Export 1080p H.264 24fps MP4 < 50 MB; upload unlisted, verify on mobile before submitting

## Two-video division of labour

| | Pitch video (this) | Demo video ([DEMO-SCRIPT.md](./DEMO-SCRIPT.md)) |
|---|---|---|
| Job | Why this matters — thesis, market, vision | Proof it works — live happy path |
| Mode | Talking head + slides + light B-roll | Screen recording, frame-by-frame |
| Carries | Problem, primitive, moat, roadmap, ask | Forge → eval → mint → inference → revenue, on-chain |

Don't repeat the deep product walkthrough in the pitch, and don't re-explain the market thesis in the demo. Each video assumes the judge may watch only one.
