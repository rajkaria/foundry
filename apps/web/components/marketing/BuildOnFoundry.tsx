"use client";

import { motion } from "motion/react";
import { LinkButton } from "@/components/ui/Button";

const code = `import { Foundry } from '@foundryprotocol/sdk';

const foundry = new Foundry({ contracts: 'aristotle' });

const { output, receipt } = await foundry.inference.run(
  'ingot:0x8e2…f4a',
  { input: 'Translate to Konkani: …' }
);
//        ▲
//        revenue routes back to the Ingot's
//        co-owners on-chain, automatically.
// receipt.inferenceTxHash · receipt.revenueTxHash`;

const adapters = [
  {
    name: "Vercel AI SDK",
    snippet: `import { foundry } from '@foundryprotocol/sdk/adapters/vercel-ai';
const model = foundry('ingot:0x8e2…f4a');`,
  },
  {
    name: "LangChain",
    snippet: `import { FoundryChat } from '@foundryprotocol/sdk/adapters/langchain';
const llm = new FoundryChat({ ingotId: '0x8e2…f4a' });`,
  },
  {
    name: "OpenAI-compatible",
    snippet: `POST https://api.foundryprotocol.xyz/v1/chat/completions
header: x-foundry-ingot-id: 0x8e2…f4a`,
  },
];

export function BuildOnFoundry() {
  return (
    <section className="relative border-t border-hairline py-28">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-caption text-ember-400">Build on Foundry</p>
            <h2 className="text-display-lg mt-3 max-w-[18ch] text-platinum-100">
              Three lines of code. Your agent now calls a co-owned model.
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

            <div className="mt-10 flex flex-wrap items-center gap-3">
              {adapters.map((a) => (
                <span
                  key={a.name}
                  className="rounded-pill border-hairline px-3 py-1 text-caption text-platinum-300"
                >
                  {a.name}
                </span>
              ))}
              <span className="text-caption text-platinum-400">
                · CLI · OpenAI-compat proxy
              </span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="relative overflow-hidden rounded-xl border-hairline bg-ink-900 elev-2"
          >
            <div className="flex items-center justify-between border-b border-hairline px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-ink-600" />
                <span className="size-2 rounded-full bg-ink-600" />
                <span className="size-2 rounded-full bg-ember-500" />
              </div>
              <span className="text-mono-sm text-platinum-400">
                quickstart.ts
              </span>
            </div>
            <pre className="overflow-x-auto p-6 text-mono text-platinum-200">
              <code>{code}</code>
            </pre>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
