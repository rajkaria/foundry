# create-foundry-forge

Scaffold a starter [Foundry Protocol](https://foundryprotocol.xyz) project.

```bash
pnpm create foundry-forge my-forge
# or
npm create foundry-forge@latest my-forge
# or
yarn create foundry-forge my-forge
```

You'll be asked:

- **Network** — Aristotle mainnet, Galileo testnet, or local Anvil
- **Template** — inference-only, or the full Forge lifecycle (storage upload → Forge create → contribute → mint → inference → revenue)

The output is a minimal TypeScript project with `@foundryprotocol/sdk` pre-wired, a `.env.example`, and a runnable `index.ts`.

## Without create

Skip the scaffolder; install the SDK directly:

```bash
npm install @foundryprotocol/sdk viem
```

```ts
import { Foundry } from "@foundryprotocol/sdk";

const foundry = new Foundry({ contracts: "aristotle" });
const { output } = await foundry.inference.run("ingot:0x…/1", { input: "Hi" });
```

## License

MIT.
