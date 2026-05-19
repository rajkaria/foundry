# inference-quickstart

Run TEE-attested inference through a 0G compute broker.
**Neutral recipe** — `@0gkit/compute` only, no Foundry.

```bash
npm install
cp .env.example .env   # paste a funded broker key
npm start
```

`ZEROG_BROKER_KEY` is a funded 0G broker private key — it pays providers per
request. The returned `receipt` carries the verifiable inference proof.
