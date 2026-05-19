#!/usr/bin/env node
// Validates that every examples/ recipe is a well-formed, degit-able project:
// required files present, package.json valid + named after its dir, and the
// `start` script points at an entry file that exists. Cheap CI gate — no
// network, no installs.
import { readdirSync, existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../examples", import.meta.url).pathname;
const REQUIRED = ["README.md", "package.json", ".gitignore", ".env.example"];

const dirs = readdirSync(root).filter((d) => statSync(join(root, d)).isDirectory());

let failed = 0;
for (const dir of dirs) {
  const base = join(root, dir);
  for (const f of REQUIRED) {
    if (!existsSync(join(base, f))) {
      console.error(`✗ ${dir}: missing ${f}`);
      failed++;
    }
  }
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(join(base, "package.json"), "utf8"));
  } catch (err) {
    console.error(`✗ ${dir}: package.json is not valid JSON — ${err.message}`);
    failed++;
    continue;
  }
  if (pkg.name !== dir) {
    console.error(`✗ ${dir}: package.json name "${pkg.name}" != dir "${dir}"`);
    failed++;
  }
  const start = pkg.scripts?.start ?? "";
  const entry = start.split(/\s+/).pop();
  if (!entry || !existsSync(join(base, entry))) {
    console.error(`✗ ${dir}: start script entry "${entry}" not found`);
    failed++;
  }
}

if (failed > 0) {
  console.error(`\n${failed} example check(s) failed.`);
  process.exit(1);
}
console.log(`✓ ${dirs.length} examples OK: ${dirs.join(", ")}`);
