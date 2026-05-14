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
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  type PublicClient,
  type WalletClient,
  type Hex,
  type Address,
  defineChain,
  parseEther,
} from "viem";
import { forgeAbi, forgeFactoryAbi, ingotAbi, revenueSplitterAbi } from "./abis.js";
import { getDeployment, type Deployment } from "./deployments.js";

export type IngotId = `ingot:0x${string}`;
export type ForgeId = `forge:0x${string}`;
export type { Address, Hex };

const ARISTOTLE_DEFAULT_RPC = "https://rpc.0g.network";

export const aristotle = defineChain({
  id: 0x40dd, // placeholder — replace with the canonical Aristotle chainId at deploy
  name: "0G Aristotle",
  nativeCurrency: { name: "OG", symbol: "OG", decimals: 18 },
  rpcUrls: { default: { http: [ARISTOTLE_DEFAULT_RPC] } },
});

export interface FoundryConfig {
  contracts?: "aristotle";
  rpcUrl?: string;
  walletClient?: WalletClient;
}

function unwrap<T extends `${string}:0x${string}`>(id: T): Address {
  return ("0x" + id.split(":0x")[1]) as Address;
}

export class Foundry {
  readonly config: Required<Pick<FoundryConfig, "contracts">> & FoundryConfig;
  readonly deployment: Deployment;
  readonly publicClient: PublicClient;
  readonly walletClient?: WalletClient;

  constructor(config: FoundryConfig = {}) {
    this.config = { contracts: "aristotle", ...config };
    this.deployment = getDeployment(this.config.contracts);
    this.publicClient = createPublicClient({
      chain: aristotle,
      transport: http(this.config.rpcUrl ?? ARISTOTLE_DEFAULT_RPC),
    });
    this.walletClient = config.walletClient;
  }

  /* ─── forge ────────────────────────────────────────────────────────── */

  readonly forge = {
    create: async (params: {
      modelSpec: Hex;
      evalSpec: Hex;
      evalCoordinator: Address;
      contributionWindowEnds: bigint;
    }): Promise<{ txHash: Hex }> => {
      const wc = this.requireWallet();
      const [account] = await wc.getAddresses();
      const txHash = await wc.writeContract({
        chain: aristotle,
        account,
        address: this.deployment.ForgeFactory,
        abi: forgeFactoryAbi,
        functionName: "createForge",
        args: [
          params.modelSpec,
          params.evalSpec,
          params.evalCoordinator,
          params.contributionWindowEnds,
        ],
      });
      return { txHash };
    },

    contributeData: async (forgeId: ForgeId, storageRoot: Hex): Promise<{ txHash: Hex }> => {
      const wc = this.requireWallet();
      const [account] = await wc.getAddresses();
      const txHash = await wc.writeContract({
        chain: aristotle,
        account,
        address: unwrap(forgeId),
        abi: forgeAbi,
        functionName: "contributeData",
        args: [storageRoot],
      });
      return { txHash };
    },

    contributeCompute: async (
      forgeId: ForgeId,
      amountEth: string
    ): Promise<{ txHash: Hex }> => {
      const wc = this.requireWallet();
      const [account] = await wc.getAddresses();
      const value = parseEther(amountEth);
      const txHash = await wc.writeContract({
        chain: aristotle,
        account,
        address: unwrap(forgeId),
        abi: forgeAbi,
        functionName: "contributeCompute",
        args: [value],
        value,
      });
      return { txHash };
    },

    fundForge: async (forgeId: ForgeId, amountEth: string): Promise<{ txHash: Hex }> => {
      const wc = this.requireWallet();
      const [account] = await wc.getAddresses();
      const value = parseEther(amountEth);
      const txHash = await wc.writeContract({
        chain: aristotle,
        account,
        address: unwrap(forgeId),
        abi: forgeAbi,
        functionName: "fundForge",
        args: [],
        value,
      });
      return { txHash };
    },

    state: async (forgeId: ForgeId): Promise<number> => {
      const result = await this.publicClient.readContract({
        address: unwrap(forgeId),
        abi: forgeAbi,
        functionName: "state",
      });
      return Number(result);
    },

    list: async (): Promise<ForgeId[]> => {
      const total = await this.publicClient.readContract({
        address: this.deployment.ForgeFactory,
        abi: forgeFactoryAbi,
        functionName: "count",
      });
      const ids: ForgeId[] = [];
      for (let i = 0n; i < (total as bigint); ++i) {
        const addr = (await this.publicClient.readContract({
          address: this.deployment.ForgeFactory,
          abi: forgeFactoryAbi,
          functionName: "allForges",
          args: [i],
        })) as Address;
        ids.push(`forge:${addr}` as ForgeId);
      }
      return ids;
    },
  };

  /* ─── ingot ────────────────────────────────────────────────────────── */

  readonly ingot = {
    meta: async (tokenId: bigint) => {
      const [weightsRoot, lineageParent, forge, mintedAt, weightsSet] =
        (await this.publicClient.readContract({
          address: this.deployment.Ingot,
          abi: ingotAbi,
          functionName: "meta",
          args: [tokenId],
        })) as [Hex, Hex, Address, bigint, boolean];
      return { weightsRoot, lineageParent, forge, mintedAt, weightsSet };
    },

    shareOf: async (tokenId: bigint, holder: Address): Promise<bigint> => {
      return (await this.publicClient.readContract({
        address: this.deployment.Ingot,
        abi: ingotAbi,
        functionName: "shareOf",
        args: [tokenId, holder],
      })) as bigint;
    },
  };

  /* ─── inference ────────────────────────────────────────────────────── */

  readonly inference = {
    run: async (
      _ingotId: IngotId,
      params: { input: string }
    ): Promise<{ output: string; receipt: { txHash?: Hex } }> => {
      // Sprint 2 wires this to 0G Compute through the OpenAI-compatible
      // proxy on api.foundryprotocol.xyz. Until then, throw a clear error
      // rather than silently mocking output.
      void params;
      throw new Error(
        "[foundry-sdk] inference.run() requires the inference proxy " +
          "(Sprint 2). Use the Vercel AI SDK adapter once it lands."
      );
    },
  };

  /* ─── revenue ──────────────────────────────────────────────────────── */

  readonly revenue = {
    claimable: async (tokenId: bigint, holder: Address): Promise<bigint> => {
      return (await this.publicClient.readContract({
        address: this.deployment.RevenueSplitter,
        abi: revenueSplitterAbi,
        functionName: "claimable",
        args: [tokenId, holder],
      })) as bigint;
    },

    claim: async (tokenId: bigint): Promise<{ txHash: Hex }> => {
      const wc = this.requireWallet();
      const [account] = await wc.getAddresses();
      const txHash = await wc.writeContract({
        chain: aristotle,
        account,
        address: this.deployment.RevenueSplitter,
        abi: revenueSplitterAbi,
        functionName: "claim",
        args: [tokenId],
      });
      return { txHash };
    },
  };

  /* ─── lineage ──────────────────────────────────────────────────────── */

  readonly lineage = {
    get: async (tokenId: bigint): Promise<{ parent: Hex }> => {
      const meta = await this.ingot.meta(tokenId);
      return { parent: meta.lineageParent };
    },
  };

  private requireWallet(): WalletClient {
    if (!this.walletClient) {
      throw new Error(
        "[foundry-sdk] walletClient required for write operations."
      );
    }
    return this.walletClient;
  }
}

export { createWalletClient, http, parseEther };
export const VERSION = "0.1.0-alpha" as const;
