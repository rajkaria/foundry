import { cn } from "@/lib/cn";

interface FoundryMarkProps {
  size?: number;
  className?: string;
  /** Compact rendering — drops the ambient glow ring for tight UI contexts. */
  flat?: boolean;
  title?: string;
}

/**
 * The Foundry mark — an isometric ingot.
 *
 * Three facets: top (light, freshly cooled), front (ember gradient with
 * a sculpted "F" channel), right side (shadowed). A subtle highlight rim
 * traces the top edge. A specular star sits at the molten core.
 *
 * Use `<FoundryMark />` standalone, or `<FoundryLockup />` to pair with
 * the wordmark.
 */
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
          id={`${id}-front`}
          x1="16"
          y1="22"
          x2="32"
          y2="56"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ffb260" />
          <stop offset="55%" stopColor="#ff8a1a" />
          <stop offset="100%" stopColor="#a64a00" />
        </linearGradient>
        <linearGradient
          id={`${id}-top`}
          x1="32"
          y1="6"
          x2="32"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#fff1d6" />
          <stop offset="100%" stopColor="#ffb260" />
        </linearGradient>
        <linearGradient
          id={`${id}-side`}
          x1="46"
          y1="14"
          x2="58"
          y2="50"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#e26a00" />
          <stop offset="100%" stopColor="#4a1f00" />
        </linearGradient>
        <radialGradient
          id={`${id}-glow`}
          cx="32"
          cy="34"
          r="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#fff8e8" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#ff8a1a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {!flat && (
        <circle cx="32" cy="34" r="26" fill={`url(#${id}-glow)`} />
      )}

      {/* Right side facet — shadow */}
      <path
        d="M44 14 L56 18 L52 54 L40 50 Z"
        fill={`url(#${id}-side)`}
      />

      {/* Top facet — fresh casting, bright */}
      <path
        d="M20 10 L44 14 L40 22 L18 18 Z"
        fill={`url(#${id}-top)`}
      />

      {/* Front facet — ember body */}
      <path
        d="M18 18 L40 22 L40 50 L14 46 Z"
        fill={`url(#${id}-front)`}
      />

      {/* Sculpted "F" channel on the front face */}
      <g
        stroke="#4a1f00"
        strokeOpacity="0.55"
        strokeWidth="0.9"
        strokeLinejoin="round"
        fill="#fff1d6"
        fillOpacity="0.18"
      >
        <path d="M22 24 L34 26 L34 28.5 L25 27 L25 32 L31.5 33 L31.5 35.5 L25 34.4 L25 42 L22 41.4 Z" />
      </g>

      {/* Engraved rim across the whole silhouette */}
      <path
        d="M20 10 L44 14 L56 18 L52 54 L40 50 L14 46 L18 18 Z"
        fill="none"
        stroke="#4a1f00"
        strokeOpacity="0.7"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />

      {/* Top-rim specular */}
      <path
        d="M20 10 L44 14 L40 16.5 L20 13 Z"
        fill="#fff8e8"
        fillOpacity="0.45"
      />

      {/* Spark at the molten core */}
      <circle cx="33" cy="37" r="1.2" fill="#fff8e8" fillOpacity="0.9" />
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
    <div className={cn("flex items-center gap-2.5", className)}>
      <FoundryMark size={size} />
      <span
        className="foundry-wordmark text-platinum-100"
        style={{ fontSize: size * 0.62 }}
      >
        Foundry
      </span>
    </div>
  );
}
