# examples — copy-paste-runnable 0G recipes

Each folder is a standalone, **degit-able** project. Grab one with:

```bash
npx degit rajkaria/foundry/examples/<recipe> my-app
cd my-app && npm install
cp .env.example .env   # fill in if the recipe needs a key
npm start
```

## Neutral recipes (the default path — `@foundryprotocol/0gkit-*`)

| Recipe                                         | What it shows                                                          |
| ---------------------------------------------- | ---------------------------------------------------------------------- |
| [`da-publish-verify`](da-publish-verify)       | Publish a payload to 0G DA and verify it. Runs key-free in local mode. |
| [`storage-roundtrip`](storage-roundtrip)       | Upload bytes to 0G Storage and download them back.                     |
| [`inference-quickstart`](inference-quickstart) | Run TEE inference through a 0G compute broker.                         |

These import only `@foundryprotocol/0gkit-*` — no Foundry, no ownership layer. This is the
recommended starting point.

## Foundry recipes — the ownership / revenue path

> These recipes use `@foundryprotocol/sdk` and opt you into the Foundry
> ownership + revenue layer. They are **not** the default — reach for the
> neutral recipes above unless you specifically want co-ownership and
> passive revenue.

| Recipe                                           | What it shows                                                         |
| ------------------------------------------------ | --------------------------------------------------------------------- |
| [`foundry-own-a-model`](foundry-own-a-model)     | Upload data → create a Forge → contribute → own a share of the Ingot. |
| [`foundry-revenue-split`](foundry-revenue-split) | Read claimable revenue for an Ingot you co-own and claim it.          |

For a guided scaffold (archetypes A–E + the zero-setup live demo) use
[`create-foundry-app`](../packages/create-foundry-app).
