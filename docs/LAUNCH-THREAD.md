# Foundry Launch — Twitter / X Thread

> Post 24h before the hackathon submission deadline so judges and 0G core team see it before scoring closes. Pin to profile until results announced.

---

**Tweet 1 / hook** (pin this)

If your dataset trains an AI model, you get nothing.

Foundry fixes that. On 0G. Live now.

The supply-side protocol for AI ownership — pool data, compute, and capital → co-train a model → own a verifiable, revenue-generating share, on-chain forever.

🧵👇

[attach: 6-second screen recording of inference call + on-chain tx]

---

**Tweet 2 / the gap**

Every AI×crypto project today picks one lane:

→ Render / Akash sell compute
→ Ocean sells data
→ Bittensor / Ritual sell inference

Nobody gives contributors permanent ownership in the model they helped build.

Foundry is that primitive.

---

**Tweet 3 / how**

A Forge is an LP for an AI model.

1. Smiths pool data, compute, capital
2. Python coordinator runs Leave-One-Out attribution inside a 0G TEE
3. Hardware-signed attestation comes back on-chain
4. Ingot mints with a cap table proportional to _measured_ contribution
5. Every inference call routes revenue to co-owners

---

**Tweet 4 / 0G integration**

Foundry uses every 0G surface — load-bearing, not decorative:

⚙️ Chain (Aristotle) — 6 contracts
💾 Storage Log — datasets + weights
🗂 Storage KV — Ingot metadata
🧠 Compute — training + inference
🔒 Compute TEE — attribution eval
🆔 Agent ID — one per Ingot

Pull any out → protocol breaks.

---

**Tweet 5 / three-line SDK**

```ts
import { Foundry } from "@foundryprotocol/sdk";

const foundry = new Foundry({ contracts: "aristotle" });
const { output } = await foundry.inference.run("ingot:0x…", { input: "Hello" });
```

Revenue routes automatically. Plus adapters for Vercel AI, LangChain, OpenAI-compat, and an MCP server.

---

**Tweet 6 / what we want you to see**

A live, wallet-less demo for hackathon judges:

🔗 foundryprotocol.xyz/judges

- Run inference on a real Ingot
- Inspect the TEE attestation
- Trace revenue routing on-chain
- See the cap table

Sixty seconds. No setup.

---

**Tweet 7 / why this matters**

"A share of an AI model" has never been an asset class.

Now it is.

The first Konkani↔English translation Ingot on Foundry is co-owned by 9 contributors. Every inference call earns each of them a pro-rata cut. Forever.

This is what verifiable AI ownership looks like.

---

**Tweet 8 / call to action**

Built for 0G APAC Hackathon 2026 — built to outlast it.

- Site: foundryprotocol.xyz
- Docs: foundryprotocol.xyz/docs
- Vision: foundryprotocol.xyz/docs/vision (or github.com/rajkaria/foundry/blob/main/docs/VISION.md)
- npm: `pnpm add @foundryprotocol/sdk`
- MCP: `npx @foundryprotocol/mcp`

If you build on 0G — slot in. If you have data — own a model.

—

## LinkedIn version (one post, longer-form)

**Headline:** "We built the supply-side protocol for AI on 0G."

If your dataset trains the next AI model, you currently get nothing — the company that built it keeps the upside forever. We spent the 0G APAC Hackathon building the primitive that fixes that.

Foundry is on-chain co-ownership of AI models. Anyone can pool data, compute, or capital into a Forge. A Python eval coordinator runs a Leave-One-Out attribution test inside a 0G TEE. A hardware-signed attestation comes back on-chain. The Forge mints an Ingot — a co-owned model with a share ledger proportional to _measured_ contribution. Every inference call routes revenue back to those co-owners, pull-claimable forever.

Six contracts. Two hundred-million-parameter Konkani↔English translation Ingot already live. A published npm SDK that plugs into the Vercel AI SDK, LangChain, OpenAI-compatible HTTP, and an MCP server so any AI agent can natively consume a Foundry Ingot.

Every 0G surface is load-bearing — Chain, Storage Log, Storage KV, Compute, Compute TEE, and Agent ID. Foundry isn't an app that uses 0G. Foundry is what makes more 0G happen.

Hackathon judges and 0G core team — the 60-second walkthrough is at foundryprotocol.xyz/judges. No wallet, no setup, fully live on Aristotle mainnet.

The hackathon ends; Foundry doesn't. Audit, Shapley attribution, secondary market for Ingot shares, and 50 Forges live by Month 6 are funded by current grant runway. Vision doc in the README.

A share of an AI model is now an asset class. That is the line.

---

## Discord / Telegram drop (short)

> We just shipped Foundry on 0G Aristotle mainnet — the first protocol where you can co-own an AI model and earn from every inference call forever. Six contracts, npm SDK, MCP server, live Konkani↔English Ingot. Wallet-less judge demo: foundryprotocol.xyz/judges. Built for the 0G APAC hackathon, built to outlast it.

---

## Hashtags + tags

#0G #AICrypto #DeAI #VerifiableAI #ZeroG #Hackathon2026

Tag: @0g_labs (or the official 0G handle), the hackathon organizer handle, and the protocol judges if known. Tag the team handles in the LinkedIn version.
