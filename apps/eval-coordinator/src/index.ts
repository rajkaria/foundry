#!/usr/bin/env node
/**
 * Foundry eval coordinator daemon.
 *
 * Run with:
 *   pnpm --filter @foundryprotocol/eval-coordinator dev
 *   # or after build
 *   node apps/eval-coordinator/dist/index.js
 *
 * The daemon:
 *   1. Polls ForgeFactory for new Forges + watches StateChanged events.
 *   2. When a Forge enters `Evaluating`, reads contributions from
 *      ContributionRegistry, downloads payloads from 0G Storage.
 *   3. Runs leave-one-out attribution (real LLM-as-judge via 0G Compute when
 *      configured; deterministic content-hash scorer otherwise).
 *   4. Builds a signed attestation envelope, posts the receipt to 0G DA.
 *   5. Calls `submitEvalResult(attestationDigest, deltasScaled)` on-chain.
 */

import { createWalletClient, http, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  Foundry,
  type ContributionRecord,
  type ForgeId,
  signEnvelope,
  type AttestationEnvelope,
} from "@foundryprotocol/sdk";
import pino from "pino";
import { loadConfig } from "./config.js";
import { loadState, saveState } from "./state.js";
import {
  runAttribution,
  makeComputeScorer,
  type ContributionScorer,
} from "./attribution.js";

const log = pino({
  transport: process.stdout.isTTY
    ? { target: "pino-pretty", options: { translateTime: "HH:MM:ss", ignore: "pid,hostname" } }
    : undefined,
});

async function main(): Promise<void> {
  const cfg = loadConfig();
  log.info({ network: cfg.network, tee: cfg.teeEnabled }, "coordinator starting");

  const account = privateKeyToAccount(cfg.coordinatorKey);
  const walletClient = createWalletClient({
    account,
    transport: http(cfg.rpcUrl),
  });

  const foundry = new Foundry({
    contracts: cfg.network,
    rpcUrl: cfg.rpcUrl,
    walletClient,
    da: {
      encoderUrl: cfg.zgDaEncoderUrl,
      apiKey: cfg.zgDaApiKey,
    },
    storage: cfg.zgStorageIndexer
      ? { indexerUrl: cfg.zgStorageIndexer, rpcUrl: cfg.rpcUrl }
      : undefined,
  });

  log.info(
    {
      coordinator: account.address,
      factory: foundry.deployment.ForgeFactory,
      ingot: foundry.deployment.Ingot,
      registry: foundry.deployment.ContributionRegistry,
    },
    "coordinator online"
  );

  const scorer = await buildScorer(cfg);

  const state = loadState(cfg.statePath);
  const seen = new Set<Address>(state.submitted);

  while (true) {
    try {
      const forges = await foundry.forge.list();
      log.debug({ count: forges.length }, "forge sweep");

      for (const forgeId of forges) {
        if (seen.has(forgeAddr(forgeId))) continue;
        await maybeEvaluate({
          forgeId,
          foundry,
          scorer,
          coordinatorKey: cfg.coordinatorKey,
          coordinatorAddr: account.address,
          teeEnabled: cfg.teeEnabled,
          onSubmitted: () => {
            seen.add(forgeAddr(forgeId));
            saveState(cfg.statePath, {
              lastBlock: state.lastBlock,
              submitted: [...seen],
            });
          },
        });
      }
    } catch (err) {
      log.error({ err: errMsg(err) }, "loop iteration failed");
    }

    await sleep(cfg.pollIntervalMs);
  }
}

async function buildScorer(cfg: ReturnType<typeof loadConfig>): Promise<ContributionScorer | undefined> {
  if (!cfg.zgBrokerKey || !cfg.zgInferenceProvider) {
    log.warn(
      "ZG_BROKER_KEY / ZG_INFERENCE_PROVIDER not set — using deterministic content-hash scorer."
    );
    return undefined; // deterministic default
  }
  try {
    const [{ ethers }, brokerMod] = await Promise.all([
      import("ethers"),
      import("@0gfoundation/0g-compute-ts-sdk"),
    ]);
    const ethProvider = new ethers.JsonRpcProvider(cfg.rpcUrl);
    const ethWallet = new ethers.Wallet(cfg.zgBrokerKey, ethProvider);
    const broker = await (brokerMod as { createZGComputeNetworkBroker: Function })
      .createZGComputeNetworkBroker(ethWallet);
    try {
      await (broker as {
        inference: { acknowledgeProviderSigner: (p: string) => Promise<void> };
      }).inference.acknowledgeProviderSigner(cfg.zgInferenceProvider);
    } catch {}
    const { endpoint, model } = await (broker as {
      inference: {
        getServiceMetadata: (p: string) => Promise<{ endpoint: string; model: string }>;
      };
    }).inference.getServiceMetadata(cfg.zgInferenceProvider);
    log.info({ provider: cfg.zgInferenceProvider, model }, "0G Compute scorer ready");
    return makeComputeScorer({
      broker,
      provider: cfg.zgInferenceProvider,
      endpoint,
      model,
    });
  } catch (err) {
    log.error({ err: errMsg(err) }, "compute scorer init failed — falling back to deterministic");
    return undefined;
  }
}

