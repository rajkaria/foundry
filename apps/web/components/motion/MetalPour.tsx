"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Metal Pour — the landing hero signature animation.
 *
 * The Ingot mark assembles by molten metal pouring from offscreen-top
 * into the silhouette: outline strokes, ember fill rises inside-out,
 * specular highlight sweeps at the end. ~1.4s total. Runs once on mount.
 *
 * On `prefers-reduced-motion`, the mark crossfades instead.
 */
export function MetalPour({ size = 220 }: { size?: number }) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.32 }}
        aria-label="Foundry"
      >
        <defs>
          <linearGradient id="mp-static-ember" x1="32" y1="6" x2="32" y2="58">
            <stop offset="0%" stopColor="#ffd9a6" />
            <stop offset="38%" stopColor="#ff8a1a" />
            <stop offset="100%" stopColor="#a64a00" />
          </linearGradient>
        </defs>
        <path d="M18 8 L46 8 L54 54 L10 54 Z" fill="url(#mp-static-ember)" />
      </motion.svg>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="relative grid place-items-center"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        aria-label="Foundry"
      >
        <defs>
          {/* Vertical ember gradient — fill rises bottom→top */}
          <linearGradient id="mp-ember" x1="32" y1="6" x2="32" y2="58">
            <stop offset="0%" stopColor="#ffd9a6" />
            <stop offset="38%" stopColor="#ff8a1a" />
            <stop offset="100%" stopColor="#a64a00" />
          </linearGradient>

          {/* Reveal mask — animates from bottom to top */}
          <clipPath id="mp-clip">
            <motion.rect
              x="0"
              y="0"
              width="64"
              height="64"
              initial={{ y: 64, height: 0 }}
              animate={{ y: 8, height: 56 }}
              transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1], delay: 0.45 }}
              transform-origin="32 56"
            />
          </clipPath>

          {/* Specular highlight gradient */}
          <linearGradient id="mp-spec" x1="32" y1="6" x2="32" y2="20">
            <stop offset="0%" stopColor="#fff8e8" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#fff8e8" stopOpacity="0" />
          </linearGradient>

          {/* Soft outer glow */}
          <filter id="mp-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. The outline strokes itself in first */}
        <motion.path
          d="M18 8 L46 8 L54 54 L10 54 Z"
          fill="none"
          stroke="#ff8a1a"
          strokeWidth="0.8"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        />

        {/* 2. The ember pours in, clipped to the rising rectangle */}
        <g clipPath="url(#mp-clip)" filter="url(#mp-glow)">
          <path d="M18 8 L46 8 L54 54 L10 54 Z" fill="url(#mp-ember)" />
        </g>

        {/* 3. Specular highlight sweeps after fill completes */}
        <motion.path
          d="M18 8 L46 8 L44 14 L20 14 Z"
          fill="url(#mp-spec)"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 1.25 }}
        />

        {/* 4. Engraved rim, drawn last */}
        <motion.path
          d="M18 8 L46 8 L54 54 L10 54 Z"
          fill="none"
          stroke="#4a1f00"
          strokeOpacity="0.6"
          strokeWidth="0.8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.35 }}
        />
      </svg>

      {/* Ember pour drips above the mark — three flecks */}
      <Drip delay={0.0} x={-8} />
      <Drip delay={0.12} x={4} />
      <Drip delay={0.24} x={-2} />
    </div>
  );
}

function Drip({ delay, x }: { delay: number; x: number }) {
  return (
    <motion.span
      aria-hidden
      className="absolute top-0 left-1/2 size-1 rounded-full bg-ember-400"
      style={{ filter: "blur(0.4px)" }}
      initial={{ y: -40, x, opacity: 0 }}
      animate={{ y: 80, x, opacity: [0, 1, 1, 0] }}
      transition={{
        duration: 0.7,
        delay,
        times: [0, 0.1, 0.85, 1],
        ease: [0.6, 0, 1, 0.4],
      }}
    />
  );
}
