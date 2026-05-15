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
  title: "MCP server — Foundry docs",
  description:
    "The @foundryprotocol/mcp Model Context Protocol server. Drop into Claude Desktop, Cursor, Cline, or any MCP-capable agent — and any AI agent gets a first-class tool for calling co-owned models on 0G.",
};

const toc = [
  { id: "why", label: "Why an MCP server" },
  { id: "install", label: "Install" },
  { id: "claude-desktop", label: "Claude Desktop" },
  { id: "cursor", label: "Cursor" },
  { id: "tools", label: "Tools exposed" },
  { id: "programmatic", label: "Programmatic use" },
  { id: "revenue", label: "Revenue routing" },
];

export default function McpPage() {
  return (
    <DocsLayout
      active="/docs/mcp"
      eyebrow="SDK · MCP"
      title="One npx command. Any agent gets a co-owned model."
      intro={
        <Lead>
          <Code>@foundryprotocol/mcp</Code> is a Model Context Protocol server that
          exposes Foundry Ingots — the co-owned, revenue-routing AI models on 0G — to
          any MCP-capable agent. Wire it into Claude Desktop, Cursor, Cline, or your own
          MCP client and your agent gains five new tools backed by live mainnet Ingots.
        </Lead>
      }
      toc={toc}
    >
      <H2 id="why">Why an MCP server</H2>
      <P>
        The SDK and adapters cover the case where you&apos;re writing code that calls a
        model. MCP covers the other case — when an autonomous agent (a Claude session, a
        Cursor copilot, a Cline workflow) needs to discover and invoke models on its
        own. The same OpenAI-compat proxy backs both paths, so the inference,
        attestation, and on-chain revenue settlement are identical regardless of how the
        call originates.
      </P>
      <Callout tone="ember" title="The agent does not need to know it's on 0G">
        <p>
          Your agent sees five tools: <Code>list_ingots</Code>,{" "}
          <Code>run_inference</Code>, <Code>get_ingot</Code>, <Code>get_lineage</Code>,{" "}
          <Code>get_attestation</Code>. It reasons about models the way it reasons about
          any other tool. The fact that each call reserves a fee on 0G Chain and credits
          an Ingot&apos;s co-owners is invisible to the agent and verifiable by anyone.
        </p>
      </Callout>

      <H2 id="install">Install</H2>
      <CodeBlock lang="bash" filename="terminal">{`# one-shot
npx @foundryprotocol/mcp

# or pin into a dev dependency
pnpm add @foundryprotocol/mcp`}</CodeBlock>
      <P>
        Published on npm at <Code>@foundryprotocol/mcp</Code>. MIT-licensed.
      </P>

      <H2 id="claude-desktop">Claude Desktop</H2>
      <P>
        Add Foundry to <Code>claude_desktop_config.json</Code> (on macOS,{" "}
        <Code>~/Library/Application Support/Claude/claude_desktop_config.json</Code>):
      </P>
      <CodeBlock lang="json" filename="claude_desktop_config.json">{`{
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
        Restart Claude Desktop. The five Foundry tools appear in the tools list. Ask
        Claude to{" "}
        <em>
          &ldquo;list the Foundry Ingots and translate &lsquo;how was your
          weekend?&rsquo; to Konkani using the best one&rdquo;
        </em>{" "}
        and it will chain <Code>list_ingots</Code> → <Code>run_inference</Code> without
        further prompting.
      </P>

      <H2 id="cursor">Cursor</H2>
      <P>
        In Cursor&apos;s settings, add an MCP server entry pointing to the same command.
        Cursor&apos;s agent mode will discover the tools automatically.
      </P>
      <CodeBlock lang="json" filename=".cursor/mcp.json">{`{
  "mcpServers": {
    "foundry": {
      "command": "npx",
      "args": ["-y", "@foundryprotocol/mcp"]
    }
  }
}`}</CodeBlock>

      <H2 id="tools">Tools exposed</H2>
      <Table
        head={["Tool", "What it does"]}
        rows={[
          [
            <Code>list_ingots</Code>,
            "Enumerate live Foundry Ingots. Returns ingot id, contributor count, license, and weights root.",
          ],
          [
            <Code>run_inference</Code>,
            "Call an Ingot via the OpenAI-compatible Foundry proxy. Revenue routes on-chain.",
          ],
          [<Code>get_ingot</Code>, "Metadata + cap table for a specific Ingot."],
          [
            <Code>get_lineage</Code>,
            "Parent Forge + parent Ingot chain; downstream re-uses.",
          ],
          [
            <Code>get_attestation</Code>,
            "TEE attestation envelope used to mint the Ingot (score vector, signature, mode).",
          ],
        ]}
      />

      <H3 id="run-inference-args">run_inference arguments</H3>
      <CodeBlock lang="json">{`{
  "ingot_id":     "0x8e2af4a…",           // optional if FOUNDRY_DEFAULT_INGOT_ID is set
  "input":        "Translate to Konkani: hello",
  "system":       "You are a Konkani translation assistant.",
  "max_tokens":   512,
  "temperature":  0.6
}`}</CodeBlock>
      <P>
        The response carries the model output plus a <Code>foundry</Code> object: the
        resolved Ingot id, the mode flag (<Code>live</Code> / <Code>tee</Code> /{" "}
        <Code>stub</Code>), and the on-chain tx hashes for inference and revenue split
        when fees were reserved.
      </P>

      <H2 id="programmatic">Programmatic use</H2>
      <P>
        Wire the server into a custom MCP client (or write your own MCP bridge) using
        the exported factory:
      </P>
      <CodeBlock
        lang="ts"
        filename="custom-mcp.ts"
      >{`import { createFoundryMcpServer } from "@foundryprotocol/mcp";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = createFoundryMcpServer({
  baseUrl:         "https://foundryprotocol.xyz",
  defaultIngotId:  "0x8e2af4a…",
});

await server.connect(new StdioServerTransport());`}</CodeBlock>

      <H2 id="revenue">Revenue routing</H2>
      <P>
        Every successful <Code>run_inference</Code> call:
      </P>
      <ol className="text-platinum-300 mt-2 list-decimal space-y-1 pl-5">
        <li>Reserves the inference fee on 0G Chain via the 0G serving broker.</li>
        <li>
          Deposits a configured share into{" "}
          <Code>RevenueSplitter.receivePayment(tokenId)</Code> — the per-Ingot
          pull-payment ledger.
        </li>
        <li>
          Co-owners pull-claim their pro-rata share at any time. The Ingot page and the
          dashboard reflect the new claimable balance within seconds.
        </li>
      </ol>
      <P>
        This is the same settlement path used by the SDK, the Vercel AI / LangChain
        adapters, and direct cURL calls. The MCP server is a new front door, not a new
        payment rail.
      </P>

      <PageNav
        prev={{ href: "/docs/adapters", label: "Adapters" }}
        next={{ href: "/docs/cli", label: "Foundry CLI" }}
      />
    </DocsLayout>
  );
}
