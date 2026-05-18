# 0gkit Sub-Project 3: The `0g` CLI (`@0gkit/cli`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `@0gkit/cli` — the language-agnostic `0g` binary that turns every merged 0gkit primitive into a copy-paste command (`0g init`, `0g doctor`, `0g chain`, `0g storage`, `0g infer`, `0g da`, `0g attest`) plus a clearly-demarcated, opt-in-only `0g foundry` plugin namespace, so a newcomer reaches a real testnet result in under a minute with zero prior setup.

**Architecture:** A Layer-2 surface package in the existing pnpm/turbo monorepo that consumes only Layer-0/1 `@0gkit/*` packages (never the reverse, never Foundry). `buildProgram(deps)` returns a pure, fully-injectable [commander](https://www.npmjs.com/package/commander) `Command` tree — every network/fs/stdin touchpoint is a seam in a `ProgramDeps` bag (the same injectable-loader discipline proven in sub-project 2's `loadSdk`/`loadBroker`). The thin `src/cli.ts` builds the real deps and calls `parseAsync`; tests call `buildProgram(fakeDeps)` and assert on a captured `write` sink — zero network, zero spawning. Every command returns a structured `CommandResult` rendered by one central renderer, so human output and `--json` are guaranteed consistent and snapshot/schema testable. The optional Foundry plugin is reached through a **computed-specifier dynamic import** (`["@foundryprotocol","sdk"].join("/")`) so dependency-cruiser builds no edge and the CI neutrality rule stays green by construction — a `boundary.test.ts` proves it.

**Tech Stack:** TypeScript 5.6 (strict, ESM), `commander ^14.0.0`, `@0gkit/core` / `@0gkit/chain` / `@0gkit/storage` / `@0gkit/compute` / `@0gkit/da` / `@0gkit/attestation` (`workspace:*`), `viem ^2.21.0` (peer, via core), `tsup` (esm, shebang banner), `vitest`, `dependency-cruiser`, pnpm 9.12, turbo.

**Spec:** `docs/superpowers/specs/2026-05-18-0gkit-0g-builder-toolkit-design.md` (§2 neutrality + Foundry-as-opt-in-plugin, §4 CLI surface, §5 first-run UX, §6 multi-language, §7 errors, §8 testing, §11.3 acceptance, §12 graceful degradation).

**Conventions (locked — mirror merged `@0gkit/core`/`@0gkit/chain`/`@0gkit/storage`):** ESM-only `"type":"module"`; `tsup` (`target:es2022`, externalize workspace + `commander`); `tsc --noEmit` typecheck; `vitest run`; tests in `src/__tests__/*.test.ts`; prettier `semi:true singleQuote:false trailingComma:"es5" printWidth:88 tabWidth:2`; `0x${string}`-typed hex; **every thrown error is a `ZeroGError` subclass from `@0gkit/core` with an actionable `.hint`** (no bare `throw new Error`); `.js` import specifiers (vitest resolves `.ts`, proven); `package.json` mirrors `@0gkit/storage` exactly (neutral `homepage`/`bugs` at `github.com/rajkaria/foundry` — NEVER `foundryprotocol.xyz`; `LICENSE` in `files`; `LICENSE` file = byte-copy of `packages/sdk/LICENSE`; `publishConfig.access:"public"`); on GPG failure commit with `git -c commit.gpgsign=false`, **never `--no-verify`**.

**Honesty rule (no fabricated endpoints/behaviors):** The CLI only calls the already-merged `@0gkit/*` APIs. It invents no endpoint. Galileo has **no programmatic faucet** (preset has `faucetWebUrl` only) — `0g chain faucet` therefore surfaces `@0gkit/chain`'s real `ConfigError` (which points the user at `https://faucet.0g.ai`); the plan's acceptance test asserts this honest behavior rather than faking a faucet. The "< 60s to a real result" acceptance is met by **removing setup friction** (`init` + `doctor` + unambiguous faucet guidance + a funded-key `storage put`/`chain tx` path that yields a genuine on-chain `txHash`), not by inventing a zero-funds txHash source.

**Grounding (verified against merged code in this task):** Signatures are taken verbatim from the merged packages: `createClient({network,rpcUrl?,chainId?,privateKey?}) → {network,public,wallet?}`; `getNetwork(name)→NetworkPreset`; `faucet(preset,address)→Receipt` (throws `ConfigError` when `!preset.faucetUrl`); `balance(client,address)→bigint`; `waitForReceipt(client,hash)→Receipt`; `explorerUrl(preset,{tx}|{address})→string` (throws if no explorer); `attachExplorerUrl(receipt,preset)→Receipt` (never throws); `new Storage({network?:"aristotle"|"galileo",indexerUrl?,rpcUrl?,privateKey?}).upload(Uint8Array)→{root,tx,raw}` / `.download(root)→Uint8Array` / `.exists(root)→boolean` / `.computeRoot(Uint8Array)→string`; `new Compute({network?,brokerKey?,brokerRpc?,provider?,model?}).inference({messages,model?,temperature?})→{output,receipt,raw}`; `new DA({network?:"aristotle"|"galileo",encoderUrl?,apiKey?}).publish(payload)→{digest,daRef?,blobId?,mode,latencyMs,raw?}` / `.digest(payload)→Hex` / `.verify(payload,expectedDigest)→boolean`; `parseEnvelope(v)→AttestationEnvelope`, `verifyEnvelope(signed,signer)→{ok,checks:{digest,signer},signer}`, `reportEnvelope(signed)→string`. `Receipt={txHash?,explorerUrl?,blockNumber?,latencyMs,attestation?}`. Network union is `"aristotle"|"galileo"|"local"`; Storage/Compute/DA accept only `"aristotle"|"galileo"`.

---

## File structure (locked)

```
docs/superpowers/DECISIONS.md                 (append D4 — CLI framework, no-chalk, foundry-load pattern)
packages/0gkit-cli/
  package.json            (name @0gkit/cli; bin { "0g": "./dist/cli.js" }; deps: 6×@0gkit + commander)
  tsconfig.json           (byte-copy of packages/0gkit-core/tsconfig.json)
  tsup.config.ts          (entry {cli:"src/cli.ts"}; banner shebang; dts:false)
  vitest.config.ts        (v8 coverage; exclude src/cli.ts + __tests__; 80/80/80/70)
  README.md               (install, every command in CLI + curl + TS form, env vars, escape hatch)
  LICENSE                 (byte-copy of packages/sdk/LICENSE)
  src/
    cli.ts                (thin entry: real deps + parseAsync + error→exitCode; coverage-excluded)
    program.ts            (ProgramDeps, buildProgram(deps): Command, runCommand wrapper)
    context.ts            (resolveContext: flag>env>preset; default network galileo; validate)
    output.ts             (createOutput: human/--json renderer + NO_COLOR/TTY-aware ANSI)
    foundry-loader.ts     (loadFoundry(): computed-specifier dynamic import; null when absent)
    commands/
      chain.ts            (0g chain faucet|balance|tx)
      doctor.ts           (0g doctor — preflight checklist)
      init.ts             (0g init [name] — scaffold runnable testnet project)
      storage.ts          (0g storage put|get|exists)
      da.ts               (0g da publish|verify)
      attest.ts           (0g attest verify|report)
      infer.ts            (0g infer)
      foundry.ts          (0g foundry … — hidden unless resolvable/--foundry)
    __tests__/
      output.test.ts  context.test.ts  program.test.ts
      chain.test.ts   doctor.test.ts   init.test.ts
      storage.test.ts da.test.ts       attest.test.ts
      infer.test.ts   boundary.test.ts
.github/workflows/ci.yml                       (MODIFY: build+test @0gkit/cli; add to coverage filter)
```

**Dependency order (drives task order):** scaffold → output → context → program skeleton → chain → doctor → init → storage → da → attest → infer → foundry+boundary → README+final verify. Each task is independently green and committed.

---

## Task 1: Scaffold `@0gkit/cli` + CI wiring + DECISIONS D4

**Files:** Create `packages/0gkit-cli/{package.json,tsconfig.json,tsup.config.ts,vitest.config.ts,LICENSE,src/cli.ts}`; Modify `.github/workflows/ci.yml`, `docs/superpowers/DECISIONS.md`.

- [ ] **Step 1: `packages/0gkit-cli/package.json`:**

```json
{
  "name": "@0gkit/cli",
  "version": "0.1.0",
  "description": "The neutral 0G command line — init, doctor, chain, storage, infer, da, attest. Foundry is a separate opt-in plugin.",
  "license": "MIT",
  "homepage": "https://github.com/rajkaria/foundry/tree/main/packages/0gkit-cli",
  "repository": {
    "type": "git",
    "url": "https://github.com/rajkaria/foundry.git",
    "directory": "packages/0gkit-cli"
  },
  "bugs": {
    "url": "https://github.com/rajkaria/foundry/issues"
  },
  "type": "module",
  "bin": {
    "0g": "./dist/cli.js"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "coverage": "vitest run --coverage",
    "lint": "depcruise src --config ../../.dependency-cruiser.cjs",
    "clean": "rimraf dist",
    "prepublishOnly": "pnpm run clean && pnpm run build"
  },
  "dependencies": {
    "@0gkit/attestation": "workspace:*",
    "@0gkit/chain": "workspace:*",
    "@0gkit/compute": "workspace:*",
    "@0gkit/core": "workspace:*",
    "@0gkit/da": "workspace:*",
    "@0gkit/storage": "workspace:*",
    "commander": "^14.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "@vitest/coverage-v8": "^2.1.8",
    "dependency-cruiser": "^16.0.0",
    "rimraf": "^6.0.1",
    "tsup": "^8.3.5",
    "typescript": "^5.6.3",
    "vitest": "^2.1.8"
  },
  "keywords": [
    "0g",
    "0g-network",
    "cli",
    "toolkit"
  ],
  "publishConfig": {
    "access": "public"
  }
}
```

- [ ] **Step 2: `packages/0gkit-cli/tsconfig.json`** — byte-for-byte copy of `packages/0gkit-core/tsconfig.json` (target ES2022, module esnext, moduleResolution bundler, lib [ES2022,DOM], strict, esModuleInterop, skipLibCheck, declaration, emitDeclarationOnly false, noEmit, isolatedModules, resolveJsonModule; include `src/**/*`; exclude dist, node_modules).

- [ ] **Step 3: `packages/0gkit-cli/tsup.config.ts`:**

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: { cli: "src/cli.ts" },
  format: ["esm"],
  dts: false,
  splitting: false,
  clean: true,
  treeshake: true,
  sourcemap: true,
  target: "es2022",
  banner: { js: "#!/usr/bin/env node" },
  external: [
    "@0gkit/core",
    "@0gkit/chain",
    "@0gkit/storage",
    "@0gkit/compute",
    "@0gkit/da",
    "@0gkit/attestation",
    "commander",
  ],
});
```

- [ ] **Step 4: `packages/0gkit-cli/vitest.config.ts`:**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: ["src/**/*.ts"],
      exclude: ["src/cli.ts", "src/__tests__/**"],
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80,
        branches: 70,
      },
    },
  },
});
```

- [ ] **Step 5: `packages/0gkit-cli/LICENSE`** — byte-for-byte copy of `packages/sdk/LICENSE`.

- [ ] **Step 6: temporary `packages/0gkit-cli/src/cli.ts`:**

```ts
export const __0gkitCli = "scaffold";
```

- [ ] **Step 7: Append D4 to `docs/superpowers/DECISIONS.md`:**

```markdown

## D4 — `@0gkit/cli` framework & Foundry-plugin load (2026-05-18)

- **Arg parser:** `commander ^14` (a normal external npm dependency — the
  dependency-cruiser `no-foundry-in-0gkit` rule only matches `^packages/|@foundryprotocol`,
  so `commander` is unaffected). Chosen over yargs/cac for typed nested
  subcommands, `exitOverride()` (clean test seam), and `optsWithGlobals()`.
- **No `chalk`:** a ~15-line internal `src/output.ts` ANSI helper, NO_COLOR-
  and non-TTY-aware. Avoids the chalk-v5 ESM/CJS hazard and keeps the neutral
  surface dependency-light.
- **Foundry plugin = opt-in, zero static edge:** `src/foundry-loader.ts`
  resolves `@foundryprotocol/sdk` via a **computed specifier**
  `["@foundryprotocol","sdk"].join("/")` passed to `import()`. dependency-cruiser
  performs static analysis and cannot resolve a non-literal specifier, so **no
  graph edge is created** and `pnpm boundary:check` stays green by construction
  (not by reviewer vigilance). `0g foundry` is hidden from `--help` unless the
  plugin resolves at runtime or `--foundry` is passed. This is the only place
  Foundry may appear in the CLI (spec §2, §4). `boundary.test.ts` asserts the
  rule still passes with the loader present.
- **Version source:** `program.version()` uses a `VERSION = "0.1.0"` constant in
  `program.ts` kept in lockstep with `package.json` (sub-project packages are
  all `0.1.0`; revisit when semantic-release lands in sub-project 8).
```

