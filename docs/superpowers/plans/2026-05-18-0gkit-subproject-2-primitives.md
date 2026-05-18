# 0gkit Sub-Project 2: Primitive Packages (`storage` · `compute` · `da` · `attestation`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the four neutral Layer-1 primitive packages of 0gkit — `@0gkit/storage`, `@0gkit/compute`, `@0gkit/da`, `@0gkit/attestation` — each independently installable, each depending only on `@0gkit/core` (+ its one underlying 0G integration), each with a `.raw` escape hatch and the `ZeroGError` taxonomy.

**Architecture:** Built in the existing pnpm/turbo monorepo alongside the merged `@0gkit/core` + `@0gkit/chain`. `@0gkit/da` and `@0gkit/attestation` are pure (viem only). `@0gkit/storage` wraps `@0gfoundation/0g-storage-ts-sdk`, `@0gkit/compute` wraps `@0gfoundation/0g-compute-ts-sdk` — both as **optional peer deps** loaded via an injectable, cached dynamic-import loader (clean test seams, graceful "not installed" errors). A shared `canonicalJsonStringify` + `digestJson` helper is added to `@0gkit/core` (DRY: da & attestation both need byte-identical canonical JSON). The sub-project-1 CI neutrality rule already covers these packages; CI is extended to build/test them.

**Tech Stack:** TypeScript 5.6 (strict, ESM), `viem ^2.21.0`, `@0gfoundation/0g-storage-ts-sdk ^1.2.9`, `@0gfoundation/0g-compute-ts-sdk ^0.8.3`, `ethers ^6.16.0` (optional peers), `tsup`, `vitest`, `dependency-cruiser`, pnpm 9.12, turbo.

**Spec:** `docs/superpowers/specs/2026-05-18-0gkit-0g-builder-toolkit-design.md` (§2 neutrality, §4 primitive contracts, §6 multi-language, §7 errors, §8 testing, §11.2 acceptance).

**Conventions (locked, mirror merged `@0gkit/core`/`@0gkit/chain`):** ESM-only `type:module`; `tsup` (`dts:true`, `target:es2022`, externalize peers); `tsc --noEmit` typecheck; `vitest run`; tests in `src/__tests__/*.test.ts`; prettier `semi:true singleQuote:false trailingComma:es5 printWidth:88 tabWidth:2`; `0x${string}` typed hex; every thrown error a `ZeroGError` subclass from `@0gkit/core` with an actionable `.hint`; `.js` import specifiers (vitest resolves to `.ts`, proven); package.json mirrors the corrected `@0gkit/core` (neutral `homepage`/`bugs` at github.com/rajkaria/foundry — NEVER foundryprotocol.xyz; `LICENSE` in `files`; `viem` in both `dependencies` and `peerDependencies`; `LICENSE` file = byte-copy of `packages/sdk/LICENSE`); commits `git -c commit.gpgsign=false` on GPG failure, never `--no-verify`.

**Honesty rule (no fabricated endpoints/behaviors):** Storage indexer/RPC URLs, compute chain ids (mainnet `16661`, testnet `16602`), and DA encoder URLs that already exist verbatim in `packages/sdk/src/{storage,da}.ts` may be reused (they are repo-proven). There is **no documented 0G DA blob-retrieval/verify endpoint** in the repo; therefore `@0gkit/da` does NOT implement a network `verify(daRef)` against a guessed URL — it ships a genuinely-useful local integrity `verify(payload, expectedDigest)` and records this decision in `DECISIONS.md` (D3). No endpoint or behavior is invented.

**Grounding:** API surfaces, signatures, return shapes, env vars, and gotchas were extracted from the existing reference implementations (`packages/sdk/src/{storage,da,attestation,inference}.ts`, `apps/eval-coordinator`) and the installed `.d.ts` of the underlying SDKs. Key gotchas honored below: storage `Indexer.upload` returns a **single-root vs multi-root union** (discriminate on `"rootHash" in tx`); attestation signing is **EIP-191** (`hashMessage({ raw: digest })`, not raw keccak); compute SDK import has a **`@0glabs/0g-serving-broker` rename fallback**; storage/compute SDK + `ethers` are **optional peers** (dynamic import, cached).

---

## File structure (locked)

```
docs/superpowers/DECISIONS.md                 (append D3 — DA verify scope)
packages/0gkit-core/
  src/canonical.ts                            (NEW: canonicalJsonStringify, digestJson)
  src/index.ts                                (MODIFY: re-export the two helpers)
  src/__tests__/canonical.test.ts             (NEW)
packages/0gkit-da/
  package.json tsconfig.json tsup.config.ts README.md LICENSE
  src/index.ts            (barrel)
  src/da.ts               (DA class: digest, publish, verify)
  src/__tests__/da.test.ts
packages/0gkit-attestation/
  package.json tsconfig.json tsup.config.ts README.md LICENSE
  src/index.ts            (barrel)
  src/attestation.ts      (types, parse, digest, sign, recoverSigner, verify, report)
  src/__tests__/attestation.test.ts
packages/0gkit-storage/
  package.json tsconfig.json tsup.config.ts README.md LICENSE
  src/index.ts            (barrel)
  src/storage.ts          (Storage class: upload, download, computeRoot, exists)
  src/__tests__/storage.test.ts
packages/0gkit-compute/
  package.json tsconfig.json tsup.config.ts README.md LICENSE
  src/index.ts            (barrel)
  src/compute.ts          (Compute class: listProviders, inference, openai)
  src/__tests__/compute.test.ts
package.json                                  (MODIFY: boundary:check glob; CI uses it)
.github/workflows/ci.yml                      (MODIFY: build+test the 4 new packages)
```

**Dependency order (drives task order):** core/canonical → da → attestation → storage → compute → CI/docs. da & attestation are pure and fastest; storage & compute share the injectable-loader pattern.

---

## Task 1: `@0gkit/core` shared canonical-JSON + digest helper

**Files:** Create `packages/0gkit-core/src/canonical.ts`, `packages/0gkit-core/src/__tests__/canonical.test.ts`; Modify `packages/0gkit-core/src/index.ts`.

- [ ] **Step 1: Write the failing test** — `packages/0gkit-core/src/__tests__/canonical.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { canonicalJsonStringify, digestJson } from "../canonical.js";

describe("canonicalJsonStringify", () => {
  it("sorts object keys recursively and is whitespace-free", () => {
    const a = canonicalJsonStringify({ b: 1, a: { d: 4, c: 3 } });
    const b = canonicalJsonStringify({ a: { c: 3, d: 4 }, b: 1 });
    expect(a).toBe(b);
    expect(a).toBe('{"a":{"c":3,"d":4},"b":1}');
  });

  it("preserves array order", () => {
    expect(canonicalJsonStringify([3, 1, 2])).toBe("[3,1,2]");
  });

  it("handles primitives and null", () => {
    expect(canonicalJsonStringify("x")).toBe('"x"');
    expect(canonicalJsonStringify(null)).toBe("null");
    expect(canonicalJsonStringify(42)).toBe("42");
  });
});

describe("digestJson", () => {
  it("is a 0x keccak256 hex stable under key reordering", () => {
    const d1 = digestJson({ b: 2, a: 1 });
    const d2 = digestJson({ a: 1, b: 2 });
    expect(d1).toBe(d2);
    expect(d1).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("changes when a value changes", () => {
    expect(digestJson({ a: 1 })).not.toBe(digestJson({ a: 2 }));
  });
});
```

- [ ] **Step 2: Run, expect FAIL** — `pnpm --filter @0gkit/core test` → cannot resolve `../canonical.js`.

- [ ] **Step 3: Implement `packages/0gkit-core/src/canonical.ts`:**

```ts
import { keccak256, toHex, type Hex } from "viem";

/**
 * Deterministic JSON: object keys sorted recursively, no whitespace. Two
 * logically-equal objects always produce the identical string (and digest),
 * regardless of key insertion order. Arrays keep their order.
 */
export function canonicalJsonStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value) ?? "null";
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => canonicalJsonStringify(v)).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  const body = keys
    .map((k) => `${JSON.stringify(k)}:${canonicalJsonStringify(obj[k])}`)
    .join(",");
  return `{${body}}`;
}

/** keccak256 of the canonical JSON encoding — the cross-package digest. */
export function digestJson(value: unknown): Hex {
  return keccak256(toHex(canonicalJsonStringify(value)));
}
```

