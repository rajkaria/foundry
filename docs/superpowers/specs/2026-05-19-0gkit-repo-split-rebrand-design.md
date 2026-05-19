# 0gkit — Repo Split + Rebrand + Standalone Docs (Design Spec)

**Date:** 2026-05-19
**Status:** Approved — executing
**Supersedes deployment/distribution sections of** `2026-05-18-0gkit-0g-builder-toolkit-design.md` (§3 npm, §4 repo location, §9–10 community/publish).

## 1. One-line

Extract the neutral 0G toolkit out of the Foundry monorepo into its own
standalone, publicly-published, fully-documented repository.

## 2. Decisions (locked with the user)

- **Own GitHub repo:** `https://github.com/rajkaria/0G-ai-kit` (already created,
  empty, public). It becomes the single source of truth for the toolkit.
- **npm scope:** `@foundryprotocol/0gkit-*` under the npm org `foundryprotocol`
  (owned by npm user `rajkaria12`). Chosen because that org already exists and
  can publish immediately; `@0gkit/*` would require creating a new npm org.
  The code stays neutral (no `@foundryprotocol/*` runtime imports); only the
  publish name carries the org.
- **CLI binary** stays `0g` (scope-independent).
- **Docs:** a full standalone documentation site (Nextra / Next.js + MDX,
  Vercel-deployable) inside the new repo — every package documented in detail
  with API, "what / when / where to use", runnable examples, plus
  getting-started, CLI reference, MCP setup, React guide, error taxonomy,
  troubleshooting.
- **Templates:** `templates/` directory of ready-to-clone starter projects.
- **License:** MIT.

## 3. Package rename map

| Old (`workspace:*` in Foundry) | New (npm, standalone repo)                      |
| ------------------------------ | ----------------------------------------------- |
| `@0gkit/core`                  | `@foundryprotocol/0gkit-core`                   |
| `@0gkit/chain`                 | `@foundryprotocol/0gkit-chain`                  |
| `@0gkit/storage`               | `@foundryprotocol/0gkit-storage`                |
| `@0gkit/compute`               | `@foundryprotocol/0gkit-compute`                |
| `@0gkit/da`                    | `@foundryprotocol/0gkit-da`                     |
| `@0gkit/attestation`           | `@foundryprotocol/0gkit-attestation`            |
| `@0gkit/cli`                   | `@foundryprotocol/0gkit-cli` (bin `0g`)         |
| `@0gkit/mcp`                   | `@foundryprotocol/0gkit-mcp`                    |
| `@0gkit/react`                 | `@foundryprotocol/0gkit-react`                  |
| `@0gkit/playground` (private)  | stays private, lives in new repo, not published |

## 4. Target structure — `rajkaria/0G-ai-kit`

```
0G-ai-kit/
  packages/0gkit-{core,chain,storage,compute,da,attestation,cli,mcp,react}/
  apps/playground/                # the zero-setup web console (private)
  apps/docs/                      # Nextra docs site (private, Vercel-deployable)
  templates/{storage-app,inference-app,attestation-verify,mcp-agent,react-app}/
  scripts/                        # boundary check etc.
  .changeset/                     # linked @foundryprotocol/0gkit-* versioning
  .github/workflows/{ci.yml,release.yml}
  pnpm-workspace.yaml turbo.json tsconfig.base.json package.json
  README.md LICENSE CONTRIBUTING.md CODE_OF_CONDUCT.md SECURITY.md CHANGELOG.md
```

Package directory names keep the `0gkit-` prefix (cosmetic; minimizes config
churn). Internal cross-package deps use `workspace:*` again inside this repo.

## 5. Foundry monorepo changes (this repo)

- Replace `workspace:*` → npm semver `^0.1.0` for every `@foundryprotocol/0gkit-*`
  consumed by `packages/sdk` (`core`, `da`) and `apps/playground` (moved out, so
  the playground is deleted here entirely).
- Delete `packages/0gkit-*` and `apps/playground` from this repo.
- Update `pnpm-workspace.yaml`, `turbo.json`, `.changeset/config.json`
  (drop the `@0gkit/*` linked glob + playground ignore), `scripts/boundary`
  (the workspace packages are gone; sdk now depends on external npm pkgs), and
  the CI build-order note in `CLAUDE.md`.
- `@foundryprotocol/sdk` and `packages/create-foundry-app` stay here, switched
  to npm deps where they referenced the toolkit.

## 6. Execution sequence (irreversibility-safe)

1. **Spec** (this file) committed.
2. **Scaffold + rename + tooling + docs + templates** in a local clone of the
   new repo. Fully reversible.
3. **Verify all-green** in the new tree: clean `pnpm install`, `build`, `test`,
   `lint`, boundary check, docs build, each template builds.
4. **Push** to `rajkaria/0G-ai-kit`; set `NPM_TOKEN` as an encrypted GitHub
   **repo secret** (never committed to the tree).
5. **Publish** `@foundryprotocol/0gkit-*@0.1.0` to npm with `--access public`
   (the single irreversible step; only after step 3 is fully green).
6. **Decouple Foundry**: swap deps to npm, delete vendored packages, fix
   workspace/turbo/changeset/boundary/CI, verify Foundry CI green, open PR,
   squash-merge to `main`.

## 7. Risks & mitigations

- **npm publish is permanent.** Gated behind a fully-green verification (step 3)
  and the user's explicit approval. Versions start at `0.1.0`.
- **Token exposure.** The npm token was pasted in chat → used only as an
  ephemeral env var locally + an encrypted GitHub secret; never written to any
  committed file. User to rotate it post-cutover.
- **Cross-repo dependency window.** Foundry only switches to npm deps _after_
  publish succeeds, so there is no broken intermediate state on `main`.
- **Build order in new repo.** `core` is the root dep; turbo `^build` ordering
  - CI ensure `core` builds before dependents and `dts` has declarations.
- **Neutrality.** Structurally guaranteed in the standalone repo (no
  `@foundryprotocol/*` source to import); boundary check retained for the
  `0gkit-*/src` import-direction invariant.

## 8. Success criteria

- `npm i @foundryprotocol/0gkit-storage` (and every sibling) works from a clean
  project; `npx @foundryprotocol/0gkit-cli` runs; `@foundryprotocol/0gkit-mcp`
  loads as an MCP server.
- Docs site builds and explains every package with examples + usage guidance.
- Every template installs and builds standalone.
- Foundry `main` CI green with the toolkit consumed from npm and the vendored
  copies removed.
