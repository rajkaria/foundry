/**
 * AI-assisted Forge creation.
 *
 * Input:  natural-language prompt
 * Output: a typed ForgeDraft the wizard pre-fills.
 *
 * Calls 0G Compute (via lib/zg-compute) with a JSON-mode prompt that asks
 * the model to return a structured ForgeDraft. The regex-based heuristic
 * fallback runs when 0G Compute returns the stub mode (e.g. unconfigured
 * preview deploys) or when the LLM response can't be parsed.
 */

import { NextResponse, type NextRequest } from "next/server";
import { chatStructured } from "@/lib/zg-compute";

export const runtime = "nodejs";

export interface ForgeDraft {
  name: string;
  summary: string;
  modelSpec: {
    baseModel: string;
    task: "translation" | "classification" | "embedding" | "generation";
    fineTuneMethod: "lora" | "full" | "qlora";
    languages?: string[];
  };
  evalSpec: {
    method: "holdout";
    sizeTarget: number;
    metric: "bleu" | "accuracy" | "f1" | "perplexity";
  };
  contributionWindow: {
    suggestedDurationDays: number;
    perWalletCap: number;
  };
  weights: { data: number; compute: number; capital: number };
  datasetGuidance: string[];
  meta: {
    generator: "foundry-stub" | "zg-compute";
    providerModel?: string;
    attestation?: string | null;
    promptDigest: string;
  };
}

const SYSTEM_PROMPT = `You are Foundry's Forge architect.

Output ONLY a single JSON object matching this TypeScript type:

interface ForgeDraft {
  name: string;                    // short, 5-50 chars
  summary: string;                 // 1-2 sentences, ≤ 240 chars
  modelSpec: {
    baseModel: string;             // open-weights model id, e.g. "Qwen2.5-1.5B-Instruct"
    task: "translation" | "classification" | "embedding" | "generation";
    fineTuneMethod: "lora" | "full" | "qlora";
    languages?: string[];          // only when task = "translation"
  };
  evalSpec: {
    method: "holdout";
    sizeTarget: number;            // 200..10000
    metric: "bleu" | "accuracy" | "f1" | "perplexity";
  };
  contributionWindow: {
    suggestedDurationDays: number; // 3..30
    perWalletCap: number;          // 3..20
  };
  weights: { data: number; compute: number; capital: number };  // bps, sum = 10000
  datasetGuidance: string[];       // 3-5 bullets, ≤ 100 chars each
}

Rules: choose the smallest reasonable open-weights base model. Default
weights = { data: 7000, compute: 2000, capital: 1000 }. No prose, no
markdown — JSON only.`;

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { prompt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const prompt = (body.prompt ?? "").trim();
  if (!prompt) {
    return NextResponse.json({ error: "prompt required" }, { status: 400 });
  }

  const llm = await chatStructured<Partial<ForgeDraft>>({
    schemaName: "ForgeDraft",
    temperature: 0.2,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
  });

  const fallback = inferDraftHeuristic(prompt);
  const merged: ForgeDraft =
    llm.mode === "live" && llm.parsed
      ? sanitize(llm.parsed, fallback, {
          generator: "zg-compute",
          providerModel: llm.model,
          attestation: llm.attestation,
          promptDigest: digest(prompt),
        })
      : { ...fallback, meta: { ...fallback.meta, promptDigest: digest(prompt) } };

  return NextResponse.json(merged);
}

function sanitize(
  partial: Partial<ForgeDraft>,
  fallback: ForgeDraft,
  meta: ForgeDraft["meta"]
): ForgeDraft {
  return {
    name: typeof partial.name === "string" ? partial.name.slice(0, 60) : fallback.name,
    summary:
      typeof partial.summary === "string"
        ? partial.summary.slice(0, 280)
        : fallback.summary,
    modelSpec: {
      baseModel:
        partial.modelSpec?.baseModel?.toString() ?? fallback.modelSpec.baseModel,
      task:
        pickEnum(partial.modelSpec?.task, [
          "translation",
          "classification",
          "embedding",
          "generation",
        ] as const) ?? fallback.modelSpec.task,
      fineTuneMethod:
        pickEnum(partial.modelSpec?.fineTuneMethod, [
          "lora",
          "full",
          "qlora",
        ] as const) ?? fallback.modelSpec.fineTuneMethod,
      languages: Array.isArray(partial.modelSpec?.languages)
        ? (partial.modelSpec!.languages as string[]).slice(0, 6)
        : fallback.modelSpec.languages,
    },
    evalSpec: {
      method: "holdout",
      sizeTarget: clamp(
        Number(partial.evalSpec?.sizeTarget ?? fallback.evalSpec.sizeTarget),
        200,
        10_000
      ),
      metric:
        pickEnum(partial.evalSpec?.metric, [
          "bleu",
          "accuracy",
          "f1",
          "perplexity",
        ] as const) ?? fallback.evalSpec.metric,
    },
    contributionWindow: {
      suggestedDurationDays: clamp(
        Number(
          partial.contributionWindow?.suggestedDurationDays ??
            fallback.contributionWindow.suggestedDurationDays
        ),
        3,
        30
      ),
      perWalletCap: clamp(
        Number(
          partial.contributionWindow?.perWalletCap ??
            fallback.contributionWindow.perWalletCap
        ),
        3,
        20
      ),
    },
    weights: normalizeWeights(partial.weights) ?? fallback.weights,
    datasetGuidance:
      Array.isArray(partial.datasetGuidance) && partial.datasetGuidance.length
        ? (partial.datasetGuidance as string[]).slice(0, 6)
        : fallback.datasetGuidance,
    meta,
  };
}

