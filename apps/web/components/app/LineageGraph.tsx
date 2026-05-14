"use client";

import { motion } from "motion/react";
import { useMemo } from "react";

export interface LineageNode {
  id: string;
  name: string;
  shares?: number;
  parent?: string;
}

interface Layout {
  id: string;
  name: string;
  cx: number;
  cy: number;
  isRoot: boolean;
}

/**
 * Lineage Graph — visual on-chain family tree of every Ingot.
 *
 * Sprint 2 ships a clean radial tree layout (no force simulation yet) so the
 * graph is screenshot-ready from the first Ingot. Sprint 3 swaps in
 * d3-force for n-of-N node layouts.
 */
export function LineageGraph({
  nodes,
  width = 720,
  height = 540,
}: {
  nodes: LineageNode[];
  width?: number;
  height?: number;
}) {
  const layout = useMemo(() => layoutRadial(nodes, width, height), [nodes, width, height]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border-hairline bg-ink-900"
      style={{ aspectRatio: `${width}/${height}` }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0"
        style={{ background: "var(--wash-ember)" }}
      />
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="relative h-full w-full"
        role="img"
        aria-label="Foundry Ingot lineage graph"
      >
        <defs>
          <linearGradient id="lg-edge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ff8a1a" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ff8a1a" stopOpacity="0.15" />
          </linearGradient>
          <radialGradient id="lg-node">
            <stop offset="0%" stopColor="#ffd9a6" />
            <stop offset="60%" stopColor="#ff8a1a" />
            <stop offset="100%" stopColor="#a64a00" />
          </radialGradient>
        </defs>

        {/* edges */}
        {layout.edges.map((e, i) => (
          <motion.line
            key={`e-${i}`}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            stroke="url(#lg-edge)"
            strokeWidth={1.2}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 + i * 0.04 }}
          />
        ))}

        {/* nodes */}
        {layout.positions.map((n, i) => (
          <motion.g
            key={n.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 240,
              damping: 26,
              delay: 0.4 + i * 0.05,
            }}
            style={{ transformOrigin: `${n.cx}px ${n.cy}px` }}
          >
            <circle
              cx={n.cx}
              cy={n.cy}
              r={n.isRoot ? 22 : 16}
              fill="url(#lg-node)"
              filter="drop-shadow(0 0 12px rgba(255,138,26,0.35))"
            />
            <text
              x={n.cx}
              y={n.cy + (n.isRoot ? 44 : 34)}
              textAnchor="middle"
              className="fill-platinum-200"
              style={{ fontFamily: "var(--font-sans)", fontSize: 11, letterSpacing: 0.5 }}
            >
              {n.name}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}

function layoutRadial(nodes: LineageNode[], width: number, height: number) {
  const cx = width / 2;
  const cy = height / 2;

  if (nodes.length === 0) {
    return { positions: [] as Layout[], edges: [] as Array<{ x1: number; y1: number; x2: number; y2: number }> };
  }

  // Roots: any node without a parent or whose parent isn't in the set.
  const ids = new Set(nodes.map((n) => n.id));
  const roots = nodes.filter((n) => !n.parent || !ids.has(n.parent));
  const children = (id: string) => nodes.filter((n) => n.parent === id);

  const positions: Layout[] = [];
  const edges: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

  // root: place the first root at center; if multiple roots, layout them on
  // an inner ring.
  const rootCount = roots.length;
  roots.forEach((root, ri) => {
    const angle = rootCount === 1 ? 0 : (2 * Math.PI * ri) / rootCount;
    const r = rootCount === 1 ? 0 : 90;
    const rx = cx + r * Math.cos(angle);
    const ry = cy + r * Math.sin(angle);
    positions.push({ id: root.id, name: root.name, cx: rx, cy: ry, isRoot: true });

    // children laid out around the root on an outer ring
    const kids = children(root.id);
    kids.forEach((kid, ki) => {
      const kAngle = angle + ((ki - (kids.length - 1) / 2) * Math.PI) / Math.max(4, kids.length + 1);
      const kr = 180;
      const kx = cx + kr * Math.cos(kAngle);
      const ky = cy + kr * Math.sin(kAngle);
      positions.push({ id: kid.id, name: kid.name, cx: kx, cy: ky, isRoot: false });
      edges.push({ x1: rx, y1: ry, x2: kx, y2: ky });

      // grand-children
      const grand = children(kid.id);
      grand.forEach((g, gi) => {
        const gAngle = kAngle + ((gi - (grand.length - 1) / 2) * 0.4);
        const gr = 250;
        const gx = cx + gr * Math.cos(gAngle);
        const gy = cy + gr * Math.sin(gAngle);
        positions.push({ id: g.id, name: g.name, cx: gx, cy: gy, isRoot: false });
        edges.push({ x1: kx, y1: ky, x2: gx, y2: gy });
      });
    });
  });

  return { positions, edges };
}
