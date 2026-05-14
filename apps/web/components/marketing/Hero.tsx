"use client";

import { motion } from "motion/react";
import { LinkButton } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { MetalPour } from "@/components/motion/MetalPour";

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden grain">
      {/* Ambient washes */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-32 h-[640px]"
        style={{ background: "var(--wash-ember)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[300px]"
        style={{ background: "var(--wash-platinum)" }}
      />

      <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-12 px-6 py-24 md:grid-cols-[1.2fr_1fr] md:py-32 lg:py-40">
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
              duration: 0.6,
              delay: 0.08,
              ease: [0.32, 0.72, 0, 1],
            }}
            className="text-display-xxl mt-6 max-w-[18ch] text-platinum-100"
          >
            Co&#8209;own the models you help create.
          </motion.h1>

          <motion.p
            initial={fade.initial}
            animate={fade.animate}
            transition={{
              duration: 0.6,
              delay: 0.18,
              ease: [0.32, 0.72, 0, 1],
            }}
            className="text-body-lg mt-6 max-w-[58ch] text-platinum-300"
          >
            Foundry is the supply-side protocol for 0G. Pool data, compute,
            and capital. Co-train an AI model. Own a verifiable, revenue-
            generating share — minted on mainnet, attributed inside a TEE.
          </motion.p>

          <motion.div
            initial={fade.initial}
            animate={fade.animate}
            transition={{
              duration: 0.6,
              delay: 0.28,
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

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center gap-6 text-caption text-platinum-400"
          >
            <span>0G Storage</span>
            <Dot />
            <span>0G Compute</span>
            <Dot />
            <span>0G Chain</span>
            <Dot />
            <span>Agent ID</span>
            <Dot />
            <span>TEE</span>
          </motion.div>
        </div>

        {/* Right: the mark with metal-pour */}
        <div className="relative grid place-items-center">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, color-mix(in oklab, var(--ember-500) 14%, transparent), transparent 70%)",
            }}
          />
          <MetalPour size={260} />
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.55 }}
            className="text-caption mt-8 text-platinum-400"
          >
            The Ingot — a co-owned model on-chain.
          </motion.p>
        </div>
      </div>
    </section>
  );
}

function Dot() {
  return <span className="size-1 rounded-full bg-platinum-400/40" />;
}
