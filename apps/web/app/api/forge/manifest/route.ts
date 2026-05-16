/**
 * Forge manifest registry endpoint.
 *
 *   GET  /api/forge/manifest?forge=0x…   → the manifest, or 404
 *   POST /api/forge/manifest             → upsert a manifest
 *
 * The POST response always includes the deterministic content `digest`.
 * Manifest-aware Forge creators pass that digest as the on-chain
 * `modelSpec`, which makes the description cryptographically verifiable on
 * read (`isContentVerified`). Persistence is best-effort: on a read-only
 * serverless filesystem the digest is still returned so the on-chain anchor
 * stays correct.
 */

import { NextResponse, type NextRequest } from "next/server";
import { isAddress, type Address } from "viem";
import {
  getManifest,
  upsertManifest,
  type ForgeManifest,
} from "@/lib/forge-manifest";

export const runtime = "nodejs";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const forge = req.nextUrl.searchParams.get("forge");
  if (!forge || !isAddress(forge)) {
    return NextResponse.json(
      { error: "pass a valid ?forge=0x… address" },
      { status: 400 }
    );
  }
  const manifest = await getManifest(forge);
  if (!manifest) {
    return NextResponse.json({ error: "no manifest for forge" }, { status: 404 });
  }
  return NextResponse.json({ manifest });
}

const TASKS = ["translation", "classification", "embedding", "generation"];
const METHODS = ["lora", "full", "qlora"];
const METRICS = ["bleu", "accuracy", "f1", "perplexity"];

function validate(b: unknown): { ok: true; m: ForgeManifest } | { ok: false; why: string } {
  if (!b || typeof b !== "object") return { ok: false, why: "body must be an object" };
  const m = b as Record<string, unknown>;
  if (typeof m.forge !== "string" || !isAddress(m.forge))
    return { ok: false, why: "forge must be a valid address" };
  if (typeof m.title !== "string" || m.title.length < 3 || m.title.length > 80)
    return { ok: false, why: "title must be 3–80 chars" };
  if (typeof m.summary !== "string" || m.summary.length < 10)
    return { ok: false, why: "summary too short" };
  if (typeof m.about !== "string" || m.about.length < 20)
    return { ok: false, why: "about too short" };
  const ms = m.modelSpec as Record<string, unknown> | undefined;
  if (!ms || typeof ms.baseModel !== "string")
    return { ok: false, why: "modelSpec.baseModel required" };
  if (!TASKS.includes(ms.task as string))
    return { ok: false, why: "modelSpec.task invalid" };
  if (!METHODS.includes(ms.fineTuneMethod as string))
    return { ok: false, why: "modelSpec.fineTuneMethod invalid" };
  const es = m.evalSpec as Record<string, unknown> | undefined;
  if (!es || !METRICS.includes(es.metric as string))
    return { ok: false, why: "evalSpec.metric invalid" };
  const w = m.weights as Record<string, number> | undefined;
  if (!w || w.data + w.compute + w.capital !== 10000)
    return { ok: false, why: "weights must sum to 10000 bps" };
  if (!Array.isArray(m.datasetGuidance) || m.datasetGuidance.length < 3)
    return { ok: false, why: "datasetGuidance needs ≥3 bullets" };
  if (!Array.isArray(m.audience) || m.audience.length < 2)
    return { ok: false, why: "audience needs ≥2 entries" };
  if (!Array.isArray(m.useCases) || m.useCases.length < 2)
    return { ok: false, why: "useCases needs ≥2 entries" };

  const manifest: ForgeManifest = {
    version: 1,
    forge: (m.forge as string).toLowerCase() as Address,
    title: m.title as string,
    summary: m.summary as string,
    about: m.about as string,
    modelSpec: {
      baseModel: ms.baseModel as string,
      task: ms.task as ForgeManifest["modelSpec"]["task"],
      fineTuneMethod: ms.fineTuneMethod as ForgeManifest["modelSpec"]["fineTuneMethod"],
      languages: Array.isArray(ms.languages)
        ? (ms.languages as string[]).slice(0, 6)
        : undefined,
    },
    evalSpec: {
      method: "holdout",
      sizeTarget: Math.max(
        100,
        Math.min(20000, Number((es.sizeTarget as number) ?? 1000))
      ),
      metric: es.metric as ForgeManifest["evalSpec"]["metric"],
    },
    weights: {
      data: Number(w.data),
      compute: Number(w.compute),
      capital: Number(w.capital),
    },
    datasetGuidance: (m.datasetGuidance as string[]).slice(0, 8),
    audience: (m.audience as string[]).slice(0, 8),
    useCases: (m.useCases as { title: string; body: string }[])
      .slice(0, 6)
      .map((u) => ({ title: String(u.title), body: String(u.body) })),
    createdAt: Math.floor(Date.now() / 1000),
    generator:
      m.generator === "ai-wizard" || m.generator === "manual"
        ? m.generator
        : "manual",
  };
  return { ok: true, m: manifest };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const v = validate(body);
  if (!v.ok) return NextResponse.json({ error: v.why }, { status: 422 });

  const { digest, persisted } = await upsertManifest(v.m);
  return NextResponse.json(
    {
      ok: true,
      digest,
      persisted,
      forge: v.m.forge,
      note: persisted
        ? "manifest stored; pass `digest` as the on-chain modelSpec to content-verify"
        : "filesystem is read-only here — digest is still valid; persist via the seed registry",
    },
    { status: 200 }
  );
}
