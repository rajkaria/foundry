"use client";

import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";

/**
 * EmberField — ambient background of slowly drifting ember motes.
 *
 * Pure SVG, GPU-cheap. Each mote is a soft radial dot that translates on
 * a deterministic seeded path, looping. Reduced motion → static distribution.
 */
export function EmberField({
  count = 38,
  className,
}: {
  count?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  const motes = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const rand = (offset: number) =>
        // deterministic pseudo-random — stable across renders
        ((Math.sin(i * 12.9898 + offset) * 43758.5453) % 1 + 1) % 1;
      return {
        id: i,
        x: rand(1) * 100,
        y: rand(2) * 100,
        size: 0.6 + rand(3) * 2.2,
        opacity: 0.25 + rand(4) * 0.55,
        drift: 20 + rand(5) * 40,
        duration: 18 + rand(6) * 22,
        delay: rand(7) * -20,
      };
    });
  }, [count]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {motes.map((m) => (
        <motion.span
          key={m.id}
          className="absolute rounded-full bg-ember-400"
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: m.size,
            height: m.size,
            opacity: m.opacity,
            filter: "blur(0.6px)",
            boxShadow: "0 0 6px rgba(255,138,26,0.55)",
          }}
          initial={false}
          animate={
            reduced
              ? undefined
              : {
                  y: [0, -m.drift, 0],
                  opacity: [m.opacity, m.opacity * 0.4, m.opacity],
                }
          }
          transition={{
            duration: m.duration,
            delay: m.delay,
            repeat: Infinity,
            ease: [0.4, 0, 0.6, 1],
          }}
        />
      ))}
    </div>
  );
}
