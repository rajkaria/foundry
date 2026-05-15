import Link from "next/link";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { Pill } from "@/components/ui/Pill";
import { EmptyChainState } from "@/components/app/EmptyChainState";
import { listSmiths } from "@/lib/smiths-data";
import { getChain, shortAddr } from "@/lib/chain";

export const metadata = {
  title: "Smiths — every Foundry contributor",
  description:
    "Browse data Smiths, compute Smiths, and eval coordinators contributing to Foundry Ingots.",
};

export const revalidate = 10;

export default async function SmithsIndexPage() {
  const chain = getChain();
  const smiths = await listSmiths().catch(() => []);

  return (
    <main>
      <Header />
      <section className="border-hairline border-t">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-caption text-ember-400">Smiths</p>
              <h1 className="text-display-xl text-platinum-100 mt-3 max-w-[24ch]">
                The people forging Foundry models.
              </h1>
              <p className="text-body-lg text-platinum-300 mt-6 max-w-[60ch]">
                Every Smith here holds on-chain shares in at least one Ingot. Click
                through to see their cap table, claimable revenue, and contribution
                history.
              </p>
            </div>
            <Pill tone="positive" dot>
              {smiths.length} active Smiths
            </Pill>
          </div>

          {!chain.isLive ? (
            <div className="mt-12">
              <EmptyChainState
                network={chain.network}
                title={`Smith data is derived from on-chain events.`}
                body="Smith profiles aggregate ContributionLogged + ShareMinted + RevenueClaimed events. Once contracts deploy on this network, this page populates automatically — there are no hardcoded profiles."
              />
            </div>
          ) : smiths.length === 0 ? (
            <div className="mt-12">
              <EmptyChainState
                network={chain.network}
                title="No Smiths yet on this network."
                body="No contributions have been logged. The first Smith profile appears here as soon as someone calls Forge.contributeData / contributeCompute / fundForge."
                cta={{ href: "/forges", label: "Browse Forges to contribute" }}
              />
            </div>
          ) : (
            <div className="border-hairline mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-lg md:grid-cols-2 lg:grid-cols-3">
              {smiths.map((s) => (
                <Link
                  key={s.address}
                  href={`/smiths/${s.address}`}
                  className="group bg-ink-900 hover:bg-ink-800 block p-6 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-title-md text-platinum-100 font-mono">
                        {shortAddr(s.address)}
                      </p>
                      <p className="text-caption text-platinum-400 mt-1">
                        {s.contributions.length} contributions
                      </p>
                    </div>
                    <Pill tone="ember">{s.shares.length} Ingots</Pill>
                  </div>
                  <p className="text-body-sm text-platinum-300 mt-4">
                    {s.contributions[0]
                      ? `Latest: ${s.contributions[0].type} contribution`
                      : "Awaiting first contribution"}
                  </p>
                  <div className="border-hairline mt-6 flex items-end justify-between border-t pt-4">
                    <div>
                      <p className="text-caption text-platinum-400">Claimable</p>
                      <p className="text-title-lg tabular text-platinum-100 mt-1">
                        {s.totalClaimableOG.toFixed(3)} OG
                      </p>
                    </div>
                    <span className="text-caption text-platinum-400 group-hover:text-ember-300 transition-colors">
                      View profile →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
