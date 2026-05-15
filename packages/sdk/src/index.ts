/**
 * @foundryprotocol/sdk
 *
 * The Foundry SDK — pool data, compute, capital → co-train a model → own a
 * verifiable, revenue-generating share. End-to-end on 0G (Aristotle mainnet).
 *
 * Three-line inference:
 * ```ts
 * import { Foundry } from '@foundryprotocol/sdk';
 *
 * const foundry = new Foundry({ contracts: 'aristotle' });
 * const { output } = await foundry.inference.run('ingot:0x…', { input: 'Hello' });
 * ```
 *
 * Full Forge lifecycle (server-side):
 * ```ts
 * import { Foundry, createWalletClient, http, parseEther } from '@foundryprotocol/sdk';
 * import { privateKeyToAccount } from 'viem/accounts';
 *
 * const account = privateKeyToAccount(process.env.PRIVATE_KEY!);
 * const walletClient = createWalletClient({ account, chain: foundry.chain, transport: http() });
 * const f = new Foundry({ contracts: 'aristotle', walletClient });
 *
 * // 1. Upload dataset to 0G Storage
 * const { rootHash } = await f.storage.uploadJson(myDataset, { signer: ethersSigner });
 *
 * // 2. Create Forge + contribute
 * const { forgeId } = await f.forge.create({ ... });
 * await f.forge.contributeData(forgeId, rootHash);
 *
 * // 3. (off-chain) eval coordinator submits scores → Ingot mints
 *
 * // 4. Inference + revenue
 * const { output } = await f.inference.run('ingot:0x…', { input: 'Hi' });
 * await f.revenue.claim(tokenId);
 * ```
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbiItem,
  parseEther,
  defineChain,
  type PublicClient,
  type WalletClient,
  type Hex,
  type Address,
} from "viem";
import {
  forgeAbi,
  forgeFactoryAbi,
  ingotAbi,
  revenueSplitterAbi,
  contributionRegistryAbi,
  ingotRegistryAbi,
} from "./abis.js";
import {
  getDeployment,
  deployments,
  isDeployed,
  type Deployment,
  type NetworkName,
} from "./deployments.js";
import {
  InferenceClient,
  type InferenceParams,
  type InferenceResult,
} from "./inference.js";
import { StorageClient, type StorageClientConfig } from "./storage.js";
import { DAClient, type DAClientConfig } from "./da.js";
import {
  digestEnvelope,
  signEnvelope,
  recoverEnvelopeSigner,
  verifyEnvelope,
  type AttestationEnvelope,
  type SignedEnvelope,
} from "./attestation.js";

/* ─── identifier types ──────────────────────────────────────────────── */

export type IngotId = `ingot:0x${string}`;
export type ForgeId = `forge:0x${string}`;
export type AgentId = `${number}:${IngotId}:${number}`; // chainId:ingotId:tokenId

export type { Address, Hex };
export type {
  InferenceParams,
  InferenceResult,
  InferenceMessage,
} from "./inference.js";
export type { Deployment, NetworkName };
export type { StorageClientConfig, UploadOptions, UploadResult } from "./storage.js";
export type { DAClientConfig, DAPublishResult } from "./da.js";
export type { AttestationEnvelope, SignedEnvelope } from "./attestation.js";

export { InferenceClient, InferenceError } from "./inference.js";
export { StorageClient, StorageError } from "./storage.js";
export { DAClient, DAError } from "./da.js";
export {
  digestEnvelope,
  signEnvelope,
  recoverEnvelopeSigner,
  verifyEnvelope,
} from "./attestation.js";
export { deployments, getDeployment, isDeployed };
export {
  forgeAbi,
  forgeFactoryAbi,
  ingotAbi,
  revenueSplitterAbi,
  contributionRegistryAbi,
  ingotRegistryAbi,
} from "./abis.js";

/* ─── chain ─────────────────────────────────────────────────────────── */

