import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { Pill } from "@/components/ui/Pill";
import { TryIngot } from "@/components/marketing/TryIngot";
import { getStats } from "@/lib/stats-data";
import { getChain } from "@/lib/chain";

export const metadata: Metadata = {
  title: "Judges · 60-second tour",
  description:
    "Wallet-less, pre-funded demo path for hackathon judges. Run inference against a live Ingot, inspect the TEE attestation, and trace revenue routing — all without setting up a wallet.",
  robots: { index: false, follow: false },
};

export const revalidate = 10;

const DEPLOYMENTS = [
  {
    name: "FORGEToken",
    addr: "0xE716B0260f462b2A1789cB6cfCBd825736b920Ca",
    note: "ERC-20 protocol token · governance + share denomination",
  },
  {
    name: "ForgeFactory",
    addr: "0x636109264EBF6cFD18CC38bD43eDf9cCad7ae23D",
    note: "Deploys new Forges · single source of truth for live Forges",
  },
  {
    name: "ContributionRegistry",
    addr: "0x05235Ba0F2a77bcaB87371E4d797D6830ddC2d86",
    note: "Append-only log of every data/compute/capital contribution",
  },
  {
    name: "Ingot",
    addr: "0x39B736f424754d05a0da186d89015b74d1DDe1d3",
    note: "Per-Ingot share ledger · packed mapping · Agent ID linkage",
  },
  {
    name: "RevenueSplitter",
    addr: "0xC58E0F32BD43e43153D3CA8ee8F25C8198789289",
    note: "Pull-payment claims · sum-invariant tested · reentrancy-guarded",
  },
  {
    name: "IngotRegistry",
    addr: "0xF8f3fAE648A8d7ee4Df0A7b10a0F759938aab7e1",
    note: "Per-Ingot provider mapping · resolves an Ingot → 0G Compute provider",
  },
];

const STOPS = [
  {
    n: 1,
    title: "Run inference against a live Ingot",
    body: "Use the widget below. Request routes through the OpenAI-compatible Foundry proxy → 0G Compute via the serving broker. The response carries a mode flag (live | tee | stub) and on-chain tx hashes when fees are reserved.",
    link: { href: "#try-an-ingot", label: "Jump to widget" },
  },
  {
    n: 2,
    title: "Inspect a Forge end-to-end",
    body: "The Forge explorer shows every contribution, the eval state, the TEE attestation, and the resulting Ingot's cap table. State transitions are emitted from on-chain events — nothing is faked.",
    link: { href: "/forges", label: "Open Forge explorer" },
  },
  {
    n: 3,
    title: "Trace revenue routing on-chain",
    body: "Every inference call deposits into RevenueSplitter.receivePayment(tokenId). Co-owners pull-claim. The Ingot page shows claimable balance per address; the dashboard shows protocol-wide totals.",
    link: { href: "/dashboard", label: "Open dashboard" },
  },
  {
    n: 4,
    title: "Read the SDK in 3 lines",
    body: "The npm package wraps everything — three lines of TypeScript get you a working inference call with revenue routed automatically. Vercel AI / LangChain / OpenAI-compat adapters slot Ingots into existing agent code.",
    link: { href: "/build-on-foundry", label: "See the SDK" },
  },
  {
    n: 5,
    title: "Walk the lineage graph",
    body: "Every Ingot has a parent Forge; reforged Ingots have parent Ingots. The graph is the public record of how every model on Foundry was made.",
    link: { href: "/lineage", label: "Open lineage graph" },
  },
];

const HEADLINES = [
  {
    metric: "6 / 6",
    label: "0G surfaces used",
    detail: "Chain · Storage Log · Storage KV · Compute · TEE · Agent ID",
  },
  {
    metric: "100%",
    label: "Line coverage target on contracts",
    detail: "forge coverage + fuzz on mintOwnership + invariant on splitter",
  },
  {
    metric: "3",
    label: "Agent-framework adapters published on npm",
    detail: "Vercel AI · LangChain · OpenAI-compat HTTP proxy",
  },
  {
    metric: "0",
    label: "Mocked 0G integrations",
    detail: "Every 0G surface is load-bearing. Pull one → protocol breaks.",
  },
];

