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
  {
    id: "k0",
    name: "Konkani v1",
    contributors: 9,
    ingotId: "0x8e2a…0001",
    mintedAt: "2026-05-24",
  },
  {
    id: "k1",
    name: "Konkani · news",
    parent: "k0",
    contributors: 6,
    ingotId: "0x8e2a…0002",
    mintedAt: "2026-05-28",
  },
  {
    id: "k2",
    name: "Konkani · conversation",
    parent: "k0",
    contributors: 5,
    ingotId: "0x8e2a…0006",
    mintedAt: "2026-05-29",
  },
  {
    id: "k3",
    name: "Konkani · legal",
    parent: "k1",
    contributors: 4,
    ingotId: "0x8e2a…0007",
    mintedAt: "2026-06-02",
  },
  {
    id: "k4",
    name: "Konkani · medical",
    parent: "k1",
    contributors: 3,
    ingotId: "0x8e2a…0009",
    mintedAt: "2026-06-04",
  },

  {
    id: "t0",
    name: "Tulu v1",
    contributors: 4,
    ingotId: "0x8e2a…0003",
    mintedAt: "2026-05-26",
  },
  {
    id: "t1",
    name: "Tulu · news",
    parent: "t0",
    contributors: 3,
    ingotId: "0x8e2a…0008",
    mintedAt: "2026-06-01",
  },

  {
    id: "c0",
    name: "Clause Classifier",
    contributors: 7,
    ingotId: "0x8e2a…0004",
    mintedAt: "2026-05-30",
  },
  {
    id: "c1",
    name: "Clause · MSA",
    parent: "c0",
    contributors: 5,
    ingotId: "0x8e2a…0005",
    mintedAt: "2026-06-03",
  },
  {
    id: "c2",
    name: "Clause · NDA",
    parent: "c0",
    contributors: 4,
    ingotId: "0x8e2a…000a",
    mintedAt: "2026-06-05",
  },
  {
    id: "c3",
    name: "Clause · SaaS Order Form",
    parent: "c1",
    contributors: 3,
    ingotId: "0x8e2a…000b",
    mintedAt: "2026-06-07",
  },
];

export default function LineagePage() {
  return (
    <main>
      <Header />
      <section className="border-hairline border-t">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-caption text-ember-400">Lineage Graph</p>
              <h1 className="text-display-xl text-platinum-100 mt-3 max-w-[24ch]">
                Every Ingot, every parent, every fork.
              </h1>
              <p className="text-body-lg text-platinum-300 mt-6 max-w-[60ch]">
                Each node is an Ingot. Each edge is a reforging or fork. Click any node
                to focus its lineage — ancestors light up along the path, descendants
                downstream. Click again to clear.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Pill tone="positive" dot>
                On-chain via 0G Storage lineage refs
              </Pill>
              <Pill tone="ember">
                {sample.length} Ingots · {sample.filter((n) => n.parent).length} forks
              </Pill>
            </div>
          </div>

          <div className="mt-12">
            <LineageGraph nodes={sample} height={620} width={1100} />
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <FactCard
              label="Lineage depth"
              value="4"
              note="Konkani v1 → news → legal is currently the deepest chain."
            />
            <FactCard
              label="Total contributors"
              value="53"
              note="Cumulative across all Ingots — Smiths often hold shares in multiple."
            />
            <FactCard
              label="Reforging events"
              value="8"
              note="Each one re-runs LOO attribution; parent shareholders earn from every descendant call."
            />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function FactCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="border-hairline bg-ink-900 rounded-lg p-6">
      <p className="text-caption text-platinum-400">{label}</p>
      <p className="text-display-sm text-platinum-100 mt-2">{value}</p>
      <p className="text-body-sm text-platinum-300 mt-3">{note}</p>
    </div>
  );
}
