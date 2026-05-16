import { cn } from "@/lib/cn";
import { Pill } from "@/components/ui/Pill";
import type { ReactNode } from "react";

type Tone = "neutral" | "positive" | "warn" | "danger" | "ember";

/**
 * One row in the live protocol feed. Links to its tx; the left edge lights
 * ember on hover so the feed reads as a live ticker, not a static table.
 */
export function EventRow({
  href,
  tone,
  label,
  summary,
  meta,
  pulse = false,
  style,
}: {
  href: string;
  tone: Tone;
  label: string;
  summary: ReactNode;
  meta: ReactNode;
  /** Pulse the badge dot — use for the newest / live events. */
  pulse?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      style={style}
      className={cn(
        "group relative grid grid-cols-[120px_1fr_auto] items-center gap-4 px-5 py-4",
        "border-hairline border-b transition-colors duration-[var(--dur-quick)] last:border-b-0",
        "hover:bg-[color-mix(in_oklab,var(--ember-900)_22%,var(--ink-900))]"
      )}
    >
      <span
        className={cn(
          "absolute top-0 bottom-0 left-0 w-px origin-top scale-y-0 transition-transform duration-[var(--dur-base)]",
          "from-ember-400 to-ember-600 bg-gradient-to-b group-hover:scale-y-100"
        )}
      />
      <Pill tone={tone} dot pulse={pulse}>
        {label}
      </Pill>
      <span className="text-body-sm text-platinum-200 group-hover:text-platinum-100 truncate transition-colors">
        {summary}
      </span>
      <span className="text-mono-sm text-platinum-500 group-hover:text-ember-400 tabular flex items-center gap-1 whitespace-nowrap transition-colors">
        {meta}
        <span aria-hidden className="opacity-50 group-hover:opacity-100">
          ↗
        </span>
      </span>
    </a>
  );
}