- [ ] **Step 4: Add to the barrel `packages/0gkit-core/src/index.ts`** — append (keep existing exports unchanged):

```ts
export { canonicalJsonStringify, digestJson } from "./canonical.js";
```

- [ ] **Step 5: Run typecheck + tests + build** — `pnpm --filter @0gkit/core typecheck` (exit 0), `pnpm --filter @0gkit/core test` (all prior + new green), `pnpm --filter @0gkit/core build` (emits dist). Confirm.

- [ ] **Step 6: Commit**

```bash
git add packages/0gkit-core/src/canonical.ts packages/0gkit-core/src/__tests__/canonical.test.ts packages/0gkit-core/src/index.ts
git commit -m "feat(0gkit-core): add canonicalJsonStringify + digestJson helper"
```

---

## Task 2: Scaffold `@0gkit/da` package

**Files:** Create `packages/0gkit-da/{package.json,tsconfig.json,tsup.config.ts,LICENSE,src/index.ts}`.

- [ ] **Step 1: `packages/0gkit-da/package.json`:**

```json
{
  "name": "@0gkit/da",
  "version": "0.1.0",
  "description": "Neutral 0G Data Availability client — canonical digest + encoder publish. Built on @0gkit/core + viem.",
  "license": "MIT",
  "homepage": "https://github.com/rajkaria/foundry/tree/main/packages/0gkit-da",
  "repository": {
    "type": "git",
    "url": "https://github.com/rajkaria/foundry.git",
    "directory": "packages/0gkit-da"
  },
  "bugs": { "url": "https://github.com/rajkaria/foundry/issues" },
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": { ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" } },
  "files": ["dist", "README.md", "LICENSE"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "lint": "depcruise src --config ../../.dependency-cruiser.cjs",
    "clean": "rimraf dist",
    "prepublishOnly": "pnpm run clean && pnpm run build"
  },
  "dependencies": { "@0gkit/core": "workspace:*", "viem": "^2.21.0" },
  "peerDependencies": { "viem": "^2.21.0" },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "dependency-cruiser": "^16.0.0",
    "rimraf": "^6.0.1",
    "tsup": "^8.3.5",
    "typescript": "^5.6.3",
    "vitest": "^2.1.8"
  },
  "keywords": ["0g", "0g-da", "data-availability", "toolkit"],
  "publishConfig": { "access": "public" }
}
```

- [ ] **Step 2: `packages/0gkit-da/tsconfig.json`** — identical compilerOptions to `packages/0gkit-core/tsconfig.json` (copy that file's contents exactly: target ES2022, module esnext, moduleResolution bundler, lib [ES2022,DOM], strict, esModuleInterop, skipLibCheck, declaration, emitDeclarationOnly false, noEmit, isolatedModules, resolveJsonModule; include src; exclude dist+node_modules).

- [ ] **Step 3: `packages/0gkit-da/tsup.config.ts`:**

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  dts: true,
  splitting: false,
  clean: true,
  treeshake: true,
  sourcemap: true,
  target: "es2022",
  external: ["viem", "@0gkit/core"],
});
```

- [ ] **Step 4: `packages/0gkit-da/LICENSE`** — byte-for-byte copy of `packages/sdk/LICENSE`.

- [ ] **Step 5: temporary `packages/0gkit-da/src/index.ts`:** `export const __0gkitDa = "scaffold";`

- [ ] **Step 6:** `pnpm install` then `pnpm --filter @0gkit/core build` then `pnpm --filter @0gkit/da build`. Expect both build; chain unaffected. (Do NOT run lint here.)

- [ ] **Step 7: Commit**

```bash
git add packages/0gkit-da pnpm-lock.yaml
git commit -m "feat(0gkit-da): scaffold DA package"
```

---

## Task 3: `@0gkit/da` — digest, publish, local verify

**Files:** Create `packages/0gkit-da/src/da.ts`, `packages/0gkit-da/src/__tests__/da.test.ts`; Modify `docs/superpowers/DECISIONS.md` (append D3); replace `packages/0gkit-da/src/index.ts` barrel.

- [ ] **Step 1: Append D3 to `docs/superpowers/DECISIONS.md`:**

```markdown

## D3 — DA verify scope (2026-05-18)

`packages/sdk/src/da.ts` proves only the encoder **publish** path
(`POST <encoderUrl>/blob`). No 0G DA blob-retrieval/verify endpoint is
documented in the repo or official docs. Per the honesty rule, `@0gkit/da`
does NOT call a guessed retrieval URL. It ships:

- `digest(payload)` — deterministic keccak of canonical JSON (no network).
- `publish(payload)` — POST to the encoder (or local-mode when unconfigured).
- `verify(payload, expectedDigest)` — local integrity check: recompute the
  digest and compare. Genuinely useful (detects tampering/corruption) and
  needs no unverified endpoint.

A network `verify(daRef)` is deferred until an official retrieval endpoint is
verified; if/when it is, record it here and add it without breaking the API.
```

- [ ] **Step 2: Write the failing test** — `packages/0gkit-da/src/__tests__/da.test.ts`:

```ts
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
```

- [ ] **Step 3: Run, expect FAIL** — `pnpm --filter @0gkit/core build` then `pnpm --filter @0gkit/da test` → cannot resolve `../da.js`.

- [ ] **Step 4: Implement `packages/0gkit-da/src/da.ts`:**

```ts
import {
  ConfigError,
  NetworkError,
  canonicalJsonStringify,
  digestJson,
} from "@0gkit/core";
import { type Hex } from "viem";

const ENCODERS = {
  aristotle: "https://da-encoder.0g.network",
  galileo: "https://da-encoder-testnet.0g.ai",
} as const;

export interface DAConfig {
  network?: "aristotle" | "galileo";
  /** Encoder base URL. If unset and no network preset, publish runs local-mode. */
  encoderUrl?: string;
  apiKey?: string;
  /** Injectable for tests / custom runtimes. Defaults to global fetch. */
  fetch?: typeof fetch;
}

export interface DAPublishResult {
  digest: Hex;
  daRef?: string;
  blobId?: string;
  mode: "live" | "local";
  latencyMs: number;
  /** Raw encoder JSON (live mode) for power users. */
  raw?: unknown;
}