- [ ] **Step 8:** Run `pnpm install`, then `pnpm --filter @0gkit/core build` and `pnpm --filter @0gkit/cli build`.
  Expected: both succeed; `packages/0gkit-cli/dist/cli.js` exists and starts with `#!/usr/bin/env node`. (Do NOT run `lint` yet — no real src.)

- [ ] **Step 9: Modify `.github/workflows/ci.yml`** — in job `web`, immediately after the two `@0gkit/compute` lines (`pnpm --filter @0gkit/compute build` / `... test`), insert:

```yaml
      - run: pnpm --filter @0gkit/cli build

      - run: pnpm --filter @0gkit/cli test
```

  and extend the existing coverage line by appending ` --filter @0gkit/cli` so it reads:

```yaml
      - run: pnpm --filter @0gkit/da --filter @0gkit/attestation --filter @0gkit/storage --filter @0gkit/compute --filter @0gkit/cli run coverage
```

- [ ] **Step 10: Commit**

```bash
git add packages/0gkit-cli .github/workflows/ci.yml docs/superpowers/DECISIONS.md pnpm-lock.yaml
git commit -m "chore(0gkit-cli): scaffold @0gkit/cli package + CI + DECISIONS D4"
```

---

## Task 2: `output.ts` — TTY/NO_COLOR-aware human + `--json` renderer

**Files:** Create `packages/0gkit-cli/src/output.ts`, `packages/0gkit-cli/src/__tests__/output.test.ts`.

- [ ] **Step 1: Write the failing test** — `packages/0gkit-cli/src/__tests__/output.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { createOutput } from "../output.js";

describe("createOutput", () => {
  it("renders human success lines, no color when noColor", () => {
    const lines: string[] = [];
    const out = createOutput({
      json: false,
      isTTY: true,
      noColor: true,
      write: (s) => lines.push(s),
    });
    out.success({ human: ["root 0xabc", "tx 0xdef"], json: { root: "0xabc" } });
    expect(lines).toEqual(["root 0xabc", "tx 0xdef"]);
  });

  it("renders a single JSON object with ok:true in --json mode", () => {
    const lines: string[] = [];
    const out = createOutput({
      json: true,
      isTTY: false,
      noColor: true,
      write: (s) => lines.push(s),
    });
    out.success({ human: ["ignored"], json: { root: "0xabc" } });
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0])).toEqual({ ok: true, root: "0xabc" });
  });

  it("renders errors as red+hint in human mode", () => {
    const lines: string[] = [];
    const out = createOutput({
      json: false,
      isTTY: true,
      noColor: true,
      write: (s) => lines.push(s),
    });
    out.failure({ code: "CONFIG", message: "missing key", hint: "set ZEROG_PRIVATE_KEY" });
    expect(lines.join("\n")).toContain("missing key");
    expect(lines.join("\n")).toContain("set ZEROG_PRIVATE_KEY");
  });

  it("renders errors as ok:false JSON in --json mode", () => {
    const lines: string[] = [];
    const out = createOutput({
      json: true,
      isTTY: false,
      noColor: true,
      write: (s) => lines.push(s),
    });
    out.failure({ code: "NETWORK", message: "down", hint: "retry" });
    expect(JSON.parse(lines[0])).toEqual({
      ok: false,
      error: { code: "NETWORK", message: "down", hint: "retry" },
    });
  });

  it("emits ANSI codes only when TTY and color allowed", () => {
    const lines: string[] = [];
    const out = createOutput({
      json: false,
      isTTY: true,
      noColor: false,
      write: (s) => lines.push(s),
    });
    out.failure({ code: "CONFIG", message: "x", hint: "y" });
    expect(lines.join("")).toContain("\x1b[");
  });
});
```

- [ ] **Step 2: Run, expect FAIL** — `pnpm --filter @0gkit/cli test` → cannot resolve `../output.js`.

- [ ] **Step 3: Implement `packages/0gkit-cli/src/output.ts`:**

