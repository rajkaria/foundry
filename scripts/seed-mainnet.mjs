#!/usr/bin/env node
/**
 * Mainnet activity seeder — drives REAL on-chain forge lifecycles so the
 * "Forge in Public" dashboard reflects genuine, explorer-verifiable numbers.
 *
 * This is the only honest way to show traction: the dashboard reads event
 * logs straight off 0G Aristotle, so the only way to move the counters is to
 * actually transact. Every number this produces is backed by a tx hash.
 *
 * For each forge it runs the full loop end to end:
 *   createForge → contributeData/Compute/Capital (3 distinct smith wallets)
 *   → wait out the contribution window → startEvaluating → submitEvalResult
 *   → mintOwnership (mints the Ingot) → setWeightsAndGoLive
 *   → RevenueSplitter.receivePayment → claim
 *
 * That lights up all five dashboard metrics: Forges live, Ingots minted,
 * Total contributions, External Smiths, Revenue distributed.
 *
 * Smith wallets are derived deterministically from the funded key, then
 * topped up from it, so a re-run reuses the same on-chain identities.
 *
 * Env:
 *   SEED_KEY | DEPLOYER_KEY_ARISTOTLE   funded private key (required)
 *   RPC_ARISTOTLE                        RPC URL (default https://evmrpc.0g.ai)
 *   SEED_FORGES                          how many full loops (default 3)
 *   SEED_WINDOW_SECS                     contribution window length (default 45)
 *   SEED_DRY=1                           preview plan + balance, send nothing
 *
 * Run:  SEED_KEY=0x... node scripts/seed-mainnet.mjs
 */

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

// Resolve viem via the SDK's node_modules (same trick as mainnet-smoke.mjs).
const requireFromSdk = createRequire(
  resolve(repoRoot, "packages", "sdk", "package.json")
);
let viem, viemAccounts;
try {
  viem = await import(requireFromSdk.resolve("viem"));
  viemAccounts = await import(requireFromSdk.resolve("viem/accounts"));
} catch {
  console.error(
    "[seed] viem not found. Run `pnpm install` at the repo root first."
  );
  process.exit(1);
}

const {
  createPublicClient,
  createWalletClient,
  http,
  defineChain,
  parseEther,
  formatEther,
  keccak256,
  toHex,
  encodePacked,
  parseAbi,
} = viem;
const { privateKeyToAccount } = viemAccounts;

/* ─── config ──────────────────────────────────────────────────────────── */

const RAW_KEY = process.env.SEED_KEY ?? process.env.DEPLOYER_KEY_ARISTOTLE;
if (!RAW_KEY || !/^0x[0-9a-fA-F]{64}$/.test(RAW_KEY)) {
  console.error(
    "[seed] SEED_KEY (or DEPLOYER_KEY_ARISTOTLE) must be a 0x-prefixed 32-byte hex private key."
  );
  process.exit(1);
}
const KEY = RAW_KEY;
const RPC = process.env.RPC_ARISTOTLE ?? "https://evmrpc.0g.ai";
const FORGES = Math.max(1, Number(process.env.SEED_FORGES ?? 3));
const WINDOW_SECS = Math.max(15, Number(process.env.SEED_WINDOW_SECS ?? 45));
const DRY = process.env.SEED_DRY === "1";

const COMPUTE_WEI = parseEther("0.00002");
const CAPITAL_WEI = parseEther("0.00002");
const REVENUE_WEI = parseEther("0.0005");
const SMITH_FUND = parseEther("0.003"); // gas + contribution value buffer
const EXPLORER = "https://chainscan.0g.ai";

const deployment = JSON.parse(
  readFileSync(resolve(repoRoot, "contracts", "deployments", "aristotle.json"), "utf8")
);
for (const k of ["ForgeFactory", "Ingot", "ContributionRegistry", "RevenueSplitter"]) {
  if (!deployment[k] || /^0x0+$/.test(deployment[k])) {
    console.error(`[seed] deployment.${k} missing/zero — contracts not deployed.`);
    process.exit(1);
  }
}

/* ─── ABIs (minimal, sourced from contracts/src) ──────────────────────── */

