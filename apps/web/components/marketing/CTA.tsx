import { LinkButton } from "@/components/ui/Button";
import { FoundryMark } from "@/components/marks/FoundryMark";

export function CTA() {
  return (
    <section className="relative overflow-hidden border-t border-hairline py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-12 h-80"
        style={{ background: "var(--wash-ember)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, color-mix(in oklab, var(--ember-500) 10%, transparent), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-[1280px] px-6 text-center">
        <FoundryMark size={64} className="mx-auto" />
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

        <div className="mt-12 inline-flex items-center gap-6 rounded-pill border-hairline bg-ink-900/60 px-5 py-2.5 backdrop-blur">
          <Stat label="Forges" value="5" />
          <Divider />
          <Stat label="Ingots" value="7" />
          <Divider />
          <Stat label="Smiths" value="9" />
          <Divider />
          <Stat label="Live on" value="0G" hot />
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  hot = false,
}: {
  label: string;
  value: string;
  hot?: boolean;
}) {
  return (
    <span className="flex items-center gap-2">
      <span
        className={`text-mono-sm tabular ${hot ? "text-ember-400" : "text-platinum-200"}`}
      >
        {value}
      </span>
      <span className="text-caption text-platinum-400">{label}</span>
    </span>
  );
}

function Divider() {
  return <span className="h-3 w-px bg-ink-600" aria-hidden />;
}
