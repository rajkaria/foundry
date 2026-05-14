import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type Tone = "neutral" | "positive" | "warn" | "danger" | "ember";

const tones: Record<Tone, string> = {
  neutral: "bg-ink-800 text-platinum-300 border-ink-600",
  positive:
    "bg-[color-mix(in_oklab,var(--signal-positive)_10%,transparent)] text-signal-positive border-[color-mix(in_oklab,var(--signal-positive)_30%,transparent)]",
  warn: "bg-[color-mix(in_oklab,var(--signal-warn)_10%,transparent)] text-signal-warn border-[color-mix(in_oklab,var(--signal-warn)_30%,transparent)]",
  danger:
    "bg-[color-mix(in_oklab,var(--signal-danger)_10%,transparent)] text-signal-danger border-[color-mix(in_oklab,var(--signal-danger)_30%,transparent)]",
  ember:
    "bg-[color-mix(in_oklab,var(--ember-500)_10%,transparent)] text-ember-400 border-[color-mix(in_oklab,var(--ember-500)_30%,transparent)]",
};

export function Pill({
  children,
  tone = "neutral",
  dot,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-0.5 text-caption",
        tones[tone],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "size-1.5 rounded-full",
            tone === "positive" && "bg-signal-positive",
            tone === "warn" && "bg-signal-warn",
            tone === "danger" && "bg-signal-danger",
            tone === "ember" && "bg-ember-500",
            tone === "neutral" && "bg-platinum-400"
          )}
        />
      )}
      {children}
    </span>
  );
}
