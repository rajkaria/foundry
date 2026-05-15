import { describe, it, expect, vi } from "vitest";
import { DAClient } from "../da.js";

describe("DAClient", () => {
  it("digest is canonical-JSON stable + order-insensitive", () => {
    const c = new DAClient();
    const a = c.digest({ a: 1, b: 2, c: [3, 4] });
    const b = c.digest({ c: [3, 4], b: 2, a: 1 });
    expect(a).toBe(b);
  });

  it("publish without encoder returns local mode + a digest", async () => {
    const c = new DAClient();
    const out = await c.publish({ hello: "world" });
    expect(out.mode).toBe("local");
    expect(out.digest).toMatch(/^0x[0-9a-f]{64}$/);
    expect(out.daRef).toBeUndefined();
  });

  it("publish hits encoder + returns daRef when configured", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ blobId: "blob_42", ref: "0g-da:blob_42" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );
    const c = new DAClient({
      encoderUrl: "https://da.example.com",
      fetch: fetchImpl as unknown as typeof fetch,
    });
    const out = await c.publish({ kind: "test" });
    expect(out.mode).toBe("live");
    expect(out.daRef).toBe("0g-da:blob_42");
    expect(out.blobId).toBe("blob_42");
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("publish throws on encoder non-2xx", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response("nope", { status: 500 })
    );
    const c = new DAClient({
      encoderUrl: "https://da.example.com",
      fetch: fetchImpl as unknown as typeof fetch,
    });
    await expect(c.publish({})).rejects.toThrow(/500/);
  });
});
