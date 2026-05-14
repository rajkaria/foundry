/**
 * Foundry indexer — watches 0G Aristotle events and exposes typed reads.
 *
 * Run:
 *   pnpm --filter @foundryprotocol/indexer dev
 *
 * Env: RPC_ARISTOTLE, INDEXER_PORT (default 4000),
 *      DEPLOYMENT_FILE (path to contracts/deployments/aristotle.json)
 */

import { createPublicClient, http, parseAbiItem, type Address } from "viem";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";

const PORT = Number(process.env.INDEXER_PORT ?? 4000);
const RPC = process.env.RPC_ARISTOTLE ?? "https://rpc.0g.network";
const DEPLOY_PATH =
  process.env.DEPLOYMENT_FILE ?? "../../contracts/deployments/aristotle.json";

interface Deployment {
  ForgeFactory: Address;
  Ingot: Address;
  RevenueSplitter: Address;
  ContributionRegistry: Address;
}

const FORGE_CREATED = parseAbiItem(
  "event ForgeCreated(address indexed forge, address indexed creator, bytes32 modelSpec, bytes32 evalSpec, address evalCoordinator, uint64 contributionWindowEnds)"
);
const INGOT_MINTED = parseAbiItem(
  "event IngotMinted(uint256 indexed tokenId, address indexed forge)"
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

interface Stats {
  forges: number;
  ingots: number;
  contributions: number;
  externalSmiths: Set<string>;
  totalRevenue: bigint;
  totalClaimed: bigint;
  lastBlock: bigint;
}

const stats: Stats = {
  forges: 0,
  ingots: 0,
  contributions: 0,
  externalSmiths: new Set(),
  totalRevenue: 0n,
  totalClaimed: 0n,
  lastBlock: 0n,
};

async function loadDeployment(): Promise<Deployment> {
  const raw = readFileSync(DEPLOY_PATH, "utf-8");
  return JSON.parse(raw) as Deployment;
}

async function main() {
  let deployment: Deployment;
  try {
    deployment = await loadDeployment();
  } catch {
    console.error(
      `[indexer] no deployment file at ${DEPLOY_PATH}. ` +
        `Run contracts deploy first (Sprint 1, Tue May 19). Indexer idle.`
    );
    // still expose /health so infra can wire it up
    startHttp();
    return;
  }

  const client = createPublicClient({
    transport: http(RPC),
  });

  console.log(`[indexer] watching ${RPC} for events from`, deployment);

  client.watchEvent({
    address: deployment.ForgeFactory,
    event: FORGE_CREATED,
    onLogs: (logs) => {
      stats.forges += logs.length;
      stats.lastBlock = logs[logs.length - 1]?.blockNumber ?? stats.lastBlock;
      for (const l of logs) console.log("[indexer] ForgeCreated", l.args);
    },
  });

  client.watchEvent({
    address: deployment.Ingot,
    event: INGOT_MINTED,
    onLogs: (logs) => {
      stats.ingots += logs.length;
      for (const l of logs) console.log("[indexer] IngotMinted", l.args);
    },
  });

  client.watchEvent({
    address: deployment.ContributionRegistry,
    event: CONTRIBUTION_LOGGED,
    onLogs: (logs) => {
      stats.contributions += logs.length;
      for (const l of logs) {
        if (l.args.smith) stats.externalSmiths.add(l.args.smith);
      }
    },
  });

  client.watchEvent({
    address: deployment.RevenueSplitter,
    event: REVENUE_RECEIVED,
    onLogs: (logs) => {
      for (const l of logs) {
        if (l.args.amount) stats.totalRevenue += l.args.amount;
      }
    },
  });

  client.watchEvent({
    address: deployment.RevenueSplitter,
    event: REVENUE_CLAIMED,
    onLogs: (logs) => {
      for (const l of logs) {
        if (l.args.amount) stats.totalClaimed += l.args.amount;
      }
    },
  });

  startHttp();
}

function startHttp() {
  const server = createServer((req, res) => {
    res.setHeader("access-control-allow-origin", "*");
    if (req.url === "/health") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true, lastBlock: stats.lastBlock.toString() }));
      return;
    }
    if (req.url === "/stats") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          forges: stats.forges,
          ingots: stats.ingots,
          contributions: stats.contributions,
          externalSmiths: stats.externalSmiths.size,
          totalRevenue: stats.totalRevenue.toString(),
          totalClaimed: stats.totalClaimed.toString(),
          lastBlock: stats.lastBlock.toString(),
        })
      );
      return;
    }
    res.writeHead(404);
    res.end("not found");
  });

  server.listen(PORT, () => {
    console.log(`[indexer] http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("[indexer] fatal", err);
  process.exit(1);
});
