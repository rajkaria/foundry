"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/Button";

interface InferenceResponse {
  choices: Array<{ message: { content: string } }>;
  foundry?: {
    ingotId: string;
    inferenceTxHash: string | null;
    revenueTxHash: string | null;
  };
}

export function InferenceWidget({ ingotId }: { ingotId: string }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setOutput(null);
    const t0 = Date.now();
    try {
      const res = await fetch("/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-foundry-ingot-id": ingotId,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: input }],
        }),
      });
      if (!res.ok) throw new Error(`inference failed (${res.status})`);
      const data = (await res.json()) as InferenceResponse;
      setOutput(data.choices[0]?.message?.content ?? "");
      setLatency(Date.now() - t0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={3}
        placeholder="Enter input to send to this Ingot…"
        className="bg-ink-800 border-hairline text-body text-platinum-100 placeholder:text-platinum-400 focus:border-ember-400 w-full rounded-md border px-4 py-3 focus:outline-none"
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <Button onClick={run} disabled={!input.trim() || loading}>
          {loading ? "Calling Ingot…" : "Run inference"}
        </Button>
        {latency != null && (
          <span className="text-mono-sm text-platinum-400">
            {latency}ms · revenue auto-routed
          </span>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-body-sm text-signal-danger mt-3"
          >
            {error}
          </motion.p>
        )}
        {output != null && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            className="border-hairline bg-ink-950 text-body text-platinum-100 mt-5 rounded-md p-4"
          >
            {output}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
