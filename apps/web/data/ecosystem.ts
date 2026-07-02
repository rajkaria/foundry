/**
 * Foundry ecosystem registry.
 *
 * Every project that integrates Foundry — co-owned, revenue-sharing,
 * verifiable AI — on top of the 0G stack. Add a new entry here and it
 * renders on /ecosystem automatically.
 */

export type IntegrationStatus = "live" | "building" | "planned";

export interface EcosystemPartner {
  /** URL-safe id, also used as the anchor on /ecosystem. */
  slug: string;
  name: string;
  /** One-line positioning, sentence case, no trailing period. */
  tagline: string;
  /** 2–3 sentences: what it is, and specifically how it touches Foundry. */
  summary: string;
  /** The 0G primitives this project builds on. */
  zeroGStack: string[];
  /** Concretely, what the Foundry integration does for this project. */
  integration: string;
  /** Short bullet points worth surfacing on the card. */
  highlights: string[];
  category: "AI Agents" | "Infrastructure" | "Data" | "Tooling" | "Consumer";
  status: IntegrationStatus;
  links: {
    github?: string;
    site?: string;
    docs?: string;
    twitter?: string;
  };
  /** Optional logo in /public; falls back to a generated monogram. */
  logo?: string;
  /** Accent used for the monogram fallback when no logo is set. */
  accent?: string;
  /** Sort weight — lower shows first. Featured partners use < 0. */
  weight: number;
}

