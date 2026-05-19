// foundry-own-a-model — upload data → create a Forge → contribute → own a
// share of the resulting Ingot.
//
// FOUNDRY (ownership) RECIPE. This opts you into the Foundry ownership layer.
// For the neutral path, see ../storage-roundtrip and ../inference-quickstart.
import "dotenv/config";
import { Foundry } from "@foundryprotocol/sdk";
import { Wallet, JsonRpcProvider } from "ethers";

const network =
  (process.env.FOUNDRY_NETWORK as "aristotle" | "galileo" | "local") ?? "galileo";
const rpcUrl = process.env.RPC_URL ?? "https://evmrpc-testnet.0g.ai";
const pk = process.env.PRIVATE_KEY;
if (!pk) throw new Error("set PRIVATE_KEY in .env (funded Galileo key)");

const foundry = new Foundry({ contracts: network, rpcUrl });
const signer = new Wallet(pk, new JsonRpcProvider(rpcUrl));
const me = signer.address as `0x${string}`;

// 1) Upload a dataset to 0G Storage.
const { rootHash } = await foundry.storage.uploadJson(
  { dataset: "demo", rows: ["a", "b", "c"] },
  { signer }
);
console.log("uploaded → root:", rootHash);

// 2) Create a Forge around it.
const { forgeId } = await foundry.forge.create({
  modelSpec: rootHash,
  evalSpec: rootHash,
  evalCoordinator: me,
  contributionWindowEnds: BigInt(Math.floor(Date.now() / 1000) + 600),
});
console.log("forge:", forgeId);

// 3) Contribute the data — this is your on-chain ownership claim.
if (forgeId) {
  const { txHash } = await foundry.forge.contributeData(forgeId, rootHash);
  console.log("contribution tx:", txHash, "→ you now hold a share");
}
