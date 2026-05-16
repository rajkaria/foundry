"use client";

import { motion } from "motion/react";
import { LiveCounter } from "@/components/motion/LiveCounter";
import { Sparkline } from "@/components/motion/Sparkline";
import { Pill } from "@/components/ui/Pill";

interface Stat {
  label: string;
  value: number;
  format?: (n: number) => string;
  decimals?: number;
  delta?: string;
  trend: number[];
  unit?: string;
}

export interface DashboardProps {
  /** Pre-fetched protocol stats from the server. */
  stats: {
    forges: number;
    ingots: number;
    contributions: number;
    externalSmiths: number;
    totalRevenueOG: number;
    totalClaimedOG: number;
    isLive: boolean;
    network: string;
  };
}

function buildRows(s: DashboardProps["stats"]): Stat[] {
  // Sparklines are tail-pads of the current value — once the indexer grows
  // per-day buckets, we'll thread them in. Until then, the live integer is
  // honest and the visual remains intact.
  const trendOf = (v: number): number[] =>
    Array.from({ length: 9 }, (_, i) => Math.max(0, Math.round((v * (i + 1)) / 9)));
  return [
    { label: "Forges live", value: s.forges, trend: trendOf(s.forges) },
    { label: "Ingots minted", value: s.ingots, trend: trendOf(s.ingots) },
    {
      label: "Total contributions",
      value: s.contributions,
      trend: trendOf(s.contributions),
    },
    {
      label: "External Smiths",
      value: s.externalSmiths,
      trend: trendOf(s.externalSmiths),
    },
    {
      label: "Revenue distributed",
      value: s.totalRevenueOG,
      format: (n) => n.toFixed(2),
      decimals: 2,
      unit: "OG",
      trend: trendOf(s.totalRevenueOG),
    },
  ];
}

export function Dashboard({ stats }: DashboardProps) {
  const rows = buildRows(stats);
  const hasActivity =
    stats.forges +
      stats.ingots +
      stats.contributions +
      stats.externalSmiths +
      stats.totalRevenueOG >
    0;

  return (
    <section className="border-hairline relative border-t py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, color-mix(in oklab, var(--ember-900) 18%, transparent), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1280px] px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-caption text-ember-400">Forge in Public</p>
            <h2 className="text-display-lg text-platinum-100 mt-3 max-w-[24ch]">
              {!stats.isLive
                ? "Live numbers ship the moment contracts deploy."
                : hasActivity
                  ? "No fake counters. Just live mainnet activity."
                  : "Contracts are live. Zero is the honest number — for now."}
            </h2>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Pill tone={stats.isLive ? "positive" : "warn"} dot>
              {stats.isLive
                ? `On-chain · 0G ${stats.network}`
                : "Contracts pending deploy"}
            </Pill>
            <p className="text-caption text-platinum-400">
              {stats.isLive
                ? "Updated < 4s after every event"
                : "Counts will populate from chain logs"}
            </p>
          </div>
        </div>

        <div className="border-hairline mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-lg md:grid-cols-5">
          {rows.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.5,
                delay: i * 0.08,
                ease: [0.32, 0.72, 0, 1],
              }}
              className="group bg-ink-900 hover:bg-ink-800 relative flex flex-col justify-between gap-3 p-6 transition-colors"
            >
              <div>
                <p className="text-caption text-platinum-400">{s.label}</p>
                <p className="text-display-md tabular text-platinum-100 mt-4 flex items-baseline gap-1">
                  <LiveCounter
                    value={s.value}
                    format={s.format}
                    decimals={s.decimals}
                    duration={1.8}
                  />
                  {s.unit && (
                    <span className="text-title-md text-platinum-400">{s.unit}</span>
                  )}
                </p>
              </div>
              <Sparkline values={s.trend} width={140} height={36} className="-mb-1" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-between gap-3"
        >
          <p className="text-body-sm text-platinum-400">
            {!stats.isLive
              ? "These tiles surface counts from the contract event logs. Deploy the protocol to populate them."
              : hasActivity
                ? "Indexed live from 0G mainnet events. Sparklines stretch toward the current value until per-day buckets ship."
                : "Every tile reads contract event logs directly — so it stays at zero until a real on-chain forge moves it. No seeded demo numbers, ever."}
          </p>
          <a
            href="/dashboard"
            className="text-caption text-ember-400 hover:text-ember-300 transition-colors"
          >
            View full dashboard →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
