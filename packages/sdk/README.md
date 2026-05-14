# `@foundryprotocol/sdk`

The Foundry SDK — call any Foundry Ingot in three lines.

```bash
pnpm add @foundryprotocol/sdk
```

```ts
import { Foundry } from '@foundryprotocol/sdk';

const foundry = new Foundry({ contracts: 'aristotle' });
const { output } = await foundry.inference.run(
  'ingot:0x8e2…f4a',
  { input: 'Translate to Konkani: …' }
);
// revenue routes back to the Ingot's co-owners on-chain
```

## Adapters

```ts
import { foundry } from '@foundryprotocol/sdk/adapters/vercel-ai';
import { FoundryChat } from '@foundryprotocol/sdk/adapters/langchain';
```

Full reference: [foundryprotocol.xyz/docs/sdk-reference](https://foundryprotocol.xyz/docs/sdk-reference).

## Status

`0.0.0` scaffold — public surface frozen, implementation lands Sprint 1/2 (see [`docs/04-sprint-plan.md`](../../docs/04-sprint-plan.md)).
