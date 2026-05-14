import {
  DocsLayout,
  H2,
  P,
  Lead,
  Code,
  CodeBlock,
  Callout,
  PageNav,
} from "@/components/docs/DocsLayout";

export const metadata = {
  title: "Quickstart — Foundry docs",
  description:
    "From npm install to a paid inference call against a Foundry Ingot in three minutes.",
};

const toc = [
  { id: "install", label: "1. Install" },
  { id: "call", label: "2. Call an Ingot" },
  { id: "receipt", label: "3. Read the receipt" },
  { id: "next", label: "Where to go next" },
];

export default function QuickstartPage() {
  return (
    <DocsLayout
      active="/docs/quickstart"
      eyebrow="Start here · Quickstart"
      title="Three lines. One inference call. Revenue on-chain."
      intro={
        <Lead>
          By the end of this page, you will have called a Foundry Ingot, received a
          response, and seen the inference and revenue transaction hashes that proved
          the call paid out to the model's co-owners. Target time: three minutes on a
          clean machine.
        </Lead>
      }
      toc={toc}
    >
      <H2 id="install">1 · Install</H2>
      <P>
        The SDK has one runtime dependency (<Code>viem</Code>) and is fully
        tree-shakeable.
      </P>
      <CodeBlock lang="bash" filename="terminal">{`pnpm add @foundryprotocol/sdk
# or: npm install @foundryprotocol/sdk
# or: yarn add @foundryprotocol/sdk`}</CodeBlock>

      <H2 id="call">2 · Call an Ingot</H2>
      <P>
        Three lines. The first creates the client; the second fires the inference call;
        the third logs the receipt.
      </P>
      <CodeBlock
        lang="ts"
        filename="hello-foundry.ts"
      >{`import { Foundry } from "@foundryprotocol/sdk";

const foundry = new Foundry({ contracts: "aristotle" });
const { output, receipt } = await foundry.inference.run(
  "ingot:0x8e2af4a000000000000000000000000000000001",
  { input: "Translate to Konkani: hello, how are you?" },
);

console.log(output);
console.log(receipt);`}</CodeBlock>

      <Callout tone="ember" title="No wallet required to read">
        <p>
          Inference calls go through the OpenAI-compatible HTTP proxy. You do{" "}
          <em>not</em> need a wallet to call an Ingot — revenue accrues to its co-owners
          regardless of who initiated the call. You only need a wallet when you want to{" "}
          <strong>claim</strong>
          revenue or <strong>contribute</strong> to a Forge.
        </p>
      </Callout>

      <H2 id="receipt">3 · Read the receipt</H2>
      <P>The receipt makes the on-chain settlement visible:</P>
      <CodeBlock lang="ts" filename="receipt shape">{`{
  ingotId: "ingot:0x8e2af4a…",
  receipt: {
    requestId:        "chatcmpl-foundry-d8e2…",
    inferenceTxHash:  "0x4a7c…",      // 0G Compute dispatch
    revenueTxHash:    "0x6f12…",      // RevenueSplitter deposit
    latencyMs:        842,
  },
}`}</CodeBlock>

      <P>
        Both tx hashes land on 0G Aristotle within ~4 seconds. The Forge in Public
        dashboard reflects them in real time.
      </P>

      <H2 id="next">Where to go next</H2>

      <ul className="text-body-lg text-platinum-300 ml-6 list-disc space-y-3">
        <li>
          Want a typed adapter for your existing AI stack? See{" "}
          <a href="/docs/adapters" className="text-ember-400 hover:text-ember-300">
            Adapters
          </a>{" "}
          — Vercel AI SDK, LangChain, and the OpenAI-compatible HTTP proxy.
        </li>
        <li>
          Want to contribute data to a Forge and earn shares? See{" "}
          <a
            href="/docs/build-on-foundry"
            className="text-ember-400 hover:text-ember-300"
          >
            Build on Foundry
          </a>
          .
        </li>
        <li>
          Want to understand how shares are computed? See{" "}
          <a href="/docs/attribution" className="text-ember-400 hover:text-ember-300">
            Verifiable attribution
          </a>
          .
        </li>
      </ul>

      <PageNav
        prev={{ href: "/docs/protocol-overview", label: "Protocol overview" }}
        next={{ href: "/docs/build-on-foundry", label: "Build on Foundry" }}
      />
    </DocsLayout>
  );
}
