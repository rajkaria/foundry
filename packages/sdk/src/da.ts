/**
 * 0G Data Availability — receipts, attestations, and audit trail.
 *
 * Attribution receipts (the score vector emitted by the eval coordinator) are
 * the most security-sensitive artefacts in the protocol. They're posted to
 * 0G DA so that anyone can replay them and the signed envelope is recoverable
 * independently of any HTTP endpoint we run.
 *
 * Foundry-layer thin wrapper: the actual canonical-JSON digest + encoder REST
 * call now live in the neutral `@foundryprotocol/0gkit-da` package (single source of truth,
 * shared by the CLI, MCP server, and playground). This module preserves the
 * `@foundryprotocol/sdk` public surface (`DAClient`, `DAError`,
 * `DAClientConfig`, `DAPublishResult`) and error type for backward compat.
 *
 * @example
 * ```ts
 * const foundry = new Foundry({ contracts: 'aristotle' });
 * const receipt = await foundry.da.publish({
 *   kind: 'eval-result',
 *   forge: 'forge:0x…',
 *   scores: [123_456, 89_012, 50_000],
 *   attestation: '0x…32-bytes',
 * });
 * // receipt.daRef → 0G DA blob reference, also stored in the Forge `attestation` slot
 * ```
 */

import type { Hex } from "viem";
import { DA, type DAConfig } from "@foundryprotocol/0gkit-da";

export interface DAClientConfig {
  /** REST endpoint of the 0G DA encoder. */
  encoderUrl?: string;
  /** Network preset — `aristotle` (default) or `galileo`. */
  network?: "aristotle" | "galileo";
  /** Bearer token if your encoder requires auth. */
  apiKey?: string;
  /** Custom fetch impl (test injection). */
  fetch?: typeof fetch;
}

export interface DAPublishResult {
  /** Deterministic content hash of the payload (keccak256). */
  digest: Hex;
  /** 0G DA blob reference, if a real DA encoder is configured. */
  daRef?: string;
  /** Whether the call hit real DA (`"live"`) or stayed local (`"local"`). */
  mode: "live" | "local";
  /** Encoder-returned blob id, if any. */
  blobId?: string;
  /** Wall-clock latency. */
  latencyMs: number;
}

export class DAClient {
  readonly encoderUrl?: string;
  readonly apiKey?: string;
  private readonly da: DA;

  constructor(config: DAClientConfig = {}) {
    this.apiKey = config.apiKey;
    const daConfig: DAConfig = { apiKey: this.apiKey, fetch: config.fetch };
    if (config.encoderUrl) {
      this.encoderUrl = config.encoderUrl.replace(/\/$/, "");
      daConfig.encoderUrl = this.encoderUrl;
    } else if (config.network === "galileo" || config.network === "aristotle") {
      // Network → encoder-host resolution lives in exactly one place (@foundryprotocol/0gkit-da).
      daConfig.network = config.network;
    }
    this.da = new DA(daConfig);
  }

  /**
   * Compute the keccak256 of a payload **without** posting it. Useful for
   * deterministic attestation envelopes where the digest goes on-chain even
   * if DA isn't configured yet.
   */
  digest(payload: unknown): Hex {
    return this.da.digest(payload);
  }

  /**
   * Publish a payload to 0G DA. Returns the deterministic digest, and the
   * DA reference if the encoder is reachable. Falls back to local-only
   * mode when no encoder is configured.
   */
  async publish(payload: unknown): Promise<DAPublishResult> {
    try {
      const r = await this.da.publish(payload);
      return {
        digest: r.digest,
        mode: r.mode,
        blobId: r.blobId,
        daRef: r.daRef,
        latencyMs: r.latencyMs,
      };
    } catch (err) {
      // Preserve the historical `DAError` type + "<status>" message so
      // existing callers / tests keep working unchanged.
      const msg = err instanceof Error ? err.message : String(err);
      const status = Number(/HTTP (\d{3})/.exec(msg)?.[1] ?? 0);
      throw new DAError(status, msg);
    }
  }
}

export class DAError extends Error {
  constructor(
    public readonly status: number,
    body: string
  ) {
    super(`[foundry-sdk:da] ${status} ${body.slice(0, 200)}`);
    this.name = "DAError";
  }
}
