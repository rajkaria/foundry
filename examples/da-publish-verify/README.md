# da-publish-verify

Publish a JSON payload to 0G Data Availability and verify it round-trips.
**Neutral recipe** — `@foundryprotocol/0gkit-da` only, no Foundry.

```bash
npm install
npm start
```

No key needed: with no encoder configured, `DA` runs in deterministic local
mode (it still computes a real content digest). Set `ZG_DA_ENCODER` and pass it
via `new DA({ encoderUrl })` to publish for real on Galileo.
