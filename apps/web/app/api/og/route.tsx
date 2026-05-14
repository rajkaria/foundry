import { ImageResponse } from "next/og";

export const runtime = "edge";

const tokens = {
  ink: "#07080a",
  ink900: "#0c0e12",
  platinum: "#f3f4f6",
  platinum400: "#a0a6b2",
  ember: "#ff8a1a",
  ember300: "#ffd9a6",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title =
    searchParams.get("title") ?? "Co-own the models you help create.";
  const eyebrow = searchParams.get("eyebrow") ?? "FOUNDRY";
  const stats = searchParams.get("stats") ?? "0G mainnet · verifiable attribution · open SDK";

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
          background:
            `radial-gradient(60% 70% at 50% 0%, rgba(255,138,26,0.18), transparent 60%), ${tokens.ink}`,
          color: tokens.platinum,
          fontFamily: "serif",
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

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <p
            style={{
              fontSize: 72,
              lineHeight: 1.05,
              letterSpacing: -1.4,
              maxWidth: 1000,
              color: tokens.platinum,
              fontWeight: 300,
            }}
          >
            {title}
          </p>
        </div>

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
