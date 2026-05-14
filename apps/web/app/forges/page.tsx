import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { Pill } from "@/components/ui/Pill";
import { Card, CardEyebrow, CardTitle, CardBody } from "@/components/ui/Card";

export const metadata = { title: "Forges" };

// Placeholder list — replaced by indexer-fed data in Sprint 1.
const sampleForges = [
  {
    id: "0x42…81",
    name: "Konkani Translator",
    state: "OPEN" as const,
    contributors: 12,
    escrowed: "0.47 OG",
    closes: "in 38h",
    summary:
      "A low-resource-language translation LoRA — Konkani ↔ English. Native speakers welcome.",
  },
  {
    id: "0x39…04",
    name: "Contract-Clause Classifier",
    state: "EVALUATING" as const,
    contributors: 8,
    escrowed: "0.21 OG",
    closes: "scoring",
    summary:
      "Classifies risk in MSA / NDA clauses. Capital + counsel-grade data sets.",
  },
  {
    id: "0x21…b0",
    name: "Tulu ↔ English",
    state: "MINTING" as const,
    contributors: 6,
    escrowed: "0.12 OG",
    closes: "shares about to mint",
    summary:
      "Public-goods Forge for a language with no Big-Tech support. Treasury-funded.",
  },
];

export default function ForgesPage() {
  return (
    <main>
      <Header />
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <p className="text-caption text-ember-400">Forges</p>
          <h1 className="text-display-lg mt-3 text-platinum-100">
            Active and recent collectives, on mainnet.
          </h1>
          <p className="text-body-lg mt-5 max-w-[60ch] text-platinum-300">
            Each Forge pools data, compute, and capital to train one Ingot.
            Connect a wallet to contribute. Ownership mints proportionally to
            measured contribution.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {sampleForges.map((f) => (
              <Card key={f.id}>
                <div className="flex items-start justify-between gap-3">
                  <CardEyebrow>{f.id}</CardEyebrow>
                  <Pill
                    tone={
                      f.state === "OPEN"
                        ? "positive"
                        : f.state === "EVALUATING"
                          ? "ember"
                          : "warn"
                    }
                    dot
                  >
                    {f.state}
                  </Pill>
                </div>
                <CardTitle>{f.name}</CardTitle>
                <CardBody>{f.summary}</CardBody>
                <div className="mt-6 grid grid-cols-3 gap-2 border-t border-hairline pt-5 text-caption text-platinum-400">
                  <div>
                    <span className="block text-platinum-200 tabular text-title-md">
                      {f.contributors}
                    </span>
                    Smiths
                  </div>
                  <div>
                    <span className="block text-platinum-200 tabular text-title-md">
                      {f.escrowed}
                    </span>
                    escrowed
                  </div>
                  <div>
                    <span className="block text-platinum-200 text-title-md">
                      {f.closes}
                    </span>
                    state
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <p className="text-body-sm mt-12 text-platinum-400">
            Live data wired in Sprint 1 — these cards render from the indexer
            once contracts are deployed.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
