# Foundry eval coordinator

The eval coordinator is the off-chain service that closes the loop between
contributors and Ingot minting: it watches Forges on 0G Aristotle, runs
leave-one-out attribution against contributions (real LLM-as-judge through
0G Compute when configured, deterministic content-hash scorer otherwise),
posts the signed envelope to 0G DA, and submits the score vector on-chain.

## Requirements

- Node 22
- A funded coordinator wallet (the address you'll pass as `evalCoordinator`
  when creating Forges)
- Optional: a 0G Compute broker wallet for real LLM scoring
- Optional: a 0G DA encoder endpoint

## Env

```bash
RPC_ARISTOTLE=https://evmrpc.0g.ai
COORDINATOR_KEY=0x…                  # required — signs envelopes + submits tx
FOUNDRY_NETWORK=aristotle            # or galileo, or local
POLL_INTERVAL_SECS=12

# Optional — real LLM scoring
ZG_BROKER_KEY=0x…
ZG_INFERENCE_PROVIDER=0x…

# Optional — 0G DA receipt anchoring
ZG_DA_ENCODER_URL=https://da-encoder.0g.network
ZG_DA_API_KEY=…

# Optional — override storage indexer
ZG_STORAGE_INDEXER=https://indexer-storage.0g.network
```

## Run

```bash
pnpm --filter @foundryprotocol/eval-coordinator dev
# or in prod
pnpm --filter @foundryprotocol/eval-coordinator build
node apps/eval-coordinator/dist/index.js
```

## What it produces on-chain

For each Forge that has reached `Evaluating` and is registered to this
coordinator's address:

1. `submitEvalResult(attestationDigest, scoresScaled)` — locks the Forge into
   `Minting` with the per-contribution marginal Δ × 1e6.
2. Any 0G DA reference for the signed envelope lives off-chain and is
   recoverable from the daemon logs.

If the daemon restarts, it resumes via `./.foundry-eval-state.json`
(or `COORDINATOR_STATE_PATH`).
