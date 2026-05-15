# Foundry · Demo Video Script

> Target length: **2:45**. Hard ceiling: 3:00. Read this aloud once with a timer before recording.

## Setup (do once before recording)

- Browser: incognito, full-screen at 1440×900. Theme: dark.
- Tabs preloaded, in order:
  1. `foundryprotocol.xyz` (landing — Hero in view)
  2. `foundryprotocol.xyz/judges` (the 60-second tour)
  3. `foundryprotocol.xyz/forges/<demo-forge-id>` (forge with eval done, Ingot minted)
  4. `foundryprotocol.xyz/ingots/<demo-ingot-id>` (cap table + attestation viewer)
  5. `foundryprotocol.xyz/dashboard` (live counters)
  6. `https://chainscan.0g.ai/address/0x39B736f424754d05a0da186d89015b74d1DDe1d3` (Ingot contract)
- Terminal: zsh, `cd ~/foundry-demo`, `pnpm dlx @foundryprotocol/sdk@latest` already installed. Font size 18.
- VS Code window: open `demo.ts` with the three-line example visible.
- Audio: USB mic, mouth ~6 inches away, RMS check before recording.

---

## Frame-by-frame

### [0:00 – 0:15] HOOK — landing hero

**On screen:** foundryprotocol.xyz landing, Metal-Pour animation playing.

**Voice over:**

> "If your dataset trains the next great AI model, you get nothing. The company that built it keeps the upside forever. Foundry fixes that — on 0G — today."

---

### [0:15 – 0:40] PROBLEM — Problem section + Bittensor/Ocean callout

**On screen:** scroll to the "Why this exists" section. Hold for a beat. Then cut to a Linear-style slide that lists "Compute marketplace, Data DAO, Inference network — and the gap nobody fills."

**Voice over:**

> "Every AI×crypto project today picks one lane. Render and Akash sell compute. Ocean sells data. Bittensor and Ritual sell inference. None of them give the contributors permanent ownership in the model they helped create. There is no on-chain way to say: 'I helped train this. I own a share. Every time someone calls it, I earn.'"

---

### [0:40 – 1:10] SOLUTION + ARCHITECTURE — quick walk

**On screen:** the architecture SVG (open `apps/web/public/architecture.svg` full-screen).

**Voice over:**

> "Foundry introduces the Forge. A Forge is an LP for an AI model. Smiths pool data, compute, and capital. A Python coordinator runs a Leave-One-Out attribution eval inside a 0G TEE. A hardware-signed attestation comes back on-chain. The Forge mints an Ingot — a co-owned model with an Agent ID. Every inference call routes revenue to the Ingot's cap table, pull-claimable forever. Six 0G surfaces, all load-bearing. Foundry doesn't consume 0G — it supplies it."

---

### [1:10 – 2:10] DEMO — the happy path, live

**On screen:** switch to `/judges` page. Hover over the "0G surfaces used: 6/6" tile. Then scroll to the Try-An-Ingot widget. Click "Konkani → English" sample. Click **Run inference**.

**Voice over (during the inference):**

> "This is a real Ingot on 0G Aristotle mainnet. The prompt routes through our OpenAI-compatible proxy to 0G Compute. The serving broker reserves the fee on-chain — that's a transaction on Aristotle right now."

**On screen:** when the response renders, the tx hash appears. Click it. Chainscan opens.

**Voice over:**

> "There's the inference tx. Here's the revenue split — every co-owner of this Ingot just earned a fraction. They pull-claim it from `RevenueSplitter` whenever they want."

**On screen:** back to the page. Click "Open Forge explorer" → the Forge detail page. Scroll past the contribution list, the eval timeline (OPEN → EVALUATING → MINTING → LIVE), the TEE attestation viewer.

**Voice over:**

> "Every state transition you see is an on-chain event. The TEE attestation hash here is the same one we verified on-chain in `Forge.submitEvalResult`. Pull any 0G surface out and the protocol breaks. None of this is mocked."

---

### [2:10 – 2:30] CODE — three-line SDK

**On screen:** cut to VS Code, `demo.ts` in view.

```ts
import { Foundry } from "@foundryprotocol/sdk";

const foundry = new Foundry({ contracts: "aristotle" });
const { output } = await foundry.inference.run("ingot:0x…", { input: "Hello" });
```

**Voice over:**

> "Three lines. npm-published. Plus drop-in adapters for the Vercel AI SDK, LangChain, and an MCP server so any Claude- or Cursor-style agent can use a Foundry Ingot natively. Foundry doesn't ask integrators to learn 0G. It just slots in."

---

### [2:30 – 2:50] VISION + CLOSE

**On screen:** dashboard with live counters incrementing. Hold for 2 seconds. Then cut to a card showing Month 1 / 3 / 6 milestones.

**Voice over:**

> "Today: six contracts, ten Forges live, real revenue flowing. Month one: Trail of Bits audit. Month three: Shapley attribution, secondary market for shares. Month six: 50 Forges, $50k of inference revenue routed to co-owners — most of whom are anonymous wallets that contributed a dataset or compute or capital and now earn from a model they helped make."

**On screen:** final card — Foundry mark, single line:

> **A share of an AI model is now an asset class.**

**Voice over (closing line, slower):**

> "Foundry. The supply-side protocol for 0G. We don't consume 0G — we generate it."

---

## Recording checklist

- [ ] Test mic level — talk normally for 10 seconds, peak should be -12 dB
- [ ] Disable system notifications (Do Not Disturb on)
- [ ] Close all tabs not in the script
- [ ] Reset cursor position before each take
- [ ] First take is always a throwaway — do at least three
- [ ] Edit in Descript or CapCut; tighten gaps, kill ums, normalize loudness
- [ ] Final export: 1080p, H.264, 24fps, MP4 < 50 MB for DoraHacks upload limits
- [ ] Upload to YouTube **unlisted** first; verify on mobile before public

## Voice direction

- Slower than feels natural. The 30% slowdown is the difference between "judge gets it" and "judge tunes out."
- Slight pause before every monetary or quantitative claim. Numbers land harder when isolated.
- Drop pitch at the close ("We don't consume 0G — we generate it"). Conviction reads as low-tone.
- No "we're excited to," "we're proud to," or "in this video I'll show you." Cut filler.

## Fallback if live demo fails

Pre-record the inference response separately as a clip. Cut to it. Voiceover unchanged. Nobody can tell the difference and the rest of the demo doesn't depend on it.
