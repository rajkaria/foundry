/**
 * Foundry indexer — watches 0G events, exposes typed REST reads.
 *
 * The web app reads chain state directly (see apps/web/lib/*-data.ts) for
 * simplicity; this indexer exists for higher-throughput consumers (the
 * /dashboard live-stream, third-party Foundry dApps) where on-demand
 * getLogs would be too slow.
 *
 * Env:
 *   RPC_URL                default per-network (FOUNDRY_NETWORK)
 *   FOUNDRY_NETWORK        aristotle | galileo | local (default: aristotle)
 *   INDEXER_PORT           default 4000
 *   DEPLOYMENT_FILE        defaults to contracts/deployments/<network>.json
 */

import {
  createPublicClient,
  http,
  parseAbiItem,
  formatEther,
  type Address,
  type Hex,
} from "viem";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

const PORT = Number(process.env.INDEXER_PORT ?? 4000);
const NETWORK = (process.env.FOUNDRY_NETWORK ?? "aristotle").toLowerCase();

const DEFAULT_RPC: Record<string, string> = {
  aristotle: "https://evmrpc.0g.ai",
  galileo: "https://evmrpc-testnet.0g.ai",
  local: "http://127.0.0.1:8545",
};
const RPC = process.env.RPC_URL ?? DEFAULT_RPC[NETWORK] ?? DEFAULT_RPC.aristotle;

const DEPLOY_PATH =
  process.env.DEPLOYMENT_FILE ??
  resolve(process.cwd(), `../../contracts/deployments/${NETWORK}.json`);

interface Deployment {
  ForgeFactory: Address;
  Ingot: Address;
  RevenueSplitter: Address;
  ContributionRegistry: Address;
}

// ─── Event definitions (must match contracts/src/*.sol) ─────────────────

const FORGE_CREATED = parseAbiItem(
  "event ForgeCreated(address indexed forge, address indexed creator, bytes32 modelSpec, bytes32 evalSpec, address evalCoordinator, uint64 contributionWindowEnds)"
);
const INGOT_MINTED = parseAbiItem(
  "event IngotMinted(uint256 indexed tokenId, address indexed forge)"
);
const SHARE_MINTED = parseAbiItem(
  "event ShareMinted(uint256 indexed tokenId, address indexed holder, uint128 share)"
);
const LINEAGE_LINKED = parseAbiItem(
  "event LineageLinked(uint256 indexed tokenId, bytes32 parent)"
);
const REVENUE_RECEIVED = parseAbiItem(
  "event RevenueReceived(uint256 indexed tokenId, address indexed payer, uint256 amount, uint256 fee)"
);
const REVENUE_CLAIMED = parseAbiItem(
  "event RevenueClaimed(uint256 indexed tokenId, address indexed holder, uint256 amount)"
);
const CONTRIBUTION_LOGGED = parseAbiItem(
  "event ContributionLogged(uint256 indexed id, address indexed smith, address indexed forge, uint8 ctype, bytes32 storageRoot, uint128 amount, uint64 timestamp)"
);

// ─── In-memory store ────────────────────────────────────────────────────

interface ForgeRow {
  address: Address;
  creator: Address;
  evalCoordinator: Address;
  modelSpec: Hex;
  evalSpec: Hex;
  contributionWindowEnds: number;
  createdBlock: bigint;
  contributionsCount: number;
}

interface IngotRow {
  tokenId: bigint;
  forge: Address;
  parent: Hex | null;
  mintedBlock: bigint;
  contributors: Set<string>;
}

interface ContribRow {
  id: bigint;
  smith: Address;
  forge: Address;
  type: "data" | "compute" | "capital";
  storageRoot: Hex;
  amount: bigint;
  timestamp: number;
  txHash: Hex;
  block: bigint;
}

interface ShareRow {
  tokenId: bigint;
  holder: Address;
  share: bigint;
  block: bigint;
}

