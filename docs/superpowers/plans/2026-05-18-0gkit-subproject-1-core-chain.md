# 0gkit Sub-Project 1: `@0gkit/core` + `@0gkit/chain` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the foundation layer of the neutral 0G toolkit — two independently-installable packages (`@0gkit/core`, `@0gkit/chain`) plus a CI-enforced rule that no `@0gkit/*` package may depend on anything Foundry.

**Architecture:** Two new ESM packages in the existing pnpm/turbo monorepo under `packages/`. `@0gkit/core` owns network presets, a viem client factory, the `Receipt` type, and the `ZeroGError` taxonomy. `@0gkit/chain` depends only on `@0gkit/core` + `viem` and provides `explorerUrl`, `balance`, `waitForReceipt`, `faucet`. A `dependency-cruiser` rule fails the build if either package imports `@foundryprotocol/*` or `packages/sdk`.

**Tech Stack:** TypeScript 5.6 (strict, ESM), `viem ^2.21.0`, `tsup` (build), `vitest` (test), `dependency-cruiser` (boundary lint), pnpm 9.12 workspaces, turbo.

**Spec:** `docs/superpowers/specs/2026-05-18-0gkit-0g-builder-toolkit-design.md` (§3 naming, §4 core/chain contracts, §7 errors, §8 testing, §11.1 acceptance, §12 risks).

**Conventions locked from the repo (mirror `packages/sdk`):** `type: module`, ESM-only, `tsup` with `dts: true`, `target: es2022`; `tsc --noEmit` for typecheck; `vitest run` for tests; tests in `src/__tests__/*.test.ts`; prettier (`semi: true`, `singleQuote: false`, `trailingComma: es5`, `printWidth: 88`, `tabWidth: 2`); `0x${string}` typed addresses; clear-error pattern from `packages/sdk/src/deployments.ts`.

**Naming note:** This plan writes the scope literally as `@0gkit`. Task 1 deterministically resolves the real scope (`@0gkit` or an ordered fallback) and records it. Every later task uses whatever Task 1 resolved — substitute it uniformly in every `package.json` `name`, every import, and every CI `--filter`. Directory names are `packages/0gkit-core` and `packages/0gkit-chain` regardless of the scope chosen.

**Honesty rule (no fabricated endpoints):** Aristotle's EVM RPC (`https://evmrpc.0g.ai`) and chain id (`16661`) are proven in the repo (`packages/sdk/src/storage.ts`, `docs/0G-HACKATHON-INTEGRATION-PLAN.md`) and may be hardcoded. Local Anvil (`http://127.0.0.1:8545`, chain id `31337`) is a documented standard and may be hardcoded. **Galileo RPC/chain id, the Galileo faucet, and every block-explorer base are NOT in the repo.** They are resolved by explicit research steps (Tasks 4 & 12). If a value cannot be verified from official 0G docs, the preset field stays `undefined` and the relevant function throws a `ConfigError` whose `.hint` tells the user exactly where to look. No value is ever guessed.

---

## File structure (locked here)

```
docs/superpowers/DECISIONS.md                       (Task 1 — scope decision record)
.dependency-cruiser.cjs                              (Task 12 — boundary config, repo root)
packages/0gkit-core/
  package.json  tsconfig.json  tsup.config.ts  README.md
  src/index.ts            (public barrel)
  src/networks.ts         (NetworkPreset, networks, getNetwork)
  src/errors.ts           (ZeroGError + ConfigError/NetworkError/ChainError/AttestationError)
  src/receipt.ts          (Receipt type)
  src/client.ts           (buildChain, createClient)
  src/__tests__/networks.test.ts
  src/__tests__/errors.test.ts
  src/__tests__/client.test.ts
packages/0gkit-chain/
  package.json  tsconfig.json  tsup.config.ts  README.md
  src/index.ts            (public barrel)
  src/explorer.ts         (explorerUrl, attachExplorerUrl)
  src/balance.ts          (balance)
  src/receipt-wait.ts     (waitForReceipt)
  src/faucet.ts           (faucet)
  src/__tests__/explorer.test.ts
  src/__tests__/balance.test.ts
  src/__tests__/receipt-wait.test.ts
  src/__tests__/faucet.test.ts
  src/__tests__/boundary.test.ts   (Task 12 — proves the CI rule catches a Foundry import)
.github/workflows/ci.yml                             (Task 13 — wire packages + boundary into CI)
```

---

## Task 1: Resolve npm scope and record the decision

**Files:**
- Create: `docs/superpowers/DECISIONS.md`

- [ ] **Step 1: Probe candidate scopes on npm**

Run each; a `404`/`E404` means the name is free:

```bash
npm view @0gkit/core version; echo "exit:$?"
npm view @zerogkit/core version; echo "exit:$?"
npm view zerog-core version; echo "exit:$?"
```

- [ ] **Step 2: Decide using this deterministic rule**

- If `@0gkit/core` is free (E404) → **scope = `@0gkit`**.
- Else if `@zerogkit/core` is free → **scope = `@zerogkit`**.
- Else → **unscoped prefix = `zerog-`** (package names `zerog-core`, `zerog-chain`; treat every `@0gkit/<x>` in this plan as `zerog-<x>`).

- [ ] **Step 3: Write the decision record**

Create `docs/superpowers/DECISIONS.md`:

