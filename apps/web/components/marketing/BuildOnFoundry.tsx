"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { LinkButton } from "@/components/ui/Button";

interface Tab {
  key: string;
  label: string;
  filename: string;
  code: string;
}

const tabs: Tab[] = [
  {
    key: "sdk",
    label: "SDK",
    filename: "quickstart.ts",
    code: `import { Foundry } from '@foundryprotocol/sdk';

const foundry = new Foundry({ contracts: 'aristotle' });

const { output, receipt } = await foundry.inference.run(
  'ingot:0x8e2…f4a',
  { input: 'Translate to French: Good morning' }
);
//        ▲  revenue routes back to the Ingot's
//        co-owners on-chain, automatically.

console.log(receipt.inferenceTxHash);
console.log(receipt.revenueTxHash);`,
  },
  {
    key: "vercel",
    label: "Vercel AI SDK",
    filename: "route.ts",
    code: `import { generateText } from 'ai';
import { foundry } from '@foundryprotocol/sdk/adapters/vercel-ai';

const model = foundry('ingot:0x8e2…f4a');

const { text } = await generateText({
  model,
  prompt: 'Summarize this contract clause: …',
});
// streams + revenue routing — both wired.`,
  },
  {
    key: "langchain",
    label: "LangChain",
    filename: "chain.ts",
    code: `import { FoundryChat } from '@foundryprotocol/sdk/adapters/langchain';
import { ChatPromptTemplate } from '@langchain/core/prompts';

const llm = new FoundryChat({ ingotId: '0x8e2…f4a' });

const prompt = ChatPromptTemplate.fromTemplate(
  'Translate {input} to French.'
);

const chain = prompt.pipe(llm);
const res = await chain.invoke({ input: 'Good morning' });`,
  },
  {
    key: "openai",
    label: "OpenAI-compat",
    filename: "request.http",
    code: `POST https://api.foundryprotocol.xyz/v1/chat/completions
Content-Type: application/json
x-foundry-ingot-id: 0x8e2…f4a

{
  "model": "ingot:0x8e2…f4a",
  "messages": [
    { "role": "user", "content": "Hello" }
  ]
}
# Drop-in for any OpenAI client.`,
  },
  {
    key: "mcp",
    label: "MCP",
    filename: "claude_desktop_config.json",
    code: `// Wire Foundry into Claude Desktop, Cursor, or any MCP-capable
// agent. Five tools appear: list_ingots, run_inference, get_ingot,
// get_lineage, get_attestation — all backed by live mainnet Ingots.

{
  "mcpServers": {
    "foundry": {
      "command": "npx",
      "args": ["-y", "@foundryprotocol/mcp"],
      "env": {
        "FOUNDRY_DEFAULT_INGOT_ID": "0x8e2…f4a"
      }
    }
  }
}
# Agents call run_inference, co-owners earn on-chain.`,
  },
];

