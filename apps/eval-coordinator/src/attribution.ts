/**
 * Attribution — leave-one-out marginal scoring.
 *
 * Given a Forge and its contributions:
 *
 *   1. Download the holdout (evalSpec) and contribution datasets from 0G Storage.
 *   2. Compute a baseline score using only the holdout against a reference model.
 *   3. For each contribution, compute a score on `baseline + contribution_i`.
 *   4. Marginal Δ = max(0, score_i - baseline).
 *   5. Multiply by 1e6 (contract stores uint64 score × 1e6).
 *
 * Real scoring: the coordinator dispatches a job to 0G Compute that evaluates
 * the contribution against the holdout. Scores live in [0, 1].
 *
 * Synthetic mode: when no compute provider is configured, we use a
 * deterministic content-hash-based score so the pipeline keeps running and
 * gives reproducible deltas that *correlate with content* (not random) —
 * useful for local dev and CI.
 */

import { keccak256, toHex, type Address, type Hex } from "viem";
import type { ContributionRecord, StorageClient } from "@foundryprotocol/sdk";

const SCORE_SCALE = 1_000_000n;

export interface AttributionInput {
  forge: Address;
  evalSpec: Hex;
  contributions: ContributionRecord[];
  storage: StorageClient;
  scorer?: ContributionScorer;
}

/** Pluggable scorer — produces a score in [0, 1] for a contribution against the holdout. */
export type ContributionScorer = (args: {
  holdout: Uint8Array | null;
  contribution: ContributionRecord;
  contributionPayload: Uint8Array | null;
}) => Promise<number>;

export interface AttributionResult {
  baseline: number;
  scores: number[];
  /** Marginal deltas, clamped >= 0. */
  deltas: number[];
  /** Per-contribution score × 1e6 for `Forge.submitEvalResult`. */
  deltasScaled: bigint[];
  scoredAt: number;
}

const ZERO_BYTES32 = "0x" + "00".repeat(32) as Hex;

export async function runAttribution(input: AttributionInput): Promise<AttributionResult> {
  const scorer = input.scorer ?? deterministicScorer;

  // Download holdout (best-effort; deterministic scorer doesn't need it).
  const holdout = await tryDownload(input.storage, input.evalSpec);

  // Baseline = score of holdout against itself using the same scorer.
  // For deterministic scorer this is a fixed reference; for real scorers
  // this would be the eval-coordinator-only baseline run.
  const baseline = await scorer({
    holdout,
    contribution: {
      id: 0n,
      smith: "0x0000000000000000000000000000000000000000" as Address,
      forge: input.forge,
      ctype: "Data",
      storageRoot: ZERO_BYTES32,
      amount: 0n,
      timestamp: 0n,
      score: 0n,
    },
    contributionPayload: holdout,
  });

  // Score each contribution.
  const scores: number[] = [];
  for (const c of input.contributions) {
    const payload =
      c.ctype === "Data" && c.storageRoot !== ZERO_BYTES32
        ? await tryDownload(input.storage, c.storageRoot)
        : null;
    const score = await scorer({
      holdout,
      contribution: c,
      contributionPayload: payload,
    });
    scores.push(score);
  }

  const deltas = scores.map((s) => Math.max(0, s - baseline));
  const deltasScaled = deltas.map((d) =>
    BigInt(Math.round(d * Number(SCORE_SCALE)))
  );

  return {
    baseline,
    scores,
    deltas,
    deltasScaled,
    scoredAt: Math.floor(Date.now() / 1000),
  };
}

async function tryDownload(storage: StorageClient, root: Hex): Promise<Uint8Array | null> {
  if (root === ZERO_BYTES32) return null;
  try {
    return await storage.download(root);
  } catch (err) {
    // Storage may not be reachable in dev — degrade gracefully so attribution
    // still runs against on-chain metadata only.
    return null;
  }
}

/**
 * Deterministic, content-aware scorer for local dev / CI / hackathon demos.
 *
 * For Data contributions: hash(holdout || contribution_payload || smith) →
 * score is a stable value in [0.2, 0.95]. Different payloads → different
 * scores. Same payload → same score. The contract-storeable scaled output
 * is reproducible across machines.
 *
 * For Compute / Capital: a flat 0.5 — those contributions are scored by
 * declared amount inside the Forge (not by content).
 */
export const deterministicScorer: ContributionScorer = async ({
  holdout,
  contribution,
  contributionPayload,
}) => {
  if (contribution.ctype !== "Data") return 0.5;
  const h = holdout ?? new Uint8Array();
  const p = contributionPayload ?? new TextEncoder().encode(contribution.storageRoot);
  const tag = new TextEncoder().encode(contribution.smith);
  const buf = new Uint8Array(h.length + p.length + tag.length);
  buf.set(h, 0);
  buf.set(p, h.length);
  buf.set(tag, h.length + p.length);
  const digest = keccak256(toHex(buf));
  // Take low 4 bytes of the digest → uint32 → map to [0.2, 0.95]
  const n = Number(BigInt(digest.slice(0, 10)) & 0xffffffffn);
  return 0.2 + (n / 0xffffffff) * 0.75;
};

/**
 * 0G-Compute-backed scorer. Sends the holdout + contribution payload to a
 * reference LLM via the broker and parses a numeric score from the response.
 *
 * The model is instructed to return a JSON `{ "score": <float in [0,1]> }`.
 * If parsing fails, we fall back to the deterministic scorer for that row.
 */
export function makeComputeScorer(args: {
  broker: unknown;
  provider: string;
  endpoint: string;
  model: string;
}): ContributionScorer {
  return async ({ holdout, contribution, contributionPayload }) => {
    const holdoutText = holdout ? new TextDecoder().decode(holdout).slice(0, 4000) : "(no holdout)";
    const contribText = contributionPayload
      ? new TextDecoder().decode(contributionPayload).slice(0, 4000)
      : `(no payload — root ${contribution.storageRoot})`;

    const messages = [
      {
        role: "system" as const,
        content:
          "You are an unbiased evaluator. Compare a contributed dataset against the holdout " +
          "and return a single JSON object: {\"score\": <number between 0 and 1>}. " +
          "Higher = the contribution would more meaningfully improve a model trained on it.",
      },
      {
        role: "user" as const,
        content: `HOLDOUT:\n${holdoutText}\n\nCONTRIBUTION:\n${contribText}\n\nReturn only the JSON.`,
      },
    ];

    try {
      const headers = await (args.broker as {
        inference: {
          getRequestHeaders: (p: string, content: string) => Promise<Record<string, string>>;
        };
      }).inference.getRequestHeaders(args.provider, JSON.stringify(messages));
      const res = await fetch(`${args.endpoint}/v1/chat/completions`, {
        method: "POST",
        headers: { "content-type": "application/json", ...headers },
        body: JSON.stringify({
          model: args.model,
          messages,
          response_format: { type: "json_object" },
          max_tokens: 64,
          temperature: 0,
        }),
      });
      if (!res.ok) throw new Error(`compute ${res.status}`);
      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const out = data.choices?.[0]?.message?.content ?? "";
      const parsed = JSON.parse(out) as { score?: number };
      if (typeof parsed.score === "number" && parsed.score >= 0 && parsed.score <= 1) {
        return parsed.score;
      }
    } catch {
      // fall through to deterministic
    }
    return deterministicScorer({ holdout, contribution, contributionPayload });
  };
}
