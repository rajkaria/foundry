# @0gkit/chain

Neutral 0G chain helpers built on `@0gkit/core` + `viem`: `explorerUrl`,
`balance`, `waitForReceipt`, and a testnet `faucet`.

## Install

```bash
npm install @0gkit/chain @0gkit/core viem
```

## Use

```ts
import { createClient } from "@0gkit/core";
import { balance, waitForReceipt } from "@0gkit/chain";

const client = createClient({ network: "aristotle" });
const wei = await balance(client, "0xYourAddress");
const receipt = await waitForReceipt(client, "0xTxHash");
console.log(receipt.explorerUrl); // present iff the network has a verified explorer
```

## License

MIT.
