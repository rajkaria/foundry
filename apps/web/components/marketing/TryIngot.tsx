"use client";

import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { Pill } from "@/components/ui/Pill";

const DEMO_INGOT_ID =
  process.env.NEXT_PUBLIC_DEMO_INGOT_ID ?? "0x8e2af4a000000000000000000000000000000001";

const SAMPLES = [
  { label: "Konkani → English", input: "Tum kasso assa?" },
  { label: "English → Konkani", input: "How was your weekend?" },
  { label: "Tulu greeting", input: "Hi, how are you doing today?" },
];

interface ChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
  foundry?: {
    ingotId?: string;
    attestation?: { mode?: string; status?: string } | null;
    inferenceTxHash?: string | null;
    revenueTxHash?: string | null;
    mode?: string;
  };
}

export function TryIngot() {
  const [input, setInput] = useState(SAMPLES[0].input);
  const [output, setOutput] = useState<string | null>(null);
  const [meta, setMeta] = useState<ChatResponse["foundry"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function send() {
    setError(null);
    setOutput(null);
    setMeta(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-foundry-ingot-id": DEMO_INGOT_ID,
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: input }],
            max_tokens: 256,
          }),
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`${res.status} ${txt.slice(0, 160)}`);
        }
        const data = (await res.json()) as ChatResponse;
        setOutput(data.choices?.[0]?.message?.content ?? "(no content)");
        setMeta(data.foundry ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  }

  const mode = meta?.mode ?? meta?.attestation?.mode;
  const isReal = mode === "live" || mode === "tee";

  return (
    <section
      id="try-an-ingot"
      className="border-platinum-900/40 bg-ink-950/40 relative isolate overflow-hidden border-y py-24"
      aria-labelledby="try-an-ingot-h"
    >
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <Pill tone="ember">Try it · no wallet</Pill>
            <h2
              id="try-an-ingot-h"
              className="text-display-xl text-platinum-100 mt-6 max-w-[18ch]"
            >
              Call a co-owned model.
              <span className="text-ember-300 text-serif-display block">
                Right now.
              </span>
            </h2>
            <p className="text-body-lg text-platinum-300 mt-6 max-w-[48ch]">
              The request below routes through the OpenAI-compatible Foundry proxy to a
              live Ingot on 0G Aristotle mainnet. The inference fee is reserved on-chain
              via the 0G Compute serving broker, and a portion deposits into the
              Ingot&apos;s <code>RevenueSplitter</code> — claimable by its co-owners.
            </p>
            <ul className="text-body-sm text-platinum-400 mt-6 space-y-2">
              <li>
                <span className="text-platinum-200">Ingot:</span>{" "}
                <code className="text-mono-sm text-ember-300">
                  {DEMO_INGOT_ID.slice(0, 10)}…{DEMO_INGOT_ID.slice(-4)}
                </code>
              </li>
              <li>
                <span className="text-platinum-200">Adapter:</span> OpenAI-compat · also
                via{" "}
                <a
                  href="/docs/sdk-reference#vercel-ai"
                  className="text-ember-300 hover:underline"
                >
                  Vercel AI SDK
                </a>{" "}
                or{" "}
                <a
                  href="/docs/sdk-reference#langchain"
                  className="text-ember-300 hover:underline"
                >
                  LangChain
                </a>
              </li>
              <li>
                <span className="text-platinum-200">Revenue routed:</span> pro-rata to
                share-ledger holders, pull-claim on chain
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="border-hairline bg-ink-900/60 rounded-2xl p-6 backdrop-blur md:p-8"
          >
            <div className="flex flex-wrap gap-2">
              {SAMPLES.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setInput(s.input)}
                  className="rounded-pill border-hairline bg-ink-800/70 text-mono-sm text-platinum-300 hover:bg-ink-800 hover:text-platinum-100 px-3 py-1.5 transition"
                  type="button"
                >
                  {s.label}
                </button>
              ))}
            </div>

            <label className="mt-5 block">
              <span className="text-caption text-platinum-400">Prompt</span>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={3}
                className="border-hairline bg-ink-950 text-body text-platinum-100 placeholder:text-platinum-500 focus:border-ember-400 mt-2 w-full rounded-xl px-4 py-3 focus:outline-none"
                placeholder="Type something to translate or ask…"
                disabled={pending}
              />
            </label>

            <div className="mt-4 flex items-center justify-between gap-3">
              <code className="text-mono-sm text-platinum-500 truncate">
                POST /api/v1/chat/completions
              </code>
              <button
                onClick={send}
                disabled={pending || !input.trim()}
                className="rounded-pill bg-ember-500 text-mono-sm text-ink-950 hover:bg-ember-400 px-5 py-2 font-semibold transition disabled:opacity-50"
                type="button"
              >
                {pending ? "Routing through 0G…" : "Run inference"}
              </button>
            </div>

            {(output || error) && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="border-hairline bg-ink-950/80 mt-6 rounded-xl p-5"
              >
                {error ? (
                  <p className="text-body-sm text-signal-negative">Error: {error}</p>
                ) : (
                  <>
                    <p className="text-caption text-platinum-400 mb-2">
                      Ingot response
                    </p>
                    <p className="text-body text-platinum-100 whitespace-pre-wrap">
                      {output}
                    </p>
                    {meta && (
                      <div className="border-platinum-900/40 text-mono-sm mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-3">
                        <span
                          className={
                            isReal ? "text-signal-positive" : "text-platinum-400"
                          }
                        >
                          ● {isReal ? "live on 0G Compute" : "stub mode"}
                        </span>
                        {meta.attestation?.status && (
                          <span className="text-platinum-300">
                            attestation: {meta.attestation.status}
                          </span>
                        )}
                        {meta.inferenceTxHash && (
                          <a
                            href={`https://chainscan.0g.ai/tx/${meta.inferenceTxHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-ember-300 hover:underline"
                          >
                            inference tx ↗
                          </a>
                        )}
                        {meta.revenueTxHash && (
                          <a
                            href={`https://chainscan.0g.ai/tx/${meta.revenueTxHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-ember-300 hover:underline"
                          >
                            revenue split tx ↗
                          </a>
                        )}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            <details className="text-mono-sm text-platinum-400 mt-5">
              <summary className="hover:text-platinum-200 cursor-pointer">
                Reproduce with curl
              </summary>
              <pre className="bg-ink-950 mt-3 overflow-x-auto rounded-lg p-4 text-xs leading-relaxed">
                {`curl https://foundryprotocol.xyz/api/v1/chat/completions \\
  -H "content-type: application/json" \\
  -H "x-foundry-ingot-id: ${DEMO_INGOT_ID}" \\
  -d '{"messages":[{"role":"user","content":"${input.replace(/"/g, '\\"').slice(0, 60)}"}]}'`}
              </pre>
            </details>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
