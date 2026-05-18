/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-foundry-in-0gkit",
      comment:
        "Neutral @0gkit/* packages must never depend on anything outside " +
        "@0gkit/* (Foundry or otherwise). Hard architectural invariant (spec §4).",
      severity: "error",
      from: { path: "^packages/0gkit-[^/]+/src" },
      // Forbid any edge into a workspace package that is NOT @0gkit/*, plus any
      // @foundryprotocol bare/scoped import. 0gkit→0gkit (chain→core) stays
      // allowed via pathNot; external npm deps (viem) are unaffected.
      to: {
        path: "^packages/|@foundryprotocol",
        pathNot: "^packages/0gkit-",
      },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    // NOTE: no tsConfig — the codebase uses only relative + bare imports (no TS
    // path aliases). Add a tsConfig option here if path aliases are introduced.
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "types"],
    },
  },
};
