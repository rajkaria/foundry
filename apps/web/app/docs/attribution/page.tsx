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
  title: "Verifiable attribution — Foundry docs",
  description:
    "Leave-one-out scoring inside a TEE: how Foundry turns contributions into provable shares.",
};

const toc = [
  { id: "problem", label: "The problem" },
  { id: "loo", label: "Leave-one-out, exactly" },
  { id: "tee", label: "The TEE wraps it" },
  { id: "shape", label: "Score vector shape" },
  { id: "fallback", label: "Non-TEE fallback" },
  { id: "limits", label: "Known limits (v1)" },
];

export default function AttributionPage() {
  return (
    <DocsLayout
      active="/docs/attribution"
      eyebrow="Protocol · Attribution"
      title="Verifiable attribution, one TEE attestation at a time."
      intro={
        <Lead>
          Foundry's value depends on a single hard claim: when you contribute data to a
          Forge, the shares you receive in the resulting Ingot are
          <em>provably proportional</em> to how much your contribution improved the
          model. This page is the load-bearing math under that claim.
        </Lead>
      }
      toc={toc}
    >
      <H2 id="problem">The problem</H2>
      <P>
        Shapley values are the theoretically correct answer — but Shapley scales like 2
        <sup>n</sup>. For a Forge with 40 data contributions you'd need ~10<sup>12</sup>{" "}
        training runs. Not viable.
      </P>
      <P>
        Approximate-Shapley schemes (TMC, KNN-Shapley, Data Banzhaf) trade provability
        for tractability. Foundry's v1 attribution model takes a third path: a strict
        leave-one-out (LOO) score, run in a TEE, with a cryptographic attestation that
        this exact procedure was followed on this exact data.
      </P>

      <H2 id="loo">Leave-one-out, exactly</H2>
      <P>
        Given <em>n</em> contributions <Code>c₁…cₙ</Code>, the LOO score for
        contribution <Code>cᵢ</Code> is:
      </P>

      <CodeBlock
        lang="text"
        filename="LOO score"
      >{`score(cᵢ) = eval(train(C))  −  eval(train(C \\ cᵢ))

where:
  C        = the full contribution set
  C \\ cᵢ   = contribution set with cᵢ removed
  train()  = the Forge's pinned training recipe
  eval()   = the Forge's pinned eval (held-out test set + metric)`}</CodeBlock>

      <P>
        In English: the score for your data is the difference in eval performance
        between a model trained <em>with</em> it and a model trained <em>without</em>{" "}
        it. Positive scores → you helped. Negative scores → you hurt. Zero →
        indistinguishable from absence.
      </P>

      <Callout tone="ember" title="What about negative scores?">
        <p>
          A contribution with a negative score still appears on-chain in the
          ContributionRegistry, but receives zero shares. Foundry never punishes
          contributors — bad data just doesn't earn. The contributor can resubmit a
          cleaned-up version to a future Forge.
        </p>
      </Callout>

      <H2 id="tee">The TEE wraps it</H2>
      <P>
        The eval coordinator runs inside a Trusted Execution Environment (TEE) —
        currently AMD SEV-SNP via 0G Compute's verifiable compute layer. The TEE
        produces a signed attestation containing:
      </P>

      <Table
        head={["Field", "What it pins"]}
        rows={[
          [
            <Code>code_hash</Code>,
            "Hash of the training + eval container image. Forces deterministic recipe.",
          ],
          [
            <Code>data_root</Code>,
            "Merkle root over the contribution set (from ContributionRegistry).",
          ],
          [
            <Code>baseline_metric</Code>,
            "Eval metric for the baseline model (trained on C).",
          ],
          [<Code>scores</Code>, "Vector of (contributor → score) pairs."],
          [<Code>nonce</Code>, "Forge-issued nonce to prevent replay."],
          [<Code>sig</Code>, "TEE signature over the above, verifiable by anyone."],
        ]}
      />

      <P>
        The <Code>Forge.submitEvalResult()</Code> function verifies the signature
        against the registered TEE provider's public key and confirms the{" "}
        <Code>data_root</Code> matches what the ContributionRegistry committed. If both
        checks pass, the Forge transitions to <Code>ATTESTED</Code>
        and shares get minted in the next transaction.
      </P>

      <H3 id="why">Why a TEE and not zk?</H3>
      <P>
        A zk proof of LOO is the right end-state — but proving generic training inside a
        SNARK costs ~6 orders of magnitude more than running it. We're betting on the
        TEE → zk transition path, not on zk being viable for training in 2026.
      </P>

      <H2 id="shape">Score vector shape</H2>
      <P>
        The score vector is the heart of the attestation. Here's a real example from the
        Konkani v1 Forge (4 contributors):
      </P>

      <CodeBlock lang="json" filename="scores from Konkani v1">{`{
  "baseline_metric": { "bleu": 24.7, "comet": 0.71 },
  "scores": [
    { "contributor": "0x4a7c…f12c", "score": 0.184, "shares": 4100 },
    { "contributor": "0x6f12…3b9e", "score": 0.142, "shares": 3160 },
    { "contributor": "0x8e2a…d4a1", "score": 0.071, "shares": 1580 },
    { "contributor": "0x1c34…7f08", "score": 0.052, "shares": 1160 }
  ]
}`}</CodeBlock>

      <P>
        Shares are integer values in basis points (10,000 = 100%) computed as
        <Code>round(scoreᵢ / Σscores · 10000)</Code>. Rounding remainders go to the
        largest holder.
      </P>

      <H2 id="fallback">Non-TEE fallback</H2>
      <Callout tone="warn" title="Hackathon-honest disclosure">
        <p>
          0G Compute's TEE integration is still maturing. For Forges where the TEE
          attestation can't be produced, the eval coordinator runs the same procedure
          outside a TEE and submits a plain signed attestation from a known coordinator
          address. The Ingot is minted with a <Code>tee:false</Code> flag, visible
          on-chain and surfaced in the UI with an amber warning pill.
        </p>
        <p>
          The non-TEE path exists for two reasons: (1) hackathon judges can verify the
          full loop without waiting on us to ship TEE integration; (2) the procedure is
          still correct, just less adversarially-resistant. Production deployments
          require TEE.
        </p>
      </Callout>

      <H2 id="limits">Known limits (v1)</H2>
      <ul className="text-body-lg text-platinum-300 ml-6 list-disc space-y-3">
        <li>
          <strong className="text-platinum-100">
            LOO requires <em>n</em> training runs.
          </strong>{" "}
          For Forges with &gt; 200 contributions, we batch via a stratified LOO
          approximation. The bound on accuracy loss is documented in the eval
          coordinator README.
        </li>
        <li>
          <strong className="text-platinum-100">
            Eval metric is pinned at Forge open.
          </strong>{" "}
          Changing the metric mid-Forge would change all scores. The metric is committed
          to <Code>evalSpec</Code> at <Code>ForgeFactory.createForge()</Code>.
        </li>
        <li>
          <strong className="text-platinum-100">
            Compute contributions get a flat-rate share.
          </strong>{" "}
          LOO scores data, not GPU-hours. Compute Smiths receive a fixed fraction
          (configured per-Forge, typically 15–25%) split pro rata to compute units
          provided.
        </li>
      </ul>

      <PageNav
        prev={{ href: "/docs/build-on-foundry", label: "Build on Foundry" }}
        next={{ href: "/docs/threat-model", label: "Threat model" }}
      />
    </DocsLayout>
  );
}
