import Link from "next/link";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";

export const metadata = { title: "Docs" };

const groups = [
  {
    title: "Start here",
    items: [
      { href: "/docs/protocol-overview", label: "Protocol overview" },
      { href: "/docs/quickstart", label: "Quickstart — three lines" },
      { href: "/docs/build-on-foundry", label: "Build on Foundry" },
    ],
  },
  {
    title: "Protocol",
    items: [
      { href: "/docs/attribution", label: "Verifiable attribution (LOO v1)" },
      { href: "/docs/threat-model", label: "Threat model" },
      { href: "/docs/real-vs-roadmap", label: "Real vs Roadmap" },
    ],
  },
  {
    title: "SDK",
    items: [
      { href: "/docs/sdk-reference", label: "SDK reference" },
      { href: "/docs/adapters", label: "Adapters — AI SDK · LangChain · OpenAI-compat" },
      { href: "/docs/cli", label: "Foundry CLI" },
    ],
  },
  {
    title: "Brand & design",
    items: [
      {
        href: "https://github.com/rajkaria/foundry/blob/main/docs/01-brand.md",
        label: "Brand",
        external: true,
      },
      {
        href: "https://github.com/rajkaria/foundry/blob/main/docs/02-design-system.md",
        label: "Design system",
        external: true,
      },
      {
        href: "https://github.com/rajkaria/foundry/blob/main/docs/03-tech-architecture.md",
        label: "Technical architecture",
        external: true,
      },
      {
        href: "https://github.com/rajkaria/foundry/blob/main/docs/04-sprint-plan.md",
        label: "Sprint plan",
        external: true,
      },
    ],
  },
];

export default function DocsIndexPage() {
  return (
    <main>
      <Header />
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <p className="text-caption text-ember-400">Docs</p>
          <h1 className="text-display-xl mt-3 max-w-[20ch] text-platinum-100">
            Everything about the protocol, in plain English.
          </h1>
          <p className="text-body-lg mt-6 max-w-[60ch] text-platinum-300">
            The docs are first-class artifacts — versioned with the code,
            updated every release. Source-of-truth markdown lives in{" "}
            <code className="text-mono-sm text-platinum-200">/docs</code> in the
            repo.
          </p>
        </div>
      </section>

      <section className="border-t border-hairline pb-24">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
            {groups.map((g) => (
              <div key={g.title}>
                <p className="text-caption text-platinum-400">{g.title}</p>
                <ul className="mt-4 space-y-2">
                  {g.items.map((it) => (
                    <li key={it.href}>
                      {"external" in it && it.external ? (
                        <a
                          href={it.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-body text-platinum-200 transition-colors hover:text-platinum-100"
                        >
                          {it.label} ↗
                        </a>
                      ) : (
                        <Link
                          href={it.href}
                          className="text-body text-platinum-200 transition-colors hover:text-platinum-100"
                        >
                          {it.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
