import { DocsLayout, H2, P, Lead, Code, Callout, Table, PageNav } from "@/components/docs/DocsLayout";

export const metadata = {
  title: "Threat model — Foundry docs",
  description: "Adversaries, attacks, and mitigations for the Foundry protocol.",
};

const toc = [
  { id: "scope", label: "Scope" },
  { id: "actors", label: "Adversaries" },
  { id: "attacks", label: "Attack surface" },
  { id: "mitigations", label: "Mitigations" },
  { id: "out-of-scope", label: "Out of scope (v1)" },
];

export default function ThreatModelPage() {
  return (
    <DocsLayout
      active="/docs/threat-model"
      eyebrow="Protocol · Threat model"
      title="Who attacks Foundry, how, and what stops them."
      intro={
        <Lead>
          A protocol that mints share certificates on-chain is a magnet for
          adversaries. This page enumerates the attack surface we've thought
          through, the mitigations in place, and the known gaps we are
          accepting in v1 and tracking on the roadmap.
        </Lead>
      }
      toc={toc}
    >
      <H2 id="scope">Scope</H2>
      <P>
        This threat model covers the six on-chain contracts, the eval
        coordinator, the SDK, and the indexer. It does not cover the
        client-side wallet you use to sign transactions — that's your
        infrastructure.
      </P>

      <H2 id="actors">Adversaries</H2>
      <Table
        head={["Adversary", "Goal", "Capability"]}
        rows={[
          [<>Greedy Smith</>, "Inflate own shares by submitting duplicate or low-effort data.", "Has a wallet. Can spam the registry."],
          [<>Coordinator collusion</>, "Sign false attestation that overpays specific contributors.", "Runs (or compromises) the TEE."],
          [<>Inference siphon</>, "Call an Ingot in a way that bypasses RevenueSplitter.", "Network-level access; eth_call manipulation."],
          [<>Lineage forger</>, "Mint a child Ingot claiming a parent that didn't authorize it.", "Can deploy contracts that look like Forges."],
          [<>Sybil funder</>, "Open many Forges to grief the coordinator into wasted compute.", "Cheap wallet creation."],
        ]}
      />

      <H2 id="attacks">Attack surface</H2>

      <Table
        head={["Vector", "What it targets", "Severity"]}
        rows={[
          [<>Duplicate data contribution</>, <Code>ContributionRegistry</Code>, "Medium"],
          [<>TEE attestation forgery</>, <Code>Forge.submitEvalResult</Code>, "Critical"],
          [<>Replay attack on attestation</>, <Code>Forge.submitEvalResult</Code>, "High"],
          [<>Front-running fundForge</>, <Code>Forge.contributeCompute</Code>, "Low"],
          [<>Re-entrancy in claim</>, <Code>RevenueSplitter.claim</Code>, "High"],
          [<>Inference proxy bypass</>, "off-chain inference path", "Medium"],
          [<>Fake parent Ingot</>, <Code>Ingot.lineageParent</Code>, "Medium"],
        ]}
      />

      <H2 id="mitigations">Mitigations</H2>

      <Table
        head={["Threat", "Mitigation"]}
        rows={[
          [
            "Duplicate data contribution",
            <>Each contribution is keyed by a content hash committed at submission. The eval coordinator's training pipeline dedupes by hash before LOO. Score(duplicate) = 0.</>,
          ],
          [
            "TEE attestation forgery",
            <>The Forge stores the public key of the registered TEE provider at <Code>createForge</Code>. <Code>submitEvalResult</Code> verifies the signature on-chain. Forging requires both compromising the TEE itself <em>and</em> re-registering the provider — the latter is governance-gated.</>,
          ],
          [
            "Replay attack on attestation",
            <>Each Forge issues a one-shot nonce committed in <Code>OPEN → TRAINING</Code>. The attestation must include it; the Forge rejects mismatched nonces.</>,
          ],
          [
            "Re-entrancy in claim",
            <>Pull-payment pattern: <Code>claim()</Code> uses checks-effects-interactions, debits the holder's balance before transferring, and applies the OpenZeppelin <Code>nonReentrant</Code> guard.</>,
          ],
          [
            "Inference proxy bypass",
            <>The OpenAI-compatible proxy is the <em>only</em> path that triggers <Code>RevenueSplitter.deposit()</Code>. Calling an Ingot directly (e.g., running the weights locally) is permitted but does not earn revenue. Co-owners hold the model; nobody can take that away.</>,
          ],
          [
            "Fake parent Ingot",
            <>The <Code>lineageParent</Code> field is set at mint by the child Forge. The child Forge must produce a TEE attestation that consumed the parent's weights root as input. Forging a parent requires forging a TEE attestation — collapsed into "TEE attestation forgery" above.</>,
          ],
        ]}
      />

      <Callout tone="ember" title="Re-entrancy belt and suspenders">
        <p>
          <Code>RevenueSplitter</Code> is the most adversarially-exposed
          contract because it ships ETH outward. We apply three independent
          defenses: checks-effects-interactions, OpenZeppelin's <Code>nonReentrant</Code>,
          and a cap on per-tx claims. Each defense alone is sufficient. The
          stack is intentional redundancy, not paranoia.
        </p>
      </Callout>

      <H2 id="out-of-scope">Out of scope (v1)</H2>
      <P>
        These are real threats we are choosing not to address in the v1 launch.
        Each is tracked on the roadmap.
      </P>

      <ul className="text-body-lg space-y-3 text-platinum-300 ml-6 list-disc">
        <li>
          <strong className="text-platinum-100">Adversarial training data.</strong>{" "}
          A Smith could submit data poisoned to insert a backdoor into the
          model. LOO scoring would actually punish them (eval drops), but
          a sophisticated attacker could craft data that helps the eval and
          hurts a downstream task. v1 mitigation: human review of high-impact
          contributors. v2 mitigation: pre-eval adversarial probe.
        </li>
        <li>
          <strong className="text-platinum-100">Inference oracle gaming.</strong>{" "}
          A builder could call the same Ingot many times to inflate its
          revenue and pump its perceived value. v1 mitigation: dashboard
          flags suspiciously concentrated callers. v2 mitigation: rate-limit
          + economic friction.
        </li>
        <li>
          <strong className="text-platinum-100">Compute-side collusion.</strong>{" "}
          A compute provider that also Smiths could route their own data
          preferentially during training. The TEE prevents this in principle
          (the training container is sandboxed), but in practice depends on
          the host's integrity. v1: trust the 0G Compute attestation. v2:
          require GPU attestation per-batch.
        </li>
      </ul>

      <PageNav
        prev={{ href: "/docs/attribution", label: "Verifiable attribution" }}
        next={{ href: "/docs/contracts", label: "Contract self-review" }}
      />
    </DocsLayout>
  );
}
