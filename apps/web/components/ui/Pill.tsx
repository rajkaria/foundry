import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type Tone = "neutral" | "positive" | "warn" | "danger" | "ember";

const tones: Record<Tone, string> = {
  neutral: "bg-ink-800/80 text-platinum-300 border-ink-600",
  positive:
    "bg-[color-mix(in_oklab,var(--signal-positive)_14%,transparent)] text-signal-positive border-[color-mix(in_oklab,var(--signal-positive)_38%,transparent)] shadow-[0_0_16px_-6px_color-mix(in_oklab,var(--signal-positive)_60%,transparent)]",
  warn: "bg-[color-mix(in_oklab,var(--signal-warn)_14%,transparent)] text-signal-warn border-[color-mix(in_oklab,var(--signal-warn)_38%,transparent)]",
  danger:
    "bg-[color-mix(in_oklab,var(--signal-danger)_14%,transparent)] text-signal-danger border-[color-mix(in_oklab,var(--signal-danger)_38%,transparent)]",
  ember:
    "bg-[color-mix(in_oklab,var(--ember-500)_14%,transparent)] text-ember-400 border-[color-mix(in_oklab,var(--ember-500)_42%,transparent)] shadow-[0_0_18px_-6px_color-mix(in_oklab,var(--ember-500)_70%,transparent)]",
};

export function Pill({
  children,
  tone = "neutral",
  dot,
  pulse,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  /** Animate the dot with a live ping ring (implies dot). */
  pulse?: boolean;
  className?: string;
}) {
  const showDot = dot || pulse;
  return (
    <span
      className={cn(
        "rounded-pill text-caption inline-flex items-center gap-1.5 border px-2.5 py-0.5",
        tones[tone],
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            "size-1.5 rounded-full",
            pulse && "pulse-dot",
            tone === "positive" && "bg-signal-positive text-signal-positive",
            tone === "warn" && "bg-signal-warn text-signal-warn",
            tone === "danger" && "bg-signal-danger text-signal-danger",
            tone === "ember" && "bg-ember-500 text-ember-500",
            tone === "neutral" && "bg-platinum-400 text-platinum-400"
          )}
        />
      )}
      {children}
    </span>
  );
}
