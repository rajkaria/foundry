import type { Metadata } from "next";
import {
  DocsLayout,
  H2,
  H3,
  P,
  Lead,
  Code,
  CodeBlock,
  Callout,
  Table,
} from "@/components/docs/DocsLayout";

export const metadata: Metadata = {
  title: "Media kit — logos, brand, and boilerplate",
  description:
    "Official Foundry logos, color palette, typography, naming rules, and ready-to-paste boilerplate for press, ecosystem partners, and integrations.",
};

const toc = [
  { id: "about", label: "About Foundry" },
  { id: "logos", label: "Logos & downloads" },
  { id: "usage", label: "Logo usage" },
  { id: "color", label: "Color palette" },
  { id: "type", label: "Typography" },
  { id: "naming", label: "Naming & voice" },
  { id: "boilerplate", label: "Boilerplate copy" },
  { id: "partners", label: "For ecosystem partners" },
  { id: "contact", label: "Contact" },
];

function Swatch({
  name,
  hex,
  note,
  dark = false,
}: {
  name: string;
  hex: string;
  note: string;
  dark?: boolean;
}) {
  return (
    <div className="border-hairline overflow-hidden rounded-lg border">
      <div className="flex h-20 items-end p-2" style={{ background: hex }}>
        <span
          className="text-mono-sm rounded px-1.5 py-0.5"
          style={{
            background: dark ? "#0c0e12" : "rgba(255,255,255,0.85)",
            color: dark ? "#f3f4f6" : "#0c0e12",
          }}
        >
          {hex}
        </span>
      </div>
      <div className="bg-ink-900 p-3">
        <p className="text-body-sm text-platinum-100 font-medium">{name}</p>
        <p className="text-mono-sm text-platinum-400 mt-0.5">{note}</p>
      </div>
    </div>
  );
}

