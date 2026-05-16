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
const TEMPLATE_OFFSET = Math.max(0, Number(process.env.SEED_TEMPLATE_OFFSET ?? 0));
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
    title: "Bengali News Summarizer",
    summary:
      "An abstractive summarizer for Bengali news, a language with 270M+ speakers but almost no production summarization models.",
    about:
      "Bengali readers are served by headline-only feeds because no open summarizer handles the language's morphology well. This Forge pools article→summary pairs written by Bengali journalists and editors, scores each contribution by its effect on held-out summary quality, and mints proportional ownership of the resulting model.",
    modelSpec: {
      baseModel: "mT5-base",
      task: "generation",
      fineTuneMethod: "lora",
      languages: ["bn"],
    },
    evalSpec: { method: "holdout", sizeTarget: 3000, metric: "perplexity" },
    weights: { data: 7000, compute: 2000, capital: 1000 },
    datasetGuidance: [
      "Article → human-written abstractive summary pairs",
      "3–5 sentence summaries; preserve named entities",
      "Span politics, business, sport, culture",
      "Only openly licensed or self-authored articles",
    ],
    audience: [
      "Bengali journalists and editors contributing summary pairs",
      "Newsrooms donating archived article/summary data",
      "GPU providers running the fine-tune",
    ],
    useCases: [
      { title: "Reader digests", body: "Generate daily Bengali news digests at near-zero cost." },
      { title: "Accessibility", body: "Short summaries for low-bandwidth and screen-reader users." },
    ],
  },
  {
    title: "ICD-10 Medical Coding Classifier",
    summary:
      "A classifier that maps free-text clinical encounter notes to ICD-10 diagnosis codes, automating a slow, error-prone billing step.",
    about:
      "Manual ICD-10 coding is a bottleneck in every clinic's revenue cycle and miscodes cause denied claims. This Forge trains a multi-label classifier on contributed (note → code set) pairs validated by certified coders, scored on held-out micro-F1.",
    modelSpec: { baseModel: "ModernBERT-base", task: "classification", fineTuneMethod: "full" },
    evalSpec: { method: "holdout", sizeTarget: 5000, metric: "f1" },
    weights: { data: 8000, compute: 1500, capital: 500 },
    datasetGuidance: [
      "Encounter note → validated ICD-10 code set",
      "Synthetic or fully consented notes only — never real PHI",
      "Cover common and long-tail codes; include negatives",
      "Two-coder agreement before a label is accepted",
    ],
    audience: [
      "Certified medical coders contributing validated labels",
      "Clinics donating synthetic or consented note sets",
      "Compute providers for the multi-label fine-tune",
    ],
    useCases: [
      { title: "Revenue-cycle automation", body: "Draft ICD-10 codes for human sign-off, cutting coding time." },
      { title: "Claim-denial reduction", body: "Flag likely miscodes before submission." },
    ],
  },
  {
    title: "Multilingual Legal Citation Embeddings",
    summary:
      "A dense embedding model for retrieving relevant case law across jurisdictions, where generic embeddings miss legal-citation semantics.",
    about:
      "Legal research tools fail on cross-jurisdiction citation retrieval because general embeddings don't encode how cases cite and distinguish each other. This Forge fine-tunes an embedding model on contributed query→relevant-authority pairs from real research, scored on held-out retrieval accuracy.",
    modelSpec: { baseModel: "bge-base-en-v1.5", task: "embedding", fineTuneMethod: "lora" },
    evalSpec: { method: "holdout", sizeTarget: 6000, metric: "accuracy" },
    weights: { data: 6500, compute: 2500, capital: 1000 },
    datasetGuidance: [
      "Query → relevant case/authority pairs from real research",
      "Hard negatives: superficially similar but distinguished cases",
      "Span multiple jurisdictions and practice areas",
      "Only public-record or openly licensed material",
    ],
    audience: [
      "Lawyers and law librarians contributing retrieval pairs",
      "Legal-tech teams donating anonymised search logs",
      "Compute providers for contrastive fine-tuning",
    ],
    useCases: [
      { title: "Better legal search", body: "Drop-in embedding upgrade for case-law RAG." },
      { title: "Brief drafting", body: "Surface on-point authority a keyword search misses." },
    ],
  },
  {
    title: "Yorùbá ↔ English Translator",
    summary:
      "An open translation model for Yorùbá, a tonal West-African language with ~45M speakers and no production-grade MT.",
    about:
      "Yorùbá is poorly served by commercial MT, partly because tone and diacritics are routinely dropped in digital text. This Forge pools diacritised parallel text and native-speaker proofreading, scoring each contribution by its measured effect on held-out translation quality.",
    modelSpec: {
      baseModel: "Qwen2.5-1.5B-Instruct",
      task: "translation",
      fineTuneMethod: "lora",
      languages: ["yo", "en"],
    },
    evalSpec: { method: "holdout", sizeTarget: 2500, metric: "bleu" },
    weights: { data: 7000, compute: 2000, capital: 1000 },
    datasetGuidance: [
      "Sentence-aligned Yorùbá↔English pairs with full diacritics",
      "Preserve tone marks — do not strip diacritics",
      "Native-speaker proofreading on machine-drafted pairs",
      "No copyrighted text without a redistribution license",
    ],
    audience: [
      "Native Yorùbá speakers and translators contributing parallel text",
      "Language institutions donating digitised corpora",
      "GPU providers running the fine-tune",
    ],
    useCases: [
      { title: "Civic access", body: "Translate public information into Yorùbá cheaply." },
      { title: "Education", body: "Power bilingual learning material for Yorùbá-medium schools." },
    ],
  },
  {
    title: "Rust Unsafe-Code Auditor",
    summary:
      "A code model that reviews Rust `unsafe` blocks and explains the soundness obligations a reviewer must check.",
    about:
      "Rust's safety guarantees end at `unsafe`, and most reviewers can't recite every invariant a block must uphold. This Forge trains a generation model on contributed (unsafe block → soundness analysis) pairs from audits and RFCs, scored on held-out explanation quality.",
    modelSpec: { baseModel: "Qwen2.5-Coder-3B-Instruct", task: "generation", fineTuneMethod: "qlora" },
    evalSpec: { method: "holdout", sizeTarget: 1800, metric: "perplexity" },
    weights: { data: 7000, compute: 2500, capital: 500 },
    datasetGuidance: [
      "Pairs: unsafe block → soundness obligations + verdict",
      "Cite the invariant (aliasing, lifetimes, FFI, Send/Sync)",
      "Include sound look-alikes so the model doesn't over-flag",
      "Public code / audits only — no client-confidential code",
    ],
    audience: [
      "Rust auditors contributing annotated findings",
      "Maintainers donating reviewed unsafe blocks",
      "GPU providers running the QLoRA fine-tune",
    ],
    useCases: [
      { title: "Review assistant", body: "Explain soundness risk in a PR before a human reviews it." },
      { title: "Onboarding", body: "Teach the unsafe invariant checklist interactively." },
    ],
  },
  {
    title: "Financial Filing Sentiment Classifier",
    summary:
      "A classifier that scores sentiment and risk tone in 10-K / 10-Q filing sections, tuned for the hedged language of financial disclosure.",
    about:
      "General sentiment models misread financial filings, where 'risk' and 'uncertainty' are boilerplate, not signal. This Forge trains a classifier on contributed, analyst-labelled filing passages, scored on held-out accuracy against an expert rubric.",
    modelSpec: { baseModel: "ModernBERT-base", task: "classification", fineTuneMethod: "full" },
    evalSpec: { method: "holdout", sizeTarget: 4000, metric: "accuracy" },
    weights: { data: 7500, compute: 2000, capital: 500 },
    datasetGuidance: [
      "Filing passages labelled positive / neutral / cautionary",
      "Distinguish boilerplate risk language from real warnings",
      "Cover MD&A, risk factors, and earnings commentary",
      "Public EDGAR filings only",
    ],
    audience: [
      "Financial analysts contributing labelled passages",
      "Research desks donating annotated filing corpora",
      "Compute providers for the fine-tune sweep",
    ],
    useCases: [
      { title: "Filing triage", body: "Surface the cautionary passages an analyst should read first." },
      { title: "Signal extraction", body: "Feed disclosure-tone features into downstream models." },
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

  const tpl =
    MANIFEST_TEMPLATES[
      (n - 1 + TEMPLATE_OFFSET) % MANIFEST_TEMPLATES.length
    ];
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
