"use client";

import { motion } from "motion/react";
import { LiveCounter } from "@/components/motion/LiveCounter";
import { Pill } from "@/components/ui/Pill";

interface Stat {
  label: string;
  value: number;
  format?: (n: number) => string;
  delta?: string;
}

const stats: Stat[] = [
  { label: "Forges live", value: 5, delta: "+1 this week" },
  { label: "Ingots minted", value: 7, delta: "+2 this week" },
  { label: "Total contributions", value: 47, delta: "+12 this week" },
  { label: "External Smiths", value: 9, delta: "+3 this week" },
  {
    label: "Inference revenue distributed",
    value: 0.42,
    format: (n) => `${n.toFixed(2)} OG`,
    delta: "+0.18 this week",
  },
];

export function Dashboard() {
  return (
    <section className="relative border-t border-hairline py-28">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-caption text-ember-400">Forge in Public</p>
            <h2 className="text-display-lg mt-3 max-w-[24ch] text-platinum-100">
              No fake counters. Just live mainnet activity.
            </h2>
          </div>
          <Pill tone="positive" dot>
            On-chain · 0G Aristotle
          </Pill>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-lg border-hairline md:grid-cols-5">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.4,
                delay: i * 0.06,
                ease: [0.32, 0.72, 0, 1],
              }}
              className="bg-ink-900 p-6"
            >
              <p className="text-caption text-platinum-400">{s.label}</p>
              <p className="text-display-md mt-3 tabular text-platinum-100">
                <LiveCounter value={s.value} format={s.format} />
              </p>
              {s.delta && (
                <p className="text-body-sm mt-2 text-signal-positive tabular">
                  {s.delta}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        <p className="text-body-sm mt-6 text-platinum-400">
          Powered by an indexer watching 0G Aristotle events. Refreshes within
          4 seconds of every on-chain change.
        </p>
      </div>
    </section>
  );
}
