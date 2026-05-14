"use client";

import { motion } from "motion/react";
import { AttributionBloom } from "@/components/motion/AttributionBloom";

const steps = [
  {
    n: "01",
    title: "A Forge opens",
    body:
      "Anyone creates a Forge for a model they want trained. Data, compute, and capital are escrowed on-chain.",
  },
  {
    n: "02",
    title: "Contributions roll in",
    body:
      "Smiths contribute datasets to 0G Storage, compute credits, or capital — independent wallets, real value.",
  },
  {
    n: "03",
    title: "Verifiable attribution",
    body:
      "Inside a TEE on 0G Compute, baseline + contribution is measured against a secret holdout. Marginal delta = your share.",
    accent: true,
  },
  {
    n: "04",
    title: "Ownership mints",
    body:
      "$FORGE-denominated shares mint to contributors proportional to measured marginal contribution. The cap table is on-chain.",
  },
  {
    n: "05",
    title: "Inference routes revenue",
    body:
      "Any 0G dApp calls the Ingot via the SDK. Payment hits the RevenueSplitter. Owners claim, on-chain, automatically.",
  },
];

const sampleRows = [
  { smith: "0x8e…a2", type: "data" as const, delta: 0.42 },
  { smith: "0xb1…9f", type: "data" as const, delta: 0.21 },
  { smith: "0x44…0c", type: "compute" as const, delta: 0.18 },
  { smith: "0x7c…d3", type: "capital" as const, delta: 0.12 },
  { smith: "0x2a…15", type: "data" as const, delta: 0.07 },
];

export function HowItWorks() {
  return (
    <section
      id="how"
      className="relative border-t border-hairline py-28"
    >
      <div className="mx-auto max-w-[1280px] px-6">
        <p className="text-caption text-ember-400">How it works</p>
        <h2 className="text-display-lg mt-3 max-w-[20ch] text-platinum-100">
          A foundry, on-chain. Anyone contributes. Everyone who matters, owns.
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr]">
          {/* Steps */}
          <ol className="relative">
            <span
              aria-hidden
              className="absolute left-[26px] top-2 bottom-2 w-px bg-hairline"
              style={{
                background:
                  "linear-gradient(to bottom, transparent, var(--ink-600) 12%, var(--ink-600) 88%, transparent)",
              }}
            />
            {steps.map((s, i) => (
              <motion.li
                key={s.n}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.06,
                  ease: [0.32, 0.72, 0, 1],
                }}
                className="relative flex gap-6 py-6"
              >
                <div
                  className={`relative z-10 grid size-13 shrink-0 place-items-center rounded-full border ${
                    s.accent
                      ? "border-ember-500/60 bg-ember-900/40 text-ember-300"
                      : "border-ink-600 bg-ink-900 text-platinum-300"
                  }`}
                  style={{ width: 52, height: 52 }}
                >
                  <span className="text-mono">{s.n}</span>
                </div>
                <div className="pt-1">
                  <h3 className="text-title-lg text-platinum-100">{s.title}</h3>
                  <p className="text-body mt-2 max-w-[52ch] text-platinum-300">
                    {s.body}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>

          {/* The TEE attribution preview */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="relative rounded-xl border-hairline bg-ink-900 p-8 elev-2"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-px rounded-xl"
              style={{
                background:
                  "radial-gradient(60% 80% at 50% -20%, color-mix(in oklab, var(--ember-500) 14%, transparent), transparent 70%)",
              }}
            />
            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="text-caption text-platinum-400">
                  TEE attestation · Forge #0042
                </p>
                <span className="text-caption text-signal-positive">
                  ● verified
                </span>
              </div>
              <h3 className="text-display-sm mt-3 text-platinum-100">
                Konkani Translator
              </h3>
              <p className="text-mono-sm mt-1 text-platinum-400 tabular">
                ingot:0x8e2…f4a · baseline 21.4 → 38.7 BLEU
              </p>

              <div className="mt-8">
                <AttributionBloom rows={sampleRows} />
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-hairline pt-5 text-caption">
                <span className="text-platinum-400">attestation</span>
                <span className="text-mono-sm text-platinum-200 tabular">
                  sgx · 0x7a3b4c…91d
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
