import { notFound } from "next/navigation";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { Pill } from "@/components/ui/Pill";
import { Card, CardEyebrow, CardTitle, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AttributionBloom } from "@/components/motion/AttributionBloom";
import { TEEViewer } from "@/components/app/TEEViewer";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Sprint 1: rendered from indexer once contracts deploy. Until then, a
// representative Forge that exercises every brand state.
const sampleForges: Record<
  string,
  {
    name: string;
    state: "OPEN" | "EVALUATING" | "MINTING" | "TRAINING" | "LIVE";
    creator: string;
    coordinator: string;
    modelSpec: string;
    summary: string;
    contributions: {
      smith: string;
      type: "data" | "compute" | "capital";
      delta: number;
      amount?: string;
    }[];
  }
> = {
  "0x42": {
    name: "Konkani Translator",
    state: "EVALUATING",
    creator: "0xCa…fe",
    coordinator: "0xC0…0d",
    modelSpec: "lora-low-resource-translation",
    summary:
      "A Konkani↔English LoRA, fine-tuned from a small open base model. Native speakers welcome — contribute a sentence corpus and own a share.",
    contributions: [
      { smith: "0x8e…a2", type: "data", delta: 0.42 },
      { smith: "0xb1…9f", type: "data", delta: 0.21 },
      { smith: "0x44…0c", type: "compute", delta: 0.18, amount: "0.20 OG" },
      { smith: "0x7c…d3", type: "capital", delta: 0.12, amount: "0.10 OG" },
      { smith: "0x2a…15", type: "data", delta: 0.07 },
    ],
  },
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const f = sampleForges[id];
  return {
    title: f ? `${f.name} — Forge` : "Forge",
  };
}

export default async function ForgeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const f = sampleForges[id];
  if (!f) notFound();

  const tones = {
    OPEN: "positive",
    EVALUATING: "ember",
    MINTING: "warn",
    TRAINING: "neutral",
    LIVE: "positive",
  } as const;

  return (
    <main>
      <Header />

      <section className="border-hairline border-t">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <div className="flex items-center gap-3">
            <p className="text-caption text-platinum-400">Forge · 0x{id}</p>
            <Pill tone={tones[f.state]} dot>
              {f.state}
            </Pill>
          </div>
          <h1 className="text-display-xl text-platinum-100 mt-3 max-w-[24ch]">
            {f.name}
          </h1>
          <p className="text-body-lg text-platinum-300 mt-6 max-w-[60ch]">
            {f.summary}
          </p>

          <div className="border-hairline mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg md:grid-cols-4">
            <Stat label="Contributions" value={String(f.contributions.length)} />
            <Stat label="State" value={f.state} />
            <Stat label="Creator" value={f.creator} mono />
            <Stat label="Eval coordinator" value={f.coordinator} mono />
          </div>
        </div>
      </section>

      <section className="border-hairline border-t">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-6 py-16 lg:grid-cols-[1.4fr_1fr]">
          <Card elevated>
            <CardEyebrow>Live attribution preview</CardEyebrow>
            <CardTitle>Marginal Δ per contribution</CardTitle>
            <CardBody>
              Score vector emitted by the TEE eval — each Δ is what your contribution
              moved the holdout score by. Shares mint proportionally.
            </CardBody>
            <div className="mt-8">
              <AttributionBloom rows={f.contributions} />
            </div>
          </Card>

          <div className="space-y-5">
            <TEEViewer
              state={
                f.state === "EVALUATING"
                  ? "scoring"
                  : f.state === "MINTING"
                    ? "done"
                    : "idle"
              }
              baselineScore={21.4}
              measuredScore={
                f.state === "MINTING" || f.state === "TRAINING" || f.state === "LIVE"
                  ? 38.7
                  : undefined
              }
            />
            <Card>
              <CardEyebrow>Contribute</CardEyebrow>
              <CardTitle>Pick a contribution type</CardTitle>
              <CardBody>
                Wallet connection lands Sprint 1 — the buttons below are the final
                surface area.
              </CardBody>
              <div className="mt-5 flex flex-col gap-2">
                <Button variant="primary" disabled>
                  Contribute data
                </Button>
                <Button variant="secondary" disabled>
                  Contribute compute
                </Button>
                <Button variant="secondary" disabled>
                  Fund the Forge
                </Button>
              </div>
            </Card>

            <Card>
              <CardEyebrow>Spec</CardEyebrow>
              <CardTitle>Model & eval</CardTitle>
              <dl className="text-body-sm mt-5 space-y-3">
                <Row k="modelSpec" v={f.modelSpec} mono />
                <Row k="data weight" v="70%" />
                <Row k="compute weight" v="20%" />
                <Row k="capital weight" v="10%" />
                <Row k="per-wallet cap" v="5 contributions" />
              </dl>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Stat({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="bg-ink-900 p-5">
      <p className="text-caption text-platinum-400">{label}</p>
      <p
        className={`text-title-lg text-platinum-100 mt-2 ${
          mono ? "text-mono font-mono" : "tabular"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="border-hairline flex items-center justify-between gap-4 border-b pb-2 last:border-b-0 last:pb-0">
      <dt className="text-caption text-platinum-400">{k}</dt>
      <dd
        className={`text-body text-platinum-200 ${
          mono ? "text-mono-sm font-mono" : ""
        }`}
      >
        {v}
      </dd>
    </div>
  );
}
