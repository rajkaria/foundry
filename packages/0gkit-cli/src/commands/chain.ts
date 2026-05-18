import type { Command } from "commander";
import type { ProgramDeps } from "../program.js";
import { runCommand } from "../program.js";

export function registerChain(program: Command, deps: ProgramDeps): void {
  const chain = program.command("chain");
  chain.command("balance <address>").action(async function (address: string) {
    await runCommand(deps, this, async (ctx) => {
      const client = deps.createClient({ network: ctx.network, rpcUrl: ctx.rpcUrl });
      const wei = await deps.balance(client, address as `0x${string}`);
      return {
        human: [`balance: ${wei}`],
        json: { address, wei: wei.toString() },
      };
    });
  });
}
