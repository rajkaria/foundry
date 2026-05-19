<!-- Keep PRs scoped to one sub-project. Squash-merge when CI is green. -->

## What & why

<!-- One or two sentences. The "why" matters more than the "what". -->

## Sub-project / area

<!-- e.g. "@0gkit/storage", "playground", "docs", or the roadmap sub-project. -->

## Checklist

- [ ] `pnpm build && pnpm test && pnpm lint && pnpm typecheck` green locally
- [ ] `pnpm boundary:check` green (no Foundry import in a neutral package)
- [ ] `pnpm format:check` clean
- [ ] Tests added/updated (neutral packages ≥80% line coverage)
- [ ] `pnpm changeset` added for any change to a published package
- [ ] Docs/README updated if behaviour or the public API changed

## Notes for reviewers

<!-- Anything non-obvious: trade-offs, follow-ups, intentional scope cuts. -->