```ts
export interface CommandResult {
  /** Pretty human lines (one console line each). */
  human: string[];
  /** Machine payload merged under `{ ok: true, ... }` for --json. */
  json: Record<string, unknown>;
}

export interface RenderedError {
  code: string;
  message: string;
  hint: string;
}

export interface OutputConfig {
  json: boolean;
  isTTY: boolean;
  noColor: boolean;
  write: (line: string) => void;
}

export interface Output {
  readonly json: boolean;
  success(result: CommandResult): void;
  failure(error: RenderedError): void;
  note(line: string): void;
}

export function createOutput(cfg: OutputConfig): Output {
  const useColor = cfg.isTTY && !cfg.noColor;
  const paint = (code: string, s: string): string =>
    useColor ? `\x1b[${code}m${s}\x1b[0m` : s;
  const red = (s: string) => paint("31", s);
  const dim = (s: string) => paint("2", s);

  return {
    json: cfg.json,
    success(result) {
      if (cfg.json) {
        cfg.write(JSON.stringify({ ok: true, ...result.json }));
        return;
      }
      for (const line of result.human) cfg.write(line);
    },
    failure(error) {
      if (cfg.json) {
        cfg.write(
          JSON.stringify({
            ok: false,
            error: { code: error.code, message: error.message, hint: error.hint },
          })
        );
        return;
      }
      cfg.write(red(`✗ ${error.message}`));
      cfg.write(dim(`  → ${error.hint}`));
    },
    note(line) {
      if (!cfg.json) cfg.write(line);
    },
  };
}
```

- [ ] **Step 4: Run, expect PASS** — `pnpm --filter @0gkit/cli test` → all 5 green.

- [ ] **Step 5: Commit**

```bash
git add packages/0gkit-cli/src/output.ts packages/0gkit-cli/src/__tests__/output.test.ts
git commit -m "feat(0gkit-cli): output renderer (human + --json, TTY/NO_COLOR aware)"
```

---

## Task 3: `context.ts` — flag > env > preset resolution

**Files:** Create `packages/0gkit-cli/src/context.ts`, `packages/0gkit-cli/src/__tests__/context.test.ts`.

- [ ] **Step 1: Write the failing test** — `packages/0gkit-cli/src/__tests__/context.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { resolveContext } from "../context.js";

describe("resolveContext", () => {
  it("defaults to galileo with no flags or env", () => {
    const ctx = resolveContext({}, {});
    expect(ctx.network).toBe("galileo");
    expect(ctx.json).toBe(false);
    expect(ctx.rpcUrl).toBeUndefined();
  });

  it("env overrides preset default, flag overrides env", () => {
    const envOnly = resolveContext({}, { ZEROG_NETWORK: "aristotle" });
    expect(envOnly.network).toBe("aristotle");
    const flagWins = resolveContext(
      { network: "local" },
      { ZEROG_NETWORK: "aristotle" }
    );
    expect(flagWins.network).toBe("local");
  });

  it("resolves rpc, privateKey, json from flags then env", () => {
    const ctx = resolveContext(
      { rpc: "http://x", json: true },
      { ZEROG_PRIVATE_KEY: "abc" }
    );
    expect(ctx.rpcUrl).toBe("http://x");
    expect(ctx.privateKey).toBe("abc");
    expect(ctx.json).toBe(true);
  });

  it("throws ConfigError with hint for an unknown network", () => {
    expect(() => resolveContext({ network: "mainnet" }, {})).toThrowError(
      /Unknown network 'mainnet'/
    );
    try {
      resolveContext({ network: "mainnet" }, {});
    } catch (e) {
      expect((e as { code: string }).code).toBe("CONFIG");
      expect((e as { hint: string }).hint).toContain("aristotle");
    }
  });
});
```

- [ ] **Step 2: Run, expect FAIL** — `pnpm --filter @0gkit/cli test` → cannot resolve `../context.js`.

- [ ] **Step 3: Implement `packages/0gkit-cli/src/context.ts`:**

```ts
import { ConfigError, type NetworkName } from "@0gkit/core";

export interface GlobalFlags {
  network?: string;
  rpc?: string;
  privateKey?: string;
  json?: boolean;
  foundry?: boolean;
}

export interface CliContext {
  network: NetworkName;
  rpcUrl?: string;
  privateKey?: string;
  json: boolean;
  foundry: boolean;
}

const KNOWN: readonly NetworkName[] = ["aristotle", "galileo", "local"];

export function resolveContext(
  flags: GlobalFlags,
  env: Record<string, string | undefined>
): CliContext {
  const raw = flags.network ?? env.ZEROG_NETWORK ?? "galileo";
  if (!KNOWN.includes(raw as NetworkName)) {
    throw new ConfigError(
      `Unknown network '${raw}'.`,
      `Use one of: ${KNOWN.join(", ")} (default: galileo). Pass --network or set ZEROG_NETWORK.`
    );
  }
  return {
    network: raw as NetworkName,
    rpcUrl: flags.rpc ?? env.ZEROG_RPC_URL,
    privateKey: flags.privateKey ?? env.ZEROG_PRIVATE_KEY,
    json: flags.json === true,
    foundry: flags.foundry === true,
  };
}
```

- [ ] **Step 4: Run, expect PASS** — `pnpm --filter @0gkit/cli test` → context + output suites green.

- [ ] **Step 5: Commit**

```bash
git add packages/0gkit-cli/src/context.ts packages/0gkit-cli/src/__tests__/context.test.ts
git commit -m "feat(0gkit-cli): context resolution (flag > env > galileo default)"
```

---

## Task 4: `program.ts` skeleton + `cli.ts` entry + `runCommand`

**Files:** Create `packages/0gkit-cli/src/program.ts`; Replace `packages/0gkit-cli/src/cli.ts`; Create `packages/0gkit-cli/src/__tests__/program.test.ts`.

- [ ] **Step 1: Write the failing test** — `packages/0gkit-cli/src/__tests__/program.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { buildProgram, type ProgramDeps } from "../program.js";

function fakeDeps(over: Partial<ProgramDeps> = {}): ProgramDeps {
  const lines: string[] = [];
  return {
    createClient: vi.fn(),
    getNetwork: vi.fn(),
    faucet: vi.fn(),
    balance: vi.fn(),
    waitForReceipt: vi.fn(),
    attachExplorerUrl: vi.fn((r) => r),
    explorerUrl: vi.fn(() => "https://x/tx/0x"),
    makeStorage: vi.fn(),
    makeCompute: vi.fn(),
    makeDA: vi.fn(),
    attest: { parseEnvelope: vi.fn(), verifyEnvelope: vi.fn(), reportEnvelope: vi.fn() },
    loadFoundry: vi.fn(async () => null),
    fs: {
      readFile: vi.fn(),
      writeFile: vi.fn(),
      mkdir: vi.fn(),
      readdir: vi.fn(async () => []),
      exists: vi.fn(async () => false),
    },
    readStdin: vi.fn(async () => new Uint8Array()),
    fetch: vi.fn(async () => ({ status: 200 })),
    cwd: () => "/tmp",
    env: {},
    isTTY: false,
    noColor: true,
    write: (s: string) => lines.push(s),
    _lines: lines,
  } as unknown as ProgramDeps;
}

describe("buildProgram", () => {
  it("registers the neutral command groups", async () => {
    const program = buildProgram(fakeDeps());
    const names = program.commands.map((c) => c.name()).sort();
    expect(names).toEqual(
      ["attest", "chain", "da", "doctor", "infer", "init", "storage"].sort()
    );
  });

  it("hides `foundry` from help when the plugin is absent", async () => {
    const program = buildProgram(fakeDeps());
    program.exitOverride();
    program.configureOutput({ writeOut: () => {}, writeErr: () => {} });
    expect(program.commands.find((c) => c.name() === "foundry")).toBeUndefined();
  });

  it("exposes --network/--rpc/--json/--private-key global options", () => {
    const program = buildProgram(fakeDeps());
    const opts = program.options.map((o) => o.long).sort();
    expect(opts).toEqual(["--json", "--network", "--private-key", "--rpc"].sort());
  });

  it("renders a thrown ZeroGError through the json renderer", async () => {
    const deps = fakeDeps();
    deps.createClient = vi.fn(() => {
      throw Object.assign(new Error("rpc dead"), { code: "NETWORK", hint: "run 0g doctor" });
    });
    const program = buildProgram(deps);
    program.exitOverride();
    await program.parseAsync(
      ["chain", "balance", "0x1111111111111111111111111111111111111111", "--json"],
      { from: "user" }
    );
    const payload = JSON.parse((deps as any)._lines.at(-1));
    expect(payload).toEqual({
      ok: false,
      error: { code: "NETWORK", message: "rpc dead", hint: "run 0g doctor" },
    });
    expect(process.exitCode).toBe(1);
    process.exitCode = 0;
  });
});
```

- [ ] **Step 2: Run, expect FAIL** — `pnpm --filter @0gkit/cli test` → cannot resolve `../program.js`.

- [ ] **Step 3: Implement `packages/0gkit-cli/src/program.ts`:**

```ts
import { Command } from "commander";
import { ZeroGError } from "@0gkit/core";
import type { createClient, getNetwork } from "@0gkit/core";
import type {
  faucet,
  balance,
  waitForReceipt,
  attachExplorerUrl,
  explorerUrl,
} from "@0gkit/chain";
import { Storage } from "@0gkit/storage";
import { Compute } from "@0gkit/compute";
import { DA } from "@0gkit/da";
import {
  parseEnvelope,
  verifyEnvelope,
  reportEnvelope,
} from "@0gkit/attestation";
import { createOutput, type CommandResult } from "./output.js";
import { resolveContext, type CliContext, type GlobalFlags } from "./context.js";
import type { FoundryPlugin } from "./foundry-loader.js";
import { registerChain } from "./commands/chain.js";
import { registerDoctor } from "./commands/doctor.js";
import { registerInit } from "./commands/init.js";
import { registerStorage } from "./commands/storage.js";
import { registerDa } from "./commands/da.js";
import { registerAttest } from "./commands/attest.js";
import { registerInfer } from "./commands/infer.js";
import { registerFoundry } from "./commands/foundry.js";

export const VERSION = "0.1.0";

export interface FsLike {
  readFile(path: string): Promise<Uint8Array>;
  writeFile(path: string, data: Uint8Array | string): Promise<void>;
  mkdir(path: string): Promise<void>;
  readdir(path: string): Promise<string[]>;
  exists(path: string): Promise<boolean>;
}

export interface ProgramDeps {
  createClient: typeof createClient;
  getNetwork: typeof getNetwork;
  faucet: typeof faucet;
  balance: typeof balance;
  waitForReceipt: typeof waitForReceipt;
  attachExplorerUrl: typeof attachExplorerUrl;
  explorerUrl: typeof explorerUrl;
  makeStorage: (cfg: ConstructorParameters<typeof Storage>[0]) => Storage;
  makeCompute: (cfg: ConstructorParameters<typeof Compute>[0]) => Compute;
  makeDA: (cfg: ConstructorParameters<typeof DA>[0]) => DA;
  attest: {
    parseEnvelope: typeof parseEnvelope;
    verifyEnvelope: typeof verifyEnvelope;
    reportEnvelope: typeof reportEnvelope;
  };
  loadFoundry: () => Promise<FoundryPlugin | null>;
  fs: FsLike;
  readStdin: () => Promise<Uint8Array>;
  /** Injected so `0g doctor` reachability probes are testable (no real net). */
  fetch: typeof fetch;
  cwd: () => string;
  env: Record<string, string | undefined>;
  isTTY: boolean;
  noColor: boolean;
  write: (line: string) => void;
}

/** Build the resolved context + output sink for one command invocation. */
export function ctxOf(deps: ProgramDeps, cmd: Command) {
  const globals = cmd.optsWithGlobals() as GlobalFlags;
  const context: CliContext = resolveContext(globals, deps.env);
  const out = createOutput({
    json: context.json,
    isTTY: deps.isTTY,
    noColor: deps.noColor,
    write: deps.write,
  });
  return { context, out };
}

/** Run a command body, mapping any ZeroGError to the renderer + exit code 1. */
export async function runCommand(
  deps: ProgramDeps,
  cmd: Command,
  body: (ctx: CliContext) => Promise<CommandResult>
): Promise<void> {
  const { context, out } = ctxOf(deps, cmd);
  try {
    out.success(await body(context));
  } catch (err) {
    if (err instanceof ZeroGError) {
      out.failure({ code: err.code, message: err.message, hint: err.hint });
    } else {
      const e = err as { code?: string; message?: string; hint?: string };
      out.failure({
        code: e.code ?? "CONFIG",
        message: e.message ?? String(err),
        hint: e.hint ?? "Unexpected error — re-run with --json for the raw shape.",
      });
    }
    process.exitCode = 1;
  }
}

export function buildProgram(deps: ProgramDeps): Command {
  const program = new Command();
  program
    .name("0g")
    .description("The neutral 0G command line. Foundry is a separate opt-in plugin.")
    .version(VERSION)
    .option("--network <name>", "aristotle | galileo | local (default: galileo)")
    .option("--rpc <url>", "override the network RPC URL")
    .option("--private-key <hex>", "signer key (or env ZEROG_PRIVATE_KEY)")
    .option("--json", "machine-readable JSON output")
    .option("--foundry", "force-show the optional Foundry plugin namespace");

  registerChain(program, deps);
  registerDoctor(program, deps);
  registerInit(program, deps);
  registerStorage(program, deps);
  registerDa(program, deps);
  registerAttest(program, deps);
  registerInfer(program, deps);
  registerFoundry(program, deps);

  return program;
}
```

- [ ] **Step 4: Replace `packages/0gkit-cli/src/cli.ts`** (real entry; coverage-excluded):

```ts
import { readFile, writeFile, mkdir, readdir, access } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient, getNetwork } from "@0gkit/core";
import {
  faucet,
  balance,
  waitForReceipt,
  attachExplorerUrl,
  explorerUrl,
} from "@0gkit/chain";
import { Storage } from "@0gkit/storage";
import { Compute } from "@0gkit/compute";
import { DA } from "@0gkit/da";
import {
  parseEnvelope,
  verifyEnvelope,
  reportEnvelope,
} from "@0gkit/attestation";
import { buildProgram, type ProgramDeps } from "./program.js";
import { loadFoundry } from "./foundry-loader.js";

async function readStdin(): Promise<Uint8Array> {
  const chunks: Buffer[] = [];
  for await (const c of process.stdin) chunks.push(c as Buffer);
  return new Uint8Array(Buffer.concat(chunks));
}

const deps: ProgramDeps = {
  createClient,
  getNetwork,
  faucet,
  balance,
  waitForReceipt,
  attachExplorerUrl,
  explorerUrl,
  makeStorage: (cfg) => new Storage(cfg),
  makeCompute: (cfg) => new Compute(cfg),
  makeDA: (cfg) => new DA(cfg),
  attest: { parseEnvelope, verifyEnvelope, reportEnvelope },
  loadFoundry,
  fs: {
    readFile: (p) => readFile(p).then((b) => new Uint8Array(b)),
    writeFile: (p, d) => writeFile(p, d),
    mkdir: (p) => mkdir(p, { recursive: true }).then(() => undefined),
    readdir: (p) => readdir(p),
    exists: (p) =>
      access(p).then(
        () => true,
        () => false
      ),
  },
  readStdin,
  fetch: globalThis.fetch,
  cwd: () => process.cwd(),
  env: process.env,
  isTTY: process.stdout.isTTY === true,
  noColor: process.env.NO_COLOR != null,
  write: (line) => process.stdout.write(line + "\n"),
};

await buildProgram(deps).parseAsync(process.argv);
```

- [ ] **Step 5: Create stub command/loader modules so the barrel imports resolve.** Create each of the following with exactly this content (they are fully implemented in later tasks; stubs keep Task 4 green and isolated):

  `packages/0gkit-cli/src/foundry-loader.ts`:

```ts
export interface FoundryPlugin {
  name: string;
  version: string;
}

export async function loadFoundry(): Promise<FoundryPlugin | null> {
  return null;
}
```

  `packages/0gkit-cli/src/commands/chain.ts`, `doctor.ts`, `init.ts`, `storage.ts`, `da.ts`, `attest.ts`, `infer.ts`, `foundry.ts` — each:

```ts
import type { Command } from "commander";
import type { ProgramDeps } from "../program.js";

export function registerCHANGE_ME(_program: Command, _deps: ProgramDeps): void {}
```

  Rename the exported function per file to match the import in `program.ts`:
  `registerChain`, `registerDoctor`, `registerInit`, `registerStorage`, `registerDa`,
  `registerAttest`, `registerInfer`, `registerFoundry`.

- [ ] **Step 6: Adjust the `program.test.ts` expectation for stubs.** Stubs register nothing, so the first test ("registers the neutral command groups") will fail until later tasks. Mark it pending now by changing `it("registers the neutral command groups", …)` to `it.skip("registers the neutral command groups", …)` and `it("hides \`foundry\`…")` stays valid (no foundry registered). The remaining program tests (`global options`, `ZeroGError render`) must pass. (Later tasks re-enable the skipped test as they wire real commands; Task 13 verifies it is un-skipped and green.)

- [ ] **Step 7: Run, expect PASS** — `pnpm --filter @0gkit/cli build` (cli.ts compiles) then `pnpm --filter @0gkit/cli test`. Expected: `output`, `context` green; `program` → `global options` + `ZeroGError render` green, one skipped.

- [ ] **Step 8: Commit**

```bash
git add packages/0gkit-cli/src
git commit -m "feat(0gkit-cli): program tree, runCommand error mapping, real cli entry"
```

---

## Task 5: `0g chain faucet|balance|tx`

**Files:** Replace `packages/0gkit-cli/src/commands/chain.ts`; Create `packages/0gkit-cli/src/__tests__/chain.test.ts`.

- [ ] **Step 1: Write the failing test** — `packages/0gkit-cli/src/__tests__/chain.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { ConfigError } from "@0gkit/core";
import { buildProgram, type ProgramDeps } from "../program.js";

function deps(over: Partial<ProgramDeps> = {}) {
  const lines: string[] = [];
  const base = {
    createClient: vi.fn(() => ({ network: { name: "galileo", explorer: "https://e" } })),
    getNetwork: vi.fn((n: string) => ({ name: n, faucetWebUrl: "https://faucet.0g.ai" })),
    faucet: vi.fn(),
    balance: vi.fn(async () => 1500000000000000000n),
    waitForReceipt: vi.fn(async () => ({
      txHash: "0xdead",
      blockNumber: 9n,
      latencyMs: 12,
      explorerUrl: "https://e/tx/0xdead",
    })),
    attachExplorerUrl: vi.fn((r) => r),
    explorerUrl: vi.fn(),
    makeStorage: vi.fn(),
    makeCompute: vi.fn(),
    makeDA: vi.fn(),
    attest: { parseEnvelope: vi.fn(), verifyEnvelope: vi.fn(), reportEnvelope: vi.fn() },
    loadFoundry: vi.fn(async () => null),
    fs: {
      readFile: vi.fn(),
      writeFile: vi.fn(),
      mkdir: vi.fn(),
      readdir: vi.fn(async () => []),
      exists: vi.fn(async () => false),
    },
    readStdin: vi.fn(async () => new Uint8Array()),
    cwd: () => "/tmp",
    env: {},
    isTTY: false,
    noColor: true,
    write: (s: string) => lines.push(s),
    ...over,
  } as unknown as ProgramDeps;
  return { d: base, lines };
}

const ADDR = "0x1111111111111111111111111111111111111111";

describe("0g chain", () => {
  it("balance prints wei + 0G (json)", async () => {
    const { d, lines } = deps();
    const p = buildProgram(d);
    p.exitOverride();
    await p.parseAsync(["chain", "balance", ADDR, "--json"], { from: "user" });
    expect(JSON.parse(lines.at(-1)!)).toMatchObject({
      ok: true,
      address: ADDR,
      wei: "1500000000000000000",
      zg: "1.5",
    });
  });

  it("tx waits for a receipt and surfaces the explorer link", async () => {
    const { d, lines } = deps();
    const p = buildProgram(d);
    p.exitOverride();
    await p.parseAsync(["chain", "tx", "0xdead", "--json"], { from: "user" });
    expect(JSON.parse(lines.at(-1)!)).toMatchObject({
      ok: true,
      txHash: "0xdead",
      blockNumber: "9",
      explorerUrl: "https://e/tx/0xdead",
    });
  });

  it("faucet surfaces the @0gkit/chain ConfigError honestly on galileo", async () => {
    const { d, lines } = deps({
      faucet: vi.fn(async () => {
        throw new ConfigError(
          "No programmatic faucet endpoint for network 'galileo'.",
          "Visit https://faucet.0g.ai and request funds for " + ADDR + "."
        );
      }),
    });
    const p = buildProgram(d);
    p.exitOverride();
    await p.parseAsync(["chain", "faucet", ADDR, "--json"], { from: "user" });
    const out = JSON.parse(lines.at(-1)!);
    expect(out.ok).toBe(false);
    expect(out.error.code).toBe("CONFIG");
    expect(out.error.hint).toContain("faucet.0g.ai");
    expect(process.exitCode).toBe(1);
    process.exitCode = 0;
  });
});
```

- [ ] **Step 2: Run, expect FAIL** — `pnpm --filter @0gkit/cli test` → chain suite fails (stub registers nothing → "unknown command 'chain'").

- [ ] **Step 3: Add `viem` to `@0gkit/cli` BEFORE implementing (pnpm isolated node_modules will not resolve an undeclared `viem`).** In `packages/0gkit-cli/package.json` add to `dependencies`: `"viem": "^2.21.0"` (keep keys sorted). In `packages/0gkit-cli/tsup.config.ts` append `"viem"` to the `external` array. Run `pnpm install`. Then `pnpm --filter @0gkit/cli build` (still builds — chain.ts is still the stub).

- [ ] **Step 4: Implement `packages/0gkit-cli/src/commands/chain.ts`:**

```ts
import type { Command } from "commander";
import { formatEther } from "viem";
import { runCommand, type ProgramDeps } from "../program.js";

export function registerChain(program: Command, deps: ProgramDeps): void {
  const chain = program
    .command("chain")
    .description("native-chain helpers: faucet, balance, tx");

  chain
    .command("faucet <address>")
    .description("request testnet funds (galileo points you at the web faucet)")
    .action(async function (this: Command, address: string) {
      await runCommand(deps, this, async (ctx) => {
        const preset = deps.getNetwork(ctx.network);
        const r = await deps.faucet(preset, address);
        return {
          human: [
            `requested faucet funds for ${address} on ${ctx.network}`,
            r.txHash ? `tx ${r.txHash}` : `(no tx hash returned)`,
          ],
          json: { address, network: ctx.network, txHash: r.txHash ?? null },
        };
      });
    });

  chain
    .command("balance <address>")
    .description("native 0G balance")
    .action(async function (this: Command, address: string) {
      await runCommand(deps, this, async (ctx) => {
        const client = deps.createClient({
          network: ctx.network,
          rpcUrl: ctx.rpcUrl,
        });
        const wei = await deps.balance(client, address);
        const zg = formatEther(wei);
        return {
          human: [`${address}`, `  ${zg} 0G  (${wei.toString()} wei)`],
          json: { address, network: ctx.network, wei: wei.toString(), zg },
        };
      });
    });

  chain
    .command("tx <hash>")
    .description("wait for a tx receipt + explorer link")
    .action(async function (this: Command, hash: string) {
      await runCommand(deps, this, async (ctx) => {
        const client = deps.createClient({
          network: ctx.network,
          rpcUrl: ctx.rpcUrl,
        });
        const r = await deps.waitForReceipt(client, hash);
        return {
          human: [
            `tx ${r.txHash}`,
            `  block ${r.blockNumber?.toString() ?? "?"}  (${r.latencyMs} ms)`,
            r.explorerUrl ? `  ${r.explorerUrl}` : `  (no explorer for ${ctx.network})`,
          ],
          json: {
            txHash: r.txHash ?? null,
            blockNumber: r.blockNumber?.toString() ?? null,
            latencyMs: r.latencyMs,
            explorerUrl: r.explorerUrl ?? null,
          },
        };
      });
    });
}
```

- [ ] **Step 5: Leave the skipped program test skipped.** Task 4 added `it.skip("registers the neutral command groups"…)`. It stays skipped until Task 11 (when all 7 neutral groups exist) — re-enabling now would fail (only `chain` registered). No edit this task.

- [ ] **Step 6: Run, expect PASS** — `pnpm --filter @0gkit/cli build` then `pnpm --filter @0gkit/cli test` → chain suite (3) green; prior suites green.

- [ ] **Step 7: Commit**

```bash
git add packages/0gkit-cli/src/commands/chain.ts packages/0gkit-cli/src/__tests__/chain.test.ts packages/0gkit-cli/package.json packages/0gkit-cli/tsup.config.ts pnpm-lock.yaml
git commit -m "feat(0gkit-cli): 0g chain faucet|balance|tx"
```

---

## Task 6: `0g doctor` — preflight checklist

**Files:** Replace `packages/0gkit-cli/src/commands/doctor.ts`; Create `packages/0gkit-cli/src/__tests__/doctor.test.ts`.

- [ ] **Step 1: Write the failing test** — `packages/0gkit-cli/src/__tests__/doctor.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { buildProgram, type ProgramDeps } from "../program.js";

function deps(over: Partial<ProgramDeps> = {}) {
  const lines: string[] = [];
  const base = {
    createClient: vi.fn(() => ({
      network: { name: "galileo", chainId: 16602, explorer: "https://e" },
      public: { getChainId: vi.fn(async () => 16602) },
    })),
    getNetwork: vi.fn(() => ({
      name: "galileo",
      chainId: 16602,
      rpcUrl: "https://rpc",
      explorer: "https://e",
      faucetWebUrl: "https://faucet.0g.ai",
      testnet: true,
    })),
    faucet: vi.fn(),
    balance: vi.fn(async () => 2000000000000000000n),
    fetch: vi.fn(async () => ({ status: 200 })),
    waitForReceipt: vi.fn(),
    attachExplorerUrl: vi.fn((r) => r),
    explorerUrl: vi.fn(),
    makeStorage: vi.fn(),
    makeCompute: vi.fn(),
    makeDA: vi.fn(),
    attest: { parseEnvelope: vi.fn(), verifyEnvelope: vi.fn(), reportEnvelope: vi.fn() },
    loadFoundry: vi.fn(async () => null),
    fs: {
      readFile: vi.fn(),
      writeFile: vi.fn(),
      mkdir: vi.fn(),
      readdir: vi.fn(async () => []),
      exists: vi.fn(async () => false),
    },
    readStdin: vi.fn(async () => new Uint8Array()),
    cwd: () => "/tmp",
    env: {},
    isTTY: false,
    noColor: true,
    write: (s: string) => lines.push(s),
    ...over,
  } as unknown as ProgramDeps;
  return { d: base, lines };
}

describe("0g doctor", () => {
  it("all-green when RPC chainId matches and key funded (json)", async () => {
    const { d, lines } = deps({
      env: { ZEROG_PRIVATE_KEY: "0x" + "1".repeat(64) },
    });
    const p = buildProgram(d);
    p.exitOverride();
    await p.parseAsync(["doctor", "--json"], { from: "user" });
    const out = JSON.parse(lines.at(-1)!);
    expect(out.ok).toBe(true);
    const byName = Object.fromEntries(out.checks.map((c: any) => [c.name, c.ok]));
    expect(byName.rpc).toBe(true);
    expect(byName.signer).toBe(true);
  });

  it("rpc check red + exit 1 + hint when chainId mismatches", async () => {
    const { d, lines } = deps({
      createClient: vi.fn(() => ({
        network: { name: "galileo", chainId: 16602 },
        public: { getChainId: vi.fn(async () => 999) },
      })),
    });
    const p = buildProgram(d);
    p.exitOverride();
    await p.parseAsync(["doctor", "--json"], { from: "user" });
    const out = JSON.parse(lines.at(-1)!);
    expect(out.ok).toBe(false);
    const rpc = out.checks.find((c: any) => c.name === "rpc");
    expect(rpc.ok).toBe(false);
    expect(rpc.hint).toContain("chain");
    expect(process.exitCode).toBe(1);
    process.exitCode = 0;
  });

  it("degrades gracefully when RPC throws (no crash, red check)", async () => {
    const { d, lines } = deps({
      createClient: vi.fn(() => ({
        network: { name: "galileo", chainId: 16602 },
        public: {
          getChainId: vi.fn(async () => {
            throw new Error("ECONNREFUSED");
          }),
        },
      })),
    });
    const p = buildProgram(d);
    p.exitOverride();
    await p.parseAsync(["doctor", "--json"], { from: "user" });
    const out = JSON.parse(lines.at(-1)!);
    expect(out.ok).toBe(false);
    expect(out.checks.find((c: any) => c.name === "rpc").ok).toBe(false);
    process.exitCode = 0;
  });

  it("signer check is a soft warning (not failing) when no key set", async () => {
    const { d, lines } = deps();
    const p = buildProgram(d);
    p.exitOverride();
    await p.parseAsync(["doctor", "--json"], { from: "user" });
    const out = JSON.parse(lines.at(-1)!);
    const signer = out.checks.find((c: any) => c.name === "signer");
    expect(signer.ok).toBe(false);
    expect(signer.required).toBe(false);
    expect(out.ok).toBe(true); // soft check does not fail the run
    process.exitCode = 0;
  });
});
```

- [ ] **Step 2: Run, expect FAIL** — `pnpm --filter @0gkit/cli test` → "unknown command 'doctor'".

- [ ] **Step 3: Implement `packages/0gkit-cli/src/commands/doctor.ts`:**

```ts
import type { Command } from "commander";
import { runCommand, type ProgramDeps } from "../program.js";
import type { CommandResult } from "../output.js";

interface Check {
  name: string;
  ok: boolean;
  required: boolean;
  detail: string;
  hint: string;
}

export function registerDoctor(program: Command, deps: ProgramDeps): void {
  program
    .command("doctor")
    .description("preflight: RPC, signer, storage indexer, DA encoder, faucet")
    .action(async function (this: Command) {
      await runCommand(deps, this, async (ctx): Promise<CommandResult> => {
        const checks: Check[] = [];
        const preset = deps.getNetwork(ctx.network);

        // 1. RPC reachable + chainId matches the preset (required).
        try {
          const client = deps.createClient({
            network: ctx.network,
            rpcUrl: ctx.rpcUrl,
          });
          const observed = await client.public.getChainId();
          const expected = preset.chainId;
          const ok = expected === undefined || observed === expected;
          checks.push({
            name: "rpc",
            ok,
            required: true,
            detail: `chainId ${observed} (expected ${expected ?? "any"})`,
            hint: ok
              ? "ok"
              : `RPC is reachable but reports the wrong chain. Pass --rpc for ${ctx.network} or check ZEROG_RPC_URL.`,
          });
        } catch (e) {
          checks.push({
            name: "rpc",
            ok: false,
            required: true,
            detail: `unreachable: ${(e as Error).message}`,
            hint: `Set --rpc or ZEROG_RPC_URL to a reachable ${ctx.network} JSON-RPC.`,
          });
        }

        // 2. Signer present + funded (soft — read-only use is valid).
        if (!ctx.privateKey) {
          checks.push({
            name: "signer",
            ok: false,
            required: false,
            detail: "no private key — read-only mode",
            hint: "Set ZEROG_PRIVATE_KEY (or --private-key) to send transactions.",
          });
        } else {
          try {
            const client = deps.createClient({
              network: ctx.network,
              rpcUrl: ctx.rpcUrl,
              privateKey: ctx.privateKey,
            });
            const addr = client.wallet?.account?.address ?? "(unknown)";
            const wei = await deps.balance(client, addr);
            checks.push({
              name: "signer",
              ok: wei > 0n,
              required: false,
              detail: `${addr} — ${wei.toString()} wei`,
              hint:
                wei > 0n
                  ? "ok"
                  : preset.faucetWebUrl
                    ? `Fund it at ${preset.faucetWebUrl}.`
                    : `Fund this address on ${ctx.network}.`,
            });
          } catch (e) {
            checks.push({
              name: "signer",
              ok: false,
              required: false,
              detail: `key set but balance check failed: ${(e as Error).message}`,
              hint: "Verify the key is a 32-byte hex and the RPC is reachable.",
            });
          }
        }

        // 3. Storage indexer + 4. DA encoder reachability (soft).
        for (const probe of [
          {
            name: "storage-indexer",
            url:
              ctx.network === "galileo"
                ? "https://indexer-storage-testnet.0g.ai"
                : ctx.network === "aristotle"
                  ? "https://indexer-storage.0g.network"
                  : undefined,
            hint: "Pass ZEROG_INDEXER_URL or use --network galileo|aristotle.",
          },
          {
            name: "da-encoder",
            url:
              ctx.network === "galileo"
                ? "https://da-encoder-testnet.0g.ai"
                : ctx.network === "aristotle"
                  ? "https://da-encoder.0g.network"
                  : undefined,
            hint: "DA falls back to local-digest mode; set ZEROG_DA_ENCODER_URL for live mode.",
          },
        ]) {
          if (!probe.url) {
            checks.push({
              name: probe.name,
              ok: false,
              required: false,
              detail: `no preset endpoint for ${ctx.network}`,
              hint: probe.hint,
            });
            continue;
          }
          try {
            const res = await deps.fetch(probe.url, { method: "GET" });
            checks.push({
              name: probe.name,
              ok: res.status < 500,
              required: false,
              detail: `${probe.url} → HTTP ${res.status}`,
              hint: res.status < 500 ? "ok" : probe.hint,
            });
          } catch (e) {
            checks.push({
              name: probe.name,
              ok: false,
              required: false,
              detail: `${probe.url} unreachable: ${(e as Error).message}`,
              hint: probe.hint,
            });
          }
        }

        // 5. Faucet guidance (informational — never fails the run).
        checks.push({
          name: "faucet",
          ok: Boolean(preset.faucetUrl ?? preset.faucetWebUrl),
          required: false,
          detail: preset.faucetUrl
            ? "programmatic faucet available"
            : preset.faucetWebUrl
              ? `web faucet: ${preset.faucetWebUrl}`
              : "no faucet for this network",
          hint: preset.faucetWebUrl
            ? `Use \`0g chain faucet <addr>\` or visit ${preset.faucetWebUrl}.`
            : "Use --network galileo for a testnet faucet.",
        });

        const failed = checks.filter((c) => c.required && !c.ok);
        const ok = failed.length === 0;
        const mark = (c: Check) => (c.ok ? "✓" : c.required ? "✗" : "•");
        return {
          human: [
            `0g doctor — network ${ctx.network}`,
            ...checks.map(
              (c) =>
                `  ${mark(c)} ${c.name}: ${c.detail}` +
                (c.ok || c.hint === "ok" ? "" : `\n      → ${c.hint}`)
            ),
            ok
              ? `all required checks passed`
              : `${failed.length} required check(s) failed`,
          ],
          json: { network: ctx.network, ok, checks },
        };
      });
    });
}
```

  Note: `runCommand` sets `process.exitCode = 1` only on a *thrown* `ZeroGError`. `doctor` reports failures as data, so to honor "exit 1 when a required check fails" the action sets it explicitly. Add, just before `return { human, json }`:

```ts
        if (!ok) process.exitCode = 1;
