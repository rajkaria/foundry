# `@foundryprotocol/sdk`

The Foundry SDK — pool data, compute, and capital → co-train an AI model on 0G → own a verifiable, revenue-generating share. End-to-end on 0G Aristotle mainnet.

```bash
npm install @foundryprotocol/sdk viem
# or
pnpm add @foundryprotocol/sdk viem
```

Optional peer deps (only needed for write paths that touch 0G Storage):

```bash
pnpm add @0gfoundation/0g-storage-ts-sdk ethers
```

## Three-line inference

```ts
import { Foundry } from "@foundryprotocol/sdk";

const foundry = new Foundry({ contracts: "aristotle" });
const { output, receipt } = await foundry.inference.run("ingot:0x8e2…f4a/1", {
  input: "Translate to Konkani: hello",
});
console.log(output, receipt.inferenceTxHash, receipt.revenueTxHash);
```

Revenue routes back to the Ingot's co-owners on-chain automatically. Smiths pull their share whenever they like:

```ts
const claimable = await foundry.revenue.claimable(tokenId, holderAddr);
await foundry.revenue.claim(tokenId);
```

## Full lifecycle (server-side)

```ts
import { Foundry, createWalletClient, http } from "@foundryprotocol/sdk";
import { privateKeyToAccount } from "viem/accounts";
import { Wallet, JsonRpcProvider } from "ethers";

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
const walletClient = createWalletClient({ account, transport: http(process.env.RPC_URL) });
const foundry = new Foundry({ contracts: "aristotle", walletClient });

// 1. Upload a dataset to 0G Storage.
const ethersSigner = new Wallet(process.env.PRIVATE_KEY!, new JsonRpcProvider(process.env.RPC_URL));
const { rootHash } = await foundry.storage.uploadJson(
  { kind: "dataset", rows: [/* ... */] },
  { signer: ethersSigner }
);

// 2. Create a Forge.
const { forgeId } = await foundry.forge.create({
  modelSpec: rootHash,
  evalSpec: rootHash,
  evalCoordinator: "0x…",                              // your registered coordinator
  contributionWindowEnds: BigInt(Math.floor(Date.now() / 1000) + 86_400),
});

// 3. Contribute data / compute / capital.
await foundry.forge.contributeData(forgeId!, rootHash);
await foundry.forge.contributeCompute(forgeId!, "0.5");  // 0.5 OG
await foundry.forge.fundForge(forgeId!, "1");            // 1 OG

// 4. (off-chain) eval coordinator runs attribution, calls submitEvalResult
// 5. Anyone calls mintOwnership() — Ingot mints with proportional shares.
// 6. Creator sets weights + lineage → Ingot goes Live.

await foundry.forge.mintOwnership(forgeId!);
await foundry.forge.setWeightsAndGoLive(forgeId!, weightsRoot);

// 7. Inference + revenue (closes the loop).
const { output } = await foundry.inference.run(`ingot:${ingotAddr}/${tokenId}`, { input: "Hi" });
await foundry.revenue.claim(tokenId);
```

## Modules

| Import                                      | What it does                                                                                                                |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `Foundry`                                   | One client, all surfaces — forge, ingot, contribution, inference, revenue, storage, da, registry, attestation, lineage      |
| `@foundryprotocol/sdk/storage`              | 0G Storage upload/download with Merkle roots (`@0gfoundation/0g-storage-ts-sdk` under the hood)                             |
| `@foundryprotocol/sdk/da`                   | 0G DA receipt publishing + canonical-JSON digest                                                                            |
| `@foundryprotocol/sdk/attestation`          | TEE envelope sign/verify (ECDSA over canonical-JSON keccak256)                                                              |
| `@foundryprotocol/sdk/inference`            | OpenAI-compatible inference client (used by `Foundry.inference.run`)                                                        |
| `@foundryprotocol/sdk/abis`                 | viem-typed const ABIs for every Foundry contract                                                                            |
| `@foundryprotocol/sdk/adapters/vercel-ai`   | Vercel AI SDK `LanguageModelV2` adapter                                                                                     |
| `@foundryprotocol/sdk/adapters/langchain`   | LangChain `LLM` adapter                                                                                                     |

## Adapters

### Vercel AI SDK

```ts
import { foundry } from "@foundryprotocol/sdk/adapters/vercel-ai";
import { generateText } from "ai";

const model = foundry("ingot:0x8e2…f4a/1");
const { text } = await generateText({ model, prompt: "Hello" });
```

### LangChain

```ts
import { FoundryLLM } from "@foundryprotocol/sdk/adapters/langchain";

const llm = new FoundryLLM({ ingotId: "ingot:0x8e2…f4a/1" });
const out = await llm.invoke("Hello");
```

### OpenAI-compatible HTTP

```bash
curl https://api.foundryprotocol.xyz/v1/chat/completions \
  -H "content-type: application/json" \
  -H "x-foundry-ingot-id: 0x8e2…f4a/1" \
  -d '{"messages":[{"role":"user","content":"Hi"}]}'
```

## TEE attestation envelopes

Eval coordinators sign attribution receipts that anchor on-chain via `Forge.submitEvalResult` and stay independently verifiable on 0G DA.

```ts
import { signEnvelope, verifyEnvelope } from "@foundryprotocol/sdk/attestation";

const signed = await signEnvelope(envelope, coordinatorPrivateKey);
const signer = await verifyEnvelope(signed, registeredCoordinatorAddress);
```

## Contracts

The SDK ships viem-typed ABIs and the current deployment addresses for:

- `FORGEToken`
- `ContributionRegistry`
- `Ingot`
- `RevenueSplitter`
- `ForgeFactory`
- `IngotRegistry` (provider/model mapping for inference routing)

```ts
import { deployments, forgeAbi } from "@foundryprotocol/sdk";
console.log(deployments.aristotle.ForgeFactory);
```

## Networks

| Name        | Chain ID  | RPC                              | Storage indexer                            |
| ----------- | --------- | -------------------------------- | ------------------------------------------ |
| `aristotle` | 16661     | `https://evmrpc.0g.ai`           | `https://indexer-storage.0g.network`       |
| `galileo`   | 16601     | `https://evmrpc-testnet.0g.ai`   | `https://indexer-storage-testnet.0g.ai`    |

## License

MIT.
