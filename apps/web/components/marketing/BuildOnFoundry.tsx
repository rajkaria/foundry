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
        '<span class="tk-k">$1</span>',
      )
      .replace(/(['"`])([^'"`]*?)\1/g, '<span class="tk-s">$1$2$1</span>')
      .replace(/\b(POST|GET|PUT)\b/g, '<span class="tk-k">$1</span>')
      .replace(/(0x[a-f0-9…]+)/g, '<span class="tk-h">$1</span>')
      .replace(/(\bingot:[a-z0-9…]+)/g, '<span class="tk-h">$1</span>');
    return (
      <div key={i} className="px-6 hover:bg-ink-800/40">
        <span
          dangerouslySetInnerHTML={{ __html: colored || "&nbsp;" }}
        />
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
    title: "Streaming, tools, JSON-mode",
    body: "Full feature parity — Ingots behave like any modern chat model.",
  },
];

export function BuildOnFoundry() {
  const [activeKey, setActiveKey] = useState(tabs[0].key);
  const active = tabs.find((t) => t.key === activeKey) ?? tabs[0];

  return (
    <section className="relative border-t border-hairline py-28">
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
            <h2 className="text-display-lg mt-3 max-w-[20ch] text-platinum-100">
              Three lines of code. Your agent calls a co-owned model.
            </h2>
            <p className="text-body-lg mt-6 max-w-[52ch] text-platinum-300">
              Foundry is open by design. Drop our SDK into any AI agent project
              and inference a Foundry Ingot — revenue routes back to the
              contributors who made it good.
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
                  className="rounded-lg border-hairline bg-ink-900 p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-ember-500" />
                    <p className="text-title-md text-platinum-100">{f.title}</p>
                  </div>
                  <p className="text-body-sm mt-2 text-platinum-400">{f.body}</p>
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
            <div className="flex flex-wrap items-center gap-1 overflow-x-auto rounded-t-xl border border-hairline border-b-0 bg-ink-900 p-1.5">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveKey(t.key)}
                  className={`relative rounded-md px-3 py-1.5 text-mono-sm transition-colors ${
                    t.key === activeKey
                      ? "text-platinum-100"
                      : "text-platinum-400 hover:text-platinum-200"
                  }`}
                >
                  {t.key === activeKey && (
                    <motion.span
                      layoutId="tab-bg"
                      className="absolute inset-0 rounded-md bg-ink-800"
                      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                    />
                  )}
                  <span className="relative">{t.label}</span>
                </button>
              ))}
            </div>

            <div className="relative overflow-hidden rounded-b-xl border border-hairline bg-ink-900 elev-2">
              <div className="flex items-center justify-between border-b border-hairline px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-ink-600" />
                  <span className="size-2 rounded-full bg-ink-600" />
                  <span className="size-2 rounded-full bg-ember-500" />
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
                  className="overflow-x-auto py-5 text-mono text-platinum-200 leading-6"
                >
                  <code className="block">{highlight(active.code)}</code>
                </motion.pre>
              </AnimatePresence>
              <div className="flex items-center justify-between border-t border-hairline px-5 py-3 text-mono-sm">
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
