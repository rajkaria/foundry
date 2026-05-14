"use client";

import { motion } from "motion/react";
import { Pill } from "@/components/ui/Pill";

interface Row {
  item: string;
  status: "real" | "roadmap";
  note?: string;
}

const rows: Row[] = [
  { item: "6 contracts on 0G Aristotle mainnet", status: "real" },
  { item: "Verifiable LOO attribution inside a TEE", status: "real" },
  { item: "$FORGE-denominated proportional ownership minting", status: "real" },
  { item: "RevenueSplitter — pull-payment claims", status: "real" },
  {
    item: "@foundryprotocol/sdk on npm + Vercel AI SDK / LangChain / OpenAI-compat adapters",
    status: "real",
  },
  { item: "Lineage Graph — visual on-chain family tree", status: "real" },
  { item: "Forge in Public dashboard with live mainnet numbers", status: "real" },
  {
    item: "Shapley / influence-function attribution",
    status: "roadmap",
    note: "Documented v2 method.",
  },
  {
    item: "Forge governance via $FORGE",
    status: "roadmap",
    note: "Post-hackathon Month 1.",
  },
  {
    item: "Secondary market for Ingot shares",
    status: "roadmap",
    note: "Post-hackathon Month 3.",
  },
  {
    item: "Reputation-weighted contribution caps",
    status: "roadmap",
    note: "Wallet-level caps only at hackathon.",
  },
  {
    item: "Full external audit",
    status: "roadmap",
    note: "Informal review at submission; full audit Month 1.",
  },
];

export function RealVsRoadmap() {
  return (
    <section className="relative border-t border-hairline py-28">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-caption text-ember-400">Honesty as a feature</p>
            <h2 className="text-display-lg mt-3 max-w-[22ch] text-platinum-100">
              Every feature is either real on mainnet, or declared as roadmap.
            </h2>
            <p className="text-body-lg mt-6 max-w-[58ch] text-platinum-300">
              We refuse to blur the line. This table is the source of truth —
              mirrored on the dashboard and the README. Updated every release.
            </p>
          </div>
        </div>

        <div className="mt-12 overflow-hidden rounded-lg border-hairline">
          {rows.map((r, i) => (
            <motion.div
              key={r.item}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.32, delay: Math.min(i * 0.03, 0.4) }}
              className="grid grid-cols-[auto_1fr] items-center gap-6 border-b border-hairline bg-ink-900 px-6 py-4 last:border-b-0 md:grid-cols-[140px_1fr_auto]"
            >
              <Pill
                tone={r.status === "real" ? "positive" : "warn"}
                dot
                className="w-fit"
              >
                {r.status === "real" ? "Real" : "Roadmap"}
              </Pill>
              <p className="text-body text-platinum-100">{r.item}</p>
              {r.note && (
                <p className="hidden text-body-sm text-platinum-400 md:block">
                  {r.note}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
