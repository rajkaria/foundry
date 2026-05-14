import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { LineageGraph, type LineageNode } from "@/components/app/LineageGraph";
import { Pill } from "@/components/ui/Pill";

export const metadata = {
  title: "Lineage — every Ingot, every parent",
  description:
    "The on-chain family tree of every Foundry Ingot. Forks, reforges, and contributions trace back to origin.",
};

const sample: LineageNode[] = [
  { id: "k0", name: "Konkani v1" },
  { id: "k1", name: "Konkani · news", parent: "k0" },
  { id: "k2", name: "Konkani · conversation", parent: "k0" },
  { id: "k3", name: "Konkani · legal", parent: "k1" },
  { id: "t0", name: "Tulu v1" },
  { id: "t1", name: "Tulu · news", parent: "t0" },
  { id: "c0", name: "Clause Classifier" },
  { id: "c1", name: "Clause · MSA", parent: "c0" },
  { id: "c2", name: "Clause · NDA", parent: "c0" },
];

export default function LineagePage() {
  return (
    <main>
      <Header />
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-caption text-ember-400">Lineage Graph</p>
              <h1 className="text-display-xl mt-3 max-w-[24ch] text-platinum-100">
                Every Ingot, every parent, every fork.
              </h1>
              <p className="text-body-lg mt-6 max-w-[60ch] text-platinum-300">
                Each node is an Ingot. Each edge is a reforging or fork. Click
                a node to inspect its cap table and call its inference.
              </p>
            </div>
            <Pill tone="positive" dot>
              On-chain via 0G Storage lineage refs
            </Pill>
          </div>

          <div className="mt-12">
            <LineageGraph nodes={sample} height={620} />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
