import { notFound } from "next/navigation";
import { isAddress, type Address } from "viem";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { Pill } from "@/components/ui/Pill";
import { Card, CardEyebrow, CardTitle, CardBody } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { AttributionBloom } from "@/components/motion/AttributionBloom";
import { TEEViewer } from "@/components/app/TEEViewer";
import {
  getForge,
  listContributions,
  type ForgeSummary,
  type ContributionRow,
} from "@/lib/forges-data";
import { explorerAddress, explorerTx, getChain, shortAddr } from "@/lib/chain";
import {
  getManifest,
  isContentVerified,
  type ForgeManifest,
} from "@/lib/forge-manifest";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 10;

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  if (!isAddress(id)) return { title: "Forge" };
  const m = await getManifest(id);
  return {
    title: m ? `${m.title} — Forge` : `Forge ${shortAddr(id)}`,
    description: m?.summary,
  };
}

const STATE_TONE = {
  OPEN: "positive",
  EVALUATING: "ember",
  MINTING: "warn",
  TRAINING: "neutral",
  LIVE: "positive",
} as const;

const STATE_MEANING: Record<ForgeSummary["state"], string> = {
  OPEN: "Accepting contributions. Data, compute, and capital can be added until the window closes.",
  EVALUATING:
    "The contribution window has closed. The TEE eval coordinator is scoring each contribution against the held-out set.",
  MINTING:
    "Scoring is done. Ownership shares of the Ingot are minting proportionally to measured contribution.",
  TRAINING:
    "Shares are settled. The model is being trained / packaged from the contributed inputs.",
  LIVE: "The Ingot is live. It can be run for inference and earns revenue that routes back to contributors.",
};

const TASK_LABEL: Record<string, string> = {
  translation: "Translation",
  classification: "Classification",
  embedding: "Embedding",
  generation: "Generation",
};

