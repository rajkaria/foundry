import {
  DocsLayout,
  H2,
  H3,
  P,
  Lead,
  Code,
  CodeBlock,
  Callout,
  Table,
  PageNav,
} from "@/components/docs/DocsLayout";

export const metadata = {
  title: "Protocol overview — Foundry docs",
  description: "How Foundry turns contributions into co-owned models on 0G mainnet.",
};

const toc = [
  { id: "the-loop", label: "The five-step loop" },
  { id: "contracts", label: "The six contracts" },
  { id: "actors", label: "Actors" },
  { id: "invariants", label: "Protocol invariants" },
  { id: "lifecycle", label: "Forge lifecycle" },
];

export default function ProtocolOverviewPage() {
  return (
    <DocsLayout
      active="/docs/protocol-overview"
      eyebrow="Protocol · Overview"
      title="How Foundry works."
      intro={
        <Lead>
          Foundry is a supply-side protocol on 0G. It coordinates everyone who
          contributes to an AI model — data Smiths, compute providers, eval runners,
          funders — and gives them on-chain shares of the resulting Ingot. When the
          Ingot is called for inference, revenue routes back to those shareholders
          automatically.
        </Lead>
      }
      toc={toc}
    >
      <H2 id="the-loop">The five-step loop</H2>
      <P>
        Every Foundry model is forged through the same loop. Each step is a public
        on-chain event indexed in real time.
      </P>

      <Table
        head={["Step", "What happens", "Who", "Where"]}
        rows={[
          [
            <>1 · Open</>,
            <>
              A Forge is created with a model spec, eval spec, and contribution window.
            </>,
            "Funder",
            "ForgeFactory",
          ],
          [
            <>2 · Contribute</>,
            <>
              Data Smiths submit corpora; GPU providers submit compute; everything
              hashed and timestamped.
            </>,
            "Smiths",
            "Forge",
          ],
          [
            <>3 · Train</>,
            <>
              The eval coordinator runs baseline + leave-one-out training inside a TEE.
            </>,
            "Coordinator",
            "0G Compute",
          ],
          [
            <>4 · Attribute</>,
            <>
              LOO scores produce a contribution vector. The TEE attestation gets
              verified on-chain.
            </>,
            "Coordinator",
            "Forge",
          ],
          [
            <>5 · Mint</>,
            <>
              An Ingot is minted with shares packed in proportion to the contribution
              vector.
            </>,
            "Forge",
            "Ingot",
          ],
        ]}
      />

      <Callout tone="ember" title="The fourth optional step">
        <p>
          After mint, the Ingot can be <em>reforged</em> — opening a child Forge whose
          contributors share revenue with the parent Ingot's shareholders. Every call to
          the lineage descendant pays the ancestors too. This is how knowledge compounds
          without losing attribution.
        </p>
      </Callout>

      <H2 id="contracts">The six contracts</H2>
      <P>
        Six contracts, deployed once to 0G Aristotle mainnet. They are immutable —
        upgrades happen by deploying new instances and migrating Forges, never by
        replacing logic.
      </P>

      <Table
        head={["Contract", "Responsibility"]}
        rows={[
          [
            <Code>FORGEToken</Code>,
            "Protocol governance + staking. ERC-20, fixed supply.",
          ],
          [
            <Code>ContributionRegistry</Code>,
            "Append-only ledger of all data/compute/eval contributions.",
          ],
          [
            <Code>ForgeFactory</Code>,
            "Spawns Forge instances. Tracks the canonical list of all Forges.",
          ],
          [
            <Code>Forge</Code>,
            "Per-model state machine: OPEN → TRAINING → ATTESTED → MINTED.",
          ],
          [<Code>Ingot</Code>, "ERC-721 with packed share mappings. The model itself."],
          [
            <Code>RevenueSplitter</Code>,
            "Pull-payment splitter. Inference dispatches deposit, holders claim.",
          ],
        ]}
      />

      <P>
        Source:{" "}
        <a
          href="https://github.com/rajkaria/foundry/tree/main/contracts"
          className="text-ember-400 hover:text-ember-300"
        >
          github.com/rajkaria/foundry/contracts
        </a>
        . Deployed addresses:{" "}
        <a
          href="https://github.com/rajkaria/foundry/blob/main/contracts/deployments/aristotle.json"
          className="text-ember-400 hover:text-ember-300"
        >
          contracts/deployments/aristotle.json
        </a>
        .
      </P>

      <H2 id="actors">Actors</H2>
      <P>
        Five roles, four of which are externally permissionless. Anyone with an EVM
        wallet can participate; no whitelist.
      </P>

      <Table
        head={["Role", "What they do", "What they earn"]}
        rows={[
          [
            <>Data Smith</>,
            "Submits corpora, captions, labels, evals.",
            "Shares in every Ingot trained on their data.",
          ],
          [
            <>Compute Smith</>,
            "Funds GPU hours toward a Forge.",
            "Shares proportional to compute funded.",
          ],
          [
            <>Funder</>,
            "Opens Forges; underwrites the eval coordinator.",
            "Shares + protocol fee rebate.",
          ],
          [
            <>Builder</>,
            "Calls Ingots for inference via the SDK.",
            "Shipping product without owning the model.",
          ],
          [
            <>Eval coordinator</>,
            "Runs training + attribution inside a TEE.",
            "Fee per attested Forge.",
          ],
        ]}
      />

      <H2 id="invariants">Protocol invariants</H2>
      <P>
        Three things are true by construction. Auditors and integrators can rely on
        these without reading the source.
      </P>

      <ol className="text-body-lg text-platinum-300 ml-6 list-decimal space-y-4">
        <li>
          <strong className="text-platinum-100">
            No share can be granted without an attested contribution.
          </strong>{" "}
          <Code>Ingot.mintOwnership()</Code> requires the caller to be the Forge
          contract and the Forge to be in <Code>ATTESTED</Code> state.
        </li>
        <li>
          <strong className="text-platinum-100">
            Revenue can only be claimed by shareholders.
          </strong>{" "}
          <Code>RevenueSplitter.claim()</Code> reads share weights from the Ingot
          contract directly — there is no separate ledger to drift out of sync.
        </li>
        <li>
          <strong className="text-platinum-100">Lineage is unforgeable.</strong> When a
          child Ingot is minted via reforging, its <Code>lineageParent</Code>
          is set in the same transaction as <Code>mintOwnership</Code> and is immutable.
        </li>
      </ol>

      <H2 id="lifecycle">Forge lifecycle</H2>
      <P>
        A Forge moves through four states. Each transition emits an event the indexer
        surfaces in the Forge in Public dashboard.
      </P>

      <CodeBlock lang="text" filename="Forge state machine">{`OPEN ──contribute──► OPEN
  │
  └─time elapsed──► TRAINING
                       │
              ┌────────┴────────┐
              │                 │
   attestation valid   attestation invalid
              │                 │
              ▼                 ▼
          ATTESTED ─mint─► MINTED   FAILED`}</CodeBlock>

      <Callout title="Failure is a feature">
        <p>
          A Forge can land in <Code>FAILED</Code> if the eval attestation does not
          verify (TEE signature mismatch, model output drift, baseline regression).
          Funders' deposits return automatically; Smith contributions stay on-chain as
          proof of effort and can be reused in a future Forge for the same model spec.
        </p>
      </Callout>

      <PageNav next={{ href: "/docs/quickstart", label: "Quickstart" }} />
    </DocsLayout>
  );
}
