import type { Metadata } from "next";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LinkButton } from "@/components/ui/Button";
import {
  ECOSYSTEM_SORTED,
  STATUS_LABEL,
  type EcosystemPartner,
} from "@/data/ecosystem";

export const metadata: Metadata = {
  title: "Ecosystem",
  description:
    "0G projects building on Foundry — the ownership and revenue layer for decentralized AI. Partnerships, integrations, and collaborations across the 0G stack.",
  alternates: { canonical: "/ecosystem" },
  openGraph: {
    title: "Foundry Ecosystem",
    description:
      "0G projects building on Foundry — co-owned, revenue-sharing, verifiable AI.",
    url: "/ecosystem",
  },
};

const statusStyle: Record<string, string> = {
  live: "text-signal-positive border-[color-mix(in_oklab,var(--signal-positive)_40%,transparent)]",
  building:
    "text-ember-400 border-[color-mix(in_oklab,var(--ember-500)_40%,transparent)]",
  planned: "text-platinum-400 border-hairline",
};

function Monogram({ partner }: { partner: EcosystemPartner }) {
  const initials = partner.name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      aria-hidden
      className="flex size-12 shrink-0 items-center justify-center rounded-lg text-[17px] font-semibold"
      style={{
        background: `color-mix(in oklab, ${partner.accent ?? "#ff8a1a"} 22%, var(--ink-900))`,
        color: partner.accent ?? "#ffb260",
        boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${partner.accent ?? "#ff8a1a"} 35%, transparent)`,
      }}
    >
      {initials}
    </div>
  );
}

function PartnerCard({ partner }: { partner: EcosystemPartner }) {
  return (
    <article
      id={partner.slug}
      className="surface-forged scroll-mt-24 rounded-xl p-5 sm:p-7"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <Monogram partner={partner} />
          <div className="min-w-0">
            <h2 className="text-title-lg text-platinum-100">{partner.name}</h2>
            <p className="text-body-sm text-platinum-400 mt-1 max-w-[44ch]">
              {partner.tagline}
            </p>
          </div>
        </div>
        <span
          className={`text-mono-sm self-start rounded-full border px-3 py-1 whitespace-nowrap sm:shrink-0 ${statusStyle[partner.status]}`}
        >
          {STATUS_LABEL[partner.status]}
        </span>
      </div>

      <p className="text-body text-platinum-300 mt-6">{partner.summary}</p>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <p className="text-caption text-ember-400">The Foundry integration</p>
          <p className="text-body-sm text-platinum-300 mt-3">{partner.integration}</p>
        </div>
        <div>
          <p className="text-caption text-ember-400">Highlights</p>
          <ul className="mt-3 space-y-2">
            {partner.highlights.map((h) => (
              <li key={h} className="text-body-sm text-platinum-300 flex gap-2.5">
                <span className="bg-ember-500 mt-2 size-1.5 shrink-0 rounded-full" />
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-hairline mt-7 flex flex-wrap items-center justify-between gap-4 border-t pt-5">
        <div className="flex flex-wrap items-center gap-2">
          {partner.zeroGStack.map((s) => (
            <span
              key={s}
              className="text-mono-sm text-platinum-400 border-hairline rounded-md border px-2.5 py-1"
            >
              {s}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {partner.links.github && (
            <LinkButton
              href={partner.links.github}
              variant="secondary"
              size="md"
              external
            >
              GitHub ↗
            </LinkButton>
          )}
          {partner.links.site && (
            <LinkButton href={partner.links.site} variant="ghost" size="md" external>
              Website ↗
            </LinkButton>
          )}
          {partner.links.docs && (
            <LinkButton href={partner.links.docs} variant="ghost" size="md" external>
              Docs ↗
            </LinkButton>
          )}
          {partner.links.twitter && (
            <LinkButton href={partner.links.twitter} variant="ghost" size="md" external>
              X ↗
            </LinkButton>
          )}
        </div>
      </div>
    </article>
  );
}

export default function EcosystemPage() {
  return (
    <main>
      <Header />

      <section className="border-hairline border-t">
        <div className="mx-auto max-w-[1280px] px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
          <SectionHeader
            eyebrow="Ecosystem"
            title="0G projects building on Foundry."
            size="xl"
            glow
            intro={
              <>
                Foundry is the supply-side ownership and revenue layer for 0G AI. These
                are the projects that route their intelligence through co-owned Ingots —
                turning model calls into on-chain revenue for the contributors who made
                them good. No bridges, same 0G Storage + 0G Compute TEEs + 0G Chain
                everyone here already builds on.
              </>
            }
            meta={`${ECOSYSTEM_SORTED.length} partner${ECOSYSTEM_SORTED.length === 1 ? "" : "s"}`}
          />
        </div>
      </section>

      <section className="border-hairline border-t pb-20 sm:pb-24">
        <div className="mx-auto max-w-[1280px] px-5 py-12 sm:px-6 sm:py-16">
          <div className="space-y-6 sm:space-y-8">
            {ECOSYSTEM_SORTED.map((p) => (
              <PartnerCard key={p.slug} partner={p} />
            ))}
          </div>

          <div className="surface-forged mt-12 rounded-xl p-6 text-center sm:mt-16 sm:p-10">
            <p className="text-caption text-ember-400">Building on 0G?</p>
            <h2 className="text-display-sm text-platinum-100 mx-auto mt-3 max-w-[24ch] text-balance">
              Add co-owned, revenue-sharing AI to your project.
            </h2>
            <p className="text-body-lg text-platinum-300 mx-auto mt-5 max-w-[60ch]">
              If your project does inference, holds memory, or produces data, Foundry
              turns that into ongoing on-chain ownership. Integrate in under 15 minutes,
              then get listed here.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <LinkButton href="/docs/0g-hackathon" variant="primary" size="lg">
                Integration guide
              </LinkButton>
              <LinkButton
                href="https://t.me/rajkaria"
                variant="secondary"
                size="lg"
                external
              >
                Get listed →
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
