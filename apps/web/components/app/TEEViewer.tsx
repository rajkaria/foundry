"use client";

import { motion } from "motion/react";

/**
 * Live TEE Attestation Viewer — the demo alchemy moment.
 *
 * Renders the enclave as an animated diagram: holdout enters encrypted,
 * baseline measures, contributions score one-by-one inside the box, and
 * the hardware attestation seals out at the end.
 */
export function TEEViewer({
  state,
  baselineScore,
  measuredScore,
  attestation,
}: {
  state: "idle" | "measuring-baseline" | "scoring" | "attesting" | "done";
  baselineScore?: number;
  measuredScore?: number;
  attestation?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border-hairline bg-ink-900 elev-2 p-8">
      <div className="flex items-center justify-between">
        <p className="text-caption text-platinum-400">TEE attestation</p>
        <StatePill state={state} />
      </div>

      <div className="relative mt-8 grid grid-cols-[140px_1fr_140px] items-center gap-4">
        {/* Input: encrypted holdout */}
        <Lane
          label="encrypted holdout"
          color="--platinum-400"
          direction="in"
        />

        {/* The enclave */}
        <div className="relative h-48 rounded-xl border border-ember-500/40 bg-[color-mix(in_oklab,var(--ember-900)_50%,var(--ink-900))] p-5">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-xl"
            animate={{
              boxShadow:
                state === "scoring"
                  ? [
                      "inset 0 0 20px rgba(255,138,26,0.15)",
                      "inset 0 0 40px rgba(255,138,26,0.35)",
                      "inset 0 0 20px rgba(255,138,26,0.15)",
                    ]
                  : "inset 0 0 20px rgba(255,138,26,0.15)",
            }}
            transition={{
              duration: 1.6,
              repeat: state === "scoring" ? Infinity : 0,
              ease: "easeInOut",
            }}
          />
          <div className="relative space-y-3 text-mono-sm">
            <Line k="seal" v="0x3b…14a" muted />
            <Line
              k="baseline"
              v={
                baselineScore != null
                  ? baselineScore.toFixed(3)
                  : state === "idle"
                    ? "—"
                    : "measuring…"
              }
              accent
            />
            <Line
              k="measured"
              v={
                measuredScore != null
                  ? measuredScore.toFixed(3)
                  : state === "scoring"
                    ? "scoring contributions…"
                    : "—"
              }
              accent
            />
            <Line
              k="attestation"
              v={
                attestation ??
                (state === "attesting"
                  ? "sealing…"
                  : state === "done"
                    ? "0x7a3b…91d"
                    : "—")
              }
              mono
            />
          </div>
        </div>

        {/* Output: signed score vector */}
        <Lane
          label="signed score vector"
          color="--ember-500"
          direction="out"
          glow={state === "done"}
        />
      </div>

      <p className="text-body-sm mt-6 text-platinum-400">
        Holdout is decrypted only inside the enclave. The eval result carries
        a hardware-signed attestation; <code className="text-mono-sm text-platinum-200">submitEvalResult</code> on
        the Forge contract reverts if the attestation is invalid.
      </p>
    </div>
  );
}

function StatePill({ state }: { state: string }) {
  const map: Record<string, { label: string; tone: string }> = {
    idle: { label: "idle", tone: "text-platinum-400 bg-ink-800" },
    "measuring-baseline": { label: "measuring baseline", tone: "text-ember-400 bg-ember-900/30" },
    scoring: { label: "scoring contributions", tone: "text-ember-400 bg-ember-900/40" },
    attesting: { label: "sealing attestation", tone: "text-ember-300 bg-ember-900/60" },
    done: { label: "verified", tone: "text-signal-positive bg-signal-positive/10" },
  };
  const m = map[state] ?? map.idle;
  return (
    <span className={`rounded-pill px-2.5 py-0.5 text-caption ${m?.tone}`}>
      {m?.label}
    </span>
  );
}

function Lane({
  label,
  color,
  direction,
  glow = false,
}: {
  label: string;
  color: string;
  direction: "in" | "out";
  glow?: boolean;
}) {
  return (
    <div className="text-center">
      <motion.div
        className="h-2 rounded-pill"
        style={{ background: `var(${color})`, opacity: glow ? 1 : 0.35 }}
        animate={
          direction === "in"
            ? { x: [-12, 4, -12] }
            : { x: [4, 12, 4] }
        }
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <p className="text-caption mt-3 text-platinum-400">{label}</p>
    </div>
  );
}

function Line({
  k,
  v,
  muted = false,
  accent = false,
  mono = false,
}: {
  k: string;
  v: string;
  muted?: boolean;
  accent?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-caption text-platinum-400">{k}</span>
      <span
        className={
          (mono ? "font-mono " : "") +
          (accent
            ? "text-ember-300"
            : muted
              ? "text-platinum-400"
              : "text-platinum-100")
        }
      >
        {v}
      </span>
    </div>
  );
}
