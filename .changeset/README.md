# Changesets

This folder is managed by [changesets](https://github.com/changesets/changesets).
It is how coordinated, semver-correct versioning + the public changelog work
for the neutral `@0gkit/*` packages (and `create-foundry-app`).

## Adding a changeset

Any PR that changes a published package **must** include a changeset:

```bash
pnpm changeset
```

Pick the packages you touched, choose `patch` / `minor` / `major`, and write a
human-readable line — that line is what lands in the public `CHANGELOG.md`, so
write it for a consumer, not for yourself.

The `@0gkit/*` packages are **linked**: a bump to any one moves them all to the
same version, so a builder never has to reason about a cross-package version
matrix. Private apps (`@0gkit/playground`, the web app) are not published and
do not need changesets.

On merge to `main`, the release workflow opens (or updates) a **Version
Packages** PR. Merging that PR publishes to npm and writes each package's
`CHANGELOG.md`.
