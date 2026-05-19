// storage-roundtrip — upload bytes to 0G Storage and download them back.
// Needs a funded Galileo key (the upload is an on-chain tx).
import { Storage } from "@foundryprotocol/0gkit-storage";

const privateKey = process.env.ZEROG_PRIVATE_KEY;
if (!privateKey) {
  console.error("set ZEROG_PRIVATE_KEY in .env (funds the upload tx).");
  console.error("get testnet funds: https://faucet.0g.ai");
  process.exit(1);
}

const storage = new Storage({ network: "galileo", privateKey });

const original = new TextEncoder().encode("hello from 0G Storage");
const { root, tx } = await storage.upload(original);
console.log("uploaded → root:", root);
console.log("tx:", tx);

const fetched = await storage.download(root);
const ok = new TextDecoder().decode(fetched) === "hello from 0G Storage";
console.log("roundtrip:", ok ? "✓ bytes match" : "✗ mismatch");

if (!ok) process.exit(1);