const ARISTOTLE_DEFAULT_RPC = "https://evmrpc.0g.ai";
const ARISTOTLE_CHAIN_ID = 16661; // 0x4115 — 0G Aristotle mainnet
const GALILEO_CHAIN_ID = 16601;
const GALILEO_DEFAULT_RPC = "https://evmrpc-testnet.0g.ai";

export const aristotle = defineChain({
  id: ARISTOTLE_CHAIN_ID,
  name: "0G Aristotle",
  nativeCurrency: { name: "OG", symbol: "OG", decimals: 18 },
  rpcUrls: { default: { http: [ARISTOTLE_DEFAULT_RPC] } },
  blockExplorers: { default: { name: "0G Explorer", url: "https://chainscan.0g.ai" } },
});

export const galileo = defineChain({
  id: GALILEO_CHAIN_ID,
  name: "0G Galileo",
  nativeCurrency: { name: "OG", symbol: "OG", decimals: 18 },
  rpcUrls: { default: { http: [GALILEO_DEFAULT_RPC] } },
  blockExplorers: {
    default: { name: "0G Explorer Testnet", url: "https://chainscan-galileo.0g.ai" },
  },
});

export const chains = { aristotle, galileo } as const;

/* ─── client ────────────────────────────────────────────────────────── */

export interface FoundryConfig {
  contracts?: NetworkName;
  rpcUrl?: string;
  walletClient?: WalletClient;
  inferenceEndpoint?: string;
  inferenceApiKey?: string;
  storage?: StorageClientConfig;
  da?: DAClientConfig;
}

function unwrap<T extends `${string}:0x${string}`>(id: T): Address {
  return ("0x" + id.split(":0x")[1]) as Address;
}

function wrapForge(addr: Address): ForgeId {
  return `forge:${addr}` as ForgeId;
}

function wrapIngot(tokenId: bigint, ingotAddr: Address): IngotId {
  return `ingot:${ingotAddr}/${tokenId}` as unknown as IngotId;
}

/** Resolve a Forge state code to its enum string. */
export const FORGE_STATES = [
  "Open",
  "Evaluating",
  "Minting",
  "Training",
  "Live",
] as const;
export type ForgeState = (typeof FORGE_STATES)[number];

export const CONTRIBUTION_TYPES = ["Data", "Compute", "Capital"] as const;
export type ContributionType = (typeof CONTRIBUTION_TYPES)[number];

export interface ForgeFullState {
  id: ForgeId;
  address: Address;
  state: ForgeState;
  creator: Address;
  modelSpec: Hex;
  evalSpec: Hex;
  evalCoordinator: Address;
  contributionWindowEnds: bigint;
  attestation: Hex;
  tokenId: bigint;
}

export interface ContributionRecord {
  id: bigint;
  smith: Address;
  forge: Address;
  ctype: ContributionType;
  storageRoot: Hex;
  amount: bigint;
  timestamp: bigint;
  score: bigint;
}

export class Foundry {
  readonly config: Required<Pick<FoundryConfig, "contracts">> & FoundryConfig;
  readonly deployment: Deployment;
  readonly chain: typeof aristotle | typeof galileo;
  readonly publicClient: PublicClient;
  readonly walletClient?: WalletClient;
  readonly storage: StorageClient;
  readonly da: DAClient;
  private readonly inferenceClient: InferenceClient;

