/**
 * Aggregate counts for the Forge in Public dashboard.
 *
 * Reads logs once per request. For higher-traffic deployments the
 * standalone indexer at packages/indexer streams these into memory.
 */

import { parseAbi, formatEther } from "viem";
import { getChain } from "./chain";

export interface ProtocolStats {
  forges: number;
  ingots: number;
  contributions: number;
  externalSmiths: number;
  totalRevenueOG: number;
  totalClaimedOG: number;
  lastBlock: bigint;
  isLive: boolean;
}

const ABI = parseAbi([
  "event ForgeCreated(address indexed forge, address indexed creator, bytes32 modelSpec, bytes32 evalSpec, address evalCoordinator, uint64 contributionWindowEnds)",
  "event IngotMinted(uint256 indexed tokenId, address indexed forge)",
  "event ContributionLogged(uint256 indexed id, address indexed smith, address indexed forge, uint8 ctype, bytes32 storageRoot, uint128 amount, uint64 timestamp)",
  "event RevenueReceived(uint256 indexed tokenId, address indexed payer, uint256 amount, uint256 fee)",
  "event RevenueClaimed(uint256 indexed tokenId, address indexed holder, uint256 amount)",
]);

export async function getStats(): Promise<ProtocolStats> {
  const ctx = getChain();
  if (!ctx.isLive) {
    return {
      forges: 0,
      ingots: 0,
      contributions: 0,
      externalSmiths: 0,
      totalRevenueOG: 0,
      totalClaimedOG: 0,
      lastBlock: 0n,
      isLive: false,
    };
  }

  const [forges, ingots, contribs, received, claimed, lastBlock] = await Promise.all([
    ctx.client.getLogs({
      address: ctx.deployment.ForgeFactory,
      event: ABI[0],
      fromBlock: 0n,
      toBlock: "latest",
    }),
    ctx.client.getLogs({
      address: ctx.deployment.Ingot,
      event: ABI[1],
      fromBlock: 0n,
      toBlock: "latest",
    }),
    ctx.client.getLogs({
      address: ctx.deployment.ContributionRegistry,
      event: ABI[2],
      fromBlock: 0n,
      toBlock: "latest",
    }),
    ctx.client.getLogs({
      address: ctx.deployment.RevenueSplitter,
      event: ABI[3],
      fromBlock: 0n,
      toBlock: "latest",
    }),
    ctx.client.getLogs({
      address: ctx.deployment.RevenueSplitter,
      event: ABI[4],
      fromBlock: 0n,
      toBlock: "latest",
    }),
    ctx.client.getBlockNumber(),
  ]);

  const smiths = new Set<string>();
  for (const l of contribs) {
    if (l.args.smith) smiths.add(l.args.smith.toLowerCase());
  }

  let totalReceived = 0n;
  for (const l of received) totalReceived += BigInt(l.args.amount ?? 0n);
  let totalClaimed = 0n;
  for (const l of claimed) totalClaimed += BigInt(l.args.amount ?? 0n);

  return {
    forges: forges.length,
    ingots: ingots.length,
    contributions: contribs.length,
    externalSmiths: smiths.size,
    totalRevenueOG: Number(formatEther(totalReceived)),
    totalClaimedOG: Number(formatEther(totalClaimed)),
    lastBlock,
    isLive: true,
  };
}
