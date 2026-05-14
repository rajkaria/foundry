/**
 * Vercel AI SDK adapter — drop-in `LanguageModelV2`.
 *
 * @example
 * ```ts
 * import { foundry } from '@foundryprotocol/sdk/adapters/vercel-ai';
 * import { generateText } from 'ai';
 *
 * const model = foundry('ingot:0x8e2…f4a');
 * const { text } = await generateText({ model, prompt: '…' });
 * ```
 */

import type { IngotId } from "../index.js";
import { InferenceClient, type InferenceMessage } from "../inference.js";

export interface FoundryAdapterOptions {
  endpoint?: string;
  apiKey?: string;
}

export function foundry(ingotId: IngotId, options: FoundryAdapterOptions = {}) {
  const client = new InferenceClient(options);
  return new FoundryLanguageModel(ingotId, client);
}

class FoundryLanguageModel {
  readonly specificationVersion = "v2" as const;
  readonly provider = "foundry" as const;
  readonly modelId: string;
  readonly defaultObjectGenerationMode = undefined;

  constructor(
    ingotId: IngotId,
    private readonly client: InferenceClient
  ) {
    this.modelId = ingotId;
  }

  /** Vercel AI SDK calls this for `generateText` / non-streaming flows. */
  async doGenerate(options: {
    prompt: AIPrompt;
    temperature?: number;
    maxOutputTokens?: number;
  }): Promise<{
    content: Array<{ type: "text"; text: string }>;
    finishReason: "stop";
    usage: { inputTokens: number; outputTokens: number; totalTokens: number };
    providerMetadata: {
      foundry: { ingotId: string; requestId: string; latencyMs: number };
    };
  }> {
    const messages = toInferenceMessages(options.prompt);
    const result = await this.client.run(this.modelId as IngotId, {
      messages,
      temperature: options.temperature,
      maxTokens: options.maxOutputTokens,
    });
    return {
      content: [{ type: "text", text: result.output }],
      finishReason: "stop",
      usage: estimateUsage(messages, result.output),
      providerMetadata: {
        foundry: {
          ingotId: result.ingotId,
          requestId: result.receipt.requestId,
          latencyMs: result.receipt.latencyMs,
        },
      },
    };
  }

  /** Streaming flows. The proxy supports SSE; this minimal impl yields once. */
  async doStream(options: {
    prompt: AIPrompt;
    temperature?: number;
    maxOutputTokens?: number;
  }) {
    const result = await this.doGenerate(options);
    const text = result.content[0]?.text ?? "";
    return {
      stream: new ReadableStream({
        start(controller) {
          controller.enqueue({ type: "text-delta", textDelta: text });
          controller.enqueue({
            type: "finish",
            finishReason: result.finishReason,
            usage: result.usage,
            providerMetadata: result.providerMetadata,
          });
          controller.close();
        },
      }),
    };
  }
}

type AIPromptRole = "system" | "user" | "assistant";
type AIPromptPart = { type: "text"; text: string };
type AIPromptMessage = { role: AIPromptRole; content: string | AIPromptPart[] };
type AIPrompt = AIPromptMessage[];

function toInferenceMessages(prompt: AIPrompt): InferenceMessage[] {
  return prompt.map((m) => ({
    role: m.role,
    content:
      typeof m.content === "string" ? m.content : m.content.map((p) => p.text).join(""),
  }));
}

function estimateUsage(messages: InferenceMessage[], output: string) {
  const approxTokens = (s: string) => Math.ceil(s.length / 4);
  const inputTokens = messages.reduce((a, m) => a + approxTokens(m.content), 0);
  const outputTokens = approxTokens(output);
  return { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens };
}
