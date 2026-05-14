import { cn } from "@/lib/cn";

interface FoundryMarkProps {
  size?: number;
  className?: string;
  /** When true, the mark renders without the specular highlight — used in tight contexts. */
  flat?: boolean;
  title?: string;
}

export function FoundryMark({
  size = 48,
  className,
  flat = false,
  title = "Foundry",
}: FoundryMarkProps) {
  const id = `mark-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label={title}
      className={cn("inline-block", className)}
    >
      <defs>
        <linearGradient
          id={`${id}-ember`}
          x1="32"
          y1="6"
          x2="32"
          y2="58"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ffd9a6" />
          <stop offset="38%" stopColor="#ff8a1a" />
          <stop offset="100%" stopColor="#a64a00" />
        </linearGradient>
        <linearGradient
          id={`${id}-spec`}
          x1="32"
          y1="6"
          x2="32"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#fff8e8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fff8e8" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d="M18 8 L46 8 L54 54 L10 54 Z" fill={`url(#${id}-ember)`} />
      {!flat && (
        <path d="M18 8 L46 8 L44 14 L20 14 Z" fill={`url(#${id}-spec)`} />
      )}
      <path
        d="M18 8 L46 8 L54 54 L10 54 Z"
        fill="none"
        stroke="#4a1f00"
        strokeOpacity="0.6"
        strokeWidth="0.8"
      />
    </svg>
  );
}

export function FoundryLockup({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <FoundryMark size={size} />
      <span
        className="foundry-wordmark text-platinum-100"
        style={{ fontSize: size * 0.6, fontFamily: "var(--font-display)" }}
      >
        FOUNDRY
      </span>
    </div>
  );
}
