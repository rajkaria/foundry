import { EB_Garamond, Inter, JetBrains_Mono } from "next/font/google";

/**
 * Type stack — hackathon fallback:
 *   Display: EB Garamond (Google) — stands in for PP Editorial New (licensed).
 *   Sans:    Inter (Google) — stands in for Söhne (licensed).
 *   Mono:    JetBrains Mono (free, OFL).
 *
 * Swap to licensed faces in production via `localFont`.
 */

export const fontDisplay = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-editorial",
  display: "swap",
});

export const fontSans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans-soehne",
  display: "swap",
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});
