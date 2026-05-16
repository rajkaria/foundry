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
  title: "Integrate Foundry — the ownership & revenue layer for 0G AI projects",
  description:
    "Add co-owned, revenue-sharing, verifiable AI to your 0G project in under 15 minutes. Why it pays off, what you get, and three copy-paste integration paths.",
};

const toc = [
  { id: "why", label: "Why integrate" },
  { id: "get", label: "What you get" },
  { id: "fit", label: "Find your fit" },
  { id: "quickstart", label: "Integrate in 3 lines" },
  { id: "paths", label: "Pick your path" },
  { id: "examples", label: "Integration examples" },
  { id: "equity", label: "Turn data into equity" },
  { id: "catalog", label: "Try a live Ingot now" },
  { id: "next", label: "Next steps" },
];

export default function ZeroGHackathonDocsPage() {
  return (
    <DocsLayout
      active="/docs/0g-hackathon"
      eyebrow="0G builders · Integration guide"
      title="Add co-owned, revenue-sharing AI to your project in 15 minutes."
      intro={
        <Lead>
          If your project does model inference, holds memory, or produces data, Foundry
          turns that into ongoing on-chain ownership and revenue — with no bridges, on
          the same 0G Storage + 0G Compute TEEs + 0G Chain you already build on. Every
          snippet, address, and Ingot ID on this page is live on Aristotle mainnet
          today.
        </Lead>
      }
      toc={toc}
    >
      <H2 id="why">Why integrate</H2>
      <P>
        Most AI projects rent intelligence: you call a closed model, you pay a bill, the
        value flows one way and stops the moment you stop paying. Foundry inverts that.
        When you build on a Foundry Ingot, you and your contributors{" "}
        <strong className="text-platinum-100">own a share of the model</strong>, and
        every call anyone makes routes revenue back to owners automatically — forever.
      </P>
      <P>
        Concretely, integrating gets you three things you cannot get from a raw API:
      </P>
      <ul className="text-body-lg text-platinum-300 ml-6 list-disc space-y-3">
        <li>
          <strong className="text-platinum-100">Verifiable, not just trusted</strong> —
          every inference returns an on-chain receipt (<Code>inferenceTxHash</Code>) and
          a TEE attestation. You can prove to your users exactly which model ran and
          that owners were paid.
        </li>
        <li>
          <strong className="text-platinum-100">Your data becomes equity</strong> — the
          memory, traces, and datasets you already generate can be contributed to a
          Forge and minted into ownership of the resulting model.
        </li>
        <li>
          <strong className="text-platinum-100">Revenue that compounds</strong> — once
          your agents run on an Ingot you co-own, every call (yours or anyone
          else&apos;s) pays your team. Usage becomes an asset, not just a cost.
        </li>
      </ul>
      <Callout tone="ember" title="The one-sentence pitch">
        <p>
          Stop renting intelligence. Own a slice of the model your project runs on, and
          earn every time it&apos;s used.
        </p>
      </Callout>

      <H2 id="get">What you get out of the box</H2>
      <Table
        head={["Capability", "What it means for you"]}
        rows={[
          [
            "OpenAI-compatible API",
            "Swap your base URL + a header. No SDK lock-in, no rewrite.",
          ],
          [
            "On-chain receipts",
            <>
              Every call returns <Code>inferenceTxHash</Code> /{" "}
              <Code>revenueTxHash</Code> — show users the proof.
            </>,
          ],
          [
            "TEE-attested inference",
            "Hardware-signed execution on 0G Compute. Verifiable, not custodial.",
          ],
          [
            "Automatic revenue split",
            <>
              The on-chain <Code>RevenueSplitter</Code> pays co-owners. Zero accounting
              code from you.
            </>,
          ],
          [
            "Framework adapters",
            "Vercel AI SDK + LangChain ship in the box. Drop-in for existing apps.",
          ],
          [
            "Agent-native MCP",
            <>
              <Code>npx @foundryprotocol/mcp</Code> works in Claude, Cursor, Cline, and
              custom runtimes.
            </>,
          ],
        ]}
      />
      <Callout tone="note" title="Good to know">
        <p>
          The inference endpoint is general drop-in. The Ingots live on mainnet today
          are domain models (translation, contract-clause classification) — perfect for
          a working demo. The bigger win is spinning up a Forge for <em>your</em>{" "}
          vertical so you co-own a model tuned to your use case.
        </p>
      </Callout>

      <H2 id="fit">Find your fit</H2>
      <P>
        Whatever you&apos;re building on 0G, there&apos;s a direct payoff. Find the row
        closest to your project:
      </P>
      <ul className="text-body-lg text-platinum-300 ml-6 list-disc space-y-3">
        <li>
          <strong className="text-platinum-100">Agents, memory, identity</strong> — keep
          your sovereign memory; swap the inference backend to a co-owned Ingot.
          Contribute memory logs or synthetic datasets and own part of the model your
          agents help improve.
        </li>
        <li>
          <strong className="text-platinum-100">
            Verifiable finance, trading, DeFi agents
          </strong>{" "}
          — every decision your agent makes gets a TEE attestation and an on-chain
          receipt. Store it next to the trade for an instant, provable audit trail.
        </li>
        <li>
          <strong className="text-platinum-100">
            Marketplaces, gig, skill, payment protocols
          </strong>{" "}
          — list Foundry Ingots as a model SKU. The <Code>RevenueSplitter</Code> handles
          per-call payout accounting on-chain for free, and every call pays co-owners.
        </li>
        <li>
          <strong className="text-platinum-100">Consumer apps, RWA, tools</strong> — no
          web3 code needed to start: it&apos;s a drop-in OpenAI endpoint. Contribute
          your domain data later and start earning from the model.
        </li>
        <li>
          <strong className="text-platinum-100">Infra, data, compute providers</strong>{" "}
          — you already produce the storage, DA, and compute Forges consume. Become a
          contributor and earn Ingot shares for infra you already run.
        </li>
      </ul>

      <H2 id="quickstart">Integrate in 3 lines</H2>
      <P>
        This is the entire happy path. Pick any live Ingot ID from the{" "}
        <a href="#catalog" className="text-ember-400 hover:text-ember-300">
          catalog below
        </a>{" "}
        and run:
      </P>
      <CodeBlock lang="ts">{`import { Foundry } from "@foundryprotocol/sdk";

const foundry = new Foundry({ contracts: "aristotle" });
const { output, receipt } = await foundry.inference.run(
  "ingot:0x8e2af4a000000000000000000000000000000001",
  { input: userQuery },
);
// receipt.inferenceTxHash → on-chain proof you can show your users`}</CodeBlock>

      <H2 id="paths">Pick your path</H2>

      <H3 id="path-sdk">SDK — TypeScript, full ownership + inference</H3>
      <CodeBlock lang="bash">npm install @foundryprotocol/sdk viem</CodeBlock>
      <CodeBlock lang="ts">{`import { Foundry } from "@foundryprotocol/sdk";

// networks: "aristotle" | "galileo" | "local" (only aristotle is live)
const foundry = new Foundry({ contracts: "aristotle" });

const { output, ingotId, receipt } = await foundry.inference.run(
  "ingot:0x8e2af4a000000000000000000000000000000001",
  { input: \`\${context}\\n\\n\${userQuery}\`, temperature: 0.7 },
);
// receipt = { requestId, inferenceTxHash?, revenueTxHash?, latencyMs }`}</CodeBlock>

      <H3 id="path-http">HTTP — any language, drop-in OpenAI client</H3>
      <CodeBlock lang="bash">{`curl https://api.foundryprotocol.xyz/v1/chat/completions \\
  -H "content-type: application/json" \\
  -H "x-foundry-ingot-id: 0x8e2af4a000000000000000000000000000000001" \\
  -d '{"messages":[{"role":"user","content":"Translate to Konkani: hello"}],"temperature":0.7}'`}</CodeBlock>
      <P>
        The response is OpenAI-shaped, with an extra <Code>foundry</Code> block carrying{" "}
        <Code>inferenceTxHash</Code>, <Code>revenueTxHash</Code>, and{" "}
        <Code>attestation</Code>. Point your existing OpenAI client at the base URL and
        you&apos;re done.
      </P>

      <H3 id="path-mcp">MCP — Claude, Cursor, Cline, custom agents</H3>
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

      <H3 id="path-adapters">Adapters — zero rewrite for existing AI apps</H3>
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

      <H2 id="examples">Integration examples</H2>
      <P>
        Worked patterns for the kinds of projects building on 0G today. Each is a small
        diff on top of what you already have — drop in the call, keep your existing
        logic.
      </P>

      <H3 id="ex-memory">Sovereign-memory agent (e.g. a SealedMind / MindVault)</H3>
      <P>
        Keep your encrypted memory exactly as-is. Swap only the model call so your agent
        runs on an Ingot you can co-own — and attach the on-chain receipt as proof of
        what answered.
      </P>
      <CodeBlock lang="ts">{`import { Foundry } from "@foundryprotocol/sdk";

const foundry = new Foundry({ contracts: "aristotle" });

// 1. Your existing sovereign recall — unchanged
const memory = await vault.recall(userId, query);

// 2. Reason on a co-owned Ingot instead of a closed API
const { output, receipt } = await foundry.inference.run(
  "ingot:0x8e2af4a000000000000000000000000000000001",
  { input: \`\${memory}\\n\\nUser: \${query}\` },
);

// 3. Store the answer + on-chain proof in your memory graph
await vault.remember(userId, { output, proof: receipt.inferenceTxHash });`}</CodeBlock>

      <H3 id="ex-finance">
        Verifiable trading / DeFi agent (e.g. a Provus / Aegis Vault)
      </H3>
      <P>
        Every decision your agent makes ships with a TEE attestation and a transaction
        hash. Persist it next to the trade for an audit trail anyone can verify.
      </P>
      <CodeBlock lang="ts">{`const signals = await market.snapshot(pair);

const { output, receipt } = await foundry.inference.run(
  "ingot:0x8e2af4a000000000000000000000000000000004", // clause/intent Ingot
  { input: JSON.stringify({ signals, policy }), temperature: 0.2 },
);

const decision = JSON.parse(output);
await ledger.record({
  pair,
  decision,
  verifiedBy: receipt.inferenceTxHash, // provable, not "trust us"
  revenuePaid: receipt.revenueTxHash,
});`}</CodeBlock>

      <H3 id="ex-marketplace">Agent marketplace (e.g. an AgentHub / zer0Gig)</H3>
      <P>
        List Ingots as model SKUs. Route a job through Foundry and the on-chain{" "}
        <Code>RevenueSplitter</Code> pays every co-owner automatically — you write zero
        payout code.
      </P>
      <CodeBlock lang="ts">{`// Each listing maps a task to an Ingot SKU
const sku = catalog.resolve(job.taskType); // -> { ingotId }

const { output, receipt } = await foundry.inference.run(sku.ingotId, {
  input: job.payload,
});

// Revenue already split on-chain to co-owners. Just surface the proof.
return { result: output, receiptUrl: \`/ingots/\${sku.ingotId}\`, tx: receipt.revenueTxHash };`}</CodeBlock>

      <H3 id="ex-consumer">Consumer app, zero web3 (e.g. a ZeroViza / Compass)</H3>
      <P>
        No SDK, no wallet. Point your existing OpenAI client at the Foundry base URL and
        add one header — you&apos;re calling a co-owned model in minutes.
      </P>
      <CodeBlock lang="ts">{`import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.foundryprotocol.xyz/v1",
  apiKey: "not-required",
  defaultHeaders: {
    "x-foundry-ingot-id": "0x8e2af4a000000000000000000000000000000001",
  },
});

const res = await client.chat.completions.create({
  model: "foundry",
  messages: [{ role: "user", content: userInput }],
});
// res.foundry.inferenceTxHash → show the on-chain receipt in your UI`}</CodeBlock>

      <Callout tone="ember" title="Need help wiring yours in?">
        <p>
          Ping me directly on Telegram —{" "}
          <a
            href="https://t.me/rajkaria"
            target="_blank"
            rel="noreferrer noopener"
            className="text-ember-400 hover:text-ember-300"
          >
            t.me/rajkaria
          </a>{" "}
          — and I&apos;ll help you ship your integration, usually in under 30 minutes.
        </p>
      </Callout>

      <H2 id="equity">Turn your data into equity</H2>
      <P>
        The deeper integration: don&apos;t just call a model — help train one and own
        it. Contribute data, compute, or capital to a Forge; when it closes, ownership
        mints proportionally and revenue starts flowing. The full lifecycle, real SDK
        calls:
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

      <H2 id="catalog">Try a live Ingot right now</H2>
      <P>
        These are live on Aristotle mainnet. Paste any ID into the quickstart above and
        you&apos;ll get a real on-chain receipt back.
      </P>
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

      <H2 id="next">Next steps</H2>
      <ul className="text-body-lg text-platinum-300 ml-6 list-disc space-y-3">
        <li>
          Browse live Forges and Ingots at{" "}
          <a href="/forges" className="text-ember-400 hover:text-ember-300">
            /forges
          </a>{" "}
          and{" "}
          <a href="/lineage" className="text-ember-400 hover:text-ember-300">
            /lineage
          </a>
          .
        </li>
        <li>
          Read the deeper{" "}
          <a
            href="/docs/build-on-foundry"
            className="text-ember-400 hover:text-ember-300"
          >
            Build on Foundry
          </a>{" "}
          guide for the contributor and Forge-owner paths.
        </li>
        <li>
          Want a co-branded demo or help wiring your project in? Open the{" "}
          <a href="/docs/quickstart" className="text-ember-400 hover:text-ember-300">
            Quickstart
          </a>
          , or message me on Telegram at{" "}
          <a
            href="https://t.me/rajkaria"
            target="_blank"
            rel="noreferrer noopener"
            className="text-ember-400 hover:text-ember-300"
          >
            t.me/rajkaria
          </a>{" "}
          — most teams ship in under 30 minutes.
        </li>
      </ul>

      <PageNav
        prev={{ href: "/docs/build-on-foundry", label: "Build on Foundry" }}
        next={{ href: "/docs/quickstart", label: "Quickstart" }}
      />
    </DocsLayout>
  );
}