```

- [ ] **Step 4: Run, expect PASS** — `pnpm --filter @0gkit/cli test` → doctor suite (4) green; others green.

- [ ] **Step 5: Commit**

```bash
git add packages/0gkit-cli/src/commands/doctor.ts packages/0gkit-cli/src/__tests__/doctor.test.ts
git commit -m "feat(0gkit-cli): 0g doctor preflight checklist (graceful, exit-coded)"
```

---

## Task 7: `0g init [name]` — scaffold a runnable testnet project

**Files:** Replace `packages/0gkit-cli/src/commands/init.ts`; Create `packages/0gkit-cli/src/__tests__/init.test.ts`.

- [ ] **Step 1: Write the failing test** — `packages/0gkit-cli/src/__tests__/init.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { buildProgram, type ProgramDeps } from "../program.js";

function deps(over: Partial<ProgramDeps> = {}) {
  const lines: string[] = [];
  const writes: Record<string, string> = {};
  const base = {
    createClient: vi.fn(),
    getNetwork: vi.fn(),
    faucet: vi.fn(),
    balance: vi.fn(),
    waitForReceipt: vi.fn(),
    attachExplorerUrl: vi.fn((r) => r),
    explorerUrl: vi.fn(),
    makeStorage: vi.fn(),
    makeCompute: vi.fn(),
    makeDA: vi.fn(),
    attest: { parseEnvelope: vi.fn(), verifyEnvelope: vi.fn(), reportEnvelope: vi.fn() },
    loadFoundry: vi.fn(async () => null),
    fs: {
      readFile: vi.fn(),
      writeFile: vi.fn(async (p: string, d: Uint8Array | string) => {
        writes[p] = typeof d === "string" ? d : Buffer.from(d).toString();
      }),
      mkdir: vi.fn(async () => undefined),
      readdir: vi.fn(async () => []),
      exists: vi.fn(async () => false),
    },
    readStdin: vi.fn(async () => new Uint8Array()),
    cwd: () => "/work",
    env: {},
    isTTY: false,
    noColor: true,
    write: (s: string) => lines.push(s),
    ...over,
  } as unknown as ProgramDeps;
  return { d: base, lines, writes };
}

