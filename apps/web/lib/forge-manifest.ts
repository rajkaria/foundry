/**
 * Forge manifests — the human-readable layer on top of on-chain Forges.
 *
 * A Forge's on-chain `modelSpec` / `evalSpec` are opaque `bytes32`. The
 * manifest is the off-chain document that says, in plain language, what the
 * Forge is training, who should contribute, what they earn, and what the
 * resulting Ingot is good for.
 *
 * Binding model:
 *
 *   - `manifestDigest(m)` is the keccak256 of the canonical JSON of the
 *     manifest's *content subset* (title…useCases). It's deterministic and
 *     can be computed before a Forge exists.
 *   - Manifest-aware creators pass that digest as the on-chain `modelSpec`.
 *     When `digest === forge.modelSpec` the page shows a "content-verified"
 *     badge: the description is provably the one the creator committed to.
 *   - Legacy/seeded Forges used random spec hashes, so their manifests are
 *     keyed by address only and render as "off-chain manifest" (still useful,
 *     just not cryptographically bound).
 *
 * Store: a JSON registry committed at `apps/web/data/forge-manifests.json`.
 * Reads always work (bundled with the deploy). Writes succeed on a writable
 * filesystem (local dev, Railway container) and degrade gracefully to
 * digest-only on read-only serverless filesystems.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { keccak256, toHex, type Address, type Hex } from "viem";

export type ForgeTask = "translation" | "classification" | "embedding" | "generation";
export type FineTuneMethod = "lora" | "full" | "qlora";
export type EvalMetric = "bleu" | "accuracy" | "f1" | "perplexity";

export interface ForgeManifest {
  /** Schema version. */
  version: 1;
  /** Lowercased forge address — the registry key. */
  forge: Address;
  /** Short human name, e.g. "Konkani ↔ English Translator". */
  title: string;
  /** One or two sentences: what this Forge produces and why. */
  summary: string;
  /** A paragraph: what the Forge is about, who it serves, why it matters. */
  about: string;
  modelSpec: {
    baseModel: string;
    task: ForgeTask;
    fineTuneMethod: FineTuneMethod;
    languages?: string[];
  };
  evalSpec: {
    method: "holdout";
    sizeTarget: number;
    metric: EvalMetric;
  };
  /** Attribution weights in basis points; sum = 10000. */
  weights: { data: number; compute: number; capital: number };
  /** 3–6 bullets describing the ideal contribution shape. */
  datasetGuidance: string[];
  /** Who should contribute and what they bring. */
  audience: string[];
  /** What the resulting Ingot unlocks downstream. */
  useCases: { title: string; body: string }[];
  /** Unix seconds — when the manifest was authored. */
  createdAt: number;
  /** Provenance of the manifest. */
  generator: "ai-wizard" | "seed" | "manual";
}

/** Fields that are hashed for the on-chain content binding. */
const DIGEST_KEYS = [
  "title",
  "summary",
  "about",
  "modelSpec",
  "evalSpec",
  "weights",
  "datasetGuidance",
  "audience",
  "useCases",
] as const;

/** Sort-keys JSON so the same logical content always hashes the same. */
function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const entries = Object.keys(obj)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${canonical(obj[k])}`);
  return `{${entries.join(",")}}`;
}

/**
 * Deterministic content hash of a manifest's descriptive subset. Stable
 * before the Forge address is known, so it can be passed as the on-chain
 * `modelSpec` at create time and verified on read.
 */
export function manifestDigest(m: Partial<ForgeManifest>): Hex {
  const subset: Record<string, unknown> = {};
  for (const k of DIGEST_KEYS) subset[k] = (m as Record<string, unknown>)[k];
  return keccak256(toHex(canonical(subset)));
}

/** True when the manifest is cryptographically bound to the on-chain spec. */
export function isContentVerified(m: ForgeManifest, onChainModelSpec: Hex): boolean {
  return manifestDigest(m).toLowerCase() === onChainModelSpec.toLowerCase();
}

type Registry = Record<string, ForgeManifest>;

// The committed registry lives at apps/web/data/forge-manifests.json. Next
// runs server code from a few possible cwds depending on monorepo layout, so
// probe the likely locations and cache the resolved path.
const CANDIDATES = [
  () => path.join(process.cwd(), "data", "forge-manifests.json"),
  () => path.join(process.cwd(), "apps", "web", "data", "forge-manifests.json"),
  () =>
    path.join(process.cwd(), "..", "..", "apps", "web", "data", "forge-manifests.json"),
];

let resolvedPath: string | null = null;
let cache: { at: number; data: Registry } | null = null;
const CACHE_MS = 5_000;

async function locate(): Promise<string> {
  if (resolvedPath) return resolvedPath;
  for (const make of CANDIDATES) {
    const p = make();
    try {
      await fs.access(p);
      resolvedPath = p;
      return p;
    } catch {
      /* try next */
    }
  }
  // Default to the canonical monorepo path; writes will create it.
  resolvedPath = CANDIDATES[1]();
  return resolvedPath;
}

async function readRegistry(): Promise<Registry> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.data;
  try {
    const raw = await fs.readFile(await locate(), "utf8");
    const data = JSON.parse(raw) as Registry;
    cache = { at: Date.now(), data };
    return data;
  } catch {
    return {};
  }
}

/** Resolve a single Forge's manifest, or `null` if none is registered. */
export async function getManifest(
  forge: Address | string
): Promise<ForgeManifest | null> {
  const reg = await readRegistry();
  return reg[forge.toLowerCase()] ?? null;
}

/** Every registered manifest, keyed by lowercased forge address. */
export async function getAllManifests(): Promise<Registry> {
  return readRegistry();
}

export interface UpsertResult {
  digest: Hex;
  /** Whether the manifest was durably written to the registry file. */
  persisted: boolean;
}

/**
 * Insert or replace a manifest. Always returns the content digest (so the
 * caller can anchor it on-chain even when the filesystem is read-only).
 */
export async function upsertManifest(m: ForgeManifest): Promise<UpsertResult> {
  const digest = manifestDigest(m);
  const key = m.forge.toLowerCase();
  try {
    const reg = await readRegistry();
    const next: Registry = { ...reg, [key]: { ...m, forge: key as Address } };
    const target = await locate();
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, JSON.stringify(next, null, 2) + "\n", "utf8");
    cache = { at: Date.now(), data: next };
    return { digest, persisted: true };
  } catch {
    return { digest, persisted: false };
  }
}
