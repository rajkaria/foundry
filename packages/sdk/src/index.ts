/**
 * @foundryprotocol/sdk
 *
 * The Foundry SDK — call any Foundry Ingot in three lines.
 *
 * @example
 * ```ts
 * import { Foundry } from '@foundryprotocol/sdk';
 *
 * const foundry = new Foundry({ contracts: 'aristotle' });
 * const { output } = await foundry.inference.run('ingot:0x…', { input: 'Hello' });
 * ```
 *
 * Public surface is intentionally narrow at 0.x — see `docs/03-tech-architecture.md` §6
 * for the planned 1.0 surface. Adapters live under `@foundryprotocol/sdk/adapters/*`.
 */

export type IngotId = `ingot:0x${string}`;
export type ForgeId = `forge:0x${string}`;
export type Address = `0x${string}`;

export interface FoundryConfig {
  /** Named deployment to resolve contract addresses from. */
  contracts?: "aristotle";
  /** Override RPC URL; defaults to the public Aristotle endpoint. */
  rpcUrl?: string;
  /** Signer (viem WalletClient or PrivateKeyAccount) for write operations. */
  signer?: unknown;
}

/**
 * The Foundry client.
 *
 * v0.0 scaffold — methods declared, throwing until Sprint 1/2 lands the real
 * wiring against the deployed Aristotle contracts.
 */
export class Foundry {
  readonly config: FoundryConfig;

  readonly forge = {
    create: notImplemented<{ id: ForgeId }>("forge.create"),
    contributeData: notImplemented<{ txHash: string }>(
      "forge.contributeData"
    ),
    contributeCompute: notImplemented<{ txHash: string }>(
      "forge.contributeCompute"
    ),
    fundForge: notImplemented<{ txHash: string }>("forge.fundForge"),
    get: notImplemented<{ id: ForgeId; state: string }>("forge.get"),
    list: notImplemented<{ id: ForgeId; state: string }[]>("forge.list"),
  };

  readonly ingot = {
    get: notImplemented<{
      id: IngotId;
      weightsRoot: string;
      capTable: { holder: Address; share: number }[];
    }>("ingot.get"),
    list: notImplemented<{ id: IngotId }[]>("ingot.list"),
  };

  readonly inference = {
    run: notImplemented<{ output: string; receipt: { txHash: string } }>(
      "inference.run"
    ),
  };

  readonly revenue = {
    claim: notImplemented<{ txHash: string }>("revenue.claim"),
    claimable: notImplemented<bigint>("revenue.claimable"),
  };

  readonly lineage = {
    get: notImplemented<{ parent?: IngotId; children: IngotId[] }>(
      "lineage.get"
    ),
  };

  constructor(config: FoundryConfig = {}) {
    this.config = { contracts: "aristotle", ...config };
  }
}

function notImplemented<T>(name: string): (...args: unknown[]) => Promise<T> {
  return async () => {
    throw new Error(
      `[foundry-sdk] ${name} is not implemented in v0.0. ` +
        `Wired in Sprint 1/2 (see docs/04-sprint-plan.md).`
    );
  };
}

export const VERSION = "0.0.0" as const;
