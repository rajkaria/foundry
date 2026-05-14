"use client";

/**
 * GridBackdrop — a hairline grid with a radial fade. Pure CSS, decorative.
 * Used as a subtle architectural texture behind the hero and step sections.
 */
export function GridBackdrop({
  className,
  size = 56,
  opacity = 0.35,
}: {
  className?: string;
  size?: number;
  opacity?: number;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className ?? ""}`}
      style={{
        backgroundImage: `
          linear-gradient(to right, color-mix(in oklab, var(--ink-600) ${
            opacity * 100
          }%, transparent) 1px, transparent 1px),
          linear-gradient(to bottom, color-mix(in oklab, var(--ink-600) ${
            opacity * 100
          }%, transparent) 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px`,
        maskImage:
          "radial-gradient(ellipse at center, black 0%, transparent 70%)",
        WebkitMaskImage:
          "radial-gradient(ellipse at center, black 0%, transparent 70%)",
      }}
    />
  );
}