function pickEnum<T extends readonly string[]>(
  v: unknown,
  values: T
): T[number] | null {
  return typeof v === "string" && (values as readonly string[]).includes(v)
    ? (v as T[number])
    : null;
}

function clamp(n: number, lo: number, hi: number): number {
  if (Number.isNaN(n)) return lo;
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

function normalizeWeights(
  w: Partial<{ data: number; compute: number; capital: number }> | undefined
): { data: number; compute: number; capital: number } | null {
  if (!w) return null;
  const d = Number(w.data ?? 0);
  const c = Number(w.compute ?? 0);
  const k = Number(w.capital ?? 0);
  const sum = d + c + k;
  if (sum <= 0) return null;
  // Re-scale to 10_000 bps if the model returned out-of-spec weights.
  const scale = 10_000 / sum;
  return {
    data: Math.round(d * scale),
    compute: Math.round(c * scale),
    capital: 10_000 - Math.round(d * scale) - Math.round(c * scale),
  };
}

// ─── Fallback heuristic ────────────────────────────────────────────────

function inferDraftHeuristic(prompt: string): ForgeDraft {
  const lower = prompt.toLowerCase();
  const isTranslation =
    /translat|language|↔|<->|to english|to spanish|low-resource/.test(lower);
  const isClassifier = /classif|sentiment|intent|clause|detect|categori[sz]e/.test(
    lower
  );
  const isEmbedding = /embed|retrieval|search|similar/.test(lower);

  let task: ForgeDraft["modelSpec"]["task"] = "generation";
  let metric: ForgeDraft["evalSpec"]["metric"] = "perplexity";
  let baseModel = "Qwen2.5-1.5B-Instruct";
  if (isTranslation) {
    task = "translation";
    metric = "bleu";
    baseModel = "nllb-200-distilled-600M";
  } else if (isClassifier) {
    task = "classification";
    metric = "f1";
    baseModel = "DeBERTa-v3-base";
  } else if (isEmbedding) {
    task = "embedding";
    metric = "accuracy";
    baseModel = "bge-small-en";
  }

  const langs = extractLanguages(prompt);

  return {
    name: titleCase(prompt.split(/[.,;]/)[0]?.slice(0, 60) ?? "New Forge"),
    summary:
      task === "translation"
        ? `A ${baseModel} LoRA fine-tuned for ${langs.join(" ↔ ") || "the requested languages"}. Contribute corpus data; ownership mints proportionally to measured marginal improvement.`
        : task === "classification"
          ? `A ${baseModel} classifier for the domain described. Capital + counsel-grade labeled data sets.`
          : `A ${baseModel} model trained on community contributions.`,
    modelSpec: {
      baseModel,
      task,
      fineTuneMethod: task === "generation" ? "qlora" : "lora",
      languages: langs.length ? langs : undefined,
    },
    evalSpec: {
      method: "holdout",
      sizeTarget: task === "translation" ? 2_000 : 1_000,
      metric,
    },
    contributionWindow: {
      suggestedDurationDays: 7,
      perWalletCap: 5,
    },
    weights: { data: 7000, compute: 2000, capital: 1000 },
    datasetGuidance:
      task === "translation"
        ? [
            "Parallel sentence pairs (source ↔ target).",
            "Domain-balanced — news, conversation, formal.",
            "≥ 500 high-quality pairs to move the needle.",
          ]
        : task === "classification"
          ? [
              "Labeled examples per class (target ≥ 100 / class).",
              "Adversarial / edge-case samples improve marginal Δ.",
            ]
          : [
              "Domain-targeted text corpus, deduplicated.",
              "Clean tokenization; strip boilerplate.",
            ],
    meta: {
      generator: "foundry-stub",
      promptDigest: digest(prompt),
    },
  };
}

function extractLanguages(prompt: string): string[] {
  const langs = [
    "english",
    "spanish",
    "french",
    "german",
    "japanese",
    "korean",
    "chinese",
    "mandarin",
    "hindi",
    "konkani",
    "tulu",
    "tamil",
    "telugu",
    "kannada",
    "marathi",
    "bengali",
    "arabic",
    "portuguese",
    "russian",
  ];
  const found = new Set<string>();
  for (const l of langs) {
    if (prompt.toLowerCase().includes(l)) found.add(titleCase(l));
  }
  return Array.from(found);
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function digest(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
