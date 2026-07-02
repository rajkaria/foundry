/**
 * 0G Storage — upload, download, and verifiable Merkle roots.
 *
 * Thin adapter over the neutral `@foundryprotocol/0gkit-storage` `Storage`
 * class. Foundry's `StorageClient` public surface is preserved byte-for-byte
 * (`upload`/`uploadText`/`uploadJson`/`download`/`downloadText`/`downloadJson`/
 * `computeRoot`, the `{ rootHash, txHash, txSeq, size }` envelope, and the
 * `StorageError` type); the underlying `MemData`/`Indexer` dance now lives in
 * exactly one place (`0gkit-storage`), lazily importing the Node-only
 * `@0gfoundation/0g-storage-ts-sdk` (+ `ethers`) so this SDK stays lightweight.
 *
 * Three pieces of the Foundry pipeline are 0G-Storage-native:
 *   1. Dataset contributions   — uploaded encrypted, root logged on-chain
 *   2. Eval holdouts           — uploaded encrypted, root carried in Forge spec
 *   3. Model weights manifests — uploaded after training, root carried in Ingot
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
import { Storage, type StorageSdk } from "@foundryprotocol/0gkit-storage";

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
  /**
   * Inject the underlying 0G Storage SDK module (testing / advanced). Forwarded
   * to `@foundryprotocol/0gkit-storage`. @internal
   */
  loadSdk?: () => Promise<StorageSdk>;
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
  /**
   * Whether to verify Merkle proofs as fragments arrive. The underlying
   * `0gkit-storage` client always verifies proofs, so this is accepted for
   * backward compatibility but downloads are always proof-checked.
   */
  proof?: boolean;
}

export class StorageClient {
  readonly indexerUrl: string;
  readonly rpcUrl: string;
  readonly expectedReplicas: number;
  private readonly storage: Storage;
  private readonly loadSdk?: () => Promise<StorageSdk>;

  constructor(config: StorageClientConfig = {}) {
    const net = config.network ?? "aristotle";
    this.indexerUrl =
      config.indexerUrl ??
      (net === "galileo" ? GALILEO_STORAGE_INDEXER : ARISTOTLE_STORAGE_INDEXER);
    this.rpcUrl = config.rpcUrl ?? DEFAULT_RPC;
    this.expectedReplicas = config.expectedReplicas ?? 1;
    this.loadSdk = config.loadSdk;
    this.storage = new Storage({
      indexerUrl: this.indexerUrl,
      rpcUrl: this.rpcUrl,
      ...(config.loadSdk ? { loadSdk: config.loadSdk } : {}),
    });
  }

  /** Upload arbitrary bytes. */
  async upload(
    data: Uint8Array | ArrayBuffer,
    opts: UploadOptions
  ): Promise<UploadResult> {
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    try {
      const r = await this.storage.upload(bytes, {
        signer: opts.signer,
        uploadOptions: opts.uploadOptions,
        txOptions: opts.txOptions,
      });
      return {
        rootHash: normalizeHex(r.root),
        txHash: normalizeHex(r.tx.txHash ?? "0x"),
        txSeq: r.txSeq ?? 0,
        size: bytes.length,
      };
    } catch (err) {
      throw asStorageError("upload", err);
    }
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
    try {
      const storage =
        opts.indexerUrl && opts.indexerUrl !== this.indexerUrl
          ? new Storage({
              indexerUrl: opts.indexerUrl,
              rpcUrl: this.rpcUrl,
              ...(this.loadSdk ? { loadSdk: this.loadSdk } : {}),
            })
          : this.storage;
      return await storage.download(rootHash);
    } catch (err) {
      throw asStorageError("download", err);
    }
  }

  /** Download a UTF-8 string. */
  async downloadText(rootHash: Hex, opts: DownloadOptions = {}): Promise<string> {
    const bytes = await this.download(rootHash, opts);
    return new TextDecoder().decode(bytes);
  }

  /** Download and parse a JSON document. */
  async downloadJson<T = unknown>(
    rootHash: Hex,
    opts: DownloadOptions = {}
  ): Promise<T> {
    return JSON.parse(await this.downloadText(rootHash, opts)) as T;
  }

  /**
   * Compute the Merkle root for a payload **without** uploading it. Useful
   * when you want a deterministic content-addressed reference (e.g. for spec
   * hashes that go into a Forge constructor) but don't need to pay for storage.
   */
  async computeRoot(data: Uint8Array | ArrayBuffer | string): Promise<Hex> {
    const bytes =
      typeof data === "string"
        ? new TextEncoder().encode(data)
        : data instanceof Uint8Array
          ? data
          : new Uint8Array(data);
    try {
      return normalizeHex(await this.storage.computeRoot(bytes));
    } catch (err) {
      throw asStorageError("computeRoot", err);
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

/** Preserve an already-typed StorageError; otherwise wrap the 0gkit error. */
function asStorageError(op: string, err: unknown): StorageError {
  return err instanceof StorageError ? err : new StorageError(op, err);
}

function normalizeHex(s: string): Hex {
  return (s.startsWith("0x") ? s : `0x${s}`) as Hex;
}
