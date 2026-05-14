/**
 * Foundry design tokens — JS export.
 *
 * Consumed by motion primitives, ImageResponse (OG cards), and anywhere a
 * runtime value of a token is needed. Kept in sync with the CSS variables in
 * `index.css` — the CSS is authoritative; this file mirrors.
 */

export const color = {
  ink: {
    950: "#07080a",
    900: "#0c0e12",
    800: "#14171d",
    700: "#1d2129",
    600: "#2a2f3a",
    500: "#424857",
    400: "#6c7384",
    300: "#8d94a3",
  },
  platinum: {
    100: "#f3f4f6",
    200: "#e3e5ea",
    300: "#c8ccd4",
    400: "#a0a6b2",
    50: "#fafbfc",
    0: "#ffffff",
  },
  ember: {
    300: "#ffd9a6",
    400: "#ffb260",
    500: "#ff8a1a",
    600: "#e26a00",
    700: "#a64a00",
    900: "#4a1f00",
  },
  signal: {
    positive: "#2bd07c",
    warn: "#f5b400",
    danger: "#ff5a5a",
    info: "#6fa7ff",
  },
} as const;

export const duration = {
  instant: 80,
  quick: 180,
  base: 320,
  slow: 560,
  statement: 1200,
} as const;

export const easing = {
  standard: [0.32, 0.72, 0, 1] as const,
  decel: [0.2, 0.9, 0.3, 1] as const,
  accel: [0.6, 0, 1, 0.4] as const,
} as const;

export const spring = {
  springy: { stiffness: 240, damping: 28 } as const,
  gentle: { stiffness: 180, damping: 24 } as const,
} as const;

export const radius = {
  pill: 999,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
} as const;

export type Color = typeof color;
export type Duration = keyof typeof duration;
export type Easing = keyof typeof easing;
