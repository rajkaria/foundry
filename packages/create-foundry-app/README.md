# create-foundry-app

Scaffold a runnable [Foundry Protocol](https://foundryprotocol.xyz) app for
your builder archetype — or run the zero-setup live demo in one command.

## One-command live demo

```bash
npm create foundry-app@latest my-demo -- --demo
cd my-demo && npm install && npm run demo
```

No key, no funds: this runs read-only inference against the public demo Ingot
on **Galileo testnet** and prints the output + on-chain receipt.

## Scaffold for your archetype

```bash
npm create foundry-app@latest my-app
# or non-interactive:
npm create foundry-app@latest my-app -- --archetype B --network galileo
```

You'll pick one of five archetypes (from the
[0G hackathon integration plan](../../docs/0G-HACKATHON-INTEGRATION-PLAN.md) §2):

| ID  | Archetype                            | Leads with                                           |
| --- | ------------------------------------ | ---------------------------------------------------- |
| A   | Agent infra / memory / identity      | Your memory becomes equity                           |
| B   | Verifiable finance / trading / DeFi  | TEE-attested inference + on-chain receipts           |
| C   | Marketplaces / skill / gig / payment | Every inference pays you passively                   |
| D   | Consumer / RWA / tools               | Drop in a co-owned model behind plain HTTP           |
| E   | Pure infra / data / compute          | Contribute infra you already run → earn Ingot shares |

Each archetype emits a tailored, runnable `index.ts` with
`@foundryprotocol/sdk` pre-wired, a `.env.example`, and a README explaining the
ownership/revenue path.

### Flags

- `--archetype A|B|C|D|E|demo` — skip the picker
- `--network galileo|aristotle|local` — default `galileo` (testnet-first)
- `--demo` — shortcut for `--archetype demo --network galileo`, non-interactive
- `--yes` / `-y` — accept defaults, no prompts

## Neutral path & recipes

This scaffolder is the **Foundry (ownership/revenue) entrypoint**. For the
neutral, Foundry-free quickstart use `0g init` from
[`@foundryprotocol/0gkit-cli`](../0gkit-cli). Copy-paste-runnable recipes — both neutral
`@foundryprotocol/0gkit-*` and Foundry-tagged — live in [`examples/`](../../examples) and are
degit-able:

```bash
npx degit rajkaria/foundry/examples/inference-quickstart my-app
```

Docs: https://foundryprotocol.xyz/docs
