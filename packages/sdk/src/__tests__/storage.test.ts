import { describe, it, expect } from "vitest";
import { StorageClient } from "../storage.js";

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
});
