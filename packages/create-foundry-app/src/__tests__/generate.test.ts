import { describe, it, expect } from "vitest";
import { generateProject } from "../generate.js";
import { ARCHETYPE_ORDER, DEMO_INGOT, type Network } from "../archetypes.js";

const NETWORKS: Network[] = ["aristotle", "galileo", "local"];

describe("generateProject", () => {
  it("produces the full file set for every archetype × network", () => {
    for (const archetype of ARCHETYPE_ORDER) {
      for (const network of NETWORKS) {
        const files = generateProject({ name: "my-app", network, archetype });
        expect(Object.keys(files).sort()).toEqual(
          [
            ".env.example",
            ".gitignore",
            "README.md",
            "index.ts",
            "package.json",
            "tsconfig.json",
          ].sort()
        );
        // package.json is valid JSON, names the project, pins the SDK.
        const pkg = JSON.parse(files["package.json"]);
        expect(pkg.name).toBe("my-app");
        expect(pkg.dependencies["@foundryprotocol/sdk"]).toBeDefined();
        expect(pkg.scripts.demo).toBe("tsx index.ts");
        // tsconfig is valid JSON.
        expect(() => JSON.parse(files["tsconfig.json"])).not.toThrow();
        // entrypoint is wired to the SDK + dotenv.
        expect(files["index.ts"]).toContain("@foundryprotocol/sdk");
        expect(files["index.ts"]).toContain('import "dotenv/config"');
        // env carries the right network + RPC.
        expect(files[".env.example"]).toContain(`FOUNDRY_NETWORK=${network}`);
        // gitignore protects secrets.
        expect(files[".gitignore"]).toContain(".env");
      }
    }
  });

  it("demo archetype is zero-setup: galileo, demo Ingot, no key required", () => {
    const files = generateProject({
      name: "live",
      network: "galileo",
      archetype: "demo",
    });
    expect(files["index.ts"]).toContain(DEMO_INGOT);
    expect(files["index.ts"]).toContain('contracts: "galileo"');
    expect(files["index.ts"]).not.toContain("PRIVATE_KEY");
    expect(files["README.md"]).toContain("npm run demo");
  });

  it("archetypes that sign reference PRIVATE_KEY; read-only ones do not", () => {
    const a = generateProject({
      name: "x",
      network: "galileo",
      archetype: "A",
    });
    expect(a["index.ts"]).toContain("PRIVATE_KEY");
    const b = generateProject({
      name: "x",
      network: "galileo",
      archetype: "B",
    });
    expect(b["index.ts"]).not.toContain("process.env.PRIVATE_KEY");
  });

  it("RPC URL matches the chosen network", () => {
    expect(
      generateProject({ name: "x", network: "aristotle", archetype: "B" })[
        ".env.example"
      ]
    ).toContain("https://evmrpc.0g.ai");
    expect(
      generateProject({ name: "x", network: "galileo", archetype: "B" })[".env.example"]
    ).toContain("https://evmrpc-testnet.0g.ai");
    expect(
      generateProject({ name: "x", network: "local", archetype: "B" })[".env.example"]
    ).toContain("http://127.0.0.1:8545");
  });

  it("archetype E wires Forge contribution; C wires revenue claim", () => {
    const e = generateProject({
      name: "infra",
      network: "galileo",
      archetype: "E",
    });
    expect(e["index.ts"]).toContain("contributeData");
    expect(e[".env.example"]).toContain("FORGE_ID=");
    const c = generateProject({
      name: "mkt",
      network: "galileo",
      archetype: "C",
    });
    expect(c["index.ts"]).toContain("revenue.claim");
    expect(c[".env.example"]).toContain("INGOT_TOKEN_ID");
  });

  it("archetype D exposes an HTTP endpoint", () => {
    const d = generateProject({
      name: "consumer",
      network: "galileo",
      archetype: "D",
    });
    expect(d["index.ts"]).toContain("node:http");
    expect(d["index.ts"]).toContain("/infer");
    expect(d[".env.example"]).toContain("PORT=8787");
  });

  it("rejects an unknown archetype", () => {
    expect(() =>
      generateProject({ name: "x", network: "galileo", archetype: "Z" })
    ).toThrow(/unknown archetype/);
  });

  it("README names the archetype and leads with its value-prop", () => {
    const files = generateProject({
      name: "fin",
      network: "galileo",
      archetype: "B",
    });
    expect(files["README.md"]).toContain("# fin");
    expect(files["README.md"]).toContain("Verifiable finance");
    expect(files["README.md"]).toContain("on-chain receipt");
  });
});