interface RevenueRow {
  tokenId: bigint;
  payer?: Address;
  holder?: Address;
  amount: bigint;
  fee?: bigint;
  block: bigint;
  txHash: Hex;
}

const CTYPE: ContribRow["type"][] = ["data", "compute", "capital"];

const store = {
  forges: new Map<string, ForgeRow>(),
  ingots: new Map<string, IngotRow>(),
  contributions: [] as ContribRow[],
  shares: [] as ShareRow[],
  revenueReceived: [] as RevenueRow[],
  revenueClaimed: [] as RevenueRow[],
  smiths: new Set<string>(),
  lastBlock: 0n,
};

// ─── Bootstrap + watch ──────────────────────────────────────────────────

function loadDeployment(): Deployment | null {
  if (!existsSync(DEPLOY_PATH)) return null;
  const raw = readFileSync(DEPLOY_PATH, "utf-8");
  const obj = JSON.parse(raw) as Deployment & { ForgeFactory: Address };
  if (
    obj.ForgeFactory === "0x0000000000000000000000000000000000000000" ||
    !obj.ForgeFactory
  ) {
    return null;
  }
  return obj;
}

async function main() {
  console.log(`[indexer] network=${NETWORK} rpc=${RPC} port=${PORT}`);
  const deployment = loadDeployment();
  if (!deployment) {
    console.warn(
      `[indexer] no deployment at ${DEPLOY_PATH} — running idle (HTTP up, store empty)`
    );
    startHttp();
    return;
  }

  console.log(`[indexer] deployment: ${JSON.stringify(deployment, null, 2)}`);

  const client = createPublicClient({ transport: http(RPC) });
  store.lastBlock = await client.getBlockNumber();

  // ── Backfill from block 0 ──
  console.log("[indexer] backfilling logs from genesis…");
  const [
    forgeLogs,
    ingotLogs,
    lineageLogs,
    shareLogs,
    contribLogs,
    recvLogs,
    claimLogs,
  ] = await Promise.all([
    client.getLogs({
      address: deployment.ForgeFactory,
      event: FORGE_CREATED,
      fromBlock: 0n,
    }),
    client.getLogs({
      address: deployment.Ingot,
      event: INGOT_MINTED,
      fromBlock: 0n,
    }),
    client.getLogs({
      address: deployment.Ingot,
      event: LINEAGE_LINKED,
      fromBlock: 0n,
    }),
    client.getLogs({
      address: deployment.Ingot,
      event: SHARE_MINTED,
      fromBlock: 0n,
    }),
    client.getLogs({
      address: deployment.ContributionRegistry,
      event: CONTRIBUTION_LOGGED,
      fromBlock: 0n,
    }),
    client.getLogs({
      address: deployment.RevenueSplitter,
      event: REVENUE_RECEIVED,
      fromBlock: 0n,
    }),
    client.getLogs({
      address: deployment.RevenueSplitter,
      event: REVENUE_CLAIMED,
      fromBlock: 0n,
    }),
  ]);

  for (const l of forgeLogs) onForgeCreated(l);
  for (const l of ingotLogs) onIngotMinted(l);
  for (const l of lineageLogs) onLineageLinked(l);
  for (const l of shareLogs) onShareMinted(l);
  for (const l of contribLogs) onContributionLogged(l);
  for (const l of recvLogs) onRevenueReceived(l);
  for (const l of claimLogs) onRevenueClaimed(l);

  console.log(
    `[indexer] backfill done: ${store.forges.size} forges, ${store.ingots.size} ingots, ${store.contributions.length} contribs, ${store.smiths.size} smiths`
  );

  // ── Tail subscriptions ──
  client.watchEvent({
    address: deployment.ForgeFactory,
    event: FORGE_CREATED,
    onLogs: (logs) => logs.forEach(onForgeCreated),
  });
  client.watchEvent({
    address: deployment.Ingot,
    event: INGOT_MINTED,
    onLogs: (logs) => logs.forEach(onIngotMinted),
  });
  client.watchEvent({
    address: deployment.Ingot,
    event: LINEAGE_LINKED,
    onLogs: (logs) => logs.forEach(onLineageLinked),
  });
  client.watchEvent({
    address: deployment.Ingot,
    event: SHARE_MINTED,
    onLogs: (logs) => logs.forEach(onShareMinted),
  });
  client.watchEvent({
    address: deployment.ContributionRegistry,
    event: CONTRIBUTION_LOGGED,
    onLogs: (logs) => logs.forEach(onContributionLogged),
  });
  client.watchEvent({
    address: deployment.RevenueSplitter,
    event: REVENUE_RECEIVED,
    onLogs: (logs) => logs.forEach(onRevenueReceived),
  });
  client.watchEvent({
    address: deployment.RevenueSplitter,
    event: REVENUE_CLAIMED,
    onLogs: (logs) => logs.forEach(onRevenueClaimed),
  });

  startHttp();
}

