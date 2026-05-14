"use client";

import { motion } from "motion/react";

const personas = [
  {
    name: "Maya",
    role: "Computational linguist",
    line: "A 50k-sentence labeled corpus for a low-resource language. Today, it sits on a hard drive.",
  },
  {
    name: "Devansh",
    role: "Capital allocator",
    line: "Believes a legal-clause classifier will be valuable. Can't co-invest in a model's creation.",
  },
  {
    name: "Priya",
    role: "GPU operator",
    line: "Sells compute at spot price. Captures none of the upside of the models she helps create.",
  },
];

export function Problem() {
  return (
    <section className="relative border-t border-hairline py-28">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_1.4fr] md:items-end">
          <div>
            <p className="text-caption text-ember-400">The problem</p>
            <h2 className="text-display-lg mt-3 text-platinum-100">
              Model creation is locked inside companies.
            </h2>
          </div>
          <p className="text-body-lg text-platinum-300 max-w-[58ch]">
            Training a useful AI model takes three things almost nobody has all
            of: <em className="text-platinum-100 not-italic">data</em>, <em className="text-platinum-100 not-italic">compute</em>, and <em className="text-platinum-100 not-italic">capital</em>. Today, the people who supply each of those capture none
            of the upside of what they help create. The ownership instrument
            doesn&rsquo;t exist.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-lg border-hairline md:grid-cols-3">
          {personas.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.4,
                delay: i * 0.08,
                ease: [0.32, 0.72, 0, 1],
              }}
              className="bg-ink-900 p-8"
            >
              <p className="text-caption text-platinum-400">{p.role}</p>
              <h3 className="text-display-sm mt-3 text-platinum-100">{p.name}</h3>
              <p className="text-body mt-4 text-platinum-300">{p.line}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