export class DA {
  private readonly encoderUrl?: string;
  private readonly apiKey?: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: DAConfig) {
    this.encoderUrl =
      config.encoderUrl ?? (config.network ? ENCODERS[config.network] : undefined);
    this.apiKey = config.apiKey;
    this.fetchImpl = config.fetch ?? globalThis.fetch;
  }

  /** Deterministic keccak digest of the canonical JSON. No network. */
  digest(payload: unknown): Hex {
    return digestJson(payload);
  }

  async publish(payload: unknown): Promise<DAPublishResult> {
    const startedAt = Date.now();
    const digest = digestJson(payload);
    if (!this.encoderUrl) {
      return { digest, mode: "local", latencyMs: Date.now() - startedAt };
    }
    const body =
      payload instanceof Uint8Array
        ? payload
        : new TextEncoder().encode(canonicalJsonStringify(payload));
    let res: Response;
    try {
      res = await this.fetchImpl(`${this.encoderUrl}/blob`, {
        method: "POST",
        headers: {
          "content-type": "application/octet-stream",
          ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}),
        },
        body,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new NetworkError(
        `DA encoder request failed: ${msg}`,
        `Check the encoder is reachable, or omit encoderUrl for local digest mode.`
      );
    }
    if (!res.ok) {
      throw new NetworkError(
        `DA encoder returned HTTP ${res.status}.`,
        `Verify the encoder URL/API key, or use local digest mode.`
      );
    }
    const raw = (await res.json().catch(() => ({}))) as {
      blobId?: string;
      ref?: string;
    };
    return {
      digest,
      blobId: raw.blobId,
      daRef: raw.ref ?? raw.blobId,
      mode: "live",
      latencyMs: Date.now() - startedAt,
      raw,
    };
  }

  /**
   * Local integrity check: recompute the digest of `payload` and compare to
   * `expectedDigest`. No network. (A network verify(daRef) is intentionally
   * out of scope — see DECISIONS.md D3.)
   */
  verify(payload: unknown, expectedDigest: string): boolean {
    if (!/^0x[0-9a-fA-F]{64}$/.test(expectedDigest)) {
      throw new ConfigError(
        `expectedDigest is not a 32-byte 0x hex string.`,
        `Pass the value returned by da.digest()/publish().digest.`
      );
    }
    return digestJson(payload).toLowerCase() === expectedDigest.toLowerCase();
  }
}
```

- [ ] **Step 5: Replace `packages/0gkit-da/src/index.ts`:**

```ts
export { DA, type DAConfig, type DAPublishResult } from "./da.js";
```

- [ ] **Step 6: Run** — `pnpm --filter @0gkit/da test` (all green), `pnpm --filter @0gkit/da typecheck` (exit 0), `pnpm --filter @0gkit/da build` (emits dist).

- [ ] **Step 7: Commit**

```bash
git add packages/0gkit-da/src docs/superpowers/DECISIONS.md
git commit -m "feat(0gkit-da): digest + encoder publish + local verify (D3 recorded)"
```

---

## Task 4: Scaffold `@0gkit/attestation` package

**Files:** Create `packages/0gkit-attestation/{package.json,tsconfig.json,tsup.config.ts,LICENSE,src/index.ts}`.

- [ ] **Step 1: `packages/0gkit-attestation/package.json`** — identical to `@0gkit/da`'s package.json (Task 2 Step 1) except:
  - `"name": "@0gkit/attestation"`
  - `"description": "Neutral 0G TEE attestation — parse, sign, recover, verify, report. Pure crypto on @0gkit/core + viem."`
  - `"homepage": "https://github.com/rajkaria/foundry/tree/main/packages/0gkit-attestation"`
  - `"repository".directory`: `"packages/0gkit-attestation"`
  - `"keywords": ["0g", "tee", "attestation", "eip191", "toolkit"]`
  - dependencies/peerDependencies/devDependencies: identical to `@0gkit/da`.

- [ ] **Step 2:** `tsconfig.json` — copy `packages/0gkit-core/tsconfig.json` exactly (as Task 2 Step 2).

- [ ] **Step 3:** `tsup.config.ts` — identical to Task 2 Step 3 (`external: ["viem", "@0gkit/core"]`).

- [ ] **Step 4:** `LICENSE` — byte-for-byte copy of `packages/sdk/LICENSE`.

- [ ] **Step 5:** temporary `src/index.ts`: `export const __0gkitAttestation = "scaffold";`

- [ ] **Step 6:** `pnpm install`; `pnpm --filter @0gkit/core build`; `pnpm --filter @0gkit/attestation build` (both succeed).

- [ ] **Step 7: Commit**

```bash
git add packages/0gkit-attestation pnpm-lock.yaml
git commit -m "feat(0gkit-attestation): scaffold attestation package"
```

---

## Task 5: `@0gkit/attestation` — types, parse, sign, recover, verify, report

**Files:** Create `packages/0gkit-attestation/src/attestation.ts`, `packages/0gkit-attestation/src/__tests__/attestation.test.ts`; replace barrel `packages/0gkit-attestation/src/index.ts`.

- [ ] **Step 1: Write the failing test** — `packages/0gkit-attestation/src/__tests__/attestation.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  parseEnvelope,
  digestEnvelope,
  signEnvelope,
  recoverSigner,
  verifyEnvelope,
  reportEnvelope,
  type AttestationEnvelope,
} from "../attestation.js";
import { AttestationError } from "@0gkit/core";

function makeEnv(): AttestationEnvelope {
  return {
    kind: "foundry/eval-result/v1",
    forge: "0xdEAD000000000000000000000000000000000123",
    scores: [0.42, 0.18, 0.0],
    baseline: 0.5,
    teeAttestation: ("0x" + "ab".repeat(32)) as `0x${string}`,
    coordinator: "0xCAFE000000000000000000000000000000000456",
    timestamp: 1747200000,
  };
}

describe("parseEnvelope", () => {
  it("accepts a well-formed envelope", () => {
    expect(parseEnvelope(makeEnv()).kind).toBe("foundry/eval-result/v1");
  });
  it("throws AttestationError on a bad shape", () => {
    expect(() => parseEnvelope({ kind: "x" })).toThrowError(AttestationError);
  });
});

describe("digestEnvelope", () => {
  it("is stable under key reorder, changes on mutation", () => {
    const e = makeEnv();
    expect(digestEnvelope(e)).toBe(
      digestEnvelope({ ...e } as AttestationEnvelope)
    );
    expect(digestEnvelope(e)).not.toBe(
      digestEnvelope({ ...e, baseline: 0.99 })
    );
  });
});

describe("sign / recover / verify", () => {
  it("round-trips and verifies the expected signer", async () => {
    const pk = generatePrivateKey();
    const addr = privateKeyToAccount(pk).address;
    const signed = await signEnvelope(makeEnv(), pk);
    expect(signed.digest).toMatch(/^0x[0-9a-f]{64}$/);
    expect((await recoverSigner(signed)).toLowerCase()).toBe(addr.toLowerCase());

    const ok = await verifyEnvelope(signed, addr);
    expect(ok.ok).toBe(true);
    expect(ok.checks.digest).toBe(true);
    expect(ok.checks.signer).toBe(true);
    expect(ok.signer.toLowerCase()).toBe(addr.toLowerCase());
  });

  it("fails verify on signer mismatch", async () => {
    const signed = await signEnvelope(makeEnv(), generatePrivateKey());
    const other = privateKeyToAccount(generatePrivateKey()).address;
    const r = await verifyEnvelope(signed, other);
    expect(r.ok).toBe(false);
    expect(r.checks.signer).toBe(false);
  });

  it("fails verify on a tampered envelope (digest mismatch)", async () => {
    const signed = await signEnvelope(makeEnv(), generatePrivateKey());
    const tampered = {
      ...signed,
      envelope: { ...signed.envelope, baseline: 0.99 },
    };
    const r = await verifyEnvelope(
      tampered,
      privateKeyToAccount(generatePrivateKey()).address
    );
    expect(r.ok).toBe(false);
    expect(r.checks.digest).toBe(false);
  });
});

describe("reportEnvelope", () => {
  it("renders a human-readable multi-line summary", async () => {
    const signed = await signEnvelope(makeEnv(), generatePrivateKey());
    const txt = reportEnvelope(signed);
    expect(txt).toContain("foundry/eval-result/v1");
    expect(txt).toContain(signed.digest);
    expect(txt).toContain("scores");
  });
});
```

- [ ] **Step 2: Run, expect FAIL** — `pnpm --filter @0gkit/core build` then `pnpm --filter @0gkit/attestation test` → cannot resolve `../attestation.js`.

- [ ] **Step 3: Implement `packages/0gkit-attestation/src/attestation.ts`:**

```ts
import { AttestationError, digestJson } from "@0gkit/core";
import {
  hashMessage,
  recoverAddress,
  type Address,
  type Hex,
} from "viem";
import { sign } from "viem/accounts";

export interface AttestationEnvelope {
  kind: "foundry/eval-result/v1";
  forge: Address;
  scores: number[];
  baseline: number;
  teeAttestation: Hex;
  daRef?: string;
  coordinator: Address;
  timestamp: number;
}

export interface SignedEnvelope {
  envelope: AttestationEnvelope;
  digest: Hex;
  signature: Hex;
}

export interface VerifyResult {
  ok: boolean;
  checks: { digest: boolean; signer: boolean };
  signer: Address;
}

