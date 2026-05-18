"use client";

import { useState } from "react";
import Link from "next/link";
import { FoundryLockup } from "@/components/marks/FoundryMark";
import { LinkButton } from "@/components/ui/Button";

const nav = [
  { href: "/forges", label: "Forges" },
  { href: "/smiths", label: "Smiths" },
  { href: "/lineage", label: "Lineage" },
  { href: "/ecosystem", label: "Ecosystem" },
  { href: "/docs", label: "Docs" },
  { href: "/dashboard", label: "Live" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-hairline bg-ink-950/75 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5 sm:px-6">
        <Link
          href="/"
          aria-label="Foundry — home"
          className="-ml-1 flex items-center"
          onClick={() => setOpen(false)}
        >
          <FoundryLockup size={28} />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-platinum-300 hover:bg-ink-800 hover:text-platinum-100 rounded-md px-3 py-1.5 text-[14px] font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LinkButton
            href="/forges"
            variant="ghost"
            size="md"
            className="hidden sm:inline-flex"
          >
            Explore
          </LinkButton>
          <LinkButton
            href="/build-on-foundry"
            variant="primary"
            size="md"
            className="hidden sm:inline-flex"
          >
            Start building
          </LinkButton>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="text-platinum-200 hover:bg-ink-800 hover:text-platinum-100 -mr-1 inline-flex size-10 items-center justify-center rounded-md transition-colors md:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              {open ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      <div
        id="mobile-nav"
        className={`border-hairline bg-ink-950/95 overflow-hidden border-t backdrop-blur-xl transition-[max-height] duration-300 ease-[var(--ease-standard)] md:hidden ${
          open ? "max-h-[420px]" : "max-h-0 border-t-0"
        }`}
      >
        <nav
          aria-label="Mobile"
          className="mx-auto flex max-w-[1280px] flex-col gap-1 px-5 py-4"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="text-platinum-200 hover:bg-ink-800 hover:text-platinum-100 rounded-md px-3 py-3 text-[16px] font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <LinkButton href="/forges" variant="secondary" size="lg" className="w-full">
              Explore
            </LinkButton>
            <LinkButton
              href="/build-on-foundry"
              variant="primary"
              size="lg"
              className="w-full"
            >
              Start building
            </LinkButton>
          </div>
        </nav>
      </div>
    </header>
  );
}
