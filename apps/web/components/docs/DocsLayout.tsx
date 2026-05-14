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
    ],
  },
  {
    title: "Protocol",
    items: [
      { href: "/docs/attribution", label: "Verifiable attribution" },
      { href: "/docs/threat-model", label: "Threat model" },
      { href: "/docs/contracts", label: "Contract self-review" },
      { href: "/docs/real-vs-roadmap", label: "Real vs Roadmap" },
    ],
  },
  {
    title: "SDK",
    items: [
      { href: "/docs/sdk-reference", label: "SDK reference" },
      { href: "/docs/adapters", label: "Adapters" },
      { href: "/docs/cli", label: "Foundry CLI" },
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
      <div className="border-t border-hairline">
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
              <div className="mt-10 rounded-lg border-hairline bg-ink-900 p-4">
                <p className="text-caption text-ember-400">v1.0.0-rc.1</p>
                <p className="text-body-sm mt-2 text-platinum-300">
                  Frozen public surface. Breaking changes only via major version bump.
                </p>
              </div>
            </nav>
          </aside>

          {/* Content */}
          <article className="min-w-0 flex-1">
            <p className="text-caption text-ember-400">{eyebrow}</p>
            <h1 className="text-display-lg mt-3 max-w-[24ch] text-platinum-100">
              {title}
            </h1>
            {intro && (
              <div className="text-body-lg mt-6 max-w-[68ch] text-platinum-300">
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
                        className="block text-[13px] text-platinum-400 transition-colors hover:text-platinum-100"
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
      className="text-display-sm scroll-mt-24 text-platinum-100 first:mt-0 [&:not(:first-child)]:mt-12"
    >
      {children}
    </h2>
  );
}

export function H3({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h3
      id={id}
      className="text-title-lg scroll-mt-24 mt-8 text-platinum-100"
    >
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
    <code className="rounded-sm bg-ink-800 px-1.5 py-0.5 text-[0.92em] text-ember-300 font-mono">
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
    <div className="overflow-hidden rounded-lg border-hairline bg-ink-900">
      {(lang || filename) && (
        <div className="flex items-center justify-between border-b border-hairline px-4 py-2">
          <span className="text-caption text-platinum-400 font-mono">
            {filename ?? lang}
          </span>
          {lang && filename && (
            <span className="text-caption text-platinum-400">{lang}</span>
          )}
        </div>
      )}
      <pre className="overflow-x-auto px-4 py-4 text-[13.5px] leading-[22px] font-mono text-platinum-100">
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
    ember: "border-ember-500/40 bg-[color-mix(in_oklab,var(--ember-500)_8%,transparent)]",
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

export function Table({
  head,
  rows,
}: {
  head: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="overflow-hidden rounded-lg border-hairline">
      <table className="w-full border-collapse text-left">
        <thead className="bg-ink-900">
          <tr>
            {head.map((h) => (
              <th
                key={h}
                className="text-caption px-4 py-3 text-platinum-400 border-b border-hairline"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="divide-x divide-ink-800/60">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="text-body-sm border-b border-hairline px-4 py-3 text-platinum-200 last:border-r-0"
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
    <div className="mt-16 grid grid-cols-2 gap-4 border-t border-hairline pt-8">
      <div>
        {prev && (
          <Link
            href={prev.href}
            className="block rounded-md border-hairline p-4 transition-colors hover:bg-ink-800"
          >
            <p className="text-caption text-platinum-400">← Previous</p>
            <p className="text-title-md mt-1 text-platinum-100">{prev.label}</p>
          </Link>
        )}
      </div>
      <div className="text-right">
        {next && (
          <Link
            href={next.href}
            className="block rounded-md border-hairline p-4 transition-colors hover:bg-ink-800"
          >
            <p className="text-caption text-platinum-400">Next →</p>
            <p className="text-title-md mt-1 text-platinum-100">{next.label}</p>
          </Link>
        )}
      </div>
    </div>
  );
}
