import Link from "next/link";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface DocLink {
  href: string;
  label: string;
}

export interface DocGroup {
  title: string;
  items: DocLink[];
}

export const DOC_NAV: DocGroup[] = [
  {
    title: "Start here",
    items: [
      { href: "/docs/protocol-overview", label: "Protocol overview" },
      { href: "/docs/quickstart", label: "Quickstart" },
      { href: "/docs/build-on-foundry", label: "Build on Foundry" },
      { href: "/docs/0g-hackathon", label: "Integrate Foundry (0G)" },
      { href: "/docs/0g-apac-submission", label: "0G APAC submission proof" },
    ],
  },
  {
    title: "Protocol",
    items: [
      { href: "/docs/attribution", label: "Verifiable attribution" },
      { href: "/docs/threat-model", label: "Threat model" },
      { href: "/docs/contracts", label: "Contract self-review" },
      { href: "/docs/forge-ledger", label: "Forge ledger (proof)" },
      { href: "/docs/real-vs-roadmap", label: "Real vs Roadmap" },
    ],
  },
  {
    title: "SDK",
    items: [
      { href: "/docs/sdk-reference", label: "SDK reference" },
      { href: "/docs/adapters", label: "Adapters" },
      { href: "/docs/mcp", label: "MCP server" },
      { href: "/docs/cli", label: "Foundry CLI" },
    ],
  },
  {
    title: "Resources",
    items: [
      { href: "/ecosystem", label: "Ecosystem" },
      { href: "/docs/media-kit", label: "Media kit" },
    ],
  },
];

interface DocsLayoutProps {
  active: string;
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
  toc?: Array<{ id: string; label: string }>;
}

