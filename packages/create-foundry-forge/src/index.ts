/**
 * `create-foundry-forge` — scaffolds a starter project against the
 * Foundry SDK. Asks the user a handful of questions then writes a project
 * with the SDK pre-wired, env templated, and a sample script for each
 * lifecycle stage (upload to 0G Storage → create Forge → contribute → run
 * inference → claim revenue).
 *
 * Usage:
 *   pnpm create foundry-forge my-forge
 *   npm create foundry-forge@latest my-forge
 */

import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, basename } from "node:path";
import prompts from "prompts";
import kleur from "kleur";

interface Answers {
  network: "aristotle" | "galileo" | "local";
  template: "inference-only" | "full-lifecycle";
}

async function main(): Promise<void> {
  const arg = process.argv[2] ?? ".";
  const dir = resolve(process.cwd(), arg);
  const name = basename(dir);

  console.log();
  console.log(kleur.bold().yellow("  ⚒ create-foundry-forge"));
  console.log(kleur.dim("  Scaffold a Foundry-powered project"));
  console.log();

  if (existsSync(dir) && arg !== ".") {
    console.error(kleur.red(`  directory ${dir} already exists`));
    process.exit(1);
  }

  const a = (await prompts(
    [
      {
        type: "select",
        name: "network",
        message: "Which network?",
        choices: [
          { title: "0G Aristotle (mainnet)", value: "aristotle" },
          { title: "0G Galileo (testnet)", value: "galileo" },
          { title: "Local Anvil", value: "local" },
        ],
        initial: 0,
      },
      {
        type: "select",
        name: "template",
        message: "Template",
        choices: [
          {
            title: "Inference-only (call an existing Ingot)",
            value: "inference-only",
          },
          {
            title: "Full lifecycle (create Forge, upload data, mint Ingot)",
            value: "full-lifecycle",
          },
        ],
        initial: 0,
      },
    ],
    {
      onCancel: () => {
        console.log(kleur.dim("  cancelled"));
        process.exit(0);
      },
    }
  )) as Answers;

  mkdirSync(dir, { recursive: true });
  writePackageJson(dir, name, a);
  writeEnvExample(dir, a);
  writeReadme(dir, name, a);
  writeMain(dir, a);
  writeTsconfig(dir);
  writeGitignore(dir);

  console.log();
  console.log(kleur.green("  ✓ project created at " + kleur.bold(dir)));
  console.log();
  console.log("  next:");
  console.log(kleur.dim("    cd " + name));
  console.log(kleur.dim("    cp .env.example .env  # fill in PRIVATE_KEY etc."));
  console.log(kleur.dim("    npm install"));
  console.log(kleur.dim("    npm run start"));
  console.log();
  console.log("  docs: " + kleur.cyan("https://foundryprotocol.xyz/docs"));
  console.log();
}

