import {
  ConfigError,
  NetworkError,
  canonicalJsonStringify,
  digestJson,
} from "@0gkit/core";
import { type Hex } from "viem";

const ENCODERS = {
  aristotle: "https://da-encoder.0g.network",
  galileo: "https://da-encoder-testnet.0g.ai",
} as const;

export interface DAConfig {
  network?: "aristotle" | "galileo";
  encoderUrl?: string;
  apiKey?: string;
  fetch?: typeof fetch;
}

export interface DAPublishResult {
  digest: Hex;
  daRef?: string;
  blobId?: string;
  mode: "live" | "local";
  latencyMs: number;
  raw?: unknown;
}

export class DA {
  private readonly encoderUrl?: string;
  private readonly apiKey?: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: DAConfig) {
    this.encoderUrl =
      config.encoderUrl ?? (config.network ? ENCODERS[config.network] : undefined);
    this.apiKey = config.apiKey;
    this.fetchImpl = config.fetch ?? globalThis.fetch;
  }

  digest(payload: unknown): Hex {
    return digestJson(payload);
  }

  async publish(payload: unknown): Promise<DAPublishResult> {
    const startedAt = Date.now();
    const digest = digestJson(payload);
    if (!this.encoderUrl) {
      return { digest, mode: "local", latencyMs: Date.now() - startedAt };
    }
    const body =
      payload instanceof Uint8Array
        ? payload
        : new TextEncoder().encode(canonicalJsonStringify(payload));
    let res: Response;
    try {
      res = await this.fetchImpl(`${this.encoderUrl}/blob`, {
        method: "POST",
        headers: {
          "content-type": "application/octet-stream",
          ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}),
        },
        body: body as BodyInit,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new NetworkError(
        `DA encoder request failed: ${msg}`,
        `Check the encoder is reachable, or omit encoderUrl for local digest mode.`
      );
    }
    if (!res.ok) {
      throw new NetworkError(
        `DA encoder returned HTTP ${res.status}.`,
        `Verify the encoder URL/API key, or use local digest mode.`
      );
    }
    const raw = (await res.json().catch(() => ({}))) as {
      blobId?: string;
      ref?: string;
    };
    return {
      digest,
      blobId: raw.blobId,
      daRef: raw.ref ?? raw.blobId,
      mode: "live",
      latencyMs: Date.now() - startedAt,
      raw,
    };
  }

  verify(payload: unknown, expectedDigest: string): boolean {
    if (!/^0x[0-9a-fA-F]{64}$/.test(expectedDigest)) {
      throw new ConfigError(
        `expectedDigest is not a 32-byte 0x hex string.`,
        `Pass the value returned by da.digest()/publish().digest.`
      );
    }
    return digestJson(payload).toLowerCase() === expectedDigest.toLowerCase();
  }
}
