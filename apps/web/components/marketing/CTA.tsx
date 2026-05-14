import { LinkButton } from "@/components/ui/Button";
import { FoundryMark } from "@/components/marks/FoundryMark";

export function CTA() {
  return (
    <section className="relative border-t border-hairline py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-12 h-80"
        style={{ background: "var(--wash-ember)" }}
      />
      <div className="relative mx-auto max-w-[1280px] px-6 text-center">
        <FoundryMark size={56} className="mx-auto" />
        <h2 className="text-display-xl mx-auto mt-8 max-w-[24ch] text-platinum-100">
          Foundry doesn&rsquo;t use 0G. Foundry grows it.
        </h2>
        <p className="text-body-lg mx-auto mt-6 max-w-[60ch] text-platinum-300">
          Join a Forge as a contributor. Spin up your own. Or build on top —
          your agent project can call any Foundry Ingot in three lines.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <LinkButton href="/forges" variant="primary" size="lg">
            Explore Forges
          </LinkButton>
          <LinkButton href="/build-on-foundry" variant="secondary" size="lg">
            Build on Foundry
          </LinkButton>
          <LinkButton
            href="https://github.com/rajkaria/foundry"
            variant="ghost"
            size="lg"
            external
          >
            View on GitHub
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
