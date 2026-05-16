import Link from "next/link";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { Dashboard } from "@/components/marketing/Dashboard";
import { Pill } from "@/components/ui/Pill";
import { getStats } from "@/lib/stats-data";
import { getDashboardDetail, type EventKind } from "@/lib/dashboard-data";
import { explorerAddress, explorerTx, getChain, shortAddr } from "@/lib/chain";

export const metadata = {
  title: "Forge in Public — live mainnet activity",
  description:
    "Real-time on-chain numbers from Foundry on 0G Aristotle mainnet. No simulated counters.",
};

export const revalidate = 10;

const KIND_TONE: Record<EventKind, "ember" | "positive" | "warn" | "neutral"> = {
  ForgeCreated: "ember",
  IngotMinted: "positive",
  ContributionLogged: "neutral",
  RevenueReceived: "warn",
  RevenueClaimed: "positive",
};

const KIND_LABEL: Record<EventKind, string> = {
  ForgeCreated: "Forge",
  IngotMinted: "Ingot",
  ContributionLogged: "Contribution",
  RevenueReceived: "Revenue in",
  RevenueClaimed: "Claim",
};

export default async function DashboardPage() {
  const chain = getChain();
  const [stats, detail] = await Promise.all([
    getStats().catch(() => ({
      forges: 0,
      ingots: 0,
      contributions: 0,
      externalSmiths: 0,
      totalRevenueOG: 0,
      totalClaimedOG: 0,
      lastBlock: 0n,
      isLive: false,
    })),
    getDashboardDetail().catch(() => null),
  ]);

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
            Every figure below is read straight from 0G {chain.network} event logs — the
            activity feed, per-forge rows, and revenue table are all
            explorer-verifiable. Pages revalidate every 10 seconds via Next&apos;s ISR
            cache.
          </p>
          {stats.isLive && (
            <p className="text-mono-sm text-platinum-400 tabular mt-4">
              chain head: block {stats.lastBlock.toString()}
            </p>
          )}
        </div>
      </section>

      <Dashboard stats={{ ...stats, network: chain.network }} />

      {detail?.isLive && (
        <>
          {/* ── Live activity feed ──────────────────────────────── */}
          <section className="border-hairline border-t">
            <div className="mx-auto max-w-[1280px] px-6 py-16">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-caption text-ember-400">Live activity</p>
                  <h2 className="text-display-sm text-platinum-100 mt-3">
                    Every protocol event, newest first
                  </h2>
                </div>
                <p className="text-caption text-platinum-400">
                  {detail.feed.length} events · each row links to its tx
                </p>
              </div>

              <div className="border-hairline mt-8 overflow-hidden rounded-lg border">
                {detail.feed.slice(0, 30).map((e, i) => (
                  <a
                    key={`${e.txHash}-${i}`}
                    href={explorerTx(e.txHash)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="bg-ink-900 hover:bg-ink-800 border-hairline grid grid-cols-[110px_1fr_auto] items-center gap-4 border-b px-5 py-3.5 transition-colors last:border-b-0"
                  >
                    <Pill tone={KIND_TONE[e.kind]} dot>
                      {KIND_LABEL[e.kind]}
                    </Pill>
                    <span className="text-body-sm text-platinum-200 truncate">
                      {e.summary}
                    </span>
                    <span className="text-mono-sm text-platinum-400 tabular whitespace-nowrap">
                      blk {e.block.toString()} ↗
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* ── Forges table ────────────────────────────────────── */}
          <section className="border-hairline border-t">
            <div className="mx-auto max-w-[1280px] px-6 py-16">
              <p className="text-caption text-ember-400">Forges</p>
              <h2 className="text-display-sm text-platinum-100 mt-3">
                {detail.forges.length} forges on 0G {chain.network}
              </h2>

              <div className="border-hairline mt-8 overflow-x-auto rounded-lg border">
                <table className="w-full min-w-[760px] text-left">
                  <thead>
                    <tr className="bg-ink-900 text-caption text-platinum-400">
                      <Th>Forge / model</Th>
                      <Th>Task</Th>
                      <Th>Creator</Th>
                      <Th className="text-right">Contributions</Th>
                      <Th className="text-right">Ingot</Th>
                      <Th className="text-right">Block</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.forges.map((f) => (
                      <tr
                        key={f.address}
                        className="bg-ink-900 border-hairline border-t"
                      >
                        <Td>
                          <Link
                            href={`/forges/${f.address}`}
                            className="text-platinum-100 hover:text-ember-400 transition-colors"
                          >
                            {f.title ?? `Forge ${shortAddr(f.address)}`}
                          </Link>
                          <span className="text-mono-sm text-platinum-500 ml-2">
                            {shortAddr(f.address)}
                          </span>
                        </Td>
                        <Td className="text-platinum-300 capitalize">
                          {f.task ?? "—"}
                        </Td>
                        <Td>
                          <a
                            href={explorerAddress(f.creator)}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-mono-sm text-platinum-400 hover:text-platinum-200"
                          >
                            {shortAddr(f.creator)} ↗
                          </a>
                        </Td>
                        <Td className="text-platinum-200 tabular text-right">
                          {f.contributions}
                        </Td>
                        <Td className="text-platinum-300 tabular text-right">
                          {f.tokenId !== null ? `#${f.tokenId}` : "—"}
                        </Td>
                        <Td className="text-platinum-500 tabular text-right">
                          {f.createdBlock.toString()}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ── Revenue table ───────────────────────────────────── */}
          <section className="border-hairline border-t">
            <div className="mx-auto max-w-[1280px] px-6 py-16">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-caption text-ember-400">Revenue</p>
                  <h2 className="text-display-sm text-platinum-100 mt-3">
                    Per-Ingot revenue, received vs. claimed
                  </h2>
                </div>
                <p className="text-mono-sm text-platinum-400 tabular">
                  {detail.totals.receivedOG.toFixed(4)} OG in ·{" "}
                  {detail.totals.claimedOG.toFixed(4)} OG claimed
                </p>
              </div>

              {detail.revenue.length === 0 ? (
                <p className="text-body-sm text-platinum-400 mt-8">
                  No revenue events yet. This table populates the moment a
                  RevenueSplitter payment lands.
                </p>
              ) : (
                <div className="border-hairline mt-8 overflow-x-auto rounded-lg border">
                  <table className="w-full min-w-[680px] text-left">
                    <thead>
                      <tr className="bg-ink-900 text-caption text-platinum-400">
                        <Th>Ingot</Th>
                        <Th>Model</Th>
                        <Th className="text-right">Received</Th>
                        <Th className="text-right">Protocol fee</Th>
                        <Th className="text-right">Claimed</Th>
                        <Th className="text-right">Payments</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.revenue.map((r) => (
                        <tr
                          key={String(r.tokenId)}
                          className="bg-ink-900 border-hairline border-t"
                        >
                          <Td className="text-platinum-100 tabular">
                            {r.forge ? (
                              <Link
                                href={`/ingots/${r.tokenId}`}
                                className="hover:text-ember-400 transition-colors"
                              >
                                #{r.tokenId.toString()}
                              </Link>
                            ) : (
                              `#${r.tokenId.toString()}`
                            )}
                          </Td>
                          <Td className="text-platinum-300">{r.title ?? "—"}</Td>
                          <Td className="text-platinum-100 tabular text-right">
                            {r.receivedOG.toFixed(4)}
                          </Td>
                          <Td className="text-platinum-400 tabular text-right">
                            {r.feeOG.toFixed(4)}
                          </Td>
                          <Td className="text-signal-positive tabular text-right">
                            {r.claimedOG.toFixed(4)}
                          </Td>
                          <Td className="text-platinum-300 tabular text-right">
                            {r.payments}
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      <Footer />
    </main>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <th className={`px-5 py-3 font-medium ${className}`}>{children}</th>;
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`text-body-sm px-5 py-3.5 ${className}`}>{children}</td>;
}
