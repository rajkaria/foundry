export interface Deployment {
  FORGEToken: `0x${string}`;
  ContributionRegistry: `0x${string}`;
  Ingot: `0x${string}`;
  RevenueSplitter: `0x${string}`;
  ForgeFactory: `0x${string}`;
}

// Populated by Sprint 1 mainnet deploy. The zero values are sentinels; the
// SDK throws clearly if used before deployments land.
export const aristotle: Deployment = {
  FORGEToken: "0x0000000000000000000000000000000000000000",
  ContributionRegistry: "0x0000000000000000000000000000000000000000",
  Ingot: "0x0000000000000000000000000000000000000000",
  RevenueSplitter: "0x0000000000000000000000000000000000000000",
  ForgeFactory: "0x0000000000000000000000000000000000000000",
};

export const deployments = { aristotle } as const;

export function getDeployment(network: keyof typeof deployments): Deployment {
  const d = deployments[network];
  if (d.ForgeFactory === "0x0000000000000000000000000000000000000000") {
    throw new Error(
      `[foundry-sdk] No contract addresses for '${network}' yet. ` +
        `Mainnet deploy lands Sprint 1 (Tue May 19) — see docs/04-sprint-plan.md.`
    );
  }
  return d;
}
