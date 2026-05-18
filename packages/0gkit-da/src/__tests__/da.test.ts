import { describe, it, expect, vi } from "vitest";
import { DA } from "../da.js";
import { ConfigError, NetworkError } from "@0gkit/core";

describe("DA.digest", () => {
  it("is stable under key reordering and 0x keccak", () => {
    const da = new DA({});
    expect(da.digest({ a: 1, b: 2 })).toBe(da.digest({ b: 2, a: 1 }));
    expect(da.digest({ a: 1 })).toMatch(/^0x[0-9a-f]{64}$/);
  });
});

describe("DA.publish", () => {
  it("local mode when no encoder configured", async () => {
    const da = new DA({});
    const r = await da.publish({ hello: "world" });
    expect(r.mode).toBe("local");
    expect(r.daRef).toBeUndefined();
    expect(r.digest).toMatch(/^0x[0-9a-f]{64}$/);
    expect(typeof r.latencyMs).toBe("number");
  });

  it("live mode posts to the encoder and returns daRef + raw", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ blobId: "blob_42", ref: "0g-da:blob_42" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );
    const da = new DA({ encoderUrl: "https://enc.example", fetch: fetchMock });
    const r = await da.publish({ hello: "world" });
    expect(r.mode).toBe("live");
    expect(r.daRef).toBe("0g-da:blob_42");
    expect(r.blobId).toBe("blob_42");
    expect(r.raw).toEqual({ blobId: "blob_42", ref: "0g-da:blob_42" });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://enc.example/blob",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("wraps a non-2xx encoder response in NetworkError", async () => {
    const da = new DA({
      encoderUrl: "https://enc.example",
      fetch: vi.fn().mockResolvedValue(new Response("nope", { status: 500 })),
    });
    await expect(da.publish({ x: 1 })).rejects.toMatchObject({ code: "NETWORK" });
  });
});

describe("DA.verify", () => {
  it("returns true when payload matches the expected digest", () => {
    const da = new DA({});
    const d = da.digest({ a: 1 });
    expect(da.verify({ a: 1 }, d)).toBe(true);
    expect(da.verify({ a: 2 }, d)).toBe(false);
  });

  it("throws ConfigError for a malformed expected digest", () => {
    const da = new DA({});
    expect(() => da.verify({ a: 1 }, "deadbeef")).toThrowError(ConfigError);
  });
});
