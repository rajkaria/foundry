import {
  DocsLayout,
  H2,
  H3,
  P,
  Lead,
  Code,
  CodeBlock,
  Callout,
  PageNav,
} from "@/components/docs/DocsLayout";

export const metadata = {
  title: "Adapters — Foundry docs",
  description:
    "Drop-in adapters for Vercel AI SDK, LangChain, and the OpenAI-compatible HTTP proxy.",
};

const toc = [
  { id: "vercel-ai", label: "Vercel AI SDK" },
  { id: "langchain", label: "LangChain" },
  { id: "openai", label: "OpenAI-compatible HTTP" },
  { id: "streaming", label: "Streaming" },
  { id: "headers", label: "Headers & receipts" },
];

export default function AdaptersPage() {
  return (
    <DocsLayout
      active="/docs/adapters"
      eyebrow="SDK · Adapters"
      title="Plug Foundry into your existing stack in three lines."
      intro={
        <Lead>
          Foundry ships three first-class adapters. Each one is a thin translation layer
          over the same OpenAI-compatible HTTP proxy — so the inference path, receipts,
          and on-chain revenue routing are identical regardless of which adapter you
          choose.
        </Lead>
      }
      toc={toc}
    >
      <H2 id="vercel-ai">Vercel AI SDK</H2>
      <P>
        Implements the <Code>LanguageModelV1</Code> interface. Works with{" "}
        <Code>generateText</Code>, <Code>streamText</Code>, and{" "}
        <Code>generateObject</Code>.
      </P>
      <CodeBlock lang="ts" filename="vercel-ai.ts">{`import { generateText } from "ai";
import { foundry } from "@foundryprotocol/sdk/adapters/vercel-ai";

const { text } = await generateText({
  model: foundry("ingot:0x8e2af4a…"),
  prompt: "Translate to Konkani: hello, how are you?",
});

console.log(text);`}</CodeBlock>

      <H3 id="vercel-ai-streaming">Streaming</H3>
      <CodeBlock lang="ts">{`import { streamText } from "ai";
import { foundry } from "@foundryprotocol/sdk/adapters/vercel-ai";

const result = await streamText({
  model: foundry("ingot:0x8e2af4a…"),
  prompt: "Stream a haiku about co-owned models.",
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}`}</CodeBlock>

      <H2 id="langchain">LangChain</H2>
      <P>
        Implements a <Code>BaseChatModel</Code>-compatible class. Plugs into LCEL
        chains, agents, and RAG pipelines.
      </P>
      <CodeBlock
        lang="ts"
        filename="langchain.ts"
      >{`import { FoundryChat } from "@foundryprotocol/sdk/adapters/langchain";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const llm = new FoundryChat({
  ingotId: "ingot:0x8e2af4a…",
  temperature: 0.6,
});

const res = await llm.invoke([
  new SystemMessage("You are a Konkani translation assistant."),
  new HumanMessage("Translate: where is the train station?"),
]);

console.log(res.content);
console.log(res.additional_kwargs.foundry.receipt);`}</CodeBlock>

      <Callout tone="ember" title="LangChain is an optional peer dependency">
        <p>
          We declare <Code>@langchain/core</Code> as an optional peer in
          <Code> package.json</Code>. If you don't install it, only the adapter module
          is unavailable — the rest of the SDK works identically.
        </p>
      </Callout>

      <H2 id="openai">OpenAI-compatible HTTP</H2>
      <P>
        Any tool that speaks the OpenAI API can call a Foundry Ingot. Point the base URL
        at <Code>api.foundryprotocol.xyz/v1</Code> and pass the Ingot ID as{" "}
        <Code>x-foundry-ingot-id</Code>.
      </P>

      <CodeBlock
        lang="bash"
        filename="curl"
      >{`curl https://api.foundryprotocol.xyz/v1/chat/completions \\
  -H "content-type: application/json" \\
  -H "x-foundry-ingot-id: 0x8e2af4a000000000000000000000000000000001" \\
  -d '{
    "messages": [
      { "role": "user", "content": "Translate to Konkani: hello" }
    ],
    "stream": false
  }'`}</CodeBlock>

      <P>OpenAI's own SDK works out of the box:</P>
      <CodeBlock lang="ts" filename="openai-sdk.ts">{`import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.foundryprotocol.xyz/v1",
  apiKey:  "not-required-but-the-sdk-insists",
  defaultHeaders: {
    "x-foundry-ingot-id": "0x8e2af4a000000000000000000000000000000001",
  },
});

const res = await client.chat.completions.create({
  model: "ingot:0x8e2af4a…",
  messages: [{ role: "user", content: "Hello" }],
});
console.log(res.choices[0].message.content);`}</CodeBlock>

      <H2 id="streaming">Streaming</H2>
      <P>
        All three adapters stream tokens via Server-Sent Events in the OpenAI delta
        format. The final frame includes a <Code>foundry</Code>
        block with the inference + revenue tx hashes.
      </P>

      <CodeBlock lang="text" filename="final SSE frame">{`data: {
  "id": "chatcmpl-foundry-…",
  "object": "chat.completion.chunk",
  "choices": [{ "index": 0, "delta": {}, "finish_reason": "stop" }],
  "foundry": {
    "ingotId":        "0x8e2af4a…",
    "inferenceTxHash":"0x4a7c…",
    "revenueTxHash":  "0x6f12…"
  }
}

data: [DONE]`}</CodeBlock>

      <H2 id="headers">Headers & receipts</H2>

      <CodeBlock
        lang="text"
        filename="request headers"
      >{`x-foundry-ingot-id   0x…           required: which Ingot to call
authorization        Bearer …       optional: integrator API key for rate-limit
content-type         application/json`}</CodeBlock>

      <CodeBlock
        lang="text"
        filename="response headers"
      >{`x-foundry-ingot-id   0x…   echo
x-foundry-stub       1     present on stub responses (Sprint 2/3); absent in prod`}</CodeBlock>

      <Callout tone="ember" title="Calling Foundry from an AI agent (not from code)?">
        <p>
          If your client is a Claude Desktop, Cursor, Cline, or any
          MCP-capable agent — use the Foundry MCP server instead. One{" "}
          <Code>npx @foundryprotocol/mcp</Code> wires{" "}
          <Code>list_ingots</Code>, <Code>run_inference</Code>,{" "}
          <Code>get_ingot</Code>, <Code>get_lineage</Code>, and{" "}
          <Code>get_attestation</Code> into the agent as first-class tools.
          See{" "}
          <a
            href="/docs/mcp"
            className="text-ember-300 hover:text-ember-200 hover:underline"
          >
            the MCP guide
          </a>
          .
        </p>
      </Callout>

      <PageNav
        prev={{ href: "/docs/sdk-reference", label: "SDK reference" }}
        next={{ href: "/docs/mcp", label: "MCP server" }}
      />
    </DocsLayout>
  );
}
