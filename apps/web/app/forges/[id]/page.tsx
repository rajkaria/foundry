import { notFound } from "next/navigation";
import { isAddress, type Address } from "viem";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { Pill } from "@/components/ui/Pill";
import { Card, CardEyebrow, CardTitle, CardBody } from "@/components/ui/Card";
import { AttributionBloom } from "@/components/motion/AttributionBloom";
import { TEEViewer } from "@/components/app/TEEViewer";
import { getForge, listContributions } from "@/lib/forges-data";
import { explorerAddress, getChain, shortAddr } from "@/lib/chain";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 10;

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return { title: `Forge ${shortAddr(id)}` };
}

export default async function ForgeDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isAddress(id)) notFound();
  const chain = getChain();
  if (!chain.isLive) notFound();

  const forge = await getForge(id as Address);
  if (!forge) notFound();

  const contributions = await listContributions(forge.address);

  const bloomRows = contributions.slice(0, 5).map((c) => ({
    smith: shortAddr(c.smith),
    type: c.type,
    delta:
      forge.contributionsCount > 0 ? 1 / Math.max(forge.contributionsCount, 5) : 0.2,
  }));

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
            <p className="text-caption text-platinum-400">
              Forge · {shortAddr(forge.address)}
            </p>
            <Pill tone={tones[forge.state]} dot>
              {forge.state}
            </Pill>
          </div>
          <h1 className="text-display-xl text-platinum-100 mt-3 max-w-[24ch]">
            Forge {shortAddr(forge.address)}
          </h1>
          <p className="text-body-lg text-platinum-300 mt-6 max-w-[60ch]">
            A training collective on 0G {chain.network}. Contributions are logged
            on-chain; ownership mints proportionally when the eval coordinator submits a
            TEE-attested score vector.
          </p>

          <div className="border-hairline mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg md:grid-cols-4">
            <Stat label="Contributions" value={String(forge.contributionsCount)} />
            <Stat label="State" value={forge.state} />
            <Stat label="Creator" value={shortAddr(forge.creator)} mono />
            <Stat
              label="Eval coordinator"
              value={shortAddr(forge.evalCoordinator)}
              mono
            />
          </div>

          <p className="text-mono-sm text-platinum-400 mt-4">
            <a
              href={explorerAddress(forge.address)}
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-platinum-200 transition-colors"
            >
              view on explorer ↗
            </a>
          </p>
        </div>
      </section>

      <section className="border-hairline border-t">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-6 py-16 lg:grid-cols-[1.4fr_1fr]">
          <Card elevated>
            <CardEyebrow>Live attribution</CardEyebrow>
            <CardTitle>Marginal Δ per contribution</CardTitle>
            <CardBody>
              {forge.state === "OPEN"
                ? "Eval has not yet run. Score deltas materialise after the TEE coordinator submits the attested score vector."
                : "Score vector emitted by the TEE eval. Shares mint proportionally."}
            </CardBody>
            <div className="mt-8">
              {bloomRows.length > 0 ? (
                <AttributionBloom rows={bloomRows} />
              ) : (
                <p className="text-body-sm text-platinum-400">
                  No contributions yet. Be the first.
                </p>
              )}
            </div>
          </Card>

          <div className="space-y-5">
            <TEEViewer
              state={
                forge.state === "EVALUATING"
                  ? "scoring"
                  : forge.state === "MINTING" ||
                      forge.state === "TRAINING" ||
                      forge.state === "LIVE"
                    ? "done"
                    : "idle"
              }
            />
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
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="bg-ink-900 p-5">
      <p className="text-caption text-platinum-400">{label}</p>
      <p className={`text-title-md text-platinum-100 mt-1 ${mono ? "font-mono" : ""}`}>
        {value}
      </p>
    </div>
  );
}
