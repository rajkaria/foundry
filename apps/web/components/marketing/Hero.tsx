"use client";

import { motion } from "motion/react";
import { LinkButton } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { MetalPour } from "@/components/motion/MetalPour";
import { EmberField } from "@/components/motion/EmberField";
import { GridBackdrop } from "@/components/motion/GridBackdrop";

const fade = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

const stack = [
  { label: "0G Storage", note: "data" },
  { label: "0G Compute", note: "TEE" },
  { label: "0G Chain", note: "mint" },
  { label: "Agent ID", note: "trust" },
  { label: "SDK", note: "infer" },
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Ambient layered backdrop */}
      <GridBackdrop size={64} opacity={0.32} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-32 h-[720px]"
        style={{ background: "var(--wash-ember)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[320px]"
        style={{ background: "var(--wash-platinum)" }}
      />
      <EmberField count={42} />

      <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-12 px-6 py-24 md:grid-cols-[1.15fr_1fr] md:py-32 lg:py-40">
        {/* Left: copy */}
        <div>
          <motion.div
            initial={fade.initial}
            animate={fade.animate}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          >
            <Pill tone="ember" dot>
              Live on 0G Aristotle mainnet
            </Pill>
          </motion.div>

          <motion.h1
            initial={fade.initial}
            animate={fade.animate}
            transition={{
              duration: 0.7,
              delay: 0.08,
              ease: [0.32, 0.72, 0, 1],
            }}
            className="text-display-xxl text-platinum-100 mt-6 max-w-[20ch]"
          >
            Co&#8209;own the models
            <span className="block">
              you{" "}
              <span className="text-serif-display text-ember-300 align-baseline">
                help create
              </span>
              .
            </span>
          </motion.h1>

          <motion.p
            initial={fade.initial}
            animate={fade.animate}
            transition={{
              duration: 0.6,
              delay: 0.2,
              ease: [0.32, 0.72, 0, 1],
            }}
            className="text-body-lg text-platinum-300 mt-7 max-w-[58ch]"
          >
            Foundry is the supply-side protocol for 0G. Pool data, compute, and capital.
            Co-train an AI model. Own a verifiable, revenue-generating share — minted on
            mainnet, attributed inside a TEE.
          </motion.p>

          <motion.div
            initial={fade.initial}
            animate={fade.animate}
            transition={{
              duration: 0.6,
              delay: 0.32,
              ease: [0.32, 0.72, 0, 1],
            }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <LinkButton href="/forges" size="lg" variant="primary">
              Explore active Forges
            </LinkButton>
            <LinkButton href="/build-on-foundry" size="lg" variant="secondary">
              Build on Foundry
            </LinkButton>
          </motion.div>

          {/* Stack chips with animation */}
          <motion.ul
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.05, delayChildren: 0.55 } },
            }}
            className="mt-12 flex flex-wrap items-center gap-2"
          >
            {stack.map((s) => (
              <motion.li
                key={s.label}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                className="rounded-pill border-hairline bg-ink-900/60 flex items-center gap-2 px-3 py-1.5 backdrop-blur"
              >
                <span className="bg-ember-500 size-1 rounded-full" />
                <span className="text-mono-sm text-platinum-200">{s.label}</span>
                <span className="text-mono-sm text-platinum-400">·</span>
                <span className="text-mono-sm text-platinum-400">{s.note}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* Right: the mark, framed with on-chain telemetry */}
        <div className="relative grid place-items-center">
          <motion.div
            aria-hidden
            className="absolute inset-0 -z-10 rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, color-mix(in oklab, var(--ember-500) 18%, transparent), transparent 70%)",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.4 }}
          />

          {/* Orbit ring */}
          <motion.svg
            width="360"
            height="360"
            viewBox="0 0 360 360"
            className="pointer-events-none absolute"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            <defs>
              <linearGradient id="orbit-stroke" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ff8a1a" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#ff8a1a" stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.circle
              cx="180"
              cy="180"
              r="150"
              fill="none"
              stroke="url(#orbit-stroke)"
              strokeWidth="1"
              strokeDasharray="4 6"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "180px 180px" }}
            />
            <circle
              cx="180"
              cy="180"
              r="120"
              fill="none"
              stroke="#1d2129"
              strokeWidth="1"
            />
          </motion.svg>

          <MetalPour size={280} />

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.85 }}
            className="mt-10 flex flex-col items-center gap-2"
          >
            <p className="text-caption text-platinum-400">
              The Ingot &middot; a co-owned model on-chain
            </p>
            <p className="text-mono-sm text-platinum-300 tabular">
              ingot:0x8e2…f4a &middot;{" "}
              <span className="text-signal-positive">attested</span>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
