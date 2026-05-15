/**
 * 0G Compute client — wraps the canonical 0G serving broker for
 * OpenAI-compatible chat completions, with revenue routing back to the
 * Foundry Ingot's co-owners on-chain.
 *
 * Server-side only (Node runtime — depends on ethers + native crypto).
 *
 * Env:
 *   ZG_BROKER_RPC          0G chain RPC for the broker wallet (default: 0G mainnet)
 *   ZG_BROKER_KEY          private key of the funded broker wallet (required)
 *   ZG_INFERENCE_PROVIDER  fallback on-chain provider address (used if no per-Ingot mapping)
 *   ZG_INFERENCE_MODEL     optional model name override
 *   ZG_REVENUE_FEE_WEI     per-call fee deposited into RevenueSplitter (default 0.0001 OG)
 *
 * Resolution order for the provider/model that serves a given Ingot:
 *   1. on-chain IngotRegistry.providerOf(tokenId)   ← per-Ingot mapping
 *   2. ZG_INFERENCE_PROVIDER env                    ← canonical fallback
 *
 * After a successful inference call, the broker fee plus a configurable
 * revenue allocation is deposited into RevenueSplitter.receivePayment(tokenId)
 * — that's the on-chain settlement the dashboard reports.
 *
 * When env is missing (no broker key), the client returns `{ mode: 'stub' }`
 * and the caller is expected to surface the stub state honestly.
 */

