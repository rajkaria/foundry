import type { IngotId } from "../index.js";

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
 *
 * v0.0 scaffold — full implementation lands Sprint 2.
 */
export function foundry(ingotId: IngotId) {
  return {
    specificationVersion: "v2" as const,
    provider: "foundry" as const,
    modelId: ingotId,
    doGenerate: async (): Promise<never> => {
      throw new Error(
        "[foundry/adapters/vercel-ai] not implemented in v0.0 — Sprint 2 deliverable."
      );
    },
    doStream: async (): Promise<never> => {
      throw new Error(
        "[foundry/adapters/vercel-ai] streaming not implemented in v0.0."
      );
    },
  };
}
