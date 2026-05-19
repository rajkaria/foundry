/**
 * Pure project generator: turns options into a complete file map. No disk I/O
 * here so the whole thing is unit-testable; `cli.ts` does the writing.
 */

import {
  getArchetype,
  RPC_FOR,
  type ArchetypeContext,
  type Network,
} from "./archetypes.js";

export interface GenerateOptions {
  /** Project directory name (used as package name + in templates). */
  name: string;
  network: Network;
  /** Archetype id: "A"–"E" or "demo". */
  archetype: string;
}

/** Map of relative file path → file contents. */
export type FileMap = Record<string, string>;

export function generateProject(opts: GenerateOptions): FileMap {
  const arch = getArchetype(opts.archetype);
  const ctx: ArchetypeContext = { name: opts.name, network: opts.network };

  return {
    "package.json": packageJson(opts, arch.needsKey, arch.extraDeps),
    ".env.example": envExample(opts, arch.envLines(ctx)),
    "README.md": readme(opts, arch.title, arch.lead, arch.readmeBlurb),
    "index.ts": arch.index(ctx),
    "tsconfig.json": tsconfig(),
    ".gitignore": gitignore(),
  };
}

function packageJson(
  opts: GenerateOptions,
  needsKey: boolean,
  extraDeps?: Record<string, string>
): string {
  const pkg = {
    name: opts.name,
    version: "0.0.0",
    private: true,
    type: "module",
    scripts: {
      start: "tsx index.ts",
      demo: "tsx index.ts",
      build: "tsc",
    },
    dependencies: {
      "@foundryprotocol/sdk": "^1.0.0",
      viem: "^2.21.0",
      dotenv: "^16.4.7",
      ...(extraDeps ?? {}),
    },
    devDependencies: {
      "@types/node": "^22.10.0",
      tsx: "^4.19.2",
      typescript: "^5.6.3",
    },
  };
  // `needsKey` is surfaced in the README/env, not package.json — keep the
  // reference so the generator stays honest about which archetypes sign.
  void needsKey;
  return JSON.stringify(pkg, null, 2) + "\n";
}

function envExample(opts: GenerateOptions, extra: string[]): string {
  const lines = [
    `FOUNDRY_NETWORK=${opts.network}`,
    `RPC_URL=${RPC_FOR(opts.network)}`,
    "",
    "# Private key of the wallet that signs transactions (not needed for",
    "# read-only inference or the live demo).",
    "PRIVATE_KEY=",
    "",
    "# Ingot id to call. Defaults to the public demo Ingot if unset.",
    "INGOT_ID=",
    ...extra,
  ];
  return lines.join("\n") + "\n";
}

function readme(
  opts: GenerateOptions,
  archTitle: string,
  lead: string,
  blurb: string
): string {
  const isDemo = opts.archetype === "demo";
  return (
    [
      `# ${opts.name}`,
      "",
      `Built with [\`@foundryprotocol/sdk\`](https://www.npmjs.com/package/@foundryprotocol/sdk) — archetype **${archTitle}**.`,
      "",
      `> ${lead}`,
      "",
      "## Run",
      "",
      "```bash",
      "npm install",
      ...(isDemo
        ? ["npm run demo            # zero setup — Galileo testnet, no key"]
        : [
            "cp .env.example .env    # add PRIVATE_KEY / INGOT_ID as needed",
            "npm start",
          ]),
      "```",
      "",
      "## What this template does",
      "",
      blurb,
      "",
      "Docs: https://foundryprotocol.xyz/docs",
    ].join("\n") + "\n"
  );
}

function tsconfig(): string {
  return (
    JSON.stringify(
      {
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
      },
      null,
      2
    ) + "\n"
  );
}

function gitignore(): string {
  return ["node_modules", ".env", "dist", ""].join("\n");
}