```markdown
# 0gkit Decisions

## D1 — npm scope (2026-05-18)

Resolved scope: `@0gkit`  <!-- replace with the scope your Step 2 rule selected -->

Probe results:
- `npm view @0gkit/core` → <exit code / "E404 free">
- `npm view @zerogkit/core` → <exit code / "E404 free">
- `npm view zerog-core` → <exit code / "E404 free">

Rule: prefer `@0gkit`; fallback `@zerogkit`; final fallback unscoped `zerog-`.
All `@0gkit/*` references in plans/specs map to the resolved scope.
```

Replace the placeholder line and the probe-result placeholders with the real
values you observed. This file is the single source of truth for the scope.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/DECISIONS.md
git commit -m "docs: record 0gkit npm scope decision (D1)"
```

---

## Task 2: Scaffold `@0gkit/core` package

**Files:**
- Create: `packages/0gkit-core/package.json`
- Create: `packages/0gkit-core/tsconfig.json`
- Create: `packages/0gkit-core/tsup.config.ts`
- Create: `packages/0gkit-core/src/index.ts`

- [ ] **Step 1: Create `packages/0gkit-core/package.json`**

(Use the scope from Task 1 in `"name"`.)

```json
{
  "name": "@0gkit/core",
  "version": "0.1.0",
  "description": "Neutral 0G core — network presets, viem client factory, Receipt, and the ZeroGError taxonomy. No Foundry, ever.",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/rajkaria/foundry.git",
    "directory": "packages/0gkit-core"
  },
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist", "README.md"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "lint": "depcruise src --config ../../.dependency-cruiser.cjs",
    "clean": "rimraf dist",
    "prepublishOnly": "pnpm run clean && pnpm run build"
  },
  "dependencies": {
    "viem": "^2.21.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "dependency-cruiser": "^16.0.0",
    "rimraf": "^6.0.1",
    "tsup": "^8.3.5",
    "typescript": "^5.6.3",
    "vitest": "^2.1.8"
  },
  "keywords": ["0g", "0g-network", "viem", "web3", "toolkit"],
  "publishConfig": { "access": "public" }
}
```

- [ ] **Step 2: Create `packages/0gkit-core/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "emitDeclarationOnly": false,
    "noEmit": true,
    "isolatedModules": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"]
}
```

- [ ] **Step 3: Create `packages/0gkit-core/tsup.config.ts`**

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
  external: ["viem"],
});
```

- [ ] **Step 4: Create a temporary `packages/0gkit-core/src/index.ts`**

```ts
export const __0gkitCore = "scaffold";
```

- [ ] **Step 5: Install and verify the package builds**

```bash
pnpm install
pnpm --filter @0gkit/core build
```

Expected: `pnpm install` adds the workspace package; `tsup` build succeeds and
writes `packages/0gkit-core/dist/index.js` + `index.d.ts`. No errors.

- [ ] **Step 6: Commit**

```bash
git add packages/0gkit-core pnpm-lock.yaml
git commit -m "feat(0gkit-core): scaffold neutral core package"
```

---

## Task 3: `ZeroGError` taxonomy

**Files:**
- Create: `packages/0gkit-core/src/errors.ts`
- Test: `packages/0gkit-core/src/__tests__/errors.test.ts`

- [ ] **Step 1: Write the failing test**

`packages/0gkit-core/src/__tests__/errors.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  ZeroGError,
  ConfigError,
  NetworkError,
  ChainError,
  AttestationError,
} from "../errors.js";

describe("ZeroGError taxonomy", () => {
  it("ConfigError carries code, message, hint and is a ZeroGError", () => {
    const e = new ConfigError("RPC_ARISTOTLE is not set", "Set RPC_ARISTOTLE in .env");
    expect(e).toBeInstanceOf(ZeroGError);
    expect(e).toBeInstanceOf(Error);
    expect(e.code).toBe("CONFIG");
    expect(e.name).toBe("ConfigError");
    expect(e.message).toBe("RPC_ARISTOTLE is not set");
    expect(e.hint).toBe("Set RPC_ARISTOTLE in .env");
  });

  it("each subclass has the right code", () => {
    expect(new NetworkError("x", "y").code).toBe("NETWORK");
    expect(new ChainError("x", "y").code).toBe("CHAIN");
    expect(new AttestationError("x", "y").code).toBe("ATTESTATION");
  });

  it("subclasses are catchable as ZeroGError", () => {
    try {
      throw new NetworkError("unreachable", "run `0g doctor`");
    } catch (err) {
      expect(err).toBeInstanceOf(ZeroGError);
      if (err instanceof ZeroGError) expect(err.hint).toBe("run `0g doctor`");
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @0gkit/core test`
Expected: FAIL — cannot resolve `../errors.js`.

- [ ] **Step 3: Implement `packages/0gkit-core/src/errors.ts`**

```ts
export type ZeroGErrorCode = "CONFIG" | "NETWORK" | "CHAIN" | "ATTESTATION";

/**
 * Base error for everything 0gkit throws. Every error carries an actionable
 * `hint` — the exact remedy (missing env var, `0g doctor`, which check failed).
 * No 0gkit code path ever fails silently.
 */
export class ZeroGError extends Error {
  readonly code: ZeroGErrorCode;
  readonly hint: string;

