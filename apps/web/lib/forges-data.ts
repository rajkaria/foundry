/**
 * Forge data fetchers — read directly from chain via viem.
 *
 * No indexer required for the basic listings. Heavy aggregations (totals,
 * per-smith rollups) live in the standalone indexer package, but these
 * server-side reads cover every page the landing surface needs.
 *
 * All fetchers return `[]` / `null` when contracts aren't deployed yet.
 */

import { parseAbi, type Address, type Hex } from "viem";
import { getChain } from "./chain";

export type ForgeState = "OPEN" | "EVALUATING" | "MINTING" | "TRAINING" | "LIVE";
const STATES: ForgeState[] = ["OPEN", "EVALUATING", "MINTING", "TRAINING", "LIVE"];

export interface ForgeSummary {
  address: Address;
  creator: Address;
  evalCoordinator: Address;
  modelSpec: Hex;
  evalSpec: Hex;
  contributionWindowEnds: number;
  createdBlock: bigint;
  state: ForgeState;
  contributionsCount: number;
  tokenId: bigint;
}

export interface ContributionRow {
  smith: Address;
  type: "data" | "compute" | "capital";
  storageRoot: Hex;
  amount: bigint;
  timestamp: number;
  txHash: Hex;
}

const FORGE_FACTORY_ABI = parseAbi([
  "event ForgeCreated(address indexed forge, address indexed creator, bytes32 modelSpec, bytes32 evalSpec, address evalCoordinator, uint64 contributionWindowEnds)",
  "function count() view returns (uint256)",
  "function allForges(uint256) view returns (address)",
]);

const FORGE_ABI = parseAbi([
  "function state() view returns (uint8)",
  "function tokenId() view returns (uint256)",
  "function contributionsCount() view returns (uint256)",
]);

const CONTRIB_ABI = parseAbi([
  "event ContributionLogged(uint256 indexed id, address indexed smith, address indexed forge, uint8 ctype, bytes32 storageRoot, uint128 amount, uint64 timestamp)",
]);

const CTYPE: ContributionRow["type"][] = ["data", "compute", "capital"];

/** All Forges ever created, newest first. */
export async function listForges(): Promise<ForgeSummary[]> {
  const ctx = getChain();
  if (!ctx.isLive) return [];

  const logs = await ctx.client.getLogs({
    address: ctx.deployment.ForgeFactory,
    event: FORGE_FACTORY_ABI[0],
    fromBlock: 0n,
    toBlock: "latest",
  });

  const summaries = await Promise.all(
    logs.map(async (l) => {
      const forgeAddr = l.args.forge as Address;
      const [state, tokenId, contribsCount] = await Promise.all([
        readState(forgeAddr).catch(() => 0),
        readTokenId(forgeAddr).catch(() => 0n),
        readContribCount(forgeAddr).catch(() => 0n),
      ]);
      const f: ForgeSummary = {
        address: forgeAddr,
        creator: l.args.creator as Address,
        evalCoordinator: l.args.evalCoordinator as Address,
        modelSpec: l.args.modelSpec as Hex,
        evalSpec: l.args.evalSpec as Hex,
        contributionWindowEnds: Number(l.args.contributionWindowEnds ?? 0n),
        createdBlock: l.blockNumber ?? 0n,
        state: STATES[state] ?? "OPEN",
        contributionsCount: Number(contribsCount),
        tokenId,
      };
      return f;
    })
  );

  return summaries.sort((a, b) => Number(b.createdBlock - a.createdBlock));
}

export async function getForge(address: Address): Promise<ForgeSummary | null> {
  const all = await listForges();
  return all.find((f) => f.address.toLowerCase() === address.toLowerCase()) ?? null;
}

/** All contributions logged into a specific Forge. */
export async function listContributions(forge: Address): Promise<ContributionRow[]> {
  const ctx = getChain();
  if (!ctx.isLive) return [];

  const logs = await ctx.client.getLogs({
    address: ctx.deployment.ContributionRegistry,
    event: CONTRIB_ABI[0],
    args: { forge },
    fromBlock: 0n,
    toBlock: "latest",
  });

  return logs
    .map<ContributionRow>((l) => ({
      smith: l.args.smith as Address,
      type: CTYPE[Number(l.args.ctype ?? 0)] ?? "data",
      storageRoot: l.args.storageRoot as Hex,
      amount: BigInt(l.args.amount ?? 0n),
      timestamp: Number(l.args.timestamp ?? 0n),
      txHash: l.transactionHash as Hex,
    }))
    .sort((a, b) => b.timestamp - a.timestamp);
}

async function readState(addr: Address): Promise<number> {
  const result = await getChain().client.readContract({
    address: addr,
    abi: FORGE_ABI,
    functionName: "state",
  });
  return Number(result);
}

async function readTokenId(addr: Address): Promise<bigint> {
  return (await getChain().client.readContract({
    address: addr,
    abi: FORGE_ABI,
    functionName: "tokenId",
  })) as bigint;
}

async function readContribCount(addr: Address): Promise<bigint> {
  return (await getChain().client.readContract({
    address: addr,
    abi: FORGE_ABI,
    functionName: "contributionsCount",
  })) as bigint;
}