describe("0g init", () => {
  it("scaffolds a runnable galileo project (json reports files)", async () => {
    const { d, lines, writes } = deps();
    const p = buildProgram(d);
    p.exitOverride();
    await p.parseAsync(["init", "my-app", "--json"], { from: "user" });
    const out = JSON.parse(lines.at(-1)!);
    expect(out.ok).toBe(true);
    expect(out.dir).toBe("/work/my-app");
    expect(out.files.sort()).toEqual(
      [".env.example", ".gitignore", "README.md", "index.mjs", "package.json"].sort()
    );
    expect(writes["/work/my-app/.env.example"]).toContain("ZEROG_NETWORK=galileo");
    expect(writes["/work/my-app/index.mjs"]).toContain('from "@0gkit/core"');
    expect(JSON.parse(writes["/work/my-app/package.json"]).dependencies).toHaveProperty(
      "@0gkit/core"
    );
  });

  it("refuses to overwrite a non-empty directory", async () => {
    const { d, lines } = deps({
      fs: {
        readFile: vi.fn(),
        writeFile: vi.fn(),
        mkdir: vi.fn(),
        readdir: vi.fn(async () => ["existing.txt"]),
        exists: vi.fn(async () => true),
      } as any,
    });
    const p = buildProgram(d);
    p.exitOverride();
    await p.parseAsync(["init", "occupied", "--json"], { from: "user" });
    const out = JSON.parse(lines.at(-1)!);
    expect(out.ok).toBe(false);
    expect(out.error.code).toBe("CONFIG");
    expect(out.error.hint).toContain("empty");
    expect(process.exitCode).toBe(1);
    process.exitCode = 0;
  });

  it("defaults the directory name to 0g-app", async () => {
    const { d, lines } = deps();
    const p = buildProgram(d);
    p.exitOverride();
    await p.parseAsync(["init", "--json"], { from: "user" });
    expect(JSON.parse(lines.at(-1)!).dir).toBe("/work/0g-app");
    process.exitCode = 0;
  });
});
```

- [ ] **Step 2: Run, expect FAIL** — `pnpm --filter @0gkit/cli test` → "unknown command 'init'".

- [ ] **Step 3: Implement `packages/0gkit-cli/src/commands/init.ts`:**

```ts
import type { Command } from "commander";
import { ConfigError } from "@0gkit/core";
import { runCommand, type ProgramDeps } from "../program.js";

const PKG_JSON = (name: string) =>
  JSON.stringify(
    {
      name,
      private: true,
      type: "module",
      scripts: { start: "node index.mjs" },
      dependencies: {
        "@0gkit/core": "^0.1.0",
        "@0gkit/chain": "^0.1.0",
        "@0gkit/storage": "^0.1.0",
      },
    },
    null,
    2
  ) + "\n";

const ENV_EXAMPLE = [
  "# Copy to .env and fill in. Testnet-first: no real funds needed.",
  "ZEROG_NETWORK=galileo",
  "# Get a key with `cast wallet new` (foundry) or any EVM wallet:",
  "ZEROG_PRIVATE_KEY=",
  "# Optional RPC override:",
  "ZEROG_RPC_URL=",
  "",
].join("\n");

const INDEX_MJS = [
  'import { createClient, getNetwork } from "@0gkit/core";',
  'import { balance } from "@0gkit/chain";',
  "",
  'const network = process.env.ZEROG_NETWORK ?? "galileo";',
  "const preset = getNetwork(network);",
  "const client = createClient({",
  "  network,",
  "  privateKey: process.env.ZEROG_PRIVATE_KEY || undefined,",
  "});",
  "",
  "console.log(`0G ${network} — chainId ${preset.chainId}`);",
  "if (preset.explorer) console.log(`explorer ${preset.explorer}`);",
  "",
  "const addr = client.wallet?.account?.address;",
  "if (addr) {",
  "  console.log(`address ${addr}`);",
  "  console.log(`balance ${await balance(client, addr)} wei`);",
  "} else {",
  '  console.log("no ZEROG_PRIVATE_KEY set — read-only. Run `0g doctor`.");',
  "}",
  "",
].join("\n");

const README_MD = (name: string) =>
  [
    `# ${name}`,
    "",
    "Scaffolded by `0g init`. Testnet-first (Galileo) — no real funds needed.",
    "",
    "## Run",
    "",
    "```bash",
    "npm install",
    "cp .env.example .env      # then paste a key (optional for read-only)",
    "npx 0g doctor             # preflight every 0G surface",
    "npm start                 # runs index.mjs",
    "```",
    "",
    "Need testnet funds? `npx 0g chain faucet <your-address>`",
    "(Galileo points you at https://faucet.0g.ai).",
    "",
  ].join("\n");

const GITIGNORE = ["node_modules", ".env", "dist", ""].join("\n");

export function registerInit(program: Command, deps: ProgramDeps): void {
  program
    .command("init [name]")
    .description("scaffold a runnable, testnet-default 0G project")
    .action(async function (this: Command, name: string | undefined) {
      await runCommand(deps, this, async () => {
        const dirName = name ?? "0g-app";
        const dir = `${deps.cwd()}/${dirName}`;
        if (await deps.fs.exists(dir)) {
          const entries = await deps.fs.readdir(dir);
          if (entries.length > 0) {
            throw new ConfigError(
              `Target directory '${dirName}' is not empty.`,
              `Choose a new name, or run \`0g init\` in an empty directory.`
            );
          }
        }
        await deps.fs.mkdir(dir);
        const files: Record<string, string> = {
          "package.json": PKG_JSON(dirName),
          ".env.example": ENV_EXAMPLE,
          "index.mjs": INDEX_MJS,
          "README.md": README_MD(dirName),
          ".gitignore": GITIGNORE,
        };
        for (const [file, body] of Object.entries(files)) {
          await deps.fs.writeFile(`${dir}/${file}`, body);
        }
        return {
          human: [
            `created ${dir}`,
            ...Object.keys(files).map((f) => `  + ${f}`),
            ``,
            `next:`,
            `  cd ${dirName}`,
            `  npm install`,
            `  npx 0g doctor`,
            `  npm start`,
          ],
          json: { dir, files: Object.keys(files) },
        };
      });
    });
}
```

- [ ] **Step 4: Run, expect PASS** — `pnpm --filter @0gkit/cli test` → init suite (3) green; all prior green.

- [ ] **Step 5: Commit**

```bash
git add packages/0gkit-cli/src/commands/init.ts packages/0gkit-cli/src/__tests__/init.test.ts
git commit -m "feat(0gkit-cli): 0g init scaffolder (testnet-default, refuses non-empty dir)"
```

---

## Task 8: `0g storage put|get|exists`

**Files:** Replace `packages/0gkit-cli/src/commands/storage.ts`; Create `packages/0gkit-cli/src/__tests__/storage.test.ts`.

- [ ] **Step 1: Write the failing test** — `packages/0gkit-cli/src/__tests__/storage.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { buildProgram, type ProgramDeps } from "../program.js";

function deps(over: Partial<ProgramDeps> = {}) {
  const lines: string[] = [];
  const written: Record<string, Uint8Array | string> = {};
  const storage = {
    upload: vi.fn(async () => ({
      root: "0xroot",
      tx: { txHash: "0xtx", latencyMs: 5 },
      raw: {},
    })),
    download: vi.fn(async () => new Uint8Array([104, 105])), // "hi"
    exists: vi.fn(async () => true),
  };
  const base = {
    createClient: vi.fn(),
    getNetwork: vi.fn(() => ({ name: "galileo", explorer: "https://e" })),
    faucet: vi.fn(),
    balance: vi.fn(),
    waitForReceipt: vi.fn(),
    attachExplorerUrl: vi.fn((r, _n) => ({ ...r, explorerUrl: "https://e/tx/0xtx" })),
    explorerUrl: vi.fn(),
    makeStorage: vi.fn(() => storage),
    makeCompute: vi.fn(),
    makeDA: vi.fn(),
    attest: { parseEnvelope: vi.fn(), verifyEnvelope: vi.fn(), reportEnvelope: vi.fn() },
    loadFoundry: vi.fn(async () => null),
    fs: {
      readFile: vi.fn(async () => new Uint8Array([1, 2, 3])),
      writeFile: vi.fn(async (p: string, d: Uint8Array | string) => {
        written[p] = d;
      }),
      mkdir: vi.fn(),
      readdir: vi.fn(async () => []),
      exists: vi.fn(async () => false),
    },
    readStdin: vi.fn(async () => new Uint8Array()),
    cwd: () => "/w",
    env: { ZEROG_PRIVATE_KEY: "0x" + "1".repeat(64) },
    isTTY: false,
    noColor: true,
    write: (s: string) => lines.push(s),
    ...over,
  } as unknown as ProgramDeps;
  return { d: base, lines, storage, written };
}

