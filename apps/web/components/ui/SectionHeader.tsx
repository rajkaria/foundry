import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

/**
 * Page/section header with the ember eyebrow + optional heat bloom behind it
 * and a right-aligned meta slot. The single header pattern used app-wide.
 */
export function SectionHeader({
  eyebrow,
  title,
  intro,
  meta,
  glow = false,
  size = "lg",
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  meta?: ReactNode;
  /** Radial ember bloom behind the header (use for top-of-page heroes). */
  glow?: boolean;
  size?: "sm" | "lg" | "xl";
  className?: string;
}) {
  const titleClass =
    size === "xl"
      ? "text-display-xl"
      : size === "sm"
        ? "text-display-sm"
        : "text-display-lg";

  return (
    <div className={cn(glow && "glow-ember", className)}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <p className="text-caption text-ember-400 flex items-center gap-2">
            <span className="bg-ember-500/70 inline-block h-px w-6" />
            {eyebrow}
          </p>
          <h2
            className={cn(
              titleClass,
              "text-platinum-100 mt-3 max-w-[26ch] text-balance"
            )}
          >
            {title}
          </h2>
        </div>
        {meta && (
          <p className="text-caption text-platinum-400 whitespace-nowrap">{meta}</p>
        )}
      </div>
      {intro && (
        <p className="text-body-lg text-platinum-300 mt-5 max-w-[64ch]">{intro}</p>
      )}
      <div className="ember-rule mt-8" />
    </div>
  );
}
