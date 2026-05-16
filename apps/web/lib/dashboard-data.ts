/**
 * Dashboard detail data — derived entirely from 0G Aristotle event logs.
 *
 * One pass over the protocol's five event types builds three views:
 *   - a unified, newest-first activity feed (every event has a tx hash)
 *   - per-forge rows (joined to the manifest registry for human names)
 *   - per-Ingot revenue rows (received vs. claimed)
 *
 * Everything here is explorer-verifiable; nothing is simulated.
 */

import { parseAbi, formatEther, type Address, type Hex } from "viem";
import { getChain } from "./chain";
import {
  getAllManifests,
  isContentVerified,
  type ForgeManifest,
} from "./forge-manifest";

const ABI = parseAbi([
  "event ForgeCreated(address indexed forge, address indexed creator, bytes32 modelSpec, bytes32 evalSpec, address evalCoordinator, uint64 contributionWindowEnds)",
  "event IngotMinted(uint256 indexed tokenId, address indexed forge)",
  "event ContributionLogged(uint256 indexed id, address indexed smith, address indexed forge, uint8 ctype, bytes32 storageRoot, uint128 amount, uint64 timestamp)",
  "event RevenueReceived(uint256 indexed tokenId, address indexed payer, uint256 amount, uint256 fee)",
  "event RevenueClaimed(uint256 indexed tokenId, address indexed holder, uint256 amount)",
]);

export type EventKind =
  | "ForgeCreated"
  | "IngotMinted"
  | "ContributionLogged"
  | "RevenueReceived"
  | "RevenueClaimed";

const CTYPE = ["data", "compute", "capital"] as const;

export interface FeedEvent {
  kind: EventKind;
  block: bigint;
  txHash: Hex;
  /** Primary actor address (creator / smith / payer / holder / forge). */
  actor: Address;
  /** One-line human summary. */
  summary: string;
  /** Forge address when the event is forge-scoped. */
  forge?: Address;
}

export interface ForgeRow {
  address: Address;
  title: string | null;
  task: string | null;
  creator: Address;
  contributions: number;
  createdBlock: bigint;
  tokenId: bigint | null;
}

export interface RevenueRow {
  tokenId: bigint;
  forge: Address | null;
  title: string | null;
  receivedOG: number;
  feeOG: number;
  claimedOG: number;
  payments: number;
}

export interface DashboardDetail {
  isLive: boolean;
  lastBlock: bigint;
  feed: FeedEvent[];
  forges: ForgeRow[];
  revenue: RevenueRow[];
  totals: { receivedOG: number; claimedOG: number; feeOG: number };
}

const EMPTY: DashboardDetail = {
  isLive: false,
  lastBlock: 0n,
  feed: [],
  forges: [],
  revenue: [],
  totals: { receivedOG: 0, claimedOG: 0, feeOG: 0 },
};

