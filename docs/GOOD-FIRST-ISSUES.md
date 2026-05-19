# Good first issues

A curated, scoped backlog for new contributors. Each item is small, has a
clear "done", and points at where to start. Comment on the matching GitHub
issue (label `good-first-issue`) before you start so we don't double up.

> Read [`CONTRIBUTING.md`](../CONTRIBUTING.md) first — especially the
> **neutrality invariant** (`pnpm boundary:check`).

## Docs & DX

1. **Add a curl + CLI block to every neutral package README.**
   Spec §9 wants each `@foundryprotocol/0gkit-*` README to show the TS **and** the
   curl/CLI path plus the documented escape hatch. Several are TS-only.
   Start: `packages/0gkit-*/README.md`. Done: each README has all three.

2. **`0g doctor` machine output.**
   Add a `--json` schema-stable variant to the doctor command and a
   JSON-schema test. Start: `packages/0gkit-cli/src/commands/doctor.ts`,
   mirror the `--json` pattern already used by other commands.

3. **Playground: deep-link the active code form.**
   Reflect the selected action/form in the URL hash so a shared link opens
   on the same snippet. Start: `apps/playground/components/CodeTabs.tsx`.

## Primitives

4. **`@foundryprotocol/0gkit-storage` exists-with-retry helper.**
   `exists()` treats transport errors as not-found by design; add an
   opt-in `waitForRoot(root, { timeoutMs })` that polls. Start:
   `packages/0gkit-storage/src/storage.ts`. Done: unit-tested, ≥80% cov.

5. **`@foundryprotocol/0gkit-da` payload size guard.**
   Surface a clear `ZeroGError` with a remedy when a payload exceeds the
   encoder limit, instead of a generic network failure. Start:
   `packages/0gkit-da/src/da.ts`.

6. **`@foundryprotocol/0gkit-attestation` fixture corpus.**
   Add more tampered-envelope fixtures (mutated `scores`, swapped
   `coordinator`, truncated signature) — each must be rejected with the
   correct failing check. Start:
   `packages/0gkit-attestation/src/__tests__/`.

## Recipes

7. **New `examples/` recipe.**
   Propose it in **Discussions → Recipes** first (template provided), then
   implement. Keep it degit-able and runnable; `pnpm examples:check` must
   pass. Start: copy the shape of `examples/storage-roundtrip`.

## Tooling

8. **Coverage badge.**
   Emit a single aggregate coverage summary in CI and surface it in the
   root README. Start: the coverage aggregation step in
   `.github/workflows/ci.yml`.

Picking one up? Say so on the issue and open a focused PR with a changeset.
