import Link from "next/link";
import { FoundryLockup } from "@/components/marks/FoundryMark";
import { LinkButton } from "@/components/ui/Button";

const nav = [
  { href: "/forges", label: "Forges" },
  { href: "/smiths", label: "Smiths" },
  { href: "/lineage", label: "Lineage" },
  { href: "/docs", label: "Docs" },
  { href: "/dashboard", label: "Live" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-ink-950/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6">
        <Link
          href="/"
          aria-label="Foundry — home"
          className="-ml-1 flex items-center"
        >
          <FoundryLockup size={28} />
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 md:flex"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-[14px] font-medium text-platinum-300 transition-colors hover:bg-ink-800 hover:text-platinum-100"
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
          <LinkButton href="/build-on-foundry" variant="primary" size="md">
            Start building
          </LinkButton>
        </div>
      </div>
    </header>
  );
}