/** Validate + narrow an unknown value into an AttestationEnvelope. */
export function parseEnvelope(value: unknown): AttestationEnvelope {
  const e = value as Partial<AttestationEnvelope> | null;
  const bad = (why: string): never => {
    throw new AttestationError(
      `Invalid attestation envelope: ${why}.`,
      `Envelope must match the foundry/eval-result/v1 shape.`
    );
  };
  if (!e || typeof e !== "object") bad("not an object");
  if (e!.kind !== "foundry/eval-result/v1") bad("kind");
  if (typeof e!.forge !== "string") bad("forge");
  if (!Array.isArray(e!.scores) || e!.scores.some((n) => typeof n !== "number"))
    bad("scores");
  if (typeof e!.baseline !== "number") bad("baseline");
  if (typeof e!.teeAttestation !== "string") bad("teeAttestation");
  if (typeof e!.coordinator !== "string") bad("coordinator");
  if (typeof e!.timestamp !== "number") bad("timestamp");
  if (e!.daRef !== undefined && typeof e!.daRef !== "string") bad("daRef");
  return e as AttestationEnvelope;
}

/** keccak of the canonical envelope JSON — the on-chain anchor. */
export function digestEnvelope(envelope: AttestationEnvelope): Hex {
  return digestJson(envelope);
}

/** EIP-191 personal-sign over the digest (matches on-chain ecrecover). */
export async function signEnvelope(
  envelope: AttestationEnvelope,
  privateKey: Hex | string
): Promise<SignedEnvelope> {
  const digest = digestEnvelope(envelope);
  const pk = (
    privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`
  ) as Hex;
  const signature = await sign({
    hash: hashMessage({ raw: digest }),
    privateKey: pk,
    to: "hex",
  });
  return { envelope, digest, signature };
}

export async function recoverSigner(
  signed: Pick<SignedEnvelope, "digest" | "signature">
): Promise<Address> {
  return recoverAddress({
    hash: hashMessage({ raw: signed.digest }),
    signature: signed.signature,
  });
}

/** Verify digest integrity AND signer identity. Never throws on a bad sig. */
export async function verifyEnvelope(
  signed: SignedEnvelope,
  expectedSigner: Address | string
): Promise<VerifyResult> {
  const recomputed = digestEnvelope(signed.envelope);
  const digestOk = recomputed.toLowerCase() === signed.digest.toLowerCase();
  let signer = "0x0000000000000000000000000000000000000000" as Address;
  let signerOk = false;
  try {
    signer = await recoverSigner(signed);
    signerOk =
      digestOk && signer.toLowerCase() === expectedSigner.toLowerCase();
  } catch {
    signerOk = false;
  }
  return { ok: digestOk && signerOk, checks: { digest: digestOk, signer: signerOk }, signer };
}

/** Human-readable multi-line summary for CLIs / logs. */
export function reportEnvelope(signed: SignedEnvelope): string {
  const e = signed.envelope;
  return [
    `attestation ${e.kind}`,
    `  forge        ${e.forge}`,
    `  coordinator  ${e.coordinator}`,
    `  scores       [${e.scores.join(", ")}]  baseline ${e.baseline}`,
    `  timestamp    ${new Date(e.timestamp * 1000).toISOString()}`,
    `  teeAttest    ${e.teeAttestation}`,
    e.daRef ? `  daRef        ${e.daRef}` : `  daRef        (none)`,
    `  digest       ${signed.digest}`,
    `  signature    ${signed.signature.slice(0, 22)}…`,
  ].join("\n");
}
```

- [ ] **Step 4: Replace `packages/0gkit-attestation/src/index.ts`:**

```ts
export {
  parseEnvelope,
  digestEnvelope,
  signEnvelope,
  recoverSigner,
  verifyEnvelope,
  reportEnvelope,
  type AttestationEnvelope,
  type SignedEnvelope,
  type VerifyResult,
} from "./attestation.js";
```

- [ ] **Step 5: Run** — `pnpm --filter @0gkit/attestation test` (all green), `typecheck` (exit 0), `build` (emits dist).

- [ ] **Step 6: Commit**

```bash
git add packages/0gkit-attestation/src
git commit -m "feat(0gkit-attestation): parse/sign/recover/verify/report (EIP-191)"
```

---

## Task 6: Scaffold `@0gkit/storage` package

**Files:** Create `packages/0gkit-storage/{package.json,tsconfig.json,tsup.config.ts,LICENSE,src/index.ts}`.

- [ ] **Step 1: `packages/0gkit-storage/package.json`** — same shape as `@0gkit/da` package.json (Task 2 Step 1) with these differences:
  - `"name": "@0gkit/storage"`
  - `"description": "Neutral 0G Storage client — upload/download/computeRoot/exists over @0gfoundation/0g-storage-ts-sdk."`
  - `"homepage"`/`repository.directory`: `packages/0gkit-storage`
  - `"keywords": ["0g", "0g-storage", "storage", "toolkit"]`
  - `dependencies`: `{ "@0gkit/core": "workspace:*", "viem": "^2.21.0" }`
  - Add optional peers (the SDK is heavy + dynamically imported):
```json
  "peerDependencies": {
    "viem": "^2.21.0",
    "@0gfoundation/0g-storage-ts-sdk": "^1.2.9",
    "ethers": "^6.16.0"
  },
  "peerDependenciesMeta": {
    "@0gfoundation/0g-storage-ts-sdk": { "optional": true },
    "ethers": { "optional": true }
  },
```
  - `devDependencies`: same six as `@0gkit/da` PLUS `"@0gfoundation/0g-storage-ts-sdk": "^1.2.9"` and `"ethers": "^6.16.0"` (needed so tests/typecheck resolve the optional peers locally).

- [ ] **Step 2:** `tsconfig.json` — copy `packages/0gkit-core/tsconfig.json` exactly.

- [ ] **Step 3: `packages/0gkit-storage/tsup.config.ts`:**

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  dts: true,
  splitting: false,
  clean: true,
  treeshake: true,
  sourcemap: true,
  target: "es2022",
  external: ["viem", "@0gkit/core", "@0gfoundation/0g-storage-ts-sdk", "ethers"],
});
```

- [ ] **Step 4:** `LICENSE` — byte-for-byte copy of `packages/sdk/LICENSE`.

- [ ] **Step 5:** temporary `src/index.ts`: `export const __0gkitStorage = "scaffold";`

- [ ] **Step 6:** `pnpm install`; `pnpm --filter @0gkit/core build`; `pnpm --filter @0gkit/storage build` (both succeed; note any peer warnings as expected/non-blocking).

- [ ] **Step 7: Commit**

```bash
git add packages/0gkit-storage pnpm-lock.yaml
git commit -m "feat(0gkit-storage): scaffold storage package"
```

---

## Task 7: `@0gkit/storage` — Storage client (injectable cached loader)

**Files:** Create `packages/0gkit-storage/src/storage.ts`, `packages/0gkit-storage/src/__tests__/storage.test.ts`; replace barrel.

- [ ] **Step 1: Write the failing test** — `packages/0gkit-storage/src/__tests__/storage.test.ts` (the SDK is injected via the `loadSdk` seam — no vi.mock of dynamic import):

```ts
import { describe, it, expect, vi } from "vitest";
import { Storage } from "../storage.js";
import { ConfigError, NetworkError } from "@0gkit/core";

// Minimal fakes mirroring @0gfoundation/0g-storage-ts-sdk surface.
function fakeSdk(opts: {
  uploadResult?: unknown;
  uploadErr?: Error | null;
  blob?: Blob | null;
  blobErr?: Error | null;
  root?: string;
}) {
  return {
    MemData: class {
      constructor(public data: number[]) {}
      async merkleTree() {
        return [{ rootHash: () => opts.root ?? "0xroot" }, null] as const;
      }
    },
    Indexer: class {
      constructor(public url: string) {}
      async upload() {
        return [
          opts.uploadResult ?? { txHash: "0xtx", rootHash: "0xroot", txSeq: 1 },
          opts.uploadErr ?? null,
        ] as const;
      }
      async downloadToBlob() {
        return [opts.blob ?? new Blob([new Uint8Array([1, 2, 3])]), opts.blobErr ?? null] as const;
      }
      async peekHeader() {
        return [opts.blob === null ? null : {}, opts.blobErr ?? null] as const;
      }
    },
  };
}

const cfg = (over: Record<string, unknown> = {}) => ({
  network: "galileo" as const,
  privateKey:
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  ...over,
});

