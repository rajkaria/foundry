/**
 * Lineage: walks IngotMinted events + Ingot.meta() to build the family tree.
 */

import { parseAbi, type Address, type Hex } from "viem";
import { getChain } from "./chain";

export interface LineageEntry {
  tokenId: bigint;
  forge: Address;
  weightsRoot: Hex;
  lineageParent: Hex;
  mintedAt: number;
  weightsSet: boolean;
  contributors: number;
}

const INGOT_ABI = parseAbi([
  "event IngotMinted(uint256 indexed tokenId, address indexed forge)",
  "event ShareMinted(uint256 indexed tokenId, address indexed holder, uint128 share)",
  "function meta(uint256) view returns (bytes32 weightsRoot, bytes32 lineageParent, address forge, uint64 mintedAt, bool weightsSet)",
]);

export async function listIngots(): Promise<LineageEntry[]> {
  const ctx = getChain();
  if (!ctx.isLive) return [];

  const [minted, allocs] = await Promise.all([
    ctx.client.getLogs({
      address: ctx.deployment.Ingot,
      event: INGOT_ABI[0],
      fromBlock: 0n,
      toBlock: "latest",
    }),
    ctx.client.getLogs({
      address: ctx.deployment.Ingot,
      event: INGOT_ABI[1],
      fromBlock: 0n,
      toBlock: "latest",
    }),
  ]);

  // Count unique contributors per tokenId.
  const contributorsByToken = new Map<string, Set<string>>();
  for (const l of allocs) {
    if (l.args.tokenId === undefined || !l.args.holder) continue;
    const key = String(l.args.tokenId);
    if (!contributorsByToken.has(key)) contributorsByToken.set(key, new Set());
    contributorsByToken.get(key)!.add(l.args.holder.toLowerCase());
  }

  const entries = await Promise.all(
    minted.map(async (l) => {
      const tokenId = BigInt(l.args.tokenId ?? 0n);
      const meta = await ctx.client
        .readContract({
          address: ctx.deployment.Ingot,
          abi: INGOT_ABI,
          functionName: "meta",
          args: [tokenId],
        })
        .catch(() => null);
      const [weightsRoot, lineageParent, forge, mintedAt, weightsSet] = (meta ?? [
        "0x" + "0".repeat(64),
        "0x" + "0".repeat(64),
        l.args.forge,
        0n,
        false,
      ]) as [Hex, Hex, Address, bigint, boolean];
      const entry: LineageEntry = {
        tokenId,
        forge,
        weightsRoot,
        lineageParent,
        mintedAt: Number(mintedAt),
        weightsSet,
        contributors: contributorsByToken.get(String(tokenId))?.size ?? 0,
      };
      return entry;
    })
  );

  return entries.sort((a, b) => Number(a.tokenId - b.tokenId));
}
