import { LinkButton } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";

interface Props {
  /** Network label shown to the user — e.g. "aristotle". */
  network: string;
  /** Title shown in the empty state. */
  title: string;
  /** Body copy explaining what's empty and what to do next. */
  body: string;
  /** Optional CTA — defaults to "Read the deploy notes". */
  cta?: { href: string; label: string };
}

/**
 * Shown when no on-chain data exists for a section — either because the
 * contracts aren't deployed on the active network, or because no events
 * have fired yet. Honesty-first: never fake a populated state.
 */
export function EmptyChainState({ network, title, body, cta }: Props) {
  return (
    <div className="border-hairline bg-ink-900 elev-1 relative overflow-hidden rounded-xl p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, color-mix(in oklab, var(--ember-900) 22%, transparent), transparent 70%)",
        }}
      />
      <div className="relative">
        <Pill tone="ember" dot>
          0G · {network}
        </Pill>
        <h3 className="text-display-sm text-platinum-100 mt-5 max-w-[26ch]">{title}</h3>
        <p className="text-body text-platinum-300 mt-3 max-w-[60ch]">{body}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <LinkButton
            href={cta?.href ?? "/docs/real-vs-roadmap"}
            variant="primary"
            size="md"
          >
            {cta?.label ?? "Read the deploy notes"}
          </LinkButton>
          <LinkButton
            href="https://github.com/rajkaria/foundry#deploy"
            variant="secondary"
            size="md"
            external
          >
            Deployment guide
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