export default async function JudgesPage() {
  const chain = getChain();
  const stats = await getStats().catch(() => null);

  return (
    <main className="min-h-screen bg-ink-950">
      <Header />

      <section className="relative mx-auto max-w-[1280px] px-6 pt-24 pb-12">
        <Pill tone="ember" dot>
          For 0G APAC Hackathon judges
        </Pill>
        <h1 className="text-display-xxl text-platinum-100 mt-6 max-w-[26ch]">
          Foundry in 60 seconds —
          <span className="block text-ember-300 text-serif-display">
            no wallet required.
          </span>
        </h1>
        <p className="text-body-lg text-platinum-300 mt-6 max-w-[68ch]">
          You can verify every claim Foundry makes from this page. The
          inference widget calls a live Ingot on 0G Aristotle mainnet. The
          deployment table links to {chain.network}. The dashboard counters
          are rendered from on-chain events. Nothing here is staged.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {HEADLINES.map((h) => (
            <div
              key={h.label}
              className="rounded-2xl border-hairline bg-ink-900/60 p-5"
            >
              <div className="text-display text-ember-300 tabular">
                {h.metric}
              </div>
              <div className="text-caption text-platinum-200 mt-2">
                {h.label}
              </div>
              <div className="text-mono-sm text-platinum-500 mt-1">
                {h.detail}
              </div>
            </div>
          ))}
        </div>
      </section>

      <TryIngot />

      <section className="mx-auto max-w-[1280px] px-6 py-20">
        <h2 className="text-display-xl text-platinum-100">The five stops</h2>
        <p className="text-body text-platinum-400 mt-3 max-w-[64ch]">
          Each stop verifies a different claim. Total time: about ten minutes
          end-to-end. Two minutes if you only want stop 1.
        </p>

        <ol className="mt-10 space-y-5">
          {STOPS.map((s) => (
            <li
              key={s.n}
              className="rounded-2xl border-hairline bg-ink-900/40 p-6 md:p-8"
            >
              <div className="flex items-baseline gap-4">
                <span className="text-display text-ember-300 tabular">
                  {String(s.n).padStart(2, "0")}
                </span>
                <h3 className="text-display-sm text-platinum-100">
                  {s.title}
                </h3>
              </div>
              <p className="text-body text-platinum-300 mt-3 max-w-[72ch]">
                {s.body}
              </p>
              <Link
                href={s.link.href}
                className="text-mono-sm text-ember-300 hover:text-ember-200 mt-4 inline-flex items-center gap-1"
              >
                {s.link.label} →
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-20">
        <h2 className="text-display-xl text-platinum-100">
          Verifiable deployment
        </h2>
        <p className="text-body text-platinum-400 mt-3 max-w-[64ch]">
          All six contracts live on 0G Aristotle (chain id 16661). Source is
          verified on the 0G explorer. Click any address to inspect.
        </p>
        <div className="mt-8 overflow-hidden rounded-2xl border-hairline">
          <table className="w-full text-left">
            <thead className="bg-ink-900/60 text-mono-sm text-platinum-400">
              <tr>
                <th className="px-4 py-3 font-medium">Contract</th>
                <th className="px-4 py-3 font-medium">Address</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">
                  Role
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-platinum-900/40 bg-ink-950/60">
              {DEPLOYMENTS.map((d) => (
                <tr key={d.addr}>
                  <td className="px-4 py-3 text-mono-sm text-platinum-100">
                    {d.name}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`https://chainscan.0g.ai/address/${d.addr}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-mono-sm text-ember-300 hover:underline"
                    >
                      {d.addr}
                    </a>
                  </td>
                  <td className="hidden px-4 py-3 text-mono-sm text-platinum-400 md:table-cell">
                    {d.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-20">
        <h2 className="text-display-xl text-platinum-100">
          What we want you to grade us on
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border-hairline bg-ink-900/40 p-6">
            <Pill tone="ember">Innovation</Pill>
            <p className="text-body text-platinum-300 mt-4">
              No other project on 0G — or in the broader AI×crypto landscape —
              ships a primitive that turns &ldquo;contributing to a model&rsquo;s
              training&rdquo; into &ldquo;owning a share of its revenue forever.&rdquo;
              See{" "}
              <Link
                href="/docs/protocol-overview"
                className="text-ember-300 hover:underline"
              >
                protocol overview
              </Link>
              .
            </p>
          </div>
          <div className="rounded-2xl border-hairline bg-ink-900/40 p-6">
            <Pill tone="ember">Execution</Pill>
            <p className="text-body text-platinum-300 mt-4">
              Six contracts, ~100% line coverage, TEE attestation parsed
              on-chain, npm SDK with three adapters, Next.js 16 web surface,
              indexer, eval coordinator. None of it is mocked. See{" "}
              <Link
                href="/docs/real-vs-roadmap"
                className="text-ember-300 hover:underline"
              >
                real vs roadmap
              </Link>
              .
            </p>
          </div>
          <div className="rounded-2xl border-hairline bg-ink-900/40 p-6">
            <Pill tone="ember">0G integration</Pill>
            <p className="text-body text-platinum-300 mt-4">
              Every 0G surface is load-bearing. Foundry generates chain txs,
              storage uploads, compute hours, TEE jobs, and Agent IDs as the
              direct result of its core loop. Every Forge created grows 0G.
              See{" "}
              <Link
                href="/docs/protocol-overview"
                className="text-ember-300 hover:underline"
              >
                integration matrix
              </Link>
              .
            </p>
          </div>
          <div className="rounded-2xl border-hairline bg-ink-900/40 p-6">
            <Pill tone="ember">Future</Pill>
            <p className="text-body text-platinum-300 mt-4">
              The hackathon ends; Foundry doesn&rsquo;t. Audit, Shapley v2,
              secondary market for shares, and 50 Forges live by Month 6 are
              all funded by current grant runway. See the{" "}
              <a
                href="https://github.com/rajkaria/foundry/blob/main/docs/VISION.md"
                target="_blank"
                rel="noreferrer"
                className="text-ember-300 hover:underline"
              >
                vision doc
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {stats && (
        <section className="mx-auto max-w-[1280px] px-6 pb-24">
          <p className="text-mono-sm text-platinum-500">
            Live (from on-chain events): {stats.forges} Forges · {stats.ingots}{" "}
            Ingots · {stats.contributions} contributions · last block{" "}
            {stats.lastBlock.toString()}
          </p>
        </section>
      )}

      <Footer />
    </main>
  );
}
