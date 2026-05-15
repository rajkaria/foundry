#!/usr/bin/env node
/**
 * Mainnet smoke test — read-only health check.
 *
 * Assertions (all of which are cheap chain reads):
 *   1. Every Foundry contract has bytecode at its deployed address.
 *   2. ForgeFactory.count() succeeds and is a non-negative number.
 *   3. Ingot.SHARE_TOTAL() === 1_000_000n (constant invariant).
 *   4. RevenueSplitter.feeBps() <= 1000 (sanity bound).
 *
 * Exit non-zero if any check fails. Designed to run in CI immediately
 * after a deploy to catch a botched address sync before users hit it.
 *
 * Env:
 *   RPC_ARISTOTLE      RPC URL (required)
 *   FOUNDRY_NETWORK    default 'aristotle'
 */

// Resolve viem + the SDK via the SDK's own node_modules — the script is
// invoked from the repo root but its dependency chain lives under packages/sdk.
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const requireFromSdk = createRequire(
  resolve(__dirname, "..", "packages", "sdk", "package.json")
);
const viemPath = requireFromSdk.resolve("viem");
const sdkPath = resolve(__dirname, "..", "packages", "sdk", "dist", "index.js");

const { createPublicClient, http } = await import(viemPath);
const {
  aristotle,
  galileo,
  deployments,
  forgeFactoryAbi,
  ingotAbi,
  revenueSplitterAbi,
  isDeployed,
} = await import(sdkPath);

const rpc = process.env.RPC_ARISTOTLE ?? process.env.RPC_GALILEO;
if (!rpc) {
  console.error("RPC_ARISTOTLE (or RPC_GALILEO) must be set");
  process.exit(1);
}

const network = (process.env.FOUNDRY_NETWORK ?? "aristotle").toLowerCase();
const chain = network === "galileo" ? galileo : aristotle;
const deployment = deployments[network];

if (!deployment || !isDeployed(deployment)) {
  console.log(`[smoke] no deployment for '${network}' yet — skipping (zero-address sentinel)`);
  process.exit(0);
}

const client = createPublicClient({ chain, transport: http(rpc) });

let failures = 0;
function check(name, ok, detail = "") {
  if (ok) {
    console.log(`✓ ${name} ${detail}`);
  } else {
    console.error(`✗ ${name} ${detail}`);
    failures += 1;
  }
}

console.log(`[smoke] network=${network} rpc=${rpc}`);
console.log("[smoke] deployment:", deployment);

for (const [name, addr] of Object.entries(deployment)) {
  if (name.startsWith("_")) continue;
  const code = await client.getCode({ address: addr });
  check(`${name} has bytecode`, code !== undefined && code.length > 2, `(addr=${addr})`);
}

try {
  const count = await client.readContract({
    address: deployment.ForgeFactory,
    abi: forgeFactoryAbi,
    functionName: "count",
  });
  check("ForgeFactory.count()", count >= 0n, `(count=${count})`);
} catch (err) {
  check("ForgeFactory.count()", false, `(${err.message})`);
}

try {
  const total = await client.readContract({
    address: deployment.Ingot,
    abi: ingotAbi,
    functionName: "SHARE_TOTAL",
  });
  check("Ingot.SHARE_TOTAL === 1_000_000", total === 1_000_000n, `(got ${total})`);
} catch (err) {
  check("Ingot.SHARE_TOTAL", false, `(${err.message})`);
}

try {
  const bps = await client.readContract({
    address: deployment.RevenueSplitter,
    abi: revenueSplitterAbi,
    functionName: "feeBps",
  });
  check("RevenueSplitter.feeBps <= 1000", bps <= 1000, `(${bps})`);
} catch (err) {
  check("RevenueSplitter.feeBps", false, `(${err.message})`);
}

if (failures > 0) {
  console.error(`[smoke] ${failures} check(s) failed`);
  process.exit(1);
}
console.log("[smoke] OK");
