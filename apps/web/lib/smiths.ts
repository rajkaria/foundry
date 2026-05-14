/**
 * Curated Smith catalog. Until the indexer's /smiths endpoint is live,
 * the Smith profile pages source from this typed catalog so the data
 * model and shape are locked.
 */

export interface SmithIngotShare {
  ingotId: string;
  ingotName: string;
  shareBps: number; // basis points (10000 = 100%)
  contributionType: "data" | "compute" | "eval";
  contributedAt: string; // ISO date
  txHash: string;
  claimableOG: number;
  earnedOG: number;
}

export interface Smith {
  address: string; // EVM address, lowercased
  handle: string;
  bio: string;
  joinedAt: string; // ISO date
  shares: SmithIngotShare[];
  recentActivity: Array<{
    kind: "contribute" | "claim" | "vote";
    at: string;
    label: string;
    txHash?: string;
  }>;
}

const SMITHS: Smith[] = [
  {
    address: "0x4a7c5e3f1d8a9b6c2f0e7d4a1c9b8e5f3d2a1c7e",
    handle: "raj.smith",
    bio: "Konkani-speaking data Smith. Contributing news corpora and conversational data to the Konkani translation Forge.",
    joinedAt: "2026-05-19",
    shares: [
      {
        ingotId: "0x8e2af4a000000000000000000000000000000001",
        ingotName: "Konkani ↔ English translator v1",
        shareBps: 4100,
        contributionType: "data",
        contributedAt: "2026-05-20",
        txHash: "0x4a7c5e3f1d8a9b6c2f0e7d4a1c9b8e5f3d2a1c7e",
        claimableOG: 0.184,
        earnedOG: 0.184,
      },
      {
        ingotId: "0x8e2af4a000000000000000000000000000000002",
        ingotName: "Konkani · news domain",
        shareBps: 3200,
        contributionType: "data",
        contributedAt: "2026-05-22",
        txHash: "0x6f12d4a1c9b8e5f3d2a1c7e3f1d8a9b6c2f0e7d4",
        claimableOG: 0.071,
        earnedOG: 0.071,
      },
    ],
    recentActivity: [
      { kind: "contribute", at: "2026-05-22", label: "Contributed 12k Konkani news articles to Konkani · news Forge", txHash: "0x6f12d4a1c9b8e5f3d2a1c7e3f1d8a9b6c2f0e7d4" },
      { kind: "contribute", at: "2026-05-20", label: "Contributed 48k Konkani sentence pairs to Konkani v1 Forge", txHash: "0x4a7c5e3f1d8a9b6c2f0e7d4a1c9b8e5f3d2a1c7e" },
    ],
  },
  {
    address: "0x6f12d4a1c9b8e5f3d2a1c7e3f1d8a9b6c2f0e7d4",
    handle: "aisha.smith",
    bio: "Compute Smith — runs a 4× H100 node from Lagos. Underwriting training budgets for translation Forges.",
    joinedAt: "2026-05-21",
    shares: [
      {
        ingotId: "0x8e2af4a000000000000000000000000000000001",
        ingotName: "Konkani ↔ English translator v1",
        shareBps: 800,
        contributionType: "compute",
        contributedAt: "2026-05-22",
        txHash: "0x8e2af4a000000000000000000000000000000001",
        claimableOG: 0.038,
        earnedOG: 0.038,
      },
      {
        ingotId: "0x8e2af4a000000000000000000000000000000003",
        ingotName: "Tulu ↔ English translator v1",
        shareBps: 1500,
        contributionType: "compute",
        contributedAt: "2026-05-26",
        txHash: "0x1c34e3f1d8a9b6c2f0e7d4a1c9b8e5f3d2a1c7e3",
        claimableOG: 0.024,
        earnedOG: 0.024,
      },
    ],
    recentActivity: [
      { kind: "contribute", at: "2026-05-26", label: "Underwrote 18 H100-hours for Tulu v1 training", txHash: "0x1c34e3f1d8a9b6c2f0e7d4a1c9b8e5f3d2a1c7e3" },
      { kind: "claim", at: "2026-05-25", label: "Claimed 0.038 OG from Konkani v1", txHash: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b" },
    ],
  },
  {
    address: "0x8e2af4a000000000000000000000000000000d4a",
    handle: "mehul.smith",
    bio: "Legal-domain data Smith. Contributing contract clause corpora for the Clause Classifier Forge.",
    joinedAt: "2026-05-27",
    shares: [
      {
        ingotId: "0x8e2af4a000000000000000000000000000000004",
        ingotName: "Clause Classifier — contract intent",
        shareBps: 2900,
        contributionType: "data",
        contributedAt: "2026-05-28",
        txHash: "0xd4a1c9b8e5f3d2a1c7e3f1d8a9b6c2f0e7d44a7c",
        claimableOG: 0.052,
        earnedOG: 0.052,
      },
      {
        ingotId: "0x8e2af4a000000000000000000000000000000005",
        ingotName: "Clause · MSA specialization",
        shareBps: 3400,
        contributionType: "data",
        contributedAt: "2026-05-30",
        txHash: "0xe5f3d2a1c7e3f1d8a9b6c2f0e7d44a7c5e3f1d8a",
        claimableOG: 0.029,
        earnedOG: 0.029,
      },
    ],
    recentActivity: [
      { kind: "contribute", at: "2026-05-30", label: "Contributed 2.4k MSA clauses with annotations", txHash: "0xe5f3d2a1c7e3f1d8a9b6c2f0e7d44a7c5e3f1d8a" },
      { kind: "contribute", at: "2026-05-28", label: "Contributed 8.1k labeled clauses to Clause Classifier", txHash: "0xd4a1c9b8e5f3d2a1c7e3f1d8a9b6c2f0e7d44a7c" },
    ],
  },
];

export function listSmiths(): Smith[] {
  return SMITHS.slice();
}

export function getSmith(address: string): Smith | null {
  const normalized = address.toLowerCase();
  return SMITHS.find((s) => s.address.toLowerCase() === normalized) ?? null;
}

export function smithTotals(smith: Smith): {
  ingotsHeld: number;
  totalEarnedOG: number;
  totalClaimableOG: number;
  contributionsCount: number;
} {
  return {
    ingotsHeld: smith.shares.length,
    totalEarnedOG: smith.shares.reduce((s, x) => s + x.earnedOG, 0),
    totalClaimableOG: smith.shares.reduce((s, x) => s + x.claimableOG, 0),
    contributionsCount: smith.recentActivity.filter((a) => a.kind === "contribute").length,
  };
}

export function shortAddr(addr: string): string {
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}
