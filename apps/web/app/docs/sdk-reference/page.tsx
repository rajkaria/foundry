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
  title: "SDK reference — Foundry docs",
  description: "Every public method in @foundryprotocol/sdk v1.0.0.",
};

const toc = [
  { id: "client", label: "Foundry client" },
  { id: "forge", label: "forge.*" },
  { id: "ingot", label: "ingot.*" },
  { id: "inference", label: "inference.*" },
  { id: "revenue", label: "revenue.*" },
  { id: "lineage", label: "lineage.*" },
  { id: "types", label: "Type reference" },
  { id: "errors", label: "Error handling" },
];

export default function SdkReferencePage() {
  return (
    <DocsLayout
      active="/docs/sdk-reference"
      eyebrow="SDK · Reference"
      title="The @foundryprotocol/sdk surface, frozen at 1.0.0-rc.1."
      intro={
        <Lead>
          One imported class — <Code>Foundry</Code> — with five namespaces:{" "}
          <Code>forge</Code>, <Code>ingot</Code>, <Code>inference</Code>,{" "}
          <Code>revenue</Code>, <Code>lineage</Code>. No surprises, no callback hell, no
          opaque proxies. Read methods need no wallet; write methods require{" "}
          <Code>walletClient</Code>.
        </Lead>
      }
      toc={toc}
    >
      <H2 id="client">Foundry client</H2>
      <CodeBlock
        lang="ts"
        filename="construction"
      >{`import { Foundry } from "@foundryprotocol/sdk";
import { createWalletClient, custom } from "viem";

// Read-only — no wallet needed.
const foundry = new Foundry({ contracts: "aristotle" });

// Read + write — pass a viem WalletClient.
const wallet = createWalletClient({
  transport: custom(window.ethereum),
});
const foundryRW = new Foundry({
  contracts: "aristotle",
  walletClient: wallet,
});`}</CodeBlock>

      <P>Config options:</P>

      <Table
        head={["Option", "Type", "Default"]}
        rows={[
          [<Code>contracts</Code>, <Code>"aristotle"</Code>, <Code>"aristotle"</Code>],
          [
            <Code>rpcUrl</Code>,
            <Code>string</Code>,
            <Code>https://rpc.0g.network</Code>,
          ],
          [<Code>walletClient</Code>, <Code>viem.WalletClient</Code>, "—"],
          [
            <Code>inferenceEndpoint</Code>,
            <Code>string</Code>,
            <Code>https://api.foundryprotocol.xyz/v1</Code>,
          ],
          [<Code>inferenceApiKey</Code>, <Code>string</Code>, "—"],
        ]}
      />

      <H2 id="forge">forge.*</H2>

      <H3 id="forge-create">forge.create()</H3>
      <P>Opens a new Forge. Requires wallet.</P>
      <CodeBlock lang="ts">{`const { txHash } = await foundry.forge.create({
  modelSpec:               "0x…",
  evalSpec:                "0x…",
  evalCoordinator:         "0x…",
  contributionWindowEnds:  BigInt(Math.floor(Date.now() / 1000) + 7 * 86400),
});`}</CodeBlock>

      <H3 id="forge-contribute">
        forge.contributeData() / contributeCompute() / fundForge()
      </H3>
      <CodeBlock lang="ts">{`await foundry.forge.contributeData("forge:0x…", "0x<storageRoot>");
await foundry.forge.contributeCompute("forge:0x…", "0.05"); // 0.05 OG
await foundry.forge.fundForge("forge:0x…",        "1.0");  // 1.0 OG`}</CodeBlock>

      <H3 id="forge-read">forge.state() / forge.list()</H3>
      <CodeBlock lang="ts">{`const state = await foundry.forge.state("forge:0x…"); // 0|1|2|3|4
const ids   = await foundry.forge.list();             // ForgeId[]

// State enum: OPEN=0, TRAINING=1, ATTESTED=2, MINTED=3, FAILED=4`}</CodeBlock>

      <H2 id="ingot">ingot.*</H2>
      <CodeBlock lang="ts">{`const meta  = await foundry.ingot.meta(tokenId);
//   → { weightsRoot, lineageParent, forge, mintedAt, weightsSet }

const share = await foundry.ingot.shareOf(tokenId, "0x<address>");
//   → bigint (basis points, 10000 = 100%)`}</CodeBlock>

      <H2 id="inference">inference.*</H2>
      <CodeBlock lang="ts">{`const { output, receipt } = await foundry.inference.run(
  "ingot:0x…",
  {
    input: "…",
    // — or —
    messages: [{ role: "user", content: "…" }],
    temperature: 0.7,
    maxTokens: 512,
  },
);`}</CodeBlock>

      <P>The receipt:</P>
      <CodeBlock lang="ts">{`{
  output:  string,
  ingotId: \`ingot:0x\${string}\`,
  receipt: {
    requestId:       string,
    inferenceTxHash: \`0x\${string}\` | undefined,
    revenueTxHash:   \`0x\${string}\` | undefined,
    latencyMs:       number,
  },
}`}</CodeBlock>

      <H2 id="revenue">revenue.*</H2>
      <CodeBlock lang="ts">{`const claimable = await foundry.revenue.claimable(tokenId, "0x<address>");
const { txHash } = await foundry.revenue.claim(tokenId);`}</CodeBlock>

      <Callout title="Pull payments, intentionally">
        <p>
          Revenue is never pushed. Smiths claim when they like — gas costs are theirs,
          and reverts on the recipient side can't grief the splitter. This is the
          OpenZeppelin <Code>PaymentSplitter</Code> pattern, adapted for ERC-721 share
          weights.
        </p>
      </Callout>

      <H2 id="lineage">lineage.*</H2>
      <CodeBlock lang="ts">{`const { parent } = await foundry.lineage.get(tokenId);
// parent is the weightsRoot Hex of the parent Ingot, or 0x000…0 if root.`}</CodeBlock>

      <H2 id="types">Type reference</H2>
      <Table
        head={["Type", "Shape"]}
        rows={[
          [<Code>IngotId</Code>, <Code>{`\`ingot:0x\${string}\``}</Code>],
          [<Code>ForgeId</Code>, <Code>{`\`forge:0x\${string}\``}</Code>],
          [
            <Code>Address</Code>,
            <>
              viem <Code>Address</Code>
            </>,
          ],
          [
            <Code>Hex</Code>,
            <>
              viem <Code>Hex</Code>
            </>,
          ],
          [
            <Code>InferenceParams</Code>,
            <>
              see{" "}
              <a
                href="/docs/sdk-reference#inference"
                className="text-ember-400 hover:text-ember-300"
              >
                inference
              </a>
            </>,
          ],
          [
            <Code>InferenceResult</Code>,
            <>
              see{" "}
              <a
                href="/docs/sdk-reference#inference"
                className="text-ember-400 hover:text-ember-300"
              >
                inference
              </a>
            </>,
          ],
        ]}
      />

      <H2 id="errors">Error handling</H2>
      <P>
        All write methods throw a viem-derived error on revert. The SDK wraps inference
        HTTP errors in <Code>InferenceError</Code> with the upstream status code and
        body fragment.
      </P>
      <CodeBlock lang="ts">{`import { InferenceError } from "@foundryprotocol/sdk";

try {
  await foundry.inference.run("ingot:0x…", { input: "…" });
} catch (e) {
  if (e instanceof InferenceError) {
    console.error("proxy returned", e.status, e.body);
  } else throw e;
}`}</CodeBlock>

      <PageNav
        prev={{ href: "/docs/contracts", label: "Contract self-review" }}
        next={{ href: "/docs/adapters", label: "Adapters" }}
      />
    </DocsLayout>
  );
}