describe("0g storage", () => {
  it("put uploads file bytes and attaches the explorer link", async () => {
    const { d, lines, storage } = deps();
    const p = buildProgram(d);
    p.exitOverride();
    await p.parseAsync(["storage", "put", "./f.bin", "--json"], { from: "user" });
    expect(storage.upload).toHaveBeenCalledWith(new Uint8Array([1, 2, 3]));
    expect(JSON.parse(lines.at(-1)!)).toMatchObject({
      ok: true,
      root: "0xroot",
      txHash: "0xtx",
      explorerUrl: "https://e/tx/0xtx",
    });
  });

  it("put errors with a hint when no signer key is set", async () => {
    const { d, lines } = deps({ env: {} });
    const p = buildProgram(d);
    p.exitOverride();
    await p.parseAsync(["storage", "put", "./f.bin", "--json"], { from: "user" });
    const out = JSON.parse(lines.at(-1)!);
    expect(out.ok).toBe(false);
    expect(out.error.code).toBe("CONFIG");
    expect(out.error.hint).toContain("ZEROG_PRIVATE_KEY");
    expect(process.exitCode).toBe(1);
    process.exitCode = 0;
  });

  it("get writes downloaded bytes to the out path", async () => {
    const { d, lines, written } = deps();
    const p = buildProgram(d);
    p.exitOverride();
    await p.parseAsync(["storage", "get", "0xroot", "./out.bin", "--json"], {
      from: "user",
    });
    expect(written["/w/out.bin"]).toEqual(new Uint8Array([104, 105]));
    expect(JSON.parse(lines.at(-1)!)).toMatchObject({ ok: true, bytes: 2 });
  });

  it("exists reports a boolean", async () => {
    const { d, lines } = deps();
    const p = buildProgram(d);
    p.exitOverride();
    await p.parseAsync(["storage", "exists", "0xroot", "--json"], { from: "user" });
    expect(JSON.parse(lines.at(-1)!)).toMatchObject({ ok: true, exists: true });
  });

  it("rejects --network local for storage with a clear hint", async () => {
    const { d, lines } = deps();
    const p = buildProgram(d);
    p.exitOverride();
    await p.parseAsync(["storage", "exists", "0xroot", "--network", "local", "--json"], {
      from: "user",
    });
    const out = JSON.parse(lines.at(-1)!);
    expect(out.ok).toBe(false);
    expect(out.error.hint).toContain("galileo");
    process.exitCode = 0;
  });
});
```

- [ ] **Step 2: Run, expect FAIL** — `pnpm --filter @0gkit/cli test` → "unknown command 'storage'".

- [ ] **Step 3: Implement `packages/0gkit-cli/src/commands/storage.ts`:**

```ts
import type { Command } from "commander";
import { ConfigError } from "@0gkit/core";
import { runCommand, type ProgramDeps } from "../program.js";

function storageNetwork(ctx: { network: string }): "aristotle" | "galileo" {
  if (ctx.network !== "aristotle" && ctx.network !== "galileo") {
    throw new ConfigError(
      `0g storage does not support --network ${ctx.network}.`,
      `Use --network galileo (testnet, default) or --network aristotle.`
    );
  }
  return ctx.network;
}

export function registerStorage(program: Command, deps: ProgramDeps): void {
  const storage = program
    .command("storage")
    .description("0G Storage: put, get, exists");

  storage
    .command("put <file>")
    .description("upload a file's bytes; prints root + tx")
    .action(async function (this: Command, file: string) {
      await runCommand(deps, this, async (ctx) => {
        const network = storageNetwork(ctx);
        if (!ctx.privateKey) {
          throw new ConfigError(
            `0g storage put requires a signer key (funds the upload tx).`,
            `Set ZEROG_PRIVATE_KEY or pass --private-key.`
          );
        }
        const data = await deps.fs.readFile(file);
        const s = deps.makeStorage({
          network,
          rpcUrl: ctx.rpcUrl,
          privateKey: ctx.privateKey,
        });
        const r = await s.upload(data);
        const tx = deps.attachExplorerUrl(r.tx, deps.getNetwork(ctx.network));
        return {
          human: [
            `uploaded ${file} (${data.length} bytes)`,
            `  root ${r.root}`,
            `  tx   ${tx.txHash}`,
            tx.explorerUrl ? `  ${tx.explorerUrl}` : ``,
          ].filter(Boolean),
          json: {
            root: r.root,
            txHash: tx.txHash ?? null,
            explorerUrl: tx.explorerUrl ?? null,
            bytes: data.length,
          },
        };
      });
    });

  storage
    .command("get <root> [out]")
    .description("download by root; writes to [out] or prints byte count")
    .action(async function (this: Command, root: string, out: string | undefined) {
      await runCommand(deps, this, async (ctx) => {
        const network = storageNetwork(ctx);
        const s = deps.makeStorage({ network, rpcUrl: ctx.rpcUrl });
        const bytes = await s.download(root);
        if (out) {
          await deps.fs.writeFile(`${deps.cwd()}/${out}`, bytes);
        }
        return {
          human: [
            `downloaded ${root} (${bytes.length} bytes)`,
            out ? `  → ${out}` : `  (no out path; pass [out] to save)`,
          ],
          json: { root, bytes: bytes.length, out: out ?? null },
        };
      });
    });

  storage
    .command("exists <root>")
    .description("true if the root is retrievable")
    .action(async function (this: Command, root: string) {
      await runCommand(deps, this, async (ctx) => {
        const network = storageNetwork(ctx);
        const s = deps.makeStorage({ network, rpcUrl: ctx.rpcUrl });
        const exists = await s.exists(root);
        return {
          human: [`${root}: ${exists ? "exists" : "not found"}`],
          json: { root, exists },
        };
      });
    });
}
```

- [ ] **Step 4: Run, expect PASS** — `pnpm --filter @0gkit/cli test` → storage suite (5) green; all prior green.

- [ ] **Step 5: Commit**

```bash
git add packages/0gkit-cli/src/commands/storage.ts packages/0gkit-cli/src/__tests__/storage.test.ts
git commit -m "feat(0gkit-cli): 0g storage put|get|exists"
```

---

## Task 9: `0g da publish|verify`

**Files:** Replace `packages/0gkit-cli/src/commands/da.ts`; Create `packages/0gkit-cli/src/__tests__/da.test.ts`.

- [ ] **Step 1: Write the failing test** — `packages/0gkit-cli/src/__tests__/da.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { buildProgram, type ProgramDeps } from "../program.js";

function deps(over: Partial<ProgramDeps> = {}) {
  const lines: string[] = [];
  const da = {
    publish: vi.fn(async () => ({
      digest: "0x" + "a".repeat(64),
      daRef: "ref-1",
      blobId: "blob-1",
      mode: "live" as const,
      latencyMs: 7,
      raw: {},
    })),
    verify: vi.fn(() => true),
    digest: vi.fn(() => "0x" + "a".repeat(64)),
  };
  const base = {
    createClient: vi.fn(),
    getNetwork: vi.fn(),
    faucet: vi.fn(),
    balance: vi.fn(),
    waitForReceipt: vi.fn(),
    attachExplorerUrl: vi.fn((r) => r),
    explorerUrl: vi.fn(),
    makeStorage: vi.fn(),
    makeCompute: vi.fn(),
    makeDA: vi.fn(() => da),
    attest: { parseEnvelope: vi.fn(), verifyEnvelope: vi.fn(), reportEnvelope: vi.fn() },
    loadFoundry: vi.fn(async () => null),
    fs: {
      readFile: vi.fn(async () => new Uint8Array([120])), // "x"
      writeFile: vi.fn(),
      mkdir: vi.fn(),
      readdir: vi.fn(async () => []),
      exists: vi.fn(async () => false),
    },
    readStdin: vi.fn(async () => new Uint8Array([121])), // "y"
    cwd: () => "/w",
    env: {},
    isTTY: false,
    noColor: true,
    write: (s: string) => lines.push(s),
    ...over,
  } as unknown as ProgramDeps;
  return { d: base, lines, da };
}

describe("0g da", () => {
  it("publish reads a file and prints digest/daRef/mode", async () => {
    const { d, lines, da } = deps();
    const p = buildProgram(d);
    p.exitOverride();
    await p.parseAsync(["da", "publish", "./blob.bin", "--json"], { from: "user" });
    expect(da.publish).toHaveBeenCalledWith(new Uint8Array([120]));
    expect(JSON.parse(lines.at(-1)!)).toMatchObject({
      ok: true,
      digest: "0x" + "a".repeat(64),
      daRef: "ref-1",
      mode: "live",
    });
  });

  it("publish reads stdin when file is '-'", async () => {
    const { d, da } = deps();
    const p = buildProgram(d);
    p.exitOverride();
    await p.parseAsync(["da", "publish", "-", "--json"], { from: "user" });
    expect(da.publish).toHaveBeenCalledWith(new Uint8Array([121]));
  });

  it("verify reports true/false against an expected digest", async () => {
    const { d, lines } = deps();
    const p = buildProgram(d);
    p.exitOverride();
    await p.parseAsync(
      ["da", "verify", "./blob.bin", "0x" + "a".repeat(64), "--json"],
      { from: "user" }
    );
    expect(JSON.parse(lines.at(-1)!)).toMatchObject({ ok: true, verified: true });
  });
});
```

- [ ] **Step 2: Run, expect FAIL** — `pnpm --filter @0gkit/cli test` → "unknown command 'da'".

- [ ] **Step 3: Implement `packages/0gkit-cli/src/commands/da.ts`:**

```ts
import type { Command } from "commander";
import { runCommand, type ProgramDeps } from "../program.js";

async function readPayload(
  deps: ProgramDeps,
  fileOrDash: string
): Promise<Uint8Array> {
  if (fileOrDash === "-") return deps.readStdin();
  return deps.fs.readFile(fileOrDash);
}

function daNetwork(network: string): "aristotle" | "galileo" | undefined {
  return network === "aristotle" || network === "galileo" ? network : undefined;
}

export function registerDa(program: Command, deps: ProgramDeps): void {
  const da = program
    .command("da")
    .description("0G Data Availability: publish, verify");

  da
    .command("publish <file>")
    .description("publish a blob ('-' = stdin); local-digest mode off-net")
    .action(async function (this: Command, file: string) {
      await runCommand(deps, this, async (ctx) => {
        const data = await readPayload(deps, file);
        const client = deps.makeDA({ network: daNetwork(ctx.network) });
        const r = await client.publish(data);
        return {
          human: [
            `published (${r.mode} mode, ${r.latencyMs} ms)`,
            `  digest ${r.digest}`,
            r.daRef ? `  daRef  ${r.daRef}` : `  daRef  (local mode — no ref)`,
          ],
          json: {
            digest: r.digest,
            daRef: r.daRef ?? null,
            blobId: r.blobId ?? null,
            mode: r.mode,
            latencyMs: r.latencyMs,
          },
        };
      });
    });

  da
    .command("verify <file> <digest>")
    .description("local integrity check: recompute digest and compare")
    .action(async function (this: Command, file: string, digest: string) {
      await runCommand(deps, this, async (ctx) => {
        const data = await readPayload(deps, file);
        const client = deps.makeDA({ network: daNetwork(ctx.network) });
        const verified = client.verify(data, digest);
        return {
          human: [`digest ${digest}`, `  ${verified ? "MATCH" : "MISMATCH"}`],
          json: { digest, verified },
        };
      });
    });
}
```

- [ ] **Step 4: Run, expect PASS** — `pnpm --filter @0gkit/cli test` → da suite (3) green; all prior green.

- [ ] **Step 5: Commit**

```bash
git add packages/0gkit-cli/src/commands/da.ts packages/0gkit-cli/src/__tests__/da.test.ts
git commit -m "feat(0gkit-cli): 0g da publish|verify (stdin + local-digest aware)"
```

---

## Task 10: `0g attest verify|report`

**Files:** Replace `packages/0gkit-cli/src/commands/attest.ts`; Create `packages/0gkit-cli/src/__tests__/attest.test.ts`.

- [ ] **Step 1: Write the failing test** — `packages/0gkit-cli/src/__tests__/attest.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { buildProgram, type ProgramDeps } from "../program.js";

const SIGNED = {
  envelope: {
    kind: "foundry/eval-result/v1",
    forge: "0xforge",
    scores: [1, 2],
    baseline: 1,
    teeAttestation: "0xtee",
    coordinator: "0xcoord",
    timestamp: 1700000000,
  },
  digest: "0x" + "d".repeat(64),
  signature: "0x" + "s".repeat(130),
};
const SIGNER = "0x2222222222222222222222222222222222222222";

