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

const stats: Stat[] = [
  {
    label: "Forges live",
    value: 5,
    delta: "+1 this week",
    trend: [1, 1, 2, 2, 3, 3, 4, 4, 5],
  },
  {
    label: "Ingots minted",
    value: 7,
    delta: "+2 this week",
    trend: [0, 0, 1, 1, 2, 3, 4, 5, 7],
  },
  {
    label: "Total contributions",
    value: 47,
    delta: "+12 this week",
    trend: [2, 5, 8, 14, 19, 23, 30, 38, 47],
  },
  {
    label: "External Smiths",
    value: 9,
    delta: "+3 this week",
    trend: [0, 1, 1, 2, 3, 4, 6, 7, 9],
  },
  {
    label: "Revenue distributed",
    value: 0.42,
    format: (n) => n.toFixed(2),
    decimals: 2,
    unit: "OG",
    delta: "+0.18 this week",
    trend: [0.01, 0.03, 0.06, 0.1, 0.14, 0.2, 0.27, 0.34, 0.42],
  },
];

export function Dashboard() {
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
              No fake counters. Just live mainnet activity.
            </h2>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Pill tone="positive" dot>
              On-chain · 0G Aristotle
            </Pill>
            <p className="text-caption text-platinum-400">
              Updated &lt; 4s after every event
            </p>
          </div>
        </div>

        <div className="border-hairline mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-lg md:grid-cols-5">
          {stats.map((s, i) => (
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
                {s.delta && (
                  <p className="text-body-sm text-signal-positive tabular mt-2 flex items-center gap-1.5">
                    <Arrow />
                    {s.delta}
                  </p>
                )}
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
            Indexed live from 0G Aristotle events. Sparklines show 9-day rolling
            history; refreshes within four seconds of every on-chain event.
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

function Arrow() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path
        d="M2 7 L7 2 M4 2 L7 2 L7 5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
