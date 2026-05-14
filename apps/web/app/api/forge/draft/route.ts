/**
 * AI-assisted Forge creation.
 *
 * Input:  natural-language prompt ("I want a translator for legal contracts JA→EN")
 * Output: a typed ForgeDraft the wizard pre-fills.
 *
 * Sprint 2 ships a deterministic stub that mirrors the final response shape.
 * Sprint 3 swaps the backend to a Claude call with a structured schema.
 */

import { NextResponse, type NextRequest } from "next/server";

export const runtime = "edge";

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
    generator: "foundry-stub" | "claude";
    promptDigest: string;
  };
}

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

  const draft: ForgeDraft = inferDraft(prompt);
  return NextResponse.json(draft);
}

function inferDraft(prompt: string): ForgeDraft {
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