// ─── Event handlers ─────────────────────────────────────────────────────

type Log<T> = { args: T; blockNumber?: bigint; transactionHash?: Hex };

function onForgeCreated(
  l: Log<{
    forge?: Address;
    creator?: Address;
    modelSpec?: Hex;
    evalSpec?: Hex;
    evalCoordinator?: Address;
    contributionWindowEnds?: bigint;
  }>
) {
  if (!l.args.forge) return;
  const row: ForgeRow = {
    address: l.args.forge,
    creator: l.args.creator ?? ("0x" as Address),
    evalCoordinator: l.args.evalCoordinator ?? ("0x" as Address),
    modelSpec: l.args.modelSpec ?? ("0x" as Hex),
    evalSpec: l.args.evalSpec ?? ("0x" as Hex),
    contributionWindowEnds: Number(l.args.contributionWindowEnds ?? 0n),
    createdBlock: l.blockNumber ?? 0n,
    contributionsCount: 0,
  };
  store.forges.set(row.address.toLowerCase(), row);
  bump(l.blockNumber);
}

function onIngotMinted(l: Log<{ tokenId?: bigint; forge?: Address }>) {
  if (l.args.tokenId === undefined || !l.args.forge) return;
  const id = String(l.args.tokenId);
  if (!store.ingots.has(id)) {
    store.ingots.set(id, {
      tokenId: BigInt(l.args.tokenId),
      forge: l.args.forge,
      parent: null,
      mintedBlock: l.blockNumber ?? 0n,
      contributors: new Set(),
    });
  }
  bump(l.blockNumber);
}

function onLineageLinked(l: Log<{ tokenId?: bigint; parent?: Hex }>) {
  if (l.args.tokenId === undefined || !l.args.parent) return;
  const id = String(l.args.tokenId);
  const ingot = store.ingots.get(id);
  if (ingot) ingot.parent = l.args.parent;
  bump(l.blockNumber);
}

function onShareMinted(l: Log<{ tokenId?: bigint; holder?: Address; share?: bigint }>) {
  if (l.args.tokenId === undefined || !l.args.holder) return;
  store.shares.push({
    tokenId: BigInt(l.args.tokenId),
    holder: l.args.holder,
    share: BigInt(l.args.share ?? 0n),
    block: l.blockNumber ?? 0n,
  });
  store.smiths.add(l.args.holder.toLowerCase());
  const ingot = store.ingots.get(String(l.args.tokenId));
  if (ingot) ingot.contributors.add(l.args.holder.toLowerCase());
  bump(l.blockNumber);
}

