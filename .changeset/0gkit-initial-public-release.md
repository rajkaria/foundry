---
"@0gkit/core": minor
"@0gkit/chain": minor
"@0gkit/storage": minor
"@0gkit/compute": minor
"@0gkit/da": minor
"@0gkit/attestation": minor
"@0gkit/cli": minor
"@0gkit/mcp": minor
"@0gkit/react": minor
"create-foundry-app": minor
---

Initial public release of the 0gkit toolkit — the neutral, defacto 0G builder
SDK. Storage, Compute, DA, and Attestation primitives; a language-agnostic
`0g` CLI (`init` + `doctor`); an MCP server exposing every primitive as an
`og_*` tool; React hooks; and `create-foundry-app` scaffolding. Every package
is independently installable, ships an escape hatch to the raw 0G SDK, and is
free of any Foundry dependency (enforced in CI).