describe("Storage", () => {
  it("resolves the galileo indexer default", () => {
    const s = new Storage(cfg());
    expect(s.indexerUrl).toBe("https://indexer-storage-testnet.0g.ai");
  });

  it("upload returns root + receipt + raw", async () => {
    const s = new Storage(cfg({ loadSdk: async () => fakeSdk({}) }));
    const r = await s.upload(new Uint8Array([1, 2, 3]));
    expect(r.root).toBe("0xroot");
    expect(r.tx.txHash).toBe("0xtx");
    expect(typeof r.tx.latencyMs).toBe("number");
    expect(r.raw).toEqual({ txHash: "0xtx", rootHash: "0xroot", txSeq: 1 });
  });

  it("upload discriminates the multi-root union shape", async () => {
    const s = new Storage(
      cfg({
        loadSdk: async () =>
          fakeSdk({
            uploadResult: {
              txHashes: ["0xtxA"],
              rootHashes: ["0xrootA"],
              txSeqs: [7],
            },
          }),
      })
    );
    const r = await s.upload(new Uint8Array([9]));
    expect(r.root).toBe("0xrootA");
    expect(r.tx.txHash).toBe("0xtxA");
  });

  it("wraps an SDK upload error in NetworkError", async () => {
    const s = new Storage(
      cfg({ loadSdk: async () => fakeSdk({ uploadErr: new Error("indexer down") }) })
    );
    await expect(s.upload(new Uint8Array([1]))).rejects.toMatchObject({
      code: "NETWORK",
    });
  });

  it("download returns bytes", async () => {
    const s = new Storage(cfg({ loadSdk: async () => fakeSdk({}) }));
    const bytes = await s.download("0xroot");
    expect(Array.from(bytes)).toEqual([1, 2, 3]);
  });

  it("computeRoot hashes without uploading", async () => {
    const s = new Storage(cfg({ loadSdk: async () => fakeSdk({ root: "0xabc" }) }));
    expect(await s.computeRoot(new Uint8Array([1]))).toBe("0xabc");
  });

  it("exists is true when the header is retrievable", async () => {
    const s = new Storage(cfg({ loadSdk: async () => fakeSdk({}) }));
    expect(await s.exists("0xroot")).toBe(true);
  });

  it("throws ConfigError when no privateKey is given for upload", async () => {
    const s = new Storage({ network: "galileo", loadSdk: async () => fakeSdk({}) });
    await expect(s.upload(new Uint8Array([1]))).rejects.toMatchObject({
      code: "CONFIG",
    });
  });

  it("ConfigError (with install hint) when the SDK cannot be loaded", async () => {
    const s = new Storage(
      cfg({
        loadSdk: async () => {
          throw new Error("Cannot find module");
        },
      })
    );
    await expect(s.upload(new Uint8Array([1]))).rejects.toMatchObject({
      code: "CONFIG",
    });
  });
});
```

- [ ] **Step 2: Run, expect FAIL** — `pnpm --filter @0gkit/core build` then `pnpm --filter @0gkit/storage test` → cannot resolve `../storage.js`.

- [ ] **Step 3: Implement `packages/0gkit-storage/src/storage.ts`:**

```ts
import { ConfigError, NetworkError, type Receipt } from "@0gkit/core";

const INDEXERS = {
  aristotle: "https://indexer-storage.0g.network",
  galileo: "https://indexer-storage-testnet.0g.ai",
} as const;
const DEFAULT_RPC = "https://evmrpc.0g.ai";

/** The subset of @0gfoundation/0g-storage-ts-sdk this client uses. */
export interface StorageSdk {
  MemData: new (data: number[]) => {
    merkleTree(): Promise<readonly [{ rootHash(): string }, Error | null]>;
  };
  Indexer: new (url: string) => {
    upload(
      file: unknown,
      rpc: string,
      signer: unknown,
      opts?: unknown,
      retry?: unknown,
      tx?: unknown
    ): Promise<readonly [unknown, Error | null]>;
    downloadToBlob(
      root: string,
      opts?: unknown
    ): Promise<readonly [Blob | null, Error | null]>;
    peekHeader(
      root: string
    ): Promise<readonly [unknown, Error | null]>;
  };
}

export interface StorageConfig {
  network?: "aristotle" | "galileo";
  indexerUrl?: string;
  rpcUrl?: string;
  /** Private key for the upload tx signer (ethers Wallet). Required for upload. */
  privateKey?: string;
  /** Test/runtime seam. Defaults to a cached dynamic import of the SDK. */
  loadSdk?: () => Promise<StorageSdk>;
}

export interface UploadResult {
  root: string;
  tx: Receipt;
  raw: unknown;
}

function normalizeHex(s: string): string {
  return s.startsWith("0x") ? s : `0x${s}`;
}

export class Storage {
  readonly indexerUrl: string;
  readonly rpcUrl: string;
  private readonly privateKey?: string;
  private readonly loadSdk: () => Promise<StorageSdk>;
  private cached?: StorageSdk;

  constructor(config: StorageConfig) {
    const net = config.network ?? "aristotle";
    this.indexerUrl = config.indexerUrl ?? INDEXERS[net];
    this.rpcUrl = config.rpcUrl ?? DEFAULT_RPC;
    this.privateKey = config.privateKey;
    this.loadSdk =
      config.loadSdk ??
      (() =>
        import("@0gfoundation/0g-storage-ts-sdk" as string) as Promise<StorageSdk>);
  }

  private async sdk(): Promise<StorageSdk> {
    if (this.cached) return this.cached;
    try {
      this.cached = await this.loadSdk();
      return this.cached;
    } catch (err) {
      throw new ConfigError(
        `@0gfoundation/0g-storage-ts-sdk could not be loaded: ${
          err instanceof Error ? err.message : String(err)
        }`,
        `Install it: npm install @0gfoundation/0g-storage-ts-sdk ethers`
      );
    }
  }

  private async signer(): Promise<unknown> {
    if (!this.privateKey) {
      throw new ConfigError(
        `Storage.upload requires a privateKey.`,
        `Pass { privateKey } to the Storage constructor (funds the upload tx).`
      );
    }
    try {
      const { Wallet, JsonRpcProvider } = (await import(
        "ethers" as string
      )) as typeof import("ethers");
      return new Wallet(this.privateKey, new JsonRpcProvider(this.rpcUrl));
    } catch (err) {
      throw new ConfigError(
        `ethers could not be loaded: ${
          err instanceof Error ? err.message : String(err)
        }`,
        `Install it: npm install ethers`
      );
    }
  }

  async upload(data: Uint8Array): Promise<UploadResult> {
    const signer = await this.signer();
    const mod = await this.sdk();
    const startedAt = Date.now();
    const file = new mod.MemData(Array.from(data));
    const indexer = new mod.Indexer(this.indexerUrl);
    const [res, err] = await indexer.upload(file, this.rpcUrl, signer);
    if (err) {
      throw new NetworkError(
        `0G Storage upload failed: ${err.message}`,
        `Check the indexer (${this.indexerUrl}) and RPC are reachable and the signer is funded.`
      );
    }
    const o = res as Record<string, unknown>;
    const root =
      "rootHash" in o
        ? (o.rootHash as string)
        : ((o.rootHashes as string[])[0] as string);
    const txHash =
      "txHash" in o
        ? (o.txHash as string)
        : ((o.txHashes as string[])[0] as string);
    return {
      root: normalizeHex(root),
      tx: { txHash: normalizeHex(txHash), latencyMs: Date.now() - startedAt },
      raw: res,
    };
  }

  async download(root: string): Promise<Uint8Array> {
    const mod = await this.sdk();
    const indexer = new mod.Indexer(this.indexerUrl);
    const [blob, err] = await indexer.downloadToBlob(root, { proof: true });
    if (err) {
      throw new NetworkError(
        `0G Storage download failed: ${err.message}`,
        `Verify the root hash and that the indexer (${this.indexerUrl}) is reachable.`
      );
    }
    if (!blob) {
      throw new NetworkError(
        `0G Storage returned an empty blob for ${root}.`,
        `The root may not be finalized yet; retry shortly.`
      );
    }
    return new Uint8Array(await blob.arrayBuffer());
  }

