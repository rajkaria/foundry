#!/usr/bin/env node
/**
 * Foundry MCP server — stdio entrypoint.
 *
 * Wire into any MCP client config, e.g. Claude Desktop:
 *
 * {
 *   "mcpServers": {
 *     "foundry": {
 *       "command": "npx",
 *       "args": ["-y", "@foundryprotocol/mcp"],
 *       "env": {
 *         "FOUNDRY_BASE_URL": "https://foundryprotocol.xyz",
 *         "FOUNDRY_DEFAULT_INGOT_ID": "0x8e2af4a000000000000000000000000000000001"
 *       }
 *     }
 *   }
 * }
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createFoundryMcpServer } from "./index.js";

async function main(): Promise<void> {
  const baseUrl = process.env.FOUNDRY_BASE_URL ?? "https://foundryprotocol.xyz";
  const defaultIngotId = process.env.FOUNDRY_DEFAULT_INGOT_ID;

  const server = createFoundryMcpServer({ baseUrl, defaultIngotId });
  const transport = new StdioServerTransport();
  await server.connect(transport);

  process.stderr.write(
    `foundry-mcp ready · base=${baseUrl}${
      defaultIngotId ? ` · default=${defaultIngotId}` : ""
    }\n`
  );
}

main().catch((err) => {
  process.stderr.write(
    `foundry-mcp fatal: ${err instanceof Error ? err.message : String(err)}\n`
  );
  process.exit(1);
});