  constructor(code: ZeroGErrorCode, message: string, hint: string) {
    super(message);
    this.name = "ZeroGError";
    this.code = code;
    this.hint = hint;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ConfigError extends ZeroGError {
  constructor(message: string, hint: string) {
    super("CONFIG", message, hint);
    this.name = "ConfigError";
  }
}

export class NetworkError extends ZeroGError {
  constructor(message: string, hint: string) {
    super("NETWORK", message, hint);
    this.name = "NetworkError";
  }
}

export class ChainError extends ZeroGError {
  constructor(message: string, hint: string) {
    super("CHAIN", message, hint);
    this.name = "ChainError";
  }
}

export class AttestationError extends ZeroGError {
  constructor(message: string, hint: string) {
    super("ATTESTATION", message, hint);
    this.name = "AttestationError";
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @0gkit/core test`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/0gkit-core/src/errors.ts packages/0gkit-core/src/__tests__/errors.test.ts
git commit -m "feat(0gkit-core): add ZeroGError taxonomy with actionable hints"
```

---

## Task 4: Research + implement network presets

**Files:**
- Create: `packages/0gkit-core/src/networks.ts`
- Test: `packages/0gkit-core/src/__tests__/networks.test.ts`
- Modify: `docs/superpowers/DECISIONS.md` (append D2)

- [ ] **Step 1: Research the unverified values (no guessing)**

Use WebSearch / WebFetch against official 0G sources:

- `0G Galileo testnet RPC URL and chain id`
- `0G Galileo testnet faucet`
- `0G Aristotle mainnet block explorer` (chain id 16661)
- `0G Galileo testnet block explorer`

Record findings (verified value **or** "unverified") in `docs/superpowers/DECISIONS.md` under a new `## D2 — 0G endpoints (2026-05-18)` section, each with its source URL. A value goes into the preset **only** if confirmed from an official 0G domain. Otherwise its preset field stays `undefined`.

- [ ] **Step 2: Write the failing test**

`packages/0gkit-core/src/__tests__/networks.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { networks, getNetwork } from "../networks.js";
import { ConfigError } from "../errors.js";

describe("network presets", () => {
  it("aristotle has the repo-proven chain id and RPC", () => {
    expect(networks.aristotle.chainId).toBe(16661);
    expect(networks.aristotle.rpcUrl).toBe("https://evmrpc.0g.ai");
    expect(networks.aristotle.testnet).toBe(false);
    expect(networks.aristotle.name).toBe("aristotle");
  });

  it("local is the standard Anvil preset", () => {
    expect(networks.local.chainId).toBe(31337);
    expect(networks.local.rpcUrl).toBe("http://127.0.0.1:8545");
    expect(networks.local.testnet).toBe(true);
  });

  it("galileo exists and is flagged testnet", () => {
    expect(networks.galileo.name).toBe("galileo");
    expect(networks.galileo.testnet).toBe(true);
  });

  it("getNetwork returns a known preset", () => {
    expect(getNetwork("aristotle")).toBe(networks.aristotle);
  });

  it("getNetwork throws ConfigError for an unknown name", () => {
    // @ts-expect-error testing the runtime guard
    expect(() => getNetwork("mainnet")).toThrowError(ConfigError);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `pnpm --filter @0gkit/core test`
Expected: FAIL — cannot resolve `../networks.js`.

- [ ] **Step 4: Implement `packages/0gkit-core/src/networks.ts`**

Fill `galileo.rpcUrl` / `galileo.chainId` / `galileo.faucetWebUrl` and the
`explorer` fields **only** with values verified in Step 1. Leave any unverified
field `undefined` (do not guess).

```ts
import { ConfigError } from "./errors.js";

export type NetworkName = "aristotle" | "galileo" | "local";

export interface NetworkPreset {
  /** Stable key. */
  name: NetworkName;
  /** EVM chain id. `undefined` ⇒ createClient throws ConfigError. */
  chainId?: number;
  /** EVM JSON-RPC URL. `undefined` ⇒ createClient throws ConfigError. */
  rpcUrl?: string;
  /** Block-explorer base, NO trailing slash. `undefined` ⇒ explorerUrl() throws. */
  explorer?: string;
  /** Programmatic faucet endpoint (testnet). `undefined` ⇒ faucet() throws. */
  faucetUrl?: string;
  /** Human faucet page, surfaced in faucet()'s error hint. */
  faucetWebUrl?: string;
  /** True for non-production networks. */
  testnet: boolean;
}

// Aristotle: chain id + RPC are repo-proven (storage.ts DEFAULT_RPC,
// 0G-HACKATHON-INTEGRATION-PLAN.md). `explorer` only if verified in D2.
export const aristotle: NetworkPreset = {
  name: "aristotle",
  chainId: 16661,
  rpcUrl: "https://evmrpc.0g.ai",
  explorer: undefined, // set from DECISIONS.md D2 only if verified
  testnet: false,
};

// Galileo: testnet. Fill rpcUrl/chainId/faucet from verified D2 research only.
export const galileo: NetworkPreset = {
  name: "galileo",
  chainId: undefined, // set from D2 only if verified
  rpcUrl: undefined, // set from D2 only if verified
  explorer: undefined, // set from D2 only if verified
  faucetWebUrl: undefined, // set from D2 only if verified
  testnet: true,
};

// Local Anvil — documented standard defaults.
export const local: NetworkPreset = {
  name: "local",
  chainId: 31337,
  rpcUrl: "http://127.0.0.1:8545",
  testnet: true,
};

export const networks = { aristotle, galileo, local } as const;

export function getNetwork(name: NetworkName): NetworkPreset {
  const preset = networks[name];
  if (!preset) {
    throw new ConfigError(
      `Unknown network '${String(name)}'.`,
      `Use one of: ${Object.keys(networks).join(", ")}.`
    );
  }
  return preset;
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm --filter @0gkit/core test`
Expected: PASS (all networks + errors tests green).

- [ ] **Step 6: Commit**

```bash
git add packages/0gkit-core/src/networks.ts packages/0gkit-core/src/__tests__/networks.test.ts docs/superpowers/DECISIONS.md
git commit -m "feat(0gkit-core): add verified network presets (D2 research recorded)"
```

---

## Task 5: `Receipt` type

**Files:**
- Create: `packages/0gkit-core/src/receipt.ts`
- Test: `packages/0gkit-core/src/__tests__/receipt.test.ts`

- [ ] **Step 1: Write the failing test** (a compile-level shape check)

`packages/0gkit-core/src/__tests__/receipt.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import type { Receipt } from "../receipt.js";

describe("Receipt", () => {
  it("accepts a minimal receipt (latencyMs only)", () => {
    const r: Receipt = { latencyMs: 12 };
    expect(r.latencyMs).toBe(12);
  });

  it("accepts a full receipt", () => {
    const r: Receipt = {
      txHash: "0xabc",
      explorerUrl: "https://example/tx/0xabc",
      blockNumber: 99n,
      latencyMs: 5,
      attestation: { ok: true },
    };
    expect(r.blockNumber).toBe(99n);
    expect(r.txHash).toBe("0xabc");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @0gkit/core test`
Expected: FAIL — cannot resolve `../receipt.js`.

- [ ] **Step 3: Implement `packages/0gkit-core/src/receipt.ts`**

```ts
/**
 * Uniform result envelope returned by every 0gkit operation that touches
 * the chain. `explorerUrl` is only present when the active network preset
 * has a verified explorer base. `attestation` is opaque here; the
 * @0gkit/attestation package gives it a concrete type.
 */
export interface Receipt {
  txHash?: `0x${string}` | string;
  explorerUrl?: string;
  blockNumber?: bigint;
  latencyMs: number;
  attestation?: unknown;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @0gkit/core test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/0gkit-core/src/receipt.ts packages/0gkit-core/src/__tests__/receipt.test.ts
git commit -m "feat(0gkit-core): add Receipt envelope type"
```

---

## Task 6: `createClient` viem factory

**Files:**
- Create: `packages/0gkit-core/src/client.ts`
- Test: `packages/0gkit-core/src/__tests__/client.test.ts`

- [ ] **Step 1: Write the failing test**

`packages/0gkit-core/src/__tests__/client.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { createClient, buildChain } from "../client.js";
import { networks } from "../networks.js";
import { ConfigError } from "../errors.js";

const TEST_PK =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

describe("createClient", () => {
  it("builds a public client on aristotle (chain id 16661)", () => {
    const c = createClient({ network: "aristotle" });
    expect(c.public.chain?.id).toBe(16661);
    expect(c.wallet).toBeUndefined();
    expect(c.network.name).toBe("aristotle");
  });

  it("builds a wallet client when a private key is given", () => {
    const c = createClient({ network: "local", privateKey: TEST_PK });
    expect(c.wallet).toBeDefined();
    expect(c.wallet?.account?.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });

  it("honors an rpcUrl override", () => {
    const c = createClient({ network: "local", rpcUrl: "http://127.0.0.1:9999" });
    expect(c.public.chain?.id).toBe(31337);
  });

  it("throws ConfigError when the preset has no rpcUrl/chainId and none is passed", () => {
    expect(() => buildChain({ ...networks.galileo, rpcUrl: undefined, chainId: undefined }))
      .toThrowError(ConfigError);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @0gkit/core test`
Expected: FAIL — cannot resolve `../client.js`.

- [ ] **Step 3: Implement `packages/0gkit-core/src/client.ts`**

```ts
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
  type Chain,
  type PublicClient,
  type WalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getNetwork, type NetworkName, type NetworkPreset } from "./networks.js";
import { ConfigError } from "./errors.js";

export interface CreateClientOptions {
  network: NetworkName;
  /** Overrides the preset RPC. Required if the preset has no rpcUrl. */
  rpcUrl?: string;
  /** Overrides the preset chain id. Required if the preset has no chainId. */
  chainId?: number;
  /** 0x-prefixed private key. When set, a wallet client is also returned. */
  privateKey?: `0x${string}` | string;
}

export interface ZeroGClient {
  network: NetworkPreset;
  public: PublicClient;
  wallet?: WalletClient;
}

/** Build a viem Chain from a preset (+ optional overrides). */
export function buildChain(
  preset: NetworkPreset,
  rpcUrl?: string,
  chainId?: number
): Chain {
  const url = rpcUrl ?? preset.rpcUrl;
  const id = chainId ?? preset.chainId;
  if (!url || !id) {
    throw new ConfigError(
      `Network '${preset.name}' has no ${!url ? "rpcUrl" : "chainId"} configured.`,
      `Pass { rpcUrl, chainId } to createClient, or use a network whose ` +
        `preset is fully resolved (aristotle, local). See docs/superpowers/DECISIONS.md (D2).`
    );
  }
  return defineChain({
    id,
    name: preset.name,
    nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
    rpcUrls: { default: { http: [url] } },
    ...(preset.explorer
      ? { blockExplorers: { default: { name: "0G Explorer", url: preset.explorer } } }
      : {}),
  });
}

export function createClient(opts: CreateClientOptions): ZeroGClient {
  const preset = getNetwork(opts.network);
  const chain = buildChain(preset, opts.rpcUrl, opts.chainId);
  const transport = http(chain.rpcUrls.default.http[0]);

  const publicClient = createPublicClient({ chain, transport });

  let wallet: WalletClient | undefined;
  if (opts.privateKey) {
    const pk = opts.privateKey.startsWith("0x")
      ? (opts.privateKey as `0x${string}`)
      : (`0x${opts.privateKey}` as `0x${string}`);
    wallet = createWalletClient({
      chain,
      transport,
      account: privateKeyToAccount(pk),
    });
  }

  return { network: preset, public: publicClient, wallet };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @0gkit/core test`
Expected: PASS (all core test files green).

- [ ] **Step 5: Commit**

```bash
git add packages/0gkit-core/src/client.ts packages/0gkit-core/src/__tests__/client.test.ts
git commit -m "feat(0gkit-core): add createClient viem factory"
```

---

## Task 7: `@0gkit/core` public barrel + typecheck

**Files:**
- Modify: `packages/0gkit-core/src/index.ts`

- [ ] **Step 1: Replace `packages/0gkit-core/src/index.ts` with the real barrel**

```ts
export {
  ZeroGError,
  ConfigError,
  NetworkError,
  ChainError,
  AttestationError,
  type ZeroGErrorCode,
} from "./errors.js";
export {
  networks,
  aristotle,
  galileo,
  local,
  getNetwork,
  type NetworkName,
  type NetworkPreset,
} from "./networks.js";
export { type Receipt } from "./receipt.js";
export {
  createClient,
  buildChain,
  type CreateClientOptions,
  type ZeroGClient,
} from "./client.js";
```

- [ ] **Step 2: Typecheck, build, test the whole package**

```bash
pnpm --filter @0gkit/core typecheck
pnpm --filter @0gkit/core build
pnpm --filter @0gkit/core test
```

Expected: typecheck clean, build emits `dist/index.{js,d.ts}`, all tests PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/0gkit-core/src/index.ts
git commit -m "feat(0gkit-core): export public barrel"
```

---

## Task 8: Scaffold `@0gkit/chain` package

**Files:**
- Create: `packages/0gkit-chain/package.json`
- Create: `packages/0gkit-chain/tsconfig.json`
- Create: `packages/0gkit-chain/tsup.config.ts`
- Create: `packages/0gkit-chain/src/index.ts`

- [ ] **Step 1: Create `packages/0gkit-chain/package.json`** (scope from Task 1)

```json
{
  "name": "@0gkit/chain",
  "version": "0.1.0",
  "description": "Neutral 0G chain helpers — explorer URLs, balance, waitForReceipt, testnet faucet. Built on @0gkit/core + viem.",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/rajkaria/foundry.git",
    "directory": "packages/0gkit-chain"
  },
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" }
  },
  "files": ["dist", "README.md"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "lint": "depcruise src --config ../../.dependency-cruiser.cjs",
    "clean": "rimraf dist",
    "prepublishOnly": "pnpm run clean && pnpm run build"
  },
  "dependencies": {
    "@0gkit/core": "workspace:*",
    "viem": "^2.21.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "dependency-cruiser": "^16.0.0",
    "rimraf": "^6.0.1",
    "tsup": "^8.3.5",
    "typescript": "^5.6.3",
    "vitest": "^2.1.8"
  },
  "keywords": ["0g", "0g-network", "viem", "faucet", "explorer", "toolkit"],
  "publishConfig": { "access": "public" }
}
```

- [ ] **Step 2: Create `packages/0gkit-chain/tsconfig.json`** (identical compilerOptions to core)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "emitDeclarationOnly": false,
    "noEmit": true,
    "isolatedModules": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"]
}
```

- [ ] **Step 3: Create `packages/0gkit-chain/tsup.config.ts`**

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

- [ ] **Step 4: Create a temporary `packages/0gkit-chain/src/index.ts`**

```ts
export const __0gkitChain = "scaffold";
```

- [ ] **Step 5: Install + build the workspace dependency chain**

```bash
pnpm install
pnpm --filter @0gkit/core build
pnpm --filter @0gkit/chain build
```

Expected: install links `@0gkit/core` into `@0gkit/chain` via `workspace:*`;
both build with no error.

- [ ] **Step 6: Commit**

```bash
git add packages/0gkit-chain pnpm-lock.yaml
git commit -m "feat(0gkit-chain): scaffold chain helpers package"
```

---

## Task 9: `explorerUrl` + `attachExplorerUrl`

**Files:**
- Create: `packages/0gkit-chain/src/explorer.ts`
- Test: `packages/0gkit-chain/src/__tests__/explorer.test.ts`

- [ ] **Step 1: Write the failing test**

`packages/0gkit-chain/src/__tests__/explorer.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { explorerUrl, attachExplorerUrl } from "../explorer.js";
import type { NetworkPreset } from "@0gkit/core";
import { ConfigError } from "@0gkit/core";

const withExplorer: NetworkPreset = {
  name: "aristotle",
  chainId: 16661,
  rpcUrl: "https://evmrpc.0g.ai",
  explorer: "https://explorer.example",
  testnet: false,
};
const noExplorer: NetworkPreset = { ...withExplorer, explorer: undefined };

describe("explorerUrl", () => {
  it("builds a tx URL", () => {
    expect(explorerUrl(withExplorer, { tx: "0xabc" })).toBe(
      "https://explorer.example/tx/0xabc"
    );
  });

  it("builds an address URL", () => {
    expect(explorerUrl(withExplorer, { address: "0xdef" })).toBe(
      "https://explorer.example/address/0xdef"
    );
  });

  it("strips a trailing slash on the explorer base", () => {
    expect(
      explorerUrl({ ...withExplorer, explorer: "https://explorer.example/" }, { tx: "0x1" })
    ).toBe("https://explorer.example/tx/0x1");
  });

  it("throws ConfigError when the network has no explorer", () => {
    expect(() => explorerUrl(noExplorer, { tx: "0xabc" })).toThrowError(ConfigError);
  });

  it("attachExplorerUrl adds the url when possible and is a no-op otherwise", () => {
    const a = attachExplorerUrl({ latencyMs: 1, txHash: "0xabc" }, withExplorer);
    expect(a.explorerUrl).toBe("https://explorer.example/tx/0xabc");
    const b = attachExplorerUrl({ latencyMs: 1, txHash: "0xabc" }, noExplorer);
    expect(b.explorerUrl).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @0gkit/chain test`
Expected: FAIL — cannot resolve `../explorer.js`.

- [ ] **Step 3: Implement `packages/0gkit-chain/src/explorer.ts`**

```ts
import { ConfigError, type NetworkPreset, type Receipt } from "@0gkit/core";

export type ExplorerTarget = { tx: string } | { address: string };

/** Build a block-explorer URL. Throws ConfigError if the network has none. */
export function explorerUrl(
  network: NetworkPreset,
  target: ExplorerTarget
): string {
  if (!network.explorer) {
    throw new ConfigError(
      `Network '${network.name}' has no block explorer configured.`,
      `Pass an explorer base in the network preset, or omit explorer links. ` +
        `See docs/superpowers/DECISIONS.md (D2) for verified 0G explorer bases.`
    );
  }
  const base = network.explorer.replace(/\/+$/, "");
  if ("tx" in target) return `${base}/tx/${target.tx}`;
  return `${base}/address/${target.address}`;
}

/**
 * Returns a copy of `receipt` with `explorerUrl` filled from `receipt.txHash`
 * when the network has an explorer. No-op (returns the receipt unchanged-shaped)
 * when there is no explorer or no txHash. Never throws.
 */
export function attachExplorerUrl(
  receipt: Receipt,
  network: NetworkPreset
): Receipt {
  if (!network.explorer || !receipt.txHash) return receipt;
  return {
    ...receipt,
    explorerUrl: explorerUrl(network, { tx: String(receipt.txHash) }),
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @0gkit/chain test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/0gkit-chain/src/explorer.ts packages/0gkit-chain/src/__tests__/explorer.test.ts
git commit -m "feat(0gkit-chain): add explorerUrl + attachExplorerUrl"
```

---

## Task 10: `balance`

**Files:**
- Create: `packages/0gkit-chain/src/balance.ts`
- Test: `packages/0gkit-chain/src/__tests__/balance.test.ts`

- [ ] **Step 1: Write the failing test** (viem public client is injected + mocked)

`packages/0gkit-chain/src/__tests__/balance.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { balance } from "../balance.js";

describe("balance", () => {
  it("returns the native balance as bigint", async () => {
    const fakeClient = {
      public: { getBalance: vi.fn().mockResolvedValue(123n) },
    } as any;
    const bal = await balance(fakeClient, "0x1111111111111111111111111111111111111111");
    expect(bal).toBe(123n);
    expect(fakeClient.public.getBalance).toHaveBeenCalledWith({
      address: "0x1111111111111111111111111111111111111111",
    });
  });

  it("wraps RPC failures in a NetworkError", async () => {
    const fakeClient = {
      public: { getBalance: vi.fn().mockRejectedValue(new Error("ECONNREFUSED")) },
    } as any;
    await expect(
      balance(fakeClient, "0x1111111111111111111111111111111111111111")
    ).rejects.toMatchObject({ code: "NETWORK" });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @0gkit/chain test`
Expected: FAIL — cannot resolve `../balance.js`.

- [ ] **Step 3: Implement `packages/0gkit-chain/src/balance.ts`**

```ts
import { NetworkError, type ZeroGClient } from "@0gkit/core";

/** Native 0G balance (wei) for an address. */
export async function balance(
  client: ZeroGClient,
  address: `0x${string}` | string
): Promise<bigint> {
  try {
    return await client.public.getBalance({
      address: address as `0x${string}`,
    });
  } catch (err) {
    throw new NetworkError(
      `Failed to read balance for ${address}: ${(err as Error).message}`,
      `Check the RPC is reachable (run \`0g doctor\` once the CLI exists), or ` +
        `pass a working rpcUrl to createClient.`
    );
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @0gkit/chain test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/0gkit-chain/src/balance.ts packages/0gkit-chain/src/__tests__/balance.test.ts
git commit -m "feat(0gkit-chain): add balance() with NetworkError wrapping"
```

---

## Task 11: `waitForReceipt`

**Files:**
- Create: `packages/0gkit-chain/src/receipt-wait.ts`
- Test: `packages/0gkit-chain/src/__tests__/receipt-wait.test.ts`

- [ ] **Step 1: Write the failing test**

`packages/0gkit-chain/src/__tests__/receipt-wait.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { waitForReceipt } from "../receipt-wait.js";
import type { NetworkPreset } from "@0gkit/core";

const net: NetworkPreset = {
  name: "aristotle",
  chainId: 16661,
  rpcUrl: "https://evmrpc.0g.ai",
  explorer: "https://explorer.example",
  testnet: false,
};

describe("waitForReceipt", () => {
  it("returns a Receipt with txHash, blockNumber, explorerUrl, latencyMs", async () => {
    const client = {
      network: net,
      public: {
        waitForTransactionReceipt: vi
          .fn()
          .mockResolvedValue({ transactionHash: "0xabc", blockNumber: 42n }),
      },
    } as any;

    const r = await waitForReceipt(client, "0xabc");
    expect(r.txHash).toBe("0xabc");
    expect(r.blockNumber).toBe(42n);
    expect(r.explorerUrl).toBe("https://explorer.example/tx/0xabc");
    expect(typeof r.latencyMs).toBe("number");
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("omits explorerUrl when the network has no explorer", async () => {
    const client = {
      network: { ...net, explorer: undefined },
      public: {
        waitForTransactionReceipt: vi
          .fn()
          .mockResolvedValue({ transactionHash: "0xabc", blockNumber: 1n }),
      },
    } as any;
    const r = await waitForReceipt(client, "0xabc");
    expect(r.explorerUrl).toBeUndefined();
  });

  it("wraps failures in a ChainError", async () => {
    const client = {
      network: net,
      public: {
        waitForTransactionReceipt: vi
          .fn()
          .mockRejectedValue(new Error("reverted")),
      },
    } as any;
    await expect(waitForReceipt(client, "0xabc")).rejects.toMatchObject({
      code: "CHAIN",
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @0gkit/chain test`
Expected: FAIL — cannot resolve `../receipt-wait.js`.

- [ ] **Step 3: Implement `packages/0gkit-chain/src/receipt-wait.ts`**

```ts
import { ChainError, type Receipt, type ZeroGClient } from "@0gkit/core";
import { attachExplorerUrl } from "./explorer.js";

/** Wait for a tx to mine and return a normalized Receipt (+ explorer link). */
export async function waitForReceipt(
  client: ZeroGClient,
  txHash: `0x${string}` | string
): Promise<Receipt> {
  const startedAt = Date.now();
  try {
    const r = await client.public.waitForTransactionReceipt({
      hash: txHash as `0x${string}`,
    });
    const receipt: Receipt = {
      txHash: r.transactionHash,
      blockNumber: r.blockNumber,
      latencyMs: Date.now() - startedAt,
    };
    return attachExplorerUrl(receipt, client.network);
  } catch (err) {
    throw new ChainError(
      `Transaction ${txHash} did not confirm: ${(err as Error).message}`,
      `Verify the hash and that it was broadcast to '${client.network.name}'.`
    );
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @0gkit/chain test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/0gkit-chain/src/receipt-wait.ts packages/0gkit-chain/src/__tests__/receipt-wait.test.ts
git commit -m "feat(0gkit-chain): add waitForReceipt with explorer link + latency"
```

---

## Task 12: `faucet`

**Files:**
- Create: `packages/0gkit-chain/src/faucet.ts`
- Test: `packages/0gkit-chain/src/__tests__/faucet.test.ts`

- [ ] **Step 1: Write the failing test** (fetch is stubbed; no real network)

`packages/0gkit-chain/src/__tests__/faucet.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { faucet } from "../faucet.js";
import type { NetworkPreset } from "@0gkit/core";

const galileoProgrammatic: NetworkPreset = {
  name: "galileo",
  chainId: 1,
  rpcUrl: "https://rpc.example",
  faucetUrl: "https://faucet.example/api/drip",
  faucetWebUrl: "https://faucet.example",
  testnet: true,
};
const galileoNoApi: NetworkPreset = {
  ...galileoProgrammatic,
  faucetUrl: undefined,
};

afterEach(() => vi.unstubAllGlobals());

describe("faucet", () => {
  it("POSTs to the configured faucet endpoint and returns a Receipt", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ txHash: "0xabc" }), { status: 200 })
      );
    vi.stubGlobal("fetch", fetchMock);

    const r = await faucet(
      galileoProgrammatic,
      "0x1111111111111111111111111111111111111111"
    );
    expect(r.txHash).toBe("0xabc");
    expect(typeof r.latencyMs).toBe("number");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://faucet.example/api/drip",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("throws ConfigError with the web faucet URL in the hint when no API is configured", async () => {
    await expect(
      faucet(galileoNoApi, "0x1111111111111111111111111111111111111111")
    ).rejects.toMatchObject({
      code: "CONFIG",
      hint: expect.stringContaining("https://faucet.example"),
    });
  });

  it("throws NetworkError when the faucet endpoint errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("nope", { status: 500 }))
    );
    await expect(
      faucet(galileoProgrammatic, "0x1111111111111111111111111111111111111111")
    ).rejects.toMatchObject({ code: "NETWORK" });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @0gkit/chain test`
Expected: FAIL — cannot resolve `../faucet.js`.

- [ ] **Step 3: Implement `packages/0gkit-chain/src/faucet.ts`**

```ts
import {
  ConfigError,
  NetworkError,
  type NetworkPreset,
  type Receipt,
} from "@0gkit/core";

/**
 * Request testnet funds. If the preset has a programmatic `faucetUrl`, POST
 * `{ address }` to it. Otherwise throw a ConfigError whose hint points the
 * user at the human faucet page (no silent failure, no guessed endpoint).
 */
export async function faucet(
  network: NetworkPreset,
  address: `0x${string}` | string
): Promise<Receipt> {
  if (!network.faucetUrl) {
    const where = network.faucetWebUrl
      ? `Visit ${network.faucetWebUrl} and request funds for ${address}.`
      : `No faucet is configured for '${network.name}'. See ` +
        `docs/superpowers/DECISIONS.md (D2) for the verified 0G faucet.`;
    throw new ConfigError(
      `No programmatic faucet endpoint for network '${network.name}'.`,
      where
    );
  }

  const startedAt = Date.now();
  let res: Response;
  try {
    res = await fetch(network.faucetUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ address }),
    });
  } catch (err) {
    throw new NetworkError(
      `Faucet request failed: ${(err as Error).message}`,
      network.faucetWebUrl
        ? `Try the web faucet: ${network.faucetWebUrl}`
        : `Check connectivity and retry.`
    );
  }

  if (!res.ok) {
    throw new NetworkError(
      `Faucet returned HTTP ${res.status}.`,
      network.faucetWebUrl
        ? `Try the web faucet: ${network.faucetWebUrl}`
        : `Retry later; testnet faucets rate-limit per address/IP.`
    );
  }

  const body = (await res.json().catch(() => ({}))) as { txHash?: string };
  return { txHash: body.txHash, latencyMs: Date.now() - startedAt };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @0gkit/chain test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/0gkit-chain/src/faucet.ts packages/0gkit-chain/src/__tests__/faucet.test.ts
git commit -m "feat(0gkit-chain): add faucet() with honest no-endpoint fallback"
```

---

## Task 13: `@0gkit/chain` barrel + the CI neutrality boundary

**Files:**
- Modify: `packages/0gkit-chain/src/index.ts`
- Create: `.dependency-cruiser.cjs` (repo root)
- Create: `packages/0gkit-chain/src/__tests__/boundary.test.ts`
- Modify: `package.json` (repo root — add `boundary:check` script)

- [ ] **Step 1: Replace `packages/0gkit-chain/src/index.ts` with the real barrel**

```ts
export {
  explorerUrl,
  attachExplorerUrl,
  type ExplorerTarget,
} from "./explorer.js";
export { balance } from "./balance.js";
export { waitForReceipt } from "./receipt-wait.js";
export { faucet } from "./faucet.js";
```

- [ ] **Step 2: Create `.dependency-cruiser.cjs` at the repo root**

```js
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-foundry-in-0gkit",
      comment:
        "Neutral @0gkit/* packages must never depend on Foundry. This is a " +
        "hard architectural invariant (see spec §4).",
      severity: "error",
      from: { path: "^packages/0gkit-[^/]+/src" },
      to: {
        path: "node_modules/@foundryprotocol|^packages/sdk",
      },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: { exportsFields: ["exports"], conditionNames: ["import", "types"] },
  },
};
```

- [ ] **Step 3: Add the root `boundary:check` script**

In the repo-root `package.json`, add to `"scripts"` (keep existing scripts; insert this key after `"test"`):

```json
    "boundary:check": "depcruise packages/0gkit-core/src packages/0gkit-chain/src --config .dependency-cruiser.cjs",
```

Then add `dependency-cruiser` to the root `devDependencies`:

```json
    "dependency-cruiser": "^16.0.0",
```

Run `pnpm install`.

- [ ] **Step 4: Write the boundary test (prove the rule actually catches a violation)**

`packages/0gkit-chain/src/__tests__/boundary.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import { writeFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(__dirname, "../../../..");
const violationFile = resolve(
  repoRoot,
  "packages/0gkit-chain/src/__boundary_violation__.ts"
);

function runBoundaryCheck(): { ok: boolean; out: string } {
  try {
    const out = execSync("pnpm boundary:check", {
      cwd: repoRoot,
      stdio: "pipe",
    }).toString();
    return { ok: true, out };
  } catch (e: any) {
    return { ok: false, out: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
}

describe("CI neutrality boundary", () => {
  it("passes on the clean tree", () => {
    const { ok } = runBoundaryCheck();
    expect(ok).toBe(true);
  });

  it("fails when a @0gkit package imports Foundry", () => {
    writeFileSync(
      violationFile,
      `import "@foundryprotocol/sdk";\nexport const x = 1;\n`
    );
    try {
      const { ok, out } = runBoundaryCheck();
      expect(ok).toBe(false);
      expect(out).toContain("no-foundry-in-0gkit");
    } finally {
      rmSync(violationFile, { force: true });
    }
  });
});
```

- [ ] **Step 5: Run the boundary check + tests**

```bash
pnpm boundary:check
pnpm --filter @0gkit/chain test
```

Expected: `boundary:check` exits 0 on the clean tree; the boundary test file
proves it exits non-zero (with `no-foundry-in-0gkit`) when a violation is
injected, then cleans up. All `@0gkit/chain` tests PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/0gkit-chain/src/index.ts .dependency-cruiser.cjs package.json pnpm-lock.yaml packages/0gkit-chain/src/__tests__/boundary.test.ts
git commit -m "feat(0gkit): enforce no-Foundry boundary for @0gkit/* in CI"
```

---

## Task 14: Wire both packages into CI

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Add build/test/boundary steps to the `web` job**

In `.github/workflows/ci.yml`, in the `web` job's `steps:`, insert these
immediately **after** the existing `- run: pnpm --filter @foundryprotocol/sdk test`
line and **before** `- run: pnpm typecheck`:

```yaml
      - run: pnpm boundary:check

      - run: pnpm --filter @0gkit/core build

      - run: pnpm --filter @0gkit/core test

      - run: pnpm --filter @0gkit/chain build

      - run: pnpm --filter @0gkit/chain test
```

- [ ] **Step 2: Verify the full pipeline locally**

```bash
pnpm format:check
pnpm boundary:check
pnpm --filter @0gkit/core build
pnpm --filter @0gkit/core typecheck
pnpm --filter @0gkit/core test
pnpm --filter @0gkit/chain build
pnpm --filter @0gkit/chain typecheck
pnpm --filter @0gkit/chain test
```

Expected: every command exits 0. If `pnpm format:check` flags the new files,
run `pnpm format` and re-check, then amend the relevant prior commit's files
into a follow-up `style:` commit (do NOT `--amend` a pushed commit).

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: build, test, and boundary-check @0gkit/core + @0gkit/chain"
```

---

## Task 15: Standalone READMEs (defacto DX requires per-package docs)

**Files:**
- Create: `packages/0gkit-core/README.md`
- Create: `packages/0gkit-chain/README.md`

- [ ] **Step 1: Write `packages/0gkit-core/README.md`**

```markdown
# @0gkit/core

Neutral 0G foundation: network presets, a viem client factory, the `Receipt`
envelope, and the `ZeroGError` taxonomy. Zero Foundry dependency — enforced in CI.

## Install

```bash
npm install @0gkit/core viem
```

## Use

```ts
import { createClient, networks } from "@0gkit/core";

const client = createClient({ network: "aristotle" });
console.log(client.public.chain?.id); // 16661
```

Errors are actionable — every `ZeroGError` has `.code` and `.hint`. `aristotle`
and `local` presets are fully resolved; `galileo` is testnet (see the repo's
`docs/superpowers/DECISIONS.md` D2 for verified endpoints).

## License

MIT.
```

- [ ] **Step 2: Write `packages/0gkit-chain/README.md`**

```markdown
# @0gkit/chain

Neutral 0G chain helpers built on `@0gkit/core` + `viem`: `explorerUrl`,
`balance`, `waitForReceipt`, and a testnet `faucet`.

## Install

```bash
npm install @0gkit/chain @0gkit/core viem
```

## Use

```ts
import { createClient } from "@0gkit/core";
import { balance, waitForReceipt } from "@0gkit/chain";

const client = createClient({ network: "aristotle" });
const wei = await balance(client, "0xYourAddress");
const receipt = await waitForReceipt(client, "0xTxHash");
console.log(receipt.explorerUrl); // present iff the network has a verified explorer
```

## License

MIT.
```

- [ ] **Step 3: Format check the new docs**

```bash
pnpm format:check
```

Expected: exit 0 (run `pnpm format` first if needed).

- [ ] **Step 4: Commit**

```bash
git add packages/0gkit-core/README.md packages/0gkit-chain/README.md
git commit -m "docs(0gkit): add standalone READMEs for core + chain"
```

---

## Final acceptance (spec §11.1)

Sub-project 1 is done when all of these hold:

- [ ] `@0gkit/core` exports `createClient`, `Receipt`, `ZeroGError` (+ subclasses), `networks`, `getNetwork`, `buildChain`.
- [ ] `@0gkit/chain` exports `explorerUrl`, `attachExplorerUrl`, `balance`, `waitForReceipt`, `faucet`.
- [ ] Each package installs independently and builds (`pnpm --filter <pkg> build`).
- [ ] `pnpm boundary:check` passes; the boundary test proves it fails on a Foundry import.
- [ ] CI (`web` job) builds + tests both packages and runs `boundary:check`.
- [ ] npm scope decision (D1) and endpoint research (D2) recorded in `docs/superpowers/DECISIONS.md`.
- [ ] No fabricated URLs/chain ids: every endpoint is repo-proven, a documented standard, or verified-and-cited in D2; unverified values stay `undefined` and surface a `ConfigError` with a helpful `.hint`.

---

## Self-review (completed by plan author)

**Spec coverage:** §3 naming → Task 1; §4 `@0gkit/core` (networks/createClient/Receipt/ZeroGError) → Tasks 2–7; §4 `@0gkit/chain` (explorerUrl/balance/waitForReceipt/faucet) → Tasks 8–13; §4 enforced no-Foundry rule → Task 12; §7 error taxonomy with hints → Task 3 (used everywhere); §8 testing (unit + mocked deps, ≥80% — these packages are pure logic, every exported fn has tests) → all tasks; §11.1 acceptance → Final acceptance; §12 npm-scope + endpoint risks → Tasks 1 & 4 with deterministic fallbacks. Live Galileo integration tests (§8) are intentionally deferred to the primitives sub-project (2), where there is a networked surface to integration-test; sub-project 1 is pure logic and fully unit-tested.

**Placeholder scan:** No "TBD/TODO/handle edge cases". The only literal placeholders are the `<...>` fields inside the D1/D2 decision-record templates, which the engineer fills with observed/researched values — that is the task's deliverable, not an unfilled plan gap. Galileo/explorer/faucet values are deliberately `undefined` with a defined research procedure + ConfigError fallback (honesty rule), not vague placeholders.

**Type consistency:** `NetworkPreset`, `NetworkName`, `ZeroGClient`, `Receipt`, `ConfigError/NetworkError/ChainError` names match across core (defined Tasks 3–6) and chain (consumed Tasks 9–13). `createClient` returns `{ network, public, wallet? }`; chain helpers consume `client.public` / `client.network` consistently. `explorerUrl(network, {tx|address})` signature is stable between Task 9 definition and Task 11 use (via `attachExplorerUrl`).
