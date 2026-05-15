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
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

// ─── SYNCED ADDRESSES — DO NOT EDIT BY HAND ─────────────────────────────
// scripts/sync-deployments.mjs writes between these markers.
export const aristotle: Deployment = {
  FORGEToken: ZERO_ADDRESS,
  ContributionRegistry: ZERO_ADDRESS,
  Ingot: ZERO_ADDRESS,
  RevenueSplitter: ZERO_ADDRESS,
  ForgeFactory: ZERO_ADDRESS,
};

export const galileo: Deployment = {
  FORGEToken: ZERO_ADDRESS,
  ContributionRegistry: ZERO_ADDRESS,
  Ingot: ZERO_ADDRESS,
  RevenueSplitter: ZERO_ADDRESS,
  ForgeFactory: ZERO_ADDRESS,
};

export const local: Deployment = {
  FORGEToken: ZERO_ADDRESS,
  ContributionRegistry: ZERO_ADDRESS,
  Ingot: ZERO_ADDRESS,
  RevenueSplitter: ZERO_ADDRESS,
  ForgeFactory: ZERO_ADDRESS,
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