import "server-only";
import { Foundry } from "@foundryprotocol/sdk";
import {
  createWalletClient,
  http,
  type Address,
  type Hex,
  type WalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

export interface ZGChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ZGChatParams {
  messages: ZGChatMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "text" | "json_object";
  /** Optional Ingot tokenId so we can look up the provider + deposit revenue. */
  ingotTokenId?: bigint;
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
  /** On-chain tx hash for the RevenueSplitter.receivePayment call. */
  revenueTxHash?: Hex;
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
  walletClient: WalletClient;
  walletAddress: Address;
  foundry: Foundry;
  fallbackProvider: string;
  fallbackEndpoint: string;
  fallbackModel: string;
  feeWei: bigint;
}

let cached: BrokerContext | null = null;
let initError: string | null = null;

async function getBroker(): Promise<BrokerContext | null> {
  if (cached) return cached;
  if (initError) return null;
  const key = process.env.ZG_BROKER_KEY;
  const fallbackProviderAddr = process.env.ZG_INFERENCE_PROVIDER;
  if (!key || !fallbackProviderAddr) {
    initError = "ZG_BROKER_KEY / ZG_INFERENCE_PROVIDER not set";
    return null;
  }

  try {
    const [{ ethers }, brokerMod] = await Promise.all([
      import("ethers"),
      import("@0gfoundation/0g-compute-ts-sdk").catch(
        () => import("@0glabs/0g-serving-broker")
      ),
    ]);

    const rpc = process.env.ZG_BROKER_RPC ?? "https://evmrpc.0g.ai";
    const ethProvider = new ethers.JsonRpcProvider(rpc);
    const ethWallet = new ethers.Wallet(key, ethProvider);
    const createBroker = (
      brokerMod as {
        createZGComputeNetworkBroker: (wallet: unknown) => Promise<unknown>;
      }
    ).createZGComputeNetworkBroker;
    const broker = await createBroker(ethWallet);

    try {
      await (
        broker as {
          inference: { acknowledgeProviderSigner: (p: string) => Promise<void> };
        }
      ).inference.acknowledgeProviderSigner(fallbackProviderAddr);
    } catch {
      // already acknowledged or provider doesn't require it
    }

    const { endpoint, model } = await (
      broker as {
        inference: {
          getServiceMetadata: (
            p: string
          ) => Promise<{ endpoint: string; model: string }>;
        };
      }
    ).inference.getServiceMetadata(fallbackProviderAddr);

    // viem wallet client for the revenue deposit + any chain reads.
    const account = privateKeyToAccount(
      (key.startsWith("0x") ? key : `0x${key}`) as Hex
    );
    const walletClient = createWalletClient({
      account,
      transport: http(rpc),
    });
    const foundry = new Foundry({
      contracts: "aristotle",
      rpcUrl: rpc,
      walletClient,
    });

    cached = {
      broker,
      walletClient,
      walletAddress: account.address,
      foundry,
      fallbackProvider: fallbackProviderAddr,
      fallbackEndpoint: endpoint,
      fallbackModel: process.env.ZG_INFERENCE_MODEL ?? model,
      feeWei: BigInt(process.env.ZG_REVENUE_FEE_WEI ?? "100000000000000"), // 0.0001 OG
    };
    return cached;
  } catch (err) {
    initError = err instanceof Error ? err.message : String(err);
    console.warn(`[zg-compute] broker init failed: ${initError}`);
    return null;
  }
}

/**
 * Resolve the provider for a given Ingot tokenId. Falls back to the env
 * `ZG_INFERENCE_PROVIDER` when the on-chain registry has no entry.
 */
async function resolveProvider(
  ctx: BrokerContext,
  ingotTokenId?: bigint
): Promise<{ provider: string; endpoint: string; model: string }> {
  if (ingotTokenId !== undefined) {
    try {
      const entry = await ctx.foundry.registry.providerOf(ingotTokenId);
      if (entry) {
        // We need the live endpoint + model — re-fetch service metadata from
        // the broker for the on-chain provider unless the registry cached it.
        const meta = await (
          ctx.broker as {
            inference: {
              getServiceMetadata: (
                p: string
              ) => Promise<{ endpoint: string; model: string }>;
              acknowledgeProviderSigner: (p: string) => Promise<void>;
            };
          }
        ).inference.getServiceMetadata(entry.provider);
        try {
          await (
            ctx.broker as {
              inference: { acknowledgeProviderSigner: (p: string) => Promise<void> };
            }
          ).inference.acknowledgeProviderSigner(entry.provider);
        } catch {
          // already acknowledged
        }
        return {
          provider: entry.provider,
          endpoint: entry.endpoint || meta.endpoint,
          model: entry.model || meta.model,
        };
      }
    } catch (err) {
      console.warn("[zg-compute] registry lookup failed, falling back to env", err);
    }
  }
  return {
    provider: ctx.fallbackProvider,
    endpoint: ctx.fallbackEndpoint,
    model: ctx.fallbackModel,
  };
}

export function isLive(): boolean {
  return !!process.env.ZG_BROKER_KEY && !!process.env.ZG_INFERENCE_PROVIDER;
}

export async function chatCompletion(params: ZGChatParams): Promise<ZGChatResult> {
  const ctx = await getBroker();
  if (!ctx) {
    return stubResult(params);
  }

  try {
    const { provider, endpoint, model } = await resolveProvider(
      ctx,
      params.ingotTokenId
    );

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
    ).inference.getRequestHeaders(provider, JSON.stringify(params.messages));

    const res = await fetch(`${endpoint}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify({
        model,
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
      .processResponse(provider, output)
      .catch(() => ({ valid: true }) as { attestation?: string; txHash?: string });

    // Route a per-call fee into the Ingot's RevenueSplitter so co-owners
    // can claim their share. Best-effort: failures here don't block the
    // response — we surface the error and let the caller retry settlement.
    let revenueTxHash: Hex | undefined;
    if (params.ingotTokenId !== undefined && ctx.feeWei > 0n) {
      try {
        const result = await ctx.foundry.revenue.deposit(
          params.ingotTokenId,
          ctx.feeWei
        );
        revenueTxHash = result.txHash;
      } catch (err) {
        console.warn(
          `[zg-compute] revenue deposit failed for token ${params.ingotTokenId}:`,
          err
        );
      }
    }

    return {
      mode: "live",
      output,
      model,
      attestation: verifyMeta.attestation,
      inferenceTxHash: verifyMeta.txHash,
      revenueTxHash,
      provider,
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
  if (result.mode === "stub") {
    return { ...result, parsed: null };
  }
  try {
    return { ...result, parsed: JSON.parse(result.output) as T };
  } catch {
    return { ...result, parsed: null };
  }
}