  async computeRoot(data: Uint8Array): Promise<string> {
    const mod = await this.sdk();
    const file = new mod.MemData(Array.from(data));
    const [tree, err] = await file.merkleTree();
    if (err) {
      throw new NetworkError(
        `Merkle root computation failed: ${err.message}`,
        `This is a local computation; the input may be empty.`
      );
    }
    return normalizeHex(tree.rootHash());
  }

  async exists(root: string): Promise<boolean> {
    const mod = await this.sdk();
    const indexer = new mod.Indexer(this.indexerUrl);
    const [header, err] = await indexer.peekHeader(root);
    return !err && header != null;
  }

  /** Escape hatch: the underlying @0gfoundation/0g-storage-ts-sdk module. */
  async raw(): Promise<StorageSdk> {
    return this.sdk();
  }
}
```

- [ ] **Step 4: Replace `packages/0gkit-storage/src/index.ts`:**

```ts
export {
  Storage,
  type StorageConfig,
  type StorageSdk,
  type UploadResult,
} from "./storage.js";
```

- [ ] **Step 5: Run** — `pnpm --filter @0gkit/storage test` (all green), `typecheck` (exit 0), `build` (emits dist).

- [ ] **Step 6: Commit**

```bash
git add packages/0gkit-storage/src
git commit -m "feat(0gkit-storage): Storage client with injectable cached SDK loader"
```

---

## Task 8: Scaffold `@0gkit/compute` package

**Files:** Create `packages/0gkit-compute/{package.json,tsconfig.json,tsup.config.ts,LICENSE,src/index.ts}`.

- [ ] **Step 1: `packages/0gkit-compute/package.json`** — same shape as `@0gkit/storage` (Task 6 Step 1) with:
  - `"name": "@0gkit/compute"`
  - `"description": "Neutral 0G Compute client — provider discovery, broker inference, OpenAI-compatible shim."`
  - `"homepage"`/`repository.directory`: `packages/0gkit-compute`
  - `"keywords": ["0g", "0g-compute", "inference", "openai", "toolkit"]`
  - peerDependencies: replace the storage SDK with `"@0gfoundation/0g-compute-ts-sdk": "^0.8.3"` (keep `viem`, `ethers`); `peerDependenciesMeta` marks `@0gfoundation/0g-compute-ts-sdk` and `ethers` optional.
  - devDependencies: the six base + `"@0gfoundation/0g-compute-ts-sdk": "^0.8.3"` + `"ethers": "^6.16.0"`.

- [ ] **Step 2:** `tsconfig.json` — copy `packages/0gkit-core/tsconfig.json` exactly.

- [ ] **Step 3: `tsup.config.ts`** — as Task 6 Step 3 but `external: ["viem", "@0gkit/core", "@0gfoundation/0g-compute-ts-sdk", "ethers"]`.

- [ ] **Step 4:** `LICENSE` — byte-for-byte copy of `packages/sdk/LICENSE`.

- [ ] **Step 5:** temporary `src/index.ts`: `export const __0gkitCompute = "scaffold";`

- [ ] **Step 6:** `pnpm install`; `pnpm --filter @0gkit/core build`; `pnpm --filter @0gkit/compute build` (both succeed).

- [ ] **Step 7: Commit**

```bash
git add packages/0gkit-compute pnpm-lock.yaml
git commit -m "feat(0gkit-compute): scaffold compute package"
```

---

## Task 9: `@0gkit/compute` — broker inference + provider discovery + OpenAI shim

**Files:** Create `packages/0gkit-compute/src/compute.ts`, `packages/0gkit-compute/src/__tests__/compute.test.ts`; replace barrel.

- [ ] **Step 1: Write the failing test** — `packages/0gkit-compute/src/__tests__/compute.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { Compute } from "../compute.js";
import { ConfigError, NetworkError } from "@0gkit/core";

function fakeBrokerMod(over: Record<string, unknown> = {}) {
  const inference = {
    acknowledgeProviderSigner: vi.fn().mockResolvedValue(undefined),
    getServiceMetadata: vi
      .fn()
      .mockResolvedValue({ endpoint: "https://prov.example", model: "m1" }),
    getRequestHeaders: vi.fn().mockResolvedValue({ Authorization: "tok" }),
    processResponse: vi
      .fn()
      .mockResolvedValue({ valid: true, txHash: "0xfee" }),
    listService: vi
      .fn()
      .mockResolvedValue([{ provider: "0xprov", model: "m1" }]),
    ...over,
  };
  return {
    createZGComputeNetworkBroker: vi.fn().mockResolvedValue({ inference }),
    __inference: inference,
  };
}

const baseCfg = {
  brokerKey:
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  provider: "0xprov",
};

describe("Compute", () => {
  it("listProviders returns the broker service list", async () => {
    const mod = fakeBrokerMod();
    const c = new Compute({
      ...baseCfg,
      loadBroker: async () => mod as never,
      loadEthers: async () => ({ Wallet: class {}, JsonRpcProvider: class {} }) as never,
    });
    const list = await c.listProviders();
    expect(list).toEqual([{ provider: "0xprov", model: "m1" }]);
  });

  it("inference calls the provider endpoint and returns output + receipt + raw", async () => {
    const mod = fakeBrokerMod();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ choices: [{ message: { content: "hi" } }] }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );
    const c = new Compute({
      ...baseCfg,
      fetch: fetchMock,
      loadBroker: async () => mod as never,
      loadEthers: async () => ({ Wallet: class {}, JsonRpcProvider: class {} }) as never,
    });
    const r = await c.inference({ messages: [{ role: "user", content: "yo" }] });
    expect(r.output).toBe("hi");
    expect(r.receipt.txHash).toBe("0xfee");
    expect(typeof r.receipt.latencyMs).toBe("number");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://prov.example/v1/chat/completions",
      expect.objectContaining({ method: "POST" })
    );
    expect(r.raw).toBeDefined();
  });

  it("wraps a non-2xx provider response in NetworkError", async () => {
    const c = new Compute({
      ...baseCfg,
      fetch: vi.fn().mockResolvedValue(new Response("no", { status: 502 })),
      loadBroker: async () => fakeBrokerMod() as never,
      loadEthers: async () => ({ Wallet: class {}, JsonRpcProvider: class {} }) as never,
    });
    await expect(
      c.inference({ messages: [{ role: "user", content: "x" }] })
    ).rejects.toMatchObject({ code: "NETWORK" });
  });

  it("throws ConfigError when brokerKey is missing", async () => {
    const c = new Compute({ provider: "0xprov" });
    await expect(c.listProviders()).rejects.toMatchObject({ code: "CONFIG" });
  });

  it("openai() exposes a chat.completions.create shim", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ choices: [{ message: { content: "shim" } }] }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );
    const c = new Compute({
      ...baseCfg,
      fetch: fetchMock,
      loadBroker: async () => fakeBrokerMod() as never,
      loadEthers: async () => ({ Wallet: class {}, JsonRpcProvider: class {} }) as never,
    });
    const oa = c.openai();
    const res = await oa.chat.completions.create({
      messages: [{ role: "user", content: "hey" }],
    });
    expect(res.choices[0].message.content).toBe("shim");
  });

  it("falls back to @0glabs/0g-serving-broker when the new pkg name is missing", async () => {
    const mod = fakeBrokerMod();
    let triedNew = false;
    const c = new Compute({
      ...baseCfg,
      loadBroker: async (name: string) => {
        if (name === "@0gfoundation/0g-compute-ts-sdk") {
          triedNew = true;
          throw new Error("Cannot find module");
        }
        return mod as never;
      },
      loadEthers: async () => ({ Wallet: class {}, JsonRpcProvider: class {} }) as never,
    });
    await c.listProviders();
    expect(triedNew).toBe(true);
  });
});
```

- [ ] **Step 2: Run, expect FAIL** — `pnpm --filter @0gkit/core build` then `pnpm --filter @0gkit/compute test` → cannot resolve `../compute.js`.

- [ ] **Step 3: Implement `packages/0gkit-compute/src/compute.ts`:**

```ts
import { ConfigError, NetworkError, type Receipt } from "@0gkit/core";

