# 0gkit Decisions

## D1 — npm scope (2026-05-18)

Resolved scope: `@0gkit`

Probe results:
- `npm view @0gkit/core` → E404 free (exit:1, HTTP 404 Not Found)
- `npm view @zerogkit/core` → E404 free (exit:1, HTTP 404 Not Found)
- `npm view zerog-core` → E404 free (exit:1, HTTP 404 Not Found)

Rule: prefer `@0gkit`; fallback `@zerogkit`; final fallback unscoped `zerog-`.
All `@0gkit/*` references in plans/specs map to the resolved scope.
