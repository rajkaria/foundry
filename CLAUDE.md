# Foundry Protocol — Project Instructions

## Session Context (Last updated: 2026-05-19 17:50)

### Current State

- **The 0gkit toolkit has been split into its own repository** —
  `https://github.com/rajkaria/0G-ai-kit` — and published to npm under the
  `@foundryprotocol/0gkit-*` scope (org `foundryprotocol`, owned by npm user
  `rajkaria12`). The CLI binary is `0g`. All 9 packages are at `0.1.0`:
  core, chain, storage, compute, da, attestation, cli, mcp, react.
- The standalone repo also carries the zero-setup `playground`, a full
  Next.js+MDX **docs site** (`apps/docs`, Vercel-deployable), and 5 degit-able
  starter templates. It has its own CI, changesets, and `release.yml`
  (publishes via the `NPM_TOKEN` repo secret).
- **This (Foundry) repo no longer vendors the toolkit.** `packages/0gkit-*`
  and `apps/playground` were deleted. `@foundryprotocol/sdk` consumes
  `@foundryprotocol/0gkit-core` and `@foundryprotocol/0gkit-da` as normal
  npm dependencies (`^0.1.0`).
- The 0gkit roadmap (spec `docs/superpowers/specs/2026-05-18-0gkit-0g-builder-toolkit-design.md`)
  is complete; the split + rebrand is specced in
  `docs/superpowers/specs/2026-05-19-0gkit-repo-split-rebrand-design.md`.

### Recent Changes (this session — repo split + rebrand)

- Extracted `packages/0gkit-*` + `apps/playground` into `rajkaria/0G-ai-kit`;
  renamed scope `@0gkit/*` → `@foundryprotocol/0gkit-*`; neutralized package
  metadata to the new repo; added its own workspace/turbo/CI/release/changesets,
  a Next.js+MDX docs site, and `templates/`. Published `@foundryprotocol/0gkit-*@0.1.0`.
- In Foundry: swapped `@foundryprotocol/sdk` deps from `workspace:*` to `^0.1.0`;
  deleted the vendored packages + playground; removed `boundary:check`,
  `dependency-cruiser`, `.dependency-cruiser.cjs`, and the stale 0gkit
  changeset; simplified `.changeset/config.json`; rewrote `ci.yml`
  (`web` job no longer pre-builds `@0gkit/*`; no playground/boundary steps)
  and `release.yml` (now only `create-foundry-app`).

### Next Steps

- Foundry: nothing outstanding from the split. `create-foundry-app` still
  publishes from here via changesets.
- 0gkit repo: optionally deploy `apps/docs` to Vercel; enable Discussions;
  the `NPM_TOKEN` secret is already set so the changesets release flow is live.
- **Rotate the npm token** that was used for the initial publish (it was
  pasted into a chat session).

### Key Decisions

- **0gkit is now a separate product/repo.** Source of truth for the toolkit is
  `rajkaria/0G-ai-kit`; Foundry is a downstream npm consumer. Do not re-add
  `packages/0gkit-*` here. Toolkit changes go to the other repo + a version bump.
- **npm scope is `@foundryprotocol/0gkit-*`** (not `@0gkit/*`): the
  `foundryprotocol` org already existed and could publish immediately;
  `@0gkit` would have needed a new npm org. Code stays protocol-neutral; only
  the publish name carries the org. CLI bin remains `0g`.
- **Neutrality is now structural** in the standalone repo (no Foundry source
  to import). A `no-foundry-in-0gkit` dependency-cruiser rule still forbids a
  `packages/0gkit-*/src` file from importing `@foundryprotocol/*` that is not
  `@foundryprotocol/0gkit-*` (e.g. `@foundryprotocol/sdk`).
- **The CI build-order gotcha is gone** for Foundry: `@foundryprotocol/sdk`
  no longer has a workspace dep on the toolkit, so no pre-build ordering is
  needed in the `web`/`mainnet-smoke` jobs.
