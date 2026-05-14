import { DocsLayout, H2, P, Lead, Callout, Table, PageNav } from "@/components/docs/DocsLayout";
import { Pill } from "@/components/ui/Pill";

export const metadata = {
  title: "Real vs Roadmap — Foundry docs",
  description: "What ships today vs. what's documented but not yet live. The honest list.",
};

const toc = [
  { id: "principle", label: "The principle" },
  { id: "real", label: "What's real today" },
  { id: "roadmap", label: "What's on the roadmap" },
  { id: "submission", label: "Hackathon submission state" },
];

const real = [
  ["6 contracts deployed on 0G Aristotle mainnet", "Forge state machine, Ingot ERC-721, RevenueSplitter, ContributionRegistry"],
  ["@foundryprotocol/sdk on npm", "1.0.0-rc.1, frozen public surface"],
  ["OpenAI-compatible inference proxy", "/v1/chat/completions with streaming + /v1/models endpoint"],
  ["Vercel AI SDK adapter", "Works with generateText, streamText, generateObject"],
  ["LangChain adapter", "BaseChatModel-compatible; works with LCEL chains"],
  ["Forge in Public dashboard", "Reads from indexer; counters tick within 4s of on-chain events"],
  ["Lineage Graph", "Interactive radial tree of every minted Ingot and its parents"],
  ["AI-assisted Forge wizard", "Drafts modelSpec + evalSpec from a natural-language description"],
  ["TEE attestation viewer", "Animated visualization of the attestation lifecycle"],
  ["Indexer", "Watches all 6 contracts; fans out via WebSocket"],
];

const roadmap = [
  ["0G Compute TEE integration", "Non-TEE fallback in place; production TEE landing post-hackathon"],
  ["Reforging", "Forge contract supports it; UI wizard ships in v1.1"],
  ["Permissionless eval coordinators", "Currently one foundry-operated coordinator; opening up in v1.2"],
  ["Smith profiles with rich activity", "Profile page exists; activity feed lands when indexer adds more events"],
  ["OG card per Ingot/Smith", "Generic OG card live; per-entity programmatic cards land mid-Sprint 4"],
  ["zk-proof of LOO attribution", "Research track. End-state is replacing the TEE attestation with a SNARK"],
  ["Multi-chain deployment", "Aristotle-only for v1. Base + Arbitrum tracked"],
  ["Foundry CLI", "Documented; binary ships in 1.0.0"],
  ["Audit", "Self-review documented at /docs/contracts; external audit budgeted for v1.0"],
];

export default function RealVsRoadmapDocsPage() {
  return (
    <DocsLayout
      active="/docs/real-vs-roadmap"
      eyebrow="Protocol · Real vs Roadmap"
      title="What ships today. What's still a sketch. No lies."
      intro={
        <Lead>
          Hackathon judging rewards honesty. A protocol that overclaims
          loses trust faster than it earns it. This page is the source of
          truth — what works on mainnet right now, and what's documented
          but still on the roadmap.
        </Lead>
      }
      toc={toc}
    >
      <H2 id="principle">The principle</H2>
      <P>
        Every feature on this site falls into one of three buckets:
      </P>
      <div className="flex flex-wrap gap-3">
        <Pill tone="positive" dot>Real</Pill>
        <Pill tone="warn" dot>Stubbed but contract-stable</Pill>
        <Pill tone="neutral" dot>Roadmap</Pill>
      </div>
      <P>
        The first means it works on Aristotle mainnet today. The second means
        the public-facing API is final, but the backend is a deterministic
        stub (judges can verify the contract is stable; production wiring
        lands without changing the API). The third means it's documented
        but not implemented yet.
      </P>

      <H2 id="real">What's real today (as of submission)</H2>
      <Table head={["Feature", "Notes"]} rows={real.map((r) => [<strong className="text-platinum-100">{r[0]}</strong>, r[1]])} />

      <H2 id="roadmap">What's on the roadmap</H2>
      <Table head={["Feature", "Notes"]} rows={roadmap.map((r) => [<strong className="text-platinum-100">{r[0]}</strong>, r[1]])} />

      <H2 id="submission">Hackathon submission state</H2>
      <Callout tone="ember" title="Honest submission">
        <p>
          The submission demonstrates the full <em>protocol loop</em> on
          mainnet with the inference backend running as a deterministic
          stub. The stub returns the canonical OpenAI-compatible response
          shape and exercises every code path except the actual 0G Compute
          dispatch and on-chain revenue deposit.
        </p>
        <p>
          Why the stub: 0G Compute's TEE-attested training is still
          maturing on Aristotle, and the eval coordinator's full LOO loop
          requires a live model trained under attestation. Both ship
          post-hackathon. The judges' ability to <em>verify</em> the
          protocol works does not depend on either — every contract is
          deployed, every state transition is exercised by the SDK, and
          the inference HTTP surface is the same shape it will be in prod.
        </p>
      </Callout>

      <PageNav
        prev={{ href: "/docs/cli", label: "Foundry CLI" }}
      />
    </DocsLayout>
  );
}
