"use client";

import { motion } from "motion/react";
import { useMemo } from "react";

export interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  className?: string;
  showLast?: boolean;
}

export function Sparkline({
  values,
  width = 120,
  height = 32,
  stroke = "#ff8a1a",
  fill = "rgba(255,138,26,0.16)",
  className,
  showLast = true,
}: SparklineProps) {
  const { path, area, lastPoint } = useMemo(() => {
    if (values.length === 0) {
      return { path: "", area: "", lastPoint: null };
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const stepX = values.length > 1 ? width / (values.length - 1) : 0;
    const pad = 3;
    const usable = height - pad * 2;

    const points = values.map((v, i) => {
      const x = i * stepX;
      const y = pad + (1 - (v - min) / range) * usable;
      return [x, y] as const;
    });

    const path = points
      .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`)
      .join(" ");

    const area = `${path} L ${(points[points.length - 1][0]).toFixed(2)} ${height} L 0 ${height} Z`;
    return { path, area, lastPoint: points[points.length - 1] };
  }, [values, width, height]);

  if (values.length === 0) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-hidden
    >
      <motion.path
        d={area}
        fill={fill}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      />
      <motion.path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      {showLast && lastPoint && (
        <motion.circle
          cx={lastPoint[0]}
          cy={lastPoint[1]}
          r={2.5}
          fill={stroke}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        />
      )}
    </svg>
  );
}
