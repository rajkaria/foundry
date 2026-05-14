"use client";

import { motion } from "motion/react";
import { useMemo, useState } from "react";

export interface LineageNode {
  id: string;
  name: string;
  shares?: number;
  parent?: string;
  ingotId?: string;
  contributors?: number;
  mintedAt?: string;
}

interface Layout {
  id: string;
  name: string;
  cx: number;
  cy: number;
  depth: number;
  contributors?: number;
  ingotId?: string;
}

interface Edge {
  id: string;
  fromId: string;
  toId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Lineage Graph — visual on-chain family tree of every Ingot.
 *
 * Sprint 3 polish: interactive nodes (click to focus a lineage path),
 * depth-based sizing, contributor halos, and a screenshot-ready legend.
 * The layout is a recursive radial fan that scales gracefully past 20 nodes.
 */
export function LineageGraph({
  nodes,
  width = 880,
  height = 620,
}: {
  nodes: LineageNode[];
  width?: number;
  height?: number;
}) {
  const layout = useMemo(
    () => layoutRadial(nodes, width, height),
    [nodes, width, height]
  );
  const [focusId, setFocusId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const lineageIds = useMemo(() => {
    const target = hoverId ?? focusId;
    if (!target) return null;
    const ancestors = new Set<string>();
    let cur: string | undefined = target;
    while (cur) {
      ancestors.add(cur);
      cur = nodes.find((n) => n.id === cur)?.parent;
    }
    const descendants = new Set<string>();
    const queue = [target];
    while (queue.length) {
      const id = queue.shift()!;
      descendants.add(id);
      nodes.filter((n) => n.parent === id).forEach((n) => queue.push(n.id));
    }
    return new Set<string>([...ancestors, ...descendants]);
  }, [hoverId, focusId, nodes]);

  return (
    <div className="space-y-4">
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
              <stop offset="0%" stopColor="#ff8a1a" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#ff8a1a" stopOpacity="0.12" />
            </linearGradient>
            <linearGradient id="lg-edge-hot" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffd9a6" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#ff8a1a" stopOpacity="0.65" />
            </linearGradient>
            <radialGradient id="lg-node">
              <stop offset="0%" stopColor="#ffd9a6" />
              <stop offset="60%" stopColor="#ff8a1a" />
              <stop offset="100%" stopColor="#a64a00" />
            </radialGradient>
            <radialGradient id="lg-node-hot">
              <stop offset="0%" stopColor="#fff7e6" />
              <stop offset="50%" stopColor="#ffd9a6" />
              <stop offset="100%" stopColor="#ff8a1a" />
            </radialGradient>
            <radialGradient id="lg-node-dim">
              <stop offset="0%" stopColor="#a0a6b2" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#1e2330" stopOpacity="0.7" />
            </radialGradient>
            <pattern
              id="lg-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(255,255,255,0.025)"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          <rect width={width} height={height} fill="url(#lg-grid)" />

          {/* edges */}
          {layout.edges.map((e, i) => {
            const isHot =
              lineageIds &&
              lineageIds.has(e.fromId) &&
              lineageIds.has(e.toId);
            const isDimmed = lineageIds && !isHot;
            return (
              <motion.line
                key={e.id}
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                stroke={isHot ? "url(#lg-edge-hot)" : "url(#lg-edge)"}
                strokeWidth={isHot ? 2.2 : 1.2}
                strokeOpacity={isDimmed ? 0.18 : 1}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.03 }}
              />
            );
          })}

          {/* nodes */}
          {layout.positions.map((n, i) => {
            const isHot = lineageIds && lineageIds.has(n.id);
            const isDimmed = lineageIds && !isHot;
            const radius =
              n.depth === 0 ? 22 : n.depth === 1 ? 17 : 13;
            const fill = isHot
              ? "url(#lg-node-hot)"
              : isDimmed
                ? "url(#lg-node-dim)"
                : "url(#lg-node)";
            return (
              <motion.g
                key={n.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 240,
                  damping: 26,
                  delay: 0.35 + i * 0.04,
                }}
                style={{
                  transformOrigin: `${n.cx}px ${n.cy}px`,
                  cursor: "pointer",
                }}
                onMouseEnter={() => setHoverId(n.id)}
                onMouseLeave={() => setHoverId(null)}
                onClick={() =>
                  setFocusId((cur) => (cur === n.id ? null : n.id))
                }
              >
                {/* halo for contributor count */}
                {n.contributors && (
                  <circle
                    cx={n.cx}
                    cy={n.cy}
                    r={radius + 6}
                    fill="none"
                    stroke={isHot ? "#ffd9a6" : "#ff8a1a"}
                    strokeOpacity={isHot ? 0.45 : 0.18}
                    strokeWidth={1}
                  />
                )}
                <circle
                  cx={n.cx}
                  cy={n.cy}
                  r={radius}
                  fill={fill}
                  filter={`drop-shadow(0 0 ${isHot ? 18 : 10}px rgba(255,138,26,${isHot ? 0.6 : 0.32}))`}
                  opacity={isDimmed ? 0.45 : 1}
                />
                {/* node label */}
                <text
                  x={n.cx}
                  y={n.cy + radius + 16}
                  textAnchor="middle"
                  className="fill-platinum-100"
                  opacity={isDimmed ? 0.4 : 1}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: n.depth === 0 ? 13 : 11,
                    fontWeight: n.depth === 0 ? 500 : 400,
                    letterSpacing: 0.3,
                  }}
                >
                  {n.name}
                </text>
                {/* contributor count subscript */}
                {n.contributors && (
                  <text
                    x={n.cx}
                    y={n.cy + radius + 30}
                    textAnchor="middle"
                    className="fill-platinum-400"
                    opacity={isDimmed ? 0.4 : 1}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: 0.4,
                    }}
                  >
                    {n.contributors} smiths
                  </text>
                )}
              </motion.g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-4 text-[11px] text-platinum-400">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-full bg-ember-500" />
            Root Ingot
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-1.5 rounded-full bg-ember-500/60" />
            Fork / reforging
          </span>
          <span className="hidden items-center gap-1.5 sm:flex">
            <span className="inline-block h-px w-4 bg-ember-500/40" />
            Lineage edge
          </span>
        </div>
        {(focusId || hoverId) && (
          <div className="pointer-events-none absolute right-3 top-3 rounded-md border-hairline bg-ink-950/80 px-3 py-1.5 text-[11px] text-platinum-200 backdrop-blur">
            Lineage focus active · click again to clear
          </div>
        )}
      </div>

