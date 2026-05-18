import { readFile, writeFile, mkdir, readdir, access } from "node:fs/promises";
import { createClient, getNetwork } from "@0gkit/core";
import {
  faucet,
  balance,
  waitForReceipt,
  attachExplorerUrl,
  explorerUrl,
} from "@0gkit/chain";
import { Storage } from "@0gkit/storage";
import { Compute } from "@0gkit/compute";
import { DA } from "@0gkit/da";
import { parseEnvelope, verifyEnvelope, reportEnvelope } from "@0gkit/attestation";
import { buildProgram, type ProgramDeps } from "./program.js";
import { loadFoundry } from "./foundry-loader.js";

async function readStdin(): Promise<Uint8Array> {
  const chunks: Buffer[] = [];
  for await (const c of process.stdin) chunks.push(c as Buffer);
  return new Uint8Array(Buffer.concat(chunks));
}

const deps: ProgramDeps = {
  createClient,
  getNetwork,
  faucet,
  balance,
  waitForReceipt,
  attachExplorerUrl,
  explorerUrl,
  makeStorage: (cfg) => new Storage(cfg),
  makeCompute: (cfg) => new Compute(cfg),
  makeDA: (cfg) => new DA(cfg),
  attest: { parseEnvelope, verifyEnvelope, reportEnvelope },
  loadFoundry,
  fs: {
    readFile: (p) => readFile(p).then((b) => new Uint8Array(b)),
    writeFile: (p, d) => writeFile(p, d),
    mkdir: (p) => mkdir(p, { recursive: true }).then(() => undefined),
    readdir: (p) => readdir(p),
    exists: (p) =>
      access(p).then(
        () => true,
        () => false
      ),
  },
  readStdin,
  fetch: globalThis.fetch,
  cwd: () => process.cwd(),
  env: process.env as Record<string, string | undefined>,
  isTTY: process.stdout.isTTY === true,
  noColor: process.env.NO_COLOR != null,
  write: (line) => process.stdout.write(line + "\n"),
};

await buildProgram(deps).parseAsync(process.argv);
