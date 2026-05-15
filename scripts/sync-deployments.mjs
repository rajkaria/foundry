#!/usr/bin/env node
/**
 * Sync contract deployment addresses across the monorepo.
 *
 * Reads contracts/deployments/<network>.json and writes the addresses into
 * packages/sdk/src/deployments.ts between the SYNCED ADDRESSES markers.
 *
 * Usage:
 *   node scripts/sync-deployments.mjs            # sync all networks
 *   node scripts/sync-deployments.mjs galileo    # sync one network
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

const NETWORKS = ["aristotle", "galileo", "local"];
const ZERO = "0x0000000000000000000000000000000000000000";
const KEYS = [
  "FORGEToken",
  "ContributionRegistry",
  "Ingot",
  "RevenueSplitter",
  "ForgeFactory",
];

const arg = process.argv[2];
const networks = arg ? [arg] : NETWORKS;

function loadDeployment(network) {
  const path = resolve(repoRoot, `contracts/deployments/${network}.json`);
  if (!existsSync(path)) {
    return Object.fromEntries(KEYS.map((k) => [k, ZERO]));
  }
  const raw = JSON.parse(readFileSync(path, "utf-8"));
  const out = {};
  for (const k of KEYS) {
    out[k] = raw[k] ?? ZERO;
  }
  return out;
}

function renderBlock(network, deployment) {
  const lines = [`export const ${network}: Deployment = {`];
  for (const k of KEYS) {
    const value = deployment[k] === ZERO ? "ZERO_ADDRESS" : `"${deployment[k]}"`;
    lines.push(`  ${k}: ${value},`);
  }
  lines.push("};");
  return lines.join("\n");
}

const sdkPath = resolve(repoRoot, "packages/sdk/src/deployments.ts");
let src = readFileSync(sdkPath, "utf-8");

const START = "// ─── SYNCED ADDRESSES — DO NOT EDIT BY HAND ─────────────────────────────";
const END = "// ─── /SYNCED ADDRESSES ──────────────────────────────────────────────────";

const startIdx = src.indexOf(START);
const endIdx = src.indexOf(END);
if (startIdx < 0 || endIdx < 0) {
  console.error("sync-deployments: markers not found in deployments.ts");
  process.exit(1);
}

const allNetworks = NETWORKS.map((n) => ({
  n,
  d: networks.includes(n) ? loadDeployment(n) : null,
}));

// Preserve untouched networks by re-reading current values from the file.
const current = src.slice(startIdx, endIdx);
function existingValue(network, key) {
  const re = new RegExp(`${network}:\\s*Deployment\\s*=\\s*\\{[^}]*${key}:\\s*([^,\\n]+)`);
  const m = current.match(re);
  return m?.[1]?.trim();
}

const blocks = allNetworks
  .map(({ n, d }) => {
    if (d) return renderBlock(n, d);
    // unchanged: reconstruct from the current file's values
    const out = {};
    for (const k of KEYS) {
      const v = existingValue(n, k);
      out[k] = v && v !== "ZERO_ADDRESS" ? v.replace(/['"]/g, "") : ZERO;
    }
    return renderBlock(n, out);
  })
  .join("\n\n");

const newSyncBlock = `${START}\n// scripts/sync-deployments.mjs writes between these markers.\n${blocks}\n${END}`;

src = src.slice(0, startIdx) + newSyncBlock + src.slice(endIdx + END.length);
writeFileSync(sdkPath, src);

console.log(`sync-deployments: wrote ${networks.join(", ")} → packages/sdk/src/deployments.ts`);