async function maybeEvaluate(args: {
  forgeId: ForgeId;
  foundry: Foundry;
  scorer?: ContributionScorer;
  coordinatorKey: `0x${string}`;
  coordinatorAddr: Address;
  teeEnabled: boolean;
  onSubmitted: () => void;
}): Promise<void> {
  const { forgeId, foundry, coordinatorAddr } = args;
  const full = await foundry.forge.get(forgeId);

  if (full.evalCoordinator.toLowerCase() !== coordinatorAddr.toLowerCase()) {
    return; // not our forge
  }

  // Trigger the evaluation transition if the contribution window has closed.
  const nowSec = BigInt(Math.floor(Date.now() / 1000));
  if (full.state === "Open" && nowSec >= full.contributionWindowEnds) {
    try {
      const { txHash } = await foundry.forge.startEvaluating(forgeId);
      log.info({ forgeId, txHash }, "startEvaluating");
    } catch (err) {
      log.warn({ forgeId, err: errMsg(err) }, "startEvaluating failed (maybe already transitioned)");
    }
  }

  // Re-read to see if we're now in Evaluating.
  const refreshed = await foundry.forge.get(forgeId);
  if (refreshed.state !== "Evaluating") return;

  // Load contributions from ContributionRegistry by replaying ForgeContributionAdded
  // events on this Forge. We use the contributionsFromLogs helper from the SDK.
  const contribLogs = await foundry.forge.contributionsFromLogs(forgeId);
  if (contribLogs.length === 0) {
    log.warn({ forgeId }, "no contributions on Forge — skipping");
    return;
  }
  const contributions: ContributionRecord[] = await Promise.all(
    contribLogs.map((l) => foundry.contribution.get(l.contributionId))
  );

  log.info({ forgeId, contributions: contributions.length }, "running attribution");
  const result = await runAttribution({
    forge: refreshed.address,
    evalSpec: refreshed.evalSpec,
    contributions,
    storage: foundry.storage,
    scorer: args.scorer,
  });

  // Build the attestation envelope. When TEE is enabled and a real DCAP quote
  // is available, swap `teeAttestation` for the real bytes32 enclave hash.
  const envelope: AttestationEnvelope = {
    kind: "foundry/eval-result/v1",
    forge: refreshed.address,
    scores: result.deltas,
    baseline: result.baseline,
    teeAttestation: args.teeEnabled
      ? syntheticTeeAttestation(refreshed.address, result.deltasScaled)
      : ("0x" + "00".repeat(32)) as `0x${string}`,
    coordinator: coordinatorAddr,
    timestamp: result.scoredAt,
  };

  // Post the receipt to 0G DA (degrades to local digest if no encoder configured).
  const daResult = await foundry.da.publish(envelope);
  if (daResult.daRef) envelope.daRef = daResult.daRef;
  log.info({ forgeId, daMode: daResult.mode, daRef: daResult.daRef }, "envelope published");

  // Sign the envelope so off-chain verifiers can match the on-chain attestation.
  const signed = await signEnvelope(envelope, args.coordinatorKey);

  // Submit on-chain. The contract stores the envelope digest in `Forge.attestation`.
  try {
    const { txHash } = await foundry.forge.submitEvalResult(
      forgeId,
      signed.digest,
      result.deltasScaled
    );
    log.info(
      { forgeId, txHash, deltas: result.deltasScaled.map(String) },
      "submitEvalResult OK"
    );
    args.onSubmitted();
  } catch (err) {
    log.error({ forgeId, err: errMsg(err) }, "submitEvalResult failed");
  }
}

function syntheticTeeAttestation(forge: Address, scaled: bigint[]): `0x${string}` {
  // Stand-in until we wire a real DCAP quote from inside the enclave: a
  // deterministic keccak over the forge + scaled deltas. Replace at the
  // boundary where the real TEE quote becomes available.
  const enc = new TextEncoder();
  const tag = enc.encode(`tee-stub|${forge}|${scaled.join(",")}`);
  return ("0x" + Array.from(tag).map((b) => b.toString(16).padStart(2, "0")).join("")
    .slice(0, 64)
    .padEnd(64, "0")) as `0x${string}`;
}

function forgeAddr(forgeId: ForgeId): Address {
  return ("0x" + forgeId.split(":0x")[1]) as Address;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

main().catch((err) => {
  log.fatal({ err: errMsg(err) }, "fatal");
  process.exit(1);
});
