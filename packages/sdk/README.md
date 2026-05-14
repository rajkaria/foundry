# `@foundryprotocol/sdk`

The Foundry SDK — call any Foundry Ingot in three lines. Revenue routes back to the Ingot's co-owners on-chain, automatically.

```bash
pnpm add @foundryprotocol/sdk
```

## Quickstart

```ts
import { Foundry } from "@foundryprotocol/sdk";

const foundry = new Foundry({ contracts: "aristotle" });
const { output, receipt } = await foundry.inference.run("ingot:0x8e2…f4a", {
  input: "Translate to Konkani: hello",
});

console.log(output);
console.log("inference tx:", receipt.inferenceTxHash);
console.log("revenue tx:  ", receipt.revenueTxHash);
```

That's the three lines. The fourth optional line is `await foundry.revenue.claim(tokenId)` — Smiths pull their share whenever they like.

## Adapters

### Vercel AI SDK

```ts
import { generateText } from "ai";
import { foundry } from "@foundryprotocol/sdk/adapters/vercel-ai";

const { text } = await generateText({
  model: foundry("ingot:0x8e2…f4a"),
  prompt: "Translate to Konkani: hello",
});
```

### LangChain

```ts
import { FoundryChat } from "@foundryprotocol/sdk/adapters/langchain";
import { HumanMessage } from "@langchain/core/messages";

const llm = new FoundryChat({ ingotId: "ingot:0x8e2…f4a" });
const res = await llm.invoke([new HumanMessage("Translate to Konkani: hello")]);
```

### OpenAI-compatible HTTP

Any tool that speaks OpenAI's API can call a Foundry Ingot by pointing at the proxy:

```bash
curl https://api.foundryprotocol.xyz/v1/chat/completions \
  -H "content-type: application/json" \
  -H "x-foundry-ingot-id: 0x8e2…f4a" \
  -d '{"messages":[{"role":"user","content":"Translate to Konkani: hello"}]}'
```

Response shape is OpenAI-compatible plus a `foundry` block containing the inference + revenue tx hashes.

## API surface

| Namespace   | Methods                                                                       |
| ----------- | ----------------------------------------------------------------------------- |
| `forge`     | `create`, `contributeData`, `contributeCompute`, `fundForge`, `state`, `list` |
| `ingot`     | `meta`, `shareOf`                                                             |
| `inference` | `run`                                                                         |
| `revenue`   | `claimable`, `claim`                                                          |
| `lineage`   | `get`                                                                         |

Full reference: [foundryprotocol.xyz/docs/sdk-reference](https://foundryprotocol.xyz/docs/sdk-reference).

## Status

**`1.0.0-rc.1`** — public surface frozen for the v1.0 release. Breaking changes only via major version bump from here forward.

## License

MIT
