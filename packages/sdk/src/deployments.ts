/**
 * Deployment registry.
 *
 * Addresses are synced from `contracts/deployments/<network>.json` by
 * `scripts/sync-deployments.mjs`, run automatically by `make deploy-*`.
 *
 * Treat the zero-address as a sentinel meaning "not deployed yet". The SDK
 * throws a clear error if any caller tries to use an undeployed network.
 */

export interface Deployment {
  FORGEToken: `0x${string}`;
  ContributionRegistry: `0x${string}`;
  Ingot: `0x${string}`;
  RevenueSplitter: `0x${string}`;
  ForgeFactory: `0x${string}`;
  IngotRegistry: `0x${string}`;
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

// ─── SYNCED ADDRESSES — DO NOT EDIT BY HAND ─────────────────────────────
// scripts/sync-deployments.mjs writes between these markers.
export const aristotle: Deployment = {
  FORGEToken: "0xE716B0260f462b2A1789cB6cfCBd825736b920Ca",
  ContributionRegistry: "0x05235Ba0F2a77bcaB87371E4d797D6830ddC2d86",
  Ingot: "0x39B736f424754d05a0da186d89015b74d1DDe1d3",
  RevenueSplitter: "0xC58E0F32BD43e43153D3CA8ee8F25C8198789289",
  ForgeFactory: "0x636109264EBF6cFD18CC38bD43eDf9cCad7ae23D",
  IngotRegistry: "0xF8f3fAE648A8d7ee4Df0A7b10a0F759938aab7e1",
};

export const galileo: Deployment = {
  FORGEToken: ZERO_ADDRESS,
  ContributionRegistry: ZERO_ADDRESS,
  Ingot: ZERO_ADDRESS,
  RevenueSplitter: ZERO_ADDRESS,
  ForgeFactory: ZERO_ADDRESS,
  IngotRegistry: ZERO_ADDRESS,
};

export const local: Deployment = {
  FORGEToken: ZERO_ADDRESS,
  ContributionRegistry: ZERO_ADDRESS,
  Ingot: ZERO_ADDRESS,
  RevenueSplitter: ZERO_ADDRESS,
  ForgeFactory: ZERO_ADDRESS,
  IngotRegistry: ZERO_ADDRESS,
};
// ─── /SYNCED ADDRESSES ──────────────────────────────────────────────────

export const deployments = { aristotle, galileo, local } as const;
export type NetworkName = keyof typeof deployments;

export function isDeployed(d: Deployment): boolean {
  return d.ForgeFactory !== ZERO_ADDRESS;
}

export function getDeployment(network: NetworkName): Deployment {
  const d = deployments[network];
  if (!isDeployed(d)) {
    throw new Error(
      `[foundry-sdk] No contract addresses for '${network}' yet. ` +
        `Run \`make deploy-${network}\` from the repo root, or pass an explicit ` +
        `\`{ rpcUrl, contracts }\` config to the Foundry constructor.`
    );
  }
  return d;
}
