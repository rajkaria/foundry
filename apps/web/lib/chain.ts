/**
 * Server-side chain access for the web app.
 *
 * Reads addresses from the SDK's deployment registry (which is synced by
 * `scripts/sync-deployments.mjs`). The network is picked by the
 * NEXT_PUBLIC_FOUNDRY_NETWORK env var (default: aristotle) and the RPC by
 * FOUNDRY_RPC_URL (default: per-network public RPC).
 *
 * Pages call `getChain()` once per request. If contracts aren't deployed
 * yet, `getChain()` still returns a client, but `isLive` is false — pages
 * use that to render the honest empty-state instead of a broken read.
 */

import { createPublicClient, http, type PublicClient, defineChain } from "viem";
import {
  deployments,
  isDeployed,
  type Deployment,
  type NetworkName,
} from "@foundryprotocol/sdk";

const DEFAULT_RPCS: Record<NetworkName, string> = {
  aristotle: "https://evmrpc.0g.ai",
  galileo: "https://evmrpc-testnet.0g.ai",
  local: "http://127.0.0.1:8545",
};

const CHAIN_IDS: Record<NetworkName, number> = {
  aristotle: 16608, // canonical 0G mainnet — confirmed at deploy
  galileo: 16601, // 0G Galileo testnet
  local: 31337, // Anvil default
};

export interface ChainContext {
  network: NetworkName;
  rpcUrl: string;
  deployment: Deployment;
  isLive: boolean;
  client: PublicClient;
  explorerBase: string;
}

const EXPLORERS: Record<NetworkName, string> = {
  aristotle: "https://chainscan.0g.ai",
  galileo: "https://chainscan-galileo.0g.ai",
  local: "http://127.0.0.1:8545",
};

function readNetwork(): NetworkName {
  const raw = (process.env.NEXT_PUBLIC_FOUNDRY_NETWORK ?? "aristotle").toLowerCase();
  if (raw === "galileo" || raw === "local" || raw === "aristotle") return raw;
  return "aristotle";
}

let cached: ChainContext | null = null;

export function getChain(): ChainContext {
  if (cached) return cached;
  const network = readNetwork();
  const rpcUrl = process.env.FOUNDRY_RPC_URL ?? DEFAULT_RPCS[network];
  const deployment = deployments[network];
  const chain = defineChain({
    id: CHAIN_IDS[network],
    name: `0G ${network}`,
    nativeCurrency: { name: "OG", symbol: "OG", decimals: 18 },
    rpcUrls: { default: { http: [rpcUrl] } },
  });
  const client = createPublicClient({ chain, transport: http(rpcUrl) });
  cached = {
    network,
    rpcUrl,
    deployment,
    isLive: isDeployed(deployment),
    client,
    explorerBase: EXPLORERS[network],
  };
  return cached;
}

export function explorerAddress(addr: string): string {
  return `${getChain().explorerBase}/address/${addr}`;
}

export function explorerTx(hash: string): string {
  return `${getChain().explorerBase}/tx/${hash}`;
}

/** Short-format an address: 0xabcd…1234 */
export function shortAddr(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** Short-format a tx/hash: 0xabcd…1234 */
export const shortHash = shortAddr;
