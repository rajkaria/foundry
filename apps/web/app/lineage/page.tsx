import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { LineageGraph, type LineageNode } from "@/components/app/LineageGraph";
import { Pill } from "@/components/ui/Pill";
import { EmptyChainState } from "@/components/app/EmptyChainState";
import { listIngots } from "@/lib/lineage-data";
import { getChain } from "@/lib/chain";

export const metadata = {
  title: "Lineage — every Ingot, every parent",
  description:
    "The on-chain family tree of every Foundry Ingot. Forks, reforges, and contributions trace back to origin.",
};

export const revalidate = 15;

export default async function LineagePage() {
  const chain = getChain();
  const ingots = await listIngots().catch(() => []);

  // Map on-chain parent (bytes32) to graph parent (token-id string).
  // The Ingot contract stores parents as bytes32 of (uint256 parentTokenId)
  // when reforging, or 0x0 for root. We decode that on the fly.
  const idByHash = new Map<string, string>();
  for (const i of ingots) {
    const tokenHashKey = "0x" + i.tokenId.toString(16).padStart(64, "0");
    idByHash.set(tokenHashKey, i.tokenId.toString());
  }
  const ZERO_HASH = "0x" + "0".repeat(64);

  const nodes: LineageNode[] = ingots.map((i) => ({
    id: i.tokenId.toString(),
    name: `Ingot #${i.tokenId.toString()}`,
    parent:
      i.lineageParent && i.lineageParent !== ZERO_HASH
        ? idByHash.get(i.lineageParent.toLowerCase())
        : undefined,
    ingotId: i.tokenId.toString(),
    contributors: i.contributors,
    mintedAt: i.mintedAt
      ? new Date(i.mintedAt * 1000).toISOString().slice(0, 10)
      : undefined,
  }));

  const roots = nodes.filter((n) => !n.parent).length;
  const maxDepth = computeMaxDepth(nodes);
  const totalContributors = ingots.reduce((a, i) => a + i.contributors, 0);

  return (
    <main>
      <Header />
      <section className="border-hairline border-t">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-caption text-ember-400">Lineage</p>
              <h1 className="text-display-xl text-platinum-100 mt-3 max-w-[28ch]">
                Every Ingot remembers every parent.
              </h1>
              <p className="text-body-lg text-platinum-300 mt-6 max-w-[60ch]">
                Reforging an Ingot mints a new one, on-chain, with the parent hash
                committed in the {""}
                <span className="text-platinum-100">Ingot.meta()</span> struct. Parent
                shareholders keep earning from descendants because the RevenueSplitter
                routes a slice up the chain.
              </p>
            </div>
            <Pill tone="positive" dot>
              0G · {chain.network}
            </Pill>
          </div>

          {!chain.isLive ? (
            <div className="mt-12">
              <EmptyChainState
                network={chain.network}
                title="The lineage graph is generated from on-chain Ingot.meta() reads."
                body="Once contracts deploy and Ingots mint, parent links materialise here automatically — no curation."
              />
            </div>
          ) : nodes.length === 0 ? (
            <div className="mt-12">
              <EmptyChainState
                network={chain.network}
                title="No Ingots minted yet on this network."
                body="The first Ingot creates the first lineage root. Forks and reforges branch from there."
                cta={{ href: "/forges", label: "Browse Forges" }}
              />
            </div>
          ) : (
            <>
              <div className="mt-12">
                <LineageGraph nodes={nodes} />
              </div>
              <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
                <FactCard
                  label="Roots"
                  value={String(roots)}
                  note="Independent training lineages — no parent."
                />
                <FactCard
                  label="Lineage depth"
                  value={String(maxDepth)}
                  note="Longest chain of reforges in the graph."
                />
                <FactCard
                  label="Total contributors"
                  value={String(totalContributors)}
                  note="Cumulative across all Ingots — Smiths often hold shares in multiple."
                />
              </div>
            </>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

function computeMaxDepth(nodes: LineageNode[]): number {
  const byId = new Map(nodes.map((n) => [n.id, n] as const));
  const memo = new Map<string, number>();
  function depth(id: string): number {
    if (memo.has(id)) return memo.get(id)!;
    const n = byId.get(id);
    const d = n?.parent ? 1 + depth(n.parent) : 0;
    memo.set(id, d);
    return d;
  }
  let max = 0;
  for (const n of nodes) max = Math.max(max, depth(n.id));
  return max;
}

function FactCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="border-hairline bg-ink-900 rounded-lg p-6">
      <p className="text-caption text-platinum-400">{label}</p>
      <p className="text-display-sm text-platinum-100 mt-2">{value}</p>
      <p className="text-body-sm text-platinum-300 mt-3">{note}</p>
    </div>
  );
}