export const ECOSYSTEM: EcosystemPartner[] = [
  {
    slug: "replicant",
    name: "Replicant",
    tagline: "The first decentralized AI agent protocol with evolutionary intelligence",
    summary:
      "Replicant turns AI agents into verifiable digital organisms — minted, evolved, traded, and rented as ERC-7857 Intelligent NFTs with encrypted neural weights. Agents run inside TEEs and archive their genome on 0G Storage. Foundry is the ownership and revenue layer underneath: every Replicant agent that performs inference can route through a co-owned Foundry Ingot, so the contributors who improved an agent's intelligence earn on every call its offspring make — forever.",
    zeroGStack: ["0G Chain (L1)", "0G Storage", "0G Compute (TEE)"],
    integration:
      "Replicant agents inference co-owned Foundry Ingots instead of a closed API. Each call returns an attested receipt (TEE quote + on-chain revenue tx), and revenue splits flow back to the smiths who trained the agent's lineage. Evolutionary spawns inherit the parent Ingot's attribution graph, so an agent's earning history compounds across generations.",
    highlights: [
      "ERC-7857 iNFTs back every agent's encrypted intelligence",
      "Six agent species — trading, auditing, gaming, legal, oracle, social",
      "Genome stored on 0G Storage with cryptographic proofs",
      "Foundry Ingots make agent intelligence a revenue-sharing asset",
    ],
    category: "AI Agents",
    status: "building",
    links: {
      github: "https://github.com/LSUDOKO/replicant",
    },
    accent: "#7c5cff",
    weight: -10,
  },
  {
    slug: "vamvault",
    name: "VAMVault",
    tagline: "Verifiable AI-managed vaults with on-chain execution memory",
    summary:
      "VAMVault is an AI-managed asset vault on 0G where every action an agent takes — rebalance, swap, hedge, signal — is recorded as a verifiable execution memory. The VAMVault team integrated Foundry's attribution layer so each execution can carry the receipt of the Ingot that produced the decision: which co-owned model was called, the on-chain inference tx, the revenue settlement, and the TEE attestation. Depositors get a full provenance trail; the smiths who trained the model earn revenue from every vault action it drives.",
    zeroGStack: ["0G Chain (Aristotle)", "0G Storage", "0G Compute (TEE)"],
    integration:
      "Each vault execution record can attach a Foundry Ingot receipt — `ingotId`, `inferenceTxHash`, `revenueTxHash`, `attestationRef` — turning VAMVault's memory history into a chain of co-owned, attested AI decisions. Foundry doesn't touch the vault's main 0G flow; it bolts on as an optional attribution field that any auditor or smith can verify independently against 0G Chain and 0G Storage.",
    highlights: [
      "Every vault action carries a verifiable Foundry receipt",
      "Co-owned Ingots earn on every decision they drive",
      "TEE-attested execution, end to end on 0G",
      "Optional attribution — zero impact on the main vault flow",
    ],
    category: "Consumer",
    status: "live",
    links: {
      site: "https://vamvault.xyz",
    },
    accent: "#06b6d4",
    weight: -3,
  },
  {
    slug: "sealedmind",
    name: "SealedMind",
    tagline: "Sovereign, encrypted memory for AI agents on 0G",
    summary:
      "SealedMind gives every wallet a private, TEE-attested Mind — a vault for facts, conversations, and capabilities that an agent can `remember`, `recall`, `grant`, and `revoke` on chain. The SealedMind team built and ships `@sealedmind/mcp`, a stdio MCP companion that drops in beside `@foundryprotocol/mcp` so any Ingot-powered agent gains persistent encrypted memory with zero Foundry-side changes.",
    zeroGStack: ["0G Chain (Aristotle)", "0G Storage", "0G Compute (TEE)"],
    integration:
      "`@sealedmind/mcp` is a standalone stdio MCP server published by the SealedMind team that wraps their hosted backend. Users add it to their MCP config alongside `@foundryprotocol/mcp`; the agent runtime orchestrates both. Memory operations emit on-chain `MemoryAccessLog` events on the same 0G Aristotle network Ingots settle on, so a single agent turn can run inference on a co-owned Ingot and seal the result into the user's Mind — both independently verifiable on chainscan.",
    highlights: [
      "Side-by-side MCP — one config block, two servers, no coupling",
      "BYOK auth (`SEALEDMIND_API_KEY`) — Foundry holds no keys",
      "Six tools: remember, recall, grant/revoke/list capability, verify attestation",
      "Built and maintained entirely by the SealedMind team",
    ],
    category: "Infrastructure",
    status: "live",
    links: {
      github: "https://github.com/SealedMind/SealedMindMonoRepo",
      site: "https://sealedmind.vercel.app",
      docs: "https://www.npmjs.com/package/@sealedmind/mcp",
      twitter: "https://x.com/SealedMind_0G",
    },
    accent: "#22c55e",
    weight: -5,
  },
  {
    slug: "memoriada",
    name: "MemoriaDA",
    tagline: "Decentralized vector memory with attested, co-owned inference",
    summary:
      "MemoriaDA gives AI agents sovereign, long-term semantic memory — vector-indexed and stored on 0G Storage — so they can recall context across sessions without renting intelligence from centralized APIs. The MemoriaDA team integrated Foundry so every recall-and-respond flow can route inference through a Foundry-managed TEE node (e.g. 0GM-1.0-35B-A3B on 0G Serving), returning a cryptographic attestation and an `inferenceTxHash` with each response. The result: non-custodial memory backed by a co-owned, revenue-generating model — provable end-to-end on 0G.",
    zeroGStack: [
      "0G Chain (Aristotle)",
      "0G Storage",
      "0G Compute (TEE)",
      "0G Serving",
    ],
    integration:
      "MemoriaDA routes its agent inference calls through Foundry's TEE-secured serving nodes. Each response carries the Ingot's `inferenceTxHash` plus a TEE attestation, so an agent's memory recall and the model that interpreted it are both verifiable on chain. Smiths who trained the underlying Ingot earn revenue from every MemoriaDA-driven inference.",
    highlights: [
      "Vector-indexed long-term memory persisted on 0G Storage",
      "Inference routed through Foundry Ingots on 0G Compute (TEE)",
      "Every response returns an attestation + `inferenceTxHash`",
      "Non-custodial, end-to-end auditable agent intelligence",
    ],
    category: "Data",
    status: "live",
    links: {
      site: "https://memoriada.xyz",
      docs: "https://memoriada.xyz/blog/memoriada-foundry-partnership",
      twitter: "https://x.com/MemoriaDA_",
    },
    accent: "#f472b6",
    weight: -4,
  },
];

export const ECOSYSTEM_SORTED = [...ECOSYSTEM].sort(
  (a, b) => a.weight - b.weight || a.name.localeCompare(b.name)
);

export const STATUS_LABEL: Record<IntegrationStatus, string> = {
  live: "Live on mainnet",
  building: "Integration in progress",
  planned: "Planned",
};
