/**
 * Smith aggregations — derived from ContributionLogged + RevenueClaimed
 * events on chain. No indexer needed; we read logs server-side.
 */

import { parseAbi, formatEther, type Address, type Hex } from "viem";
import { getChain } from "./chain";

export interface SmithContribution {
  forge: Address;
  type: "data" | "compute" | "capital";
  amount: bigint;
  timestamp: number;
  txHash: Hex;
}

export interface SmithIngotShare {
  tokenId: bigint;
  shareBps: number;
  claimableOG: number;
}

export interface SmithProfile {
  address: Address;
  contributions: SmithContribution[];
  totalContributed: bigint;
  shares: SmithIngotShare[];
  totalClaimableOG: number;
  totalClaimedOG: number;
  firstSeenBlock: bigint;
}

const CTYPE: SmithContribution["type"][] = ["data", "compute", "capital"];

const CONTRIB_ABI = parseAbi([
  "event ContributionLogged(uint256 indexed id, address indexed smith, address indexed forge, uint8 ctype, bytes32 storageRoot, uint128 amount, uint64 timestamp)",
]);

const REVENUE_ABI = parseAbi([
  "event RevenueClaimed(uint256 indexed tokenId, address indexed holder, uint256 amount)",
  "function claimable(uint256, address) view returns (uint256)",
]);

const INGOT_ABI = parseAbi([
  "event ShareMinted(uint256 indexed tokenId, address indexed holder, uint128 share)",
  "function shareOf(uint256, address) view returns (uint128)",
  "function sharesTotalIssued(uint256) view returns (uint128)",
]);

interface RawSmith {
  address: Address;
  contributions: SmithContribution[];
  totalContributed: bigint;
  shares: Map<bigint, { shareBps: number; claimableOG: number }>;
  totalClaimedOG: number;
  firstSeenBlock: bigint;
}

async function buildAll(): Promise<Map<string, RawSmith>> {
  const ctx = getChain();
  const smiths = new Map<string, RawSmith>();
  if (!ctx.isLive) return smiths;

  const [contribs, claims, allocs] = await Promise.all([
    ctx.client.getLogs({
      address: ctx.deployment.ContributionRegistry,
      event: CONTRIB_ABI[0],
      fromBlock: 0n,
      toBlock: "latest",
    }),
    ctx.client.getLogs({
      address: ctx.deployment.RevenueSplitter,
      event: REVENUE_ABI[0],
      fromBlock: 0n,
      toBlock: "latest",
    }),
    ctx.client.getLogs({
      address: ctx.deployment.Ingot,
      event: INGOT_ABI[0],
      fromBlock: 0n,
      toBlock: "latest",
    }),
  ]);

  function get(addr: Address): RawSmith {
    const key = addr.toLowerCase();
    let s = smiths.get(key);
    if (!s) {
      s = {
        address: addr,
        contributions: [],
        totalContributed: 0n,
        shares: new Map(),
        totalClaimedOG: 0,
        firstSeenBlock: 0n,
      };
      smiths.set(key, s);
    }
    return s;
  }

  for (const l of contribs) {
    if (!l.args.smith) continue;
    const s = get(l.args.smith);
    const amount = BigInt(l.args.amount ?? 0n);
    s.contributions.push({
      forge: l.args.forge as Address,
      type: CTYPE[Number(l.args.ctype ?? 0)] ?? "data",
      amount,
      timestamp: Number(l.args.timestamp ?? 0n),
      txHash: l.transactionHash as Hex,
    });
    s.totalContributed += amount;
    if (s.firstSeenBlock === 0n) s.firstSeenBlock = l.blockNumber ?? 0n;
  }

  for (const l of claims) {
    if (!l.args.holder) continue;
    const s = get(l.args.holder);
    s.totalClaimedOG += Number(formatEther(BigInt(l.args.amount ?? 0n)));
  }

  for (const l of allocs) {
    if (!l.args.holder || l.args.tokenId === undefined) continue;
    const s = get(l.args.holder);
    const total = await readTotalIssued(BigInt(l.args.tokenId)).catch(() => 0n);
    const shareUnits = BigInt(l.args.share ?? 0n);
    const shareBps = total > 0n ? Number((shareUnits * 10_000n) / total) : 0;
    const claimableWei = await readClaimable(
      BigInt(l.args.tokenId),
      l.args.holder as Address
    ).catch(() => 0n);
    s.shares.set(BigInt(l.args.tokenId), {
      shareBps,
      claimableOG: Number(formatEther(claimableWei)),
    });
  }

  return smiths;
}

async function readClaimable(tokenId: bigint, holder: Address): Promise<bigint> {
  const ctx = getChain();
  return (await ctx.client.readContract({
    address: ctx.deployment.RevenueSplitter,
    abi: REVENUE_ABI,
    functionName: "claimable",
    args: [tokenId, holder],
  })) as bigint;
}

async function readTotalIssued(tokenId: bigint): Promise<bigint> {
  const ctx = getChain();
  return (await ctx.client.readContract({
    address: ctx.deployment.Ingot,
    abi: INGOT_ABI,
    functionName: "sharesTotalIssued",
    args: [tokenId],
  })) as bigint;
}

function shape(raw: RawSmith): SmithProfile {
  const shares: SmithIngotShare[] = [];
  let totalClaimableOG = 0;
  for (const [tokenId, { shareBps, claimableOG }] of raw.shares) {
    shares.push({ tokenId, shareBps, claimableOG });
    totalClaimableOG += claimableOG;
  }
  return {
    address: raw.address,
    contributions: raw.contributions.sort((a, b) => b.timestamp - a.timestamp),
    totalContributed: raw.totalContributed,
    shares: shares.sort((a, b) => b.shareBps - a.shareBps),
    totalClaimableOG,
    totalClaimedOG: raw.totalClaimedOG,
    firstSeenBlock: raw.firstSeenBlock,
  };
}

export async function listSmiths(): Promise<SmithProfile[]> {
  const all = await buildAll();
  return Array.from(all.values())
    .map(shape)
    .sort((a, b) => b.shares.length - a.shares.length);
}

export async function getSmith(address: string): Promise<SmithProfile | null> {
  const all = await buildAll();
  const raw = all.get(address.toLowerCase());
  return raw ? shape(raw) : null;
}
