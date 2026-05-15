# @foundryprotocol/mcp

MCP server that exposes Foundry Ingots — the co-owned, revenue-routing AI models on 0G — to any MCP-capable AI agent (Claude Desktop, Cursor, Cline, custom agents).

## Install

```bash
npx @foundryprotocol/mcp
```

Or wire into an MCP client config:

```jsonc
{
  "mcpServers": {
    "foundry": {
      "command": "npx",
      "args": ["-y", "@foundryprotocol/mcp"],
      "env": {
        "FOUNDRY_BASE_URL": "https://foundryprotocol.xyz",
        "FOUNDRY_DEFAULT_INGOT_ID": "0x8e2af4a000000000000000000000000000000001",
      },
    },
  },
}
```

## Tools

| Tool              | What it does                                                                         |
| ----------------- | ------------------------------------------------------------------------------------ |
| `list_ingots`     | Enumerate live Foundry Ingots.                                                       |
| `run_inference`   | Call an Ingot via the OpenAI-compat proxy. **Revenue routes on-chain to co-owners.** |
| `get_ingot`       | Metadata + cap table for an Ingot.                                                   |
| `get_lineage`     | Parent Forge + parent Ingot chain.                                                   |
| `get_attestation` | TEE attestation envelope used to mint the Ingot.                                     |

## Why this exists

Foundry's thesis is that any AI agent should be able to consume a co-owned AI model in one line. The SDK does it for code; this MCP server does it for agents. When your agent calls `run_inference`, the inference fee reserves on 0G Chain via the serving broker, and a portion deposits into the Ingot's `RevenueSplitter` — claimable by every co-owner pro-rata.

The Ingot doesn't know it's being called by an agent. The agent doesn't know it's calling a model whose data, compute, and capital came from 50 different people. Both sides just work.

## Programmatic use

```ts
import { createFoundryMcpServer } from "@foundryprotocol/mcp";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = createFoundryMcpServer({
  baseUrl: "https://foundryprotocol.xyz",
  defaultIngotId: "0x8e2…",
});

await server.connect(new StdioServerTransport());
```

## License

MIT.