export async function getDashboardDetail(): Promise<DashboardDetail> {
  const ctx = getChain();
  if (!ctx.isLive) return EMPTY;

  const [created, minted, contribs, received, claimed, lastBlock, manifests] =
    await Promise.all([
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
      getAllManifests().catch(() => ({}) as Record<string, ForgeManifest>),
    ]);

  const short = (a?: string) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "—");

  // tokenId → forge (from IngotMinted), forge → manifest title.
  const tokenForge = new Map<string, Address>();
  for (const l of minted) {
    if (l.args.tokenId !== undefined && l.args.forge) {
      tokenForge.set(String(l.args.tokenId), l.args.forge as Address);
    }
  }
  const titleOf = (forge?: Address): string | null =>
    forge ? (manifests[forge.toLowerCase()]?.title ?? null) : null;
  const taskOf = (forge?: Address): string | null =>
    forge ? (manifests[forge.toLowerCase()]?.modelSpec.task ?? null) : null;

  const feed: FeedEvent[] = [];

  for (const l of created) {
    const forge = l.args.forge as Address;
    const t = titleOf(forge);
    feed.push({
      kind: "ForgeCreated",
      block: l.blockNumber ?? 0n,
      txHash: l.transactionHash as Hex,
      actor: l.args.creator as Address,
      forge,
      summary: `Forge created — ${t ?? short(forge)}`,
    });
  }
  for (const l of minted) {
    const forge = l.args.forge as Address;
    feed.push({
      kind: "IngotMinted",
      block: l.blockNumber ?? 0n,
      txHash: l.transactionHash as Hex,
      actor: forge,
      forge,
      summary: `Ingot #${l.args.tokenId} minted — ${titleOf(forge) ?? short(forge)}`,
    });
  }
  for (const l of contribs) {
    const forge = l.args.forge as Address;
    const kind = CTYPE[Number(l.args.ctype ?? 0)] ?? "data";
    feed.push({
      kind: "ContributionLogged",
      block: l.blockNumber ?? 0n,
      txHash: l.transactionHash as Hex,
      actor: l.args.smith as Address,
      forge,
      summary: `${kind} contribution by ${short(l.args.smith as string)} → ${
        titleOf(forge) ?? short(forge)
      }`,
    });
  }
  for (const l of received) {
    feed.push({
      kind: "RevenueReceived",
      block: l.blockNumber ?? 0n,
      txHash: l.transactionHash as Hex,
      actor: l.args.payer as Address,
      forge: tokenForge.get(String(l.args.tokenId)),
      summary: `Revenue ${formatEther(
        BigInt(l.args.amount ?? 0n)
      )} OG received → Ingot #${l.args.tokenId}`,
    });
  }
  for (const l of claimed) {
    feed.push({
      kind: "RevenueClaimed",
      block: l.blockNumber ?? 0n,
      txHash: l.transactionHash as Hex,
      actor: l.args.holder as Address,
      forge: tokenForge.get(String(l.args.tokenId)),
      summary: `${short(l.args.holder as string)} claimed ${formatEther(
        BigInt(l.args.amount ?? 0n)
      )} OG from Ingot #${l.args.tokenId}`,
    });
  }

  feed.sort((a, b) => Number(b.block - a.block));

  // Per-forge rows.
  const contribCount = new Map<string, number>();
  for (const l of contribs) {
    const f = (l.args.forge as string).toLowerCase();
    contribCount.set(f, (contribCount.get(f) ?? 0) + 1);
  }
  const forgeToken = new Map<string, bigint>();
  for (const l of minted) {
    if (l.args.forge && l.args.tokenId !== undefined) {
      forgeToken.set(
        (l.args.forge as string).toLowerCase(),
        BigInt(l.args.tokenId as bigint)
      );
    }
  }
  const forges: ForgeRow[] = created
    .map((l) => {
      const address = l.args.forge as Address;
      const key = address.toLowerCase();
      return {
        address,
        title: titleOf(address),
        task: taskOf(address),
        creator: l.args.creator as Address,
        contributions: contribCount.get(key) ?? 0,
        createdBlock: l.blockNumber ?? 0n,
        tokenId: forgeToken.get(key) ?? null,
      };
    })
    .sort((a, b) => Number(b.createdBlock - a.createdBlock));

  // Per-Ingot revenue.
  const rev = new Map<string, RevenueRow>();
  const ensure = (tokenId: bigint): RevenueRow => {
    const k = String(tokenId);
    let r = rev.get(k);
    if (!r) {
      const forge = tokenForge.get(k) ?? null;
      r = {
        tokenId,
        forge,
        title: titleOf(forge ?? undefined),
        receivedOG: 0,
        feeOG: 0,
        claimedOG: 0,
        payments: 0,
      };
      rev.set(k, r);
    }
    return r;
  };
  for (const l of received) {
    const r = ensure(BigInt(l.args.tokenId as bigint));
    r.receivedOG += Number(formatEther(BigInt(l.args.amount ?? 0n)));
    r.feeOG += Number(formatEther(BigInt(l.args.fee ?? 0n)));
    r.payments += 1;
  }
  for (const l of claimed) {
    const r = ensure(BigInt(l.args.tokenId as bigint));
    r.claimedOG += Number(formatEther(BigInt(l.args.amount ?? 0n)));
  }
  const revenue = [...rev.values()].sort((a, b) => b.receivedOG - a.receivedOG);
  const totals = revenue.reduce(
    (acc, r) => ({
      receivedOG: acc.receivedOG + r.receivedOG,
      claimedOG: acc.claimedOG + r.claimedOG,
      feeOG: acc.feeOG + r.feeOG,
    }),
    { receivedOG: 0, claimedOG: 0, feeOG: 0 }
  );

  return { isLive: true, lastBlock, feed, forges, revenue, totals };
}