function onContributionLogged(
  l: Log<{
    id?: bigint;
    smith?: Address;
    forge?: Address;
    ctype?: number;
    storageRoot?: Hex;
    amount?: bigint;
    timestamp?: bigint;
  }>
) {
  if (l.args.id === undefined || !l.args.smith || !l.args.forge) return;
  const row: ContribRow = {
    id: BigInt(l.args.id),
    smith: l.args.smith,
    forge: l.args.forge,
    type: CTYPE[Number(l.args.ctype ?? 0)] ?? "data",
    storageRoot: l.args.storageRoot ?? ("0x" as Hex),
    amount: BigInt(l.args.amount ?? 0n),
    timestamp: Number(l.args.timestamp ?? 0n),
    txHash: l.transactionHash ?? ("0x" as Hex),
    block: l.blockNumber ?? 0n,
  };
  store.contributions.push(row);
  store.smiths.add(row.smith.toLowerCase());
  const forge = store.forges.get(row.forge.toLowerCase());
  if (forge) forge.contributionsCount += 1;
  bump(l.blockNumber);
}

function onRevenueReceived(
  l: Log<{ tokenId?: bigint; payer?: Address; amount?: bigint; fee?: bigint }>
) {
  if (l.args.tokenId === undefined) return;
  store.revenueReceived.push({
    tokenId: BigInt(l.args.tokenId),
    payer: l.args.payer,
    amount: BigInt(l.args.amount ?? 0n),
    fee: BigInt(l.args.fee ?? 0n),
    block: l.blockNumber ?? 0n,
    txHash: l.transactionHash ?? ("0x" as Hex),
  });
  bump(l.blockNumber);
}

function onRevenueClaimed(
  l: Log<{ tokenId?: bigint; holder?: Address; amount?: bigint }>
) {
  if (l.args.tokenId === undefined || !l.args.holder) return;
  store.revenueClaimed.push({
    tokenId: BigInt(l.args.tokenId),
    holder: l.args.holder,
    amount: BigInt(l.args.amount ?? 0n),
    block: l.blockNumber ?? 0n,
    txHash: l.transactionHash ?? ("0x" as Hex),
  });
  bump(l.blockNumber);
}

function bump(block?: bigint) {
  if (block && block > store.lastBlock) store.lastBlock = block;
}

// ─── REST API ───────────────────────────────────────────────────────────

function startHttp() {
  const server = createServer(handler);
  server.listen(PORT, () => {
    console.log(`[indexer] http://localhost:${PORT}`);
  });
}

