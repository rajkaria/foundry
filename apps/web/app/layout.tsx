import type { Metadata, Viewport } from "next";
import { fontDisplay, fontMono, fontSans } from "@/lib/fonts";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://foundryprotocol.xyz";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Foundry — The supply-side protocol for 0G",
    template: "%s · Foundry",
  },
  description:
    "Pool data, compute, and capital. Co-train an AI model on 0G. Own a verifiable, revenue-generating share — minted on mainnet, attributed inside a TEE.",
  applicationName: "Foundry",
  keywords: [
    "Foundry",
    "0G",
    "decentralized AI",
    "verifiable attribution",
    "TEE",
    "AI ownership",
    "Agent ID",
    "co-trained models",
  ],
  authors: [{ name: "Foundry contributors" }],
  creator: "Foundry",
  publisher: "Foundry",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Foundry — The supply-side protocol for 0G",
    description:
      "Pool data, compute, and capital. Co-train an AI model on 0G. Own a verifiable, revenue-generating share.",
    siteName: "Foundry",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Foundry" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@foundryprotocol",
    creator: "@foundryprotocol",
    title: "Foundry — The supply-side protocol for 0G",
    description: "Co-own the models you help create.",
    images: ["/api/og"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#07080a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`}
    >
      <body className="bg-stage text-platinum-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
