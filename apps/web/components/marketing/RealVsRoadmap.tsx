"use client";

import { motion } from "motion/react";
import { Pill } from "@/components/ui/Pill";

type Status = "real" | "stub" | "roadmap";

interface Row {
  item: string;
  status: Status;
  note?: string;
}

const rows: Row[] = [
  // ─── REAL — live on chain or fully implemented + tested ───────────────
  {
    item: "6 Solidity contracts — full integration test coverage",
    status: "real",
    note: "Forge.t.sol exercises the full Open → Live lifecycle.",
  },
  {
    item: "LOO attribution math + on-chain digest commit",
    status: "real",
    note: "Forge.submitEvalResult writes the score-vector digest.",
  },
  {
    item: "$FORGE-denominated proportional ownership minting",
    status: "real",
  },
  {
    item: "RevenueSplitter — pull-payment claims",
    status: "real",
  },
  {
    item: "@foundryprotocol/sdk + Vercel AI / LangChain / OpenAI adapters",
    status: "real",
  },
  {
    item: "Lineage Graph — read directly from Ingot.meta() on-chain",
    status: "real",
  },
  {
    item: "Forge in Public dashboard — counts derived from chain logs",
    status: "real",
    note: "Empty when undeployed; never mocked.",
  },
  {
    item: "TEE attestation envelope — ECDSA-signed, ecrecover-verifiable",
    status: "real",
    note: "Tests cover tamper-detection + signer recovery.",
  },
  {
    item: "Deploy infrastructure — Makefile + Anvil dry-run in CI",
    status: "real",
  },

  // ─── STUB — wired end-to-end, but final 0G primitive not bound yet ────
  {
    item: "Contracts deployed to 0G Aristotle mainnet",
    status: "stub",
    note: "Compiled + tested; deploy is one `make deploy-aristotle` away.",
  },
  {
    item: "Inference proxy — OpenAI-compatible, routes via 0G Compute broker",
    status: "stub",
    note: "Broker wired; activates with ZG_BROKER_KEY + ZG_INFERENCE_PROVIDER.",
  },
  {
    item: "AI-assisted Forge wizard — 0G Compute structured generation",
    status: "stub",
    note: "Live LLM call falls back to a regex heuristic on missing env.",
  },
  {
    item: "TEE-hosted eval coordinator (SGX/TDX quote)",
    status: "stub",
    note: "Envelope + signature verified; SGX measurement is a placeholder.",
  },
  {
    item: "Live revenue tx hash in inference receipts",
    status: "stub",
    note: "Inference fee is reserved by the broker; final RevenueSplitter wire-up is v2.",
  },

  // ─── ROADMAP — designed, not yet built ────────────────────────────────
  {
    item: "Shapley / influence-function attribution",
    status: "roadmap",
    note: "Documented v2 method.",
  },
  {
    item: "Forge governance via $FORGE",
    status: "roadmap",
    note: "Post-hackathon Month 1.",
  },
  {
    item: "Secondary market for Ingot shares",
    status: "roadmap",
    note: "Post-hackathon Month 3.",
  },
  {
    item: "Reputation-weighted contribution caps",
    status: "roadmap",
    note: "Wallet-level caps only at hackathon.",
  },
  {
    item: "Full external audit",
    status: "roadmap",
    note: "Informal review at submission; full audit Month 1.",
  },
];

const TONE: Record<Status, "positive" | "ember" | "warn"> = {
  real: "positive",
  stub: "ember",
  roadmap: "warn",
};

const LABEL: Record<Status, string> = {
  real: "Real",
  stub: "Stub",
  roadmap: "Roadmap",
};

export function RealVsRoadmap() {
  const counts = rows.reduce<Record<Status, number>>(
    (acc, r) => {
      acc[r.status]++;
      return acc;
    },
    { real: 0, stub: 0, roadmap: 0 }
  );

  return (
    <section className="border-hairline relative border-t py-28">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr] md:items-end">
          <div>
            <p className="text-caption text-ember-400">Honesty as a feature</p>
            <h2 className="text-display-lg text-platinum-100 mt-3 max-w-[22ch]">
              Every feature is Real, Stub, or Roadmap. No fourth category.
            </h2>
            <p className="text-body-lg text-platinum-300 mt-6 max-w-[58ch]">
              <span className="text-platinum-100 font-medium">Real</span> ships on
              mainnet or passes full tests.{" "}
              <span className="text-platinum-100 font-medium">Stub</span> is wired
              end-to-end but waiting on a final 0G primitive — usually one env var away.{" "}
              <span className="text-platinum-100 font-medium">Roadmap</span> is
              designed, dated, but unbuilt. This table is the source of truth.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <div className="border-hairline bg-ink-900 flex items-center gap-3 rounded-lg px-5 py-3">
              <Counter tone="positive" label="real" value={counts.real} />
              <span className="text-platinum-400">·</span>
              <Counter tone="ember" label="stub" value={counts.stub} />
              <span className="text-platinum-400">·</span>
              <Counter tone="warn" label="roadmap" value={counts.roadmap} />
            </div>
          </div>
        </div>

        <div className="border-hairline mt-12 overflow-hidden rounded-lg">
          {rows.map((r, i) => (
            <motion.div
              key={r.item}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.025, 0.5) }}
              className="border-hairline bg-ink-900 hover:bg-ink-800 grid grid-cols-[auto_1fr] items-center gap-6 border-b px-6 py-4 transition-colors last:border-b-0 md:grid-cols-[120px_1fr_auto]"
            >
              <Pill tone={TONE[r.status]} dot className="w-fit">
                {LABEL[r.status]}
              </Pill>
              <p className="text-body text-platinum-100">{r.item}</p>
              {r.note && (
                <p className="text-body-sm text-platinum-400 hidden md:block">
                  {r.note}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Counter({
  tone,
  label,
  value,
}: {
  tone: "positive" | "ember" | "warn";
  label: string;
  value: number;
}) {
  const dotClass =
    tone === "positive"
      ? "bg-signal-positive"
      : tone === "ember"
        ? "bg-ember-500"
        : "bg-signal-warn";
  return (
    <span className="flex items-center gap-2">
      <span className={`size-2 rounded-full ${dotClass}`} />
      <span className="text-mono-sm text-platinum-200 tabular">
        {value} {label}
      </span>
    </span>
  );
}
