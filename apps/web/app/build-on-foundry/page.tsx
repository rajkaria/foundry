import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { LinkButton } from "@/components/ui/Button";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";

export const metadata = {
  title: "Build on Foundry",
  description:
    "Three lines of code to call a co-owned model. Adapters for Vercel AI SDK, LangChain, OpenAI-compatible APIs, and an MCP server for Claude Desktop, Cursor, and Cline.",
};

const adapters = [
  {
    title: "Vercel AI SDK",
    code: `import { foundry } from '@foundryprotocol/sdk/adapters/vercel-ai';
import { generateText } from 'ai';

const model = foundry('ingot:0x8e2…f4a');
const { text } = await generateText({
  model,
  prompt: 'Translate to Konkani: …',
});`,
  },
  {
    title: "LangChain",
    code: `import { FoundryChat } from '@foundryprotocol/sdk/adapters/langchain';

const llm = new FoundryChat({ ingotId: '0x8e2…f4a' });
const out = await llm.invoke('Translate to Konkani: …');`,
  },
  {
    title: "OpenAI-compatible",
    code: `// any tool that speaks OpenAI's API
fetch('https://api.foundryprotocol.xyz/v1/chat/completions', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-foundry-ingot-id': '0x8e2…f4a',
  },
  body: JSON.stringify({ messages: [{ role: 'user', content: '…' }] }),
});`,
  },
  {
    title: "MCP — for Claude Desktop, Cursor, Cline",
    code: `// 1. install
npx @foundryprotocol/mcp

// 2. wire into Claude Desktop / Cursor (claude_desktop_config.json)
{
  "mcpServers": {
    "foundry": {
      "command": "npx",
      "args": ["-y", "@foundryprotocol/mcp"]
    }
  }
}

// 3. ask your agent — it now has five Foundry tools:
//    list_ingots · run_inference · get_ingot
//    · get_lineage · get_attestation`,
  },
];

export default function BuildOnFoundryPage() {
  return (
    <main>
      <Header />

      <section className="border-hairline border-t">
        <div className="mx-auto max-w-[1280px] px-6 py-20">
          <p className="text-caption text-ember-400">Build on Foundry</p>
          <h1 className="text-display-xl text-platinum-100 mt-3 max-w-[20ch]">
            Inference a co-owned model in three lines.
          </h1>
          <p className="text-body-lg text-platinum-300 mt-6 max-w-[60ch]">
            The Foundry SDK ships with adapters for the agent frameworks your project
            already uses — Vercel AI SDK, LangChain, OpenAI-compatible HTTP — and an MCP
            server so Claude Desktop, Cursor, Cline, or any MCP-capable agent picks up
            Foundry Ingots as first-class tools. Revenue routes back to the
            Ingot&rsquo;s co-owners automatically, on-chain.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <LinkButton href="/docs/quickstart" variant="primary" size="lg">
              Quickstart
            </LinkButton>
            <LinkButton
              href="https://www.npmjs.com/package/@foundryprotocol/sdk"
              external
              variant="secondary"
              size="lg"
            >
              npm install @foundryprotocol/sdk
            </LinkButton>
          </div>
        </div>
      </section>

      <section className="border-hairline border-t">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <p className="text-caption text-platinum-400">Adapters</p>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {adapters.map((a) => (
              <Card key={a.title}>
                <CardEyebrow>Adapter</CardEyebrow>
                <CardTitle>{a.title}</CardTitle>
                <pre className="bg-ink-950 text-mono-sm text-platinum-200 mt-5 overflow-x-auto rounded-md p-4">
                  <code>{a.code}</code>
                </pre>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