export function DocsLayout({
  active,
  eyebrow,
  title,
  intro,
  children,
  toc,
}: DocsLayoutProps) {
  return (
    <main>
      <Header />
      <div className="border-hairline border-t">
        <div className="mx-auto flex max-w-[1280px] gap-12 px-6 py-12 lg:py-16">
          {/* Sidebar */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <nav aria-label="Docs" className="sticky top-24">
              {DOC_NAV.map((group) => (
                <div key={group.title} className="mb-8">
                  <p className="text-caption text-platinum-400">{group.title}</p>
                  <ul className="mt-3 space-y-1">
                    {group.items.map((it) => (
                      <li key={it.href}>
                        <Link
                          href={it.href}
                          className={cn(
                            "block rounded-md px-2 py-1 text-[14px] transition-colors",
                            it.href === active
                              ? "bg-ink-800 text-platinum-100"
                              : "text-platinum-300 hover:text-platinum-100 hover:bg-ink-800/50"
                          )}
                        >
                          {it.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="border-hairline bg-ink-900 mt-10 rounded-lg p-4">
                <p className="text-caption text-ember-400">v1.0.0-rc.1</p>
                <p className="text-body-sm text-platinum-300 mt-2">
                  Frozen public surface. Breaking changes only via major version bump.
                </p>
              </div>
            </nav>
          </aside>

          {/* Content */}
          <article className="min-w-0 flex-1">
            <p className="text-caption text-ember-400">{eyebrow}</p>
            <h1 className="text-display-lg text-platinum-100 mt-3 max-w-[24ch]">
              {title}
            </h1>
            {intro && (
              <div className="text-body-lg text-platinum-300 mt-6 max-w-[68ch]">
                {intro}
              </div>
            )}
            <div className="mt-12 max-w-[68ch] space-y-8">{children}</div>
          </article>

          {/* Right TOC */}
          {toc && toc.length > 0 && (
            <aside className="hidden w-52 shrink-0 xl:block">
              <nav aria-label="On this page" className="sticky top-24">
                <p className="text-caption text-platinum-400">On this page</p>
                <ul className="mt-3 space-y-1.5">
                  {toc.map((t) => (
                    <li key={t.id}>
                      <a
                        href={`#${t.id}`}
                        className="text-platinum-400 hover:text-platinum-100 block text-[13px] transition-colors"
                      >
                        {t.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}

/* ─── Doc primitives ───────────────────────────────────────────────── */

export function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="text-display-sm text-platinum-100 scroll-mt-24 first:mt-0 [&:not(:first-child)]:mt-12"
    >
      {children}
    </h2>
  );
}

export function H3({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h3 id={id} className="text-title-lg text-platinum-100 mt-8 scroll-mt-24">
      {children}
    </h3>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="text-body-lg text-platinum-300">{children}</p>;
}

export function Lead({ children }: { children: ReactNode }) {
  return <p className="text-body-lg text-platinum-200">{children}</p>;
}

export function Code({ children }: { children: ReactNode }) {
  return (
    <code className="bg-ink-800 text-ember-300 rounded-sm px-1.5 py-0.5 font-mono text-[0.92em]">
      {children}
    </code>
  );
}

interface CodeBlockProps {
  lang?: string;
  children: string;
  filename?: string;
}

export function CodeBlock({ lang, children, filename }: CodeBlockProps) {
  return (
    <div className="border-hairline bg-ink-900 overflow-hidden rounded-lg">
      {(lang || filename) && (
        <div className="border-hairline flex items-center justify-between border-b px-4 py-2">
          <span className="text-caption text-platinum-400 font-mono">
            {filename ?? lang}
          </span>
          {lang && filename && (
            <span className="text-caption text-platinum-400">{lang}</span>
          )}
        </div>
      )}
      <pre className="text-platinum-100 overflow-x-auto px-4 py-4 font-mono text-[13.5px] leading-[22px]">
        <code>{children}</code>
      </pre>
    </div>
  );
}

interface CalloutProps {
  tone?: "note" | "warn" | "ember";
  title?: string;
  children: ReactNode;
}

export function Callout({ tone = "note", title, children }: CalloutProps) {
  const styles = {
    note: "border-platinum-400/20 bg-ink-800/60",
    warn: "border-signal-warn/40 bg-[color-mix(in_oklab,var(--signal-warn)_8%,transparent)]",
    ember:
      "border-ember-500/40 bg-[color-mix(in_oklab,var(--ember-500)_8%,transparent)]",
  } as const;
  const labels = {
    note: "Note",
    warn: "Watch out",
    ember: "Highlight",
  } as const;
  return (
    <div className={cn("rounded-lg border p-5", styles[tone])}>
      <p
        className={cn(
          "text-caption mb-2",
          tone === "warn"
            ? "text-signal-warn"
            : tone === "ember"
              ? "text-ember-400"
              : "text-platinum-400"
        )}
      >
        {title ?? labels[tone]}
      </p>
      <div className="text-body text-platinum-200 space-y-3">{children}</div>
    </div>
  );
}

export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="border-hairline overflow-hidden rounded-lg">
      <table className="w-full border-collapse text-left">
        <thead className="bg-ink-900">
          <tr>
            {head.map((h) => (
              <th
                key={h}
                className="text-caption text-platinum-400 border-hairline border-b px-4 py-3"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="divide-ink-800/60 divide-x">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="text-body-sm border-hairline text-platinum-200 border-b px-4 py-3 last:border-r-0"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PageNav({
  prev,
  next,
}: {
  prev?: { href: string; label: string };
  next?: { href: string; label: string };
}) {
  return (
    <div className="border-hairline mt-16 grid grid-cols-2 gap-4 border-t pt-8">
      <div>
        {prev && (
          <Link
            href={prev.href}
            className="border-hairline hover:bg-ink-800 block rounded-md p-4 transition-colors"
          >
            <p className="text-caption text-platinum-400">← Previous</p>
            <p className="text-title-md text-platinum-100 mt-1">{prev.label}</p>
          </Link>
        )}
      </div>
      <div className="text-right">
        {next && (
          <Link
            href={next.href}
            className="border-hairline hover:bg-ink-800 block rounded-md p-4 transition-colors"
          >
            <p className="text-caption text-platinum-400">Next →</p>
            <p className="text-title-md text-platinum-100 mt-1">{next.label}</p>
          </Link>
        )}
      </div>
    </div>
  );
}
