import Link from "next/link";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { Pill } from "@/components/ui/Pill";
import { listSmiths, smithTotals, shortAddr } from "@/lib/smiths";

export const metadata = {
  title: "Smiths — every Foundry contributor",
  description: "Browse data Smiths, compute Smiths, and eval coordinators contributing to Foundry Ingots.",
};

export default function SmithsIndexPage() {
  const smiths = listSmiths();
  return (
    <main>
      <Header />
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-caption text-ember-400">Smiths</p>
              <h1 className="text-display-xl mt-3 max-w-[24ch] text-platinum-100">
                The people forging Foundry models.
              </h1>
              <p className="text-body-lg mt-6 max-w-[60ch] text-platinum-300">
                Every Smith here holds on-chain shares in at least one
                Ingot. Click through to see their cap table, claimable
                revenue, and contribution history.
              </p>
            </div>
            <Pill tone="positive" dot>
              {smiths.length} active Smiths
            </Pill>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-lg border-hairline md:grid-cols-2 lg:grid-cols-3">
            {smiths.map((s) => {
              const totals = smithTotals(s);
              return (
                <Link
                  key={s.address}
                  href={`/smiths/${s.address}`}
                  className="group block bg-ink-900 p-6 transition-colors hover:bg-ink-800"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-title-md text-platinum-100">
                        {s.handle}
                      </p>
                      <p className="text-caption mt-1 font-mono text-platinum-400">
                        {shortAddr(s.address)}
                      </p>
                    </div>
                    <Pill tone="ember">{totals.ingotsHeld} Ingots</Pill>
                  </div>
                  <p className="text-body-sm mt-4 line-clamp-2 text-platinum-300">
                    {s.bio}
                  </p>
                  <div className="mt-6 flex items-end justify-between border-t border-hairline pt-4">
                    <div>
                      <p className="text-caption text-platinum-400">Earned</p>
                      <p className="text-title-lg mt-1 tabular text-platinum-100">
                        {totals.totalEarnedOG.toFixed(3)} OG
                      </p>
                    </div>
                    <span className="text-caption text-platinum-400 transition-colors group-hover:text-ember-300">
                      View profile →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
