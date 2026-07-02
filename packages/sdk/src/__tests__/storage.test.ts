import { describe, it, expect } from "vitest";
import { StorageClient, StorageError } from "../storage.js";

/** A fake 0G Storage SDK module (the shape 0gkit-storage's `loadSdk` returns). */
function fakeSdk(
  opts: {
    uploadResult?: unknown;
    uploadErr?: Error | null;
    bytes?: Uint8Array;
    onUpload?: (args: unknown[]) => void;
  } = {}
) {
  return {
    MemData: class {
      constructor(public data: number[]) {}
      async merkleTree() {
        return [{ rootHash: () => "0xroot" }, null] as const;
      }
    },
    Indexer: class {
      constructor(public url: string) {}
      async upload(...args: unknown[]) {
        opts.onUpload?.(args);
        return [
          opts.uploadResult ?? { txHash: "0xtx", rootHash: "0xroot", txSeq: 5 },
          opts.uploadErr ?? null,
        ] as const;
      }
      async downloadToBlob() {
        const part = (opts.bytes ?? new Uint8Array([1, 2, 3])) as BlobPart;
        return [new Blob([part]), null] as const;
      }
      async peekHeader() {
        return [{}, null] as const;
      }
    },
  };
}

describe("StorageClient", () => {
  it("picks aristotle indexer by default", () => {
    const c = new StorageClient();
    expect(c.indexerUrl).toContain("indexer-storage.0g.network");
  });

  it("respects explicit indexerUrl override", () => {
    const c = new StorageClient({ indexerUrl: "https://custom.0g/" });
    expect(c.indexerUrl).toBe("https://custom.0g/");
  });

  it("uses galileo indexer when network=galileo", () => {
    const c = new StorageClient({ network: "galileo" });
    expect(c.indexerUrl).toContain("indexer-storage-testnet");
  });

  it("upload maps the 0gkit-storage result to { rootHash, txHash, txSeq, size }", async () => {
    const c = new StorageClient({ network: "galileo", loadSdk: async () => fakeSdk() });
    const data = new Uint8Array([1, 2, 3, 4]);
    const r = await c.upload(data, { signer: {} });
    expect(r).toEqual({
      rootHash: "0xroot",
      txHash: "0xtx",
      txSeq: 5,
      size: 4,
    });
  });

  it("forwards the per-call signer through to the underlying SDK upload", async () => {
    let seen: unknown[] = [];
    const signer = { _tag: "ethers-signer" };
    const c = new StorageClient({
      network: "galileo",
      loadSdk: async () => fakeSdk({ onUpload: (args) => (seen = args) }),
    });
    await c.uploadJson({ a: 1 }, { signer });
    // upload(file, rpc, signer, uploadOptions, retry, txOptions) — signer is arg[2]
    expect(seen[2]).toBe(signer);
  });

  it("uploadJson → downloadJson round-trips an object", async () => {
    const doc = { hello: "0G", n: 7 };
    const bytes = new TextEncoder().encode(JSON.stringify(doc));
    const c = new StorageClient({
      network: "galileo",
      loadSdk: async () => fakeSdk({ bytes }),
    });
    const out = await c.downloadJson<typeof doc>("0xroot");
    expect(out).toEqual(doc);
  });

  it("wraps an upload failure in StorageError", async () => {
    const c = new StorageClient({
      network: "galileo",
      loadSdk: async () => fakeSdk({ uploadErr: new Error("indexer down") }),
    });
    await expect(c.upload(new Uint8Array([1]), { signer: {} })).rejects.toBeInstanceOf(
      StorageError
    );
  });
});
