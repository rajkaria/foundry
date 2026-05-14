"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardEyebrow, CardTitle, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";

interface ForgeDraft {
  name: string;
  summary: string;
  modelSpec: {
    baseModel: string;
    task: string;
    fineTuneMethod: string;
    languages?: string[];
  };
  evalSpec: { method: string; sizeTarget: number; metric: string };
  contributionWindow: { suggestedDurationDays: number; perWalletCap: number };
  weights: { data: number; compute: number; capital: number };
  datasetGuidance: string[];
  meta: { generator: string; promptDigest: string };
}

const examples = [
  "A Konkani ↔ English translation model for native speakers.",
  "A classifier that flags risky clauses in software MSAs.",
  "An embedding model for retrieval over chemistry papers.",
];

export function ForgeWizard() {
  const [prompt, setPrompt] = useState("");
  const [draft, setDraft] = useState<ForgeDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(p: string) {
    setLoading(true);
    setError(null);
    setDraft(null);
    try {
      const res = await fetch("/api/forge/draft", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: p }),
      });
      if (!res.ok) throw new Error(`draft failed (${res.status})`);
      const data = (await res.json()) as ForgeDraft;
      setDraft(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
      <div className="space-y-4">
        <Card>
          <CardEyebrow>Step 1 · Describe</CardEyebrow>
          <CardTitle>What model do you want trained?</CardTitle>
          <CardBody>Plain English. One or two sentences is enough.</CardBody>

          <form
            className="mt-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (prompt.trim()) generate(prompt.trim());
            }}
          >
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="e.g. A Konkani ↔ English translator for native speakers."
              className="bg-ink-800 border-hairline text-body text-platinum-100 placeholder:text-platinum-400 focus:border-ember-400 w-full rounded-md border px-4 py-3 focus:outline-none"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setPrompt(ex);
                    generate(ex);
                  }}
                  className="rounded-pill border-hairline text-caption text-platinum-300 hover:bg-ink-800 hover:text-platinum-100 px-3 py-1 transition-colors"
                >
                  {ex.slice(0, 48)}…
                </button>
              ))}
            </div>

            <div className="mt-5 flex gap-3">
              <Button
                type="submit"
                variant="primary"
                disabled={!prompt.trim() || loading}
              >
                {loading ? "Drafting…" : "Draft this Forge"}
              </Button>
              {draft && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setDraft(null);
                    setPrompt("");
                  }}
                >
                  Start over
                </Button>
              )}
            </div>
            {error && <p className="text-body-sm text-signal-danger mt-4">{error}</p>}
          </form>
        </Card>

        <Card>
          <CardEyebrow>Step 2 · Review</CardEyebrow>
          <CardTitle>Edit anything before you confirm</CardTitle>
          <CardBody>
            The draft is a starting point — every field is editable in the preview to
            the right. (Wallet-gated final create lands Sprint 3.)
          </CardBody>
        </Card>
      </div>

      <div className="min-h-[420px]">
        <AnimatePresence mode="wait">
          {loading && <DraftSkeleton key="skel" />}
          {!loading && !draft && <DraftEmpty key="empty" />}
          {!loading && draft && <DraftPreview key="draft" draft={draft} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function DraftEmpty() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="border-hairline grid h-full place-items-center rounded-xl border border-dashed p-8 text-center"
    >
      <p className="text-body text-platinum-400 max-w-[40ch]">
        Your drafted Forge spec will appear here.
      </p>
    </motion.div>
  );
}

function DraftSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="border-hairline bg-ink-900 space-y-3 rounded-xl p-6"
    >
      {[60, 40, 80, 70, 50].map((w, i) => (
        <motion.div
          key={i}
          className="rounded-pill bg-ink-700 h-3"
          initial={{ width: 0 }}
          animate={{ width: `${w}%` }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
        />
      ))}
    </motion.div>
  );
}

function DraftPreview({ draft }: { draft: ForgeDraft }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
      className="border-hairline bg-ink-900 elev-2 rounded-xl p-8"
    >
      <div className="flex items-center justify-between">
        <p className="text-caption text-ember-400">Drafted Forge</p>
        <Pill tone="ember" dot>
          AI-assisted
        </Pill>
      </div>
      <h3 className="text-display-sm text-platinum-100 mt-3">{draft.name}</h3>
      <p className="text-body text-platinum-300 mt-3">{draft.summary}</p>

      <div className="border-hairline mt-8 grid grid-cols-2 gap-4 border-t pt-6">
        <Stat k="base model" v={draft.modelSpec.baseModel} />
        <Stat k="task" v={draft.modelSpec.task} />
        <Stat k="method" v={draft.modelSpec.fineTuneMethod} />
        <Stat k="eval metric" v={draft.evalSpec.metric.toUpperCase()} />
        <Stat k="holdout size" v={draft.evalSpec.sizeTarget.toLocaleString()} />
        <Stat
          k="window"
          v={`${draft.contributionWindow.suggestedDurationDays}d · cap ${draft.contributionWindow.perWalletCap}`}
        />
      </div>

      <div className="mt-6">
        <p className="text-caption text-platinum-400">Weights</p>
        <div className="text-body-sm mt-3 flex items-center gap-2">
          <Tag label={`${draft.weights.data / 100}% data`} tone="ember" />
          <Tag label={`${draft.weights.compute / 100}% compute`} tone="warn" />
          <Tag label={`${draft.weights.capital / 100}% capital`} tone="neutral" />
        </div>
      </div>

      <div className="mt-6">
        <p className="text-caption text-platinum-400">Dataset guidance</p>
        <ul className="text-body-sm text-platinum-200 mt-3 space-y-2">
          {draft.datasetGuidance.map((g) => (
            <li key={g} className="flex gap-2">
              <span className="text-ember-500">·</span>
              <span>{g}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-hairline mt-8 flex gap-3 border-t pt-6">
        <Button variant="primary" disabled>
          Confirm & create (Sprint 3)
        </Button>
        <Button variant="ghost" disabled>
          Edit fields
        </Button>
      </div>
    </motion.div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-caption text-platinum-400">{k}</p>
      <p className="text-title-md text-platinum-100 mt-1 truncate">{v}</p>
    </div>
  );
}

function Tag({ label, tone }: { label: string; tone: "ember" | "warn" | "neutral" }) {
  return <Pill tone={tone}>{label}</Pill>;
}
