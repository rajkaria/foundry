"use client";

import { motion } from "motion/react";
import { AttributionBloom } from "@/components/motion/AttributionBloom";
import {
  ForgeOpensIcon,
  ContributionsIcon,
  AttributionIcon,
  OwnershipIcon,
  RevenueIcon,
} from "@/components/motion/StepIcon";
import type { ComponentType } from "react";

interface Step {
  n: string;
  title: string;
  body: string;
  Icon: ComponentType<{ size?: number; className?: string }>;
  accent?: boolean;
}

const steps: Step[] = [
  {
    n: "01",
    title: "A Forge opens",
    body: "Anyone creates a Forge for a model they want trained. Data, compute, and capital are escrowed on-chain.",
    Icon: ForgeOpensIcon,
  },
  {
    n: "02",
    title: "Contributions roll in",
    body: "Smiths contribute datasets to 0G Storage, compute credits, or capital — independent wallets, real value.",
    Icon: ContributionsIcon,
  },
  {
    n: "03",
    title: "Verifiable attribution",
    body: "Inside a TEE on 0G Compute, baseline + contribution is measured against a secret holdout. Marginal delta = your share.",
    Icon: AttributionIcon,
    accent: true,
  },
  {
    n: "04",
    title: "Ownership mints",
    body: "$FORGE-denominated shares mint to contributors proportional to measured marginal contribution. The cap table is on-chain.",
    Icon: OwnershipIcon,
  },
  {
    n: "05",
    title: "Inference routes revenue",
    body: "Any 0G dApp calls the Ingot via the SDK. Payment hits the RevenueSplitter. Owners claim, on-chain, automatically.",
    Icon: RevenueIcon,
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
    <section id="how" className="border-hairline relative border-t py-28">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-caption text-ember-400">How it works</p>
            <h2 className="text-display-lg text-platinum-100 mt-3 max-w-[22ch]">
              A foundry, on-chain. Anyone contributes. Everyone who matters, owns.
            </h2>
          </div>
          <p className="text-body text-platinum-400 max-w-[36ch]">
            Five steps from open call to claimable revenue — each one verifiable on 0G
            mainnet.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-[1.05fr_1fr]">
          {/* Steps */}
          <ol className="relative">
            <motion.span
              aria-hidden
              className="absolute top-6 bottom-6 left-[39px] w-px"
              initial={{ scaleY: 0, originY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "-15% 0px -15% 0px" }}
              transition={{ duration: 1.4, ease: [0.32, 0.72, 0, 1] }}
              style={{
                background:
                  "linear-gradient(to bottom, transparent, var(--ember-700) 8%, var(--ember-500) 50%, var(--ember-700) 92%, transparent)",
                transformOrigin: "top",
              }}
            />
            {steps.map((s, i) => {
              const Icon = s.Icon;
              return (
                <motion.li
                  key={s.n}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.07,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                  className="relative flex gap-6 py-5"
                >
                  <div
                    className={`relative z-10 grid size-20 shrink-0 place-items-center rounded-xl border ${
                      s.accent
                        ? "border-ember-500/60 bg-ember-900/30"
                        : "border-ink-600 bg-ink-900"
                    }`}
                  >
                    <Icon size={44} />
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center gap-3">
                      <span className="text-mono-sm text-ember-400 tabular">{s.n}</span>
                      <h3 className="text-title-lg text-platinum-100">{s.title}</h3>
                    </div>
                    <p className="text-body text-platinum-300 mt-2 max-w-[54ch]">
                      {s.body}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ol>

          {/* The TEE attribution preview — sticky, animated */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="relative h-fit lg:sticky lg:top-24"
          >
            <div className="border-hairline bg-ink-900 elev-2 relative overflow-hidden rounded-xl p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-px"
                style={{
                  background:
                    "radial-gradient(60% 80% at 50% -20%, color-mix(in oklab, var(--ember-500) 18%, transparent), transparent 70%)",
                }}
              />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="text-caption text-platinum-400">
                    TEE attestation · Forge #0042
                  </p>
                  <motion.span
                    className="text-caption text-signal-positive flex items-center gap-1.5"
                    animate={{ opacity: [0.55, 1, 0.55] }}
                    transition={{ duration: 2.4, repeat: Infinity }}
                  >
                    <span className="bg-signal-positive size-1.5 rounded-full" />
                    verified
                  </motion.span>
                </div>
                <h3 className="text-display-sm text-platinum-100 mt-3">
                  Multilingual Translator
                </h3>
                <p className="text-mono-sm text-platinum-400 tabular mt-1">
                  ingot:0x8e2…f4a · baseline 21.4 → 38.7 BLEU
                </p>

                {/* TEE chip diagram */}
                <div className="border-hairline bg-ink-950 mt-6 grid grid-cols-3 gap-2 rounded-md p-3">
                  <Telemetry label="enclave" value="sgx" />
                  <Telemetry label="holdout" value="sealed" />
                  <Telemetry label="quote" value="0x7a3b…91d" />
                </div>

                <div className="mt-8">
                  <p className="text-caption text-platinum-400 mb-4">
                    Marginal Δ by contributor
                  </p>
                  <AttributionBloom rows={sampleRows} />
                </div>

                <div className="border-hairline text-caption mt-8 flex items-center justify-between border-t pt-5">
                  <span className="text-platinum-400">share minted</span>
                  <span className="text-mono-sm text-ember-400 tabular">
                    1,000 $FORGE-0042 → 5 wallets
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Telemetry({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ink-800 rounded-sm px-2.5 py-2">
      <p className="text-platinum-400 text-[10px] tracking-[0.14em] uppercase">
        {label}
      </p>
      <p className="text-mono-sm text-platinum-200 tabular mt-0.5">{value}</p>
    </div>
  );
}
