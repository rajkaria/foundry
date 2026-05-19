# Contributing

Thanks for helping make **0gkit** the defacto toolkit for building on 0G.
This repo is a pnpm + turbo monorepo: the neutral, publishable `@foundryprotocol/0gkit-*`
packages live in `packages/`, and an optional Foundry layer sits on top of
them. Almost all contributions belong in the neutral layer.

## TL;DR

```bash
pnpm install
pnpm build            # turbo, dependency-ordered
pnpm test             # all package tests
pnpm lint             # depcruise / eslint per package
pnpm typecheck
pnpm boundary:check   # the neutrality invariant (see below)
pnpm format:check
pnpm changeset        # describe user-facing changes (required for published pkgs)
```

A green local run of the above is the same gate CI enforces.

## The neutrality invariant (read this first)

`@foundryprotocol/0gkit-*` is **neutral**: nothing under `packages/0gkit-*/src` may import
`@foundryprotocol/*` or any non-`@foundryprotocol/0gkit-*` workspace package. Foundry depends
on 0gkit, never the reverse. This is not a style preference — it is enforced
mechanically:

```bash
pnpm boundary:check   # dependency-cruiser; a forbidden import fails the build
```

If you need Foundry-specific behaviour, it goes in the Foundry layer
(`@foundryprotocol/*`) or behind an opt-in plugin — never inside a neutral
package. When in doubt, ask in a Discussion before writing code.

## Project workflow

Work lands in **dependency-ordered sub-projects**, one per branch/PR:

1. Branch off the latest `origin/main`.
2. Implement with tests. Neutral packages target **≥80% line coverage**;
   trust-critical code (`@foundryprotocol/0gkit-attestation`) is held to a higher bar with
   valid **and** tampered fixtures.
3. Get the full local gate green (the TL;DR block).
4. Add a changeset (`pnpm changeset`) for any change to a published package.
5. Open a PR. Keep it scoped to one sub-project; squash-merge when CI is green.

### Testing expectations

- Each neutral package: unit tests with the underlying 0G SDK **mocked** plus
  contract tests on the wrapper surface.
- Live integration tests are **opt-in**, gated by env, and run against the
  Galileo testnet — they must never break CI for contributors without keys.
- CLI: snapshot tests on human output; JSON-schema tests on `--json`.
- Playground: the Playwright golden-path smoke must stay green.

## Versioning & releases (changesets)

Every PR that changes a published package **must include a changeset**:

```bash
pnpm changeset   # pick packages, pick semver bump, write the changelog line
```

The `@foundryprotocol/0gkit-*` packages are version-**linked** (they move together). On merge
to `main`, the Release workflow opens a **Version Packages** PR; merging that
PR publishes to npm and writes each package's `CHANGELOG.md`. The curated
human-readable history lives in the root [`CHANGELOG.md`](./CHANGELOG.md).

Commit messages follow conventional style (`feat:`, `fix:`, `docs:`,
`refactor:`, `chore:`) — the changeset, not the commit, drives the version.

## Contributing a recipe

Runnable recipes live in `examples/` (degit-able) and are surfaced in the
playground and docs. Propose new recipes in **GitHub Discussions →
[Recipes](https://github.com/rajkaria/foundry/discussions/categories/recipes)**
first so we can shape the scope, then open a PR. `pnpm examples:check`
validates structure (required files, valid `package.json`, name == dir).

## Good first issues

New here? See [`docs/GOOD-FIRST-ISSUES.md`](./docs/GOOD-FIRST-ISSUES.md) for a
curated, scoped backlog with pointers into the codebase.

## Code of conduct

Participation is governed by our
[Code of Conduct](./CODE_OF_CONDUCT.md). Report security issues per
[`SECURITY.md`](./SECURITY.md) — **not** in public issues.

## License

By contributing you agree your contributions are licensed under the
repository's [MIT License](./LICENSE).
