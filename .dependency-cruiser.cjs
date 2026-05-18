/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-foundry-in-0gkit",
      comment:
        "Neutral @0gkit/* packages must never depend on Foundry. This is a " +
        "hard architectural invariant (see spec §4).",
      severity: "error",
      from: { path: "^packages/0gkit-[^/]+/src" },
      to: {
        path: "node_modules/@foundryprotocol|^packages/sdk|@foundryprotocol",
      },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "types"],
    },
  },
};
