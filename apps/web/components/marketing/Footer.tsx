import Link from "next/link";
import { FoundryLockup } from "@/components/marks/FoundryMark";

const sections = [
  {
    title: "Protocol",
    links: [
      { href: "/forges", label: "Forges" },
      { href: "/smiths", label: "Smiths" },
      { href: "/lineage", label: "Lineage Graph" },
      { href: "/dashboard", label: "Forge in Public" },
    ],
  },
  {
    title: "Build",
    links: [
      { href: "/build-on-foundry", label: "Quickstart" },
      { href: "/docs/sdk-reference", label: "SDK reference" },
      { href: "/docs/attribution", label: "Attribution model" },
      { href: "/docs/threat-model", label: "Threat model" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/docs", label: "Docs" },
      { href: "/docs/real-vs-roadmap", label: "Real vs Roadmap" },
      { href: "https://github.com/rajkaria/foundry", label: "GitHub" },
      { href: "https://x.com/foundryprotocol", label: "X / Twitter" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-hairline">
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <FoundryLockup size={32} />
            <p className="text-body-sm mt-5 max-w-[42ch] text-platinum-400">
              The supply-side protocol for 0G. Pool data, compute, and capital.
              Co-train an AI model. Own a verifiable, revenue-generating share.
            </p>
            <p className="text-mono-sm mt-6 text-platinum-400">
              Built for the 0G APAC Hackathon 2026.
            </p>
          </div>
          {sections.map((s) => (
            <div key={s.title}>
              <p className="text-caption text-platinum-400">{s.title}</p>
              <ul className="mt-4 space-y-2.5">
                {s.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-body text-platinum-200 transition-colors hover:text-ember-300"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-6">
          <p className="text-mono-sm text-platinum-400">
            © {new Date().getFullYear()} Foundry · MIT
          </p>
          <p className="text-mono-sm text-platinum-400">foundryprotocol.xyz</p>
        </div>
      </div>
    </footer>
  );
}
