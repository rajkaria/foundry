// inference-quickstart — run TEE inference through a 0G compute broker.
// Neutral recipe — @foundryprotocol/0gkit-compute only, no Foundry.
import { Compute } from "@foundryprotocol/0gkit-compute";

const brokerKey = process.env.ZEROG_BROKER_KEY;
if (!brokerKey) {
  console.error("set ZEROG_BROKER_KEY in .env (a funded 0G broker key).");
  process.exit(1);
}

const compute = new Compute({
  network: "galileo",
  brokerKey,
  provider: process.env.ZEROG_PROVIDER, // optional: pin a provider address
});

const { output, receipt } = await compute.inference({
  messages: [
    { role: "system", content: "You are concise." },
    { role: "user", content: "Say hello from 0G compute in one line." },
  ],
});

console.log("output: ", output);
console.log("receipt:", receipt);
