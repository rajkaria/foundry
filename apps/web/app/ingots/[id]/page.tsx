import { notFound } from "next/navigation";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { Pill } from "@/components/ui/Pill";
import { Card, CardEyebrow, CardTitle, CardBody } from "@/components/ui/Card";
import { InferenceWidget } from "@/components/app/InferenceWidget";
import { LineageGraph } from "@/components/app/LineageGraph";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface IngotSample {
  name: string;
  forge: string;
  state: "LIVE" | "TRAINING";
  weightsRoot: string;
  baseline: number;
  measured: number;
  metric: string;
  capTable: { holder: string; share: number; type: "data" | "compute" | "capital" }[];
  lineage: { id: string; name: string; parent?: string }[];
  revenueDistributed: string;
}

const samples: Record<string, IngotSample> = {
  "0x8e2f4a": {
    name: "Konkani Translator",
    forge: "0x42…81",
    state: "LIVE",
    weightsRoot: "0x91d…ba2",
    baseline: 21.4,
    measured: 38.7,
    metric: "BLEU",
    capTable: [
      { holder: "0x8e…a2", share: 41.6, type: "data" },
      { holder: "0xb1…9f", share: 20.8, type: "data" },
      { holder: "0x44…0c", share: 17.5, type: "compute" },
      { holder: "0x7c…d3", share: 12.4, type: "capital" },
      { holder: "0x2a…15", share: 7.7, type: "data" },
    ],
    lineage: [
      { id: "k0", name: "Konkani v1" },
      { id: "k1", name: "Konkani v1 · domain news", parent: "k0" },
      { id: "k2", name: "Konkani v1 · conversational", parent: "k0" },
      { id: "k3", name: "Konkani v1 · legal", parent: "k1" },
    ],
    revenueDistributed: "0.184 OG",
  },
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const i = samples[id];
  return { title: i ? `${i.name} — Ingot` : "Ingot" };
}

export default async function IngotDetailPage({ params }: PageProps) {
  const { id } = await params;
  const i = samples[id];
  if (!i) notFound();

  const ingotIdHex = `0x${id}`;

  return (
    <main>
      <Header />
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <div className="flex items-center gap-3">
            <p className="text-caption text-platinum-400">Ingot · {ingotIdHex}</p>
            <Pill tone="positive" dot>
              {i.state}
            </Pill>
            <Pill tone="ember">+{((i.measured - i.baseline) / i.baseline * 100).toFixed(0)}% vs baseline</Pill>
          </div>

          <h1 className="text-display-xl mt-3 text-platinum-100">{i.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-mono-sm text-platinum-400">
            <span>weights: {i.weightsRoot}</span>
            <span>·</span>
            <span>forged at {i.forge}</span>
            <span>·</span>
            <span>{i.metric}: {i.baseline} → {i.measured}</span>
          </div>
        </div>
      </section>

      <section className="border-t border-hairline">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-6 py-16 lg:grid-cols-[1.4fr_1fr]">
          <Card elevated>
            <CardEyebrow>Run inference</CardEyebrow>
            <CardTitle>Call this Ingot via the OpenAI-compatible proxy</CardTitle>
            <CardBody>
              Revenue routes to co-owners on every inference call, on-chain
              via <code className="text-mono-sm text-platinum-200">RevenueSplitter</code>.
            </CardBody>
            <div className="mt-6">
              <InferenceWidget ingotId={ingotIdHex} />
            </div>
          </Card>

          <Card>
            <CardEyebrow>Cap table</CardEyebrow>
            <CardTitle>Who owns this Ingot</CardTitle>
            <div className="mt-5 divide-y divide-hairline">
              {i.capTable.map((row) => (
                <div
                  key={row.holder}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="size-2 rounded-full"
                      style={{
                        background:
                          row.type === "data"
                            ? "var(--ember-500)"
                            : row.type === "compute"
                              ? "var(--ember-400)"
                              : "var(--ember-300)",
                      }}
                    />
                    <span className="text-mono-sm text-platinum-200 tabular">
                      {row.holder}
                    </span>
                    <Pill tone="neutral">{row.type}</Pill>
                  </div>
                  <span className="text-title-md tabular text-platinum-100">
                    {row.share.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
            <p className="text-body-sm mt-5 border-t border-hairline pt-4 text-platinum-400">
              Revenue distributed to date:{" "}
              <span className="text-platinum-200 tabular">{i.revenueDistributed}</span>
            </p>
          </Card>
        </div>
      </section>

      <section className="border-t border-hairline">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <p className="text-caption text-ember-400">Lineage</p>
          <h2 className="text-display-md mt-3 max-w-[26ch] text-platinum-100">
            Where this Ingot came from — and what came from it.
          </h2>
          <div className="mt-8">
            <LineageGraph nodes={i.lineage} />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
