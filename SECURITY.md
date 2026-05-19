# Security Policy

## Reporting a vulnerability

**Do not open a public issue for security vulnerabilities.**

Report privately via GitHub's
[security advisory form](https://github.com/rajkaria/foundry/security/advisories/new)
or email **security@foundryprotocol.xyz**. Include a description, affected
package/version, and a reproduction if possible.

We aim to acknowledge within 72 hours and to ship a fix or mitigation for
confirmed, in-scope issues as quickly as practical. We will credit reporters
who wish to be credited once a fix is released.

## Scope

In scope — the neutral toolkit and its trust boundary:

- `@0gkit/*` packages (Storage, Compute, DA, Attestation, CLI, MCP, React)
- `create-foundry-app`
- The attestation verification path (digest integrity + signer recovery) is
  the highest-severity surface: a verification bypass is critical.

Out of scope:

- The Galileo/Aristotle networks and the upstream `@0gfoundation/*` SDKs
  (report those to 0G).
- Issues requiring a malicious dependency you installed yourself outside the
  documented optional peers.
- The demo playground's lack of a backend (by design — it is a pure client).

## Supported versions

The latest published minor of the linked `@0gkit/*` line receives security
fixes. Because the packages are version-linked, a security release bumps them
together.
