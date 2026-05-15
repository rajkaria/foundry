import Link from "next/link";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { Pill } from "@/components/ui/Pill";
import { Card, CardEyebrow, CardTitle, CardBody } from "@/components/ui/Card";
import { EmptyChainState } from "@/components/app/EmptyChainState";
import { listForges } from "@/lib/forges-data";
import { getChain, shortAddr } from "@/lib/chain";

export const metadata = { title: "Forges" };
export const revalidate = 10;

export default async function ForgesPage() {
  const chain = getChain();
  const forges = await listForges().catch(() => []);

  return (
    <main>
      <Header />
      <section className="border-hairline border-t">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-caption text-ember-400">Forges</p>
              <h1 className="text-display-lg text-platinum-100 mt-3">
                Active and recent collectives, on mainnet.
              </h1>
              <p className="text-body-lg text-platinum-300 mt-5 max-w-[60ch]">
                Each Forge pools data, compute, and capital to train one Ingot. Connect
                a wallet to contribute. Ownership mints proportionally to measured
                contribution.
              </p>
            </div>
            <Link
              href="/forges/new"
              className="bg-ember-500 text-ink-950 hover:bg-ember-400 inline-flex h-10 items-center rounded-md px-5 font-medium transition-colors"
            >
              Create with AI →
            </Link>
          </div>

          {!chain.isLive ? (
            <div className="mt-12">
              <EmptyChainState
                network={chain.network}
                title={`No Forge contracts deployed on 0G ${chain.network} yet.`}
                body="The protocol contracts compile and pass full tests locally. Deploy them with `make deploy-aristotle` (or `deploy-galileo` / `deploy-local`) and addresses will sync automatically. Until then, this page is intentionally empty rather than mocked."
              />
            </div>
          ) : forges.length === 0 ? (
            <div className="mt-12">
              <EmptyChainState
                network={chain.network}
                title="No Forges yet on this network."
                body="Contracts are deployed but no Forge has been created. Spin up the first one — it'll appear here within the next block."
                cta={{ href: "/forges/new", label: "Create the first Forge" }}
              />
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {forges.map((f) => (
                <Link key={f.address} href={`/forges/${f.address}`} className="block">
                  <Card>
                    <div className="flex items-start justify-between gap-3">
                      <CardEyebrow>{shortAddr(f.address)}</CardEyebrow>
                      <Pill
                        tone={
                          f.state === "OPEN" || f.state === "LIVE"
                            ? "positive"
                            : f.state === "EVALUATING"
                              ? "ember"
                              : f.state === "MINTING"
                                ? "warn"
                                : "neutral"
                        }
                        dot
                      >
                        {f.state}
                      </Pill>
                    </div>
                    <CardTitle className="mt-4">Forge {shortAddr(f.address)}</CardTitle>
                    <CardBody>
                      Creator {shortAddr(f.creator)} · {f.contributionsCount}{" "}
                      contributions
                    </CardBody>
                  </Card>
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