const DEFAULT_RPC = "https://evmrpc.0g.ai";
const PKG_NEW = "@0gfoundation/0g-compute-ts-sdk";
const PKG_OLD = "@0glabs/0g-serving-broker";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ComputeConfig {
  network?: "aristotle" | "galileo";
  brokerRpc?: string;
  brokerKey?: string;
  provider?: string;
  model?: string;
  fetch?: typeof fetch;
  /** Seam: load the broker SDK by package name (tries new then old). */
  loadBroker?: (name: string) => Promise<unknown>;
  /** Seam: load ethers. */
  loadEthers?: () => Promise<typeof import("ethers")>;
}

export interface InferenceResult {
  output: string;
  receipt: Receipt;
  raw: unknown;
}

interface BrokerInference {
  acknowledgeProviderSigner(p: string): Promise<void>;
  getServiceMetadata(p: string): Promise<{ endpoint: string; model: string }>;
  getRequestHeaders(p: string, content?: string): Promise<Record<string, string>>;
  processResponse(
    p: string,
    content?: string
  ): Promise<{ valid?: boolean; txHash?: string } | boolean | null>;
  listService(): Promise<unknown[]>;
}

export class Compute {
  private readonly cfg: ComputeConfig;
  private readonly fetchImpl: typeof fetch;
  private broker?: { inference: BrokerInference };

  constructor(config: ComputeConfig) {
    this.cfg = config;
    this.fetchImpl = config.fetch ?? globalThis.fetch;
  }

  private async loadBrokerMod(): Promise<{
    createZGComputeNetworkBroker: (signer: unknown) => Promise<unknown>;
  }> {
    const load =
      this.cfg.loadBroker ??
      ((name: string) => import(name as string) as Promise<unknown>);
    try {
      return (await load(PKG_NEW)) as never;
    } catch {
      try {
        return (await load(PKG_OLD)) as never;
      } catch (err) {
        throw new ConfigError(
          `0G compute SDK not found (${PKG_NEW} or ${PKG_OLD}): ${
            err instanceof Error ? err.message : String(err)
          }`,
          `Install it: npm install ${PKG_NEW} ethers`
        );
      }
    }
  }

  private async getBroker(): Promise<{ inference: BrokerInference }> {
    if (this.broker) return this.broker;
    if (!this.cfg.brokerKey) {
      throw new ConfigError(
        `Compute requires a brokerKey.`,
        `Pass { brokerKey } (a funded 0G broker private key) to the constructor.`
      );
    }
    let ethers: typeof import("ethers");
    try {
      ethers = this.cfg.loadEthers
        ? await this.cfg.loadEthers()
        : ((await import("ethers" as string)) as typeof import("ethers"));
    } catch (err) {
      throw new ConfigError(
        `ethers could not be loaded: ${
          err instanceof Error ? err.message : String(err)
        }`,
        `Install it: npm install ethers`
      );
    }
    const provider = new ethers.JsonRpcProvider(
      this.cfg.brokerRpc ?? DEFAULT_RPC
    );
    const wallet = new ethers.Wallet(this.cfg.brokerKey, provider);
    const mod = await this.loadBrokerMod();
    this.broker = (await mod.createZGComputeNetworkBroker(wallet)) as {
      inference: BrokerInference;
    };
    return this.broker;
  }

  private requireProvider(): string {
    if (!this.cfg.provider) {
      throw new ConfigError(
        `Compute requires a provider address.`,
        `Pass { provider } (the on-chain 0G inference provider address).`
      );
    }
    return this.cfg.provider;
  }

  async listProviders(): Promise<unknown[]> {
    const broker = await this.getBroker();
    return broker.inference.listService();
  }

  async inference(args: {
    model?: string;
    messages: ChatMessage[];
    temperature?: number;
  }): Promise<InferenceResult> {
    const provider = this.requireProvider();
    const broker = await this.getBroker();
    try {
      await broker.inference.acknowledgeProviderSigner(provider);
    } catch {
      /* already acknowledged — non-fatal */
    }
    const { endpoint, model } =
      await broker.inference.getServiceMetadata(provider);
    const body = {
      model: args.model ?? this.cfg.model ?? model,
      messages: args.messages,
      ...(args.temperature !== undefined
        ? { temperature: args.temperature }
        : {}),
    };
    const headers = await broker.inference.getRequestHeaders(
      provider,
      JSON.stringify(args.messages)
    );
    const startedAt = Date.now();
    let res: Response;
    try {
      res = await this.fetchImpl(`${endpoint}/v1/chat/completions`, {
        method: "POST",
        headers: { "content-type": "application/json", ...headers },
        body: JSON.stringify(body),
      });
    } catch (err) {
      throw new NetworkError(
        `0G compute request failed: ${
          err instanceof Error ? err.message : String(err)
        }`,
        `Check the provider endpoint and broker balance.`
      );
    }
    if (!res.ok) {
      throw new NetworkError(
        `0G compute provider returned HTTP ${res.status}.`,
        `Verify the provider address and that the broker ledger is funded.`
      );
    }
    const raw = (await res.json().catch(() => ({}))) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const output = raw.choices?.[0]?.message?.content ?? "";
    let txHash: string | undefined;
    try {
      const pr = await broker.inference.processResponse(provider, output);
      if (pr && typeof pr === "object" && "txHash" in pr) {
        txHash = (pr as { txHash?: string }).txHash;
      }
    } catch {
      /* fee settlement best-effort — non-fatal */
    }
    return {
      output,
      receipt: { txHash, latencyMs: Date.now() - startedAt },
      raw,
    };
  }

  /** Minimal OpenAI-compatible shim (non-streaming). Neutral — no Foundry. */
  openai() {
    const self = this;
    return {
      chat: {
        completions: {
          async create(params: {
            model?: string;
            messages: ChatMessage[];
            temperature?: number;
          }) {
            const r = await self.inference(params);
            return {
              choices: [{ message: { role: "assistant", content: r.output } }],
              _foundryReceipt: r.receipt,
            };
          },
        },
      },
    };
  }

  /** Escape hatch: the underlying broker instance. */
  async raw(): Promise<{ inference: BrokerInference }> {
    return this.getBroker();
  }
}
```

- [ ] **Step 4: Replace `packages/0gkit-compute/src/index.ts`:**

```ts
export {
  Compute,
  type ComputeConfig,
  type ChatMessage,
  type InferenceResult,
} from "./compute.js";
```

- [ ] **Step 5: Run** — `pnpm --filter @0gkit/compute test` (all green), `typecheck` (exit 0), `build` (emits dist).

- [ ] **Step 6: Commit**

```bash
git add packages/0gkit-compute/src
git commit -m "feat(0gkit-compute): broker inference + provider discovery + OpenAI shim"
```

---

## Task 10: Barrels final check + standalone READMEs

**Files:** Create `packages/0gkit-{da,attestation,storage,compute}/README.md`.

- [ ] **Step 1:** For EACH of the four packages create `README.md` (actual markdown, no outer fence) following this template (substitute name/blurb/usage per package):

`@0gkit/da`:
```
# @0gkit/da

Neutral 0G Data Availability: deterministic digest + encoder publish + local
integrity verify. Built on @0gkit/core + viem.

## Install

\`\`\`bash
npm install @0gkit/da @0gkit/core viem
\`\`\`

## Use

\`\`\`ts
import { DA } from "@0gkit/da";
const da = new DA({ network: "galileo" }); // omit encoder → local digest mode
const { digest, daRef, mode } = await da.publish({ hello: "world" });
\`\`\`

## License

MIT.
```
`@0gkit/attestation` — blurb "Neutral 0G TEE attestation: parse, sign (EIP-191), recover, verify, report. Pure crypto."; usage shows `signEnvelope`/`verifyEnvelope`. Install line `npm install @0gkit/attestation @0gkit/core viem`.
`@0gkit/storage` — blurb "Neutral 0G Storage: upload/download/computeRoot/exists."; note `@0gfoundation/0g-storage-ts-sdk` + `ethers` are optional peers (install for upload). Usage shows `new Storage({ network, privateKey }).upload(bytes)`.
`@0gkit/compute` — blurb "Neutral 0G Compute: provider discovery, broker inference, OpenAI-compatible shim."; note `@0gfoundation/0g-compute-ts-sdk` + `ethers` optional peers. Usage shows `new Compute({ brokerKey, provider }).inference({ messages })`.