function deps(over: Partial<ProgramDeps> = {}) {
  const lines: string[] = [];
  const base = {
    createClient: vi.fn(),
    getNetwork: vi.fn(),
    faucet: vi.fn(),
    balance: vi.fn(),
    waitForReceipt: vi.fn(),
    attachExplorerUrl: vi.fn((r) => r),
    explorerUrl: vi.fn(),
    makeStorage: vi.fn(),
    makeCompute: vi.fn(),
    makeDA: vi.fn(),
    attest: {
      parseEnvelope: vi.fn((e) => e.envelope ?? e),
      verifyEnvelope: vi.fn(async () => ({
        ok: true,
        checks: { digest: true, signer: true },
        signer: SIGNER,
      })),
      reportEnvelope: vi.fn(() => "attestation foundry/eval-result/v1\n  forge 0xforge"),
    },
    loadFoundry: vi.fn(async () => null),
    fs: {
      readFile: vi.fn(async () => new TextEncoder().encode(JSON.stringify(SIGNED))),
      writeFile: vi.fn(),
      mkdir: vi.fn(),
      readdir: vi.fn(async () => []),
      exists: vi.fn(async () => false),
    },
    readStdin: vi.fn(async () => new Uint8Array()),
    cwd: () => "/w",
    env: {},
    isTTY: false,
    noColor: true,
    write: (s: string) => lines.push(s),
    ...over,
  } as unknown as ProgramDeps;
  return { d: base, lines };
}

describe("0g attest", () => {
  it("verify a valid signed envelope → ok:true with checks", async () => {
    const { d, lines } = deps();
    const p = buildProgram(d);
    p.exitOverride();
    await p.parseAsync(
      ["attest", "verify", "./signed.json", "--signer", SIGNER, "--json"],
      { from: "user" }
    );
    expect(JSON.parse(lines.at(-1)!)).toMatchObject({
      ok: true,
      verified: true,
      checks: { digest: true, signer: true },
      signer: SIGNER,
    });
  });

  it("verify a tampered envelope → ok:false, exit 1", async () => {
    const { d, lines } = deps({
      attest: {
        parseEnvelope: vi.fn((e) => e.envelope ?? e),
        verifyEnvelope: vi.fn(async () => ({
          ok: false,
          checks: { digest: false, signer: false },
          signer: "0x0000000000000000000000000000000000000000",
        })),
        reportEnvelope: vi.fn(() => "report"),
      } as any,
    });
    const p = buildProgram(d);
    p.exitOverride();
    await p.parseAsync(
      ["attest", "verify", "./bad.json", "--signer", SIGNER, "--json"],
      { from: "user" }
    );
    const out = JSON.parse(lines.at(-1)!);
    expect(out.ok).toBe(true); // command itself succeeded…
    expect(out.verified).toBe(false); // …but verification failed
    expect(process.exitCode).toBe(1);
    process.exitCode = 0;
  });

  it("verify requires --signer", async () => {
    const { d, lines } = deps();
    const p = buildProgram(d);
    p.exitOverride();
    await p.parseAsync(["attest", "verify", "./signed.json", "--json"], {
      from: "user",
    });
    const out = JSON.parse(lines.at(-1)!);
    expect(out.ok).toBe(false);
    expect(out.error.hint).toContain("--signer");
    process.exitCode = 0;
  });

  it("report prints the human envelope summary", async () => {
    const { d, lines } = deps();
    const p = buildProgram(d);
    p.exitOverride();
    await p.parseAsync(["attest", "report", "./signed.json"], { from: "user" });
    expect(lines.join("\n")).toContain("attestation foundry/eval-result/v1");
  });
});
```

- [ ] **Step 2: Run, expect FAIL** — `pnpm --filter @0gkit/cli test` → "unknown command 'attest'".

- [ ] **Step 3: Implement `packages/0gkit-cli/src/commands/attest.ts`:**

```ts
import type { Command } from "commander";
import { ConfigError } from "@0gkit/core";
import { runCommand, type ProgramDeps } from "../program.js";

interface SignedLike {
  envelope: unknown;
  digest: string;
  signature: string;
}

async function loadSigned(deps: ProgramDeps, file: string): Promise<SignedLike> {
  const bytes = await deps.fs.readFile(file);
  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(bytes));
  } catch (e) {
    throw new ConfigError(
      `Could not parse '${file}' as JSON: ${(e as Error).message}`,
      `Pass a SignedEnvelope JSON file ({ envelope, digest, signature }).`
    );
  }
  const s = parsed as Partial<SignedLike>;
  if (!s || typeof s !== "object" || !s.envelope || !s.digest || !s.signature) {
    throw new ConfigError(
      `'${file}' is not a SignedEnvelope.`,
      `Expected { envelope, digest, signature } — e.g. the output of signEnvelope().`
    );
  }
  return s as SignedLike;
}

export function registerAttest(program: Command, deps: ProgramDeps): void {
  const attest = program
    .command("attest")
    .description("TEE attestation: verify, report");

  attest
    .command("verify <file>")
    .requiredOption("--signer <address>", "the address that must have signed")
    .description("verify digest integrity AND signer identity")
    .action(async function (this: Command, file: string) {
      await runCommand(deps, this, async () => {
        const opts = this.opts() as { signer?: string };
        if (!opts.signer) {
          throw new ConfigError(
            `0g attest verify requires --signer.`,
            `Pass --signer <address> (the expected attestation signer).`
          );
        }
        const signed = await loadSigned(deps, file);
        deps.attest.parseEnvelope(signed.envelope);
        const result = await deps.attest.verifyEnvelope(
          signed as never,
          opts.signer
        );
        if (!result.ok) process.exitCode = 1;
        return {
          human: [
            deps.attest.reportEnvelope(signed as never),
            ``,
            `digest check  ${result.checks.digest ? "PASS" : "FAIL"}`,
            `signer check  ${result.checks.signer ? "PASS" : "FAIL"}`,
            `recovered     ${result.signer}`,
            result.ok ? `VERIFIED` : `NOT VERIFIED`,
          ],
          json: {
            verified: result.ok,
            checks: result.checks,
            signer: result.signer,
          },
        };
      });
    });

  attest
    .command("report <file>")
    .description("human-readable summary of a signed envelope")
    .action(async function (this: Command, file: string) {
      await runCommand(deps, this, async () => {
        const signed = await loadSigned(deps, file);
        deps.attest.parseEnvelope(signed.envelope);
        const report = deps.attest.reportEnvelope(signed as never);
        return { human: [report], json: { report } };
      });
    });
}
```

  Note: `--signer` is declared `requiredOption`, so commander itself rejects a missing value before the action runs. The explicit in-action `ConfigError` is the `--json`-friendly fallback and keeps the contract self-documented; the test "verify requires --signer" passes because commander's `exitOverride()` makes the missing-required-option throw, which `parseAsync` rejects — wrap the assertion accordingly: if commander throws first, `lines` may be empty, so the test instead asserts on the thrown error. Adjust that test to:

```ts
  it("verify requires --signer", async () => {
    const { d } = deps();
    const p = buildProgram(d);
    p.exitOverride();
    p.configureOutput({ writeOut: () => {}, writeErr: () => {} });
    await expect(
      p.parseAsync(["attest", "verify", "./signed.json", "--json"], { from: "user" })
    ).rejects.toThrow(/required option/i);
    process.exitCode = 0;
  });
```

- [ ] **Step 4: Run, expect PASS** — `pnpm --filter @0gkit/cli test` → attest suite (4) green; all prior green.

- [ ] **Step 5: Commit**

```bash
git add packages/0gkit-cli/src/commands/attest.ts packages/0gkit-cli/src/__tests__/attest.test.ts
git commit -m "feat(0gkit-cli): 0g attest verify|report (valid + tampered honest)"
```

---

## Task 11: `0g infer` + re-enable the command-registration test

**Files:** Replace `packages/0gkit-cli/src/commands/infer.ts`; Create `packages/0gkit-cli/src/__tests__/infer.test.ts`; Modify `packages/0gkit-cli/src/__tests__/program.test.ts`.

- [ ] **Step 1: Write the failing test** — `packages/0gkit-cli/src/__tests__/infer.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { buildProgram, type ProgramDeps } from "../program.js";

function deps(over: Partial<ProgramDeps> = {}) {
  const lines: string[] = [];
  const compute = {
    inference: vi.fn(async () => ({
      output: "hello from 0G",
      receipt: { txHash: "0xfee", latencyMs: 42 },
      raw: {},
    })),
  };
  const base = {
    createClient: vi.fn(),
    getNetwork: vi.fn(),
    faucet: vi.fn(),
    balance: vi.fn(),
    waitForReceipt: vi.fn(),
    attachExplorerUrl: vi.fn((r) => r),
    explorerUrl: vi.fn(),
    makeStorage: vi.fn(),
    makeCompute: vi.fn(() => compute),
    makeDA: vi.fn(),
    attest: { parseEnvelope: vi.fn(), verifyEnvelope: vi.fn(), reportEnvelope: vi.fn() },
    loadFoundry: vi.fn(async () => null),
    fs: {
      readFile: vi.fn(),
      writeFile: vi.fn(),
      mkdir: vi.fn(),
      readdir: vi.fn(async () => []),
      exists: vi.fn(async () => false),
    },
    readStdin: vi.fn(async () => new TextEncoder().encode("from stdin")),
    cwd: () => "/w",
    env: { ZEROG_BROKER_KEY: "0x" + "1".repeat(64), ZEROG_PROVIDER: "0xprov" },
    isTTY: false,
    noColor: true,
    write: (s: string) => lines.push(s),
    ...over,
  } as unknown as ProgramDeps;
  return { d: base, lines, compute };
}

describe("0g infer", () => {
  it("runs inference from -m and prints output + receipt", async () => {
    const { d, lines, compute } = deps();
    const p = buildProgram(d);
    p.exitOverride();
    await p.parseAsync(
      ["infer", "-m", "hi there", "--provider", "0xprov", "--json"],
      { from: "user" }
    );
    expect(compute.inference).toHaveBeenCalledWith({
      messages: [{ role: "user", content: "hi there" }],
      model: undefined,
      temperature: undefined,
    });
    expect(JSON.parse(lines.at(-1)!)).toMatchObject({
      ok: true,
      output: "hello from 0G",
      txHash: "0xfee",
    });
  });

  it("reads the prompt from stdin when no -m", async () => {
    const { d, compute } = deps();
    const p = buildProgram(d);
    p.exitOverride();
    await p.parseAsync(["infer", "--provider", "0xprov", "--json"], {
      from: "user",
    });
    expect(compute.inference).toHaveBeenCalledWith({
      messages: [{ role: "user", content: "from stdin" }],
      model: undefined,
      temperature: undefined,
    });
  });

  it("errors with a hint when no broker key", async () => {
    const { d, lines } = deps({ env: { ZEROG_PROVIDER: "0xprov" } });
    const p = buildProgram(d);
    p.exitOverride();
    await p.parseAsync(["infer", "-m", "x", "--json"], { from: "user" });
    const out = JSON.parse(lines.at(-1)!);
    expect(out.ok).toBe(false);
    expect(out.error.hint).toContain("ZEROG_BROKER_KEY");
    process.exitCode = 0;
  });
});
```

- [ ] **Step 2: Run, expect FAIL** — `pnpm --filter @0gkit/cli test` → "unknown command 'infer'".

- [ ] **Step 3: Implement `packages/0gkit-cli/src/commands/infer.ts`:**

```ts
import type { Command } from "commander";
import { ConfigError } from "@0gkit/core";
import { runCommand, type ProgramDeps } from "../program.js";

function inferNetwork(network: string): "aristotle" | "galileo" | undefined {
  return network === "aristotle" || network === "galileo" ? network : undefined;
}

