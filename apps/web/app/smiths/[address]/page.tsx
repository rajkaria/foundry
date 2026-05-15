import { notFound } from "next/navigation";
import Link from "next/link";
import { isAddress } from "viem";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { Pill } from "@/components/ui/Pill";
import { Card, CardEyebrow, CardTitle, CardBody } from "@/components/ui/Card";
import { getSmith } from "@/lib/smiths-data";
import { explorerAddress, getChain, shortAddr, shortHash } from "@/lib/chain";

export const revalidate = 10;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  if (!isAddress(address)) return { title: "Smith not found" };
  return {
    title: `${shortAddr(address)} — Foundry Smith`,
    description: `On-chain activity for Smith ${shortAddr(address)} — Ingots held, contributions, claimable revenue.`,
  };
}

export default async function SmithProfilePage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  if (!isAddress(address)) notFound();
  const chain = getChain();
  if (!chain.isLive) notFound();

  const smith = await getSmith(address);
  if (!smith) notFound();

  return (
    <main>
      <Header />

      <section className="border-hairline border-t">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Link
                href="/smiths"
                className="text-caption text-platinum-400 hover:text-platinum-200 transition-colors"
              >
                ← All Smiths
              </Link>
              <p className="text-caption text-ember-400 mt-4">Smith</p>
              <h1 className="text-display-xl text-platinum-100 mt-3 font-mono">
                {shortAddr(smith.address)}
              </h1>
              <p className="text-body text-platinum-400 mt-2 font-mono">
                {smith.address}
              </p>
            </div>
            <a
              href={explorerAddress(smith.address)}
              target="_blank"
              rel="noreferrer noopener"
              className="text-caption text-platinum-400 hover:text-platinum-200 transition-colors"
            >
              View on explorer ↗
            </a>
          </div>
        </div>
      </section>

      <section className="border-hairline border-t">
        <div className="mx-auto max-w-[1280px] px-6 py-12">
          <div className="border-hairline grid grid-cols-2 gap-px overflow-hidden rounded-lg md:grid-cols-4">
            <Stat label="Ingots held" value={String(smith.shares.length)} />
            <Stat
              label="Total claimed"
              value={`${smith.totalClaimedOG.toFixed(3)} OG`}
            />
            <Stat
              label="Claimable now"
              value={`${smith.totalClaimableOG.toFixed(3)} OG`}
              accent={smith.totalClaimableOG > 0}
            />
            <Stat label="Contributions" value={String(smith.contributions.length)} />
          </div>
        </div>
      </section>

      <section className="border-hairline border-t">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <p className="text-caption text-ember-400">Holdings</p>
          <h2 className="text-display-md text-platinum-100 mt-3">
            Shares across {smith.shares.length} Ingots
          </h2>
          {smith.shares.length === 0 ? (
            <p className="text-body text-platinum-400 mt-6">
              No Ingot shares yet. Contribute to a Forge to earn one.
            </p>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              {smith.shares.map((share) => (
                <Card key={share.tokenId.toString()}>
                  <CardEyebrow>Ingot #{share.tokenId.toString()}</CardEyebrow>
                  <CardTitle>{(share.shareBps / 100).toFixed(2)}% share</CardTitle>
                  <CardBody>Claimable now: {share.claimableOG.toFixed(4)} OG</CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-hairline border-t">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <p className="text-caption text-ember-400">Activity</p>
          <h2 className="text-display-md text-platinum-100 mt-3">
            Recent contributions
          </h2>
          {smith.contributions.length === 0 ? (
            <p className="text-body text-platinum-400 mt-6">
              No contributions logged yet.
            </p>
          ) : (
            <ul className="border-hairline mt-8 overflow-hidden rounded-lg">
              {smith.contributions.slice(0, 25).map((c) => (
                <li
                  key={c.txHash}
                  className="border-hairline bg-ink-900 grid grid-cols-[80px_1fr_auto] items-center gap-4 border-b px-5 py-4 last:border-b-0"
                >
                  <Pill tone="ember">{c.type}</Pill>
                  <span className="text-mono-sm text-platinum-300">
                    Forge {shortAddr(c.forge)}
                  </span>
                  <span className="text-mono-sm text-platinum-400 tabular">
                    {shortHash(c.txHash)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-ink-900 p-6">
      <p className="text-caption text-platinum-400">{label}</p>
      <p
        className={`text-display-sm tabular mt-2 ${accent ? "text-ember-400" : "text-platinum-100"}`}
      >
        {value}
      </p>
    </div>
  );
}
