import Link from "next/link";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { Pill } from "@/components/ui/Pill";
import { Card, CardEyebrow, CardTitle, CardBody } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { EmptyChainState } from "@/components/app/EmptyChainState";
import { listForges } from "@/lib/forges-data";
import { getChain, shortAddr } from "@/lib/chain";
import { getAllManifests, type ForgeManifest } from "@/lib/forge-manifest";

export const metadata = {
  title: "Forges — collectively trained models on 0G",
  description:
    "Each Forge pools data, compute, and capital to train one open model. Contribute and own a measured slice of the result.",
};
export const revalidate = 10;

const TASK_LABEL: Record<string, string> = {
  translation: "Translation",
  classification: "Classification",
  embedding: "Embedding",
  generation: "Generation",
};

const STATE_TONE = {
  OPEN: "positive",
  LIVE: "positive",
  EVALUATING: "ember",
  MINTING: "warn",
  TRAINING: "neutral",
} as const;

function windowOpen(state: string, ends: number): boolean {
  return state === "OPEN" && ends > Math.floor(Date.now() / 1000);
}

export default async function ForgesPage() {
  const chain = getChain();
  const [forges, manifests] = await Promise.all([
    listForges().catch(() => []),
    getAllManifests().catch(() => ({}) as Record<string, ForgeManifest>),
  ]);

  return (
    <main>
      <Header />
      <section className="bg-stage border-hairline glow-ember border-t">
        <div className="mx-auto max-w-[1280px] px-6 py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-caption text-ember-400 flex items-center gap-2">
                <span className="bg-ember-500/70 inline-block h-px w-6" />
                Forges
              </p>
              <h1 className="text-display-xl text-platinum-100 mt-4 max-w-[16ch] text-balance">
                Models, trained by whoever shows up.
              </h1>
              <p className="text-body-lg text-platinum-300 mt-5 max-w-[64ch]">
                A Forge is a collective that trains one open model — an{" "}
                <span className="text-platinum-100">Ingot</span>. Anyone can add{" "}
                <span className="text-platinum-100">data</span>,{" "}
                <span className="text-platinum-100">compute</span>, or{" "}
                <span className="text-platinum-100">capital</span>. A TEE eval measures
                how much each contribution actually moved the model, and ownership mints
                in exactly that proportion. Revenue from running the Ingot routes back
                to owners on-chain — forever.
              </p>
            </div>
            <LinkButton href="/forges/new" size="lg" trailing={<span aria-hidden>→</span>}>
              Create with AI
            </LinkButton>
          </div>

          <div className="ember-rule mt-10" />

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <HowTile
              k="01"
              t="Contribute"
              b="Bring openly licensed data, run training/eval compute, or fund the eval set. Every input is logged on 0G."
            />
            <HowTile
              k="02"
              t="Get measured"
              b="The eval coordinator scores each contribution's marginal effect on a held-out set inside a trusted enclave."
            />
            <HowTile
              k="03"
              t="Own & earn"
              b="Ingot shares mint proportionally. Inference revenue then splits to contributors automatically."
            />
          </div>

          {!chain.isLive ? (
            <div className="mt-12">
              <EmptyChainState
                network={chain.network}
                title={`No Forge contracts deployed on 0G ${chain.network} yet.`}
                body="The protocol contracts compile and pass full tests locally. Deploy them with `make deploy-aristotle` (or `deploy-galileo` / `deploy-local`) and addresses will sync automatically. Until then, this page is intentionally empty rather than mocked."
              />
            </div>
          ) : forges.length === 0 ? (
            <div className="mt-12">
              <EmptyChainState
                network={chain.network}
                title="No Forges yet on this network."
                body="Contracts are deployed but no Forge has been created. Spin up the first one — it'll appear here within the next block."
                cta={{ href: "/forges/new", label: "Create the first Forge" }}
              />
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {forges.map((f, i) => {
                const m = manifests[f.address.toLowerCase()];
                const open = windowOpen(f.state, f.contributionWindowEnds);
                const live = open || f.state === "LIVE";
                return (
                  <Link
                    key={f.address}
                    href={`/forges/${f.address}`}
                    className="rise-in group block"
                    style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
                  >
                    <Card interactive className="flex h-full flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <CardEyebrow className="mb-0">
                          {m
                            ? (TASK_LABEL[m.modelSpec.task] ?? m.modelSpec.task)
                            : shortAddr(f.address)}
                        </CardEyebrow>
                        <Pill
                          tone={STATE_TONE[f.state] ?? "neutral"}
                          dot
                          pulse={live}
                        >
                          {f.state}
                        </Pill>
                      </div>

                      <CardTitle className="group-hover:text-ember-300 mt-3 transition-colors">
                        {m ? m.title : `Forge ${shortAddr(f.address)}`}
                      </CardTitle>
                      <CardBody className="line-clamp-3">
                        {m
                          ? m.summary
                          : `Creator ${shortAddr(f.creator)} · a training collective on 0G ${chain.network}.`}
                      </CardBody>

                      {m && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          <Pill tone="neutral">{m.modelSpec.baseModel}</Pill>
                          <Pill tone="neutral">
                            {m.modelSpec.fineTuneMethod.toUpperCase()}
                          </Pill>
                        </div>
                      )}

                      <div className="border-hairline text-caption mt-auto flex items-center justify-between border-t pt-4">
                        <span className="text-platinum-400">
                          <span className="text-platinum-100 tabular">
                            {f.contributionsCount}
                          </span>{" "}
                          contributions
                        </span>
                        <span
                          className={
                            open
                              ? "text-signal-positive"
                              : "text-platinum-500"
                          }
                        >
                          {open ? "Open to contribute" : "Window closed"}
                        </span>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

function HowTile({ k, t, b }: { k: string; t: string; b: string }) {
  return (
    <div className="surface-forged hover-lift group rounded-lg p-6">
      <span className="border-ember-500/30 bg-ember-500/10 text-ember-400 text-mono tabular inline-flex size-9 items-center justify-center rounded-md border">
        {k}
      </span>
      <p className="text-title-md text-platinum-100 mt-4">{t}</p>
      <p className="text-body-sm text-platinum-400 mt-2">{b}</p>
    </div>
  );
}
