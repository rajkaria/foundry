/**
 * Inference client — speaks the OpenAI-compatible HTTP surface that the
 * Foundry inference proxy exposes at api.foundryprotocol.xyz/v1.
 *
 * The proxy handles the actual 0G Compute dispatch + on-chain revenue
 * routing; the SDK is a thin, typed transport.
 */

import type { IngotId } from "./index.js";

const DEFAULT_INFERENCE_ENDPOINT = "https://api.foundryprotocol.xyz/v1";

export interface InferenceMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface InferenceParams {
  input?: string;
  messages?: InferenceMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface InferenceResult {
  output: string;
  ingotId: IngotId;
  receipt: {
    requestId: string;
    inferenceTxHash?: `0x${string}`;
    revenueTxHash?: `0x${string}`;
    latencyMs: number;
  };
}

export interface InferenceClientConfig {
  endpoint?: string;
  apiKey?: string;
  fetch?: typeof fetch;
}

export class InferenceClient {
  private readonly endpoint: string;
  private readonly apiKey?: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: InferenceClientConfig = {}) {
    this.endpoint = (config.endpoint ?? DEFAULT_INFERENCE_ENDPOINT).replace(/\/$/, "");
    this.apiKey = config.apiKey;
    this.fetchImpl = config.fetch ?? globalThis.fetch.bind(globalThis);
  }

  async run(ingotId: IngotId, params: InferenceParams): Promise<InferenceResult> {
    const messages: InferenceMessage[] = params.messages ?? [
      { role: "user", content: params.input ?? "" },
    ];

    const headers: Record<string, string> = {
      "content-type": "application/json",
      "x-foundry-ingot-id": ingotId.replace(/^ingot:/, ""),
    };
    if (this.apiKey) headers.authorization = `Bearer ${this.apiKey}`;

    const start = Date.now();
    const res = await this.fetchImpl(`${this.endpoint}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: ingotId,
        messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new InferenceError(res.status, body);
    }

    const data = (await res.json()) as OpenAIResponse;
    const choice = data.choices[0];
    const latencyMs = Date.now() - start;

    return {
      output: choice?.message?.content ?? "",
      ingotId,
      receipt: {
        requestId: data.id,
        inferenceTxHash: data.foundry?.inferenceTxHash,
        revenueTxHash: data.foundry?.revenueTxHash,
        latencyMs,
      },
    };
  }
}

export class InferenceError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string
  ) {
    super(`[foundry-sdk] inference failed (${status}): ${body.slice(0, 200)}`);
    this.name = "InferenceError";
  }
}

interface OpenAIResponse {
  id: string;
  choices: Array<{ message?: { content?: string } }>;
  foundry?: {
    inferenceTxHash?: `0x${string}`;
    revenueTxHash?: `0x${string}`;
  };
}
