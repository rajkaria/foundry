/* Generated-style ABIs — minimal subset the SDK uses. Full ABIs ship after
 * `forge build` in CI; this file is the SDK-facing interface. */

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
    name: "contributionsCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
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
] as const;
