import { ImageResponse } from "next/og";

export const runtime = "edge";

const tokens = {
  ink: "#07080a",
  ink900: "#0c0e12",
  ink800: "#13161d",
  platinum: "#f3f4f6",
  platinum200: "#cdd1d8",
  platinum400: "#a0a6b2",
  ember: "#ff8a1a",
  ember300: "#ffd9a6",
  signalPositive: "#3ecf8e",
};

type Variant = "default" | "forge" | "ingot" | "smith";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const variant = (searchParams.get("variant") ?? "default") as Variant;
  const title =
    searchParams.get("title") ?? "Co-own the models you help create.";
  const eyebrow = searchParams.get("eyebrow") ?? "FOUNDRY";
  const stats =
    searchParams.get("stats") ??
    "0G mainnet · verifiable attribution · open SDK";
  const subtitle = searchParams.get("subtitle") ?? null;
  const metric1 = searchParams.get("metric1") ?? null;
  const metric1Label = searchParams.get("metric1Label") ?? null;
  const metric2 = searchParams.get("metric2") ?? null;
  const metric2Label = searchParams.get("metric2Label") ?? null;
  const address = searchParams.get("address") ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: `radial-gradient(60% 70% at 50% 0%, rgba(255,138,26,0.18), transparent 60%), ${tokens.ink}`,
          color: tokens.platinum,
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Top row — mark + eyebrow */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <svg width="56" height="56" viewBox="0 0 64 64">
              <defs>
                <linearGradient id="og" x1="32" y1="6" x2="32" y2="58">
                  <stop offset="0%" stopColor={tokens.ember300} />
                  <stop offset="38%" stopColor={tokens.ember} />
                  <stop offset="100%" stopColor="#a64a00" />
                </linearGradient>
              </defs>
              <path d="M18 8 L46 8 L54 54 L10 54 Z" fill="url(#og)" />
            </svg>
            <span
              style={{
                fontSize: 28,
                letterSpacing: 4.2,
                color: tokens.platinum,
                fontWeight: 300,
              }}
            >
              FOUNDRY
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {variant !== "default" && (
              <span
                style={{
                  fontSize: 12,
                  letterSpacing: 2.4,
                  color: tokens.ink,
                  fontFamily: "sans-serif",
                  background: tokens.ember,
                  padding: "5px 10px",
                  borderRadius: 999,
                  fontWeight: 600,
                }}
              >
                {variant.toUpperCase()}
              </span>
            )}
            <span
              style={{
                fontSize: 14,
                letterSpacing: 2.4,
                textTransform: "uppercase",
                color: tokens.platinum400,
                fontFamily: "sans-serif",
              }}
            >
              {eyebrow}
            </span>
          </div>
        </div>

        {/* Title block */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <p
            style={{
              fontSize: title.length > 60 ? 56 : 72,
              lineHeight: 1.05,
              letterSpacing: -1.4,
              maxWidth: 1000,
              color: tokens.platinum,
              fontWeight: 300,
            }}
          >
            {title}
          </p>
          {subtitle && (
            <p
              style={{
                fontSize: 24,
                lineHeight: 1.35,
                maxWidth: 900,
                color: tokens.platinum200,
                fontFamily: "sans-serif",
                fontWeight: 400,
              }}
            >
              {subtitle}
            </p>
          )}
          {address && (
            <p
              style={{
                fontSize: 18,
                color: tokens.platinum400,
                fontFamily: "monospace",
                letterSpacing: 0.4,
              }}
            >
              {address}
            </p>
          )}
        </div>

        {/* Metrics row */}
        {(metric1 || metric2) && (
          <div
            style={{
              display: "flex",
              gap: 36,
              borderTop: `1px solid ${tokens.ink800}`,
              paddingTop: 28,
            }}
          >
            {metric1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span
                  style={{
                    fontSize: 12,
                    letterSpacing: 2.4,
                    textTransform: "uppercase",
                    color: tokens.platinum400,
                    fontFamily: "sans-serif",
                  }}
                >
                  {metric1Label ?? "Metric"}
                </span>
                <span
                  style={{
                    fontSize: 44,
                    color: tokens.platinum,
                    fontFamily: "serif",
                    fontWeight: 300,
                    letterSpacing: -0.8,
                  }}
                >
                  {metric1}
                </span>
              </div>
            )}
            {metric2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span
                  style={{
                    fontSize: 12,
                    letterSpacing: 2.4,
                    textTransform: "uppercase",
                    color: tokens.platinum400,
                    fontFamily: "sans-serif",
                  }}
                >
                  {metric2Label ?? "Metric"}
                </span>
                <span
                  style={{
                    fontSize: 44,
                    color: tokens.platinum,
                    fontFamily: "serif",
                    fontWeight: 300,
                    letterSpacing: -0.8,
                  }}
                >
                  {metric2}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Bottom strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "sans-serif",
            color: tokens.platinum400,
            fontSize: 18,
          }}
        >
          <span>{stats}</span>
          <span>foundryprotocol.xyz</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
