"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";

/**
 * LiveCounter — counts up to a value using the platform's motion engine.
 * Used on the dashboard preview and the Forge in Public board.
 */
export function LiveCounter({
  value,
  duration = 1.2,
  format = (n) => n.toLocaleString(),
  className,
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (n) => format(Math.round(n)));

  useEffect(() => {
    const controls = animate(mv, value, {
      duration,
      ease: [0.2, 0.9, 0.3, 1],
    });
    return controls.stop;
  }, [mv, value, duration]);

  return <motion.span className={className}>{text}</motion.span>;
}
