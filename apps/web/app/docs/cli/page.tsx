import { DocsLayout, H2, H3, P, Lead, Code, CodeBlock, Callout, PageNav } from "@/components/docs/DocsLayout";

export const metadata = {
  title: "Foundry CLI — Foundry docs",
  description: "Command-line scaffolding, deploys, and inference smoke tests.",
};

const toc = [
  { id: "install", label: "Install" },
  { id: "init", label: "foundry init" },
  { id: "forge", label: "foundry forge" },
  { id: "ingot", label: "foundry ingot" },
  { id: "infer", label: "foundry infer" },
  { id: "ci", label: "CI usage" },
];

export default function CliPage() {
  return (
    <DocsLayout
      active="/docs/cli"
      eyebrow="SDK · CLI"
      title="foundry — the one-binary developer experience."
      intro={
        <Lead>
          The Foundry CLI scaffolds new integrations, opens Forges from the
          terminal, runs smoke inferences against any Ingot, and ships
          machine-readable JSON for CI pipelines. It's the same SDK surface,
          one alias away.
        </Lead>
      }
      toc={toc}
    >
      <H2 id="install">Install</H2>
      <P>The CLI ships in the SDK package — no separate install.</P>
      <CodeBlock lang="bash" filename="terminal">{`pnpm add @foundryprotocol/sdk
pnpm exec foundry --help

# or globally:
pnpm add -g @foundryprotocol/sdk
foundry --help`}</CodeBlock>

      <Callout tone="warn" title="CLI status">
        <p>
          The CLI ships in v1.0.0. The commands below are the locked public
          surface; the <Code>--help</Code> output in the v1.0.0-rc.1
          pre-release matches this page exactly.
        </p>
      </Callout>

      <H2 id="init">foundry init</H2>
      <P>Scaffolds a starter app that calls an existing Ingot.</P>
      <CodeBlock lang="bash">{`foundry init my-foundry-app
cd my-foundry-app
pnpm install
pnpm dev

# scaffolds:
#   /pages/index.tsx        — UI that calls foundry.inference.run()
#   /lib/foundry.ts         — typed Foundry client
#   /.env.example           — INGOT_ID, FOUNDRY_API_KEY (optional)`}</CodeBlock>

      <H2 id="forge">foundry forge</H2>
      <P>Open, inspect, or close a Forge.</P>

      <H3 id="forge-create">foundry forge create</H3>
      <CodeBlock lang="bash">{`foundry forge create \\
  --model-spec       ./specs/model.json \\
  --eval-spec        ./specs/eval.json  \\
  --eval-coordinator 0x… \\
  --window-days      7

# outputs:
#   forgeId  forge:0x4a7c…
#   txHash   0x6f12…
#   explorer https://aristotle.0g.explorer/tx/0x6f12…`}</CodeBlock>

      <H3 id="forge-list">foundry forge list</H3>
      <CodeBlock lang="bash">{`foundry forge list --state OPEN --json
# [ { id: "forge:0x…", state: 0, contributions: 4, fundedOG: "1.2" }, … ]`}</CodeBlock>

      <H2 id="ingot">foundry ingot</H2>

      <H3 id="ingot-show">foundry ingot show</H3>
      <CodeBlock lang="bash">{`foundry ingot show ingot:0x8e2af4a…

# Konkani ↔ English translator v1
# minted     2026-06-04 14:02 UTC
# weights    0g://weights/konkani-v1.safetensors
# parent     —
# holders    9 (cap table below)
# revenue    0.42 OG distributed all-time
# explorer   https://aristotle.0g.explorer/token/0x…`}</CodeBlock>

      <H3 id="ingot-claim">foundry ingot claim</H3>
      <CodeBlock lang="bash">{`# Claim revenue for the calling wallet, on every Ingot you hold shares in.
foundry ingot claim --all

# Or a specific Ingot:
foundry ingot claim ingot:0x8e2af4a…`}</CodeBlock>

      <H2 id="infer">foundry infer</H2>
      <P>One-shot inference against any Ingot.</P>
      <CodeBlock lang="bash">{`foundry infer \\
  ingot:0x8e2af4a… \\
  --input "Translate to Konkani: where is the train station?" \\
  --stream

# streams tokens to stdout; final receipt printed to stderr:
#   {
#     "inferenceTxHash": "0x4a7c…",
#     "revenueTxHash":   "0x6f12…",
#     "latencyMs":       842
#   }`}</CodeBlock>

      <H2 id="ci">CI usage</H2>
      <P>Every command supports <Code>--json</Code> for stable machine output.</P>
      <CodeBlock lang="yaml" filename=".github/workflows/foundry-smoke.yml">{`name: foundry-smoke
on: [pull_request]

jobs:
  call-ingot:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: |
          pnpm exec foundry infer ingot:0x8e2af4a… \\
            --input "ping" --json > out.json
      - run: jq .receipt.latencyMs out.json | xargs -I{} test {} -lt 2000`}</CodeBlock>

      <PageNav
        prev={{ href: "/docs/adapters", label: "Adapters" }}
        next={{ href: "/docs/real-vs-roadmap", label: "Real vs Roadmap" }}
      />
    </DocsLayout>
  );
}
