/**
 * 0G Storage — upload, download, and verifiable Merkle roots.
 *
 * Wraps `@0gfoundation/0g-storage-ts-sdk` with an ergonomic surface tuned for
 * Foundry's data + manifest + weights flows. Three pieces of the Foundry
 * pipeline are 0G-Storage-native:
 *
 *   1. Dataset contributions   — uploaded encrypted, root logged on-chain
 *   2. Eval holdouts           — uploaded encrypted, root carried in Forge spec
 *   3. Model weights manifests — uploaded after training, root carried in Ingot
 *
 * Server-side & browser safe: file uploads use `MemData` (in-memory) so the
 * same module works in the wizard, in API routes, in CLI scripts, and in the
 * eval coordinator.
 *
 * @example Node — upload a JSON manifest and get the root
 * ```ts
 * import { Foundry } from '@foundryprotocol/sdk';
 * import { Wallet, JsonRpcProvider } from 'ethers';
 *
 * const provider = new JsonRpcProvider(process.env.RPC_ARISTOTLE!);
 * const signer = new Wallet(process.env.PRIVATE_KEY!, provider);
 * const foundry = new Foundry({ contracts: 'aristotle' });
 * const { rootHash } = await foundry.storage.uploadJson(
 *   { kind: 'dataset', forge: 'forge:0x…' },
 *   { signer }
 * );
 * ```
 */

import type { Hex } from "viem";

// We dynamic-import the 0G storage SDK lazily so the SDK remains lightweight
// (5 MB unpacked) in environments that never touch storage — e.g. inference-only
// clients in the browser.
type ZgStorageModule = typeof import("@0gfoundation/0g-storage-ts-sdk");

const ARISTOTLE_STORAGE_INDEXER = "https://indexer-storage.0g.network";
const GALILEO_STORAGE_INDEXER = "https://indexer-storage-testnet.0g.ai";
const DEFAULT_RPC = "https://evmrpc.0g.ai";

export interface StorageClientConfig {
  /** Indexer URL. Defaults to the Aristotle indexer. */
  indexerUrl?: string;
  /** Blockchain RPC used by the upload tx. Defaults to the Aristotle RPC. */
  rpcUrl?: string;
  /** Network preset — picks indexer + rpc defaults. */
  network?: "aristotle" | "galileo";
  /** Replicas to upload to. Defaults to 1 (matches the SDK default). */
  expectedReplicas?: number;
}

export interface UploadOptions {
  /** ethers Signer. Required for on-chain upload submission. */
  // The ethers types are deliberately loose here — we don't want a hard
  // dependency on ethers in the SDK. Callers pass any object that quacks
  // like a `Signer` (a viem WalletClient won't work; use ethers for this).
  signer: unknown;
  /** Optional ethers-style `TransactionOptions`. */
  txOptions?: Record<string, unknown>;
  /** Optional `UploadOption` (fee, finality, tags). */
  uploadOptions?: Record<string, unknown>;
}

export interface UploadResult {
  /** Merkle root of the uploaded payload — what you write to `ContributionRegistry`. */
  rootHash: Hex;
  /** 0G Storage tx hash. */
  txHash: Hex;
  /** Storage sequence number. */
  txSeq: number;
  /** Number of bytes uploaded (post-padding). */
  size: number;
}

export interface DownloadOptions {
  /** Pass an explicit indexer URL to override the client default. */
  indexerUrl?: string;
  /** Whether to verify Merkle proofs as fragments arrive (default `true`). */
  proof?: boolean;
}

export class StorageClient {
  readonly indexerUrl: string;
  readonly rpcUrl: string;
  readonly expectedReplicas: number;
  private cachedModule: ZgStorageModule | null = null;

  constructor(config: StorageClientConfig = {}) {
    const net = config.network ?? "aristotle";
    this.indexerUrl =
      config.indexerUrl ??
      (net === "galileo" ? GALILEO_STORAGE_INDEXER : ARISTOTLE_STORAGE_INDEXER);
    this.rpcUrl = config.rpcUrl ?? DEFAULT_RPC;
    this.expectedReplicas = config.expectedReplicas ?? 1;
  }

