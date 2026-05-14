import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { Pill } from "@/components/ui/Pill";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { getSmith, listSmiths, smithTotals, shortAddr } from "@/lib/smiths";

export async function generateStaticParams() {
  return listSmiths().map((s) => ({ address: s.address }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  const smith = getSmith(address);
  if (!smith) return { title: "Smith not found" };
  return {
    title: `${smith.handle} — Foundry Smith`,
    description: smith.bio,
    openGraph: {
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(smith.handle)}&eyebrow=${encodeURIComponent("SMITH · " + shortAddr(smith.address))}&stats=${encodeURIComponent(smith.shares.length + " Ingots held · " + smithTotals(smith).totalEarnedOG.toFixed(3) + " OG earned")}`,
        },
      ],
    },
  };
}

export default async function SmithProfilePage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  const smith = getSmith(address);
  if (!smith) notFound();

  const totals = smithTotals(smith);

  return (
    <main>
      <Header />

      {/* Hero */}
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Link
                href="/smiths"
                className="text-caption text-platinum-400 transition-colors hover:text-platinum-200"
              >
                ← All Smiths
              </Link>
              <p className="text-caption mt-4 text-ember-400">Smith</p>
              <h1 className="text-display-xl mt-3 text-platinum-100">
                {smith.handle}
              </h1>
              <p className="text-body mt-2 font-mono text-platinum-400">
                {smith.address}
              </p>
              <p className="text-body-lg mt-6 max-w-[60ch] text-platinum-300">
                {smith.bio}
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <Pill tone="positive" dot>
                Joined {smith.joinedAt}
              </Pill>
              <a
                href={`https://aristotle.0g.explorer/address/${smith.address}`}
                target="_blank"
                rel="noreferrer noopener"
                className="text-caption text-platinum-400 transition-colors hover:text-platinum-200"
              >
                View on explorer ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-[1280px] px-6 py-12">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border-hairline md:grid-cols-4">
            <Stat label="Ingots held" value={totals.ingotsHeld.toString()} />
            <Stat
              label="Total earned"
              value={`${totals.totalEarnedOG.toFixed(3)} OG`}
            />
            <Stat
              label="Claimable now"
              value={`${totals.totalClaimableOG.toFixed(3)} OG`}
              accent={totals.totalClaimableOG > 0}
            />
            <Stat
              label="Contributions"
              value={totals.contributionsCount.toString()}
            />
          </div>
        </div>
      </section>

      {/* Holdings */}
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <p className="text-caption text-ember-400">Holdings</p>
          <h2 className="text-display-md mt-3 text-platinum-100">
            Shares across {totals.ingotsHeld} Ingots
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {smith.shares.map((share) => (
              <Card key={share.ingotId} className="hover:bg-ink-800/40">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <CardEyebrow>
                      {share.contributionType.toUpperCase()} ·{" "}
                      {share.contributedAt}
                    </CardEyebrow>
                    <CardTitle>
                      <Link
                        href={`/ingots/${share.ingotId}`}
                        className="transition-colors hover:text-ember-300"
                      >
                        {share.ingotName}
                      </Link>
                    </CardTitle>
                    <p className="text-body-sm mt-2 font-mono text-platinum-400">
                      {shortAddr(share.ingotId)}
                    </p>
                  </div>
                  <Pill tone="ember">
                    {(share.shareBps / 100).toFixed(1)}%
                  </Pill>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-hairline pt-4">
                  <div>
                    <p className="text-caption text-platinum-400">Earned</p>
                    <p className="text-title-md mt-1 tabular text-platinum-100">
                      {share.earnedOG.toFixed(3)} OG
                    </p>
                  </div>
                  <div>
                    <p className="text-caption text-platinum-400">
                      Claimable
                    </p>
                    <p
                      className={`text-title-md mt-1 tabular ${share.claimableOG > 0 ? "text-signal-positive" : "text-platinum-100"}`}
                    >
                      {share.claimableOG.toFixed(3)} OG
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Activity */}
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <p className="text-caption text-ember-400">Activity</p>
          <h2 className="text-display-md mt-3 text-platinum-100">
            Recent on-chain activity
          </h2>
          <ol className="mt-8 divide-y divide-ink-800 rounded-lg border-hairline bg-ink-900">
            {smith.recentActivity.map((a, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-6 px-6 py-4"
              >
                <div className="flex items-center gap-4">
                  <ActivityDot kind={a.kind} />
                  <div>
                    <p className="text-body text-platinum-100">{a.label}</p>
                    <p className="text-caption mt-1 text-platinum-400">
                      {a.at}
                    </p>
                  </div>
                </div>
                {a.txHash && (
                  <a
                    href={`https://aristotle.0g.explorer/tx/${a.txHash}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-caption font-mono text-platinum-400 transition-colors hover:text-ember-300"
                  >
                    {a.txHash.slice(0, 10)}… ↗
                  </a>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-ink-900 p-6">
      <p className="text-caption text-platinum-400">{label}</p>
      <p
        className={`text-display-sm mt-2 tabular ${accent ? "text-signal-positive" : "text-platinum-100"}`}
      >
        {value}
      </p>
    </div>
  );
}

function ActivityDot({
  kind,
}: {
  kind: "contribute" | "claim" | "vote";
}) {
  const color =
    kind === "contribute"
      ? "bg-ember-500"
      : kind === "claim"
        ? "bg-signal-positive"
        : "bg-signal-info";
  return <span className={`block size-2 rounded-full ${color}`} />;
}