function writePackageJson(dir: string, name: string, a: Answers): void {
  const pkg = {
    name,
    version: "0.0.0",
    private: true,
    type: "module",
    scripts: {
      start: "tsx index.ts",
      build: "tsc",
    },
    dependencies: {
      "@foundryprotocol/sdk": "^1.0.0",
      viem: "^2.21.0",
      ...(a.template === "full-lifecycle" ? { ethers: "^6.13.0" } : {}),
      dotenv: "^16.4.7",
    },
    devDependencies: {
      "@types/node": "^22.10.0",
      tsx: "^4.19.2",
      typescript: "^5.6.3",
    },
  };
  writeFileSync(resolve(dir, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
}

function writeEnvExample(dir: string, a: Answers): void {
  const lines = [
    `FOUNDRY_NETWORK=${a.network}`,
    a.network === "aristotle"
      ? "RPC_URL=https://evmrpc.0g.ai"
      : a.network === "galileo"
        ? "RPC_URL=https://evmrpc-testnet.0g.ai"
        : "RPC_URL=http://127.0.0.1:8545",
    "",
    "# Private key of the wallet that signs transactions",
    "PRIVATE_KEY=0x...",
    "",
    "# Ingot id you want to call (e.g. 'ingot:0x…/1')",
    "INGOT_ID=ingot:0x0000000000000000000000000000000000000000/1",
  ];
  if (a.template === "full-lifecycle") {
    lines.push("");
    lines.push("# Optional — for 0G Storage uploads (full-lifecycle template only)");
    lines.push("ZG_STORAGE_INDEXER=https://indexer-storage.0g.network");
  }
  writeFileSync(resolve(dir, ".env.example"), lines.join("\n") + "\n");
}

function writeReadme(dir: string, name: string, a: Answers): void {
  const md = [
    `# ${name}`,
    "",
    `A starter project built with [\`@foundryprotocol/sdk\`](https://www.npmjs.com/package/@foundryprotocol/sdk).`,
    "",
    "## Setup",
    "",
    "```bash",
    "cp .env.example .env",
    "# fill in PRIVATE_KEY and (if needed) INGOT_ID",
    "npm install",
    "npm run start",
    "```",
    "",
    "## What this template does",
    "",
    a.template === "inference-only"
      ? "Calls an existing Foundry Ingot in three lines via the SDK, printing the response and the on-chain receipt."
      : "Walks the full Forge lifecycle: uploads a dataset to 0G Storage, creates a Forge, contributes data, waits for evaluation, mints the Ingot, calls inference, and claims revenue.",
    "",
    "Docs: https://foundryprotocol.xyz/docs",
  ];
  writeFileSync(resolve(dir, "README.md"), md.join("\n") + "\n");
}

function writeMain(dir: string, a: Answers): void {
  const inferenceOnly = `import "dotenv/config";
import { Foundry, type IngotId } from "@foundryprotocol/sdk";

const ingotId = (process.env.INGOT_ID ?? "") as IngotId;
if (!ingotId.startsWith("ingot:0x")) {
  console.error("set INGOT_ID in .env to an existing Ingot");
  process.exit(1);
}

const foundry = new Foundry({
  contracts: (process.env.FOUNDRY_NETWORK as "aristotle" | "galileo" | "local") ?? "aristotle",
  rpcUrl: process.env.RPC_URL,
});

const { output, receipt } = await foundry.inference.run(ingotId, {
  input: "Hello, world.",
});

console.log("output:", output);
console.log("receipt:", receipt);
`;

  const fullLifecycle = `import "dotenv/config";
import { Foundry, createWalletClient, http, type Hex } from "@foundryprotocol/sdk";
import { privateKeyToAccount } from "viem/accounts";
import { Wallet, JsonRpcProvider } from "ethers";

const network = (process.env.FOUNDRY_NETWORK as "aristotle" | "galileo" | "local") ?? "aristotle";
const rpcUrl = process.env.RPC_URL!;
const pk = process.env.PRIVATE_KEY as Hex;

const account = privateKeyToAccount(pk);
const walletClient = createWalletClient({ account, transport: http(rpcUrl) });
const foundry = new Foundry({ contracts: network, rpcUrl, walletClient });

// 1) Upload a tiny dataset to 0G Storage.
const ethersSigner = new Wallet(pk, new JsonRpcProvider(rpcUrl));
const { rootHash } = await foundry.storage.uploadJson(
  { dataset: "konkani-recipes", rows: ["fish-curry", "xacuti", "sorpotel"] },
  { signer: ethersSigner }
);
console.log("uploaded → root:", rootHash);

// 2) Create a Forge.
const { forgeId } = await foundry.forge.create({
  modelSpec: rootHash,
  evalSpec: rootHash,
  evalCoordinator: account.address,
  contributionWindowEnds: BigInt(Math.floor(Date.now() / 1000) + 600),
});
console.log("forge:", forgeId);

// 3) Contribute data.
if (forgeId) {
  const { txHash } = await foundry.forge.contributeData(forgeId, rootHash);
  console.log("contribution tx:", txHash);
}

// 4) Walk state machine off-chain (eval coordinator will submit attribution).
// 5) Once Ingot exists, call inference:
//    const { output } = await foundry.inference.run("ingot:0x…/<tokenId>", { input: "Hi" });
`;

  writeFileSync(
    resolve(dir, "index.ts"),
    a.template === "inference-only" ? inferenceOnly : fullLifecycle
  );
}

function writeTsconfig(dir: string): void {
  const tsconfig = {
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "bundler",
      esModuleInterop: true,
      skipLibCheck: true,
      strict: true,
      resolveJsonModule: true,
      noEmit: true,
    },
    include: ["index.ts"],
  };
  writeFileSync(
    resolve(dir, "tsconfig.json"),
    JSON.stringify(tsconfig, null, 2) + "\n"
  );
}

function writeGitignore(dir: string): void {
  writeFileSync(
    resolve(dir, ".gitignore"),
    ["node_modules", ".env", "dist", ""].join("\n")
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
