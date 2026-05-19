# storage-roundtrip

Upload bytes to 0G Storage and download them back to prove the round-trip.
**Neutral recipe** — `@foundryprotocol/0gkit-storage` only, no Foundry.

```bash
npm install
cp .env.example .env   # paste a funded Galileo key
npm start
```

The upload is an on-chain transaction, so you need a key with testnet OG
(faucet: https://faucet.0g.ai). Download is read-only.
