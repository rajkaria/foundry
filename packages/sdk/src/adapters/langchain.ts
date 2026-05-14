/**
 * LangChain adapter — `FoundryChat` is a drop-in `BaseChatModel`.
 *
 * @example
 * ```ts
 * import { FoundryChat } from '@foundryprotocol/sdk/adapters/langchain';
 * import { HumanMessage } from '@langchain/core/messages';
 *
 * const llm = new FoundryChat({ ingotId: 'ingot:0x8e2…f4a' });
 * const res = await llm.invoke([new HumanMessage('Translate: hello')]);
 * console.log(res.content);
 * ```
 *
 * The adapter speaks the OpenAI-compatible Foundry proxy at
 * `api.foundryprotocol.xyz/v1`. Each `invoke()` round-trips through the
 * RevenueSplitter, so callers automatically pay the Ingot's co-owners.
 *
 * Requires `@langchain/core` as a peer dependency.
 */

import { InferenceClient, type InferenceMessage } from "../inference.js";
import type { IngotId } from "../index.js";

// We import types lazily — LangChain is a heavy peer dependency that we
// don't want to force on consumers who only use the Vercel AI adapter.
type AnyMessage = {
  _getType?: () => string;
  getType?: () => string;
  role?: string;
  content: string | unknown;
};

type ChatGeneration = {
  text: string;
  message: {
    _getType: () => "ai";
    content: string;
    additional_kwargs: Record<string, unknown>;
  };
  generationInfo?: Record<string, unknown>;
};

type ChatResult = {
  generations: ChatGeneration[];
  llmOutput?: Record<string, unknown>;
};

type CallOptions = {
  stop?: string[];
  signal?: AbortSignal;
  callbacks?: unknown;
};

export interface FoundryChatConfig {
  ingotId: IngotId | `0x${string}`;
  endpoint?: string;
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
  fetch?: typeof fetch;
}

/**
 * BaseChatModel-compatible LangChain integration for Foundry Ingots.
 *
 * Conforms structurally to `@langchain/core/language_models/chat_models`'s
 * `BaseChatModel` (the methods LangChain runtime calls). The class works
 * both with LangChain Expression Language (LCEL) chains and stand-alone.
 */
export class FoundryChat {
  readonly ingotId: IngotId;
  readonly temperature: number;
  readonly maxTokens?: number;
  readonly lc_serializable = true;
  readonly lc_namespace = ["foundryprotocol", "chat_models"];

  private readonly client: InferenceClient;

  constructor(config: FoundryChatConfig) {
    this.ingotId = normalizeIngotId(config.ingotId);
    this.temperature = config.temperature ?? 0.7;
    this.maxTokens = config.maxTokens;
    this.client = new InferenceClient({
      endpoint: config.endpoint,
      apiKey: config.apiKey,
      fetch: config.fetch,
    });
  }

  _llmType(): string {
    return "foundry-ingot";
  }

  _modelType(): string {
    return "chat";
  }

  /**
   * LangChain `invoke()` accepts a string, a BaseMessage[], or a PromptValue.
   * We coerce all three into our internal message shape.
   */
  async invoke(
    input: string | AnyMessage[] | { toChatMessages?: () => AnyMessage[]; toString?: () => string },
    options?: CallOptions
  ): Promise<{ content: string; additional_kwargs: Record<string, unknown> }> {
    const messages = coerceMessages(input);
    const result = await this._generate(messages, options ?? {});
    const gen = result.generations[0];
    return {
      content: gen.text,
      additional_kwargs: gen.message.additional_kwargs,
    };
  }

  async _generate(messages: AnyMessage[], options: CallOptions): Promise<ChatResult> {
    const inferenceMessages = messages.map(toInferenceMessage);
    const res = await this.client.run(this.ingotId, {
      messages: inferenceMessages,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
    });

    const additionalKwargs = {
      foundry: {
        ingotId: res.ingotId,
        receipt: res.receipt,
      },
    };

    return {
      generations: [
        {
          text: res.output,
          message: {
            _getType: () => "ai" as const,
            content: res.output,
            additional_kwargs: additionalKwargs,
          },
          generationInfo: { latencyMs: res.receipt.latencyMs },
        },
      ],
      llmOutput: {
        tokenUsage: { totalTokens: 0 },
        foundry: additionalKwargs.foundry,
      },
    };
  }

  /** Identifying parameters — LangChain caching keys on this. */
  _identifyingParams(): Record<string, unknown> {
    return {
      ingotId: this.ingotId,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
    };
  }
}

function normalizeIngotId(id: string): IngotId {
  if (id.startsWith("ingot:")) return id as IngotId;
  if (id.startsWith("0x")) return `ingot:${id}` as IngotId;
  throw new Error(`[foundry/langchain] invalid ingotId: ${id}`);
}

function coerceMessages(
  input: string | AnyMessage[] | { toChatMessages?: () => AnyMessage[]; toString?: () => string }
): AnyMessage[] {
  if (typeof input === "string") {
    return [{ role: "user", content: input }];
  }
  if (Array.isArray(input)) return input;
  if (typeof input === "object" && input !== null) {
    if (typeof input.toChatMessages === "function") return input.toChatMessages();
    if (typeof input.toString === "function") {
      return [{ role: "user", content: input.toString() }];
    }
  }
  throw new Error("[foundry/langchain] could not coerce input to messages");
}

function toInferenceMessage(m: AnyMessage): InferenceMessage {
  const type = m._getType?.() ?? m.getType?.() ?? m.role ?? "human";
  const role: InferenceMessage["role"] =
    type === "system"
      ? "system"
      : type === "ai" || type === "assistant"
        ? "assistant"
        : "user";
  const content = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
  return { role, content };
}