      {/* Focus details panel */}
      {focusId && (
        <FocusPanel
          node={nodes.find((n) => n.id === focusId)!}
          all={nodes}
          onClear={() => setFocusId(null)}
        />
      )}
    </div>
  );
}

function FocusPanel({
  node,
  all,
  onClear,
}: {
  node: LineageNode;
  all: LineageNode[];
  onClear: () => void;
}) {
  const ancestors: LineageNode[] = [];
  let cur = all.find((n) => n.id === node.parent);
  while (cur) {
    ancestors.unshift(cur);
    cur = all.find((n) => n.id === cur!.parent);
  }
  const descendants = all.filter((n) => n.parent === node.id);

  return (
    <div className="rounded-lg border-hairline bg-ink-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-caption text-ember-400">Lineage focus</p>
          <p className="text-title-lg mt-1 text-platinum-100">{node.name}</p>
          {node.ingotId && (
            <p className="text-caption mt-1 font-mono text-platinum-400">
              {node.ingotId}
            </p>
          )}
        </div>
        <button
          onClick={onClear}
          className="text-caption text-platinum-400 transition-colors hover:text-platinum-200"
        >
          Clear ×
        </button>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <p className="text-caption text-platinum-400">Ancestors</p>
          <ul className="mt-2 space-y-1">
            {ancestors.length === 0 ? (
              <li className="text-body-sm text-platinum-400">Root Ingot.</li>
            ) : (
              ancestors.map((a) => (
                <li key={a.id} className="text-body-sm text-platinum-200">
                  ↑ {a.name}
                </li>
              ))
            )}
          </ul>
        </div>
        <div>
          <p className="text-caption text-platinum-400">Direct descendants</p>
          <ul className="mt-2 space-y-1">
            {descendants.length === 0 ? (
              <li className="text-body-sm text-platinum-400">No forks yet.</li>
            ) : (
              descendants.map((d) => (
                <li key={d.id} className="text-body-sm text-platinum-200">
                  ↓ {d.name}
                </li>
              ))
            )}
          </ul>
        </div>
        <div>
          <p className="text-caption text-platinum-400">Metadata</p>
          <ul className="mt-2 space-y-1 text-body-sm text-platinum-200">
            {node.contributors !== undefined && (
              <li>
                <span className="text-platinum-400">Contributors · </span>
                {node.contributors}
              </li>
            )}
            {node.mintedAt && (
              <li>
                <span className="text-platinum-400">Minted · </span>
                {node.mintedAt}
              </li>
            )}
            {node.shares !== undefined && (
              <li>
                <span className="text-platinum-400">Shares pool · </span>
                10000 bps total
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function layoutRadial(
  nodes: LineageNode[],
  width: number,
  height: number
): { positions: Layout[]; edges: Edge[] } {
  const cx = width / 2;
  const cy = height / 2;

  if (nodes.length === 0) return { positions: [], edges: [] };

  const ids = new Set(nodes.map((n) => n.id));
  const roots = nodes.filter((n) => !n.parent || !ids.has(n.parent));
  const childrenOf = (id: string) => nodes.filter((n) => n.parent === id);

  const positions: Layout[] = [];
  const edges: Edge[] = [];
  const ringRadii = [0, 130, 230, 310];

  const rootCount = roots.length;
  const rootSpread =
    rootCount === 1 ? 0 : Math.min(120, Math.max(70, 60 + rootCount * 12));

  roots.forEach((root, ri) => {
    const baseAngle =
      rootCount === 1 ? 0 : (2 * Math.PI * ri) / rootCount - Math.PI / 2;
    const r0 = rootCount === 1 ? 0 : rootSpread;
    const rx = cx + r0 * Math.cos(baseAngle);
    const ry = cy + r0 * Math.sin(baseAngle);

    placeNode({
      id: root.id,
      name: root.name,
      cx: rx,
      cy: ry,
      depth: 0,
      contributors: root.contributors,
      ingotId: root.ingotId,
    });

    layoutChildren(root.id, rx, ry, baseAngle, 1);
  });

  function layoutChildren(
    parentId: string,
    px: number,
    py: number,
    parentAngle: number,
    depth: number
  ) {
    const kids = childrenOf(parentId);
    if (kids.length === 0 || depth >= ringRadii.length) return;
    const ring = ringRadii[depth];
    const span =
      depth === 1
        ? Math.PI * 0.85
        : depth === 2
          ? Math.PI * 0.55
          : Math.PI * 0.4;
    kids.forEach((kid, ki) => {
      const offset =
        kids.length === 1
          ? 0
          : (ki / (kids.length - 1) - 0.5) * span;
      const angle = parentAngle + offset;
      const kx = cx + ring * Math.cos(angle);
      const ky = cy + ring * Math.sin(angle);
      placeNode({
        id: kid.id,
        name: kid.name,
        cx: kx,
        cy: ky,
        depth,
        contributors: kid.contributors,
        ingotId: kid.ingotId,
      });
      edges.push({
        id: `${parentId}->${kid.id}`,
        fromId: parentId,
        toId: kid.id,
        x1: px,
        y1: py,
        x2: kx,
        y2: ky,
      });
      layoutChildren(kid.id, kx, ky, angle, depth + 1);
    });
  }

  function placeNode(p: Layout) {
    positions.push(p);
  }

  return { positions, edges };
}
