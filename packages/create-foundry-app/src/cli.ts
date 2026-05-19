/**
 * `create-foundry-app` — scaffolds a runnable Foundry project for one of the
 * five builder archetypes (A–E), or the zero-setup live demo.
 *
 *   npm create foundry-app@latest my-app
 *   npm create foundry-app@latest my-app -- --archetype B --network galileo
 *   npm create foundry-app@latest my-demo -- --demo      # one-command live demo
 *
 * The neutral, Foundry-free path is `0g init` (@0gkit/cli); the degit-able
 * recipes live in `examples/`. This scaffolder is the Foundry
 * (ownership/revenue) entrypoint.
 */

import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, basename } from "node:path";
import prompts from "prompts";
import kleur from "kleur";
import { generateProject } from "./generate.js";
import {
  ARCHETYPE_ORDER,
  ARCHETYPES,
  type ArchetypeId,
  type Network,
} from "./archetypes.js";

interface Cli {
  dir: string;
  archetype?: string;
  network?: Network;
  demo: boolean;
  yes: boolean;
}

const NETWORKS: Network[] = ["aristotle", "galileo", "local"];

export function parseArgs(argv: string[]): Cli {
  const out: Cli = { dir: ".", demo: false, yes: false };
  let dirSet = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--demo") out.demo = true;
    else if (a === "--yes" || a === "-y") out.yes = true;
    else if (a === "--archetype") out.archetype = argv[++i];
    else if (a === "--network") out.network = argv[++i] as Network;
    else if (a.startsWith("--archetype=")) out.archetype = a.split("=")[1];
    else if (a.startsWith("--network=")) out.network = a.split("=")[1] as Network;
    else if (!a.startsWith("-") && !dirSet) {
      out.dir = a;
      dirSet = true;
    }
  }
  if (out.demo) {
    out.archetype = "demo";
    out.network ??= "galileo";
    out.yes = true;
  }
  return out;
}

async function main(): Promise<void> {
  const cli = parseArgs(process.argv.slice(2));
  const dir = resolve(process.cwd(), cli.dir);
  const name = basename(dir);

  console.log();
  console.log(kleur.bold().yellow("  ⚒ create-foundry-app"));
  console.log(kleur.dim("  Scaffold a Foundry-powered project"));
  console.log();

  if (existsSync(dir) && cli.dir !== ".") {
    console.error(kleur.red(`  directory ${dir} already exists`));
    process.exit(1);
  }

  let archetype = cli.archetype;
  let network: Network | undefined = cli.network;

  if (!cli.yes && (!archetype || !network)) {
    const ans = (await prompts(
      [
        ...(archetype
          ? []
          : [
              {
                type: "select" as const,
                name: "archetype",
                message: "What are you building?",
                choices: ARCHETYPE_ORDER.map((id) => ({
                  title: `${id === "demo" ? "★ " : `${id}. `}${ARCHETYPES[id].title}`,
                  description: ARCHETYPES[id].lead,
                  value: id,
                })),
                initial: 0,
              },
            ]),
        ...(network
          ? []
          : [
              {
                type: "select" as const,
                name: "network",
                message: "Which network?",
                choices: [
                  {
                    title: "0G Galileo (testnet — recommended)",
                    value: "galileo",
                  },
                  { title: "0G Aristotle (mainnet)", value: "aristotle" },
                  { title: "Local Anvil", value: "local" },
                ],
                initial: 0,
              },
            ]),
      ],
      {
        onCancel: () => {
          console.log(kleur.dim("  cancelled"));
          process.exit(0);
        },
      }
    )) as { archetype?: ArchetypeId; network?: Network };
    archetype ??= ans.archetype;
    network ??= ans.network;
  }

  archetype ??= "demo";
  network ??= "galileo";

  if (!ARCHETYPE_ORDER.includes(archetype as ArchetypeId)) {
    console.error(
      kleur.red(
        `  unknown archetype '${archetype}' — expected ${ARCHETYPE_ORDER.join(", ")}`
      )
    );
    process.exit(1);
  }
  if (!NETWORKS.includes(network)) {
    console.error(
      kleur.red(`  unknown network '${network}' — expected ${NETWORKS.join(", ")}`)
    );
    process.exit(1);
  }

  const files = generateProject({ name, network, archetype });
  mkdirSync(dir, { recursive: true });
  for (const [file, body] of Object.entries(files)) {
    writeFileSync(resolve(dir, file), body);
  }

  const isDemo = archetype === "demo";
  console.log(kleur.green("  ✓ project created at " + kleur.bold(dir)));
  console.log();
  console.log("  next:");
  console.log(kleur.dim("    cd " + name));
  console.log(kleur.dim("    npm install"));
  if (isDemo) {
    console.log(kleur.dim("    npm run demo   # zero setup — runs on Galileo"));
  } else {
    console.log(kleur.dim("    cp .env.example .env"));
    console.log(kleur.dim("    npm start"));
  }
  console.log();
  console.log("  docs: " + kleur.cyan("https://foundryprotocol.xyz/docs"));
  console.log();
}

// Only run when invoked as a binary, not when imported by tests.
if (process.argv[1] && /create-foundry-app/.test(process.argv[1])) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
