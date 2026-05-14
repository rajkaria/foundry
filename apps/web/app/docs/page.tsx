import Link from "next/link";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { DOC_NAV } from "@/components/docs/DocsLayout";

export const metadata = { title: "Docs" };

export default function DocsIndexPage() {
  return (
    <main>
      <Header />
      <section className="border-hairline border-t">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <p className="text-caption text-ember-400">Docs</p>
          <h1 className="text-display-xl text-platinum-100 mt-3 max-w-[20ch]">
            Everything about the protocol, in plain English.
          </h1>
          <p className="text-body-lg text-platinum-300 mt-6 max-w-[60ch]">
            The docs are first-class artifacts — versioned with the code, updated every
            release. Every page reflects what ships on mainnet today (with explicit
            roadmap callouts where they don't).
          </p>
        </div>
      </section>

      <section className="border-hairline border-t pb-24">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {DOC_NAV.map((g) => (
              <div key={g.title}>
                <p className="text-caption text-ember-400">{g.title}</p>
                <ul className="mt-4 space-y-2">
                  {g.items.map((it) => (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        className="text-body text-platinum-200 hover:text-platinum-100 transition-colors"
                      >
                        {it.label} →
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-hairline mt-16 border-t pt-12">
            <p className="text-caption text-platinum-400">Source artifacts</p>
            <ul className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
              {[
                [
                  "Brand",
                  "https://github.com/rajkaria/foundry/blob/main/docs/01-brand.md",
                ],
                [
                  "Design system",
                  "https://github.com/rajkaria/foundry/blob/main/docs/02-design-system.md",
                ],
                [
                  "Technical architecture",
                  "https://github.com/rajkaria/foundry/blob/main/docs/03-tech-architecture.md",
                ],
                ["GitHub repo", "https://github.com/rajkaria/foundry"],
              ].map(([label, href]) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-body text-platinum-200 hover:text-platinum-100 transition-colors"
                  >
                    {label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