function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("content-type", "application/json");

  const url = req.url ?? "/";

  if (url === "/" || url === "/health") {
    return ok(res, {
      ok: true,
      network: NETWORK,
      lastBlock: store.lastBlock.toString(),
    });
  }

  if (url === "/stats") {
    let totalReceived = 0n;
    for (const r of store.revenueReceived) totalReceived += r.amount;
    let totalClaimed = 0n;
    for (const r of store.revenueClaimed) totalClaimed += r.amount;
    return ok(res, {
      network: NETWORK,
      forges: store.forges.size,
      ingots: store.ingots.size,
      contributions: store.contributions.length,
      externalSmiths: store.smiths.size,
      totalRevenueOG: Number(formatEther(totalReceived)),
      totalClaimedOG: Number(formatEther(totalClaimed)),
      lastBlock: store.lastBlock.toString(),
    });
  }

  if (url === "/forges") {
    return ok(
      res,
      Array.from(store.forges.values())
        .sort((a, b) => Number(b.createdBlock - a.createdBlock))
        .map(forgeJson)
    );
  }

  const forgeMatch = url.match(/^\/forges\/(0x[a-fA-F0-9]{40})$/);
  if (forgeMatch) {
    const f = store.forges.get(forgeMatch[1].toLowerCase());
    if (!f) return notFound(res);
    const contribs = store.contributions
      .filter((c) => c.forge.toLowerCase() === forgeMatch[1].toLowerCase())
      .map(contribJson);
    return ok(res, { ...forgeJson(f), contributions: contribs });
  }

  if (url === "/ingots") {
    return ok(
      res,
      Array.from(store.ingots.values())
        .sort((a, b) => Number(a.tokenId - b.tokenId))
        .map(ingotJson)
    );
  }

  const ingotMatch = url.match(/^\/ingots\/(\d+)$/);
  if (ingotMatch) {
    const i = store.ingots.get(ingotMatch[1]);
    if (!i) return notFound(res);
    const shares = store.shares.filter((s) => s.tokenId === i.tokenId).map(shareJson);
    return ok(res, { ...ingotJson(i), shares });
  }

  if (url === "/smiths") {
    const byAddr = new Map<
      string,
      { addr: Address; contribs: number; shares: number }
    >();
    for (const c of store.contributions) {
      const key = c.smith.toLowerCase();
      const cur = byAddr.get(key) ?? { addr: c.smith, contribs: 0, shares: 0 };
      cur.contribs += 1;
      byAddr.set(key, cur);
    }
    for (const s of store.shares) {
      const key = s.holder.toLowerCase();
      const cur = byAddr.get(key) ?? { addr: s.holder, contribs: 0, shares: 0 };
      cur.shares += 1;
      byAddr.set(key, cur);
    }
    return ok(
      res,
      Array.from(byAddr.values()).map((s) => ({
        address: s.addr,
        contributions: s.contribs,
        shares: s.shares,
      }))
    );
  }

  const smithMatch = url.match(/^\/smiths\/(0x[a-fA-F0-9]{40})$/);
  if (smithMatch) {
    const addr = smithMatch[1].toLowerCase();
    const contribs = store.contributions.filter((c) => c.smith.toLowerCase() === addr);
    const shares = store.shares.filter((s) => s.holder.toLowerCase() === addr);
    const claimed = store.revenueClaimed.filter(
      (r) => r.holder?.toLowerCase() === addr
    );
    if (contribs.length === 0 && shares.length === 0 && claimed.length === 0) {
      return notFound(res);
    }
    let totalClaimed = 0n;
    for (const r of claimed) totalClaimed += r.amount;
    return ok(res, {
      address: smithMatch[1],
      contributions: contribs.map(contribJson),
      shares: shares.map(shareJson),
      totalClaimedOG: Number(formatEther(totalClaimed)),
    });
  }

  if (url === "/lineage") {
    return ok(
      res,
      Array.from(store.ingots.values()).map((i) => ({
        tokenId: i.tokenId.toString(),
        forge: i.forge,
        parent: i.parent,
        contributors: i.contributors.size,
        mintedBlock: i.mintedBlock.toString(),
      }))
    );
  }

  notFound(res);
}

function ok(res: ServerResponse, body: unknown) {
  res.statusCode = 200;
  res.end(JSON.stringify(body));
}

function notFound(res: ServerResponse) {
  res.statusCode = 404;
  res.end(JSON.stringify({ error: "not found" }));
}

// ─── JSON shaping ───────────────────────────────────────────────────────

function forgeJson(f: ForgeRow) {
  return {
    address: f.address,
    creator: f.creator,
    evalCoordinator: f.evalCoordinator,
    modelSpec: f.modelSpec,
    evalSpec: f.evalSpec,
    contributionWindowEnds: f.contributionWindowEnds,
    createdBlock: f.createdBlock.toString(),
    contributionsCount: f.contributionsCount,
  };
}

function ingotJson(i: IngotRow) {
  return {
    tokenId: i.tokenId.toString(),
    forge: i.forge,
    parent: i.parent,
    contributors: i.contributors.size,
    mintedBlock: i.mintedBlock.toString(),
  };
}

function contribJson(c: ContribRow) {
  return {
    id: c.id.toString(),
    smith: c.smith,
    forge: c.forge,
    type: c.type,
    storageRoot: c.storageRoot,
    amount: c.amount.toString(),
    timestamp: c.timestamp,
    txHash: c.txHash,
  };
}

function shareJson(s: ShareRow) {
  return {
    tokenId: s.tokenId.toString(),
    holder: s.holder,
    share: s.share.toString(),
  };
}

main().catch((err) => {
  console.error("[indexer] fatal", err);
  process.exit(1);
});
