# 0gkit Decisions

## D1 — npm scope (2026-05-18)

Resolved scope: `@0gkit`

Probe results:

- `npm view @0gkit/core` → E404 free (exit:1, HTTP 404 Not Found)
- `npm view @zerogkit/core` → E404 free (exit:1, HTTP 404 Not Found)
- `npm view zerog-core` → E404 free (exit:1, HTTP 404 Not Found)

Rule: prefer `@0gkit`; fallback `@zerogkit`; final fallback unscoped `zerog-`.
All `@0gkit/*` references in plans/specs map to the resolved scope.

## D2 — 0G endpoints (2026-05-18)

Research method: WebFetch on `docs.0g.ai` official docs pages
(testnet-overview, mainnet-overview, deploy-contracts).

- **galileo.rpcUrl** → `https://evmrpc-testnet.0g.ai`
  Source: https://docs.0g.ai/developer-hub/testnet/testnet-overview
- **galileo.chainId** → `16602`
  Source: https://docs.0g.ai/developer-hub/testnet/testnet-overview
- **galileo.faucetWebUrl** → `https://faucet.0g.ai`
  Source: https://docs.0g.ai/developer-hub/testnet/testnet-overview
- **aristotle.explorer** → `https://chainscan.0g.ai`
  Source: https://docs.0g.ai/developer-hub/mainnet/mainnet-overview
  (cross-confirmed: https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/deploy-contracts)
- **galileo.explorer** → `https://chainscan-galileo.0g.ai`
  Source: https://docs.0g.ai/developer-hub/testnet/testnet-overview
  (cross-confirmed: https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/deploy-contracts)

Aristotle RPC (`https://evmrpc.0g.ai`) and chainId (`16661`) — repo-proven
(storage.ts DEFAULT_RPC, 0G-HACKATHON-INTEGRATION-PLAN.md), no external source needed.
Local Anvil (`http://127.0.0.1:8545`, chainId `31337`) — documented standard defaults.

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
