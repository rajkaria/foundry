import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type Tone = "neutral" | "positive" | "warn" | "danger" | "ember";

const tones: Record<Tone, string> = {
  neutral: "bg-ink-800/70 text-platinum-300 border-ink-600",
  positive:
    "bg-[color-mix(in_oklab,var(--signal-positive)_11%,transparent)] text-signal-positive border-[color-mix(in_oklab,var(--signal-positive)_30%,transparent)]",
  warn: "bg-[color-mix(in_oklab,var(--signal-warn)_11%,transparent)] text-signal-warn border-[color-mix(in_oklab,var(--signal-warn)_30%,transparent)]",
  danger:
    "bg-[color-mix(in_oklab,var(--signal-danger)_11%,transparent)] text-signal-danger border-[color-mix(in_oklab,var(--signal-danger)_30%,transparent)]",
  ember:
    "bg-[color-mix(in_oklab,var(--ember-500)_11%,transparent)] text-ember-400 border-[color-mix(in_oklab,var(--ember-500)_32%,transparent)]",
};

const dotColor: Record<Tone, string> = {
  neutral: "bg-platinum-400 text-platinum-400",
  positive: "bg-signal-positive text-signal-positive",
  warn: "bg-signal-warn text-signal-warn",
  danger: "bg-signal-danger text-signal-danger",
  ember: "bg-ember-500 text-ember-500",
};

export function Pill({
  children,
  tone = "neutral",
  dot,
  pulse,
  block = false,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  /** Animate the dot with a live ping ring (implies dot). */
  pulse?: boolean;
  /** Fill the parent width and center content — for fixed-width columns. */
  block?: boolean;
  className?: string;
}) {
  const showDot = dot || pulse;
  return (
    <span
      className={cn(
        // Uniform geometry: same height, padding, and baseline everywhere.
        "text-caption h-6 rounded-full border px-2.5 leading-none",
        block ? "flex w-full" : "inline-flex",
        "items-center justify-center gap-1.5 align-middle whitespace-nowrap",
        tones[tone],
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            pulse && "pulse-dot",
            dotColor[tone]
          )}
        />
      )}
      <span className="truncate">{children}</span>
    </span>
  );
}