function highlight(code: string) {
  // tiny token-coloring for visual richness — purely cosmetic
  const lines = code.split("\n");
  return lines.map((line, i) => {
    const colored = line
      .replace(/(\/\/.*$)/g, '<span class="tk-c">$1</span>')
      .replace(/(#.*$)/g, '<span class="tk-c">$1</span>')
      .replace(
        /\b(import|from|const|await|new|console|export|return|async|function)\b/g,
        '<span class="tk-k">$1</span>'
      )
      .replace(/(['"`])([^'"`]*?)\1/g, '<span class="tk-s">$1$2$1</span>')
      .replace(/\b(POST|GET|PUT)\b/g, '<span class="tk-k">$1</span>')
      .replace(/(0x[a-f0-9…]+)/g, '<span class="tk-h">$1</span>')
      .replace(/(\bingot:[a-z0-9…]+)/g, '<span class="tk-h">$1</span>');
    return (
      <div key={i} className="hover:bg-ink-800/40 px-6">
        <span dangerouslySetInnerHTML={{ __html: colored || "&nbsp;" }} />
      </div>
    );
  });
}

const features = [
  {
    title: "OpenAI-compatible",
    body: "Drop our endpoint into any OpenAI client. Same shape. Just point the base URL.",
  },
  {
    title: "Receipts on every call",
    body: "Each inference returns an attested receipt — TEE quote + on-chain revenue tx.",
  },
  {
    title: "Adapter-first",
    body: "Native plugins for Vercel AI SDK, LangChain, and the OpenAI proxy. CLI included.",
  },
  {
    title: "MCP for agents",
    body: "npx @foundryprotocol/mcp gives Claude Desktop, Cursor, and Cline a co-owned model as a tool.",
  },
];

export function BuildOnFoundry() {
  const [activeKey, setActiveKey] = useState(tabs[0].key);
  const active = tabs.find((t) => t.key === activeKey) ?? tabs[0];

  return (
    <section className="border-hairline relative border-t py-28">
      <style>{`
        .tk-k { color: #ffb260; font-weight: 500; }
        .tk-s { color: #d8a04c; }
        .tk-c { color: #6c7384; font-style: italic; }
        .tk-h { color: #6fa7ff; }
      `}</style>

      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div>
            <p className="text-caption text-ember-400">Build on Foundry</p>
            <h2 className="text-display-lg text-platinum-100 mt-3 max-w-[20ch]">
              Three lines of code. Your agent calls a co-owned model.
            </h2>
            <p className="text-body-lg text-platinum-300 mt-6 max-w-[52ch]">
              Foundry is open by design. Drop our SDK into any AI agent project and
              inference a Foundry Ingot — revenue routes back to the contributors who
              made it good.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <LinkButton href="/build-on-foundry" variant="primary" size="lg">
                Quickstart
              </LinkButton>
              <LinkButton href="/docs/sdk-reference" variant="secondary" size="lg">
                SDK reference
              </LinkButton>
            </div>

            {/* Feature mini-grid */}
            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.06,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                  className="border-hairline bg-ink-900 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="bg-ember-500 size-1.5 rounded-full" />
                    <p className="text-title-md text-platinum-100">{f.title}</p>
                  </div>
                  <p className="text-body-sm text-platinum-400 mt-2">{f.body}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="relative"
          >
            {/* Tabs */}
            <div className="border-hairline bg-ink-900 flex flex-wrap items-center gap-1 overflow-x-auto rounded-t-xl border border-b-0 p-1.5">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveKey(t.key)}
                  className={`text-mono-sm relative rounded-md px-3 py-1.5 transition-colors ${
                    t.key === activeKey
                      ? "text-platinum-100"
                      : "text-platinum-400 hover:text-platinum-200"
                  }`}
                >
                  {t.key === activeKey && (
                    <motion.span
                      layoutId="tab-bg"
                      className="bg-ink-800 absolute inset-0 rounded-md"
                      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                    />
                  )}
                  <span className="relative">{t.label}</span>
                </button>
              ))}
            </div>

            <div className="border-hairline bg-ink-900 elev-2 relative overflow-hidden rounded-b-xl border">
              <div className="border-hairline flex items-center justify-between border-b px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="bg-ink-600 size-2 rounded-full" />
                  <span className="bg-ink-600 size-2 rounded-full" />
                  <span className="bg-ember-500 size-2 rounded-full" />
                </div>
                <span className="text-mono-sm text-platinum-400">
                  {active.filename}
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.pre
                  key={active.key}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                  className="text-mono text-platinum-200 overflow-x-auto py-5 leading-6"
                >
                  <code className="block">{highlight(active.code)}</code>
                </motion.pre>
              </AnimatePresence>
              <div className="border-hairline text-mono-sm flex items-center justify-between border-t px-5 py-3">
                <span className="text-platinum-400">
                  → <span className="text-signal-positive">200 OK</span>
                </span>
                <span className="tabular text-platinum-400">
                  revenue routed · 0.0008 OG
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
