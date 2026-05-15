/**
 * Foundry contract ABIs — the SDK-facing surface.
 *
 * These are hand-authored, viem-typed const ABIs. The Forge toolkit also
 * emits full ABIs in `contracts/out/**\/*.json` after `forge build`, but
 * we vendor a curated subset here to keep the SDK lean and tree-shakeable.
 */

export const forgeFactoryAbi = [
  {
    type: "function",
    name: "createForge",
    stateMutability: "nonpayable",
    inputs: [
      { name: "modelSpec", type: "bytes32" },
      { name: "evalSpec", type: "bytes32" },
      { name: "evalCoordinator", type: "address" },
      { name: "contributionWindowEnds", type: "uint64" },
    ],
    outputs: [{ name: "forge", type: "address" }],
  },
  {
    type: "function",
    name: "count",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "allForges",
    stateMutability: "view",
    inputs: [{ type: "uint256" }],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "authorizedMint",
    stateMutability: "view",
    inputs: [{ type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "event",
    name: "ForgeCreated",
    inputs: [
      { name: "forge", type: "address", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "modelSpec", type: "bytes32", indexed: false },
      { name: "evalSpec", type: "bytes32", indexed: false },
      { name: "evalCoordinator", type: "address", indexed: false },
      { name: "contributionWindowEnds", type: "uint64", indexed: false },
    ],
  },
] as const;

export const forgeAbi = [
  {
    type: "function",
    name: "contributeData",
    stateMutability: "nonpayable",
    inputs: [{ name: "storageRoot", type: "bytes32" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "contributeCompute",
    stateMutability: "payable",
    inputs: [{ name: "amount", type: "uint128" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "fundForge",
    stateMutability: "payable",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "startEvaluating",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "submitEvalResult",
    stateMutability: "nonpayable",
    inputs: [
      { name: "attestation", type: "bytes32" },
      { name: "scores", type: "uint64[]" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "mintOwnership",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "setWeightsAndGoLive",
    stateMutability: "nonpayable",
    inputs: [
      { name: "weightsRoot", type: "bytes32" },
      { name: "lineageParent", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "state",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "function",
    name: "tokenId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "creator",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "modelSpec",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bytes32" }],
  },
  {
    type: "function",
    name: "evalSpec",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bytes32" }],
  },
  {
    type: "function",
    name: "evalCoordinator",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "contributionWindowEnds",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint64" }],
  },
  {
    type: "function",
    name: "attestation",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bytes32" }],
  },
  {
    type: "function",
    name: "contributionIds",
    stateMutability: "view",
    inputs: [{ type: "uint256" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "event",
    name: "StateChanged",
    inputs: [
      { name: "oldState", type: "uint8", indexed: false },
      { name: "newState", type: "uint8", indexed: false },
    ],
  },
  {
    type: "event",
    name: "ContributionAdded",
    inputs: [
      { name: "contributionId", type: "uint256", indexed: true },
      { name: "smith", type: "address", indexed: true },
      { name: "ctype", type: "uint8", indexed: false },
    ],
  },
  {
    type: "event",
    name: "EvalSubmitted",
    inputs: [
      { name: "attestation", type: "bytes32", indexed: false },
      { name: "scores", type: "uint64[]", indexed: false },
    ],
  },
  {
    type: "event",
    name: "IngotForged",
    inputs: [{ name: "tokenId", type: "uint256", indexed: true }],
  },
] as const;

export const ingotAbi = [
  {
    type: "function",
    name: "shareOf",
    stateMutability: "view",
    inputs: [{ type: "uint256" }, { type: "address" }],
    outputs: [{ type: "uint128" }],
  },
  {
    type: "function",
    name: "sharesTotalIssued",
    stateMutability: "view",
    inputs: [{ type: "uint256" }],
    outputs: [{ type: "uint128" }],
  },
  {
    type: "function",
    name: "meta",
    stateMutability: "view",
    inputs: [{ type: "uint256" }],
    outputs: [
      { name: "weightsRoot", type: "bytes32" },
      { name: "lineageParent", type: "bytes32" },
      { name: "forge", type: "address" },
      { name: "mintedAt", type: "uint64" },
      { name: "weightsSet", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "SHARE_TOTAL",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint128" }],
  },
  {
    type: "function",
    name: "ownerOf",
    stateMutability: "view",
    inputs: [{ type: "uint256" }],
    outputs: [{ type: "address" }],
  },
  {
    type: "event",
    name: "IngotMinted",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "forge", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "ShareMinted",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "holder", type: "address", indexed: true },
      { name: "share", type: "uint128", indexed: false },
    ],
  },
  {
    type: "event",
    name: "WeightsSet",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "weightsRoot", type: "bytes32", indexed: false },
    ],
  },
  {
    type: "event",
    name: "LineageLinked",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "parent", type: "bytes32", indexed: false },
    ],
  },
] as const;

export const revenueSplitterAbi = [
  {
    type: "function",
    name: "receivePayment",
    stateMutability: "payable",
    inputs: [{ type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "claim",
    stateMutability: "nonpayable",
    inputs: [{ type: "uint256" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "claimable",
    stateMutability: "view",
    inputs: [{ type: "uint256" }, { type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "cumulativePerShare",
    stateMutability: "view",
    inputs: [{ type: "uint256" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "totalReceived",
    stateMutability: "view",
    inputs: [{ type: "uint256" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "totalClaimed",
    stateMutability: "view",
    inputs: [{ type: "uint256" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "feeBps",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint16" }],
  },
  {
    type: "function",
    name: "treasury",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "event",
    name: "RevenueReceived",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "payer", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "fee", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "RevenueClaimed",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "holder", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;

export const contributionRegistryAbi = [
  {
    type: "function",
    name: "log",
    stateMutability: "nonpayable",
    inputs: [
      { name: "smith", type: "address" },
      { name: "ctype", type: "uint8" },
      { name: "storageRoot", type: "bytes32" },
      { name: "amount", type: "uint128" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "get",
    stateMutability: "view",
    inputs: [{ type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "smith", type: "address" },
          { name: "forge", type: "address" },
          { name: "ctype", type: "uint8" },
          { name: "storageRoot", type: "bytes32" },
          { name: "amount", type: "uint128" },
          { name: "timestamp", type: "uint64" },
          { name: "score", type: "uint64" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "count",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "byForge",
    stateMutability: "view",
    inputs: [{ type: "address" }, { type: "uint256" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "bySmith",
    stateMutability: "view",
    inputs: [{ type: "address" }, { type: "uint256" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "event",
    name: "ContributionLogged",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "smith", type: "address", indexed: true },
      { name: "forge", type: "address", indexed: true },
      { name: "ctype", type: "uint8", indexed: false },
      { name: "storageRoot", type: "bytes32", indexed: false },
      { name: "amount", type: "uint128", indexed: false },
      { name: "timestamp", type: "uint64", indexed: false },
    ],
  },
  {
    type: "event",
    name: "ContributionScored",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "score", type: "uint64", indexed: false },
    ],
  },
] as const;

export const ingotRegistryAbi = [
  {
    type: "function",
    name: "setProvider",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "provider", type: "address" },
      { name: "model", type: "string" },
      { name: "endpoint", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "providerOf",
    stateMutability: "view",
    inputs: [{ type: "uint256" }],
    outputs: [
      { name: "provider", type: "address" },
      { name: "model", type: "string" },
      { name: "endpoint", type: "string" },
      { name: "setBy", type: "address" },
      { name: "updatedAt", type: "uint64" },
    ],
  },
  {
    type: "function",
    name: "isSet",
    stateMutability: "view",
    inputs: [{ type: "uint256" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "event",
    name: "ProviderSet",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "provider", type: "address", indexed: true },
      { name: "model", type: "string", indexed: false },
      { name: "endpoint", type: "string", indexed: false },
    ],
  },
] as const;
