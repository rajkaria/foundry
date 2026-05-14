import { Header } from "@/components/marketing/Header";
import { Hero } from "@/components/marketing/Hero";
import { Problem } from "@/components/marketing/Problem";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Dashboard } from "@/components/marketing/Dashboard";
import { BuildOnFoundry } from "@/components/marketing/BuildOnFoundry";
import { RealVsRoadmap } from "@/components/marketing/RealVsRoadmap";
import { CTA } from "@/components/marketing/CTA";
import { Footer } from "@/components/marketing/Footer";

export default function HomePage() {
  return (
    <main>
      <Header />
      <Hero />
      <Problem />
      <HowItWorks />
      <Dashboard />
      <BuildOnFoundry />
      <RealVsRoadmap />
      <CTA />
      <Footer />
    </main>
  );
}
