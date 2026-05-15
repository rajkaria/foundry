/**
 * Eval coordinator configuration — loaded from env at process start.
 *
 * Required:
 *   RPC_ARISTOTLE                  RPC URL for the 0G chain
 *   COORDINATOR_KEY                private key of the registered eval coordinator
 *   FOUNDRY_NETWORK                aristotle | galileo | local (default: aristotle)
 *
 * Optional:
 *   POLL_INTERVAL_SECS             default 12
 *   START_BLOCK                    earliest block to scan (default: 0 = full scan)
 *   ZG_BROKER_KEY                  if set, the coordinator can dispatch real
 *                                  0G Compute inference jobs (otherwise it
 *                                  uses a deterministic synthetic baseline)
 *   ZG_INFERENCE_PROVIDER          provider address for compute jobs
 *   ZG_DA_ENCODER_URL              0G DA encoder endpoint (optional)
 *   ZG_DA_API_KEY                  bearer token for DA encoder
 *   ZG_STORAGE_INDEXER             0G Storage indexer URL
 *   TEE_ENABLED                    declared TEE status (default: true)
 *   COORDINATOR_STATE_PATH         on-disk JSON for resumable state
 */

import type { NetworkName } from "@foundryprotocol/sdk";

export interface Config {
  network: NetworkName;
  rpcUrl: string;
  coordinatorKey: `0x${string}`;
  pollIntervalMs: number;
  startBlock: bigint;
  zgBrokerKey?: string;
  zgInferenceProvider?: string;
  zgDaEncoderUrl?: string;
  zgDaApiKey?: string;
  zgStorageIndexer?: string;
  teeEnabled: boolean;
  statePath: string;
}

const DEFAULT_RPC: Record<NetworkName, string> = {
  aristotle: "https://evmrpc.0g.ai",
  galileo: "https://evmrpc-testnet.0g.ai",
  local: "http://127.0.0.1:8545",
};

export function loadConfig(): Config {
  const network = (process.env.FOUNDRY_NETWORK ?? "aristotle") as NetworkName;
  if (!["aristotle", "galileo", "local"].includes(network)) {
    throw new Error(
      `FOUNDRY_NETWORK must be one of aristotle|galileo|local, got "${network}"`
    );
  }

  const rpcUrl =
    process.env.RPC_ARISTOTLE ??
    process.env.RPC_GALILEO ??
    process.env.RPC ??
    DEFAULT_RPC[network];

  const rawKey = process.env.COORDINATOR_KEY;
  if (!rawKey) {
    throw new Error("COORDINATOR_KEY is required (registered eval coordinator key)");
  }
  const coordinatorKey = (
    rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`
  ) as `0x${string}`;
  if (coordinatorKey.length !== 66) {
    throw new Error("COORDINATOR_KEY must be a 32-byte hex string");
  }

  return {
    network,
    rpcUrl,
    coordinatorKey,
    pollIntervalMs: Number(process.env.POLL_INTERVAL_SECS ?? "12") * 1000,
    startBlock: BigInt(process.env.START_BLOCK ?? "0"),
    zgBrokerKey: process.env.ZG_BROKER_KEY,
    zgInferenceProvider: process.env.ZG_INFERENCE_PROVIDER,
    zgDaEncoderUrl: process.env.ZG_DA_ENCODER_URL,
    zgDaApiKey: process.env.ZG_DA_API_KEY,
    zgStorageIndexer: process.env.ZG_STORAGE_INDEXER,
    teeEnabled: (process.env.TEE_ENABLED ?? "true").toLowerCase() === "true",
    statePath: process.env.COORDINATOR_STATE_PATH ?? "./.foundry-eval-state.json",
  };
}
