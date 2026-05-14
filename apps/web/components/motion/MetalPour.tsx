"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Metal Pour — hero signature animation for the isometric Ingot mark.
 *
 * Order:
 *   1. Outline strokes itself in (the rim of the casting).
 *   2. The three facets fade up in order: top → front → side.
 *   3. The "F" channel is engraved on the front face.
 *   4. A specular sweep slides across the top edge.
 *   5. Three ember drips fall through the frame.
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
        transition={{ duration: 0.4 }}
        aria-label="Foundry"
      >
        <defs>
          <linearGradient id="mp-r-front" x1="16" y1="22" x2="32" y2="56">
            <stop offset="0%" stopColor="#ffb260" />
            <stop offset="55%" stopColor="#ff8a1a" />
            <stop offset="100%" stopColor="#a64a00" />
          </linearGradient>
          <linearGradient id="mp-r-top" x1="32" y1="6" x2="32" y2="22">
            <stop offset="0%" stopColor="#fff1d6" />
            <stop offset="100%" stopColor="#ffb260" />
          </linearGradient>
          <linearGradient id="mp-r-side" x1="46" y1="14" x2="58" y2="50">
            <stop offset="0%" stopColor="#e26a00" />
            <stop offset="100%" stopColor="#4a1f00" />
          </linearGradient>
        </defs>
        <path d="M44 14 L56 18 L52 54 L40 50 Z" fill="url(#mp-r-side)" />
        <path d="M20 10 L44 14 L40 22 L18 18 Z" fill="url(#mp-r-top)" />
        <path d="M18 18 L40 22 L40 50 L14 46 Z" fill="url(#mp-r-front)" />
      </motion.svg>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="relative grid place-items-center"
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, #ff8a1a 28%, transparent), transparent 70%)",
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0, 1, 0.65], scale: [0.8, 1.05, 1] }}
        transition={{ duration: 2.2, ease: [0.32, 0.72, 0, 1] }}
      />

      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        aria-label="Foundry"
        className="relative"
      >
        <defs>
          <linearGradient id="mp-front" x1="16" y1="22" x2="32" y2="56">
            <stop offset="0%" stopColor="#ffb260" />
            <stop offset="55%" stopColor="#ff8a1a" />
            <stop offset="100%" stopColor="#a64a00" />
          </linearGradient>
          <linearGradient id="mp-top" x1="32" y1="6" x2="32" y2="22">
            <stop offset="0%" stopColor="#fff1d6" />
            <stop offset="100%" stopColor="#ffb260" />
          </linearGradient>
          <linearGradient id="mp-side" x1="46" y1="14" x2="58" y2="50">
            <stop offset="0%" stopColor="#e26a00" />
            <stop offset="100%" stopColor="#4a1f00" />
          </linearGradient>
          <linearGradient id="mp-sweep" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fff8e8" stopOpacity="0" />
            <stop offset="50%" stopColor="#fff8e8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#fff8e8" stopOpacity="0" />
          </linearGradient>
          <filter id="mp-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="mp-top-clip">
            <path d="M20 10 L44 14 L40 22 L18 18 Z" />
          </clipPath>
        </defs>

        {/* 1. Silhouette outline strokes in */}
        <motion.path
          d="M20 10 L44 14 L56 18 L52 54 L40 50 L14 46 L18 18 Z"
          fill="none"
          stroke="#ff8a1a"
          strokeWidth="0.8"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        />

        {/* 2a. Side facet pours in */}
        <motion.path
          d="M44 14 L56 18 L52 54 L40 50 Z"
          fill="url(#mp-side)"
          initial={{ opacity: 0, x: 4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.55, ease: [0.32, 0.72, 0, 1] }}
          filter="url(#mp-glow)"
        />

        {/* 2b. Top facet */}
        <motion.path
          d="M20 10 L44 14 L40 22 L18 18 Z"
          fill="url(#mp-top)"
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7, ease: [0.32, 0.72, 0, 1] }}
        />

        {/* 2c. Front facet */}
        <motion.path
          d="M18 18 L40 22 L40 50 L14 46 Z"
          fill="url(#mp-front)"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.82, ease: [0.32, 0.72, 0, 1] }}
        />

        {/* 3. Engraved "F" channel */}
        <motion.path
          d="M22 24 L34 26 L34 28.5 L25 27 L25 32 L31.5 33 L31.5 35.5 L25 34.4 L25 42 L22 41.4 Z"
          fill="#fff1d6"
          fillOpacity="0.18"
          stroke="#4a1f00"
          strokeOpacity="0.55"
          strokeWidth="0.9"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.15, ease: [0.32, 0.72, 0, 1] }}
        />

        {/* 4. Specular sweep across the top facet */}
        <g clipPath="url(#mp-top-clip)">
          <motion.rect
            x="-30"
            y="8"
            width="30"
            height="16"
            fill="url(#mp-sweep)"
            initial={{ x: -30 }}
            animate={{ x: 60 }}
            transition={{ duration: 0.9, delay: 1.4, ease: [0.32, 0.72, 0, 1] }}
          />
        </g>

        {/* 5. Final rim re-asserted */}
        <motion.path
          d="M20 10 L44 14 L56 18 L52 54 L40 50 L14 46 L18 18 Z"
          fill="none"
          stroke="#4a1f00"
          strokeOpacity="0.7"
          strokeWidth="0.85"
          strokeLinejoin="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.6 }}
        />

        {/* Spark at the molten core */}
        <motion.circle
          cx="33"
          cy="37"
          r="1.2"
          fill="#fff8e8"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0.7, 1], scale: [0, 1.6, 1, 1] }}
          transition={{ duration: 1.4, delay: 1.7 }}
        />
      </svg>

      <Drip delay={0.0} x={-10} />
      <Drip delay={0.14} x={3} />
      <Drip delay={0.28} x={-3} />
    </div>
  );
}

function Drip({ delay, x }: { delay: number; x: number }) {
  return (
    <motion.span
      aria-hidden
      className="bg-ember-400 absolute top-0 left-1/2 size-1 rounded-full"
      style={{ filter: "blur(0.5px)" }}
      initial={{ y: -40, x, opacity: 0 }}
      animate={{ y: 90, x, opacity: [0, 1, 1, 0] }}
      transition={{
        duration: 0.8,
        delay,
        times: [0, 0.1, 0.85, 1],
        ease: [0.6, 0, 1, 0.4],
      }}
    />
  );
}
