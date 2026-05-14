"use client";

import { motion } from "motion/react";

/**
 * AttributionBloom — the demo wow moment.
 * Renders a list of contributors with their measured Δ as bars that fill
 * from 0 → measured value, staggered 60ms per row.
 */
export interface ContributionRow {
  smith: string;
  type: "data" | "compute" | "capital";
  delta: number; // 0..1 (share of total improvement)
}

const typeColor = {
  data: "var(--ember-500)",
  compute: "var(--ember-400)",
  capital: "var(--ember-300)",
} as const;

export function AttributionBloom({ rows }: { rows: ContributionRow[] }) {
  const total = rows.reduce((s, r) => s + r.delta, 0) || 1;

  return (
    <div className="space-y-3">
      {rows.map((row, i) => {
        const share = (row.delta / total) * 100;
        return (
          <motion.div
            key={row.smith + i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.18 + i * 0.06,
              duration: 0.32,
              ease: [0.32, 0.72, 0, 1],
            }}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-mono-sm text-platinum-400 tabular w-20 shrink-0 truncate">
                {row.smith}
              </span>
              <div className="h-2 flex-1 rounded-pill bg-ink-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${share}%` }}
                  transition={{
                    delay: 0.32 + i * 0.06,
                    duration: 0.6,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                  className="h-full rounded-pill"
                  style={{ background: typeColor[row.type] }}
                />
              </div>
            </div>
            <span
              className="text-caption"
              style={{ color: typeColor[row.type] }}
            >
              {row.type}
            </span>
            <span className="text-body-sm tabular text-platinum-200 w-14 text-right">
              {share.toFixed(1)}%
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
