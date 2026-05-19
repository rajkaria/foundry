// foundry-revenue-split — read claimable revenue for an Ingot you co-own and
// claim it via the RevenueSplitter.
//
// FOUNDRY (revenue) RECIPE. Opts you into the Foundry revenue layer. For the
// neutral path see ../inference-quickstart.
import "dotenv/config";
import { Foundry, createWalletClient, http, type Hex } from "@foundryprotocol/sdk";
import { privateKeyToAccount } from "viem/accounts";

const network =
  (process.env.FOUNDRY_NETWORK as "aristotle" | "galileo" | "local") ?? "galileo";
const rpcUrl = process.env.RPC_URL ?? "https://evmrpc-testnet.0g.ai";
const tokenId = BigInt(process.env.INGOT_TOKEN_ID ?? "1");
const pk = process.env.PRIVATE_KEY as Hex | undefined;
if (!pk) throw new Error("set PRIVATE_KEY in .env (the co-owner wallet)");

const account = privateKeyToAccount(pk);
const walletClient = createWalletClient({ account, transport: http(rpcUrl) });
const foundry = new Foundry({ contracts: network, rpcUrl, walletClient });

const claimable = await foundry.revenue.claimable(tokenId, account.address);
console.log("claimable:", claimable, "wei");

if (claimable > 0n) {
  const { txHash } = await foundry.revenue.claim(tokenId);
  console.log("claimed → tx:", txHash);
} else {
  console.log("nothing to claim yet — run some inference on this Ingot first.");
}
