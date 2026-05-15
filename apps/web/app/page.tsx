import { Header } from "@/components/marketing/Header";
import { Hero } from "@/components/marketing/Hero";
import { Problem } from "@/components/marketing/Problem";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Dashboard } from "@/components/marketing/Dashboard";
import { BuildOnFoundry } from "@/components/marketing/BuildOnFoundry";
import { RealVsRoadmap } from "@/components/marketing/RealVsRoadmap";
import { CTA } from "@/components/marketing/CTA";
import { Footer } from "@/components/marketing/Footer";
import { getStats } from "@/lib/stats-data";
import { getChain } from "@/lib/chain";

export const revalidate = 10;

export default async function HomePage() {
  const chain = getChain();
  const stats = await getStats().catch(() => ({
    forges: 0,
    ingots: 0,
    contributions: 0,
    externalSmiths: 0,
    totalRevenueOG: 0,
    totalClaimedOG: 0,
    lastBlock: 0n,
    isLive: false,
  }));

  return (
    <main>
      <Header />
      <Hero />
      <Problem />
      <HowItWorks />
      <Dashboard stats={{ ...stats, network: chain.network }} />
      <BuildOnFoundry />
      <RealVsRoadmap />
      <CTA />
      <Footer />
    </main>
  );
}