  constructor(config: FoundryConfig = {}) {
    const network = config.contracts ?? "aristotle";
    this.config = { contracts: network, ...config };
    this.deployment = getDeployment(network);
    this.chain = network === "galileo" ? galileo : aristotle;
    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(config.rpcUrl ?? this.chain.rpcUrls.default.http[0]),
    });
    this.walletClient = config.walletClient;
    this.inferenceClient = new InferenceClient({
      endpoint: config.inferenceEndpoint,
      apiKey: config.inferenceApiKey,
    });
    this.storage = new StorageClient({
      network: network === "galileo" ? "galileo" : "aristotle",
      ...(config.storage ?? {}),
    });
    this.da = new DAClient({
      network: network === "galileo" ? "galileo" : "aristotle",
      ...(config.da ?? {}),
    });
  }

  /* ─── forge ────────────────────────────────────────────────────────── */

  readonly forge = {
    create: async (params: {
      modelSpec: Hex;
      evalSpec: Hex;
      evalCoordinator: Address;
      contributionWindowEnds: bigint;
    }): Promise<{ txHash: Hex; forgeId?: ForgeId }> => {
      const wc = this.requireWallet();
      const [account] = await wc.getAddresses();
      const txHash = await wc.writeContract({
        chain: this.chain,
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
      await this.publicClient.waitForTransactionReceipt({ hash: txHash });
      // Read the most recent Forge from `allForges(count - 1)` — robust to
      // event topic changes in future ABI revisions.
      const count = (await this.publicClient.readContract({
        address: this.deployment.ForgeFactory,
        abi: forgeFactoryAbi,
        functionName: "count",
      })) as bigint;
      let forgeId: ForgeId | undefined;
      if (count > 0n) {
        const addr = (await this.publicClient.readContract({
          address: this.deployment.ForgeFactory,
          abi: forgeFactoryAbi,
          functionName: "allForges",
          args: [count - 1n],
        })) as Address;
        forgeId = wrapForge(addr);
      }
      return { txHash, forgeId };
    },

    contributeData: async (
      forgeId: ForgeId,
      storageRoot: Hex
    ): Promise<{ txHash: Hex }> => {
      const wc = this.requireWallet();
      const [account] = await wc.getAddresses();
      const txHash = await wc.writeContract({
        chain: this.chain,
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
        chain: this.chain,
        account,
        address: unwrap(forgeId),
        abi: forgeAbi,
        functionName: "contributeCompute",
        args: [value],
        value,
      });
      return { txHash };
    },

    fundForge: async (
      forgeId: ForgeId,
      amountEth: string
    ): Promise<{ txHash: Hex }> => {
      const wc = this.requireWallet();
      const [account] = await wc.getAddresses();
      const value = parseEther(amountEth);
      const txHash = await wc.writeContract({
        chain: this.chain,
        account,
        address: unwrap(forgeId),
        abi: forgeAbi,
        functionName: "fundForge",
        args: [],
        value,
      });
      return { txHash };
    },

    startEvaluating: async (forgeId: ForgeId): Promise<{ txHash: Hex }> => {
      const wc = this.requireWallet();
      const [account] = await wc.getAddresses();
      const txHash = await wc.writeContract({
        chain: this.chain,
        account,
        address: unwrap(forgeId),
        abi: forgeAbi,
        functionName: "startEvaluating",
      });
      return { txHash };
    },

    submitEvalResult: async (
      forgeId: ForgeId,
      attestation: Hex,
      scores: bigint[]
    ): Promise<{ txHash: Hex }> => {
      const wc = this.requireWallet();
      const [account] = await wc.getAddresses();
      const txHash = await wc.writeContract({
        chain: this.chain,
        account,
        address: unwrap(forgeId),
        abi: forgeAbi,
        functionName: "submitEvalResult",
        args: [attestation, scores],
      });
      return { txHash };
    },

    mintOwnership: async (forgeId: ForgeId): Promise<{ txHash: Hex }> => {
      const wc = this.requireWallet();
      const [account] = await wc.getAddresses();
      const txHash = await wc.writeContract({
        chain: this.chain,
        account,
        address: unwrap(forgeId),
        abi: forgeAbi,
        functionName: "mintOwnership",
      });
      return { txHash };
    },

    setWeightsAndGoLive: async (
      forgeId: ForgeId,
      weightsRoot: Hex,
      lineageParent: Hex = "0x0000000000000000000000000000000000000000000000000000000000000000"
    ): Promise<{ txHash: Hex }> => {
      const wc = this.requireWallet();
      const [account] = await wc.getAddresses();
      const txHash = await wc.writeContract({
        chain: this.chain,
        account,
        address: unwrap(forgeId),
        abi: forgeAbi,
        functionName: "setWeightsAndGoLive",
        args: [weightsRoot, lineageParent],
      });
      return { txHash };
    },

    state: async (forgeId: ForgeId): Promise<ForgeState> => {
      const code = (await this.publicClient.readContract({
        address: unwrap(forgeId),
        abi: forgeAbi,
        functionName: "state",
      })) as number;
      return FORGE_STATES[code]!;
    },

    get: async (forgeId: ForgeId): Promise<ForgeFullState> => {
      const addr = unwrap(forgeId);
      const [
        state,
        creator,
        modelSpec,
        evalSpec,
        evalCoordinator,
        windowEnds,
        attestation,
        tokenId,
      ] = (await Promise.all([
        this.publicClient.readContract({
          address: addr,
          abi: forgeAbi,
          functionName: "state",
        }),
        this.publicClient.readContract({
          address: addr,
          abi: forgeAbi,
          functionName: "creator",
        }),
        this.publicClient.readContract({
          address: addr,
          abi: forgeAbi,
          functionName: "modelSpec",
        }),
        this.publicClient.readContract({
          address: addr,
          abi: forgeAbi,
          functionName: "evalSpec",
        }),
        this.publicClient.readContract({
          address: addr,
          abi: forgeAbi,
          functionName: "evalCoordinator",
        }),
        this.publicClient.readContract({
          address: addr,
          abi: forgeAbi,
          functionName: "contributionWindowEnds",
        }),
        this.publicClient.readContract({
          address: addr,
          abi: forgeAbi,
          functionName: "attestation",
        }),
        this.publicClient.readContract({
          address: addr,
          abi: forgeAbi,
          functionName: "tokenId",
        }),
      ])) as [number, Address, Hex, Hex, Address, bigint, Hex, bigint];

      return {
        id: forgeId,
        address: addr,
        state: FORGE_STATES[state]!,
        creator,
        modelSpec,
        evalSpec,
        evalCoordinator,
        contributionWindowEnds: windowEnds,
        attestation,
        tokenId,
      };
    },

    list: async (): Promise<ForgeId[]> => {
      const total = (await this.publicClient.readContract({
        address: this.deployment.ForgeFactory,
        abi: forgeFactoryAbi,
        functionName: "count",
      })) as bigint;
      const ids: ForgeId[] = [];
      for (let i = 0n; i < total; ++i) {
        const addr = (await this.publicClient.readContract({
          address: this.deployment.ForgeFactory,
          abi: forgeFactoryAbi,
          functionName: "allForges",
          args: [i],
        })) as Address;
        ids.push(wrapForge(addr));
      }
      return ids;
    },

    /** Stream `ContributionAdded` events from a Forge since `fromBlock`. */
    contributionsFromLogs: async (
      forgeId: ForgeId,
      fromBlock: bigint = 0n
    ): Promise<Array<{ contributionId: bigint; smith: Address; ctype: number }>> => {
      const logs = await this.publicClient.getLogs({
        address: unwrap(forgeId),
        event: parseAbiItem(
          "event ContributionAdded(uint256 indexed contributionId, address indexed smith, uint8 ctype)"
        ),
        fromBlock,
      });
      return logs.map((l) => ({
        contributionId: l.args.contributionId as bigint,
        smith: l.args.smith as Address,
        ctype: l.args.ctype as number,
      }));
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

    shareOf: (tokenId: bigint, holder: Address): Promise<bigint> =>
      this.publicClient.readContract({
        address: this.deployment.Ingot,
        abi: ingotAbi,
        functionName: "shareOf",
        args: [tokenId, holder],
      }) as Promise<bigint>,

    sharesTotalIssued: (tokenId: bigint): Promise<bigint> =>
      this.publicClient.readContract({
        address: this.deployment.Ingot,
        abi: ingotAbi,
        functionName: "sharesTotalIssued",
        args: [tokenId],
      }) as Promise<bigint>,

    ownerOf: (tokenId: bigint): Promise<Address> =>
      this.publicClient.readContract({
        address: this.deployment.Ingot,
        abi: ingotAbi,
        functionName: "ownerOf",
        args: [tokenId],
      }) as Promise<Address>,

    /** Resolve a tokenId to all shareholders by replaying `ShareMinted` events. */
    holdersFromLogs: async (
      tokenId: bigint,
      fromBlock: bigint = 0n
    ): Promise<Array<{ holder: Address; share: bigint }>> => {
      const logs = await this.publicClient.getLogs({
        address: this.deployment.Ingot,
        event: parseAbiItem(
          "event ShareMinted(uint256 indexed tokenId, address indexed holder, uint128 share)"
        ),
        fromBlock,
      });
      const filtered = logs.filter((l) => l.args.tokenId === tokenId);
      const totals = new Map<Address, bigint>();
      for (const l of filtered) {
        const holder = l.args.holder as Address;
        totals.set(holder, (totals.get(holder) ?? 0n) + (l.args.share as bigint));
      }
      return [...totals.entries()].map(([holder, share]) => ({ holder, share }));
    },

    agentId: (tokenId: bigint): AgentId =>
      `${this.chain.id}:ingot:${this.deployment.Ingot}/${tokenId}` as unknown as AgentId,
  };

  /* ─── contribution ─────────────────────────────────────────────────── */

  readonly contribution = {
    get: async (id: bigint): Promise<ContributionRecord> => {
      const row = (await this.publicClient.readContract({
        address: this.deployment.ContributionRegistry,
        abi: contributionRegistryAbi,
        functionName: "get",
        args: [id],
      })) as {
        smith: Address;
        forge: Address;
        ctype: number;
        storageRoot: Hex;
        amount: bigint;
        timestamp: bigint;
        score: bigint;
      };
      return {
        id,
        smith: row.smith,
        forge: row.forge,
        ctype: CONTRIBUTION_TYPES[row.ctype]!,
        storageRoot: row.storageRoot,
        amount: row.amount,
        timestamp: row.timestamp,
        score: row.score,
      };
    },

    count: (): Promise<bigint> =>
      this.publicClient.readContract({
        address: this.deployment.ContributionRegistry,
        abi: contributionRegistryAbi,
        functionName: "count",
      }) as Promise<bigint>,

    listBySmith: async (smith: Address): Promise<bigint[]> => {
      const out: bigint[] = [];
      for (let i = 0n; ; ++i) {
        try {
          const id = (await this.publicClient.readContract({
            address: this.deployment.ContributionRegistry,
            abi: contributionRegistryAbi,
            functionName: "bySmith",
            args: [smith, i],
          })) as bigint;
          out.push(id);
        } catch {
          break;
        }
      }
      return out;
    },
  };

  /* ─── inference ────────────────────────────────────────────────────── */

  readonly inference = {
    run: (ingotId: IngotId, params: InferenceParams) =>
      this.inferenceClient.run(ingotId, params),
  };

  /* ─── revenue ──────────────────────────────────────────────────────── */

  readonly revenue = {
    claimable: (tokenId: bigint, holder: Address): Promise<bigint> =>
      this.publicClient.readContract({
        address: this.deployment.RevenueSplitter,
        abi: revenueSplitterAbi,
        functionName: "claimable",
        args: [tokenId, holder],
      }) as Promise<bigint>,

    totalReceived: (tokenId: bigint): Promise<bigint> =>
      this.publicClient.readContract({
        address: this.deployment.RevenueSplitter,
        abi: revenueSplitterAbi,
        functionName: "totalReceived",
        args: [tokenId],
      }) as Promise<bigint>,

    claim: async (tokenId: bigint): Promise<{ txHash: Hex }> => {
      const wc = this.requireWallet();
      const [account] = await wc.getAddresses();
      const txHash = await wc.writeContract({
        chain: this.chain,
        account,
        address: this.deployment.RevenueSplitter,
        abi: revenueSplitterAbi,
        functionName: "claim",
        args: [tokenId],
      });
      return { txHash };
    },

    /**
     * Settle inference revenue for an Ingot by sending native OG to the
     * RevenueSplitter. Called server-side by the inference proxy after a
     * successful 0G Compute response.
     */
    deposit: async (tokenId: bigint, amountWei: bigint): Promise<{ txHash: Hex }> => {
      const wc = this.requireWallet();
      const [account] = await wc.getAddresses();
      const txHash = await wc.writeContract({
        chain: this.chain,
        account,
        address: this.deployment.RevenueSplitter,
        abi: revenueSplitterAbi,
        functionName: "receivePayment",
        args: [tokenId],
        value: amountWei,
      });
      return { txHash };
    },
  };

  /* ─── lineage ──────────────────────────────────────────────────────── */

  readonly lineage = {
    get: async (
      tokenId: bigint
    ): Promise<{ parent: Hex; weightsRoot: Hex; forge: Address }> => {
      const meta = await this.ingot.meta(tokenId);
      return {
        parent: meta.lineageParent,
        weightsRoot: meta.weightsRoot,
        forge: meta.forge,
      };
    },

    walkAncestors: async (tokenId: bigint, max: number = 32): Promise<bigint[]> => {
      const out: bigint[] = [tokenId];
      let cursor = tokenId;
      for (let i = 0; i < max; ++i) {
        const meta = await this.ingot.meta(cursor);
        if (
          meta.lineageParent ===
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        )
          break;
        // lineageParent encodes (chainId, ingotAddr, parentTokenId) hashed —
        // for now we surface the raw hash; callers can decode against their
        // local registry. Returning the chain breaks here.
        break;
      }
      return out;
    },
  };

  /* ─── ingot registry ───────────────────────────────────────────────── */

  readonly registry = {
    setProvider: async (
      tokenId: bigint,
      provider: Address,
      model: string,
      endpoint: string = ""
    ): Promise<{ txHash: Hex }> => {
      const wc = this.requireWallet();
      const [account] = await wc.getAddresses();
      const txHash = await wc.writeContract({
        chain: this.chain,
        account,
        address: this.deployment.IngotRegistry,
        abi: ingotRegistryAbi,
        functionName: "setProvider",
        args: [tokenId, provider, model, endpoint],
      });
      return { txHash };
    },

    providerOf: async (
      tokenId: bigint
    ): Promise<{
      provider: Address;
      model: string;
      endpoint: string;
      setBy: Address;
      updatedAt: bigint;
    } | null> => {
      const result = (await this.publicClient.readContract({
        address: this.deployment.IngotRegistry,
        abi: ingotRegistryAbi,
        functionName: "providerOf",
        args: [tokenId],
      })) as readonly [Address, string, string, Address, bigint];
      const [provider, model, endpoint, setBy, updatedAt] = result;
      if (provider === "0x0000000000000000000000000000000000000000") return null;
      return { provider, model, endpoint, setBy, updatedAt };
    },
  };

  /* ─── attestation envelopes (re-export for ergonomics) ────────────── */

  readonly attestation = {
    digest: digestEnvelope,
    sign: signEnvelope,
    recover: recoverEnvelopeSigner,
    verify: verifyEnvelope,
  };

  private requireWallet(): WalletClient {
    if (!this.walletClient) {
      throw new Error("[foundry-sdk] walletClient required for write operations.");
    }
    return this.walletClient;
  }
}

export { createWalletClient, http, parseEther };
export const VERSION = "1.0.0" as const;
