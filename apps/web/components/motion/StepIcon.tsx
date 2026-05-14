"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * StepIcon — animated SVG icons for the HowItWorks pipeline.
 * Each icon is 64x64, line-based, and animates on view.
 */

interface StepIconProps {
  size?: number;
  className?: string;
}

const stroke = "#ff8a1a";
const fill = "color-mix(in oklab, #ff8a1a 14%, transparent)";

function IconShell({
  children,
  size = 56,
  className,
}: StepIconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-hidden
      className={className}
    >
      {children}
    </svg>
  );
}

const path = {
  initial: { pathLength: 0, opacity: 0 },
  whileInView: { pathLength: 1, opacity: 1 },
};

const tx = (delay = 0) => ({
  initial: { pathLength: 0, opacity: 0 },
  whileInView: { pathLength: 1, opacity: 1 },
  viewport: { once: true, margin: "-20% 0px -20% 0px" },
  transition: {
    duration: 0.8,
    delay,
    ease: [0.32, 0.72, 0, 1] as [number, number, number, number],
  },
});

/** 01 — A Forge opens: a crucible with rising heat lines. */
export function ForgeOpensIcon(props: StepIconProps) {
  return (
    <IconShell {...props}>
      <motion.path
        d="M14 22 L50 22 L46 48 L18 48 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinejoin="round"
        {...tx(0)}
      />
      <motion.path
        d="M22 30 L42 30 M22 36 L42 36 M22 42 L42 42"
        stroke={stroke}
        strokeOpacity="0.6"
        strokeWidth="1.2"
        strokeLinecap="round"
        {...tx(0.25)}
      />
      <motion.path
        d="M24 14 C24 18 28 19 28 14 M32 12 C32 17 36 18 36 12 M40 14 C40 18 44 19 44 14"
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinecap="round"
        {...tx(0.45)}
      />
    </IconShell>
  );
}

/** 02 — Contributions roll in: three streams flow toward a central node. */
export function ContributionsIcon(props: StepIconProps) {
  return (
    <IconShell {...props}>
      <motion.circle
        cx="32"
        cy="32"
        r="6"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.6"
        {...tx(0.4)}
      />
      <motion.path
        d="M8 12 Q22 18 26 28"
        fill="none"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        {...tx(0)}
      />
      <motion.path
        d="M56 12 Q42 18 38 28"
        fill="none"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        {...tx(0.1)}
      />
      <motion.path
        d="M32 56 Q32 44 32 38"
        fill="none"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        {...tx(0.2)}
      />
      {/* Tiny payload squares riding each line */}
      <motion.rect
        x="6"
        y="10"
        width="4"
        height="4"
        fill={stroke}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: [0, 1, 0] }}
        viewport={{ once: true, margin: "-20% 0px -20% 0px" }}
        transition={{ duration: 1.2, delay: 0.6, repeat: Infinity, repeatDelay: 0.8 }}
      />
      <motion.rect
        x="54"
        y="10"
        width="4"
        height="4"
        fill={stroke}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: [0, 1, 0] }}
        viewport={{ once: true, margin: "-20% 0px -20% 0px" }}
        transition={{ duration: 1.2, delay: 0.8, repeat: Infinity, repeatDelay: 0.8 }}
      />
    </IconShell>
  );
}

/** 03 — Verifiable attribution: TEE chip with attestation lock. */
export function AttributionIcon(props: StepIconProps) {
  return (
    <IconShell {...props}>
      <motion.rect
        x="14"
        y="14"
        width="36"
        height="36"
        rx="3"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.6"
        {...tx(0)}
      />
      <motion.path
        d="M14 22 L8 22 M14 30 L8 30 M14 38 L8 38 M14 46 L8 46 M50 22 L56 22 M50 30 L56 30 M50 38 L56 38 M50 46 L56 46"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
        {...tx(0.2)}
      />
      <motion.path
        d="M26 32 L30 36 L40 26"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        {...tx(0.5)}
      />
    </IconShell>
  );
}

/** 04 — Ownership mints: a pie of segments emerging. */
export function OwnershipIcon(props: StepIconProps) {
  return (
    <IconShell {...props}>
      <motion.circle
        cx="32"
        cy="32"
        r="18"
        fill="none"
        stroke={stroke}
        strokeWidth="1.6"
        {...tx(0)}
      />
      <motion.path
        d="M32 14 L32 32 L48 32"
        stroke={stroke}
        strokeWidth="1.6"
        fill={fill}
        {...tx(0.25)}
      />
      <motion.path
        d="M32 32 L48 32 L42 50 Z"
        stroke={stroke}
        strokeWidth="1.6"
        fill="color-mix(in oklab, #ff8a1a 24%, transparent)"
        {...tx(0.4)}
      />
      <motion.path
        d="M32 32 L42 50 L20 46 Z"
        stroke={stroke}
        strokeWidth="1.6"
        fill="color-mix(in oklab, #ff8a1a 9%, transparent)"
        {...tx(0.55)}
      />
    </IconShell>
  );
}

/** 05 — Inference routes revenue: two arrows with a coin in middle. */
export function RevenueIcon(props: StepIconProps) {
  return (
    <IconShell {...props}>
      <motion.path
        d="M8 24 L26 24 L26 18 L36 28 L26 38 L26 32 L8 32 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinejoin="round"
        {...tx(0)}
      />
      <motion.path
        d="M56 40 L38 40 L38 46 L28 36 L38 26 L38 32 L56 32 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinejoin="round"
        {...tx(0.2)}
      />
      <motion.circle
        cx="32"
        cy="32"
        r="4"
        fill={stroke}
        {...tx(0.5)}
      />
    </IconShell>
  );
}