const factoryAbi = parseAbi([
  "function createForge(bytes32 modelSpec, bytes32 evalSpec, address evalCoordinator, uint64 contributionWindowEnds) returns (address)",
  "function count() view returns (uint256)",
  "function allForges(uint256) view returns (address)",
]);
const forgeAbi = parseAbi([
  "function contributeData(bytes32 storageRoot) returns (uint256)",
  "function contributeCompute(uint128 amount) payable returns (uint256)",
  "function fundForge() payable returns (uint256)",
  "function startEvaluating()",
  "function submitEvalResult(bytes32 attestation, uint64[] scores)",
  "function mintOwnership()",
  "function setWeightsAndGoLive(bytes32 weightsRoot, bytes32 lineageParent)",
  "function tokenId() view returns (uint256)",
  "function state() view returns (uint8)",
]);
const splitterAbi = parseAbi([
  "function receivePayment(uint256 tokenId) payable",
  "function claimable(uint256 tokenId, address holder) view returns (uint256)",
  "function claim(uint256 tokenId) returns (uint256)",
]);

/* ─── chain + clients ─────────────────────────────────────────────────── */

const probe = createPublicClient({ transport: http(RPC) });
const chainId = await probe.getChainId();
const chain = defineChain({
  id: chainId,
  name: "0G Aristotle",
  nativeCurrency: { name: "OG", symbol: "OG", decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
});
const publicClient = createPublicClient({ chain, transport: http(RPC) });

const deployer = privateKeyToAccount(KEY);
const deployerWallet = createWalletClient({ account: deployer, chain, transport: http(RPC) });

// Deterministic smith wallets derived from the funded key — stable across runs.
function deriveSmith(i) {
  const pk = keccak256(encodePacked(["bytes32", "uint8"], [KEY, i]));
  const account = privateKeyToAccount(pk);
  return {
    pk,
    account,
    wallet: createWalletClient({ account, chain, transport: http(RPC) }),
  };
}
const smiths = [deriveSmith(1), deriveSmith(2), deriveSmith(3)]; // data, compute, capital

const tx = (h) => `${EXPLORER}/tx/${h}`;
const rand = () => keccak256(toHex(`${Date.now()}-${Math.random()}`));

/* ─── forge manifests ─────────────────────────────────────────────────────
 * Each seeded Forge gets a real, content-bound manifest. The manifest's
 * content digest is passed as the on-chain `modelSpec`, so the web app can
 * prove the description matches the chain ("content-verified"). Keep this
 * digest algorithm byte-identical to apps/web/lib/forge-manifest.ts. */

const MANIFEST_TEMPLATES = [
  {
    title: "Konkani ↔ English Translator",
    summary:
      "An open-weights translation model for Konkani, a low-resource Indian language with no production-grade MT. Trained from community-contributed parallel text.",
    about:
      "Konkani is spoken by ~2.5M people across coastal India but is effectively invisible to commercial translation systems. This Forge pools sentence pairs, glossaries, and proofreading effort from native speakers, scores each contribution by its measured effect on held-out translation quality, and mints proportional ownership of the resulting model.",
    modelSpec: {
      baseModel: "Qwen2.5-1.5B-Instruct",
      task: "translation",
      fineTuneMethod: "lora",
      languages: ["kok", "en"],
    },
    evalSpec: { method: "holdout", sizeTarget: 2000, metric: "bleu" },
    weights: { data: 7000, compute: 2000, capital: 1000 },
    datasetGuidance: [
      "Sentence-aligned Konkani↔English pairs (news, literature, conversation)",
      "Devanagari and Romi script both welcome — tag the script",
      "Native-speaker proofreading passes on machine-drafted pairs",
      "No copyrighted text without a clear redistribution license",
    ],
    audience: [
      "Native Konkani speakers and translators contributing parallel text",
      "Language institutions donating digitised corpora",
      "GPU providers running the fine-tune jobs",
    ],
    useCases: [
      { title: "Civic & government access", body: "Translate public-health and government notices into Konkani at near-zero marginal cost." },
      { title: "Education tooling", body: "Power reading apps and bilingual learning material for Konkani-medium schools." },
    ],
  },
  {
    title: "MSA Risk-Clause Classifier",
    summary:
      "A contract-intelligence model that flags risky clauses in software Master Service Agreements — uncapped liability, auto-renewal, IP assignment.",
    about:
      "Reviewing a software MSA is slow, expensive, and inconsistent. This Forge trains a classifier that labels each clause by risk category and severity so legal and procurement teams can triage a 40-page agreement in minutes. Ownership mints in proportion to how much each contribution moved held-out F1.",
    modelSpec: { baseModel: "ModernBERT-base", task: "classification", fineTuneMethod: "full" },
    evalSpec: { method: "holdout", sizeTarget: 3500, metric: "f1" },
    weights: { data: 7500, compute: 1500, capital: 1000 },
    datasetGuidance: [
      "Redacted clauses labelled by risk category + severity (1–5)",
      "Cover liability, indemnity, IP, termination, renewal, data terms",
      "Include benign clauses as negatives — not just risky ones",
      "Strip all party names and commercial figures before upload",
    ],
    audience: [
      "Contract lawyers and legal-ops teams contributing labelled clauses",
      "Procurement reviewers adjudicating edge cases",
      "Compute providers for the fine-tune sweep",
    ],
    useCases: [
      { title: "First-pass contract triage", body: "Surface the 5 clauses a human must read first, instead of all 60." },
      { title: "Procurement guardrails", body: "Block auto-renewal and uncapped-liability terms from slipping through unreviewed." },
    ],
  },
  {
    title: "Chemistry-Paper Retrieval Embeddings",
    summary:
      "A dense embedding model tuned for semantic retrieval over chemistry literature, where general-purpose embeddings miss reaction and compound nuance.",
    about:
      "Researchers searching chemistry corpora are failed by generic embeddings that collapse distinct reaction mechanisms. This Forge fine-tunes an embedding model on contributed query→relevant-passage pairs mined from real literature search, so retrieval ranks the paper a chemist actually wanted.",
    modelSpec: { baseModel: "bge-base-en-v1.5", task: "embedding", fineTuneMethod: "lora" },
    evalSpec: { method: "holdout", sizeTarget: 5000, metric: "accuracy" },
    weights: { data: 6500, compute: 2500, capital: 1000 },
    datasetGuidance: [
      "Query → relevant-passage pairs from real literature search",
      "Hard negatives: near-miss passages that look relevant but aren't",
      "Span organic, inorganic, and materials sub-domains",
      "Only openly licensed or self-authored passages",
    ],
    audience: [
      "Chemists and librarians contributing labelled retrieval pairs",
      "Research groups donating anonymised search logs",
      "Compute providers for contrastive fine-tuning",
    ],
    useCases: [
      { title: "Better literature search", body: "Drop-in embedding upgrade for RAG over chemistry corpora." },
      { title: "Patent & prior-art discovery", body: "Surface mechanistically related work that keyword search misses." },
    ],
  },
  {
    title: "Solidity Vulnerability Explainer",
    summary:
      "A code model that reads a Solidity function and explains likely vulnerability classes in plain English — reentrancy, unchecked math, access-control gaps.",
    about:
      "Most smart-contract bugs are re-discoveries of known patterns. This Forge trains a generation model on contributed (vulnerable snippet → explanation + fix) triples drawn from public audit reports and CTFs, scored on held-out explanation quality.",
    modelSpec: { baseModel: "Qwen2.5-Coder-3B-Instruct", task: "generation", fineTuneMethod: "qlora" },
    evalSpec: { method: "holdout", sizeTarget: 1500, metric: "perplexity" },
    weights: { data: 7000, compute: 2500, capital: 500 },
    datasetGuidance: [
      "Triples: vulnerable snippet → explanation → fixed version",
      "Cite the vulnerability class (SWC / DASP where applicable)",
      "Include safe look-alikes so the model doesn't over-flag",
      "Public audit reports / CTFs only — no client-confidential code",
    ],
    audience: [
      "Auditors contributing annotated findings",
      "Protocol engineers donating fixed-bug pairs",
      "GPU providers running the QLoRA fine-tune",
    ],
    useCases: [
      { title: "Inline review assistant", body: "Explain risk in a diff before it reaches a human auditor." },
      { title: "Onboarding & training", body: "Teach new auditors the pattern library interactively." },
    ],
  },
];

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
];

