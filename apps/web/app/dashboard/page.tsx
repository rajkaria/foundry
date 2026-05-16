import Link from "next/link";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { Dashboard } from "@/components/marketing/Dashboard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EventRow } from "@/components/ui/EventRow";
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
      <section className="bg-stage border-hairline glow-ember border-t">
        <div className="mx-auto max-w-[1280px] px-6 py-20">
          <p className="text-caption text-ember-400 flex items-center gap-2">
            <span className="bg-ember-500/70 inline-block h-px w-6" />
            Forge in Public
          </p>
          <h1 className="text-display-xl text-platinum-100 mt-4 max-w-[24ch] text-balance">
            Real numbers, on mainnet, <span className="sheen-ember">ticking live.</span>
          </h1>
          <p className="text-body-lg text-platinum-300 mt-6 max-w-[60ch]">
            Every figure below is read straight from 0G {chain.network} event logs — the
            activity feed, per-forge rows, and revenue table are all
            explorer-verifiable. Pages revalidate every 10 seconds via Next&apos;s ISR
            cache.
          </p>
          {stats.isLive && (
            <p className="text-mono-sm text-platinum-400 tabular mt-5 inline-flex items-center gap-2">
              <span className="text-signal-positive pulse-dot inline-block size-1.5 rounded-full bg-current" />
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
              <SectionHeader
                eyebrow="Live activity"
                title="Every protocol event, newest first"
                meta={`${detail.feed.length} events · each row links to its tx`}
              />

              <div className="surface-forged mt-8 overflow-hidden rounded-lg">
                {detail.feed.slice(0, 30).map((e, i) => (
                  <EventRow
                    key={`${e.txHash}-${i}`}
                    href={explorerTx(e.txHash)}
                    tone={KIND_TONE[e.kind]}
                    label={KIND_LABEL[e.kind]}
                    summary={e.summary}
                    meta={`blk ${e.block.toString()}`}
                    pulse={i < 3}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* ── Forges table ────────────────────────────────────── */}
          <section className="border-hairline border-t">
            <div className="mx-auto max-w-[1280px] px-6 py-16">
              <SectionHeader
                eyebrow="Forges"
                title={`${detail.forges.length} forges on 0G ${chain.network}`}
              />

              <div className="surface-forged mt-8 overflow-x-auto rounded-lg">
                <table className="w-full min-w-[760px] text-left">
                  <thead>
                    <tr className="text-caption text-platinum-400 border-hairline border-b">
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
                        className="border-hairline hover:bg-ink-800/60 border-t transition-colors"
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
              <SectionHeader
                eyebrow="Revenue"
                title="Per-Ingot revenue, received vs. claimed"
                meta={
                  <span className="text-mono-sm tabular">
                    <span className="sheen-ember font-semibold">
                      {detail.totals.receivedOG.toFixed(4)} OG
                    </span>{" "}
                    in · {detail.totals.claimedOG.toFixed(4)} OG claimed
                  </span>
                }
              />

              {detail.revenue.length === 0 ? (
                <p className="text-body-sm text-platinum-400 mt-8">
                  No revenue events yet. This table populates the moment a
                  RevenueSplitter payment lands.
                </p>
              ) : (
                <div className="surface-forged mt-8 overflow-x-auto rounded-lg">
                  <table className="w-full min-w-[680px] text-left">
                    <thead>
                      <tr className="text-caption text-platinum-400 border-hairline border-b">
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
                          className="border-hairline hover:bg-ink-800/60 border-t transition-colors"
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
