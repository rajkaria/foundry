import { describe, it, expect } from "vitest";
import {
  ARCHETYPES,
  ARCHETYPE_ORDER,
  getArchetype,
  RPC_FOR,
  DEMO_INGOT,
} from "../archetypes.js";

describe("archetype catalog", () => {
  it("has exactly A–E plus demo, each with a lead value-prop", () => {
    expect(ARCHETYPE_ORDER).toEqual(["A", "B", "C", "D", "E", "demo"]);
    for (const id of ARCHETYPE_ORDER) {
      const a = ARCHETYPES[id];
      expect(a.id).toBe(id);
      expect(a.title.length).toBeGreaterThan(0);
      expect(a.lead.length).toBeGreaterThan(0);
      expect(a.readmeBlurb.length).toBeGreaterThan(0);
    }
  });

  it("each archetype renders a non-empty entrypoint and env block", () => {
    for (const id of ARCHETYPE_ORDER) {
      const a = ARCHETYPES[id];
      const ctx = { name: "proj", network: "galileo" as const };
      const idx = a.index(ctx);
      expect(idx).toContain("@foundryprotocol/sdk");
      expect(idx.length).toBeGreaterThan(50);
      // envLines is a function of context; just exercise it.
      expect(Array.isArray(a.envLines(ctx))).toBe(true);
    }
  });

  it("getArchetype resolves valid ids and throws on junk", () => {
    expect(getArchetype("A").id).toBe("A");
    expect(getArchetype("demo").id).toBe("demo");
    expect(() => getArchetype("nope")).toThrow(/unknown archetype/);
  });

  it("RPC_FOR maps each network to its endpoint", () => {
    expect(RPC_FOR("aristotle")).toBe("https://evmrpc.0g.ai");
    expect(RPC_FOR("galileo")).toBe("https://evmrpc-testnet.0g.ai");
    expect(RPC_FOR("local")).toBe("http://127.0.0.1:8545");
  });

  it("only signing archetypes declare needsKey", () => {
    expect(ARCHETYPES.A.needsKey).toBe(true);
    expect(ARCHETYPES.C.needsKey).toBe(true);
    expect(ARCHETYPES.E.needsKey).toBe(true);
    expect(ARCHETYPES.B.needsKey).toBe(false);
    expect(ARCHETYPES.D.needsKey).toBe(false);
    expect(ARCHETYPES.demo.needsKey).toBe(false);
  });

  it("the demo Ingot is the documented canonical id", () => {
    expect(DEMO_INGOT).toBe("ingot:0x8e2af4a000000000000000000000000000000001");
    expect(ARCHETYPES.demo.index({ name: "d", network: "galileo" })).toContain(
      DEMO_INGOT
    );
  });

  it("archetypes A and E request extra deps (ethers)", () => {
    expect(ARCHETYPES.A.extraDeps?.ethers).toBeDefined();
    expect(ARCHETYPES.E.extraDeps?.ethers).toBeDefined();
    expect(ARCHETYPES.B.extraDeps).toBeUndefined();
  });
});
