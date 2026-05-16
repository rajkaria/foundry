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
  PageNav,
} from "@/components/docs/DocsLayout";

export const metadata = {
  title: "0G Hackathon integration plan — Foundry docs",
  description:
    "Make Foundry the most-integrated project in the 0G hackathon: codebase-accurate pitch, three integration paths, per-archetype value props, and a campaign plan.",
};

const toc = [
  { id: "post", label: "Broadcast post" },
  { id: "live", label: "What's actually live" },
  { id: "archetypes", label: "Who benefits" },
  { id: "paths", label: "Three integration paths" },
  { id: "templates", label: "Outreach templates" },
  { id: "forge", label: "Data becomes equity" },
  { id: "catalog", label: "Live Ingot catalog" },
  { id: "campaign", label: "Campaign plan" },
];

export default function ZeroGHackathonDocsPage() {
  return (
    <DocsLayout
      active="/docs/0g-hackathon"
      eyebrow="Start here · 0G Hackathon"
      title="Make Foundry the most-integrated project in the 0G hackathon."
      intro={
        <Lead>
          Almost every hackathon submission does AI inference, memory, or data. Foundry
          turns each of them into a revenue-earning co-owner of on-chain models — zero
          bridges, same 0G Storage + 0G Compute TEEs + 0G Chain (Aristotle). Every
          snippet, package name, contract address, and Ingot ID below is verbatim from
          the shipped repo.
        </Lead>
      }
      toc={toc}
    >
      <H2 id="post">The broadcast post</H2>
      <P>
        Drop this in the hackathon Discord / Telegram and the 0G channels. It leads with
        the three defensible upsides — verifiable receipts, data-as-equity, and passive
        revenue — not a model-quality claim.
      </P>

      <Callout tone="ember" title="Copy-paste post">
        <p>
          <strong className="text-platinum-100">Hey 0G Hackathon builders 👋</strong>
        </p>
        <p>
          Almost every submission is building AI agents, memory layers, verifiable
          finance, marketplaces, infra, or consumer tools that depend on model inference
          and data.
        </p>
        <p>
          <strong className="text-platinum-100">Foundry Protocol</strong> is live on{" "}
          <strong className="text-platinum-100">0G Aristotle mainnet</strong> (chain{" "}
          <Code>16661</Code>). Pool data + compute + capital into a Forge to co-train a
          real model. Contributors get proportional on-chain ownership — an Ingot
          (ERC-721 cap table) — and every inference automatically routes revenue back to
          co-owners via the on-chain <Code>RevenueSplitter</Code>. No middleman, no
          off-chain trust.
        </p>
        <p>
          <strong className="text-platinum-100">Three concrete upsides:</strong> (1)
          inference with on-chain receipts — drop-in OpenAI-compatible endpoint, every
          call returns <Code>inferenceTxHash</Code> + <Code>revenueTxHash</Code>; (2)
          your data becomes equity — push datasets into a Forge, get minted ownership
          inside the TEE; (3) passive revenue forever — every call on an Ingot you
          co-own pays your team.
        </p>
        <p>
          Ships with Vercel AI SDK + LangChain adapters and an MCP server (
          <Code>npx @foundryprotocol/mcp</Code>). We&apos;ll help any team ship in &lt;
          30 minutes — reference repo, live Ingot IDs, co-branded demo. Reply or DM. cc
          @0G_labs @dragon0195 🚀
        </p>
      </Callout>

      <CodeBlock lang="ts">{`import { Foundry } from "@foundryprotocol/sdk";
const foundry = new Foundry({ contracts: "aristotle" });
const { output, receipt } = await foundry.inference.run(
  "ingot:0x8e2af4a000000000000000000000000000000001",
  { input: userQuery },
);`}</CodeBlock>

      <H2 id="live">What&apos;s actually live (so we never overclaim)</H2>
      <Table
        head={["Asset", "Reality"]}
        rows={[
          ["Network", "0G Aristotle mainnet, chain ID 16661"],
          [
            "SDK",
            <>
              <Code>@foundryprotocol/sdk</Code> v1.0.0 — <Code>Foundry</Code> class,
              viem-based
            </>,
          ],
          [
            "MCP",
            <>
              <Code>@foundryprotocol/mcp</Code> — <Code>npx @foundryprotocol/mcp</Code>
            </>,
          ],
          [
            "HTTP API",
            <>
              OpenAI-compatible:{" "}
              <Code>POST https://api.foundryprotocol.xyz/v1/chat/completions</Code>
            </>,
          ],
          [
            "Adapters",
            <>
              <Code>/adapters/vercel-ai</Code>, <Code>/adapters/langchain</Code>
            </>,
          ],
          [
            "Live Ingots",
            "Domain models (translation + clause classifier) — see below",
          ],
          [
            "Receipts",
            <>
              <Code>requestId</Code>, <Code>inferenceTxHash</Code>,{" "}
              <Code>revenueTxHash</Code>, <Code>latencyMs</Code>
            </>,
          ],
        ]}
      />

      <H3 id="contracts">Deployed contracts (Aristotle, chain 16661)</H3>
      <Table
        head={["Contract", "Address"]}
        rows={[
          ["FORGEToken", <Code>0xE716B0260f462b2A1789cB6cfCBd825736b920Ca</Code>],
          [
            "ContributionRegistry",
            <Code>0x05235Ba0F2a77bcaB87371E4d797D6830ddC2d86</Code>,
          ],
          ["Ingot", <Code>0x39B736f424754d05a0da186d89015b74d1DDe1d3</Code>],
          ["RevenueSplitter", <Code>0xC58E0F32BD43e43153D3CA8ee8F25C8198789289</Code>],
          ["ForgeFactory", <Code>0x636109264EBF6cFD18CC38bD43eDf9cCad7ae23D</Code>],
          ["IngotRegistry", <Code>0xF8f3fAE648A8d7ee4Df0A7b10a0F759938aab7e1</Code>],
        ]}
      />

      <Callout tone="warn" title="Honest framing">
        <p>
          The inference endpoint is general drop-in, but the live Ingots are domain
          models today. The killer pitch for general agents is &ldquo;spin up a Forge
          for your vertical and co-own the model&rdquo; — not &ldquo;replace
          GPT-4.&rdquo; Lead with ownership + revenue + verifiable receipts, not raw
          model quality.
        </p>
      </Callout>

      <H2 id="archetypes">Who benefits — segment the 95</H2>
      <P>
        Bucket the master list into five archetypes. Each gets a different lead
        value-prop.
      </P>
      <ul className="text-body-lg text-platinum-300 ml-6 list-disc space-y-3">
        <li>
          <strong className="text-platinum-100">
            A · Agent infra / memory / identity
          </strong>{" "}
          — &ldquo;your memory becomes equity.&rdquo; Contribute logs/datasets to a
          Forge, own part of the model, keep sovereign memory.
        </li>
        <li>
          <strong className="text-platinum-100">
            B · Verifiable finance / trading
          </strong>{" "}
          — TEE-attested inference + on-chain receipts for every decision. Feed signed
          reasoning traces into a Forge for ownership.
        </li>
        <li>
          <strong className="text-platinum-100">
            C · Marketplaces / gig / payments
          </strong>{" "}
          — every inference on a co-owned Ingot pays you passively;{" "}
          <Code>RevenueSplitter</Code> handles payout accounting for free.
        </li>
        <li>
          <strong className="text-platinum-100">D · Consumer / RWA / tools</strong> —
          drop-in OpenAI endpoint, no web3 code to start; contribute domain data later
          and earn.
        </li>
        <li>
          <strong className="text-platinum-100">E · Pure infra / data / compute</strong>{" "}
          — you already produce what Forges consume; become a contributor and earn Ingot
          shares.
        </li>
      </ul>

      <H2 id="paths">Three integration paths (all live)</H2>

      <H3 id="path-sdk">Path 1 · SDK (TypeScript)</H3>
      <CodeBlock lang="bash">npm install @foundryprotocol/sdk viem</CodeBlock>
      <CodeBlock lang="ts">{`import { Foundry } from "@foundryprotocol/sdk";

// network names: "aristotle" | "galileo" | "local" (only aristotle is live)
const foundry = new Foundry({ contracts: "aristotle" });

const { output, ingotId, receipt } = await foundry.inference.run(
  "ingot:0x8e2af4a000000000000000000000000000000001",
  { input: \`\${context}\\n\\n\${userQuery}\`, temperature: 0.7 },
);
// receipt = { requestId, inferenceTxHash?, revenueTxHash?, latencyMs }`}</CodeBlock>

      <H3 id="path-http">Path 2 · HTTP (any language, drop-in OpenAI client)</H3>
      <CodeBlock lang="bash">{`curl https://api.foundryprotocol.xyz/v1/chat/completions \\
  -H "content-type: application/json" \\
  -H "x-foundry-ingot-id: 0x8e2af4a000000000000000000000000000000001" \\
  -d '{"messages":[{"role":"user","content":"Translate to Konkani: hello"}],"temperature":0.7}'`}</CodeBlock>
      <P>
        Response is OpenAI-shaped with an extra <Code>foundry</Code> block carrying{" "}
        <Code>inferenceTxHash</Code> / <Code>revenueTxHash</Code> /{" "}
        <Code>attestation</Code>.
      </P>

      <H3 id="path-mcp">Path 3 · MCP (Claude / Cursor / Cline / agents)</H3>
      <CodeBlock lang="json">{`{
  "mcpServers": {
    "foundry": {
      "command": "npx",
      "args": ["-y", "@foundryprotocol/mcp"],
      "env": {
        "FOUNDRY_BASE_URL": "https://foundryprotocol.xyz",
        "FOUNDRY_DEFAULT_INGOT_ID": "0x8e2af4a000000000000000000000000000000001"
      }
    }
  }
}`}</CodeBlock>
      <P>
        Tools exposed: <Code>list_ingots</Code>, <Code>run_inference</Code>,{" "}
        <Code>get_ingot</Code>, <Code>get_lineage</Code>, <Code>get_attestation</Code>.
      </P>

      <H3 id="path-adapters">Adapters (zero rewrite for existing AI apps)</H3>
      <CodeBlock lang="ts">{`// Vercel AI SDK
import { foundry } from "@foundryprotocol/sdk/adapters/vercel-ai";
import { generateText } from "ai";
const model = foundry("ingot:0x8e2af4a000000000000000000000000000000001");
const { text } = await generateText({ model, prompt: "…" });

// LangChain
import { FoundryChat } from "@foundryprotocol/sdk/adapters/langchain";
import { HumanMessage } from "@langchain/core/messages";
const llm = new FoundryChat({ ingotId: "ingot:0x8e2af4a000000000000000000000000000000001" });
const res = await llm.invoke([new HumanMessage("…")]);`}</CodeBlock>

      <H2 id="templates">Per-archetype outreach templates</H2>
      <ul className="text-body-lg text-platinum-300 ml-6 list-disc space-y-3">
        <li>
          <strong className="text-platinum-100">A — Memory:</strong> &ldquo;Your memory
          can become equity. Push logs into a Forge, own part of the model, swap
          inference to a co-owned Ingot in 3 lines. 30-min co-branded demo on us.&rdquo;
        </li>
        <li>
          <strong className="text-platinum-100">B — Finance:</strong> &ldquo;Your edge
          is verifiability. Every inference gets a TEE attestation +{" "}
          <Code>inferenceTxHash</Code> on Aristotle — instant on-chain audit
          trail.&rdquo;
        </li>
        <li>
          <strong className="text-platinum-100">C — Marketplace:</strong> &ldquo;Add
          Foundry Ingots as a model SKU. <Code>RevenueSplitter</Code> handles
          per-inference payout accounting on-chain for free.&rdquo;
        </li>
        <li>
          <strong className="text-platinum-100">D — Consumer:</strong> &ldquo;No web3
          code to start: drop-in OpenAI endpoint. Contribute domain data later and earn
          from the model.&rdquo;
        </li>
        <li>
          <strong className="text-platinum-100">E — Infra:</strong> &ldquo;You produce
          the storage/DA/compute Forges consume. Become a contributor, earn Ingot
          shares.&rdquo;
        </li>
      </ul>

      <H2 id="forge">&ldquo;Your data becomes equity&rdquo; — the real moat</H2>
      <P>
        No other hackathon project has this. The full Forge lifecycle, real SDK calls:
      </P>
      <CodeBlock lang="ts">{`const { forgeId } = await foundry.forge.create({ modelSpec, evalSpec, evalCoordinator, contributionWindowEnds });
await foundry.forge.contributeData(forgeId, storageRootHash);   // 0G Storage root
await foundry.forge.contributeCompute(forgeId, "0.5");          // stake OG
await foundry.forge.fundForge(forgeId, "1.0");                  // capital
await foundry.forge.startEvaluating(forgeId);
await foundry.forge.submitEvalResult(forgeId, attestationHex, scores); // TEE-attested
await foundry.forge.mintOwnership(forgeId);                     // ERC-721 cap table
await foundry.forge.setWeightsAndGoLive(forgeId, weightsRoot);  // Ingot callable
await foundry.revenue.claim(tokenId);                           // pull from RevenueSplitter`}</CodeBlock>

      <H2 id="catalog">Live Ingot catalog (for demos)</H2>
      <Table
        head={["Ingot ID", "Model", "Contributors", "License"]}
        rows={[
          [
            <Code>ingot:0x8e2af4a…001</Code>,
            "Konkani ↔ English v1",
            "9",
            "open-noncommercial",
          ],
          [
            <Code>ingot:0x8e2af4a…002</Code>,
            "Konkani · news domain",
            "6",
            "open-noncommercial",
          ],
          [
            <Code>ingot:0x8e2af4a…003</Code>,
            "Tulu ↔ English v1",
            "4",
            "open-noncommercial",
          ],
          [
            <Code>ingot:0x8e2af4a…004</Code>,
            "Clause Classifier — contract intent",
            "7",
            "open-permissive",
          ],
          [
            <Code>ingot:0x8e2af4a…005</Code>,
            "Clause · MSA specialization",
            "5",
            "open-permissive",
          ],
        ]}
      />

      <H2 id="campaign">Campaign plan — how we win &ldquo;most integrated&rdquo;</H2>
      <ul className="text-body-lg text-platinum-300 ml-6 list-disc space-y-3">
        <li>
          <strong className="text-platinum-100">Week 1 · Reach</strong> — post above,
          tag the master list A–E, send templates in batches of ~20/day.
        </li>
        <li>
          <strong className="text-platinum-100">Week 2 · Convert</strong> — ship a
          public <Code>foundry-0g-starter</Code> repo; offer 15 co-branded 30-min
          pairing slots, each yielding a tweet + a real <Code>inferenceTxHash</Code>.
        </li>
        <li>
          <strong className="text-platinum-100">Week 3 · Amplify</strong> — publish
          &ldquo;N projects integrated in 72h&rdquo; thread with explorer links; flip
          integrators into Forge co-owners.
        </li>
      </ul>
      <Callout tone="ember" title="Definition of winning">
        <p>
          Count of distinct hackathon projects with a real <Code>inferenceTxHash</Code>{" "}
          on Aristotle from their codebase. Track it on a public leaderboard — social
          proof compounds.
        </p>
      </Callout>

      <PageNav
        prev={{ href: "/docs/build-on-foundry", label: "Build on Foundry" }}
        next={{ href: "/docs/quickstart", label: "Quickstart" }}
      />
    </DocsLayout>
  );
}
