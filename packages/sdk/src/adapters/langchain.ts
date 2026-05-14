import type { IngotId } from "../index.js";

/**
 * LangChain adapter — drop-in chat model.
 *
 * @example
 * ```ts
 * import { FoundryChat } from '@foundryprotocol/sdk/adapters/langchain';
 *
 * const llm = new FoundryChat({ ingotId: 'ingot:0x8e2…f4a' });
 * const out = await llm.invoke('…');
 * ```
 *
 * v0.0 scaffold — full implementation lands Sprint 3.
 */
export class FoundryChat {
  readonly ingotId: IngotId;

  constructor(config: { ingotId: IngotId }) {
    this.ingotId = config.ingotId;
  }

  async invoke(_input: string): Promise<never> {
    throw new Error(
      "[foundry/adapters/langchain] not implemented in v0.0 — Sprint 3 deliverable."
    );
  }
}
