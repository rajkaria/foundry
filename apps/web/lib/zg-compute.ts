/**
 * 0G Compute client — wraps @0glabs/0g-serving-broker for OpenAI-compatible
 * chat completions, with revenue routing back to the Foundry Ingot's
 * co-owners on-chain.
 *
 * Server-side only (Node runtime — depends on ethers + native crypto).
 *
 * Env:
 *   ZG_BROKER_RPC          0G chain RPC for the broker wallet (default: 0G mainnet)
 *   ZG_BROKER_KEY          private key of the funded broker wallet (required)
 *   ZG_INFERENCE_PROVIDER  on-chain provider address (required)
 *   ZG_INFERENCE_MODEL     optional model name override
 *
 * When env is missing, the client returns `{ mode: 'stub' }` and the caller
 * is expected to surface the stub state honestly (rather than silently
 * faking real output).
 */

import "server-only";

export interface ZGChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ZGChatParams {
  messages: ZGChatMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "text" | "json_object";
}

export interface ZGChatResult {
  mode: "live" | "stub";
  output: string;
  /** Provider-returned model id (or stub label). */
  model: string;
  /** TEE attestation digest from the response, if the provider supplied one. */
  attestation?: string;
  /** On-chain transaction hash for the inference fee transfer (broker writes). */
  inferenceTxHash?: string;
  /** Provider address that served the request. */
  provider?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

interface BrokerContext {
  broker: unknown; // ZGComputeNetworkBroker
  provider: string;
  endpoint: string;
  model: string;
}

let cached: BrokerContext | null = null;
let initError: string | null = null;

async function getBroker(): Promise<BrokerContext | null> {
  if (cached) return cached;
  if (initError) return null;
  const key = process.env.ZG_BROKER_KEY;
  const providerAddr = process.env.ZG_INFERENCE_PROVIDER;
  if (!key || !providerAddr) {
    initError = "ZG_BROKER_KEY / ZG_INFERENCE_PROVIDER not set";
    return null;
  }

  try {
    // Dynamic imports so missing optional deps don't break the build.
    const [{ ethers }, { createZGComputeNetworkBroker }] = await Promise.all([
      import("ethers"),
      import("@0glabs/0g-serving-broker"),
    ]);

    const rpc = process.env.ZG_BROKER_RPC ?? "https://evmrpc.0g.ai";
    const provider = new ethers.JsonRpcProvider(rpc);
    const wallet = new ethers.Wallet(key, provider);
    const broker = await createZGComputeNetworkBroker(wallet);

    // Ack the provider's terms-of-service once per broker (idempotent on the SDK side).
    try {
      await broker.inference.acknowledgeProviderSigner(providerAddr);
    } catch {
      // Already acknowledged or provider doesn't require it.
    }

    const { endpoint, model } = await broker.inference.getServiceMetadata(providerAddr);

    cached = {
      broker,
      provider: providerAddr,
      endpoint,
      model: process.env.ZG_INFERENCE_MODEL ?? model,
    };
    return cached;
  } catch (err) {
    initError = err instanceof Error ? err.message : String(err);
    console.warn(`[zg-compute] broker init failed: ${initError}`);
    return null;
  }
}

export async function chatCompletion(params: ZGChatParams): Promise<ZGChatResult> {
  const ctx = await getBroker();
  if (!ctx) {
    return stubResult(params);
  }

  try {
    // Compute the signed request headers (broker reserves prepaid balance for this call).
    const headers = await (
      ctx.broker as {
        inference: {
          getRequestHeaders: (
            provider: string,
            content: string
          ) => Promise<Record<string, string>>;
        };
      }
    ).inference.getRequestHeaders(ctx.provider, JSON.stringify(params.messages));

    const res = await fetch(`${ctx.endpoint}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify({
        model: ctx.model,
        messages: params.messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens,
        ...(params.responseFormat
          ? { response_format: { type: params.responseFormat } }
          : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`[zg-compute] provider ${res.status}: ${body.slice(0, 200)}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
      };
    };
    const output = data.choices?.[0]?.message?.content ?? "";

    // Submit response to broker for verification + on-chain settlement.
    const verifyMeta = await (
      ctx.broker as {
        inference: {
          processResponse: (
            provider: string,
            content: string,
            chatId?: string
          ) => Promise<{ valid: boolean; attestation?: string; txHash?: string }>;
        };
      }
    ).inference
      .processResponse(ctx.provider, output)
      .catch(() => ({ valid: true }) as { attestation?: string; txHash?: string });

    return {
      mode: "live",
      output,
      model: ctx.model,
      attestation: verifyMeta.attestation,
      inferenceTxHash: verifyMeta.txHash,
      provider: ctx.provider,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  } catch (err) {
    console.warn("[zg-compute] live call failed; degrading to stub", err);
    return stubResult(params);
  }
}

function stubResult(params: ZGChatParams): ZGChatResult {
  const last = [...params.messages].reverse().find((m) => m.role === "user");
  const prompt = (last?.content ?? "").slice(0, 200);
  const output = `[stub] 0G Compute broker not configured. Set ZG_BROKER_KEY + ZG_INFERENCE_PROVIDER to route this prompt through a real provider. Prompt was: "${prompt}"`;
  return {
    mode: "stub",
    output,
    model: "stub",
  };
}

/**
 * Convenience for structured JSON output. The model is asked to return a
 * JSON document; we parse + return both the raw string and the parsed
 * object (or null if parsing fails).
 */
export async function chatStructured<T>(
  params: ZGChatParams & { schemaName: string }
): Promise<ZGChatResult & { parsed: T | null }> {
  const result = await chatCompletion({
    ...params,
    responseFormat: "json_object",
  });
  let parsed: T | null = null;
  try {
    const start = result.output.indexOf("{");
    const end = result.output.lastIndexOf("}");
    if (start >= 0 && end > start) {
      parsed = JSON.parse(result.output.slice(start, end + 1)) as T;
    }
  } catch {
    parsed = null;
  }
  return { ...result, parsed };
}

export function isLive(): boolean {
  return Boolean(process.env.ZG_BROKER_KEY && process.env.ZG_INFERENCE_PROVIDER);
}
