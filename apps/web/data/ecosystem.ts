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
];

export const ECOSYSTEM_SORTED = [...ECOSYSTEM].sort(
  (a, b) => a.weight - b.weight || a.name.localeCompare(b.name)
);

export const STATUS_LABEL: Record<IntegrationStatus, string> = {
  live: "Live on mainnet",
  building: "Integration in progress",
  planned: "Planned",
};
