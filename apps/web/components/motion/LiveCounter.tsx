"use client";

import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef } from "react";

/**
 * LiveCounter — counts up to a value, scroll-triggered.
 *
 * The animation kicks off the first time the element enters the viewport.
 * On `prefers-reduced-motion`, the final value is rendered immediately.
 */
export function LiveCounter({
  value,
  duration = 1.6,
  format = (n) => n.toLocaleString(),
  className,
  decimals,
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px -15% 0px" });
  const mv = useMotionValue(0);
  const text = useTransform(mv, (n) =>
    format(decimals != null ? Number(n.toFixed(decimals)) : Math.round(n))
  );

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [mv, value, duration, inView]);

  return (
    <motion.span ref={ref} className={className}>
      {text}
    </motion.span>
  );
}
