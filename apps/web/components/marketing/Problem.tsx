"use client";

import { motion } from "motion/react";

interface Persona {
  name: string;
  role: string;
  line: string;
  glyph: "data" | "capital" | "compute";
}

const personas: Persona[] = [
  {
    name: "Elena",
    role: "Computational linguist",
    line: "A 50k-sentence labeled corpus for a low-resource language. Today, it sits on a hard drive.",
    glyph: "data",
  },
  {
    name: "Marcus",
    role: "Capital allocator",
    line: "Believes a legal-clause classifier will be valuable. Can't co-invest in a model's creation.",
    glyph: "capital",
  },
  {
    name: "Aiko",
    role: "GPU operator",
    line: "Sells compute at spot price. Captures none of the upside of the models she helps create.",
    glyph: "compute",
  },
];

function PersonaGlyph({ kind }: { kind: Persona["glyph"] }) {
  if (kind === "data") {
    return (
      <svg width="44" height="44" viewBox="0 0 64 64" fill="none" aria-hidden>
        <rect
          x="10"
          y="12"
          width="44"
          height="8"
          rx="1"
          fill="none"
          stroke="#ff8a1a"
          strokeWidth="1.4"
        />
        <rect
          x="10"
          y="24"
          width="44"
          height="8"
          rx="1"
          fill="none"
          stroke="#ff8a1a"
          strokeWidth="1.4"
          opacity="0.7"
        />
        <rect
          x="10"
          y="36"
          width="44"
          height="8"
          rx="1"
          fill="none"
          stroke="#ff8a1a"
          strokeWidth="1.4"
          opacity="0.45"
        />
        <circle cx="16" cy="16" r="1.5" fill="#ff8a1a" />
        <circle cx="16" cy="28" r="1.5" fill="#ff8a1a" />
        <circle cx="16" cy="40" r="1.5" fill="#ff8a1a" />
      </svg>
    );
  }
  if (kind === "capital") {
    return (
      <svg width="44" height="44" viewBox="0 0 64 64" fill="none" aria-hidden>
        <circle cx="32" cy="32" r="18" fill="none" stroke="#ff8a1a" strokeWidth="1.4" />
        <circle
          cx="32"
          cy="32"
          r="12"
          fill="none"
          stroke="#ff8a1a"
          strokeWidth="1.2"
          opacity="0.6"
        />
        <path
          d="M28 26 L36 26 M28 38 L36 38 M32 22 L32 42"
          stroke="#ff8a1a"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg width="44" height="44" viewBox="0 0 64 64" fill="none" aria-hidden>
      <rect
        x="14"
        y="14"
        width="36"
        height="36"
        rx="3"
        fill="none"
        stroke="#ff8a1a"
        strokeWidth="1.4"
      />
      <rect
        x="22"
        y="22"
        width="20"
        height="20"
        fill="none"
        stroke="#ff8a1a"
        strokeWidth="1.2"
        opacity="0.6"
      />
      <path
        d="M14 22 L8 22 M14 30 L8 30 M14 38 L8 38 M14 46 L8 46 M50 22 L56 22 M50 30 L56 30 M50 38 L56 38 M50 46 L56 46 M22 14 L22 8 M30 14 L30 8 M38 14 L38 8 M46 14 L46 8 M22 50 L22 56 M30 50 L30 56 M38 50 L38 56 M46 50 L46 56"
        stroke="#ff8a1a"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

export function Problem() {
  return (
    <section className="border-hairline relative border-t py-28">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_1.4fr] md:items-end">
          <div>
            <p className="text-caption text-ember-400">The problem</p>
            <h2 className="text-display-lg text-platinum-100 mt-3">
              Model creation is locked inside companies.
            </h2>
          </div>
          <p className="text-body-lg text-platinum-300 max-w-[58ch]">
            Training a useful AI model takes three things almost nobody has all of:{" "}
            <span className="text-platinum-100 font-medium">data</span>,{" "}
            <span className="text-platinum-100 font-medium">compute</span>, and{" "}
            <span className="text-platinum-100 font-medium">capital</span>. Today, the
            people who supply each of those capture none of the upside of what they help
            create. The ownership instrument doesn&rsquo;t exist.
          </p>
        </div>

        <div className="border-hairline mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-lg md:grid-cols-3">
          {personas.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
                ease: [0.32, 0.72, 0, 1],
              }}
              className="group bg-ink-900 hover:bg-ink-800 relative overflow-hidden p-8 transition-colors"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -top-12 -right-12 size-32 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(closest-side, color-mix(in oklab, var(--ember-500) 18%, transparent), transparent 70%)",
                }}
              />
              <div className="relative">
                <PersonaGlyph kind={p.glyph} />
                <p className="text-caption text-platinum-400 mt-6">{p.role}</p>
                <h3 className="text-title-lg text-platinum-100 mt-2">{p.name}</h3>
                <p className="text-body text-platinum-300 mt-4">{p.line}</p>
                <div className="text-caption text-ember-400 mt-6 flex items-center gap-2">
                  <span>contributes</span>
                  <span className="font-medium">
                    {p.glyph === "data"
                      ? "data"
                      : p.glyph === "capital"
                        ? "capital"
                        : "compute"}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-body text-platinum-400 mt-10 max-w-[60ch]"
        >
          Foundry is the protocol where Elena, Marcus, and Aiko all become co-owners of
          the same Ingot — proportional to the value each one actually adds. Measured
          inside a TEE. Minted on-chain.
        </motion.p>
      </div>
    </section>
  );
}