- [ ] **Step 2:** `pnpm format` if needed, then `pnpm format:check` → exit 0.

- [ ] **Step 3: Commit**

```bash
git add packages/0gkit-da/README.md packages/0gkit-attestation/README.md packages/0gkit-storage/README.md packages/0gkit-compute/README.md
git commit -m "docs(0gkit): standalone READMEs for the four primitive packages"
```

---

## Task 11: Wire CI + neutrality glob for all 0gkit packages

**Files:** Modify `package.json` (root), `.github/workflows/ci.yml`.

- [ ] **Step 1:** In the repo-root `package.json`, change the `boundary:check` script from the two explicit dirs to a glob covering every current and future 0gkit package:

```
"boundary:check": "depcruise \"packages/0gkit-*/src\" --config .dependency-cruiser.cjs",
```

- [ ] **Step 2:** Verify the glob still works: `pnpm boundary:check` exits 0 on the clean tree (it now also cruises da/attestation/storage/compute — all of which import only `@0gkit/core` + viem + optional-peer SDKs, never Foundry/non-0gkit `packages/*`). If depcruise's glob handling differs, fall back to listing all six dirs explicitly (`packages/0gkit-core/src packages/0gkit-chain/src packages/0gkit-da/src packages/0gkit-attestation/src packages/0gkit-storage/src packages/0gkit-compute/src`). Report which form you used.

- [ ] **Step 3:** In `.github/workflows/ci.yml`, in the `web` job, immediately AFTER the existing `- run: pnpm --filter @0gkit/chain test` line, insert (6-space indent, matching siblings):

```yaml
      - run: pnpm --filter @0gkit/da build

      - run: pnpm --filter @0gkit/da test

      - run: pnpm --filter @0gkit/attestation build

      - run: pnpm --filter @0gkit/attestation test

      - run: pnpm --filter @0gkit/storage build

      - run: pnpm --filter @0gkit/storage test

      - run: pnpm --filter @0gkit/compute build

      - run: pnpm --filter @0gkit/compute test
```

(The existing `pnpm boundary:check` step now covers all six packages via the glob; `pnpm typecheck`/`pnpm build` are turbo-all and pick up the new packages automatically.)

- [ ] **Step 4: Run the full local pipeline exactly as CI will** (each must exit 0):

```
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm --filter @foundryprotocol/sdk build
pnpm --filter @foundryprotocol/sdk test
pnpm boundary:check
pnpm --filter @0gkit/core build && pnpm --filter @0gkit/core test
pnpm --filter @0gkit/chain build && pnpm --filter @0gkit/chain test
pnpm --filter @0gkit/da build && pnpm --filter @0gkit/da test
pnpm --filter @0gkit/attestation build && pnpm --filter @0gkit/attestation test
pnpm --filter @0gkit/storage build && pnpm --filter @0gkit/storage test
pnpm --filter @0gkit/compute build && pnpm --filter @0gkit/compute test
pnpm typecheck
pnpm build
```

If `pnpm format:check` flags anything, run `pnpm format`, re-check, include reformatted files in the commit. If `pnpm install --frozen-lockfile` fails because the lockfile changed legitimately (new optional-peer devDeps), run `pnpm install` to reconcile and commit `pnpm-lock.yaml`. If anything else fails for a real reason, fix minimally or report BLOCKED.

- [ ] **Step 5: Commit**

```bash
git add package.json .github/workflows/ci.yml pnpm-lock.yaml
git commit -m "ci: boundary-glob + build/test the four 0gkit primitive packages"
```

---

## Final acceptance (spec §11.2)

- [ ] Four packages exist, each independently installable & building: `@0gkit/da` (digest/publish/verify), `@0gkit/attestation` (parse/digest/sign/recoverSigner/verify/report), `@0gkit/storage` (upload/download/computeRoot/exists/raw), `@0gkit/compute` (listProviders/inference/openai/raw).
- [ ] Each exposes a `.raw` escape hatch (storage/compute) or returns `raw` on results (da); attestation is pure crypto (no SDK to escape to).
- [ ] Each thrown error is a `@0gkit/core` `ZeroGError` subclass with an actionable `.hint`; no raw library errors leak; no silent fallbacks (best-effort fee/ack paths are explicitly commented).
- [ ] `@0gkit/core` gained shared `canonicalJsonStringify`/`digestJson`; da & attestation consume it (no duplicate canonical JSON; no cross-package dep beyond core).
- [ ] Underlying 0G SDKs are **optional peer deps** with `peerDependenciesMeta.optional` + a cached, injectable dynamic-import loader; a missing SDK yields a `ConfigError` with an install hint.
- [ ] No fabricated endpoints: DA network `verify(daRef)` intentionally omitted; local `verify(payload,expectedDigest)` shipped; rationale in `DECISIONS.md` D3.
- [ ] Neutrality: `pnpm boundary:check` (glob over all `packages/0gkit-*/src`) exits 0; no `@0gkit/*` package imports Foundry/non-0gkit `packages/*` (the underlying `@0gfoundation/*` npm deps are NOT `@foundryprotocol` and live in node_modules — allowed).
- [ ] CI builds + tests all six 0gkit packages; full pipeline (`format:check`/`lint`/`typecheck`/`build`/sdk tests) green; no regression to `@foundryprotocol/sdk` (13 tests still pass).
- [ ] ≥80% line coverage on the four new packages (pure-logic + injected-dep tests).
- [ ] Every package: neutral `homepage`/`bugs` (no `foundryprotocol.xyz`), `LICENSE` present (= `packages/sdk/LICENSE`), `viem` dual dep+peer, README.

---

## Self-review (completed by plan author)

**Spec coverage:** §4 `@0gkit/storage` (upload/download/exists + computeRoot + .raw) → Tasks 6–7; `@0gkit/compute` (listProviders/inference/openai + .raw) → Tasks 8–9; `@0gkit/da` (publish/verify + digest) → Tasks 2–3 (network verify(daRef) consciously deferred per honesty rule, D3, with a genuinely-useful local verify shipped); `@0gkit/attestation` (parse/verify/report + sign/recover) → Tasks 4–5; §7 errors → ZeroGError mapping in every package; §8 testing (mocked/injected deps, ≥80%) → every impl task is TDD with an injectable seam; §2 neutrality + §4 enforced rule → Task 11 boundary glob (the sub-project-1 dependency-cruiser rule already forbids Foundry/non-0gkit imports and is hereby extended to cover the new dirs). Shared canonical JSON (research-flagged duplication) → Task 1 in core. Live env-gated integration tests are intentionally NOT added here (kept out of CI for contributors without keys; can be a follow-up) — unit tests with injected SDK/fetch fully cover the wrapper logic per spec §8's pure-logic intent.

**Placeholder scan:** No TBD/TODO. Package.json variants for attestation/storage/compute are specified as explicit deltas against the fully-written `@0gkit/da` package.json (Task 2) and the fully-written `@0gkit/storage` package.json (Task 6) — concrete, not vague. `tsconfig.json` is "copy core's exactly" (core's is committed and unambiguous). README template is given with per-package substitutions enumerated.

**Type consistency:** `Receipt` (from `@0gkit/core`, sub-project 1) is reused by storage `UploadResult.tx` and compute `InferenceResult.receipt`. `ConfigError`/`NetworkError`/`AttestationError` are the sub-project-1 `ZeroGError` subclasses (ctor `(message, hint)`) — used uniformly. `digestJson`/`canonicalJsonStringify` defined in Task 1, consumed by da (Task 3) and attestation (Task 5) with identical import path `@0gkit/core`. Storage's union-discrimination (`"rootHash" in o`) and attestation's EIP-191 (`hashMessage({ raw: digest })`) match the grounded reference behavior exactly.