/* ─── Forge ledger (proof view) ─────────────────────────────────────────── */

export interface LedgerTx {
  txHash: Hex;
  block: bigint;
}

export interface LedgerForge {
  address: Address;
  title: string | null;
  summary: string | null;
  task: string | null;
  verified: boolean;
  creator: Address;
  created: LedgerTx;
  contributions: { type: string; smith: Address; tx: LedgerTx }[];
  ingot: { tokenId: bigint; tx: LedgerTx } | null;
  revenue: { amountOG: number; payer: Address; tx: LedgerTx }[];
  claims: { holder: Address; amountOG: number; tx: LedgerTx }[];
}

export interface ForgeLedger {
  isLive: boolean;
  network: string;
  explorerBase: string;
  forges: LedgerForge[];
  txCount: number;
}

/**
 * Every on-chain interaction, grouped per Forge, each row carrying the tx
 * hash that proves it. This is the auditable receipt for the dashboard.
 */
export async function getForgeLedger(): Promise<ForgeLedger> {
  const ctx = getChain();
  if (!ctx.isLive) {
    return {
      isLive: false,
      network: ctx.network,
      explorerBase: ctx.explorerBase,
      forges: [],
      txCount: 0,
    };
  }

  const [created, minted, contribs, received, claimed, manifests] = await Promise.all([
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
    getAllManifests().catch(() => ({}) as Record<string, ForgeManifest>),
  ]);

  const tokenForge = new Map<string, Address>();
  for (const l of minted) {
    if (l.args.tokenId !== undefined && l.args.forge) {
      tokenForge.set(String(l.args.tokenId), l.args.forge as Address);
    }
  }

  let txCount = 0;
  const byForge = new Map<string, LedgerForge>();

  for (const l of created) {
    const address = l.args.forge as Address;
    const key = address.toLowerCase();
    const m = manifests[key];
    byForge.set(key, {
      address,
      title: m?.title ?? null,
      summary: m?.summary ?? null,
      task: m?.modelSpec.task ?? null,
      verified: m ? isContentVerified(m, l.args.modelSpec as Hex) : false,
      creator: l.args.creator as Address,
      created: { txHash: l.transactionHash as Hex, block: l.blockNumber ?? 0n },
      contributions: [],
      ingot: null,
      revenue: [],
      claims: [],
    });
    txCount += 1;
  }

  const get = (forge?: Address): LedgerForge | undefined =>
    forge ? byForge.get(forge.toLowerCase()) : undefined;

  for (const l of contribs) {
    const f = get(l.args.forge as Address);
    if (!f) continue;
    f.contributions.push({
      type: CTYPE[Number(l.args.ctype ?? 0)] ?? "data",
      smith: l.args.smith as Address,
      tx: { txHash: l.transactionHash as Hex, block: l.blockNumber ?? 0n },
    });
    txCount += 1;
  }
  for (const l of minted) {
    const f = get(l.args.forge as Address);
    if (!f) continue;
    f.ingot = {
      tokenId: BigInt(l.args.tokenId as bigint),
      tx: { txHash: l.transactionHash as Hex, block: l.blockNumber ?? 0n },
    };
    txCount += 1;
  }
  for (const l of received) {
    const f = get(tokenForge.get(String(l.args.tokenId)));
    if (!f) continue;
    f.revenue.push({
      amountOG: Number(formatEther(BigInt(l.args.amount ?? 0n))),
      payer: l.args.payer as Address,
      tx: { txHash: l.transactionHash as Hex, block: l.blockNumber ?? 0n },
    });
    txCount += 1;
  }
  for (const l of claimed) {
    const f = get(tokenForge.get(String(l.args.tokenId)));
    if (!f) continue;
    f.claims.push({
      holder: l.args.holder as Address,
      amountOG: Number(formatEther(BigInt(l.args.amount ?? 0n))),
      tx: { txHash: l.transactionHash as Hex, block: l.blockNumber ?? 0n },
    });
    txCount += 1;
  }

  const forges = [...byForge.values()].sort((a, b) =>
    Number(b.created.block - a.created.block)
  );
  return {
    isLive: true,
    network: ctx.network,
    explorerBase: ctx.explorerBase,
    forges,
    txCount,
  };
}