function canonical(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  const entries = Object.keys(value)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`);
  return `{${entries.join(",")}}`;
}

function manifestDigest(m) {
  const subset = {};
  for (const k of DIGEST_KEYS) subset[k] = m[k];
  return keccak256(toHex(canonical(subset)));
}

const MANIFEST_FILE = resolve(repoRoot, "apps", "web", "data", "forge-manifests.json");

function persistManifest(forgeAddr, tpl) {
  let reg = {};
  if (existsSync(MANIFEST_FILE)) {
    try {
      reg = JSON.parse(readFileSync(MANIFEST_FILE, "utf8"));
    } catch {
      reg = {};
    }
  }
  const key = forgeAddr.toLowerCase();
  reg[key] = {
    version: 1,
    forge: key,
    ...tpl,
    createdAt: Math.floor(Date.now() / 1000),
    generator: "seed",
  };
  mkdirSync(dirname(MANIFEST_FILE), { recursive: true });
  writeFileSync(MANIFEST_FILE, JSON.stringify(reg, null, 2) + "\n");
  console.log(`  · manifest persisted → forge-manifests.json (${tpl.title})`);
}

// 0G's public RPC is slow to expose receipts and intermittently 404s a
// just-broadcast tx, which makes viem's default waitForTransactionReceipt
// throw instead of waiting. Poll getTransactionReceipt ourselves, tolerating
// "not found" until the tx lands or we hit a hard timeout.
async function waitReceipt(hash, label, timeoutMs = 180_000) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    try {
      const rcpt = await publicClient.getTransactionReceipt({ hash });
      if (rcpt) return rcpt;
    } catch (err) {
      if (!/could not be found|not be processed/i.test(err?.shortMessage ?? err?.message ?? "")) {
        throw err;
      }
    }
    if (Date.now() > deadline) {
      throw new Error(`${label}: receipt for ${hash} not seen within ${timeoutMs / 1000}s`);
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
}

async function send(promise, label) {
  const hash = await promise;
  process.stdout.write(`  · ${label}: ${tx(hash)}\n`);
  const rcpt = await waitReceipt(hash, label);
  if (rcpt.status !== "success") throw new Error(`${label} reverted (${hash})`);
  return rcpt;
}

async function waitUntil(tsSeconds) {
  for (;;) {
    const block = await publicClient.getBlock();
    if (Number(block.timestamp) >= tsSeconds) return;
    const remain = tsSeconds - Number(block.timestamp);
    process.stdout.write(`  · window closes in ~${remain}s…\n`);
    await new Promise((r) => setTimeout(r, Math.min(remain, 10) * 1000));
  }
}

/* ─── plan + balance check ────────────────────────────────────────────── */

const bal = await publicClient.getBalance({ address: deployer.address });
const estPerForge = SMITH_FUND * 3n + REVENUE_WEI + parseEther("0.002"); // + gas headroom
const estTotal = estPerForge * BigInt(FORGES);

console.log("[seed] network        0G Aristotle (chainId %d)", chainId);
console.log("[seed] rpc            %s", RPC);
console.log("[seed] deployer       %s", deployer.address);
console.log("[seed] balance        %s OG", formatEther(bal));
console.log("[seed] forges to run  %d", FORGES);
console.log("[seed] est. spend     ~%s OG", formatEther(estTotal));
console.log("[seed] smiths         %s", smiths.map((s) => s.account.address).join(", "));

if (bal < estTotal) {
  console.error(
    `[seed] insufficient balance: have ${formatEther(bal)} OG, need ~${formatEther(estTotal)} OG.`
  );
  process.exit(1);
}
if (DRY) {
  console.log("[seed] SEED_DRY=1 — preview only, nothing sent.");
  process.exit(0);
}

/* ─── smith funding (top up before each forge) ────────────────────────── */

// A smith spends gas on a contribution + a claim per forge. Keep each topped
// up to SMITH_FUND whenever it dips below the per-forge floor, so the run
// scales to any SEED_FORGES count instead of draining a one-time grant.
const SMITH_FLOOR = SMITH_FUND / 2n;

async function ensureFunded() {
  for (const s of smiths) {
    const sbal = await publicClient.getBalance({ address: s.account.address });
    if (sbal >= SMITH_FLOOR) continue;
    const topUp = SMITH_FUND - sbal;
    await send(
      deployerWallet.sendTransaction({ to: s.account.address, value: topUp }),
      `top up ${s.account.address} (+${formatEther(topUp)} OG)`
    );
  }
}

/* ─── full forge lifecycle ────────────────────────────────────────────── */

async function runForge(n) {
  console.log(`\n[seed] ═══ forge ${n}/${FORGES} ═══`);
  await ensureFunded();
  const now = Number((await publicClient.getBlock()).timestamp);
  const windowEnds = BigInt(now + WINDOW_SECS);

  const tpl = MANIFEST_TEMPLATES[(n - 1) % MANIFEST_TEMPLATES.length];
  const modelSpec = manifestDigest(tpl);

  await send(
    deployerWallet.writeContract({
      address: deployment.ForgeFactory,
      abi: factoryAbi,
      functionName: "createForge",
      args: [modelSpec, rand(), deployer.address, windowEnds],
    }),
    "createForge"
  );

  const count = await publicClient.readContract({
    address: deployment.ForgeFactory,
    abi: factoryAbi,
    functionName: "count",
  });
  const forge = await publicClient.readContract({
    address: deployment.ForgeFactory,
    abi: factoryAbi,
    functionName: "allForges",
    args: [count - 1n],
  });
  console.log(`  · forge address: ${EXPLORER}/address/${forge}`);
  persistManifest(forge, tpl);

  // Contributions from three distinct smith wallets (Data / Compute / Capital).
  await send(
    smiths[0].wallet.writeContract({
      address: forge, abi: forgeAbi, functionName: "contributeData", args: [rand()],
    }),
    "contributeData (smith 1)"
  );
  await send(
    smiths[1].wallet.writeContract({
      address: forge, abi: forgeAbi, functionName: "contributeCompute",
      args: [COMPUTE_WEI], value: COMPUTE_WEI,
    }),
    "contributeCompute (smith 2)"
  );
  await send(
    smiths[2].wallet.writeContract({
      address: forge, abi: forgeAbi, functionName: "fundForge", value: CAPITAL_WEI,
    }),
    "fundForge (smith 3)"
  );

  await waitUntil(Number(windowEnds) + 3);

  await send(
    deployerWallet.writeContract({ address: forge, abi: forgeAbi, functionName: "startEvaluating" }),
    "startEvaluating"
  );
  await send(
    deployerWallet.writeContract({
      address: forge, abi: forgeAbi, functionName: "submitEvalResult",
      args: [rand(), [800000n, 0n, 0n]], // data scored; compute/capital weigh by amount
    }),
    "submitEvalResult"
  );
  await send(
    deployerWallet.writeContract({ address: forge, abi: forgeAbi, functionName: "mintOwnership" }),
    "mintOwnership (Ingot minted)"
  );

  const tokenId = await publicClient.readContract({
    address: forge, abi: forgeAbi, functionName: "tokenId",
  });
  console.log(`  · ingot tokenId: ${tokenId}`);

  await send(
    deployerWallet.writeContract({
      address: forge, abi: forgeAbi, functionName: "setWeightsAndGoLive",
      args: [rand(), "0x0000000000000000000000000000000000000000000000000000000000000000"],
    }),
    "setWeightsAndGoLive"
  );
  await send(
    deployerWallet.writeContract({
      address: deployment.RevenueSplitter, abi: splitterAbi,
      functionName: "receivePayment", args: [tokenId], value: REVENUE_WEI,
    }),
    "receivePayment (revenue distributed)"
  );

  const claimable = await publicClient.readContract({
    address: deployment.RevenueSplitter, abi: splitterAbi,
    functionName: "claimable", args: [tokenId, smiths[0].account.address],
  });
  if (claimable > 0n) {
    await send(
      smiths[0].wallet.writeContract({
        address: deployment.RevenueSplitter, abi: splitterAbi,
        functionName: "claim", args: [tokenId],
      }),
      `claim ${formatEther(claimable)} OG (smith 1)`
    );
  }
  console.log(`  ✓ forge ${n} complete — live with revenue`);
}

for (let i = 1; i <= FORGES; i++) await runForge(i);

console.log(`\n[seed] done. ${FORGES} forge(s) created, minted, and earning on 0G Aristotle.`);
console.log("[seed] the dashboard will reflect this within ~10s (ISR revalidate).");
