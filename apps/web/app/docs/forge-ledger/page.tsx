import { DocsLayout, H2, P, Lead, Callout } from "@/components/docs/DocsLayout";
import { Pill } from "@/components/ui/Pill";
import { getForgeLedger, type LedgerForge } from "@/lib/dashboard-data";
import { explorerAddress, explorerTx, shortAddr } from "@/lib/chain";

export const metadata = {
  title: "Forge ledger — on-chain proof",
  description:
    "Every Forge and every on-chain interaction on 0G Aristotle, each row linked to the transaction that proves it.",
};

export const revalidate = 30;

const toc = [
  { id: "what", label: "What this is" },
  { id: "ledger", label: "The ledger" },
  { id: "verify", label: "Verify it yourself" },
];

function TxLink({ hash, label }: { hash: string; label?: string }) {
  return (
    <a
      href={explorerTx(hash)}
      target="_blank"
      rel="noreferrer noopener"
      className="text-mono-sm text-ember-400 hover:text-ember-300 underline-offset-2 transition-colors hover:underline"
    >
      {label ?? `${hash.slice(0, 10)}…${hash.slice(-6)}`} ↗
    </a>
  );
}

function Addr({ a }: { a: string }) {
  return (
    <a
      href={explorerAddress(a)}
      target="_blank"
      rel="noreferrer noopener"
      className="text-mono-sm text-platinum-400 hover:text-platinum-200 transition-colors"
    >
      {shortAddr(a)} ↗
    </a>
  );
}

function ForgeBlock({ f, index }: { f: LedgerForge; index: number }) {
  const txTotal =
    1 + f.contributions.length + (f.ingot ? 1 : 0) + f.revenue.length + f.claims.length;
  return (
    <div className="border-hairline bg-ink-900 mt-6 rounded-lg border p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-caption text-platinum-400">
            Forge {String(index + 1).padStart(2, "0")} · <Addr a={f.address} />
          </p>
          <h3 className="text-title-lg text-platinum-100 mt-2">
            {f.title ?? `Forge ${shortAddr(f.address)}`}
          </h3>
          {f.summary && (
            <p className="text-body-sm text-platinum-400 mt-2 max-w-[70ch]">
              {f.summary}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {f.task && <Pill tone="ember">{f.task}</Pill>}
          <Pill tone={f.verified ? "positive" : "neutral"} dot={f.verified}>
            {f.verified ? "Content-verified ✓" : "Off-chain manifest"}
          </Pill>
          <span className="text-caption text-platinum-500">{txTotal} txns</span>
        </div>
      </div>

      <div className="mt-5 space-y-2.5">
        <Row label="Created">
          <Addr a={f.creator} /> · <TxLink hash={f.created.txHash} /> · blk{" "}
          {f.created.block.toString()}
        </Row>

        {f.contributions.map((c, i) => (
          <Row key={`c-${i}`} label={`Contribution · ${c.type}`}>
            <Addr a={c.smith} /> · <TxLink hash={c.tx.txHash} />
          </Row>
        ))}

        {f.ingot && (
          <Row label={`Ingot #${f.ingot.tokenId} minted`}>
            <TxLink hash={f.ingot.tx.txHash} /> · blk {f.ingot.tx.block.toString()}
          </Row>
        )}

        {f.revenue.map((r, i) => (
          <Row key={`r-${i}`} label="Revenue received">
            {r.amountOG.toFixed(5)} OG from <Addr a={r.payer} /> ·{" "}
            <TxLink hash={r.tx.txHash} />
          </Row>
        ))}

        {f.claims.map((c, i) => (
          <Row key={`cl-${i}`} label="Revenue claimed">
            {c.amountOG.toFixed(5)} OG by <Addr a={c.holder} /> ·{" "}
            <TxLink hash={c.tx.txHash} />
          </Row>
        ))}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-hairline grid grid-cols-1 gap-1 border-t pt-2.5 first:border-t-0 first:pt-0 sm:grid-cols-[200px_1fr] sm:gap-4">
      <span className="text-caption text-platinum-400">{label}</span>
      <span className="text-body-sm text-platinum-200">{children}</span>
    </div>
  );
}

export default async function ForgeLedgerPage() {
  const ledger = await getForgeLedger().catch(() => null);

  return (
    <DocsLayout
      active="/docs/forge-ledger"
      eyebrow="Protocol"
      title="Forge ledger — on-chain proof"
      intro={
        <Lead>
          Foundry&apos;s dashboard shows real numbers because every Forge runs a real
          on-chain lifecycle. This page is the receipt: each Forge and each interaction
          below links to the transaction on the 0G explorer. Nothing here is simulated.
        </Lead>
      }
      toc={toc}
    >
      <H2 id="what">What this is</H2>
      <P>
        Each Forge goes through the full protocol loop on 0G Aristotle:{" "}
        <em>createForge</em> → data / compute / capital contributions → evaluation →{" "}
        <em>mintOwnership</em> (the Ingot) → revenue received → revenue claimed. Every
        one of those steps emits an event with a transaction hash. The ledger groups
        them by Forge so you can trace any number on the dashboard back to its source.
      </P>

      {!ledger?.isLive ? (
        <Callout tone="note" title="Contracts not live on this network">
          The ledger populates from event logs the moment the protocol contracts are
          deployed and the first Forge transacts.
        </Callout>
      ) : (
        <>
          <Callout
            tone="note"
            title={`${ledger.forges.length} forges · ${ledger.txCount} proving transactions on 0G ${ledger.network}`}
          >
            Content-verified forges have a manifest whose content hash equals the
            on-chain <code>modelSpec</code> — the description is provably the one
            committed at creation.
          </Callout>

          <H2 id="ledger">The ledger</H2>
          {ledger.forges.map((f, i) => (
            <ForgeBlock key={f.address} f={f} index={i} />
          ))}

          <H2 id="verify">Verify it yourself</H2>
          <P>
            Pick any transaction link above — it opens the 0G explorer at{" "}
            <code>{ledger.explorerBase}</code>. Or query the contracts directly: the
            dashboard reads the same <code>ForgeCreated</code>, <code>IngotMinted</code>
            , <code>ContributionLogged</code>, <code>RevenueReceived</code>, and{" "}
            <code>RevenueClaimed</code> event logs this page does. Same source, no
            middle layer.
          </P>
        </>
      )}
    </DocsLayout>
  );
}