export default function MediaKitPage() {
  return (
    <DocsLayout
      active="/docs/media-kit"
      eyebrow="Resources · Media kit"
      title="Foundry media kit."
      intro={
        <Lead>
          Everything you need to represent Foundry accurately — logos, colors, type,
          naming rules, and copy you can paste straight into a post, deck, or
          integration page. Ecosystem partners: this is what to use when you announce a
          Foundry integration.
        </Lead>
      }
      toc={toc}
    >
      <H2 id="about">About Foundry</H2>
      <P>
        Foundry is the supply-side ownership and revenue layer for AI on 0G.
        Contributors pool data, compute, and capital to co-train a model, then own a
        verifiable, revenue-generating share of it — minted on mainnet, attributed
        inside a TEE. Every inference call routes revenue back to the people who made
        the model good, automatically and forever.
      </P>
      <P>
        Built on the 0G stack: 0G Chain (L1), 0G Storage, and 0G Compute (TEEs). No
        bridges, no custodial middle layer.
      </P>

      <H2 id="logos">Logos &amp; downloads</H2>
      <P>
        The Foundry mark is an isometric ingot — a freshly cast bar of metal with a
        sculpted &ldquo;F&rdquo; channel and a molten core. Use the full lockup wherever
        space allows; use the mark alone for avatars, favicons, and tight UI.
      </P>
      <Table
        head={["Asset", "Best for", "Download"]}
        rows={[
          [
            "Mark",
            "Avatars, favicons, app icons, tight UI",
            <a
              key="m"
              href="/foundry-mark.svg"
              target="_blank"
              rel="noreferrer noopener"
              className="text-ember-400 hover:text-ember-300"
            >
              foundry-mark.svg ↗
            </a>,
          ],
          [
            "Lockup (dark bg)",
            "Headers, decks, light-on-dark contexts",
            <a
              key="l"
              href="/foundry-lockup.svg"
              target="_blank"
              rel="noreferrer noopener"
              className="text-ember-400 hover:text-ember-300"
            >
              foundry-lockup.svg ↗
            </a>,
          ],
          [
            "Lockup (light bg)",
            "Docs, white decks, print",
            <a
              key="ll"
              href="/foundry-lockup-light.svg"
              target="_blank"
              rel="noreferrer noopener"
              className="text-ember-400 hover:text-ember-300"
            >
              foundry-lockup-light.svg ↗
            </a>,
          ],
        ]}
      />
      <Callout>
        All marks are vector SVG. Scale freely — never re-trace, re-draw, or export a
        low-res raster as the &ldquo;official&rdquo; logo.
      </Callout>

      <H2 id="usage">Logo usage</H2>
      <H3 id="do">Do</H3>
      <ul className="text-body-lg text-platinum-300 ml-6 list-disc space-y-2">
        <li>
          Keep clear space around the mark equal to the height of the ingot top facet.
        </li>
        <li>
          Use the dark-background lockup on Foundry ink (#07080a–#14171d) or any dark
          surface.
        </li>
        <li>Use the light-background lockup on white or pale surfaces.</li>
        <li>Scale the mark and wordmark together — never independently.</li>
      </ul>
      <H3 id="dont">Don&apos;t</H3>
      <ul className="text-body-lg text-platinum-300 ml-6 list-disc space-y-2">
        <li>Recolor the ingot. The ember gradient is fixed.</li>
        <li>Rotate, skew, add shadows, outlines, or effects.</li>
        <li>Place the dark lockup on a busy or low-contrast photo.</li>
        <li>Typeset &ldquo;Foundry&rdquo; in another font and call it the wordmark.</li>
        <li>
          Call it &ldquo;Foundry Protocol&rdquo; in body copy — the name is just{" "}
          <strong className="text-platinum-100">Foundry</strong>.
        </li>
      </ul>

      <H2 id="color">Color palette</H2>
      <P>
        Three families: <strong className="text-platinum-100">Ink</strong> (the cool
        dark stage), <strong className="text-platinum-100">Platinum</strong> (cool light
        type), and <strong className="text-platinum-100">Ember</strong> (the single warm
        focal — molten metal). Ember is used sparingly, for emphasis and the mark only.
      </P>
      <div className="my-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Swatch name="Ink 950" hex="#07080a" note="--ink-950 · page" dark />
        <Swatch name="Ink 900" hex="#0c0e12" note="--ink-900 · panel" dark />
        <Swatch name="Ink 800" hex="#14171d" note="--ink-800 · raised" dark />
        <Swatch name="Ember 400" hex="#ffb260" note="--ember-400" />
        <Swatch name="Ember 500" hex="#ff8a1a" note="--ember-500 · focal" />
        <Swatch name="Ember 700" hex="#a64a00" note="--ember-700" />
        <Swatch name="Platinum 100" hex="#f3f4f6" note="--platinum-100 · type" />
        <Swatch name="Platinum 300" hex="#c8ccd4" note="--platinum-300 · body" />
        <Swatch name="Platinum 400" hex="#a0a6b2" note="--platinum-400 · muted" />
      </div>

      <H2 id="type">Typography</H2>
      <P>
        The wordmark and UI use a tight, modern sans (weight 600, letter-spacing 0.02em
        — Anthropic-style capital lockup). Body text is the same sans family at regular
        weight. Code, hashes, and on-chain addresses use a monospace face with tabular
        numerics.
      </P>
      <Table
        head={["Role", "Family", "Weight"]}
        rows={[
          ["Wordmark / display", "Sans (Inter-class)", "600"],
          ["Body", "Sans", "400"],
          ["Mono / hashes", "Monospace", "400, tabular-nums"],
        ]}
      />

      <H2 id="naming">Naming &amp; voice</H2>
      <ul className="text-body-lg text-platinum-300 ml-6 list-disc space-y-2">
        <li>
          The name is <Code>Foundry</Code> — one word, capital F. Not
          &ldquo;FoundryProtocol&rdquo;, not &ldquo;the Foundry&rdquo;.
        </li>
        <li>
          Domain and handle: <Code>foundryprotocol.xyz</Code> ·{" "}
          <Code>@foundryprotocol</Code>.
        </li>
        <li>
          Core nouns, always lowercase in body copy: <Code>Ingot</Code> (a co-owned
          model), <Code>Forge</Code> (a training run), <Code>Smith</Code> (a
          contributor).
        </li>
        <li>
          Voice: precise, technical, no hype. We say what ships on mainnet and flag
          what&apos;s roadmap. Never claim &ldquo;the first&rdquo; or
          &ldquo;revolutionary&rdquo;.
        </li>
      </ul>

      <H2 id="boilerplate">Boilerplate copy</H2>
      <P>One-liner:</P>
      <CodeBlock>
        Foundry is the supply-side ownership and revenue layer for AI on 0G.
      </CodeBlock>
      <P>Short (≤ 280 chars):</P>
      <CodeBlock>
        {`Foundry turns model contribution into ownership. Pool data, compute, and capital, co-train an AI model on 0G, and own a verifiable, revenue-generating share — minted on mainnet, attributed inside a TEE. Every inference routes revenue back to its makers, forever.`}
      </CodeBlock>
      <P>Standard paragraph:</P>
      <CodeBlock>
        {`Foundry is the supply-side ownership and revenue layer for AI on 0G. Contributors pool data, compute, and capital to co-train a model into an Ingot, then hold a verifiable on-chain share of it. Every inference call against an Ingot returns an attested receipt (TEE quote + revenue tx) and splits revenue back to the contributors who made the model good — automatically and forever. Built on 0G Chain, 0G Storage, and 0G Compute TEEs, with no bridges.`}
      </CodeBlock>

      <H2 id="partners">For ecosystem partners</H2>
      <P>
        Announcing a Foundry integration? Use this structure so the relationship reads
        accurately:
      </P>
      <CodeBlock>
        {`[Your project] integrates Foundry to turn its AI inference into co-owned, revenue-sharing intelligence on 0G. [One sentence on what your project does.] Calls now route through a Foundry Ingot, so contributors earn on-chain revenue on every inference — verified inside a TEE.`}
      </CodeBlock>
      <P>
        Then ping us to get added to the{" "}
        <a href="/ecosystem" className="text-ember-400 hover:text-ember-300">
          Ecosystem page
        </a>
        . Always link integrations to <Code>foundryprotocol.xyz</Code> and the{" "}
        <a href="/docs/0g-hackathon" className="text-ember-400 hover:text-ember-300">
          integration guide
        </a>
        .
      </P>

      <H2 id="contact">Contact</H2>
      <P>
        Press, partnerships, or asset requests — Telegram{" "}
        <a
          href="https://t.me/rajkaria"
          target="_blank"
          rel="noreferrer noopener"
          className="text-ember-400 hover:text-ember-300"
        >
          t.me/rajkaria
        </a>{" "}
        or X{" "}
        <a
          href="https://x.com/foundryprotocol"
          target="_blank"
          rel="noreferrer noopener"
          className="text-ember-400 hover:text-ember-300"
        >
          @foundryprotocol
        </a>
        . Source artifacts live in the{" "}
        <a
          href="https://github.com/rajkaria/foundry"
          target="_blank"
          rel="noreferrer noopener"
          className="text-ember-400 hover:text-ember-300"
        >
          GitHub repo
        </a>
        .
      </P>
    </DocsLayout>
  );
}
