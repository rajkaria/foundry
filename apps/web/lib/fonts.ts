import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";

/**
 * Foundry type stack — Anthropic-inspired.
 *
 *   Display:  Fraunces — contemporary humanist serif, Tiempos-adjacent.
 *             Variable axes (opsz, SOFT) for rare brand-headline moments.
 *   Sans:     Inter Tight — tight-tracking modern sans, Söhne/Styrene-adjacent.
 *             Default for display AND body.
 *   Mono:     JetBrains Mono — for code, hashes, on-chain payloads.
 */

export const fontDisplay = Fraunces({
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz", "SOFT"],
  style: ["normal", "italic"],
  variable: "--font-editorial",
  display: "swap",
});

export const fontSans = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans-soehne",
  display: "swap",
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});