  /** Upload arbitrary bytes. */
  async upload(data: Uint8Array | ArrayBuffer, opts: UploadOptions): Promise<UploadResult> {
    const mod = await this.load();
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    const file = new mod.MemData(Array.from(bytes));
    const indexer = new mod.Indexer(this.indexerUrl);
    const [tx, err] = await indexer.upload(
      file,
      this.rpcUrl,
      opts.signer as never,
      opts.uploadOptions as never,
      undefined,
      opts.txOptions as never
    );
    if (err) throw new StorageError("upload", err);
    if ("rootHash" in (tx as object)) {
      const t = tx as { txHash: string; rootHash: string; txSeq: number };
      return {
        rootHash: normalizeHex(t.rootHash),
        txHash: normalizeHex(t.txHash),
        txSeq: t.txSeq,
        size: bytes.length,
      };
    }
    const t = tx as { txHashes: string[]; rootHashes: string[]; txSeqs: number[] };
    return {
      rootHash: normalizeHex(t.rootHashes[0]!),
      txHash: normalizeHex(t.txHashes[0]!),
      txSeq: t.txSeqs[0]!,
      size: bytes.length,
    };
  }

  /** Upload UTF-8 text. */
  async uploadText(text: string, opts: UploadOptions): Promise<UploadResult> {
    return this.upload(new TextEncoder().encode(text), opts);
  }

  /** Upload a JSON document — handy for manifests + specs. */
  async uploadJson(doc: unknown, opts: UploadOptions): Promise<UploadResult> {
    return this.uploadText(JSON.stringify(doc), opts);
  }

  /** Download bytes by root hash. */
  async download(rootHash: Hex, opts: DownloadOptions = {}): Promise<Uint8Array> {
    const mod = await this.load();
    const indexer = new mod.Indexer(opts.indexerUrl ?? this.indexerUrl);
    const [blob, err] = await indexer.downloadToBlob(rootHash, {
      proof: opts.proof ?? true,
    } as never);
    if (err) throw new StorageError("download", err);
    if (!blob) throw new StorageError("download", new Error("empty blob"));
    return new Uint8Array(await blob.arrayBuffer());
  }

  /** Download a UTF-8 string. */
  async downloadText(rootHash: Hex, opts: DownloadOptions = {}): Promise<string> {
    const bytes = await this.download(rootHash, opts);
    return new TextDecoder().decode(bytes);
  }

  /** Download and parse a JSON document. */
  async downloadJson<T = unknown>(rootHash: Hex, opts: DownloadOptions = {}): Promise<T> {
    return JSON.parse(await this.downloadText(rootHash, opts)) as T;
  }

  /**
   * Compute the Merkle root for a payload **without** uploading it. Useful
   * when you want a deterministic content-addressed reference (e.g. for spec
   * hashes that go into a Forge constructor) but don't need to pay for storage.
   */
  async computeRoot(data: Uint8Array | ArrayBuffer | string): Promise<Hex> {
    const mod = await this.load();
    const bytes = typeof data === "string"
      ? new TextEncoder().encode(data)
      : data instanceof Uint8Array
      ? data
      : new Uint8Array(data);
    const file = new mod.MemData(Array.from(bytes));
    // The MemData/MerkleTree pair exposed by the SDK exposes `merkleTree()`.
    const fileWithMerkle = file as unknown as {
      merkleTree(): Promise<[{ rootHash(): string }, Error | null]>;
    };
    const [tree, err] = await fileWithMerkle.merkleTree();
    if (err) throw new StorageError("computeRoot", err);
    return normalizeHex(tree.rootHash());
  }

  private async load(): Promise<ZgStorageModule> {
    if (this.cachedModule) return this.cachedModule;
    try {
      this.cachedModule = await import("@0gfoundation/0g-storage-ts-sdk");
      return this.cachedModule;
    } catch (err) {
      throw new StorageError(
        "init",
        new Error(
          "0G Storage SDK not installed. Run: pnpm add @0gfoundation/0g-storage-ts-sdk ethers"
        ),
        err
      );
    }
  }
}

export class StorageError extends Error {
  readonly op: string;
  readonly cause?: unknown;
  constructor(op: string, cause: unknown, original?: unknown) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    super(`[foundry-sdk:storage:${op}] ${detail}`);
    this.name = "StorageError";
    this.op = op;
    this.cause = original ?? cause;
  }
}

function normalizeHex(s: string): Hex {
  return (s.startsWith("0x") ? s : `0x${s}`) as Hex;
}