function windowState(forge: ForgeSummary): { open: boolean; label: string } {
  const now = Math.floor(Date.now() / 1000);
  const ends = forge.contributionWindowEnds;
  if (forge.state !== "OPEN")
    return { open: false, label: "Contribution window closed" };
  if (!ends || ends <= now)
    return { open: false, label: "Contribution window elapsed" };
  const secs = ends - now;
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const left = d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`;
  return { open: true, label: `Open · ${left} left to contribute` };
}

/** Numbered, phase-aware participation path. */
function participationSteps(
  open: boolean,
  m: ForgeManifest | null
): { n: number; title: string; body: string }[] {
  if (open) {
    const w = m?.weights;
    const split = w
      ? `Attribution splits ${w.data / 100}% to data, ${
          w.compute / 100
        }% to compute, ${w.capital / 100}% to capital.`
      : "Attribution splits across data, compute, and capital per the Forge spec.";
    return [
      {
        n: 1,
        title: "Connect a wallet",
        body: "Any 0G Aristotle wallet works. You sign contributions yourself — Foundry never custodies your data or keys.",
      },
      {
        n: 2,
        title: "Pick how you contribute",
        body:
          "Data (datasets matching the guidance below), Compute (run the fine-tune / eval jobs), or Capital (fund eval-set curation and bounties). " +
          split,
      },
      {
        n: 3,
        title: "Submit on-chain",
        body: "Your contribution's storage root is logged to the ContributionRegistry — timestamped, attributable, and replayable by anyone.",
      },
      {
        n: 4,
        title: "Eval scores it in a TEE",
        body: "When the window closes, the eval coordinator measures each contribution's marginal effect on the held-out set inside a trusted enclave.",
      },
      {
        n: 5,
        title: "Ownership mints to you",
        body: "Ingot shares mint proportionally to your measured contribution. Inference revenue then routes to holders automatically.",
      },
    ];
  }
  return [
    {
      n: 1,
      title: "Contributions are locked",
      body: "The window for this Forge has closed — new data/compute/capital can't change ownership of this Ingot.",
    },
    {
      n: 2,
      title: "Watch attribution settle",
      body: "Follow the live attribution panel below as the TEE-attested score vector resolves each contributor's share.",
    },
    {
      n: 3,
      title: "Use the resulting Ingot",
      body: "Once LIVE, run the model via Foundry's OpenAI-compatible proxy — revenue from that usage routes back to contributors.",
    },
    {
      n: 4,
      title: "Fork it in a new Forge",
      body: "Start a downstream Forge from this Ingot. Lineage and attribution carry forward automatically.",
    },
  ];
}

const GENERIC_USE_CASES = [
  {
    title: "Run it via the proxy",
    body: "Every Ingot is callable through Foundry's OpenAI-compatible endpoint — no bespoke serving.",
  },
  {
    title: "Earn from usage",
    body: "Inference revenue routes on-chain to contributors in proportion to their attributed share.",
  },
  {
    title: "Compose via lineage",
    body: "Fork the Ingot into a new Forge; attribution and provenance carry forward.",
  },
];

export default async function ForgeDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isAddress(id)) notFound();
  const chain = getChain();
  if (!chain.isLive) notFound();

  const forge = await getForge(id as Address);
  if (!forge) notFound();

  const [contributions, manifest] = await Promise.all([
    listContributions(forge.address),
    getManifest(forge.address),
  ]);

  const verified = manifest ? isContentVerified(manifest, forge.modelSpec) : false;
  const win = windowState(forge);
  const steps = participationSteps(win.open, manifest);

  const byType = countByType(contributions);
  const bloomRows = contributions.slice(0, 6).map((c) => ({
    smith: shortAddr(c.smith),
    type: c.type,
    delta:
      forge.contributionsCount > 0 ? 1 / Math.max(forge.contributionsCount, 5) : 0.2,
  }));

  const title = manifest?.title ?? `Forge ${shortAddr(forge.address)}`;
  const summary =
    manifest?.summary ??
    "A training collective on 0G mainnet. Contributions are logged on-chain; ownership mints proportionally when the eval coordinator submits a TEE-attested score vector.";

  return (
    <main>
      <Header />

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="border-hairline border-t">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-caption text-platinum-400">
              Forge · {shortAddr(forge.address)}
            </p>
            <Pill tone={STATE_TONE[forge.state]} dot>
              {forge.state}
            </Pill>
            {manifest && (
              <Pill tone="ember">
                {TASK_LABEL[manifest.modelSpec.task] ?? manifest.modelSpec.task}
              </Pill>
            )}
            <Pill tone={verified ? "positive" : "neutral"} dot={verified}>
              {verified ? "Content-verified ✓" : "Off-chain manifest"}
            </Pill>
          </div>
          <h1 className="text-display-xl text-platinum-100 mt-4 max-w-[22ch]">
            {title}
          </h1>
          <p className="text-body-lg text-platinum-300 mt-5 max-w-[68ch]">{summary}</p>

          <div className="border-hairline mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg md:grid-cols-4">
            <Stat label="Contributions" value={String(forge.contributionsCount)} />
            <Stat label="Phase" value={forge.state} />
            <Stat label="Window" value={win.open ? "Open" : "Closed"} />
            <Stat label="Creator" value={shortAddr(forge.creator)} mono />
          </div>

          <p className="text-mono-sm text-platinum-400 mt-4">
            {win.label} ·{" "}
            <a
              href={explorerAddress(forge.address)}
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-platinum-200 underline-offset-2 transition-colors hover:underline"
            >
              view on explorer ↗
            </a>
          </p>
        </div>
      </section>

      {/* ── About ──────────────────────────────────────────────── */}
      <section className="border-hairline border-t">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-6 py-16 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="text-caption text-ember-400">About this Forge</p>
            <h2 className="text-display-sm text-platinum-100 mt-3">
              What it&apos;s training, and why
            </h2>
            <p className="text-body text-platinum-300 mt-5 max-w-[64ch]">
              {manifest?.about ??
                "This Forge pools data, compute, and capital to train one Ingot. Every input is logged on-chain and scored by its measured effect on a held-out evaluation, so ownership reflects real contribution rather than who showed up first."}
            </p>

            {manifest && (
              <div className="border-hairline mt-8 grid grid-cols-2 gap-x-8 gap-y-5 border-t pt-6 sm:grid-cols-3">
                <Field k="Base model" v={manifest.modelSpec.baseModel} />
                <Field
                  k="Task"
                  v={TASK_LABEL[manifest.modelSpec.task] ?? manifest.modelSpec.task}
                />
                <Field
                  k="Fine-tune"
                  v={manifest.modelSpec.fineTuneMethod.toUpperCase()}
                />
                <Field k="Eval metric" v={manifest.evalSpec.metric.toUpperCase()} />
                <Field
                  k="Holdout size"
                  v={manifest.evalSpec.sizeTarget.toLocaleString()}
                />
                {manifest.modelSpec.languages && (
                  <Field k="Languages" v={manifest.modelSpec.languages.join(" · ")} />
                )}
              </div>
            )}
          </div>

          <Card elevated>
            <CardEyebrow>Who should contribute</CardEyebrow>
            <CardTitle>This Forge needs</CardTitle>
            <ul className="mt-5 space-y-3">
              {(
                manifest?.audience ?? [
                  "Anyone with relevant, openly licensed data",
                  "Compute providers to run fine-tune and eval jobs",
                  "Backers funding eval-set curation",
                ]
              ).map((a) => (
                <li key={a} className="text-body-sm text-platinum-200 flex gap-2.5">
                  <span className="text-ember-500 mt-0.5">→</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* ── Participate ────────────────────────────────────────── */}
      <section className="border-hairline border-t">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-caption text-ember-400">Participate</p>
              <h2 className="text-display-sm text-platinum-100 mt-3">
                {win.open ? "How to join this Forge" : "Where this Forge goes next"}
              </h2>
            </div>
            <Pill tone={win.open ? "positive" : "neutral"} dot={win.open}>
              {win.label}
            </Pill>
          </div>

          <ol className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-lg md:grid-cols-2 lg:grid-cols-5">
            {steps.map((s) => (
              <li key={s.n} className="bg-ink-900 flex flex-col gap-3 p-6">
                <span className="text-ember-400 text-mono-sm tabular">
                  {String(s.n).padStart(2, "0")}
                </span>
                <p className="text-title-md text-platinum-100">{s.title}</p>
                <p className="text-body-sm text-platinum-400">{s.body}</p>
              </li>
            ))}
          </ol>

          {manifest && win.open && (
            <div className="mt-10">
              <p className="text-caption text-platinum-400">
                What good data looks like here
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                {manifest.datasetGuidance.map((g) => (
                  <div
                    key={g}
                    className="border-hairline bg-ink-900 text-body-sm text-platinum-200 flex gap-2.5 rounded-md border p-4"
                  >
                    <span className="text-ember-500">·</span>
                    <span>{g}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            <LinkButton href="/forges/new" variant="primary">
              {win.open ? "Contribute via the wizard →" : "Start a new Forge →"}
            </LinkButton>
            <LinkButton href="/docs/build-on-foundry" variant="secondary">
              Read the contributor guide
            </LinkButton>
          </div>
        </div>
      </section>

      {/* ── What you earn ──────────────────────────────────────── */}
      <section className="border-hairline border-t">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <p className="text-caption text-ember-400">What you earn</p>
          <h2 className="text-display-sm text-platinum-100 mt-3 max-w-[26ch]">
            Contribution becomes ownership — provably
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            <Benefit
              title="Proportional Ingot ownership"
              body="Shares of the Ingot NFT mint to you in proportion to your TEE-measured marginal contribution. Not a flat bounty — equity."
            />
            <Benefit
              title="On-chain revenue share"
              body="Every paid inference call on the Ingot routes a fee through the RevenueSplitter to holders, automatically and forever."
            />
            <Benefit
              title="Permanent attribution"
              body="Your contribution and its score are logged on 0G — replayable, portable, and inherited by any downstream fork."
            />
          </div>
        </div>
      </section>

      {/* ── Use cases ──────────────────────────────────────────── */}
      <section className="border-hairline border-t">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <p className="text-caption text-ember-400">Use cases</p>
          <h2 className="text-display-sm text-platinum-100 mt-3 max-w-[26ch]">
            What the resulting Ingot unlocks
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {(manifest?.useCases ?? GENERIC_USE_CASES).map((u) => (
              <Card key={u.title}>
                <CardTitle className="text-title-md">{u.title}</CardTitle>
                <CardBody>{u.body}</CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live attribution + eval + contributions ────────────── */}
      <section className="border-hairline border-t">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-6 py-16 lg:grid-cols-[1.4fr_1fr]">
          <Card elevated>
            <CardEyebrow>Live attribution</CardEyebrow>
            <CardTitle>Marginal Δ per contribution</CardTitle>
            <CardBody>
              {forge.state === "OPEN"
                ? "Eval has not yet run. Score deltas materialise after the TEE coordinator submits the attested score vector."
                : "Score vector emitted by the TEE eval. Shares mint proportionally to these deltas."}
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

            <div className="border-hairline mt-8 flex flex-wrap gap-6 border-t pt-6">
              <Field k="Data" v={String(byType.data)} />
              <Field k="Compute" v={String(byType.compute)} />
              <Field k="Capital" v={String(byType.capital)} />
              <Field k="Eval coordinator" v={shortAddr(forge.evalCoordinator)} />
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
            <Card>
              <CardEyebrow>Phase</CardEyebrow>
              <CardTitle className="text-title-md">{forge.state}</CardTitle>
              <CardBody>{STATE_MEANING[forge.state]}</CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Recent contributions ───────────────────────────────── */}
      {contributions.length > 0 && (
        <section className="border-hairline border-t">
          <div className="mx-auto max-w-[1280px] px-6 py-16">
            <p className="text-caption text-ember-400">On-chain activity</p>
            <h2 className="text-display-sm text-platinum-100 mt-3">
              Recent contributions
            </h2>
            <div className="border-hairline mt-8 overflow-hidden rounded-lg border">
              {contributions.slice(0, 12).map((c, i) => (
                <a
                  key={`${c.txHash}-${i}`}
                  href={explorerTx(c.txHash)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="bg-ink-900 hover:bg-ink-800 border-hairline flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 transition-colors last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <Pill
                      tone={
                        c.type === "data"
                          ? "ember"
                          : c.type === "compute"
                            ? "warn"
                            : "neutral"
                      }
                    >
                      {c.type}
                    </Pill>
                    <span className="text-mono-sm text-platinum-200">
                      {shortAddr(c.smith)}
                    </span>
                  </div>
                  <span className="text-mono-sm text-platinum-400">
                    {c.timestamp ? new Date(c.timestamp * 1000).toLocaleString() : "—"}{" "}
                    ↗
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}

function countByType(rows: ContributionRow[]) {
  const c = { data: 0, compute: 0, capital: 0 };
  for (const r of rows) c[r.type] += 1;
  return c;
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

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-caption text-platinum-400">{k}</p>
      <p className="text-body text-platinum-100 mt-1">{v}</p>
    </div>
  );
}

function Benefit({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-hairline bg-ink-900 rounded-lg border p-6">
      <p className="text-title-md text-platinum-100">{title}</p>
      <p className="text-body-sm text-platinum-400 mt-3">{body}</p>
    </div>
  );
}
