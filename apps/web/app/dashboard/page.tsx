import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { Dashboard } from "@/components/marketing/Dashboard";
import { getStats } from "@/lib/stats-data";
import { getChain } from "@/lib/chain";

export const metadata = {
  title: "Forge in Public — live mainnet activity",
  description:
    "Real-time on-chain numbers from Foundry on 0G Aristotle mainnet. No simulated counters.",
};

export const revalidate = 10;

export default async function DashboardPage() {
  const chain = getChain();
  const stats = await getStats().catch(() => ({
    forges: 0,
    ingots: 0,
    contributions: 0,
    externalSmiths: 0,
    totalRevenueOG: 0,
    totalClaimedOG: 0,
    lastBlock: 0n,
    isLive: false,
  }));

  return (
    <main>
      <Header />
      <section className="border-hairline border-t">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <p className="text-caption text-ember-400">Forge in Public</p>
          <h1 className="text-display-xl text-platinum-100 mt-3 max-w-[26ch]">
            Real numbers, on mainnet, ticking live.
          </h1>
          <p className="text-body-lg text-platinum-300 mt-6 max-w-[60ch]">
            Every figure below comes from 0G {chain.network}. Pages revalidate every 10
            seconds via Next&apos;s ISR cache; an indexer-fed websocket stream lands
            when traffic justifies it.
          </p>
          {stats.isLive && (
            <p className="text-mono-sm text-platinum-400 tabular mt-4">
              chain head: block {stats.lastBlock.toString()}
            </p>
          )}
        </div>
      </section>
      <Dashboard stats={{ ...stats, network: chain.network }} />
      <Footer />
    </main>
  );
}