export function registerInfer(program: Command, deps: ProgramDeps): void {
  program
    .command("infer")
    .description("run a chat completion against a 0G compute provider")
    .option("-m, --message <text>", "prompt text (default: read stdin)")
    .option("--provider <address>", "0G inference provider (or env ZEROG_PROVIDER)")
    .option("--model <name>", "model id (provider default if omitted)")
    .option("--temperature <n>", "sampling temperature", parseFloat)
    .action(async function (this: Command) {
      await runCommand(deps, this, async (ctx) => {
        const opts = this.opts() as {
          message?: string;
          provider?: string;
          model?: string;
          temperature?: number;
        };
        const brokerKey = deps.env.ZEROG_BROKER_KEY ?? ctx.privateKey;
        if (!brokerKey) {
          throw new ConfigError(
            `0g infer requires a funded broker key.`,
            `Set ZEROG_BROKER_KEY (or ZEROG_PRIVATE_KEY / --private-key).`
          );
        }
        const provider = opts.provider ?? deps.env.ZEROG_PROVIDER;
        if (!provider) {
          throw new ConfigError(
            `0g infer requires a provider address.`,
            `Pass --provider <address> or set ZEROG_PROVIDER.`
          );
        }
        const content =
          opts.message ??
          new TextDecoder().decode(await deps.readStdin()).trim();
        if (!content) {
          throw new ConfigError(
            `No prompt provided.`,
            `Pass -m "your prompt" or pipe text on stdin.`
          );
        }
        const compute = deps.makeCompute({
          network: inferNetwork(ctx.network),
          brokerKey,
          brokerRpc: ctx.rpcUrl,
          provider,
          model: opts.model,
        });
        const r = await compute.inference({
          messages: [{ role: "user", content }],
          model: opts.model,
          temperature: opts.temperature,
        });
        return {
          human: [
            r.output,
            ``,
            `  provider ${provider}  (${r.receipt.latencyMs} ms)`,
            r.receipt.txHash ? `  fee tx ${r.receipt.txHash}` : `  (no fee tx)`,
          ],
          json: {
            output: r.output,
            provider,
            txHash: r.receipt.txHash ?? null,
            latencyMs: r.receipt.latencyMs,
          },
        };
      });
    });
}
```

- [ ] **Step 4: Re-enable the command-registration test.** In `packages/0gkit-cli/src/__tests__/program.test.ts` change `it.skip("registers the neutral command groups", …)` back to `it("registers the neutral command groups", …)` (all 7 neutral groups now register).

- [ ] **Step 5: Run, expect PASS** — `pnpm --filter @0gkit/cli test` → infer suite (3) green; `program` "registers the neutral command groups" now green; all prior green.

- [ ] **Step 6: Commit**

```bash
git add packages/0gkit-cli/src/commands/infer.ts packages/0gkit-cli/src/__tests__/infer.test.ts packages/0gkit-cli/src/__tests__/program.test.ts
git commit -m "feat(0gkit-cli): 0g infer (stdin/-m, env-driven broker) + re-enable group test"
```

---

## Task 12: `0g foundry` opt-in plugin + neutrality boundary proof

**Files:** Replace `packages/0gkit-cli/src/foundry-loader.ts`, `packages/0gkit-cli/src/commands/foundry.ts`; Create `packages/0gkit-cli/src/__tests__/boundary.test.ts`.

- [ ] **Step 1: Write the failing test** — `packages/0gkit-cli/src/__tests__/boundary.test.ts` (mirrors the proven `@0gkit/chain` boundary test: `pnpm boundary:check` must stay green even with the foundry loader present):

```ts
import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../../..");

describe("0gkit neutrality boundary (CLI)", () => {
  it("pnpm boundary:check passes with the foundry loader present", () => {
    let ok = true;
    let out = "";
    try {
      out = execSync("pnpm boundary:check", {
        cwd: repoRoot,
        stdio: "pipe",
      }).toString();
    } catch (e: any) {
      ok = false;
      out = (e.stdout?.toString() ?? "") + (e.stderr?.toString() ?? "");
    }
    expect(ok, `boundary:check failed:\n${out}`).toBe(true);
  });

  it("foundry-loader.ts contains NO static @foundryprotocol import", () => {
    const src = execSync("cat src/foundry-loader.ts", {
      cwd: resolve(repoRoot, "packages/0gkit-cli"),
    }).toString();
    expect(src).not.toMatch(/from\s+["']@foundryprotocol/);
    expect(src).not.toMatch(/import\(\s*["']@foundryprotocol/);
  });
});
```

- [ ] **Step 2: Run, expect FAIL** — `pnpm --filter @0gkit/cli test` → boundary suite fails (the second assertion: stub loader is fine, but we have not yet proven the computed-specifier pattern; and `foundry.ts` still registers nothing while `program.test.ts` expects it hidden — that part already passes. The failing one is the new file not existing if not created). Confirm the suite is red.

- [ ] **Step 3: Implement `packages/0gkit-cli/src/foundry-loader.ts`:**

```ts
/**
 * Optional Foundry plugin loader. Foundry is NEVER a static dependency of the
 * neutral CLI (spec §2). We resolve @foundryprotocol/sdk via a COMPUTED
 * specifier so dependency-cruiser builds no graph edge and `pnpm
 * boundary:check` stays green by construction (see DECISIONS.md D4).
 */
export interface FoundryPlugin {
  name: string;
  version: string;
}

export async function loadFoundry(): Promise<FoundryPlugin | null> {
  // Non-literal specifier — static analyzers cannot resolve this, so no edge.
  const spec = ["@foundryprotocol", "sdk"].join("/");
  try {
    const mod = (await import(/* @vite-ignore */ spec)) as Record<string, unknown>;
    const version =
      typeof mod.VERSION === "string"
        ? mod.VERSION
        : typeof (mod.default as { version?: string })?.version === "string"
          ? (mod.default as { version: string }).version
          : "unknown";
    return { name: "@foundryprotocol/sdk", version };
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Implement `packages/0gkit-cli/src/commands/foundry.ts`:**

```ts
import type { Command } from "commander";
import { runCommand, type ProgramDeps } from "../program.js";

/**
 * Foundry is an OPT-IN plugin. The `foundry` command is added only when the
 * plugin resolves at runtime OR the user passes --foundry. It never appears in
 * default help and the neutral CLI has zero static Foundry dependency.
 */
export function registerFoundry(program: Command, deps: ProgramDeps): void {
  const wantsFoundry =
    process.argv.includes("--foundry") ||
    process.argv.includes("foundry") ||
    deps.env.OG_FORCE_FOUNDRY === "1";
  if (!wantsFoundry) return;

  const foundry = program
    .command("foundry")
    .description("[optional plugin] Foundry ownership/revenue layer");

  foundry
    .command("info")
    .description("show the resolved @foundryprotocol/sdk (proves opt-in load)")
    .action(async function (this: Command) {
      await runCommand(deps, this, async () => {
        const plugin = await deps.loadFoundry();
        if (!plugin) {
          return {
            human: [
              `Foundry plugin not installed.`,
              `  install @foundryprotocol/sdk to enable the ownership/revenue layer.`,
            ],
            json: { installed: false },
          };
        }
        return {
          human: [
            `Foundry plugin: ${plugin.name} v${plugin.version}`,
            `  (loaded as an opt-in plugin — neutral core is unchanged)`,
          ],
          json: { installed: true, name: plugin.name, version: plugin.version },
        };
      });
    });
}
```

  Update `packages/0gkit-cli/src/__tests__/program.test.ts` test "hides `foundry` from help when the plugin is absent": it already asserts `foundry` is undefined when neither `--foundry` nor `foundry` is in argv (true in the vitest process). Keep as-is. Add one test to `program.test.ts`:

```ts
  it("shows `foundry` only when --foundry is present in argv", () => {
    const orig = process.argv;
    process.argv = [...orig, "--foundry"];
    try {
      const program = buildProgram(fakeDeps());
      expect(program.commands.find((c) => c.name() === "foundry")).toBeDefined();
    } finally {
      process.argv = orig;
    }
  });
```

- [ ] **Step 5: Run, expect PASS** — `pnpm --filter @0gkit/cli build` then `pnpm --filter @0gkit/cli test`. Expected: boundary suite (2) green (computed specifier ⇒ `boundary:check` green; loader has no static foundry import); program suite green incl. the new `--foundry` test. Also run `pnpm boundary:check` directly at repo root → exit 0.

- [ ] **Step 6: Commit**

```bash
git add packages/0gkit-cli/src/foundry-loader.ts packages/0gkit-cli/src/commands/foundry.ts packages/0gkit-cli/src/__tests__/boundary.test.ts packages/0gkit-cli/src/__tests__/program.test.ts
git commit -m "feat(0gkit-cli): opt-in 0g foundry plugin + CI-neutrality boundary proof"
```

---

## Task 13: README, multi-language docs, full verify, ≥80% coverage

**Files:** Create `packages/0gkit-cli/README.md`; final repo-wide verification.

- [ ] **Step 1: Create `packages/0gkit-cli/README.md`** (mirrors `@0gkit/chain` README shape; satisfies spec §6 — CLI + curl + TS for every primitive, and §9 escape-hatch doc):

````markdown
# @0gkit/cli

The neutral `0g` command line — `init`, `doctor`, `chain`, `storage`, `infer`,
`da`, `attest`. Language-agnostic: any stack shells out; `--json` for scripting.
Foundry is a **separate, opt-in plugin**, never required.

## Install

```bash
npm install -g @0gkit/cli   # or: npx 0g <command>
```

## 60-second start (no funds, testnet)

```bash
npx 0g init my-app && cd my-app
npm install
npx 0g doctor                 # preflight every 0G surface
npx 0g chain faucet 0xYourAddress   # Galileo → points you at https://faucet.0g.ai
```

## Commands

| Command | What |
|---|---|
| `0g init [name]` | scaffold a runnable, testnet-default project |
| `0g doctor` | RPC / signer / storage / DA / faucet checklist |
| `0g chain faucet\|balance\|tx` | faucet guidance, native balance, await a receipt |
| `0g storage put\|get\|exists` | upload/download/probe 0G Storage |
| `0g infer` | chat completion against a 0G compute provider |
| `0g da publish\|verify` | publish a blob / local integrity check |
| `0g attest verify\|report` | verify or summarize a signed attestation |
| `0g foundry …` | optional plugin — hidden unless installed or `--foundry` |

Global flags: `--network aristotle|galileo|local` (default `galileo`),
`--rpc <url>`, `--private-key <hex>`, `--json`.

## Multi-language (the CLI is the universal surface)

TypeScript:

```ts
import { Storage } from "@0gkit/storage";
const s = new Storage({ network: "galileo", privateKey: process.env.ZEROG_PRIVATE_KEY });
const { root } = await s.upload(new TextEncoder().encode("hi"));
```

Shell / any language (parse `--json`):

```bash
ROOT=$(0g storage put ./model.bin --network galileo --json | jq -r .root)
0g storage exists "$ROOT" --json
```

curl (compute is OpenAI-compatible — see `@0gkit/compute`):

```bash
0g infer -m "hello" --provider 0xPROVIDER --json | jq -r .output
```

## Environment variables

`ZEROG_NETWORK`, `ZEROG_RPC_URL`, `ZEROG_PRIVATE_KEY`, `ZEROG_BROKER_KEY`,
`ZEROG_PROVIDER`. Flags always override env; env overrides the preset default.

## Escape hatch

The CLI is a thin, faithful wrapper. Every primitive package exposes `.raw`
(or the underlying client) — drop down to `@0gkit/storage`, `@0gkit/compute`,
`@0gkit/da`, `@0gkit/attestation`, `@0gkit/chain`, `@0gkit/core` directly
whenever you outgrow a command. The toolkit is a help, never a cage.

## License

MIT.
````

- [ ] **Step 2: Full local CI parity — run from repo root, in order:**

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm boundary:check
pnpm --filter @0gkit/cli build
pnpm --filter @0gkit/cli test
pnpm --filter @0gkit/cli run coverage
pnpm typecheck
pnpm build
```

  Expected: every command exits 0. `coverage` shows `@0gkit/cli` ≥ 80% lines/functions/statements, ≥ 70% branches (thresholds enforced by `vitest.config.ts`). If `format:check` fails, run `pnpm format` and re-commit. If coverage is short, add focused tests to the lowest-covered command's `__tests__` file (not production-code changes) until thresholds pass.

- [ ] **Step 3: Smoke the real binary (no network needed):**

```bash
node packages/0gkit-cli/dist/cli.js --help
node packages/0gkit-cli/dist/cli.js init __smoke_app --json
ls __smoke_app && cat __smoke_app/.env.example
rm -rf __smoke_app
```

  Expected: `--help` lists the 7 neutral groups and NOT `foundry`; `init` prints an `{ "ok": true, ... }` JSON line; `__smoke_app/.env.example` contains `ZEROG_NETWORK=galileo`.

- [ ] **Step 4: Self-review against the spec.** Confirm each spec §4 CLI bullet maps to a task: `init`✓(7) `doctor`✓(6) `storage put|get|exists`✓(8) `infer`✓(11) `da publish|verify`✓(9) `chain faucet|balance|tx`✓(5) `attest verify`✓(10) `foundry` opt-in✓(12) global `--network/--json/--rpc`✓(3,4); §6 multi-language (CLI + `--json` + curl in README)✓(13); §7 every error a `ZeroGError` with hint✓(all); §8 testing (unit, snapshot-style on `--json`, attestation valid+tampered, boundary)✓; §11.3 acceptance (init+doctor+faucet path, honest faucet)✓; §12 doctor degrades gracefully✓(6). Note any gap and add a task before finishing.

- [ ] **Step 5: Final commit**

```bash
git add packages/0gkit-cli/README.md
git commit -m "docs(0gkit-cli): README — commands, multi-language, escape hatch; subproject 3 complete"
```

---

## Post-plan: Finishing the branch

After Task 13, the implementation is complete and green. Hand off to
`superpowers:finishing-a-development-branch`: push the branch, open a PR titled
`feat: 0gkit CLI — @0gkit/cli (init, doctor, chain, storage, infer, da, attest)`,
let CI go green (web job now builds/tests `@0gkit/cli` + coverage; `boundary:check`
proven), then **squash-merge to `main`** per the project's PR workflow (the
maintainer merges their own PRs once CI passes — do not leave open for review).
Sub-projects 4–8 (MCP, Foundry refactor, scaffolder, playground+React,
community+publish) remain sequenced behind this per spec §11.
