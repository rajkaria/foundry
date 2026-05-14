import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { Dashboard } from "@/components/marketing/Dashboard";

export const metadata = {
  title: "Forge in Public — live mainnet activity",
  description:
    "Real-time on-chain numbers from Foundry on 0G Aristotle mainnet. No simulated counters.",
};

export default function DashboardPage() {
  return (
    <main>
      <Header />
      <section className="border-hairline border-t">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <p className="text-caption text-ember-400">Forge in Public</p>
          <h1 className="text-display-xl text-platinum-100 mt-3 max-w-[26ch]">
            Real numbers, on mainnet, ticking live.
          </h1>
          <p className="text-body-lg text-platinum-300 mt-6 max-w-[60ch]">
            Every figure below comes from 0G Aristotle. The indexer pushes updates via
            websocket — usually within four seconds of an on-chain event.
          </p>
        </div>
      </section>
      <Dashboard />
      <Footer />
    </main>
  );
}
