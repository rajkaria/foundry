/**
 * 0G Data Availability — receipts, attestations, and audit trail.
 *
 * Attribution receipts (the score vector emitted by the eval coordinator) are
 * the most security-sensitive artefacts in the protocol. They're posted to
 * 0G DA so that:
 *
 *   - Anyone can replay them.
 *   - The receipt is cheaper to publish than calldata on Aristotle.
 *   - A signed envelope is recoverable independently of any HTTP endpoint we run.
 *
 * 0G DA does not yet ship a canonical TS SDK; this module talks to the
 * encoder via REST. When the DA endpoint isn't configured, the client
 * degrades to a content-addressed digest so callers can keep working
 * (and we can wire the real DA call as soon as the endpoint is published
 * for a given environment).
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

import { keccak256, toHex, type Hex } from "viem";

const ARISTOTLE_DA_ENCODER = "https://da-encoder.0g.network";
const GALILEO_DA_ENCODER = "https://da-encoder-testnet.0g.ai";

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
  private readonly fetchImpl: typeof fetch;

  constructor(config: DAClientConfig = {}) {
    if (config.encoderUrl) {
      this.encoderUrl = config.encoderUrl.replace(/\/$/, "");
    } else if (config.network === "galileo") {
      this.encoderUrl = GALILEO_DA_ENCODER;
    } else if (config.network === "aristotle") {
      this.encoderUrl = ARISTOTLE_DA_ENCODER;
    }
    this.apiKey = config.apiKey;
    this.fetchImpl = config.fetch ?? globalThis.fetch.bind(globalThis);
  }

  /**
   * Compute the keccak256 of a payload **without** posting it. Useful for
   * deterministic attestation envelopes where the digest goes on-chain even
   * if DA isn't configured yet.
   */
  digest(payload: unknown): Hex {
    return keccak256(toHex(serialize(payload)));
  }

  /**
   * Publish a payload to 0G DA. Returns the deterministic digest, and the
   * DA reference if the encoder is reachable. Falls back to local-only
   * mode when no encoder is configured.
   */
  async publish(payload: unknown): Promise<DAPublishResult> {
    const start = Date.now();
    const data = serialize(payload);
    const digest = keccak256(toHex(data));

    if (!this.encoderUrl) {
      return { digest, mode: "local", latencyMs: Date.now() - start };
    }

    try {
      const headers: Record<string, string> = {
        "content-type": "application/octet-stream",
      };
      if (this.apiKey) headers.authorization = `Bearer ${this.apiKey}`;
      const res = await this.fetchImpl(`${this.encoderUrl}/blob`, {
        method: "POST",
        headers,
        // Fetch's BodyInit accepts ArrayBuffer; we narrow to a fresh ArrayBuffer
        // (not ArrayBufferLike) to satisfy strict TypeScript across runtimes.
        body: toArrayBuffer(data),
      });
      if (!res.ok) {
        throw new DAError(res.status, await res.text().catch(() => ""));
      }
      const body = (await res.json().catch(() => ({}))) as {
        blobId?: string;
        ref?: string;
      };
      return {
        digest,
        mode: "live",
        blobId: body.blobId,
        daRef: body.ref ?? body.blobId,
        latencyMs: Date.now() - start,
      };
    } catch (err) {
      // We keep the digest deterministic so the caller can still on-chain
      // anchor the envelope; we surface the failure so retries are possible.
      if (err instanceof DAError) throw err;
      throw new DAError(0, err instanceof Error ? err.message : String(err));
    }
  }
}

export class DAError extends Error {
  constructor(public readonly status: number, body: string) {
    super(`[foundry-sdk:da] ${status} ${body.slice(0, 200)}`);
    this.name = "DAError";
  }
}

function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  const out = new ArrayBuffer(u8.byteLength);
  new Uint8Array(out).set(u8);
  return out;
}

function serialize(payload: unknown): Uint8Array {
  if (payload instanceof Uint8Array) return payload;
  if (typeof payload === "string") return new TextEncoder().encode(payload);
  return new TextEncoder().encode(canonicalJsonStringify(payload));
}

/** Sort-keys JSON stringify so the same logical payload produces the same digest. */
function canonicalJsonStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJsonStringify).join(",")}]`;
  }
  const keys = Object.keys(value as Record<string, unknown>).sort();
  const entries = keys.map(
    (k) => `${JSON.stringify(k)}:${canonicalJsonStringify((value as Record<string, unknown>)[k])}`
  );
  return `{${entries.join(",")}}`;
}
